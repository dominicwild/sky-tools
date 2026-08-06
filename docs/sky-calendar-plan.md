# Sky Calendar Plan

A separate calendar section for scheduled Sky content, kept deliberately out of the quest tracker's way. The home page
stays a daily quest tool. The calendar answers a different question: "what is on in Sky this month, and what is coming".

## Scope

On the calendar:

- Events with date windows, such as Days of Sunlight and Aviary's Firework Festival.
- Season windows, always present in the track sidebar, and drawn as a calendar bar in the months where the season starts
  or ends.
- Travelling spirit visits.
- Returning spirit groups.
- Season progress, specifically days remaining in the current season, derived from the season window rather than stored.

Not on the calendar:

- Daily shard eruptions. The footer already links Sky Shard Events, which does this better.
- In-day recurring timers such as geysers, Grandma, turtle and Aurora concerts. The footer already links Sky Clock.
- Daily quests and candle locations. That is the home page's job.

Browsing is forward-only, one month at a time, from the current month up to the last month we have confirmed data for.

## Data model

Everything is expressed in whole Sky days. Sky events start and end at Sky reset, so day granularity is sufficient, and
working in days removes all timezone arithmetic from the feature. A Sky day is a zero-padded `YYYY-MM-DD` string in
`America/Los_Angeles`, the same timezone the repo already treats as Sky time in `lib/utils.ts`.

New file `data/skyEvents.ts`, following the same pattern as `data/questData.ts`: a plain committed TypeScript file that
the sync agent edits, reviewed by typecheck rather than by runtime parsing. Because it is source code rather than a
network payload, no boundary validator is needed, unlike the SkyHelper handling in `lib/daily-quest-source.ts`.

```ts
export type SkyDay = string; // "2026-07-31", zero-padded, Sky time

export type SkyCalendarEntryKind = "event" | "season" | "travelling-spirit" | "returning-spirits";

// "confirmed" means an official announcement states these dates.
// "expected" means the window follows a known cadence but has not been announced.
export type SkyCalendarConfidence = "confirmed" | "expected";

// Only events carry a palette, because only events overlap each other.
// Every other kind derives its colour from its kind. See Colour below.
export type SkyEventPalette = "amber" | "coral" | "rose" | "teal";

export type SkyCalendarImage = {
    url: string;                    // hotlinked representative art
    alt: string;
};

export type SkyCalendarLink = {
    url: string;
    label: string;
};

type SkyCalendarEntryCommon = {
    id: string;                     // stable slug, e.g. "days-of-sunlight-2026"
    title: string;
    description: string;            // plain English: what this is and what it means for a player
    startDay: SkyDay;               // first day the content is live
    endDay: SkyDay;                 // last day the content is live, inclusive
    confidence: SkyCalendarConfidence;
    link: SkyCalendarLink | null;   // one genuinely useful labelled page, or nothing; see Links below
    image: SkyCalendarImage | null; // null when no verifiable image exists
    sourceUrl: string;              // provenance for the sync agent; never shown to users
    verifiedOn: SkyDay;
};

export type SkyCalendarEntry =
    | (SkyCalendarEntryCommon & { kind: "event"; palette: SkyEventPalette })
    | (SkyCalendarEntryCommon & { kind: "season" | "travelling-spirit" | "returning-spirits" });

export const calendarCoverage = {
    checkedOn: "2026-07-29",
    coverageThrough: "2026-10-31",
} as const;
```

`endDay` is inclusive and is the single convention used everywhere in the app. Source data must be converted on the way
in, never on the way out.

## Links and content

Every user-facing link must earn its place: a player clicks it expecting to learn something. `link` follows a
strict preference order — official thatskygame.com posts first, then ad-free fan resources such as
thatskyapplication.com, and the fandom wiki only as a last resort (it is ad-riddled and its stub pages are sometimes
empty). Every URL is fetch-verified before it enters the data file, and `null` beats a useless link. Its `label` must
concisely name its destination. `sourceUrl` is provenance for the sync agent and appears nowhere in the UI — a raw
GitHub file means nothing to a player.

`description` is two to four plain-English sentences for someone who has never played Sky: what the thing is and what
it means for them in game terms. `image` is representative art (spirit portrait, event banner, season key art),
hotlinked from an official post or an ad-free fan host, with alt text; entries without a verifiable image carry `null`
rather than a placeholder.

`calendarCoverage` exists so the sync agent has a deterministic trigger and so the UI knows how far forward navigation
may go. Storing it in the data file keeps one source of truth for "how far ahead do we actually know". `coverageThrough`
counts `expected` entries as coverage: it marks how far the browsable window extends, and an extrapolated travelling
spirit window is a real entry. Keeping confirmations fresh is `checkedOn`'s job, not `coverageThrough`'s.

Season progress and "days remaining" are always derived from a season entry, never stored, so there is one source of
truth for season dates.

## Sky day helpers

New file `lib/sky-day.ts`.

`lib/utils.ts` already resolves Pacific date parts with `Intl.DateTimeFormat`, but `getSkyDateKey` returns
`${Number(year)}-${Number(month)}-${Number(day)}`, which produces `"2026-7-29"`. Unpadded, that format cannot be
compared as text: `"2026-10-01"` sorts before `"2026-7-29"`, because comparison reaches the `1` before the `7` and stops.

The calendar compares dates constantly. Whether an entry is live is `startDay <= today && today <= endDay`. Whether it
falls in the displayed month is a comparison against that month's first and last day. The next upcoming entry is the
first whose start is after today. Stacking walks entries in start order. With padded days all of that is plain string
comparison, with no parsing and nothing to get wrong.

`getSkyDateKey` cannot simply start padding, because its output is the Redis hash key for daily quest counts in
`server/redis.ts`. Change the format and every past day's counts sits under a key nothing reads any more.

So leave `lib/utils.ts` untouched. `lib/sky-day.ts` derives the padded day by padding the output of the existing
`getSkyDate()`: split the storage key on `-` and zero-pad the month and day. The Intl lookup in `lib/utils.ts` stays the
single source of truth for "what day is it in Sky", and no near-twin of `getSkyDate` is added beside it — two exports
one letter apart returning incompatible formats would be a standing invitation to write the wrong Redis key.

`lib/sky-day.ts` provides:

- `getCurrentSkyDay()` returning today's padded Sky day.
- `addSkyDays(day, count)` and `differenceInSkyDays(from, to)`, implemented via `Date.UTC` so day arithmetic never meets
  a DST transition.
- `compareSkyDays(left, right)`, plain string comparison, valid because the format is padded.
- `getSkyMonth(day)` and `getMonthWeeks(month)`, the latter returning weeks of seven Sky days covering the month, with
  each day flagged as inside or outside the month. Weeks start on Monday. TGC's own calendar starts on Sunday, so the two
  will not line up column for column, but Monday is the correct week start for this audience.

Do not introduce `Temporal`. thatskyapplication uses it, but it is not available in this app's runtime without a
polyfill dependency, and day-granularity strings make it unnecessary.

## Derived model

New file `lib/sky-calendar.ts`, pure functions over `SkyCalendarEntry[]` and a "today" Sky day. This is the shared brain
for both layouts, so the two presentations never disagree.

- `getTracks(entries, month, today)` returning the three tracks described below, in display order.
- `getMonthEntries(entries, month)` clipped to the month and sorted.
- `getWeekSegments(entries, weeks)` splitting entries into per-week bar segments for the grid.
- `getEntryProgress(entry, today)` returning day number, total days and days remaining, computed from the inclusive
  `endDay`.

## Reference layout

`docs/reference/this-month-in-sky-july-2026.png` is TGC's own "This Month in Sky" calendar, and it is the layout this
feature mirrors. Worth reading off it before building:

- A legend panel on the left pairs each event with its own colour and icon. Our track sidebar plays this role, and does
  more, because it also carries live progress.
- Bars stack up to five deep in a busy week. July 2026's first week carries Season of Carnival, the double seasonal
  light period, the Radiance event, a travelling spirit group and the 7th Anniversary at once.
- A bar's vertical position is not stable in TGC's version. Dear Van Gogh sits third in one week and first in another.
  Colour is what makes it followable, not position.
- Long bars repeat their label and icon on every week row they cross, so the reader never has to scroll up to identify a
  bar.
- Single days carry small icons inside the cell for point-in-time things such as a patch going live or a community
  meetup, rather than a bar.

## Tracks

Tracks order the sidebar and the mobile list, shortest-lived first, because the shorter the window the more urgent it is:

1. **Travelling spirits**, four-day windows.
2. **Events**, the mini seasonal ones such as Days of Sunlight, typically two or three weeks. Returning spirit groups sit
   here too, since their windows are the same order of magnitude.
3. **Season**, roughly seventy-five to a hundred days.

Tracks do not determine grid rows. With five concurrent bars there are more entries than tracks, so the grid needs real
stacking, described below.

## Desktop layout

Route `app/calendar/page.tsx`, server component, mirroring how `app/page.tsx` computes data and hands it to a client
shell. Month comes from a `?month=YYYY-MM` search param so months are linkable and no client state is needed for
navigation. In Next 16 `searchParams` is a promise and must be awaited. Parse the param strictly: anything that is not
`YYYY-MM`, is before the current month, or is beyond `calendarCoverage.coverageThrough` renders the current month,
because the nav buttons only constrain clicks and a shared or stale link can carry any value.

Page structure, reusing the visual language already in the app:

1. `CloudEffect` fixed background, as on the home page and about page.
2. A back button to the quest page, reusing the exact `Button asChild` plus `Link` plus `ArrowLeft` pattern from
   `app/about/page.tsx`.
3. Month heading with previous and next controls. Previous is disabled before the current month, next is disabled beyond
   `calendarCoverage.coverageThrough`, so the UI never invites the reader into months we have no data for.
4. The month grid on the left, seven columns, weekday headers, day numbers, and horizontal bars spanning each entry's
   days.
5. A track sidebar on the right, acting as both legend and status panel.

The grid:

- Each week is its own `grid-cols-7`. A day-number row sits at the top, then as many bar rows as that week needs.
- Entries clip to the GRID range, not the month: the first week's lead-in days and the last week's lead-out days show
  the bars that genuinely cover them, so a window running 29 July – 2 August is visible in both months' edge cells.
- Entries are split into per-week segments, because a window crossing a week boundary has to stop and restart on the
  next row. Each segment is placed with `gridColumn: start / end + 1`.
- The month panel keeps a consistent presence: a sparse month must not collapse into a stub. Reserve room for at least
  three bar rows per week band so September with one travelling spirit is the same calm panel as a packed July.
- Segments carry a rounded edge only where the window genuinely begins or ends, and a flat edge where it continues into
  the next week, so a long window reads as continuous rather than as several separate things.
- Every segment repeats the entry's icon and label, as TGC's calendar does, so a bar is identifiable on whichever row the
  reader is looking at.
- Expected entries read as clearly provisional without shouting: grid bars keep their hatch and dashed-circle glyph,
  while cards render as a Sky night-sky surface that dissolves to genuine transparency at the bottom-right corner,
  communicating that they have not yet materialised. The quiet glass Expected badge appears everywhere. Confirmed
  entries carry no marker at all; confirmed is the assumed state.
  Today's cell is highlighted.

### Stacking

A busy week holds five bars, so rows have to be assigned rather than fixed. One pass over the month does it:

1. Sort the month's entries by start day, longest first where two start together, so the long-running context sits above
   the short-lived detail.
2. Walk them in that order and give each the lowest row not already taken by an entry whose window overlaps it.
3. An entry keeps that row for every week it spans. A row frees up only once its entry has ended, and is then available
   to entries starting later.

Assigning the row once per entry rather than once per week is what makes this both simpler and better than the reference
image: a bar never changes height mid-month, so the eye can follow it across weeks. In TGC's July calendar Dear Van Gogh
jumps from the third row to the first, which is exactly the thing to avoid.

Row count per week is whatever that week needs, with no cap and no "+N more" control. Five bars is the realistic
ceiling, and a taller week row is better than hiding content behind a disclosure.

### Colour

Colour signals what kind of thing an entry is, so the reader builds a heuristic that holds from month to month: violet
is always a travelling spirit, gold is always the season. Within one entry the colour never varies either — a bar keeps
its colour on every row it touches, which is what makes a stacked calendar readable.

Kinds that never overlap themselves own a single fixed colour, defined in one lookup in code: the season (gold), the
travelling spirit (violet) and the returning spirit group (indigo). Only one of each runs at a time in Sky, so within a
month the colour is never ambiguous.

Events are the exception, and the reference image shows why one shared event colour cannot work: 7th Anniversary and
Dear Van Gogh overlap for ten days in July 2026, and the first week stacks the Radiance event and the double seasonal
light period together. So the event kind owns the small fixed `SkyEventPalette` family instead, all in the same warm
register so "warm bar" still reads as "event". The sync agent picks a token once when it creates the event and never
changes it, under one rule: no two events appearing in the same displayed month may share a token. Explicit and
reviewable in the data file, with no hashing and no runtime colour derivation that could shift when data changes.

A data-invariant test enforces what typecheck cannot: no two events intersecting the same calendar month share a
token; no two entries of a single-colour kind overlap each other, so if TGC ever runs two seasons or two travelling
spirits at once the test fails loudly instead of the grid silently showing two identical bars; every day field is
padded `YYYY-MM-DD`; and `startDay <= endDay`.

The season appears as a grid bar in the months where it starts or ends, and only as a sidebar entry otherwise. In a
month where nothing changes, a season bar would run the full width of every week and add noise without information. In
the month it ends, the bar is exactly the run-up to the end date, which is the part worth seeing. This rule is
deterministic and needs no threshold.

The sidebar lists one section per track in track order, each showing the entry that is live now and the next one coming,
with a progress bar and "Day 3 of 21, 18 days left" for live entries and "Starts in 2 days" for upcoming ones. The
season's progress bar lives here permanently, including in the months where it has no grid bar, so days remaining is
always one glance away. Between seasons, before the next is announced, the section says no season is live rather than
being hidden or filled by guesswork.

Clicking a bar or a sidebar entry opens a detail dialog reusing `components/ui/dialog.tsx`. Use the dialog rather than
a hover popover: only `@radix-ui/react-dialog` is installed, hover does not exist on touch, and one interaction serves
both layouts.

The dialog is a small content page, not a metadata readout. It shows: the entry's image when present; the title with
the kind badge; the description; the full date range with the duration ("31 Jul – 20 Aug · 21 days"); and for live
entries the stylised progress treatment ("Day 14 of 77" sitting under the bar's left end, "63 days left" at the bar's
filled end — never a raw text line). State is carried by badges, not sentences: an "Ended" badge for finished entries,
the expected treatment for unannounced ones, and nothing at all for confirmed — no "Confirmed" badge, no "this event
has finished" prose. One labelled link when `link` exists, and no source link ever.

## Mobile layout

The mobile view is the sidebar, full width, with the grid dropped. Multi-day ranges are what this calendar is mostly
made of, and square day cells are the wrong shape for ranges on a narrow screen, but the track sections carry the same
information in a shape that suits a phone.

Sections in track order, shortest-lived first. Each card shows title, a track badge, the range formatted as
"31 Jul – 20 Aug", a progress bar, and one line of timing. Expected entries get the dashed treatment and the badge.
Tapping a card opens the same dialog as the desktop bars.

Because the desktop sidebar and the mobile list are the same component at different widths, there is one presentation of
the tracks rather than two, and only the grid is desktop-only. It is hidden with `hidden lg:block`, so the page renders
correctly on the server with no breakpoint detection in JavaScript and no hydration mismatch.

## Look and feel

The calendar has to feel like the rest of the site, which is heavily styled. It inherits the sky gradient body from
`app/layout.tsx`, the drifting `CloudEffect`, and the Nunito face already loaded there.

- Cards and panels follow `components/CandleGuideSection.tsx`, which establishes the glass look: `bg-sky-950/60`,
  `backdrop-blur-md`, `border border-white/15`, white text, and `Badge` for labels. The about page's
  `bg-black/40 backdrop-blur-md rounded-2xl border border-white/30` is the same idea at panel scale.
- Bars are soft rounded capsules with a gentle gradient rather than flat blocks, so they read as light rather than as
  spreadsheet fills.
- Colours stay inside the existing warm-on-sky family, at partial opacity over the glass so the sky shows through:
  gold for the season, violet for the travelling spirit, indigo for returning spirit groups, and the warm event family.
  Colour and badge agree, so seeing a violet bar often enough reads as "travelling spirit" before the label does.
- Progress bars glow at the filled end, echoing the light motif the site already leans on with `/light.webp` in the
  footer.
- Live entries get a subtle pulse, and bars lift slightly on hover using the `motion` package already in use in
  `QuestTracker`. Hover lift is a pure transform (translate) — the element's box must not change size or shape, and
  nothing layout-affecting, no blur and no shadow may animate per frame; hovering across a busy week has to stay at
  full frame rate. Keep motion restrained; the grid should be calm to read.
- The back button sits on its own dark glass backdrop, like the calendar panel, so it stays legible when a white cloud
  drifts behind it.
- Every clickable element needs `cursor-pointer`, consistent with `QuestCard` and the candle guide cards.

## Getting there from the quest page

The calendar is a separate page with a back button, not a modal. A modal would fight month navigation, linking and
mobile scrolling.

- A compact "Calendar" button with a `CalendarDays` icon, sitting to the RIGHT of the "Daily Quest Tracker" heading in
  `components/QuestTracker.tsx`. The heading stays centred and the button adds zero vertical height — the home page's
  vertical rhythm is untouched. One word, small icon, small button.
- A "Calendar" link in the `Links` column of `components/Footer.tsx`, using the existing `FooterLink`.
- A `/calendar` entry in `app/sitemap.ts`, `changeFrequency: "weekly"`.
- Page metadata via `createPageMetadata` from `lib/seo.ts`, matching how `/about` does it.

## Rendering and freshness

The data is static, so no Redis and no runtime fetching. "Today" drives the highlight, the grouping and the countdowns,
and it stays fresh for free: reading `searchParams` makes Next render the page per request, so every request computes
from `getCurrentSkyDay()` on the server at that moment. No `revalidate` export — it would be ignored on a dynamic
route — and no date logic split between server and client.

## Sync agent changes

Add a `## Calendar Sync` section to `docs/quest-sync-agent-prompt.md`, so the existing daily run owns it.

**Trigger.** Do not key off a day of the month, because a missed run would silently skip a month. Run the calendar sync
when `calendarCoverage.coverageThrough` is fewer than 45 days after today, or when `calendarCoverage.checkedOn` is more
than 30 days before today. Otherwise log "calendar coverage current" and move on. This is self-healing and observable
from the data file itself.

**Steps.**

1. Read `packages/utility/source/events/<year>/index.ts` from the thatskyapplication repository for the current and next
   year, then each event file it references, and take `start` and `end` from the `skyDate(y, m, d)` calls. A new event
   entry takes a `SkyEventPalette` token that no other event intersecting the same months already uses.
2. Convert every `end` by subtracting one day, because their `end` is exclusive and our `endDay` is inclusive.
3. Read season windows from `packages/utility/source/kingdom/seasons/<slug>/index.ts`, applying the same end
   conversion, and confirm the exclusivity per file rather than assuming it.
4. Derive the next travelling spirit windows. Their `travellingSpiritSchedule` extrapolates the next visit as the last
   known visit plus two weeks, and spirit visits are four days long. Windows are therefore predictable but identities
   are not: TGC announces the spirit only days ahead, and the rotation does not follow a guessable order. Write
   unannounced visits as `confidence: "expected"` with the title "Travelling Spirit", and never invent a spirit name.
5. Read returning spirit group windows from the `RETURNING_DATES` collection in
   `packages/utility/source/models/spirits.ts`, which maps a numbered group to a `start` and `end`. Individual spirit
   files reference their group by number, as in `visits: { returning: [12] }`, so the spirit names for a group come from
   scanning spirit files for that number. Groups are only recorded once announced, roughly every two to four months, so
   there is usually no future group to add. An empty result is correct and must not be filled in by extrapolation.
6. Cross-check every `confirmed` entry against the latest "This Month in Sky" post and the event's own post on
   thatskygame.com. Where they disagree, official wins, and log the discrepancy in `docs/automation-notes.md`.
7. Re-verify currently running events on every run. TGC has extended events after announcing them, by four days in 2024
   and one day in 2025, so a confirmed window is not immutable.
8. Never add an event, season or spirit that no source states. If a month has nothing confirmed, it stays empty and the
   UI says so.
9. Update `calendarCoverage`.
10. Validate, commit as `chore: sync calendar data`, push, and verify `/calendar` on the live site the same way the quest
    sync verifies the home page.

**Daily top-up.** Filling in an announced travelling spirit does not need to wait for the monthly run. The quest sync
already runs every day, so it should also check whether the nearest `expected` travelling spirit window now has a named
spirit. If it does, set the title, correct `startDay` and `endDay` to the announced dates — the announcement can differ
from the extrapolated window — and switch it to `confirmed`. That is a cheap single check on an existing run, and it
means the calendar names the spirit within a day of the announcement instead of within a month. If nothing is announced,
leave the entry alone and log nothing.

**Sources register.** Add thatskyapplication to `docs/event-information-sources.md`: what it is good for (structured
event, season and spirit-visit windows in Sky time), its freshness check (compare against official news, and treat the
repository's default branch as current), and the note that `packages/utility` is MIT licensed. We take factual dates
only and copy no code. Credit lives in the site Footer's Credits column (thatskyapplication alongside the existing
credits), never as a line on the calendar page itself.

## Gotchas

- `getSkyDateKey` is not zero-padded and doubles as a Redis key. Do not sort with it and do not change it.
- thatskyapplication's `end` is exclusive; ours is inclusive. Convert once, at the point the agent writes data.
- Confirmed event dates change. TGC extends events mid-run.
- Future travelling spirit identities are unknowable. The window is predictable; the name is not.
- Returning spirit groups are not predictable at all, in window or in membership. Expect months with none.
- A season only gets a grid bar in the months where it starts or ends. In any other month it would run the full width of
  every week and say nothing.
- Grid bars need per-week segmentation. One element per entry cannot wrap across a week boundary, so an entry becomes one
  segment per week it touches.
- Assign a bar's row once per entry, not once per week. Per-week packing is what makes TGC's own calendar shuffle Dear Van
  Gogh between rows mid-month.
- Colour belongs to the kind. Season, travelling spirit and returning group each own one fixed colour; only events
  carry a `palette`, drawn so no two events in the same displayed month share a token. Events do overlap — 7th
  Anniversary and Dear Van Gogh share ten days in the reference month — which is why one event colour is not enough.
- The `?month=` param arrives from links, not just the nav buttons. Malformed or out-of-range values render the current
  month.
- Do not add a popover or tooltip package for bar details. Only `@radix-ui/react-dialog` is installed, and hover is not
  available on touch.
- The wiki's own Days of Sunlight 2026 paragraph says "July 31, 2025". Third-party prose has typos, which is exactly why
  structured data is cross-checked against official posts rather than trusted alone.
- Next 16 gives `searchParams` as a promise. Await it.
- No `Temporal` in this app's runtime.

## Open question: single-day markers

TGC's calendar also marks point-in-time things inside the day cells with small icons: a patch going live, Aviary Village
dev and creator meetups, a Discord community Eden run. These are not windows and would not be bars.

They are outside the agreed scope, and the community ones come from Discord announcements rather than any structured
source, so they would need a different sync path. The data model should not preclude them: a `SkyCalendarMarker` type
with a single `day` instead of a range, rendered as an icon row inside the day cell, would slot in without disturbing
anything above. Not built in the first version.

## Implementation order

1. `lib/sky-day.ts`, padding the existing `getSkyDate()` output, with tests. `lib/utils.ts` is untouched.
2. `data/skyEvents.ts` with the types, `calendarCoverage`, a first hand-verified month of real entries, and the
   data-invariant test.
3. `lib/sky-calendar.ts` with tests for row assignment across a five-deep week, week segmentation, inclusive-end
   progress, and the rule for when a season gets a grid bar.
4. `app/calendar/page.tsx` plus the client shell holding dialog state, mirroring the `page.tsx` and `QuestTracker` split.
5. `CalendarTracks` and `CalendarEventDialog`, which together give a complete mobile page, then `CalendarMonthGrid` for
   desktop. Kept flat in `components/` to match the existing layout.
6. Entry points: the pill button in `QuestTracker`, the footer link, the sitemap entry, the page metadata.
7. The `## Calendar Sync` section in `docs/quest-sync-agent-prompt.md` and the thatskyapplication entry in
   `docs/event-information-sources.md`.

## Validation

`npm run typecheck`, `npm run lint`, `npm run fallow:dupes`, `npm run fallow:dead-code`, `npm run test:run`, then
`agent-browser` against a local dev server at desktop and mobile viewports to confirm the grid, the agenda, month
navigation limits, the dialog, and the empty-month state.
