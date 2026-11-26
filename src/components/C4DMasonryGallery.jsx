import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './C4DMasonryGallery.css';

function getRowsLimit() {
  if (window.matchMedia('(max-width: 680px)').matches) return 8;
  if (window.matchMedia('(max-width: 1024px)').matches) return 12;
  return 16;
}

export default function C4DMasonryGallery({ items = [], ariaLabel = 'C4D 产品作品' }) {
  const [expanded, setExpanded] = useState(false);
  const [rowsLimit, setRowsLimit] = useState(getRowsLimit);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 680px)');
    const tabletQuery = window.matchMedia('(max-width: 1024px)');
    const updateLimit = () => setRowsLimit(mobileQuery.matches ? 8 : tabletQuery.matches ? 12 : 16);
    mobileQuery.addEventListener('change', updateLimit);
    tabletQuery.addEventListener('change', updateLimit);
    updateLimit();
    return () => {
      mobileQuery.removeEventListener('change', updateLimit);
      tabletQuery.removeEventListener('change', updateLimit);
    };
  }, []);

  if (!items.length) return null;
  const hasMoreItems = items.length > rowsLimit;
  const isCollapsed = hasMoreItems && !expanded;

  return (
    <>
      <div
        className={`c4d-masonry-gallery${isCollapsed ? ' is-collapsed' : ''}`}
        id="c4d-masonry-gallery"
        role="group"
        aria-label={`${ariaLabel}，共 ${items.length} 张`}
      >
        {items.map((item) => (
          <figure
            key={item.src}
            className={`c4d-masonry-card${item.objectFit === 'cover' ? ' c4d-masonry-card--landscape-crop' : ''}`}
            style={{ '--c4d-image-ratio': item.displayRatio || item.ratio || 1 }}
          >
            <span className="c4d-masonry-media">
              <img
                src={item.src}
                alt={item.alt || ''}
                loading="lazy"
                decoding="async"
                style={{ objectFit: item.objectFit || 'contain', objectPosition: 'center' }}
              />
            </span>
          </figure>
        ))}
      </div>
      {hasMoreItems && <button
        className="c4d-masonry-expand"
        type="button"
        aria-expanded={expanded}
        aria-controls="c4d-masonry-gallery"
        onClick={() => setExpanded((isExpanded) => !isExpanded)}
      >
        {expanded ? '收起' : '展开全部'}
        <ChevronDown className="c4d-masonry-expand-icon" size={17} aria-hidden="true" />
      </button>}
    </>
  );
}
