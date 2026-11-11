import './C4DMasonryGallery.css';

export default function C4DMasonryGallery({ items = [], onSelect, ariaLabel = 'C4D 产品作品' }) {
  if (!items.length) return null;

  return (
    <div className="c4d-masonry-gallery" role="group" aria-label={`${ariaLabel}，共 ${items.length} 张`}>
      {items.map((item, index) => (
        <button
          key={item.src}
          type="button"
          className="c4d-masonry-card"
          style={{ '--c4d-image-ratio': item.ratio || 1 }}
          aria-label={`查看第 ${index + 1} 张：${item.alt || '产品建模与渲染作品'}`}
          onClick={() => onSelect?.(index)}
        >
          <span className="c4d-masonry-media">
            <img
              src={item.src}
              alt={item.alt || ''}
              loading="lazy"
              decoding="async"
            />
          </span>
        </button>
      ))}
    </div>
  );
}
