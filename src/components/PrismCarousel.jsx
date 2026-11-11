import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ButtonGlow from './ButtonGlow.jsx';
import './PrismCarousel.css';

/**
 * A lightweight, locally implemented prism coverflow for the VI archive.
 * It keeps the supplied image ratio intact and renders only the nearby cards.
 */
export default function PrismCarousel({
  items = [],
  aspect = 16 / 9,
  onSelect,
  className = '',
  ariaLabel = '品牌视觉作品轮播',
  statusLabel = 'ANSMEN · VI SYSTEM',
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStart = useRef(null);
  const dragged = useRef(false);
  const count = items.length;

  const move = (offset) => {
    if (!count) return;
    setActiveIndex((current) => (current + offset + count) % count);
  };

  const visibleItems = items
    .map((item, index) => {
      let offset = (index - activeIndex + count) % count;
      if (offset > count / 2) offset -= count;
      return { item, index, offset };
    })
    .filter(({ offset }) => Math.abs(offset) <= 2)
    .sort((a, b) => Math.abs(b.offset) - Math.abs(a.offset));

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'Home') { event.preventDefault(); setActiveIndex(0); }
    if (event.key === 'End') { event.preventDefault(); setActiveIndex(count - 1); }
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragStart.current = { x: event.clientX, y: event.clientY };
    dragged.current = false;
  };

  const handlePointerUp = (event) => {
    if (!dragStart.current) return;
    const deltaX = event.clientX - dragStart.current.x;
    const deltaY = event.clientY - dragStart.current.y;
    dragStart.current = null;
    if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
      dragged.current = true;
      move(deltaX < 0 ? 1 : -1);
      window.setTimeout(() => { dragged.current = false; }, 0);
    }
  };

  if (!count) return null;

  return (
    <div className={`prism-carousel ${className}`} style={{ '--prism-aspect': aspect }}>
      <div
        className="prism-stage"
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { dragStart.current = null; }}
      >
        <div className="prism-halo" aria-hidden="true" />
        <div className="prism-card-track">
          {visibleItems.map(({ item, index, offset }) => {
            const distance = Math.abs(offset);
            const scale = [1, 0.82, 0.66][distance];
            const rotate = offset * -5;
            return (
              <ButtonGlow
                className={`prism-card${offset === 0 ? ' is-active' : ''}`}
                key={`${item.src}-${index}`}
                style={{
                  transform: `translate3d(${offset * 72}%, 0, 0) scale(${scale}) rotateY(${rotate}deg)`,
                  zIndex: 10 - distance,
                  opacity: distance === 2 ? 0.48 : distance === 1 ? 0.78 : 1,
                  filter: distance === 0 ? undefined : `blur(${distance === 1 ? 2 : 4}px) saturate(${distance === 1 ? .78 : .66})`,
                  '--sweep-key': activeIndex,
                }}
              >
                <button
                  className="prism-card-control"
                  type="button"
                  aria-label={`放大查看第 ${index + 1} 张品牌视觉作品`}
                  aria-current={offset === 0 ? 'true' : undefined}
                  onClick={() => {
                    if (dragged.current) return;
                    setActiveIndex(index);
                    onSelect?.(item, index);
                  }}
                >
                <span className="prism-card-frame" style={{ aspectRatio: '16 / 9' }}>
                  <img src={item.src} alt={item.alt || ''} draggable="false" loading="lazy" decoding="async" />
                  {offset === 0 && <span className="prism-spectrum" key={activeIndex} aria-hidden="true" />}
                  <span className="prism-card-glint" aria-hidden="true" />
                </span>
                </button>
              </ButtonGlow>
            );
          })}
        </div>
        {count > 1 && <>
          <ButtonGlow className="prism-control prism-control-previous"><button className="prism-control-button" type="button" onClick={() => move(-1)} aria-label="上一张"><ChevronLeft size={23} /></button></ButtonGlow>
          <ButtonGlow className="prism-control prism-control-next"><button className="prism-control-button" type="button" onClick={() => move(1)} aria-label="下一张"><ChevronRight size={23} /></button></ButtonGlow>
        </>}
      </div>
      <div className="prism-status" aria-live="polite" aria-atomic="true">
        <span><strong>{String(activeIndex + 1).padStart(2, '0')}</strong><i>/</i>{String(count).padStart(2, '0')}</span>
        <span className="prism-progress"><i style={{ transform: `scaleX(${(activeIndex + 1) / count})` }} /></span>
        <span className="prism-status-label">{statusLabel}</span>
      </div>
    </div>
  );
}
