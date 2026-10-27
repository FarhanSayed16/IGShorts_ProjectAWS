# IGshorts Cursor Handoff Bundle

Open `IGshorts_Cursor_Implementation_Brief.md` in Cursor. It contains the research, dataset/source links, provider constraints, architecture, schema suggestions, group/ranking rules, acceptance criteria and the implementation prompt.

## Start here

1. Read the implementation brief.
2. Inspect the existing IGshorts repository before modifying anything.
3. Keep the existing India and Global charts working.
4. Run the bootstrap script from this folder:

```bash
python scripts/IGshorts_data_bootstrap.py --seed-dir data --out-dir ./igshorts_bootstrap
```

For offline tests, add `--skip-download`.

## Included data

- `data/IGshorts_India_200_Seed_List.csv`
- `data/IGshorts_Global_200_Seed_List.csv`
- `data/IGshorts_Existing_Seed_Database.csv`
- `data/igshorts_profiles_normalized_seed_only.csv`
- `data/import_manifest_seed_only.json`

The local lists are provisional research seeds. Their saved follower figures may be rounded or stale; they are not live data. The live FastSocial snapshot was not downloaded in this session, so the script gets it from the URL when run with internet access.
