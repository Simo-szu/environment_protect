'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AuthenticatedHeader from './ui/AuthenticatedHeader';
import UnifiedFooter from './ui/UnifiedFooter';
import BackToTop from './ui/BackToTop';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function Layout({ children, showHeader = true, showFooter = true }: LayoutProps) {
  const pathname = usePathname();

  // 检查是否是子页面（如登录、注册、个人资料等）
  const isSubPage = pathname.includes('/login') ||
    pathname.includes('/register') ||
    pathname.includes('/profile') ||
    pathname.includes('/edit') ||
    pathname.includes('/settings');

  // 检查是否是认证页面（不显示认证按钮）
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');

  return (
    <div className="bg-[#FAFAF9] min-h-screen relative overflow-x-hidden text-slate-600">
      {/* 全局背景氛围 (液体黄绿色光斑) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="liquid-blob absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#56B949]/15 rounded-full blur-[120px] animate-[liquid-drift_20s_infinite_ease-in-out_alternate]"></div>
        <div className="liquid-blob absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F0A32F]/10 rounded-full blur-[100px] animate-[liquid-drift_20s_infinite_ease-in-out_alternate] [animation-delay:-5s]"></div>
        <div className="liquid-blob absolute bottom-[-20%] left-[10%] w-[80%] h-[60%] bg-gradient-to-tr from-[#56B949]/20 to-[#30499B]/5 rounded-full blur-[130px] animate-[liquid-drift_20s_infinite_ease-in-out_alternate] [animation-delay:-10s]"></div>
        <div className="liquid-blob absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-[#56B949]/10 rounded-full blur-[80px] animate-[liquid-drift_20s_infinite_ease-in-out_alternate] [animation-delay:-2s]"></div>
      </div>

      {/* 落叶动画层 */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="leaf-container text-[#56B949] absolute top-[-20px] animate-[falling-leaf_15s_linear_infinite] pointer-events-none" style={{ left: '10%', width: '32px', '--end-x': '50px', '--end-rotation': '120deg' } as React.CSSProperties}>
          <svg className="leaf-svg w-full h-full fill-none stroke-current stroke-[1.2] [stroke-linecap:round] [stroke-linejoin:round] [filter:drop-shadow(0_4px_6px_rgba(0,0,0,0.05))]" viewBox="0 0 24 24">
            <path d="M2,21c0-8.8,3.3-16.1,10-19c0,0-1.6,7.7,2,11c-2,0-5,0-5,8C9,21,2,21,2,21z M12,2c0,0,1,6,0,10"></path>
          </svg>
        </div>
        <div className="leaf-container text-[#F0A32F] absolute top-[-20px] animate-[falling-leaf_18s_linear_infinite] pointer-events-none [animation-delay:4s]" style={{ left: '25%', width: '24px', '--end-x': '-30px', '--end-rotation': '200deg' } as React.CSSProperties}>
          <svg className="leaf-svg w-full h-full fill-none stroke-current stroke-[1.2] [stroke-linecap:round] [stroke-linejoin:round] [filter:drop-shadow(0_4px_6px_rgba(0,0,0,0.05))]" viewBox="0 0 24 24">
            <path d="M12 2L12 22 M12 12L18 8 M12 12L6 8 M12 17L16 15 M12 17L8 15"></path>
          </svg>
        </div>
      </div>

      {/* Browser Frame */}
      <div className="w-full max-w-7xl bg-white/80 sm:rounded-2xl shadow-2xl shadow-[#56B949]/5 border-x sm:border border-white/60 min-h-screen sm:min-h-[90vh] relative backdrop-blur-md z-10 scroll-smooth ring-1 ring-white/50 mx-auto">
        {/* 主内容区 */}
        <main className="p-4 sm:p-6 md:p-12 min-h-screen relative max-w-6xl mx-auto">
          {showHeader && (
            <AuthenticatedHeader showSearch={!isSubPage} />
          )}

          {children}

          {showFooter && (
            <UnifiedFooter showFullFooter={!isSubPage} />
          )}
        </main>
      </div>

      {/* 回到顶部按钮 */}
      <BackToTop />

      <style jsx>{`
        @keyframes liquid-drift {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
          100% { transform: translate(0, 0) scale(1); }
        }

        @keyframes falling-leaf {
          0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translate3d(var(--end-x), 110vh, 0) rotate(var(--end-rotation)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}