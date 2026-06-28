# ASF Writing Guide

Dieses Dokument definiert den verbindlichen Schreibstandard für das ASF-Handbuch. Es richtet sich an menschliche Autorinnen und Autoren sowie an AI Agents, die Inhalte für das Adtender Selection Framework erstellen, überarbeiten oder prüfen.

## Ziel

Der ASF Writing Guide stellt sicher, dass alle Kapitel des ASF-Handbuchs fachlich konsistent, sprachlich professionell und strukturell vergleichbar verfasst werden.

Ziel ist ein publikationstaugliches Methodenhandbuch mit klarer Terminologie, nachvollziehbarer Argumentation und einheitlicher Kapitelstruktur. Das Handbuch soll in Beratung, Managementkommunikation, Enterprise Architecture, Manufacturing IT und OT Security gleichermaßen belastbar einsetzbar sein.

## Zielgruppe

Der Writing Guide richtet sich an:

- Autorinnen und Autoren des ASF-Handbuchs,
- AI Agents, die Inhalte erzeugen oder überarbeiten,
- Reviewerinnen und Reviewer,
- Fachverantwortliche für Softwareauswahl, Manufacturing IT und OT Security,
- Projektleiterinnen und Projektleiter,
- Beraterinnen und Berater,
- Enterprise Architects.

Die Zielgruppe erwartet präzise, neutrale und methodisch nachvollziehbare Texte. Inhalte müssen auch für Leser verständlich sein, die nicht an der Entstehung des Frameworks beteiligt waren.

## Schreibstil

Der Schreibstil ist professionell, sachlich, neutral und beratungsorientiert. Er entspricht der Sprache eines hochwertigen Fach- und Methodenhandbuchs.

Verbindliche Regeln:

- professionelle Consulting-Sprache verwenden,
- neutral und herstellerunabhängig formulieren,
- keine Marketing-Sprache verwenden,
- keine Buzzwords ohne fachliche Notwendigkeit verwenden,
- Aussagen begründen oder als Annahme kennzeichnen,
- keine unbelegten Superlative verwenden,
- keine spekulativen ASF-Inhalte erfinden,
- klare Begriffe bevorzugen,
- kurze und mittellange Sätze verwenden,
- Absätze logisch aufbauen.

Zu vermeiden sind insbesondere:

- werbliche Aussagen wie „führend“, „revolutionär“, „einzigartig“ oder „best-in-class“,
- vage Formulierungen wie „modern“, „innovativ“ oder „zukunftssicher“, sofern sie nicht konkret erläutert werden,
- unnötige Anglizismen,
- interne Projektsprache ohne Erklärung,
- persönliche Wertungen.

## Kapitelstruktur

Jedes methodische Kapitel des ASF-Handbuchs folgt einer einheitlichen Struktur. Diese Struktur schafft Vergleichbarkeit zwischen den Phasen und erleichtert Review, Pflege und spätere Plattformabbildung.

Jedes Kapitel soll die folgenden Abschnitte enthalten:

- Ziel
- Nutzen
- Voraussetzungen
- Eingaben
- Vorgehen
- Methoden
- Ergebnisse
- Deliverables
- Best Practices
- Typische Fehler
- KI-Unterstützung
- Zusammenfassung
- Übergang zum nächsten Kapitel

Die Abschnitte sind fachlich auszufüllen. Wenn Informationen fehlen, wird ein klarer TODO-Platzhalter eingefügt.

Beispiel:

```markdown
TODO: Phasenspezifische Deliverables ergänzen, sobald die autorisierte ASF-Methodik final vorliegt.
```

## Überschriften

Die Überschriftenhierarchie muss konsistent und einfach navigierbar sein.

Regeln:

- Jede Markdown-Datei enthält genau eine H1-Überschrift.
- Die H1-Überschrift enthält die Kapitelnummer und den Kapitel- oder Phasentitel.
- Hauptabschnitte verwenden H2.
- Unterabschnitte verwenden H3.
- Tiefere Ebenen als H3 sind nur zu verwenden, wenn sie fachlich notwendig sind.
- Keine Überschrift darf leer bleiben.
- Überschriften müssen präzise, sachlich und nicht werblich sein.

Beispiel:

```markdown
# 4 Strategische Leitplanken und Zielbild

## Ziel

## Nutzen

## Vorgehen

### Strategische Ausgangsfragen
```

## Tabellen

Tabellen werden verwendet, wenn Inhalte strukturiert verglichen, bewertet oder wiederholt dargestellt werden. Tabellen sind kein Ersatz für normalen Fließtext.

Standardlayout:

```markdown
| Kriterium | Beschreibung | Ergebnis |
| --- | --- | --- |
| Beispielkriterium | Kurze, präzise Erläuterung. | Erwartetes Ergebnis. |
```

Regeln:

- Tabellen haben eine klare fachliche Funktion.
- Spaltenüberschriften sind kurz und eindeutig.
- Jede Zeile enthält vergleichbare Informationen.
- Tabellenzellen enthalten möglichst kurze Texte.
- Längere Erläuterungen gehören in Fließtext vor oder nach der Tabelle.
- Tabellen werden im Text eingeführt.
- Tabellen werden bei Bedarf nach der Tabelle kurz interpretiert.

## Abbildungen

Abbildungen, Diagramme und Grafiken dürfen nur eingesetzt werden, wenn sie ein fachliches Verständnis verbessern.

Regeln:

- Jede Abbildung erhält eine eindeutige Beschriftung.
- Jede Abbildung wird im Text referenziert.
- Die Beschriftung steht unmittelbar unter der Abbildung.
- Dateinamen sind sprechend und verwenden kebab-case.
- Abbildungen werden im Verzeichnis `book/assets/images` oder `book/assets/diagrams` abgelegt.
- Keine dekorativen Abbildungen ohne fachlichen Mehrwert verwenden.

Beispiel:

```markdown
![ASF Phasenmodell](../assets/diagrams/asf-phasenmodell.png)

Abbildung 1: ASF Phasenmodell im Überblick.
```

## Nummerierung

Kapitelnummerierung dient der Orientierung und muss konsistent geführt werden.

Regeln:

- Kapitel in Teil A verwenden fortlaufende Kapitelnummern.
- Phasen in Teil B verwenden Phasennummern von 01 bis 18.
- Dateinamen verwenden zweistellige Nummern.
- Überschriften dürfen die fachliche Nummerierung aufnehmen.
- Nummerierung in Dateinamen und Überschriften muss übereinstimmen.

Beispiele:

```text
01-vorwort.md
04-strategische-leitplanken-und-zielbild.md
18-uebergabe-an-implementierung-und-projektabschluss.md
```

## Hinweise

Hinweise werden konsistent als Markdown-Blockquotes formatiert. Der Hinweistyp steht fett am Anfang.

### Best Practice

```markdown
> **Best Practice:** Eine Anbieterbewertung sollte immer auf identischen Demonstrationsszenarien basieren.
```

### Hinweis

```markdown
> **Hinweis:** Dieser Abschnitt beschreibt den methodischen Standardfall. Projektspezifische Anpassungen sind gesondert zu dokumentieren.
```

### Warnung

```markdown
> **Warnung:** Anforderungen dürfen nicht aus Anbieterpräsentationen abgeleitet werden, ohne sie gegen Zielbild und Sollprozesse zu validieren.
```

### Empfehlung

```markdown
> **Empfehlung:** Kritische nichtfunktionale Anforderungen sollten früh mit IT, OT und Informationssicherheit abgestimmt werden.
```

## Quellen

Quellen werden verwendet, wenn Aussagen auf externen Normen, Standards, Studien, Fachliteratur oder Herstellerunterlagen beruhen.

Regeln:

- Quellen müssen nachvollziehbar und prüfbar sein.
- Quellenangaben dürfen nicht erfunden werden.
- Normen und Standards werden mit offizieller Bezeichnung genannt.
- Herstellerinformationen werden als Herstellerinformationen gekennzeichnet.
- Quellen werden einheitlich am Kapitelende oder in einem zentralen Quellenverzeichnis geführt.
- Wenn eine Quelle fehlt, wird ein TODO eingefügt.

Beispiel:

```markdown
TODO: Quelle für die referenzierte Norm ergänzen.
```

## Markdown Rules

Markdown ist klar, wartbar und reviewfähig zu schreiben.

Regeln:

- Genau eine H1 pro Datei.
- Überschriftenhierarchie nicht überspringen.
- Leerzeile vor und nach Überschriften, Tabellen und Codeblöcken verwenden.
- Dateipfade in Backticks setzen.
- Tabellen in GitHub-kompatiblem Markdown schreiben.
- Codeblöcke mit Sprachkennung versehen, sofern sinnvoll.
- Listen nur verwenden, wenn sie die Lesbarkeit verbessern.
- Keine HTML-Sonderkonstruktionen verwenden, sofern Markdown ausreicht.
- Interne Links relativ setzen.
- Deutsche Umlaute und typografische Zeichen in UTF-8 speichern.

## Git Workflow

Markdown ist die führende Quelle für das ASF-Handbuch. Word- und PDF-Versionen werden nachgelagert aus Markdown generiert oder aus Markdown heraus publiziert.

Arbeitsprinzipien:

- Änderungen erfolgen zuerst in Markdown.
- Word- und PDF-Dateien sind Ausgabeformate, nicht die redaktionelle Masterquelle.
- Jede Änderung wird über Git versioniert.
- Größere Änderungen werden vor dem Anwenden als Diff geprüft.
- Reviews konzentrieren sich auf fachliche Korrektheit, Struktur, Sprache, Quellenlage und methodische Konsistenz.
- Automatisierte Generierung von Word und PDF erfolgt erst nach fachlicher Freigabe der Markdown-Inhalte.

Dieses Vorgehen stellt sicher, dass das ASF-Handbuch nachvollziehbar, prüfbar und langfristig wartbar bleibt.
