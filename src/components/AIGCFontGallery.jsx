export default function AIGCFontGallery({ items }) {
  return (
    <div className="aigc-font-gallery" role="group" aria-label="字体生成作品图片">
      {items.map((item, index) => (
        <figure className="aigc-font-card" key={item.id || item.src}>
          <img
            src={item.src}
            alt={item.alt}
            loading={index < 3 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </figure>
      ))}
    </div>
  );
}
