import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import ProjektePage from './pages/ProjektePage'
import ProjektDetailPage from './pages/ProjektDetailPage'
import AnforderungenPage from './pages/AnforderungenPage'
import PortalActivatePage from './pages/portal/PortalActivatePage'
import PortalLoginPage from './pages/portal/PortalLoginPage'
import PortalProjectPage from './pages/portal/PortalProjectPage'
import AnbieterPage from './pages/AnbieterPage'
import BenutzerPage from './pages/BenutzerPage'
import ProfilPage from './pages/ProfilPage'
import SzenarienPage from './pages/SzenarienPage'
import EinstellungenPage from './pages/EinstellungenPage'
import PlaceholderPage from './components/ui/PlaceholderPage'
import AppHubPage from './pages/apps/AppHubPage'
import FitGapPage from './pages/apps/FitGapPage'
import NotesPage from './pages/apps/NotesPage'
import RequirementTemplatesPage from './pages/apps/RequirementTemplatesPage'
import ScenarioGeneratorPage from './pages/apps/ScenarioGeneratorPage'
import PreQualPage from './pages/apps/PreQualPage'
import TemplateStorePage from './pages/apps/TemplateStorePage'
import RankingPage from './pages/RankingPage'
import VergleichPage from './pages/VergleichPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projekte" element={<ProjektePage />} />
          <Route path="/projekte/:id" element={<ProjektDetailPage />} />
          <Route path="/projekte/:id/anforderungen" element={<AnforderungenPage />} />
          <Route path="/projekte/:id/szenarien" element={<SzenarienPage />} />
          <Route path="/projekte/:id/einstellungen" element={<EinstellungenPage />} />
          <Route path="/projekte/:id/ranking" element={<RankingPage />} />
          <Route path="/projekte/:id/vergleich" element={<VergleichPage />} />
          <Route path="/checkliste" element={<PlaceholderPage title="Checkliste" description="Projektspezifische Checklisten — Import per Excel." badge="Sprint 3" />} />
          <Route path="/aufgaben" element={<PlaceholderPage title="Aufgabenliste" description="Alle Aufgaben des Projekts im Überblick." badge="Sprint 3" />} />
          <Route path="/anforderungen" element={<PlaceholderPage title="Anforderungen" description="Anforderungskatalog erfassen, importieren und verwalten." badge="Sprint 3" />} />
          <Route path="/szenarien" element={<PlaceholderPage title="Szenarien" description="Use-Cases für die Demo-Präsentation definieren." badge="Sprint 3" />} />
          <Route path="/praesentationen" element={<PlaceholderPage title="Präsentationen" description="Präsentationsunterlagen ablegen und verwalten." badge="Sprint 4" />} />
          <Route path="/angebot" element={<PlaceholderPage title="Angebot" description="Angebotsunterlagen der Anbieter." badge="Sprint 4" />} />
          <Route path="/vertrag" element={<PlaceholderPage title="Vertrag" description="Vertragsunterlagen und Abschluss-Dokumentation." badge="Sprint 5" />} />
          <Route path="/apps" element={<AppHubPage />} />
          <Route path="/apps/fit-gap" element={<FitGapPage />} />
          <Route path="/apps/notes" element={<NotesPage />} />
          <Route path="/apps/req-templates" element={<RequirementTemplatesPage />} />
          <Route path="/apps/scenario-gen" element={<ScenarioGeneratorPage />} />
          <Route path="/apps/prequalification" element={<PreQualPage />} />
          <Route path="/apps/template-store" element={<TemplateStorePage />} />
          <Route path="/ranking" element={<PlaceholderPage title="Ranking" description="Anbieter-Ranking nach Anforderungen, Kosten und Bewertung." badge="Sprint 4" />} />
          <Route path="/qa" element={<PlaceholderPage title="Q&A" description="Fragen und Antworten zwischen Anbieter und Kunde." badge="Sprint 3" />} />
          <Route path="/nachrichten" element={<PlaceholderPage title="Nachrichten" description="Projektrelevante Nachrichten und Ankündigungen." badge="Sprint 3" />} />
          <Route path="/termine" element={<PlaceholderPage title="Termine" description="Wichtige Projekttermine und Deadlines." badge="Sprint 3" />} />
          <Route path="/hilfe" element={<PlaceholderPage title="Benutzerhandbuch" description="Dokumentation und Hilfestellungen zur Plattform." badge="Post-MVP" />} />
          <Route path="/system/projekte" element={<ProjektePage />} />
          <Route path="/system/einstellungen" element={<PlaceholderPage title="Einstellungen" description="Plattform-Konfiguration und Mandanten-Einstellungen." badge="Sprint 3" />} />
          <Route path="/system/benutzer" element={<BenutzerPage />} />
          <Route path="/system/anbieter" element={<AnbieterPage />} />
          <Route path="/profil" element={<ProfilPage />} />
        </Route>

        {/* Supplier portal — standalone, no AppShell */}
        <Route path="/portal/login" element={<PortalLoginPage />} />
        <Route path="/portal/activate/:token" element={<PortalActivatePage />} />
        <Route path="/portal/projekte/:psId" element={<PortalProjectPage />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
