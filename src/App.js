import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ObjectiveDetail from './pages/ObjectiveDetail';
import AddObjective from './pages/AddObjective';
import EditObjective from './pages/EditObjective';
import FinanceDashboard from './components/finance/FinanceDashboard';
import { authService } from './services/api.service';
import StatisticsPage from './pages/page';
import HistoriqueProgressions from './components/HistoriqueProgressions';

// Composant pour les routes protégées
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Composant pour rediriger vers le dashboard si déjà authentifié
const AuthRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) {
      setTheme('light');
      document.body.classList.add('light');
    } else {
      setTheme('light');
      document.body.classList.remove('dark');
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } />
        <Route path="/register" element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        } />
        
        {/* Routes protégées */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard theme={theme} />
          </ProtectedRoute>
        } />
        <Route path="/statistics" element={
  <ProtectedRoute>
    <StatisticsPage />
  </ProtectedRoute>
} />
        <Route path="/historique" element={
  <ProtectedRoute>
    <HistoriqueProgressions />
  </ProtectedRoute>
} />
        <Route path="/finance" element={
          <ProtectedRoute>
            <FinanceDashboard />
          </ProtectedRoute>
        } />
        <Route path="/objectif/:id" element={
          <ProtectedRoute>
            <ObjectiveDetail />
          </ProtectedRoute>
        } />
        <Route path="/objectif/ajouter" element={
          <ProtectedRoute>
            <AddObjective />
          </ProtectedRoute>
        } />
        <Route path="/objectif/:id/modifier" element={
          <ProtectedRoute>
            <EditObjective />
          </ProtectedRoute>
        } />
        
        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
