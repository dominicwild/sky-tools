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
2. Production quest syncs must land on `master`. If the current branch is not `master`, create a separate `master`
   worktree and make the production-bound sync there; do not ship unrelated feature-branch changes.
3. If changes are valid, commit only the relevant files with:
   chore: sync quest data
4. Push the current branch.
5. Confirm the pushed commit is deployed to production before final verification. Use GitHub deployment records when
   available:
   `gh api repos/dominicwild/sky-tools/deployments --jq '.[:5] | map({sha, environment, created_at, statuses_url})'`
   and then check the newest matching deployment status for `state: "success"`.
6. Use agent-browser to open the live site at https://sky.dominicwild.com. Compare the visible daily quests and candle
   guides against the current SkyHelper API payload. This live-site/API comparison is the final verification point:
    - If the live site matches the current SkyHelper payload, the sync is verified.
    - If the live site does not match the current SkyHelper payload, debug the production problem before finishing.
7. Final response must include:
    - what changed
    - validation results
    - live-site/API verification result
    - whether a server/process remains running
    - any UploadThing upload or credential issue

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
