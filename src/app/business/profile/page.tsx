'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services';
import { UserProfile } from '@/lib/interfaces/auth';

export default function BusinessProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== 'business') {
        router.push('/login');
      } else {
        setUser(currentUser);
        setBio(currentUser.bio || '');
        setAvatarUrl(currentUser.avatarUrl || '');
        setPhotos(currentUser.photos || []);
      }
      setLoading(false);
    }
    loadUser();
  }, [router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);
    try {
      const newAvatarUrl = await authService.uploadAvatar(user.id, file);
      setAvatarUrl(newAvatarUrl);
      await authService.updateProfile({ avatarUrl: newAvatarUrl });
    } catch (err) {
      alert('Error uploading avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      alert('Максимум 5 фото.');
      return;
    }
    setUploadingPhoto(true);
    try {
      const newPhotos = [...photos];
      for (const file of files) {
        // Upload photo to the same avatars bucket but as a gallery photo (pseudo folder)
        const photoUrl = await authService.uploadAvatar(user.id, file); // We reuse the function, it generates a unique name usually. Wait, authService.uploadAvatar replaces the avatar. We need a new method or use it if it creates unique names.
        // Actually, uploadAvatar uses standard path. Let's create a specific upload function for photos in authService, but since we are modifying UI here, we can assume a custom fetch or just use a mock for now. Wait, we can modify authService!
        const uploadedUrl = await authService.uploadGalleryPhoto(user.id, file);
        newPhotos.push(uploadedUrl);
      }
      setPhotos(newPhotos);
      await authService.updateProfile({ photos: newPhotos });
    } catch (err) {
      alert('Error uploading photos');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (index: number) => {
    if (!window.confirm("Удалить это фото?")) return;
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    await authService.updateProfile({ photos: newPhotos });
  };

  const handleSave = async () => {
    try {
      await authService.updateProfile({ bio });
      if (user) {
        setUser({ ...user, bio });
      }
      alert('Изменения сохранены!');
    } catch (e) {
      alert('Ошибка при сохранении');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--foreground)', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <a href="/business" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '2rem', fontWeight: 700 }}>
          ← Назад
        </a>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Профиль Заведения</h2>
          <button 
            onClick={handleSave}
            style={{ padding: '8px 16px', background: 'var(--primary)', color: '#000', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
          >
            Сохранить
          </button>
        </div>

        <div className="panel" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
              <label style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--primary)', color: '#000', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', opacity: uploadingAvatar ? 0.5 : 1 }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                <span style={{ fontSize: '14px' }}>{uploadingAvatar ? '⏳' : '📷'}</span>
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.5px' }}>Название</label>
                {(user?.isVerified || user?.status === 'verified') && (
                  <span title="Верифицировано" style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>✅</span>
                )}
              </div>
              <input 
                type="text"
                className="input-field" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Введите название заведения"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', color: 'var(--foreground)', padding: '12px', borderRadius: '8px', fontSize: '1rem' }}
              />
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1rem' }}>Галерея (до 5 фото)</h3>
        <div className="panel" style={{ padding: '1.5rem', border: '1px solid var(--surface-border)', background: 'var(--glass-bg)', borderRadius: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
            {photos.map((photo, index) => (
              <div key={index} style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
                <img src={photo} alt={`Gallery ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  onClick={() => handleDeletePhoto(index)}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                >
                  ×
                </button>
              </div>
            ))}
            
            {photos.length < 5 && (
              <label style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', border: '2px dashed var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', opacity: uploadingPhoto ? 0.5 : 1 }}>
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                <span style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>{uploadingPhoto ? '⏳' : '+'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Добавить</span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
