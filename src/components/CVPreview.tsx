import type { ReactNode } from 'react';
import type { SportCV, CareerEntry } from '../types/cv';
import Player11Logo from './Logo';
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

interface CVPreviewProps {
  cv: SportCV;
}

const calcAge = (dob: string | null) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const getSportEmoji = (sport: string) => {
  const map: Record<string, string> = {
    Football: '⚽', Basketball: '🏀', Tennis: '🎾', Rugby: '🏉',
    Natation: '🏊', Athlétisme: '🏃', Handball: '🤾', Volleyball: '🏐',
    Cyclisme: '🚴', Boxe: '🥊', Judo: '🥋', Karaté: '🥋',
    Ski: '⛷️', Gymnastique: '🤸', Triathlon: '🏊', MMA: '🥊',
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

export default function CVPreview({ cv }: CVPreviewProps) {
  const age = calcAge(cv.date_of_birth);
  const videos = cv.video_links ?? [];
  const photos = cv.action_photos ?? [];
  const sortedCareer = [...(cv.career ?? [])].sort(
    (a, b) => careerRecencyScore(b) - careerRecencyScore(a),
  );

  const sportLabel = (cv.sport || 'Sport').toUpperCase();

  return (
    <div
      id="cv-print-area"
      className="cv-container bg-slate-950"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
    >
      {/* Bandeau : fond rayé + barre accent */}
      <div
        style={{
          background: `
            repeating-linear-gradient(
              -28deg,
              #0f172a 0px,
              #0f172a 14px,
              #131f35 14px,
              #131f35 15px
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
            background: 'linear-gradient(90deg, #991b1b, #dc2626, #ea580c)',
            borderRadius: '0 0 10px 0',
          }}
        />

        <div
          style={{
            padding: '28px 28px 32px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          {/* Contact — haut gauche */}
          <div
            style={{
              background: 'rgba(127, 29, 29, 0.35)',
              border: '2px solid #b91c1c',
              borderRadius: '14px',
              padding: '16px 18px',
              flex: '1 1 200px',
              maxWidth: '280px',
              minWidth: '200px',
            }}
          >
            <h3
              style={{
                color: '#fecaca',
                fontSize: '10px',
                fontWeight: 900,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                margin: '0 0 12px',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(248, 113, 113, 0.35)',
              }}
            >
              Contact
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cv.email ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Mail size={14} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: '#e2e8f0', fontSize: '11px', wordBreak: 'break-all', lineHeight: 1.45 }}>
                    {cv.email}
                  </span>
                </div>
              ) : null}
              {cv.phone ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={14} color="#f87171" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#e2e8f0', fontSize: '11px' }}>{cv.phone}</span>
                </div>
              ) : null}
              {(cv.address || '').trim() ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <MapPin size={14} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: '#e2e8f0', fontSize: '11px', lineHeight: 1.45, whiteSpace: 'pre-line' }}>
                    {cv.address.trim()}
                  </span>
                </div>
              ) : null}
              {cv.instagram ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Instagram size={14} color="#f87171" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#e2e8f0', fontSize: '11px', wordBreak: 'break-all' }}>
                    {cv.instagram.startsWith('@') ? cv.instagram : `@${cv.instagram}`}
                  </span>
                </div>
              ) : null}
              {cv.twitter ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Twitter size={14} color="#f87171" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#e2e8f0', fontSize: '11px', wordBreak: 'break-all' }}>
                    {cv.twitter.startsWith('@') ? cv.twitter : `@${cv.twitter}`}
                  </span>
                </div>
              ) : null}
              {!cv.email && !cv.phone && !(cv.address || '').trim() && !cv.instagram && !cv.twitter ? (
                <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic' }}>
                  Coordonnées à compléter
                </span>
              ) : null}
            </div>
          </div>

          {/* Photo */}
          <div style={{ flexShrink: 0 }}>
            {cv.photo_url ? (
              <img
                src={cv.photo_url}
                alt={cv.full_name}
                style={{
                  width: '148px',
                  height: '168px',
                  objectFit: 'cover',
                  borderRadius: '14px',
                  border: '3px dashed rgba(185, 28, 28, 0.95)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div
                style={{
                  width: '148px',
                  height: '168px',
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

          {/* Bloc identité (maquette encadrée) + statistiques */}
          <div style={{ flex: '1 1 280px', minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', marginBottom: '18px' }}>
              <div style={{ width: '72px', minWidth: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Player11Logo width={72} height={72} />
              </div>
              <div style={{ minWidth: 0 }}>
                <span
                  style={{
                    background: 'rgba(127, 29, 29, 0.95)',
                    color: '#fff',
                    padding: '6px 16px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    border: '1px solid rgba(0,0,0,0.2)',
                    display: 'inline-block',
                  }}
                >
                  {sportLabel}
                </span>
              </div>
            </div>

            <h1
              style={{
                color: '#fff',
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 900,
                lineHeight: 1.05,
                margin: '0 0 8px',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
              }}
            >
              {cv.full_name || 'Nom complet'}
            </h1>

            <p style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 600, lineHeight: 1.4 }}>
              <span style={{ color: '#94a3b8' }}>{cv.position || 'Poste'}</span>
              {cv.position && cv.current_club ? (
                <span style={{ color: '#64748b', margin: '0 6px' }}>·</span>
              ) : null}
              <span style={{ color: '#fb923c' }}>{cv.current_club || ''}</span>
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
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

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
              <MetricBox
                icon={<ClipboardList size={22} color="#f87171" />}
                label="Matchs joués"
                value={cv.matches_played ?? 0}
              />
              <MetricBox
                icon={<Target size={22} color="#f87171" />}
                label="Buts"
                value={cv.goals ?? 0}
              />
              <MetricBox
                icon={<Handshake size={22} color="#f87171" />}
                label="Passes décisives"
                value={cv.assists ?? 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Corps */}
      <div style={{ display: 'flex', gap: 0, background: '#f1f5f9', alignItems: 'stretch' }}>
        <div
          style={{
            width: '320px',
            flexShrink: 0,
            background: '#0f172a',
            padding: '28px 20px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
          }}
        >
          {cv.bio ? (
            <Section title="Profil professionnel" light>
              <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.7 }}>{cv.bio}</p>
            </Section>
          ) : null}

          {(cv.height || cv.weight || cv.dominant_side) ? (
            <Section title="Caractéristiques physiques" light>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {cv.height ? <StatRow label="Taille" value={`${cv.height} cm`} /> : null}
                {cv.weight ? <StatRow label="Poids" value={`${cv.weight} kg`} /> : null}
                {cv.dominant_side ? <StatRow label="Profil" value={cv.dominant_side} /> : null}
              </div>
            </Section>
          ) : null}

          {(cv.skills ?? []).length > 0 ? (
            <Section title="Style de jeu" light>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(cv.skills ?? []).slice(0, 6).map(skill => (
                  <span
                    key={skill.id}
                    style={{
                      color: '#fecaca',
                      border: '1px solid rgba(248,113,113,0.45)',
                      background: 'rgba(127, 29, 29, 0.35)',
                      borderRadius: '999px',
                      padding: '5px 10px',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          {/* Médias : bas de colonne, liens cliquables */}
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            {(videos.length > 0 || photos.length > 0) ? (
              <div
                style={{
                  background: 'rgba(127, 29, 29, 0.35)',
                  border: '2px solid #b91c1c',
                  borderRadius: '14px',
                  padding: '14px 14px 16px',
                }}
              >
                <h3
                  style={{
                    color: '#fecaca',
                    fontSize: '10px',
                    fontWeight: 900,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    margin: '0 0 12px',
                  }}
                >
                  Médias et faits saillants
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {videos.map(vid => (
                    <a
                      key={vid.id}
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        background: 'rgba(15, 23, 42, 0.65)',
                        border: '1px solid rgba(248, 113, 113, 0.45)',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        color: '#fecaca',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                      }}
                    >
                      <Play size={16} />
                      {vid.title?.trim() || 'Vidéo'}
                    </a>
                  ))}
                  {photos.map((photo, idx) => (
                    <a
                      key={photo.id}
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        background: 'rgba(15, 23, 42, 0.65)',
                        border: '1px solid rgba(248, 113, 113, 0.45)',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        color: '#fecaca',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                      }}
                    >
                      <ImageIcon size={16} />
                      {photo.caption?.trim() || `Photo d'action ${idx + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ flex: 1, background: '#f1f5f9', padding: '28px 32px' }}>
          {sortedCareer.length > 0 ? (
            <Section title="Parcours professionnel">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {sortedCareer.map((entry, i) => {
                  const profile = getPositionProfile(entry.role || cv.position || '');
                  return (
                    <div key={entry.id} style={{ display: 'flex', gap: '16px' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: '#dc2626',
                            border: '3px solid white',
                            boxShadow: '0 0 0 2px #dc2626',
                          }}
                        />
                        {i < sortedCareer.length - 1 ? (
                          <div
                            style={{
                              width: '2px',
                              height: '60px',
                              background: 'linear-gradient(180deg, #dc2626, transparent)',
                              marginTop: '8px',
                            }}
                          />
                        ) : null}
                      </div>
                      <div
                        style={{
                          background: 'white',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          border: '1px solid #e2e8f0',
                          flex: 1,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '4px' }}>
                          <div>
                            <h4 style={{ color: '#0f172a', fontSize: '13px', fontWeight: 700, margin: 0 }}>{entry.club}</h4>
                            <p style={{ color: '#dc2626', fontSize: '11px', fontWeight: 600, margin: '2px 0 0' }}>{entry.role}</p>
                            {(() => {
                              const summary: string[] = [];
                              if (entry.matches_played != null) summary.push(`${entry.matches_played} ${pluralize(entry.matches_played, 'match', 'matchs')}`);
                              if (entry.goals != null) summary.push(`${entry.goals} ${pluralize(entry.goals, 'but', 'buts')}`);
                              if (entry.pass_success_pct != null) summary.push(`${entry.pass_success_pct}% passes`);
                              if (summary.length === 0) return null;
                              return (
                                <p style={{ color: '#0f172a', fontSize: '10px', fontWeight: 700, margin: '4px 0 0' }}>
                                  {summary.join(' | ')}
                                </p>
                              );
                            })()}
                            {(entry.league || entry.country) ? (
                              <p style={{ color: '#64748b', fontSize: '10px', margin: '2px 0 0' }}>
                                {[entry.league, entry.country].filter(Boolean).join(' • ')}
                              </p>
                            ) : null}
                          </div>
                          {(entry.start_year || entry.end_year) ? (
                            <span
                              style={{
                                background: '#fef2f2',
                                color: '#b91c1c',
                                padding: '2px 10px',
                                borderRadius: '16px',
                                fontSize: '10px',
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {entry.start_year}
                              {entry.start_year && entry.end_year ? ' — ' : ''}
                              {entry.end_year}
                            </span>
                          ) : null}
                        </div>
                        {entry.description ? (
                          <p style={{ color: '#64748b', fontSize: '11px', lineHeight: 1.6, margin: '8px 0 0' }}>
                            {entry.description}
                          </p>
                        ) : null}
                        <div style={{ marginTop: '8px', display: 'grid', gap: '4px' }}>
                          {(entry.matches_played != null || entry.matches_started != null || entry.minutes_played != null) ? (
                            <p style={{ color: '#475569', fontSize: '10px', margin: 0 }}>
                              {`Temps de jeu: ${entry.matches_played ?? 0} MJ • ${entry.matches_started ?? 0} Tit • ${entry.minutes_played ?? 0} min`}
                            </p>
                          ) : null}
                          {(entry.yellow_cards != null || entry.red_cards != null) ? (
                            <p style={{ color: '#475569', fontSize: '10px', margin: 0 }}>
                              {`Discipline: ${entry.yellow_cards ?? 0} jaunes • ${entry.red_cards ?? 0} rouges`}
                            </p>
                          ) : null}
                          {profile === 'defender' ? (
                            <p style={{ color: '#475569', fontSize: '10px', margin: 0 }}>
                              {`Interceptions/m: ${entry.interceptions_per_match ?? 0} • Tacles: ${entry.successful_tackles ?? 0} • Duels gagnés: ${entry.duels_won_pct ?? 0}% • Dégagements: ${entry.clearances ?? 0}`}
                            </p>
                          ) : profile === 'midfielder' ? (
                            <p style={{ color: '#475569', fontSize: '10px', margin: 0 }}>
                              {`Passes réussies: ${entry.pass_success_pct ?? 0}% • Passes clés: ${entry.key_passes ?? 0} • Ballons récupérés: ${entry.balls_recovered ?? 0}`}
                            </p>
                          ) : (
                            <p style={{ color: '#475569', fontSize: '10px', margin: 0 }}>
                              {`Buts: ${entry.goals ?? 0} • Tirs cadrés: ${entry.shots_on_target ?? 0}`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          ) : null}

          {(cv.achievements ?? []).length > 0 ? (
            <Section title="Palmarès et distinctions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(cv.achievements ?? []).map((ach, i) => (
                  <div
                    key={ach.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      background: 'white',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      border: '1px solid #fbbf24',
                      borderLeft: '3px solid #f59e0b',
                    }}
                  >
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                        <h4 style={{ color: '#0f172a', fontSize: '12px', fontWeight: 700, margin: 0 }}>{ach.title}</h4>
                        {ach.year ? <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700 }}>{ach.year}</span> : null}
                      </div>
                      {ach.description ? (
                        <p style={{ color: '#64748b', fontSize: '11px', margin: '3px 0 0' }}>{ach.description}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          ) : null}
        </div>
      </div>

      <div
        style={{
          background: '#0f172a',
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '2px solid #b91c1c',
        }}
      >
        <span style={{ color: '#475569', fontSize: '10px' }}>
          Profil généré avec Player11 — 2026
        </span>
        <span
          style={{
            background: 'rgba(127,29,29,0.35)',
            border: '1px solid #b91c1c',
            color: '#fecaca',
            padding: '3px 12px',
            borderRadius: '16px',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          {cv.sport || 'Sport'}
        </span>
      </div>
    </div>
  );
}

function IdentityPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '7px 12px',
        borderRadius: '999px',
        background: 'rgba(30, 41, 59, 0.95)',
        border: '1px solid rgba(71, 85, 105, 0.6)',
        color: '#e2e8f0',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      <span style={{ display: 'flex', color: '#94a3b8' }}>{icon}</span>
      {text}
    </div>
  );
}

function Section({ title, children, light = false }: { title: string; children: ReactNode; light?: boolean }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{ width: '3px', height: '14px', background: '#dc2626', borderRadius: '2px' }} />
        <h3
          style={{
            color: light ? '#94a3b8' : '#0f172a',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: '#64748b', fontSize: '11px' }}>{label}</span>
      <span style={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function MetricBox({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.55)',
        border: '1px solid rgba(248, 113, 113, 0.35)',
        borderRadius: '12px',
        padding: '12px 10px',
        textAlign: 'center',
        minHeight: '88px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
      }}
    >
      <span style={{ display: 'flex' }}>{icon}</span>
      <span style={{ color: '#cbd5e1', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}
      </span>
      <span style={{ color: '#fff', fontSize: '22px', fontWeight: 900 }}>{value}</span>
    </div>
  );
}
