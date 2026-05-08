import { SportCV } from '../types/cv';
import CVPreview from './CVPreview';

interface CVRendererProps {
  cv: SportCV;
  forceDesktopLayout?: boolean;
}

export default function CVRenderer({ cv, forceDesktopLayout = false }: CVRendererProps) {
  return <CVPreview cv={cv} forceDesktopLayout={forceDesktopLayout} />;
}
