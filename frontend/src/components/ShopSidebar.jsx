import React from 'react';
import { ShoppingCart, Tag, Check, ExternalLink } from 'lucide-react';

const ShopSidebar = ({ shopSuggestions, activeObjectLabel }) => {
  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80"; // Fallback image
  };

  return (
    <div className="panel-base h-full flex flex-col border-[#FFD700]/10">
      <div className="flex items-center justify-between mb-6">
         <h3 className="font-semibold text-white flex items-center gap-2 tracking-wide">
           <ShoppingCart size={18} className="text-[#FFD700]"/>
           Shop the Look
         </h3>
         <span className="text-xs bg-[#FFD700]/10 text-[#FFD700] px-2 py-1 rounded border border-[#FFD700]/20">
           {shopSuggestions.length} Items
         </span>
      </div>

      {activeObjectLabel && (
        <div className="mb-4 px-3 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl flex items-center gap-2 text-[#FFD700] text-sm animate-pulse">
          <Tag size={14} />
          Détecté : <span className="font-bold uppercase">{activeObjectLabel}</span>
        </div>
      )}

      <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
        {shopSuggestions.map((item) => (
          <div key={item.id} className="group flex gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-[#FFD700]/30 cursor-pointer shadow-lg hover:shadow-[#FFD700]/5 relative overflow-hidden">
            <div className="w-20 h-20 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
              <img 
                src={item.image} 
                alt={item.name} 
                onError={handleImageError}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div>
                <h4 className="text-sm font-bold text-white truncate group-hover:text-[#FFD700] transition">{item.name}</h4>
                <p className="text-xs text-gray-400">Match IA: <span className="text-emerald-400">{item.match}</span></p>
              </div>
              
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-white">{item.price}</span>
                {item.link && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-[#FFD700] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 hover:bg-white"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-white/5">
        <button className="w-full py-3 rounded-xl border border-white/10 text-sm font-medium text-gray-400 hover:text-white hover:border-white/30 transition hover:bg-white/5">
          Voir toutes les suggestions
        </button>
      </div>
    </div>
  );
};

export default ShopSidebar;
