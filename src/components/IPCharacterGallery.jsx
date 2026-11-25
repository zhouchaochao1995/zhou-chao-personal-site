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

export default function IPCharacterGallery() {
  return (
    <div className="ip-character-gallery" role="group" aria-label="IP形象作品">
      {characterSets.map((character, setIndex) => {
        const cards = [character.hero, ...character.images];
        return (
          <div className="ip-character-set" key={character.name} aria-label={character.name}>
            {cards.map(([src, alt], index) => (
              <figure
                className={`ip-character-image${index === 0 ? ' ip-character-hero' : ''}`}
                key={src}
              >
                <img src={src} alt={`${character.name}：${alt}`} loading={setIndex === 0 && index === 0 ? 'eager' : 'lazy'} decoding="async" />
              </figure>
            ))}
          </div>
        );
      })}
    </div>
  );
}
