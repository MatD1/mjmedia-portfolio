'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IoImage, IoCopy, IoRefresh, IoClose } from 'react-icons/io5';
import { toast } from 'sonner';
import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Loading from '~/components/ui/Loading';

interface MediaItem {
  filename: string;
  url: string;
  size?: number;
}

interface MediaPreviewProps {
  onInsertImage?: (url: string, alt?: string) => void;
  onInsertLink?: (url: string, text?: string) => void;
  className?: string;
}

export default function MediaPreview({ onInsertImage, onInsertLink, className }: MediaPreviewProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [imageAlt, setImageAlt] = useState('');

  const fetchMedia = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/media/upload');
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to load media');
        setItems([]);
      } else {
        setItems(data.items ?? []);
      }
    } catch (err) {
      setError('Failed to connect to server');
      setItems([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchMedia();
  }, []);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const insertAsImage = (item: MediaItem) => {
    if (onInsertImage) {
      onInsertImage(item.url, imageAlt || item.filename);
      setSelectedItem(null);
      setImageAlt('');
      toast.success('Image inserted into content');
    }
  };

  const insertAsLink = (item: MediaItem) => {
    if (onInsertLink) {
      onInsertLink(item.url, item.filename);
      setSelectedItem(null);
      toast.success('Link inserted into content');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'].includes(ext ?? '');
  };

  if (selectedItem) {
    return (
      <Card className={`p-4 ${className ?? ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="pixel-text text-lg text-glow">Insert Media</h3>
          <button
            onClick={() => {
              setSelectedItem(null);
              setImageAlt('');
            }}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="aspect-video bg-[var(--bg-tertiary)] rounded border border-[var(--border-primary)] overflow-hidden">
            {isImage(selectedItem.filename) ? (
              <img
                src={selectedItem.url}
                alt={selectedItem.filename}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IoImage className="text-4xl text-[var(--neon-cyan)] opacity-50" />
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">Filename:</p>
            <p className="text-sm text-[var(--text-primary)] font-mono break-all">{selectedItem.filename}</p>
          </div>

          {selectedItem.size && (
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Size:</p>
              <p className="text-sm text-[var(--text-primary)]">{formatFileSize(selectedItem.size)}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">URL:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedItem.url}
                readOnly
                className="flex-1 text-xs bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded px-2 py-1 text-[var(--text-primary)] font-mono"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => copyUrl(selectedItem.url)}
              >
                <IoCopy size={14} />
              </Button>
            </div>
          </div>

          {isImage(selectedItem.filename) && onInsertImage && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Alt Text (optional)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder={selectedItem.filename}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--neon-cyan)] focus:ring-2 focus:ring-[var(--neon-cyan)]/20"
                />
              </div>
              <Button
                onClick={() => insertAsImage(selectedItem)}
                className="w-full"
                size="lg"
              >
                Insert as Image
              </Button>
            </>
          )}

          {onInsertLink && (
            <Button
              onClick={() => insertAsLink(selectedItem)}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              Insert as Link
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="pixel-text text-lg text-glow">Media Library</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={fetchMedia}
          disabled={isLoading}
        >
          <IoRefresh size={16} className={isLoading ? 'animate-spin' : ''} />
        </Button>
      </div>

      {isLoading ? (
        <Loading text="Loading media..." />
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-[var(--neon-red)] text-sm mb-2">{error}</p>
          <Button onClick={fetchMedia} variant="secondary" size="sm">
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-4 text-[var(--text-secondary)] text-sm">
          No media files found.
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => (
              <motion.button
                key={item.filename}
                onClick={() => setSelectedItem(item)}
                className="aspect-square overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-tertiary)] rounded hover:border-[var(--neon-cyan)] transition-colors group relative"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isImage(item.filename) ? (
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IoImage className="text-2xl text-[var(--neon-cyan)] opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center truncate w-full">
                    {item.filename}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
