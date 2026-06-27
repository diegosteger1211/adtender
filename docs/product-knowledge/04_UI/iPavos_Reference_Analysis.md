---
id: PKB-04-017
title: iPavos Reference Analysis — adtender Screen-by-Screen Analysis
version: 1.0
status: APPROVED
owner: Product Architecture
tags:
  - ui
  - reference
  - analysis
  - ipavos
---

# iPavos Reference Analysis

> adtender is a standalone product. iPavos (ipavos.de) is used here solely as a UX/workflow reference. No code, branding, or data is shared. All design decisions below are adtender-native.

---

## 1. Reference Platform Summary

**iPavos** is a software selection platform (Softwareauswahlplattform). Buyers (Berater) evaluate and compare software products across structured phases. Suppliers (Anbieter/Softwarehersteller) respond to requirements via an invitation-based portal.

**adtender** is a procurement tender platform (Ausschreibungsplattform). Buyers issue tenders with structured requirements. Suppliers respond with offers, pricing, and requirement answers via an invitation-based portal.

**Core process analogy:**

| iPavos Phase | adtender Phase |
|---|---|
| Anforderungen | Tender Creation + Requirements |
| Szenarien | Clarification Phase |
| Präsentationen | Evaluation Phase |
| Vertrag | Decision + Award |

---

## 2. Observed Screens and adtender Decisions

### 2.1 Project Overview (Dashboard)

**Observed:** Card-based list of "Laufende Auswahlprojekte". Each card shows: project image/logo, project title, current phase, date, client name.

**adtender decision:**
- Dashboard shows tender cards with: tender title, category tag, current stage, deadline, status indicator
- Cards are stage-aware: color and action button change per stage
- "Nächste Aufgabe" banner (action-first) is adopted — always show the most urgent next action at the top

---

### 2.2 Project Dashboard (Inside a Tender)

**Observed:**
- Top: 4-step progress bar (Anforderungen → Szenarien → Präsentationen → Vertrag)
- Left sidebar: per-project navigation
- Center: "Nächste Aufgabe" call-to-action banner with description and "Fortfahren" button
- Aufgabenliste: ordered task list with phase labels
- Zeitplan: calendar view with phase color coding
- Bottom widgets: stats per phase (316 Anforderungen, 0 Szenarien, 0 Präsentationen)

**adtender decision:**
- Adopt the 4-stage progress bar at the top — stages: Erstellung → Ausschreibung → Bewertung → Entscheidung
- Adopt "Nächste Aufgabe" prominently — always surfaced, not buried
- Adopt Aufgabenliste with phase labels
- Adopt calendar/Zeitplan widget
- Adopt stats widgets per phase (counts, completion %)

---

### 2.3 Ranking View

**Observed:**
- Ranked list of suppliers (1–N) with logo, name, company
- Two score columns: Vorauswahl (donut) and Anforderungen (donut)
- "Systeme vergleichen" button → opens comparison view
- Click on supplier row → opens side panel

**adtender decision:**
- Evaluation workspace shows ranked supplier list with scores
- Scores: Anforderungen (requirements compliance %) and Gesamtbewertung (weighted total)
- "Vergleichen" button opens multi-supplier comparison view
- Click on supplier row → slide-in detail panel (see §2.4)

---

### 2.4 Supplier Detail Panel (3 Tabs)

**Observed — Status tab:**
- Score donuts: Vorauswahl (92), Anforderungen (4), Präsentationen (?), Experteneinschätzung (?)
- Red warning: "87 K.O.-Anforderung nicht erfüllt — Diese müssen geprüft und mit dem Anbieter geklärt werden"
- Green badge: "Eingeschlossen — Dieses System ist Teil Ihrer Shortlist"

**Observed — Informationen tab:**
- Produktbeschreibung (free text)
- Märkte tags, Sub-Industrien tags, Zielgruppen nach Unternehmensgröße tags

**Observed — Notizen tab:**
- "Softwareprodukt-Ebene" notes (global, not project-specific)
- "Projektebene" notes (project-specific internal notes)

**adtender decision:**
- Supplier detail panel has 3 tabs: Bewertung / Profil / Notizen
- **Bewertung tab:** Score breakdown per category, K.O.-Kriterien status (red warning if any failed), shortlist status badge
- **Profil tab:** Supplier company description, markets, certifications, contact
- **Notizen tab:** Internal notes per tender (not visible to supplier)
- K.O.-Kriterien are tracked separately — a supplier with ANY unresolved K.O. failure gets a permanent red warning

---

### 2.5 Anforderungen Workspace

**Observed:**
- Left sidebar: hierarchical category tree (collapsible, multi-level)
- Top: search bar, filter dropdowns (Filter, Priorität, K.O.-Criteria, Status)
- Each requirement card shows:
  - Breadcrumb path (category > subcategory > ID)
  - Requirement text (das System muss...)
  - Tags (related standards/systems)
  - Priority badges: **A / B / C** (colored circles)
  - **K.O.** toggle/badge
  - Status indicator (✓ green = validated, ⚠ yellow = warning, pending)
- Top-right: "Anforderung hinzufügen" primary button
- Dropdown menu: Vorlagen importieren / CSV importieren / Alle Anforderungen löschen

**adtender decision:**
- Requirement workspace: identical two-panel layout (category tree left, list right)
- Priority: **Muss / Soll / Kann** (instead of A/B/C — clearer for procurement context)
- K.O.-Kriterium toggle per requirement — K.O. requirements marked visually distinct
- Status per requirement: Offen / Validiert / Abgelehnt
- Import: Vorlagen importieren (from Library) + CSV importieren + AI-Generierung
- Search and filter bar is mandatory (large catalogs expected)

---

### 2.6 Supplier Invitation Workflow

**Observed (critical screen):**
- "Ihre Shortlist" — list of all shortlisted suppliers
- Per supplier: email field (contact address for invitation)
- Status columns: **Eingereicht / Geöffnet / Abgeschlossen** (3 states, green check or orange X)
- Buttons per supplier: "Zugang gewähren" (no email yet) / "E-Mail senden" (email entered) / "Code kopieren"
- Global: "An alle senden" button — sends invitations to all shortlisted suppliers at once

**adtender decision:**
- This is the **Lieferanten-Einladungsworkflow** — central feature of adtender
- Berater enters supplier contact email per supplier
- System generates a unique invitation link per supplier
- "Einladen" sends email with link → supplier accesses the Supplier Portal
- Status tracked automatically: Eingeladen / Portal geöffnet / Antwort eingereicht / Abgeschlossen
- "An alle senden" = equal treatment — all invited simultaneously
- "Code kopieren" = copy invitation link manually (fallback)
- Status is visible to Berater in real-time

---

### 2.7 Comparison View (Vergleich)

**Observed:**
- Multi-column table: suppliers as columns, criteria categories as rows
- Tabs: Übersicht / Anforderungen / Präsentationen / Experteneinschätzung / Kosten
- **Kosten sub-rows:** Betriebskosten (2 Jahre, 1 Lizenz), Implementierungskosten, Anpassungskosten
- Score donuts per supplier per category

**adtender decision:**
- Comparison view is a core feature — "Systeme vergleichen" / "Anbieter vergleichen"
- Tabs: Übersicht / Anforderungen / Bewertung / Kosten
- **Kosten section** is where suppliers enter their financial data (Betriebskosten, Implementierungskosten, Anpassungskosten, Sonstige)
- Suppliers fill in costs in their Supplier Portal — this is the "finanzwirtschaftliche Kennzahlen" the Anbieter role fills out
- Berater sees comparison side-by-side; individual scores are blinded until all evaluations locked

---

### 2.8 Auswahleinstellungen (Project Configuration)

**Observed:**
- Project details: title, logo upload, description, start date, creation type
- **Auswahlphasen:** 4 phases each with start date + end date fields
- Calendar visualization of phases with color coding
- **Auswahl-Ranking:** supplier list with granular access control per supplier
  - Checkboxes: Anforderungen / Szenarien / Lizenzen / Verträge
  - Toggle: Aktiv / Inaktiv per supplier

**adtender decision:**
- Tender settings screen: title, description, category, logo/image, phase dates
- Phase date configuration: Erstellung / Ausschreibung / Bewertung / Entscheidung — each with start + end
- Calendar visualization adopted
- Per-supplier access control: which phases/sections the supplier can see
- Supplier active/inactive toggle — deactivate without removing from project

---

### 2.9 Admin Project List

**Observed:**
- Table view: Erstelldatum, Titel (with category), Tags (ADESSO), Status dot, "Ansehen" button
- Search bar + filter icon

**adtender decision:**
- Admin sees all tenders across the tenant (or all tenants for super-admin)
- Table columns: Erstelldatum, Titel, Kategorie, Tags, Status, Aktionen
- Status as colored dot + text label
- Search + filter mandatory

---

### 2.10 Profil & Organisation Settings

**Observed:**
- Two-column layout: "Ihr Konto" (Vorname, Nachname, Passwort) + "Ihre Organisation" (Firmenname, Adresse, Kontakt)

**adtender decision:**
- Profile page: identical two-column layout
- Left: user account (name, email, password change, MFA)
- Right: organisation (Firmenname, Adresse, Logo, Kontakt)
- Organisation settings visible to Admin role only (Berater sees read-only)

---

### 2.11 Posteingang (Inbox / Aktivitäten)

**Observed:**
- Aktivitäten tab with message thread per supplier contact

**adtender decision:**
- Posteingang = Clarification Workspace inbox
- Shows all Q&A threads per tender
- Each thread tied to a specific supplier (but answers published to all — equal treatment)
- Berater sees all threads; Supplier sees only their own question + the published answer

---

## 3. Key UX Patterns Adopted for adtender

| Pattern | Source | adtender implementation |
|---|---|---|
| Stage progress bar (top) | iPavos | 4 stages: Erstellung → Ausschreibung → Bewertung → Entscheidung |
| Left sidebar navigation | iPavos | Module-level; collapses to icons |
| "Nächste Aufgabe" banner | iPavos | Action-first; always visible on tender dashboard |
| Card-based project overview | iPavos | Tender cards with stage and deadline |
| Supplier ranking list | iPavos | Evaluation workspace ranked view |
| Slide-in supplier detail panel | iPavos | 3 tabs: Bewertung / Profil / Notizen |
| K.O.-Kriterien tracking | iPavos | Red warning badge; blocks shortlist unless resolved |
| Requirement category tree | iPavos | Left-panel hierarchy; collapsible |
| A/B/C priority → Muss/Soll/Kann | adtender | Clearer procurement language |
| Supplier invitation with status | iPavos | Eingeladen → Geöffnet → Eingereicht → Abgeschlossen |
| "An alle senden" | iPavos | Equal treatment enforcement |
| Comparison table | iPavos | Kosten + Anforderungen side-by-side |
| Supplier fills in costs | iPavos | Betriebskosten / Implementierung / Anpassung in Supplier Portal |
| Notes per supplier (internal) | iPavos | Notizen tab — not visible to supplier |

---

## 4. Key Differences: adtender vs. iPavos

| Aspect | iPavos | adtender |
|---|---|---|
| Primary user | Software buyer evaluating products | Procurement manager issuing tenders |
| Supplier role | Software vendor listed in marketplace | Supplier invited per tender |
| Requirement authorship | Berater fills requirements | Berater fills; Library reuse + AI assist |
| Supplier response | Supplier answers via portal | Supplier answers + uploads docs + enters costs |
| Evaluation | Berater scores each product | Evaluator team scores independently (blind) |
| Knowledge reuse | Templates per project | Cross-project Library with Lessons Learned |
| Multi-tenancy | Single account per buyer org | Full multi-tenancy (multiple orgs on one platform) |
| AI integration | Not observed | Requirement generation, scoring hints, summarization |

---

## 5. Roles and Core Functions (Confirmed by Video Analysis)

### Admin
- Benutzer anlegen und verwalten
- Anbieter/Lieferanten anlegen und verwalten
- E-Mail-Templates konfigurieren
- Mandanten-Einstellungen (Firmenname, Logo, Adresse)
- Alle Ausschreibungen einsehen
- Phasenkonfiguration (Startdaten, Enddaten)

### Berater (Projektmanager)
- Neue Ausschreibung anlegen
- Anforderungen anlegen (manuell, aus Library, CSV-Import, AI)
- Priorität und K.O.-Status setzen
- Anbieter zur Shortlist hinzufügen und einladen
- E-Mails versenden (einzeln + an alle)
- Einladungsstatus verfolgen (Eingereicht / Geöffnet / Abgeschlossen)
- Bewertungsergebnisse einsehen (nach Freigabe)
- Anbieter vergleichen (Vergleichsansicht)
- Interne Notizen pro Anbieter führen
- Entscheidung dokumentieren

### Anbieter (Supplier Portal)
- Anforderungen einsehen und beantworten (Ja/Nein/Teilweise + Kommentar)
- **Finanzwirtschaftliche Kennzahlen ausfüllen:** Betriebskosten, Implementierungskosten, Anpassungskosten
- Dokumente hochladen (Angebote, Zertifikate, Referenzen)
- Unternehmensprofil pflegen (Beschreibung, Märkte, Kontakt)
- Klärungsfragen stellen (Posteingang)
- Antwort-Status einsehen (Eingereicht / Abgeschlossen)

---

## References

- [`Target_Product_Concept.md`](../09_Product_Concept/Target_Product_Concept.md) — PKB-09-001
- [`MVP_Functional_Scope.md`](../03_Functional/MVP_Functional_Scope.md) — PKB-03-001
- [`Supplier_Workspace.md`](./Supplier_Workspace.md) — PKB-04-006
- [`Evaluation_Workspace.md`](./Evaluation_Workspace.md) — PKB-04-007
- [`Clarification_Workspace.md`](./Clarification_Workspace.md) — PKB-04-015
