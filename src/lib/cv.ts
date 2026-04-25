export type PositionProfile = 'defender' | 'midfielder' | 'attacker';

export const getPositionProfile = (position: string): PositionProfile => {
  const p = position.toLowerCase();
  if (/def|arriere|lat[ée]ral|stoppeur|central/.test(p)) return 'defender';
  if (/milieu|relayeur|sentinelle|moc|mdc/.test(p)) return 'midfielder';
  return 'attacker';
};

export const getAgeFromDob = (dob: string | null): string => {
  if (!dob) return '';
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return '';
  const diff = Date.now() - birthDate.getTime();
  return String(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
};

export const ageToDob = (ageValue: string): string | null => {
  const age = parseInt(ageValue, 10);
  if (!Number.isFinite(age) || age <= 0) return null;
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
};
