# Web Technologien // begleitendes Projekt Sommersemester 2024
Zum Modul Web Technologien gibt es ein begleitendes Projekt. Im Rahmen dieses Projekts werden wir von Veranstaltung zu Veranstaltung ein Projekt sukzessive weiter entwickeln und uns im Rahmen der Veranstaltung den Fortschritt anschauen, Code Reviews machen und Entwicklungsschritte vorstellen und diskutieren.

Als organisatorischen Rahmen für das Projekt nutzen wir GitHub Classroom. Inhaltlich befassen wir uns mit einer Client-Server Anwendung mit deren Hilfe [Bilder mit Langzeitbelichtung](https://de.wikipedia.org/wiki/Langzeitbelichtung) sehr einfach nachgestellt werden können.

Warum ist das cool? Bilder mit Langzeitbelichtung sind gar nicht so einfach zu erstellen, vor allem, wenn man möglichst viel Kontrolle über das Endergebnis haben möchte. In unserem Ansatz, bildet ein Film den Ausgangspunkt. Diesen zerlegen wir in Einzelbilder und montieren die Einzelbilder mit verschiedenen Blendmodes zu einem Bild mit Langzeitbelichtungseffekt zusammen.

Dokumentieren Sie in diesem Beibootprojekt Ihre Entscheidungen gewissenhaft unter Zuhilfenahme von [Architectual Decision Records](https://adr.github.io) (ADR).

Hier ein paar ADR Beispiele aus dem letzten Semestern:
- https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2022-Moosgloeckchen/tree/main/docs/decisions
- https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2022-mweiershaeuser/tree/main/adr
- https://github.com/mi-classroom/mi-web-technologien-beiboot-ss2022-twobiers/tree/main/adr

Halten Sie die Anwendung, gerade in der Anfangsphase möglichst einfach, schlank und leichtgewichtig (KISS).

## Technologies
[Bun](https://bun.sh/) as a runtime with [Elysia](https://elysiajs.com/) for the backend webserver and [Vue.js](https://vuejs.org/) for the frontend.

See [/adr](adr) for more details.

## Usage
To run the project you need to have [Bun](https://bun.sh/) installed.

There is a (slow) version available if you do not want to run it locally! See the website field and use:
> webtech
>
> 2024

to get in.

### Installation
```bash
bun install
```

### Running the project 
```bash
bun start
```
This will build the frontend and startup the server which will be available on http://localhost:3000.

### Development
To start the development server run:
```bash
bun serve
```
or
```bash
bun run --filter "*" dev
```

This will build the vue frontend in watch mode and have it be available on the root path (http://localhost:3000/).
Routes handled by Elysia will be handled correctly, everything non-existent will route to the frontend for that router to handle.

Open http://localhost:3000/ with your browser to see the result.

