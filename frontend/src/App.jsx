import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Wand2, 
  Upload, 
  Layers, 
  ShoppingCart, 
  Share2, 
  Maximize2, 
  MoveHorizontal,
  Armchair,
  Palette,
  Lightbulb,
  Download,
  Scan,
  Check,
  Tag
} from 'lucide-react';

/**
 * Lumina Spaces - AI Interior Designer Interface
 * Stack: React, Tailwind CSS
 * Concept: Visualisation Rénovation Avant/Après avec Marketplace intégrée
 */

// --- Données Simulées ---
const STYLES = [
  { id: 'scandi', name: 'Scandinave', color: 'bg-stone-200' },
  { id: 'indus', name: 'Industriel', color: 'bg-zinc-700' },
  { id: 'japandi', name: 'Japandi', color: 'bg-amber-100' },
  { id: 'cyber', name: 'Cyberpunk', color: 'bg-fuchsia-900' },
  { id: 'lux', name: 'Luxe Moderne', color: 'bg-slate-900' },
];

// Base de produits affiliés simulée
const PRODUCT_CATALOG = {
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

// --- Composant Slider Avant/Après avec Overlay ---
const CompareSlider = ({ beforeImage, afterImage, isGenerating, detectedObjects, onObjectClick }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    <div 
      className="relative w-full h-[400px] md:h-[600px] rounded-2xl overflow-hidden cursor-col-resize select-none group shadow-2xl border border-white/10"
      onMouseMove={handleMove}
      onTouchMove={handleTouchMove}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Image de fond (AFTER) - Celle générée */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
        style={{ 
          backgroundImage: `url(${afterImage})`,
          filter: isGenerating ? 'blur(20px) brightness(0.5)' : 'none',
          transform: isGenerating ? 'scale(1.1)' : 'scale(1)'
        }} 
      >
        {/* Points interactifs (Shop the Look) - Seulement visible sur la partie AFTER */}
        {!isGenerating && detectedObjects.map((obj, idx) => (
           <div
             key={idx}
             onClick={(e) => { e.stopPropagation(); onObjectClick(obj); }}
             className="absolute w-6 h-6 bg-white/20 backdrop-blur-md border-2 border-white rounded-full cursor-pointer flex items-center justify-center hover:scale-125 transition z-30 animate-pulse"
             style={{ 
               left: `${obj.position.x}%`, 
               top: `${obj.position.y}%`,
               // Masquer si le slider couvre ce point (c'est à dire si le point est dans la zone "Before")
               display: sliderPosition < obj.position.x ? 'flex' : 'none'
             }}
           >
             <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
             {/* Tooltip au survol */}
             <div className="absolute bottom-full mb-2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition whitespace-nowrap pointer-events-none">
               {obj.label}
             </div>
           </div>
        ))}
      </div>

      {/* Loader Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-amber-400 font-mono tracking-widest animate-pulse">RENDERING TEXTURES...</p>
        </div>
      )}

      {/* Image de dessus (BEFORE) - Clipped */}
      <div 
        className="absolute inset-0 bg-cover bg-center border-r-2 border-amber-500/50"
        style={{ 
          backgroundImage: `url(${beforeImage})`,
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
          display: isGenerating ? 'none' : 'block'
        }} 
      />

      {/* Handle du Slider */}
      {!isGenerating && (
        <div 
          className="absolute top-0 bottom-0 w-1 bg-amber-500 cursor-col-resize z-20 flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50 text-black transform hover:scale-110 transition">
            <MoveHorizontal size={16} />
          </div>
        </div>
      )}

      {/* Badges */}
      {!isGenerating && (
        <>
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">ORIGINAL</div>
          <div className="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-amber-500/20">LUMINA AI</div>
        </>
      )}
    </div>
  );
};

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('indus');
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop");
  const [generatedImage, setGeneratedImage] = useState("https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=2074&auto=format&fit=crop");
  
  // State pour la détection d'objets
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [shopSuggestions, setShopSuggestions] = useState(PRODUCT_CATALOG.default);
  const [activeObjectLabel, setActiveObjectLabel] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setDetectedObjects([]); // Reset detections
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      alert("Veuillez sélectionner une image d'abord.");
      return;
    }

    setIsGenerating(true);
    setDetectedObjects([]);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('prompt', prompt || "interior design"); 
    formData.append('style', selectedStyle);

    try {
      // 1. Génération de l'image
      const response = await axios.post('http://localhost:8000/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.generated_image) {
        setGeneratedImage(response.data.generated_image);
        
        // 2. Détection d'objets sur l'image générée
        // Note: Idéalement on renverrait l'image générée au backend, 
        // mais pour simplifier ici on réutilise l'image source ou on devrait upload le résultat.
        // Pour ce MVP, on va détecter sur l'image SOURCE (plus simple sans re-upload) 
        // ou alors le backend pourrait faire la détection directement après la génération.
        // Faisons un appel séparé pour détecter sur l'image source pour l'instant (ou le backend le fait sur le résultat).
        
        // Appelons /detect avec le fichier source pour l'instant (MVP)
        // Dans une V2, le backend renverrait les objets détectés DANS la réponse /generate
        const detectResponse = await axios.post('http://localhost:8000/detect', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (detectResponse.data && detectResponse.data.objects) {
            setDetectedObjects(detectResponse.data.objects);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du traitement.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleObjectClick = (obj) => {
    setActiveObjectLabel(obj.label);
    // Filtrer les produits par catégorie détectée
    const suggestions = PRODUCT_CATALOG[obj.label] || PRODUCT_CATALOG.default;
    setShopSuggestions(suggestions);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-amber-500/30">
      
      {/* Navigation Top */}
      <nav className="fixed w-full z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center text-black font-bold">
              L
            </div>
            <span className="text-xl font-bold tracking-tight text-white">LUMINA <span className="text-amber-500 font-light">SPACES</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button className="text-sm font-medium hover:text-white transition">Galerie</button>
            <button className="text-sm font-medium hover:text-white transition">Prix</button>
            <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition">
              Pro Account
            </button>
          </div>
        </div>
      </nav>

      {/* Main Interface */}
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Controls */}
        <div className="lg:col-span-3 space-y-6 animate-fade-in-up">
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Scan size={18} className="text-amber-500"/>
              Configuration
            </h2>
            
            {/* Upload Zone */}
            <div 
              className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-amber-500/50 hover:bg-white/5 transition cursor-pointer group mb-6 relative"
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              <Upload className="mx-auto h-8 w-8 text-gray-500 group-hover:text-amber-500 transition mb-2" />
              <p className="text-xs text-gray-400">
                {selectedFile ? selectedFile.name : "Glissez une photo de pièce"}
              </p>
            </div>

            {/* Prompt Input (Optional) */}
            <div className="mb-4">
               <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 block">Prompt (Optionnel)</label>
               <input 
                 type="text" 
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="Ex: Ajoute des plantes..."
                 className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-amber-500 outline-none transition"
               />
            </div>

            {/* Style Selector */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Style Désiré</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((style) => (
                  <button 
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-all border ${
                      selectedStyle === style.id 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                      : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${style.color}`}></div>
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !selectedFile}
              className="mt-8 w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Layers className="animate-spin" size={20}/> : <Wand2 size={20} />}
              {isGenerating ? 'Génération...' : 'Transformer l\'espace'}
            </button>
          </div>

          {/* Stats / Viral Hook */}
          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 rounded-2xl p-6 text-center">
             <div className="flex justify-center -space-x-3 mb-3">
               {[1,2,3,4].map(i => (
                 <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-8 h-8 rounded-full border-2 border-[#111] bg-gray-700" alt="" />
               ))}
               <div className="w-8 h-8 rounded-full border-2 border-[#111] bg-amber-500 flex items-center justify-center text-[10px] text-black font-bold">+2k</div>
             </div>
             <p className="text-xs text-gray-400">Architectes utilisent Lumina aujourd'hui.</p>
          </div>
        </div>

        {/* Center Panel: Visualization */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <CompareSlider 
            beforeImage={previewUrl}
            afterImage={generatedImage}
            isGenerating={isGenerating}
            detectedObjects={detectedObjects}
            onObjectClick={handleObjectClick}
          />
          
          <div className="flex justify-between items-center bg-[#111] p-4 rounded-xl border border-white/5">
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
                <Share2 size={16} /> Partager
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
                <Download size={16} /> HD Render
              </button>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition">
              <Maximize2 size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Right Panel: Shopping & Marketplace */}
        <div className="lg:col-span-3 space-y-6 animate-fade-in-up delay-100">
           <div className="bg-[#111] border border-white/5 rounded-2xl p-6 h-full flex flex-col">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <ShoppingCart size={18} className="text-emerald-500"/>
                  Shop the Look
                </h3>
                <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">
                  {shopSuggestions.length} Items
                </span>
             </div>

             {activeObjectLabel && (
               <div className="mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-amber-500 text-sm animate-pulse">
                 <Tag size={14} />
                 Détecté : <span className="font-bold uppercase">{activeObjectLabel}</span>
               </div>
             )}

             <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
               {shopSuggestions.map((item) => (
                 <div key={item.id} className="group flex gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition border border-transparent hover:border-amber-500/30 cursor-pointer">
                   <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition">
                     {item.image}
                   </div>
                   <div className="flex-1">
                     <h4 className="text-sm font-medium text-white group-hover:text-amber-500 transition">{item.name}</h4>
                     <p className="text-xs text-gray-400 mb-2">Correspondance IA: {item.match}</p>
                     <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-white">{item.price}</span>
                       <button className="p-1.5 bg-white text-black rounded-lg opacity-0 group-hover:opacity-100 transition transform translate-x-2 group-hover:translate-x-0">
                         <Check size={14} />
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

             <div className="mt-6 pt-6 border-t border-white/5">
               <button className="w-full py-3 rounded-xl border border-white/10 text-sm font-medium text-gray-400 hover:text-white hover:border-white/30 transition">
                 Voir toutes les suggestions
               </button>
             </div>
           </div>
        </div>

      </main>
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[128px]"></div>
      </div>
    </div>
  );
}
