import React from 'react';
import { MessageSquareText, Shield, ShieldCheck, LogOut } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  onOpenAdminPanel: () => void;
  onExitAdmin: () => void;
  chatCount?: number;
  totalComments?: number;
  pendingCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  onOpenAdminPanel,
  onExitAdmin,
  pendingCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {isAdmin && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-6xl mx-auto w-full">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-200 animate-pulse" />
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>এডমিন মোড সক্রিয় রয়েছে। আপনি নতুন পোস্ট তৈরি, কমেন্ট মুছে ফেলা এবং চ্যাটের উত্তর দিতে পারেন।</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                id="header-admin-panel-btn"
                onClick={onOpenAdminPanel}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <span>প্যানেল দেখুন</span>
                {pendingCount !== undefined && pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded-full font-bold text-[10px]">
                    {pendingCount} পেন্ডিং
                  </span>
                )}
              </button>
              <button
                id="header-admin-logout-btn"
                onClick={onExitAdmin}
                className="bg-emerald-800/80 hover:bg-emerald-900 text-emerald-100 px-2.5 py-1 rounded-md text-xs cursor-pointer flex items-center gap-1 transition-colors"
                title="সাধারণ ব্যবহারকারী ভিউতে ফিরে যান"
              >
                <LogOut className="w-3.5 h-3.5" />
                প্রস্থান
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div
            onDoubleClick={onOpenAdminPanel}
            className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 cursor-default select-none"
            title="কমেন্ট সাইট"
          >
            <MessageSquareText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                কমেন্ট সাইট
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                লাইভ পোর্টাল
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              বিশেষ উক্তি, ১-ক্লিকে কপি ও সরাসরি উন্মুক্ত চ্যাট
            </p>
          </div>
        </div>

        {/* Right side: only show Admin Panel if logged in as Admin */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              id="header-badge-admin"
              onClick={onOpenAdminPanel}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 hover:bg-emerald-200 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              এডমিন প্যানেল
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
