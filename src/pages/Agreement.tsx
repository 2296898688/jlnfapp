import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Agreement() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      <div className="px-5 pt-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center active:scale-95 transition-transform mb-3">
          <ArrowLeft size={18} className="text-slate-500" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">服务协议</h1>
      </div>

      <div className="flex-1 px-5 mt-4 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-[18px] font-bold text-slate-800 text-center mb-5">农机作业服务协议</h2>
          <div className="text-[13px] text-slate-600 leading-relaxed space-y-4">
            <p>市域内资源富集，物种丰富，生态类型呈梯次结构，境内有209万公顷原始森林，27万公顷天然草场，"亚洲第一湿地"以及81条流域面积超过100平方公里的河流，大都保持了原始状态，为推动生态旅游发展提供了有力保障。</p>
            <p>乌兰山景区位于市县道904东侧、额尔古纳河右岸，总占地面积为4.7平方公里，是国家AAAA级旅游景区。作为重庆市北部黄金旅游线上的重要节点，乌兰山景区立足生态资源禀赋，深度挖掘生态优势，在做好生态保护的前提下，科学谋划生态旅游，将旅游设施与自然风光深度结合，实现观光旅游、休闲度假、户外游乐于一体，积极打造了野奢帐篷营地、房车营地、观景平台区等生态旅游功能区。游客在这里可以体验中国北方第一高空滑索、中国最美网红秋千、重庆市最大天然滑草场等项目。据了解，2022年乌兰山景区接待游客超20万人次，实现营收1000余万元。</p>
            <p>一直以来，市坚持多点触发，优化全域旅游空间布局。按照《市全域旅游总体规划》，推动市旅游资源主题化、集群化、协同化发展，构建全域旅游空间新格局。 市坚持多点触发，优化全域旅游空间布局。按照《市全域旅游总体规划》，推动市旅游资源主题化、集群化、协同化发展，构建全域旅游空间新格局。</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h3 className="text-[15px] font-bold text-slate-800">协议条款</h3>
          <div className="text-[12px] text-slate-500 space-y-2">
            <p>第一条 甲方委托乙方提供农机作业服务，具体服务内容包括耕地、播种、施肥、植保、收割等农业生产环节的机械化作业。</p>
            <p>第二条 乙方应按照甲方要求的时间和作业标准，保质保量完成农机作业任务。</p>
            <p>第三条 作业费用按照双方约定的价格标准计算，甲方应在作业完成后15个工作日内结清费用。</p>
            <p>第四条 乙方应确保作业机械处于良好状态，操作人员具备相应资质，严格遵守安全生产规范。</p>
            <p>第五条 因不可抗力因素导致作业无法正常进行的，双方协商解决。</p>
            <p>第六条 本协议一式两份，甲乙双方各执一份，具有同等法律效力。</p>
          </div>
        </div>

        <div className="text-center py-6">
          <p className="text-[12px] text-slate-400">吉林农发集团 · 智慧农业平台</p>
          <p className="text-[10px] text-slate-300 mt-1">© 2026 吉林农业发展集团有限公司 版权所有</p>
        </div>
      </div>
    </div>
  );
}
