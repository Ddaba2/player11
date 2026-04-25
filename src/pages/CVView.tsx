import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { SportCV } from '../types/cv';
import CVRenderer from '../components/CVRenderer';
import {
  ArrowLeft, Download, Share2, Trophy, Copy, Check,
  MessageCircle, ExternalLink, RefreshCw, Facebook
} from 'lucide-react';
import Player11Logo from '../components/Logo';

interface CVViewProps {
  cvId: string;
  onNavigate: (page: string, cvId?: string) => void;
  isPublic?: boolean;
}

export default function CVView({ cvId, onNavigate, isPublic = false }: CVViewProps) {
  const [cv, setCv] = useState<SportCV | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [refetching, setRefetching] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const prevCvIdRef = useRef<string | null>(null);
  const cvRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cvChanged = prevCvIdRef.current !== cvId;
    prevCvIdRef.current = cvId;
    const fullScreenLoad = cvChanged;

    if (fullScreenLoad) {
      setLoading(true);
      setRefetching(false);
      setNotFound(false);
    } else {
      setRefetching(true);
    }

    // Try to fetch by ID first, then by slug if not found
    const fetchCV = async () => {
      let { data, error } = await supabase
        .from('sport_cvs')
        .select('*')
        .eq('id', cvId)
        .maybeSingle();

      // If not found by ID, try by public_slug
      if (!data && !error) {
        ({ data, error } = await supabase
          .from('sport_cvs')
          .select('*')
          .eq('public_slug', cvId)
          .maybeSingle());
      }

      if (error) {
        setNotFound(true);
        setCv(null);
      } else if (data) {
        setCv(data as SportCV);
        setNotFound(false);
      } else {
        setNotFound(true);
        setCv(null);
      }
      if (fullScreenLoad) setLoading(false);
      setRefetching(false);
    };

    fetchCV();
  }, [cvId, refreshTick]);

  const handleRefreshCv = () => {
    setRefreshTick(t => t + 1);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getShareUrl = () => {
    // Use public_slug if available, fallback to cvId
    const identifier = cv?.public_slug || cvId;
    const paramName = cv?.public_slug ? 'slug' : 'cv';
    return `${window.location.origin}${window.location.pathname}?${paramName}=${identifier}`;
  };

  const handleShare = async () => {
    const url = getShareUrl();
    const title = cv ? `Player11 — ${cv.full_name}` : 'Player11';
    const text = cv ? `Découvrez le CV Player11 de ${cv.full_name}` : 'Partage Player11';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch { /* cancelled */ }
    } else {
      setShowShareMenu(prev => !prev);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowShareMenu(false);
  };

  const handleWhatsApp = () => {
    const url = getShareUrl();
    const text = cv ? `Découvrez le CV Player11 de ${cv.full_name} : ${url}` : url;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleFacebook = () => {
    const url = getShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleOpenLink = () => {
    window.open(getShareUrl(), '_blank');
    setShowShareMenu(false);
  };

  useEffect(() => {
    if (!isPublic || !cv) return;
    const key = `cv-view-logged-${cv.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    supabase.from('cv_view_events').insert({
      cv_id: cv.id,
      owner_user_id: cv.user_id,
      source: 'public_link',
      viewer_user_agent: navigator.userAgent,
    }).then(() => {
      // Fire and forget: tracking should never block public access
    });
  }, [isPublic, cv]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !cv) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">CV introuvable</h2>
          <p className="text-slate-400 mb-6">Ce profil n'existe pas ou n'est pas accessible.</p>
          {!isPublic && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition"
            >
              Retour au tableau de bord
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Styles d'impression optimisés */}
      <style>{`
        @media print {
          /* Masquer tout ce qui n'est pas le CV */
          body * { 
            visibility: hidden !important; 
          }
          
          /* Rendre visible uniquement la zone du CV */
          #cv-print-area, #cv-print-area * { 
            visibility: visible !important; 
          }
          
          /* Positionner le CV en haut à gauche de la page physique */
          #cv-print-area {
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important; /* Largeur A4 exacte */
            height: 297mm !important; /* Hauteur A4 exacte */
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* Forcer les fonds colorés et désactiver les marges navigateur */
          @page {
            size: A4;
            margin: 0;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-950">
        {/* Header toolbar */}
        <div className="no-print bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            {!isPublic ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Tableau de bord</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center">
                  <Player11Logo width={32} height={32} />
                </div>
                <span className="text-white font-black text-sm tracking-tight">PLAYER11</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {!isPublic && (
                <button
                  onClick={() => onNavigate('editor', cvId)}
                  className="text-slate-400 hover:text-white text-sm transition px-3 py-2 rounded-lg hover:bg-slate-700/50"
                >
                  Modifier
                </button>
              )}

              <button
                type="button"
                onClick={handleRefreshCv}
                disabled={loading || refetching}
                title="Recharger le CV depuis la base"
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition px-3 py-2 rounded-lg hover:bg-slate-700/50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refetching ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter PDF</span>
              </button>

              {/* Share */}
              <div className="relative" ref={shareRef}>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-red-600/30"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Partager</span>
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50">
                    <button
                      onClick={handleWhatsApp}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-slate-700 transition text-sm"
                    >
                      <MessageCircle className="w-4 h-4 text-green-400" />
                      Partager sur WhatsApp
                    </button>
                    <button
                      onClick={handleFacebook}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-slate-700 transition text-sm"
                    >
                      <Facebook className="w-4 h-4 text-blue-400" />
                      Partager sur Facebook
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-slate-700 transition text-sm"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                      {copied ? 'Lien copié !' : 'Copier le lien'}
                    </button>
                    <button
                      onClick={handleOpenLink}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-slate-700 transition text-sm"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      Ouvrir le lien
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CV Preview */}
        <div className="max-w-5xl mx-auto px-0 sm:px-6 py-0 sm:py-8">
          <div ref={cvRef} className="bg-white shadow-2xl sm:rounded-2xl overflow-hidden">
            <CVRenderer cv={cv} />
          </div>

          {/* Share prompt at bottom */}
          {!isPublic && (
            <div className="no-print mt-6 mx-4 sm:mx-0 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-bold">Partage ton CV</h3>
                <p className="text-slate-400 text-sm mt-0.5">Envoie ce lien à des recruteurs, coaches ou amis</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copié !' : 'Copier le lien'}
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  onClick={handleFacebook}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
