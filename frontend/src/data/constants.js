import { Armchair, Lightbulb, Palette } from 'lucide-react';

// --- Données Simulées ---
export const STYLES = [
  { id: 'scandi', name: 'Scandinave', color: 'bg-stone-200' },
  { id: 'indus', name: 'Industriel', color: 'bg-zinc-700' },
  { id: 'japandi', name: 'Japandi', color: 'bg-amber-100' },
  { id: 'cyber', name: 'Cyberpunk', color: 'bg-fuchsia-900' },
  { id: 'lux', name: 'Luxe Moderne', color: 'bg-slate-900' },
];

// Base de produits affiliés simulée
export const PRODUCT_CATALOG = {
  couch: [
    { id: 101, name: "Canapé Velvet Flow", price: "899€", image: "🛋️", match: "98%" },
    { id: 102, name: "Sofa Modulaire Zen", price: "1250€", image: "🛋️", match: "92%" }
  ],
  chair: [
    { id: 201, name: "Chaise Eames Style", price: "129€", image: "🪑", match: "95%" },
    { id: 202, name: "Fauteuil Lounge", price: "450€", image: "🪑", match: "89%" }
  ],
  plant: [
    { id: 301, name: "Monstera Deliciosa", price: "45€", image: "🪴", match: "99%" },
    { id: 302, name: "Ficus Lyrata", price: "89€", image: "🌳", match: "94%" }
  ],
  table: [
    { id: 401, name: "Table Basse Chêne", price: "249€", image: "🪵", match: "96%" }
  ],
  tv: [
    { id: 501, name: "Smart TV 4K 55\"", price: "699€", image: "📺", match: "99%" }
  ],
  default: [
    { id: 999, name: "Lampe Arc Fusion", price: "249€", image: "💡", match: "95%" },
    { id: 998, name: "Tapis Texturé", price: "129€", image: "🧶", match: "88%" }
  ]
};
