import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ConcaveCarousel.css';

/** A light, responsive concave image rail for the offline-materials gallery. */
export default function ConcaveCarousel({
  items = [],
  startIndex = 0,
  gap = 12,
  radius = 18,
  autoplay = 'drift',
  speed = 0.16,
  interval = 4,
  pauseOnHover = true,
  onSelect,
  className = '',
  id,
  ariaLabel = '线下物料作品轮播',
}) {
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const draggedRef = useRef(false);
  const activeIndexRef = useRef(0);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [imageRatios, setImageRatios] = useState({});
  const count = items.length;

  useEffect(() => {
    if (!count) return;
    const initialIndex = ((startIndex % count) + count) % count;
    activeIndexRef.current = initialIndex;
    setActiveIndex(initialIndex);
  }, [count, startIndex]);

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return undefined;
    const measure = () => setStageSize({ width: element.clientWidth, height: element.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const goToIndex = (nextIndex) => {
    if (!count) return;
    const normalizedIndex = ((nextIndex % count) + count) % count;
    const previousIndex = activeIndexRef.current;
    if (normalizedIndex === previousIndex) return;
    activeIndexRef.current = normalizedIndex;
    setActiveIndex(normalizedIndex);
  };

  const move = (step) => {
    goToIndex(activeIndexRef.current + step);
  };

  useEffect(() => {
    if (autoplay === 'off' || !count || (pauseOnHover && hovered)) return undefined;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;
    const delay = autoplay === 'step' ? interval * 1000 : 1000 / Math.max(Math.abs(speed), 0.01);
    const timer = window.setInterval(() => move(speed < 0 ? -1 : 1), delay);
    return () => window.clearInterval(timer);
  }, [autoplay, count, hovered, interval, pauseOnHover, speed]);

  const layout = useMemo(() => {
    if (!count || !stageSize.width || !stageSize.height) return [];
    const ratios = items.map((item, index) => imageRatios[index] || item.ratio || 1);
    // Keep 20px of vertical breathing room above and below the focused card.
    // The card scales to 1.08x, so using the full stage height clips its corners.
    const cardHeight = Math.max(220, stageSize.height - 40);
    const widths = ratios.map((ratio) => cardHeight * ratio);
    const centerX = stageSize.width / 2;
    const itemGap = stageSize.width <= 680 ? 10 : gap;
    return items.map((item, index) => {
      let offset = (index - activeIndex + count) % count;
      if (offset > count / 2) offset -= count;
      const direction = Math.sign(offset);
      const steps = Math.abs(offset);
      let distance = 0;
      for (let step = 0; step < steps; step += 1) {
        const previousIndex = (activeIndex + direction * step + count) % count;
        const nextIndex = (activeIndex + direction * (step + 1) + count) % count;
        const previousScale = step === 0 ? 1.08 : step === 1 ? 0.82 : step === 2 ? 0.66 : 0.56;
        const nextStep = step + 1;
        const nextScale = nextStep === 1 ? 0.82 : nextStep === 2 ? 0.66 : 0.56;
        const previousVisibleWidth = widths[previousIndex] * previousScale;
        const nextVisibleWidth = widths[nextIndex] * nextScale;
        const overlap = Math.min(74, Math.min(previousVisibleWidth, nextVisibleWidth) * 0.16);
        distance += previousVisibleWidth / 2 + nextVisibleWidth / 2 + itemGap - overlap;
      }
      const x = centerX + (steps ? direction * distance : 0);
      const zIndex = 100 - steps;
      const scale = steps === 0 ? 1.08 : steps === 1 ? 0.82 : steps === 2 ? 0.66 : 0.56;
      const blur = steps === 0 ? 0 : steps === 1 ? 2 : steps === 2 ? 4 : 6;
      const opacity = 1;
      const shade = steps === 0 ? 0 : steps === 1 ? 0.4 : steps === 2 ? 0.68 : 0.92;
      return {
        item,
        index,
        offset,
        style: {
          '--concave-width': `${widths[index]}px`,
          '--concave-height': `${cardHeight}px`,
          // Counter-scale the CSS radius so the visible corner stays constant
          // while each image grows or recedes in the carousel.
          '--concave-scale': scale,
          '--concave-radius': `${radius / scale}px`,
          left: '50%',
          zIndex,
          opacity,
          '--concave-blur': `${blur}px`,
          '--concave-shade': shade,
          // Keep the card planes front-facing. Perspective rotation was
          // visually pinching the rounded corners while cards crossed center.
          transform: `translate3d(calc(-50% + ${x - centerX}px), -50%, 0) scale(${scale})`,
        },
      };
    });
  }, [activeIndex, count, gap, imageRatios, items, radius, stageSize]);

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'Home') { event.preventDefault(); goToIndex(0); }
    if (event.key === 'End') { event.preventDefault(); goToIndex(count - 1); }
  };

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = { x: event.clientX, y: event.clientY };
    draggedRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerUp = (event) => {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    dragRef.current = null;
    if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      draggedRef.current = true;
      move(dx < 0 ? 1 : -1);
      window.setTimeout(() => { draggedRef.current = false; }, 80);
    }
  };

  if (!count) return null;

  return (
    <div id={id} className={`concave-carousel ${className}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div
        ref={stageRef}
        className="concave-stage"
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { dragRef.current = null; }}
      >
        <div className="concave-atmosphere" aria-hidden="true" />
        {layout.map(({ item, index, offset, style }) => (
          <button
            key={`${item.src || item.number || item.title}-${index}`}
            className={`concave-panel${offset === 0 ? ' is-centered' : ''}${item.src ? ' has-image' : ' is-empty'}`}
            type="button"
            style={style}
            aria-label={item.src ? `查看${item.title || `第 ${index + 1} 张作品`}` : `${item.title || `第 ${index + 1} 张`}图片待补充`}
            onClick={() => {
              if (draggedRef.current) return;
              if (offset !== 0) goToIndex(index);
              else if (item.src) onSelect?.(item, index);
            }}
          >
            <span className="concave-panel-media">
              {item.src ? (
                <img
                  src={item.src}
                  alt={item.alt || item.title || ''}
                  draggable="false"
                  decoding="async"
                  loading="lazy"
                  onLoad={(event) => {
                    const image = event.currentTarget;
                    if (image.naturalWidth && image.naturalHeight) {
                      const ratio = image.naturalWidth / image.naturalHeight;
                      setImageRatios((current) => current[index] === ratio ? current : { ...current, [index]: ratio });
                    }
                  }}
                />
              ) : <span className="concave-panel-placeholder" aria-hidden="true" />}
            </span>
          </button>
        ))}
        <button className="concave-control concave-control-previous" type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => move(-1)} aria-label="上一张"><ChevronLeft size={21} /></button>
        <button className="concave-control concave-control-next" type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => move(1)} aria-label="下一张"><ChevronRight size={21} /></button>
      </div>
    </div>
  );
}
