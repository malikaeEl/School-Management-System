import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Topbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

import AdminDashboard from './pages/AdminDashboard';
import AcademicManagement from './pages/AcademicManagement';
import HRStaffManagement from './pages/HRManagement';
import FinanceManagement from './pages/FinanceManagement';
import AcademicAttendance from './pages/AcademicAttendance';
import TransportGPS from './pages/TransportGPS';
import ReportsAnalytics from './pages/ReportsAnalytics';
import CommunicationHub from './pages/CommunicationHub';
import StudentManagement from './pages/StudentManagement';
import StudentProfile from './pages/StudentProfile';
import AdmissionsEnrollment from './pages/AdmissionsEnrollment';
import OnlineLearningPortal from './pages/OnlineLearningPortal';
import LibraryManagement from './pages/LibraryManagement';
import EventsCalendar from './pages/EventsCalendar';
import ExamsGrades from './pages/ExamsGrades';
import Timetable from './pages/Timetable';
import InventoryManagement from './pages/InventoryManagement';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Login from './pages/Login';
import EnrollmentLanding from './pages/EnrollmentLanding';
import UserManagement from './pages/UserManagement';

const MainLayout = ({ children }) => {
  const { lang, t } = useLanguage();
  return (
    <div className={`flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar />
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden ${lang === 'ar' ? 'mr-64' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/enroll" element={<EnrollmentLanding />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <MainLayout><AdminDashboard /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/student-dashboard" element={
        <ProtectedRoute allowedRoles={['student', 'admin']}>
          <MainLayout><StudentDashboard /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/parent-dashboard" element={
        <ProtectedRoute allowedRoles={['parent', 'admin']}>
          <MainLayout><ParentDashboard /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/teacher-dashboard" element={
        <ProtectedRoute allowedRoles={['teacher', 'admin']}>
          <MainLayout><TeacherDashboard /></MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/hr" element={<ProtectedRoute allowedRoles={['admin', 'finance']}><MainLayout><HRStaffManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/finance" element={<ProtectedRoute allowedRoles={['admin', 'finance']}><MainLayout><FinanceManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/academic" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><MainLayout><AcademicManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><MainLayout><AcademicAttendance /></MainLayout></ProtectedRoute>} />
      <Route path="/transport" element={<ProtectedRoute allowedRoles={['admin', 'parent']}><MainLayout><TransportGPS /></MainLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin', 'finance']}><MainLayout><ReportsAnalytics /></MainLayout></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><MainLayout><StudentManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/students/:id" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><MainLayout><StudentProfile /></MainLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><UserManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/admission" element={<ProtectedRoute allowedRoles={['admin']}><MainLayout><AdmissionsEnrollment /></MainLayout></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute allowedRoles={['admin', 'librarian', 'student']}><MainLayout><LibraryManagement /></MainLayout></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><MainLayout><EventsCalendar /></MainLayout></ProtectedRoute>} />
      <Route path="/exams" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}><MainLayout><ExamsGrades /></MainLayout></ProtectedRoute>} />
      <Route path="/timetable" element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}><MainLayout><Timetable /></MainLayout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute allowedRoles={['admin', 'librarian', 'finance']}><MainLayout><InventoryManagement /></MainLayout></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
