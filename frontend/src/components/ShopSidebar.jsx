import React from 'react';
import { ShoppingCart, Tag, Check } from 'lucide-react';

const ShopSidebar = ({ shopSuggestions, activeObjectLabel }) => {
  return (
    <div className="panel-base h-full flex flex-col">
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
            <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white truncate group-hover:text-amber-500 transition">{item.name}</h4>
              <p className="text-xs text-gray-400 mb-2">Correspondance IA: {item.match}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white">{item.price}</span>
                {item.link && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition transform translate-x-2 group-hover:translate-x-0 flex items-center gap-1 hover:bg-amber-500 hover:text-white"
                  >
                    Acheter <Check size={12} />
                  </a>
                )}
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
  );
};

export default ShopSidebar;
