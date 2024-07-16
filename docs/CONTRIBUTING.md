# Beitragen zu "still-moving"

Hier sind einige Richtlinien, die Sie beim Beitrag zu diesem Projekt beachten sollten.

## Review-Prozess

Um die Qualität des Projekts "still-moving" zu gewährleisten, sollte sich an diesen Review-Prozess gehalten werden:

1. **Keine direkten Änderungen am `main` Branch**: Alle Änderungen müssen über Pull Requests (PRs) eingereicht werden. Direkte Commits auf den `main` Branch von externen Mitarbeitern sind nicht erlaubt.
2. **Pull Requests für neue Features oder Fixes**: Wenn Sie ein neues Feature hinzufügen möchten oder einen Fehler beheben, erstellen Sie bitte einen PR. Der PR sollte eine klare Beschreibung des Features und, falls möglich, Referenzen zu relevanten Issues enthalten.
3. **Review durch Maintainer**: Jeder PR muss von mindestens einem Maintainer überprüft und akzeptiert werden. Reviewer können Kommentare direkt in der PR hinterlassen, insbesondere mit direkten Referenzen auf Codeteile, um Feedback oder Verbesserungsvorschläge zu geben.
4. **Feedback und Verbesserungen**: Basierend auf dem Feedback der Reviewer können weitere Änderungen erforderlich sein. Der Prozess wird wiederholt, bis der PR von den Maintainer(n) akzeptiert wird.

## Feedback zu bestehender Codebasis

Feedback zur bestehenden Codebasis sollte über GitHub Issues eingereicht werden. Bitte verwenden Sie das folgende Format für Ihre Issues:

- **Titel**: `[Dateiname]: Kurze Beschreibung des Problems`
- **Beschreibung**: Fügen Sie Code-Snippets mit Anmerkungen hinzu. Erläutern Sie, gegen welche Best Practices verstoßen wird und wie die Probleme gelöst werden könnten. Vorschläge für eine bessere Lösung sind willkommen.

> Tipp: Wenn eine Datei direkt in GitHub betrachtet wird, können direkt mehrere Zeilen einer Datei ausgewählt und in einem Kommentar einer neuen Issue referenziert werden.

## Code-Richtlinien

Um die Lesbarkeit und Wartbarkeit des Codes zu gewährleisten, bitten wir alle Beitragenden, sich an die folgenden Richtlinien zu halten:

- **Moderner Code**: Verwenden Sie z.B. moderne TypeScript-Features und -Praktiken, um den Code klar und sicher zu gestalten.
- **Konsistente Formatierung**: Verwenden Sie eine konsistente Formatierung für den Code. Halten sie sich an die Richtlinien aus der `.editorconfig`-Datei.
- **Saubere Code-Prinzipien**: Folgen Sie den etablierten Regeln für sauberen Code:
  - Verwenden Sie sinnvolle Namen für Variablen, Funktionen und Klassen.
  - Vermeiden Sie zu große Funktionen; teilen Sie den Code in kleinere, wiederverwendbare Einheiten auf.

## Commit Richtlinien
Es sollte die folgenden Regeln für Commit-Nachrichten eingehalten werden welche größtenteils den [Conventional Commits](https://www.conventionalcommits.org entsprechen:
- Gerne viele, kleine Commits um die Nachvollziehbarkeit einzelner Changes zu erhöhen
- Format: `<[scope]> <type>: <subject>`
  - `<[scope]>`: optional, beschreibt den Bereich des Commits. Entweder "[frontend]" oder "[backend]".
  - `type`: fix, feat, refactor, style, docs, chore, perf usw. Wie in [Conventional Commits](https://www.conventionalcommits.org) beschrieben.
  - `subject`: Kurze Beschreibung des Changes
- Beispiele:
  - `[frontend] feat: Image upload feature`
  - `[frontend] fix: FPS option now gets properly passed to backend`
  - `[backend] fix: include start frame in video processing`
  - `[backend] perf: repetitive file I/O is now cached`
