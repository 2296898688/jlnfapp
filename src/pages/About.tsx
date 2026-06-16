import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Smartphone } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <div className="px-5 pt-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center active:scale-95 transition-transform mb-3">
          <ArrowLeft size={18} className="text-slate-500" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">关于</h1>
      </div>

      <div className="flex-1 px-5 mt-4 space-y-6">
        {/* App Info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-700 mx-auto flex items-center justify-center">
            <Smartphone size={32} className="text-white" />
          </div>
          <h2 className="text-[18px] font-bold text-slate-800">种植综合管理APP</h2>
          <p className="text-[13px] text-slate-400">当前版本：V12.3.0</p>
        </div>

        {/* Update Log */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-slate-800">更新日志（V12.3.0）</h3>
          <p className="text-[10px] text-slate-400">发布日期: 2027年3月15日</p>
          <div className="text-[12px] text-slate-600 space-y-2 leading-relaxed">
            <p>1、智能文档助手: 引入AI驱动的文档编辑建议，包括语法检查、风格优化及格式调整。</p>
            <p>2、团队协作升级: 实现了跨平台实时同步编辑功能，允许多名用户同时在线编辑同一个文档，并增加了评论功能。</p>
            <p>3、性能优化: 提升了软件启动速度和文件加载时间，特别是在处理大型文档时的表现显著改善。</p>
            <p>4、界面优化: 调整了工具栏布局，使常用功能更加直观易用；新增夜间模式，减少长时间工作对眼睛的疲劳。</p>
            <p>5、安全性提升: 增强了数据加密技术，确保用户文档在传输和存储过程中的安全。</p>
            <p>6、修复解决了特定条件下导致文档意外崩溃的问题。</p>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <p className="text-[12px] text-slate-500 leading-relaxed">
            APP是由XXX开发，为集团内外部用户提供服务的移动端应用。
          </p>
        </div>

        {/* Update */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 text-center">
          <p className="text-[14px] font-bold text-blue-700">最新版本：V14.3.0</p>
          <button className="mt-3 px-8 py-2.5 bg-blue-700 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform">
            立即更新
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-300">© 2026 吉林农业发展集团有限公司 版权所有</p>
      </div>
    </div>
  );
}
