# SWITCHYARD — Devpost Submission Draft

STATUS: REDDIT DEVVIT APP UPLOADED AND PLAYTESTED, DEVPOST NOT JOINED OR SUBMITTED. The original test subreddit is still private; a request to make it public was submitted November 13, 2026, and is awaiting Reddit moderator review. Do not claim contest entry or prize qualification yet.

Competition: Reddit Game of the Day Hackathon 2026
Deadline: December 8, 2026, 18:00 PST
Track: Best Daily Game / Honorable Mention
Title: SWITCHYARD — One Circuit. One Day. One Community.

## Elevator pitch
Rotate 25 circuit tiles to light up the exit. Everyone on Reddit gets the same new challenge each day, and every community can compare replay-verified results on its own leaderboard.

## Inspiration
A shared daily puzzle becomes more engaging when the result is part of a community ritual. SWITCHYARD turns a few minutes of wiring decisions into something people can play, compare, discuss, and return to tomorrow. No adverts or in-app purchases.

## What it does
- Daily deterministic 5×5 challenge; tap a tile to rotate it and power the exit.
- Unassisted competitive run or casual play with optional hints.
- Local daily streak, turn count, result sharing, reset and score retry.
- Subreddit-specific leaderboard with ten best verified scores and daily completion count.
- The server independently replays the client's exact rotation transcript and rejects invalid, impossible or post-win inputs, using Reddit authenticated identity.
- Responsive layout across 320–768px, keyboard accessible and reduced-motion friendly.

## How we built it
Devvit Web 0.15.3, a React inline splash screen, HTML/CSS/JavaScript expanded game, Hono API, TypeScript replay engine and Redis sorted-set leaderboards. The same deterministic seeded daily puzzle is reconstructed independently on the server.

## Technical challenges
1. Deterministic parity: validated server and client boards on 30 UTC dates, including browser-click replay tests.
2. Competitive integrity: server trusts neither reported move count nor username. It replays bounded move histories.
3. Responsive layout: checked via genuine Chrome mobile emulation at 320, 390 and 430px, plus desktop at 768px.
4. Reddit integration: one identical challenge per UTC day, with independent subreddit leaderboards.

## What we're proud of
This is a working interactive puzzle, not a prototype image. Build, lint, type checks and gameplay tests all pass. It uses no third-party ads, telemetry or proprietary assets.

## Next steps
Reddit Devvit app version 0.0.1 was uploaded and playtest version 0.0.1.2 rendered in the actual Reddit post. A real tile click incremented the in-game rotation counter from 0 to 1. Await public subreddit approval, verify leaderboard with a second authorized Reddit account, and finish Devpost entry with account-owner participation.

## Links
Code: https://github.com/rometet/switchyard-daily-game
Playable standalone preview: https://rometet.github.io/remote-services/tools/switchyard.html
Devvit app listing (uploaded privately): https://developers.reddit.com/apps/switchyard-rome
Reddit test subreddit (PRIVATE, public status change REQUESTED): https://www.reddit.com/r/switchyard_rome_dev/
Reddit playable post (confirmed in owner playtest; others cannot access yet): https://www.reddit.com/r/switchyard_rome_dev/comments/1xv4zw2/switchyard_daily_circuit_puzzle/
Owner playtest preview: https://www.reddit.com/r/switchyard_rome_dev/?playtest=switchyard-rome
Screenshots: docs/switchyard-mobile.png ; docs/switchyard-desktop.png
Optional demo video: NOT RECORDED — should show actual Reddit app operation, under 60 seconds

## AI assistance and rights disclosure
AI assistance was used for design, implementation, testing and documentation. No human-only development claim is made. This original game uses no copied art; the official Devvit starter template retains its BSD-3-Clause LICENSE. The named entrant must personally review and accept applicable competition and account terms before entry.

## Final acceptance checklist
- [x] Working daily puzzle
- [x] Independently verified server replay
- [x] Reddit Redis leaderboard feature
- [x] Build / lint / typecheck pass
- [x] 30-date replay and parity test pass
- [x] 320 / 390 / 430 / 768px mobile and desktop UI verification
- [x] Public GitHub source
- [x] Reddit OAuth login, authenticated as u/Rome6882
- [x] Private Devvit app upload (v0.0.1)
- [x] Working test subreddit and owner-visible Reddit game post
- [x] Real Reddit inline/expanded game display and tile rotation verified
- [ ] Subreddit publicly visible to judges (approval request sent; still private)
- [ ] Second Reddit account leaderboard test
- [ ] Devpost account sign-in and entrant acceptance of contest terms (human account owner)
- [ ] Devpost competition registration / formal project submission
- [ ] Prize award and payout, if any
