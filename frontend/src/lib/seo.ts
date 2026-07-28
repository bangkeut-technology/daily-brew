import type { Metadata } from "next";
import { LOCALES, isLocale, type Locale } from "@/i18n/routing";

export const SITE_NAME = "DailyBrew";
export const SITE_URL = "https://dailybrew.work";

const DEFAULT_TITLE = `${SITE_NAME} — Staff Attendance Tracking for Restaurants`;
const OG_IMAGE = "/android-chrome-512.png";

/**
 * Public, indexable pages: path => locale => { title, description }.
 *
 * Ported from the Symfony `SeoMetaResolver`, whose docblock asks for exactly
 * this to be kept in lockstep. The FR and KM copy is the SEO-relevant part —
 * it's what Google reads — and the localized `/fr` and `/km` routes are
 * pointless without it: a French URL with an English <title> won't rank for a
 * French query.
 *
 * Each page's `generateMetadata` calls {@link pageMetadata}; the sitemap reads
 * the keys.
 */
export const PAGES = {
  "/": {
    en: {
      title: "DailyBrew — Staff Attendance Tracking for Restaurants",
      description:
        "QR check-in, shift tracking, and leave management for restaurants. Free for up to 10 employees. No hardware, no complexity — just scan and go.",
    },
    fr: {
      title: "DailyBrew — Suivi des présences du personnel pour restaurants",
      description:
        "Check-in par QR, gestion des horaires et des congés pour restaurants. Gratuit jusqu'à 10 employés. Aucun matériel, aucune complexité — il suffit de scanner.",
    },
    km: {
      title: "DailyBrew — ការតាមដានវត្តមានបុគ្គលិកសម្រាប់ភោជនីយដ្ឋាន",
      description:
        "ការចូលរួមដោយ QR ការតាមដានវេន និងការគ្រប់គ្រងការឈប់សម្រាប់ភោជនីយដ្ឋាន។ ឥតគិតថ្លៃរហូតដល់បុគ្គលិក ១០ នាក់។ មិនត្រូវការឧបករណ៍ មិនស្មុគស្មាញ — គ្រាន់តែស្កែន។",
    },
  },
  "/three-factor-attendance": {
    en: {
      title: "Three-factor attendance",
      description:
        "The strongest check-in configuration in DailyBrew: IP restriction, device verification, and geofencing enforced together. Each layer covers what the others can't.",
    },
    fr: {
      title: "Présence à trois facteurs",
      description:
        "La configuration de check-in la plus solide de DailyBrew : restriction IP, vérification d'appareil et géorepérage appliqués ensemble. Chaque couche couvre ce que les autres ne peuvent pas.",
    },
    km: {
      title: "វត្តមានបីកត្តា",
      description:
        "ការកំណត់ការចូលរួមដ៏រឹងមាំបំផុតរបស់ DailyBrew៖ ការដាក់កំហិត IP ការផ្ទៀងផ្ទាត់ឧបករណ៍ និង geofencing អនុវត្តរួមគ្នា។ ស្រទាប់នីមួយៗគ្របដណ្តប់នូវអ្វីដែលផ្សេងទៀតមិនអាចធ្វើបាន។",
    },
  },
  "/stop-buddy-punching": {
    en: {
      title: "How to stop buddy punching",
      description:
        "Buddy punching costs SMBs up to 2.2% of gross payroll. Stop it without spying on staff: bind every clock-in to a verified device and your shop's network — no PINs to share.",
    },
    fr: {
      title: "Comment arrêter le pointage par procuration",
      description:
        "Le pointage par procuration coûte aux PME jusqu'à 2,2 % de la masse salariale brute. Arrêtez-le sans surveiller le personnel : liez chaque pointage à un appareil vérifié et au réseau de votre boutique — pas de codes PIN à partager.",
    },
    km: {
      title: "របៀបបញ្ឈប់ការចូលរួមជំនួសគ្នា",
      description:
        "ការចូលរួមជំនួសគ្នាអាចចំណាយរហូតដល់ ២,២% នៃប្រាក់បៀវត្សរ៍សរុបរបស់អាជីវកម្មតូច។ បញ្ឈប់វាដោយចងភ្ជាប់ការចូលរួមនីមួយៗទៅឧបករណ៍ដែលបានផ្ទៀងផ្ទាត់ និងបណ្តាញហាងរបស់អ្នក — គ្មាន PIN ត្រូវចែករំលែកទេ។",
    },
  },
  "/features": {
    en: {
      title: "Features",
      description:
        "QR check-in, shift tracking, geofencing, device verification, leave management, and push notifications. Everything your restaurant needs for staff attendance.",
    },
    fr: {
      title: "Fonctionnalités",
      description:
        "Check-in par QR, suivi des horaires, géorepérage, vérification d'appareil, gestion des congés et notifications push. Tout ce dont votre restaurant a besoin pour le suivi du personnel.",
    },
    km: {
      title: "លក្ខណៈពិសេស",
      description:
        "ការចូលរួមដោយ QR ការតាមដានវេន geofencing ការផ្ទៀងផ្ទាត់ឧបករណ៍ ការគ្រប់គ្រងការឈប់ និងការជូនដំណឹង push។ អ្វីៗដែលភោជនីយដ្ឋានរបស់អ្នកត្រូវការសម្រាប់ការតាមដានវត្តមានបុគ្គលិក។",
    },
  },
  "/features/device-verification": {
    en: {
      title: "Device Verification",
      description:
        "Prevent buddy punching by binding check-in and check-out to a single device per employee per day. Full audit trail included.",
    },
    fr: {
      title: "Vérification d'appareil",
      description:
        "Empêchez la fraude au pointage en liant le check-in et le check-out à un seul appareil par employé et par jour. Piste d'audit complète incluse.",
    },
    km: {
      title: "ការផ្ទៀងផ្ទាត់ឧបករណ៍",
      description:
        "ការពារការចូលរួមជំនួសគ្នាដោយចងភ្ជាប់ការចូល និងការចេញទៅឧបករណ៍តែមួយក្នុងមួយបុគ្គលិកក្នុងមួយថ្ងៃ។ មានកំណត់ហេតុសវនកម្មពេញលេញ។",
    },
  },
  "/features/basilbook-integration": {
    en: {
      title: "BasilBook Integration",
      description:
        "Connect DailyBrew to BasilBook. Link employees by username and pull attendance data via a secure API — check-in times, late flags, and shift info.",
    },
    fr: {
      title: "Intégration BasilBook",
      description:
        "Connectez DailyBrew à BasilBook. Liez les employés par nom d'utilisateur et récupérez les données de présence via une API sécurisée — heures de check-in, marqueurs de retard et informations sur les horaires.",
    },
    km: {
      title: "ការតភ្ជាប់ BasilBook",
      description:
        "ភ្ជាប់ DailyBrew ទៅ BasilBook។ ភ្ជាប់បុគ្គលិកតាមឈ្មោះអ្នកប្រើ និងទាញទិន្នន័យវត្តមានតាម API សុវត្ថិភាព — ម៉ោងចូលរួម សញ្ញាយឺត និងព័ត៌មានវេន។",
    },
  },
  "/features/geofencing": {
    en: {
      title: "Geofencing",
      description:
        "Draw a GPS perimeter around your restaurant. Staff must be physically within range to check in. Configurable radius from 50m to 5,000m.",
    },
    fr: {
      title: "Géorepérage",
      description:
        "Tracez un périmètre GPS autour de votre restaurant. Le personnel doit être physiquement à portée pour pointer. Rayon configurable de 50 m à 5 000 m.",
    },
    km: {
      title: "Geofencing",
      description:
        "គូរព្រំដែន GPS ជុំវិញភោជនីយដ្ឋានរបស់អ្នក។ បុគ្គលិកត្រូវនៅក្នុងចម្ងាយដើម្បីចូលរួម។ កាំអាចកំណត់បានពី ៥០ ម៉ែត្រ ដល់ ៥.០០០ ម៉ែត្រ។",
    },
  },
  "/features/ip-restriction": {
    en: {
      title: "IP Restriction",
      description:
        "Lock staff check-ins to your restaurant's WiFi or network. Prevent remote punching and ensure employees are on-site when they clock in.",
    },
    fr: {
      title: "Restriction IP",
      description:
        "Limitez les pointages au Wi-Fi ou au réseau de votre restaurant. Empêchez le pointage à distance et assurez-vous que les employés sont sur place quand ils pointent.",
    },
    km: {
      title: "ការដាក់កំហិត IP",
      description:
        "ដាក់កំហិតការចូលរួមរបស់បុគ្គលិកទៅ Wi-Fi ឬបណ្តាញនៃភោជនីយដ្ឋានរបស់អ្នក។ ការពារការចូលរួមពីចម្ងាយ និងធានាថាបុគ្គលិកនៅទីកន្លែងពេលពួកគេចូលរួម។",
    },
  },
  "/how-it-works": {
    en: {
      title: "How it works",
      description:
        "Set up staff attendance tracking in minutes. Create a workspace, add employees, display a QR code, and track check-ins live from your dashboard.",
    },
    fr: {
      title: "Comment ça marche",
      description:
        "Configurez le suivi des présences en quelques minutes. Créez un espace de travail, ajoutez des employés, affichez un code QR et suivez les check-ins en direct depuis votre tableau de bord.",
    },
    km: {
      title: "របៀបដំណើរការ",
      description:
        "រៀបចំការតាមដានវត្តមានបុគ្គលិកក្នុងពេលប៉ុន្មាននាទី។ បង្កើតការងារ បន្ថែមបុគ្គលិក បង្ហាញកូដ QR និងតាមដានការចូលរួមផ្ទាល់ពីផ្ទាំងគ្រប់គ្រងរបស់អ្នក។",
    },
  },
  "/demo": {
    en: {
      title: "Try the demo",
      description:
        "Experience DailyBrew with a pre-configured demo workspace. Sign in as an owner, manager, or employee to explore all features.",
    },
    fr: {
      title: "Essayer la démo",
      description:
        "Découvrez DailyBrew avec un espace de démonstration préconfiguré. Connectez-vous en tant que propriétaire, manager ou employé pour explorer toutes les fonctionnalités.",
    },
    km: {
      title: "សាកល្បងការបង្ហាញ",
      description:
        "ស្វែងយល់ DailyBrew ជាមួយការងារបង្ហាញដែលរៀបចំជាមុន។ ចូលជាម្ចាស់ ប្រធាន ឬបុគ្គលិកដើម្បីស្វែងយល់លក្ខណៈពិសេសទាំងអស់។",
    },
  },
  "/roles": {
    en: {
      title: "Roles and permissions",
      description:
        "Understand what owners, managers, and employees can do in DailyBrew. Full permissions matrix for attendance tracking, leave management, and workspace settings.",
    },
    fr: {
      title: "Rôles et permissions",
      description:
        "Comprenez ce que les propriétaires, managers et employés peuvent faire dans DailyBrew. Matrice complète des permissions pour le suivi des présences, la gestion des congés et les paramètres.",
    },
    km: {
      title: "តួនាទី និងសិទ្ធិ",
      description:
        "យល់ដឹងពីអ្វីដែលម្ចាស់ ប្រធាន និងបុគ្គលិកអាចធ្វើនៅក្នុង DailyBrew។ ម៉ាទ្រីសសិទ្ធិពេញលេញសម្រាប់ការតាមដានវត្តមាន ការគ្រប់គ្រងការឈប់ និងការកំណត់ការងារ។",
    },
  },
  "/pricing": {
    en: {
      title: "Pricing",
      description:
        "DailyBrew plans start free for up to 10 employees. Espresso at $19.99/month adds geofencing, device verification, and leave management. Double Espresso for unlimited staff.",
    },
    fr: {
      title: "Tarifs",
      description:
        "Les plans DailyBrew commencent gratuitement jusqu'à 10 employés. Espresso à 19,99 $/mois ajoute le géorepérage, la vérification d'appareil et la gestion des congés. Double Espresso pour un personnel illimité.",
    },
    km: {
      title: "តម្លៃ",
      description:
        "គម្រោង DailyBrew ចាប់ផ្តើមឥតគិតថ្លៃរហូតដល់បុគ្គលិក ១០ នាក់។ Espresso តម្លៃ $19.99/ខែ បន្ថែម geofencing ការផ្ទៀងផ្ទាត់ឧបករណ៍ និងការគ្រប់គ្រងការឈប់។ Double Espresso សម្រាប់បុគ្គលិកគ្មានកំណត់។",
    },
  },
  "/faq": {
    en: {
      title: "FAQ",
      description:
        "Frequently asked questions about DailyBrew. Learn about QR check-in, shifts, leave requests, pricing, and how to get started with attendance tracking.",
    },
    fr: {
      title: "FAQ",
      description:
        "Questions fréquentes sur DailyBrew. Découvrez le check-in par QR, les horaires, les demandes de congé, les tarifs et comment commencer le suivi des présences.",
    },
    km: {
      title: "សំណួរញឹកញាប់",
      description:
        "សំណួរដែលត្រូវបានសួរញឹកញាប់អំពី DailyBrew។ ស្វែងយល់អំពីការចូលរួមដោយ QR វេន សំណើឈប់ តម្លៃ និងរបៀបចាប់ផ្តើមការតាមដានវត្តមាន។",
    },
  },
  "/support": {
    en: {
      title: "Support",
      description:
        "Get help with DailyBrew. Contact our team, report bugs, or submit feature requests for your restaurant attendance tracking.",
    },
    fr: {
      title: "Support",
      description:
        "Obtenez de l'aide pour DailyBrew. Contactez notre équipe, signalez des bugs ou soumettez des demandes de fonctionnalités pour votre suivi de présences.",
    },
    km: {
      title: "ការគាំទ្រ",
      description:
        "ទទួលបានជំនួយជាមួយ DailyBrew។ ទាក់ទងក្រុមការងាររបស់យើង រាយការណ៍កំហុស ឬដាក់សំណើលក្ខណៈពិសេសសម្រាប់ការតាមដានវត្តមានភោជនីយដ្ឋានរបស់អ្នក។",
    },
  },
  "/guides": {
    en: {
      title: "Guides",
      description:
        "Step-by-step playbooks for owners, employees, and teams upgrading to Espresso. Pick the path that matches you.",
    },
    fr: {
      title: "Guides",
      description:
        "Guides pas à pas pour les propriétaires, les employés et les équipes qui passent à Espresso. Choisissez le parcours qui vous convient.",
    },
    km: {
      title: "មគ្គុទ្ទេសក៍",
      description:
        "មគ្គុទ្ទេសក៍ជាជំហានៗសម្រាប់ម្ចាស់ បុគ្គលិក និងក្រុមដែលដំឡើងទៅ Espresso។ ជ្រើសរើសផ្លូវដែលសមនឹងអ្នក។",
    },
  },
  "/guides/owner": {
    en: {
      title: "Owner setup guide",
      description:
        "From sign-up to live attendance in about 10 minutes. Step-by-step setup for restaurant owners using DailyBrew.",
    },
    fr: {
      title: "Guide d'installation propriétaire",
      description:
        "De l'inscription à la prise des présences en environ 10 minutes. Installation pas à pas pour les propriétaires de restaurant utilisant DailyBrew.",
    },
    km: {
      title: "មគ្គុទ្ទេសក៍ដំឡើងសម្រាប់ម្ចាស់",
      description:
        "ពីការចុះឈ្មោះដល់ការតាមដានវត្តមានផ្ទាល់ក្នុងពេលប្រហែល ១០ នាទី។ ការដំឡើងជាជំហានៗសម្រាប់ម្ចាស់ភោជនីយដ្ឋានដែលប្រើ DailyBrew។",
    },
  },
  "/guides/employee": {
    en: {
      title: "Employee guide",
      description:
        "Install DailyBrew, link to your workspace, and scan the QR to clock in. Daily routine for restaurant staff.",
    },
    fr: {
      title: "Guide employé",
      description:
        "Installez DailyBrew, liez-vous à votre espace de travail et scannez le QR pour pointer. Routine quotidienne pour le personnel de restaurant.",
    },
    km: {
      title: "មគ្គុទ្ទេសក៍បុគ្គលិក",
      description:
        "ដំឡើង DailyBrew ភ្ជាប់ទៅការងាររបស់អ្នក និងស្កែន QR ដើម្បីចូលរួម។ ទម្លាប់ប្រចាំថ្ងៃសម្រាប់បុគ្គលិកភោជនីយដ្ឋាន។",
    },
  },
  "/guides/espresso": {
    en: {
      title: "Upgrade to Espresso",
      description:
        "Unlock leave management, geofencing, device verification, managers, and BasilBook integration on the Espresso plan.",
    },
    fr: {
      title: "Passer à Espresso",
      description:
        "Débloquez la gestion des congés, le géorepérage, la vérification d'appareil, les managers et l'intégration BasilBook avec le plan Espresso.",
    },
    km: {
      title: "ដំឡើងទៅ Espresso",
      description:
        "ដោះសោការគ្រប់គ្រងការឈប់ geofencing ការផ្ទៀងផ្ទាត់ឧបករណ៍ ប្រធាន និងការតភ្ជាប់ BasilBook នៅលើគម្រោង Espresso។",
    },
  },
  "/guides/nfc": {
    en: {
      title: "Set up NFC check-in",
      description:
        "Step-by-step guide for restaurant owners to replace the QR scan with a one-second NFC tap. Buy stickers, program them with your workspace URL, and place them at the counter.",
    },
    fr: {
      title: "Configurer le check-in NFC",
      description:
        "Guide pas à pas pour les propriétaires de restaurant pour remplacer le scan QR par un tap NFC d'une seconde. Achetez des stickers, programmez-les avec l'URL de votre espace, et placez-les au comptoir.",
    },
    km: {
      title: "រៀបចំការចូលរួម NFC",
      description:
        "មគ្គុទ្ទេសក៍ជាជំហានៗសម្រាប់ម្ចាស់ភោជនីយដ្ឋានដើម្បីជំនួសការស្កែន QR ដោយការប៉ះ NFC មួយវិនាទី។ ទិញស្ទីកឃ័រ កម្មវិធីពួកវាដោយ URL នៃការងាររបស់អ្នក និងដាក់ពួកវានៅបញ្ជរ។",
    },
  },
  "/sign-up": {
    en: {
      title: "Sign up",
      description:
        "Create your free DailyBrew account. Start tracking staff attendance with QR check-in in minutes. No credit card required.",
    },
    fr: {
      title: "S'inscrire",
      description:
        "Créez votre compte DailyBrew gratuit. Commencez à suivre les présences du personnel avec le check-in par QR en quelques minutes. Aucune carte de crédit requise.",
    },
    km: {
      title: "ចុះឈ្មោះ",
      description:
        "បង្កើតគណនី DailyBrew ឥតគិតថ្លៃរបស់អ្នក។ ចាប់ផ្តើមតាមដានវត្តមានបុគ្គលិកជាមួយការចូលរួមដោយ QR ក្នុងពេលប៉ុន្មាននាទី។ មិនត្រូវការកាតឥណទាន។",
    },
  },
  "/sign-in": {
    en: {
      title: "Sign in",
      description:
        "Sign in to DailyBrew to manage your restaurant staff attendance, shifts, and leave requests.",
    },
    fr: {
      title: "Se connecter",
      description:
        "Connectez-vous à DailyBrew pour gérer les présences, les horaires et les demandes de congé de votre personnel de restaurant.",
    },
    km: {
      title: "ចូល",
      description:
        "ចូល DailyBrew ដើម្បីគ្រប់គ្រងវត្តមានបុគ្គលិក វេន និងសំណើឈប់របស់ភោជនីយដ្ឋានរបស់អ្នក។",
    },
  },
  "/privacy": {
    en: {
      title: "Privacy policy",
      description:
        "How DailyBrew collects, uses, and protects your data. Learn about our privacy practices for attendance tracking, notifications, and payment processing.",
    },
    fr: {
      title: "Politique de confidentialité",
      description:
        "Comment DailyBrew collecte, utilise et protège vos données. Découvrez nos pratiques de confidentialité pour le suivi des présences, les notifications et le traitement des paiements.",
    },
    km: {
      title: "គោលការណ៍ឯកជនភាព",
      description:
        "របៀបដែល DailyBrew ប្រមូល ប្រើ និងការពារទិន្នន័យរបស់អ្នក។ ស្វែងយល់ពីការអនុវត្តឯកជនភាពរបស់យើងសម្រាប់ការតាមដានវត្តមាន ការជូនដំណឹង និងការដំណើរការទូទាត់។",
    },
  },
  "/terms": {
    en: {
      title: "Terms of use",
      description:
        "Terms governing the use of DailyBrew, including subscription plans, QR check-in, data handling, and account responsibilities.",
    },
    fr: {
      title: "Conditions d'utilisation",
      description:
        "Conditions régissant l'utilisation de DailyBrew, y compris les plans d'abonnement, le check-in par QR, la gestion des données et les responsabilités du compte.",
    },
    km: {
      title: "លក្ខខណ្ឌប្រើប្រាស់",
      description:
        "លក្ខខណ្ឌគ្រប់គ្រងការប្រើប្រាស់ DailyBrew រួមមានគម្រោងជាវ ការចូលរួមដោយ QR ការគ្រប់គ្រងទិន្នន័យ និងការទទួលខុសត្រូវនៃគណនី។",
    },
  },
  "/refund": {
    en: {
      title: "Refund policy",
      description:
        "DailyBrew refund policy: refund eligibility, how to request a refund, processing times, and the difference between cancellation and refund.",
    },
    fr: {
      title: "Politique de remboursement",
      description:
        "Politique de remboursement DailyBrew : éligibilité au remboursement, comment demander un remboursement, délais de traitement et différence entre annulation et remboursement.",
    },
    km: {
      title: "គោលការណ៍សងប្រាក់វិញ",
      description:
        "គោលការណ៍សងប្រាក់វិញរបស់ DailyBrew៖ លក្ខណៈវិនិច្ឆ័យសងប្រាក់វិញ របៀបស្នើសុំសងប្រាក់វិញ រយៈពេលដំណើរការ និងភាពខុសគ្នារវាងការលុបចោល និងការសងប្រាក់វិញ។",
    },
  },
  "/delete-account": {
    en: {
      title: "Delete your account",
      description:
        "Request deletion of your DailyBrew account and all associated data including attendance records, workspaces, and employee profiles.",
    },
    fr: {
      title: "Supprimer votre compte",
      description:
        "Demandez la suppression de votre compte DailyBrew et de toutes les données associées, y compris les enregistrements de présence, les espaces de travail et les profils d'employés.",
    },
    km: {
      title: "លុបគណនីរបស់អ្នក",
      description:
        "ស្នើសុំការលុបគណនី DailyBrew របស់អ្នក និងទិន្នន័យពាក់ព័ន្ធទាំងអស់ រួមមានកំណត់ត្រាវត្តមាន ការងារ និងប្រវត្តិរូបបុគ្គលិក។",
    },
  },
} as const satisfies Record<string, Record<Locale, { title: string; description: string }>>;

export type IndexablePath = keyof typeof PAGES;

/**
 * Build per-page Next.js Metadata. The homepage uses an absolute title
 * (no `— DailyBrew` suffix); every other page relies on the title template
 * defined in the root layout. Canonical is the page's own path.
 */
/**
 * Marketing pages are served at `/x`, `/fr/x` and `/km/x`. Each variant
 * declares the full set so crawlers treat them as translations of one page
 * rather than duplicate content, with English as `x-default`.
 */
function localeAlternates(path: IndexablePath) {
  const forLocale = (locale: string) =>
    locale === "en" ? path : `/${locale}${path === "/" ? "" : path}`;

  return {
    languages: {
      ...Object.fromEntries(LOCALES.map((locale) => [locale, forLocale(locale)])),
      "x-default": path,
    },
  };
}

export function pageMetadata(path: IndexablePath, locale: string = "en"): Metadata {
  const entry = PAGES[path] as Record<Locale, { title: string; description: string }>;
  const { title, description } = entry[isLocale(locale) ? locale : "en"];
  const isHome = path === "/";
  const canonical = locale === "en" ? path : `/${locale}${isHome ? "" : path}`;

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: { canonical, ...localeAlternates(path) },
    openGraph: {
      title: isHome ? title : `${title} — ${SITE_NAME}`,
      description,
      url: canonical,
      images: [OG_IMAGE],
    },
    twitter: {
      title: isHome ? title : `${title} — ${SITE_NAME}`,
      description,
      images: [OG_IMAGE],
    },
  };
}
