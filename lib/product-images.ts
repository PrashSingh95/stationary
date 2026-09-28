export const productImageMap = {
  notebook: '/images/products/notebook.png',
  pen: '/images/products/pen.png',
  colors: '/images/products/colors.png',
  pencil: '/images/products/pencil.png',
  sticky: '/images/products/sticky.png',
  folder: '/images/products/folder.png',
  geometry: '/images/products/geometry.png',
  print: '/images/products/print.png',
  glue: '/images/products/glue.png',
  register: '/images/products/register.png',
  clips: '/images/products/clips.png',
  exam: '/images/products/exam.png',
} as const;

export type ProductImageKey = keyof typeof productImageMap;

export function getProductImageSrc(type: string | undefined) {
  if (!type) return undefined;
  return productImageMap[type as ProductImageKey];
}
