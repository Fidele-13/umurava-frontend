import { Suspense } from 'react';
import AnalysisPage from './app';

export default function AnalysePage() {
  return (
    <Suspense fallback={null}>
      <AnalysisPage />
    </Suspense>
  );
}
