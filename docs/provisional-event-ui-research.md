# Representing provisional and unconfirmed scheduled items

## Purpose

We need to show an upcoming travelling spirit window that is predictable from the
rotation but not officially announced. The window should read as real and worth
planning around, yet visibly less certain than a confirmed event, without breaking
our design language (dark sky-glass cards, kind-coloured gradient bars, soft light
motifs) and without repeating our known failure modes:

- whole-surface textures fight the dense text on a card
- partial accents read as fragmentary and unfinished
- dimming the whole surface was rejected
- dashed borders were rejected as tacky

This document surveys how shipping products actually solve this, groups the proven
mechanisms into families, and proposes one Sky-styled spin per family for both the
Gantt bar and the status card. Every proposal is tied to a named precedent so we
are borrowing conventions rather than inventing them.

## Survey by product category

### Calendar apps

- Outlook. A tentative appointment is rendered as a transparent block with grey
  diagonal stripes drawn across the time slot, and specifically a striped or
  diagonally hatched treatment on the left edge of the block. Busy is a solid fill;
  tentative is the same block with the hatch overlaid; out-of-office and free use
  their own edge colours. The key move is that the hatch signals uncertainty while
  the block keeps its position and label.
- Google Calendar. Responding "Maybe" marks an event tentative, shown with a hatched
  or faded fill; declined events are hollow with a strike; the base colour and
  position are retained so the item stays identifiable. Google's own patent language
  for "event chips" describes encoding accepted, tentative and declined states
  through fill and pattern rather than through separate widgets.
- Apple Calendar and Fantastical. Fantastical uses fill state on the availability
  dot to signal certainty: a solid dot means busy, a hollow circle means free, and a
  dotted circle means "might be available". This is the cleanest small-scale example
  of certainty encoded purely by how filled a shape is, from solid to hollow to
  dotted.

Relevance to us: the calendar world's default is a texture (hatching) laid over the
block. That is exactly our card failure mode, so we should not hatch a whole card.
But Fantastical's solid-to-hollow dot is a texture-free version of the same idea and
maps cleanly onto our constraints.

### Project, Gantt and roadmap tools

- Classic Gantt convention. When a task is not yet committed, bars and milestone
  diamonds are drawn as outlines only, not filled in. Fill means confirmed; outline
  means planned or provisional.
- ProductPlan and similar roadmap tools. Uncertainty in how long something will take
  is shown by slanting or feathering the end of the bar rather than a hard vertical
  edge, so the bar visibly "trails off" where the date is soft.
- Miro timelines. Bars with a missing start or end date are shown as gradient bars
  that fade toward the undefined end, prompting the user to fill the gap; the gradient
  itself communicates "this boundary is not fixed".
- Jira Advanced Roadmaps, Linear, Asana, Monday. These lean on explicit state colour
  and labelling (status categories, coloured bars, "no date" ghost rows) rather than
  a dedicated provisional texture. Confidence is generally carried by a label or a
  colour swap, not by a bar treatment.
- Now-Next-Later roadmaps (ProdPad). Rather than mark individual items, the whole
  format drops hard dates and sorts work into confidence horizons, so position in a
  band, not a per-item style, encodes certainty. Useful principle, but it needs a
  layout we do not have on a single month bar.

Relevance to us: two reusable ideas here. Outline-only bars (fill equals confirmed)
and feathered or gradient bar ends (soft boundary equals soft date). Both are
boundary or fill treatments, not surface textures over text.

### Sports fixtures and brackets

- TBC and TBD slots. Knockout brackets keep the match card fully drawn but fill the
  team name with a placeholder token: "TBC" (to be confirmed) or "TBD" (to be
  decided), or a greyed placeholder team that is swapped for the real entrant once
  known. The frame is committed; only the identity is held open.

Relevance to us: this is the placeholder-identity pattern. The slot exists and is
laid out normally; the uncertain part is quarantined to a single token so the rest
of the surface stays crisp.

### TV guides and cinema listings

- Electronic programme guides. Gaps and unknown future programmes are filled with a
  generic "To Be Announced" entry occupying the correct time slot, often given a
  reserved neutral genre colour distinct from real programming so the block is clearly
  a placeholder rather than a scheduled show.

Relevance to us: same as sports, an explicit "to be announced" label held in a
normally-shaped slot, distinguished by a reserved colour rather than a texture.

### Airline and rail schedules

- Estimated versus scheduled. Boards show a scheduled time as the baseline and an
  "Estimated" recalculated time when the real time is still firming up, typically
  with a status word ("Estimated", "Expected", "Delayed") and colour rather than a
  changed row shape. The word "Estimated" itself is the uncertainty marker.

Relevance to us: direct precedent for our already-approved "Expected" wording. The
industry treats an estimate as a labelled variant of a normal row, not a
differently-drawn one.

### Weather forecast confidence

- Fan charts. Popularised by the Bank of England, the central forecast is a line and
  uncertainty is shown as symmetric bands that widen into the future; near-term is
  narrow and confident, far-term fans out. Solid history, dashed central forecast,
  softening bands.
- Hurricane cone of uncertainty. The predicted track is a line and the surrounding
  possible area is a cone that widens with time and softens at its edges.

Relevance to us: the governing idea is that lower confidence is drawn as softer,
wider, more diffuse light, and higher confidence as tighter and more solid. This is
a natural fit for Sky's light motifs and for a feathered bar edge.

### Ticketing

- On sale soon. Events not yet purchasable keep a full listing card but swap the
  call to action for an "On sale soon" or "Presale" state and a date, so the card is
  complete and legible but its actionable element is held in a labelled pending state.

Relevance to us: the card stays whole; only the status element changes. Reinforces
the labelled-variant approach over restyling the whole surface.

### Other game companion and event trackers

- Sky community trackers themselves. Travelling spirits follow a broadly predictable
  rotation but the game never pre-announces which spirit or the exact identity, so
  community trackers present the next window as a prediction with the spirit identity
  held open. This is our exact situation: window predictable, identity and official
  confirmation not.
- Genshin Impact upcoming banners and characters. Official livestreams and community
  sites (for example Game8's "upcoming character silhouettes" pages) show
  not-yet-released characters as dark silhouettes, sometimes with a "?" where the
  name goes, then swap in the full art once revealed. The silhouette is the canonical
  "known to be coming, identity withheld" visual.
- Unrevealed rewards in battle passes and events. Locked or future reward tiers show
  a covered icon, a "?" token, or a generic chest in place of the real item art,
  keeping the tier laid out normally while masking only the reward identity.
- Genshin, FFXIV and WoW timeline sites (Paimon.moe and similar). Confirmed events
  render as normal coloured timeline bars; predicted or estimated future events are
  labelled "estimated" and given a lighter or less saturated bar so they read as
  provisional without leaving the timeline.

Relevance to us: games converge on two moves. Silhouette or "?" for unknown identity,
and a lighter or estimated-labelled bar for a predicted-but-unconfirmed slot. Both
keep the item in place and legible.

## The mechanism families the industry actually uses

Across every category above, the proven mechanisms collapse into four families.

### Family 1: fill-style change (ghost or hollow rendering)

Certainty is encoded by how filled the shape is. Solid equals confirmed, hollow or
outline equals provisional. Precedents: Fantastical solid dot versus hollow versus
dotted circle; classic Gantt outline-only bars and milestone diamonds. This family
restyles the whole shape coherently, so it does not lay a texture over text, does not
dim, is not dashed, and is not a fragmentary accent. It is the family that best
survives all four of our rejections at once.

### Family 2: placeholder identity (silhouette or question mark)

The slot is drawn normally and only the identity is held open, as a silhouette, a
"?", or a "TBC" token. Precedents: sports TBC and TBD brackets, EPG "To Be
Announced", Genshin upcoming-character silhouettes, masked battle-pass rewards. Best
where the uncertain thing is which spirit rather than whether the window happens. Risk
for us: a full silhouette can overstate uncertainty if we are fairly confident about
the identity, and it changes what the card claims to know.

### Family 3: explicit labelling (status chip)

A short status word in an otherwise normal item: "Estimated", "Expected", "TBC", "On
sale soon", "To Be Announced". Precedents: airline and rail boards, ticketing,
cricket fixtures, EPG. We have already approved an "Expected" glass badge, so this
family is partly adopted. It is the lowest-effort and safest, but on its own it is
the one the brief flagged as feeling insufficient, since a chip alone can be missed
in dense text.

### Family 4: confidence gradient (feathered or soft boundary)

Lower confidence is drawn as softer, more diffuse light, especially at the temporal
edges; higher confidence is tighter and more solid. Precedents: Bank of England fan
chart, hurricane cone of uncertainty, ProductPlan slanted bar ends, Miro gradient
bars for missing dates. This is a boundary or edge treatment rather than a
whole-surface texture, so it clears the text-legibility problem, and it is the most
native to Sky's light language. The honest caveat is that on a card, an inward light
wash sits close to the rejected "partial accent" and could read as fragmentary if not
carried cleanly across the whole surface.

Honest overall read: Family 1 is the safest primary mechanism because it is the only
one that satisfies every stated rejection while reusing our glass and light
vocabulary. Family 3 is already approved and should ride along as reinforcement.
Families 2 and 4 are strong but situational and carry the noted risks.

## Sky-styled proposals

Each proposal gives a concrete spin for the bar and the card, in our colour, opacity
and light terms, grounded in a named precedent.

### Proposal 1: hollow glass, from Family 1 (fill-style change)

Precedent: Fantastical's solid-to-hollow availability dot and classic Gantt
outline-only bars.

- Bar. A confirmed bar is the kind-coloured gradient filled to full opacity. A
  provisional bar becomes a hollow glass bar: the interior drops to the same dark
  sky-glass as the track (roughly an 8 to 12 percent kind-colour tint over the glass),
  and the kind gradient is relocated into a continuous 1.5px luminous inner stroke that
  traces the full rounded-rectangle outline. The colour identity is preserved as light
  on the rim; the body reads as glass holding light that has not yet been lit. It is a
  continuous stroke, so it is not dashed; the whole shape is restyled, so it is not a
  fragment or a dim.
- Card. The confirmed card is filled sky-glass with a kind gradient accent. The
  provisional card keeps the identical silhouette but goes hollow: the kind gradient
  recedes from the fill into a thin luminous border-light around the entire card edge,
  with the interior staying dark glass. Text keeps full contrast against the dark
  glass. The approved "Expected" badge stays in place.

### Proposal 2: withheld spirit, from Family 2 (placeholder identity)

Precedent: Genshin upcoming-character silhouettes and sports TBC placeholder slots.

- Bar. Where a confirmed bar carries the spirit's emote glyph and name at its start,
  the provisional bar shows a small constellation node with a "?" in place of the
  identity, and the body uses a neutral unlit star-field gradient rather than a kind
  colour, because the kind is not known until the spirit is announced.
- Card. Replace the spirit portrait with a soft silhouette filled with the dark-sky
  gradient and a light scatter of faint stars, and put a "?" where the spirit name
  would sit, while the window dates and countdown stay fully legible. This is the
  right choice only when we genuinely do not predict the identity; if we do predict it,
  this overstates our uncertainty.

### Proposal 3: expected chip, from Family 3 (explicit labelling)

Precedent: airline "Estimated" boards, ticketing "On sale soon", EPG "To Be
Announced", and our already-approved "Expected" wording.

- Bar. Attach the small glass "Expected" pill to the leading end of an otherwise
  fully styled bar. Minimal change, maximal familiarity.
- Card. Keep the approved "Expected" glass badge and add a single quiet sub-line such
  as "window predicted, not yet announced". Safest and cheapest, but best used to
  reinforce another family rather than to carry the distinction alone.

### Proposal 4: dawning light, from Family 4 (confidence gradient)

Precedent: Bank of England fan chart, hurricane cone of uncertainty, and ProductPlan
feathered bar ends.

- Bar. Keep the kind gradient fill, but feather both temporal ends: the fill ramps
  from full kind colour across the centre to zero opacity over the last 15 to 20
  percent at each end, dissolving into the track like light diffusing at the edges of
  a predicted window. Crisp ends read as a fixed date; feathered ends read as a soft
  one.
- Card. Let a faint kind-coloured aurora wash bleed inward from the top edge of the
  card at low opacity, roughly 15 percent, fading to nothing before the text block, so
  the card looks lit by light that has not fully arrived. Carry the wash across the
  whole width so it reads as intentional rather than as a partial accent; that is the
  detail that keeps this clear of our fragmentary-accent failure mode.
