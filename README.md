# 🐱 KATZIGAMI – Das Pilzorakel 🌸

Ein eigenständiges, kostenloses Katzen-Jump-'n'-Run für Handys und Desktop. Vier bunte Blumenwelten, sieben magische Pilze, lustige synthetisierte Sounds, ein Spiegelkatzen-Boss und Dialogentscheidungen, die die Handlung, Abkürzungen, Gegner und mehrere Enden verändern.

**Spielen:** https://boraborapalm.github.io/katzigami/

## Bedienung

- **Handy:** Linke Daumentasten `◀` / `▶` zum Laufen, rechte große Taste `HÜPF!` zum Springen. Für größere Sprünge gedrückt halten. Querformat empfohlen, Hochformat funktioniert ebenfalls.
- **PC:** `A`/`D` oder Pfeiltasten zum Laufen, `Leertaste`, `W` oder `↑` zum Springen. `Esc` pausiert.
- **Pilze:** Berühren, um sie einzusammeln. An Checkpoint-Blumen wird automatisch gespeichert. Auf kleine Schattenkatzen kannst du springen.
- **Story:** Entscheidungen werden in den Spielstand aufgenommen und verändern die folgenden Level, den Bosskampf und das Ende.

## Geschichte

Momo sucht sieben Orakelpilze, um die Farben des Waldes zu retten. Ist Königin Dahlia wirklich schuld? Und warum hat das Spiegelkätzchen so verdächtig ähnliche Schnurrhaare wie Momo? Nebenfiguren wie Miso und Pip sind ebenfalls **Katzen**.

## Speichern und Datenschutz

Spielstände liegen ausschließlich lokal im Browser (`localStorage`, Schlüssel `katzigami-v1`). Sie enthalten Fortschritt, gesammelte Pilze, Checkpoints, Dialogentscheidungen und Audio-Einstellung. Es gibt keine Anmeldung, kein Tracking, keinen Server für Spielstände und keine geräteübergreifende Synchronisierung. Beim Löschen der Browser-Website-Daten geht der Spielstand verloren. GitHub Pages bietet HTTPS; der optionale Service Worker erlaubt nach dem ersten Besuch Offline-Aufrufe des Spiels.

## GitHub Pages veröffentlichen

Im Repository: `Settings → Pages → Build and deployment → Deploy from a branch`, Branch `master`, Folder `/(root)`, `Save`. Der erste Deploy kann einige Zeit dauern. Die Dateien liegen bewusst direkt im Repository-Root – ohne Build-Tool oder Backend.

## Entwicklung und Tests

- Reines HTML, CSS und JavaScript; Canvas 2D und Web Audio API.
- Keine Fremd-Game-Engine und kein Mario-Asset. Illustrationen, Level, Dialoge und Sounds werden im Code erzeugt.
- Statische Syntaxprüfung: `node --check game.js` und `node --check sw.js`.
- Browser-Regressionstest: `python -m pip install playwright`, `python -m playwright install chromium`, `python tests/run_tests.py`.
- Der Test nutzt im isolierten Browser ein temporäres `localStorage`-Mock. Die veröffentlichte App verwendet normales Browser-`localStorage`.
- Der Test behandelt beide wichtigen Story-Routen, sieben Pilze, Gegnerverzweigungen, den Bosskampf, verschiedene Enden, Speicherfunktion, Tastatur und die Touch-Button-Abmessungen für mehrere Displaygrößen.

## Lizenz / Nutzung

Das Projekt ist öffentlich zugänglich. Der Quellcode enthält ausschließlich eigens erstellte Spielelemente; eine gesonderte Open-Source-Lizenz wurde nicht erteilt. Vor Weiterverwendung außerhalb der GitHub-Pages-Demo bitte Lizenzbedingungen mit dem Repository-Inhaber klären.