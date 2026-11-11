export const illustrationGallery = [1, 2, 3, 4, 5, 7, 8, 9, 10].map((number) => ({
  id: `aigc.illustration.item.${number}`,
  src: `/images/illustrations/illustration-${String(number).padStart(2, '0')}.webp`,
  alt: `插画作品 ${String(number).padStart(2, '0')}`,
  ratio: 16 / 9,
}));
