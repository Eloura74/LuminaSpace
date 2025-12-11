import { Armchair, Lightbulb, Palette } from 'lucide-react';

// --- Données Simulées ---
export const STYLES = [
  { id: 'scandi', name: 'Scandinave', color: 'bg-stone-200' },
  { id: 'indus', name: 'Industriel', color: 'bg-zinc-700' },
  { id: 'japandi', name: 'Japandi', color: 'bg-amber-100' },
  { id: 'cyber', name: 'Cyberpunk', color: 'bg-fuchsia-900' },
  { id: 'lux', name: 'Luxe Moderne', color: 'bg-slate-900' },
];

// Base de produits affiliés simulée (Plus riche)
export const PRODUCT_CATALOG = {
  couch: [
    { 
      id: 101, 
      name: "Canapé Velvet Flow", 
      price: "899€", 
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80", 
      match: "98%",
      link: "https://www.ikea.com/fr/fr/cat/canapes-fu003/"
    },
    { 
      id: 102, 
      name: "Sofa Modulaire Zen", 
      price: "1250€", 
      image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=300&q=80", 
      match: "92%",
      link: "https://www.maisonsdumonde.com/FR/fr/c/canapes-n3133d666419"
    },
    { 
      id: 103, 
      name: "Canapé Cuir Vintage", 
      price: "1590€", 
      image: "https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&w=300&q=80", 
      match: "85%",
      link: "https://www.laredoute.fr/lndng/meuble-decoration/salon/canape.aspx"
    }
  ],
  chair: [
    { 
      id: 201, 
      name: "Chaise Eames Style", 
      price: "129€", 
      image: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=300&q=80", 
      match: "95%",
      link: "https://www.sklum.com/fr/chaises-design"
    },
    { 
      id: 202, 
      name: "Fauteuil Lounge", 
      price: "450€", 
      image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=300&q=80", 
      match: "89%",
      link: "https://www.made.com/fr/chaises"
    },
    { 
      id: 203, 
      name: "Tabouret Industriel", 
      price: "89€", 
      image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=300&q=80", 
      match: "91%",
      link: "https://www.amazon.fr/s?k=tabouret+industriel"
    }
  ],
  plant: [
    { 
      id: 301, 
      name: "Monstera Deliciosa", 
      price: "45€", 
      image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=300&q=80", 
      match: "99%",
      link: "https://www.bergamotte.fr/plantes"
    },
    { 
      id: 302, 
      name: "Ficus Lyrata", 
      price: "89€", 
      image: "https://images.unsplash.com/photo-1604762524889-3e2fcc145683?auto=format&fit=crop&w=300&q=80", 
      match: "94%",
      link: "https://www.interflora.fr/plantes"
    }
  ],
  table: [
    { 
      id: 401, 
      name: "Table Basse Chêne", 
      price: "249€", 
      image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=300&q=80", 
      match: "96%",
      link: "https://www.ikea.com/fr/fr/cat/tables-basses-10716/"
    },
    { 
      id: 402, 
      name: "Table à Manger Bois", 
      price: "599€", 
      image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=300&q=80", 
      match: "93%",
      link: "https://www.laredoute.fr/pplp/100/75363/75375/cat-75386.aspx"
    }
  ],
  tv: [
    { 
      id: 501, 
      name: "Smart TV 4K 55\"", 
      price: "699€", 
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=300&q=80", 
      match: "99%",
      link: "https://www.fnac.com/TV-Video-Home-cinema/TV-Televiseurs/nsh481358/w-4"
    }
  ],
  vase: [
    { 
      id: 601, 
      name: "Vase Céramique", 
      price: "35€", 
      image: "https://images.unsplash.com/photo-1581783342308-f792ca11df53?auto=format&fit=crop&w=300&q=80", 
      match: "97%",
      link: "https://www.zarahome.com/fr/decoration/vases-c1020264585.html"
    }
  ],
  clock: [
    { 
      id: 701, 
      name: "Horloge Murale Minimaliste", 
      price: "59€", 
      image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=300&q=80", 
      match: "95%",
      link: "https://www.maisonsdumonde.com/FR/fr/c/horloges-n3133d666421"
    }
  ],
  default: [
    { 
      id: 999, 
      name: "Lampe Arc Fusion", 
      price: "249€", 
      image: "https://images.unsplash.com/photo-1513506003011-3b03c8a35918?auto=format&fit=crop&w=300&q=80", 
      match: "95%",
      link: "https://www.luminaire.fr/"
    },
    { 
      id: 998, 
      name: "Tapis Texturé", 
      price: "129€", 
      image: "https://images.unsplash.com/photo-1575414003591-ece8d0416c7a?auto=format&fit=crop&w=300&q=80", 
      match: "88%",
      link: "https://www.saint-maclou.com/tapis"
    }
  ]
};
