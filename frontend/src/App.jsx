import React, { useState } from 'react';
import { Share2, Maximize2, Download, Brush } from 'lucide-react';

// Components
import Navbar from './components/Navbar';
import ConfigurationPanel from './components/ConfigurationPanel';
import CompareSlider from './components/CompareSlider';
import ShopSidebar from './components/ShopSidebar';
import GalleryModal from './components/GalleryModal';
import MaskCanvas from './components/MaskCanvas';
import AddProductModal from './components/AddProductModal';

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
  const [selectedProductToStage, setSelectedProductToStage] = useState(null); // Produit à insérer

  // State pour la galerie
  const [showGallery, setShowGallery] = useState(false);
  
  // State pour les produits
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // State pour Inpainting
  const [isMasking, setIsMasking] = useState(false);
  const [inpaintMode, setInpaintMode] = useState('add'); // 'add' or 'remove'

  // Charger les produits au démarrage
  React.useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await api.getProducts();
    if (data) {
        setProducts(data);
        setShopSuggestions(data); // Initialement, on montre tout
    }
  };

  const handleAddProduct = async (formData) => {
    await api.addProduct(formData);
    await loadProducts(); // Recharger la liste
  };

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


  const handleMaskGenerated = async (maskBlob) => {
    setIsMasking(false);
    setIsGenerating(true);

    try {
        const formData = new FormData();
        
        let imageToSend = selectedFile;
        if (generatedImage && generatedImage.startsWith('http')) {
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            imageToSend = new File([blob], "image.png", { type: "image/png" });
        }

        formData.append('image', imageToSend); 
        formData.append('mask', maskBlob, 'mask.png');
        
        // LOGIQUE SÉPARÉE SELON LE MODE
        if (inpaintMode === 'remove') {
            // Mode GOMME : On veut supprimer l'objet
            formData.append('prompt', "clean background, empty room, wall, floor, interior design");
            // On n'envoie PAS de produit
            console.log("Mode Gomme activé");
        } else {
            // Mode AJOUT : On veut ajouter un produit
            formData.append('prompt', prompt || "high quality interior");
            
            if (selectedProductToStage) {
                formData.append('product_image_url', selectedProductToStage.image);
                formData.set('prompt', selectedProductToStage.name + ", " + selectedProductToStage.category);
                console.log("Mode Ajout : Produit envoyé", selectedProductToStage.name);
            } else {
                // Si pas de produit sélectionné mais mode ajout, on demande à l'user de sélectionner
                alert("Attention : Aucun produit sélectionné pour l'ajout !");
            }
        }

        const data = await api.inpaintImage(formData);
        if (data && data.generated_image) {
            setGeneratedImage(data.generated_image);
            if (inpaintMode === 'add') setSelectedProductToStage(null);
        }
    } catch (error) {
        console.error("Erreur Inpainting:", error);
        alert("Erreur lors de l'inpainting.");
    } finally {
        setIsGenerating(false);
    }
  };

  const mapLabelToCategory = (label) => {
    const mapping = {
      'potted plant': 'plant',
      'dining table': 'table',
      'sofa': 'couch',
      'bed': 'couch', // Fallback
      'bench': 'chair',
      'stool': 'chair'
    };
    return mapping[label.toLowerCase()] || label.toLowerCase();
  };

  const handleObjectClick = (obj) => {
    setActiveObjectLabel(obj.label);
    const category = mapLabelToCategory(obj.label);
    
    // Filtrer les produits dynamiques par catégorie
    const suggestions = products.filter(p => p.category === category);
    
    // Fallback si rien trouvé : montrer tout ou des suggestions par défaut
    if (suggestions.length > 0) {
        setShopSuggestions(suggestions);
    } else {
        setShopSuggestions(products); // Ou un message "Pas de produits pour cette catégorie"
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-amber-500/30">
      
      {isMasking && (
        <MaskCanvas 
            imageSrc={generatedImage} // On dessine sur l'image GÉNÉRÉE
            onMaskGenerated={handleMaskGenerated}
            onClose={() => setIsMasking(false)}
        />
      )}

      <GalleryModal 
        isOpen={showGallery} 
        onClose={() => setShowGallery(false)} 
        onLoadImage={(url) => setGeneratedImage(url)}
      />

      <Navbar onOpenGallery={() => setShowGallery(true)} />

      {/* Main Interface */}
      <main className="pt-28 pb-12 px-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 animate-fade-in">
        
        {/* Left Panel: Controls */}
        <div className="lg:col-span-3 space-y-8 animate-fade-in-up">
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

          <div className="flex gap-2">
            <button 
                onClick={() => {
                    setInpaintMode('remove');
                    setIsMasking(true);
                }}
                disabled={!selectedFile}
                className="flex-1 py-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
                <Brush size={18} /> Gomme
            </button>
            <button 
                onClick={() => {
                    setInpaintMode('add');
                    setIsMasking(true);
                }}
                disabled={!selectedFile}
                className="flex-1 py-4 rounded-xl border border-[#FFD700]/30 bg-[#FFD700]/5 text-[#FFD700] font-bold hover:bg-[#FFD700] hover:text-black transition-all flex items-center justify-center gap-2"
            >
                <Brush size={18} /> Ajouter
            </button>
          </div>

          {/* Stats / Viral Hook */}
          <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/0 via-[#FFD700]/5 to-[#FFD700]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
             <div className="flex justify-center -space-x-4 mb-4 relative z-10">
               {[1,2,3,4].map(i => (
                 <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-10 h-10 rounded-full border-2 border-[#111] bg-gray-700" alt="" />
               ))}
               <div className="w-10 h-10 rounded-full border-2 border-[#111] bg-[#FFD700] flex items-center justify-center text-[10px] text-black font-bold">+2k</div>
             </div>
             <p className="text-sm text-gray-400 font-medium relative z-10">Architectes utilisent Lumina aujourd'hui.</p>
          </div>
        </div>

        {/* Center Panel: Visualization */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 bg-[#050505] aspect-[4/3]">
            <CompareSlider 
                beforeImage={previewUrl}
                afterImage={generatedImage}
                isGenerating={isGenerating}
                detectedObjects={detectedObjects}
                onObjectClick={handleObjectClick}
            />
          </div>
          
          <div className="flex justify-between items-center bg-[#111]/80 backdrop-blur-md p-4 rounded-2xl border border-white/5">
            <div className="flex gap-4">
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition px-4 py-2 hover:bg-white/5 rounded-lg">
                <Share2 size={18} /> Partager
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition px-4 py-2 hover:bg-white/5 rounded-lg">
                <Download size={18} /> HD Render
              </button>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition">
              <Maximize2 size={20} className="text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Right Panel: Shopping & Marketplace */}
        <div className="lg:col-span-3 space-y-6 animate-fade-in-up delay-100">
           <ShopSidebar 
             shopSuggestions={shopSuggestions}
             activeObjectLabel={activeObjectLabel}
             onStageProduct={(product) => {
                setSelectedProductToStage(product);
                setInpaintMode('add'); // Force le mode Ajout
                setIsMasking(true); 
                alert(`Produit sélectionné : ${product.name}. Dessinez la zone où le placer.`);
             }}
             onOpenAddProduct={() => setShowAddProduct(true)}
           />
        </div>

      </main>
      
      <AddProductModal 
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onAddProduct={handleAddProduct}
      />
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#FFD700]/5 rounded-full blur-[150px] opacity-30"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[150px] opacity-20"></div>
      </div>
    </div>
  );
}
