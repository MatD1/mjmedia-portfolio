'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Card from '~/components/ui/Card';
import Button from '~/components/ui/Button';
import Loading from '~/components/ui/Loading';
import { toast } from 'sonner';

interface MediaItem { filename: string; url: string }

export default function AdminMediaClient() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
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
    void refresh();
  }, []);

  const onUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File | null;
    if (!file || !file.name) {
      toast.error('Please select a file');
      return;
    }
    
    setUploading(true);
    try {
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Uploaded ${data.filename}${data.converted ? ` (converted from ${data.originalFormat})` : ''}`);
        (e.currentTarget as HTMLFormElement).reset();
        await refresh();
      } else {
        toast.error(data.error ?? 'Upload failed');
      }
    } catch (err) {
      toast.error('Failed to upload file');
    }
    setUploading(false);
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="pixel-text text-3xl text-glow mb-2">Media</h1>
        <p className="text-[var(--text-secondary)]">Upload images and manage your media library.</p>
      </motion.div>

      <Card className="p-6">
        <form onSubmit={onUpload} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input name="file" type="file" accept="image/*" className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded px-3 py-2" />
          <Button type="submit" isLoading={uploading}>Upload</Button>
        </form>
      </Card>

      <Card className="p-6">
        {isLoading ? (
          <Loading text="Loading media..." />
        ) : error ? (
          <div className="text-center">
            <p className="text-[var(--neon-red)] mb-4">{error}</p>
            <Button onClick={refresh} variant="secondary" size="sm">Retry</Button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-[var(--text-secondary)]">No media uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((m) => (
              <div key={m.filename} className="space-y-2">
                <div className="aspect-square overflow-hidden border border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                  <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
                </div>
                <input
                  readOnly
                  value={m.url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="w-full text-xs bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded px-2 py-1 text-[var(--text-secondary)]"
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


