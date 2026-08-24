# Ajaia Lightweight Document Editor

A full-stack collaborative document editor inspired by Google Docs, built for the Ajaia AI-Native Assessment.

## Features
* **Rich Text Formatting:** Bold, Italic, Underline, H1, H2, Bullet & Numbered lists via Tiptap.
* **File Upload:** Import `.txt` or `.md` files directly into editable documents using client-side parsing.
* **Sharing:** Share documents between Alice (`alice@ajaia.internal`) and Bob (`bob@ajaia.internal`).
* **Persistence:** SQLite database via Prisma ORM for instant saves.

## Local Setup
1. Install dependencies: `npm install`
2. Push database schema: `npx prisma db push`
3. Generate client: `npx prisma generate`
4. Seed test users: `npx tsx prisma/seed.ts`
5. Run server: `npm run dev`