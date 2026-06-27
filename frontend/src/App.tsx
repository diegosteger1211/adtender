import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import AppShell from './components/layout/AppShell'
import DashboardPage from './pages/DashboardPage'
import PlaceholderPage from './components/ui/PlaceholderPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projekte" element={<PlaceholderPage title="Projekte" description="Übersicht und Verwaltung aller Projekte." badge="Sprint 2" />} />
          <Route path="/checkliste" element={<PlaceholderPage title="Checkliste" description="Projektspezifische Checklisten — Import per Excel." badge="Sprint 2" />} />
          <Route path="/aufgaben" element={<PlaceholderPage title="Aufgabenliste" description="Alle Aufgaben des Projekts im Überblick." badge="Sprint 2" />} />
          <Route path="/anforderungen" element={<PlaceholderPage title="Anforderungen" description="Anforderungskatalog erfassen, importieren und verwalten." badge="Sprint 3" />} />
          <Route path="/szenarien" element={<PlaceholderPage title="Szenarien" description="Use-Cases für die Demo-Präsentation definieren." badge="Sprint 3" />} />
          <Route path="/praesentationen" element={<PlaceholderPage title="Präsentationen" description="Präsentationsunterlagen ablegen und verwalten." badge="Sprint 4" />} />
          <Route path="/angebot" element={<PlaceholderPage title="Angebot" description="Angebotsunterlagen der Anbieter." badge="Sprint 4" />} />
          <Route path="/vertrag" element={<PlaceholderPage title="Vertrag" description="Vertragsunterlagen und Abschluss-Dokumentation." badge="Sprint 5" />} />
          <Route path="/apps" element={<PlaceholderPage title="Apps" description="Integrierte Anwendungen und Erweiterungen." badge="Post-MVP" />} />
          <Route path="/ranking" element={<PlaceholderPage title="Ranking" description="Anbieter-Ranking nach Anforderungen, Kosten und Bewertung." badge="Sprint 4" />} />
          <Route path="/qa" element={<PlaceholderPage title="Q&A" description="Fragen und Antworten zwischen Anbieter und Kunde." badge="Sprint 3" />} />
          <Route path="/nachrichten" element={<PlaceholderPage title="Nachrichten" description="Projektrelevante Nachrichten und Ankündigungen." badge="Sprint 3" />} />
          <Route path="/termine" element={<PlaceholderPage title="Termine" description="Wichtige Projekttermine und Deadlines." badge="Sprint 2" />} />
          <Route path="/hilfe" element={<PlaceholderPage title="Benutzerhandbuch" description="Dokumentation und Hilfestellungen zur Plattform." badge="Post-MVP" />} />
          <Route path="/system/projekte" element={<PlaceholderPage title="Projekte verwalten" description="Alle Projekte anlegen, bearbeiten und löschen." badge="Sprint 2" />} />
          <Route path="/system/einstellungen" element={<PlaceholderPage title="Einstellungen" description="Plattform-Konfiguration und Mandanten-Einstellungen." badge="Sprint 2" />} />
          <Route path="/system/benutzer" element={<PlaceholderPage title="Benutzer anlegen" description="Benutzer nach Rollen (Berater, Kunde, Anbieter) verwalten." badge="Sprint 2" />} />
          <Route path="/system/anbieter" element={<PlaceholderPage title="Anbieter anlegen" description="Anbieter-Datenbank pflegen — projektübergreifend verfügbar." badge="Sprint 2" />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
