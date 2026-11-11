export default function AIGCIllustrationGallery({ items, onSelect }) {
  return (
    <div className="aigc-illustration-gallery" role="group" aria-label="插画作品">
      {items.map((item, index) => (
        <button
          className="aigc-illustration-card"
          key={item.id || item.src}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`放大查看${item.alt}`}
        >
          <img src={item.src} alt={item.alt} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" />
        </button>
      ))}
    </div>
  );
}
