# Still-Moving - Web Technologien 2024 Beiboot Projekt
Im Projekt Still-Moving geht es darum, aus einem Video ein Bild mit Langzeitbelichtungseffekt zu erstellen.

Dazu wird das Video mit in Einzelbilder zerlegt und diese Einzelbilder zu einem Bild mit Langzeitbelichtungseffekt zusammengefügt.

Dafür stehen mehrere Optionen zur Verfügung:
- Der **Blend Mode**: Bestimmt _wie_ die Einzelbilder zusammengefügt werden.
- Die **FPS**: Bestimmt _wie viele_ Einzelbilder pro Sekunde aus dem Video für den Prozess genutzt werden.
- Auswahl / Schnitt des Videos: Bestimmt _welche_ Teile eines Videos in das finale Bild einfließen.
- Die **Focus Frames** bieten die Möglichkeit, bestimmte Einzelbilder hervorzuheben welche dann über das Endbild gelegt werden.
- Mit der **Focus Opacity** kann eingestellt werden, wie stark die Focus Frames über das Endbild gelegt werden. Die Opacity ist ein Wert zwischen 0 und 1 wo 0 bedeutet, dass die Focus Frames nicht sichtbar sind und 1 bedeutet, nur die Focus Frames sichtbar sind da sie ohne Transparenz über das finale Bild gelegt wurden.

## Technologien
[Bun](https://bun.sh/) als Runtime mit [Elysia](https://elysiajs.com/) als Framework für das Backend sowie [Vue.js](https://vuejs.org/) für das Frontend.

In [/adr](docs/adr) sind grundlegende [Architektur-Entscheidungen](https://adr.github.io) dokumentiert.

Hier ist auch eine [CONTRIBUTING](docs/CONTRIBUTING) Datei zu finden, in der Richtlinien für die Mitarbeit am Projekt festgehalten sind.

## Usage
Die Website dieses Repos bietet eine (langsame) Version des Projekts an. Die Zugangsdaten sind:
> webtech
>
> 2024

Ich empfehle jedoch die lokale Ausführung, da der Server sehr schnell in die Knie geht und nicht für eine Compute intensive Anwendung wie diese ausgelegt ist.

### Docker
Das Projekt kann ganz einfach mit Docker compose gestartet werden.

Mit `docker compose up` wird das Projekt gebaut und gestartet. Der Server ist dann unter http://localhost:3000 erreichbar.

Die erstellten Projekte werden in einem Volume gespeichert, sodass sie auch nach einem Neustart des Containers noch verfügbar sind.

### Nativ
Um das Projekt nativ auszuführen, muss [Bun](https://bun.sh/) installiert sein.

#### Installation
```bash
bun install
```

#### Ausführung
```bash
bun start
```
Baut das Frontend und startet den Server welcher dann unter http://localhost:3000 verfügbar ist.

### Entwicklung
Für Hot-Reloads und Entwicklung kann das Projekt mit folgenden Befehlen gestartet werden:
```bash
bun serve
```
oder
```bash
bun run --filter "*" dev
```

Hierbei wird das Vue Frontend im Watch-Modus gebaut und das Backend mit Hot-Reloading gestartet damit Änderungen direkt sichtbar sind.

Auch hier ist der Server unter http://localhost:3000 erreichbar.

## Architektur
> TODO

- Frontend Vue, statisch gebaut und über den Root path des Servers ausgeliefert.
- Backend Elysia, welches die API bereitstellt und die Business Logik abbildet. Die API ist unter `/api` erreichbar.
  - *ffmpeg* als CLI Tool für das Zerlegen des Videos in Einzelbilder.
  - *sharp* für das Bilder handling
    - Der beste blend mode "mean" ist allerdings eine eigene implementierung eines weighted (an hand der opacity) pixel Wert mean

## About
Zum Modul Web Technologien gibt es ein begleitendes Projekt. Im Rahmen dieses Projekts werden wir von Veranstaltung zu Veranstaltung ein Projekt sukzessive weiter entwickeln und uns im Rahmen der Veranstaltung den Fortschritt anschauen, Code Reviews machen und Entwicklungsschritte vorstellen und diskutieren.

Als organisatorischen Rahmen für das Projekt nutzen wir GitHub Classroom. Inhaltlich befassen wir uns mit einer Client-Server Anwendung mit deren Hilfe [Bilder mit Langzeitbelichtung](https://de.wikipedia.org/wiki/Langzeitbelichtung) sehr einfach nachgestellt werden können.

Warum ist das cool? Bilder mit Langzeitbelichtung sind gar nicht so einfach zu erstellen, vor allem, wenn man möglichst viel Kontrolle über das Endergebnis haben möchte. In unserem Ansatz, bildet ein Film den Ausgangspunkt. Diesen zerlegen wir in Einzelbilder und montieren die Einzelbilder mit verschiedenen Blendmodes zu einem Bild mit Langzeitbelichtungseffekt zusammen.

Dokumentieren Sie in diesem Beibootprojekt Ihre Entscheidungen gewissenhaft unter Zuhilfenahme von [Architectual Decision Records](https://adr.github.io) (ADR).

Hier ein paar ADR Beispiele aus dem letzten Semestern:
- https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2022-Moosgloeckchen/tree/main/docs/decisions
- https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2022-mweiershaeuser/tree/main/adr
- https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2022-twobiers/tree/main/adr

Halten Sie die Anwendung, gerade in der Anfangsphase möglichst einfach, schlank und leichtgewichtig (KISS).
