import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CVEditor from './pages/CVEditor';
import CVView from './pages/CVView';

type Page = 'login' | 'register' | 'dashboard' | 'editor' | 'view';

function AppRouter() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('login');
  const [cvId, setCvId] = useState<string | undefined>();
  const [publicCvId, setPublicCvId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cv = params.get('cv');
    if (cv) {
      setPublicCvId(cv);
      setPage('view');
      setCvId(cv);
    }
  }, []);

  useEffect(() => {
    if (!loading && !publicCvId) {
      if (user && (page === 'login' || page === 'register')) {
        setPage('dashboard');
      } else if (!user && page !== 'login' && page !== 'register') {
        setPage('login');
      }
    }
  }, [user, loading]);

  const navigate = (newPage: string, id?: string) => {
    if (newPage === 'view' || newPage === 'editor') {
      setCvId(id);
    }
    if (newPage === 'editor' && !id) {
      setCvId(undefined);
    }
    setPage(newPage as Page);

    if (newPage === 'view' && id) {
      const url = new URL(window.location.href);
      url.searchParams.set('cv', id);
      window.history.pushState({}, '', url.toString());
    } else if (newPage !== 'view') {
      const url = new URL(window.location.href);
      url.searchParams.delete('cv');
      window.history.pushState({}, '', url.toString());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (publicCvId && !user && page === 'view') {
    return <CVView cvId={publicCvId} onNavigate={navigate} isPublic />;
  }

  if (!user) {
    if (page === 'register') return <Register onNavigate={navigate} />;
    return <Login onNavigate={navigate} />;
  }

  if (page === 'view' && (cvId || publicCvId)) {
    return <CVView cvId={cvId ?? publicCvId!} onNavigate={navigate} />;
  }

  if (page === 'editor') {
    return <CVEditor cvId={cvId} onNavigate={navigate} />;
  }

  return <Dashboard onNavigate={navigate} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
