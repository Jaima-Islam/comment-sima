import React, { useState } from 'react';
import { PostItem } from '../types';
import {
  Pin,
  Trash2,
  Copy,
  Check,
  Quote,
  Bookmark
} from 'lucide-react';

interface PostCardProps {
  post: PostItem;
  isAdmin: boolean;
  onLikePost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onCopySuccess?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isAdmin,
  onDeletePost,
  onCopySuccess,
}) => {
  const [copied, setCopied] = useState(false);

  // Robust Copy function supporting iframes
  const handleCopyContent = async () => {
    const textToCopy = post.content;

    let success = false;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        success = true;
      } catch (err) {
        console.warn('navigator.clipboard failed, using fallback', err);
      }
    }

    if (!success) {
      // Fallback for iframe sandboxes
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        console.error('Fallback copy failed', fallbackErr);
      }
    }

    setCopied(true);
    if (onCopySuccess) {
      onCopySuccess(post.id);
    }
    setTimeout(() => {
      setCopied(false);
    }, 2200);
  };

  return (
    <article
      id={`post-${post.id}`}
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md relative overflow-hidden ${
        post.pinned
          ? 'border-indigo-300 ring-2 ring-indigo-50 bg-gradient-to-b from-indigo-50/20 to-white'
          : 'border-slate-200/90'
      }`}
    >
      {/* Decorative top accent for comments */}
      <div
        className={`h-1 w-full ${
          post.pinned
            ? 'bg-gradient-to-r from-amber-500 via-indigo-600 to-blue-600'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}
      />

      <div className="p-5 sm:p-6">
        {/* Top Row: (Pinned Badge & Admin Delete) */}
        {(post.pinned || (isAdmin && onDeletePost)) && (
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              {post.pinned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Pin className="w-3 h-3 text-amber-600 fill-amber-600" />
                  পিন করা
                </span>
              )}
            </div>

            {isAdmin && onDeletePost && (
              <button
                id={`delete-post-${post.id}`}
                onClick={() => onDeletePost(post.id)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer ml-auto"
                title="মুছে ফেলুন (এডমিন)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Title if available and custom */}
        {post.title &&
          post.title !== 'এডমিনের নতুন কমেন্ট' &&
          post.title !== 'এডমিনের কমেন্ট ও উক্তি' && (
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-2.5">
              {post.title}
            </h2>
          )}

        {/* Comment Body - Clean & prominent text */}
        <div className="relative p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80">
          <Quote className="w-6 h-6 text-blue-200 absolute -top-2.5 -left-1.5 rotate-180 pointer-events-none" />
          <p className="text-slate-800 text-base sm:text-lg leading-relaxed whitespace-pre-line font-medium pl-1 select-text">
            {post.content}
          </p>
        </div>

        {/* Bottom Bar: Clean Copy Button & Copy Counter */}
        <div className="mt-4 pt-3 flex items-center justify-between gap-3">
          <button
            id={`main-copy-btn-${post.id}`}
            onClick={handleCopyContent}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-500/20 scale-[1.02]'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/10 active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>কপি করা হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span>কপি করুন</span>
              </>
            )}
          </button>

          {post.copiesCount !== undefined && post.copiesCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Bookmark className="w-3.5 h-3.5 text-blue-500" />
              <span>{post.copiesCount} বার কপি করা হয়েছে</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
