import React, { useState, useEffect, useMemo } from 'react';
import { PostItem, CommentItem, ChatMessage } from './types';
import { initialPosts, initialComments, initialChatMessages } from './data/initialData';
import { Header } from './components/Header';
import { PostCard } from './components/PostCard';
import { ChatSection } from './components/ChatSection';
import { Footer } from './components/Footer';
import { AdminPanelModal } from './components/AdminPanelModal';
import { WorkUpJobInstructionBanner } from './components/WorkUpJobInstructionBanner';
import {
  subscribePosts,
  subscribeChats,
  addPost,
  deletePost,
  recordCopyAndSetPending,
  updatePostStatus,
  addChatMessage,
  replyToChatMessage,
} from './services/dbService';
import {
  Plus,
  MessageCircle,
  Copy,
  Check,
  Send,
  Pin,
  Quote,
  CheckCircle2,
  Clock,
  EyeOff
} from 'lucide-react';

const STORAGE_KEYS = {
  POSTS: 'comment_site_posts_v2',
  COMMENTS: 'comment_site_comments_v2',
  CHAT: 'comment_site_chat_v2',
  IS_ADMIN: 'comment_site_is_admin_v2',
};

// Generic ID deduplicator ensuring unique keys across all collections
export const dedupeById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

// Filter out all deleted demo post IDs and deduplicate
const DEMO_POST_IDS = new Set([
  'post-1',
  'post-2',
  'post-3',
  'admin-comment-1',
  'admin-comment-2',
  'admin-comment-3',
]);

const sanitizePosts = (items: PostItem[]): PostItem[] => {
  const filtered = items.filter((p) => !DEMO_POST_IDS.has(p.id) && !p.id.startsWith('demo-'));
  return dedupeById(filtered);
};

const sanitizeChats = (items: ChatMessage[]): ChatMessage[] => {
  const filtered = items.filter((c) => c.id !== 'chat-1' && !c.id.startsWith('demo-'));
  return dedupeById(filtered);
};

export default function App() {
  // Load persistent state from localStorage with fallbacks
  const [posts, setPosts] = useState<PostItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (saved) {
        return sanitizePosts(JSON.parse(saved));
      }
      return initialPosts;
    } catch {
      return initialPosts;
    }
  });

  const [comments, setComments] = useState<CommentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMENTS);
      return saved ? dedupeById(JSON.parse(saved)) : initialComments;
    } catch {
      return initialComments;
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT);
      return saved ? sanitizeChats(JSON.parse(saved)) : initialChatMessages;
    } catch {
      return initialChatMessages;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.IS_ADMIN) === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminModalTab, setAdminModalTab] = useState<'chat' | 'new-post' | 'pending' | 'manage'>('chat');
  const [copiedToast, setCopiedToast] = useState(false);

  // Quick admin post form state (when admin mode is enabled)
  const [quickCommentText, setQuickCommentText] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickIsPinned, setQuickIsPinned] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState(false);

  // Real-time Firestore sync
  useEffect(() => {
    const unsubPosts = subscribePosts((livePosts) => {
      setPosts(sanitizePosts(livePosts));
    });

    const unsubChats = subscribeChats((liveChats) => {
      setChatMessages(sanitizeChats(liveChats));
    });

    return () => {
      unsubPosts();
      unsubChats();
    };
  }, []);

  // Ensure the page always stays at the top on initial load or page refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  // Persist state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    } catch (e) {
      console.error(e);
    }
  }, [comments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
    } catch (e) {
      console.error(e);
    }
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IS_ADMIN, isAdmin ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [isAdmin]);

  // Secret shortcut listeners for admin access (Ctrl+Shift+A, Alt+A, or URL hash #admin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') ||
        (e.altKey && e.key.toLowerCase() === 'a')
      ) {
        e.preventDefault();
        setIsAdminPanelOpen(true);
      }
    };

    const handleHashCheck = () => {
      if (window.location.hash === '#admin') {
        setIsAdminPanelOpen(true);
      }
    };

    handleHashCheck();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHashCheck);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashCheck);
    };
  }, []);

  // Copy success handler: hides post from feed and sets status to pending for admin
  const handleCopySuccess = async (postId: string) => {
    // Optimistic local update: hide from public feed immediately
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              copiesCount: (post.copiesCount || 0) + 1,
              status: 'pending',
            }
          : post
      )
    );
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3500);

    try {
      await recordCopyAndSetPending(postId);
    } catch (err) {
      console.error('Failed to set post to pending in Firestore:', err);
    }
  };

  // Admin status update handler (reactivate or set pending)
  const handleUpdatePostStatus = async (postId: string, status: 'active' | 'pending') => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, status }
          : post
      )
    );

    try {
      await updatePostStatus(postId, status);
    } catch (err) {
      console.error('Failed to update post status in Firestore:', err);
    }
  };

  // Handlers for Posts & Comments
  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = post.userLiked;
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            userLiked: !isLiked,
          };
        }
        return post;
      })
    );
  };

  const handleAddComment = (
    postId: string,
    content: string,
    authorName: string,
    asAdmin = false
  ) => {
    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      postId,
      authorName: asAdmin ? 'মুহাম্মদ শাকিল (এডমিন)' : authorName,
      authorRole: asAdmin ? 'admin' : 'user',
      content,
      createdAt: 'এইমাত্র',
      likes: 0,
      userLiked: false,
    };
    setComments((prev) => [newComment, ...prev]);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setComments((prev) => prev.filter((c) => c.postId !== postId));
    try {
      await deletePost(postId);
    } catch (err) {
      console.error('Failed to delete post from Firestore:', err);
    }
  };

  const handleCreatePost = async (newPostData: Omit<PostItem, 'id' | 'createdAt' | 'likes'>) => {
    const nowStr = 'আজ, ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const postPayload: Omit<PostItem, 'id'> = {
      ...newPostData,
      status: newPostData.status || 'active',
      createdAt: nowStr,
      likes: 0,
      userLiked: false,
      copiesCount: 0,
    };
    try {
      const docId = await addPost(postPayload);
      const newPost: PostItem = {
        ...postPayload,
        id: docId,
      };
      setPosts((prev) => dedupeById([newPost, ...prev]));
    } catch (err) {
      console.error('Failed to create post in Firestore:', err);
      // Fallback local update
      const fallbackPost: PostItem = {
        ...postPayload,
        id: `post-${Date.now()}`,
      };
      setPosts((prev) => dedupeById([fallbackPost, ...prev]));
    }
  };

  // Fast inline comment post by admin
  const handleQuickAdminPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCommentText.trim()) return;

    handleCreatePost({
      title: quickTitle.trim() || 'উক্তি',
      content: quickCommentText.trim(),
      authorName: 'মুহাম্মদ শাকিল (এডমিন)',
      authorRole: 'admin',
      pinned: quickIsPinned,
    });

    setQuickCommentText('');
    setQuickTitle('');
    setQuickIsPinned(false);
    setQuickSuccess(true);
    setTimeout(() => setQuickSuccess(false), 2500);
  };

  // Handlers for Chat
  const handleSendChatMessage = async (text: string, senderName: string) => {
    const nowStr = 'আজ, ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    const chatPayload: Omit<ChatMessage, 'id'> = {
      senderName: senderName.trim() || 'সাধারণ পাঠক',
      senderRole: 'user',
      text: text.trim(),
      timestamp: nowStr,
      status: 'sent',
    };
    try {
      const docId = await addChatMessage(chatPayload);
      const newMsg: ChatMessage = {
        ...chatPayload,
        id: docId,
      };
      setChatMessages((prev) => dedupeById([...prev, newMsg]));
    } catch (err) {
      console.error('Failed to add chat to Firestore:', err);
      const fallbackMsg: ChatMessage = {
        ...chatPayload,
        id: `chat-${Date.now()}`,
      };
      setChatMessages((prev) => dedupeById([...prev, fallbackMsg]));
    }
  };

  const handleAdminReplyChat = async (messageId: string, replyText: string) => {
    try {
      await replyToChatMessage(messageId, replyText, 'মুহাম্মদ শাকিল (এডমিন)');
      setChatMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              status: 'replied',
              adminReply: {
                text: replyText,
                adminName: 'মুহাম্মদ শাকিল (এডমিন)',
                timestamp: 'এইমাত্র',
              },
            };
          }
          return msg;
        })
      );
    } catch (err) {
      console.error('Failed to reply chat in Firestore:', err);
    }
  };

  const dedupedAllPosts = useMemo(() => dedupeById(posts), [posts]);
  const activePosts = useMemo(() => dedupedAllPosts.filter((p) => p.status !== 'pending'), [dedupedAllPosts]);
  const pendingPosts = useMemo(() => dedupedAllPosts.filter((p) => p.status === 'pending'), [dedupedAllPosts]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 font-sans antialiased text-slate-800">
      {/* Top Navigation */}
      <Header
        isAdmin={isAdmin}
        onOpenAdminPanel={() => {
          setAdminModalTab('chat');
          setIsAdminPanelOpen(true);
        }}
        onExitAdmin={() => setIsAdmin(false)}
        chatCount={chatMessages.length}
        totalComments={activePosts.length}
        pendingCount={pendingPosts.length}
      />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Top Banner: WorkUpJob Comment Picture & Reply Instruction */}
        <WorkUpJobInstructionBanner isAdmin={isAdmin} />

        {/* 2-Column Responsive Layout: Left = Admin Posts & Comments, Right = Chat Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Admin Comments & Quotes Feed */}
          <section className="lg:col-span-7 xl:col-span-8 space-y-5">
            {/* Admin pending notice banner */}
            {isAdmin && pendingPosts.length > 0 && (
              <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-800">
                      {pendingPosts.length}টি উক্তি কপি হওয়ার পর পেন্ডিং তালিকায় রয়েছে
                    </p>
                    <p className="text-[11px] text-slate-500">
                      এগুলো মূল ফিড থেকে স্বয়ংক্রিয়ভাবে হাইড রয়েছে। এডমিন প্যানেল থেকে পুনরায় সক্রিয় করতে পারেন।
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAdminModalTab('pending');
                    setIsAdminPanelOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>পেন্ডিং তালিকা দেখুন ({pendingPosts.length})</span>
                </button>
              </div>
            )}

            {/* Quick Admin Comment Box (Visible when Admin is Active) */}
            {isAdmin && (
              <form
                onSubmit={handleQuickAdminPost}
                className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-xs ring-2 ring-emerald-50/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>এডমিন হিসেবে দ্রুত কমেন্ট / উক্তি পোস্ট করুন</span>
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    এডমিন মোড সক্রিয়
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="কমেন্টের শিরোনাম (ঐচ্ছিক)"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                  />
                </div>

                <textarea
                  rows={3}
                  placeholder="এখানে আপনার মূল্যবান কমেন্ট বা উক্তিটি লিখুন (ইউজাররা সরাসরি পড়তে এবং কপি করতে পারবেন)..."
                  value={quickCommentText}
                  onChange={(e) => setQuickCommentText(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                  required
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quickIsPinned}
                      onChange={(e) => setQuickIsPinned(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <Pin className="w-3 h-3 text-amber-600" />
                    <span>উপরে পিন করে রাখুন</span>
                  </label>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>কমেন্ট প্রকাশ করুন</span>
                  </button>
                </div>

                {quickSuccess && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>কমেন্ট সফলভাবে প্রকাশ করা হয়েছে! লাইভ ফিডে যুক্ত হয়েছে।</span>
                  </div>
                )}
              </form>
            )}

            {/* Header above comments requested by user */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border-2 border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                    এগুলো থেকে একটা কপি করুন এটা কমেন্ট
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    যেকোনো একটি কমেন্টের <span className="font-semibold text-blue-700">"কপি করুন"</span> বাটনে ক্লিক করে কপি করুন এবং নির্দিষ্ট লিংকে গিয়ে রিপ্লাই দিন।
                  </p>
                </div>
              </div>
              {activePosts.length > 0 && (
                <span className="text-xs font-bold px-3.5 py-1.5 bg-white text-blue-700 border border-blue-200 rounded-full shrink-0 shadow-2xs">
                  {activePosts.length}টি কমেন্ট উপলব্ধ
                </span>
              )}
            </div>

            {/* Posts Feed */}
            <div className="space-y-5">
              {activePosts.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 text-slate-500">
                  <Quote className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-700">এখনও কোনো সক্রিয় উক্তি প্রকাশ করা হয়নি</h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {pendingPosts.length > 0
                      ? `${pendingPosts.length}টি উক্তি কপি করার পর পেন্ডিং তালিকায় রয়েছে। এডমিন চাইলে তা পুনরায় সক্রিয় করতে পারেন।`
                      : 'শীঘ্রই নতুন নতুন উক্তি ও ক্যাপশন যুক্ত করা হবে।'}
                  </p>
                </div>
              ) : (
                activePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isAdmin={isAdmin}
                    onLikePost={handleLikePost}
                    onDeletePost={handleDeletePost}
                    onCopySuccess={handleCopySuccess}
                  />
                ))
              )}
            </div>
          </section>

          {/* Right Column: Chat Section (5 cols on large screens) */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <ChatSection
              messages={dedupeById(chatMessages)}
              isAdmin={isAdmin}
              onSendChatMessage={handleSendChatMessage}
              onAdminReplyChat={handleAdminReplyChat}
              onOpenAdminPanel={() => {
                setAdminModalTab('chat');
                setIsAdminPanelOpen(true);
              }}
            />
          </aside>
        </div>
      </main>

      {/* Global Copy Toast notification */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-xs sm:text-sm animate-fadeIn max-w-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white">কমেন্টটি কপি করা হয়েছে!</p>
            <p className="text-[11px] text-slate-300 mt-0.5">
              উক্তিটি ফিড থেকে হাইড হয়েছে এবং এডমিন অনুমোদনের জন্য পেন্ডিং রয়েছে।
            </p>
          </div>
        </div>
      )}

      {/* Footer with Clickable Site Name to Open Admin Panel */}
      <Footer
        onOpenAdminPanel={() => {
          setAdminModalTab('chat');
          setIsAdminPanelOpen(true);
        }}
        isAdmin={isAdmin}
      />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        isAdmin={isAdmin}
        onLoginAsAdmin={() => setIsAdmin(true)}
        onLogoutAdmin={() => setIsAdmin(false)}
        posts={dedupedAllPosts}
        comments={dedupeById(comments)}
        chatMessages={dedupeById(chatMessages)}
        onCreatePost={handleCreatePost}
        onDeletePost={handleDeletePost}
        onDeleteComment={handleDeleteComment}
        onAdminReplyChat={handleAdminReplyChat}
        onUpdatePostStatus={handleUpdatePostStatus}
        initialTab={adminModalTab}
      />
    </div>
  );
}

