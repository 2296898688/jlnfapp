import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  type: 'system' | 'report';
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: '系统更新通知', content: '种植综合管理APP V14.3.0 版本已发布，新增智能文档助手和夜间模式，建议您尽快更新。', time: '2026-06-12 09:00', type: 'system', read: false },
  { id: 'n2', title: '遥感报告更新', content: '2026年第24周遥感监测报告已发布，平均NDVI 0.72，植被覆盖度85%，请查看详情。', time: '2026-06-12 08:30', type: 'report', read: false },
  { id: 'n3', title: '产量预估报告生成', content: '2026种植季"大豆·中黄13"的产量预估报告已自动生成，预估亩产350斤，请登录查看。', time: '2026-06-11 10:20', type: 'report', read: false },
  { id: 'n4', title: '气象预警解除', content: '此前发布的白城市中雨预警已解除，未来一周天气以晴好为主，可正常安排田间作业。', time: '2026-06-10 08:30', type: 'system', read: true },
  { id: 'n5', title: '人员变动通知', content: '操作员"老李"岗位调整为长岭种马场作业队长，相关作业记录已自动迁移。', time: '2026-06-09 11:00', type: 'system', read: true },
  { id: 'n6', title: '气象专报发布', content: '2026年6月第2周气象专报已发布，预计6月中旬降水偏少，请注意旱情监测。', time: '2026-06-08 10:00', type: 'report', read: true },
  { id: 'n7', title: '系统维护通知', content: '平台将于6月15日凌晨2:00-4:00进行例行维护，届时部分功能可能暂不可用。', time: '2026-06-07 16:00', type: 'system', read: true },
  { id: 'n8', title: '农艺配方库更新', content: '新增"玉米穗期追肥配方"和"高粱拔节期追肥配方"两条农艺配方，欢迎使用。', time: '2026-06-05 14:00', type: 'report', read: true },
];

const TYPE_STYLE: Record<string, string> = {
  system: 'bg-slate-100 text-slate-500',
  report: 'bg-blue-50 text-blue-600',
};

const TYPE_LABEL: Record<string, string> = {
  system: '系统',
  report: '报告',
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);
  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <div className="px-5 pt-5">
        <div className="flex items-start justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft size={18} className="text-slate-500" />
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] font-bold text-blue-600 active:text-blue-800 py-2">
              <CheckCheck size={14} /> 全部已读
            </button>
          )}
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight mt-3">消息通知</h1>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{unreadCount} 条未读</p>
      </div>

      <div className="flex-1 px-5 mt-4 space-y-2">
        {notifs.map(n => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className={cn(
              "w-full bg-white rounded-2xl border p-4 text-left transition-colors active:bg-slate-50",
              n.read ? "border-slate-100" : "border-blue-200 bg-blue-50/20"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", n.read ? "bg-transparent" : "bg-blue-600")} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", TYPE_STYLE[n.type])}>{TYPE_LABEL[n.type]}</span>
                  <span className="text-[10px] text-slate-400 ml-auto">{n.time}</span>
                </div>
                <h4 className={cn("text-[13px] font-bold", n.read ? "text-slate-700" : "text-slate-900")}>{n.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{n.content}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
