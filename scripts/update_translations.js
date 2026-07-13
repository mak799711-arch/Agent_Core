const fs = require('fs');
const path = require('path');

const businessLangs = {
  en: { back: "← Back", title: "Venue Profile", descLabel: "Description", descPlaceholder: "Briefly describe your venue...", verified: "Verified", galleryTitle: "Gallery (up to 4 photos)", addPhoto: "Add", locationTitle: "Location", mapPointLabel: "Map Point", mapHelper: "Click the geolocate button in the top right, use search, or just click anywhere on the map to set your venue's pin.", loading: "Loading...", deleteConfirm: "Delete this photo?", maxPhotos: "Max 4 photos.", uploadError: "Upload error" },
  ru: { back: "← Назад", title: "Профиль Заведения", descLabel: "ОПИСАНИЕ", descPlaceholder: "Кратко опишите ваше заведение...", verified: "Подтверждено", galleryTitle: "Галерея (до 4 фото)", addPhoto: "Добавить", locationTitle: "Локация", mapPointLabel: "Точка на карте", mapHelper: "Нажмите кнопку геолокации справа вверху, воспользуйтесь поиском, или просто кликните по карте, чтобы поставить пин.", loading: "Загрузка...", deleteConfirm: "Удалить это фото?", maxPhotos: "Максимум 4 фото.", uploadError: "Ошибка загрузки" },
  id: { back: "← Kembali", title: "Profil Tempat", descLabel: "Deskripsi", descPlaceholder: "Deskripsikan tempat Anda secara singkat...", verified: "Terverifikasi", galleryTitle: "Galeri (hingga 4 foto)", addPhoto: "Tambah", locationTitle: "Lokasi", mapPointLabel: "Titik Peta", mapHelper: "Klik tombol geolokasi di kanan atas, gunakan pencarian, atau klik di mana saja di peta untuk mengatur pin tempat Anda.", loading: "Memuat...", deleteConfirm: "Hapus foto ini?", maxPhotos: "Maksimal 4 foto.", uploadError: "Kesalahan unggahan" },
  zh: { back: "← 返回", title: "场所资料", descLabel: "描述", descPlaceholder: "简要描述您的场所...", verified: "已验证", galleryTitle: "画廊（最多4张照片）", addPhoto: "添加", locationTitle: "位置", mapPointLabel: "地图点", mapHelper: "点击右上角的地理定位按钮，使用搜索，或者在地图上任意点击以设置您的场所大头针。", loading: "加载中...", deleteConfirm: "删除此照片？", maxPhotos: "最多4张照片。", uploadError: "上传错误" },
  es: { back: "← Volver", title: "Perfil del Lugar", descLabel: "Descripción", descPlaceholder: "Describa brevemente su lugar...", verified: "Verificado", galleryTitle: "Galería (hasta 4 fotos)", addPhoto: "Añadir", locationTitle: "Ubicación", mapPointLabel: "Punto en el mapa", mapHelper: "Haga clic en el botón de geolocalización en la parte superior derecha, use la búsqueda o simplemente haga clic en cualquier lugar del mapa para establecer el pin de su lugar.", loading: "Cargando...", deleteConfirm: "¿Eliminar esta foto?", maxPhotos: "Máximo 4 fotos.", uploadError: "Error de subida" },
  de: { back: "← Zurück", title: "Veranstaltungsort-Profil", descLabel: "Beschreibung", descPlaceholder: "Beschreiben Sie Ihren Veranstaltungsort kurz...", verified: "Verifiziert", galleryTitle: "Galerie (bis zu 4 Fotos)", addPhoto: "Hinzufügen", locationTitle: "Standort", mapPointLabel: "Kartenpunkt", mapHelper: "Klicken Sie auf die Geolokalisierungs-Schaltfläche oben rechts, verwenden Sie die Suche oder klicken Sie einfach irgendwo auf die Karte, um den Pin Ihres Veranstaltungsortes zu setzen.", loading: "Wird geladen...", deleteConfirm: "Dieses Foto löschen?", maxPhotos: "Maximal 4 Fotos.", uploadError: "Hochladefehler" },
  fr: { back: "← Retour", title: "Profil du lieu", descLabel: "Description", descPlaceholder: "Décrivez brièvement votre lieu...", verified: "Vérifié", galleryTitle: "Galerie (jusqu'à 4 photos)", addPhoto: "Ajouter", locationTitle: "Emplacement", mapPointLabel: "Point sur la carte", mapHelper: "Cliquez sur le bouton de géolocalisation en haut à droite, utilisez la recherche, ou cliquez n'importe où sur la carte pour définir l'épingle de votre lieu.", loading: "Chargement...", deleteConfirm: "Supprimer cette photo ?", maxPhotos: "Maximum 4 photos.", uploadError: "Erreur de téléchargement" },
  ja: { back: "← 戻る", title: "会場プロフィール", descLabel: "説明", descPlaceholder: "会場について簡単に説明してください...", verified: "確認済み", galleryTitle: "ギャラリー（最大4枚の写真）", addPhoto: "追加", locationTitle: "場所", mapPointLabel: "マップポイント", mapHelper: "右上のジオロケートボタンをクリックするか、検索を使用するか、マップ上の任意の場所をクリックして会場のピンを設定します。", loading: "読み込み中...", deleteConfirm: "この写真を削除しますか？", maxPhotos: "最大4枚の写真。", uploadError: "アップロードエラー" },
  ar: { back: "← رجوع", title: "ملف تعريف المكان", descLabel: "وصف", descPlaceholder: "صِف مكانك بإيجاز...", verified: "تم التحقق", galleryTitle: "المعرض (حتى 4 صور)", addPhoto: "إضافة", locationTitle: "موقع", mapPointLabel: "نقطة الخريطة", mapHelper: "انقر على زر تحديد الموقع الجغرافي في أعلى اليمين، واستخدم البحث، أو انقر في أي مكان على الخريطة لتعيين دبوس مكانك.", loading: "جارٍ التحميل...", deleteConfirm: "حذف هذه الصورة؟", maxPhotos: "كحد أقصى 4 صور.", uploadError: "خطأ في التحميل" },
  pt: { back: "← Voltar", title: "Perfil do Local", descLabel: "Descrição", descPlaceholder: "Descreva brevemente o seu local...", verified: "Verificado", galleryTitle: "Galeria (até 4 fotos)", addPhoto: "Adicionar", locationTitle: "Localização", mapPointLabel: "Ponto no mapa", mapHelper: "Clique no botão de geolocalização no canto superior direito, use a pesquisa ou clique em qualquer lugar no mapa para definir o pino do seu local.", loading: "Carregando...", deleteConfirm: "Excluir esta foto?", maxPhotos: "Máximo de 4 fotos.", uploadError: "Erro de upload" },
  hi: { back: "← वापस", title: "स्थान प्रोफ़ाइल", descLabel: "विवरण", descPlaceholder: "संक्षेप में अपने स्थान का वर्णन करें...", verified: "सत्यापित", galleryTitle: "गैलरी (4 फ़ोटो तक)", addPhoto: "जोड़ें", locationTitle: "स्थान", mapPointLabel: "मानचित्र बिंदु", mapHelper: "ऊपर दाईं ओर जियोलोकेट बटन पर क्लिक करें, खोज का उपयोग करें, या अपने स्थान का पिन सेट करने के लिए मानचित्र पर कहीं भी क्लिक करें।", loading: "लोड हो रहा है...", deleteConfirm: "क्या यह फ़ोटो हटाएँ?", maxPhotos: "अधिकतम 4 फ़ोटो।", uploadError: "अपलोड त्रुटि" }
};

const partnerLangs = {
  en: { back: "← Back", title: "Agent Profile", bioLabel: "Bio / Name", bioPlaceholder: "Briefly about yourself...", verified: "Verified", loading: "Loading..." },
  ru: { back: "← Назад", title: "Профиль Агента", bioLabel: "О себе (Bio) / Имя", bioPlaceholder: "Кратко о себе...", verified: "Верифицировано", loading: "Загрузка..." },
  id: { back: "← Kembali", title: "Profil Agen", bioLabel: "Bio / Nama", bioPlaceholder: "Singkat tentang diri Anda...", verified: "Terverifikasi", loading: "Memuat..." },
  zh: { back: "← 返回", title: "代理资料", bioLabel: "简介 / 姓名", bioPlaceholder: "简单介绍一下自己...", verified: "已验证", loading: "加载中..." },
  es: { back: "← Volver", title: "Perfil del Agente", bioLabel: "Biografía / Nombre", bioPlaceholder: "Brevemente sobre ti...", verified: "Verificado", loading: "Cargando..." },
  de: { back: "← Zurück", title: "Maklerprofil", bioLabel: "Biografie / Name", bioPlaceholder: "Kurz über dich...", verified: "Verifiziert", loading: "Wird geladen..." },
  fr: { back: "← Retour", title: "Profil de l'Agent", bioLabel: "Bio / Nom", bioPlaceholder: "Brièvement sur vous-même...", verified: "Vérifié", loading: "Chargement..." },
  ja: { back: "← 戻る", title: "エージェントプロフィール", bioLabel: "自己紹介 / 名前", bioPlaceholder: "自分について簡単に...", verified: "確認済み", loading: "読み込み中..." },
  ar: { back: "← رجوع", title: "ملف تعريف الوكيل", bioLabel: "سيرة ذاتية / اسم", bioPlaceholder: "نبذة عنك...", verified: "تم التحقق", loading: "جارٍ التحميل..." },
  pt: { back: "← Voltar", title: "Perfil do Agente", bioLabel: "Biografia / Nome", bioPlaceholder: "Brevemente sobre si...", verified: "Verificado", loading: "Carregando..." },
  hi: { back: "← वापस", title: "एजेंट प्रोफ़ाइल", bioLabel: "बायो / नाम", bioPlaceholder: "संक्षेप में अपने बारे में...", verified: "सत्यापित", loading: "लोड हो रहा है..." }
};

function replaceTranslations(filePath, langObj) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the translations block
  const startRegex = /const translations: Record<string, any> = \{/;
  const startMatch = content.match(startRegex);
  
  if (!startMatch) {
    console.log('Translations not found in ' + filePath);
    return;
  }
  
  const startIdx = startMatch.index;
  let endIdx = -1;
  let braceCount = 0;
  let foundFirstBrace = false;
  
  for (let i = startIdx; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      foundFirstBrace = true;
    } else if (content[i] === '}') {
      braceCount--;
    }
    
    if (foundFirstBrace && braceCount === 0) {
      endIdx = i;
      break;
    }
  }
  
  if (endIdx === -1) {
    console.log('Could not find end of translations in ' + filePath);
    return;
  }
  
  let formattedObj = JSON.stringify(langObj, null, 2)
    // Clean up quotes on keys for readability (optional)
    .replace(/"([^"]+)":/g, '$1:');
    
  const newBlock = `const translations: Record<string, any> = ${formattedObj};`;
  
  content = content.substring(0, startIdx) + newBlock + content.substring(endIdx + 1);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filePath);
}

replaceTranslations('src/app/business/profile/page.tsx', businessLangs);
replaceTranslations('src/app/partner/profile/page.tsx', partnerLangs);
