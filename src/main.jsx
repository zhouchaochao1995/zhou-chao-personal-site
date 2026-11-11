import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  MoveUpRight,
  X,
} from 'lucide-react';
import PrismCarousel from './components/PrismCarousel.jsx';
import ConcaveCarousel from './components/ConcaveCarousel.jsx';
import C4DMasonryGallery from './components/C4DMasonryGallery.jsx';
import ModelComparison from './components/ModelComparison.jsx';
import ButtonGlow from './components/ButtonGlow.jsx';
const AIGCVideoGallery = lazy(() => import('./components/AIGCVideoGallery.jsx'));
const AIGCLogoGallery = lazy(() => import('./components/AIGCLogoGallery.jsx'));
const AIGCFontGallery = lazy(() => import('./components/AIGCFontGallery.jsx'));
const AIGCIllustrationGallery = lazy(() => import('./components/AIGCIllustrationGallery.jsx'));
const IPCharacterGallery = lazy(() => import('./components/IPCharacterGallery.jsx'));
import c4dGallery from './data/c4dGallery.json';
import { illustrationGallery } from './data/illustrationGallery.js';
import { fontGenerationGallery } from './data/fontGenerationGallery.js';
import { aigcCategories } from './data/aigcCategories.js';
import { CmsProvider, useCms } from './cms/CmsContext.jsx';
import AdminPanel from './cms/AdminPanel.jsx';
import './styles.css';

const omittedC4DGalleryFiles = new Set([
  'product-032.jpg', 'product-093.jpg', 'product-094.jpg',
  'product-095.jpg', 'product-096.jpg', 'product-097.jpg', 'product-098.jpg', 'product-099.jpg',
  'product-101.jpg', 'product-102.jpg', 'product-103.jpg', 'product-104.jpg', 'product-105.jpg',
  'product-106.jpg', 'product-107.jpg', 'product-108.jpg', 'product-109.jpg', 'product-110.jpg', 'product-111.jpg',
]);

const FlipCard = lazy(() => import('./components/FlipCard.jsx'));

const projects = [
  {
    number: '01',
    category: 'AIGC / EVENT VISUAL',
    title: '十载同行，共赴星海',
    subtitle: '安诗曼十周年主视觉与延展物料',
    image: '/images/expo-kv.jpg',
    imageClass: 'project-image-wide',
    year: '2026',
    tags: ['主视觉', 'AI 视觉探索', '活动延展'],
    description: '以流动光轨重构数字「10」，将十年同行、奔赴星海的主题转化为克制而有张力的科技视觉。由主 KV 延展至展板、邀请函与现场物料，保持不同触点之间的统一识别。',
  },
  {
    number: '02',
    category: 'BRAND SYSTEM',
    title: '让专业，被一致地看见',
    subtitle: '安诗曼品牌视觉升级',
    image: '/images/brand-book.jpg',
    imageClass: 'project-image-square',
    year: '2024—2026',
    tags: ['品牌识别', '视觉规范', '应用延展'],
    description: '围绕精密、稳定、可靠的品牌气质，梳理标志、色彩、字体与影像方向，并延展至日常办公、产品展示与市场传播场景，让分散的物料回到同一套视觉秩序。',
  },
  {
    number: '03',
    category: '3D / PRODUCT RENDER',
    title: '把产品细节，变成可信的质感',
    subtitle: '工业设备建模与产品表现',
    image: '/images/product-render.jpg',
    imageClass: 'project-image-square',
    year: '2021—2026',
    tags: ['C4D 建模', '材质灯光', '产品渲染'],
    description: '根据产品资料与结构尺寸建立和维护三维模型，结合产品特性搭建场景、调整材质与灯光，输出可用于画册、官网、电商和开发沟通的多角度视觉素材。',
  },
  {
    number: '04',
    category: 'AI CHARACTER / VISUAL WORLD',
    title: '把角色，放进一个完整世界',
    subtitle: '原创 IP 与 AIGC 场景探索',
    image: '/images/ai-world.jpg',
    imageClass: 'project-image-wide',
    year: '2026',
    tags: ['IP 设定', 'AI 场景生成', '视觉延展'],
    description: '从角色特征与品牌语境出发，建立可持续延展的 IP 视觉方向，再将角色放入完整的场景叙事中，探索表情、动作与文创应用的更多可能。',
  },
  {
    number: '05',
    category: 'E-COMMERCE / ART DIRECTION',
    title: '让功能卖点，变得一眼可读',
    subtitle: '产品详情与电商视觉设计',
    image: '/images/commerce-detail.jpg',
    imageClass: 'project-image-square',
    year: '2021—2026',
    tags: ['详情页', '卖点梳理', '3D 视觉'],
    description: '围绕不同产品与目标人群整理内容优先级，用产品渲染、场景表达和信息图解组织页面节奏，让功能、数据与使用情境之间的关系更清楚。',
  },
];

const experience = [
  ['2021.10 — 2026.09', '深圳市安诗曼科技有限公司', '品牌视觉 · 产品建模与渲染 · AIGC'],
  ['2020.08 — 2021.06', '惠州兰驰家居有限公司', '电商视觉 · 产品与招商手册 · 展会物料'],
  ['2019.09 — 2020.06', '杭州合麦文化发展有限公司', '店铺视觉 · 活动页面 · 产品详情'],
  ['2017.05 — 2019.07', '杭州花季贸易 / 杭州昕伦贸易', '电商页面 · 平面视觉 · 日常运营协作'],
];

function usePortfolioMotion(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let cancelled = false;
    let context = null;
    let refreshFrame = 0;
    let refreshOnLoad = null;

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapModule, triggerModule]) => {
      if (cancelled) return;
      const { gsap } = gsapModule;
      const { ScrollTrigger } = triggerModule;
      gsap.registerPlugin(ScrollTrigger);
      context = gsap.context(() => {
      const heroTitle = root.querySelector('.hero-title-mask h1');
      const heroLines = root.querySelectorAll('.portfolio-hero-bottom p > span');
      const heroButton = root.querySelector('.hero-explore-button');
      const heroNav = root.querySelector('.portfolio-nav');
      const opening = gsap.timeline({ defaults: { ease: 'power4.out' } });

      if (heroNav) opening.fromTo(heroNav, { y: -18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 });
      if (heroTitle) opening.fromTo(heroTitle,
        { yPercent: 118, scaleX: 1.055, scaleY: 0.72, autoAlpha: 0, transformOrigin: '50% 100%' },
        { yPercent: 0, scaleX: 1, scaleY: 1, autoAlpha: 1, duration: 1.45, ease: 'power4.out', clearProps: 'transform,opacity' },
        '-=0.36');
      if (heroLines.length) opening.fromTo(heroLines,
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.95, stagger: 0.12, clearProps: 'transform,opacity' },
        '-=0.78');
      if (heroButton) opening.fromTo(heroButton,
        { y: 25, scale: 0.94, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.85, clearProps: 'transform,opacity' },
        '-=0.48');
      const revealTitle = (element, options = {}) => gsap.fromTo(element,
        { y: 74, x: -42, scaleY: 0.78, autoAlpha: 0, transformOrigin: 'left bottom' },
        {
          y: 0, x: 0, scaleY: 1, autoAlpha: 1,
          duration: 1.25, ease: 'power4.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: element, start: options.start || 'top 86%', once: true },
        });

      root.querySelectorAll('.work-section-heading .work-section-main h3, .about-copy h2, .approach-top h2, .contact-content h2').forEach(revealTitle);
      root.querySelectorAll('.work-section-heading').forEach((heading) => {
        const meta = heading.querySelector('.work-section-meta');
        if (!meta) return;
        gsap.fromTo(meta, { x: 38, autoAlpha: 0 }, {
          x: 0, autoAlpha: 1, duration: 0.9, delay: 0.16, ease: 'power3.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: heading, start: 'top 86%', once: true },
        });
      });

      root.querySelectorAll('.about-section > .section-heading, .approach-section > .section-heading, .contact-content > .eyebrow').forEach((label) => {
        gsap.fromTo(label, { x: -24, autoAlpha: 0 }, {
          x: 0, autoAlpha: 1, duration: 0.85, ease: 'power3.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: label, start: 'top 92%', once: true },
        });
      });

      const aboutGrid = root.querySelector('.about-grid');
      const portrait = root.querySelector('.portrait-wrap');
      const aboutCard = root.querySelector('.about-copy-glow');
      if (portrait) gsap.fromTo(portrait,
        { x: -76, y: 42, rotateY: -8, scale: 0.94, autoAlpha: 0, transformOrigin: 'left center' },
        { x: 0, y: 0, rotateY: 0, scale: 1, autoAlpha: 1, duration: 1.3, ease: 'power4.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: aboutGrid || portrait, start: 'top 82%', once: true } });
      if (aboutCard) gsap.fromTo(aboutCard,
        { x: 82, y: 38, scale: 0.96, autoAlpha: 0 },
        { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 1.25, ease: 'power4.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: aboutGrid || aboutCard, start: 'top 82%', once: true } });

      const experienceBlock = root.querySelector('.experience-glow');
      if (experienceBlock) {
        const experienceRows = experienceBlock.querySelectorAll('.experience-item');
        const experienceTimeline = gsap.timeline({ scrollTrigger: { trigger: experienceBlock, start: 'top 84%', once: true } });
        experienceTimeline.fromTo(experienceBlock, { y: 46, scale: 0.98, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.95, ease: 'power3.out', clearProps: 'transform,opacity' });
        if (experienceRows.length) experienceTimeline.fromTo(experienceRows,
          { x: 26, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.72, stagger: 0.11, ease: 'power3.out', clearProps: 'transform,opacity' },
          '-=0.42');
      }

      const visualGroups = root.querySelectorAll('.work-category > .vi-carousel, .work-category > .gallery-row, .work-category > .image-slot-feature, .work-category > .image-mosaic, .approach-cards');
      visualGroups.forEach((group) => {
        if (group.matches('.vi-carousel')) {
          gsap.fromTo(group, { autoAlpha: 0 }, {
            autoAlpha: 1,
            duration: 0.85,
            ease: 'power2.out',
            clearProps: 'opacity',
            scrollTrigger: { trigger: group, start: 'top 84%', once: true },
          });
          return;
        }
        const selector = group.matches('.approach-cards') ? '.approach-card-glow' : '.image-slot-glow, .mosaic-cell-glow';
        const cards = group.querySelectorAll(selector);
        if (!cards.length) return;
        gsap.fromTo(cards,
          { y: 68, scale: 0.94, autoAlpha: 0 },
          {
            y: 0, scale: 1, autoAlpha: 1,
            duration: 1.18, stagger: { each: 0.12, from: 'start' }, ease: 'power4.out', clearProps: 'transform,opacity',
            scrollTrigger: { trigger: group, start: 'top 84%', once: true },
          });
      });

      const contactCopy = root.querySelector('.contact-content');
      if (contactCopy) {
        const details = contactCopy.querySelectorAll(':scope > p, :scope > .contact-button');
        gsap.fromTo(details, { y: 30, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.82, stagger: 0.13, ease: 'power3.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: contactCopy, start: 'top 78%', once: true },
        });
      }
      }, root);

      refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      refreshOnLoad = () => ScrollTrigger.refresh();
      window.addEventListener('load', refreshOnLoad, { once: true });
    }).catch(() => {});

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(refreshFrame);
      if (refreshOnLoad) window.removeEventListener('load', refreshOnLoad);
      context?.revert();
    };
  }, [rootRef]);
}

function DeferredHeroVideo({ className, src, poster }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia('(max-width: 680px), (prefers-reduced-motion: reduce)').matches) return undefined;

    let cancelled = false;
    let idleId = 0;
    let timeoutId = 0;
    const startVideo = () => {
      if (cancelled || video.src || document.visibilityState === 'hidden') return;
      video.src = src;
      video.load();
      video.play().catch(() => {});
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') startVideo();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(startVideo, { timeout: 900 });
    else timeoutId = window.setTimeout(startVideo, 350);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (idleId && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleId);
      window.clearTimeout(timeoutId);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [src]);

  return <video ref={videoRef} className={className} autoPlay muted loop playsInline preload="none" poster={poster} aria-hidden="true" />;
}

function Eyebrow({ children, light = false }) {
  return <div className={`eyebrow${light ? ' eyebrow-light' : ''}`}><span className="eyebrow-dot" />{children}</div>;
}

function Landing() {
  return (
    <main className="landing-page">
      <DeferredHeroVideo className="landing-video" src="/hero-loop.mp4" poster="/images/hero-texture.jpg" />
      <div className="landing-grain" />
      <header className="landing-header">
        <a href="/" className="brand-mark" aria-label="周超作品集首页"><ButtonGlow className="brand-monogram-glow"><span className="brand-monogram">CZ</span></ButtonGlow><span>CHALON ZHOU<span className="brand-sub">VISUAL DESIGNER</span></span></a>
        <div className="landing-header-right"><span className="available"><i />PORTFOLIO · 2017—2026</span><ButtonGlow className="header-enter-glow"><a className="header-enter" href="/portfolio">进入作品集 <ArrowUpRight size={15} /></a></ButtonGlow></div>
      </header>
      <section className="landing-main">
        <div className="landing-kicker"><span>01 / 02</span><span>AI VISUAL DESIGNER</span></div>
        <h1 className="landing-title"><span>让想象</span><span className="landing-title-second">成为<span className="title-accent">可见</span>。</span></h1>
        <div className="landing-bottom">
          <p>以设计为底，以 AI 为新的表达工具。<br />让品牌、产品与想法，拥有更准确的视觉语言。</p>
          <a className="enter-button" href="/portfolio"><span className="enter-button-icon"><ArrowDownRight size={20} /></span><span>探索完整作品集<small>EXPLORE SELECTED WORKS</small></span></a>
        </div>
      </section>
      <div className="landing-side-note">BRAND SYSTEMS <b>·</b> 3D PRODUCT <b>·</b> GENERATIVE IMAGE</div>
      <footer className="landing-footer"><span>CHALON ZHOU — PERSONAL PORTFOLIO</span><span>DESIGN × TECHNOLOGY × IMAGINATION</span></footer>
    </main>
  );
}

function PortfolioNav() {
  const { text, image } = useCms();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 40);
  useEffect(() => {
    let frame = 0;
    let lastScrolled = window.scrollY > 40;
    const updateScrolled = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const nextScrolled = window.scrollY > 40;
        if (nextScrolled === lastScrolled) return;
        lastScrolled = nextScrolled;
        setScrolled(nextScrolled);
      });
    };
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrolled);
      window.cancelAnimationFrame(frame);
    };
  }, []);
  const close = () => setOpen(false);
  return (
    <header className={`portfolio-nav${scrolled ? ' is-floating' : ''}`}>
      <a href="#top" className="nav-brand" aria-label="回到页面顶部" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        {image('brand.logo', '/images/vision-mark.png') && <span className="nav-logo-mark"><img src={image('brand.logo', '/images/vision-mark.png')} alt="" /></span>}
        <span>{text('nav.brandName', 'VISION DESIGN')}</span>
      </a>
      <button className="mobile-menu-button" onClick={() => setOpen(!open)} aria-label={open ? '关闭导航' : '打开导航'} aria-expanded={open}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      <nav className={open ? 'nav-links nav-links-open' : 'nav-links'} aria-label="主导航">
        <a href="#brand-vi" onClick={close}>{text('nav.brandVi', '品牌VI')}</a>
        <a href="#offline-materials" onClick={close}>{text('nav.offline', '线下物料')}</a>
        <a href="#aigc" onClick={close}>{text('nav.aigc', 'AIGC应用')}</a>
        <a href="#ecommerce" onClick={close}>{text('nav.ecommerce', '电商页面')}</a>
      </nav>
    </header>
  );
}

function ProjectCard({ project, onSelect }) {
  return (
    <ButtonGlow className={`project-card-glow ${project.imageClass}`}><button className="project-card" onClick={() => onSelect(project)} aria-label={`查看项目：${project.title}`}>
      <span className="project-art"><img src={project.image} alt={project.subtitle} loading="lazy" /><span className="project-open"><ArrowUpRight size={20} /></span><span className="project-image-shade" /></span>
      <span className="project-card-meta"><span>{project.number} / {project.category}</span><span>{project.year}</span></span>
      <span className="project-card-title-row"><span><strong>{project.title}</strong><small>{project.subtitle}</small></span><ArrowRight className="project-arrow" size={19} /></span>
    </button></ButtonGlow>
  );
}

function ProjectDialog({ project, onClose }) {
  useEffect(() => {
    if (!project) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('dialog-open');
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('dialog-open'); };
  }, [project, onClose]);
  if (!project) return null;
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <ButtonGlow className="project-dialog-glow"><section className="project-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <ButtonGlow className="dialog-close-glow"><button className="dialog-close" onClick={onClose} aria-label="关闭项目详情"><X size={19} /></button></ButtonGlow>
        <div className={`dialog-image${project.number === '01' ? ' dialog-image-contain' : ''}`}><img src={project.image} alt="" /></div>
        <div className="dialog-content"><Eyebrow>{project.number} / {project.category}</Eyebrow><h2 id="dialog-title">{project.title}</h2><p className="dialog-subtitle">{project.subtitle}</p><p className="dialog-description">{project.description}</p><div className="dialog-tags">{project.tags.map((tag) => <ButtonGlow className="dialog-tag-glow" key={tag}><span>{tag}</span></ButtonGlow>)}</div><div className="dialog-year">PROJECT PERIOD <strong>{project.year}</strong></div></div>
      </section></ButtonGlow>
    </div>
  );
}

function About() {
  const { text, image, extra } = useCms();
  const profileExtras = extra('个人资料');
  const cartoonPortrait = image('portrait.cartoon', '/images/profile-cartoon.webp');
  const photoPortrait = image('portrait.photo', '/images/profile-front.webp');
  const portraitRef = useRef(null);
  const [portraitReady, setPortraitReady] = useState(false);
  useEffect(() => {
    const portrait = portraitRef.current;
    if (!portrait) return undefined;
    if (!('IntersectionObserver' in window)) {
      setPortraitReady(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setPortraitReady(true);
      observer.disconnect();
    }, { rootMargin: '220px 0px' });
    observer.observe(portrait);
    return () => observer.disconnect();
  }, []);
  return (
    <section id="about" className="section about-section">
      <div className="about-grid">
        <div className="portrait-wrap" ref={portraitRef}>
          {portraitReady ? <Suspense fallback={<ButtonGlow className="portrait-face-glow" style={{ '--card-bg': 'transparent' }}>{cartoonPortrait ? <img className="portrait-poster" src={cartoonPortrait} alt="周超卡通肖像" /> : <span className="portrait-empty">图片待上传</span>}</ButtonGlow>}><FlipCard
            className="flip-card--portrait"
            front={<ButtonGlow className="portrait-face-glow" style={{ '--card-bg': 'transparent' }}>{cartoonPortrait ? <img src={cartoonPortrait} alt="周超卡通肖像" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 24%' }} /> : <span className="portrait-empty">图片待上传</span>}</ButtonGlow>}
            back={<ButtonGlow className="portrait-face-glow" style={{ '--card-bg': 'transparent' }}>{photoPortrait ? <img src={photoPortrait} alt="周超个人肖像" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 24%' }} /> : <span className="portrait-empty">图片待上传</span>}</ButtonGlow>}
            axis="y"
            flipOnClick
            draggable
            dragDistance={0}
            tilt
            tiltMax={12}
            glare
            glareOpacity={0.22}
            hoverScale={1.03}
            perspective={1100}
            stiffness={170}
            damping={20}
            width={450}
            height={500}
            radius={22}
            background="transparent"
            color="#f5f5f5"
            shadow
            shadowColor="#000000"
            shadowOpacity={0.45}
            ariaLabel="周超肖像卡片，点击翻转查看卡通照"
          /></Suspense> : cartoonPortrait ? <img className="portrait-poster" src={cartoonPortrait} alt="周超卡通肖像" /> : <span className="portrait-empty">图片待上传</span>}
        </div>
        <ButtonGlow className="about-copy-glow" style={{ '--card-bg': 'var(--profile-card-surface, #050605)' }}><div className="about-copy"><h2>{text('about.greeting', '你好，我是')}<span>{text('about.name', '周超。')}</span><br />{text('about.role', '一名视觉设计师。')}</h2><div className="about-description"><p className="about-lead">{text('about.lead', '9 年设计经验，持续工作在品牌、产品与商业视觉的交汇处。')}</p><p>{text('about.bio', '我喜欢从问题本身开始：先厘清品牌要表达什么、观众需要看见什么，再找到适合的视觉方式。熟悉品牌视觉与平面设计，也能独立完成产品建模、渲染和后期合成；现在把 AI 纳入日常创作，用它拓展可能，再用设计判断与人工精修把结果收回来。')}</p></div><div className="stat-row"><div className="stat-group stat-group-start"><div className="stat-value"><strong>{text('about.years', '09')}<span>年</span></strong><small>{text('about.yearsLabel', '视觉设计经验')}</small></div><span className="stat-divider" aria-hidden="true" /></div><div className="stat-group stat-group-middle"><strong>{text('about.startYear', '2017')}<span>—</span>{text('about.endYear', '2026')}</strong><small>{text('about.spanLabel', '创作与工作跨度')}</small></div><div className="stat-group stat-group-end"><span className="stat-divider" aria-hidden="true" /><div className="stat-value"><strong>{text('about.focusCount', '04')}</strong><small>{text('about.focusLabel', '核心方向')}</small></div></div></div><div className="about-tags">{[1, 2, 3, 4].map((index) => <span className="profile-tag" key={index}>{text(`about.skill${index}`, ['品牌视觉', '3D 建模 / 渲染', 'AIGC', '电商设计'][index - 1])}</span>)}</div></div></ButtonGlow>
      </div>
      <ButtonGlow className="experience-glow" style={{ '--card-bg': 'var(--profile-card-surface, #050605)' }}><div className="experience-block"><div className="experience-heading"><Eyebrow>{text('about.experienceEyebrow', 'EXPERIENCE')}</Eyebrow><span>{text('about.experienceNote', '经历不是标签，是方法的来源。')}</span></div><div className="experience-list">{experience.map(([, company, role], index) => <div className="experience-item" key={text(`experience.${index + 1}.company`, company)}><span>{text(`experience.${index + 1}.date`, experience[index][0])}</span><strong>{text(`experience.${index + 1}.company`, company)}</strong><small>{text(`experience.${index + 1}.role`, role)}</small><ArrowUpRight size={15} /></div>)}</div></div></ButtonGlow>
      {profileExtras.length > 0 && <ImageMosaic images={profileExtras.map((entry) => entry.src)} columns={3} ratio={1.48} className="profile-extra-mosaic" label="个人资料追加图片" />}
    </section>
  );
}

function ImageSlot({ number, title, note, ratio = 1.35, feature = false, src, alt = title, imageId, autoScroll = false, scrollOnHover = false, pauseOnHover = false, scrollPaused = false, onScrollHoverChange, scrollDurationMultiplier = 1 }) {
  const { image } = useCms();
  const resolvedSrc = imageId ? image(imageId, src) : src;
  const [imageRatio, setImageRatio] = useState(null);
  const [verticalScrollDuration, setVerticalScrollDuration] = useState(null);
  const [autoScrollReadySrc, setAutoScrollReadySrc] = useState(null);
  const artRef = useRef(null);
  const frameRatio = imageRatio || ratio;
  useEffect(() => {
    if (!autoScroll || !resolvedSrc || autoScrollReadySrc !== resolvedSrc) {
      setVerticalScrollDuration(null);
      return undefined;
    }

    const art = artRef.current;
    if (!art) return undefined;
    const measure = () => {
      const img = art.querySelector('img');
      if (!img?.naturalWidth || !art.clientWidth || !art.clientHeight) return;
      const renderedImageHeight = art.clientWidth * img.naturalHeight / img.naturalWidth;
      if (renderedImageHeight <= art.clientHeight + 8) {
        setVerticalScrollDuration(null);
        return;
      }
      setVerticalScrollDuration(Math.max(18, Math.min(80, renderedImageHeight / 55)) * scrollDurationMultiplier);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(art);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [autoScroll, resolvedSrc, autoScrollReadySrc, scrollDurationMultiplier]);

  return (
    <figure className={`image-slot${feature ? ' image-slot-feature' : ''}${resolvedSrc ? ' image-slot-has-image' : ''}`} style={{ '--frame-ratio': frameRatio }}>
      <ButtonGlow className={`image-slot-glow${feature ? ' image-slot-glow-feature' : ''}`} style={{ aspectRatio: frameRatio }}><div ref={artRef} className={`image-slot-art${autoScroll ? ' image-slot-art-auto-scroll' : ''}${scrollOnHover ? ' image-slot-art-scroll-on-hover' : ''}${pauseOnHover ? ' image-slot-art-pause-on-hover' : ''}`} role={resolvedSrc ? undefined : 'img'} aria-label={resolvedSrc ? undefined : `${title}图片预留位置`} onMouseEnter={scrollOnHover ? () => onScrollHoverChange?.(true) : undefined} onMouseLeave={scrollOnHover ? () => onScrollHoverChange?.(false) : undefined}>
        {resolvedSrc ? (autoScroll && verticalScrollDuration ? <div className="slot-vertical-marquee" aria-label={`${alt}自动纵向循环展示`}>
          <div className="slot-vertical-track" style={{ '--vertical-scroll-duration': `${verticalScrollDuration}s`, animationPlayState: scrollPaused ? 'paused' : undefined }}>
            <img className="slot-vertical-image" src={resolvedSrc} alt={alt} loading="lazy" draggable="false" />
            <img className="slot-vertical-image" src={resolvedSrc} alt="" aria-hidden="true" loading="lazy" draggable="false" />
          </div>
        </div> : <img className="slot-image" src={resolvedSrc} alt={alt} loading="lazy" onLoad={(event) => {
          if (autoScroll) setAutoScrollReadySrc(resolvedSrc);
          else setImageRatio(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight);
        }} />) : <>
          <span className="slot-index">IMAGE / {number}</span>
          <span className="slot-cross">＋</span>
          <span className="slot-label">{title}<small>图片预留位置</small></span>
          <span className="slot-corner slot-corner-a" /><span className="slot-corner slot-corner-b" />
        </>}
      </div></ButtonGlow>
      <figcaption><span>{number}</span><strong>{title}</strong><small>{note}</small></figcaption>
    </figure>
  );
}

function GalleryRow({ items, size = 'standard', label, id }) {
  return (
    <div id={id} className={`gallery-row gallery-row-${size}`} role="group" aria-label={label}>
      {items.map((item) => <ImageSlot key={item.number} {...item} />)}
    </div>
  );
}

function ImageMosaic({ count = 0, images = [], imageIds = [], columns, ratio = 1.6, className = '', label, itemLabel = '作品', preserveAspect = false, fullWidthFirst = false }) {
  const { image } = useCms();
  const items = [...imageIds.map((id) => image(id, null)), ...images];
  if (!items.length) items.push(...Array.from({ length: count }, () => null));
  return (
    <div className={`image-mosaic ${className}`} style={{ '--mosaic-columns': columns, '--mosaic-ratio': ratio }} role="group" aria-label={label}>
      {items.map((image, index) => {
        const preserveItemAspect = preserveAspect && (!fullWidthFirst || index === 0);
        const isFullWidth = fullWidthFirst && index === 0;
        return <ButtonGlow className={`mosaic-cell-glow${isFullWidth ? ' mosaic-cell-glow-full-width' : ''}`} key={index} style={preserveItemAspect ? undefined : { aspectRatio: ratio }}><div className={`image-mosaic-cell${preserveItemAspect ? ' image-mosaic-cell-preserve-ratio' : ''}`} role="img" aria-label={image ? `${itemLabel} ${index + 1}` : `第 ${index + 1} 个图片预留位置`}>{image && <img src={image} alt="" aria-hidden="true" loading="lazy" />}</div></ButtonGlow>;
      })}
    </div>
  );
}

function VIImageLightbox({ images, activeIndex, onClose, onStep, label = '品牌视觉大图预览' }) {
  const closeButtonRef = React.useRef(null);
  const wasOpenRef = React.useRef(false);
  const image = activeIndex == null ? null : images[activeIndex];
  const [displayImage, setDisplayImage] = useState(null);
  const [incomingImage, setIncomingImage] = useState(null);
  const [isCrossfading, setIsCrossfading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let staged = false;
    let frame = 0;
    let finish = 0;

    if (activeIndex == null || !image) {
      wasOpenRef.current = false;
      setDisplayImage(null);
      setIncomingImage(null);
      setIsCrossfading(false);
      return () => {};
    }

    if (!wasOpenRef.current) {
      wasOpenRef.current = true;
      setDisplayImage(image);
      setIncomingImage(null);
      setIsCrossfading(false);
      return () => {};
    }

    if (image.src === displayImage?.src) {
      setIncomingImage(null);
      setIsCrossfading(false);
      return () => {};
    }

    setIncomingImage(null);
    setIsCrossfading(false);
    const preloader = new window.Image();
    const stageIncomingImage = () => {
      if (cancelled || staged) return;
      staged = true;
      setIncomingImage(image);
      frame = window.requestAnimationFrame(() => {
        if (cancelled) return;
        setIsCrossfading(true);
        finish = window.setTimeout(() => {
          if (cancelled) return;
          setDisplayImage(image);
          setIncomingImage(null);
          setIsCrossfading(false);
        }, 680);
      });
    };
    const stageAfterDecode = async () => {
      try {
        if (typeof preloader.decode === 'function') await preloader.decode();
      } catch {
        // Keep the transition usable if the browser cannot decode this format.
      }
      stageIncomingImage();
    };
    preloader.onload = stageAfterDecode;
    preloader.onerror = stageIncomingImage;
    preloader.src = image.src;
    if (preloader.complete) {
      if (preloader.naturalWidth) stageAfterDecode();
      else stageIncomingImage();
    }

    return () => {
      cancelled = true;
      preloader.onload = null;
      preloader.onerror = null;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(finish);
    };
  }, [activeIndex, image?.src, displayImage?.src]);

  useEffect(() => {
    if (activeIndex == null || !image) return undefined;
    const previousFocus = document.activeElement;
    const bodyWasLocked = document.body.classList.contains('dialog-open');
    document.body.classList.add('dialog-open');
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); onStep(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); onStep(1); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (!bodyWasLocked) document.body.classList.remove('dialog-open');
      previousFocus?.focus?.();
    };
  }, [activeIndex, image, onClose, onStep]);

  if (activeIndex == null || !image) return null;
  const currentImage = displayImage || image;
  const incomingIsSelected = incomingImage?.src === image.src;
  const crossfadingSelectedImage = incomingIsSelected && isCrossfading;
  const lightboxImages = [
    currentImage && { image: currentImage, layer: 'current', fading: crossfadingSelectedImage },
    incomingIsSelected && { image: incomingImage, layer: 'next', fading: crossfadingSelectedImage },
  ].filter(Boolean);
  return (
    <div className="vi-lightbox-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <ButtonGlow className="vi-lightbox-glow"><section className="vi-lightbox" role="dialog" aria-modal="true" aria-label={label}>
        {lightboxImages.map(({ image: frameImage, layer, fading }) => <img key={frameImage.src} className={`vi-lightbox-image vi-lightbox-image-${layer}${fading ? ' is-crossfading' : ''}`} src={frameImage.src} alt={frameImage.alt} />)}
      <ButtonGlow className="vi-lightbox-close"><button ref={closeButtonRef} className="vi-lightbox-control" type="button" onClick={onClose} aria-label="关闭图片预览"><X size={21} /></button></ButtonGlow>
        <ButtonGlow className="vi-lightbox-step vi-lightbox-previous"><button className="vi-lightbox-control" type="button" onClick={() => onStep(-1)} aria-label="查看上一张"><ChevronLeft size={25} /></button></ButtonGlow>
        <ButtonGlow className="vi-lightbox-step vi-lightbox-next"><button className="vi-lightbox-control" type="button" onClick={() => onStep(1)} aria-label="查看下一张"><ChevronRight size={25} /></button></ButtonGlow>
      </section></ButtonGlow>
    </div>
  );
}

function WorkSectionHeading({ number, title, subtitle, right }) {
  const { text } = useCms();
  const sectionId = Number(number);
  return (
    <div className="work-section-heading">
      <div className="work-section-main"><h3>{text(`section.${sectionId}.title`, title)}</h3><p>{text(`section.${sectionId}.subtitle`, subtitle)}</p></div>
      <div className="work-section-meta"><span className="work-section-number">{number} / SELECTED DISCIPLINE</span><span className="work-section-aside">{text(`section.${sectionId}.right`, right)}</span></div>
    </div>
  );
}

function Projects() {
  const { content, text, image, ratio, extra } = useCms();
  const navExtras = extra('导航与首屏');
  const brandVisualImages = [
    ...Array.from({ length: 36 }, (_, index) => {
      const number = index + 1;
      const extension = [8, 9, 10, 11, 22, 29].includes(number) ? 'webp' : 'jpg';
      const filename = String(number).padStart(2, '0');
      const preferredSrc = `/images/ansmen-vi/${filename}.${extension}`;
      const savedSrc = image(`vi.${String(number).padStart(3, '0')}`, preferredSrc);
      const src = extension === 'webp' && savedSrc?.endsWith(`/images/ansmen-vi/${filename}.jpg`)
        ? savedSrc.replace(/\.jpg$/i, '.webp')
        : savedSrc;
      return {
        src,
        alt: `安诗曼品牌视觉应用图片 ${filename}`,
      };
    }).filter((item) => item.src),
    ...extra('品牌 VI').map((entry) => ({ src: entry.src, alt: entry.label })),
  ];
  const [activeVIIndex, setActiveVIIndex] = useState(null);
  const [activePrintIndex, setActivePrintIndex] = useState(null);
  const [activeC4DIndex, setActiveC4DIndex] = useState(null);
  const [activeIllustrationIndex, setActiveIllustrationIndex] = useState(null);
  const [activeAigcCategoryKey, setActiveAigcCategoryKey] = useState(aigcCategories[0].key);
  const [ecomHoverActive, setEcomHoverActive] = useState(false);
  const closeVILightbox = useCallback(() => setActiveVIIndex(null), []);
  const stepVILightbox = useCallback((offset) => {
    setActiveVIIndex((current) => current == null ? current : (current + offset + brandVisualImages.length) % brandVisualImages.length);
  }, [brandVisualImages.length]);
  const viLightboxImages = brandVisualImages;
  const viCarouselItems = brandVisualImages;
  const c4dItems = c4dGallery.flatMap((item, index) => {
    if (omittedC4DGalleryFiles.has(item.src.split('/').at(-1))) return [];
    const id = `c4d.${String(index + 1).padStart(3, '0')}`;
    const src = image(id, item.src);
    return src ? [{ ...item, src, ratio: ratio(id, item.ratio) }] : [];
  }).concat(extra('C4D 产品建模').map((entry) => ({ src: entry.src, alt: entry.label, ratio: entry.ratio })));
  const c4dLightboxImages = c4dItems.map(({ src, alt }) => ({ src, alt }));
  const modelComparisonItems = [
    { title: '恒温恒湿机 · 正面', beforeId: 'c4d.compare.1.before', afterId: 'c4d.compare.1.after', beforeSrc: '/images/white-model-comparison/12kw-before.webp', afterSrc: '/images/white-model-comparison/12kw-final.webp' },
    { title: '恒温恒湿机 · 外机', beforeId: 'c4d.compare.2.before', afterId: 'c4d.compare.2.after', beforeSrc: '/images/white-model-comparison/12kw-outdoor-before.webp', afterSrc: '/images/white-model-comparison/12kw-outdoor-final.webp' },
    { title: '外贸 C60 · 可折叠扶手', beforeId: 'c4d.compare.3.before', afterId: 'c4d.compare.3.after', beforeSrc: '/images/white-model-comparison/c60-before.webp', afterSrc: '/images/white-model-comparison/c60-final.webp' },
  ].map(({ title, beforeId, afterId, beforeSrc, afterSrc }) => ({ title, beforeSrc: image(beforeId, beforeSrc), afterSrc: image(afterId, afterSrc) }));
  const closeC4DLightbox = useCallback(() => setActiveC4DIndex(null), []);
  const stepC4DLightbox = useCallback((offset) => {
    setActiveC4DIndex((current) => current == null ? current : (current + offset + c4dLightboxImages.length) % c4dLightboxImages.length);
  }, [c4dLightboxImages.length]);
  const offlineDefaults = [
    ['品牌手册', '品牌视觉规范与应用', 1.15, '/images/offline-materials/22222.webp'], ['产品目录', '结构清晰的产品信息', 1.18, '/images/offline-materials/33333.webp'], ['画册装帧', '纸张、色彩与工艺', 1.2, '/images/offline-materials/11111.webp'],
    ['产品画册封面', '产品画册主视觉', 4 / 3, '/images/offline-materials/01-cover.webp'], ['产品画册跨页', '画册阅读与版式展示', 4 / 3, '/images/offline-materials/02-brochure-spread.webp'], ['折页展示', '折页展开与立体呈现', 4 / 3, '/images/offline-materials/03-foldout-mockup.webp'],
    ['产品目录细节', '目录页面与产品信息', 1.5, '/images/offline-materials/04-catalog-detail.webp'], ['折页内页', '原理说明与品牌信息', 7512 / 3437, '/images/offline-materials/05-foldout-back.webp'], ['产品系列折页', '系列产品信息与应用场景', 7512 / 3437, '/images/offline-materials/06-foldout-products.webp'],
    ['英文产品目录', '产品参数与型号系统', 7512 / 3437, '/images/offline-materials/07-template-products.webp'], ['系统方案目录', '工业设备应用与方案呈现', 7512 / 3437, '/images/offline-materials/08-template-system.webp'],
  ];
  const offlineItems = offlineDefaults.map(([title, note, defaultRatio, defaultSrc], index) => {
    const id = `offline.${String(index + 1).padStart(3, '0')}`;
    return { number: `02.${String(index + 1).padStart(2, '0')}`, title, note, alt: title, imageId: id, src: image(id, defaultSrc), ratio: ratio(id, defaultRatio) };
  });
  const printRowOne = offlineItems.slice(0, 3);
  const printRowTwo = offlineItems.slice(3).concat(extra('线下物料').map((entry, index) => ({ number: `02.${String(12 + index).padStart(2, '0')}`, title: entry.label, note: '', alt: entry.label, src: entry.src, ratio: entry.ratio })));
  const printLightboxItems = printRowTwo.filter((item) => item.src).map((item) => ({ src: item.src, alt: item.alt || item.title }));
  const closePrintLightbox = useCallback(() => setActivePrintIndex(null), []);
  const stepPrintLightbox = useCallback((offset) => {
    setActivePrintIndex((current) => current == null || !printLightboxItems.length ? current : (current + offset + printLightboxItems.length) % printLightboxItems.length);
  }, [printLightboxItems.length]);
  const openPrintLightbox = useCallback((item) => {
    const index = printLightboxItems.findIndex((image) => image.src === item.src);
    if (index >= 0) setActivePrintIndex(index);
  }, [printLightboxItems]);
  const ecomPendingExtras = [...extra('电商页面')];
  const ecomRow = [
    ['首屏视觉', '先呈现产品价值', 0.58], ['功能拆解', '让复杂卖点更易读', 0.64], ['场景表达', '将产品放进使用情境', 0.58],
  ].map(([title, note, itemRatio], index) => {
    const imageId = `ecommerce.${index + 1}`;
    const hasFixedImageSetting = Object.prototype.hasOwnProperty.call(content.images || {}, imageId);
    const firstAvailableExtra = !hasFixedImageSetting ? ecomPendingExtras.shift() : null;
    return {
      number: `05.0${index + 1}`,
      title: text(`ecommerce.slot${index + 1}`, title),
      note: text(`ecommerce.slot${index + 1}Note`, note),
      ratio: itemRatio,
      imageId,
      src: hasFixedImageSetting ? image(imageId, null) : firstAvailableExtra?.src || null,
      autoScroll: true,
      scrollOnHover: index > 0,
      pauseOnHover: index === 0,
      scrollPaused: index === 0 && ecomHoverActive,
      onScrollHoverChange: index > 0 ? setEcomHoverActive : undefined,
      scrollDurationMultiplier: 2,
    };
  }).concat(ecomPendingExtras.map((entry, index) => ({
      number: `05.${String(index + 4).padStart(2, '0')}`,
      title: entry.label,
      note: '',
      // Extra-long detail-page images still need a usable carousel card width;
      // their full intrinsic aspect ratio is handled by the vertical marquee.
      ratio: entry.ratio < 0.25 ? 0.58 : entry.ratio,
      src: entry.src,
      autoScroll: true,
      scrollDurationMultiplier: 2,
    })));
  const drawingExtras = extra('手绘探索');
  const illustrationItems = [
    { id: 'aigc.illustration.feature', src: image('aigc.illustration.feature', null), alt: '插画主视觉' },
    ...illustrationGallery.map((item) => ({ ...item, src: image(item.id, item.src) })),
    ...extra('插画').map((entry) => ({ id: entry.id, src: entry.src, alt: entry.label })),
  ].filter((item) => item.src);
  const closeIllustrationLightbox = useCallback(() => setActiveIllustrationIndex(null), []);
  const stepIllustrationLightbox = useCallback((offset) => {
    setActiveIllustrationIndex((current) => current == null || !illustrationItems.length ? current : (current + offset + illustrationItems.length) % illustrationItems.length);
  }, [illustrationItems.length]);
  const activeAigcCategory = aigcCategories.find(({ key }) => key === activeAigcCategoryKey) || aigcCategories[0];
  const activeAigcExtras = extra(activeAigcCategory.label);
  const legacyAigcExtras = activeAigcCategory.key === 'activity-kv' ? extra('AIGC 应用') : [];
  const fontGenerationWorks = activeAigcCategory.key === 'font-generation'
    ? [
      ...fontGenerationGallery.map((item) => ({ ...item, src: image(item.id, item.src) })),
      ...activeAigcExtras.map((entry) => ({ id: entry.id, src: entry.src, alt: entry.label, ratio: entry.ratio })),
    ]
    : [];
  const aigcGalleryItems = [
    ...Array.from({ length: 6 }, (_, index) => ({
      number: `04.${String(index + 1).padStart(2, '0')}`,
      title: `${activeAigcCategory.label}图片 ${String(index + 1).padStart(2, '0')}`,
      note: '',
      ratio: [1.7, 0.6, 1.8, 2.3, 0.6, 1.1][index],
      imageId: `${activeAigcCategory.galleryPrefix}.${index + 1}`,
    })),
    ...[...legacyAigcExtras, ...activeAigcExtras].map((entry, index) => ({
      number: `04.${String(index + 7).padStart(2, '0')}`,
      title: entry.label,
      note: '',
      ratio: entry.ratio,
      src: entry.src,
    })),
  ];
  const activeAigcCarouselItems = [
    { src: image(activeAigcCategory.featureId, null), alt: `${activeAigcCategory.label}主视觉` },
    ...Array.from({ length: 6 }, (_, index) => ({
      src: image(`${activeAigcCategory.galleryPrefix}.${index + 1}`, null),
      alt: `${activeAigcCategory.label}作品 ${String(index + 1).padStart(2, '0')}`,
    })),
    ...[...legacyAigcExtras, ...activeAigcExtras].map((entry) => ({ src: entry.src, alt: entry.label })),
  ].filter((item) => item.src);
  return (
    <section id="projects" className="section works-archive">
      <div className="section-heading" aria-hidden="true"><Eyebrow>{text('projects.eyebrow', 'SELECTED WORKS')}</Eyebrow><span className="section-index">{text('projects.index', '02 — VISUAL ARCHIVE')}</span></div>
      <div className="projects-intro" aria-hidden="true"><h2>{text('projects.introTitle1', '让每一种能力，')}<br /><span>{text('projects.introTitle2', '都找到清晰的位置。')}</span></h2><p>{text('projects.introBody1', '从品牌系统到三维产品，从商业页面到 AIGC 视觉探索。')}<br />{text('projects.introBody2', '先理解内容，再为它选择合适的视觉表达。')}</p></div>

      <section className="work-category" id="brand-vi" aria-label="品牌 VI 视觉作品">
        <WorkSectionHeading number="01" title="品牌视觉系统升级" subtitle="从品牌识别到应用触点，建立稳定、清晰、可持续延展的视觉秩序。" right="BRAND / VISUAL SYSTEM" />
        <PrismCarousel
          items={viCarouselItems}
          aspect={16 / 9}
          className="vi-carousel"
          ariaLabel={`安诗曼品牌视觉作品，共 ${viCarouselItems.length} 张`}
          onSelect={(_, index) => setActiveVIIndex(index)}
        />
        <VIImageLightbox images={viLightboxImages} activeIndex={activeVIIndex} onClose={closeVILightbox} onStep={stepVILightbox} />
      </section>

      <section className="work-category work-category-offline" aria-label="线下物料作品">
        <WorkSectionHeading number="02" title="线下物料" subtitle="画册、折页与展会资料，让内容在真实的阅读和使用场景中保持一致。" right="PRINT / BRAND COLLATERAL" />
        <GalleryRow id="product-brochure" items={printRowOne} label="产品画册图片预留区" />
        <ConcaveCarousel
          id="offline-materials"
          items={printRowTwo}
          className="offline-concave-carousel"
          ariaLabel="线下物料作品，图片等高并按原始比例调整宽度"
          onSelect={openPrintLightbox}
        />
        <VIImageLightbox images={printLightboxItems} activeIndex={activePrintIndex} onClose={closePrintLightbox} onStep={stepPrintLightbox} label="线下物料大图预览" />
      </section>

      <section className="work-category" id="c4d-modeling" aria-label="C4D 产品建模与渲染作品">
        <WorkSectionHeading number="03" title="C4D 产品建模" subtitle="结构、材质、灯光与镜头协同工作，把产品细节转化成可信的视觉呈现。" right="3D / PRODUCT RENDER" />
        <ModelComparison items={modelComparisonItems} />
        <C4DMasonryGallery items={c4dItems} onSelect={setActiveC4DIndex} ariaLabel="C4D 产品建模与渲染作品" />
        <VIImageLightbox images={c4dLightboxImages} activeIndex={activeC4DIndex} onClose={closeC4DLightbox} onStep={stepC4DLightbox} label="C4D 产品建模与渲染大图预览" />
      </section>

      <section className="work-category" id="aigc" aria-label="AIGC 视觉探索作品">
        <WorkSectionHeading number="04" title="AIGC 视觉探索" subtitle="用生成探索更多方向，再由设计判断收敛画面、统一细节并完成落地。" right="AIGC / IMAGE MAKING" />
        <div className="aigc-category-tabs" role="tablist" aria-label="AIGC 作品类别">
          {aigcCategories.map((category) => <button
            key={category.key}
            id={`aigc-tab-${category.key}`}
            type="button"
            role="tab"
            aria-selected={activeAigcCategoryKey === category.key}
            aria-controls="aigc-category-panel"
            className={`aigc-category-tab${activeAigcCategoryKey === category.key ? ' is-active' : ''}`}
            onClick={() => setActiveAigcCategoryKey(category.key)}
          >{category.label}{activeAigcCategoryKey === category.key && <ArrowDownRight size={16} strokeWidth={2.2} aria-hidden="true" />}</button>)}
        </div>
        <div
          id="aigc-category-panel"
          className="aigc-category-panel"
          role="tabpanel"
          aria-labelledby={`aigc-tab-${activeAigcCategory.key}`}
          key={activeAigcCategory.key}
        >
          <Suspense fallback={<div className="aigc-category-loading" aria-hidden="true" />}>
            {activeAigcCategory.key === 'activity-kv' ? (activeAigcCarouselItems.length > 0
              ? <PrismCarousel items={activeAigcCarouselItems} aspect={16 / 9} className="aigc-activity-carousel" ariaLabel="活动 KV 作品轮播" statusLabel="AIGC · 活动 KV" />
              : <ImageSlot number="04.01" title="活动KV主视觉" note="" ratio={16 / 9} feature imageId={activeAigcCategory.featureId} />)
              : activeAigcCategory.key === 'conference-kv' ? <AIGCVideoGallery />
              : activeAigcCategory.key === 'logo-design' ? <AIGCLogoGallery />
              : activeAigcCategory.key === 'ip-image' ? <IPCharacterGallery />
              : activeAigcCategory.key === 'font-generation' ? <>
                <ImageSlot number="04.01" title="字体生成主视觉" note="" ratio={fontGenerationWorks[0]?.ratio || 2.32} feature src={fontGenerationWorks[0]?.src} imageId={activeAigcCategory.featureId} />
                <AIGCFontGallery items={fontGenerationWorks.slice(1)} />
              </>
              : activeAigcCategory.key === 'illustration' ? <>
                <AIGCIllustrationGallery items={illustrationItems} onSelect={setActiveIllustrationIndex} />
                <VIImageLightbox images={illustrationItems} activeIndex={activeIllustrationIndex} onClose={closeIllustrationLightbox} onStep={stepIllustrationLightbox} label="插画作品大图预览" />
              </>
              : <>
                <ImageSlot number="04.01" title={`${activeAigcCategory.label}主视觉`} note="" ratio={2.32} feature imageId={activeAigcCategory.featureId} />
                <GalleryRow items={aigcGalleryItems} size="compact" label={`${activeAigcCategory.label}作品图片`} />
              </>}
          </Suspense>
        </div>
      </section>

      <section className="work-category" id="ecommerce" aria-label="电商页面设计作品">
        <WorkSectionHeading number="05" title="电商页面" subtitle="围绕购买决策组织内容顺序，清楚呈现产品功能、使用场景与关键卖点。" right="ECOMMERCE / CONTENT DESIGN" />
        <GalleryRow items={ecomRow} size="tall" label="电商页面图片预留区" />
      </section>

      <section className="work-category" aria-label="手绘与个人探索作品">
        <WorkSectionHeading number="06" title="手绘与视觉探索" subtitle="留给观察、练习与灵感的空间，也记录尚未被定义的方向。" right="SKETCHBOOK / EXPLORATION" />
        <ImageMosaic imageIds={Array.from({ length: 6 }, (_, index) => `drawing.${index + 1}`)} images={drawingExtras.map((entry) => entry.src)} columns={3} ratio={1} className="drawing-mosaic" label="手绘作品图片网格" itemLabel="手绘作品" preserveAspect fullWidthFirst />
      </section>
    </section>
  );
}

function Approach() {
  const { text } = useCms();
  const cards = [
    { n: '01', title: text('approach.card1.title', '先厘清问题'), body: text('approach.card1.body', '从品牌定位、用户场景与传播目标出发，整理信息优先级，让创意有清楚的方向。'), tags: text('approach.card1.tags', '梳理 · 定义 · 聚焦') },
    { n: '02', title: text('approach.card2.title', '让视觉落地'), body: text('approach.card2.body', '连接平面、三维与内容表达，兼顾视觉质感、信息清晰度与实际应用场景。'), tags: text('approach.card2.tags', '品牌 · 产品 · 场景') },
    { n: '03', title: text('approach.card3.title', '把 AI 用在合适的地方'), body: text('approach.card3.body', '用 AI 加速灵感探索与素材生成，再通过人工判断、精修和规范化，保证最终结果可信、统一。'), tags: text('approach.card3.tags', '探索 · 精修 · 统一') },
  ];
  return (
    <section id="approach" className="section approach-section">
      <div className="section-heading"><Eyebrow>{text('approach.eyebrow', 'HOW I WORK')}</Eyebrow><span className="section-index">{text('approach.index', '03 — APPROACH')}</span></div>
      <div className="approach-top"><h2>{text('approach.title1', '好的视觉，')}<br />来自<span>{text('approach.title2', '清晰的判断。')}</span></h2><p>{text('approach.body1', '设计工具会变，解决问题的路径更重要。')}<br />{text('approach.body2', '我的工作方式，是在想法与落地之间建立可靠连接。')}</p></div>
      <div className="approach-cards">{cards.map((card) => <ButtonGlow className="approach-card-glow" key={card.n}><article className="approach-card"><span className="approach-number">{card.n}</span><div className="approach-graphic"><i /><i /><i /><i /><b /></div><h3>{card.title}</h3><p>{card.body}</p><span className="approach-tags">{card.tags}</span></article></ButtonGlow>)}</div>
      <div className="tool-strip"><span>{text('approach.toolsLabel', 'TOOLS IN PRACTICE')}</span><div>{[1, 2, 3, 4, 5].map((index) => <b key={index}>{text(`approach.tool${index}`, ['PHOTOSHOP', 'ILLUSTRATOR', 'CINEMA 4D', 'COMFYUI', 'CHATGPT'][index - 1])}</b>)}</div></div>
    </section>
  );
}

function Contact() {
  const { text } = useCms();
  const [contactVisible, setContactVisible] = useState(false);
  return (
    <section id="contact" className="contact-section">
      <div className="contact-orbit orbit-one" /><div className="contact-orbit orbit-two" /><div className="contact-gridline" />
      <div className="contact-content"><Eyebrow light>{text('contact.eyebrow', 'LET’S MAKE SOMETHING MEANINGFUL')}</Eyebrow><h2>{text('contact.title1', '有好的想法，')}<br /><span>{text('contact.title2', '值得被认真看见。')}</span></h2><p>{text('contact.body1', '品牌视觉、产品表达，或正在探索的 AI 创意。')}<br />{text('contact.body2', '欢迎带着一个具体的问题，开启下一段对话。')}</p><button className="contact-button" type="button" aria-expanded={contactVisible} aria-controls="contact-details" onClick={() => setContactVisible((visible) => !visible)}>{contactVisible ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}{contactVisible ? '收起联系方式' : text('contact.button', '联系我吧')}</button>{contactVisible && <div className="contact-details" id="contact-details" aria-live="polite"><figure className="contact-qr-card"><img src="/uploads/wechat-contact-qr.jpg" alt="微信联系二维码" loading="lazy" /><figcaption>微信扫码添加</figcaption></figure><div className="contact-phone"><span>电话 / PHONE</span><a href="tel:13216196619">13216196619</a></div></div>}</div>
      <div className="contact-bottom"><span>{text('contact.signature', 'CHALON ZHOU — VISUAL DESIGNER')}</span><a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{text('footer.backToTop', '回到顶部')} <ArrowRight size={14} /></a></div>
    </section>
  );
}

function Portfolio() {
  const { text, extra } = useCms();
  const navExtras = extra('导航与首屏');
  const portfolioRef = useRef(null);
  usePortfolioMotion(portfolioRef);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <main id="top" className="portfolio-page" ref={portfolioRef}>
      <PortfolioNav />
      <section className="portfolio-hero">
        <DeferredHeroVideo className="portfolio-hero-video" src="/videos/hero-background.mp4" poster="/images/hero-texture.jpg" />
        <div className="hero-backdrop" aria-hidden="true" />
        <div className="portfolio-hero-grain" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-main">
            <div className="hero-title-mask"><h1 data-text={text('hero.title', 'CHALON ZHOU DESIGN')}>{text('hero.title', 'CHALON ZHOU DESIGN')}</h1></div>
            <div className="portfolio-hero-bottom">
              <p><span>{text('hero.line1', '品牌 × 三维 × AIGC')}</span><span>{text('hero.line2', '把复杂的想法转译成清晰、准确、可落地的视觉。')}</span></p>
              <a href="#about" className="scroll-cue hero-explore-button">{text('hero.button', '开始探索')} <ArrowDownRight size={20} /></a>
            </div>
          </div>
        </div>
      </section>
      {navExtras.length > 0 && <ImageMosaic images={navExtras.map((entry) => entry.src)} columns={3} ratio={1.6} className="nav-extra-mosaic" label="首屏追加图片" />}
      <About />
      <Projects />
      <Approach />
      <Contact />
      <footer className="site-footer"><span>{text('footer.signature', '© CHALON ZHOU 2026')}</span><span>{text('footer.copyright', '独立创作的视觉方案与版式版权归周超所有；项目相关品牌及产品素材版权归对应品牌方。')}</span><a href="/admin" className="admin-entry">内容管理</a><a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{text('footer.backToTop', '回到顶部')} <MoveUpRight size={14} /></a></footer>
    </main>
  );
}

function App() {
  return <CmsProvider>{window.location.pathname.startsWith('/admin') ? <AdminPanel /> : <Portfolio />}</CmsProvider>;
}

createRoot(document.getElementById('root')).render(<App />);
