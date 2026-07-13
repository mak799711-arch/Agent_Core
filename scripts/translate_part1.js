const fs = require('fs');

const mapLangs = {
  en: { placeholder: "Search address...", searchBtn: "Search", searching: "...", locked: "Locked", unlock: "Unlock to edit", lock: "Lock location" },
  ru: { placeholder: "Поиск адреса...", searchBtn: "Найти", searching: "...", locked: "Заблокировано", unlock: "Разблокировать", lock: "Заблокировать" },
  id: { placeholder: "Cari alamat...", searchBtn: "Cari", searching: "...", locked: "Terkunci", unlock: "Buka kunci", lock: "Kunci lokasi" },
  zh: { placeholder: "搜索地址...", searchBtn: "搜索", searching: "...", locked: "已锁定", unlock: "解锁以编辑", lock: "锁定位置" },
  es: { placeholder: "Buscar dirección...", searchBtn: "Buscar", searching: "...", locked: "Bloqueado", unlock: "Desbloquear", lock: "Bloquear ubicación" },
  de: { placeholder: "Adresse suchen...", searchBtn: "Suchen", searching: "...", locked: "Gesperrt", unlock: "Entsperren", lock: "Standort sperren" },
  fr: { placeholder: "Rechercher une adresse...", searchBtn: "Rechercher", searching: "...", locked: "Verrouillé", unlock: "Déverrouiller", lock: "Verrouiller" },
  ja: { placeholder: "住所を検索...", searchBtn: "検索", searching: "...", locked: "ロック済み", unlock: "ロック解除", lock: "位置をロック" },
  ar: { placeholder: "البحث عن عنوان...", searchBtn: "بحث", searching: "...", locked: "مغلق", unlock: "فتح القفل للتحرير", lock: "قفل الموقع" },
  pt: { placeholder: "Pesquisar endereço...", searchBtn: "Pesquisar", searching: "...", locked: "Bloqueado", unlock: "Desbloquear para editar", lock: "Bloquear localização" },
  hi: { placeholder: "पता खोजें...", searchBtn: "खोजें", searching: "...", locked: "लॉक", unlock: "संपादित करने के लिए अनलॉक करें", lock: "स्थान लॉक करें" }
};

const partnerLangs = {
  en: { totalEarnings: "Total Earnings", mapView: "Map View", listView: "List View", exploreMap: "Explore active venues around you. Click a pin to copy your checkout link.", exploreList: "Generate a direct checkout link and send it to the tourist. You will receive commission automatically when they pay.", loading: "Loading Partner Portal..." },
  ru: { totalEarnings: "Общий заработок", mapView: "Карта", listView: "Список", exploreMap: "Исследуйте активные заведения вокруг. Нажмите на пин, чтобы скопировать ссылку.", exploreList: "Сгенерируйте ссылку и отправьте туристу. Вы получите комиссию автоматически после оплаты.", loading: "Загрузка портала партнера..." },
  id: { totalEarnings: "Total Pendapatan", mapView: "Tampilan Peta", listView: "Tampilan Daftar", exploreMap: "Jelajahi tempat aktif di sekitar Anda. Klik pin untuk menyalin tautan.", exploreList: "Hasilkan tautan pembayaran langsung dan kirimkan ke turis. Anda akan menerima komisi otomatis.", loading: "Memuat Portal Mitra..." },
  zh: { totalEarnings: "总收入", mapView: "地图视图", listView: "列表视图", exploreMap: "探索您周围的活跃场所。点击大头针复制您的结账链接。", exploreList: "生成直接结账链接并发送给游客。他们付款后您将自动收到佣金。", loading: "正在加载合作伙伴门户..." },
  es: { totalEarnings: "Ganancias Totales", mapView: "Vista de Mapa", listView: "Vista de Lista", exploreMap: "Explore lugares activos a su alrededor. Haga clic en un pin para copiar su enlace de pago.", exploreList: "Genere un enlace directo y envíelo al turista. Recibirá una comisión automáticamente cuando paguen.", loading: "Cargando Portal de Socios..." },
  de: { totalEarnings: "Gesamteinnahmen", mapView: "Kartenansicht", listView: "Listenansicht", exploreMap: "Erkunden Sie aktive Veranstaltungsorte in Ihrer Nähe. Klicken Sie auf einen Pin, um den Link zu kopieren.", exploreList: "Erstellen Sie einen direkten Checkout-Link und senden Sie ihn an den Touristen. Sie erhalten automatisch eine Provision, wenn diese bezahlen.", loading: "Lade Partnerportal..." },
  fr: { totalEarnings: "Gains Totaux", mapView: "Vue Carte", listView: "Vue Liste", exploreMap: "Explorez les lieux actifs autour de vous. Cliquez sur une épingle pour copier votre lien de paiement.", exploreList: "Générez un lien de paiement direct et envoyez-le au touriste. Vous recevrez une commission automatiquement lorsqu'ils paieront.", loading: "Chargement du Portail Partenaire..." },
  ja: { totalEarnings: "総収益", mapView: "マップビュー", listView: "リストビュー", exploreMap: "あなたの周りのアクティブな会場を探索します。ピンをクリックしてリンクをコピーしてください。", exploreList: "直接のチェックアウトリンクを生成して観光客に送信します。彼らが支払うと自動的にコミッションを受け取ります。", loading: "パートナーポータルを読み込み中..." },
  ar: { totalEarnings: "إجمالي الأرباح", mapView: "عرض الخريطة", listView: "عرض القائمة", exploreMap: "استكشف الأماكن النشطة من حولك. انقر فوق دبوس لنسخ رابط الدفع الخاص بك.", exploreList: "قم بإنشاء رابط دفع مباشر وأرسله إلى السائح. سوف تتلقى عمولة تلقائيًا عند الدفع.", loading: "جارٍ تحميل بوابة الشركاء..." },
  pt: { totalEarnings: "Ganhos Totais", mapView: "Vista de Mapa", listView: "Vista de Lista", exploreMap: "Explore locais ativos ao seu redor. Clique num pino para copiar o seu link de pagamento.", exploreList: "Gere um link de pagamento direto e envie para o turista. Receberá uma comissão automaticamente quando eles pagarem.", loading: "A carregar Portal do Parceiro..." },
  hi: { totalEarnings: "कुल कमाई", mapView: "मानचित्र दृश्य", listView: "सूची दृश्य", exploreMap: "अपने आस-पास सक्रिय स्थानों का अन्वेषण करें। अपने चेकआउट लिंक को कॉपी करने के लिए एक पिन पर क्लिक करें।", exploreList: "एक सीधा चेकआउट लिंक उत्पन्न करें और पर्यटक को भेजें। जब वे भुगतान करेंगे तो आपको स्वचालित रूप से कमीशन प्राप्त होगा।", loading: "पार्टनर पोर्टल लोड हो रहा है..." }
};

const adminLangs = {
  en: {
    admin: "Platform Administrator", exit: "Sign Out", dashboardTitle: "Platform Command Center", loading: "Loading Admin Console...", totalVolume: "Platform Turnover", totalAgents: "Agents Count", totalBusinesses: "Businesses Count", tabActive: "Most Active (Top-10)", tabBanned: "Ban List", tabRequests: "Verification Requests", tabAudit: "Audit & Fraud", status: "Status", role: "Role", agent: "Agent", venue: "Venue", volume: "Turnover", escrow: "Active Escrow", action: "Actions", verified: "VERIFIED", unverified: "UNVERIFIED", banned: "BANNED", banDuration: "Ban Duration", banOptionsTitle: "Select Ban Duration", banOption1d: "1 Day", banOption1w: "1 Week", banOption1m: "1 Month", banOption1y: "1 Year", banOptionForever: "Forever", btnCancel: "Cancel", unban: "Unban User", successUpdate: "Action completed successfully!", promoters: "Active Promoters & Agents", merchants: "Active Restaurants & Beach Clubs", emptyActiveAgents: "No active promoters registered yet.", emptyActiveVenues: "No active businesses registered yet.", emptyBanned: "All users are in good standing. Ban list is empty.", emptyRequests: "Verification queue is empty.", emptySessions: "No sessions match your search criteria.", searchCode: "Search by Code", searchPromoter: "Search by Promoter ID", btnFlag: "Flag Fraud", btnBlock: "Block Promoter", btnUnblock: "Unblock", geoLocation: "Location", sessionCode: "Session Code", created: "Created At"
  },
  ru: {
    admin: "Администратор платформы", exit: "Выход", dashboardTitle: "Командный центр платформы", loading: "Загрузка консоли администратора...", totalVolume: "Оборот платформы", totalAgents: "Кол-во агентов", totalBusinesses: "Кол-во заведений", tabActive: "Самые активные (Топ-10)", tabBanned: "Бан-лист", tabRequests: "Запросы верификации", tabAudit: "Аудит и Фрод", status: "Статус", role: "Роль", agent: "Агент", venue: "Заведение", volume: "Оборот", escrow: "В холде (Escrow)", action: "Действия", verified: "ВЕРИФИЦИРОВАН", unverified: "НЕ ВЕРИФИЦИРОВАН", banned: "В БАНЕ", banDuration: "Срок блокировки", banOptionsTitle: "Выберите срок", banOption1d: "1 день", banOption1w: "1 неделя", banOption1m: "1 месяц", banOption1y: "1 год", banOptionForever: "Навсегда", btnCancel: "Отмена", unban: "Разбанить", successUpdate: "Действие выполнено!", promoters: "Активные промоутеры", merchants: "Активные рестораны/клубы", emptyActiveAgents: "Нет активных агентов.", emptyActiveVenues: "Нет активных заведений.", emptyBanned: "Бан-лист пуст.", emptyRequests: "Очередь верификации пуста.", emptySessions: "Нет сессий.", searchCode: "Поиск по коду", searchPromoter: "Поиск по ID промоутера", btnFlag: "Отметить фрод", btnBlock: "Заблокировать", btnUnblock: "Разблокировать", geoLocation: "Локация", sessionCode: "Код сессии", created: "Создано"
  },
  id: {
    admin: "Administrator Platform", exit: "Keluar", dashboardTitle: "Pusat Komando Platform", loading: "Memuat Konsol Admin...", totalVolume: "Omset Platform", totalAgents: "Jumlah Agen", totalBusinesses: "Jumlah Bisnis", tabActive: "Paling Aktif (Top-10)", tabBanned: "Daftar Blokir", tabRequests: "Permintaan Verifikasi", tabAudit: "Audit & Penipuan", status: "Status", role: "Peran", agent: "Agen", venue: "Tempat", volume: "Omset", escrow: "Escrow Aktif", action: "Aksi", verified: "TERVERIFIKASI", unverified: "BELUM TERVERIFIKASI", banned: "DIBLOKIR", banDuration: "Durasi Blokir", banOptionsTitle: "Pilih Durasi Blokir", banOption1d: "1 Hari", banOption1w: "1 Minggu", banOption1m: "1 Bulan", banOption1y: "1 Tahun", banOptionForever: "Selamanya", btnCancel: "Batal", unban: "Buka Blokir Pengguna", successUpdate: "Tindakan berhasil diselesaikan!", promoters: "Promotor & Agen Aktif", merchants: "Restoran & Klub Pantai Aktif", emptyActiveAgents: "Belum ada promotor aktif.", emptyActiveVenues: "Belum ada bisnis aktif.", emptyBanned: "Semua pengguna dalam status baik.", emptyRequests: "Antrean verifikasi kosong.", emptySessions: "Tidak ada sesi.", searchCode: "Cari dengan Kode", searchPromoter: "Cari dengan ID Promotor", btnFlag: "Tandai Penipuan", btnBlock: "Blokir Promotor", btnUnblock: "Buka Blokir", geoLocation: "Lokasi", sessionCode: "Kode Sesi", created: "Dibuat Pada"
  },
  zh: {
    admin: "平台管理员", exit: "退出", dashboardTitle: "平台指挥中心", loading: "正在加载管理控制台...", totalVolume: "平台营业额", totalAgents: "代理数量", totalBusinesses: "商户数量", tabActive: "最活跃 (Top-10)", tabBanned: "封禁名单", tabRequests: "验证请求", tabAudit: "审计与欺诈", status: "状态", role: "角色", agent: "代理", venue: "场所", volume: "营业额", escrow: "活跃托管", action: "操作", verified: "已验证", unverified: "未验证", banned: "已封禁", banDuration: "封禁时长", banOptionsTitle: "选择封禁时长", banOption1d: "1 天", banOption1w: "1 周", banOption1m: "1 个月", banOption1y: "1 年", banOptionForever: "永久", btnCancel: "取消", unban: "解封用户", successUpdate: "操作成功完成！", promoters: "活跃推广员和代理", merchants: "活跃餐厅和海滩俱乐部", emptyActiveAgents: "暂无活跃推广员注册。", emptyActiveVenues: "暂无活跃商户注册。", emptyBanned: "所有用户状态良好。封禁名单为空。", emptyRequests: "验证队列为空。", emptySessions: "没有符合搜索条件的会话。", searchCode: "按代码搜索", searchPromoter: "按推广员ID搜索", btnFlag: "标记欺诈", btnBlock: "封禁推广员", btnUnblock: "解除封禁", geoLocation: "位置", sessionCode: "会话代码", created: "创建时间"
  },
  es: {
    admin: "Administrador de la Plataforma", exit: "Cerrar sesión", dashboardTitle: "Centro de Comando", loading: "Cargando Consola de Admin...", totalVolume: "Facturación de la Plataforma", totalAgents: "Conteo de Agentes", totalBusinesses: "Conteo de Negocios", tabActive: "Más Activos (Top-10)", tabBanned: "Lista de Baneos", tabRequests: "Solicitudes de Verificación", tabAudit: "Auditoría y Fraude", status: "Estado", role: "Rol", agent: "Agente", venue: "Lugar", volume: "Facturación", escrow: "Escrow Activo", action: "Acciones", verified: "VERIFICADO", unverified: "NO VERIFICADO", banned: "BANEADO", banDuration: "Duración del Baneo", banOptionsTitle: "Seleccione la Duración", banOption1d: "1 Día", banOption1w: "1 Semana", banOption1m: "1 Mes", banOption1y: "1 Año", banOptionForever: "Para siempre", btnCancel: "Cancelar", unban: "Desbanear Usuario", successUpdate: "¡Acción completada con éxito!", promoters: "Promotores Activos", merchants: "Restaurantes Activos", emptyActiveAgents: "No hay promotores registrados.", emptyActiveVenues: "No hay negocios registrados.", emptyBanned: "La lista de baneos está vacía.", emptyRequests: "La cola de verificación está vacía.", emptySessions: "No hay sesiones.", searchCode: "Buscar por Código", searchPromoter: "Buscar por ID", btnFlag: "Marcar Fraude", btnBlock: "Bloquear Promotor", btnUnblock: "Desbloquear", geoLocation: "Ubicación", sessionCode: "Código de Sesión", created: "Creado en"
  },
  de: {
    admin: "Plattform-Administrator", exit: "Abmelden", dashboardTitle: "Plattform-Kommandozentrale", loading: "Lade Admin-Konsole...", totalVolume: "Plattform-Umsatz", totalAgents: "Anzahl Agenten", totalBusinesses: "Anzahl Unternehmen", tabActive: "Am aktivsten (Top-10)", tabBanned: "Bann-Liste", tabRequests: "Verifizierungsanfragen", tabAudit: "Audit & Betrug", status: "Status", role: "Rolle", agent: "Agent", venue: "Veranstaltungsort", volume: "Umsatz", escrow: "Aktives Treuhandkonto", action: "Aktionen", verified: "VERIFIZIERT", unverified: "UNVERIFIZIERT", banned: "GEBANNT", banDuration: "Bann-Dauer", banOptionsTitle: "Bann-Dauer auswählen", banOption1d: "1 Tag", banOption1w: "1 Woche", banOption1m: "1 Monat", banOption1y: "1 Jahr", banOptionForever: "Für immer", btnCancel: "Abbrechen", unban: "Benutzer entbannen", successUpdate: "Aktion erfolgreich abgeschlossen!", promoters: "Aktive Promoter", merchants: "Aktive Restaurants", emptyActiveAgents: "Noch keine aktiven Promoter.", emptyActiveVenues: "Noch keine aktiven Unternehmen.", emptyBanned: "Bann-Liste ist leer.", emptyRequests: "Verifizierungs-Warteschlange ist leer.", emptySessions: "Keine Sitzungen.", searchCode: "Nach Code suchen", searchPromoter: "Nach Promoter-ID suchen", btnFlag: "Betrug markieren", btnBlock: "Promoter blockieren", btnUnblock: "Entblocken", geoLocation: "Standort", sessionCode: "Sitzungscode", created: "Erstellt am"
  },
  fr: {
    admin: "Administrateur de Plateforme", exit: "Se déconnecter", dashboardTitle: "Centre de Commande", loading: "Chargement de la Console Admin...", totalVolume: "Chiffre d'Affaires", totalAgents: "Nombre d'Agents", totalBusinesses: "Nombre d'Entreprises", tabActive: "Les Plus Actifs (Top-10)", tabBanned: "Liste des Bannis", tabRequests: "Demandes de Vérification", tabAudit: "Audit & Fraude", status: "Statut", role: "Rôle", agent: "Agent", venue: "Lieu", volume: "Chiffre d'Affaires", escrow: "Séquestre Actif", action: "Actions", verified: "VÉRIFIÉ", unverified: "NON VÉRIFIÉ", banned: "BANNI", banDuration: "Durée du Bannissement", banOptionsTitle: "Sélectionner la Durée", banOption1d: "1 Jour", banOption1w: "1 Semaine", banOption1m: "1 Mois", banOption1y: "1 An", banOptionForever: "Pour toujours", btnCancel: "Annuler", unban: "Débannir", successUpdate: "Action terminée avec succès !", promoters: "Promoteurs Actifs", merchants: "Restaurants Actifs", emptyActiveAgents: "Aucun promoteur enregistré.", emptyActiveVenues: "Aucune entreprise enregistrée.", emptyBanned: "La liste est vide.", emptyRequests: "La file est vide.", emptySessions: "Aucune session.", searchCode: "Chercher par Code", searchPromoter: "Chercher par ID", btnFlag: "Signaler Fraude", btnBlock: "Bloquer", btnUnblock: "Débloquer", geoLocation: "Emplacement", sessionCode: "Code de Session", created: "Créé à"
  },
  ja: {
    admin: "プラットフォーム管理者", exit: "サインアウト", dashboardTitle: "プラットフォームコマンドセンター", loading: "管理コンソールを読み込み中...", totalVolume: "プラットフォーム売上", totalAgents: "エージェント数", totalBusinesses: "ビジネス数", tabActive: "最もアクティブ (トップ10)", tabBanned: "アクセス禁止リスト", tabRequests: "検証リクエスト", tabAudit: "監査と不正", status: "ステータス", role: "役割", agent: "エージェント", venue: "会場", volume: "売上", escrow: "アクティブエスクロー", action: "アクション", verified: "確認済み", unverified: "未確認", banned: "禁止", banDuration: "禁止期間", banOptionsTitle: "禁止期間を選択", banOption1d: "1日", banOption1w: "1週間", banOption1m: "1ヶ月", banOption1y: "1年", banOptionForever: "永久", btnCancel: "キャンセル", unban: "禁止解除", successUpdate: "アクションが正常に完了しました！", promoters: "アクティブプロモーター", merchants: "アクティブレストラン", emptyActiveAgents: "プロモーターはまだいません。", emptyActiveVenues: "ビジネスはまだいません。", emptyBanned: "禁止リストは空です。", emptyRequests: "検証キューは空です。", emptySessions: "セッションはありません。", searchCode: "コードで検索", searchPromoter: "プロモーターIDで検索", btnFlag: "不正を報告", btnBlock: "ブロック", btnUnblock: "ブロック解除", geoLocation: "場所", sessionCode: "セッションコード", created: "作成日時"
  },
  ar: {
    admin: "مسؤول المنصة", exit: "تسجيل الخروج", dashboardTitle: "مركز قيادة المنصة", loading: "جارٍ تحميل وحدة تحكم المسؤول...", totalVolume: "إجمالي حجم التداول", totalAgents: "عدد الوكلاء", totalBusinesses: "عدد الأعمال", tabActive: "الأكثر نشاطا (أفضل 10)", tabBanned: "قائمة الحظر", tabRequests: "طلبات التحقق", tabAudit: "التدقيق والاحتيال", status: "الحالة", role: "الدور", agent: "الوكيل", venue: "المكان", volume: "حجم التداول", escrow: "الضمان النشط", action: "إجراءات", verified: "تم التحقق", unverified: "غير مؤكد", banned: "محظور", banDuration: "مدة الحظر", banOptionsTitle: "اختر مدة الحظر", banOption1d: "1 يوم", banOption1w: "1 أسبوع", banOption1m: "1 شهر", banOption1y: "1 سنة", banOptionForever: "إلى الأبد", btnCancel: "إلغاء", unban: "رفع الحظر", successUpdate: "تم الإجراء بنجاح!", promoters: "المروجون النشطون", merchants: "المطاعم النشطة", emptyActiveAgents: "لا يوجد مروجون مسجلون.", emptyActiveVenues: "لا يوجد أعمال مسجلة.", emptyBanned: "قائمة الحظر فارغة.", emptyRequests: "طابور التحقق فارغ.", emptySessions: "لا توجد جلسات.", searchCode: "البحث بالرمز", searchPromoter: "البحث بمعرف المروج", btnFlag: "الإبلاغ عن احتيال", btnBlock: "حظر المروج", btnUnblock: "رفع الحظر", geoLocation: "الموقع", sessionCode: "رمز الجلسة", created: "تاريخ الإنشاء"
  },
  pt: {
    admin: "Administrador da Plataforma", exit: "Sair", dashboardTitle: "Centro de Comando", loading: "Carregando Consola...", totalVolume: "Faturação", totalAgents: "Contagem de Agentes", totalBusinesses: "Contagem de Negócios", tabActive: "Mais Ativos (Top-10)", tabBanned: "Lista de Banidos", tabRequests: "Pedidos de Verificação", tabAudit: "Auditoria e Fraude", status: "Status", role: "Função", agent: "Agente", venue: "Local", volume: "Faturação", escrow: "Garantia Ativa", action: "Ações", verified: "VERIFICADO", unverified: "NÃO VERIFICADO", banned: "BANIDO", banDuration: "Duração do Banimento", banOptionsTitle: "Selecione a Duração", banOption1d: "1 Dia", banOption1w: "1 Semana", banOption1m: "1 Mês", banOption1y: "1 Ano", banOptionForever: "Para sempre", btnCancel: "Cancelar", unban: "Desbanir", successUpdate: "Ação concluída com sucesso!", promoters: "Promotores Ativos", merchants: "Restaurantes Ativos", emptyActiveAgents: "Nenhum promotor.", emptyActiveVenues: "Nenhum negócio.", emptyBanned: "Lista de banidos está vazia.", emptyRequests: "Fila de verificação vazia.", emptySessions: "Nenhuma sessão.", searchCode: "Pesquisar por Código", searchPromoter: "Pesquisar por ID", btnFlag: "Sinalizar Fraude", btnBlock: "Bloquear", btnUnblock: "Desbloquear", geoLocation: "Localização", sessionCode: "Código da Sessão", created: "Criado em"
  },
  hi: {
    admin: "प्लेटफ़ॉर्म व्यवस्थापक", exit: "साइन आउट", dashboardTitle: "प्लेटफ़ॉर्म कमांड सेंटर", loading: "व्यवस्थापक कंसोल लोड हो रहा है...", totalVolume: "प्लेटफ़ॉर्म टर्नओवर", totalAgents: "एजेंटों की संख्या", totalBusinesses: "व्यवसायों की संख्या", tabActive: "सबसे सक्रिय (टॉप-10)", tabBanned: "प्रतिबंध सूची", tabRequests: "सत्यापन अनुरोध", tabAudit: "ऑडिट और धोखाधड़ी", status: "स्थिति", role: "भूमिका", agent: "एजेंट", venue: "स्थान", volume: "टर्नओवर", escrow: "सक्रिय एस्क्रो", action: "कार्रवाई", verified: "सत्यापित", unverified: "असत्यापित", banned: "प्रतिबंधित", banDuration: "प्रतिबंध अवधि", banOptionsTitle: "प्रतिबंध अवधि चुनें", banOption1d: "1 दिन", banOption1w: "1 सप्ताह", banOption1m: "1 महीना", banOption1y: "1 वर्ष", banOptionForever: "हमेशा के लिए", btnCancel: "रद्द करें", unban: "अनबैन करें", successUpdate: "कार्रवाई सफलतापूर्वक पूरी हुई!", promoters: "सक्रिय प्रमोटर", merchants: "सक्रिय रेस्तरां", emptyActiveAgents: "कोई प्रमोटर पंजीकृत नहीं।", emptyActiveVenues: "कोई व्यवसाय पंजीकृत नहीं।", emptyBanned: "प्रतिबंध सूची खाली है।", emptyRequests: "सत्यापन कतार खाली है।", emptySessions: "कोई सत्र नहीं।", searchCode: "कोड द्वारा खोजें", searchPromoter: "प्रमोटर आईडी द्वारा खोजें", btnFlag: "धोखाधड़ी चिह्नित करें", btnBlock: "ब्लॉक करें", btnUnblock: "अनब्लॉक करें", geoLocation: "स्थान", sessionCode: "सत्र कोड", created: "पर बनाया गया"
  }
};

function replaceTranslations(filePath, langObj, varName = "translations") {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const startRegex = new RegExp("const " + varName + "(?:[^=]*)=\\s*\\{");
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
  
  let formattedObj = JSON.stringify(langObj, null, 2).replace(/"([^"]+)":/g, '$1:');
  const typeStr = varName === "mapTranslations" ? ": Record<string, any>" : "";
  const newBlock = `const ${varName}${typeStr} = ${formattedObj};`;
  
  content = content.substring(0, startIdx) + newBlock + content.substring(endIdx + 1);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filePath);
}

replaceTranslations('src/app/components/LocationPickerMap.tsx', mapLangs, "mapTranslations");
replaceTranslations('src/app/partner/page.tsx', partnerLangs);
replaceTranslations('src/app/admin/page.tsx', adminLangs);
