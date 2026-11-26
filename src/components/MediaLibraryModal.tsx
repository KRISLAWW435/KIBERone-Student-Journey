import React, { useState } from 'react';
import { Check, Trash2, Upload, X } from 'lucide-react';
import { MediaAsset, MediaCategory } from '../types/journal';
import { resolveAssetUrl } from '../utils/assetUrl';

interface MediaLibraryModalProps {
  assets: MediaAsset[];
  initialCategory?: MediaCategory | 'all';
  selectionTitle?: string;
  onSelect?: (asset: MediaAsset) => void;
  onUpload: (file: File, category: MediaCategory) => Promise<MediaAsset | null>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES: Array<{ id: MediaCategory | 'all'; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'bear', label: 'Маскот KIBERone' },
  { id: 'logo', label: 'Логотип' },
  { id: 'projects', label: 'Проекты' },
  { id: 'modules', label: 'Модули' },
  { id: 'programming', label: 'Программирование' },
  { id: 'python', label: 'Python' },
  { id: 'kodu', label: 'Kodu' },
  { id: 'games', label: 'Игры' },
  { id: '3d', label: '3D' },
  { id: 'animation', label: 'Анимация' },
  { id: 'web', label: 'Веб-разработка' },
  { id: 'digital', label: 'Цифровые технологии' },
  { id: 'backgrounds', label: 'Фоны' },
  { id: 'decor', label: 'Декор' },
];

export function MediaLibraryModal({
  assets,
  initialCategory = 'all',
  selectionTitle = 'Медиатека KIBERone',
  onSelect,
  onUpload,
  onDelete,
  onClose,
}: MediaLibraryModalProps) {
  const [category, setCategory] = useState<MediaCategory | 'all'>(initialCategory);
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>(
    initialCategory === 'all' ? 'projects' : initialCategory
  );
  const [uploading, setUploading] = useState(false);

  const filtered =
    category === 'all'
      ? assets
      : assets.filter((a) => a.category === category);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const created = await onUpload(files[0], uploadCategory);
      if (created && onSelect) {
        onSelect(created);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/45 backdrop-blur-[2px] flex items-center justify-center p-6">
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900">{selectionTitle}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Поддерживаются PNG, JPG и WEBP. Загруженные файлы сохраняются локально.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            aria-label="Закрыть медиатеку"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Bar & Category Filter */}
        <div className="px-6 py-3 bg-[#F6F6F3] border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  category === c.id
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:text-zinc-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as MediaCategory)}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700"
            >
              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                <option key={c.id} value={c.id}>
                  Категория: {c.label}
                </option>
              ))}
            </select>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Загрузка...' : 'Загрузить файл'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-zinc-500">
              В этой категории пока нет загруженных изображений. Загрузите файл PNG, JPG или WEBP.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col hover:border-[#0D9488] transition-colors"
                >
                  <div className="h-32 bg-[#F6F6F3] p-2 flex items-center justify-center overflow-hidden">
                    <img
                      src={resolveAssetUrl(asset.url)}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="p-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-zinc-900 truncate">
                        {asset.name}
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        {asset.isBuiltIn ? 'Встроенный ресурс' : 'Загружено'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onSelect && (
                        <button
                          type="button"
                          onClick={() => onSelect(asset)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#0D9488] text-white text-[11px] font-medium hover:bg-[#0F766E]"
                        >
                          <Check className="w-3 h-3" />
                          <span>Выбрать</span>
                        </button>
                      )}
                      {!asset.isBuiltIn && onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(asset.id)}
                          className="p-1 text-zinc-400 hover:text-red-600"
                          title="Удалить из медиатеки"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
