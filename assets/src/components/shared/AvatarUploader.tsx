import { useRef, useState, type ChangeEvent } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Avatar } from '@/components/shared/Avatar';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface AvatarUploaderProps {
  name: string;
  imageUrl?: string | null;
  size?: number;
  radius?: string;
  uploading?: boolean;
  disabled?: boolean;
  onUpload: (file: File) => void;
  onRemove?: () => void;
}

/**
 * Avatar with a camera-icon overlay for picking a new image and an X for
 * removal. Picks → validates client-side → calls onUpload. Server-side
 * validation runs again on the backend, so this is just a UX guard; if the
 * server rejects the file the parent should surface the error.
 */
export function AvatarUploader({
  name,
  imageUrl,
  size = 64,
  radius = '20px',
  uploading = false,
  disabled = false,
  onUpload,
  onRemove,
}: AvatarUploaderProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hovering, setHovering] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t('avatar.errors.invalidType', 'Image must be JPEG, PNG or WebP'));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(t('avatar.errors.tooLarge', 'Image must be 5 MB or smaller'));
      return;
    }
    onUpload(file);
  };

  const openPicker = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  // Overlay icon scales with the avatar — looks balanced from 32px through 128px.
  const iconSize = Math.max(14, Math.round(size * 0.28));
  const removeButtonSize = Math.max(20, Math.round(size * 0.28));

  return (
    <div
      className="relative inline-block group"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Avatar name={name} imageUrl={imageUrl} size={size} radius={radius} />

      <button
        type="button"
        onClick={openPicker}
        disabled={disabled || uploading}
        aria-label={t('avatar.upload', 'Upload photo')}
        className={cn(
          'absolute inset-0 flex items-center justify-center cursor-pointer border-none transition-opacity duration-150',
          'bg-black/45 text-white',
          hovering || uploading ? 'opacity-100' : 'opacity-0',
          (disabled || uploading) && 'cursor-not-allowed',
        )}
        style={{ borderRadius: radius }}
      >
        {uploading ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          <Camera size={iconSize} />
        )}
      </button>

      {imageUrl && onRemove && !uploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={disabled}
          aria-label={t('avatar.remove', 'Remove photo')}
          className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red text-white border-2 border-white shadow-[0_2px_6px_rgba(0,0,0,0.15)] cursor-pointer hover:bg-red/90 transition-colors disabled:opacity-50"
          style={{ width: removeButtonSize, height: removeButtonSize }}
        >
          <X size={Math.max(10, Math.round(removeButtonSize * 0.55))} />
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
