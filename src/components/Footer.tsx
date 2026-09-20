import React from 'react';
import { MessageSquare } from 'lucide-react';

interface FooterProps {
  onOpenAdminPanel: () => void;
  isAdmin: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminPanel }) => {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          {/* Main Footer Brand - Clean, no admin indicators */}
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2">
              <div className="inline-flex items-center gap-2.5 text-white font-bold text-xl sm:text-2xl">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="tracking-tight text-white">
                  কমেন্ট সাইট
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 max-w-md">
              দৈনন্দিন অনুপ্রেরণামূলক উক্তি, চিন্তা ও মুক্ত যোগাযোগের উন্মুক্ত প্ল্যাটফর্ম।
            </p>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>উন্মুক্ত ও সক্রিয় প্ল্যাটফর্ম</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright - Clicking the copyright text acts as the secret admin trigger */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <button
            id="footer-secret-admin-trigger"
            onClick={onOpenAdminPanel}
            className="text-left text-slate-500 hover:text-slate-400 transition-colors cursor-default"
          >
            © {new Date().getFullYear()} কমেন্ট সাইট — সকল অধিকার সংরক্ষিত।
          </button>
          <div className="flex items-center gap-1 text-slate-500">
            <span>মুক্ত আলোচনা ও লাইভ চ্যাট</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
