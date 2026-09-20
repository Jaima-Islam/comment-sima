import React, { useState, useMemo, useEffect } from 'react';
import { PostItem, CommentItem, ChatMessage } from '../types';
import {
  ShieldCheck,
  X,
  MessageSquare,
  Send,
  PlusCircle,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Pin,
  MessageCircle,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Copy
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLoginAsAdmin: () => void;
  onLogoutAdmin: () => void;
  posts: PostItem[];
  comments: CommentItem[];
  chatMessages: ChatMessage[];
  onCreatePost: (newPost: Omit<PostItem, 'id' | 'createdAt' | 'likes'>) => void;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onAdminReplyChat: (messageId: string, replyText: string) => void;
  onUpdatePostStatus?: (postId: string, status: 'active' | 'pending') => void;
  initialTab?: 'chat' | 'new-post' | 'pending' | 'manage';
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLoginAsAdmin,
  onLogoutAdmin,
  posts,
  comments,
  chatMessages,
  onCreatePost,
  onDeletePost,
  onDeleteComment,
  onAdminReplyChat,
  onUpdatePostStatus,
  initialTab = 'chat',
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'new-post' | 'pending' | 'manage'>(initialTab);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // New post state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postPinned, setPostPinned] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Chat reply state in admin panel
  const [replyTextMap, setReplyTextMap] = useState<{ [msgId: string]: string }>({});
  const [replySuccessMsgId, setReplySuccessMsgId] = useState<string | null>(null);

  // Guarantee uniqueness of item IDs
  const uniquePosts = useMemo(() => {
    const seen = new Set<string>();
    return posts.filter((p) => {
      if (!p?.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [posts]);

  const uniqueChats = useMemo(() => {
    const seen = new Set<string>();
    return chatMessages.filter((m) => {
      if (!m?.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [chatMessages]);

  const uniqueComments = useMemo(() => {
    const seen = new Set<string>();
    return comments.filter((c) => {
      if (!c?.id || seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
  }, [comments]);

  const pendingPosts = useMemo(() => {
    return uniquePosts.filter((p) => p.status === 'pending');
  }, [uniquePosts]);

  const activePostsList = useMemo(() => {
    return uniquePosts.filter((p) => p.status !== 'pending');
  }, [uniquePosts]);

  if (!isOpen) return null;

  const handleAdminAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === '85207') {
      onLoginAsAdmin();
      setAuthError('');
      setPinInput('');
    } else {
      setAuthError('ভুল পিন কোড! সঠিক এডমিন পিন প্রদান করুন।');
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    onCreatePost({
      title: postTitle.trim() || 'এডমিনের কমেন্ট ও উক্তি',
      content: postContent.trim(),
      authorName: 'মুহাম্মদ শাকিল (এডমিন)',
      authorRole: 'admin',
      pinned: postPinned,
    });

    setPostTitle('');
    setPostContent('');
    setPostPinned(false);
    setPostSuccess(true);
    setTimeout(() => setPostSuccess(false), 2500);
  };


  const handleSendChatReply = (messageId: string) => {
    const text = replyTextMap[messageId];
    if (!text || !text.trim()) return;

    onAdminReplyChat(messageId, text.trim());
    setReplyTextMap((prev) => ({ ...prev, [messageId]: '' }));
    setReplySuccessMsgId(messageId);
    setTimeout(() => setReplySuccessMsgId(null), 2500);
  };

  const unrepliedCount = chatMessages.filter((m) => m.status === 'sent').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        id="admin-panel-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">এডমিন কন্ট্রোল প্যানেল</h2>
                {isAdmin ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    সক্রিয়
                  </span>
                ) : (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    লগইন প্রয়োজন
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                ফুটারে সাইটের নামে ক্লিক করার মাধ্যমে এই প্যানেলটি ওপেন হয়েছে
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                id="modal-admin-logout"
                onClick={onLogoutAdmin}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="এডমিন মোড থেকে বের হন"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            )}
            <button
              id="close-admin-panel-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* If not logged in as Admin, show login unlock view */}
        {!isAdmin ? (
          <div className="p-6 sm:p-10 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              এডমিন পিন যাচাইকরণ
            </h3>
            <p className="text-sm text-slate-500 max-w-md mb-6">
              প্যানেলে প্রবেশ করতে এডমিন পিন কোডটি লিখুন।
            </p>

            <form onSubmit={handleAdminAuth} className="w-full max-w-sm space-y-4">
              <div>
                <input
                  id="admin-pin-input"
                  type="password"
                  placeholder="এডমিন পিন কোড লিখুন"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  autoFocus
                  className="w-full text-center tracking-widest text-lg font-bold px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              {authError && (
                <div className="text-xs text-rose-600 font-medium">
                  {authError}
                </div>
              )}

              <div className="space-y-2">
                <button
                  id="admin-direct-login-btn"
                  type="submit"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>প্রবেশ করুন</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-left">
                <p className="font-semibold text-slate-700 mb-1">কী কী সুবিধা পাবেন:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>নতুন পোস্ট ও টপিক তৈরি করা</li>
                  <li>ডানপাশের চ্যাটে আসা সাধারণ ইউজারের কমেন্টের উত্তর দেওয়া</li>
                  <li>কমেন্ট ও আলোচনা পরিচালনা করা</li>
                </ul>
              </div>
            </form>
          </div>
        ) : (
          /* Admin Main Tabs and Content */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-4 sm:px-6 bg-slate-50/80">
              <button
                id="admin-tab-chat"
                onClick={() => setActiveTab('chat')}
                className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'chat'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>চ্যাট ইনবক্স ও উত্তর</span>
                {unrepliedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-rose-500 text-white">
                    {unrepliedCount}
                  </span>
                )}
              </button>

              <button
                id="admin-tab-new-post"
                onClick={() => setActiveTab('new-post')}
                className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'new-post'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>নতুন কমেন্ট / উক্তি</span>
              </button>

              <button
                id="admin-tab-pending"
                onClick={() => setActiveTab('pending')}
                className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'pending'
                    ? 'border-amber-600 text-amber-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>পেন্ডিং তালিকা</span>
                {pendingPosts.length > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-amber-500 text-white animate-pulse">
                    {pendingPosts.length}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full text-[11px] font-medium bg-slate-200 text-slate-600">
                    0
                  </span>
                )}
              </button>

              <button
                id="admin-tab-manage"
                onClick={() => setActiveTab('manage')}
                className={`py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'manage'
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>ম্যানেজ ({uniquePosts.length})</span>
              </button>
            </div>

            {/* Tab 1: Chat Inbox and Replies */}

            {activeTab === 'chat' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      চ্যাট সেকশন থেকে আসা বার্তা ও কমেন্ট
                    </h3>
                    <p className="text-xs text-slate-500">
                      ডানপাশের চ্যাটে সাধারণ ইউজাররা "কমেন্ট দিন" ক্লিক করে যা পাঠিয়েছেন তা এখানে তালিকাভুক্ত।
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
                    মোট বার্তা: {chatMessages.length}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {uniqueChats.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                      এখনও কোনো চ্যাট বার্তা আসেনি।
                    </div>
                  ) : (
                    uniqueChats.map((msg) => (
                      <div
                        key={msg.id}
                        id={`admin-chat-row-${msg.id}`}
                        className={`p-4 rounded-xl border transition-all ${
                          msg.status === 'sent'
                            ? 'bg-amber-50/40 border-amber-200 ring-1 ring-amber-400/20'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              {msg.senderName}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {msg.timestamp}
                            </span>
                          </div>

                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              msg.status === 'replied'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {msg.status === 'replied' ? 'উত্তর সম্পন্ন' : 'উত্তরের অপেক্ষায়'}
                          </span>
                        </div>

                        {/* User Message Text */}
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-800 mb-3 whitespace-pre-line">
                          "{msg.text}"
                        </div>

                        {/* Existing Admin Reply if already replied */}
                        {msg.adminReply ? (
                          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-sm">
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900 mb-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>আপনার পূর্ববর্তী উত্তর ({msg.adminReply.timestamp}):</span>
                            </div>
                            <p className="text-emerald-950 text-xs sm:text-sm">
                              {msg.adminReply.text}
                            </p>
                          </div>
                        ) : null}

                        {/* Form to submit or update reply */}
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <label className="block text-xs font-medium text-slate-600 mb-1.5">
                            {msg.adminReply ? 'উত্তর আপডেট করুন:' : 'এডমিনের উত্তর লিখুন:'}
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              id={`admin-reply-input-${msg.id}`}
                              type="text"
                              placeholder="উত্তর লিখুন..."
                              value={replyTextMap[msg.id] || ''}
                              onChange={(e) =>
                                setReplyTextMap({ ...replyTextMap, [msg.id]: e.target.value })
                              }
                              className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <button
                              id={`admin-reply-submit-${msg.id}`}
                              onClick={() => handleSendChatReply(msg.id)}
                              disabled={!replyTextMap[msg.id]?.trim()}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>উত্তর পাঠান</span>
                            </button>
                          </div>

                          {replySuccessMsgId === msg.id && (
                            <div className="mt-2 text-xs text-emerald-700 font-medium flex items-center gap-1 animate-fadeIn">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>উত্তর ডানপাশের চ্যাটে সফলভাবে পাঠানো হয়েছে!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Create New Admin Post */}
            {activeTab === 'new-post' && (
              <form onSubmit={handleCreatePost} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    নতুন পোস্ট / টপিক প্রকাশ করুন
                  </h3>
                  <p className="text-xs text-slate-500">
                    এডমিন হিসেবে আপনি যে পোস্ট করবেন, তা সাধারণ সকল ব্যবহারকারী দেখতে পারবেন এবং নিচে কমেন্ট করতে পারবেন।
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    পোস্টের শিরোনাম:
                  </label>
                  <input
                    id="admin-new-post-title"
                    type="text"
                    placeholder="পোস্টের শিরোনাম লিখুন..."
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    required
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center pt-1 pb-1">
                  <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer select-none">
                    <input
                      id="admin-new-post-pinned"
                      type="checkbox"
                      checked={postPinned}
                      onChange={(e) => setPostPinned(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5">
                      <Pin className="w-3.5 h-3.5 text-amber-600" />
                      উপরে পিন করে রাখুন
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    পোস্টের বিস্তারিত বিষয়বস্তু:
                  </label>
                  <textarea
                    id="admin-new-post-content"
                    rows={5}
                    placeholder="এখানে আপনার পোস্ট বা আলোচনার বিষয়বস্তু লিখুন..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    required
                    className="w-full text-sm p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-400">
                    পোস্টটি প্রকাশের সাথে সাথে লাইভ ফিডে দেখা যাবে।
                  </div>
                  <button
                    id="admin-submit-post-btn"
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>পোস্ট প্রকাশ করুন</span>
                  </button>
                </div>

                {postSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-center gap-2 animate-fadeIn border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>আপনার পোস্টটি সফলভাবে প্রকাশ করা হয়েছে!</span>
                  </div>
                )}
              </form>
            )}

            {/* Tab: Pending Quotes & Comments (Hidden after copy) */}
            {activeTab === 'pending' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        কপি হওয়ার পর পেন্ডিং থাকা উক্তি/কমেন্ট
                      </h3>
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                        {pendingPosts.length}টি পেন্ডিং
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      ইউজাররা "কপি করুন" বাটনে ক্লিক করলে সেই কমেন্টটি স্বয়ংক্রিয়ভাবে মূল ফিড থেকে হাইড হয়ে এখানে চলে আসে। আপনি চাইলে এক ক্লিকেই পুনরায় সবার জন্য সক্রিয় (Active) করতে পারেন অথবা মুছে ফেলতে পারেন।
                    </p>
                  </div>
                </div>

                {pendingPosts.length === 0 ? (
                  <div className="text-center py-14 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">বর্তমানে কোনো পেন্ডিং উক্তি নেই</p>
                    <p className="text-xs text-slate-400 mt-0.5">সবগুলো উক্তি সাধারণ ফিডে সক্রিয় রয়েছে অথবা কোনোটি কপি হয়ে পেন্ডিং অবস্থায় নেই।</p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {pendingPosts.map((p) => (
                      <div
                        key={p.id}
                        id={`pending-card-${p.id}`}
                        className="p-4 bg-amber-50/50 border border-amber-200/90 rounded-2xl shadow-xs transition-all hover:border-amber-300 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500 text-white rounded-md flex items-center gap-1">
                              <EyeOff className="w-3 h-3" />
                              <span>পেন্ডিং (ফিডে হাইড আছে)</span>
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {p.createdAt}
                            </span>
                          </div>

                          {p.copiesCount !== undefined && p.copiesCount > 0 && (
                            <span className="text-xs text-amber-700 font-medium bg-amber-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Copy className="w-3 h-3" />
                              <span>{p.copiesCount} বার কপি করা হয়েছে</span>
                            </span>
                          )}
                        </div>

                        {p.title && (
                          <h4 className="font-bold text-slate-900 text-sm">
                            {p.title}
                          </h4>
                        )}

                        <div className="p-3 bg-white rounded-xl border border-amber-100 text-slate-800 text-sm leading-relaxed whitespace-pre-line font-medium">
                          {p.content}
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/60">
                          <div className="text-xs text-slate-500">
                            লেখক: <span className="font-medium text-slate-700">{p.authorName}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              id={`reactivate-post-${p.id}`}
                              onClick={() => onUpdatePostStatus?.(p.id, 'active')}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                              title="ফিডে আবার সক্রিয় করুন"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>পুনরায় সক্রিয় (Active) করুন</span>
                            </button>

                            <button
                              id={`delete-pending-post-${p.id}`}
                              onClick={() => onDeletePost(p.id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>মুছে ফেলুন</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Manage Posts and Comments */}
            {activeTab === 'manage' && (
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
                {/* Posts section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900">
                      সকল পোস্ট ও উক্তি ({uniquePosts.length})
                    </h3>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        সক্রিয়: {activePostsList.length}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                        পেন্ডিং: {pendingPosts.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {uniquePosts.map((p) => {
                      const isPending = p.status === 'pending';
                      return (
                        <div
                          key={p.id}
                          className={`p-3 border rounded-xl flex items-center justify-between gap-3 ${
                            isPending
                              ? 'bg-amber-50/40 border-amber-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                                  isPending
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isPending ? 'পেন্ডিং (হাইড)' : 'সক্রিয়'}
                              </span>
                              <span className="font-semibold text-sm text-slate-900 truncate">
                                {p.title}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>{p.createdAt}</span>
                              <span>•</span>
                              <span>{p.copiesCount || 0} বার কপি</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isPending ? (
                              <button
                                onClick={() => onUpdatePostStatus?.(p.id, 'active')}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                title="সক্রিয় করুন"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">সক্রিয় করুন</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onUpdatePostStatus?.(p.id, 'pending')}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                title="হাইড / পেন্ডিং করুন"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">হাইড করুন</span>
                              </button>
                            )}

                            <button
                              onClick={() => onDeletePost(p.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="পোস্ট মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Comments section */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    ইউজারদের সকল কমেন্ট ({uniqueComments.length})
                  </h3>
                  <div className="space-y-2">
                    {uniqueComments.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs text-slate-900">
                              {c.authorName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {c.createdAt}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 line-clamp-2">
                            {c.content}
                          </p>
                        </div>
                        <button
                          onClick={() => onDeleteComment(c.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="কমেন্ট মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>কমেন্ট সাইট এডমিন ম্যানেজমেন্ট সিস্টেম</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
