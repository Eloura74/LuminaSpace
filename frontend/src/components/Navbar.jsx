import React from 'react';
import { Layers, Lock, LogOut } from 'lucide-react';

const Navbar = ({ onOpenGallery, onOpenLogin, isAdmin, onLogout }) => {
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
          
          {isAdmin ? (
            <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition px-4 py-2 hover:bg-red-500/10 rounded-lg"
            >
                <LogOut size={16} /> Déconnexion
            </button>
          ) : (
            <button 
                onClick={onOpenLogin}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition px-4 py-2 hover:bg-white/5 rounded-lg"
            >
                <Lock size={14} /> Admin
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
