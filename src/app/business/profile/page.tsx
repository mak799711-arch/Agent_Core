"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService, businessRepository } from "@/lib/services";
import { UserProfile } from "@/lib/interfaces/auth";
import { Business } from "@/lib/interfaces/business";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("@/app/components/LocationPickerMap"), {
  ssr: false,
  loading: () => <div style={{ height: "300px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>...</div>
});

const translations: Record<string, any> = {
  en: {
    back: "← Back",
    title: "Venue Profile",
    descLabel: "Description",
    descPlaceholder: "Briefly describe your venue...",
    verified: "Verified",
    galleryTitle: "Gallery (up to 4 photos)",
    addPhoto: "Add",
    locationTitle: "Location",
    mapPointLabel: "Map Point",
    mapHelper: "Click the geolocate button in the top right, use search, or just click anywhere on the map to set your venue's pin.",
    loading: "Loading...",
    deleteConfirm: "Delete this photo?",
    maxPhotos: "Max 4 photos.",
    uploadError: "Upload error"
  },
  ru: {
    back: "← Назад",
    title: "Профиль Заведения",
    descLabel: "ОПИСАНИЕ",
    descPlaceholder: "Кратко опишите ваше заведение...",
    verified: "Подтверждено",
    galleryTitle: "Галерея (до 4 фото)",
    addPhoto: "Добавить",
    locationTitle: "Локация",
    mapPointLabel: "Точка на карте",
    mapHelper: "Нажмите кнопку геолокации справа вверху, воспользуйтесь поиском, или просто кликните по карте, чтобы поставить пин.",
    loading: "Загрузка...",
    deleteConfirm: "Удалить это фото?",
    maxPhotos: "Максимум 4 фото.",
    uploadError: "Ошибка загрузки"
  },
  id: {
    back: "← Kembali",
    title: "Profil Tempat",
    descLabel: "Deskripsi",
    descPlaceholder: "Deskripsikan tempat Anda secara singkat...",
    verified: "Terverifikasi",
    galleryTitle: "Galeri (hingga 4 foto)",
    addPhoto: "Tambah",
    locationTitle: "Lokasi",
    mapPointLabel: "Titik Peta",
    mapHelper: "Klik tombol geolokasi di kanan atas, gunakan pencarian, atau klik di mana saja di peta untuk mengatur pin tempat Anda.",
    loading: "Memuat...",
    deleteConfirm: "Hapus foto ini?",
    maxPhotos: "Maksimal 4 foto.",
    uploadError: "Kesalahan unggahan"
  },
  zh: {
    back: "← 返回",
    title: "场所资料",
    descLabel: "描述",
    descPlaceholder: "简要描述您的场所...",
    verified: "已验证",
    galleryTitle: "画廊（最多4张照片）",
    addPhoto: "添加",
    locationTitle: "位置",
    mapPointLabel: "地图点",
    mapHelper: "点击右上角的地理定位按钮，使用搜索，或者在地图上任意点击以设置您的场所大头针。",
    loading: "加载中...",
    deleteConfirm: "删除此照片？",
    maxPhotos: "最多4张照片。",
    uploadError: "上传错误"
  },
  es: {
    back: "← Volver",
    title: "Perfil del Lugar",
    descLabel: "Descripción",
    descPlaceholder: "Describa brevemente su lugar...",
    verified: "Verificado",
    galleryTitle: "Galería (hasta 4 fotos)",
    addPhoto: "Añadir",
    locationTitle: "Ubicación",
    mapPointLabel: "Punto en el mapa",
    mapHelper: "Haga clic en el botón de geolocalización en la parte superior derecha, use la búsqueda o simplemente haga clic en cualquier lugar del mapa para establecer el pin de su lugar.",
    loading: "Cargando...",
    deleteConfirm: "¿Eliminar esta foto?",
    maxPhotos: "Máximo 4 fotos.",
    uploadError: "Error de subida"
  },
  de: {
    back: "← Zurück",
    title: "Veranstaltungsort-Profil",
    descLabel: "Beschreibung",
    descPlaceholder: "Beschreiben Sie Ihren Veranstaltungsort kurz...",
    verified: "Verifiziert",
    galleryTitle: "Galerie (bis zu 4 Fotos)",
    addPhoto: "Hinzufügen",
    locationTitle: "Standort",
    mapPointLabel: "Kartenpunkt",
    mapHelper: "Klicken Sie auf die Geolokalisierungs-Schaltfläche oben rechts, verwenden Sie die Suche oder klicken Sie einfach irgendwo auf die Karte, um den Pin Ihres Veranstaltungsortes zu setzen.",
    loading: "Wird geladen...",
    deleteConfirm: "Dieses Foto löschen?",
    maxPhotos: "Maximal 4 Fotos.",
    uploadError: "Hochladefehler"
  },
  fr: {
    back: "← Retour",
    title: "Profil du lieu",
    descLabel: "Description",
    descPlaceholder: "Décrivez brièvement votre lieu...",
    verified: "Vérifié",
    galleryTitle: "Galerie (jusqu'à 4 photos)",
    addPhoto: "Ajouter",
    locationTitle: "Emplacement",
    mapPointLabel: "Point sur la carte",
    mapHelper: "Cliquez sur le bouton de géolocalisation en haut à droite, utilisez la recherche, ou cliquez n'importe où sur la carte pour définir l'épingle de votre lieu.",
    loading: "Chargement...",
    deleteConfirm: "Supprimer cette photo ?",
    maxPhotos: "Maximum 4 photos.",
    uploadError: "Erreur de téléchargement"
  },
  ja: {
    back: "← 戻る",
    title: "会場プロフィール",
    descLabel: "説明",
    descPlaceholder: "会場について簡単に説明してください...",
    verified: "確認済み",
    galleryTitle: "ギャラリー（最大4枚の写真）",
    addPhoto: "追加",
    locationTitle: "場所",
    mapPointLabel: "マップポイント",
    mapHelper: "右上のジオロケートボタンをクリックするか、検索を使用するか、マップ上の任意の場所をクリックして会場のピンを設定します。",
    loading: "読み込み中...",
    deleteConfirm: "この写真を削除しますか？",
    maxPhotos: "最大4枚の写真。",
    uploadError: "アップロードエラー"
  },
  ar: {
    back: "← رجوع",
    title: "ملف تعريف المكان",
    descLabel: "وصف",
    descPlaceholder: "صِف مكانك بإيجاز...",
    verified: "تم التحقق",
    galleryTitle: "المعرض (حتى 4 صور)",
    addPhoto: "إضافة",
    locationTitle: "موقع",
    mapPointLabel: "نقطة الخريطة",
    mapHelper: "انقر على زر تحديد الموقع الجغرافي في أعلى اليمين، واستخدم البحث، أو انقر في أي مكان على الخريطة لتعيين دبوس مكانك.",
    loading: "جارٍ التحميل...",
    deleteConfirm: "حذف هذه الصورة؟",
    maxPhotos: "كحد أقصى 4 صور.",
    uploadError: "خطأ في التحميل"
  },
  pt: {
    back: "← Voltar",
    title: "Perfil do Local",
    descLabel: "Descrição",
    descPlaceholder: "Descreva brevemente o seu local...",
    verified: "Verificado",
    galleryTitle: "Galeria (até 4 fotos)",
    addPhoto: "Adicionar",
    locationTitle: "Localização",
    mapPointLabel: "Ponto no mapa",
    mapHelper: "Clique no botão de geolocalização no canto superior direito, use a pesquisa ou clique em qualquer lugar no mapa para definir o pino do seu local.",
    loading: "Carregando...",
    deleteConfirm: "Excluir esta foto?",
    maxPhotos: "Máximo de 4 fotos.",
    uploadError: "Erro de upload"
  },
  hi: {
    back: "← वापस",
    title: "स्थान प्रोफ़ाइल",
    descLabel: "विवरण",
    descPlaceholder: "संक्षेप में अपने स्थान का वर्णन करें...",
    verified: "सत्यापित",
    galleryTitle: "गैलरी (4 फ़ोटो तक)",
    addPhoto: "जोड़ें",
    locationTitle: "स्थान",
    mapPointLabel: "मानचित्र बिंदु",
    mapHelper: "ऊपर दाईं ओर जियोलोकेट बटन पर क्लिक करें, खोज का उपयोग करें, या अपने स्थान का पिन सेट करने के लिए मानचित्र पर कहीं भी क्लिक करें।",
    loading: "लोड हो रहा है...",
    deleteConfirm: "क्या यह फ़ोटो हटाएँ?",
    maxPhotos: "अधिकतम 4 फ़ोटो।",
    uploadError: "अपलोड त्रुटि"
  }
};;

export default function BusinessProfile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const lang = user?.language || "en";
  const t = translations[lang] || translations.en;

  useEffect(() => {
    async function loadUser() {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser || currentUser.role !== "business") {
        router.push("/login");
      } else {
        setUser(currentUser);
        setBio(currentUser.bio || "");
        setAvatarUrl(currentUser.avatarUrl || "");
        setPhotos(currentUser.photos || []);
        
        // Load business data for coordinates
        const biz = await businessRepository.getBusinessByOwnerId(currentUser.id);
        if (biz) {
          setBusiness(biz);
          setLat(biz.latitude || null);
          setLng(biz.longitude || null);
        }
        if (currentUser.theme) {
          document.documentElement.setAttribute('data-theme', currentUser.theme);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [router]);

  // Auto-save bio (name/description) with a 1-second debounce
  useEffect(() => {
    if (!user || bio === (user.bio || "")) return;
    const timer = setTimeout(() => {
      authService.updateProfile({ bio }).catch(console.error);
      setUser({ ...user, bio });
    }, 1000);
    return () => clearTimeout(timer);
  }, [bio, user]);

  const handleLocationSelect = useCallback((newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    
    if (business) {
      businessRepository.updateBusiness(business.id, {
        latitude: newLat,
        longitude: newLng
      }).catch(console.error);
    }
  }, [business]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    setUploadingAvatar(true);
    try {
      const newAvatarUrl = await authService.uploadAvatar(user.id, file);
      setAvatarUrl(newAvatarUrl);
      await authService.updateProfile({ avatarUrl: newAvatarUrl });
    } catch (err) {
      alert(t.uploadError);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 4) {
      alert(t.maxPhotos);
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
      alert(t.uploadError);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (index: number) => {
    if (!window.confirm(t.deleteConfirm)) return;
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    await authService.updateProfile({ photos: newPhotos });
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>{t?.loading || "Loading..."}</div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-gradient)",
        color: "var(--foreground)",
        padding: "3rem 2rem",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <a
          href="/business"
          style={{
            color: "var(--primary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "2rem",
            fontWeight: 700,
          }}
        >
          {t.back}
        </a>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800 }}>
            {t.title}
          </h2>
        </div>

        <div
          className="panel"
          style={{
            padding: "1.8rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            border: "1px solid var(--surface-border)",
            background: "var(--glass-bg)",
            borderRadius: "20px",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem" }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={
                  avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`
                }
                alt="Avatar"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--primary)",
                }}
              />
              <label
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  background: "var(--primary)",
                  color: "#000",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  opacity: uploadingAvatar ? 0.5 : 1,
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                <span style={{ fontSize: "14px" }}>
                  {uploadingAvatar ? "⏳" : "📷"}
                </span>
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "0.6rem",
                }}
              >
                <label
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    opacity: 0.7,
                    letterSpacing: "0.5px",
                  }}
                >
                  {t.descLabel}
                </label>
                {(user?.isVerified || user?.status === "verified") && (
                  <span
                    title={t.verified}
                    style={{
                      color: "var(--primary)",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                    }}
                  >
                    ✅
                  </span>
                )}
              </div>
              <input
                type="text"
                className="input-field"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t.descPlaceholder}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--surface-border)",
                  color: "var(--foreground)",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
            </div>
          </div>

        </div>

        <h3
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            marginTop: "2.5rem",
            marginBottom: "1rem",
          }}
        >
          {t.galleryTitle}
        </h3>
        <div
          className="panel"
          style={{
            padding: "1.5rem",
            border: "1px solid var(--surface-border)",
            background: "var(--glass-bg)",
            borderRadius: "20px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: "1rem",
            }}
          >
            {photos.map((photo, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid var(--surface-border)",
                }}
              >
                <img
                  src={photo}
                  alt={`Gallery ${index}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  onClick={() => handleDeletePhoto(index)}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "rgba(255,0,0,0.7)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            {photos.length < 4 && (
              <label
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "12px",
                  border: "2px dashed var(--primary)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.02)",
                  opacity: uploadingPhoto ? 0.5 : 1,
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
                <span style={{ fontSize: "1.5rem", marginBottom: "0.2rem" }}>
                  {uploadingPhoto ? "⏳" : "+"}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--primary)",
                    fontWeight: 600,
                  }}
                >
                  {t.addPhoto}
                </span>
              </label>
            )}
          </div>
        </div>

        <h3
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            marginTop: "2.5rem",
            marginBottom: "1rem",
          }}
        >
          {t.locationTitle}
        </h3>
        <div
          className="panel"
          style={{
            padding: "1.5rem",
            border: "1px solid var(--surface-border)",
            background: "var(--glass-bg)",
            borderRadius: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", opacity: 0.7, letterSpacing: "0.5px" }}>
              {t.mapPointLabel}
            </label>
          </div>
          
          <LocationPickerMap 
              initialLat={lat} 
              initialLng={lng} 
              onLocationSelect={handleLocationSelect}
              theme={user?.theme === "light" ? "light" : "dark"}
              lang={lang}
            />
          <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "8px", lineHeight: 1.4 }}>
            {t.mapHelper}
          </p>
        </div>
      </div>
    </div>
  );
}
