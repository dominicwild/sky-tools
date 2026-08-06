# Quest Sync

You are maintaining quest data for the sky-tools repo.

Goal:
Keep data/questData.ts aligned with the wiki quest source and supplement it with SkyHelper media. Wiki quest wording is
the source of truth. SkyHelper is supplemental for images, videos, aliases, and early quest discovery before the wiki
catches up.

Before changing files:

1. Work from the repo root.
2. Run git status --short and preserve unrelated user changes.
3. Read AGENTS.md and follow its validation requirements.
4. Inspect the current quest sync flow before editing:
    - scripts/src/extractQuestData.ts
    - scripts/src/uploadQuestVideo.ts
    - data/questData.ts
    - lib/daily-quest-source.ts
    - lib/video-guide-url.ts
    - server/redis.ts
    - util/helper.ts
    - components/VideoGuideDialog.tsx

Wiki sync:

1. Run npm --prefix scripts run syncQuests -- --dry-run.
2. If the dry run finds new wiki quests, run npm --prefix scripts run syncQuests.
3. Review every generated change before keeping it. Expected files are:
    - data/questData.ts
    - data/skyDataLocal.json
    - scripts/skyData.json
    - scripts/skyDataLocal.json
    - public/skyImages/*
4. Do not commit raw temporary files, downloaded videos, credentials, or ad hoc scratch output.

SkyHelper sync:

1. Fetch https://api.skyhelper.xyz/update/quests.
2. Inspect the returned quest titles, dates, media URLs, authors, and source fields. If the response is missing the
   expected `quests` array or media fields, stop and report the unexpected shape instead of guessing.
3. Merge SkyHelper rows by normalized title after removing any trailing "- video guide" suffix. Use the first image
   attachment as visualGuideUrl and the first video attachment as videoGuideUrl.
4. Match SkyHelper quests to local quests in this order:
    - normalized exact title match
    - existing QUEST_TITLE_ALIASES match
    - clear semantic duplicate, supported by matching quest intent, realm, and visual guide similarity
5. If SkyHelper and wiki describe the same quest with different wording, keep the wiki questName in data/questData.ts
   and add or update QUEST_TITLE_ALIASES so the SkyHelper title resolves to the wiki title.
6. If SkyHelper has a materially new quest absent from wiki data, add it to data/questData.ts with:
    - type: "SkyHelper Quest"
    - realm: inferred from matched daily quests when there is exactly one clear realm, otherwise "Unknown (?)"
    - questName: SkyHelper title with the "- video guide" suffix removed
    - iconUrl: the existing default diamond quest icon, currently 9857649b-3859-413b-941c-dee139045b1d.png
    - visualGuideUrl: local filename in public/skyImages when an image exists, otherwise null
    - videoGuideUrl: UploadThing `ufsUrl` for the compressed hosted video when a video exists and UploadThing
      credentials
      are available. If upload is blocked, preserve any existing videoGuideUrl on matched quests, use null for new
      quests, and report the blocker
    - id: next available numeric id with no duplicate ids
7. Download new SkyHelper image attachments into public/skyImages. Store only the local filename in questData.ts.
8. Mirror data/questData.ts changes into data/skyDataLocal.json and scripts/skyDataLocal.json. Do not add
   SkyHelper-only rows to scripts/skyData.json because that file is the raw wiki source.
9. For video attachments:
    - Load `UPLOADTHING_TOKEN` from this repo's `.env` file before uploading. Do not rely on a globally inherited
      process environment token because it can be stale; the repo `.env` is the source of truth.
    - Use the repo helper to download the original video, compress it, upload it, and delete temporary files:
      `npm --prefix scripts run uploadQuestVideo -- --input-url "<original video URL>" --title "<SkyHelper title>" --author "<attachment author>"`
    - Add `--source-url "<original source URL>"` only when SkyHelper provides a source URL.
    - The helper compresses with this ffmpeg command, preserving audio:
      `ffmpeg -y -i "input.mp4" -vf "scale='min(1280,iw)':-2" -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart "output-web-audio.mp4"`
    - The helper uses `UTApi.uploadFiles` and prints JSON with `ufsUrl` and attribution fields. Use the returned
      `ufsUrl` as the quest `videoGuideUrl`.
    - Preserve useful attribution in the helper output: SkyHelper title, attachment author, original source URL, and
      original media URL.
    - If manually downloading or compressing for debugging, do it in a temporary working directory and do not commit
      downloaded source videos or compressed scratch output.
10. If UploadThing upload is unavailable, do not invent another hosting path. Leave a clear summary of the missing
    credential, upload error, or ffmpeg error.
11. Never add or restore a popularity/user-count fallback for missing daily quests. If SkyHelper returns fewer than four
    real daily quests, show fewer than four rather than guessing from historical user selections.

Duplicate handling:

1. Prefer replacing SkyHelper-only wording with wiki wording when the wiki later adds the same quest.
2. Preserve or move useful SkyHelper media onto the wiki-worded quest when it is the same quest.
3. Add an alias from the SkyHelper normalized title to the wiki normalized title so daily API matching remains stable.
4. If uncertain whether two quests are duplicates, stop and report the specific candidates, titles, realms, and image
   evidence instead of guessing.

Validation:

1. Run:
   npm run typecheck
   npm run lint
   npm run fallow:dupes
   npm run fallow:dead-code
   npm run test:run
2. Start the app for a smoke test without leaving a visible terminal window open, unless a sky-tools dev server is
   already running:
   npm run dev
3. Use agent-browser to open the local URL, take an interactive snapshot, search for a known quest, open image/video
   guide dialogs when available, and confirm the page renders without obvious runtime errors.
4. Stop only the dev server you started before finishing. If you used an existing server, leave it running and report
   it.

Commit and push:

1. If there is no data/media/alias diff after the sync checks, do not commit or push.
2. Before committing, run `git branch --show-current`. Production quest syncs must land on `master`; never push a
   production-bound quest sync to the branch that happened to be open when the automation started.
3. If the current branch is not `master`, create a separate `master` worktree and make the production-bound sync there;
   do not ship unrelated feature-branch changes.
4. If changes are valid, commit only the relevant files with:
   chore: sync quest data
5. Push the current branch.
6. Confirm the pushed commit is deployed to production before final verification. Use GitHub deployment records when
   available:
   `gh api repos/dominicwild/sky-tools/deployments --jq '.[:5] | map({sha, environment, created_at, statuses_url})'`
   and then check the newest matching deployment status for `state: "success"`.
7. Use agent-browser to open the live site at https://sky.dominicwild.com. Compare the visible daily quests and candle
   guides against the current SkyHelper API payload. This live-site/API comparison is the final verification point:
    - If the live site matches the current SkyHelper payload, the sync is verified.
    - If the live site does not match the current SkyHelper payload, debug the production problem before finishing.
8. Final response must include:
    - what changed
    - validation results
    - live-site/API verification result
    - whether a server/process remains running
    - any UploadThing upload or credential issue

## Calendar Sync

Keep `data/skyEvents.ts` aligned with announced Sky calendar content. Calendar dates are zero-padded Sky days in
`America/Los_Angeles`. `endDay` is inclusive everywhere in this repo; convert source dates when writing data, never
when reading it. `calendarCoverage.coverageThrough` marks the last browsable day, including expected travelling-spirit
windows, while `calendarCoverage.checkedOn` records when confirmations were last checked.

Trigger:

1. Read `calendarCoverage` and today's Sky day.
2. Run the calendar sync when `coverageThrough` is fewer than 45 days after today, or `checkedOn` is more than 30 days
   before today.
3. Otherwise, log `calendar coverage current` and move on.

Calendar sync:

1. Read `packages/utility/source/events/<year>/index.ts` in
   https://github.com/thatskyapplication/thatskyapplication for the current and next year, then each event file it
   references. Take `start` and `end` from its `skyDate(y, m, d)` calls. Give each new event a `SkyEventPalette` token
   that no event appearing in the same displayed month already uses.
2. Subtract one Sky day from every thatskyapplication event `end` before writing `endDay`, because that source's ranges
   are end-exclusive and ours are inclusive.
3. Read season windows from `packages/utility/source/kingdom/seasons/<slug>/index.ts`. Apply the same end conversion,
   but confirm the exclusive convention in each file rather than assuming it.
4. Derive the next travelling-spirit windows from `travellingSpiritSchedule`: the next visit is the last known visit
   plus two weeks and lasts four days. Write unannounced visits as `confidence: "expected"` with the title
   `Travelling Spirit`. Never invent a spirit name; the rotation order is not guessable.
5. Read returning-spirit group windows from `RETURNING_DATES` in `packages/utility/source/models/spirits.ts`. Match
   each numbered group to its spirit names by scanning spirit files for `visits: { returning: [<group number>] }`.
   Add groups only once announced. Do not extrapolate an empty result: months with no returning group are valid.
6. Cross-check every `confirmed` entry against the latest "This Month in Sky" post and the entry's own post on
   https://www.thatskygame.com/news/. Official dates win. Log any discrepancy in `docs/automation-notes.md`.
7. Re-verify every currently running event on every run. TGC can extend an event after announcing it, so a confirmed
   end date is not immutable.
8. Never add an event, season, travelling spirit, or returning-spirit group that no source states. Leave an
   unconfirmed month empty rather than inventing content.
9. Update `calendarCoverage` after the verification work, including expected travelling-spirit windows in
   `coverageThrough`.
10. Run the required validation, commit as `chore: sync calendar data`, push the current branch, and verify `/calendar`
    on the live site using the same deployment and browser checks as the quest sync.

Daily travelling-spirit top-up:

1. On every quest sync, check whether the nearest `expected` travelling-spirit window now has an official announcement.
2. If it does, set the announced spirit title, correct both `startDay` and `endDay` to the announced dates, and switch
   `confidence` to `confirmed`. Do not only update the title: the announced window can differ from the extrapolation.
3. If no announcement exists, leave the entry unchanged and log nothing.

Calendar rules:

1. Convert end-exclusive source ranges to inclusive `endDay` once, at write time. Do not apply the conversion again
   elsewhere.
2. Never invent spirit identities or any other unannounced content. Travelling-spirit windows are predictable, but
   identities are not; returning-spirit groups are not predictable in either window or membership.
3. Only events carry a `palette`. Season, travelling spirit, and returning-spirit group each use one fixed colour.
   Do not give those kinds a palette.
4. Pick an event palette once and keep it unchanged. No two events appearing in the same displayed month may share a
   palette token.
5. Every entry carries a plain-English `description` (two to four sentences a new player understands: what it is and
   what it means for them in game terms).
6. `link` must be genuinely useful to a player and fetch-verified before it is written: official thatskygame.com pages
   first, then ad-free fan resources such as thatskyapplication.com, and the fandom wiki only as a last resort. Its
   `label` must concisely name the destination. Write `null` rather than a broken, empty or ad-riddled page.
   `sourceUrl` is provenance only and is never shown to users.
7. `image` is representative art (spirit portrait, event banner, season key art) with alt text, fetch-verified as a
   real image; `null` when nothing verifiable exists.

## SkyHelper Lag Handling

Sky resets around 9am UK time, but reset timing can drift with daylight saving time and SkyHelper can lag behind the
game. If SkyHelper returns a payload whose `last_updated`/quest `date` is older than the app's current Sky date:

1. Do not treat yesterday's SkyHelper quests as today's quests.
2. Wait 10 minutes, then fetch https://api.skyhelper.xyz/update/quests again.
3. If SkyHelper is still stale, repeat the 10-minute wait-and-fetch cycle two more times.
4. If SkyHelper is still stale after those three short-delay retries, wait one hour between each of three more
   fetches.
5. If the payload becomes current during any retry, continue the normal sync and live-site verification process.
6. If the payload is still stale after all six retries, stop and report that SkyHelper did not update within the
   extended polling window. Do not invent fallback quests.

## UploadThing Setup

UploadThing video uploads use `UPLOADTHING_TOKEN`, not OAuth.

1. Store the token in `.env` as:
   `UPLOADTHING_TOKEN=...`
2. `.env` is ignored by git through `.env*`; do not commit UploadThing credentials.
3. The automation should load this repo's `.env` before uploading videos and should prefer it over any already-set
   shell environment value.
4. Use the repo-local `scripts` UploadThing helper instead of writing one-off upload code.
5. The helper uploads with `UTApi.uploadFiles`, not the frontend dropzone flow.
6. Save the returned `ufsUrl` into `data/questData.ts` as `videoGuideUrl`.

The current app supports direct `.mp4`, `.webm`, `.mov`, `utfs.io`, and `*.ufs.sh` URLs in `videoGuideUrl`, so no player
change is required when UploadThing returns a browser-playable video URL.

## Notes

Keep a progress log in docs/automation-notes.md. Log the day and anything noteworthy in your run.

## Error Notification

If you encounter an error that requires human attention, that is a large problem. UploadThing cap reached
or something else, use the resend skill to send an email detailing the issue.
