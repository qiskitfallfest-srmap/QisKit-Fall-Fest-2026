# QCTF Runbook

Quantum Capture the Flag, Day 2 of the on-campus festival: **Tuesday 27 October 2026, ALC, 11:30 AM – 5:00 PM IST**.

QCTF runs inside the learning portal. It uses the portal's Google sign-in, the `qctf_*` tables in the main Supabase project, and the admin console. Players solve on their own laptops or in Colab and submit only the flag string (`qctf{...}`), so no code runs on our servers.

## Where things are

| What | Where |
|---|---|
| Arena (players) | `/learning/qctf`, `/learning/qctf/[id]` |
| Projector scoreboard (public) | `/qctf/scoreboard` |
| Control panel (admins) | `/learning/admin?tab=qctf` |
| API | `app/api/qctf/*`, `app/api/admin/qctf` |
| Server logic | `lib/qctf/server.ts` |
| Schema | `supabase/migrations/20261023230000_create_qctf_tables.sql` |
| Challenge loader | `tools/qctf_challenges_to_sql.py` |
| Competition challenges with flags | `qctf-private/challenges.json` (gitignored, never commit) |

## Rules built into the code

- **Who can enter:** admins always. Testers (`allowed_emails.role = 'tester'`) once the state is not `hidden`. Everyone else only once the state is `announced` or later, and only if their email is on the entry list (`qctf_eligible_emails`).
- **Teams:** 2 to 6 members. Hackathon teams carry over: the first time a hackathon member opens the arena, they join the QCTF team linked to their hackathon team. Walk-ins create a team and share its 6-character join code. A team's roster locks after its first solve; admins can remove members from the control panel.
- **Scoring:** fixed points per challenge, once per team. Ranking is by points, then by who reached that total first.
- **Attempts:** 10 flag submissions per player per minute. Wrong flags cost nothing. Every attempt is logged.
- **Blocks:** challenges belong to `practice` (Warm-up), `block_1`, `block_2` or `final`. Players see only released blocks. Admins see all of them, with unreleased ones marked.
- **Runs:** every team, solve and attempt belongs to a run (`rehearsal-1`, `live`, …). Starting a new run gives everyone a clean slate without deleting anything.
- **Freeze:** switching to `frozen` stops the public scoreboard at that moment. Submissions still count. Admins see live standings.

## Arena states

| State | Who can enter | Flags accepted |
|---|---|---|
| hidden | admins | admins only |
| rehearsal | admins, testers | yes |
| announced | + entry list | yes (release only the Warm-up) |
| live | + entry list | yes |
| frozen | + entry list | yes, public scoreboard frozen |
| closed | + entry list | no |

## One-time setup

1. Apply the migration (Prompt A). It adds tables only and starts in `hidden`, so production is unaffected.
2. Push `feat/qctf-ui`. Vercel builds a preview. Get its branch URL (Prompt C).
3. Add the preview URL to Supabase Auth redirect URLs so Google sign-in works there (Prompt B).
4. Mark rehearsal volunteers as **Tester** in Admin → Access & Whitelist. Role changes can take up to an hour to apply because the whitelist is cached in Redis, so do this early.
5. Edit `qctf-private/challenges.json`, generate the SQL and load it (Prompt D).

## Antigravity prompts

**Prompt A: apply the QCTF migration (Supabase MCP)**

```text
On Supabase project jpciyrodeppqpkwqblpk, apply the migration in
supabase/migrations/20261023230000_create_qctf_tables.sql (branch feat/qctf-ui) using
apply_migration with the name create_qctf_tables. It only creates new qctf_* tables, one
platform_config row (key 'qctf') and six practice challenges; do not modify any other table.
Then verify and report:
1. The six tables qctf_challenges, qctf_eligible_emails, qctf_teams, qctf_team_members,
   qctf_submissions, qctf_solves exist with RLS enabled.
2. Each has exactly one policy, for service_role, and anon/authenticated have no grants.
3. platform_config has key 'qctf' with state "hidden".
4. qctf_challenges has 6 rows, all with block 'practice'.
5. get_advisors (security) reports nothing new for qctf_* tables.
```

**Prompt B: allow sign-in on the preview URL (Supabase dashboard or MCP)**

```text
For Supabase project jpciyrodeppqpkwqblpk, in Authentication > URL Configuration, add
<PREVIEW_BRANCH_URL>/** to Redirect URLs. Use the exact branch URL from Vercel, not a
*.vercel.app wildcard. Do not change the Site URL or any other auth setting. Report the
full Redirect URLs list afterwards.
```

**Prompt C: preview deployment (Vercel MCP)**

```text
For Vercel project qis-kit-fall-fest-2026 (prj_qd9FpccmCZDXkHGxti1YIxjMKu9N), READ ONLY:
1. Find the latest deployment for git branch feat/qctf-ui and report its state, URL and the
   stable branch alias URL.
2. If the build failed, return the build log errors.
3. Confirm these environment variable NAMES exist for the Preview environment (never print
   values): SUPABASE_SERVICE_ROLE_KEY, SESSION_SECRET, UPSTASH_REDIS_REST_URL,
   UPSTASH_REDIS_REST_TOKEN, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY.
4. Report the Deployment Protection setting for previews.
Do not change anything.
```

**Prompt D: load competition challenges (Supabase MCP)**

First, on the machine with the private file:

```bash
python tools/qctf_challenges_to_sql.py qctf-private/challenges.json > qctf-private/load_challenges.sql
```

```text
On Supabase project jpciyrodeppqpkwqblpk, run the SQL in qctf-private/load_challenges.sql
with execute_sql. It upserts rows into public.qctf_challenges only. Then report
SELECT id, block, points, is_enabled FROM public.qctf_challenges ORDER BY block, sort_order;
Do not print the flag_hash column.
```

## Rehearsal

1. In the control panel: start run `rehearsal-1`, set the state to **Rehearsal**, and release **Warm-up**.
2. Testers sign in on the preview URL, form teams (one via a hackathon account, one walk-in with a join code), and solve the practice set.
3. Open `/qctf/scoreboard` on the ALC projector. Check the latest-solves feed and full screen.
4. Release **Block I**, then switch to **Frozen** and back, then **Closed**. Confirm what players see at each step.
5. Start run `rehearsal-2` to clear the board. Repeat on campus Wi-Fi in the ALC on 26 October.

## Event day (27 October)

| Time | Action in the control panel |
|---|---|
| Before 11:00 | Start run `live`. Paste the entry list. State **Announced**, Warm-up released. |
| 11:30 | State **Live**. Release **Block I**. |
| 14:00 | Release **Block II**. |
| 15:30 | Release **Final window**. |
| 16:30 | State **Frozen** (public scoreboard stops). |
| 17:00 | State **Closed**. Final standings are in the control panel. |

Keep a paper backup: the challenge list with flags (printed by the organizer only) and a sheet to record team, challenge and time if the site is unreachable.
