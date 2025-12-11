import React, { useState, useEffect } from 'react';
import { Palette, Maximize2, Download } from 'lucide-react';
import { api } from '../services/api';

const GalleryModal = ({ isOpen, onClose, onLoadImage }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchGallery();
    }
  }, [isOpen]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const data = await api.fetchGallery();
      if (data && data.images) {
        setImages(data.images);
      }
    } catch (err) {
      console.error("Erreur chargement galerie", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette size={20} className="text-amber-500"/>
            Galerie des Créations
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">Fermer</button>
        </div>
        
        <div className="p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-10 text-gray-400">Chargement...</div>
          ) : images.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-400">Aucune création pour le moment.</div>
          ) : (
            images.map((img) => (
              <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-white/5 hover:border-amber-500/50 transition cursor-pointer">
                <img src={img.url} alt="Creation" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button 
                    onClick={() => { onLoadImage(img.url); onClose(); }}
                    className="p-2 bg-amber-500 text-black rounded-full hover:scale-110 transition"
                    title="Charger dans le comparateur"
                  >
                    <Maximize2 size={16} />
                  </button>
                  <a 
                    href={img.url} 
                    download 
                    className="p-2 bg-white text-black rounded-full hover:scale-110 transition"
                    title="Télécharger"
                    onClick={e => e.stopPropagation()}
                  >
                    <Download size={16} />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
