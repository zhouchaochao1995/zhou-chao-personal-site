export default function AIGCIllustrationGallery({ items }) {
  return (
    <div className="aigc-illustration-gallery" role="group" aria-label="插画作品">
      {items.map((item, index) => (
        <figure
          className="aigc-illustration-card"
          key={item.id || item.src}
        >
          <img src={item.src} alt={item.alt} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" />
        </figure>
      ))}
    </div>
  );
}
