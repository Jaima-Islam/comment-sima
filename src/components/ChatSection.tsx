import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage } from '../types';
import {
  Send,
  ShieldCheck,
  Clock,
  CheckCheck,
  Sparkles,
  MessageCircle,
  HelpCircle,
  CornerDownRight,
  ShieldAlert
} from 'lucide-react';

interface ChatSectionProps {
  messages: ChatMessage[];
  isAdmin: boolean;
  onSendChatMessage: (text: string, senderName: string) => void;
  onAdminReplyChat: (messageId: string, replyText: string) => void;
  onOpenAdminPanel: () => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  isAdmin,
  onSendChatMessage,
  onAdminReplyChat,
  onOpenAdminPanel,
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [justSent, setJustSent] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Guarantee uniqueness of message IDs to avoid duplicate key warnings
  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((m) => {
      if (!m?.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [messages]);

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // On initial mount / refresh, do NOT scroll smoothly and do NOT scroll outer page
      scrollToBottom(false);
      return;
    }
    scrollToBottom(true);
  }, [uniqueMessages.length, replyingToId]);

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendChatMessage(inputText.trim(), 'সাধারণ ইউজার');
    setInputText('');
    setJustSent(true);
    setTimeout(() => setJustSent(false), 3500);
  };

  const handleAdminReplySubmit = (messageId: string) => {
    if (!adminReplyText.trim()) return;
    onAdminReplyChat(messageId, adminReplyText.trim());
    setAdminReplyText('');
    setReplyingToId(null);
  };

  return (
    <div
      id="chat-section-container"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[650px] lg:h-[720px] sticky top-22"
    >
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-700 rounded-full" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                চ্যাট সেলশন
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <span>লাইভ সক্রিয়</span>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
              এডমিন রেসপন্স মোড
            </span>
          ) : (
            <span className="text-[11px] text-blue-100/80 bg-white/10 px-2 py-0.5 rounded-md">
              সরাসরি যোগাযোগ
            </span>
          )}
        </div>

        <p className="text-xs text-blue-100/90 mt-2 leading-relaxed">
          নিচের বক্সে লিখে <strong className="text-white font-semibold">"কমেন্ট দিন"</strong> বাটনে ক্লিক করুন। আপনার বার্তা সরাসরি চ্যাটে যুক্ত হবে।
        </p>
      </div>

      {/* Messages List Container */}
      <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {uniqueMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">এখনও কোনো চ্যাট নেই</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              নিচে আপনার মন্তব্য বা বার্তা লিখে <span className="font-semibold text-blue-600">"কমেন্ট দিন"</span> চাপুন।
            </p>
          </div>
        ) : (
          uniqueMessages.map((msg) => (
            <div key={msg.id} id={`chat-msg-${msg.id}`} className="space-y-2">
              {/* User Message Bubble */}
              <div className="flex items-start gap-2 max-w-[92%]">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {msg.senderName.charAt(0)}
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3 shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-800">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>

                  <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px]">
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCheck className="w-3 h-3 text-emerald-500" />
                      {msg.status === 'replied' ? 'উত্তর দেওয়া হয়েছে' : 'পাঠানো হয়েছে'}
                    </span>

                    {/* Admin Reply Action Button inside Chat */}
                    {isAdmin && !msg.adminReply && (
                      <button
                        id={`chat-reply-btn-${msg.id}`}
                        onClick={() => setReplyingToId(replyingToId === msg.id ? null : msg.id)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        উত্তর দিন
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Reply Input inside Chat (visible if Admin toggled reply) */}
              {isAdmin && replyingToId === msg.id && (
                <div className="ml-9 p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                    <span>এডমিন হিসেবে উত্তর লিখুন:</span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="উত্তর লিখুন..."
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-indigo-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setReplyingToId(null)}
                      className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      id={`chat-send-admin-reply-${msg.id}`}
                      onClick={() => handleAdminReplySubmit(msg.id)}
                      disabled={!adminReplyText.trim()}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 cursor-pointer disabled:bg-slate-300"
                    >
                      উত্তর পাঠান
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Reply Bubble (if replied) */}
              {msg.adminReply && (
                <div className="ml-6 sm:ml-8 flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="flex-1 bg-emerald-50/80 border border-emerald-200 rounded-2xl rounded-tl-sm p-3 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-emerald-900">
                          {msg.adminReply.adminName.replace(' (এডমিন)', '')}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                          অফিশিয়াল উত্তর
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700/80 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {msg.adminReply.timestamp}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed whitespace-pre-line">
                      {msg.adminReply.text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Success Notification */}
      {justSent && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>আপনার বার্তা সফলভাবে পোস্ট হয়েছে!</span>
        </div>
      )}

      {/* Chat Input Section */}
      <form onSubmit={handleUserSubmit} className="p-3.5 border-t border-slate-200 bg-white rounded-b-2xl space-y-2.5">
        <div>
          <textarea
            id="chat-message-input"
            rows={2}
            placeholder="এখানে চ্যাটে আপনার কমেন্ট বা বার্তা লিখুন..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            required
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400">
            সরাসরি উত্তর প্রদান করা হবে
          </div>

          {/* Requested Button: "কমেন্ট দিন" */}
          <button
            id="chat-submit-comment-btn"
            type="submit"
            disabled={!inputText.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>কমেন্ট দিন</span>
          </button>
        </div>
      </form>
    </div>
  );
};
