const logoWorks = [
  { src: '/images/logo-design/logo-01-replacement.jpg', background: '#15984d', fit: 'cover', imageScale: 1.28 },
  { background: '#fff', fit: 'contain' },
  { background: '#1a1a1a', fit: 'cover' },
  { background: '#fff', fit: 'contain' },
  { src: '/images/logo-design/logo-05-replacement.jpg', background: '#6b5734', fit: 'cover', imageScale: 1.28 },
  { background: '#fff', fit: 'contain' },
  { background: '#fff', fit: 'contain' },
  { background: '#fff', fit: 'contain' },
  { background: '#fff', fit: 'contain' },
];

logoWorks.forEach((work, index) => {
  work.src ??= `/images/logo-design/logo-${String(index + 1).padStart(2, '0')}.jpg`;
  work.alt = `LOGO设计作品 ${String(index + 1).padStart(2, '0')}`;
});

export default function AIGCLogoGallery() {
  return (
    <div className="aigc-logo-gallery" role="group" aria-label="LOGO设计作品">
      {logoWorks.map((work, index) => (
        <figure
          className="aigc-logo-card"
          key={work.src}
          style={{
            '--logo-card-background': work.background,
            '--logo-object-fit': work.fit,
            '--logo-image-scale': work.imageScale ?? 1,
          }}
        >
          <img
            src={work.src}
            alt={work.alt}
            loading={index < 3 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </figure>
      ))}
    </div>
  );
}
