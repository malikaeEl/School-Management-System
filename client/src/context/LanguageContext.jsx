import React, { createContext, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const lang = 'fr';
  const dir = 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

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
      }
    };
    return translations.fr[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, toggleLanguage, setLang: () => {}, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
