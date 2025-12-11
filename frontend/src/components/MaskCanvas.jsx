import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Brush, Undo } from 'lucide-react';

const MaskCanvas = ({ imageSrc, onMaskGenerated, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const contextRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Charger l'image de fond pour avoir les dimensions
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Initialiser le contexte : Fond noir (transparent pour inpainting), Dessin blanc (masque)
      // Pour Stable Diffusion Inpainting : Blanc = Zone à modifier, Noir = Zone à garder
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "white";
      ctx.lineWidth = brushSize;
      
      // On remplit de noir (zone protégée) au départ
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      contextRef.current = ctx;
    };
  }, [imageSrc]);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.lineWidth = brushSize;
    }
  }, [brushSize]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      onMaskGenerated(blob);
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-[#111] p-4 rounded-2xl border border-white/10 shadow-2xl">
        <h3 className="text-white font-bold mb-4 text-center">Dessinez sur la zone à modifier</h3>
        
        <div className="relative border border-white/20 rounded-lg overflow-hidden cursor-crosshair">
            {/* Image de référence en arrière plan (visuelle seulement) */}
            <img src={imageSrc} className="absolute inset-0 w-full h-full object-contain opacity-50 pointer-events-none" alt="ref" />
            
            {/* Canvas de masque (ce qu'on dessine) */}
            {/* On utilise mix-blend-mode pour voir à travers le noir */}
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={finishDrawing}
                onMouseMove={draw}
                className="relative z-10 opacity-70"
                style={{ maxWidth: '80vw', maxHeight: '70vh' }}
            />
        </div>

        <div className="flex items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-2">
                <Brush size={18} className="text-white"/>
                <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(e.target.value)}
                    className="w-32 accent-amber-500"
                />
            </div>

            <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition">
                    Annuler
                </button>
                <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 transition">
                    Valider le Masque
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MaskCanvas;
