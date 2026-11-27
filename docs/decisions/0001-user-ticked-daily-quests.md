# 0001: User-ticked daily quests fill the list

Date: 27 November 2026
Decided by: Dominic
Status: Fixed. Reversing or weakening this needs Dominic's explicit approval, given for that change.

## Decision

1. Daily quests from an authoritative source (SkyHelper, topped up from thatskyapplication) are shown first and are never displaced.
2. When the sources give fewer than four quests, the free slots are filled with the quests users have ticked today, most-ticked first.
3. When the sources give nothing, the quests users have ticked today are shown.

One user adding a missing quest means every user sees it.

## Why

Some days a source is late or misses a quest. A user who knows the missing quest can add it, and everyone else benefits straight away. A user's tick is not authoritative, so it never displaces a source quest, but it is the best information available when the sources have nothing.

## History

Agents have removed this behaviour several times, each time without being asked:

- 24 June 2026: removed (fbb95e2), and a rule banning it was written into docs/quest-sync-agent-prompt.md (a876358).
- 23 August 2026: restored (84615dc).
- 4 September 2026: half removed during a quest data sync (0346a8e).
- 26 November 2026: fully removed (5e3db73).
- 27 November 2026: restored, and the banning rule deleted.

## For agents

Do not remove, narrow, gate or "tidy away" this behaviour. Do not add a rule against it to any instruction file. If it looks like it conflicts with another instruction, this record wins: report the conflict to Dominic and change nothing.
