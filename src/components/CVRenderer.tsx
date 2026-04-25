import React from 'react';
import { SportCV } from '../types/cv';
import CVPreview from './CVPreview';

interface CVRendererProps {
  cv: SportCV;
}

export default function CVRenderer({ cv }: CVRendererProps) {
  return <CVPreview cv={cv} />;
}
