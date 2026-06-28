# adtender – ASF (Adtender Selection Framework)

`adtender` ist das Repository für das ASF-Handbuch und die zukünftige digitale Unterstützung des Adtender Selection Framework. Das Projekt verbindet methodische Beratung, Enterprise Architecture, Manufacturing IT und OT Security zu einem strukturierten Vorgehen für professionelle Softwareauswahlprojekte im industriellen Umfeld.

## Vision

Das Adtender Selection Framework (ASF) ist eine herstellerunabhängige Methodik zur Auswahl unternehmenskritischer Softwarelösungen in industriellen Organisationen. Der Schwerpunkt liegt auf Manufacturing IT, MES, MOM, APS, LIMS, Historian, OT Security sowie verwandten industriellen Software- und Plattformlösungen.

ASF unterstützt Unternehmen dabei, Softwareauswahl nicht als isolierte IT-Beschaffung zu behandeln, sondern als strategisches Transformationsvorhaben. Im Mittelpunkt stehen fachliche Zielbilder, Capabilities, Sollprozesse, Integrationsanforderungen, Sicherheitsanforderungen, Bewertungslogik, Anbieterkommunikation und nachvollziehbare Managemententscheidungen.

Das Framework soll Transparenz, Vergleichbarkeit und Entscheidungssicherheit schaffen. Es richtet sich an Unternehmen, Berater, Architekten, Manufacturing-IT-Verantwortliche, OT-Security-Verantwortliche, Einkauf, Fachbereiche und Management.

## Repository Structure

Die Repository-Struktur trennt Handbuchinhalte, Quellmaterialien, technische Dokumentation und zukünftige Plattformbestandteile.

### `book`

Das Verzeichnis `book` enthält das ASF-Handbuch im Markdown-Masterformat. Markdown ist die führende Quelle für die redaktionelle und versionierte Weiterentwicklung des Handbuchs.

### `book-source`

Das Verzeichnis `book-source` enthält importierte oder referenzierte Ausgangsdokumente, insbesondere Word- und PDF-Quellen. Diese Dateien dienen als Quellmaterial für die Überführung in das Markdown-basierte Handbuch.

### `docs`

Das Verzeichnis `docs` ist für projektspezifische technische, organisatorische oder architekturrelevante Dokumentation vorgesehen, die nicht unmittelbar Teil des publizierten ASF-Handbuchs ist.

### `framework` (future)

Das zukünftige Verzeichnis `framework` ist für strukturierte ASF-Artefakte vorgesehen, beispielsweise Methodenbausteine, Datenmodelle, Bewertungslogiken, Templates oder maschinenlesbare Framework-Komponenten.

### `.ai`

Das Verzeichnis `.ai` ist für AI-bezogene Arbeitskontexte, Prompts, Prozessvorgaben oder agentenspezifische Hilfsartefakte vorgesehen. Inhalte in diesem Bereich unterstützen die konsistente Zusammenarbeit zwischen Mensch und AI.

### `api`

Das Verzeichnis `api` ist für zukünftige Backend- oder Schnittstellenkomponenten der adtender-Plattform vorgesehen. Es kann Dienste, Datenmodelle, Integrationen und fachliche APIs aufnehmen.

### `frontend`

Das Verzeichnis `frontend` ist für zukünftige Benutzeroberflächen der adtender-Plattform vorgesehen. Ziel ist eine digitale Unterstützung der ASF-Methodik durch Workflows, Checklisten, Bewertungsmatrizen und dokumentierte Entscheidungsprozesse.

## Handbook Structure

Das ASF-Handbuch ist in vier Hauptteile gegliedert.

### Part A – Grundlagen

Teil A beschreibt die methodischen, fachlichen und organisatorischen Grundlagen des ASF. Dazu gehören Einführung, Beratungsprinzipien, Vorgehensmodell, Rollenmodell, Governance, Deliverables, Dokumentenmodell und Templates.

### Part B – ASF Methodik

Teil B beschreibt die eigentliche ASF-Methodik entlang der Phasen des Auswahlprozesses. Er führt von Projektanstoß und Managementauftrag über Analyse, Zielbild, Anforderungen, Marktansprache, Anbieterbewertung und Entscheidung bis zur Übergabe in die Implementierung.

### Part C – Vorlagen

Teil C enthält operative Vorlagen und Arbeitsmittel für die Anwendung des ASF. Dazu gehören unter anderem Capability Maps, Checklisten, Workshop-Unterlagen, RACI-Matrizen, Bewertungsmatrizen, Demo-Szenarien, Longlist, Shortlist, RFI, RFP und Lastenheft.

### Part D – Anhänge

Teil D enthält ergänzende Materialien wie Glossar, Normen, Literatur und Abkürzungen. Dieser Teil dient der fachlichen Einordnung, Terminologiekonsistenz und langfristigen Erweiterbarkeit des Handbuchs.

## Working Principles

Markdown ist das verbindliche Masterformat für das ASF-Handbuch. Alle redaktionellen Änderungen erfolgen primär in Markdown-Dateien und werden über Git versioniert.

Word- und PDF-Dateien werden aus Markdown generiert oder als Quellmaterial in das Markdown-Format überführt. Dadurch bleibt das Handbuch nachvollziehbar, diff-fähig, reviewbar und langfristig wartbar.

Alle Änderungen werden mit Git versioniert. Dadurch sind Bearbeitungsstand, fachliche Entwicklung, Review-Verlauf und Entscheidungsgrundlagen transparent nachvollziehbar.

## AI Workflow

Das Projekt nutzt eine kollaborative Arbeitsweise zwischen ChatGPT, Codex und GitHub.

ChatGPT unterstützt bei fachlicher Strukturierung, redaktioneller Ausarbeitung, methodischer Reflexion und Qualitätssicherung. Codex arbeitet im Repository, analysiert Dateien, erstellt Diffs, importiert Inhalte, pflegt Markdown-Strukturen und unterstützt technische Umsetzungsschritte. GitHub dient als versioniertes System of Record für Quellcode, Handbuchinhalte, Änderungen und Reviews.

AI Agents arbeiten kontrolliert und nachvollziehbar. Vor wesentlichen Änderungen werden Diffs erzeugt, geprüft und erst nach Freigabe angewendet. Fachliche Unsicherheiten werden nicht erfunden, sondern als offene Punkte markiert oder zur Klärung zurückgegeben.

## Roadmap

Die nächsten Entwicklungsschritte des ASF umfassen:

- vollständige Überführung der bestehenden Word-Quellen in das Markdown-basierte Handbuch,
- redaktionelle Harmonisierung von Sprache, Struktur, Begriffen und Tabellen,
- Aufbau der vollständigen Phasenstruktur für Teil B der ASF-Methodik,
- Entwicklung wiederverwendbarer Vorlagen für Teil C,
- Aufbau eines Glossars und einer konsistenten Terminologie,
- Definition maschinenlesbarer Framework-Artefakte für zukünftige Plattformfunktionen,
- Vorbereitung einer Generierung von Word- und PDF-Ausgaben aus Markdown,
- spätere Umsetzung digitaler Workflows in API und Frontend.

Ziel ist ein professionelles, versioniertes und publizierbares Methodenhandbuch, das zugleich als fachliche Grundlage für die zukünftige adtender-Plattform dient.
