# Gym Tracker Pro

Trainings-Tracker für Leute, die in **mehreren Studios** trainieren (z. B. mit Urban Sports Club).
Jedes Gerät gehört zu einem Gym, Geräte sind Herstellermodellen zugeordnet – so werden Werte am
gleichen Modell in verschiedenen Gyms vergleichbar.

- **Historie in drei Ebenen:** dieses Gerät → gleiches Modell in anderen Gyms → Übung allgemein (nur Orientierung).
  Freihantel automatisch über alle Gyms.
- **Geteilte Gyms & Geräte:** Was ein Nutzer anlegt, können andere übernehmen. Trainings bleiben privat.
- **Gerätekatalog:** 280 geprüfte Modelle mit Modellnummer und Quelle von Hoist, Matrix, Hammer Strength und Life Fitness (`src/catalog/verifiedModels.ts`); übrige Hersteller noch generiert. Von Nutzern ergänzbar.
- **Doppelte Progression** mit Ziel fürs nächste Training, Zusammenfassung, Fortschritts-Charts je Gerät.
- **Offline zuerst:** Alles wird lokal gespeichert (IndexedDB) und bei Netz mit Supabase synchronisiert.
- **Satz-Tabelle:** jeder Satz mit Ziel vorbefüllt, ein Tipp zum Bestätigen, Bestwerte sofort sichtbar.
- **Gym-Katalog Köln:** 69 Gyms aus der öffentlichen Urban-Sports-Club-Partnerliste mit Stadtteil und USC-Paketen (Essential/Classic/Premium/Max), filterbar nach eigenem Paket (`src/catalog/uscKoeln.ts`, Stand 26.11.2026).
- **Plan-Vorlagen** (Upper/Lower, Push/Pull/Legs, Ganzkörper, Bro-Split) mit Bewegungsplätzen statt fester Geräte – im Gym wird die passende Übung gewählt; nächster Trainingstag vorausgewählt. Wochenvolumen pro Muskel, Deload-Wochen und Teilen per Link.
- **Cardio** als eigener Eintrag (Art, Dauer, optional km) – für sich oder im Krafttraining; Woche, Verlauf und Fortschritt zeigen es in Gold.
- **Verlauf** nach Monat, **Fortschritts-Karten** (anheften, % seit erstem Training), **Gym-Seite** mit Bestwerten je Gerät.
- **Rundgang mit Beispieldaten** beim ersten Start, **Feedback** aus der App (Supabase-Tabelle `feedback`).
- **Import** des Backups der bisherigen App „Gym Progress Tracker“ (Profil → Daten).

## Entwicklung

```bash
npm install
npm run dev        # ohne Supabase-Variablen: lokaler Modus (kein Login)
npm test
npm run build
```

## Supabase einrichten (Konten + Sync)

1. Auf [supabase.com](https://supabase.com) ein Projekt anlegen (Region: Frankfurt).
2. Im Dashboard **SQL Editor** → Inhalt von `supabase/migrations/0001_init.sql` einfügen → *Run*, danach `0005_model_details.sql` und `0008_gym_details.sql`.
   Danach dasselbe mit `0002_seed_catalog.sql` , `0003_feedback.sql`, `0004_cardio_session.sql`, `0006_plan_slots.sql` und `0007_deload.sql`.
3. **Authentication → Sign In / Providers → Email** aktiv lassen. Unter **Authentication → Emails → Magic Link**
   im Text `{{ .Token }}` ergänzen, damit die Mail den 6-stelligen Code enthält (wichtig für die installierte iPhone-App).
4. **Authentication → URL Configuration:** *Site URL* = `https://<github-name>.github.io/gym-tracker-pro/`.
5. **Project Settings → API:** *Project URL* und *anon public key* kopieren und im GitHub-Repo unter
   **Settings → Secrets and variables → Actions → Variables** als `SUPABASE_URL` und `SUPABASE_ANON_KEY` anlegen.
   (Der anon key ist öffentlich by design; geschützt wird über Row Level Security.)
6. GitHub **Settings → Pages → Source: GitHub Actions**. Jeder Push auf `main` baut und veröffentlicht.

Lokal: `.env.local` mit `VITE_SUPABASE_URL=…` und `VITE_SUPABASE_ANON_KEY=…`.

## Architektur

| Ordner | Inhalt |
|---|---|
| `src/model` | Datenmodell (geteilte vs. private Tabellen) |
| `src/domain` | reine, getestete Logik: Progression, Historie-Ebenen, Kennzahlen, Zusammenfassung |
| `src/local` | Dexie-Datenbank, Schreiben mit Outbox, Abfragen |
| `src/sync` | Push/Pull mit Last-Write-Wins, Supabase-Client, Login |
| `src/catalog` | Katalog; `npm run catalog:sql` erzeugt daraus das Seed-SQL |
| `src/import` | Import aus der bisherigen App |
| `supabase/migrations` | Schema, Sync-Trigger, Row Level Security, Katalog-Seed |
