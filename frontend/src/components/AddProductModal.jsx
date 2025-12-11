import React, { useState, useRef } from 'react';
import { X, Upload, Link as LinkIcon, Tag, DollarSign, Image as ImageIcon } from 'lucide-react';

const AddProductModal = ({ isOpen, onClose, onAddProduct }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState('couch');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !name || !price || !link) {
      alert("Veuillez remplir tous les champs et ajouter une image.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('name', name);
      formData.append('price', price);
      formData.append('link', link);
      formData.append('category', category);

      await onAddProduct(formData);
      onClose();
      // Reset form
      setName('');
      setPrice('');
      setLink('');
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Erreur lors de l'ajout du produit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Tag className="text-[#FFD700]" size={20} />
          Ajouter un Produit
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Image Upload */}
          <div 
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${previewUrl ? 'border-[#FFD700] bg-[#FFD700]/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-32 object-contain rounded-lg" />
            ) : (
              <>
                <Upload size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-400">Cliquez pour ajouter une image</p>
              </>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">Nom du produit</label>
            <div className="relative">
                <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Canapé Velours"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#FFD700] focus:outline-none transition pl-10"
                />
                <Tag size={16} className="absolute left-3 top-3 text-gray-500" />
            </div>
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 ml-1">Prix</label>
                <div className="relative">
                    <input 
                    type="text" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 899€"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#FFD700] focus:outline-none transition pl-10"
                    />
                    <DollarSign size={16} className="absolute left-3 top-3 text-gray-500" />
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400 ml-1">Catégorie</label>
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#FFD700] focus:outline-none transition appearance-none"
                >
                    <option value="couch">Canapé</option>
                    <option value="chair">Chaise</option>
                    <option value="table">Table</option>
                    <option value="lamp">Lampe</option>
                    <option value="plant">Plante</option>
                    <option value="rug">Tapis</option>
                    <option value="other">Autre</option>
                </select>
            </div>
          </div>

          {/* Link */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 ml-1">Lien Affilié</label>
            <div className="relative">
                <input 
                type="text" 
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://amzn.to/..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#FFD700] focus:outline-none transition pl-10"
                />
                <LinkIcon size={16} className="absolute left-3 top-3 text-gray-500" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#FFD700] text-black font-bold py-3 rounded-xl hover:bg-[#FFD700]/90 transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Ajout en cours...' : 'Ajouter au catalogue'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
