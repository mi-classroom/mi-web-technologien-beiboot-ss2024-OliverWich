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

> **Hinweis:** Mit Bun 1.1.27 (der aktuellen Version at the time of writing) _kann_ es zu einem Installationsfehler kommen.
> In der vorheringen Version 1.1.26 funktioniert die Installation jedoch einwandfrei.
> Wie spezifische Versionen installiert werden können wird [hier](https://bun.sh/docs/installation#installing-older-versions-of-bun) beschrieben.


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
welches folgendes ausführen wird um in den beiden Workspaces `frontend` und `backend` jeweils das `dev` Skript zu starten:
```bash
bun run --filter "*" dev
```

Hierbei wird das Vue Frontend im Watch-Modus gebaut und das Backend mit Hot-Reloading gestartet damit Änderungen direkt sichtbar sind.

Auch hier ist der Server unter http://localhost:3000 erreichbar.

> **Hinweis:** Das Prozessmanagement von Bun auf Windows ist noch nicht besonders optimiert für solche lang lebenden hot-reload Prozesse, wenn die ``--filter`` workspace option genutzt wird.
> Es kann also gerade beim Frontend zu memory leaks und orphaned Prozessen kommen, die auch dann nicht gestoppt werden, wenn der Hauptprozess beendet wurde.
>
> Check your taskmanager if your laptop takes of like a jet engine, you're wellcome :D

#### Module einzeln starten
Die Module können auch einzeln ohne Bun's workspace management gestartet werden.

Das hilft ein wenig gegen die Memory Leaks und Orphaned Prozesse, die durch das hot-reload und watch Modus entstehen.

##### Frontend
Hot reloads und Entwicklung:
```bash
bun frontend:serve
```

##### Backend
Hot reloads und Entwicklung:
```bash
bun backend:serve
```

Nur ausführen:
```bash
bun backend:start
```

> **Wichtig:** Damit das Frontend funktioniert, muss zuerst mit `bun frontend:build` das Frontend gebaut werden!


## Struktur & Funktionsweise
![Shows an overview of the module structure including a glimpse inside the dependency structure of the code.
Includes the folder structure inside the "projects" folder, outlining how each project is stored.](docs/structure.png "Diagram of the structure")

Dieses Bild zeigt die Struktur des Projekts und wie die Module miteinander interagieren.
Grundsätzlich sind hier die wichtigsten _Ordner_ abgebildet.
Der jeweilige Inhalt wird formlos skizziert, um einen Überblick über die Struktur zu geben.

"Still-Moving" besteht aus zwei Hauptteilen bzw. Softwaremodulen:
- **backend**: In diesem Ordner bzw. Paket befindet sich der Server welcher sowohl die Business Logik abbildet als auch das Frontend ausliefert.
- **frontend**: Hier befindet sich der Code für das Vue Frontend. Auch die gebauten Dateien werden in diesem Ordner gespeichert.

Die roten Elemente stellen die wichtigsten npm-Dependencies dar, die in den jeweiligen Modulen genutzt werden.

Zudem liegt im Root des Projekts ein Ordner namens **projects**, in dem die erstellten Projekte gespeichert werden.
Die Projekte werden in Unterordner abgelegt, dessen Struktur wird im Diagramm dargestellt.
Die Unterordner enthalten folgende Dateien:
- *frames*: Enthält die Einzelbilder im png-Format, die aus dem Video extrahiert wurden.
- *out*: Enthält sowohl das `thumbnail.webp` des Projekts (der erste Frame des Videos) und das fertige Bild mit Langzeitbelichtungseffekt, als auch Dateien aus Zwischenschritten, wenn die "Focus Frames" Funktionalität genutzt wird.
- *thumbs*: Enthält Thumbnails der Einzelbilder im webp-Format, die im Frontend als Preview genutzt werden.

### Die Funktionsweise der Langzeitbelichtung
Zum Zerlegen des Videos in Einzelbilder wird das CLI Tool *ffmpeg* genutzt.

Die Einzelbilder werden dann mit *sharp*, einer Image Library, bearbeitet und zu einem Bild mit Langzeitbelichtungseffekt zusammengefügt.
Die von *sharp* bereitgestellten Blend Modes reichen jedoch leider nicht aus, um den gewünschten Effekt zu erzielen (werden aber dennoch als Option zur Verfügung gestellt), daher wurde ein eigener "mean" Blend Mode implementiert.
Dieser berechnet den Mittelwert der Pixelwerte der Einzelbilder und fügt sie so zusammen.
Er respektiert dabei auch die Transparenz der Pixel für einen "weighted mean" sodass die "Focus Frames" mit variierender Stärke über das finale Bild gelegt werden können.

## About
Zum Modul Web Technologien gibt es ein begleitendes Projekt.

Inhaltlich ist geht es dort um eine Client-Server Anwendung, mit deren Hilfe [Bilder mit Langzeitbelichtung](https://de.wikipedia.org/wiki/Langzeitbelichtung) sehr einfach nachgestellt werden können.

Warum ist das cool? Bilder mit Langzeitbelichtung sind gar nicht so einfach zu erstellen, vor allem, wenn man möglichst viel Kontrolle über das Endergebnis haben möchte.
In unserem Ansatz bildet ein Film den Ausgangspunkt.
Diesen zerlegen wir in Einzelbilder und montieren die Einzelbilder mit verschiedenen Blendmodes zu einem Bild mit Langzeitbelichtungseffekt zusammen.
