import c4dGallery from '../data/c4dGallery.json';
import { aigcCategories } from '../data/aigcCategories.js';
import { illustrationGallery } from '../data/illustrationGallery.js';
import { fontGenerationGallery } from '../data/fontGenerationGallery.js';

export const textFields = [
  ['nav.brandName', '导航：品牌名称', '导航与首屏', 'VISION DESIGN'],
  ['nav.brandVi', '导航：品牌 VI', '导航与首屏', '品牌VI'],
  ['nav.offline', '导航：线下物料', '导航与首屏', '线下物料'],
  ['nav.aigc', '导航：AIGC 应用', '导航与首屏', 'AIGC应用'],
  ['nav.ecommerce', '导航：电商页面', '导航与首屏', '电商页面'],
  ['hero.title', '首屏：主标题', '导航与首屏', 'CHALON ZHOU DESIGN'],
  ['hero.line1', '首屏：说明第一行', '导航与首屏', '品牌 × 三维 × AIGC'],
  ['hero.line2', '首屏：说明第二行', '导航与首屏', '把复杂的想法转译成清晰、准确、可落地的视觉。'],
  ['hero.button', '首屏：行动按钮', '导航与首屏', '开始探索'],
  ['hero.sideLabel', '首屏：右侧竖排说明', '导航与首屏', 'CHALON ZHOU / SELECTED WORKS / 2017—2026'],
  ['about.greeting', '个人简介：问候语', '个人资料', '你好，我是'],
  ['about.name', '个人简介：姓名', '个人资料', '周超。'],
  ['about.role', '个人简介：身份', '个人资料', '一名视觉设计师。'],
  ['about.lead', '个人简介：摘要', '个人资料', '9 年设计经验，持续工作在品牌、产品与商业视觉的交汇处。'],
  ['about.bio', '个人简介：介绍', '个人资料', '我喜欢从问题本身开始：先厘清品牌要表达什么、观众需要看见什么，再找到适合的视觉方式。熟悉品牌视觉与平面设计，也能独立完成产品建模、渲染和后期合成；现在把 AI 纳入日常创作，用它拓展可能，再用设计判断与人工精修把结果收回来。'],
  ['about.years', '个人数据：经验年数', '个人资料', '09'],
  ['about.yearsLabel', '个人数据：经验说明', '个人资料', '视觉设计经验'],
  ['about.startYear', '个人数据：起始年份', '个人资料', '2017'],
  ['about.endYear', '个人数据：结束年份', '个人资料', '2026'],
  ['about.spanLabel', '个人数据：跨度说明', '个人资料', '创作与工作跨度'],
  ['about.focusCount', '个人数据：方向数量', '个人资料', '04'],
  ['about.focusLabel', '个人数据：方向说明', '个人资料', '核心方向'],
  ['about.skill1', '专业方向 1', '个人资料', '品牌视觉'],
  ['about.skill2', '专业方向 2', '个人资料', '3D 建模 / 渲染'],
  ['about.skill3', '专业方向 3', '个人资料', 'AIGC'],
  ['about.skill4', '专业方向 4', '个人资料', '电商设计'],
  ['about.experienceEyebrow', '经历模块：英文眉题', '个人资料', 'EXPERIENCE'],
  ['about.experienceNote', '经历模块：说明', '个人资料', '经历不是标签，是方法的来源。'],
  ...[
    ['2021.10 — 2026.09', '深圳市安诗曼科技有限公司', '品牌视觉 · 产品建模与渲染 · AIGC'],
    ['2020.08 — 2021.06', '惠州兰驰家居有限公司', '电商视觉 · 产品与招商手册 · 展会物料'],
    ['2019.09 — 2020.06', '杭州合麦文化发展有限公司', '店铺视觉 · 活动页面 · 产品详情'],
    ['2017.05 — 2019.07', '杭州花季贸易 / 杭州昕伦贸易', '电商页面 · 平面视觉 · 日常运营协作'],
  ].flatMap(([date, company, role], index) => [
    [`experience.${index + 1}.date`, `经历 ${index + 1}：时间`, '工作经历', date],
    [`experience.${index + 1}.company`, `经历 ${index + 1}：公司`, '工作经历', company],
    [`experience.${index + 1}.role`, `经历 ${index + 1}：职责`, '工作经历', role],
  ]),
  ['projects.eyebrow', '作品模块：英文眉题', '作品与项目', 'SELECTED WORKS'],
  ['projects.index', '作品模块：编号', '作品与项目', '02 — VISUAL ARCHIVE'],
  ['projects.introTitle1', '作品模块：引言第一行', '作品与项目', '让每一种能力，'],
  ['projects.introTitle2', '作品模块：引言第二行', '作品与项目', '都找到清晰的位置。'],
  ['projects.introBody1', '作品模块：引言说明第一行', '作品与项目', '从品牌系统到三维产品，从商业页面到 AIGC 视觉探索。'],
  ['projects.introBody2', '作品模块：引言说明第二行', '作品与项目', '先理解内容，再为它选择合适的视觉表达。'],
  ...[
    ['品牌视觉系统升级', '从品牌识别到应用触点，建立稳定、清晰、可持续延展的视觉秩序。', 'BRAND / VISUAL SYSTEM'],
    ['线下物料', '画册、折页与展会资料，让内容在真实的阅读和使用场景中保持一致。', 'PRINT / BRAND COLLATERAL'],
    ['C4D 产品建模', '结构、材质、灯光与镜头协同工作，把产品细节转化成可信的视觉呈现。', '3D / PRODUCT RENDER'],
    ['AIGC 视觉探索', '用生成探索更多方向，再由设计判断收敛画面、统一细节并完成落地。', 'AIGC / IMAGE MAKING'],
    ['电商页面', '围绕购买决策组织内容顺序，清楚呈现产品功能、使用场景与关键卖点。', 'ECOMMERCE / CONTENT DESIGN'],
    ['手绘与视觉探索', '留给观察、练习与灵感的空间，也记录尚未被定义的方向。', 'SKETCHBOOK / EXPLORATION'],
  ].flatMap(([title, subtitle, right], index) => [
    [`section.${index + 1}.title`, `作品分类 ${index + 1}：标题`, '作品与项目', title],
    [`section.${index + 1}.subtitle`, `作品分类 ${index + 1}：说明`, '作品与项目', subtitle],
    [`section.${index + 1}.right`, `作品分类 ${index + 1}：英文标识`, '作品与项目', right],
  ]),
  ...[
    ['首屏视觉', '先呈现产品价值'], ['功能拆解', '让复杂卖点更易读'], ['场景表达', '将产品放进使用情境'],
  ].flatMap(([title, note], index) => [
    [`ecommerce.slot${index + 1}`, `电商图片位 ${index + 1}：标题`, 'AIGC 与电商', title],
    [`ecommerce.slot${index + 1}Note`, `电商图片位 ${index + 1}：说明`, 'AIGC 与电商', note],
  ]),
  ['approach.eyebrow', '方法模块：英文眉题', '工作方式与联系', 'HOW I WORK'],
  ['approach.index', '方法模块：编号', '工作方式与联系', '03 — APPROACH'],
  ['approach.title1', '方法模块：标题第一行', '工作方式与联系', '好的视觉，'],
  ['approach.title2', '方法模块：标题第二行', '工作方式与联系', '来自清晰的判断。'],
  ['approach.body1', '方法模块：说明第一行', '工作方式与联系', '设计工具会变，解决问题的路径更重要。'],
  ['approach.body2', '方法模块：说明第二行', '工作方式与联系', '我的工作方式，是在想法与落地之间建立可靠连接。'],
  ['approach.toolsLabel', '方法模块：工具栏标题', '工作方式与联系', 'TOOLS IN PRACTICE'],
  ['approach.tool1', '方法模块：工具 1', '工作方式与联系', 'PHOTOSHOP'],
  ['approach.tool2', '方法模块：工具 2', '工作方式与联系', 'ILLUSTRATOR'],
  ['approach.tool3', '方法模块：工具 3', '工作方式与联系', 'CINEMA 4D'],
  ['approach.tool4', '方法模块：工具 4', '工作方式与联系', 'COMFYUI'],
  ['approach.tool5', '方法模块：工具 5', '工作方式与联系', 'CHATGPT'],
  ...[
    ['先厘清问题', '从品牌定位、用户场景与传播目标出发，整理信息优先级，让创意有清楚的方向。', '梳理 · 定义 · 聚焦'],
    ['让视觉落地', '连接平面、三维与内容表达，兼顾视觉质感、信息清晰度与实际应用场景。', '品牌 · 产品 · 场景'],
    ['把 AI 用在合适的地方', '用 AI 加速灵感探索与素材生成，再通过人工判断、精修和规范化，保证最终结果可信、统一。', '探索 · 精修 · 统一'],
  ].flatMap(([title, body, tags], index) => [
    [`approach.card${index + 1}.title`, `工作方式卡片 ${index + 1}：标题`, '工作方式与联系', title],
    [`approach.card${index + 1}.body`, `工作方式卡片 ${index + 1}：说明`, '工作方式与联系', body],
    [`approach.card${index + 1}.tags`, `工作方式卡片 ${index + 1}：标签`, '工作方式与联系', tags],
  ]),
  ['contact.eyebrow', '联系模块：英文眉题', '工作方式与联系', 'LET’S MAKE SOMETHING MEANINGFUL'],
  ['contact.title1', '联系模块：标题第一行', '工作方式与联系', '有好的想法，'],
  ['contact.title2', '联系模块：标题第二行', '工作方式与联系', '值得被认真看见。'],
  ['contact.body1', '联系模块：说明第一行', '工作方式与联系', '品牌视觉、产品表达，或正在探索的 AI 创意。'],
  ['contact.body2', '联系模块：说明第二行', '工作方式与联系', '欢迎带着一个具体的问题，开启下一段对话。'],
  ['contact.button', '联系模块：按钮', '工作方式与联系', '联系我吧'],
  ['contact.signature', '联系模块：署名', '工作方式与联系', 'CHALON ZHOU — VISUAL DESIGNER'],
  ['footer.copyright', '页尾：版权说明', '工作方式与联系', '独立创作的视觉方案与版式版权归周超所有；项目相关品牌及产品素材版权归对应品牌方。'],
  ['footer.backToTop', '页尾：返回顶部', '工作方式与联系', '回到顶部'],
  ['footer.signature', '页尾：署名与年份', '工作方式与联系', '© CHALON ZHOU 2026'],
];

export const imageFields = [
  { id: 'portrait.cartoon', label: '卡通肖像正面', category: '个人资料', src: '/images/profile-cartoon.webp' },
  { id: 'portrait.photo', label: '真人肖像背面', category: '个人资料', src: '/images/profile-front.webp' },
  { id: 'brand.logo', label: '导航标志', category: '导航与首屏', src: '/images/vision-mark.png' },
  ...Array.from({ length: 36 }, (_, index) => ({
    id: `vi.${String(index + 1).padStart(3, '0')}`,
    label: `品牌 VI 图片 ${String(index + 1).padStart(2, '0')}`,
    category: '品牌 VI',
    src: `/images/ansmen-vi/${String(index + 1).padStart(2, '0')}.jpg`,
  })),
  ...[
    ['/images/offline-materials/22222.webp', '品牌手册'],
    ['/images/offline-materials/33333.webp', '产品目录'],
    ['/images/offline-materials/11111.webp', '画册装帧'],
    ['/images/offline-materials/01-cover.webp', '产品画册封面'],
    ['/images/offline-materials/02-brochure-spread.webp', '产品画册跨页'],
    ['/images/offline-materials/03-foldout-mockup.webp', '折页展示'],
    ['/images/offline-materials/04-catalog-detail.webp', '产品目录细节'],
    ['/images/offline-materials/05-foldout-back.webp', '折页内页'],
    ['/images/offline-materials/06-foldout-products.webp', '产品系列折页'],
    ['/images/offline-materials/07-template-products.webp', '英文产品目录'],
    ['/images/offline-materials/08-template-system.webp', '系统方案目录'],
  ].map(([src, label], index) => ({ id: `offline.${String(index + 1).padStart(3, '0')}`, label, category: '线下物料', src })),
  { id: 'c4d.compare.1.before', label: '白模对比 01：恒温恒湿机正面白模', category: 'C4D 产品建模', src: '/images/white-model-comparison/12kw-before.webp' },
  { id: 'c4d.compare.1.after', label: '白模对比 01：恒温恒湿机正面渲染', category: 'C4D 产品建模', src: '/images/white-model-comparison/12kw-final.webp' },
  { id: 'c4d.compare.2.before', label: '白模对比 02：恒温恒湿机外机白模', category: 'C4D 产品建模', src: '/images/white-model-comparison/12kw-outdoor-before.webp' },
  { id: 'c4d.compare.2.after', label: '白模对比 02：恒温恒湿机外机渲染', category: 'C4D 产品建模', src: '/images/white-model-comparison/12kw-outdoor-final.webp' },
  { id: 'c4d.compare.3.before', label: '白模对比 03：外贸 C60 白模', category: 'C4D 产品建模', src: '/images/white-model-comparison/c60-before.webp' },
  { id: 'c4d.compare.3.after', label: '白模对比 03：外贸 C60 渲染', category: 'C4D 产品建模', src: '/images/white-model-comparison/c60-final.webp' },
  ...c4dGallery.map((item, index) => ({ id: `c4d.${String(index + 1).padStart(3, '0')}`, label: item.alt || `C4D 作品 ${index + 1}`, category: 'C4D 产品建模', src: item.src, ratio: item.ratio })),
  ...aigcCategories.flatMap(({ key, label, featureId, galleryPrefix }) => [
    {
      id: featureId,
      label: `${label}主视觉`,
      category: label,
      src: key === 'font-generation' ? fontGenerationGallery[0].src : null,
      ratio: key === 'font-generation' ? fontGenerationGallery[0].ratio : undefined,
    },
    ...Array.from({ length: key === 'illustration' ? illustrationGallery.length : 6 }, (_, index) => ({
      id: key === 'illustration' ? illustrationGallery[index].id : `${galleryPrefix}.${index + 1}`,
      label: `${label}图片 ${String(index + 1).padStart(2, '0')}`,
      category: label,
      src: key === 'illustration'
        ? illustrationGallery[index].src
        : key === 'font-generation'
          ? fontGenerationGallery[index + 1].src
          : null,
      ratio: key === 'font-generation' ? fontGenerationGallery[index + 1].ratio : undefined,
    })),
  ]),
  ...Array.from({ length: 3 }, (_, index) => ({ id: `ecommerce.${index + 1}`, label: `电商页面图片 ${index + 1}`, category: '电商页面', src: null })),
  ...Array.from({ length: 6 }, (_, index) => ({ id: `drawing.${index + 1}`, label: `手绘作品 ${index + 1}`, category: '手绘探索', src: null })),
];

export const defaultTexts = Object.fromEntries(textFields.map(([id, , , value]) => [id, value]));
export const defaultImages = Object.fromEntries(imageFields.map(({ id, src, ratio }) => [id, src ? { src, ratio } : null]));
export const cmsGroups = [...new Set(textFields.map(([, , group]) => group))];
