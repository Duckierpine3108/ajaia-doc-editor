# Architectural Overview & System Tradeoffs

## Architecture Choice
Built using Next.js 14 App Router (React), Tiptap rich-text headless engine, Prisma ORM, and SQLite.

## Prioritization & Scope Decisions
1. **Rich-Text Usability over Real-Time CRDTs:** I implemented atomic REST persistence rather than complex WebSockets/Yjs. This guarantees a stable, bug-free core deliverable within the 4-hour timebox while still providing a great editing experience.
2. **Identity Context Switcher:** Instead of full OAuth auth, I used a top-header identity picker (`Alice` vs `Bob`). This makes document sharing testable instantly for reviewers without login friction.
3. **Client-Side File Parsing:** Utilized the Browser File API and `marked` to instantly parse `.md` and `.txt` files directly into HTML nodes without hitting a server, saving bandwidth and memory.