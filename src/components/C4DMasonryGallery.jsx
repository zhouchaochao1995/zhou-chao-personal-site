import './C4DMasonryGallery.css';

export default function C4DMasonryGallery({ items = [], ariaLabel = 'C4D 产品作品' }) {
  if (!items.length) return null;

  return (
    <div className="c4d-masonry-gallery" role="group" aria-label={`${ariaLabel}，共 ${items.length} 张`}>
      {items.map((item) => (
        <figure
          key={item.src}
          className="c4d-masonry-card"
          style={{ '--c4d-image-ratio': item.ratio || 1 }}
        >
          <span className="c4d-masonry-media">
            <img
              src={item.src}
              alt={item.alt || ''}
              loading="lazy"
              decoding="async"
            />
          </span>
        </figure>
      ))}
    </div>
  );
}
