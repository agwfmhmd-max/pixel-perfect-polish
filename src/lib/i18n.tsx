import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "fr" | "ar";

const STORAGE_KEY = "mda-lang";

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.about": "About",
  "nav.education": "Education",
  "nav.experience": "Experience",
  "nav.skills": "Skills",
  "nav.projects": "Projects",
  "nav.contact": "Contact",
  "nav.menu": "Open menu",
  "nav.theme": "Toggle theme",

  "hero.eyebrow": "Finance · Technology · Innovation",
  "hero.role1": "Banque & Assurance Student",
  "hero.role2": "Software Developer",
  "hero.tagline":
    "Building digital solutions at the intersection of finance, technology and innovation.",
  "hero.cta.projects": "View My Projects",
  "hero.cta.contact": "Contact Me",
  "hero.card.title": "Digital Finance Layer",
  "hero.card.metric1": "Projects shipped",
  "hero.card.metric2": "Banking supervision",
  "hero.card.metric3": "Platforms in production",
  "hero.card.note": "I understand finance, I understand business, and I build technology.",

  "about.title": "About Me",
  "about.kicker": "Who I am",
  "about.p1":
    "I am Mohamed Dah Agove, a third-year Banque et Assurance student at the Institut Supérieur de Comptabilité et d'Administration des Entreprises (ISCAE).",
  "about.p2":
    "Alongside my academic path, I develop software and build web applications that help institutions and students manage information and digital services more effectively.",
  "about.p3":
    "I enjoy combining knowledge in banking, finance, accounting and insurance with technology and software development, in order to design modern solutions for institutions and the financial sector.",

  "education.title": "Education",
  "education.kicker": "Academic path",
  "education.current": "Current",

  "experience.title": "Professional Experience",
  "experience.kicker": "Field practice",
  "experience.department": "Department",

  "skills.title": "Skills & Expertise",
  "skills.kicker": "What I work with",

  "projects.title": "Featured Projects",
  "projects.kicker": "Selected work",
  "projects.all": "All",
  "projects.visit": "Visit Project",
  "projects.details": "Details",
  "projects.featured": "Featured",
  "projects.empty": "No projects in this category yet.",
  "projects.overview": "Overview",
  "projects.problem": "Problem",
  "projects.solution": "Solution",
  "projects.features": "Features",
  "projects.tech": "Technologies",
  "projects.tbd": "To be completed.",
  "projects.github": "GitHub",

  "journey.title": "My Journey",
  "journey.kicker": "Timeline",

  "stats.projects": "Projects",
  "stats.internship": "Internship",
  "stats.journey": "Academic Journey",
  "stats.solutions": "Digital Solutions",

  "contact.title": "Let's Work Together",
  "contact.kicker": "Contact",
  "contact.intro": "Have a project, opportunity or idea? I'd be happy to connect.",
  "contact.name": "Name",
  "contact.email": "Email",
  "contact.subject": "Subject",
  "contact.message": "Message",
  "contact.send": "Send Message",
  "contact.sending": "Sending...",
  "contact.success": "Message sent. Thank you!",
  "contact.error": "Could not send the message. Please try again.",

  "cta.title": "Let's build something meaningful.",
  "cta.button": "Get In Touch",

  "footer.rights": "All rights reserved.",

  "auth.title": "Developer Access",
  "auth.subtitle": "Sign in to manage your portfolio.",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.signin": "Sign In",
  "auth.forgot": "Forgot password?",
  "auth.invalid": "Invalid email or password",
  "auth.reset.sent": "Password reset email sent.",
  "auth.show": "Show password",
  "auth.hide": "Hide password",
};

const fr: Dict = {
  "nav.home": "Accueil",
  "nav.about": "À propos",
  "nav.education": "Formation",
  "nav.experience": "Expérience",
  "nav.skills": "Compétences",
  "nav.projects": "Projets",
  "nav.contact": "Contact",
  "nav.menu": "Ouvrir le menu",
  "nav.theme": "Changer le thème",

  "hero.eyebrow": "Finance · Technologie · Innovation",
  "hero.role1": "Étudiant en Banque et Assurance",
  "hero.role2": "Développeur de logiciels",
  "hero.tagline":
    "Concevoir des solutions numériques à la croisée de la finance, de la technologie et de l'innovation.",
  "hero.cta.projects": "Voir mes projets",
  "hero.cta.contact": "Me contacter",
  "hero.card.title": "Couche financière numérique",
  "hero.card.metric1": "Projets réalisés",
  "hero.card.metric2": "Supervision bancaire",
  "hero.card.metric3": "Plateformes en production",
  "hero.card.note":
    "Je comprends la finance, je comprends l'entreprise, et je construis la technologie.",

  "about.title": "À propos de moi",
  "about.kicker": "Qui je suis",
  "about.p1":
    "Je suis Mohamed Dah Agove, étudiant en troisième année de Banque et Assurance à l'Institut Supérieur de Comptabilité et d'Administration des Entreprises (ISCAE).",
  "about.p2":
    "Parallèlement à mon parcours académique, je développe des logiciels et des applications web qui aident les institutions et les étudiants à mieux gérer l'information et les services numériques.",
  "about.p3":
    "J'aime associer les connaissances en banque, finance, comptabilité et assurance à la technologie et au développement logiciel, afin de concevoir des solutions modernes pour les institutions et le secteur financier.",

  "education.title": "Formation",
  "education.kicker": "Parcours académique",
  "education.current": "En cours",

  "experience.title": "Expérience professionnelle",
  "experience.kicker": "Pratique sur le terrain",
  "experience.department": "Direction",

  "skills.title": "Compétences & expertise",
  "skills.kicker": "Mes outils",

  "projects.title": "Projets phares",
  "projects.kicker": "Réalisations sélectionnées",
  "projects.all": "Tous",
  "projects.visit": "Voir le projet",
  "projects.details": "Détails",
  "projects.featured": "Projet phare",
  "projects.empty": "Aucun projet dans cette catégorie pour le moment.",
  "projects.overview": "Présentation",
  "projects.problem": "Problématique",
  "projects.solution": "Solution",
  "projects.features": "Fonctionnalités",
  "projects.tech": "Technologies",
  "projects.tbd": "À compléter.",
  "projects.github": "GitHub",

  "journey.title": "Mon parcours",
  "journey.kicker": "Chronologie",

  "stats.projects": "Projets",
  "stats.internship": "Stage",
  "stats.journey": "Parcours académique",
  "stats.solutions": "Solutions numériques",

  "contact.title": "Travaillons ensemble",
  "contact.kicker": "Contact",
  "contact.intro": "Un projet, une opportunité ou une idée ? Je serais ravi d'échanger.",
  "contact.name": "Nom",
  "contact.email": "E-mail",
  "contact.subject": "Objet",
  "contact.message": "Message",
  "contact.send": "Envoyer le message",
  "contact.sending": "Envoi...",
  "contact.success": "Message envoyé. Merci !",
  "contact.error": "Envoi impossible. Veuillez réessayer.",

  "cta.title": "Construisons quelque chose d'utile.",
  "cta.button": "Me contacter",

  "footer.rights": "Tous droits réservés.",

  "auth.title": "Accès développeur",
  "auth.subtitle": "Connectez-vous pour gérer votre portfolio.",
  "auth.email": "E-mail",
  "auth.password": "Mot de passe",
  "auth.signin": "Se connecter",
  "auth.forgot": "Mot de passe oublié ?",
  "auth.invalid": "E-mail ou mot de passe invalide",
  "auth.reset.sent": "E-mail de réinitialisation envoyé.",
  "auth.show": "Afficher le mot de passe",
  "auth.hide": "Masquer le mot de passe",
};

const ar: Dict = {
  "nav.home": "الرئيسية",
  "nav.about": "نبذة",
  "nav.education": "التعليم",
  "nav.experience": "الخبرة",
  "nav.skills": "المهارات",
  "nav.projects": "المشاريع",
  "nav.contact": "التواصل",
  "nav.menu": "فتح القائمة",
  "nav.theme": "تغيير المظهر",

  "hero.eyebrow": "مالية · تقنية · ابتكار",
  "hero.role1": "طالب في البنوك والتأمين",
  "hero.role2": "مطوّر برمجيات",
  "hero.tagline": "بناء حلول رقمية عند تقاطع المالية والتقنية والابتكار.",
  "hero.cta.projects": "استعرض مشاريعي",
  "hero.cta.contact": "تواصل معي",
  "hero.card.title": "طبقة مالية رقمية",
  "hero.card.metric1": "مشاريع منجزة",
  "hero.card.metric2": "الرقابة المصرفية",
  "hero.card.metric3": "منصات قيد التشغيل",
  "hero.card.note": "أفهم المالية، وأفهم إدارة الأعمال، وأبني التقنية.",

  "about.title": "نبذة عني",
  "about.kicker": "من أنا",
  "about.p1":
    "أنا محمد داه أگوﭪ، طالب في السنة الثالثة تخصص البنوك والتأمين في المعهد العالي للمحاسبة وإدارة المؤسسات (ISCAE).",
  "about.p2":
    "إلى جانب مساري الأكاديمي، أطوّر البرمجيات وأبني تطبيقات ومواقع ويب تساعد المؤسسات والطلاب على تحسين إدارة المعلومات والخدمات الرقمية.",
  "about.p3":
    "أجمع بين المعرفة في المصارف والمالية والمحاسبة والتأمين وبين التقنية وتطوير البرمجيات، بهدف تصميم حلول حديثة تخدم المؤسسات والقطاع المالي.",

  "education.title": "التعليم",
  "education.kicker": "المسار الأكاديمي",
  "education.current": "حالياً",

  "experience.title": "الخبرة المهنية",
  "experience.kicker": "التطبيق الميداني",
  "experience.department": "الإدارة",

  "skills.title": "المهارات والخبرات",
  "skills.kicker": "أدواتي",

  "projects.title": "أبرز المشاريع",
  "projects.kicker": "أعمال مختارة",
  "projects.all": "الكل",
  "projects.visit": "زيارة المشروع",
  "projects.details": "التفاصيل",
  "projects.featured": "مشروع رئيسي",
  "projects.empty": "لا توجد مشاريع في هذا التصنيف حالياً.",
  "projects.overview": "نظرة عامة",
  "projects.problem": "الإشكالية",
  "projects.solution": "الحل",
  "projects.features": "الميزات",
  "projects.tech": "التقنيات",
  "projects.tbd": "قابل للتعديل لاحقاً.",
  "projects.github": "GitHub",

  "journey.title": "مسيرتي",
  "journey.kicker": "الخط الزمني",

  "stats.projects": "مشاريع",
  "stats.internship": "تدريب",
  "stats.journey": "مسار أكاديمي",
  "stats.solutions": "حلول رقمية",

  "contact.title": "لنعمل معاً",
  "contact.kicker": "التواصل",
  "contact.intro": "لديك مشروع أو فرصة أو فكرة؟ يسعدني التواصل معك.",
  "contact.name": "الاسم",
  "contact.email": "البريد الإلكتروني",
  "contact.subject": "الموضوع",
  "contact.message": "الرسالة",
  "contact.send": "إرسال الرسالة",
  "contact.sending": "جاري الإرسال...",
  "contact.success": "تم إرسال الرسالة. شكراً لك!",
  "contact.error": "تعذّر إرسال الرسالة. يرجى المحاولة مجدداً.",

  "cta.title": "لنبنِ شيئاً ذا قيمة.",
  "cta.button": "تواصل معي",

  "footer.rights": "جميع الحقوق محفوظة.",

  "auth.title": "دخول المطوّر",
  "auth.subtitle": "سجّل الدخول لإدارة موقعك.",
  "auth.email": "البريد الإلكتروني",
  "auth.password": "كلمة المرور",
  "auth.signin": "تسجيل الدخول",
  "auth.forgot": "نسيت كلمة المرور؟",
  "auth.invalid": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "auth.reset.sent": "تم إرسال رابط إعادة التعيين.",
  "auth.show": "إظهار كلمة المرور",
  "auth.hide": "إخفاء كلمة المرور",
};

// --------------------------- Dashboard (admin) strings ---------------------------
Object.assign(en, {
  "admin.title": "Admin",
  "admin.dashboard": "Dashboard",
  "admin.profile": "Profile",
  "admin.education": "Education",
  "admin.experience": "Experience",
  "admin.skills": "Skills",
  "admin.projects": "Projects",
  "admin.social": "Social Links",
  "admin.stats": "Statistics",
  "admin.messages": "Messages",
  "admin.media": "Media Library",
  "admin.texts": "Site Texts",
  "admin.settings": "Site Settings",
  "admin.logout": "Logout",
  "admin.viewSite": "View site",
  "admin.language": "Language",
  "admin.welcome": "Welcome back",
  "admin.welcomeSub": "Manage your portfolio content.",
  "admin.latestProjects": "Latest projects",
  "admin.manage": "Manage",
  "admin.noProjects": "No projects yet.",
  "admin.new": "New",
  "admin.edit": "Edit",
  "admin.delete": "Delete",
  "admin.cancel": "Cancel",
  "admin.save": "Save",
  "admin.saveChanges": "Save Changes",
  "admin.saved": "Changes saved successfully",
  "admin.deleted": "Deleted",
  "admin.deleteConfirm": "Are you sure you want to delete this item?",
  "admin.deleteWarning": "This action cannot be undone.",
  "admin.empty": "Nothing here yet. Create your first entry.",
  "admin.create": "Create",
  "admin.update": "Update",
  "admin.restricted": "Restricted area",
  "admin.restrictedSub": "You need to sign in to manage this portfolio.",
  "admin.signin": "Sign in",
  "admin.media.upload": "Upload image",
  "admin.media.uploading": "Uploading...",
  "admin.media.empty": "Your media library is empty. Upload your first image.",
  "admin.media.choose": "Choose from library",
  "admin.media.change": "Change image",
  "admin.media.remove": "Remove image",
  "admin.media.pick": "Pick an image",
  "admin.media.select": "Select",
  "admin.media.copy": "Copy URL",
  "admin.media.copied": "URL copied",
  "admin.media.deleted": "Image deleted",
  "admin.media.hint": "Images are stored in Supabase Storage.",
  "admin.texts.title": "Site Texts",
  "admin.texts.sub": "Edit every interface text in the three languages.",
  "admin.texts.search": "Search a text...",
  "admin.texts.reset": "Reset to default",
  "admin.langTabs": "Content language",
});

Object.assign(fr, {
  "admin.title": "Admin",
  "admin.dashboard": "Tableau de bord",
  "admin.profile": "Profil",
  "admin.education": "Formation",
  "admin.experience": "Expérience",
  "admin.skills": "Compétences",
  "admin.projects": "Projets",
  "admin.social": "Réseaux sociaux",
  "admin.stats": "Statistiques",
  "admin.messages": "Messages",
  "admin.media": "Médiathèque",
  "admin.texts": "Textes du site",
  "admin.settings": "Paramètres du site",
  "admin.logout": "Déconnexion",
  "admin.viewSite": "Voir le site",
  "admin.language": "Langue",
  "admin.welcome": "Bon retour",
  "admin.welcomeSub": "Gérez le contenu de votre portfolio.",
  "admin.latestProjects": "Derniers projets",
  "admin.manage": "Gérer",
  "admin.noProjects": "Aucun projet pour le moment.",
  "admin.new": "Nouveau",
  "admin.edit": "Modifier",
  "admin.delete": "Supprimer",
  "admin.cancel": "Annuler",
  "admin.save": "Enregistrer",
  "admin.saveChanges": "Enregistrer les modifications",
  "admin.saved": "Modifications enregistrées",
  "admin.deleted": "Supprimé",
  "admin.deleteConfirm": "Voulez-vous vraiment supprimer cet élément ?",
  "admin.deleteWarning": "Cette action est irréversible.",
  "admin.empty": "Rien pour le moment. Créez votre première entrée.",
  "admin.create": "Créer",
  "admin.update": "Modifier",
  "admin.restricted": "Zone réservée",
  "admin.restrictedSub": "Connectez-vous pour gérer ce portfolio.",
  "admin.signin": "Se connecter",
  "admin.media.upload": "Téléverser une image",
  "admin.media.uploading": "Téléversement...",
  "admin.media.empty": "Votre médiathèque est vide. Téléversez votre première image.",
  "admin.media.choose": "Choisir dans la médiathèque",
  "admin.media.change": "Changer l'image",
  "admin.media.remove": "Retirer l'image",
  "admin.media.pick": "Choisir une image",
  "admin.media.select": "Sélectionner",
  "admin.media.copy": "Copier l'URL",
  "admin.media.copied": "URL copiée",
  "admin.media.deleted": "Image supprimée",
  "admin.media.hint": "Les images sont stockées dans Supabase Storage.",
  "admin.texts.title": "Textes du site",
  "admin.texts.sub": "Modifiez chaque texte de l'interface dans les trois langues.",
  "admin.texts.search": "Rechercher un texte...",
  "admin.texts.reset": "Réinitialiser",
  "admin.langTabs": "Langue du contenu",
});

Object.assign(ar, {
  "admin.title": "لوحة التحكم",
  "admin.dashboard": "الرئيسية",
  "admin.profile": "الملف الشخصي",
  "admin.education": "التعليم",
  "admin.experience": "الخبرة",
  "admin.skills": "المهارات",
  "admin.projects": "المشاريع",
  "admin.social": "روابط التواصل",
  "admin.stats": "الإحصائيات",
  "admin.messages": "الرسائل",
  "admin.media": "معرض الصور",
  "admin.texts": "نصوص الموقع",
  "admin.settings": "إعدادات الموقع",
  "admin.logout": "تسجيل الخروج",
  "admin.viewSite": "عرض الموقع",
  "admin.language": "اللغة",
  "admin.welcome": "مرحبًا بعودتك",
  "admin.welcomeSub": "قم بإدارة محتوى موقعك.",
  "admin.latestProjects": "أحدث المشاريع",
  "admin.manage": "إدارة",
  "admin.noProjects": "لا توجد مشاريع بعد.",
  "admin.new": "إضافة",
  "admin.edit": "تعديل",
  "admin.delete": "حذف",
  "admin.cancel": "إلغاء",
  "admin.save": "حفظ",
  "admin.saveChanges": "حفظ التعديلات",
  "admin.saved": "تم حفظ التعديلات بنجاح",
  "admin.deleted": "تم الحذف",
  "admin.deleteConfirm": "هل أنت متأكد من حذف هذا العنصر؟",
  "admin.deleteWarning": "لا يمكن التراجع عن هذا الإجراء.",
  "admin.empty": "لا يوجد شيء بعد. أضف أول عنصر.",
  "admin.create": "إضافة",
  "admin.update": "تعديل",
  "admin.restricted": "منطقة محظورة",
  "admin.restrictedSub": "يجب تسجيل الدخول لإدارة الموقع.",
  "admin.signin": "تسجيل الدخول",
  "admin.media.upload": "رفع صورة",
  "admin.media.uploading": "جارٍ الرفع...",
  "admin.media.empty": "المعرض فارغ. ارفع أول صورة.",
  "admin.media.choose": "اختر من المعرض",
  "admin.media.change": "تغيير الصورة",
  "admin.media.remove": "إزالة الصورة",
  "admin.media.pick": "اختر صورة",
  "admin.media.select": "اختيار",
  "admin.media.copy": "نسخ الرابط",
  "admin.media.copied": "تم نسخ الرابط",
  "admin.media.deleted": "تم حذف الصورة",
  "admin.media.hint": "الصور محفوظة في تخزين Supabase.",
  "admin.texts.title": "نصوص الموقع",
  "admin.texts.sub": "عدّل كل نصوص الواجهة في اللغات الثلاث.",
  "admin.texts.search": "ابحث عن نص...",
  "admin.texts.reset": "إرجاع للنص الأصلي",
  "admin.langTabs": "لغة المحتوى",
});

// --------------------------- Auto translation strings ---------------------------
Object.assign(en, {
  "admin.translate.all": "Auto-translate all fields (from English)",
  "admin.translate.field": "Translate",
  "admin.translate.missing": "Translate missing",
  "admin.translate.done": "Translation completed",
  "admin.translate.allDone": "Everything is already translated",
  "admin.translate.needBase": "Write the English text first.",
  "admin.projects.problem": "Problem",
  "admin.projects.solution": "Solution",
  "admin.projects.features": "Features",
  "admin.messages.empty": "No messages yet.",
  "admin.messages.read": "Mark as read",
  "admin.messages.deleted": "Message deleted",
  "admin.import.title": "Make all site content editable",
  "admin.import.desc":
    "Imports the default content currently displayed on the site (projects, education, experience, skills, social links, profile and statistics) into the database. Existing rows are never overwritten — only empty sections are filled.",
  "admin.import.button": "Import content",
  "admin.import.running": "Importing…",
  "admin.import.upToDate": "All content is already stored in the database and editable.",
  "admin.import.done": "Imported",
});

Object.assign(fr, {
  "admin.translate.all": "Traduire automatiquement tous les champs (depuis l'anglais)",
  "admin.translate.field": "Traduire",
  "admin.translate.missing": "Traduire les manquants",
  "admin.translate.done": "Traduction terminée",
  "admin.translate.allDone": "Tout est déjà traduit",
  "admin.translate.needBase": "Saisissez d'abord le texte en anglais.",
  "admin.projects.problem": "Problématique",
  "admin.projects.solution": "Solution",
  "admin.projects.features": "Fonctionnalités",
  "admin.messages.empty": "Aucun message pour le moment.",
  "admin.messages.read": "Marquer comme lu",
  "admin.messages.deleted": "Message supprimé",
  "admin.import.title": "Rendre tout le contenu du site modifiable",
  "admin.import.desc":
    "Importe dans la base de données le contenu par défaut affiché sur le site (projets, formation, expérience, compétences, réseaux sociaux, profil et statistiques). Les données existantes ne sont jamais écrasées — seules les sections vides sont remplies.",
  "admin.import.button": "Importer le contenu",
  "admin.import.running": "Importation…",
  "admin.import.upToDate": "Tout le contenu est déjà enregistré et modifiable.",
  "admin.import.done": "Importé",
});

Object.assign(ar, {
  "admin.translate.all": "ترجمة تلقائية لكل الحقول (من الإنجليزية)",
  "admin.translate.field": "ترجمة",
  "admin.translate.missing": "ترجمة الناقص",
  "admin.translate.done": "تمت الترجمة",
  "admin.translate.allDone": "كل المحتوى مترجم بالفعل",
  "admin.translate.needBase": "اكتب النص بالإنجليزية أولاً.",
  "admin.projects.problem": "الإشكالية",
  "admin.projects.solution": "الحل",
  "admin.projects.features": "الميزات",
  "admin.messages.empty": "لا توجد رسائل بعد.",
  "admin.messages.read": "تعليم كمقروءة",
  "admin.messages.deleted": "تم حذف الرسالة",
  "admin.import.title": "اجعل كل محتوى الموقع قابلاً للتعديل",
  "admin.import.desc":
    "يستورد المحتوى الافتراضي المعروض حالياً في الموقع (المشاريع، التعليم، الخبرة، المهارات، روابط التواصل، الملف الشخصي والإحصائيات) إلى قاعدة البيانات. لا يتم استبدال أي بيانات موجودة — تُملأ الأقسام الفارغة فقط.",
  "admin.import.button": "استيراد المحتوى",
  "admin.import.running": "جارٍ الاستيراد…",
  "admin.import.upToDate": "كل المحتوى محفوظ في قاعدة البيانات وقابل للتعديل.",
  "admin.import.done": "تم الاستيراد",
});

const dicts: Record<Lang, Dict> = { en, fr, ar };

/** Default (built-in) dictionaries — used by the dashboard "Site Texts" editor. */
export const defaultDicts: Record<Lang, Dict> = { en, fr, ar };
export const translationKeys = Object.keys(en).sort();


type I18nValue = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nValue>({
  lang: "en",
  dir: "ltr",
  setLang: () => {},
  t: (k) => k,
});

/** Event the dashboard fires after saving site texts, so the site refreshes instantly. */
export const TRANSLATIONS_UPDATED_EVENT = "mda:ui-translations-updated";

type Overrides = Partial<Record<Lang, Dict>>;

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [overrides, setOverrides] = useState<Overrides>({});

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && stored in dicts) setLangState(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase.from("ui_translations").select("key,en,fr,ar");
      if (cancelled || error || !data) return;
      const next: Overrides = { en: {}, fr: {}, ar: {} };
      (data as { key: string; en: string | null; fr: string | null; ar: string | null }[]).forEach(
        (row) => {
          (["en", "fr", "ar"] as Lang[]).forEach((l) => {
            const v = row[l];
            if (typeof v === "string" && v.trim() !== "") next[l]![row.key] = v;
          });
        },
      );
      setOverrides(next);
    }

    void load();
    const handler = () => void load();
    window.addEventListener(TRANSLATIONS_UPDATED_EVENT, handler);
    return () => {
      cancelled = true;
      window.removeEventListener(TRANSLATIONS_UPDATED_EVENT, handler);
    };
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dir);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    window.localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      t: (key: string) =>
        overrides[lang]?.[key] ??
        dicts[lang][key] ??
        overrides.en?.[key] ??
        dicts.en[key] ??
        key,
    }),
    [lang, setLang, overrides],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

