import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { NotFound } from './components/ui';
import { Home } from './pages/Home';

// Home ships in the main bundle; other sections load on demand behind the shell's Suspense fallback.
const SearchPage = lazy(() => import('./pages/Search').then((module) => ({ default: module.SearchPage })));
const Rules = lazy(() => import('./pages/Rules').then((module) => ({ default: module.Rules })));
const JurisdictionProfile = lazy(() => import('./pages/Jurisdiction').then((module) => ({ default: module.JurisdictionProfile })));
const Communities = lazy(() => import('./pages/Communities').then((module) => ({ default: module.Communities })));
const CommunityProfile = lazy(() => import('./pages/Communities').then((module) => ({ default: module.CommunityProfile })));
const Compare = lazy(() => import('./pages/Compare').then((module) => ({ default: module.Compare })));
const Reach = lazy(() => import('./pages/Reach').then((module) => ({ default: module.Reach })));
const Effects = lazy(() => import('./pages/Effects').then((module) => ({ default: module.Effects })));
const Debates = lazy(() => import('./pages/Debates').then((module) => ({ default: module.Debates })));
const History = lazy(() => import('./pages/History').then((module) => ({ default: module.History })));
const DataTools = lazy(() => import('./pages/DataTools').then((module) => ({ default: module.DataTools })));
const SourceDetail = lazy(() => import('./pages/DataTools').then((module) => ({ default: module.SourceDetail })));

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="rules" element={<Rules />} />
          <Route path="jurisdictions/:id" element={<JurisdictionProfile />} />
          <Route path="communities" element={<Communities />} />
          <Route path="communities/:id" element={<CommunityProfile />} />
          <Route path="compare" element={<Compare />} />
          <Route path="reach" element={<Reach />} />
          <Route path="effects" element={<Effects />} />
          <Route path="debates" element={<Debates />} />
          <Route path="history" element={<History />} />
          <Route path="data" element={<DataTools />} />
          <Route path="data/:id" element={<SourceDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
