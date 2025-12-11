import React from 'react';
import { Layers } from 'lucide-react';

const Navbar = ({ onOpenGallery }) => {
  return (
    <nav className="fixed w-full z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center text-black font-bold">
            L
          </div>
          <span className="text-xl font-bold tracking-tight text-white">LUMINA <span className="text-amber-500 font-light">SPACES</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={onOpenGallery}
            className="btn-nav"
          >
            <Layers size={16} /> Galerie
          </button>
          <button className="btn-nav">Prix</button>
          <button className="btn-secondary">
            Pro Account
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
