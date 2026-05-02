import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { SportCV, CareerEntry } from '../types/cv';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Play,
  Image as ImageIcon,
  Mail,
  Phone,
  MapPin,
  User,
  Globe,
  Star,
  ClipboardList,
  Target,
  Handshake,
  Instagram,
  Twitter,
} from 'lucide-react';
import { getTemplateStyles } from './templates/TemplateStyles';
import LazyImage from './LazyImage';

interface CVPreviewProps {
  cv: SportCV;
  template?: string;
}

const calcAge = (dob: string | null) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const getSportEmoji = (sport: string) => {
  const map: Record<string, string> = {
    Football: '⚽',
    Basketball: '🏀',
    Handball: '🤾'
  };
  return map[sport] || '🏆';
};

/** Badge pied / main : affichage court type maquette */
const dominantShort = (side: string) => {
  const s = (side || '').toLowerCase();
  if (s.includes('droit')) return 'Droit';
  if (s.includes('gauche')) return 'Gauche';
  if (s.includes('deux') || s.includes('amb')) return 'Les deux';
  return side || '—';
};

const getPositionProfile = (position: string): 'defender' | 'midfielder' | 'attacker' => {
  const p = (position || '').toLowerCase();
  if (/def|arriere|lat[ée]ral|stoppeur|central/.test(p)) return 'defender';
  if (/milieu|relayeur|sentinelle|moc|mdc/.test(p)) return 'midfielder';
  return 'attacker';
};

const pluralize = (value: number, singular: string, plural: string) => (value > 1 ? plural : singular);

function careerRecencyScore(entry: CareerEntry): number {
  const end = (entry.end_year || '').trim();
  if (/présent|present|actuel|en\s*cours|\.\.\./i.test(end)) {
    return 1_000_000;
  }
  const endNum = parseInt(end, 10);
  const startNum = parseInt((entry.start_year || '').trim(), 10);
  const e = Number.isFinite(endNum) ? endNum : 0;
  const s = Number.isFinite(startNum) ? startNum : 0;
  return Math.max(e, s);
}

export default function CVPreview({ cv, template = 'modern' }: CVPreviewProps) {
  const [isMobile, setIsMobile] = useState(false);
  const age = calcAge(cv.date_of_birth);
  const videos = cv.video_links ?? [];
  const photos = cv.action_photos ?? [];
  const sortedCareer = [...(cv.career ?? [])].sort(
    (a, b) => careerRecencyScore(b) - careerRecencyScore(a),
  );

  const sportLabel = (cv.sport || 'Sport').toUpperCase();
  const publicUrl = `${window.location.origin}/cv/${cv.public_slug || cv.id}`;
  const templateStyles = getTemplateStyles(template);

  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth < 768);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  // FORCER l'affichage desktop pour cohérence parfaite mobile/PC
  const useDesktopLayout = false;

  return (
    <div
      id="cv-print-area"
      className="cv-container"
      style={{ 
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        width: '100%',
        maxWidth: '794px',
        minWidth: '320px',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
        maxHeight: 'none',
        minHeight: 'auto',
        backgroundColor: templateStyles.container.backgroundColor,
        color: templateStyles.container.color
      }}
    >
      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .cv-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .cv-section-header {
            page-break-after: avoid;
          }
        }
        
        @media screen and (max-width: 768px) {
          #cv-print-area {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            height: auto !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
            transform: none !important;
            margin: 0 !important;
            position: relative !important;
          }
          body {
            overflow-x: hidden !important;
            background: #f1f5f9 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          html {
            overflow-x: hidden !important;
          }
          .cv-mobile-stack {
            flex-direction: column !important;
          }
          .cv-mobile-full {
            width: 100% !important;
            max-width: 100% !important;
          }
          .cv-mobile-center {
            text-align: center !important;
          }
          .cv-mobile-grid-2 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .cv-mobile-text-sm {
            font-size: 0.9em !important;
          }
        }
        
        .cv-section {
          page-break-inside: avoid;
          break-inside: avoid;
          margin-bottom: 16px;
        }
        
        .cv-section-header {
          page-break-after: avoid;
        }
      `}</style>

      {/* Bandeau : fond rayé + barre accent */}
      <div className="cv-section cv-no-break"
        style={{
          background: `
            repeating-linear-gradient(
              -28deg,
              ${templateStyles.header.background} 0px,
              ${templateStyles.header.background} 14px,
              ${templateStyles.sidebar.backgroundColor} 14px,
              ${templateStyles.sidebar.backgroundColor} 15px
            )
          `,
          position: 'relative',
          paddingTop: '6px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '5px',
            background: templateStyles.accent.color,
            borderRadius: '0 0 10px 0',
          }}
        />

        <div
          className={isMobile ? "cv-mobile-stack" : ""}
          style={{
            padding: isMobile ? '14px 12px 14px' : '20px 24px 20px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '10px' : '16px',
            alignItems: isMobile ? 'center' : 'stretch',
          }}
        >
          {/* Photo */}
          <div className={isMobile ? "cv-mobile-full cv-mobile-center" : ""} style={{ flexShrink: 0, width: isMobile ? '120px' : '184px', display: 'flex' }}>
            {cv.photo_url ? (
              <LazyImage
                src={cv.photo_url}
                alt={cv.full_name}
                className="rounded-xl"
                style={{
                  width: isMobile ? '120px' : '100%',
                  height: isMobile ? '140px' : '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  border: '3px dashed rgba(185, 28, 28, 0.95)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '128px',
                  height: '150px',
                  borderRadius: '14px',
                  background: 'rgba(127, 29, 29, 0.2)',
                  border: '3px dashed rgba(185, 28, 28, 0.85)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '56px',
                }}
              >
                {getSportEmoji(cv.sport)}
              </div>
            )}
          </div>

          {/* Bloc identité + statistiques */}
          <div className={isMobile ? "cv-mobile-full cv-mobile-center" : ""} style={{ flex: '1 1 auto', minWidth: isMobile ? '0px' : '260px', width: '100%' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800, letterSpacing: '1.5px' }}>{sportLabel}</span>
            </div>

            <h1 className={isMobile ? "cv-mobile-text-sm" : ""}
              style={{
                color: '#fff',
                fontSize: isMobile ? '24px' : 'clamp(24px, 3.6vw, 34px)',
                fontWeight: 900,
                lineHeight: 1.05,
                margin: '0 0 6px',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                textAlign: isMobile ? 'center' : 'left',
              }}
            >
              {cv.full_name || 'Nom complet'}
            </h1>

            <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600, lineHeight: 1.3 }}>
              <span style={{ color: '#94a3b8' }}>{cv.position || 'Poste'}</span>
              {cv.position && cv.current_club ? (
                <span style={{ color: '#64748b', margin: '0 6px' }}>·</span>
              ) : null}
              <span style={{ color: '#fb923c' }}>{cv.current_club || ''}</span>
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {age != null ? (
                <IdentityPill icon={<User size={14} />} text={`${age} ans`} />
              ) : null}
              {cv.nationality ? (
                <IdentityPill icon={<Globe size={14} />} text={cv.nationality} />
              ) : null}
              {cv.dominant_side ? (
                <IdentityPill icon={<Star size={14} color="#fbbf24" />} text={dominantShort(cv.dominant_side)} />
              ) : null}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              {cv.email ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '11px' }}>
                  <Mail size={13} color="#f87171" />{cv.email}
                </span>
              ) : null}
              {cv.phone ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '11px' }}>
                  <Phone size={13} color="#f87171" />{cv.phone}
                </span>
              ) : null}
              {cv.instagram ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '11px' }}>
                  <Instagram size={13} color="#f87171" />{cv.instagram.startsWith('@') ? cv.instagram : `@${cv.instagram}`}
                </span>
              ) : null}
              {cv.twitter ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '11px' }}>
                  <Twitter size={13} color="#f87171" />{cv.twitter.startsWith('@') ? cv.twitter : `@${cv.twitter}`}
                </span>
              ) : null}
              {(cv.address || '').trim() ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '11px' }}>
                  <MapPin size={13} color="#f87171" />{cv.address.trim().slice(0, 42)}
                </span>
              ) : null}
            </div>

            <div
              className={isMobile ? "cv-mobile-grid-2" : ""}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, minmax(0, 1fr))',
                gap: '8px',
                width: isMobile ? '100%' : '90%',
                margin: isMobile ? '0' : '0 auto',
              }}
            >
              <MetricBox
                icon={<ClipboardList size={22} color="#f87171" />}
                label="Matchs joués"
                value={cv.matches_played ?? 0}
                compact={isMobile}
              />
              <MetricBox
                icon={<Target size={22} color="#f87171" />}
                label="Buts"
                value={cv.goals ?? 0}
                compact={isMobile}
              />
              <MetricBox
                icon={<Handshake size={22} color="#f87171" />}
                label="Passes décisives"
                value={cv.assists ?? 0}
                compact={isMobile}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Corps */}
      <div className={isMobile ? "cv-mobile-stack" : ""} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 0, background: templateStyles.content.backgroundColor, alignItems: 'stretch' }}>
        <div className={isMobile ? "cv-mobile-full" : ""}
          style={{
            width: isMobile ? '100%' : '320px',
            flexShrink: 0,
            background: templateStyles.sidebar.backgroundColor,
            padding: isMobile ? '18px 14px' : '28px 20px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
            color: templateStyles.sidebar.color
          }}
        >
          {cv.bio ? (
            <Section title="Profil professionnel" light>
              <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.7 }}>{cv.bio}</p>
            </Section>
          ) : null}

          {(cv.height || cv.weight || cv.dominant_side) ? (
            <Section title="Caractéristiques physiques" light>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cv.height ? (
                  <StatRow icon={<User size={14} color="#f87171" />} label="Taille" value={`${cv.height} cm`} />
                ) : null}
                {cv.weight ? (
                  <StatRow icon={<Target size={14} color="#f87171" />} label="Poids" value={`${cv.weight} kg`} />
                ) : null}
                {cv.dominant_side ? (
                  <StatRow icon={<Star size={14} color="#f87171" />} label="Dominant" value={dominantShort(cv.dominant_side)} />
                ) : null}
              </div>
            </Section>
          ) : null}

          {(cv.email || cv.phone || cv.address) ? (
            <Section title="Contact" light>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cv.email ? (
                  <StatRow icon={<Mail size={14} color="#f87171" />} label="Email" value={cv.email} />
                ) : null}
                {cv.phone ? (
                  <StatRow icon={<Phone size={14} color="#f87171" />} label="Téléphone" value={cv.phone} />
                ) : null}
                {cv.address ? (
                  <StatRow icon={<MapPin size={14} color="#f87171" />} label="Adresse" value={cv.address} />
                ) : null}
              </div>
            </Section>
          ) : null}

          {photos.length > 0 ? (
            <Section title="Photos d'action" light>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-print"
                    style={{
                      display: 'block',
                      aspectRatio: '4/3',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      border: '1px solid rgba(185, 28, 28, 0.2)',
                    }}
                  >
                    <LazyImage
                      src={photo.url}
                      alt={photo.caption || `Photo d'action`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                      color: 'white',
                      padding: '4px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}>
                      <ImageIcon size={12} />
                      {photo.caption?.trim() || `Photo d'action`}
                    </div>
                  </a>
                ))}
              </div>
            </Section>
          ) : null}
        </div>

        <div className={isMobile ? "cv-mobile-full" : ""} style={{ flex: 1, background: templateStyles.content.backgroundColor, padding: isMobile ? '16px 14px' : '28px 32px' }}>
          {sortedCareer.length > 0 ? (
            <Section title="Parcours professionnel">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {sortedCareer.map((entry) => {
                  const profile = getPositionProfile(entry.role || cv.position || '');
                  return (
                    <div key={entry.id} style={{ display: 'flex', gap: '16px' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: templateStyles.metrics.background,
                          border: `1px solid ${templateStyles.metrics.borderColor}`,
                          color: templateStyles.metrics.color,
                          fontSize: '18px',
                          fontWeight: 700,
                        }}
                      >
                        {profile === 'defender' ? 'D' : profile === 'midfielder' ? 'M' : 'A'}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: templateStyles.content.color }}>{entry.club}</span>
                          {entry.country ? (
                            <span style={{ fontSize: '12px', color: '#64748b' }}>({entry.country})</span>
                          ) : null}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                          {entry.role || cv.position || 'Poste'} • {entry.league || ''}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
                          {entry.start_year} - {entry.end_year}
                        </div>
                        {entry.description ? (
                          <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5, margin: '4px 0 0' }}>
                            {entry.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          ) : null}

          {videos.length > 0 ? (
            <Section title="Vidéos">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {videos.map((video) => (
                  <a
                    key={video.id}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-print"
                    style={{
                      display: 'block',
                      aspectRatio: '16/9',
                      backgroundColor: '#000',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      fontSize: '24px',
                    }}>
                      <Play size={32} />
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      color: 'white',
                      padding: '8px',
                      fontSize: '11px',
                    }}>
                      {video.title || `Vidéo ${videos.indexOf(video) + 1}`}
                    </div>
                  </a>
                ))}
              </div>
            </Section>
          ) : null}
        </div>
      </div>

      <div className={isMobile ? "cv-mobile-stack cv-mobile-center" : ""}
        style={{
          background: templateStyles.footer.backgroundColor,
          padding: isMobile ? '10px 14px' : '12px 32px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '10px' : '16px',
          borderTop: `2px solid ${templateStyles.footer.borderTopColor}`,
          color: templateStyles.footer.color
        }}
      >
        <span style={{ color: '#475569', fontSize: '10px' }}>
          Profil généré avec Player11 — 2026
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="no-print" style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right' }}>
            Scannez pour voir<br/>la version numérique
          </div>
          <QRCodeCanvas 
            value={publicUrl}
            size={64}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="M"
            includeMargin={false}
          />
        </div>
      </div>
    </div>
  );
}

// Composants locaux
function IdentityPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '7px 12px',
        borderRadius: '999px',
        backgroundColor: 'rgba(185, 28, 28, 0.1)',
        border: '1px solid rgba(185, 28, 28, 0.2)',
        color: '#dc2626',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}
    >
      {icon}
      {text}
    </div>
  );
}

interface MetricBoxProps {
  icon: ReactNode;
  label: string;
  value: number;
  compact?: boolean;
}

function MetricBox({ icon, label, value, compact = false }: MetricBoxProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: compact ? '4px' : '8px',
      padding: compact ? '8px 6px' : '12px 8px',
      backgroundColor: 'rgba(185, 28, 28, 0.1)',
      borderRadius: '12px',
      border: '1px solid rgba(185, 28, 28, 0.2)',
    }}>
      <div style={{ 
        color: '#dc2626', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: compact ? '18px' : '22px'
      }}>
        {icon}
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: compact ? '16px' : '20px', 
          fontWeight: 900, 
          lineHeight: 1,
          color: '#ffffff'
        }}>
          {value}
        </div>
        <div style={{ 
          fontSize: compact ? '9px' : '10px', 
          color: '#94a3b8',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
  light?: boolean;
}

function Section({ title, children, light = false }: SectionProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '2px solid rgba(185, 28, 28, 0.3)',
      }}>
        <div style={{
          width: '4px',
          height: '16px',
          backgroundColor: '#dc2626',
          borderRadius: '2px',
        }} />
        <span style={{
          fontSize: '13px',
          fontWeight: 700,
          color: light ? '#1e293b' : '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

interface StatRowProps {
  icon: ReactNode;
  label: string;
  value: string | number | null;
}

function StatRow({ icon, label, value }: StatRowProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      color: '#94a3b8',
    }}>
      {icon}
      <span style={{ fontWeight: 500 }}>{label}:</span>
      <span style={{ color: '#ffffff', fontWeight: 600 }}>{value || '—'}</span>
    </div>
  );
}
