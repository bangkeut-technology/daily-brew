<?php

declare(strict_types=1);

namespace App\Service\Seo;

/**
 * Single source of truth for server-rendered SEO metadata.
 *
 * The whole frontend is a client-rendered SPA served by {@see \App\Controller\SpaController}
 * for every non-API path, so without this the server returns an identical head (and HTTP 200)
 * for every URL. That produced two problems in Search Console:
 *   - unknown URLs (e.g. /status) returned 200 + a JS-rendered "not found" → flagged as soft 404;
 *   - every page advertised the homepage canonical, so real pages looked like duplicates of /.
 *
 * This resolver maps each path to its title/description, marks it indexable or not, and decides
 * the HTTP status (404 for unknown paths). The values feed base.html.twig so crawlers and
 * link-preview scrapers — neither of which run our JS — get correct, per-page metadata.
 *
 * Multilingual SEO (EN/FR/KM):
 * Each page's title + description is registered in three languages. Locale comes from
 * SpaController (?lang= query param > Accept-Language header > 'en' fallback). The same
 * URL serves all three languages with a Vary: Accept-Language hint to caches; crawlers
 * discover language variants through the hreflang alternates emitted by base.html.twig and
 * listed in sitemap.xml.
 */
final class SeoMetaResolver
{
    public const BASE_URL = 'https://dailybrew.work';

    /** Supported UI/SEO locales. First is the default; matches the i18next config in assets/src/i18next.ts. */
    public const LOCALES = ['en', 'fr', 'km'];
    public const DEFAULT_LOCALE = 'en';

    private const SITE_NAME = 'DailyBrew';

    /**
     * Per-locale defaults used for private/unknown paths (no per-page entry).
     *
     * @var array<string, array{title: string, description: string}>
     */
    private const DEFAULTS = [
        'en' => [
            'title' => 'DailyBrew — Staff Attendance Tracking for Restaurants',
            'description' => 'QR check-in, shift tracking, and leave management for restaurants. Free for up to 10 employees.',
        ],
        'fr' => [
            'title' => 'DailyBrew — Suivi des présences du personnel pour restaurants',
            'description' => "Check-in par QR, gestion des horaires et des congés pour restaurants. Gratuit jusqu'à 10 employés.",
        ],
        'km' => [
            'title' => 'DailyBrew — ការតាមដានវត្តមានបុគ្គលិកសម្រាប់ភោជនីយដ្ឋាន',
            'description' => 'ការចូលរួមដោយ QR ការតាមដានវេន និងការគ្រប់គ្រងការឈប់សម្រាប់ភោជនីយដ្ឋាន។ ឥតគិតថ្លៃរហូតដល់បុគ្គលិក ១០ នាក់។',
        ],
    ];

    /**
     * Public, indexable pages: path => locale => [title, description].
     *
     * - English copy is the source of truth (matches the SPA's <PageSeo> calls).
     * - French + Khmer are the SEO-relevant translations: only what Google reads.
     *   Page-body prose is translated separately via i18next where the route is wired.
     * - Site name suffix is appended to titles for every page except the homepage by
     *   {@see self::fullTitle()} — so registry entries hold only the bare title.
     *
     * Keep this in lockstep with frontend/src/lib/seo.ts when the Next.js cutover lands.
     *
     * @var array<string, array<string, array{string, string}>>
     */
    private const INDEXABLE_PAGES = [
        '/' => [
            'en' => [
                'DailyBrew — Staff Attendance Tracking for Restaurants',
                'QR check-in, shift tracking, and leave management for restaurants. Free for up to 10 employees. No hardware, no complexity — just scan and go.',
            ],
            'fr' => [
                'DailyBrew — Suivi des présences du personnel pour restaurants',
                "Check-in par QR, gestion des horaires et des congés pour restaurants. Gratuit jusqu'à 10 employés. Aucun matériel, aucune complexité — il suffit de scanner.",
            ],
            'km' => [
                'DailyBrew — ការតាមដានវត្តមានបុគ្គលិកសម្រាប់ភោជនីយដ្ឋាន',
                'ការចូលរួមដោយ QR ការតាមដានវេន និងការគ្រប់គ្រងការឈប់សម្រាប់ភោជនីយដ្ឋាន។ ឥតគិតថ្លៃរហូតដល់បុគ្គលិក ១០ នាក់។ មិនត្រូវការឧបករណ៍ មិនស្មុគស្មាញ — គ្រាន់តែស្កែន។',
            ],
        ],
        '/features' => [
            'en' => [
                'Features',
                'QR check-in, shift tracking, geofencing, device verification, leave management, and push notifications. Everything your restaurant needs for staff attendance.',
            ],
            'fr' => [
                'Fonctionnalités',
                "Check-in par QR, suivi des horaires, géorepérage, vérification d'appareil, gestion des congés et notifications push. Tout ce dont votre restaurant a besoin pour le suivi du personnel.",
            ],
            'km' => [
                'លក្ខណៈពិសេស',
                'ការចូលរួមដោយ QR ការតាមដានវេន geofencing ការផ្ទៀងផ្ទាត់ឧបករណ៍ ការគ្រប់គ្រងការឈប់ និងការជូនដំណឹង push។ អ្វីៗដែលភោជនីយដ្ឋានរបស់អ្នកត្រូវការសម្រាប់ការតាមដានវត្តមានបុគ្គលិក។',
            ],
        ],
        '/features/device-verification' => [
            'en' => [
                'Device Verification',
                'Prevent buddy punching by binding check-in and check-out to a single device per employee per day. Full audit trail included.',
            ],
            'fr' => [
                "Vérification d'appareil",
                "Empêchez la fraude au pointage en liant le check-in et le check-out à un seul appareil par employé et par jour. Piste d'audit complète incluse.",
            ],
            'km' => [
                'ការផ្ទៀងផ្ទាត់ឧបករណ៍',
                'ការពារការចូលរួមជំនួសគ្នាដោយចងភ្ជាប់ការចូល និងការចេញទៅឧបករណ៍តែមួយក្នុងមួយបុគ្គលិកក្នុងមួយថ្ងៃ។ មានកំណត់ហេតុសវនកម្មពេញលេញ។',
            ],
        ],
        '/features/basilbook-integration' => [
            'en' => [
                'BasilBook Integration',
                'Connect DailyBrew to BasilBook. Link employees by username and pull attendance data via a secure API — check-in times, late flags, and shift info.',
            ],
            'fr' => [
                'Intégration BasilBook',
                "Connectez DailyBrew à BasilBook. Liez les employés par nom d'utilisateur et récupérez les données de présence via une API sécurisée — heures de check-in, marqueurs de retard et informations sur les horaires.",
            ],
            'km' => [
                'ការតភ្ជាប់ BasilBook',
                'ភ្ជាប់ DailyBrew ទៅ BasilBook។ ភ្ជាប់បុគ្គលិកតាមឈ្មោះអ្នកប្រើ និងទាញទិន្នន័យវត្តមានតាម API សុវត្ថិភាព — ម៉ោងចូលរួម សញ្ញាយឺត និងព័ត៌មានវេន។',
            ],
        ],
        '/features/geofencing' => [
            'en' => [
                'Geofencing',
                'Draw a GPS perimeter around your restaurant. Staff must be physically within range to check in. Configurable radius from 50m to 5,000m.',
            ],
            'fr' => [
                'Géorepérage',
                "Tracez un périmètre GPS autour de votre restaurant. Le personnel doit être physiquement à portée pour pointer. Rayon configurable de 50 m à 5 000 m.",
            ],
            'km' => [
                'Geofencing',
                'គូរព្រំដែន GPS ជុំវិញភោជនីយដ្ឋានរបស់អ្នក។ បុគ្គលិកត្រូវនៅក្នុងចម្ងាយដើម្បីចូលរួម។ កាំអាចកំណត់បានពី ៥០ ម៉ែត្រ ដល់ ៥.០០០ ម៉ែត្រ។',
            ],
        ],
        '/features/ip-restriction' => [
            'en' => [
                'IP Restriction',
                "Lock staff check-ins to your restaurant's WiFi or network. Prevent remote punching and ensure employees are on-site when they clock in.",
            ],
            'fr' => [
                'Restriction IP',
                "Limitez les pointages au Wi-Fi ou au réseau de votre restaurant. Empêchez le pointage à distance et assurez-vous que les employés sont sur place quand ils pointent.",
            ],
            'km' => [
                'ការដាក់កំហិត IP',
                'ដាក់កំហិតការចូលរួមរបស់បុគ្គលិកទៅ Wi-Fi ឬបណ្តាញនៃភោជនីយដ្ឋានរបស់អ្នក។ ការពារការចូលរួមពីចម្ងាយ និងធានាថាបុគ្គលិកនៅទីកន្លែងពេលពួកគេចូលរួម។',
            ],
        ],
        '/three-factor-attendance' => [
            'en' => [
                'Three-factor attendance',
                "The strongest check-in configuration in DailyBrew: IP restriction, device verification, and geofencing enforced together. Each layer covers what the others can't.",
            ],
            'fr' => [
                'Présence à trois facteurs',
                "La configuration de check-in la plus solide de DailyBrew : restriction IP, vérification d'appareil et géorepérage appliqués ensemble. Chaque couche couvre ce que les autres ne peuvent pas.",
            ],
            'km' => [
                'វត្តមានបីកត្តា',
                'ការកំណត់ការចូលរួមដ៏រឹងមាំបំផុតរបស់ DailyBrew៖ ការដាក់កំហិត IP ការផ្ទៀងផ្ទាត់ឧបករណ៍ និង geofencing អនុវត្តរួមគ្នា។ ស្រទាប់នីមួយៗគ្របដណ្តប់នូវអ្វីដែលផ្សេងទៀតមិនអាចធ្វើបាន។',
            ],
        ],
        // ── Industry landing pages ────────────────────────────────────
        // Programmatic SEO surfaces (one entry per vertical). en/fr/km all
        // provided for proper hreflang variants and share-preview locales;
        // page bodies still render English copy from assets/src/lib/
        // industries.ts → IndustryView until the IndustryView body itself
        // is translated (separate follow-up).
        '/cafes' => [
            'en' => [
                'Attendance app for cafés',
                "Free staff attendance for cafés. Baristas scan a QR or tap to clock in — each punch bound to their device and your shop's WiFi. No biometrics, no buddy punching.",
            ],
            'fr' => [
                'Application de présence pour cafés',
                "Gestion des présences gratuite pour cafés. Les baristas scannent un QR ou tapent pour pointer — chaque pointage lié à leur appareil et au Wi-Fi de la boutique. Sans biométrie, sans pointage par procuration.",
            ],
            'km' => [
                'កម្មវិធីវត្តមានសម្រាប់ហាងកាហ្វេ',
                'ការតាមដានវត្តមានឥតគិតថ្លៃសម្រាប់ហាងកាហ្វេ។ Barista ស្កែន QR ឬប៉ះដើម្បីចូលរួម — រាល់ការចូលរួមភ្ជាប់ទៅឧបករណ៍ និង WiFi ហាង។ គ្មានជីវមាត្រ គ្មានការចូលរួមជំនួសគ្នា។',
            ],
        ],
        '/coffee-shops' => [
            'en' => [
                'Coffee shop employee time tracking',
                "Time tracking for coffee shop staff. QR clock-in bound to each barista's device and your network — no PINs to share, no biometrics, free for up to 10 active employees.",
            ],
            'fr' => [
                'Suivi du temps de travail pour coffee shops',
                "Suivi du temps pour le personnel de coffee shop. Pointage QR lié à l'appareil de chaque barista et à votre réseau — sans PIN à partager, sans biométrie, gratuit jusqu'à 10 employés actifs.",
            ],
            'km' => [
                'ការតាមដានម៉ោងបុគ្គលិកសម្រាប់ Coffee Shop',
                'ការតាមដានម៉ោងសម្រាប់បុគ្គលិក Coffee Shop។ ការចូលរួម QR ភ្ជាប់ទៅឧបករណ៍ Barista និងបណ្តាញរបស់អ្នក — គ្មាន PIN ត្រូវចែករំលែក គ្មានជីវមាត្រ ឥតគិតថ្លៃរហូតដល់បុគ្គលិកសកម្ម ១០ នាក់។',
            ],
        ],
        '/restaurants' => [
            'en' => [
                'Staff attendance app for restaurants',
                'Restaurant staff attendance and time clock. Front- and back-of-house clock in by QR, bound to device + network. Leave management and late flags. Free up to 10 active employees.',
            ],
            'fr' => [
                'Application de présence du personnel pour restaurants',
                "Présence et pointeuse pour le personnel de restaurant. Salle et cuisine pointent par QR, lié à l'appareil + au réseau. Gestion des congés, alertes de retard. Gratuit jusqu'à 10 employés actifs.",
            ],
            'km' => [
                'កម្មវិធីវត្តមានបុគ្គលិកសម្រាប់ភោជនីយដ្ឋាន',
                'ការតាមដានវត្តមាន និងម៉ោងសម្រាប់ភោជនីយដ្ឋាន។ បុគ្គលិកមុខ និងផ្ទះបាយចូលរួមតាម QR ភ្ជាប់ទៅឧបករណ៍ + បណ្តាញ។ ការគ្រប់គ្រងការឈប់ និងសញ្ញាយឺត។ ឥតគិតថ្លៃរហូតដល់បុគ្គលិកសកម្ម ១០ នាក់។',
            ],
        ],
        '/bars' => [
            'en' => [
                'Bar staff attendance app',
                'Attendance for bar and pub staff. Late-night, high-turnover teams clock in by QR bound to device + network — no biometrics, no buddy punching. Free up to 10 active employees.',
            ],
            'fr' => [
                'Application de présence pour personnel de bar',
                "Présence pour le personnel de bar et pub. Équipes à fort renouvellement, services tardifs : pointage QR lié à l'appareil + réseau — sans biométrie, sans pointage par procuration. Gratuit jusqu'à 10 employés actifs.",
            ],
            'km' => [
                'កម្មវិធីវត្តមានសម្រាប់បុគ្គលិកបារ',
                'វត្តមានសម្រាប់បុគ្គលិកបារ និងផ្សារកម្សាន្ត។ ក្រុមផ្លាស់ប្ដូរញឹកញាប់ ការងារយប់៖ ចូលរួម QR ភ្ជាប់ទៅឧបករណ៍ + បណ្តាញ — គ្មានជីវមាត្រ គ្មានការចូលរួមជំនួសគ្នា។ ឥតគិតថ្លៃរហូតដល់បុគ្គលិកសកម្ម ១០ នាក់។',
            ],
        ],
        '/bakeries' => [
            'en' => [
                'Attendance app for bakeries',
                'Staff attendance for bakeries. Early-morning bakers clock in by QR bound to device + network. Track hours and late flags without biometrics. Free up to 10 active employees.',
            ],
            'fr' => [
                'Application de présence pour boulangeries',
                "Présence du personnel pour boulangeries. Les boulangers du matin pointent par QR lié à l'appareil + réseau. Suivez les heures et alertes de retard sans biométrie. Gratuit jusqu'à 10 employés actifs.",
            ],
            'km' => [
                'កម្មវិធីវត្តមានសម្រាប់ហាងនំ',
                'វត្តមានបុគ្គលិកសម្រាប់ហាងនំ។ អ្នកធ្វើនំព្រឹកព្រលឹមចូលរួម QR ភ្ជាប់ទៅឧបករណ៍ + បណ្តាញ។ តាមដានម៉ោង និងសញ្ញាយឺតដោយគ្មានជីវមាត្រ។ ឥតគិតថ្លៃរហូតដល់បុគ្គលិកសកម្ម ១០ នាក់។',
            ],
        ],
        '/food-trucks' => [
            'en' => [
                'Food truck employee time tracking',
                "Time tracking for food truck crews. Clock in by QR from the truck, bound to each crew member's device. No fixed hardware, no biometrics. Free up to 10 active employees.",
            ],
            'fr' => [
                'Suivi du temps de travail pour food trucks',
                "Suivi du temps pour équipes de food truck. Pointage QR depuis le camion, lié à l'appareil de chaque membre. Aucun matériel fixe, aucune biométrie. Gratuit jusqu'à 10 employés actifs.",
            ],
            'km' => [
                'ការតាមដានម៉ោងបុគ្គលិកសម្រាប់ Food Truck',
                'ការតាមដានម៉ោងសម្រាប់ក្រុមបុគ្គលិក Food Truck។ ចូលរួមតាម QR ពីឡាន ភ្ជាប់ទៅឧបករណ៍សមាជិកក្រុមនីមួយៗ។ គ្មានឧបករណ៍ថេរ គ្មានជីវមាត្រ។ ឥតគិតថ្លៃរហូតដល់បុគ្គលិកសកម្ម ១០ នាក់។',
            ],
        ],
        '/retail' => [
            'en' => [
                'Retail staff attendance app',
                "Attendance for retail staff. Sales associates clock in by QR bound to device + the shop's network. No biometrics, no GPS tracking. Free for up to 10 active employees.",
            ],
            'fr' => [
                'Application de présence pour personnel de commerce',
                "Présence pour le personnel de commerce. Les vendeurs pointent par QR lié à l'appareil + au réseau de la boutique. Sans biométrie, sans GPS. Gratuit jusqu'à 10 employés actifs.",
            ],
            'km' => [
                'កម្មវិធីវត្តមានសម្រាប់បុគ្គលិកលក់រាយ',
                'វត្តមានសម្រាប់បុគ្គលិកលក់រាយ។ អ្នកលក់ចូលរួម QR ភ្ជាប់ទៅឧបករណ៍ + បណ្តាញហាង។ គ្មានជីវមាត្រ គ្មានការតាមដាន GPS។ ឥតគិតថ្លៃរហូតដល់បុគ្គលិកសកម្ម ១០ នាក់។',
            ],
        ],
        '/small-shops' => [
            'en' => [
                'Attendance app for small shops',
                'Simple staff attendance for small shops. Your team clocks in by QR bound to their device and your network. No biometrics, no contracts. Free for up to 10 active employees.',
            ],
            'fr' => [
                'Application de présence pour petits commerces',
                "Présence simple pour petits commerces. Votre équipe pointe par QR lié à leur appareil et à votre réseau. Sans biométrie, sans contrat. Gratuit jusqu'à 10 employés actifs.",
            ],
            'km' => [
                'កម្មវិធីវត្តមានសម្រាប់ហាងតូច',
                'វត្តមានសាមញ្ញសម្រាប់ហាងតូច។ ក្រុមរបស់អ្នកចូលរួម QR ភ្ជាប់ទៅឧបករណ៍ និងបណ្តាញរបស់អ្នក។ គ្មានជីវមាត្រ គ្មានកិច្ចសន្យា។ ឥតគិតថ្លៃរហូតដល់បុគ្គលិកសកម្ម ១០ នាក់។',
            ],
        ],
        // ── Competitor comparison pages ───────────────────────────────
        // Same en/fr/km coverage as industries. Trademark disclaimer is
        // rendered in CompetitorView itself.
        '/vs-jibble' => [
            'en' => [
                'DailyBrew vs Jibble',
                "DailyBrew vs Jibble for cafés: device + network verification with no biometrics, versus Jibble's face-recognition clock-in. Free up to 10 active employees.",
            ],
            'fr' => [
                'DailyBrew vs Jibble',
                "DailyBrew vs Jibble pour cafés : vérification appareil + réseau sans biométrie, contre le pointage par reconnaissance faciale de Jibble. Gratuit jusqu'à 10 employés actifs.",
            ],
            'km' => [
                'DailyBrew ប្រៀបធៀប Jibble',
                'DailyBrew ប្រៀបធៀប Jibble សម្រាប់ហាងកាហ្វេ៖ ការផ្ទៀងផ្ទាត់ឧបករណ៍ + បណ្តាញដោយគ្មានជីវមាត្រ ប្រឆាំងនឹងការចូលរួមដោយការទទួលស្គាល់មុខរបស់ Jibble។ ឥតគិតថ្លៃរហូតដល់បុគ្គលិកសកម្ម ១០ នាក់។',
            ],
        ],
        '/vs-homebase' => [
            'en' => [
                'DailyBrew vs Homebase',
                "DailyBrew vs Homebase: device + network verified clock-ins with no shared PINs, versus Homebase's PIN + GPS model. Free up to 10 active employees, no US-only limits.",
            ],
            'fr' => [
                'DailyBrew vs Homebase',
                "DailyBrew vs Homebase : pointages vérifiés par appareil + réseau, sans PIN partagé, contre le modèle PIN + GPS de Homebase. Gratuit jusqu'à 10 employés actifs, sans limite US.",
            ],
            'km' => [
                'DailyBrew ប្រៀបធៀប Homebase',
                'DailyBrew ប្រៀបធៀប Homebase៖ ការចូលរួមដែលផ្ទៀងផ្ទាត់ដោយឧបករណ៍ + បណ្តាញ គ្មាន PIN រួម ប្រឆាំងនឹងគំរូ PIN + GPS របស់ Homebase។ ឥតគិតថ្លៃរហូតដល់បុគ្គលិកសកម្ម ១០ នាក់ គ្មានកំហិតតែសម្រាប់សហរដ្ឋអាមេរិក។',
            ],
        ],
        '/vs-connecteam' => [
            'en' => [
                'DailyBrew vs Connecteam',
                "DailyBrew vs Connecteam: a café-first three-factor clock-in (device + IP + NFC beta) versus Connecteam's deskless HR suite with NFC and selfie verification.",
            ],
            'fr' => [
                'DailyBrew vs Connecteam',
                "DailyBrew vs Connecteam : pointage trois facteurs orienté café (appareil + IP + NFC bêta) contre la suite RH sans bureau de Connecteam avec NFC et vérification selfie.",
            ],
            'km' => [
                'DailyBrew ប្រៀបធៀប Connecteam',
                'DailyBrew ប្រៀបធៀប Connecteam៖ ការចូលរួមបីកត្តាសម្រាប់ហាងកាហ្វេ (ឧបករណ៍ + IP + NFC បែតា) ប្រឆាំងនឹង Suite HR ដែលគ្មានកន្លែងធ្វើការរបស់ Connecteam ជាមួយ NFC និងការផ្ទៀងផ្ទាត់ selfie។',
            ],
        ],
        '/vs-clockify' => [
            'en' => [
                'DailyBrew vs Clockify',
                "DailyBrew vs Clockify: per-punch device + network verification versus Clockify's shareable kiosk PIN. Stop buddy punching that PIN-based clocks can't.",
            ],
            'fr' => [
                'DailyBrew vs Clockify',
                "DailyBrew vs Clockify : vérification appareil + réseau à chaque pointage, contre le PIN partageable du kiosque Clockify. Arrêtez le pointage par procuration que les pointeuses PIN ne peuvent pas.",
            ],
            'km' => [
                'DailyBrew ប្រៀបធៀប Clockify',
                'DailyBrew ប្រៀបធៀប Clockify៖ ការផ្ទៀងផ្ទាត់ឧបករណ៍ + បណ្តាញរាល់ការចូលរួម ប្រឆាំងនឹង PIN kiosk ដែលអាចចែករំលែករបស់ Clockify។ បញ្ឈប់ការចូលរួមជំនួសគ្នាដែលនាឡិកា PIN មិនអាច។',
            ],
        ],
        '/vs-buddy-punch' => [
            'en' => [
                'DailyBrew vs Buddy Punch',
                'DailyBrew vs Buddy Punch: device + IP verification as the primary defense, no photo-on-punch. A café-first alternative with a free tier for up to 10 active employees.',
            ],
            'fr' => [
                'DailyBrew vs Buddy Punch',
                "DailyBrew vs Buddy Punch : vérification appareil + IP comme défense principale, sans photo au pointage. Une alternative orientée café avec un forfait gratuit jusqu'à 10 employés actifs.",
            ],
            'km' => [
                'DailyBrew ប្រៀបធៀប Buddy Punch',
                'DailyBrew ប្រៀបធៀប Buddy Punch៖ ការផ្ទៀងផ្ទាត់ឧបករណ៍ + IP ជាការការពារសំខាន់ គ្មានរូបថតពេលចូលរួម។ ជម្រើសសម្រាប់ហាងកាហ្វេជាមួយកម្រិតឥតគិតថ្លៃរហូតដល់បុគ្គលិកសកម្ម ១០ នាក់។',
            ],
        ],
        '/vs-7shifts' => [
            'en' => [
                'DailyBrew vs 7shifts',
                "DailyBrew vs 7shifts: a free, device-verified time clock for small teams versus 7shifts' restaurant scheduling suite with photo + geofencing punch.",
            ],
            'fr' => [
                'DailyBrew vs 7shifts',
                "DailyBrew vs 7shifts : pointeuse gratuite à vérification d'appareil pour petites équipes, contre la suite de planification de restaurant de 7shifts avec photo + géorepérage.",
            ],
            'km' => [
                'DailyBrew ប្រៀបធៀប 7shifts',
                'DailyBrew ប្រៀបធៀប 7shifts៖ នាឡិកាពេលវេលាឥតគិតថ្លៃជាមួយការផ្ទៀងផ្ទាត់ឧបករណ៍សម្រាប់ក្រុមតូច ប្រឆាំងនឹង Suite កំណត់វេនភោជនីយដ្ឋានរបស់ 7shifts ជាមួយរូបថត + geofencing។',
            ],
        ],
        '/stop-buddy-punching' => [
            'en' => [
                'How to stop buddy punching',
                "Buddy punching costs SMBs up to 2.2% of gross payroll. Stop it without spying on staff: bind every clock-in to a verified device and your shop's network — no PINs to share.",
            ],
            'fr' => [
                'Comment arrêter le pointage par procuration',
                "Le pointage par procuration coûte aux PME jusqu'à 2,2 % de la masse salariale brute. Arrêtez-le sans surveiller le personnel : liez chaque pointage à un appareil vérifié et au réseau de votre boutique — pas de codes PIN à partager.",
            ],
            'km' => [
                'របៀបបញ្ឈប់ការចូលរួមជំនួសគ្នា',
                'ការចូលរួមជំនួសគ្នាអាចចំណាយរហូតដល់ ២,២% នៃប្រាក់បៀវត្សរ៍សរុបរបស់អាជីវកម្មតូច។ បញ្ឈប់វាដោយចងភ្ជាប់ការចូលរួមនីមួយៗទៅឧបករណ៍ដែលបានផ្ទៀងផ្ទាត់ និងបណ្តាញហាងរបស់អ្នក — គ្មាន PIN ត្រូវចែករំលែកទេ។',
            ],
        ],
        // `/device-verified-attendance` is a public alias for `/features/device-verification`.
        // The route is registered as indexable (so SpaController returns 200, not 404),
        // but `resolve()` rewrites its canonical to the real feature page below so
        // search engines collapse the two URLs into one and we don't bleed authority.
        '/device-verified-attendance' => [
            'en' => [
                'Device Verification',
                'Prevent buddy punching by binding check-in and check-out to a single device per employee per day. Full audit trail included.',
            ],
            'fr' => [
                "Vérification d'appareil",
                "Empêchez la fraude au pointage en liant le check-in et le check-out à un seul appareil par employé et par jour. Piste d'audit complète incluse.",
            ],
            'km' => [
                'ការផ្ទៀងផ្ទាត់ឧបករណ៍',
                'ការពារការចូលរួមជំនួសគ្នាដោយចងភ្ជាប់ការចូល និងការចេញទៅឧបករណ៍តែមួយក្នុងមួយបុគ្គលិកក្នុងមួយថ្ងៃ។ មានកំណត់ហេតុសវនកម្មពេញលេញ។',
            ],
        ],
        '/how-it-works' => [
            'en' => [
                'How it works',
                'Set up staff attendance tracking in minutes. Create a workspace, add employees, display a QR code, and track check-ins live from your dashboard.',
            ],
            'fr' => [
                'Comment ça marche',
                "Configurez le suivi des présences en quelques minutes. Créez un espace de travail, ajoutez des employés, affichez un code QR et suivez les check-ins en direct depuis votre tableau de bord.",
            ],
            'km' => [
                'របៀបដំណើរការ',
                'រៀបចំការតាមដានវត្តមានបុគ្គលិកក្នុងពេលប៉ុន្មាននាទី។ បង្កើតការងារ បន្ថែមបុគ្គលិក បង្ហាញកូដ QR និងតាមដានការចូលរួមផ្ទាល់ពីផ្ទាំងគ្រប់គ្រងរបស់អ្នក។',
            ],
        ],
        '/demo' => [
            'en' => [
                'Try the demo',
                'Experience DailyBrew with a pre-configured demo workspace. Sign in as an owner, manager, or employee to explore all features.',
            ],
            'fr' => [
                'Essayer la démo',
                "Découvrez DailyBrew avec un espace de démonstration préconfiguré. Connectez-vous en tant que propriétaire, manager ou employé pour explorer toutes les fonctionnalités.",
            ],
            'km' => [
                'សាកល្បងការបង្ហាញ',
                'ស្វែងយល់ DailyBrew ជាមួយការងារបង្ហាញដែលរៀបចំជាមុន។ ចូលជាម្ចាស់ ប្រធាន ឬបុគ្គលិកដើម្បីស្វែងយល់លក្ខណៈពិសេសទាំងអស់។',
            ],
        ],
        '/roles' => [
            'en' => [
                'Roles and permissions',
                'Understand what owners, managers, and employees can do in DailyBrew. Full permissions matrix for attendance tracking, leave management, and workspace settings.',
            ],
            'fr' => [
                'Rôles et permissions',
                "Comprenez ce que les propriétaires, managers et employés peuvent faire dans DailyBrew. Matrice complète des permissions pour le suivi des présences, la gestion des congés et les paramètres.",
            ],
            'km' => [
                'តួនាទី និងសិទ្ធិ',
                'យល់ដឹងពីអ្វីដែលម្ចាស់ ប្រធាន និងបុគ្គលិកអាចធ្វើនៅក្នុង DailyBrew។ ម៉ាទ្រីសសិទ្ធិពេញលេញសម្រាប់ការតាមដានវត្តមាន ការគ្រប់គ្រងការឈប់ និងការកំណត់ការងារ។',
            ],
        ],
        '/pricing' => [
            'en' => [
                'Pricing',
                'DailyBrew plans start free for up to 10 employees. Espresso at $19.99/month adds geofencing, device verification, and leave management. Double Espresso for unlimited staff.',
            ],
            'fr' => [
                'Tarifs',
                "Les plans DailyBrew commencent gratuitement jusqu'à 10 employés. Espresso à 19,99 $/mois ajoute le géorepérage, la vérification d'appareil et la gestion des congés. Double Espresso pour un personnel illimité.",
            ],
            'km' => [
                'តម្លៃ',
                'គម្រោង DailyBrew ចាប់ផ្តើមឥតគិតថ្លៃរហូតដល់បុគ្គលិក ១០ នាក់។ Espresso តម្លៃ $19.99/ខែ បន្ថែម geofencing ការផ្ទៀងផ្ទាត់ឧបករណ៍ និងការគ្រប់គ្រងការឈប់។ Double Espresso សម្រាប់បុគ្គលិកគ្មានកំណត់។',
            ],
        ],
        '/faq' => [
            'en' => [
                'FAQ',
                'Frequently asked questions about DailyBrew. Learn about QR check-in, shifts, leave requests, pricing, and how to get started with attendance tracking.',
            ],
            'fr' => [
                'FAQ',
                "Questions fréquentes sur DailyBrew. Découvrez le check-in par QR, les horaires, les demandes de congé, les tarifs et comment commencer le suivi des présences.",
            ],
            'km' => [
                'សំណួរញឹកញាប់',
                'សំណួរដែលត្រូវបានសួរញឹកញាប់អំពី DailyBrew។ ស្វែងយល់អំពីការចូលរួមដោយ QR វេន សំណើឈប់ តម្លៃ និងរបៀបចាប់ផ្តើមការតាមដានវត្តមាន។',
            ],
        ],
        '/support' => [
            'en' => [
                'Support',
                'Get help with DailyBrew. Contact our team, report bugs, or submit feature requests for your restaurant attendance tracking.',
            ],
            'fr' => [
                'Support',
                "Obtenez de l'aide pour DailyBrew. Contactez notre équipe, signalez des bugs ou soumettez des demandes de fonctionnalités pour votre suivi de présences.",
            ],
            'km' => [
                'ការគាំទ្រ',
                'ទទួលបានជំនួយជាមួយ DailyBrew។ ទាក់ទងក្រុមការងាររបស់យើង រាយការណ៍កំហុស ឬដាក់សំណើលក្ខណៈពិសេសសម្រាប់ការតាមដានវត្តមានភោជនីយដ្ឋានរបស់អ្នក។',
            ],
        ],
        '/guides' => [
            'en' => [
                'Guides',
                'Step-by-step playbooks for owners, employees, and teams upgrading to Espresso. Pick the path that matches you.',
            ],
            'fr' => [
                'Guides',
                "Guides pas à pas pour les propriétaires, les employés et les équipes qui passent à Espresso. Choisissez le parcours qui vous convient.",
            ],
            'km' => [
                'មគ្គុទ្ទេសក៍',
                'មគ្គុទ្ទេសក៍ជាជំហានៗសម្រាប់ម្ចាស់ បុគ្គលិក និងក្រុមដែលដំឡើងទៅ Espresso។ ជ្រើសរើសផ្លូវដែលសមនឹងអ្នក។',
            ],
        ],
        '/guides/owner' => [
            'en' => [
                'Owner setup guide',
                'From sign-up to live attendance in about 10 minutes. Step-by-step setup for restaurant owners using DailyBrew.',
            ],
            'fr' => [
                "Guide d'installation propriétaire",
                "De l'inscription à la prise des présences en environ 10 minutes. Installation pas à pas pour les propriétaires de restaurant utilisant DailyBrew.",
            ],
            'km' => [
                'មគ្គុទ្ទេសក៍ដំឡើងសម្រាប់ម្ចាស់',
                'ពីការចុះឈ្មោះដល់ការតាមដានវត្តមានផ្ទាល់ក្នុងពេលប្រហែល ១០ នាទី។ ការដំឡើងជាជំហានៗសម្រាប់ម្ចាស់ភោជនីយដ្ឋានដែលប្រើ DailyBrew។',
            ],
        ],
        '/guides/employee' => [
            'en' => [
                'Employee guide',
                'Install DailyBrew, link to your workspace, and scan the QR to clock in. Daily routine for restaurant staff.',
            ],
            'fr' => [
                'Guide employé',
                "Installez DailyBrew, liez-vous à votre espace de travail et scannez le QR pour pointer. Routine quotidienne pour le personnel de restaurant.",
            ],
            'km' => [
                'មគ្គុទ្ទេសក៍បុគ្គលិក',
                'ដំឡើង DailyBrew ភ្ជាប់ទៅការងាររបស់អ្នក និងស្កែន QR ដើម្បីចូលរួម។ ទម្លាប់ប្រចាំថ្ងៃសម្រាប់បុគ្គលិកភោជនីយដ្ឋាន។',
            ],
        ],
        '/guides/espresso' => [
            'en' => [
                'Upgrade to Espresso',
                'Unlock leave management, geofencing, device verification, managers, and BasilBook integration on the Espresso plan.',
            ],
            'fr' => [
                'Passer à Espresso',
                "Débloquez la gestion des congés, le géorepérage, la vérification d'appareil, les managers et l'intégration BasilBook avec le plan Espresso.",
            ],
            'km' => [
                'ដំឡើងទៅ Espresso',
                'ដោះសោការគ្រប់គ្រងការឈប់ geofencing ការផ្ទៀងផ្ទាត់ឧបករណ៍ ប្រធាន និងការតភ្ជាប់ BasilBook នៅលើគម្រោង Espresso។',
            ],
        ],
        '/guides/nfc' => [
            'en' => [
                'Set up NFC check-in',
                'Step-by-step guide for restaurant owners to replace the QR scan with a one-second NFC tap. Buy stickers, program them with your workspace URL, and place them at the counter.',
            ],
            'fr' => [
                'Configurer le check-in NFC',
                "Guide pas à pas pour les propriétaires de restaurant pour remplacer le scan QR par un tap NFC d'une seconde. Achetez des stickers, programmez-les avec l'URL de votre espace, et placez-les au comptoir.",
            ],
            'km' => [
                'រៀបចំការចូលរួម NFC',
                'មគ្គុទ្ទេសក៍ជាជំហានៗសម្រាប់ម្ចាស់ភោជនីយដ្ឋានដើម្បីជំនួសការស្កែន QR ដោយការប៉ះ NFC មួយវិនាទី។ ទិញស្ទីកឃ័រ កម្មវិធីពួកវាដោយ URL នៃការងាររបស់អ្នក និងដាក់ពួកវានៅបញ្ជរ។',
            ],
        ],
        '/sign-up' => [
            'en' => [
                'Sign up',
                'Create your free DailyBrew account. Start tracking staff attendance with QR check-in in minutes. No credit card required.',
            ],
            'fr' => [
                "S'inscrire",
                "Créez votre compte DailyBrew gratuit. Commencez à suivre les présences du personnel avec le check-in par QR en quelques minutes. Aucune carte de crédit requise.",
            ],
            'km' => [
                'ចុះឈ្មោះ',
                'បង្កើតគណនី DailyBrew ឥតគិតថ្លៃរបស់អ្នក។ ចាប់ផ្តើមតាមដានវត្តមានបុគ្គលិកជាមួយការចូលរួមដោយ QR ក្នុងពេលប៉ុន្មាននាទី។ មិនត្រូវការកាតឥណទាន។',
            ],
        ],
        '/sign-in' => [
            'en' => [
                'Sign in',
                'Sign in to DailyBrew to manage your restaurant staff attendance, shifts, and leave requests.',
            ],
            'fr' => [
                'Se connecter',
                "Connectez-vous à DailyBrew pour gérer les présences, les horaires et les demandes de congé de votre personnel de restaurant.",
            ],
            'km' => [
                'ចូល',
                'ចូល DailyBrew ដើម្បីគ្រប់គ្រងវត្តមានបុគ្គលិក វេន និងសំណើឈប់របស់ភោជនីយដ្ឋានរបស់អ្នក។',
            ],
        ],
        '/privacy' => [
            'en' => [
                'Privacy policy',
                'How DailyBrew collects, uses, and protects your data. Learn about our privacy practices for attendance tracking, notifications, and payment processing.',
            ],
            'fr' => [
                'Politique de confidentialité',
                "Comment DailyBrew collecte, utilise et protège vos données. Découvrez nos pratiques de confidentialité pour le suivi des présences, les notifications et le traitement des paiements.",
            ],
            'km' => [
                'គោលការណ៍ឯកជនភាព',
                'របៀបដែល DailyBrew ប្រមូល ប្រើ និងការពារទិន្នន័យរបស់អ្នក។ ស្វែងយល់ពីការអនុវត្តឯកជនភាពរបស់យើងសម្រាប់ការតាមដានវត្តមាន ការជូនដំណឹង និងការដំណើរការទូទាត់។',
            ],
        ],
        '/terms' => [
            'en' => [
                'Terms of use',
                'Terms governing the use of DailyBrew, including subscription plans, QR check-in, data handling, and account responsibilities.',
            ],
            'fr' => [
                "Conditions d'utilisation",
                "Conditions régissant l'utilisation de DailyBrew, y compris les plans d'abonnement, le check-in par QR, la gestion des données et les responsabilités du compte.",
            ],
            'km' => [
                'លក្ខខណ្ឌប្រើប្រាស់',
                'លក្ខខណ្ឌគ្រប់គ្រងការប្រើប្រាស់ DailyBrew រួមមានគម្រោងជាវ ការចូលរួមដោយ QR ការគ្រប់គ្រងទិន្នន័យ និងការទទួលខុសត្រូវនៃគណនី។',
            ],
        ],
        '/refund' => [
            'en' => [
                'Refund policy',
                'DailyBrew refund policy: refund eligibility, how to request a refund, processing times, and the difference between cancellation and refund.',
            ],
            'fr' => [
                'Politique de remboursement',
                "Politique de remboursement DailyBrew : éligibilité au remboursement, comment demander un remboursement, délais de traitement et différence entre annulation et remboursement.",
            ],
            'km' => [
                'គោលការណ៍សងប្រាក់វិញ',
                'គោលការណ៍សងប្រាក់វិញរបស់ DailyBrew៖ លក្ខណៈវិនិច្ឆ័យសងប្រាក់វិញ របៀបស្នើសុំសងប្រាក់វិញ រយៈពេលដំណើរការ និងភាពខុសគ្នារវាងការលុបចោល និងការសងប្រាក់វិញ។',
            ],
        ],
        '/delete-account' => [
            'en' => [
                'Delete your account',
                'Request deletion of your DailyBrew account and all associated data including attendance records, workspaces, and employee profiles.',
            ],
            'fr' => [
                'Supprimer votre compte',
                "Demandez la suppression de votre compte DailyBrew et de toutes les données associées, y compris les enregistrements de présence, les espaces de travail et les profils d'employés.",
            ],
            'km' => [
                'លុបគណនីរបស់អ្នក',
                'ស្នើសុំការលុបគណនី DailyBrew របស់អ្នក និងទិន្នន័យពាក់ព័ន្ធទាំងអស់ រួមមានកំណត់ត្រាវត្តមាន ការងារ និងប្រវត្តិរូបបុគ្គលិក។',
            ],
        ],
        '/blog' => [
            'en' => [
                'Blog',
                'Notes on attendance, time clocks, and small-team operations. New posts as we ship.',
            ],
            'fr' => [
                'Blog',
                'Notes sur la présence, les pointeuses et les opérations des petites équipes. De nouveaux articles au fil des sorties.',
            ],
            'km' => [
                'ប្លុក',
                'កំណត់ត្រាស្ដីពីវត្តមាន ការតាមដានពេលវេលា និងប្រតិបត្តិការក្រុមតូច។ មានអត្ថបទថ្មីៗតាមដែលយើងចេញ។',
            ],
        ],
        '/blog/three-factor-attendance' => [
            'en' => [
                'Three-factor attendance: how modern login security came to the time clock',
                "Your email doesn't trust your password alone. Here's why device, network, and a physical tap make buddy punching mechanically impossible — without a single biometric.",
            ],
            'fr' => [
                'Présence à trois facteurs : la sécurité moderne des connexions appliquée à la pointeuse',
                "Votre messagerie ne fait pas confiance à votre mot de passe seul. Voici pourquoi l'appareil, le réseau et un toucher physique rendent le pointage par procuration mécaniquement impossible — sans aucune donnée biométrique.",
            ],
            'km' => [
                'វត្តមានបីកត្តា៖ សុវត្ថិភាពចូលគណនីបែបទំនើបបានមកដល់ការតាមដានពេលវេលា',
                'អ៊ីមែលរបស់អ្នកមិនទុកចិត្តតែលើពាក្យសម្ងាត់ទេ។ នេះជាមូលហេតុដែលឧបករណ៍ បណ្តាញ និងការប៉ះរូបវ័ន្តធ្វើឱ្យការចូលរួមជំនួសគ្នាមិនអាចទៅរួចតាមមេកានិច — ដោយគ្មានទិន្នន័យជីវមាត្រ។',
            ],
        ],
        '/blog/live-checkin-alerts-on-telegram' => [
            'en' => [
                'Live check-in alerts: a Telegram toggle for owners who want every clock-in',
                "Turn on a single setting and DailyBrew sends a Telegram ping the moment any staff member clocks in or out. Espresso+ feature, off by default — the noise profile is intentional.",
            ],
            'fr' => [
                'Alertes de pointage en direct : un commutateur Telegram pour les propriétaires qui veulent chaque pointage',
                "Activez un seul paramètre et DailyBrew envoie un ping Telegram dès qu'un membre du personnel pointe à l'arrivée ou au départ. Fonctionnalité Espresso+, désactivée par défaut — la fréquence est intentionnelle.",
            ],
            'km' => [
                'ការជូនដំណឹងចូល/ចេញផ្ទាល់៖ ការកំណត់ Telegram សម្រាប់ម្ចាស់ដែលចង់ដឹងគ្រប់ការចូលរួម',
                'បើកការកំណត់តែមួយ ហើយ DailyBrew នឹងផ្ញើការជូនដំណឹង Telegram ភ្លាមៗនៅពេលបុគ្គលិកចូលរួម ឬចេញ។ លក្ខណៈពិសេស Espresso+ បិទតាមលំនាំដើម — ប្រេកង់ខ្ពស់គឺមានចេតនា។',
            ],
        ],
        '/blog/the-new-device-alert' => [
            'en' => [
                "The new-device alert: when a check-in looks fine but isn't",
                "DailyBrew pings the owner the moment a staff member clocks in from a phone they've never used before. Here's why first-time-on-this-device is the right trigger — and what to do when an alert lands.",
            ],
            'fr' => [
                "L'alerte de nouvel appareil : quand un pointage semble normal mais ne l'est pas",
                "DailyBrew avertit le propriétaire dès qu'un membre du personnel pointe depuis un téléphone jamais utilisé. Voici pourquoi la première utilisation d'un appareil est le bon déclencheur — et que faire lorsqu'une alerte arrive.",
            ],
            'km' => [
                'ការជូនដំណឹងពីឧបករណ៍ថ្មី៖ នៅពេលការចូលរួមមើលទៅធម្មតា ប៉ុន្តែវាមិនមែនជាការពិត',
                'DailyBrew ជូនដំណឹងម្ចាស់ហាងភ្លាមៗនៅពេលបុគ្គលិកចូលរួមពីទូរស័ព្ទដែលមិនធ្លាប់ប្រើពីមុន។ នេះជាហេតុផលដែលការប្រើឧបករណ៍លើកដំបូងគឺជាការផ្តើមដ៏ត្រឹមត្រូវ — និងអ្វីដែលត្រូវធ្វើនៅពេលការជូនដំណឹងមកដល់។',
            ],
        ],
        '/blog/the-buddy-punching-tax' => [
            'en' => [
                'The buddy punching tax: what time theft really costs a small café',
                "Nucleus Research pegs buddy punching at 2.2% of payroll, and 75% of businesses are affected. Here's what that looks like on a 5-person café budget — and why face recognition and GPS aren't the right fix.",
            ],
            'fr' => [
                'La taxe du pointage par procuration : ce que le vol de temps coûte vraiment à un petit café',
                "Nucleus Research évalue le pointage par procuration à 2,2 % de la masse salariale, et 75 % des entreprises sont concernées. Voici à quoi cela ressemble pour un café de 5 personnes — et pourquoi la reconnaissance faciale et le GPS ne sont pas la bonne solution.",
            ],
            'km' => [
                'ពន្ធនៃការចូលរួមជំនួសគ្នា៖ ការលួចពេលវេលាចំណាយប៉ុន្មានដល់ហាងកាហ្វេតូច',
                'Nucleus Research បានវាយតម្លៃថាការចូលរួមជំនួសគ្នាស្មើនឹង ២,២% នៃប្រាក់បៀវត្សរ៍ ហើយ ៧៥% នៃអាជីវកម្មរងផលប៉ះពាល់។ នេះជាអ្វីដែលវាមើលទៅសម្រាប់ហាងកាហ្វេ៥នាក់ — និងហេតុអ្វីការទទួលស្គាល់មុខ និង GPS មិនមែនជាដំណោះស្រាយត្រឹមត្រូវ។',
            ],
        ],
    ];

    /**
     * Alias path => canonical path. The SPA serves both URLs with the same UI,
     * but search engines should treat the canonical as the indexable one and
     * collapse the alias into it. The alias still appears in {@see INDEXABLE_PAGES}
     * with its own title/description so SpaController returns 200 (not 404) and
     * link-preview scrapers get sensible OG tags; only the canonical link rel
     * differs from the requested URL.
     *
     * Alias paths are deliberately omitted from the dynamic sitemap (see
     * {@see indexablePaths()}) so we don't advertise two URLs for one page.
     */
    private const CANONICAL_ALIASES = [
        '/device-verified-attendance' => '/features/device-verification',
    ];

    /** Valid SPA routes that must load (200) but must never be indexed. */
    private const PRIVATE_PREFIXES = ['/console', '/admin', '/checkin', '/auth'];

    /** Valid top-level SPA routes that load (200) but should not be indexed. */
    private const PRIVATE_PATHS = ['/onboarding', '/forgot-password', '/reset-password'];

    /**
     * Normalize an arbitrary locale string to one of {@see self::LOCALES}.
     * Accepts BCP-47 tags like 'fr-FR', 'km-KH' — strips region/variant.
     */
    public function normalizeLocale(?string $raw): string
    {
        if (null === $raw || '' === $raw) {
            return self::DEFAULT_LOCALE;
        }

        $primary = strtolower(strtok($raw, '-_'));
        return in_array($primary, self::LOCALES, true) ? $primary : self::DEFAULT_LOCALE;
    }

    public function resolve(string $path, ?string $locale = null): SeoMeta
    {
        $path = $this->normalize($path);
        $locale = $this->normalizeLocale($locale);

        if (isset(self::INDEXABLE_PAGES[$path])) {
            $entries = self::INDEXABLE_PAGES[$path];
            // Fall back to EN if a translation is missing for a registered page.
            [$title, $description] = $entries[$locale] ?? $entries[self::DEFAULT_LOCALE];

            // If this path is an alias of another canonical page, advertise the
            // canonical URL so Google deduplicates. Alternates also fold to the
            // canonical — emitting hreflang on the alias would tell Google the
            // alias is the entry point for one of the languages, which it isn't.
            $canonicalPath = self::CANONICAL_ALIASES[$path] ?? $path;

            return new SeoMeta(
                title: $this->fullTitle($title, $path),
                description: $description,
                canonical: self::BASE_URL.($canonicalPath === '/' ? '/' : $canonicalPath),
                index: true,
                statusCode: 200,
                locale: $locale,
                alternates: $this->alternatesFor($canonicalPath),
            );
        }

        if ($this->isPrivatePath($path)) {
            $defaults = self::DEFAULTS[$locale] ?? self::DEFAULTS[self::DEFAULT_LOCALE];

            return new SeoMeta(
                title: $defaults['title'],
                description: $defaults['description'],
                canonical: null,
                index: false,
                statusCode: 200,
                locale: $locale,
                alternates: [],
            );
        }

        // Unknown path: return a real 404 so search engines drop it instead of
        // flagging a soft 404. The SPA shell still boots and renders its 404 view.
        $defaults = self::DEFAULTS[$locale] ?? self::DEFAULTS[self::DEFAULT_LOCALE];

        return new SeoMeta(
            title: ('km' === $locale ? 'រកមិនឃើញទំព័រ — ' : ('fr' === $locale ? 'Page introuvable — ' : 'Page not found — ')).self::SITE_NAME,
            description: $defaults['description'],
            canonical: null,
            index: false,
            statusCode: 404,
            locale: $locale,
            alternates: [],
        );
    }

    /**
     * URLs to advertise as hreflang alternates for a given indexable path.
     * Each variant uses a ?lang= query param except the default (which is the bare URL,
     * acting as x-default + en). The signal tells Google: "this URL serves multiple
     * languages; here are the canonical entry points for each."
     *
     * @return array<string, string> locale code => absolute URL
     */
    public function alternatesFor(string $path): array
    {
        $path = $this->normalize($path);
        if (!isset(self::INDEXABLE_PAGES[$path])) {
            return [];
        }

        $base = self::BASE_URL.($path === '/' ? '/' : $path);
        $alt = [];
        foreach (self::LOCALES as $loc) {
            $alt[$loc] = self::DEFAULT_LOCALE === $loc ? $base : $base.'?lang='.$loc;
        }
        // x-default points at the unparameterized URL (English).
        $alt['x-default'] = $base;

        return $alt;
    }

    /**
     * Every indexable path in canonical (no-locale) form. Used by the dynamic sitemap.
     * Alias paths are excluded so the sitemap never advertises a non-canonical URL —
     * that would tell Google to crawl two pages for one piece of content.
     *
     * @return list<string>
     */
    public function indexablePaths(): array
    {
        return array_values(array_filter(
            array_keys(self::INDEXABLE_PAGES),
            static fn(string $path): bool => !isset(self::CANONICAL_ALIASES[$path]),
        ));
    }

    private function normalize(string $path): string
    {
        // getPathInfo() already excludes the query string; guard anyway.
        $path = strtok($path, '?');
        $path = false === $path ? '/' : $path;

        // Drop a trailing slash on everything except the root.
        if ('/' !== $path && str_ends_with($path, '/')) {
            $path = rtrim($path, '/');
        }

        return '' === $path ? '/' : $path;
    }

    private function fullTitle(string $title, string $path): string
    {
        return '/' === $path ? $title : $title.' — '.self::SITE_NAME;
    }

    private function isPrivatePath(string $path): bool
    {
        if (in_array($path, self::PRIVATE_PATHS, true)) {
            return true;
        }

        foreach (self::PRIVATE_PREFIXES as $prefix) {
            if ($path === $prefix || str_starts_with($path, $prefix.'/')) {
                return true;
            }
        }

        return false;
    }
}
