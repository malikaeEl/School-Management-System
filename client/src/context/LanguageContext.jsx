import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'fr');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
  };

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const toggleLanguage = () => {};

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
      en: {
        dashboard: 'Dashboard',
        students: 'Students',
        teachers: 'Teachers',
        revenue: 'Revenue',
        attendance: 'Attendance',
        recent_activity: 'Recent Activity',
        quick_actions: 'Quick Actions',
        add_student: 'Add Student',
        mark_attendance: 'Mark Attendance',
        generate_report: 'Generate Report',
        search: 'Search...',
        profile: 'Profile',
        logout: 'Logout',
        welcome: 'Welcome',
        english: 'English',
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
        academics: 'Academics',
        hr: 'Human Resources',
        payroll: 'Payroll',
        leave_requests: 'Leave Requests',
        timetable: 'Timetable',
        exams: 'Exams',
        admissions: 'Admissions',
        inventory: 'Inventory',
        events: 'Events',
        learning: 'E-learning',
        reports: 'Reports',
        grades: 'Grades & Results',
        marks: 'Enter Marks',
        report_cards: 'Report Cards',
        schedule_exam: 'Schedule Exam',
        library_inventory: 'Library Inventory',
        borrowing: 'Borrowing',
        overdue: 'Overdue',
        messaging: 'Messages',
        announcements: 'Announcements',
        bus_routes: 'Bus Routes',
        gps_tracking: 'GPS Tracking',
        drivers: 'Drivers',
        invoices: 'Invoices',
        fees_structure: 'Fees Structure',
        total_revenue: 'Total Revenue',
        pending_fees: 'Pending Fees',
        collection_rate: 'Collection Rate',
        scholarships: 'Scholarships',
        paid: 'Paid',
        pending: 'Pending',
        total_assets: 'Total Assets',
        consumables: 'Consumables',
        stock_alerts: 'Stock Alerts',
        maintenance: 'Maintenance',
        categories: 'Categories',
        low_stock: 'Low Stock',
        performance_heatmap: 'Performance Heatmap',
        attendance_trends: 'Attendance Trends',
        financial_forecast: 'Financial Forecast'
      }
    };
    return translations[lang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, toggleLanguage, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
