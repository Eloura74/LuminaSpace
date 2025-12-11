import React, { useRef } from 'react';
import { Scan, Upload, Layers, Wand2, Loader2 } from 'lucide-react';
import { STYLES } from '../data/constants';

const ConfigurationPanel = ({ 
  selectedFile, 
  onFileSelect, 
  prompt, 
  setPrompt, 
  selectedStyle, 
  setSelectedStyle, 
  isGenerating, 
  onGenerate 
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="panel-base">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Scan size={18} className="text-amber-500"/>
        Configuration
      </h2>
      
      {/* Upload Zone */}
      <div 
        className="upload-zone group"
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
           className="input-text"
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
              className={`style-selector-btn ${
                selectedStyle === style.id 
                ? 'style-selector-btn-active' 
                : 'style-selector-btn-inactive'
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
        onClick={onGenerate}
        disabled={isGenerating || !selectedFile}
        className="mt-8 w-full btn-primary"
      >
        {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Wand2 size={20} />}
        {isGenerating ? 'Génération...' : 'Transformer l\'espace'}
      </button>
    </div>
  );
};

export default ConfigurationPanel;
