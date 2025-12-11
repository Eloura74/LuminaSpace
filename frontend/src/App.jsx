import React, { useState } from 'react';
import { Share2, Maximize2, Download } from 'lucide-react';

// Components
import Navbar from './components/Navbar';
import ConfigurationPanel from './components/ConfigurationPanel';
import CompareSlider from './components/CompareSlider';
import ShopSidebar from './components/ShopSidebar';
import GalleryModal from './components/GalleryModal';

// Data & Services
import { PRODUCT_CATALOG } from './data/constants';
import { api } from './services/api';

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

  // State pour la galerie
  const [showGallery, setShowGallery] = useState(false);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setDetectedObjects([]); // Reset detections
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
      const genData = await api.generateImage(formData);

      if (genData && genData.generated_image) {
        setGeneratedImage(genData.generated_image);
        
        // 2. Détection d'objets sur l'image source (MVP)
        const detectData = await api.detectObjects(formData);

        if (detectData && detectData.objects) {
            setDetectedObjects(detectData.objects);
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
      
      <GalleryModal 
        isOpen={showGallery} 
        onClose={() => setShowGallery(false)} 
        onLoadImage={(url) => setGeneratedImage(url)}
      />

      <Navbar onOpenGallery={() => setShowGallery(true)} />

      {/* Main Interface */}
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Controls */}
        <div className="lg:col-span-3 space-y-6 animate-fade-in-up">
          <ConfigurationPanel 
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            prompt={prompt}
            setPrompt={setPrompt}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />

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
           <ShopSidebar 
             shopSuggestions={shopSuggestions}
             activeObjectLabel={activeObjectLabel}
           />
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
