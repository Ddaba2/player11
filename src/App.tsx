import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CVEditor from './pages/CVEditor';
import CVView from './pages/CVView';

function AppRouter() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Gestion des paramètres URL hérités (cv=... ou slug=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cv = params.get('cv');
    const slug = params.get('slug');

    if (cv) {
      navigate(`/view/${cv}`, { replace: true });
    } else if (slug) {
      navigate(`/view/${slug}`, { replace: true });
    }
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Routes publiques */}
      <Route 
        path="/login" 
        element={!user ? <Login onNavigate={(p, id) => navigate(id ? `/${p}/${id}` : `/${p}`)} /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/register" 
        element={!user ? <Register onNavigate={(p) => navigate(`/${p}`)} /> : <Navigate to="/dashboard" replace />} 
      />

      {/* Routes privées */}
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard onNavigate={(p, id) => navigate(id ? `/${p}/${id}` : `/${p}`)} /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/editor" 
        element={user ? <CVEditor onNavigate={(p, id) => navigate(id ? `/${p}/${id}` : `/${p}`)} /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/editor/:cvId" 
        element={user ? <CVEditorWrapper onNavigate={(p, id) => navigate(id ? `/${p}/${id}` : `/${p}`)} /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/view/:cvId" 
        element={user ? <CVViewWrapper onNavigate={(p, id) => navigate(id ? `/${p}/${id}` : `/${p}`)} /> : <Navigate to="/login" replace />} 
      />
      {/* Route publique spéciale pour le générateur PDF (Option Puppeteer) */}
      <Route 
        path="/cv-print/:cvId" 
        element={<CVViewWrapper onNavigate={() => {}} isPublic={true} />} 
      />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

// Wrappers pour extraire les params car les composants existants attendent cvId en prop
import { useParams } from 'react-router-dom';

function CVEditorWrapper({ onNavigate }: { onNavigate: (p: string, id?: string) => void }) {
  const { cvId } = useParams();
  return <CVEditor cvId={cvId} onNavigate={onNavigate} />;
}

function CVViewWrapper({ onNavigate, isPublic = false }: { onNavigate: (p: string, id?: string) => void, isPublic?: boolean }) {
  const { cvId } = useParams();
  return <CVView cvId={cvId!} onNavigate={onNavigate} isPublic={isPublic} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
