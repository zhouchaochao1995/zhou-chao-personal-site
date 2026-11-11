import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const characterSets = [
  {
    name: '滑板女孩 IP',
    hero: ['/images/ip-character/skater-hero.jpg', '滑板女孩 IP 角色主视觉'],
    images: [
      ['/images/ip-character/skater-01.webp', '滑板女孩滑板动作'],
      ['/images/ip-character/skater-02.jpg', '滑板女孩站立造型'],
      ['/images/ip-character/skater-03.jpg', '滑板女孩个性表情'],
      ['/images/ip-character/skater-04.jpg', '滑板女孩单脚姿势'],
      ['/images/ip-character/skater-05.jpg', '滑板女孩挥手造型'],
      ['/images/ip-character/skater-06.jpg', '滑板女孩互动造型'],
    ],
  },
  {
    name: '兔子 IP',
    hero: ['/images/ip-character/bunny-hero.webp', '兔子 IP 角色主视觉'],
    images: [
      ['/images/ip-character/bunny-01.jpg', '兔子在书桌前'],
      ['/images/ip-character/bunny-02.jpg', '兔子跑步造型'],
      ['/images/ip-character/bunny-03.jpg', '兔子休息造型'],
      ['/images/ip-character/bunny-04.jpg', '兔子用餐造型'],
      ['/images/ip-character/bunny-05.jpg', '兔子跳跃造型'],
      ['/images/ip-character/bunny-06.jpg', '兔子在电脑前'],
    ],
  },
];

const galleryImages = characterSets.flatMap((character) => [
  { src: character.hero[0], alt: character.hero[1], group: character.name },
  ...character.images.map(([src, alt]) => ({ src, alt, group: character.name })),
]);

export default function IPCharacterGallery() {
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (activeIndex == null) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowLeft') setActiveIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length);
      if (event.key === 'ArrowRight') setActiveIndex((index) => (index + 1) % galleryImages.length);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex]);

  const openImage = (src) => setActiveIndex(galleryImages.findIndex((image) => image.src === src));
  const activeImage = activeIndex == null ? null : galleryImages[activeIndex];
  const stepImage = (offset) => setActiveIndex((index) => (index + offset + galleryImages.length) % galleryImages.length);

  return (
    <>
      <div className="ip-character-gallery" role="group" aria-label="IP形象作品">
        {characterSets.map((character, setIndex) => {
          const cards = [character.hero, ...character.images];
          return (
            <div className="ip-character-set" key={character.name} aria-label={character.name}>
              {cards.map(([src, alt], index) => (
                <button
                  className={`ip-character-image${index === 0 ? ' ip-character-hero' : ''}`}
                  key={src}
                  type="button"
                  onClick={() => openImage(src)}
                  aria-label={`放大查看${character.name}：${alt}`}
                >
                  <img src={src} alt={`${character.name}：${alt}`} loading={setIndex === 0 && index === 0 ? 'eager' : 'lazy'} decoding="async" />
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {activeImage && (
        <div
          className="ip-image-lightbox-backdrop"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveIndex(null); }}
        >
          <section className="ip-image-lightbox" role="dialog" aria-modal="true" aria-label={`${activeImage.group}图片预览`}>
            <img src={activeImage.src} alt={activeImage.alt} />
            <button className="ip-image-lightbox-control ip-image-lightbox-close" type="button" onClick={() => setActiveIndex(null)} aria-label="关闭图片预览"><X size={22} /></button>
            <button className="ip-image-lightbox-control ip-image-lightbox-previous" type="button" onClick={() => stepImage(-1)} aria-label="查看上一张"><ChevronLeft size={25} /></button>
            <button className="ip-image-lightbox-control ip-image-lightbox-next" type="button" onClick={() => stepImage(1)} aria-label="查看下一张"><ChevronRight size={25} /></button>
          </section>
        </div>
      )}
    </>
  );
}
