import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = process.argv[2];
const outputDir = path.join(process.cwd(), 'public/images/products');

const keys = [
  'notebook',
  'pen',
  'colors',
  'pencil',
  'sticky',
  'folder',
  'geometry',
  'print',
  'glue',
  'register',
  'clips',
  'exam',
];

await mkdir(outputDir, { recursive: true });

if (!source) {
  throw new Error(
    'Usage: node scripts/create-product-images.mjs /path/to/product-sheet.png',
  );
}

const metadata = await sharp(source).metadata();
if (!metadata.width || !metadata.height) {
  throw new Error('Generated product image sheet is missing dimensions.');
}

const columns = 4;
const rows = 3;
const tileWidth = metadata.width / columns;
const tileHeight = metadata.height / rows;

await Promise.all(
  keys.map((key, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const left = Math.round(column * tileWidth);
    const top = Math.round(row * tileHeight);
    const width =
      column === columns - 1 ? metadata.width - left : Math.round(tileWidth);
    const height =
      row === rows - 1 ? metadata.height - top : Math.round(tileHeight);

    return sharp(source)
      .extract({ left, top, width, height })
      .resize(900, 900, {
        fit: 'contain',
        background: '#f7f1e8',
      })
      .png({ quality: 92 })
      .toFile(path.join(outputDir, `${key}.png`));
  }),
);

console.log(`Created ${keys.length} product images in ${outputDir}`);
