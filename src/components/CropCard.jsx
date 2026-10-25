import React, { useState } from 'react';
import { Heart, Plus, Check } from 'lucide-react';

export default function CropCard({ 
  id,
  name, 
  description, 
  price, 
  unit = "pre kg", 
  image, 
  onSelect,
  isFavorite = false,
  isAdded = false
}) {
  const [favorite, setFavorite] = useState(isFavorite);
  const [added, setAdded] = useState(isAdded);

  const handleAdd = (e) => {
    e.stopPropagation();
    setAdded(!added);
    onSelect?.({ id, name, price, image });
  };

  return (
    <div 
      className="bg-white rounded-3xl p-5 border border-slate-150 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Top Favorite Heart Button */}
      <div className="flex justify-end mb-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFavorite(!favorite);
          }}
          className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
          title="Save crop to favorites"
        >
          <Heart 
            className={`w-5 h-5 transition-transform duration-200 active:scale-125 ${
              favorite ? 'fill-rose-500 text-rose-500' : 'text-slate-300 hover:text-rose-400'
            }`} 
          />
        </button>
      </div>

      {/* Central Crop Image */}
      <div className="w-full h-36 flex items-center justify-center p-2 mb-3">
        <img
          src={image}
          alt={name}
          className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
        />
      </div>

      {/* Crop Name & Description */}
      <div className="text-center mb-4">
        <h4 className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight font-['Outfit']">
          {name}
        </h4>
        <p className="text-xs text-slate-400 font-normal line-clamp-1 mt-1">
          {description || "High yield potential, resilient root profile"}
        </p>
      </div>

      {/* Bottom Price & Add Circular Plus Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <div>
          <span className="font-extrabold text-emerald-600 text-base">
            {price}
          </span>
          <span className="text-[11px] text-slate-400 font-medium ml-1">
            /{unit}
          </span>
        </div>

        <button
          onClick={handleAdd}
          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
            added 
              ? 'bg-slate-900 text-white scale-105' 
              : 'bg-[#22c55e] hover:bg-[#16a34a] text-white hover:scale-110 active:scale-95'
          }`}
          title={added ? "Added to rotation plan" : "Select crop for field"}
        >
          {added ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
        </button>
      </div>
    </div>
  );
}
