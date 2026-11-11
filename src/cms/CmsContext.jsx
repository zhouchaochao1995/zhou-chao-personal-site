import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CmsContext = createContext(null);

async function readContent() {
  try {
    const response = await fetch('/api/cms/content');
    if (!response.ok) return {};
    return await response.json();
  } catch {
    return {};
  }
}

export function CmsProvider({ children }) {
  const [content, setContent] = useState({ texts: {}, images: {}, ratios: {}, extraImages: [] });
  const [loading, setLoading] = useState(true);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    let mounted = true;
    readContent().then((stored) => {
      if (mounted) setContent({ texts: stored.texts || {}, images: stored.images || {}, ratios: stored.ratios || {}, extraImages: stored.extraImages || [] });
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const text = useCallback((id, fallback) => {
    const value = content.texts[id];
    return typeof value === 'string' ? value : fallback;
  }, [content.texts]);

  const image = useCallback((id, fallback = null) => {
    if (!Object.prototype.hasOwnProperty.call(content.images, id)) return fallback;
    const value = content.images[id];
    if (value === null || value === '') return null;
    if (typeof value === 'string') return value;
    return value?.src || fallback;
  }, [content.images]);

  const ratio = useCallback((id, fallback = 1) => Number(content.ratios[id]) || fallback, [content.ratios]);

  const extra = useCallback((category) => (content.extraImages || [])
    .filter((entry) => entry.category === category)
    .map((entry) => ({ ...entry, src: image(entry.id, null), ratio: ratio(entry.id, entry.ratio || 1) }))
    .filter((entry) => entry.src), [content.extraImages, image, ratio]);

  const save = useCallback(async (nextContent) => {
    const response = await fetch('/api/cms/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextContent),
    });
    if (!response.ok) throw new Error('内容保存失败，请确认本地管理服务正在运行。');
    const saved = await response.json();
    setContent({ texts: saved.texts || {}, images: saved.images || {}, ratios: saved.ratios || {}, extraImages: saved.extraImages || [] });
    setSavedAt(new Date());
    return saved;
  }, []);

  const value = useMemo(() => ({ content, loading, savedAt, text, image, ratio, extra, save }), [content, loading, savedAt, text, image, ratio, extra, save]);
  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const value = useContext(CmsContext);
  if (!value) throw new Error('useCms must be used inside CmsProvider');
  return value;
}
