import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './features/home/HomePage';
import { GymsPage } from './features/gyms/GymsPage';
import { GymPage } from './features/gyms/GymPage';
import { ActiveSessionPage } from './features/session/ActiveSessionPage';
import { SummaryPage } from './features/session/SummaryPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { HistoryPage } from './features/history/HistoryPage';
import { PlanPage } from './features/profile/PlanPage';
import { PlanImportPage } from './features/profile/PlanImportPage';
import { useSyncBootstrap } from './sync/useSync';

const ProgressPage = lazy(() => import('./features/progress/ProgressPage'));

export default function App() {
  useSyncBootstrap();
  return (
    <HashRouter>
      <main className="mx-auto max-w-2xl px-4 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/gyms" element={<GymsPage />} />
          <Route path="/gyms/:id" element={<GymPage />} />
          <Route path="/session/:id" element={<ActiveSessionPage />} />
          <Route path="/session/:id/summary" element={<SummaryPage />} />
          <Route
            path="/progress"
            element={
              <Suspense fallback={null}>
                <ProgressPage />
              </Suspense>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/plan/:id" element={<PlanPage />} />
          <Route path="/plan-import" element={<PlanImportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </HashRouter>
  );
}
