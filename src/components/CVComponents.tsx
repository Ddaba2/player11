import { ReactNode } from 'react';

interface IdentityPillProps {
  icon: ReactNode;
  text: string;
}

export function IdentityPill({ icon, text }: IdentityPillProps) {
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

export function MetricBox({ icon, label, value, compact = false }: MetricBoxProps) {
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

export function Section({ title, children, light = false }: SectionProps) {
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

export function StatRow({ icon, label, value }: StatRowProps) {
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
