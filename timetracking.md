# Timetracking

## Issue 1: Basics

| Stunden | Beschreibung                                                                                              |
|---------|-----------------------------------------------------------------------------------------------------------|
| 4h      | Setup und experimentieren mit Elysia um herauszufinden was der beste Weg ist eine Vue Anwendung zu serven |
| 2h      | Struktur entwerfen, verfeinern und hoffentlich bereit machen für zukünftige Issues                        |
| 2h      | Implementierung von Upload und splitting                                                                  |
| 1h      | Versuch magickwand.js and laufen zu bekommen. Wechsel auf sharp                                           |
| 1h      | Implementierung via sharp composite. Leider keinen mode gefunden der den erwünschten Effekt bringt        |
| 2h      | Implementierung eines manuellen "mean" blend mode weil sharp das nicht nativ kann                         |
| 1h      | Implementierung von start/end Optionen                                                                    |
| 1h      | Cleanup                                                                                                   |
// 14h


## Issue 2: Bilder auswählen

| Stunden | Beschreibung                                                                                                                                                                                 |
|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 0.5h    | Einbauen vom Konzept von "Slices" (Teile aus dem Video, identifiziert mit Sekunden Timestamps start/end die in das finale Bild einfließen). Damit ist die Task _eigentlich_ abgeschlossen :D |
| 1       | Vorbereiten vom Frontend und Start der basic routing / App Struktur                                                                                                                          |
| 0.5h    | Einbinden und experimentieren mit shadcn-vue                                                                                                                                                 |
| 0.5h    | Dashboard                                                                                                                                                                                    |
| 0.75h   | Navigation buttons and Project-view start                                                                                                                                                    |
| 1h      | Project info endpoint and preparation for project view                                                                                                                                       |
| 1h      | Frame carousel with thumbnails                                                                                                                                                               |
| 1,5h    | Optimize thumbnail generation                                                                                                                                                                |
| 2h      | Selection slider                                                                                                                                                                             |
| 1h      | Upload / create new project via the frontend                                                                                                                                                 |
| 1,5h    | Render via frontend (includes respecting fps option in the carousel and slider/ slice selection mechanism)                                                                                   |
| 0,5h    | Scrubber                                                                                                                                                                                     |
| 0,5h    | Cleanup and small UI improvements                                                                                                                                                            |
// 12:15h


## Issue 3: Schlüsselbilder

| Stunden | Beschreibung                                                                                                    |
|---------|-----------------------------------------------------------------------------------------------------------------|
| 0.5h    | Refactor und Optimieren von Frame Namen. Auch optimieren von IO davon                                           |
| 1h      | Kämpfen mit TypeScript Types für automatisch generierte Array Refs die ich letztendlich nicht gebraucht habe... |
| 0.5h    | Umstellung von Frame Operations auf on Hover erscheinende Buttons in den Frames                                 |
| 0.5h    | Fix das ein Slice auch nur einen Frame beinhalten kann                                                          |
| 1h      | Fancy Focus Frame Auswahl im Frontend                                                                           |
| 0.5h    | Refactoring und Bugfixing im Backend                                                                            |
| 1h      | Weighted mean blending                                                                                          |
| 0.5h    | Focus frames im Backend                                                                                         |
| 0.5h    | Focus frames Funktionalität im Frontend                                                                         |
| 0.5h    | Fancy-Focus-Frame-Manager™️                                                                                     |
// 6:30h

## Issue 4: Review Prozess & Cleanup
| Stunden | Beschreibung                             |
|---------|------------------------------------------|
| 1.5h    | Aufräumen, Editor styles, Docker compose |
| 1h      | Review Prozess und CONTRIBUTING.md       |
| 0.25h   | Branch Regeln                            |
// 2:45h

## Issue 5/6: Eigenes Feature / Finetuning & Docs
| Stunden | Beschreibung                                        |
|---------|-----------------------------------------------------|
| 3h      | Performance improvements & optimizations & refactor |
| 1h      | Delete Project                                      |
| 0.25h   | Download result                                     |
| 0.25h   | Fix blend modes for focus frames                    |
| 1.5h    | Docs & Structure Diagram                            |
// 6h
