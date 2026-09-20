import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, Check, Link2, Edit3, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import { SimaAvatar } from './SimaAvatar';

interface WorkUpJobInstructionBannerProps {
  isAdmin?: boolean;
}

const STORAGE_LINK_KEY = 'workupjob_target_link';
const DEFAULT_LINK = 'https://reactwin.com/brand-new-samsung-galaxy-tab-a11';

export const WorkUpJobInstructionBanner: React.FC<WorkUpJobInstructionBannerProps> = ({ isAdmin = false }) => {
  const [targetLink, setTargetLink] = useState<string>(DEFAULT_LINK);
  const [isEditing, setIsEditing] = useState(false);
  const [tempLink, setTempLink] = useState(DEFAULT_LINK);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LINK_KEY);
      if (
        saved &&
        saved.startsWith('http') &&
        !saved.includes('------') &&
        saved !== 'https://workupjob.com'
      ) {
        setTargetLink(saved);
        setTempLink(saved);
      } else {
        // Enforce the requested official target link
        setTargetLink(DEFAULT_LINK);
        setTempLink(DEFAULT_LINK);
        localStorage.setItem(STORAGE_LINK_KEY, DEFAULT_LINK);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const handleSaveLink = () => {
    const formatted = tempLink.trim().startsWith('http') ? tempLink.trim() : `https://${tempLink.trim()}`;
    setTargetLink(formatted);
    try {
      localStorage.setItem(STORAGE_LINK_KEY, formatted);
    } catch {
      // Ignore localStorage errors
    }
    setIsEditing(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-white border border-blue-200/90 rounded-2xl shadow-sm overflow-hidden mb-6">
      {/* Top Header Badge */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-2.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide">
            কাজের জন্য বিশেষ নির্দেশনা ও রিপ্লাই গাইডলাইন
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-bold">
            Sima
          </span>
          {isAdmin && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-[11px] bg-white/25 hover:bg-white/35 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="লিংক এডিট করুন"
            >
              <Edit3 className="w-3 h-3" />
              <span>লিংক এডিট</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Admin Link Edit Form */}
        {isAdmin && isEditing && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-blue-900">
              নিচের ইনপুটে আপনার কাজের সঠিক লিংক (WorkUpJob বা যেকোনো লিংক) পেস্ট করুন:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={tempLink}
                onChange={(e) => setTempLink(e.target.value)}
                placeholder="https://workupjob.com/..."
                className="flex-1 text-xs px-3 py-2 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSaveLink}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  সেভ করুন
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </div>
          </div>
        )}

        {/* The Picture / Comment Screenshot Card */}
        <div className="w-full flex flex-col items-center">
          {/* Authentic Visual Screenshot of Sima's WorkUpJob comment */}
          <div className="w-full max-w-3xl bg-white border-2 border-slate-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3.5">
              {/* Circular Avatar with Purple 'S' for Sima */}
              <SimaAvatar className="w-11 h-11 sm:w-12 sm:h-12 border-2 border-purple-900/20 shrink-0 text-xl sm:text-2xl font-black" />

              {/* Comment Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base">Sima</span>
                  <span className="text-xs text-slate-500 font-normal">1d ago</span>
                </div>

                <div className="mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-[#0f766e] hover:underline cursor-pointer">
                    @aklied__nd
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-normal break-words select-text">
                  <span className="font-semibold text-slate-900">#WorkUpJob Comments koron ,tg- aklie_nd ,</span>
                  <span className="text-base sm:text-lg tracking-wide">💖 💖 💖 💖 💚 💖 🔥 🥰 🕋 🕌 🛕 🕍 💯</span>{' '}
                  <span className="font-medium text-slate-800">,, User ID: 5278138</span>
                </p>

                {/* Card Footer Bar with Reacts and Replies */}
                <div className="mt-3.5 pt-3 flex items-center justify-between border-t border-slate-100 flex-wrap gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 cursor-pointer">
                    <span>🏳️</span>
                    <span>Report</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-slate-700 font-medium shadow-2xs">
                      <span>73 react</span>
                      <span>👍</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-slate-700 font-medium shadow-2xs">
                      <span>👥</span>
                      <span>69 reply</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Instructions as requested by user */}
        <div className="bg-gradient-to-b from-blue-50/90 to-indigo-50/60 border-2 border-blue-200/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-2xs">
              <MessageCircle className="w-4 h-4" />
              <span>কাজের নির্দেশনা (Step-by-Step):</span>
            </div>
            <span className="text-xs text-blue-700 font-medium hidden sm:inline">
              নিচের ধাপগুলো সঠিকভাবে অনুসরণ করুন
            </span>
          </div>

          <div className="space-y-3.5 text-slate-800 text-xs sm:text-sm leading-relaxed">
            {/* Step 1 */}
            <div className="p-3 bg-white border border-blue-100 rounded-xl shadow-2xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  ১
                </span>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 text-sm">
                    কাজটি সম্পন্ন করতে লিঙ্কটি ভিজিট করুন।
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    নিচের লিংকে ক্লিক করুন অথবা বাটন ব্যবহার করে সরাসরি সাইটে প্রবেশ করুন:
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pl-0 sm:pl-8">
                <div className="flex items-center gap-2 overflow-hidden text-xs text-blue-900 font-mono bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 flex-1">
                  <Link2 className="w-4 h-4 shrink-0 text-blue-600" />
                  <a
                    href={targetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:underline text-blue-700 font-medium select-all"
                  >
                    {targetLink}
                  </a>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    id="workupjob-banner-link-btn"
                    href={targetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg transition-all shadow-2xs cursor-pointer"
                  >
                    <span>এই লিংকে যান</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>

                  <button
                    id="workupjob-copy-link-btn"
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                    title="লিংক কপি করুন"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>লিংক কপি</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-white border border-blue-100 rounded-xl shadow-2xs flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                ২
              </span>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                  কমেন্ট সেকশনে যান এবং আমার কমেন্টটি খুঁজে বের করুন:{' '}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-900 font-extrabold text-sm border border-purple-200">
                    <span className="w-4 h-4 rounded-full bg-[#741697] text-white flex items-center justify-center text-[10px] font-bold">S</span>
                    <span>“Sima”</span>
                    <span className="text-xs text-[#0f766e] font-semibold">(@aklied__nd)</span>
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  (উপরের ছবির মতো কমেন্টটি খুঁজবেন: বেগুনী 'S' লোগো, User ID: 5278138)
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-white border border-blue-100 rounded-xl shadow-2xs flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                ৩
              </span>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                  এখানে নিচে থেকে একটা কমেন্ট কপি করেন।এবং আমার কমেন্টে রিপ্লাই দেন।
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  নিচের কমেন্ট তালিকা থেকে যেকোনো একটি পছন্দের কমেন্টে "কপি করুন" চেপে কপি করে রিপ্লাই বক্সে পেস্ট করুন।
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 bg-amber-50/90 border-2 border-amber-300/80 rounded-xl shadow-2xs flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                ৪
              </span>
              <div className="flex-1">
                <p className="font-bold text-amber-950 text-xs sm:text-sm">
                  যারা একবার কাজ করেছেন, তারা নতুন Gmail দিয়ে কাজ করবেন।✅❗❗
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  আগের জিমেইল ব্যবহার করলে কাজটি বাতিল হতে পারে, তাই প্রতিবার নতুন জিমেইল ব্যবহার করুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
