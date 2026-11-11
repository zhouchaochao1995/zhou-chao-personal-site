import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './SkewedCarousel.css';

const scales = [1, 0.82, 0.66, 0.54, 0.46];

function wrapIndex(index, count) {
  return ((index % count) + count) % count;
}

/** Responsive, image-ratio-aware front-facing carousel for the C4D gallery. */
export default function SkewedCarousel({ items = [], onSelect, ariaLabel = 'C4D 产品作品轮播' }) {
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const draggedRef = useRef(false);
  const activeRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const count = items.length;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const measure = () => setStageSize({ width: stage.clientWidth, height: stage.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const moveTo = (nextIndex) => {
    if (!count) return;
    const next = wrapIndex(nextIndex, count);
    activeRef.current = next;
    setActiveIndex(next);
  };
  const move = (delta) => moveTo(activeRef.current + delta);

  const layout = useMemo(() => {
    if (!count || !stageSize.width || !stageSize.height) return [];
    const cardHeight = Math.min(560, Math.max(240, stageSize.height * (stageSize.width < 700 ? 0.74 : 0.76)));
    const widths = items.map((item) => cardHeight * Math.max(0.42, item.ratio || 1));
    const centerX = stageSize.width / 2;
    const maxVisibleOffset = stageSize.width < 700 ? 2 : 4;

    return items.map((item, index) => {
      let offset = wrapIndex(index - activeIndex + count, count);
      if (offset > count / 2) offset -= count;
      const steps = Math.abs(offset);
      const direction = Math.sign(offset);
      if (steps > maxVisibleOffset) return null;

      let distance = 0;
      for (let step = 0; step < steps; step += 1) {
        const previousIndex = wrapIndex(activeIndex + direction * step, count);
        const nextIndex = wrapIndex(activeIndex + direction * (step + 1), count);
        const previousScale = scales[Math.min(step, scales.length - 1)];
        const nextScale = scales[Math.min(step + 1, scales.length - 1)];
        const previousWidth = widths[previousIndex] * previousScale;
        const nextWidth = widths[nextIndex] * nextScale;
        const overlap = Math.min(stageSize.width < 700 ? 24 : 76, Math.min(previousWidth, nextWidth) * 0.16);
        const gap = stageSize.width < 700 ? 8 : 18;
        distance += previousWidth / 2 + nextWidth / 2 + gap - overlap;
      }

      const scale = scales[Math.min(steps, scales.length - 1)];
      const shade = steps === 0 ? 0 : steps === 1 ? 0.4 : steps === 2 ? 0.68 : 0.92;
      return {
        item,
        index,
        offset,
        style: {
          '--skew-card-width': `${widths[index]}px`,
          '--skew-card-height': `${cardHeight}px`,
          '--skew-card-scale': scale,
          '--skew-card-radius': `${30 / scale}px`,
          '--skew-card-blur': `${steps === 0 ? 0 : Math.min(steps * 1.1, 3.3)}px`,
          '--skew-card-shade': shade,
          left: '50%',
          zIndex: 100 - steps,
          transform: `translate3d(calc(-50% + ${direction * distance}px), -50%, 0) scale(${scale})`,
        },
      };
    }).filter(Boolean);
  }, [activeIndex, count, items, stageSize]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'Home') { event.preventDefault(); moveTo(0); }
    if (event.key === 'End') { event.preventDefault(); moveTo(count - 1); }
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = { x: event.clientX, y: event.clientY };
    draggedRef.current = false;
  };

  const handlePointerUp = (event) => {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    dragRef.current = null;
    if (Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      draggedRef.current = true;
      move(dx < 0 ? 1 : -1);
      window.setTimeout(() => { draggedRef.current = false; }, 100);
    }
  };

  if (!count) return null;
  return (
    <div className="skewed-carousel">
      <div
        ref={stageRef}
        className="skewed-carousel-stage"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${ariaLabel}，共 ${count} 张`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { dragRef.current = null; }}
      >
        {layout.map(({ item, index, offset, style }) => (
          <button
            key={item.src}
            type="button"
            className={`skewed-carousel-card${offset === 0 ? ' is-active' : ''}`}
            style={style}
            aria-label={`第 ${index + 1} 张：${item.alt || '产品建模与渲染作品'}${offset === 0 ? '，点击放大' : '，点击切换到此图'}`}
            aria-current={offset === 0 ? 'true' : undefined}
            onClick={() => {
              if (draggedRef.current) return;
              if (offset !== 0) moveTo(index);
              else onSelect?.(index);
            }}
          >
            <span className="skewed-carousel-media">
              <img
                src={item.src}
                alt={item.alt || ''}
                draggable="false"
                decoding="async"
                loading={Math.abs(offset) <= 1 ? 'eager' : 'lazy'}
                fetchPriority={Math.abs(offset) === 0 ? 'high' : 'auto'}
              />
            </span>
          </button>
        ))}
        <button className="skewed-carousel-control is-previous" type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => move(-1)} aria-label="上一张"><ChevronLeft size={21} /></button>
        <button className="skewed-carousel-control is-next" type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => move(1)} aria-label="下一张"><ChevronRight size={21} /></button>
        <span className="skewed-carousel-count" aria-live="polite"><b>{String(activeIndex + 1).padStart(2, '0')}</b><i>/</i>{String(count).padStart(2, '0')}</span>
      </div>
    </div>
  );
}
