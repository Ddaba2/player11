import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { SportCV } from '../types/cv';
import CVRenderer from '../components/CVRenderer';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
  const [refreshTick, setRefreshTick] = useState(0);
  const [refetching, setRefetching] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
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

  const waitForImages = async (node: HTMLElement) => {
    const images = Array.from(node.querySelectorAll('img'));
    await Promise.all(images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    }));
  };

  /** html2canvas coupe tout ce qui est en overflow:hidden — neutraliser sur le clone uniquement. */
  const prepareExportClone = (root: HTMLElement) => {
    root.style.setProperty('overflow', 'visible', 'important');
    root.style.setProperty('max-height', 'none', 'important');
    root.style.setProperty('max-width', '794px', 'important');
    root.style.setProperty('width', '794px', 'important');
    root.style.setProperty('min-width', '794px', 'important');

    root.querySelectorAll<HTMLElement>('*').forEach((el) => {
      const cs = window.getComputedStyle(el);
      if (
        cs.overflow === 'hidden' ||
        cs.overflow === 'clip' ||
        cs.overflowY === 'hidden' ||
        cs.overflowX === 'hidden'
      ) {
        el.style.setProperty('overflow', 'visible', 'important');
      }
    });
  };

  const buildExportCanvas = async (source: HTMLElement) => {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-cv-pdf-export', '1');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '0';
    wrapper.style.top = '0';
    wrapper.style.width = '794px';
    wrapper.style.maxWidth = '794px';
    wrapper.style.background = '#ffffff';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.opacity = '0';
    wrapper.style.zIndex = '-1';
    wrapper.style.overflow = 'visible';

    const clone = source.cloneNode(true) as HTMLElement;
    clone.id = 'cv-print-area-export';
    clone.style.width = '794px';
    clone.style.minWidth = '794px';
    clone.style.maxWidth = '794px';
    clone.style.margin = '0';
    clone.style.height = 'auto';
    clone.style.transform = 'none';
    clone.style.overflow = 'visible';
    prepareExportClone(clone);

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      await waitForImages(clone);
      if ('fonts' in document) {
        await (document as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready;
      }
      await new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );

      void clone.offsetHeight;
      void wrapper.offsetHeight;

      const fullH = Math.max(clone.scrollHeight, clone.offsetHeight, wrapper.scrollHeight);
      const windowH = Math.max(fullH + 400, clone.scrollHeight + 160);

      return await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        x: 0,
        y: 0,
        width: clone.offsetWidth,
        height: fullH,
        windowWidth: 794,
        windowHeight: windowH,
      });
    } finally {
      document.body.removeChild(wrapper);
    }
  };

  /** Découpe le canvas source en bandes puis une page PDF par bande — fiable mobile. */
  const canvasToPagedPdfBlob = (canvas: HTMLCanvasElement): Blob => {
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const pxPerMm = canvas.width / pageWidth;
    const slicePxH = Math.max(16, Math.floor(pageHeight * pxPerMm));

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    const sliceCtx = sliceCanvas.getContext('2d');
    if (!sliceCtx) {
      return pdf.output('blob');
    }

    let yPx = 0;
    let page = 0;
    while (yPx < canvas.height) {
      if (page > 0) pdf.addPage();
      const sliceH = Math.min(slicePxH, canvas.height - yPx);
      sliceCanvas.height = sliceH;
      sliceCtx.fillStyle = '#ffffff';
      sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      sliceCtx.drawImage(
        canvas,
        0, yPx, canvas.width, sliceH,
        0, 0, canvas.width, sliceH,
      );
      const jpeg = sliceCanvas.toDataURL('image/jpeg', 0.92);
      const sliceMmH = (sliceH * pageWidth) / canvas.width;
      pdf.addImage(jpeg, 'JPEG', 0, 0, pageWidth, sliceMmH, undefined, 'FAST');

      yPx += sliceH;
      page += 1;
    }

    return pdf.output('blob');
  };

  const downloadBlob = async (blob: Blob, filename: string) => {
    const mobileUA = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

    if (mobileUA && navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `CV ${cv?.full_name || 'Player11'}`,
            files: [file],
          });
          return;
        }
      } catch {
        // Fallback direct download/open below.
      }
    }

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // iOS/Safari bloque parfois le "download"; on ouvre le PDF.
    if (mobileUA && /iphone|ipad|ipod/i.test(navigator.userAgent)) {
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById('cv-print-area');
      if (!element) {
        alert('Impossible de générer le PDF : CV non trouvé');
        return;
      }

      // Sur PC, on garde exactement l'ancienne méthode: window.print().
      // Sur mobile, on force juste le layout "desktop" pendant le print pour que le rendu soit identique.
      const isMobileScreen = window.innerWidth < 768;
      if (!isMobileScreen) {
        window.print();
        return;
      }

      // Mobile: vrai téléchargement PDF (sans écran "printer").
      setIsExportingPdf(true);
      await new Promise(resolve => setTimeout(resolve, 180));
      if ('fonts' in document) {
        await (document as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready;
      }

      const canvas = await buildExportCanvas(element);
      const blob = canvasToPagedPdfBlob(canvas);

      const safeName = (cv?.full_name || 'cv')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_ ]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
      const filename = `player11-cv-${safeName || 'athlete'}.pdf`;
      await downloadBlob(blob, filename);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setIsExportingPdf(false);
    }
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
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter PDF</span>
                <span className="sm:hidden">PDF</span>
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
            <CVRenderer cv={cv} forceDesktopLayout={isExportingPdf} />
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
