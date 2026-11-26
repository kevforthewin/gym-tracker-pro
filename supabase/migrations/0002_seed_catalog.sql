-- Startkatalog (generiert von scripts/gen-catalog-sql.ts – nicht von Hand ändern)
-- Nach 0001_init.sql (und 0005_model_details.sql) im SQL Editor ausführen. Erneutes Ausführen aktualisiert nur Katalogzeilen.
insert into public.manufacturers (id, name, updated_at) values
  ('technogym', 'Technogym', 0),
  ('matrix', 'Matrix', 0),
  ('life-fitness', 'Life Fitness', 0),
  ('hammer-strength', 'Hammer Strength', 0),
  ('precor', 'Precor', 0),
  ('gym80', 'gym80', 0),
  ('hoist', 'Hoist', 0),
  ('cybex', 'Cybex', 0),
  ('egym', 'eGym', 0),
  ('panatta', 'Panatta', 0),
  ('nautilus', 'Nautilus', 0),
  ('milon', 'milon', 0),
  ('star-trac', 'Star Trac', 0),
  ('concept2', 'Concept2', 0),
  ('generic', 'Sonstige / unbekannt', 0)
on conflict (id) do update set name = excluded.name, updated_at = public.manufacturers.updated_at + 1
  where public.manufacturers.created_by is null;

insert into public.exercises (id, name, type, muscle_group, split, free_weight, updated_at) values
  ('chest-press', 'Brustpresse', 'weight_reps', 'Brust', 'push', null, 0),
  ('incline-chest-press', 'Schrägbankpresse (Maschine)', 'weight_reps', 'Brust', 'push', null, 0),
  ('decline-chest-press', 'Negativ-Brustpresse (Maschine)', 'weight_reps', 'Brust', 'push', null, 0),
  ('dip-machine', 'Dips (Maschine)', 'weight_reps', 'Trizeps', 'push', null, 0),
  ('butterfly', 'Butterfly', 'weight_reps', 'Brust', 'push', null, 0),
  ('cable-fly', 'Kabelzug Fliegende', 'weight_reps', 'Brust', 'push', null, 0),
  ('bench-press', 'Bankdrücken (Langhantel)', 'weight_reps', 'Brust', 'push', true, 0),
  ('incline-bench-press', 'Schrägbankdrücken (Langhantel)', 'weight_reps', 'Brust', 'push', true, 0),
  ('db-bench-press', 'Bankdrücken (Kurzhantel)', 'weight_reps', 'Brust', 'push', true, 0),
  ('db-incline-press', 'Schrägbankdrücken (Kurzhantel)', 'weight_reps', 'Brust', 'push', true, 0),
  ('dips', 'Dips', 'bodyweight', 'Brust', 'push', true, 0),
  ('shoulder-press', 'Schulterpresse', 'weight_reps', 'Schultern', 'push', null, 0),
  ('db-shoulder-press', 'Schulterdrücken (Kurzhantel)', 'weight_reps', 'Schultern', 'push', true, 0),
  ('lateral-raise-machine', 'Seitheben (Maschine)', 'weight_reps', 'Schultern', 'push', null, 0),
  ('db-lateral-raise', 'Seitheben (Kurzhantel)', 'weight_reps', 'Schultern', 'push', true, 0),
  ('cable-lateral-raise', 'Seitheben (Kabel)', 'weight_reps', 'Schultern', 'push', null, 0),
  ('triceps-press', 'Trizepsdrücken (Maschine)', 'weight_reps', 'Trizeps', 'push', null, 0),
  ('triceps-pushdown', 'Trizepsdrücken (Kabel)', 'weight_reps', 'Trizeps', 'push', null, 0),
  ('overhead-triceps', 'Überkopf-Trizeps (Kabel)', 'weight_reps', 'Trizeps', 'push', null, 0),
  ('lat-pulldown', 'Latzug', 'weight_reps', 'Rücken', 'pull', null, 0),
  ('seated-row', 'Rudern sitzend (Maschine)', 'weight_reps', 'Rücken', 'pull', null, 0),
  ('cable-row', 'Rudern (Kabel)', 'weight_reps', 'Rücken', 'pull', null, 0),
  ('t-bar-row', 'T-Bar-Rudern', 'weight_reps', 'Rücken', 'pull', null, 0),
  ('high-row', 'Rudern von oben (High Row)', 'weight_reps', 'Rücken', 'pull', null, 0),
  ('db-row', 'Kurzhantelrudern', 'weight_reps', 'Rücken', 'pull', true, 0),
  ('pullup', 'Klimmzüge', 'bodyweight', 'Rücken', 'pull', true, 0),
  ('assisted-pullup', 'Klimmzüge (unterstützt)', 'weight_reps', 'Rücken', 'pull', null, 0),
  ('pullover', 'Pullover (Maschine)', 'weight_reps', 'Rücken', 'pull', null, 0),
  ('reverse-fly', 'Reverse Butterfly', 'weight_reps', 'Hintere Schulter', 'pull', null, 0),
  ('face-pull', 'Face Pulls', 'weight_reps', 'Hintere Schulter', 'pull', null, 0),
  ('back-extension', 'Rückenstrecker', 'weight_reps', 'Unterer Rücken', 'pull', null, 0),
  ('biceps-curl-machine', 'Bizepscurl (Maschine)', 'weight_reps', 'Bizeps', 'pull', null, 0),
  ('db-curl', 'Bizepscurl (Kurzhantel)', 'weight_reps', 'Bizeps', 'pull', true, 0),
  ('hammer-curl', 'Hammercurl', 'weight_reps', 'Bizeps', 'pull', true, 0),
  ('cable-curl', 'Bizepscurl (Kabel)', 'weight_reps', 'Bizeps', 'pull', null, 0),
  ('shrug', 'Shrugs', 'weight_reps', 'Nacken', 'pull', true, 0),
  ('shrug-machine', 'Shrugs (Maschine)', 'weight_reps', 'Nacken', 'pull', null, 0),
  ('external-rotation', 'Außenrotation (Kabel)', 'weight_reps', 'Rotatorenmanschette', 'pull', null, 0),
  ('ez-curl', 'SZ-Curls', 'weight_reps', 'Bizeps', 'pull', true, 0),
  ('leg-press', 'Beinpresse', 'weight_reps', 'Beine', 'legs', null, 0),
  ('hack-squat', 'Hackenschmidt', 'weight_reps', 'Beine', 'legs', null, 0),
  ('pendulum-squat', 'Pendel-Kniebeuge', 'weight_reps', 'Beine', 'legs', null, 0),
  ('belt-squat', 'Gürtel-Kniebeuge (Belt Squat)', 'weight_reps', 'Beine', 'legs', null, 0),
  ('squat', 'Kniebeuge (Langhantel)', 'weight_reps', 'Beine', 'legs', true, 0),
  ('smith-squat', 'Kniebeuge (Multipresse)', 'weight_reps', 'Beine', 'legs', null, 0),
  ('leg-extension', 'Beinstrecker', 'weight_reps', 'Quadrizeps', 'legs', null, 0),
  ('leg-curl-seated', 'Beinbeuger sitzend', 'weight_reps', 'Beinbeuger', 'legs', null, 0),
  ('leg-curl-lying', 'Beinbeuger liegend', 'weight_reps', 'Beinbeuger', 'legs', null, 0),
  ('romanian-deadlift', 'Rumänisches Kreuzheben', 'weight_reps', 'Beinbeuger', 'legs', true, 0),
  ('deadlift', 'Kreuzheben', 'weight_reps', 'Rücken', 'legs', true, 0),
  ('hip-thrust', 'Hip Thrust', 'weight_reps', 'Gesäß', 'legs', null, 0),
  ('glute-machine', 'Gesäßmaschine', 'weight_reps', 'Gesäß', 'legs', null, 0),
  ('abductor', 'Abduktoren', 'weight_reps', 'Abduktoren', 'legs', null, 0),
  ('adductor', 'Adduktoren', 'weight_reps', 'Adduktoren', 'legs', null, 0),
  ('calf-raise', 'Wadenheben', 'weight_reps', 'Waden', 'legs', null, 0),
  ('seated-calf-raise', 'Wadenheben sitzend', 'weight_reps', 'Waden', 'legs', null, 0),
  ('lunges', 'Ausfallschritte', 'weight_reps', 'Beine', 'legs', true, 0),
  ('ab-crunch', 'Bauchmaschine', 'weight_reps', 'Bauch', 'other', null, 0),
  ('rotary-torso', 'Rotationsmaschine', 'weight_reps', 'Bauch', 'other', null, 0),
  ('hanging-leg-raise', 'Beinheben hängend', 'bodyweight', 'Bauch', 'other', true, 0),
  ('plank', 'Unterarmstütz', 'time_distance', 'Bauch', 'other', true, 0),
  ('treadmill', 'Laufband', 'time_distance', 'Cardio', 'other', null, 0),
  ('bike', 'Ergometer', 'time_distance', 'Cardio', 'other', null, 0),
  ('cross-trainer', 'Crosstrainer', 'time_distance', 'Cardio', 'other', null, 0),
  ('rower', 'Rudergerät', 'time_distance', 'Cardio', 'other', null, 0),
  ('stair-climber', 'Stepper / Treppe', 'time_distance', 'Cardio', 'other', null, 0)
on conflict (id) do update set name = excluded.name, type = excluded.type, muscle_group = excluded.muscle_group, split = excluded.split, free_weight = excluded.free_weight, updated_at = public.exercises.updated_at + 1
  where public.exercises.created_by is null;

insert into public.equipment_models (id, manufacturer_id, name, line, kind, exercise_id, weight_step_kg, model_number, source_url, verified, updated_at) values
  ('hoist--rs-1103', 'hoist', 'Triceps Extension', 'ROC-IT Selectorized', 'selectorized', 'triceps-press', 2.5, 'RS-1103', 'https://www.hoistfitness.com/products/rs-1103-triceps-extension', true, 0),
  ('hoist--rs-1502', 'hoist', 'Lateral Raise', 'ROC-IT Selectorized', 'selectorized', 'lateral-raise-machine', 2.5, 'RS-1502', 'https://www.hoistfitness.com/products/rs-1502-lateral-raise', true, 0),
  ('hoist--rs-2101', 'hoist', 'Seated Dip', 'ROC-IT Selectorized', 'selectorized', 'dip-machine', 2.5, 'RS-2101', 'https://www.hoistfitness.com/products/seated-dip', true, 0),
  ('hoist--rs-2102', 'hoist', 'Biceps Curl', 'ROC-IT Selectorized', 'selectorized', 'biceps-curl-machine', 2.5, 'RS-2102', 'https://www.hoistfitness.com/products/biceps-curl', true, 0),
  ('hoist--rs-2201', 'hoist', 'Lat Pulldown', 'ROC-IT Selectorized', 'selectorized', 'lat-pulldown', 2.5, 'RS-2201', 'https://www.hoistfitness.com/products/rs-2201-lat-pulldown', true, 0),
  ('hoist--rs-2203', 'hoist', 'Seated Mid Row', 'ROC-IT Selectorized', 'selectorized', 'seated-row', 2.5, 'RS-2203', 'https://www.hoistfitness.com/products/seated-mid-row', true, 0),
  ('hoist--rs-2204', 'hoist', 'Low Back', 'ROC-IT Selectorized', 'selectorized', 'back-extension', 2.5, 'RS-2204', 'https://www.hoistfitness.com/products/low-back', true, 0),
  ('hoist--rs-2301', 'hoist', 'Chest Press', 'ROC-IT Selectorized', 'selectorized', 'chest-press', 2.5, 'RS-2301', 'https://www.hoistfitness.com/products/rs-2301-chest-press', true, 0),
  ('hoist--rs-2302', 'hoist', 'Pec Fly', 'ROC-IT Selectorized', 'selectorized', 'butterfly', 2.5, 'RS-2302', 'https://www.hoistfitness.com/products/pec-fly', true, 0),
  ('hoist--rs-2401', 'hoist', 'Leg Extension', 'ROC-IT Selectorized', 'selectorized', 'leg-extension', 2.5, 'RS-2401', 'https://www.hoistfitness.com/products/rs-2401-leg-extension', true, 0),
  ('hoist--rs-2402', 'hoist', 'Leg Curl', 'ROC-IT Selectorized', 'selectorized', 'leg-curl-seated', 2.5, 'RS-2402', 'https://www.hoistfitness.com/products/rs-2402-leg-curl', true, 0),
  ('hoist--rs-2403', 'hoist', 'Leg Press', 'ROC-IT Selectorized', 'selectorized', 'leg-press', 2.5, 'RS-2403', 'https://www.hoistfitness.com/products/rs-2403-leg-press', true, 0),
  ('hoist--rs-2406', 'hoist', 'Inner Thigh', 'ROC-IT Selectorized', 'selectorized', 'adductor', 2.5, 'RS-2406', 'https://www.hoistfitness.com/products/inner-thigh', true, 0),
  ('hoist--rs-2407', 'hoist', 'Outer Thigh', 'ROC-IT Selectorized', 'selectorized', 'abductor', 2.5, 'RS-2407', 'https://www.hoistfitness.com/products/outer-thigh', true, 0),
  ('hoist--rs-2408', 'hoist', 'Prone Leg Curl', 'ROC-IT Selectorized', 'selectorized', 'leg-curl-lying', 2.5, 'RS-2408', 'https://www.hoistfitness.com/products/rs-2408-prone-leg-curl', true, 0),
  ('hoist--rs-2412', 'hoist', 'Glute Master', 'ROC-IT Selectorized', 'selectorized', 'glute-machine', 2.5, 'RS-2412', 'https://www.hoistfitness.com/products/glute-master', true, 0),
  ('hoist--rs-2415', 'hoist', 'Rotary Calf', 'ROC-IT Selectorized', 'selectorized', 'calf-raise', 2.5, 'RS-2415', 'https://www.hoistfitness.com/products/rotary-calf', true, 0),
  ('hoist--rs-2501', 'hoist', 'Shoulder Press', 'ROC-IT Selectorized', 'selectorized', 'shoulder-press', 2.5, 'RS-2501', 'https://www.hoistfitness.com/products/shoulder-press', true, 0),
  ('hoist--rs-2601', 'hoist', 'Abdominals', 'ROC-IT Selectorized', 'selectorized', 'ab-crunch', 2.5, 'RS-2601', 'https://www.hoistfitness.com/products/rs-2601-abdominals', true, 0),
  ('hoist--rs-2602', 'hoist', 'Rotary Torso', 'ROC-IT Selectorized', 'selectorized', 'rotary-torso', 2.5, 'RS-2602', 'https://www.hoistfitness.com/products/rs-2602-rotary-torso', true, 0),
  ('hoist--rs-2700', 'hoist', 'Chin/Dip Assist', 'ROC-IT Selectorized', 'selectorized', 'assisted-pullup', 2.5, 'RS-2700', 'https://www.hoistfitness.com/products/rs-2700-chin-dip-assist', true, 0),
  ('hoist--rpl-5101', 'hoist', 'Seated Dip', 'ROC-IT Plate Loaded', 'plate_loaded', 'dip-machine', 2.5, 'RPL-5101', 'https://www.hoistfitness.com/products/rpl-5101-seated-dip', true, 0),
  ('hoist--rpl-5102', 'hoist', 'Biceps Curl', 'ROC-IT Plate Loaded', 'plate_loaded', 'biceps-curl-machine', 2.5, 'RPL-5102', 'https://www.hoistfitness.com/products/rpl-5102-biceps-curl', true, 0),
  ('hoist--rpl-5201', 'hoist', 'Lat Pulldown', 'ROC-IT Plate Loaded', 'plate_loaded', 'lat-pulldown', 2.5, 'RPL-5201', 'https://www.hoistfitness.com/products/rpl-5201-lat-pulldown', true, 0),
  ('hoist--rpl-5203', 'hoist', 'Mid Row', 'ROC-IT Plate Loaded', 'plate_loaded', 'seated-row', 2.5, 'RPL-5203', 'https://www.hoistfitness.com/products/rpl-5203-mid-row', true, 0),
  ('hoist--rpl-5301', 'hoist', 'Chest Press', 'ROC-IT Plate Loaded', 'plate_loaded', 'chest-press', 2.5, 'RPL-5301', 'https://www.hoistfitness.com/products/rpl-5301-chest-press', true, 0),
  ('hoist--rpl-5303', 'hoist', 'Incline Chest Press', 'ROC-IT Plate Loaded', 'plate_loaded', 'incline-chest-press', 2.5, 'RPL-5303', 'https://www.hoistfitness.com/products/rpl-5303-incline-chest-press', true, 0),
  ('hoist--rpl-5305', 'hoist', 'Decline Chest Press', 'ROC-IT Plate Loaded', 'plate_loaded', 'decline-chest-press', 2.5, 'RPL-5305', 'https://www.hoistfitness.com/products/rpl-5305-decline-chest-press', true, 0),
  ('hoist--rpl-5356', 'hoist', 'Hack Squat/Dead Lift/Shrug', 'ROC-IT Plate Loaded', 'plate_loaded', 'hack-squat', 2.5, 'RPL-5356', 'https://www.hoistfitness.com/products/rpl-5356-hack-squat-dead-lift-shrug', true, 0),
  ('hoist--rpl-5363', 'hoist', 'Seated Calf Raise', 'ROC-IT Plate Loaded', 'plate_loaded', 'seated-calf-raise', 2.5, 'RPL-5363', 'https://www.hoistfitness.com/products/rpl-5363-seated-calf-raise', true, 0),
  ('hoist--rpl-5403', 'hoist', 'Dual Action Leg Press', 'ROC-IT Plate Loaded', 'plate_loaded', 'leg-press', 2.5, 'RPL-5403', 'https://www.hoistfitness.com/products/rpl-5403-dual-action-leg-press', true, 0),
  ('hoist--rpl-5405', 'hoist', 'Standing Calf Raise', 'ROC-IT Plate Loaded', 'plate_loaded', 'calf-raise', 2.5, 'RPL-5405', 'https://www.hoistfitness.com/products/rpl-5405-standing-calf-raise', true, 0),
  ('hoist--rpl-5501', 'hoist', 'Shoulder Press', 'ROC-IT Plate Loaded', 'plate_loaded', 'shoulder-press', 2.5, 'RPL-5501', 'https://www.hoistfitness.com/products/rpl-5501-shoulder-press', true, 0),
  ('hoist--rpl-5601', 'hoist', 'Abdominals', 'ROC-IT Plate Loaded', 'plate_loaded', 'ab-crunch', 2.5, 'RPL-5601', 'https://www.hoistfitness.com/products/rpl-5601-abdominals', true, 0),
  ('hoist--hd-3103', 'hoist', 'Preacher Curl/Triceps Extension', 'HD Dual', 'selectorized', 'biceps-curl-machine', 2.5, 'HD-3103', 'https://www.hoistfitness.com/products/hd-3100-preacher-curl-triceps-extension', true, 0),
  ('hoist--hd-3203', 'hoist', 'Lat Pulldown/Mid Row', 'HD Dual', 'selectorized', 'lat-pulldown', 2.5, 'HD-3203', 'https://www.hoistfitness.com/products/hd-3200-lat-pulldown-mid-row', true, 0),
  ('hoist--hd-3300', 'hoist', 'Chest/Shoulder Press', 'HD Dual', 'selectorized', 'chest-press', 2.5, 'HD-3300', 'https://www.hoistfitness.com/products/hd-3300-chest-shoulder-press', true, 0),
  ('hoist--hd-3400', 'hoist', 'Leg Extension/Leg Curl', 'HD Dual', 'selectorized', 'leg-extension', 2.5, 'HD-3400', 'https://www.hoistfitness.com/products/hd-3400-leg-extension-leg-curl', true, 0),
  ('hoist--hd-3403', 'hoist', 'Leg Press/Calf Raise', 'HD Dual', 'selectorized', 'leg-press', 2.5, 'HD-3403', 'https://www.hoistfitness.com/products/hd-3403-leg-press-calf-raise', true, 0),
  ('hoist--hd-3600', 'hoist', 'Ab Crunch/Low Back', 'HD Dual', 'selectorized', 'ab-crunch', 2.5, 'HD-3600', 'https://www.hoistfitness.com/products/hd-3600-ab-crunch-low-back', true, 0),
  ('hoist--hd-3701', 'hoist', 'Chin/Dip Assist', 'HD Dual', 'selectorized', 'assisted-pullup', 2.5, 'HD-3701', 'https://www.hoistfitness.com/products/hd-3700-chin-dip-assist', true, 0),
  ('hoist--hd-3800', 'hoist', 'Inner/Outer Thigh', 'HD Dual', 'selectorized', 'abductor', 2.5, 'HD-3800', 'https://www.hoistfitness.com/products/hd-3800-inner-outer-thigh', true, 0),
  ('hoist--hd-3900', 'hoist', 'Pec Fly/Rear Delt', 'HD Dual', 'selectorized', 'butterfly', 2.5, 'HD-3900', 'https://www.hoistfitness.com/products/hd-3900-pec-fly-rear-delt', true, 0),
  ('hoist--cl-3102', 'hoist', 'Biceps Curl', 'Club Line', 'selectorized', 'biceps-curl-machine', 2.5, 'CL-3102', 'https://www.hoistfitness.com/products/cl-3102-biceps-curl', true, 0),
  ('hoist--cl-3103', 'hoist', 'Triceps Extension', 'Club Line', 'selectorized', 'triceps-press', 2.5, 'CL-3103', 'https://www.hoistfitness.com/products/cl-3103-triceps-extension', true, 0),
  ('hoist--cl-3201', 'hoist', 'Lat Pulldown', 'Club Line', 'selectorized', 'lat-pulldown', 2.5, 'CL-3201', 'https://www.hoistfitness.com/products/cl-3201-lat-pulldown', true, 0),
  ('hoist--cl-3203', 'hoist', 'Mid Row', 'Club Line', 'selectorized', 'seated-row', 2.5, 'CL-3203', 'https://www.hoistfitness.com/products/cl-3203-mid-row', true, 0),
  ('hoist--cl-3301', 'hoist', 'Chest Press', 'Club Line', 'selectorized', 'chest-press', 2.5, 'CL-3301', 'https://www.hoistfitness.com/products/cl-3301-chest-press', true, 0),
  ('hoist--cl-3309', 'hoist', 'Commercial Pec Fly / Rear Delt', 'Club Line', 'selectorized', 'butterfly', 2.5, 'CL-3309', 'https://www.hoistfitness.com/products/cl-3309-pec-fly-rear-delt', true, 0),
  ('hoist--cl-3401', 'hoist', 'Leg Extension', 'Club Line', 'selectorized', 'leg-extension', 2.5, 'CL-3401', 'https://www.hoistfitness.com/products/cl-3401-leg-extension', true, 0),
  ('hoist--cl-3402', 'hoist', 'Leg Curl', 'Club Line', 'selectorized', 'leg-curl-seated', 2.5, 'CL-3402', 'https://www.hoistfitness.com/products/cl-3402-leg-curl', true, 0),
  ('hoist--cl-3403', 'hoist', 'Leg Press', 'Club Line', 'selectorized', 'leg-press', 2.5, 'CL-3403', 'https://www.hoistfitness.com/products/cl-3403-cl-3403-hs-leg-press', true, 0),
  ('hoist--cl-3408', 'hoist', 'Standing / Prone Leg Curl', 'Club Line', 'selectorized', 'leg-curl-lying', 2.5, 'CL-3408', 'https://www.hoistfitness.com/products/cl-3408-standing-prone-leg-curl', true, 0),
  ('hoist--cl-3501', 'hoist', 'Shoulder Press', 'Club Line', 'selectorized', 'shoulder-press', 2.5, 'CL-3501', 'https://www.hoistfitness.com/products/cl-3501-shoulder-press', true, 0),
  ('hoist--cl-3502', 'hoist', 'Lateral Raise', 'Club Line', 'selectorized', 'lateral-raise-machine', 2.5, 'CL-3502', 'https://www.hoistfitness.com/products/cl-3502-lateral-raise', true, 0),
  ('hoist--cl-3601', 'hoist', 'Abdominals', 'Club Line', 'selectorized', 'ab-crunch', 2.5, 'CL-3601', 'https://www.hoistfitness.com/products/cl-3601-abdominals', true, 0),
  ('hoist--cl-3800', 'hoist', 'Inner / Outer Thigh', 'Club Line', 'selectorized', 'abductor', 2.5, 'CL-3800', 'https://www.hoistfitness.com/products/cl-3800-inner-outer-thigh', true, 0),
  ('hammer-strength--pl-ghrh', 'hammer-strength', 'Glute Ham / Reverse Hyper', 'Plate-Loaded', 'plate_loaded', 'back-extension', 2.5, 'PL-GHRH', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/glute-ham-reverse-hyper-combo', true, 0),
  ('hammer-strength--pl-hsq2', 'hammer-strength', 'Hack Squat', 'Plate-Loaded', 'plate_loaded', 'hack-squat', 2.5, 'PL-HSQ2', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/hack-squat', true, 0),
  ('hammer-strength--pl-bsq', 'hammer-strength', 'Belt Squat', 'Plate-Loaded', 'plate_loaded', 'belt-squat', 2.5, 'PL-BSQ', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/hammer-strength-plate-loaded-belt-squat', true, 0),
  ('hammer-strength--pl-gld', 'hammer-strength', 'Glute Drive', 'Plate-Loaded', 'plate_loaded', 'hip-thrust', 2.5, 'PL-GLD', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/hammer-strength-plate-loaded-glute-drive', true, 0),
  ('hammer-strength--pl-tbr', 'hammer-strength', 'T-Bar Row', 'Plate-Loaded', 'plate_loaded', 't-bar-row', 2.5, 'PL-TBR', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/hammer-strength-plate-loaded-t-bar-row', true, 0),
  ('hammer-strength--il-dcp', 'hammer-strength', 'Iso-Lateral Decline Chest Press', 'Plate-Loaded', 'plate_loaded', 'decline-chest-press', 2.5, 'IL-DCP', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/iso-lateral-decline-chest-press', true, 0),
  ('hammer-strength--il-le', 'hammer-strength', 'Iso-Lateral Leg Extension', 'Plate-Loaded', 'plate_loaded', 'leg-extension', 2.5, 'IL-LE', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/iso-lateral-leg-extension', true, 0),
  ('hammer-strength--il-tbr', 'hammer-strength', 'Iso-Lateral T-Bar Row', 'Plate-Loaded', 'plate_loaded', 't-bar-row', 2.5, 'IL-TBR', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/iso-lateral-t-bar-row', true, 0),
  ('life-fitness--plate-loaded-calf-raise', 'life-fitness', 'Calf Raise', 'Plate Loaded', 'plate_loaded', 'calf-raise', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/life-fitness-calf-raise', true, 0),
  ('life-fitness--plate-loaded-decline-chest-press', 'life-fitness', 'Decline Chest Press', 'Plate Loaded', 'plate_loaded', 'decline-chest-press', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/life-fitness-decline-chest-press', true, 0),
  ('life-fitness--plate-loaded-pulldown', 'life-fitness', 'Pulldown', 'Plate Loaded', 'plate_loaded', 'lat-pulldown', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/life-fitness-front-pulldown', true, 0),
  ('life-fitness--plate-loaded-high-row', 'life-fitness', 'High Row', 'Plate Loaded', 'plate_loaded', 'high-row', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/life-fitness-high-row', true, 0),
  ('life-fitness--plate-loaded-incline-press', 'life-fitness', 'Incline Press', 'Plate Loaded', 'plate_loaded', 'incline-chest-press', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/life-fitness-incline-press', true, 0),
  ('life-fitness--plate-loaded-kneeling-leg-curl', 'life-fitness', 'Kneeling Leg Curl', 'Plate Loaded', 'plate_loaded', 'leg-curl-lying', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/life-fitness-kneeling-leg-curl', true, 0),
  ('life-fitness--plate-loaded-leg-extension', 'life-fitness', 'Leg Extension', 'Plate Loaded', 'plate_loaded', 'leg-extension', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/life-fitness-leg-extension', true, 0),
  ('life-fitness--plate-loaded-linear-leg-press', 'life-fitness', 'Linear Leg Press', 'Plate Loaded', 'plate_loaded', 'leg-press', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/life-fitness-linear-leg-press', true, 0),
  ('life-fitness--plate-loaded-row', 'life-fitness', 'Row', 'Plate Loaded', 'plate_loaded', 'seated-row', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/life-fitness-row', true, 0),
  ('life-fitness--plate-loaded-seated-dip', 'life-fitness', 'Seated Dip', 'Plate Loaded', 'plate_loaded', 'dip-machine', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/life-fitness-seated-dip', true, 0),
  ('life-fitness--plate-loaded-shoulder-press', 'life-fitness', 'Shoulder Press', 'Plate Loaded', 'plate_loaded', 'shoulder-press', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/life-fitness-shoulder-press', true, 0),
  ('hammer-strength--pl-xsq', 'hammer-strength', 'Pendulum-X Squat', 'Plate-Loaded', 'plate_loaded', 'pendulum-squat', 2.5, 'PL-XSQ', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/pendulum-x-squat', true, 0),
  ('hammer-strength--pl-ab', 'hammer-strength', 'Abdominal / Oblique Crunch', 'Plate-Loaded', 'plate_loaded', 'ab-crunch', 2.5, 'PL-AB', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-abdominal-oblique-crunch', true, 0),
  ('hammer-strength--il-bp', 'hammer-strength', 'Iso-Lateral Bench Press', 'Plate-Loaded', 'plate_loaded', 'chest-press', 2.5, 'IL-BP', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-bench-press', true, 0),
  ('hammer-strength--il-cb', 'hammer-strength', 'Iso-Lateral Chest / Back', 'Plate-Loaded', 'plate_loaded', 'chest-press', 2.5, 'IL-CB', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-chest-back', true, 0),
  ('hammer-strength--il-drw', 'hammer-strength', 'Iso-Lateral D.Y. Row', 'Plate-Loaded', 'plate_loaded', 'seated-row', 2.5, 'IL-DRW', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-d-y-row', true, 0),
  ('hammer-strength--il-pd', 'hammer-strength', 'Iso-Lateral Front Lat Pulldown', 'Plate-Loaded', 'plate_loaded', 'lat-pulldown', 2.5, 'IL-PD', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-front-lat-pulldown', true, 0),
  ('hammer-strength--il-hr', 'hammer-strength', 'Iso-Lateral High Row', 'Plate-Loaded', 'plate_loaded', 'high-row', 2.5, 'IL-HR', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-high-row', true, 0),
  ('hammer-strength--il-hbp', 'hammer-strength', 'Iso-Lateral Horizontal Bench Press', 'Plate-Loaded', 'plate_loaded', 'chest-press', 2.5, 'IL-HBP', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-horizontal-bench-press', true, 0),
  ('hammer-strength--il-ip', 'hammer-strength', 'Iso-Lateral Incline Press', 'Plate-Loaded', 'plate_loaded', 'incline-chest-press', 2.5, 'IL-IP', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-incline-press', true, 0),
  ('hammer-strength--il-klc', 'hammer-strength', 'Iso-Lateral Kneeling Leg Curl', 'Plate-Loaded', 'plate_loaded', 'leg-curl-lying', 2.5, 'IL-KLC', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-kneeling-leg-curl', true, 0),
  ('hammer-strength--il-lc', 'hammer-strength', 'Iso-Lateral Leg Curl', 'Plate-Loaded', 'plate_loaded', 'leg-curl-seated', 2.5, 'IL-LC', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-leg-curl', true, 0),
  ('hammer-strength--il-lr', 'hammer-strength', 'Iso-Lateral Low Row', 'Plate-Loaded', 'plate_loaded', 'seated-row', 2.5, 'IL-LR', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-low-row', true, 0),
  ('hammer-strength--il-row', 'hammer-strength', 'Iso-Lateral Row', 'Plate-Loaded', 'plate_loaded', 'seated-row', 2.5, 'IL-ROW', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-row', true, 0),
  ('hammer-strength--il-sp', 'hammer-strength', 'Iso-Lateral Shoulder Press', 'Plate-Loaded', 'plate_loaded', 'shoulder-press', 2.5, 'IL-SP', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-shoulder-press', true, 0),
  ('hammer-strength--il-fmp', 'hammer-strength', 'Iso-Lateral Super Incline Press', 'Plate-Loaded', 'plate_loaded', 'incline-chest-press', 2.5, 'IL-FMP', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-super-incline-press', true, 0),
  ('hammer-strength--il-wc', 'hammer-strength', 'Iso-Lateral Wide Chest', 'Plate-Loaded', 'plate_loaded', 'chest-press', 2.5, 'IL-WC', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-wide-chest', true, 0),
  ('hammer-strength--il-wpd', 'hammer-strength', 'Iso-Lateral Wide Pulldown', 'Plate-Loaded', 'plate_loaded', 'lat-pulldown', 2.5, 'IL-WPD', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-wide-pulldown', true, 0),
  ('hammer-strength--pl-lr', 'hammer-strength', 'Lateral Raise', 'Plate-Loaded', 'plate_loaded', 'lateral-raise-machine', 2.5, 'PL-LR', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-lateral-raise', true, 0),
  ('hammer-strength--hs-llp', 'hammer-strength', 'Linear Leg Press', 'Plate-Loaded', 'plate_loaded', 'leg-press', 2.5, 'HS-LLP', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-linear-leg-press', true, 0),
  ('hammer-strength--pl-po', 'hammer-strength', 'Pullover', 'Plate-Loaded', 'plate_loaded', 'pullover', 2.5, 'PL-PO', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-pullover', true, 0),
  ('hammer-strength--pl-bi', 'hammer-strength', 'Seated Biceps', 'Plate-Loaded', 'plate_loaded', 'biceps-curl-machine', 2.5, 'PL-BI', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-seated-biceps', true, 0),
  ('hammer-strength--pl-calf', 'hammer-strength', 'Seated Calf Raise', 'Plate-Loaded', 'plate_loaded', 'seated-calf-raise', 2.5, 'PL-CALF', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-seated-calf-raise', true, 0),
  ('hammer-strength--pl-dip', 'hammer-strength', 'Seated Dip', 'Plate-Loaded', 'plate_loaded', 'dip-machine', 2.5, 'PL-DIP', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-seated-dip', true, 0),
  ('hammer-strength--pl-sh', 'hammer-strength', 'Seated / Standing Shrug', 'Plate-Loaded', 'plate_loaded', 'shrug-machine', 2.5, 'PL-SH', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-seated-standing-shrug', true, 0),
  ('hammer-strength--gb-shp', 'hammer-strength', 'Ground Base® Squat / High Pull', 'Plate-Loaded', 'plate_loaded', 'hack-squat', 2.5, 'GB-SHP', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-squat-high-pull', true, 0),
  ('hammer-strength--pl-rvsq', 'hammer-strength', 'Reverse V-Squat', 'Plate-Loaded', 'plate_loaded', 'hack-squat', 2.5, 'PL-RVSQ', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/reverse-v-squat', true, 0),
  ('hammer-strength--pl-fly', 'hammer-strength', 'Super Fly', 'Plate-Loaded', 'plate_loaded', 'butterfly', 2.5, 'PL-FLY', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/super-fly', true, 0),
  ('hammer-strength--pl-ssp', 'hammer-strength', 'Super Squat Press', 'Plate-Loaded', 'plate_loaded', 'hack-squat', 2.5, 'PL-SSP', 'https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/super-squat-press', true, 0),
  ('hammer-strength--select-abdominal-crunch', 'hammer-strength', 'Abdominal Crunch', 'Select', 'selectorized', 'ab-crunch', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-abdominal-crunch', true, 0),
  ('hammer-strength--select-assist-dip-chin', 'hammer-strength', 'Assist Dip Chin', 'Select', 'selectorized', 'assisted-pullup', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-assist-dip-chin', true, 0),
  ('hammer-strength--select-back-extension', 'hammer-strength', 'Back Extension', 'Select', 'selectorized', 'back-extension', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-back-extension', true, 0),
  ('hammer-strength--select-biceps-curl', 'hammer-strength', 'Biceps Curl', 'Select', 'selectorized', 'biceps-curl-machine', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-biceps-curl', true, 0),
  ('hammer-strength--select-chest-press', 'hammer-strength', 'Chest Press', 'Select', 'selectorized', 'chest-press', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-chest-press', true, 0),
  ('hammer-strength--select-fixed-pulldown', 'hammer-strength', 'Fixed Pulldown', 'Select', 'selectorized', 'lat-pulldown', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-fixed-pulldown', true, 0),
  ('hammer-strength--select-hip-abduction', 'hammer-strength', 'Hip Abduction', 'Select', 'selectorized', 'abductor', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-hip-abduction', true, 0),
  ('hammer-strength--select-hip-adduction', 'hammer-strength', 'Hip Adduction', 'Select', 'selectorized', 'adductor', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-hip-adduction', true, 0),
  ('hammer-strength--select-hip-and-glute', 'hammer-strength', 'Hip and Glute', 'Select', 'selectorized', 'glute-machine', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-hip-and-glute', true, 0),
  ('hammer-strength--select-horizontal-calf', 'hammer-strength', 'Horizontal Calf', 'Select', 'selectorized', 'calf-raise', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-horizontal-calf', true, 0),
  ('hammer-strength--select-lat-pulldown', 'hammer-strength', 'Lat Pulldown', 'Select', 'selectorized', 'lat-pulldown', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-lat-pulldown', true, 0),
  ('hammer-strength--select-lateral-raise', 'hammer-strength', 'Lateral Raise', 'Select', 'selectorized', 'lateral-raise-machine', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-lateral-raise', true, 0),
  ('hammer-strength--select-leg-curl', 'hammer-strength', 'Leg Curl', 'Select', 'selectorized', 'leg-curl-seated', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-leg-curl', true, 0),
  ('hammer-strength--select-leg-extension', 'hammer-strength', 'Leg Extension', 'Select', 'selectorized', 'leg-extension', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-leg-extension', true, 0),
  ('hammer-strength--select-pectoral-fly', 'hammer-strength', 'Pectoral Fly', 'Select', 'selectorized', 'butterfly', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-pectoral-fly', true, 0),
  ('hammer-strength--select-pectoral-fly-rear-deltoid', 'hammer-strength', 'Pectoral Fly/Rear Deltoid', 'Select', 'selectorized', 'butterfly', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-pectoral-fly-rear-deltoid', true, 0),
  ('hammer-strength--select-seated-leg-curl', 'hammer-strength', 'Seated Leg Curl', 'Select', 'selectorized', 'leg-curl-seated', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-seated-leg-curl', true, 0),
  ('hammer-strength--select-seated-leg-press', 'hammer-strength', 'Seated Leg Press', 'Select', 'selectorized', 'leg-press', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-seated-leg-press', true, 0),
  ('hammer-strength--select-seated-row', 'hammer-strength', 'Seated Row', 'Select', 'selectorized', 'seated-row', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-seated-row', true, 0),
  ('hammer-strength--select-shoulder-press', 'hammer-strength', 'Shoulder Press', 'Select', 'selectorized', 'shoulder-press', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-shoulder-press', true, 0),
  ('hammer-strength--select-standing-calf', 'hammer-strength', 'Standing Calf', 'Select', 'selectorized', 'calf-raise', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-standing-calf', true, 0),
  ('hammer-strength--select-triceps-extension', 'hammer-strength', 'Triceps Extension', 'Select', 'selectorized', 'triceps-press', 2.5, null, 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/hammer-strength-select-triceps-extension', true, 0),
  ('life-fitness--ss-ab', 'life-fitness', 'Abdominal', 'Insignia Series', 'selectorized', 'ab-crunch', 2.5, 'SS-AB', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-abdominal', true, 0),
  ('life-fitness--ss-abd', 'life-fitness', 'Abdominal Advanced', 'Insignia Series', 'selectorized', 'ab-crunch', 2.5, 'SS-ABD', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-abdominal-advanced', true, 0),
  ('life-fitness--ss-lp', 'life-fitness', 'Arc Leg Press', 'Insignia Series', 'selectorized', 'leg-press', 2.5, 'SS-LP', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-arc-leg-press', true, 0),
  ('life-fitness--ss-adc', 'life-fitness', 'Assist Dip Chin', 'Insignia Series', 'selectorized', 'assisted-pullup', 2.5, 'SS-ADC', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-assist-dip-chin', true, 0),
  ('life-fitness--ss-be', 'life-fitness', 'Back Extension', 'Insignia Series', 'selectorized', 'back-extension', 2.5, 'SS-BE', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-back-extension', true, 0),
  ('life-fitness--ss-bc', 'life-fitness', 'Biceps Curl', 'Insignia Series', 'selectorized', 'biceps-curl-machine', 2.5, 'SS-BC', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-biceps-curl', true, 0),
  ('life-fitness--ss-bcd', 'life-fitness', 'Biceps Curl - Dependent', 'Insignia Series', 'selectorized', 'biceps-curl-machine', 2.5, 'SS-BCD', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-biceps-curl-dependent', true, 0),
  ('life-fitness--ss-ce', 'life-fitness', 'Calf Extension', 'Insignia Series', 'selectorized', 'calf-raise', 2.5, 'SS-CE', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-calf-extension', true, 0),
  ('life-fitness--ss-cp', 'life-fitness', 'Chest Press', 'Insignia Series', 'selectorized', 'chest-press', 2.5, 'SS-CP', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-chest-press', true, 0),
  ('life-fitness--ss-cpx', 'life-fitness', 'Dual Axis Chest Press', 'Insignia Series', 'selectorized', 'chest-press', 2.5, 'SS-CPX', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-dual-axis-chest-press', true, 0),
  ('life-fitness--ss-pdx', 'life-fitness', 'Dual Axis Pulldown', 'Insignia Series', 'selectorized', 'lat-pulldown', 2.5, 'SS-PDX', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-dual-axis-pulldown', true, 0),
  ('life-fitness--ss-gl', 'life-fitness', 'Glute', 'Insignia Series', 'selectorized', 'glute-machine', 2.5, 'SS-GL', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-glute', true, 0),
  ('life-fitness--ss-glb', 'life-fitness', 'Glute Bridge', 'Insignia Series', 'selectorized', 'hip-thrust', 2.5, 'SS-GLB', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-glute-bridge', true, 0),
  ('life-fitness--ss-haa', 'life-fitness', 'Hip Abduction / Adduction', 'Insignia Series', 'selectorized', 'abductor', 2.5, 'SS-HAA', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-hip-abductor-adductor', true, 0),
  ('life-fitness--ss-had', 'life-fitness', 'Hip Adduction', 'Insignia Series', 'selectorized', 'adductor', 2.5, 'SS-HAD', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-hip-adduction', true, 0),
  ('life-fitness--ss-lr', 'life-fitness', 'Lateral Raise', 'Insignia Series', 'selectorized', 'lateral-raise-machine', 2.5, 'SS-LR', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-lateral-raise', true, 0),
  ('life-fitness--ss-lc', 'life-fitness', 'Leg Curl', 'Insignia Series', 'selectorized', 'leg-curl-seated', 2.5, 'SS-LC', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-leg-curl', true, 0),
  ('life-fitness--ss-le', 'life-fitness', 'Leg Extension', 'Insignia Series', 'selectorized', 'leg-extension', 2.5, 'SS-LE', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-leg-extension', true, 0),
  ('life-fitness--ss-fly', 'life-fitness', 'Pectoral Fly/Rear Deltoid', 'Insignia Series', 'selectorized', 'butterfly', 2.5, 'SS-FLY', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-pectoral-fly-rear-deltoid', true, 0),
  ('life-fitness--ss-pd', 'life-fitness', 'Pulldown', 'Insignia Series', 'selectorized', 'lat-pulldown', 2.5, 'SS-PD', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-pulldown', true, 0),
  ('life-fitness--ss-rw', 'life-fitness', 'Row', 'Insignia Series', 'selectorized', 'seated-row', 2.5, 'SS-RW', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-row', true, 0),
  ('life-fitness--ss-slc', 'life-fitness', 'Seated Leg Curl', 'Insignia Series', 'selectorized', 'leg-curl-seated', 2.5, 'SS-SLC', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-seated-leg-curl', true, 0),
  ('life-fitness--ss-sp', 'life-fitness', 'Shoulder Press', 'Insignia Series', 'selectorized', 'shoulder-press', 2.5, 'SS-SP', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-shoulder-press', true, 0),
  ('life-fitness--ss-shb', 'life-fitness', 'Sit / Stand Hip Abductor', 'Insignia Series', 'selectorized', 'abductor', 2.5, 'SS-SHB', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-sit-stand-hip-abductor', true, 0),
  ('life-fitness--ss-tr', 'life-fitness', 'Torso Rotation', 'Insignia Series', 'selectorized', 'rotary-torso', 2.5, 'SS-TR', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-torso-rotation', true, 0),
  ('life-fitness--ss-te', 'life-fitness', 'Triceps Extension', 'Insignia Series', 'selectorized', 'triceps-press', 2.5, 'SS-TE', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-triceps-extension', true, 0),
  ('life-fitness--ss-tp', 'life-fitness', 'Triceps Press', 'Insignia Series', 'selectorized', 'triceps-press', 2.5, 'SS-TP', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/insignia-series-triceps-press', true, 0),
  ('life-fitness--op-ab', 'life-fitness', 'Abdominal', 'Axiom Series', 'selectorized', 'ab-crunch', 2.5, 'OP-AB', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-abdominal', true, 0),
  ('life-fitness--op-abba', 'life-fitness', 'Abdominal / Back Extension', 'Axiom Series', 'selectorized', 'ab-crunch', 2.5, 'OP-ABBA', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-abdominal-back-extension', true, 0),
  ('life-fitness--op-bc', 'life-fitness', 'Biceps Curl', 'Axiom Series', 'selectorized', 'biceps-curl-machine', 2.5, 'OP-BC', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-biceps-curl', true, 0),
  ('life-fitness--op-bt', 'life-fitness', 'Biceps / Triceps', 'Axiom Series', 'selectorized', 'biceps-curl-machine', 2.5, 'OP-BT', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-biceps-triceps', true, 0),
  ('life-fitness--op-cp', 'life-fitness', 'Chest Press', 'Axiom Series', 'selectorized', 'chest-press', 2.5, 'OP-CP', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-chest-press', true, 0),
  ('life-fitness--op-haa', 'life-fitness', 'Hip Abductor Adductor', 'Axiom Series', 'selectorized', 'abductor', 2.5, 'OP-HAA', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-hip-abductor-adductor', true, 0),
  ('life-fitness--op-pd', 'life-fitness', 'Lat Pulldown', 'Axiom Series', 'selectorized', 'lat-pulldown', 2.5, 'OP-PD', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-lat-pulldown', true, 0),
  ('life-fitness--op-lr', 'life-fitness', 'Lat Pulldown/Low Row', 'Axiom Series', 'selectorized', 'lat-pulldown', 2.5, 'OP-LR', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-lat-pulldown-low-row', true, 0),
  ('life-fitness--op-lc', 'life-fitness', 'Leg Curl', 'Axiom Series', 'selectorized', 'leg-curl-seated', 2.5, 'OP-LC', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-leg-curl', true, 0),
  ('life-fitness--op-le', 'life-fitness', 'Leg Extension', 'Axiom Series', 'selectorized', 'leg-extension', 2.5, 'OP-LE', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-leg-extension', true, 0),
  ('life-fitness--op-lce', 'life-fitness', 'Leg Extension / Leg Curl', 'Axiom Series', 'selectorized', 'leg-extension', 2.5, 'OP-LCE', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-leg-extension-leg-curl', true, 0),
  ('life-fitness--op-lp', 'life-fitness', 'Leg Press', 'Axiom Series', 'selectorized', 'leg-press', 2.5, 'OP-LP', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-leg-press', true, 0),
  ('life-fitness--op-mp', 'life-fitness', 'Multi-Press', 'Axiom Series', 'selectorized', 'chest-press', 2.5, 'OP-MP', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-multi-press', true, 0),
  ('life-fitness--op-fly', 'life-fitness', 'Pectoral Fly/Rear Deltoid', 'Axiom Series', 'selectorized', 'butterfly', 2.5, 'OP-FLY', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-pectoral-fly-rear-deltoid', true, 0),
  ('life-fitness--op-slce', 'life-fitness', 'Seated Leg Curl / Extension', 'Axiom Series', 'selectorized', 'leg-curl-seated', 2.5, 'OP-SLCE', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-seated-leg-curl-extension', true, 0),
  ('life-fitness--op-rw', 'life-fitness', 'Seated Row', 'Axiom Series', 'selectorized', 'seated-row', 2.5, 'OP-RW', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-seated-row', true, 0),
  ('life-fitness--op-sp', 'life-fitness', 'Shoulder Press', 'Axiom Series', 'selectorized', 'shoulder-press', 2.5, 'OP-SP', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-shoulder-press', true, 0),
  ('life-fitness--op-te', 'life-fitness', 'Triceps Extension', 'Axiom Series', 'selectorized', 'triceps-press', 2.5, 'OP-TE', 'https://www.lifefitness.com/en-us/catalog/strength-training/selectorized/axiom-series-triceps-extension', true, 0),
  ('matrix--mg-405', 'matrix', 'Reverse Back Extension', 'Magnum Plate Loaded', 'plate_loaded', 'back-extension', 2.5, 'MG-405', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-405-reverse-back-extension', true, 0),
  ('matrix--mg-pl12', 'matrix', 'Vertical Bench Press', 'Magnum Plate Loaded', 'plate_loaded', 'chest-press', 2.5, 'MG-PL12', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl12-vertical-bench-press', true, 0),
  ('matrix--mg-pl13', 'matrix', 'Supine Bench Press', 'Magnum Plate Loaded', 'plate_loaded', 'chest-press', 2.5, 'MG-PL13', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl13-supine-bench-press', true, 0),
  ('matrix--mg-pl14', 'matrix', 'Incline Bench Press', 'Magnum Plate Loaded', 'plate_loaded', 'incline-chest-press', 2.5, 'MG-PL14', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl14-incline-bench-press', true, 0),
  ('matrix--mg-pl15', 'matrix', 'Vertical Decline Bench Press', 'Magnum Plate Loaded', 'plate_loaded', 'decline-chest-press', 2.5, 'MG-PL15', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl15-vertical-decline-bench-press', true, 0),
  ('matrix--mg-pl21', 'matrix', 'Seated Lateral Raise', 'Magnum Plate Loaded', 'plate_loaded', 'lateral-raise-machine', 2.5, 'MG-PL21', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl21-seated-lateral-raise', true, 0),
  ('matrix--mg-pl22', 'matrix', 'Decline Pec Fly', 'Magnum Plate Loaded', 'plate_loaded', 'butterfly', 2.5, 'MG-PL22', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl22-decline-pec-fly', true, 0),
  ('matrix--mg-pl23', 'matrix', 'Shoulder Press', 'Magnum Plate Loaded', 'plate_loaded', 'shoulder-press', 2.5, 'MG-PL23', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl23-shoulder-press', true, 0),
  ('matrix--mg-pl33', 'matrix', 'Lat Pulldown', 'Magnum Plate Loaded', 'plate_loaded', 'lat-pulldown', 2.5, 'MG-PL33', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl33-lat-pulldown', true, 0),
  ('matrix--mg-pl34', 'matrix', 'Seated Row', 'Magnum Plate Loaded', 'plate_loaded', 'seated-row', 2.5, 'MG-PL34', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl34-seated-row', true, 0),
  ('matrix--mg-pl35', 'matrix', 'T-Bar Row', 'Magnum Plate Loaded', 'plate_loaded', 't-bar-row', 2.5, 'MG-PL35', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl35-tbar-row', true, 0),
  ('matrix--mg-pl36', 'matrix', 'Lever Row', 'Magnum Plate Loaded', 'plate_loaded', 'seated-row', 2.5, 'MG-PL36', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl36-lever-row', true, 0),
  ('matrix--mg-pl37', 'matrix', 'High Row', 'Magnum Plate Loaded', 'plate_loaded', 'high-row', 2.5, 'MG-PL37', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl37-high-row', true, 0),
  ('matrix--mg-pl38', 'matrix', 'Low Row', 'Magnum Plate Loaded', 'plate_loaded', 'seated-row', 2.5, 'MG-PL38', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl38-low-row', true, 0),
  ('matrix--mg-pl41', 'matrix', 'Elevated Biceps Curl', 'Magnum Plate Loaded', 'plate_loaded', 'biceps-curl-machine', 2.5, 'MG-PL41', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl41-elevated-biceps-curl', true, 0),
  ('matrix--mg-pl70', 'matrix', '45° Leg Press', 'Magnum Plate Loaded', 'plate_loaded', 'leg-press', 2.5, 'MG-PL70', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl70-45-degree-leg-press', true, 0),
  ('matrix--mg-pl71', 'matrix', 'Hack Squat', 'Magnum Plate Loaded', 'plate_loaded', 'hack-squat', 2.5, 'MG-PL71', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl71-hack-squat', true, 0),
  ('matrix--mg-pl72', 'matrix', 'Kneeling Leg Curl', 'Magnum Plate Loaded', 'plate_loaded', 'leg-curl-lying', 2.5, 'MG-PL72', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl72-kneeling-leg-curl', true, 0),
  ('matrix--mg-pl73', 'matrix', 'Reclining Leg Extension', 'Magnum Plate Loaded', 'plate_loaded', 'leg-extension', 2.5, 'MG-PL73', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl73-reclining-leg-extension', true, 0),
  ('matrix--mg-pl75', 'matrix', 'Standing Hip Abductor', 'Magnum Plate Loaded', 'plate_loaded', 'abductor', 2.5, 'MG-PL75', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl75-standing-hip-abductor', true, 0),
  ('matrix--mg-pl76', 'matrix', 'Standing Calf', 'Magnum Plate Loaded', 'plate_loaded', 'calf-raise', 2.5, 'MG-PL76', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl76-standing-calf', true, 0),
  ('matrix--mg-pl77', 'matrix', 'Seated Calf', 'Magnum Plate Loaded', 'plate_loaded', 'seated-calf-raise', 2.5, 'MG-PL77', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl77-seated-calf', true, 0),
  ('matrix--mg-pl78', 'matrix', 'Glute Trainer', 'Magnum Plate Loaded', 'plate_loaded', 'glute-machine', 2.5, 'MG-PL78', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl78-glute-trainer', true, 0),
  ('matrix--mg-pl79', 'matrix', 'Squat Lunge', 'Magnum Plate Loaded', 'plate_loaded', 'hack-squat', 2.5, 'MG-PL79', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl79-squat-lunge', true, 0),
  ('matrix--mg-pl80', 'matrix', 'Pendulum Squat', 'Magnum Plate Loaded', 'plate_loaded', 'pendulum-squat', 2.5, 'MG-PL80', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl80-pendulum-squat', true, 0),
  ('matrix--mg-pl81', 'matrix', 'Belt Squat', 'Magnum Plate Loaded', 'plate_loaded', 'belt-squat', 2.5, 'MG-PL81', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl81-belt-squat', true, 0),
  ('matrix--mg-pl82', 'matrix', 'Standing Hip Thrust', 'Magnum Plate Loaded', 'plate_loaded', 'hip-thrust', 2.5, 'MG-PL82', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-mg-pl82-standing-hip-thrust', true, 0),
  ('matrix--vy-400', 'matrix', 'Perfect Squat', 'Varsity Plate Loaded', 'plate_loaded', 'hack-squat', 2.5, 'VY-400', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-vy-400-perfect-squat', true, 0),
  ('matrix--vy-401', 'matrix', 'Leg Extension', 'Varsity Plate Loaded', 'plate_loaded', 'leg-extension', 2.5, 'VY-401', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-vy-401-leg-extension', true, 0),
  ('matrix--vy-402', 'matrix', 'Prone Leg Curl', 'Varsity Plate Loaded', 'plate_loaded', 'leg-curl-lying', 2.5, 'VY-402', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-vy-402-prone-leg-curl', true, 0),
  ('matrix--vy-431', 'matrix', 'Biceps Curl', 'Varsity Plate Loaded', 'plate_loaded', 'biceps-curl-machine', 2.5, 'VY-431', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-vy-431-biceps-curl', true, 0),
  ('matrix--vy-432', 'matrix', 'Triceps Extension', 'Varsity Plate Loaded', 'plate_loaded', 'triceps-press', 2.5, 'VY-432', 'https://us.matrixfitness.com/eng/strength/plate-loaded/us-vy-432-triceps-extension', true, 0),
  ('matrix--g3-s10', 'matrix', 'Chest Press', 'Aura', 'selectorized', 'chest-press', 2.5, 'G3-S10', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s10-chest-press', true, 0),
  ('matrix--g3-s12', 'matrix', 'Pectoral Fly', 'Aura', 'selectorized', 'butterfly', 2.5, 'G3-S12', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s12-pectoral-fly', true, 0),
  ('matrix--g3-s13', 'matrix', 'Converging Chest Press', 'Aura', 'selectorized', 'chest-press', 2.5, 'G3-S13', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s13-converging-chest-press', true, 0),
  ('matrix--g3-s20', 'matrix', 'Shoulder Press', 'Aura', 'selectorized', 'shoulder-press', 2.5, 'G3-S20', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s20-shoulder-press', true, 0),
  ('matrix--g3-s21', 'matrix', 'Lateral Raise', 'Aura', 'selectorized', 'lateral-raise-machine', 2.5, 'G3-S21', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s21-lateral-raise', true, 0),
  ('matrix--g3-s22', 'matrix', 'Rear Delt Fly', 'Aura', 'selectorized', 'reverse-fly', 2.5, 'G3-S22', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s22-rear-delt-fly', true, 0),
  ('matrix--g3-s23', 'matrix', 'Converging Shoulder Press', 'Aura', 'selectorized', 'shoulder-press', 2.5, 'G3-S23', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s23-converging-shoulder-press', true, 0),
  ('matrix--g3-s30', 'matrix', 'Lat Pulldown', 'Aura', 'selectorized', 'lat-pulldown', 2.5, 'G3-S30', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s30-lat-pulldown', true, 0),
  ('matrix--g3-s31', 'matrix', 'Seated Row', 'Aura', 'selectorized', 'seated-row', 2.5, 'G3-S31', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s31-seated-row', true, 0),
  ('matrix--g3-s33', 'matrix', 'Diverging Lat Pulldown', 'Aura', 'selectorized', 'lat-pulldown', 2.5, 'G3-S33', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s33-diverging-lat-pulldown', true, 0),
  ('matrix--g3-s34', 'matrix', 'Diverging Seated Row', 'Aura', 'selectorized', 'seated-row', 2.5, 'G3-S34', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s34-diverging-seated-row', true, 0),
  ('matrix--g3-s40', 'matrix', 'Arm Curl', 'Aura', 'selectorized', 'biceps-curl-machine', 2.5, 'G3-S40', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s40-arm-curl', true, 0),
  ('matrix--g3-s42', 'matrix', 'Triceps Press', 'Aura', 'selectorized', 'triceps-press', 2.5, 'G3-S42', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s42-triceps-press', true, 0),
  ('matrix--g3-s45', 'matrix', 'Triceps Extension', 'Aura', 'selectorized', 'triceps-press', 2.5, 'G3-S45', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s45-triceps-extension', true, 0),
  ('matrix--g3-s51', 'matrix', 'Abdominal Crunch', 'Aura', 'selectorized', 'ab-crunch', 2.5, 'G3-S51', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s51-abdominal-crunch', true, 0),
  ('matrix--g3-s52', 'matrix', 'Back Extension', 'Aura', 'selectorized', 'back-extension', 2.5, 'G3-S52', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s52-back-extension', true, 0),
  ('matrix--g3-s55', 'matrix', 'Rotary Torso', 'Aura', 'selectorized', 'rotary-torso', 2.5, 'G3-S55', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s55-rotary-torso', true, 0),
  ('matrix--g3-s60', 'matrix', 'Dip Chin Assist', 'Aura', 'selectorized', 'assisted-pullup', 2.5, 'G3-S60', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s60-dip-chin-assist', true, 0),
  ('matrix--g3-s70', 'matrix', 'Leg Press', 'Aura', 'selectorized', 'leg-press', 2.5, 'G3-S70', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s70-leg-press', true, 0),
  ('matrix--g3-s71', 'matrix', 'Leg Extension', 'Aura', 'selectorized', 'leg-extension', 2.5, 'G3-S71', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s71-leg-extension', true, 0),
  ('matrix--g3-s72', 'matrix', 'Seated Leg Curl', 'Aura', 'selectorized', 'leg-curl-seated', 2.5, 'G3-S72', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s72-seated-leg-curl', true, 0),
  ('matrix--g3-s73', 'matrix', 'Prone Leg Curl', 'Aura', 'selectorized', 'leg-curl-lying', 2.5, 'G3-S73', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s73-prone-leg-curl', true, 0),
  ('matrix--g3-s74', 'matrix', 'Hip Adductor', 'Aura', 'selectorized', 'adductor', 2.5, 'G3-S74', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s74-hip-adductor', true, 0),
  ('matrix--g3-s75', 'matrix', 'Hip Abductor', 'Aura', 'selectorized', 'abductor', 2.5, 'G3-S75', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s75-hip-abductor', true, 0),
  ('matrix--g3-s77', 'matrix', 'Calf Press', 'Aura', 'selectorized', 'calf-raise', 2.5, 'G3-S77', 'https://us.matrixfitness.com/eng/strength/single-station/us-g3-s77-calf-press', true, 0),
  ('matrix--g7-s13', 'matrix', 'Converging Chest Press', 'Ultra', 'selectorized', 'chest-press', 2.5, 'G7-S13', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s13-converging-chest-press', true, 0),
  ('matrix--g7-s21', 'matrix', 'Lateral Raise', 'Ultra', 'selectorized', 'lateral-raise-machine', 2.5, 'G7-S21', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s21-lateral-raise', true, 0),
  ('matrix--g7-s22', 'matrix', 'Pectoral Fly', 'Ultra', 'selectorized', 'butterfly', 2.5, 'G7-S22', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s22-pectoral-fly', true, 0),
  ('matrix--g7-s23', 'matrix', 'Converging Shoulder Press', 'Ultra', 'selectorized', 'shoulder-press', 2.5, 'G7-S23', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s23-converging-shoulder-press', true, 0),
  ('matrix--g7-s33', 'matrix', 'Diverging Lat Pulldown', 'Ultra', 'selectorized', 'lat-pulldown', 2.5, 'G7-S33', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s33-diverging-lat-pulldown', true, 0),
  ('matrix--g7-s34', 'matrix', 'Diverging Seated Row', 'Ultra', 'selectorized', 'seated-row', 2.5, 'G7-S34', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s34-diverging-seated-row', true, 0),
  ('matrix--g7-s40', 'matrix', 'Independent Biceps Curl', 'Ultra', 'selectorized', 'biceps-curl-machine', 2.5, 'G7-S40', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s40-independent-biceps-curl', true, 0),
  ('matrix--g7-s41', 'matrix', 'Dependent Arm Curl', 'Ultra', 'selectorized', 'biceps-curl-machine', 2.5, 'G7-S41', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s41-dependent-arm-curl', true, 0),
  ('matrix--g7-s42', 'matrix', 'Triceps Press', 'Ultra', 'selectorized', 'triceps-press', 2.5, 'G7-S42', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s42-triceps-press', true, 0),
  ('matrix--g7-s45', 'matrix', 'Triceps Extension', 'Ultra', 'selectorized', 'triceps-press', 2.5, 'G7-S45', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s45-triceps-extension', true, 0),
  ('matrix--g7-s51', 'matrix', 'Abdominal Crunch', 'Ultra', 'selectorized', 'ab-crunch', 2.5, 'G7-S51', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s51-abdominal-crunch', true, 0),
  ('matrix--g7-s52', 'matrix', 'Back Extension', 'Ultra', 'selectorized', 'back-extension', 2.5, 'G7-S52', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s52-back-extension', true, 0),
  ('matrix--g7-s55', 'matrix', 'Rotary Torso', 'Ultra', 'selectorized', 'rotary-torso', 2.5, 'G7-S55', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s55-rotary-torso', true, 0),
  ('matrix--g7-s70', 'matrix', 'Leg Press', 'Ultra', 'selectorized', 'leg-press', 2.5, 'G7-S70', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s70-leg-press', true, 0),
  ('matrix--g7-s71', 'matrix', 'Leg Extension', 'Ultra', 'selectorized', 'leg-extension', 2.5, 'G7-S71', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s71-leg-extension', true, 0),
  ('matrix--g7-s72', 'matrix', 'Seated Leg Curl', 'Ultra', 'selectorized', 'leg-curl-seated', 2.5, 'G7-S72', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s72-seated-leg-curl', true, 0),
  ('matrix--g7-s73', 'matrix', 'Prone Leg Curl', 'Ultra', 'selectorized', 'leg-curl-lying', 2.5, 'G7-S73', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s73-prone-leg-curl', true, 0),
  ('matrix--g7-s74', 'matrix', 'Hip Adduction', 'Ultra', 'selectorized', 'adductor', 2.5, 'G7-S74', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s74-hip-adduction', true, 0),
  ('matrix--g7-s75', 'matrix', 'Hip Abduction', 'Ultra', 'selectorized', 'abductor', 2.5, 'G7-S75', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s75-hip-abduction', true, 0),
  ('matrix--g7-s77', 'matrix', 'Calf Extension', 'Ultra', 'selectorized', 'calf-raise', 2.5, 'G7-S77', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s77-calf-extension', true, 0),
  ('matrix--g7-s78', 'matrix', 'Glute', 'Ultra', 'selectorized', 'glute-machine', 2.5, 'G7-S78', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s78-glute', true, 0),
  ('matrix--g7-s79', 'matrix', 'Hip Thrust', 'Ultra', 'selectorized', 'hip-thrust', 2.5, 'G7-S79', 'https://us.matrixfitness.com/eng/strength/single-station/us-g7-s79-hip-thrust', true, 0),
  ('matrix--go-s13', 'matrix', 'Chest Press', 'Go', 'selectorized', 'chest-press', 2.5, 'GO-S13', 'https://us.matrixfitness.com/eng/strength/single-station/us-go-s13-chest-press', true, 0),
  ('matrix--go-s23', 'matrix', 'Shoulder Press', 'Go', 'selectorized', 'shoulder-press', 2.5, 'GO-S23', 'https://us.matrixfitness.com/eng/strength/single-station/us-go-s23-shoulder-press', true, 0),
  ('matrix--go-s33', 'matrix', 'Lat Pulldown', 'Go', 'selectorized', 'lat-pulldown', 2.5, 'GO-S33', 'https://us.matrixfitness.com/eng/strength/single-station/us-go-s33-lat-pulldown', true, 0),
  ('matrix--go-s34', 'matrix', 'Seated Row', 'Go', 'selectorized', 'seated-row', 2.5, 'GO-S34', 'https://us.matrixfitness.com/eng/strength/single-station/us-go-s34-seated-row', true, 0),
  ('matrix--go-s40', 'matrix', 'Biceps Curl', 'Go', 'selectorized', 'biceps-curl-machine', 2.5, 'GO-S40', 'https://us.matrixfitness.com/eng/strength/single-station/us-go-s40-biceps-curl', true, 0),
  ('matrix--go-s42', 'matrix', 'Seated Triceps Press', 'Go', 'selectorized', 'triceps-press', 2.5, 'GO-S42', 'https://us.matrixfitness.com/eng/strength/single-station/us-go-s42-seated-triceps-press', true, 0),
  ('matrix--go-s53', 'matrix', 'Abdominal', 'Go', 'selectorized', 'ab-crunch', 2.5, 'GO-S53', 'https://us.matrixfitness.com/eng/strength/single-station/us-go-s53-abdominal', true, 0),
  ('matrix--go-s70', 'matrix', 'Leg Press', 'Go', 'selectorized', 'leg-press', 2.5, 'GO-S70', 'https://us.matrixfitness.com/eng/strength/single-station/us-go-s70-leg-press', true, 0),
  ('matrix--go-s71', 'matrix', 'Leg Extension', 'Go', 'selectorized', 'leg-extension', 2.5, 'GO-S71', 'https://us.matrixfitness.com/eng/strength/single-station/us-go-s71-leg-extension', true, 0),
  ('matrix--go-s72', 'matrix', 'Seated Leg Curl', 'Go', 'selectorized', 'leg-curl-seated', 2.5, 'GO-S72', 'https://us.matrixfitness.com/eng/strength/single-station/us-go-s72-seated-leg-curl', true, 0),
  ('matrix--vs-s13', 'matrix', 'Converging Chest Press', 'Versa', 'selectorized', 'chest-press', 2.5, 'VS-S13', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s13-converging-chest-press', true, 0),
  ('matrix--vs-s131', 'matrix', 'Multi Press', 'Versa', 'selectorized', 'chest-press', 2.5, 'VS-S131', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s131-multi-press', true, 0),
  ('matrix--vs-s22', 'matrix', 'Pectoral Fly Rear Delt', 'Versa', 'selectorized', 'butterfly', 2.5, 'VS-S22', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s22-pectoral-fly-rear-delt', true, 0),
  ('matrix--vs-s23', 'matrix', 'Converging Shoulder Press', 'Versa', 'selectorized', 'shoulder-press', 2.5, 'VS-S23', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s23-converging-shoulder-press', true, 0),
  ('matrix--vs-s33', 'matrix', 'Diverging Lat Pulldown', 'Versa', 'selectorized', 'lat-pulldown', 2.5, 'VS-S33', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s33-diverging-lat-pulldown', true, 0),
  ('matrix--vs-s331', 'matrix', 'Lat Pulldown Seated Row', 'Versa', 'selectorized', 'lat-pulldown', 2.5, 'VS-S331', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s331-lat-pulldown-seated-row', true, 0),
  ('matrix--vs-s34', 'matrix', 'Diverging Seated Row', 'Versa', 'selectorized', 'seated-row', 2.5, 'VS-S34', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s34-diverging-seated-row', true, 0),
  ('matrix--vs-s40', 'matrix', 'Biceps Curl', 'Versa', 'selectorized', 'biceps-curl-machine', 2.5, 'VS-S40', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s40-biceps-curl', true, 0),
  ('matrix--vs-s401', 'matrix', 'Bicep Tricep', 'Versa', 'selectorized', 'biceps-curl-machine', 2.5, 'VS-S401', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s401-bicep-tricep', true, 0),
  ('matrix--vs-s42', 'matrix', 'Triceps Press', 'Versa', 'selectorized', 'triceps-press', 2.5, 'VS-S42', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s42-triceps-press', true, 0),
  ('matrix--vs-s52', 'matrix', 'Back Extension', 'Versa', 'selectorized', 'back-extension', 2.5, 'VS-S52', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s52-back-extension', true, 0),
  ('matrix--vs-s53', 'matrix', 'Abdominal', 'Versa', 'selectorized', 'ab-crunch', 2.5, 'VS-S53', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s53-abdominal', true, 0),
  ('matrix--vs-s531', 'matrix', 'Abdominal Back Extension', 'Versa', 'selectorized', 'ab-crunch', 2.5, 'VS-S531', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s531-abdominal-back-extension', true, 0),
  ('matrix--vs-s601', 'matrix', 'Chin Dip Assist', 'Versa', 'selectorized', 'assisted-pullup', 2.5, 'VS-S601', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s601-chin-dip-assist', true, 0),
  ('matrix--vs-s70', 'matrix', 'Leg Press Calf Press', 'Versa', 'selectorized', 'leg-press', 2.5, 'VS-S70', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s70-leg-press-calf-press', true, 0),
  ('matrix--vs-s71', 'matrix', 'Leg Extension', 'Versa', 'selectorized', 'leg-extension', 2.5, 'VS-S71', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s71-leg-extension', true, 0),
  ('matrix--vs-s711', 'matrix', 'Leg Extension Seated Leg Curl', 'Versa', 'selectorized', 'leg-extension', 2.5, 'VS-S711', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s711-leg-extension-seated-leg-curl', true, 0),
  ('matrix--vs-s72', 'matrix', 'Seated Leg Curl', 'Versa', 'selectorized', 'leg-curl-seated', 2.5, 'VS-S72', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s72-seated-leg-curl', true, 0),
  ('matrix--vs-s74', 'matrix', 'Hip Abductor Adductor', 'Versa', 'selectorized', 'abductor', 2.5, 'VS-S74', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s74-hip-abductor-adductor', true, 0),
  ('matrix--vs-s78', 'matrix', 'Glute', 'Versa', 'selectorized', 'glute-machine', 2.5, 'VS-S78', 'https://us.matrixfitness.com/eng/strength/single-station/us-vs-s78-glute', true, 0),
  ('technogym--selection-700--chest-press', 'technogym', 'Brustpresse', 'Selection 700', 'selectorized', 'chest-press', 2.5, null, null, null, 0),
  ('technogym--selection-700--incline-chest-press', 'technogym', 'Schrägbankpresse (Maschine)', 'Selection 700', 'selectorized', 'incline-chest-press', 2.5, null, null, null, 0),
  ('technogym--selection-700--butterfly', 'technogym', 'Butterfly', 'Selection 700', 'selectorized', 'butterfly', 2.5, null, null, null, 0),
  ('technogym--selection-700--reverse-fly', 'technogym', 'Reverse Butterfly', 'Selection 700', 'selectorized', 'reverse-fly', 2.5, null, null, null, 0),
  ('technogym--selection-700--shoulder-press', 'technogym', 'Schulterpresse', 'Selection 700', 'selectorized', 'shoulder-press', 2.5, null, null, null, 0),
  ('technogym--selection-700--lateral-raise-machine', 'technogym', 'Seitheben (Maschine)', 'Selection 700', 'selectorized', 'lateral-raise-machine', 2.5, null, null, null, 0),
  ('technogym--selection-700--lat-pulldown', 'technogym', 'Latzug', 'Selection 700', 'selectorized', 'lat-pulldown', 2.5, null, null, null, 0),
  ('technogym--selection-700--seated-row', 'technogym', 'Rudern sitzend (Maschine)', 'Selection 700', 'selectorized', 'seated-row', 2.5, null, null, null, 0),
  ('technogym--selection-700--pullover', 'technogym', 'Pullover (Maschine)', 'Selection 700', 'selectorized', 'pullover', 2.5, null, null, null, 0),
  ('technogym--selection-700--biceps-curl-machine', 'technogym', 'Bizepscurl (Maschine)', 'Selection 700', 'selectorized', 'biceps-curl-machine', 2.5, null, null, null, 0),
  ('technogym--selection-700--triceps-press', 'technogym', 'Trizepsdrücken (Maschine)', 'Selection 700', 'selectorized', 'triceps-press', 2.5, null, null, null, 0),
  ('technogym--selection-700--leg-press', 'technogym', 'Beinpresse', 'Selection 700', 'selectorized', 'leg-press', 2.5, null, null, null, 0),
  ('technogym--selection-700--leg-extension', 'technogym', 'Beinstrecker', 'Selection 700', 'selectorized', 'leg-extension', 2.5, null, null, null, 0),
  ('technogym--selection-700--leg-curl-seated', 'technogym', 'Beinbeuger sitzend', 'Selection 700', 'selectorized', 'leg-curl-seated', 2.5, null, null, null, 0),
  ('technogym--selection-700--leg-curl-lying', 'technogym', 'Beinbeuger liegend', 'Selection 700', 'selectorized', 'leg-curl-lying', 2.5, null, null, null, 0),
  ('technogym--selection-700--abductor', 'technogym', 'Abduktoren', 'Selection 700', 'selectorized', 'abductor', 2.5, null, null, null, 0),
  ('technogym--selection-700--adductor', 'technogym', 'Adduktoren', 'Selection 700', 'selectorized', 'adductor', 2.5, null, null, null, 0),
  ('technogym--selection-700--glute-machine', 'technogym', 'Gesäßmaschine', 'Selection 700', 'selectorized', 'glute-machine', 2.5, null, null, null, 0),
  ('technogym--selection-700--calf-raise', 'technogym', 'Wadenheben', 'Selection 700', 'selectorized', 'calf-raise', 2.5, null, null, null, 0),
  ('technogym--selection-700--back-extension', 'technogym', 'Rückenstrecker', 'Selection 700', 'selectorized', 'back-extension', 2.5, null, null, null, 0),
  ('technogym--selection-700--ab-crunch', 'technogym', 'Bauchmaschine', 'Selection 700', 'selectorized', 'ab-crunch', 2.5, null, null, null, 0),
  ('technogym--selection-700--rotary-torso', 'technogym', 'Rotationsmaschine', 'Selection 700', 'selectorized', 'rotary-torso', 2.5, null, null, null, 0),
  ('technogym--selection-700--assisted-pullup', 'technogym', 'Klimmzüge (unterstützt)', 'Selection 700', 'selectorized', 'assisted-pullup', 2.5, null, null, null, 0),
  ('technogym--selection-900--chest-press', 'technogym', 'Brustpresse', 'Selection 900', 'selectorized', 'chest-press', 2.5, null, null, null, 0),
  ('technogym--selection-900--butterfly', 'technogym', 'Butterfly', 'Selection 900', 'selectorized', 'butterfly', 2.5, null, null, null, 0),
  ('technogym--selection-900--reverse-fly', 'technogym', 'Reverse Butterfly', 'Selection 900', 'selectorized', 'reverse-fly', 2.5, null, null, null, 0),
  ('technogym--selection-900--shoulder-press', 'technogym', 'Schulterpresse', 'Selection 900', 'selectorized', 'shoulder-press', 2.5, null, null, null, 0),
  ('technogym--selection-900--lat-pulldown', 'technogym', 'Latzug', 'Selection 900', 'selectorized', 'lat-pulldown', 2.5, null, null, null, 0),
  ('technogym--selection-900--seated-row', 'technogym', 'Rudern sitzend (Maschine)', 'Selection 900', 'selectorized', 'seated-row', 2.5, null, null, null, 0),
  ('technogym--selection-900--biceps-curl-machine', 'technogym', 'Bizepscurl (Maschine)', 'Selection 900', 'selectorized', 'biceps-curl-machine', 2.5, null, null, null, 0),
  ('technogym--selection-900--triceps-press', 'technogym', 'Trizepsdrücken (Maschine)', 'Selection 900', 'selectorized', 'triceps-press', 2.5, null, null, null, 0),
  ('technogym--selection-900--leg-press', 'technogym', 'Beinpresse', 'Selection 900', 'selectorized', 'leg-press', 2.5, null, null, null, 0),
  ('technogym--selection-900--leg-extension', 'technogym', 'Beinstrecker', 'Selection 900', 'selectorized', 'leg-extension', 2.5, null, null, null, 0),
  ('technogym--selection-900--leg-curl-seated', 'technogym', 'Beinbeuger sitzend', 'Selection 900', 'selectorized', 'leg-curl-seated', 2.5, null, null, null, 0),
  ('technogym--selection-900--abductor', 'technogym', 'Abduktoren', 'Selection 900', 'selectorized', 'abductor', 2.5, null, null, null, 0),
  ('technogym--selection-900--adductor', 'technogym', 'Adduktoren', 'Selection 900', 'selectorized', 'adductor', 2.5, null, null, null, 0),
  ('technogym--selection-900--back-extension', 'technogym', 'Rückenstrecker', 'Selection 900', 'selectorized', 'back-extension', 2.5, null, null, null, 0),
  ('technogym--selection-900--ab-crunch', 'technogym', 'Bauchmaschine', 'Selection 900', 'selectorized', 'ab-crunch', 2.5, null, null, null, 0),
  ('technogym--pure-strength--chest-press', 'technogym', 'Brustpresse', 'Pure Strength', 'plate_loaded', 'chest-press', 2.5, null, null, null, 0),
  ('technogym--pure-strength--incline-chest-press', 'technogym', 'Schrägbankpresse (Maschine)', 'Pure Strength', 'plate_loaded', 'incline-chest-press', 2.5, null, null, null, 0),
  ('technogym--pure-strength--shoulder-press', 'technogym', 'Schulterpresse', 'Pure Strength', 'plate_loaded', 'shoulder-press', 2.5, null, null, null, 0),
  ('technogym--pure-strength--lat-pulldown', 'technogym', 'Latzug', 'Pure Strength', 'plate_loaded', 'lat-pulldown', 2.5, null, null, null, 0),
  ('technogym--pure-strength--seated-row', 'technogym', 'Rudern sitzend (Maschine)', 'Pure Strength', 'plate_loaded', 'seated-row', 2.5, null, null, null, 0),
  ('technogym--pure-strength--t-bar-row', 'technogym', 'T-Bar-Rudern', 'Pure Strength', 'plate_loaded', 't-bar-row', 2.5, null, null, null, 0),
  ('technogym--pure-strength--leg-press', 'technogym', 'Beinpresse', 'Pure Strength', 'plate_loaded', 'leg-press', 2.5, null, null, null, 0),
  ('technogym--pure-strength--hack-squat', 'technogym', 'Hackenschmidt', 'Pure Strength', 'plate_loaded', 'hack-squat', 2.5, null, null, null, 0),
  ('technogym--pure-strength--hip-thrust', 'technogym', 'Hip Thrust', 'Pure Strength', 'plate_loaded', 'hip-thrust', 2.5, null, null, null, 0),
  ('technogym--pure-strength--calf-raise', 'technogym', 'Wadenheben', 'Pure Strength', 'plate_loaded', 'calf-raise', 2.5, null, null, null, 0),
  ('precor--discovery--chest-press', 'precor', 'Brustpresse', 'Discovery', 'selectorized', 'chest-press', 2.5, null, null, null, 0),
  ('precor--discovery--incline-chest-press', 'precor', 'Schrägbankpresse (Maschine)', 'Discovery', 'selectorized', 'incline-chest-press', 2.5, null, null, null, 0),
  ('precor--discovery--butterfly', 'precor', 'Butterfly', 'Discovery', 'selectorized', 'butterfly', 2.5, null, null, null, 0),
  ('precor--discovery--reverse-fly', 'precor', 'Reverse Butterfly', 'Discovery', 'selectorized', 'reverse-fly', 2.5, null, null, null, 0),
  ('precor--discovery--shoulder-press', 'precor', 'Schulterpresse', 'Discovery', 'selectorized', 'shoulder-press', 2.5, null, null, null, 0),
  ('precor--discovery--lateral-raise-machine', 'precor', 'Seitheben (Maschine)', 'Discovery', 'selectorized', 'lateral-raise-machine', 2.5, null, null, null, 0),
  ('precor--discovery--lat-pulldown', 'precor', 'Latzug', 'Discovery', 'selectorized', 'lat-pulldown', 2.5, null, null, null, 0),
  ('precor--discovery--seated-row', 'precor', 'Rudern sitzend (Maschine)', 'Discovery', 'selectorized', 'seated-row', 2.5, null, null, null, 0),
  ('precor--discovery--pullover', 'precor', 'Pullover (Maschine)', 'Discovery', 'selectorized', 'pullover', 2.5, null, null, null, 0),
  ('precor--discovery--biceps-curl-machine', 'precor', 'Bizepscurl (Maschine)', 'Discovery', 'selectorized', 'biceps-curl-machine', 2.5, null, null, null, 0),
  ('precor--discovery--triceps-press', 'precor', 'Trizepsdrücken (Maschine)', 'Discovery', 'selectorized', 'triceps-press', 2.5, null, null, null, 0),
  ('precor--discovery--leg-press', 'precor', 'Beinpresse', 'Discovery', 'selectorized', 'leg-press', 2.5, null, null, null, 0),
  ('precor--discovery--leg-extension', 'precor', 'Beinstrecker', 'Discovery', 'selectorized', 'leg-extension', 2.5, null, null, null, 0),
  ('precor--discovery--leg-curl-seated', 'precor', 'Beinbeuger sitzend', 'Discovery', 'selectorized', 'leg-curl-seated', 2.5, null, null, null, 0),
  ('precor--discovery--leg-curl-lying', 'precor', 'Beinbeuger liegend', 'Discovery', 'selectorized', 'leg-curl-lying', 2.5, null, null, null, 0),
  ('precor--discovery--abductor', 'precor', 'Abduktoren', 'Discovery', 'selectorized', 'abductor', 2.5, null, null, null, 0),
  ('precor--discovery--adductor', 'precor', 'Adduktoren', 'Discovery', 'selectorized', 'adductor', 2.5, null, null, null, 0),
  ('precor--discovery--glute-machine', 'precor', 'Gesäßmaschine', 'Discovery', 'selectorized', 'glute-machine', 2.5, null, null, null, 0),
  ('precor--discovery--calf-raise', 'precor', 'Wadenheben', 'Discovery', 'selectorized', 'calf-raise', 2.5, null, null, null, 0),
  ('precor--discovery--back-extension', 'precor', 'Rückenstrecker', 'Discovery', 'selectorized', 'back-extension', 2.5, null, null, null, 0),
  ('precor--discovery--ab-crunch', 'precor', 'Bauchmaschine', 'Discovery', 'selectorized', 'ab-crunch', 2.5, null, null, null, 0),
  ('precor--discovery--rotary-torso', 'precor', 'Rotationsmaschine', 'Discovery', 'selectorized', 'rotary-torso', 2.5, null, null, null, 0),
  ('precor--discovery--assisted-pullup', 'precor', 'Klimmzüge (unterstützt)', 'Discovery', 'selectorized', 'assisted-pullup', 2.5, null, null, null, 0),
  ('precor--resolute--chest-press', 'precor', 'Brustpresse', 'Resolute', 'selectorized', 'chest-press', 2.5, null, null, null, 0),
  ('precor--resolute--butterfly', 'precor', 'Butterfly', 'Resolute', 'selectorized', 'butterfly', 2.5, null, null, null, 0),
  ('precor--resolute--reverse-fly', 'precor', 'Reverse Butterfly', 'Resolute', 'selectorized', 'reverse-fly', 2.5, null, null, null, 0),
  ('precor--resolute--shoulder-press', 'precor', 'Schulterpresse', 'Resolute', 'selectorized', 'shoulder-press', 2.5, null, null, null, 0),
  ('precor--resolute--lat-pulldown', 'precor', 'Latzug', 'Resolute', 'selectorized', 'lat-pulldown', 2.5, null, null, null, 0),
  ('precor--resolute--seated-row', 'precor', 'Rudern sitzend (Maschine)', 'Resolute', 'selectorized', 'seated-row', 2.5, null, null, null, 0),
  ('precor--resolute--biceps-curl-machine', 'precor', 'Bizepscurl (Maschine)', 'Resolute', 'selectorized', 'biceps-curl-machine', 2.5, null, null, null, 0),
  ('precor--resolute--triceps-press', 'precor', 'Trizepsdrücken (Maschine)', 'Resolute', 'selectorized', 'triceps-press', 2.5, null, null, null, 0),
  ('precor--resolute--leg-press', 'precor', 'Beinpresse', 'Resolute', 'selectorized', 'leg-press', 2.5, null, null, null, 0),
  ('precor--resolute--leg-extension', 'precor', 'Beinstrecker', 'Resolute', 'selectorized', 'leg-extension', 2.5, null, null, null, 0),
  ('precor--resolute--leg-curl-seated', 'precor', 'Beinbeuger sitzend', 'Resolute', 'selectorized', 'leg-curl-seated', 2.5, null, null, null, 0),
  ('precor--resolute--abductor', 'precor', 'Abduktoren', 'Resolute', 'selectorized', 'abductor', 2.5, null, null, null, 0),
  ('precor--resolute--adductor', 'precor', 'Adduktoren', 'Resolute', 'selectorized', 'adductor', 2.5, null, null, null, 0),
  ('precor--resolute--back-extension', 'precor', 'Rückenstrecker', 'Resolute', 'selectorized', 'back-extension', 2.5, null, null, null, 0),
  ('precor--resolute--ab-crunch', 'precor', 'Bauchmaschine', 'Resolute', 'selectorized', 'ab-crunch', 2.5, null, null, null, 0),
  ('gym80--sygnum--chest-press', 'gym80', 'Brustpresse', 'Sygnum', 'selectorized', 'chest-press', 2.5, null, null, null, 0),
  ('gym80--sygnum--incline-chest-press', 'gym80', 'Schrägbankpresse (Maschine)', 'Sygnum', 'selectorized', 'incline-chest-press', 2.5, null, null, null, 0),
  ('gym80--sygnum--butterfly', 'gym80', 'Butterfly', 'Sygnum', 'selectorized', 'butterfly', 2.5, null, null, null, 0),
  ('gym80--sygnum--reverse-fly', 'gym80', 'Reverse Butterfly', 'Sygnum', 'selectorized', 'reverse-fly', 2.5, null, null, null, 0),
  ('gym80--sygnum--shoulder-press', 'gym80', 'Schulterpresse', 'Sygnum', 'selectorized', 'shoulder-press', 2.5, null, null, null, 0),
  ('gym80--sygnum--lateral-raise-machine', 'gym80', 'Seitheben (Maschine)', 'Sygnum', 'selectorized', 'lateral-raise-machine', 2.5, null, null, null, 0),
  ('gym80--sygnum--lat-pulldown', 'gym80', 'Latzug', 'Sygnum', 'selectorized', 'lat-pulldown', 2.5, null, null, null, 0),
  ('gym80--sygnum--seated-row', 'gym80', 'Rudern sitzend (Maschine)', 'Sygnum', 'selectorized', 'seated-row', 2.5, null, null, null, 0),
  ('gym80--sygnum--pullover', 'gym80', 'Pullover (Maschine)', 'Sygnum', 'selectorized', 'pullover', 2.5, null, null, null, 0),
  ('gym80--sygnum--biceps-curl-machine', 'gym80', 'Bizepscurl (Maschine)', 'Sygnum', 'selectorized', 'biceps-curl-machine', 2.5, null, null, null, 0),
  ('gym80--sygnum--triceps-press', 'gym80', 'Trizepsdrücken (Maschine)', 'Sygnum', 'selectorized', 'triceps-press', 2.5, null, null, null, 0),
  ('gym80--sygnum--leg-press', 'gym80', 'Beinpresse', 'Sygnum', 'selectorized', 'leg-press', 2.5, null, null, null, 0),
  ('gym80--sygnum--leg-extension', 'gym80', 'Beinstrecker', 'Sygnum', 'selectorized', 'leg-extension', 2.5, null, null, null, 0),
  ('gym80--sygnum--leg-curl-seated', 'gym80', 'Beinbeuger sitzend', 'Sygnum', 'selectorized', 'leg-curl-seated', 2.5, null, null, null, 0),
  ('gym80--sygnum--leg-curl-lying', 'gym80', 'Beinbeuger liegend', 'Sygnum', 'selectorized', 'leg-curl-lying', 2.5, null, null, null, 0),
  ('gym80--sygnum--abductor', 'gym80', 'Abduktoren', 'Sygnum', 'selectorized', 'abductor', 2.5, null, null, null, 0),
  ('gym80--sygnum--adductor', 'gym80', 'Adduktoren', 'Sygnum', 'selectorized', 'adductor', 2.5, null, null, null, 0),
  ('gym80--sygnum--glute-machine', 'gym80', 'Gesäßmaschine', 'Sygnum', 'selectorized', 'glute-machine', 2.5, null, null, null, 0),
  ('gym80--sygnum--calf-raise', 'gym80', 'Wadenheben', 'Sygnum', 'selectorized', 'calf-raise', 2.5, null, null, null, 0),
  ('gym80--sygnum--back-extension', 'gym80', 'Rückenstrecker', 'Sygnum', 'selectorized', 'back-extension', 2.5, null, null, null, 0),
  ('gym80--sygnum--ab-crunch', 'gym80', 'Bauchmaschine', 'Sygnum', 'selectorized', 'ab-crunch', 2.5, null, null, null, 0),
  ('gym80--sygnum--rotary-torso', 'gym80', 'Rotationsmaschine', 'Sygnum', 'selectorized', 'rotary-torso', 2.5, null, null, null, 0),
  ('gym80--sygnum--assisted-pullup', 'gym80', 'Klimmzüge (unterstützt)', 'Sygnum', 'selectorized', 'assisted-pullup', 2.5, null, null, null, 0),
  ('gym80--pure-kraft--chest-press', 'gym80', 'Brustpresse', 'Pure Kraft', 'plate_loaded', 'chest-press', 2.5, null, null, null, 0),
  ('gym80--pure-kraft--incline-chest-press', 'gym80', 'Schrägbankpresse (Maschine)', 'Pure Kraft', 'plate_loaded', 'incline-chest-press', 2.5, null, null, null, 0),
  ('gym80--pure-kraft--shoulder-press', 'gym80', 'Schulterpresse', 'Pure Kraft', 'plate_loaded', 'shoulder-press', 2.5, null, null, null, 0),
  ('gym80--pure-kraft--lat-pulldown', 'gym80', 'Latzug', 'Pure Kraft', 'plate_loaded', 'lat-pulldown', 2.5, null, null, null, 0),
  ('gym80--pure-kraft--seated-row', 'gym80', 'Rudern sitzend (Maschine)', 'Pure Kraft', 'plate_loaded', 'seated-row', 2.5, null, null, null, 0),
  ('gym80--pure-kraft--t-bar-row', 'gym80', 'T-Bar-Rudern', 'Pure Kraft', 'plate_loaded', 't-bar-row', 2.5, null, null, null, 0),
  ('gym80--pure-kraft--leg-press', 'gym80', 'Beinpresse', 'Pure Kraft', 'plate_loaded', 'leg-press', 2.5, null, null, null, 0),
  ('gym80--pure-kraft--hack-squat', 'gym80', 'Hackenschmidt', 'Pure Kraft', 'plate_loaded', 'hack-squat', 2.5, null, null, null, 0),
  ('gym80--pure-kraft--hip-thrust', 'gym80', 'Hip Thrust', 'Pure Kraft', 'plate_loaded', 'hip-thrust', 2.5, null, null, null, 0),
  ('gym80--pure-kraft--calf-raise', 'gym80', 'Wadenheben', 'Pure Kraft', 'plate_loaded', 'calf-raise', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--chest-press', 'cybex', 'Brustpresse', 'Eagle NX', 'selectorized', 'chest-press', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--incline-chest-press', 'cybex', 'Schrägbankpresse (Maschine)', 'Eagle NX', 'selectorized', 'incline-chest-press', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--butterfly', 'cybex', 'Butterfly', 'Eagle NX', 'selectorized', 'butterfly', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--reverse-fly', 'cybex', 'Reverse Butterfly', 'Eagle NX', 'selectorized', 'reverse-fly', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--shoulder-press', 'cybex', 'Schulterpresse', 'Eagle NX', 'selectorized', 'shoulder-press', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--lateral-raise-machine', 'cybex', 'Seitheben (Maschine)', 'Eagle NX', 'selectorized', 'lateral-raise-machine', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--lat-pulldown', 'cybex', 'Latzug', 'Eagle NX', 'selectorized', 'lat-pulldown', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--seated-row', 'cybex', 'Rudern sitzend (Maschine)', 'Eagle NX', 'selectorized', 'seated-row', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--pullover', 'cybex', 'Pullover (Maschine)', 'Eagle NX', 'selectorized', 'pullover', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--biceps-curl-machine', 'cybex', 'Bizepscurl (Maschine)', 'Eagle NX', 'selectorized', 'biceps-curl-machine', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--triceps-press', 'cybex', 'Trizepsdrücken (Maschine)', 'Eagle NX', 'selectorized', 'triceps-press', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--leg-press', 'cybex', 'Beinpresse', 'Eagle NX', 'selectorized', 'leg-press', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--leg-extension', 'cybex', 'Beinstrecker', 'Eagle NX', 'selectorized', 'leg-extension', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--leg-curl-seated', 'cybex', 'Beinbeuger sitzend', 'Eagle NX', 'selectorized', 'leg-curl-seated', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--leg-curl-lying', 'cybex', 'Beinbeuger liegend', 'Eagle NX', 'selectorized', 'leg-curl-lying', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--abductor', 'cybex', 'Abduktoren', 'Eagle NX', 'selectorized', 'abductor', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--adductor', 'cybex', 'Adduktoren', 'Eagle NX', 'selectorized', 'adductor', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--glute-machine', 'cybex', 'Gesäßmaschine', 'Eagle NX', 'selectorized', 'glute-machine', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--calf-raise', 'cybex', 'Wadenheben', 'Eagle NX', 'selectorized', 'calf-raise', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--back-extension', 'cybex', 'Rückenstrecker', 'Eagle NX', 'selectorized', 'back-extension', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--ab-crunch', 'cybex', 'Bauchmaschine', 'Eagle NX', 'selectorized', 'ab-crunch', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--rotary-torso', 'cybex', 'Rotationsmaschine', 'Eagle NX', 'selectorized', 'rotary-torso', 2.5, null, null, null, 0),
  ('cybex--eagle-nx--assisted-pullup', 'cybex', 'Klimmzüge (unterstützt)', 'Eagle NX', 'selectorized', 'assisted-pullup', 2.5, null, null, null, 0),
  ('cybex--prestige--chest-press', 'cybex', 'Brustpresse', 'Prestige', 'selectorized', 'chest-press', 2.5, null, null, null, 0),
  ('cybex--prestige--butterfly', 'cybex', 'Butterfly', 'Prestige', 'selectorized', 'butterfly', 2.5, null, null, null, 0),
  ('cybex--prestige--reverse-fly', 'cybex', 'Reverse Butterfly', 'Prestige', 'selectorized', 'reverse-fly', 2.5, null, null, null, 0),
  ('cybex--prestige--shoulder-press', 'cybex', 'Schulterpresse', 'Prestige', 'selectorized', 'shoulder-press', 2.5, null, null, null, 0),
  ('cybex--prestige--lat-pulldown', 'cybex', 'Latzug', 'Prestige', 'selectorized', 'lat-pulldown', 2.5, null, null, null, 0),
  ('cybex--prestige--seated-row', 'cybex', 'Rudern sitzend (Maschine)', 'Prestige', 'selectorized', 'seated-row', 2.5, null, null, null, 0),
  ('cybex--prestige--biceps-curl-machine', 'cybex', 'Bizepscurl (Maschine)', 'Prestige', 'selectorized', 'biceps-curl-machine', 2.5, null, null, null, 0),
  ('cybex--prestige--triceps-press', 'cybex', 'Trizepsdrücken (Maschine)', 'Prestige', 'selectorized', 'triceps-press', 2.5, null, null, null, 0),
  ('cybex--prestige--leg-press', 'cybex', 'Beinpresse', 'Prestige', 'selectorized', 'leg-press', 2.5, null, null, null, 0),
  ('cybex--prestige--leg-extension', 'cybex', 'Beinstrecker', 'Prestige', 'selectorized', 'leg-extension', 2.5, null, null, null, 0),
  ('cybex--prestige--leg-curl-seated', 'cybex', 'Beinbeuger sitzend', 'Prestige', 'selectorized', 'leg-curl-seated', 2.5, null, null, null, 0),
  ('cybex--prestige--abductor', 'cybex', 'Abduktoren', 'Prestige', 'selectorized', 'abductor', 2.5, null, null, null, 0),
  ('cybex--prestige--adductor', 'cybex', 'Adduktoren', 'Prestige', 'selectorized', 'adductor', 2.5, null, null, null, 0),
  ('cybex--prestige--back-extension', 'cybex', 'Rückenstrecker', 'Prestige', 'selectorized', 'back-extension', 2.5, null, null, null, 0),
  ('cybex--prestige--ab-crunch', 'cybex', 'Bauchmaschine', 'Prestige', 'selectorized', 'ab-crunch', 2.5, null, null, null, 0),
  ('egym--smart-strength--chest-press', 'egym', 'Brustpresse', 'Smart Strength', 'selectorized', 'chest-press', 1, null, null, null, 0),
  ('egym--smart-strength--butterfly', 'egym', 'Butterfly', 'Smart Strength', 'selectorized', 'butterfly', 1, null, null, null, 0),
  ('egym--smart-strength--reverse-fly', 'egym', 'Reverse Butterfly', 'Smart Strength', 'selectorized', 'reverse-fly', 1, null, null, null, 0),
  ('egym--smart-strength--shoulder-press', 'egym', 'Schulterpresse', 'Smart Strength', 'selectorized', 'shoulder-press', 1, null, null, null, 0),
  ('egym--smart-strength--lat-pulldown', 'egym', 'Latzug', 'Smart Strength', 'selectorized', 'lat-pulldown', 1, null, null, null, 0),
  ('egym--smart-strength--seated-row', 'egym', 'Rudern sitzend (Maschine)', 'Smart Strength', 'selectorized', 'seated-row', 1, null, null, null, 0),
  ('egym--smart-strength--biceps-curl-machine', 'egym', 'Bizepscurl (Maschine)', 'Smart Strength', 'selectorized', 'biceps-curl-machine', 1, null, null, null, 0),
  ('egym--smart-strength--triceps-press', 'egym', 'Trizepsdrücken (Maschine)', 'Smart Strength', 'selectorized', 'triceps-press', 1, null, null, null, 0),
  ('egym--smart-strength--leg-press', 'egym', 'Beinpresse', 'Smart Strength', 'selectorized', 'leg-press', 1, null, null, null, 0),
  ('egym--smart-strength--leg-extension', 'egym', 'Beinstrecker', 'Smart Strength', 'selectorized', 'leg-extension', 1, null, null, null, 0),
  ('egym--smart-strength--leg-curl-seated', 'egym', 'Beinbeuger sitzend', 'Smart Strength', 'selectorized', 'leg-curl-seated', 1, null, null, null, 0),
  ('egym--smart-strength--abductor', 'egym', 'Abduktoren', 'Smart Strength', 'selectorized', 'abductor', 1, null, null, null, 0),
  ('egym--smart-strength--adductor', 'egym', 'Adduktoren', 'Smart Strength', 'selectorized', 'adductor', 1, null, null, null, 0),
  ('egym--smart-strength--back-extension', 'egym', 'Rückenstrecker', 'Smart Strength', 'selectorized', 'back-extension', 1, null, null, null, 0),
  ('egym--smart-strength--ab-crunch', 'egym', 'Bauchmaschine', 'Smart Strength', 'selectorized', 'ab-crunch', 1, null, null, null, 0),
  ('panatta--fit-evo--chest-press', 'panatta', 'Brustpresse', 'Fit Evo', 'selectorized', 'chest-press', 2.5, null, null, null, 0),
  ('panatta--fit-evo--incline-chest-press', 'panatta', 'Schrägbankpresse (Maschine)', 'Fit Evo', 'selectorized', 'incline-chest-press', 2.5, null, null, null, 0),
  ('panatta--fit-evo--butterfly', 'panatta', 'Butterfly', 'Fit Evo', 'selectorized', 'butterfly', 2.5, null, null, null, 0),
  ('panatta--fit-evo--reverse-fly', 'panatta', 'Reverse Butterfly', 'Fit Evo', 'selectorized', 'reverse-fly', 2.5, null, null, null, 0),
  ('panatta--fit-evo--shoulder-press', 'panatta', 'Schulterpresse', 'Fit Evo', 'selectorized', 'shoulder-press', 2.5, null, null, null, 0),
  ('panatta--fit-evo--lateral-raise-machine', 'panatta', 'Seitheben (Maschine)', 'Fit Evo', 'selectorized', 'lateral-raise-machine', 2.5, null, null, null, 0),
  ('panatta--fit-evo--lat-pulldown', 'panatta', 'Latzug', 'Fit Evo', 'selectorized', 'lat-pulldown', 2.5, null, null, null, 0),
  ('panatta--fit-evo--seated-row', 'panatta', 'Rudern sitzend (Maschine)', 'Fit Evo', 'selectorized', 'seated-row', 2.5, null, null, null, 0),
  ('panatta--fit-evo--pullover', 'panatta', 'Pullover (Maschine)', 'Fit Evo', 'selectorized', 'pullover', 2.5, null, null, null, 0),
  ('panatta--fit-evo--biceps-curl-machine', 'panatta', 'Bizepscurl (Maschine)', 'Fit Evo', 'selectorized', 'biceps-curl-machine', 2.5, null, null, null, 0),
  ('panatta--fit-evo--triceps-press', 'panatta', 'Trizepsdrücken (Maschine)', 'Fit Evo', 'selectorized', 'triceps-press', 2.5, null, null, null, 0),
  ('panatta--fit-evo--leg-press', 'panatta', 'Beinpresse', 'Fit Evo', 'selectorized', 'leg-press', 2.5, null, null, null, 0),
  ('panatta--fit-evo--leg-extension', 'panatta', 'Beinstrecker', 'Fit Evo', 'selectorized', 'leg-extension', 2.5, null, null, null, 0),
  ('panatta--fit-evo--leg-curl-seated', 'panatta', 'Beinbeuger sitzend', 'Fit Evo', 'selectorized', 'leg-curl-seated', 2.5, null, null, null, 0),
  ('panatta--fit-evo--leg-curl-lying', 'panatta', 'Beinbeuger liegend', 'Fit Evo', 'selectorized', 'leg-curl-lying', 2.5, null, null, null, 0),
  ('panatta--fit-evo--abductor', 'panatta', 'Abduktoren', 'Fit Evo', 'selectorized', 'abductor', 2.5, null, null, null, 0),
  ('panatta--fit-evo--adductor', 'panatta', 'Adduktoren', 'Fit Evo', 'selectorized', 'adductor', 2.5, null, null, null, 0),
  ('panatta--fit-evo--glute-machine', 'panatta', 'Gesäßmaschine', 'Fit Evo', 'selectorized', 'glute-machine', 2.5, null, null, null, 0),
  ('panatta--fit-evo--calf-raise', 'panatta', 'Wadenheben', 'Fit Evo', 'selectorized', 'calf-raise', 2.5, null, null, null, 0),
  ('panatta--fit-evo--back-extension', 'panatta', 'Rückenstrecker', 'Fit Evo', 'selectorized', 'back-extension', 2.5, null, null, null, 0),
  ('panatta--fit-evo--ab-crunch', 'panatta', 'Bauchmaschine', 'Fit Evo', 'selectorized', 'ab-crunch', 2.5, null, null, null, 0),
  ('panatta--fit-evo--rotary-torso', 'panatta', 'Rotationsmaschine', 'Fit Evo', 'selectorized', 'rotary-torso', 2.5, null, null, null, 0),
  ('panatta--fit-evo--assisted-pullup', 'panatta', 'Klimmzüge (unterstützt)', 'Fit Evo', 'selectorized', 'assisted-pullup', 2.5, null, null, null, 0),
  ('panatta--monolith--chest-press', 'panatta', 'Brustpresse', 'Monolith', 'selectorized', 'chest-press', 2.5, null, null, null, 0),
  ('panatta--monolith--butterfly', 'panatta', 'Butterfly', 'Monolith', 'selectorized', 'butterfly', 2.5, null, null, null, 0),
  ('panatta--monolith--reverse-fly', 'panatta', 'Reverse Butterfly', 'Monolith', 'selectorized', 'reverse-fly', 2.5, null, null, null, 0),
  ('panatta--monolith--shoulder-press', 'panatta', 'Schulterpresse', 'Monolith', 'selectorized', 'shoulder-press', 2.5, null, null, null, 0),
  ('panatta--monolith--lat-pulldown', 'panatta', 'Latzug', 'Monolith', 'selectorized', 'lat-pulldown', 2.5, null, null, null, 0),
  ('panatta--monolith--seated-row', 'panatta', 'Rudern sitzend (Maschine)', 'Monolith', 'selectorized', 'seated-row', 2.5, null, null, null, 0),
  ('panatta--monolith--biceps-curl-machine', 'panatta', 'Bizepscurl (Maschine)', 'Monolith', 'selectorized', 'biceps-curl-machine', 2.5, null, null, null, 0),
  ('panatta--monolith--triceps-press', 'panatta', 'Trizepsdrücken (Maschine)', 'Monolith', 'selectorized', 'triceps-press', 2.5, null, null, null, 0),
  ('panatta--monolith--leg-press', 'panatta', 'Beinpresse', 'Monolith', 'selectorized', 'leg-press', 2.5, null, null, null, 0),
  ('panatta--monolith--leg-extension', 'panatta', 'Beinstrecker', 'Monolith', 'selectorized', 'leg-extension', 2.5, null, null, null, 0),
  ('panatta--monolith--leg-curl-seated', 'panatta', 'Beinbeuger sitzend', 'Monolith', 'selectorized', 'leg-curl-seated', 2.5, null, null, null, 0),
  ('panatta--monolith--abductor', 'panatta', 'Abduktoren', 'Monolith', 'selectorized', 'abductor', 2.5, null, null, null, 0),
  ('panatta--monolith--adductor', 'panatta', 'Adduktoren', 'Monolith', 'selectorized', 'adductor', 2.5, null, null, null, 0),
  ('panatta--monolith--back-extension', 'panatta', 'Rückenstrecker', 'Monolith', 'selectorized', 'back-extension', 2.5, null, null, null, 0),
  ('panatta--monolith--ab-crunch', 'panatta', 'Bauchmaschine', 'Monolith', 'selectorized', 'ab-crunch', 2.5, null, null, null, 0),
  ('panatta--freeweight-hp--chest-press', 'panatta', 'Brustpresse', 'Freeweight HP', 'plate_loaded', 'chest-press', 2.5, null, null, null, 0),
  ('panatta--freeweight-hp--incline-chest-press', 'panatta', 'Schrägbankpresse (Maschine)', 'Freeweight HP', 'plate_loaded', 'incline-chest-press', 2.5, null, null, null, 0),
  ('panatta--freeweight-hp--shoulder-press', 'panatta', 'Schulterpresse', 'Freeweight HP', 'plate_loaded', 'shoulder-press', 2.5, null, null, null, 0),
  ('panatta--freeweight-hp--lat-pulldown', 'panatta', 'Latzug', 'Freeweight HP', 'plate_loaded', 'lat-pulldown', 2.5, null, null, null, 0),
  ('panatta--freeweight-hp--seated-row', 'panatta', 'Rudern sitzend (Maschine)', 'Freeweight HP', 'plate_loaded', 'seated-row', 2.5, null, null, null, 0),
  ('panatta--freeweight-hp--t-bar-row', 'panatta', 'T-Bar-Rudern', 'Freeweight HP', 'plate_loaded', 't-bar-row', 2.5, null, null, null, 0),
  ('panatta--freeweight-hp--leg-press', 'panatta', 'Beinpresse', 'Freeweight HP', 'plate_loaded', 'leg-press', 2.5, null, null, null, 0),
  ('panatta--freeweight-hp--hack-squat', 'panatta', 'Hackenschmidt', 'Freeweight HP', 'plate_loaded', 'hack-squat', 2.5, null, null, null, 0),
  ('panatta--freeweight-hp--hip-thrust', 'panatta', 'Hip Thrust', 'Freeweight HP', 'plate_loaded', 'hip-thrust', 2.5, null, null, null, 0),
  ('panatta--freeweight-hp--calf-raise', 'panatta', 'Wadenheben', 'Freeweight HP', 'plate_loaded', 'calf-raise', 2.5, null, null, null, 0),
  ('nautilus--inspiration--chest-press', 'nautilus', 'Brustpresse', 'Inspiration', 'selectorized', 'chest-press', 2.5, null, null, null, 0),
  ('nautilus--inspiration--butterfly', 'nautilus', 'Butterfly', 'Inspiration', 'selectorized', 'butterfly', 2.5, null, null, null, 0),
  ('nautilus--inspiration--reverse-fly', 'nautilus', 'Reverse Butterfly', 'Inspiration', 'selectorized', 'reverse-fly', 2.5, null, null, null, 0),
  ('nautilus--inspiration--shoulder-press', 'nautilus', 'Schulterpresse', 'Inspiration', 'selectorized', 'shoulder-press', 2.5, null, null, null, 0),
  ('nautilus--inspiration--lat-pulldown', 'nautilus', 'Latzug', 'Inspiration', 'selectorized', 'lat-pulldown', 2.5, null, null, null, 0),
  ('nautilus--inspiration--seated-row', 'nautilus', 'Rudern sitzend (Maschine)', 'Inspiration', 'selectorized', 'seated-row', 2.5, null, null, null, 0),
  ('nautilus--inspiration--biceps-curl-machine', 'nautilus', 'Bizepscurl (Maschine)', 'Inspiration', 'selectorized', 'biceps-curl-machine', 2.5, null, null, null, 0),
  ('nautilus--inspiration--triceps-press', 'nautilus', 'Trizepsdrücken (Maschine)', 'Inspiration', 'selectorized', 'triceps-press', 2.5, null, null, null, 0),
  ('nautilus--inspiration--leg-press', 'nautilus', 'Beinpresse', 'Inspiration', 'selectorized', 'leg-press', 2.5, null, null, null, 0),
  ('nautilus--inspiration--leg-extension', 'nautilus', 'Beinstrecker', 'Inspiration', 'selectorized', 'leg-extension', 2.5, null, null, null, 0),
  ('nautilus--inspiration--leg-curl-seated', 'nautilus', 'Beinbeuger sitzend', 'Inspiration', 'selectorized', 'leg-curl-seated', 2.5, null, null, null, 0),
  ('nautilus--inspiration--abductor', 'nautilus', 'Abduktoren', 'Inspiration', 'selectorized', 'abductor', 2.5, null, null, null, 0),
  ('nautilus--inspiration--adductor', 'nautilus', 'Adduktoren', 'Inspiration', 'selectorized', 'adductor', 2.5, null, null, null, 0),
  ('nautilus--inspiration--back-extension', 'nautilus', 'Rückenstrecker', 'Inspiration', 'selectorized', 'back-extension', 2.5, null, null, null, 0),
  ('nautilus--inspiration--ab-crunch', 'nautilus', 'Bauchmaschine', 'Inspiration', 'selectorized', 'ab-crunch', 2.5, null, null, null, 0),
  ('nautilus--impact--chest-press', 'nautilus', 'Brustpresse', 'Impact', 'selectorized', 'chest-press', 2.5, null, null, null, 0),
  ('nautilus--impact--butterfly', 'nautilus', 'Butterfly', 'Impact', 'selectorized', 'butterfly', 2.5, null, null, null, 0),
  ('nautilus--impact--reverse-fly', 'nautilus', 'Reverse Butterfly', 'Impact', 'selectorized', 'reverse-fly', 2.5, null, null, null, 0),
  ('nautilus--impact--shoulder-press', 'nautilus', 'Schulterpresse', 'Impact', 'selectorized', 'shoulder-press', 2.5, null, null, null, 0),
  ('nautilus--impact--lat-pulldown', 'nautilus', 'Latzug', 'Impact', 'selectorized', 'lat-pulldown', 2.5, null, null, null, 0),
  ('nautilus--impact--seated-row', 'nautilus', 'Rudern sitzend (Maschine)', 'Impact', 'selectorized', 'seated-row', 2.5, null, null, null, 0),
  ('nautilus--impact--biceps-curl-machine', 'nautilus', 'Bizepscurl (Maschine)', 'Impact', 'selectorized', 'biceps-curl-machine', 2.5, null, null, null, 0),
  ('nautilus--impact--triceps-press', 'nautilus', 'Trizepsdrücken (Maschine)', 'Impact', 'selectorized', 'triceps-press', 2.5, null, null, null, 0),
  ('nautilus--impact--leg-press', 'nautilus', 'Beinpresse', 'Impact', 'selectorized', 'leg-press', 2.5, null, null, null, 0),
  ('nautilus--impact--leg-extension', 'nautilus', 'Beinstrecker', 'Impact', 'selectorized', 'leg-extension', 2.5, null, null, null, 0),
  ('nautilus--impact--leg-curl-seated', 'nautilus', 'Beinbeuger sitzend', 'Impact', 'selectorized', 'leg-curl-seated', 2.5, null, null, null, 0),
  ('nautilus--impact--abductor', 'nautilus', 'Abduktoren', 'Impact', 'selectorized', 'abductor', 2.5, null, null, null, 0),
  ('nautilus--impact--adductor', 'nautilus', 'Adduktoren', 'Impact', 'selectorized', 'adductor', 2.5, null, null, null, 0),
  ('nautilus--impact--back-extension', 'nautilus', 'Rückenstrecker', 'Impact', 'selectorized', 'back-extension', 2.5, null, null, null, 0),
  ('nautilus--impact--ab-crunch', 'nautilus', 'Bauchmaschine', 'Impact', 'selectorized', 'ab-crunch', 2.5, null, null, null, 0),
  ('milon--kraftzirkel--chest-press', 'milon', 'Brustpresse', 'Kraftzirkel', 'selectorized', 'chest-press', 1, null, null, null, 0),
  ('milon--kraftzirkel--butterfly', 'milon', 'Butterfly', 'Kraftzirkel', 'selectorized', 'butterfly', 1, null, null, null, 0),
  ('milon--kraftzirkel--reverse-fly', 'milon', 'Reverse Butterfly', 'Kraftzirkel', 'selectorized', 'reverse-fly', 1, null, null, null, 0),
  ('milon--kraftzirkel--shoulder-press', 'milon', 'Schulterpresse', 'Kraftzirkel', 'selectorized', 'shoulder-press', 1, null, null, null, 0),
  ('milon--kraftzirkel--lat-pulldown', 'milon', 'Latzug', 'Kraftzirkel', 'selectorized', 'lat-pulldown', 1, null, null, null, 0),
  ('milon--kraftzirkel--seated-row', 'milon', 'Rudern sitzend (Maschine)', 'Kraftzirkel', 'selectorized', 'seated-row', 1, null, null, null, 0),
  ('milon--kraftzirkel--biceps-curl-machine', 'milon', 'Bizepscurl (Maschine)', 'Kraftzirkel', 'selectorized', 'biceps-curl-machine', 1, null, null, null, 0),
  ('milon--kraftzirkel--triceps-press', 'milon', 'Trizepsdrücken (Maschine)', 'Kraftzirkel', 'selectorized', 'triceps-press', 1, null, null, null, 0),
  ('milon--kraftzirkel--leg-press', 'milon', 'Beinpresse', 'Kraftzirkel', 'selectorized', 'leg-press', 1, null, null, null, 0),
  ('milon--kraftzirkel--leg-extension', 'milon', 'Beinstrecker', 'Kraftzirkel', 'selectorized', 'leg-extension', 1, null, null, null, 0),
  ('milon--kraftzirkel--leg-curl-seated', 'milon', 'Beinbeuger sitzend', 'Kraftzirkel', 'selectorized', 'leg-curl-seated', 1, null, null, null, 0),
  ('milon--kraftzirkel--abductor', 'milon', 'Abduktoren', 'Kraftzirkel', 'selectorized', 'abductor', 1, null, null, null, 0),
  ('milon--kraftzirkel--adductor', 'milon', 'Adduktoren', 'Kraftzirkel', 'selectorized', 'adductor', 1, null, null, null, 0),
  ('milon--kraftzirkel--back-extension', 'milon', 'Rückenstrecker', 'Kraftzirkel', 'selectorized', 'back-extension', 1, null, null, null, 0),
  ('milon--kraftzirkel--ab-crunch', 'milon', 'Bauchmaschine', 'Kraftzirkel', 'selectorized', 'ab-crunch', 1, null, null, null, 0)
on conflict (id) do update set manufacturer_id = excluded.manufacturer_id, name = excluded.name, line = excluded.line, kind = excluded.kind, exercise_id = excluded.exercise_id, weight_step_kg = excluded.weight_step_kg, model_number = excluded.model_number, source_url = excluded.source_url, verified = excluded.verified, updated_at = public.equipment_models.updated_at + 1
  where public.equipment_models.created_by is null;

-- Katalog v1 → v2: generierte Modelle der geprüften Hersteller durch echte ersetzen
update public.gym_machines set model_id = 'matrix--g7-s13', updated_at = updated_at + 1 where model_id = 'matrix--ultra--chest-press';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'matrix--ultra--incline-chest-press';
update public.gym_machines set model_id = 'matrix--g7-s22', updated_at = updated_at + 1 where model_id = 'matrix--ultra--butterfly';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'matrix--ultra--reverse-fly';
update public.gym_machines set model_id = 'matrix--g7-s23', updated_at = updated_at + 1 where model_id = 'matrix--ultra--shoulder-press';
update public.gym_machines set model_id = 'matrix--g7-s21', updated_at = updated_at + 1 where model_id = 'matrix--ultra--lateral-raise-machine';
update public.gym_machines set model_id = 'matrix--g7-s33', updated_at = updated_at + 1 where model_id = 'matrix--ultra--lat-pulldown';
update public.gym_machines set model_id = 'matrix--g7-s34', updated_at = updated_at + 1 where model_id = 'matrix--ultra--seated-row';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'matrix--ultra--pullover';
update public.gym_machines set model_id = 'matrix--g7-s40', updated_at = updated_at + 1 where model_id = 'matrix--ultra--biceps-curl-machine';
update public.gym_machines set model_id = 'matrix--g7-s42', updated_at = updated_at + 1 where model_id = 'matrix--ultra--triceps-press';
update public.gym_machines set model_id = 'matrix--g7-s70', updated_at = updated_at + 1 where model_id = 'matrix--ultra--leg-press';
update public.gym_machines set model_id = 'matrix--g7-s71', updated_at = updated_at + 1 where model_id = 'matrix--ultra--leg-extension';
update public.gym_machines set model_id = 'matrix--g7-s72', updated_at = updated_at + 1 where model_id = 'matrix--ultra--leg-curl-seated';
update public.gym_machines set model_id = 'matrix--g7-s73', updated_at = updated_at + 1 where model_id = 'matrix--ultra--leg-curl-lying';
update public.gym_machines set model_id = 'matrix--g7-s75', updated_at = updated_at + 1 where model_id = 'matrix--ultra--abductor';
update public.gym_machines set model_id = 'matrix--g7-s74', updated_at = updated_at + 1 where model_id = 'matrix--ultra--adductor';
update public.gym_machines set model_id = 'matrix--g7-s78', updated_at = updated_at + 1 where model_id = 'matrix--ultra--glute-machine';
update public.gym_machines set model_id = 'matrix--g7-s77', updated_at = updated_at + 1 where model_id = 'matrix--ultra--calf-raise';
update public.gym_machines set model_id = 'matrix--g7-s52', updated_at = updated_at + 1 where model_id = 'matrix--ultra--back-extension';
update public.gym_machines set model_id = 'matrix--g7-s51', updated_at = updated_at + 1 where model_id = 'matrix--ultra--ab-crunch';
update public.gym_machines set model_id = 'matrix--g7-s55', updated_at = updated_at + 1 where model_id = 'matrix--ultra--rotary-torso';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'matrix--ultra--assisted-pullup';
update public.gym_machines set model_id = 'matrix--vs-s13', updated_at = updated_at + 1 where model_id = 'matrix--versa--chest-press';
update public.gym_machines set model_id = 'matrix--vs-s22', updated_at = updated_at + 1 where model_id = 'matrix--versa--butterfly';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'matrix--versa--reverse-fly';
update public.gym_machines set model_id = 'matrix--vs-s23', updated_at = updated_at + 1 where model_id = 'matrix--versa--shoulder-press';
update public.gym_machines set model_id = 'matrix--vs-s33', updated_at = updated_at + 1 where model_id = 'matrix--versa--lat-pulldown';
update public.gym_machines set model_id = 'matrix--vs-s34', updated_at = updated_at + 1 where model_id = 'matrix--versa--seated-row';
update public.gym_machines set model_id = 'matrix--vs-s40', updated_at = updated_at + 1 where model_id = 'matrix--versa--biceps-curl-machine';
update public.gym_machines set model_id = 'matrix--vs-s42', updated_at = updated_at + 1 where model_id = 'matrix--versa--triceps-press';
update public.gym_machines set model_id = 'matrix--vs-s70', updated_at = updated_at + 1 where model_id = 'matrix--versa--leg-press';
update public.gym_machines set model_id = 'matrix--vs-s71', updated_at = updated_at + 1 where model_id = 'matrix--versa--leg-extension';
update public.gym_machines set model_id = 'matrix--vs-s72', updated_at = updated_at + 1 where model_id = 'matrix--versa--leg-curl-seated';
update public.gym_machines set model_id = 'matrix--vs-s74', updated_at = updated_at + 1 where model_id = 'matrix--versa--abductor';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'matrix--versa--adductor';
update public.gym_machines set model_id = 'matrix--vs-s52', updated_at = updated_at + 1 where model_id = 'matrix--versa--back-extension';
update public.gym_machines set model_id = 'matrix--vs-s53', updated_at = updated_at + 1 where model_id = 'matrix--versa--ab-crunch';
update public.gym_machines set model_id = 'matrix--g3-s10', updated_at = updated_at + 1 where model_id = 'matrix--aura--chest-press';
update public.gym_machines set model_id = 'matrix--g3-s12', updated_at = updated_at + 1 where model_id = 'matrix--aura--butterfly';
update public.gym_machines set model_id = 'matrix--g3-s22', updated_at = updated_at + 1 where model_id = 'matrix--aura--reverse-fly';
update public.gym_machines set model_id = 'matrix--g3-s20', updated_at = updated_at + 1 where model_id = 'matrix--aura--shoulder-press';
update public.gym_machines set model_id = 'matrix--g3-s30', updated_at = updated_at + 1 where model_id = 'matrix--aura--lat-pulldown';
update public.gym_machines set model_id = 'matrix--g3-s31', updated_at = updated_at + 1 where model_id = 'matrix--aura--seated-row';
update public.gym_machines set model_id = 'matrix--g3-s40', updated_at = updated_at + 1 where model_id = 'matrix--aura--biceps-curl-machine';
update public.gym_machines set model_id = 'matrix--g3-s42', updated_at = updated_at + 1 where model_id = 'matrix--aura--triceps-press';
update public.gym_machines set model_id = 'matrix--g3-s70', updated_at = updated_at + 1 where model_id = 'matrix--aura--leg-press';
update public.gym_machines set model_id = 'matrix--g3-s71', updated_at = updated_at + 1 where model_id = 'matrix--aura--leg-extension';
update public.gym_machines set model_id = 'matrix--g3-s72', updated_at = updated_at + 1 where model_id = 'matrix--aura--leg-curl-seated';
update public.gym_machines set model_id = 'matrix--g3-s75', updated_at = updated_at + 1 where model_id = 'matrix--aura--abductor';
update public.gym_machines set model_id = 'matrix--g3-s74', updated_at = updated_at + 1 where model_id = 'matrix--aura--adductor';
update public.gym_machines set model_id = 'matrix--g3-s52', updated_at = updated_at + 1 where model_id = 'matrix--aura--back-extension';
update public.gym_machines set model_id = 'matrix--g3-s51', updated_at = updated_at + 1 where model_id = 'matrix--aura--ab-crunch';
update public.gym_machines set model_id = 'matrix--mg-pl12', updated_at = updated_at + 1 where model_id = 'matrix--magnum-plate-loaded--chest-press';
update public.gym_machines set model_id = 'matrix--mg-pl14', updated_at = updated_at + 1 where model_id = 'matrix--magnum-plate-loaded--incline-chest-press';
update public.gym_machines set model_id = 'matrix--mg-pl23', updated_at = updated_at + 1 where model_id = 'matrix--magnum-plate-loaded--shoulder-press';
update public.gym_machines set model_id = 'matrix--mg-pl33', updated_at = updated_at + 1 where model_id = 'matrix--magnum-plate-loaded--lat-pulldown';
update public.gym_machines set model_id = 'matrix--mg-pl34', updated_at = updated_at + 1 where model_id = 'matrix--magnum-plate-loaded--seated-row';
update public.gym_machines set model_id = 'matrix--mg-pl35', updated_at = updated_at + 1 where model_id = 'matrix--magnum-plate-loaded--t-bar-row';
update public.gym_machines set model_id = 'matrix--mg-pl70', updated_at = updated_at + 1 where model_id = 'matrix--magnum-plate-loaded--leg-press';
update public.gym_machines set model_id = 'matrix--mg-pl71', updated_at = updated_at + 1 where model_id = 'matrix--magnum-plate-loaded--hack-squat';
update public.gym_machines set model_id = 'matrix--mg-pl82', updated_at = updated_at + 1 where model_id = 'matrix--magnum-plate-loaded--hip-thrust';
update public.gym_machines set model_id = 'matrix--mg-pl76', updated_at = updated_at + 1 where model_id = 'matrix--magnum-plate-loaded--calf-raise';
update public.gym_machines set model_id = 'life-fitness--ss-cp', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--chest-press';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--incline-chest-press';
update public.gym_machines set model_id = 'life-fitness--ss-fly', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--butterfly';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--reverse-fly';
update public.gym_machines set model_id = 'life-fitness--ss-sp', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--shoulder-press';
update public.gym_machines set model_id = 'life-fitness--ss-lr', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--lateral-raise-machine';
update public.gym_machines set model_id = 'life-fitness--ss-pdx', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--lat-pulldown';
update public.gym_machines set model_id = 'life-fitness--ss-rw', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--seated-row';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--pullover';
update public.gym_machines set model_id = 'life-fitness--ss-bc', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--biceps-curl-machine';
update public.gym_machines set model_id = 'life-fitness--ss-te', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--triceps-press';
update public.gym_machines set model_id = 'life-fitness--ss-lp', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--leg-press';
update public.gym_machines set model_id = 'life-fitness--ss-le', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--leg-extension';
update public.gym_machines set model_id = 'life-fitness--ss-lc', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--leg-curl-seated';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--leg-curl-lying';
update public.gym_machines set model_id = 'life-fitness--ss-haa', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--abductor';
update public.gym_machines set model_id = 'life-fitness--ss-had', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--adductor';
update public.gym_machines set model_id = 'life-fitness--ss-gl', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--glute-machine';
update public.gym_machines set model_id = 'life-fitness--ss-ce', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--calf-raise';
update public.gym_machines set model_id = 'life-fitness--ss-be', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--back-extension';
update public.gym_machines set model_id = 'life-fitness--ss-ab', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--ab-crunch';
update public.gym_machines set model_id = 'life-fitness--ss-tr', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--rotary-torso';
update public.gym_machines set model_id = 'life-fitness--ss-adc', updated_at = updated_at + 1 where model_id = 'life-fitness--insignia--assisted-pullup';
update public.gym_machines set model_id = 'life-fitness--op-cp', updated_at = updated_at + 1 where model_id = 'life-fitness--optima--chest-press';
update public.gym_machines set model_id = 'life-fitness--op-fly', updated_at = updated_at + 1 where model_id = 'life-fitness--optima--butterfly';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'life-fitness--optima--reverse-fly';
update public.gym_machines set model_id = 'life-fitness--op-sp', updated_at = updated_at + 1 where model_id = 'life-fitness--optima--shoulder-press';
update public.gym_machines set model_id = 'life-fitness--op-pd', updated_at = updated_at + 1 where model_id = 'life-fitness--optima--lat-pulldown';
update public.gym_machines set model_id = 'life-fitness--op-rw', updated_at = updated_at + 1 where model_id = 'life-fitness--optima--seated-row';
update public.gym_machines set model_id = 'life-fitness--op-bc', updated_at = updated_at + 1 where model_id = 'life-fitness--optima--biceps-curl-machine';
update public.gym_machines set model_id = 'life-fitness--op-te', updated_at = updated_at + 1 where model_id = 'life-fitness--optima--triceps-press';
update public.gym_machines set model_id = 'life-fitness--op-lp', updated_at = updated_at + 1 where model_id = 'life-fitness--optima--leg-press';
update public.gym_machines set model_id = 'life-fitness--op-le', updated_at = updated_at + 1 where model_id = 'life-fitness--optima--leg-extension';
update public.gym_machines set model_id = 'life-fitness--op-lc', updated_at = updated_at + 1 where model_id = 'life-fitness--optima--leg-curl-seated';
update public.gym_machines set model_id = 'life-fitness--op-haa', updated_at = updated_at + 1 where model_id = 'life-fitness--optima--abductor';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'life-fitness--optima--adductor';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'life-fitness--optima--back-extension';
update public.gym_machines set model_id = 'life-fitness--op-ab', updated_at = updated_at + 1 where model_id = 'life-fitness--optima--ab-crunch';
update public.gym_machines set model_id = 'hammer-strength--il-bp', updated_at = updated_at + 1 where model_id = 'hammer-strength--plate-loaded--chest-press';
update public.gym_machines set model_id = 'hammer-strength--il-ip', updated_at = updated_at + 1 where model_id = 'hammer-strength--plate-loaded--incline-chest-press';
update public.gym_machines set model_id = 'hammer-strength--il-sp', updated_at = updated_at + 1 where model_id = 'hammer-strength--plate-loaded--shoulder-press';
update public.gym_machines set model_id = 'hammer-strength--il-pd', updated_at = updated_at + 1 where model_id = 'hammer-strength--plate-loaded--lat-pulldown';
update public.gym_machines set model_id = 'hammer-strength--il-drw', updated_at = updated_at + 1 where model_id = 'hammer-strength--plate-loaded--seated-row';
update public.gym_machines set model_id = 'hammer-strength--pl-tbr', updated_at = updated_at + 1 where model_id = 'hammer-strength--plate-loaded--t-bar-row';
update public.gym_machines set model_id = 'hammer-strength--hs-llp', updated_at = updated_at + 1 where model_id = 'hammer-strength--plate-loaded--leg-press';
update public.gym_machines set model_id = 'hammer-strength--pl-hsq2', updated_at = updated_at + 1 where model_id = 'hammer-strength--plate-loaded--hack-squat';
update public.gym_machines set model_id = 'hammer-strength--pl-gld', updated_at = updated_at + 1 where model_id = 'hammer-strength--plate-loaded--hip-thrust';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'hammer-strength--plate-loaded--calf-raise';
update public.gym_machines set model_id = 'hammer-strength--select-chest-press', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--chest-press';
update public.gym_machines set model_id = 'hammer-strength--select-pectoral-fly', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--butterfly';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'hammer-strength--select--reverse-fly';
update public.gym_machines set model_id = 'hammer-strength--select-shoulder-press', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--shoulder-press';
update public.gym_machines set model_id = 'hammer-strength--select-fixed-pulldown', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--lat-pulldown';
update public.gym_machines set model_id = 'hammer-strength--select-seated-row', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--seated-row';
update public.gym_machines set model_id = 'hammer-strength--select-biceps-curl', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--biceps-curl-machine';
update public.gym_machines set model_id = 'hammer-strength--select-triceps-extension', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--triceps-press';
update public.gym_machines set model_id = 'hammer-strength--select-seated-leg-press', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--leg-press';
update public.gym_machines set model_id = 'hammer-strength--select-leg-extension', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--leg-extension';
update public.gym_machines set model_id = 'hammer-strength--select-leg-curl', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--leg-curl-seated';
update public.gym_machines set model_id = 'hammer-strength--select-hip-abduction', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--abductor';
update public.gym_machines set model_id = 'hammer-strength--select-hip-adduction', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--adductor';
update public.gym_machines set model_id = 'hammer-strength--select-back-extension', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--back-extension';
update public.gym_machines set model_id = 'hammer-strength--select-abdominal-crunch', updated_at = updated_at + 1 where model_id = 'hammer-strength--select--ab-crunch';
update public.gym_machines set model_id = 'hoist--rs-2301', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--chest-press';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'hoist--roc-it--incline-chest-press';
update public.gym_machines set model_id = 'hoist--rs-2302', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--butterfly';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'hoist--roc-it--reverse-fly';
update public.gym_machines set model_id = 'hoist--rs-2501', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--shoulder-press';
update public.gym_machines set model_id = 'hoist--rs-1502', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--lateral-raise-machine';
update public.gym_machines set model_id = 'hoist--rs-2201', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--lat-pulldown';
update public.gym_machines set model_id = 'hoist--rs-2203', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--seated-row';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'hoist--roc-it--pullover';
update public.gym_machines set model_id = 'hoist--rs-2102', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--biceps-curl-machine';
update public.gym_machines set model_id = 'hoist--rs-1103', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--triceps-press';
update public.gym_machines set model_id = 'hoist--rs-2403', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--leg-press';
update public.gym_machines set model_id = 'hoist--rs-2401', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--leg-extension';
update public.gym_machines set model_id = 'hoist--rs-2402', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--leg-curl-seated';
update public.gym_machines set model_id = 'hoist--rs-2408', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--leg-curl-lying';
update public.gym_machines set model_id = 'hoist--rs-2407', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--abductor';
update public.gym_machines set model_id = 'hoist--rs-2406', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--adductor';
update public.gym_machines set model_id = 'hoist--rs-2412', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--glute-machine';
update public.gym_machines set model_id = 'hoist--rs-2415', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--calf-raise';
update public.gym_machines set model_id = 'hoist--rs-2204', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--back-extension';
update public.gym_machines set model_id = 'hoist--rs-2601', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--ab-crunch';
update public.gym_machines set model_id = 'hoist--rs-2602', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--rotary-torso';
update public.gym_machines set model_id = 'hoist--rs-2700', updated_at = updated_at + 1 where model_id = 'hoist--roc-it--assisted-pullup';
update public.gym_machines set model_id = 'hoist--hd-3300', updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--chest-press';
update public.gym_machines set model_id = 'hoist--hd-3900', updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--butterfly';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--reverse-fly';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--shoulder-press';
update public.gym_machines set model_id = 'hoist--hd-3203', updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--lat-pulldown';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--seated-row';
update public.gym_machines set model_id = 'hoist--hd-3103', updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--biceps-curl-machine';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--triceps-press';
update public.gym_machines set model_id = 'hoist--hd-3403', updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--leg-press';
update public.gym_machines set model_id = 'hoist--hd-3400', updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--leg-extension';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--leg-curl-seated';
update public.gym_machines set model_id = 'hoist--hd-3800', updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--abductor';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--adductor';
update public.gym_machines set model_id = null, updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--back-extension';
update public.gym_machines set model_id = 'hoist--hd-3600', updated_at = updated_at + 1 where model_id = 'hoist--hd-dual--ab-crunch';
update public.equipment_models set deleted_at = 1, updated_at = updated_at + 1 where created_by is null and deleted_at is null and id in ('matrix--ultra--chest-press', 'matrix--ultra--incline-chest-press', 'matrix--ultra--butterfly', 'matrix--ultra--reverse-fly', 'matrix--ultra--shoulder-press', 'matrix--ultra--lateral-raise-machine', 'matrix--ultra--lat-pulldown', 'matrix--ultra--seated-row', 'matrix--ultra--pullover', 'matrix--ultra--biceps-curl-machine', 'matrix--ultra--triceps-press', 'matrix--ultra--leg-press', 'matrix--ultra--leg-extension', 'matrix--ultra--leg-curl-seated', 'matrix--ultra--leg-curl-lying', 'matrix--ultra--abductor', 'matrix--ultra--adductor', 'matrix--ultra--glute-machine', 'matrix--ultra--calf-raise', 'matrix--ultra--back-extension', 'matrix--ultra--ab-crunch', 'matrix--ultra--rotary-torso', 'matrix--ultra--assisted-pullup', 'matrix--versa--chest-press', 'matrix--versa--butterfly', 'matrix--versa--reverse-fly', 'matrix--versa--shoulder-press', 'matrix--versa--lat-pulldown', 'matrix--versa--seated-row', 'matrix--versa--biceps-curl-machine', 'matrix--versa--triceps-press', 'matrix--versa--leg-press', 'matrix--versa--leg-extension', 'matrix--versa--leg-curl-seated', 'matrix--versa--abductor', 'matrix--versa--adductor', 'matrix--versa--back-extension', 'matrix--versa--ab-crunch', 'matrix--aura--chest-press', 'matrix--aura--butterfly', 'matrix--aura--reverse-fly', 'matrix--aura--shoulder-press', 'matrix--aura--lat-pulldown', 'matrix--aura--seated-row', 'matrix--aura--biceps-curl-machine', 'matrix--aura--triceps-press', 'matrix--aura--leg-press', 'matrix--aura--leg-extension', 'matrix--aura--leg-curl-seated', 'matrix--aura--abductor', 'matrix--aura--adductor', 'matrix--aura--back-extension', 'matrix--aura--ab-crunch', 'matrix--magnum-plate-loaded--chest-press', 'matrix--magnum-plate-loaded--incline-chest-press', 'matrix--magnum-plate-loaded--shoulder-press', 'matrix--magnum-plate-loaded--lat-pulldown', 'matrix--magnum-plate-loaded--seated-row', 'matrix--magnum-plate-loaded--t-bar-row', 'matrix--magnum-plate-loaded--leg-press', 'matrix--magnum-plate-loaded--hack-squat', 'matrix--magnum-plate-loaded--hip-thrust', 'matrix--magnum-plate-loaded--calf-raise', 'life-fitness--insignia--chest-press', 'life-fitness--insignia--incline-chest-press', 'life-fitness--insignia--butterfly', 'life-fitness--insignia--reverse-fly', 'life-fitness--insignia--shoulder-press', 'life-fitness--insignia--lateral-raise-machine', 'life-fitness--insignia--lat-pulldown', 'life-fitness--insignia--seated-row', 'life-fitness--insignia--pullover', 'life-fitness--insignia--biceps-curl-machine', 'life-fitness--insignia--triceps-press', 'life-fitness--insignia--leg-press', 'life-fitness--insignia--leg-extension', 'life-fitness--insignia--leg-curl-seated', 'life-fitness--insignia--leg-curl-lying', 'life-fitness--insignia--abductor', 'life-fitness--insignia--adductor', 'life-fitness--insignia--glute-machine', 'life-fitness--insignia--calf-raise', 'life-fitness--insignia--back-extension', 'life-fitness--insignia--ab-crunch', 'life-fitness--insignia--rotary-torso', 'life-fitness--insignia--assisted-pullup', 'life-fitness--optima--chest-press', 'life-fitness--optima--butterfly', 'life-fitness--optima--reverse-fly', 'life-fitness--optima--shoulder-press', 'life-fitness--optima--lat-pulldown', 'life-fitness--optima--seated-row', 'life-fitness--optima--biceps-curl-machine', 'life-fitness--optima--triceps-press', 'life-fitness--optima--leg-press', 'life-fitness--optima--leg-extension', 'life-fitness--optima--leg-curl-seated', 'life-fitness--optima--abductor', 'life-fitness--optima--adductor', 'life-fitness--optima--back-extension', 'life-fitness--optima--ab-crunch', 'hammer-strength--plate-loaded--chest-press', 'hammer-strength--plate-loaded--incline-chest-press', 'hammer-strength--plate-loaded--shoulder-press', 'hammer-strength--plate-loaded--lat-pulldown', 'hammer-strength--plate-loaded--seated-row', 'hammer-strength--plate-loaded--t-bar-row', 'hammer-strength--plate-loaded--leg-press', 'hammer-strength--plate-loaded--hack-squat', 'hammer-strength--plate-loaded--hip-thrust', 'hammer-strength--plate-loaded--calf-raise', 'hammer-strength--select--chest-press', 'hammer-strength--select--butterfly', 'hammer-strength--select--reverse-fly', 'hammer-strength--select--shoulder-press', 'hammer-strength--select--lat-pulldown', 'hammer-strength--select--seated-row', 'hammer-strength--select--biceps-curl-machine', 'hammer-strength--select--triceps-press', 'hammer-strength--select--leg-press', 'hammer-strength--select--leg-extension', 'hammer-strength--select--leg-curl-seated', 'hammer-strength--select--abductor', 'hammer-strength--select--adductor', 'hammer-strength--select--back-extension', 'hammer-strength--select--ab-crunch', 'hoist--roc-it--chest-press', 'hoist--roc-it--incline-chest-press', 'hoist--roc-it--butterfly', 'hoist--roc-it--reverse-fly', 'hoist--roc-it--shoulder-press', 'hoist--roc-it--lateral-raise-machine', 'hoist--roc-it--lat-pulldown', 'hoist--roc-it--seated-row', 'hoist--roc-it--pullover', 'hoist--roc-it--biceps-curl-machine', 'hoist--roc-it--triceps-press', 'hoist--roc-it--leg-press', 'hoist--roc-it--leg-extension', 'hoist--roc-it--leg-curl-seated', 'hoist--roc-it--leg-curl-lying', 'hoist--roc-it--abductor', 'hoist--roc-it--adductor', 'hoist--roc-it--glute-machine', 'hoist--roc-it--calf-raise', 'hoist--roc-it--back-extension', 'hoist--roc-it--ab-crunch', 'hoist--roc-it--rotary-torso', 'hoist--roc-it--assisted-pullup', 'hoist--hd-dual--chest-press', 'hoist--hd-dual--butterfly', 'hoist--hd-dual--reverse-fly', 'hoist--hd-dual--shoulder-press', 'hoist--hd-dual--lat-pulldown', 'hoist--hd-dual--seated-row', 'hoist--hd-dual--biceps-curl-machine', 'hoist--hd-dual--triceps-press', 'hoist--hd-dual--leg-press', 'hoist--hd-dual--leg-extension', 'hoist--hd-dual--leg-curl-seated', 'hoist--hd-dual--abductor', 'hoist--hd-dual--adductor', 'hoist--hd-dual--back-extension', 'hoist--hd-dual--ab-crunch');
