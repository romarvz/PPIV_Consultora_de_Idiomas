import React, { useState, useEffect } from 'react';
import { getCurrentSession, logout } from './services/authService';
import LoginFinancial from './components/auth/LoginFinancial';
import PendingPaymentsAlerts from './components/alerts/PendingPaymentsAlerts';

const FinancialModule = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión activa
    const currentSession = getCurrentSession();
    setSession(currentSession);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    logout();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  // Si no hay sesión, mostrar login
  if (!session) {
    return <LoginFinancial onLoginSuccess={setSession} />;
  }

  // Si hay sesión, mostrar dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Módulo Financiero
              </h1>
              <p className="text-sm text-gray-600">
                Bienvenido, {session.nombre}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-3">
            <a href="#" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-3">
              Dashboard
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 pb-3">
              Pagos Profesores
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 pb-3">
              Cobros Estudiantes
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 pb-3">
              Reportes
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 pb-3">
              Configuración
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Pagos Pendientes</div>
            <div className="text-3xl font-bold text-red-600">$10,500</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Cobros Pendientes</div>
            <div className="text-3xl font-bold text-orange-600">$15,000</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Balance Mes</div>
            <div className="text-3xl font-bold text-green-600">$45,000</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Cuenta Corriente</div>
            <div className="text-3xl font-bold text-blue-600">-$50,000</div>
          </div>
        </div>

        {/* Alerts Section */}
        <PendingPaymentsAlerts />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow transition duration-200">
            <div className="text-xl font-semibold mb-2">Registrar Pago</div>
            <div className="text-sm opacity-90">A profesores</div>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow transition duration-200">
            <div className="text-xl font-semibold mb-2">Registrar Cobro</div>
            <div className="text-sm opacity-90">De estudiantes</div>
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg shadow transition duration-200">
            <div className="text-xl font-semibold mb-2">Ver Reportes</div>
            <div className="text-sm opacity-90">Financieros</div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default FinancialModule;
