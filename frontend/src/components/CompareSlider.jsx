import React, { useState } from 'react';
import { MoveHorizontal } from 'lucide-react';

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
        {!isGenerating && detectedObjects && detectedObjects.map((obj, idx) => (
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

export default CompareSlider;
