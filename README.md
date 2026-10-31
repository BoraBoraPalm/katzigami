# 🐱 KATZIGAMI – Das Pilzorakel 🌸

Ein eigenständiges, kostenloses Katzen-Jump-'n'-Run für Handys und Desktop. Vier musikalisch und visuell unterschiedliche Blumenwelten mit zwölf deutlich längeren Levels, sieben Orakelpilze und vier Verwandlungsstufen, neue Katzen-Lauf- und Sprunganimationen, lustige synthetisierte Sounds, ein Spiegelkatzen-Boss und Dialogentscheidungen, die die Handlung, Abkürzungen, Gegner und mehrere Enden verändern.

**Spielen:** https://boraborapalm.github.io/katzigami/

## Bedienung

- **Handy:** Linke Daumentasten `◀` / `▶` zum Laufen, rechte große Taste `HÜPF!` zum Springen. Die neue **Magietaste unmittelbar links daneben** ist erst nach dem Aufsammeln eines speziellen Verwandlungspilzes aktiv. Original-Lauf- und Sprungtasten bleiben unverändert groß und an ihrem bisherigen Platz. Für größere Sprünge gedrückt halten. Querformat empfohlen, Hochformat funktioniert ebenfalls.
- **PC:** `A`/`D` oder Pfeiltasten zum Laufen, `Leertaste`, `W` oder `↑` zum Springen. `X` oder `J` aktiviert die Spezialfähigkeit nach einer Verwandlung, `Esc` pausiert.
- **Pilze:** Berühren, um sie einzusammeln. Die sieben Orakelpilze sind reine Sammelobjekte. Die besonderen leuchtenden Verwandlungspilze (wiederholt über vier Welten verteilt) schalten **Blütenpfote**, **Funkelpfote**, **Mondpfote** bzw. **Sternenpfote** frei. Die zugehörige Spezialtaste zaubert Projektile, die Schattenkatzen und den Boss treffen können. Upgrades bleiben nach Treffern dauerhaft erhalten; Treffer kosten nur Herzen. An Checkpoint-Blumen wird automatisch gespeichert. Auf kleine Schattenkatzen kannst du springen.
- **Story:** Entscheidungen werden in den Spielstand aufgenommen und verändern die folgenden Level, den Bosskampf und das Ende.

## Geschichte

Momo sucht sieben Orakelpilze, um die Farben des Waldes zu retten. Ist Königin Dahlia wirklich schuld? Und warum hat das Spiegelkätzchen so verdächtig ähnliche Schnurrhaare wie Momo? Nebenfiguren wie Miso und Pip sind ebenfalls **Katzen**.

## Speichern und Datenschutz

Spielstände liegen ausschließlich lokal im Browser (`localStorage`, Schlüssel `katzigami-v1`). Sie enthalten Fortschritt, gesammelte Pilze, Checkpoints, Dialogentscheidungen und Audio-Einstellung samt aktiver Katzenverwandlung. Es gibt keine Anmeldung, kein Tracking, keinen Server für Spielstände und keine geräteübergreifende Synchronisierung. Beim Löschen der Browser-Website-Daten geht der Spielstand verloren. GitHub Pages bietet HTTPS; der optionale Service Worker erlaubt nach dem ersten Besuch Offline-Aufrufe des Spiels.

## GitHub Pages veröffentlichen

Im Repository: `Settings → Pages → Build and deployment → Deploy from a branch`, Branch `master`, Folder `/(root)`, `Save`. Der erste Deploy kann einige Zeit dauern. Die Dateien liegen bewusst direkt im Repository-Root – ohne Build-Tool oder Backend.

## Entwicklung und Tests

- Reines HTML, CSS und JavaScript; Canvas 2D und Web Audio API. Vier originale, generativ synthetisierte Soundtracks mit Spezialpilz-Varianten (Audio nach einer Benutzerinteraktion).
- Keine Fremd-Game-Engine und kein Mario-Asset. Illustrationen, Level, Dialoge und Sounds werden im Code erzeugt.
- Statische Syntaxprüfung: `node --check game.js` und `node --check sw.js`.
- Browser-Regressionstest: `python -m pip install playwright`, `python -m playwright install chromium`, `python tests/run_tests.py` sowie `python tests/test_power.py`.
- Der Test nutzt im isolierten Browser ein temporäres `localStorage`-Mock. Die veröffentlichte App verwendet normales Browser-`localStorage`.
- Der Test behandelt beide wichtigen Story-Routen, sieben Pilze, Gegnerverzweigungen, den Bosskampf, verschiedene Enden, Speicherfunktion, Tastatur und die Touch-Button-Abmessungen für mehrere Displaygrößen.

## Lizenz / Nutzung

Das Projekt ist öffentlich zugänglich. Der Quellcode enthält ausschließlich eigens erstellte Spielelemente; eine gesonderte Open-Source-Lizenz wurde nicht erteilt. Vor Weiterverwendung außerhalb der GitHub-Pages-Demo bitte Lizenzbedingungen mit dem Repository-Inhaber klären.

## Kampfsystem (v4)

- Vier **dauerhafte, aufeinander aufbauende** Verwandlungen: I Blütenwurf (1 Schaden), II Kettenblitz (2 Schaden, zwei Gegner), III Mondexplosion (3 Schaden + Flächeneffekt), IV Sternensturm (drei zielsuchende Sterne mit je 3 Schaden). Niedrigere Pilze können ein Herz auffüllen, aber die Stufe nie zurücksetzen.
- Fünf Gegnertypen, darunter Panzerkater (4 HP), springende Luchse (2 HP), magisch schießende Nebelhexenkatzen (3 HP) und Titanmiezen (8 HP). Gegner haben Schadensanzeige und kurze Trefferunverwundbarkeit.
- Spiegel-Momo ist jetzt ein Boss mit 12 HP und Lebensanzeige. Treffer kosten ein Herz, nicht die dauerhaft erworbene Verwandlung.

## Dynamische Kampagnen und freie Dialoge (v5)

- Jeder neue Durchlauf erhält einen eigenen Kampagnen-Seed mit einer von fünf großen Mysterienvarianten, wechselnden Katzen-Persönlichkeiten, Gegnerzusammenstellungen und einem leicht veränderten Lichtstil. Derselbe Spielstand behält seine Variante.
- Bei jeder Katzenbegegnung kann man zwischen vorbereiteten Antworten wählen **oder eigene Sätze eintippen**. Die Offline-Dialoglogik erkennt grob Freundlichkeit, Neugier, Kampfeslust, Humor, Misstrauen und eigene Ideen. Beziehungen und Antworten werden gespeichert. Verbündete bauen zusätzliche Brücken, Rivalen rufen zusätzliche Gegner.
- Gegner haben lokale taktische KI (Regelsteuerung): Beobachten, Verfolgen, Ausweichen und zielende Angriffe. Keine Netzwerkverbindung und keine Sprachmodell-API nötig.
- **Technische Klarstellung:** Die freien Antworten werden bisher mit einem lokalen Schlüsselwort-/Regelsystem interpretiert; sie sind **keine generativen Antworten eines KI-Sprachmodells**. Unbegrenzte frei erfundene Reaktionen würden einen sicheren Backend-Proxy und einen separaten KI-Dienst erfordern, dessen Zugangsdaten niemals in ein öffentliches GitHub-Pages-Repository gehören.
- Die Welt wird absichtlich **nicht vollständig zufällig** erzeugt: die zwölf Level und die wichtigen Pilze bleiben spielbar und erreichbar, wichtige Storyereignisse erhalten Varianten und zusätzliche Konsequenzen.
## Retro-Anime-Kampagne: 12 Level

- Vier Themenwelten mit je drei längeren, unterschiedlich gestalteten Abschnitten; insgesamt zwölf Level.
- Neue Ninjakatzen, Geisterpfoten, Bogenmiezies und schwer gepanzerte Wächter; mehrere Treffer nötig.
- Zusätzliche Gegenstände: **Turbo-Fisch (9 s)** erhöht die Laufgeschwindigkeit, **Sternen-Schutz (6 s)** verleiht Unverwundbarkeit, **Flugfeder (8 s)** ermöglicht Fliegen durch Gedrückthalten der Sprungtaste.
- **Schwindelpilz (7 s)** lässt nur das Spielfeld schwanken, **Schneckenschleim (8 s)** reduziert das Tempo und **Magie-Siegel (7 s)** blockiert temporär die Spezialtaste.
- Alle aktiven Effekte zeigen ihre Restdauer direkt über Momos Kopf; bei einer Pause laufen die Timer nicht weiter.
- Gute Gegenstände sind hell gestaltet, gefährliche Gegenstände dunkel mit Warnmarkierung. Die Tasten für Laufen, Springen und Magie wurden nicht verkleinert oder verschoben.
- Die sieben Orakelpilze bleiben weiterhin die Sammlung für die Handlung; temporäre Buffs und Flüche sind separat.
