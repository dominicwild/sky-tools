# Quality sweep, 1 August 2026

Notes for triage only. Nothing in the app was changed. Findings were gathered by driving the
running site (home, calendar, about and the shared footer) at 1440px, 768px and 390px, opening the
event dialog, running the search, and inspecting cursors and states. Screenshots referenced by
filename live in the scratchpad folder. The app was being edited live during the sweep, so the
calendar route repeatedly swapped between the real page and a throwaway design preview; findings
that touch volatile areas carry a note.

## Triage notes, added after the sweep

The app was being fixed while the sweep ran, so three findings need context before triage:

- Finding 19 (mobile footer): already fixed during the sweep. The footer now uses responsive padding
  and aligned heading rows; heading tops measure identical at 390px and nothing overflows. Treat as
  done unless it looks wrong on a fresh load.
- Finding 8 (no month grid on mobile): deliberate, documented design. The mobile calendar page is the
  tracks list; the grid and month navigation are desktop-only by decision. A mobile month view (for
  example a vertical agenda) remains an open idea, not a defect.
- Findings 11 and 12 (arrow cursor and a missing arrow): both arrows render as identical pills at all
  times; a disabled arrow keeps the default cursor on purpose, and neither arrow is ever removed. The
  sweep likely caught a mid-edit state; re-verify before acting.

## Summary

The site has a clear, likeable identity and the desktop calendar and about pages are in good shape.
The weakest areas are responsive behaviour and a few interaction details rather than the visual
language. The mobile footer is genuinely broken (cramped three columns, a heading that wraps and
drops its underline, a word that breaks mid-way, uneven column bottoms). The mobile calendar showed
no month grid at all in repeated checks, so the calendar page loses its main content on small
screens. On the home page the quest cards waste most of their area around a small centred image, and
the search field steals focus on load and covers the tracked quests. The rest is smaller polish:
cursor inconsistencies, a couple of copy errors on the about page, and some footer labelling.

## Home

1. High. Quest cards, every width. Each quest card is a large dark panel with a small image floated
   in the middle, so most of the card is empty and the layout reads as unfinished (see qa-1.png and
   qa-20.png). Let the guide image fill the card, or size the card to the image.
2. Low. Header, all widths. The decorative Sky wordmark dominates the hero while the real page title
   "Daily Quest Tracker" sits below it in small low-contrast grey, inverting the hierarchy. Lift the
   title and calm the wordmark so the page name leads.
3. Medium. Search field, all widths. The search input auto-focuses on load, which forces the whole
   quest catalogue dropdown open over the tracked quests and pops the keyboard on mobile (qa-3.png).
   Only open suggestions when the user actually focuses the field.
4. Medium. "Clear All" button and the quest card "x" remove buttons. Both use the default arrow
   cursor instead of a pointer, so they do not feel clickable. Add a pointer cursor to every control.
5. Low. Search field. Searching a term with no matches ("zzzqqq") silently closes the dropdown with
   no feedback (qa-20.png). Show a short "no quests found" empty state.
6. Low. "Daily Quests (3/4)" heading. The count is ambiguous, it is unclear whether it means added,
   completed or available. Spell out what the two numbers mean.
7. Low. Search dropdown rows. The "Add" action is plain text with weak affordance next to each
   suggestion. Give it a clearer button or icon-plus-label treatment.

## Calendar

8. High. Mobile, 390px. The month grid, the month title and the previous and next controls did not
   appear on mobile in repeated checks, leaving only the summary cards, so the calendar page offers
   no calendar, no date view and no month navigation on phones (qa-8.png versus the desktop grid in
   qa-8b.png). Provide a real mobile calendar view. Note, the grid markup was sometimes present in the
   DOM but not visible, and the route was being edited during the sweep, so confirm on a stable build.
9. Medium. Month title, desktop. "August 2026" is centred on the full viewport, so it floats over the
   gap between the calendar and the right rail rather than over the calendar it labels (qa-9.png).
   Centre it over the calendar column.
10. Medium. Month navigation, desktop. The previous and next arrows sit at opposite edges of the whole
    page (far left under the "Back" button, far right past the rail), so they do not read as one
    paired control (qa-9.png). Group both arrows with the month title.
11. Medium. Previous month arrow, desktop. It uses the default cursor while the next month arrow uses
    a pointer, an inconsistency between two sibling controls. Make both use a pointer cursor.
12. Low. Month navigation, current month. At the latest month the next arrow is removed entirely
    rather than shown disabled, leaving a lopsided single-arrow header. Prefer a visible disabled
    state so the control stays put. Note, this behaviour flickered during live editing, so verify.
13. Low. Event dialog. The cosmetic image floats at the top with uneven whitespace and a short,
    seemingly arbitrary divider line beneath it (qa-13.png). Give the image a defined area so it sits
    deliberately.
14. Low. Event dialog copy. "players can find it at Home and Aviary Village and buy from it" reads
    awkwardly, "buy from it" is unclear. Reword to something like "and buy the items there".

## About

15. Medium. Mobile, 390px. The content card is held to a narrow width with large side gutters, so the
    body text wraps into choppy three and four word lines (qa-15.png). Let the card use the available
    mobile width.
16. Medium. Copy, "Did you make all these guides?". "Credit goes wholly towards those who makes these
    resources" is grammatically wrong and awkward (qa-16.png). Change to "Credit goes to those who
    make these resources".
17. Medium. Copy, "I don't see a quest I searched for?". "If you have any other ideas of suggestions"
    should read "ideas or suggestions". Fix the typo.
18. Low. Copy, "How do I use it?". "Tap the visual guide or the video button" uses mobile-only wording
    on a page also seen on desktop, and "video button" does not match the "Video Guide" label used on
    the home page. Use consistent, device-neutral wording.

## Footer

19. High. Mobile, 390px. The footer keeps three columns crammed side by side, which breaks in several
    ways at once, the "Other Tools" heading wraps to two lines and its underline drops below the other
    two headings, "thatskyapplication" breaks mid-word into "thatskyapplica" and "tion", "Sky Shard
    Events" wraps, and the three columns end at different heights (qa-19.png). Stack the columns or
    drop to fewer on narrow screens. The desktop and 768px footer are clean.

## Global

20. Medium. Content width, desktop. On a 1440px screen the main content sits in a narrow centred
    column with very wide empty margins on both sides, which makes the page feel sparse, especially
    with the empty quest cards (qa-20.png). Use more of the available width or tighten the empty space.
21. Low. Footer headings, all widths. Each heading carries a different decorative emoji ("Links" with
    a sparkle, "Other Tools" with a butterfly, "Credits" with a turtle), which reads as inconsistent
    and a little tacky. Remove them or commit to one consistent treatment.
22. Medium. Footer, all widths. "Other Tools" is used both as a column heading and as a link inside
    that same column, which is redundant and confusing. Rename one of the two.
23. Low. Footer, "Credits" column. The column lists external tools and communities (Sky Discord, Sky
    Infographics, thatskyapplication, Sky Wiki) rather than credits, so the label is misleading.
    Rename it to match the content.
24. Medium. Text over the background, hero areas. Light text over the bright, moving clouds (page
    titles and small card meta labels) can drop below comfortable contrast as the clouds drift behind
    it. Add a subtle scrim behind hero text or darken the text.
25. Low. Search field styling. The saturated blue gradient search bar is the loudest element on the
    home page, louder than the content it serves, and sits apart from the calmer glass language used
    elsewhere. Bring it closer to the glass style.

## Ten improvements to prioritise, in order

- [ ] 1. Fix the mobile footer so columns stack or reduce, headings do not wrap unevenly and no word
      breaks mid-way (finding 19).
- [ ] 2. Give the calendar a real mobile view with the month grid and navigation (finding 8).
- [ ] 3. Rework quest cards so the image fills the card and the dead space goes (finding 1).
- [ ] 4. Stop the search field auto-focusing and covering the tracked quests on load (finding 3).
- [ ] 5. Add pointer cursors to "Clear All", the quest remove buttons and the previous month arrow
      (findings 4 and 11).
- [ ] 6. Fix the two about page copy errors, "those who make" and "ideas or suggestions" (findings 16
      and 17).
- [ ] 7. Centre the month title over the calendar and group the two month arrows with it (findings 9
      and 10).
- [ ] 8. Let the about card use the mobile width instead of choppy short lines (finding 15).
- [ ] 9. Resolve the duplicated "Other Tools" heading and link in the footer (finding 22).
- [ ] 10. Use the desktop width better and drop the mismatched footer heading emoji (findings 20 and
      21).
