import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Navigation from './Navigation';
import './Layout.css';

const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="layout">
      <Header />
      <Navigation />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;