import React, { useState } from 'react';
import { AuthProvider, useAuth } from './store/authStore.js';
import { Layout } from './components/Layout.js';
import { Footer } from './components/Footer.js';
import { Home } from './pages/Home.js';
import { NewComplaint } from './pages/NewComplaint.js';
import { TrackComplaint } from './pages/TrackComplaint.js';
import { MyComplaints } from './pages/MyComplaints.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { Login } from './pages/Login.js';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | undefined>('CMP-2025-1042');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const handleNavigate = (tab: string, complaintId?: string) => {
    if (complaintId) {
      setSelectedComplaintId(complaintId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <Layout activeTab={activeTab} onNavigate={handleNavigate}>
      {activeTab === 'home' && (
        <Home
          onNavigate={handleNavigate}
          onSelectCategory={handleSelectCategory}
        />
      )}
      {activeTab === 'new-complaint' && (
        <NewComplaint
          onNavigate={handleNavigate}
          initialCategory={selectedCategory}
        />
      )}
      {activeTab === 'track-complaint' && (
        <TrackComplaint
          complaintId={selectedComplaintId}
          onNavigate={handleNavigate}
        />
      )}
      {activeTab === 'my-complaints' && (
        <MyComplaints onNavigate={handleNavigate} />
      )}
      {activeTab === 'admin-dashboard' && (
        <AdminDashboard onNavigate={handleNavigate} />
      )}
      {activeTab === 'login' && <Login onNavigate={handleNavigate} />}
      <Footer />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
