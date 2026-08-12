# Handover — Job Automation System

**For:** a fresh Usamatic Agent session started **on Usama's own laptop**
**From:** remote session `9d38bd1d` (cloud VM), 2026-08-12
**Read first:** [`docs/PHASE1_DISCOVERY.md`](./PHASE1_DISCOVERY.md) — full audit and architecture

---

## 0. Paste this to start the new session

> I'm building a local job-application automation system on this laptop.
> Phase 1 discovery is complete — read `docs/HANDOVER.md` and
> `docs/PHASE1_DISCOVERY.md` in the `workflux` repo (branch
> `claude/job-automation-discovery-wg83ja`) before doing anything.
>
> Confirm you're running locally (not a cloud container) by checking
> `hostname`, `uname -a`, and whether Playwright can reach the network.
> Then start at Section 3 of the handover.

---

## 1. What happened, in one paragraph

A Phase 1 discovery audit was requested. It ran in a **Usamatic Agent cloud VM, not
on the laptop** — so the requested machine audit, local document discovery, and
browser-session inspection were impossible and are marked `UNKNOWN` in the
report. What *was* established: Chromium has no network egress in that
environment (verified three ways), the connected **Indeed MCP works and covers
Dubai/AE**, the user's real profile was recovered from their own Indeed account,
their **Indeed resume has a broken PDF text layer**, and `workflux` is a shallow
prototype with the right shape but the wrong runtime. The report is committed on
branch `claude/job-automation-discovery-wg83ja`, open as draft PR #2.

---

## 2. State of things

| Item | Status |
|---|---|
| `docs/PHASE1_DISCOVERY.md` | ✅ Committed, pushed, PR #2 (draft) |
| `docs/HANDOVER.md` | ✅ This file |
| Any automation code | ❌ **None written.** Discovery phase only, as instructed. |
| `config/profile.json` | ❌ Does not exist — **this is the gating blocker** |
| Vercel deploy on PR #2 | ❌ Red. **Not caused by the diff** (docs-only; `npm ci && next build` exits 0 locally). Cause is Vercel project config, unreadable without Vercel access. **Recommendation: disconnect Vercel, don't debug it.** |
| Nothing was submitted, applied to, purchased, or modified on any job platform | ✅ |

---

## 3. First 20 minutes on the laptop

Run these and paste the output into the new session:

```bash
# 1. Prove you're local
hostname; uname -a; ps -p 1 -o comm=

# 2. Environment
sw_vers 2>/dev/null || cat /etc/os-release
node -v; npm -v; python3 -V; git --version
df -h ~

# 3. Browsers
ls /Applications 2>/dev/null | grep -iE 'chrome|firefox|edge|brave'

# 4. Documents — the thing the cloud session could not see
find ~/Desktop ~/Documents ~/Downloads -maxdepth 3 -type f \
  \( -iname '*resume*' -o -iname '*cv*' -o -iname '*cover*letter*' \
     -o -iname '*portfolio*' -o -iname '*linkedin*' \) 2>/dev/null
```

Then verify the browser actually works locally — the single check that decides
whether Phase 5 is possible:

```bash
mkdir -p ~/pw && cd ~/pw && npm init -y && npm i playwright && npx playwright install chromium
node -e "const{chromium}=require('playwright');(async()=>{const b=await chromium.launch({headless:false});const p=await b.newPage();await p.goto('https://example.com');console.log('OK:',await p.title());await b.close();})()"
```

A visible browser window and `OK: Example Domain` means everything the cloud
session couldn't do is available.

---

## 4. Do this before writing any code

**Fix the Indeed resume.** This is worth more this week than the entire system.
Extracted text currently reads `Fullfunnelmarketing`, `brand&identitysystems`,
`Teamleadership,budget&vendormanagement` — spaces stripped. Every ATS parsing it
reads that. Also on the record:

- Company and title **swapped** on Digital Maven FZE
- **No end dates** on any role; four roles have no dates at all
- **No title on the current Sykon Properties role**
- "Crisis Capitalization Mastery 2026" (a certification) filed as employment
- The DLD dashboard project filed as employment

Regenerate the PDF from a text-native tool — not an image export — and verify
before uploading:

```bash
pdftotext -layout resume.pdf - | head -40   # spaces must be intact
```

**Also start now** (24h lead time): LinkedIn → Settings → Data Privacy → *Get a
copy of your data*. This is the sanctioned way to get profile, positions, skills,
education, and `Job Applications.csv`. It replaces any need to scrape LinkedIn.

---

## 5. Blocking inputs — Phase 1 cannot start without these

None of this exists in any file the cloud session could reach. It has to come
from the user.

**Career facts**
1. Exact current title at Sykon Properties
2. End dates for every past role
3. Nationality, UAE visa status/type, notice period
4. **Years of experience per skill** — Indeed stores skills as flat text with no
   proficiency data, so *every* skill is currently `UNKNOWN`. The question engine
   escalates on each gap. Top 10 minimum.
5. Quantified achievements — budgets, ROAS, CPL, team sizes, revenue influenced.
   The biggest weakness in the current resume.

**Job preferences**
Target titles (confirm/revise the seven Indeed has) · excluded titles ·
**excluded companies — confirm Sykon Properties is on the list** · target
locations (Dubai / UAE / GCC / international?) · remote-hybrid-onsite · target
salary (only the AED 12,000 *minimum* is known) · employment types · industries
to pursue and avoid · seniority target.

**Automation policy — the decision that shapes the build**
May the system ever click submit, or does it always stop at "prepared, awaiting
you"? Recommended: **always stop**, at least until a month of dry runs has been
watched. Also: which sites may it touch, daily ceiling, and the answer policy for
sponsorship/visa and salary-expectation questions.

---

## 6. The architectural gap that needs a decision

**The Indeed MCP is a Usamatic Agent session connector, not a general API.** A
standalone Node daemon cannot call it without implementing an MCP client and its
OAuth flow. This was not resolved in Phase 1 and it changes the runtime design.
Three options:

| Option | How it works | Trade-off |
|---|---|---|
| **A. Usamatic Agent as scheduled discovery** | A cron-fired Usamatic Agent session runs discovery via the Indeed MCP and writes to SQLite; the local daemon does scoring, documents, and the queue | Pragmatic, works today. Contradicts the clean "Usamatic Agent is not the runtime" separation. |
| **B. MCP client in the runtime** | The daemon speaks MCP to the Indeed server directly | Cleanest long-term. Real OAuth work; server may not permit non-Usamatic Agent clients. |
| **C. Browser-assisted discovery** | Playwright on the laptop against Indeed with a real logged-in session | No MCP dependency. Highest terms-of-service exposure; Indeed already 403s datacentre clients. |

**Recommendation: A now, B later.** It gets a working pipeline tonight without
betting on OAuth work of unknown size, and the SQLite boundary means swapping to
B later touches one module.

---

## 7. Build order

Everything through Phase 4 is pure logic — no browser, no network — so it's
genuinely achievable in one focused evening. Phase 5 onward is not, and
shouldn't be rushed.

| Phase | Deliverable | Tonight? |
|---|---|---|
| **1. Profile** | `config/profile.json` + schema + validator; LinkedIn export importer | ✅ if Section 5 answered |
| **2. Database** | SQLite via `better-sqlite3`, migrations, repositories, dedupe (`job_hash`) | ✅ |
| **3. Discovery** | Indeed ingestion + JD parser + normaliser | ✅ (per Section 6 decision) |
| **4. Scoring** | Two-stage filter + weighted 0–100, `config/scoring.yaml` | ✅ |
| **5. Browser** | Playwright controller, guards, mock-ATS test suite | ❌ next session |
| **6. Documents** | Resume variants, cover letters, validation gates | ❌ |
| **7. Approval** | Queue + local dashboard | ❌ |
| **8. Submission** | Gated, human-triggered | ❌ **not until ≥30 clean dry runs** |

**Two implementation details that are easy to get wrong:**

1. **Salary scoring must be `null`-aware.** All 10 live Indeed results returned
   `N/A` for compensation. Scoring missing salary as zero rejects the entire UAE
   market. Correct behaviour: drop the factor and **renormalise the denominator**,
   then flag `salary_unknown`.
2. **`job_hash` must be content-based**, not source IDs. Indeed returned
   positional IDs (`JOBSEARCH_1`…) that change between searches, and the *same*
   Sky Avenue role appeared twice under different IDs. Use
   `sha256(normalized_company | normalized_title | location)`.

---

## 8. Decisions already made — don't relitigate

TypeScript on Node 22 · SQLite (`better-sqlite3`, WAL) · Playwright headed with
persistent context · `node-cron` under an OS supervisor · local Next.js dashboard
adapted from `workflux`'s existing pages · `pino` JSONL with a redaction filter ·
`claude-opus-5` via `@anthropic-ai/sdk` for document generation only.

**Reuse from `taskcreator`:** `lib/claude/` (structured calls, schemas, context
builder) and `mammoth` for DOCX. It's proven and already uses the right model.

**Do not carry over from `workflux`:** the OpenAI `gpt-3.5-turbo` path, the
stubbed `alert()` job search, or the silent Supabase mock fallback — that last
one makes failures invisible and must be deleted, not ported.

**Where to build:** a new local directory (`~/job-automation`), not inside
`workflux`. `workflux` contributes UI structure and the
`applications`/`profiles`/`resumes` model as reference. No new Vercel project, no
new Supabase project — the design is local-first.

---

## 9. Constraints that do not move

- **No CAPTCHA solving, no anti-bot evasion, no fingerprint spoofing.** Detection
  results in stop-and-notify.
- **No cookie, token, or credential access.** Authentication is always manual, by
  the user, in a visible browser.
- **No fabricated facts.** Every claim in a generated document must trace to a
  `profile.json` path or the build fails.
- **Submission is human-triggered** until a month of dry runs says otherwise.
- **`UNCERTAIN` is terminal.** If a submit was clicked and the outcome is
  unclear, never auto-retry — duplicate applications are visible to employers.
- **Any prohibition signal stops that site permanently.** 403, 429, CAPTCHA,
  automation-blocked interstitial.
- **LinkedIn's User Agreement prohibits automated access.** Mass automated Easy
  Apply risks restricting the account the job search depends on. Use the official
  data export; keep automation on the preparation side of the line.

---

## 10. Open questions

1. Section 5 — all of it.
2. Section 6 — which discovery option (A recommended).
3. Disconnect Vercel from `workflux`, or leave it red? (Disconnect recommended.)
4. Does `workflux` become the dashboard, or is a fresh local UI cleaner? (The
   existing pages are decent; the runtime underneath is what's wrong.)
5. Keep PR #2 as a draft docs PR, or merge it so the report lands on `main`?

---

*Nothing was submitted, applied to, purchased, or created on any job platform.
No credential, cookie, or session token was read. All external calls were
read-only: one Indeed resume fetch, one Indeed job search, one Supabase project
list.*
