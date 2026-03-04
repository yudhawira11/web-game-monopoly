# Monopoly Royale — Fullstack Web Game

Monopoly multiplayer berbasis web sesuai skenario. Frontend memakai React + Tailwind, backend Node.js + Socket.io, database Supabase (PostgreSQL), deployment frontend ke Vercel dan backend ke Railway.

## Fitur Utama (MVP)
- Lobby, create/join room, waiting room
- Game real-time: turn management, dice rules, movement
- Property purchase + rent (property/railroad/utility)
- Chance & Community Chest (deck sederhana)
- Jail system + aturan double
- Chat in-room
- House/hotel building
- Trading antar pemain

Catatan: house/hotel menggunakan aturan sederhana (own set warna, build sampai hotel).

## Struktur Project
- `apps/server` — Node.js + Socket.io (authoritative game server)
- `apps/web` — React + Tailwind (UI)
- `supabase/schema.sql` — skema database

## Setup Lokal
### 1) Supabase
1. Buat project Supabase.
2. Jalankan SQL di `supabase/schema.sql` untuk membuat tabel `rooms`.
3. Catat `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`.
4. Aktifkan Email/Password auth di Supabase Authentication.

### 2) Backend (Railway lokal)
```bash
cd apps/server
cp .env.example .env
npm install
npm run dev
```
Isi `.env`:
```
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3) Frontend
```bash
cd apps/web
cp .env.example .env
npm install
npm run dev
```
Isi `.env`:
```
VITE_API_BASE_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Deploy
### Railway (backend)
- Deploy folder `apps/server`.
- Set env vars `PORT`, `CLIENT_ORIGIN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Start command: `npm run start`.

### Vercel (frontend)
- Deploy folder `apps/web`.
- Set env vars `VITE_API_BASE_URL`, `VITE_SOCKET_URL` ke URL Railway.
- Set env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Catatan Teknis
- Game state disimpan di memori dan dipersist ke Supabase.
- Server adalah otoritatif untuk aturan game.
- Board & kartu menggunakan data standar ringkas agar mudah disesuaikan.