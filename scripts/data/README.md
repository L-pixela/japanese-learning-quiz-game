# TanTore vocabulary

550 distinct entries, 55 per level. Levels 1–5 use the N4 source; levels 6–10 use the N3 source. Levels 1–4 emphasize familiar daily vocabulary, 5 introduces abstract N4 concepts, 6–7 introduce common N3 expressions, and 8–10 move into formal, social and abstract vocabulary. This is an editorial learning order, not a measured frequency ranking or an official JLPT syllabus.

Source: [elzup/jlpt-word-list](https://github.com/elzup/jlpt-word-list), specifically [N4](https://github.com/elzup/jlpt-word-list/blob/master/src/n4.csv) and [N3](https://github.com/elzup/jlpt-word-list/blob/master/src/n3.csv), downloaded 2026-09-13. Based on Jamie Sinclair's open-anki-jlpt-decks, chyyran/jlpt-anki-decks and Jonathan Waller's TanOS study lists. The source's MIT license is included in SOURCE-LICENSE.

The original band-specific CSV snapshots are retained for reproducibility. Legacy tags inside these files overlap; classification uses the source filename. Selection groups are explicit in scripts/compile-words.py. Japanese forms, readings and English glosses are retained from the source except two corrected rows: 嬉しい / うれしい and 挨拶する / あいさつする (to greet), whose source reading columns contain kanji. JLPT study lists can disagree on individual words.

Run `python scripts/compile-words.py` to reproduce words.json. Run `npm run db:seed -- --dry-run` to validate and generate SQL, or `npm run db:seed` to insert into local D1. The seed defaults to local. Remote is an explicit `--remote` option. Apply migrations first.

Reseeding skips existing Japanese/reading pairs and never overwrites team data. If an existing entry is assigned to a different level, review its placement manually before expecting exactly 55 rows in each database level.
