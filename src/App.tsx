/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ResolveIT — AI-Powered IT Service Desk
 * Main Application Shell & Route Declarations
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from './lib/router.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';

// Layouts
import { PublicLayout } from './components/layouts/PublicLayout.tsx';
import { CustomerLayout } from './components/layouts/CustomerLayout.tsx';
import { AgentLayout } from './components/layouts/AgentLayout.tsx';

// Public Pages
import { LandingPage } from './pages/LandingPage.tsx';
import { CustomerLoginPage } from './pages/CustomerLoginPage.tsx';
import { CustomerRegisterPage } from './pages/CustomerRegisterPage.tsx';
import { AgentLoginPage } from './pages/AgentLoginPage.tsx';
import { DocumentationPage } from './pages/DocumentationPage.tsx';

// Customer Pages
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage.tsx';
import { CustomerTicketsPage } from './pages/customer/CustomerTicketsPage.tsx';
import { NewTicketPage } from './pages/customer/NewTicketPage.tsx';

// Agent Pages
import { AgentDashboardPage } from './pages/agent/AgentDashboardPage.tsx';
import { AgentTicketsPage } from './pages/agent/AgentTicketsPage.tsx';
import { AgentAnalyticsPage } from './pages/agent/AgentAnalyticsPage.tsx';

// Protected Customer Route Wrapper
const CustomerRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/customer/login" replace />;
  }

  if (user.role === 'Agent') {
    return <Navigate to="/agent" replace />;
  }

  return <>{children}</>;
};

// Protected Agent Route Wrapper
const AgentRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/agent/login" replace />;
  }

  if (user.role !== 'Agent') {
    return <Navigate to="/customer" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Routes with PublicLayout */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="customer/login" element={<CustomerLoginPage />} />
        <Route path="customer/register" element={<CustomerRegisterPage />} />
        <Route path="agent/login" element={<AgentLoginPage />} />
        <Route path="documentation" element={<DocumentationPage />} />
      </Route>

      {/* 2. Customer Routes with CustomerLayout */}
      <Route
        path="/customer"
        element={
          <CustomerRouteGuard>
            <CustomerLayout />
          </CustomerRouteGuard>
        }
      >
        <Route index element={<CustomerDashboardPage />} />
        <Route path="tickets" element={<CustomerTicketsPage />} />
        <Route path="tickets/new" element={<NewTicketPage />} />
      </Route>

      {/* 3. Agent Routes with AgentLayout */}
      <Route
        path="/agent"
        element={
          <AgentRouteGuard>
            <AgentLayout />
          </AgentRouteGuard>
        }
      >
        <Route index element={<AgentDashboardPage />} />
        <Route path="tickets" element={<AgentTicketsPage />} />
        <Route path="analytics" element={<AgentAnalyticsPage />} />
      </Route>

      {/* 4. Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

