import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ExternalLink, ImagePlus, Save, Search, Trash2, Upload, X } from 'lucide-react';
import ButtonGlow from '../components/ButtonGlow.jsx';
import { useCms } from './CmsContext.jsx';
import { cmsGroups, imageFields, textFields } from './siteSchema.js';
import './admin.css';

function currentImageValue(field, imageValues) {
  if (!Object.prototype.hasOwnProperty.call(imageValues, field.id)) return field.src;
  const value = imageValues[field.id];
  if (!value) return null;
  return typeof value === 'string' ? value : value.src || field.src;
}

function imageRatio(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { resolve(image.naturalWidth / image.naturalHeight || 1); URL.revokeObjectURL(url); };
    image.onerror = () => { resolve(1); URL.revokeObjectURL(url); };
    image.src = url;
  });
}

export default function AdminPanel() {
  const { content, loading, save } = useCms();
  const [draftTexts, setDraftTexts] = useState({});
  const [draftImages, setDraftImages] = useState({});
  const [draftRatios, setDraftRatios] = useState({});
  const [draftExtraImages, setDraftExtraImages] = useState([]);
  const [activeView, setActiveView] = useState('文案管理');
  const [activeGroup, setActiveGroup] = useState(cmsGroups[0]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (loading) return;
    setDraftTexts(content.texts || {});
    setDraftImages(content.images || {});
    setDraftRatios(content.ratios || {});
    setDraftExtraImages(content.extraImages || []);
  }, [content, loading]);

  const allImageFields = useMemo(() => [...imageFields, ...draftExtraImages], [draftExtraImages]);
  const imageCategories = useMemo(() => [...new Set(allImageFields.map((field) => field.category))], [allImageFields]);
  const sections = useMemo(() => activeView === '文案管理'
    ? cmsGroups.map((name) => ({ name, entries: textFields.filter(([, , group]) => group === name) }))
    : imageCategories.map((name) => ({ name, entries: allImageFields.filter((field) => field.category === name) })), [activeView, imageCategories, allImageFields]);

  const filteredSections = sections.map((section) => ({
    ...section,
    entries: section.entries.filter((entry) => {
      const label = activeView === '文案管理' ? entry[1] : entry.label;
      const id = activeView === '文案管理' ? entry[0] : entry.id;
      return (!search || `${label} ${id}`.toLowerCase().includes(search.toLowerCase())) && (search || section.name === activeGroup);
    }),
  })).filter((section) => section.entries.length);

  const setText = (id, value) => setDraftTexts((current) => ({ ...current, [id]: value }));

  const upload = async (field, file, silent = false) => {
    if (!file) return false;
    if (!file.type.startsWith('image/')) {
      if (!silent) setNotice({ type: 'error', text: `「${field.label}」请选择图片文件。` });
      return false;
    }
    if (file.size > 80 * 1024 * 1024) {
      if (!silent) setNotice({ type: 'error', text: `「${field.label}」超过 80 MB 上传上限。` });
      return false;
    }
    setUploading(field.id);
    if (!silent) setNotice(null);
    try {
      const form = new FormData();
      form.append('file', file, file.name);
      const response = await fetch('/api/cms/upload', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '图片上传失败。');
      const ratio = await imageRatio(file);
      setDraftImages((current) => ({ ...current, [field.id]: result.src }));
      setDraftRatios((current) => ({ ...current, [field.id]: ratio }));
      if (!silent) setNotice({ type: 'success', text: `已上传「${field.label}」，保存后会更新到作品集。` });
      return true;
    } catch (error) {
      if (!silent) setNotice({ type: 'error', text: error.message || '图片上传失败，请检查本地管理服务。' });
      return false;
    } finally {
      setUploading(null);
    }
  };

  const uploadMany = async (category, files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    setBulkUploading(true);
    setNotice(null);
    let uploaded = 0;
    let appendedUploaded = 0;
    for (const file of selectedFiles) {
      const id = `extra.${window.crypto.randomUUID()}`;
      const label = file.name.replace(/\.[^.]+$/, '') || `追加图片 ${draftExtraImages.length + appendedUploaded + 1}`;
      const field = { id, label, category, src: null, isExtra: true };
      if (await upload(field, file, true)) {
        uploaded += 1;
        appendedUploaded += 1;
        setDraftExtraImages((current) => [...current, { id: field.id, label: field.label, category: field.category }]);
      }
    }
    const failed = selectedFiles.length - uploaded;
    setNotice({ type: failed ? 'error' : 'success', text: `已追加到「${category}」模块 ${appendedUploaded} 张${failed ? `；${failed} 张失败` : ''}。保存后会出现在轮播/作品展示末尾。` });
    setBulkUploading(false);
  };

  const saveAll = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const next = { texts: draftTexts, images: draftImages, ratios: draftRatios, extraImages: draftExtraImages };
      await save(next);
      const used = new Set(Object.values(draftImages).filter((value) => typeof value === 'string' && value.startsWith('/uploads/')));
      const oldUploads = Object.values(content.images || {}).filter((value) => typeof value === 'string' && value.startsWith('/uploads/'));
      await Promise.all([...new Set(oldUploads)].filter((src) => !used.has(src)).map((src) => fetch(`/api/cms/upload?src=${encodeURIComponent(src)}`, { method: 'DELETE' })));
      setNotice({ type: 'success', text: '修改已保存，作品集页面已更新。' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || '保存失败，请稍后重试。' });
    } finally {
      setSaving(false);
    }
  };

  const removeImage = (field) => {
    if (field.isExtra || field.id.startsWith('extra.')) setDraftExtraImages((current) => current.filter((entry) => entry.id !== field.id));
    setDraftImages((current) => ({ ...current, [field.id]: null }));
    setDraftRatios((current) => {
      const next = { ...current };
      delete next[field.id];
      return next;
    });
    setNotice({ type: 'success', text: `「${field.label}」将从页面移除，点击保存后生效。` });
  };

  const changed = JSON.stringify([draftTexts, draftImages, draftRatios, draftExtraImages]) !== JSON.stringify([content.texts || {}, content.images || {}, content.ratios || {}, content.extraImages || []]);

  return (
    <main className="cms-admin">
      <header className="cms-header">
        <a className="cms-brand" href="/portfolio#top"><span className="cms-brand-icon">CZ</span><span>CHALON ZHOU<small>PORTFOLIO CMS</small></span></a>
        <div className="cms-header-actions">
          <a className="cms-back-link" href="/portfolio#top"><ArrowLeft size={16} /> 返回作品集</a>
          <ButtonGlow className="cms-save-glow"><button className="cms-save" type="button" onClick={saveAll} disabled={!changed || saving || loading}><Save size={16} />{saving ? '保存中…' : '保存所有修改'}</button></ButtonGlow>
        </div>
      </header>

      <section className="cms-welcome">
        <div><span className="cms-kicker"><i /> LOCAL CONTENT STUDIO</span><h1>内容管理</h1><p>集中维护作品集中的文案、项目图片与个人资料。所有修改保存在当前项目文件中。</p></div>
        <div className="cms-welcome-meta"><span>TEXT FIELDS <b>{textFields.length}</b></span><span>IMAGE SLOTS <b>{imageFields.length + draftExtraImages.length}</b></span></div>
      </section>

      <div className="cms-toolbar">
        <div className="cms-view-switch" role="tablist" aria-label="管理类型">
          {['文案管理', '图片管理'].map((view) => <button key={view} type="button" role="tab" aria-selected={activeView === view} className={activeView === view ? 'is-active' : ''} onClick={() => { setActiveView(view); setActiveGroup(view === '文案管理' ? cmsGroups[0] : imageCategories[0]); }}>{view}<span>{view === '文案管理' ? textFields.length : imageFields.length + draftExtraImages.length}</span></button>)}
        </div>
        <label className="cms-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={activeView === '文案管理' ? '搜索文案字段' : '搜索图片名称'} /><button type="button" aria-label="清空搜索" onClick={() => setSearch('')}><X size={14} /></button></label>
      </div>

      <div className="cms-layout">
        <aside className="cms-sidebar">
          <span className="cms-sidebar-label">内容分区</span>
          {sections.map((section) => <button key={section.name} type="button" className={activeGroup === section.name && !search ? 'is-active' : ''} onClick={() => { setSearch(''); setActiveGroup(section.name); }}><span>{section.name}</span><small>{section.entries.length.toString().padStart(2, '0')}</small></button>)}
          <div className="cms-storage-note"><span>本地保存</span><p>文案写入项目数据文件；上传图片保存在 public/uploads，可随项目一起备份。</p></div>
        </aside>

        <section className="cms-content" aria-live="polite">
          {loading ? <div className="cms-empty">正在读取管理数据…</div> : filteredSections.length ? filteredSections.map((section) => (
            <section className="cms-group" key={section.name}>
              <div className="cms-group-heading"><div><span>CONTENT GROUP</span><h2>{section.name}</h2></div><div className="cms-group-actions">{activeView === '图片管理' && <label className={`cms-bulk-upload${bulkUploading ? ' is-disabled' : ''}`}><Upload size={14} />{bulkUploading ? '上传中…' : '追加到模块'}<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" multiple disabled={bulkUploading} onChange={(event) => { if (event.target.files?.length) uploadMany(section.name, event.target.files); event.target.value = ''; }} /></label>}<small>{section.entries.length.toString().padStart(2, '0')} ITEMS</small></div></div>
              {activeView === '文案管理' ? <div className="cms-fields">
                {section.entries.map(([id, label, , fallback]) => <label className="cms-field" key={id}>
                  <span>{label}<small>{id}</small></span>
                  {String(draftTexts[id] ?? fallback).length > 72 ? <textarea rows={3} value={draftTexts[id] ?? fallback} onChange={(event) => setText(id, event.target.value)} /> : <input value={draftTexts[id] ?? fallback} onChange={(event) => setText(id, event.target.value)} />}
                </label>)}
              </div> : <div className="cms-assets-grid">
                {section.entries.map((field) => {
                  const src = currentImageValue(field, draftImages);
                  const isUploading = uploading === field.id;
                  return <article className={`cms-asset-card${!src ? ' is-empty' : ''}`} key={field.id}>
                    <div className="cms-asset-preview">{src ? <img src={src} alt={field.label} loading="lazy" /> : <div className="cms-asset-placeholder"><ImagePlus size={21} /><span>尚未添加图片</span></div>}
                      {isUploading && <span className="cms-uploading">上传中…</span>}
                      <span className="cms-asset-index">{field.id}</span>
                    </div>
                    <div className="cms-asset-info"><strong title={field.label}>{field.label}</strong><span>{src ? (src.startsWith('/uploads/') ? '自定义图片' : '默认素材') : '空图片位'}</span></div>
                    <div className="cms-asset-actions"><label className="cms-upload-button"><Upload size={14} />{src ? '替换' : '上传'}<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" onChange={(event) => { upload(field, event.target.files?.[0]); event.target.value = ''; }} disabled={Boolean(uploading) || bulkUploading} /></label>
                      {src && <button type="button" className="cms-delete-button" onClick={() => removeImage(field)} title="从作品集移除此图片"><Trash2 size={14} />移除</button>}
                    </div>
                  </article>;
                })}
              </div>}
            </section>
          )) : <div className="cms-empty">没有找到匹配内容。</div>}
          <div className="cms-bottom-note"><Check size={15} /><span>保存后作品集将读取新内容。图片移除仅影响对应展示位置，项目原始素材不会被覆盖。</span><a href="/portfolio#top" target="_blank" rel="noreferrer">查看页面 <ExternalLink size={13} /></a></div>
        </section>
      </div>

      {notice && <div className={`cms-toast ${notice.type === 'error' ? 'is-error' : ''}`} role="status"><span>{notice.type === 'error' ? <X size={16} /> : <Check size={16} />}</span>{notice.text}<button type="button" onClick={() => setNotice(null)} aria-label="关闭提示"><X size={15} /></button></div>}
      <footer className="cms-footer"><span>CHALON ZHOU · PORTFOLIO MANAGEMENT</span><span>本地管理后台 · 请保留项目中的图片与文案数据文件</span></footer>
    </main>
  );
}
