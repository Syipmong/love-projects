import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Camera,
  Check,
  Link2,
  RefreshCw
} from 'lucide-react';
import { searchCuratedPhotos, CuratedPhoto } from '../services/api';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, altText?: string) => void;
  currentImageUrl?: string;
  targetTitle?: string;
}

const ROMANTIC_PRESETS = [
  { label: 'Romantic Couple', query: 'romantic couple love' },
  { label: 'Holding Hands', query: 'couple holding hands love' },
  { label: 'Sunset Love', query: 'couple sunset romance' },
  { label: 'Coffee Date', query: 'coffee date couple cafe' },
  { label: 'Stargazing', query: 'stargazing night sky couple' },
  { label: 'Beach Stroll', query: 'couple beach walk romance' },
  { label: 'Flowers & Roses', query: 'red roses love flowers' },
  { label: 'Candlelight', query: 'candlelight dinner romance' }
];

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl,
  targetTitle = 'Polaroid Photo'
}) => {
  const [tab, setTab] = useState<'library' | 'custom'>('library');
  const [query, setQuery] = useState('romantic couple love');
  const [photos, setPhotos] = useState<CuratedPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<CuratedPhoto | null>(null);
  const [customUrl, setCustomUrl] = useState(currentImageUrl || '');

  // Fetch photos when modal opens or query changes
  useEffect(() => {
    if (isOpen && tab === 'library' && photos.length === 0) {
      handleSearch('romantic couple love');
    }
  }, [isOpen, tab]);

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    setSelectedPhoto(null);

    const res = await searchCuratedPhotos(searchQuery, 1, 18);
    setLoading(false);

    if (res.success && res.photos.length > 0) {
      setPhotos(res.photos);
    } else {
      setPhotos([]);
      setError(res.error || 'No matching photos found. Try another search keyword.');
    }
  };

  const handlePresetClick = (presetQuery: string) => {
    setQuery(presetQuery);
    handleSearch(presetQuery);
  };

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query.trim());
    }
  };

  const handleConfirmSelection = () => {
    if (tab === 'library' && selectedPhoto) {
      onSelectImage(selectedPhoto.imageUrl, selectedPhoto.alt);
      onClose();
    } else if (tab === 'custom' && customUrl.trim()) {
      onSelectImage(customUrl.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 font-romantic leading-tight">
                  Choose Photo for {targetTitle}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span>Explore curated romantic photos or paste your own custom link</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Segmented Switch */}
          <div className="px-4 sm:px-6 pt-3 pb-1 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => setTab('library')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  tab === 'library'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Curated Photo Library</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('custom')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  tab === 'custom'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Custom Image URL</span>
              </button>
            </div>

            {selectedPhoto && tab === 'library' && (
              <span className="text-xs text-rose-600 font-semibold truncate hidden sm:inline">
                Selected: {selectedPhoto.photographer}
              </span>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {tab === 'library' ? (
              <>
                {/* Search Bar */}
                <form onSubmit={handleSubmitSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search romantic photos (e.g. coffee date, paris, walking in rain)..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Search</span>
                  </button>
                </form>

                {/* Romantic Query Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                    Ideas:
                  </span>
                  {ROMANTIC_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handlePresetClick(p.query)}
                      className={`px-3 py-1 rounded-full text-xs transition-all shrink-0 cursor-pointer ${
                        query === p.query
                          ? 'bg-rose-500 text-white font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/60'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Error Notification */}
                {error && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
                    {error}
                  </div>
                )}

                {/* Photos Grid */}
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] rounded-2xl bg-slate-100 animate-pulse border border-slate-200/50"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {photos.map((photo) => {
                      const isSelected = selectedPhoto?.id === photo.id;
                      return (
                        <div
                          key={photo.id}
                          onClick={() => setSelectedPhoto(photo)}
                          className={`group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 shadow-xs hover:shadow-md ${
                            isSelected
                              ? 'border-rose-500 ring-2 ring-rose-400/50 scale-[1.02]'
                              : 'border-transparent hover:border-rose-200'
                          }`}
                        >
                          <img
                            src={photo.thumbnailUrl}
                            alt={photo.alt}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Gradient and Photographer Badge */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                            <span className="text-[10px] text-white/90 truncate font-medium">
                              By {photo.photographer}
                            </span>
                          </div>

                          {/* Selection Checkmark */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* Custom URL Tab */
              <div className="space-y-4 max-w-lg mx-auto py-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Direct Image URL
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://example.com/our-special-moment.jpg"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Paste any public image link to personalize your story with your own photos.
                  </p>
                </div>

                {customUrl.trim() && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 text-center">
                    <span className="text-xs font-bold text-slate-600">Image Preview:</span>
                    <div className="w-48 h-36 mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                      <img
                        src={customUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              {tab === 'library' && selectedPhoto ? (
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <span>Photo by {selectedPhoto.photographer}</span>
                </span>
              ) : (
                <span>Curated high-resolution royalty-free photos</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={tab === 'library' ? !selectedPhoto : !customUrl.trim()}
                onClick={handleConfirmSelection}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  (tab === 'library' ? selectedPhoto : customUrl.trim())
                    ? 'bg-rose-500 hover:bg-rose-600 text-white scale-100'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Apply Photo</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

