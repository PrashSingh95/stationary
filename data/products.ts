import type { Product } from '@/types/product';

export const products: Product[] = [
  {
    id: 'p-001',
    name: 'Classmate Spiral Notebook',
    slug: 'classmate-spiral-notebook',
    description:
      'A durable ruled notebook for school notes, tuition work, and office planning.',
    category: 'notebooks',
    brand: 'Classmate',
    price: 120,
    originalPrice: 150,
    images: ['notebook'],
    inStock: true,
    featured: true,
    popular: true,
    specs: ['200 pages', 'Ruled pages', 'Spiral bound', 'A4 size'],
  },
  {
    id: 'p-002',
    name: 'Reynolds Trimax Gel Pen',
    slug: 'reynolds-trimax-gel-pen',
    description:
      'Smooth writing gel pen with a comfortable grip for daily writing and exams.',
    category: 'pens-pencils',
    brand: 'Reynolds',
    price: 60,
    originalPrice: 75,
    images: ['pen'],
    inStock: true,
    featured: true,
    popular: true,
    specs: ['Blue ink', '0.7 mm tip', 'Refillable', 'Exam friendly'],
  },
  {
    id: 'p-003',
    name: 'Camlin Color Pencil Set',
    slug: 'camlin-color-pencil-set',
    description:
      'Bright color pencils for school projects, drawing books, and creative practice.',
    category: 'art-craft',
    brand: 'Camlin',
    price: 95,
    originalPrice: 120,
    images: ['colors'],
    inStock: true,
    featured: true,
    specs: ['12 shades', 'Break-resistant leads', 'Smooth color laydown'],
  },
  {
    id: 'p-004',
    name: 'Apsara Drawing Pencil Pack',
    slug: 'apsara-drawing-pencil-pack',
    description:
      'Reliable graphite pencils for writing, sketching, and classroom use.',
    category: 'pens-pencils',
    brand: 'Apsara',
    price: 50,
    images: ['pencil'],
    inStock: true,
    featured: false,
    popular: true,
    specs: ['Pack of 10', 'Dark graphite', 'Easy sharpening'],
  },
  {
    id: 'p-005',
    name: 'Office Sticky Notes Cube',
    slug: 'office-sticky-notes-cube',
    description:
      'Colorful sticky notes for reminders, labels, bookmarks, and quick lists.',
    category: 'office-supplies',
    brand: 'Paperline',
    price: 85,
    originalPrice: 100,
    images: ['sticky'],
    inStock: true,
    featured: false,
    popular: true,
    specs: ['5 colors', '400 sheets', 'Strong adhesive'],
  },
  {
    id: 'p-006',
    name: 'Transparent Project File',
    slug: 'transparent-project-file',
    description:
      'Neat document file for reports, assignments, bills, and presentation papers.',
    category: 'files-folders',
    brand: 'Solo',
    price: 35,
    images: ['folder'],
    inStock: true,
    featured: true,
    specs: ['A4 compatible', '20 pockets', 'Clear cover'],
  },
  {
    id: 'p-007',
    name: 'Maped Geometry Box',
    slug: 'maped-geometry-box',
    description:
      'Complete geometry kit for mathematics classes, exams, and project diagrams.',
    category: 'geometry-supplies',
    brand: 'Maped',
    price: 180,
    originalPrice: 220,
    images: ['geometry'],
    inStock: true,
    featured: false,
    specs: ['Compass', 'Divider', 'Ruler', 'Set squares', 'Protractor'],
  },
  {
    id: 'p-008',
    name: 'A4 Color Print',
    slug: 'a4-color-print',
    description:
      'Sharp A4 color printing for assignments, forms, images, and office documents.',
    category: 'printing-services',
    brand: 'In-store',
    price: 15,
    images: ['print'],
    inStock: true,
    featured: true,
    specs: ['A4 size', 'Color print', 'Same-day service'],
  },
  {
    id: 'p-009',
    name: 'Fevicol Craft Glue',
    slug: 'fevicol-craft-glue',
    description:
      'Multipurpose glue for school crafts, paper models, charts, and home projects.',
    category: 'art-craft',
    brand: 'Fevicol',
    price: 30,
    images: ['glue'],
    inStock: false,
    featured: false,
    specs: ['50 g bottle', 'Clean nozzle', 'Paper and craft use'],
  },
  {
    id: 'p-010',
    name: 'Long Register Notebook',
    slug: 'long-register-notebook',
    description:
      'Sturdy long notebook for accounts, practical records, and subject notes.',
    category: 'notebooks',
    brand: 'Navneet',
    price: 140,
    originalPrice: 165,
    images: ['register'],
    inStock: true,
    featured: false,
    popular: true,
    specs: ['288 pages', 'Single line', 'Hard cover'],
  },
  {
    id: 'p-011',
    name: 'Binder Clips Pack',
    slug: 'binder-clips-pack',
    description:
      'Strong binder clips for organizing notes, office papers, and invoices.',
    category: 'office-supplies',
    brand: 'Kangaro',
    price: 45,
    images: ['clips'],
    inStock: true,
    featured: false,
    specs: ['Pack of 12', 'Assorted sizes', 'Reusable metal clips'],
  },
  {
    id: 'p-012',
    name: 'Student Exam Kit',
    slug: 'student-exam-kit',
    description:
      'A ready-to-carry exam essentials kit with pens, pencil, eraser, ruler, and pouch.',
    category: 'school-supplies',
    brand: 'SmartKit',
    price: 199,
    originalPrice: 240,
    images: ['exam'],
    inStock: true,
    featured: true,
    popular: true,
    specs: ['2 pens', '2 pencils', 'Eraser', 'Sharpener', '15 cm ruler', 'Pouch'],
  },
];

export const shop = {
  name: 'BABA PUSTAK BHANDAR',
  phone: '919876543210',
  displayPhone: '+91 98765 43210',
  address: 'MG Road, Near City School, Pune',
  hours: 'Mon-Sat, 9:00 AM-8:30 PM',
};

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: string) {
  return products.filter((product) => product.category === category);
}

export function makeWhatsAppUrl(product?: Product) {
  const message = product
    ? `Hi,\n\nI would like to order:\n\n${product.name}\nQuantity: 1\nPrice: Rs. ${product.price}`
    : 'Hi, I would like to ask about stationery products.';

  return `https://wa.me/${shop.phone}?text=${encodeURIComponent(message)}`;
}
