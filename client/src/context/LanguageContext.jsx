import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('lang');
    return (saved === 'fr' || saved === 'ar') ? saved : 'fr';
  });
  const [dir, setDir] = useState(lang === 'ar' ? 'rtl' : 'ltr');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    const newDir = lang === 'ar' ? 'rtl' : 'ltr';
    setDir(newDir);
    document.documentElement.dir = newDir;
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'fr' ? 'ar' : 'fr');
  };

  const t = (key) => {
    const translations = {
      fr: {
        dashboard: 'Tableau de bord',
        students: 'Étudiants',
        teachers: 'Enseignants',
        revenue: 'Chiffre d\'Affaires',
        attendance: 'Présence',
        recent_activity: 'Activités Récentes',
        quick_actions: 'Actions Rapides',
        add_student: 'Ajouter un Étudiant',
        mark_attendance: 'Marquer Présence',
        generate_report: 'Générer Rapport',
        search: 'Rechercher...',
        profile: 'Profil',
        logout: 'Déconnexion',
        welcome: 'Bienvenue',
        arabic: 'عربي',
        french: 'Français',
        monday: 'Lundi',
        tuesday: 'Mardi',
        wednesday: 'Mercredi',
        thursday: 'Jeudi',
        friday: 'Vendredi',
        saturday: 'Samedi',
        sunday: 'Dimanche',
        academics: 'Gestion Académique',
        hr: 'Ressources Humaines',
        payroll: 'Paie',
        leave_requests: 'Demandes de Congé',
        timetable: 'Emploi du temps',
        exams: 'Examens',
        admissions: 'Admissions',
        inventory: 'Inventaire',
        events: 'Événements',
        learning: 'E-learning',
        reports: 'Rapports',
        grades: 'Notes & Résultats',
        marks: 'Saisie des Notes',
        report_cards: 'Bulletins de Notes',
        schedule_exam: 'Planifier Examen',
        library_inventory: 'Inventaire Livres',
        borrowing: 'Emprunts',
        overdue: 'Retards',
        messaging: 'Messages',
        announcements: 'Annonces',
        bus_routes: 'Itinéraires Bus',
        gps_tracking: 'Suivi GPS',
        drivers: 'Chauffeurs',
        invoices: 'Factures',
        fees_structure: 'Structure des Frais',
        total_revenue: 'Revenu Total',
        pending_fees: 'Frais en Attente',
        collection_rate: 'Taux de Recouvrement',
        scholarships: 'Bourses',
        paid: 'Payé',
        pending: 'En attente',
        total_assets: 'Total des Actifs',
        consumables: 'Consommables',
        stock_alerts: 'Alertes de Stock',
        maintenance: 'Entretien',
        categories: 'Catégories',
        low_stock: 'Stock Faible',
        performance_heatmap: 'Carte de Performance',
        attendance_trends: 'Tendances de Présence',
        financial_forecast: 'Prévisions Financières'
      },
      ar: {
        dashboard: 'لوحة القيادة',
        students: 'الطلاب',
        teachers: 'المعلمون',
        revenue: 'الإيرادات',
        attendance: 'الحضور',
        recent_activity: 'الأنشطة الأخيرة',
        quick_actions: 'إجراءات سريعة',
        add_student: 'إضافة طالب',
        mark_attendance: 'تسجيل الحضور',
        generate_report: 'إنشاء تقرير',
        search: 'بحث...',
        profile: 'الملف الشخصي',
        logout: 'تسجيل الخروج',
        welcome: 'مرحباً',
        arabic: 'عربي',
        french: 'فرنسي',
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
        sunday: 'الأحد',
        academics: 'الإدارة الأكاديمية',
        hr: 'الموارد البشرية',
        payroll: 'الرواتب',
        leave_requests: 'طلبات الإجازة',
        timetable: 'الجدول الزمني',
        exams: 'الامتحانات',
        admissions: 'الطلبات',
        inventory: 'المخزون',
        events: 'الفعاليات',
        learning: 'التعلم الرقمي',
        reports: 'التقارير',
        grades: 'النتائج والدرجات',
        marks: 'إدخال النقط',
        report_cards: 'بيانات النقط',
        schedule_exam: 'جدولة الامتحان',
        library_inventory: 'مخزون المكتبة',
        borrowing: 'الإعارة',
        overdue: 'التأخيرات',
        messaging: 'الرسائل',
        announcements: 'الإعلانات',
        bus_routes: 'مسارات الحافلات',
        gps_tracking: 'تتبع GPS',
        drivers: 'السائقون',
        invoices: 'الفواتير',
        fees_structure: 'هيكل الرسوم',
        total_revenue: 'إجمالي الإيرادات',
        pending_fees: 'الرسوم المعلقة',
        collection_rate: 'معدل التحصيل',
        scholarships: 'المنح الدراسية',
        paid: 'مدفوع',
        pending: 'قيد الانتظار',
        total_assets: 'إجمالي الأصول',
        consumables: 'المواد الاستهلاكية',
        stock_alerts: 'تنبيهات المخزون',
        maintenance: 'الصيانة',
        categories: 'الفئات',
        low_stock: 'مخزون منخفض',
        performance_heatmap: 'خريطة الأداء',
        attendance_trends: 'اتجاهات الحضور',
        financial_forecast: 'التوقعات المالية'
      }
    };
    const currentLang = translations[lang] ? lang : 'fr';
    return translations[currentLang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, toggleLanguage, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
