# Ideen-Backlog

Gesammelte Ideen aus der Produktentwicklung – noch nicht umgesetzt. Reihenfolge = aktuelle Empfehlung.

## Leitlinien für Gamification

- Dezent, ohne Druck: keine Strafen, keine drängelnden Push-Nachrichten, keine Punkte fürs bloße Öffnen.
- Alles im Profil abschaltbar.
- Am liebsten Mechaniken, die gleichzeitig ein echtes Problem lösen (z. B. Gerätelisten pflegen).
- Vergleiche mit anderen nur relativ (Fortschritt in %), nie absolute Gewichte – außer man teilt sie bewusst.

## Gamification (solo)

1. **Gym-Stempelheft** – Stempel je besuchtem Gym („12 von 69 Kölner Gyms“), Ansicht nach Stadtteil.
2. **Pionier-Punkte** – für Erfassen/Bestätigen von Geräten und Modellen; Titel „Pionier im …“. Löst das Datenproblem.
3. **Muskel-Karte der Woche** – Körperfigur nach Wochenvolumen eingefärbt.
4. **Meilensteine** – sinnvolle Abzeichen (50/100 Trainings, erstmals 100 kg Beinpresse, 10 t in einem Training, 8 Wochen im Ziel, 25 Geräte, 5 Gyms), je einmal mit Datum.
5. **Bestwerte-Wand** – Rekord-Verlauf je Übung, „größter Fortschritt“.
6. **Monats- und Jahresrückblick** – Tonnen, Lieblings-Gym/-Übung, Bestwerte, größter Fortschritt; teilbare Karte.
7. **Anschauliche Vergleiche** – „12,4 t – so viel wie ein Linienbus“ in der Zusammenfassung.
8. **Persönliche Monats-Challenge** – Vorschlag aus den eigenen Daten, freiwillig, ohne Konsequenz.
9. **Gnädige Serien** – ein Joker pro Monat (Krankheit/Urlaub).

## Gamification mit Freunden / Community

Voraussetzung: Konten + Sync (Supabase), Tabellen für Freunde, Challenges, Reaktionen – private by default.

1. **Freunde per Link/Code** – wie Plan-Teilen; keine Kontaktbuch- oder Standortsuche.
2. **Challenges unter Freunden** – nur faire Metriken:
   - Anzahl Trainings / Wochen im Ziel (Konstanz)
   - Fortschritt in % an einer Übung (gleiche Chancen für Anfänger und Fortgeschrittene)
   - Gym-Entdecker (neue Gyms im Monat)
   - Dauer frei wählbar (1 Woche bis 8 Wochen), Einladung per Link
3. **Team-Ziele statt nur Duelle** – gemeinsamer Fortschrittsbalken („Zusammen 100 t im Dezember“, „Zusammen 40 Trainings“).
4. **Plan-Challenges** – gemeinsam 8 Wochen denselben geteilten Plan durchziehen; Fortschritt der Gruppe sichtbar.
5. **Applaus statt Kommentare** – ein Antippen als Reaktion auf Meilensteine/Bestwerte von Freunden; kleiner Feed nur mit Meilensteinen.
6. **Zusammen trainieren** – „Ich bin heute 18 Uhr im Iron & Soul“ an Freunde; Abzeichen „gemeinsam trainiert“, wenn beide dort ein Training loggen.
7. **Gym-Community (opt-in, mit Pseudonym)** – Stammgäste und Pioniere je Gym; Bestenliste höchstens relativ zum Körpergewicht oder als Fortschritt.
8. **Stadt-Aktionen** – z. B. „Köln-Gym-Rallye im Januar: 5 neue Gyms“; später mit Partnern (USC, Studios) und Preisen → Geschäftsmodell.
9. **Fairness** – Plausibilitätsprüfung (unrealistische Sprünge zählen nicht für Challenges), Meldefunktion.

## Urban Sports Club / Wellhub

1. **„Wo trainiere ich heute?“** – Gyms im eigenen Paket nach Geräte-Abdeckung für den heutigen Plantag; fehlendes Gerät → wo es eins gibt.
2. **Besuchslimits** – Besuche je Studio/Monat mitzählen, Warnung vor dem Start; Standardwerte je Paket, pro Gym anpassbar.
3. **Kosten pro Training** – Monatsbeitrag eintragen → € pro Besuch, Vergleich mit Studio-Abo.
4. **Paket-Check** – „Alle deine Gyms sind in Classic enthalten“ / „3 Besuche nur mit Premium“.
5. **Gerätelisten aktuell halten** – „zuletzt bestätigt“, „defekt/weg“, automatische Bestätigung durch Training.
6. **Mehrere Anbieter** – Wellhub, EGYM Wellpass, Hansefit mit eigenen Stufen; Anbieter + Paket im Profil.
7. **Check-in-Erinnerung** – beim Trainingsstart, abschaltbar.
8. **Später B2B** – Firmen-/Team-Challenges über Arbeitgeber-Benefits (ohne Einzelgewichte).

## Personalisierung

- **Körperfiguren männlich/weiblich/divers** – dezente Unterschiede (Schulter/Taille/Hüfte, Brustkontur), freiwillig im Profil; divers = heutige neutrale Figur.
