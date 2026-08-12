# Phase 1 — Discovery, Environment Audit & Technical Architecture
## Job Application Automation System

**Date:** 2026-08-12
**Audit scope:** Claude Code remote session `9d38bd1d-54be-5fee-98c3-2dc3823bb6a6`
**Status:** Discovery only. Nothing was built, submitted, or modified on any job platform.

---

## 1. Executive Summary

### The finding that changes everything

**This audit did not run on your laptop.** It ran inside an ephemeral cloud VM
(Claude Code on the web). Every hardware, browser, and installed-software fact
below describes a disposable Linux container in a datacentre — not your machine.

Evidence:

| Signal | Value | Source |
|---|---|---|
| Hostname | `vm` | `hostname` |
| Init process | `process_api` (not systemd/launchd) | `ps -p 1 -o comm=` |
| Virtualisation | KVM, full virtualisation | `lscpu` |
| Container marker | `/container_info.json` present | `ls /` |
| Home directory | `/home/user`, owned by `root`, contains only 2 cloned repos | `ls -la /home/user` |
| All files' mtime | `Aug 12 18:27` — the moment the container booted | filesystem-wide |

The container is reclaimed after inactivity. Anything not committed and pushed
is lost.

**Consequence for Sections 2, 4, 8, 9, 10 of your prompt:** the requested laptop
audit, local document discovery, and logged-in-browser-session inspection are
**structurally impossible from here**. I have not guessed at them. They are marked
`UNKNOWN — REQUIRES USER INPUT` or `NOT AUDITABLE FROM THIS ENVIRONMENT`
throughout, and Section 28 gives you a script to run on your own machine to
collect the real answers.

### The four findings that actually matter

**1. Browser automation has zero network egress here — verified, not assumed.**
Playwright 1.56.1 and Chromium 1194 are installed and launch successfully.
Screenshots work. But every navigation fails with `net::ERR_CONNECTION_RESET` —
direct, and through the local agent proxy, with `--no-sandbox` and
`--ignore-certificate-errors`. Meanwhile `curl` reaches `linkedin.com` (HTTP 200)
fine. Egress is permitted for the agent's own HTTP client and denied to the
browser process. Browser automation cannot be developed or tested in this session.

**2. You already have a sanctioned, working job-search API — and it covers Dubai.**
An **Indeed MCP server is connected to this session**. A live read-only query
(`Marketing Manager` / `Dubai` / `AE`) returned 10 current UAE listings with
apply URLs. This is a first-party, authorised path that needs no scraping, no
CAPTCHA handling, and no anti-bot evasion. It is architecturally superior to
browser automation for the *discovery* half of the system and should be the
primary discovery source. A **ZipRecruiter MCP** is also connected but is
explicitly **US/Canada only** — useless for a Dubai search.

**3. Your real professional profile was recovered — from your own Indeed account.**
`mcp__Indeed__get_resume` returned your work history, education, skills, and
stated job preferences. This is genuine data from your account, not inference.
Section 7 reproduces it. It also revealed a **live defect**: the resume text
Indeed holds is mangled (`Fullfunnelmarketing`, `brand&identitysystems` — spaces
stripped), which means the PDF you uploaded there has a broken text layer. Any
ATS parsing it will read garbage. That is a real, fixable problem worth more to
your job search this week than the entire automation system.

**4. `workflux` is the right idea at the wrong architecture.**
The repo already has `job-tracker`, `resume`, `cover-letter`, `interview`,
`dashboard` pages and a Supabase schema (`applications`, `profiles`, `resumes`).
But it is ~1,335 lines of shallow prototype: job search is a `TODO` stub that
fires an `alert()`, and generation calls **OpenAI `gpt-3.5-turbo` in the cloud**.
That directly contradicts your stated "local only, no external API" preference.
Reusable: the page structure and data model. Not reusable: the runtime
architecture.

### The recommendation

Build a **local-first Node/TypeScript service on your laptop**, with **SQLite**
for state and a **hybrid discovery layer** — sanctioned APIs (Indeed MCP) first,
human-assisted browser automation (Playwright, persistent profile, headed) only
where no API exists. Claude Code is the **development agent**, not the runtime.
The runtime is a plain supervised Node process; it must run when Claude Code is
closed.

**One constraint to internalise before Phase 2:** LinkedIn's User Agreement
prohibits automated access and scraping, and Indeed's terms are similar. Mass
automated "Easy Apply" submission is a terms violation and a realistic route to
account restriction — the account you need for your job search. The architecture
below therefore treats **discovery and preparation as automatable**, and
**submission as human-triggered**. That is not timidity; it is the only design
where the downside is bounded.

---

## 2. Machine Environment

All values verified in this session. **Applies to the cloud VM, not your laptop.**

### Hardware & OS

| Item | Value |
|---|---|
| OS | Ubuntu 24.04.4 LTS (Noble Numbat) |
| Kernel | Linux 6.18.5-fc-v20 x86_64 |
| Architecture | x86_64 |
| CPU | Intel Xeon @ 2.80GHz, 4 vCPU, 1 thread/core, KVM |
| RAM | 15 GiB total, 14 GiB free, **0 B swap** |
| Disk | `/dev/vda` 252 G, 7.1 G used, **30 G available** (allowance-capped) |
| GPU | None |
| Shell | bash (`/bin/sh` → dash) |
| PID 1 | `process_api` |

### Toolchains

| Tool | Version |
|---|---|
| Node.js | v22.22.2 |
| npm / pnpm / yarn / bun | 10.9.7 / 10.33.0 / 1.22.22 / 1.3.11 |
| deno | Not installed |
| Python | 3.11.15 |
| pip / uv / poetry | 24.0 / 0.8.17 / 2.3.3 |
| pipx / conda | Not installed |
| Git | 2.43.0 |
| Docker | 29.3.1 (daemon state unverified) |
| Go | 1.24.7 and 1.25.1 |

### Browsers & automation

| Item | Status |
|---|---|
| Chrome / Edge / Firefox / Brave | **None installed** |
| Chromium (Playwright bundle) | `/opt/pw-browsers/chromium-1194` ✅ |
| Chromium headless shell | `/opt/pw-browsers/chromium_headless_shell-1194` ✅ |
| `playwright` (global npm) | **1.56.1** ✅ |
| `chromedriver` (global npm) | **147.0.0** ✅ |
| Puppeteer | Not installed |
| Selenium (Python/Node) | Not installed |
| Xvfb | Present (no X socket, `DISPLAY` empty) |

### Databases

| Item | Status |
|---|---|
| **`sqlite3` CLI** | **Not installed** ⚠️ (Node `better-sqlite3` still viable) |
| PostgreSQL client (`psql`) | 16.13 ✅ (client only; no local server) |
| Redis | server + CLI 7.0.15 ✅ |
| MySQL / MongoDB | Not installed |

### Document, OCR & image tooling

| Item | Status |
|---|---|
| LibreOffice | 24.2.7.2 ✅ (only real document processor present) |
| tesseract (OCR) | **Not installed** |
| pdftotext / pdfinfo / qpdf / ghostscript | **Not installed** |
| ImageMagick / ffmpeg / pandoc | **Not installed** |

This is a significant gap: resume/PDF parsing has no native tooling here.

### Scheduling & supervision

| Item | Status |
|---|---|
| cron / crontab / at | **Not installed** |
| `systemctl` binary | Present, but **PID 1 is not systemd** — services are not manageable |
| pm2 / supervisord | Not installed |

**No functioning scheduler exists in this environment.** Long-running scheduled
operation is impossible here. (Claude Code's own `CronCreate` / `ScheduleWakeup`
exist at the harness level, but they schedule *Claude sessions*, not an
independent local runtime — see Section 20.)

### AI runtimes

Ollama, llama.cpp, llamafile, vLLM — **none installed**. No local LLM capability.

### Python packages

38 total; only `requests` 2.33.1 is relevant. No `playwright`, `selenium`,
`beautifulsoup4`, `pypdf`, `pdfplumber`, `python-docx`, `pytesseract`, `pandas`,
`sqlalchemy`, or `apscheduler`.

### Global npm packages

`@anthropic-ai/claude-code@2.1.42`, `chromedriver@147.0.0`, `eslint@10.1.0`,
`http-server`, `nodemon`, `playwright@1.56.1`, `pnpm`, `prettier`, `serve`,
`ts-node`, `typescript@6.0.2`, `yarn`, `corepack`.

### Secrets

`SECRET/SESSION DATA DETECTED — NOT READ.`
The environment contains `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `GH_TOKEN`,
`GITHUB_TOKEN`, `CLOUDSDK_AUTH_ACCESS_TOKEN`, and `/root/.claude.json` (OAuth
account data). Names only were enumerated; **no value was read or printed**.

---

## 3. Network Egress — The Hard Constraint

All outbound traffic is mediated by an agent proxy at `http://127.0.0.1:41833`
(CA bundle `/root/.ccr/ca-bundle.crt`, `selective: false`, no recent relay failures).

### Reachability by client

| Target | via `curl` | via Chromium/Playwright |
|---|---|---|
| `https://example.com` | **HTTP 200** | ❌ `ERR_CONNECTION_RESET` |
| `https://www.linkedin.com` | **HTTP 200** | ❌ `ERR_CONNECTION_RESET` |
| `https://www.indeed.com` | **HTTP 403** | ❌ `ERR_CONNECTION_RESET` |
| `https://api.anthropic.com` | HTTP 404 (reachable) | not tested |

Three independent Chromium configurations were tested — default, explicit
`proxy:` option, and `--proxy-server=` + `--no-sandbox` +
`--ignore-certificate-errors`. All reset. Chromium *process* launch and
*screenshot capture* both succeed (a 4,253-byte PNG of the error page was
produced), so the failure is strictly network, not browser.

**Conclusions:**
1. Browser automation **cannot be built or tested in this session**. Phase 5 work
   must happen on your laptop.
2. Indeed already returns **403 to non-browser clients** from datacentre IPs —
   direct evidence that Indeed actively blocks automated/datacentre access. Plan
   discovery around the sanctioned MCP path, not scraping.

---

## 4. Existing Project & Claude Code Environment

### Working directory

`/home/user` — contains exactly two cloned repositories. No documents, no
downloads, no personal files.

### Claude Code configuration

| Item | Finding |
|---|---|
| Config root | `/root/.claude/` |
| Global config | `/root/.claude.json` (35,727 bytes) — **contains no `mcpServers` key**; MCP is injected at session level by the platform |
| Project history | `/root/.claude/projects/-home-user/` |
| Uploads | `/root/.claude/uploads/…/` — your Phase-1 prompt (23,055 bytes), the only uploaded file |
| Hooks present | `session-start-git-identity.sh`, `stop-hook-git-check.sh`, `stop-hook-reply-gate.py`, `user-prompt-submit-reply-reminder.py` |
| Skills | `session-start-hook` + 23 **synced personal skills** |

### Connected MCP servers (from the session tool surface)

| Server | Relevance to this project |
|---|---|
| **Indeed** | 🔴 **Critical** — `search_jobs`, `get_job_details`, `get_resume`, `get_company_data` |
| **ZipRecruiter** | 🟡 `search_jobs` — **US/Canada only**, not usable for Dubai |
| **Supabase** | 🟢 DB management for existing projects |
| **GitHub** | 🟢 Repo/PR operations |
| Gmail, Google Drive, Google Calendar | 🟡 Possible: application-confirmation email parsing, document storage, interview scheduling |
| Notion, Zoom, Sykon Zoho (mail/calendar), Adobe | ⚪ Not relevant to this system |

**No browser-automation MCP server is connected** (no Playwright MCP, no
Puppeteer MCP, no computer-use tool). Browser automation would be
custom-built code, not an existing capability.

### Your synced skills (23) — corroborating professional context

`usama`, `usama-linkedin-profile`, `jumaima-voice`, `dubai-property-intelligence`,
`sykon-property-listing`, `sykon-featured-listing`, `sykon-whatsapp-campaigns`,
`sykon-a2a-form`, `loopin-rebuild`, `legal-judge-uae`, `morning`,
`avoid-ai-writing`, `brand-guidelines`, `doc-coauthoring`, `skill-creator`,
`mcp-builder`, `theme-factory`, `web-artifacts-builder`, `docx`, `pdf`, `pptx`,
`xlsx`, `manifest.json`.

These are strong corroborating evidence of domain (Dubai real-estate marketing,
Sykon Properties) and named projects (Podverge, obliqueResume, overa, Vizoro,
Swayy, Loopin, Dubai Property Intelligence). Note `usama-linkedin-profile`
already exists and covers LinkedIn profile optimisation — **do not rebuild that
inside this system; call the skill.**

### Repository A — `taskcreator`

| Item | Value |
|---|---|
| Path | `/home/user/taskcreator` |
| Stack | Next.js 16.2.12, React 19.2.4, TS, Tailwind v4, Supabase, **`@anthropic-ai/sdk` 0.115.0** (`claude-opus-5`), zod 4 |
| Notable deps | `mammoth` (DOCX→text), `exceljs` |
| Purpose | Turns a structured brief into a production-grade prompt |
| Supabase project | `taskcreator` (`elqthtylusgwwvdslrqu`, eu-central-1, ACTIVE_HEALTHY) |
| Branch | `claude/job-automation-discovery-wg83ja` ✅ |
| Env keys | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `ANTHROPIC_API_KEY` (**names only — no values read**) |

**Relevance:** not a job-search project, but `lib/claude/` (schemas, context
builder, request shaper, structured-call wrapper) and `lib/extract.ts` are a
proven, reusable pattern for structured LLM calls. Its `AGENTS.md` warns this
Next.js version differs from training data — read `node_modules/next/dist/docs/`
before writing Next code in it.

### Repository B — `workflux` ← the relevant one

| Item | Value |
|---|---|
| Path | `/home/user/workflux` |
| Stack | Next.js 15.4.6, React 19.1.0, TS, Tailwind v4, Supabase, react-icons |
| Size | **~1,335 lines total** |
| Last commit | `aace776` — "Phase 1 complete: Integrated ChatGPT, dark theme, resume & cover letter modules" |
| Branch | `claude/job-automation-discovery-wg83ja` ✅ |

Pages: `page.tsx` (318), `resume` (170), `signin` (100), `job-tracker` (95),
`interview` (92), `cover-letter` (86), `admin` (65), `dashboard` (49),
`settings` (102), `AppShell` (116).
API: `generateResume` (58), `generateCoverLetter` (50).

Supabase tables referenced: **`applications`**, **`profiles`**, **`resumes`**.

**Three defects that decide reuse:**

1. **Job search is a stub.** `app/job-tracker/page.tsx`:
   ```ts
   const handleSearch = async () => {
     // TODO: Integrate job search via LinkedIn and Indeed APIs
     alert(`Searching for "${keyword}" jobs in "${location}" (feature coming soon)`);
   };
   ```
2. **Generation is cloud OpenAI.** `app/api/generateResume/route.ts` posts to
   `https://api.openai.com/v1/chat/completions` with `gpt-3.5-turbo` — an
   external API, a three-generation-old model, and a direct contradiction of your
   Section 28 "no external API" preference. `taskcreator` already demonstrates
   the better pattern (Anthropic SDK, `claude-opus-5`, zod-validated structured
   output).
3. **Its Supabase project does not exist in your account.** Only `Sykon dealstream`
   and `taskcreator` are listed. `workflux` reads
   `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` from env and silently falls back to a
   **mock client** when unset — so it will appear to run while every query fails.

**Verdict:** reuse the **page structure** and the **`applications`/`profiles`/`resumes`
data model** as a starting shape. Replace the runtime. `workflux` becomes the
local dashboard; it does not become the engine.

---

## 5. Existing Documents

**Result: none. Zero professional documents exist in this environment.**

A filesystem-wide search (excluding `/proc`, `/sys`, `/usr/share`, `node_modules`,
`/var/lib`) for `*.pdf`, `*.docx`, `*.doc`, `*.odt`, `*resume*`, `*cv*.pdf`,
`*cover*letter*`, `*portfolio*`, `*linkedin*` returned only:

- LibreOffice bundled templates (`Resume1page.ott`, `Portfolio.otp`)
- Go TLS test fixtures (`Server-TLSv13-Resume`)
- systemd hibernate binaries (`systemd-hibernate-resume`)
- `theme-factory/theme-showcase.pdf` (a skill asset)

All false positives. **No user document was found, because none exists here.**

`UNKNOWN — REQUIRES USER INPUT`: your entire document inventory — resumes, CVs,
cover letters, certificates, portfolio files, LinkedIn data export, Behance
material, case studies, references. Section 28 provides an inventory script to
run on your laptop.

---

## 6. Available Tools — Summary

| Capability | Here | Needed on laptop |
|---|---|---|
| Node 22 / TS | ✅ | ✅ |
| Playwright + Chromium | ⚠️ installed, **no network** | ✅ must work headed |
| SQLite | ❌ no CLI | ✅ `better-sqlite3` |
| PDF text extraction | ❌ | ✅ `pdfjs-dist` / `pdf-parse` |
| DOCX extraction | ✅ via `taskcreator`'s `mammoth` | ✅ `mammoth` |
| OCR | ❌ | 🟡 optional, `tesseract.js` |
| Scheduler | ❌ | ✅ `node-cron` in-process |
| Local LLM | ❌ | ⚪ not required |
| Indeed job search | ✅ **works, incl. Dubai** | ✅ via MCP client |
| Anthropic SDK | ✅ in `taskcreator` | ✅ |

---

## 7. Professional Profile — Discovered

**Source:** `mcp__Indeed__get_resume`, your own authenticated Indeed account,
read-only. No password requested, no cookie or token accessed.

### CONFIRMED

**Contact**
- Work email `usama@sykonproperties.ae` (session context)
- Name **Usama Khalid** (synced skill `usama`; corroborated by `usama-linkedin-profile`)

**Employment (as Indeed holds it)**

| Employer | Title | Dates on record |
|---|---|---|
| Sykon Properties LLC (Mohammed Riaz & Partners), Business Bay | *not stated* | Feb 2025 – Present |
| Digital Maven FZE | Creative Designer (Brand & Performance Marketing) | Feb 2024 |
| Pegasus Shipping & Logistics (Pvt.) Ltd. | Graphic Designer | Apr 2019 |
| General Petroleum (Pvt.) Ltd. | Graphic Designer & Marketing Executive | — |
| GTech Sources | Graphic Designer | — |
| Digitors (Pvt.) Ltd. | Senior Graphic Designer (Co-Founder) | — |

**Education:** BS (Honours), National University of Modern Languages (NUML)

**Project on record:** "Dubai Real Estate Intelligence Terminal — HTML/Leaflet
dashboard on DLD transaction data across 13 premium areas" (matches your
`dubai-property-intelligence` skill)

**Also on record:** "Crisis Capitalization Mastery 2026" — appears to be a
certification mis-filed into the work-experience block.

**Languages:** English (Professional), Urdu/Hindi (Native), Arabic (Working —
marketing-copy familiarity)

**Stated preferences (already set on Indeed)**
- Preferred titles: Multimedia Designer, UI Designer, Senior Creative Designer,
  Senior Graphic Designer, Marketing Designer, Marketing Manager, Marketing Executive
- **Minimum salary: AED 12,000**
- **Willing to relocate: Yes**

### Skills — as recorded, with proficiency NOT invented

Indeed stores skills as flat text with **no proficiency or years**. Proficiency
below is therefore `UNKNOWN` everywhere. Populating it is a Phase 1 task
requiring your input.

| Category | Skills on record | Proficiency | Years |
|---|---|---|---|
| Strategy | Full-funnel marketing, GTM strategy, brand & identity systems, integrated campaigns, creative direction | UNKNOWN | UNKNOWN |
| Performance | Performance marketing, Meta ads & lead-gen, funnel & conversion optimisation, SEO, sales enablement | UNKNOWN | UNKNOWN |
| Lifecycle | Email marketing & automation, WhatsApp marketing, CRM & lead routing | UNKNOWN | UNKNOWN |
| Automation & AI | Marketing automation (n8n, Zapier), AI-driven marketing, investor & pitch decks, market intelligence | UNKNOWN | UNKNOWN |
| Leadership | Team leadership, budget & vendor management | UNKNOWN | UNKNOWN |
| Design | Figma, Photoshop, Illustrator, Premiere Pro, After Effects, XD, Firefly, Midjourney, CapCut | UNKNOWN | UNKNOWN |
| Marketing tools | Meta Business Suite, Meta Ads, Instant Forms, WhatsApp Business, Mailchimp, Google Workspace | UNKNOWN | UNKNOWN |
| Web / Software | *(not on Indeed; evidenced by repos — Next.js, React, TypeScript, Supabase, Leaflet)* | UNKNOWN | UNKNOWN |

### INFERRED (flagged, not asserted)

- **Based in Dubai, UAE** — Business Bay employer, `.ae` email, AED salary, Dubai skills
- **~7 years experience** — earliest dated role Apr 2019 → Aug 2026
- **Mid-to-senior** — "Senior Graphic Designer (Co-Founder)" + team leadership skills
- **Some management experience** — "Team leadership, budget & vendor management"
- **Industries:** real estate (current), marketing/creative agency, logistics, petroleum, IT services
- **Practical web-dev capability** — two Next.js/TS repos, Leaflet dashboard

### UNKNOWN — REQUIRES USER INPUT

Current job title at Sykon · all employment **end** dates · nationality ·
UAE visa status and type · work authorisation for other countries · notice period ·
current salary · target salary (only the AED 12,000 *minimum* is known) ·
phone number · personal email · LinkedIn/Behance/portfolio URLs · graduation year ·
degree subject · certifications beyond the one mis-filed entry · references ·
per-skill proficiency and years.

### ⚠️ Defects found in the Indeed record

1. **The resume text layer is broken.** Extracted text has spaces stripped:
   `Fullfunnelmarketing`, `brand&identitysystems`, `Emailmarketing&automation`,
   `Teamleadership,budget&vendormanagement`. **Every ATS parsing this file reads
   the same garbage.** This is silently damaging live applications right now.
2. **Company/title inverted:** rendered as "**Digital Maven FZE** at Creative
   Designer" — the fields are swapped.
3. **No end dates** on any role; **no dates at all** on four of six.
4. **No title recorded for your current role** at Sykon Properties — your most
   important entry.
5. **A certification is filed as employment** ("Crisis Capitalization Mastery 2026").
6. **A project is filed as employment** (Dubai Real Estate Intelligence Terminal).

**Fix these before building anything.** Item 1 alone likely costs you more
interviews than an automation system would win.

### Note on prior sessions

**Information from previous Claude Code sessions is not available to me.** This
container was created fresh at `Aug 12 18:27`. `/root/.claude/projects/-home-user/`
exists but I did not mine prior transcripts for personal facts. Everything above
comes from the live Indeed MCP, the session context, the two repos, and your
synced skill files — each cited. I am not claiming Claude "already knows"
anything beyond these.

---

## 8. Career Preferences

### Discovered (from Indeed) — HARD vs SOFT as currently expressed

| Preference | Value | Classification | Source |
|---|---|---|---|
| Preferred titles | Multimedia Designer, UI Designer, Senior Creative Designer, Senior Graphic Designer, Marketing Designer, Marketing Manager, Marketing Executive | SOFT | Indeed |
| Minimum salary | AED 12,000/mo | **HARD** | Indeed |
| Relocation | Willing | SOFT | Indeed |

### `UNKNOWN — REQUIRES USER INPUT`

Excluded titles · excluded companies (**note: your current employer Sykon
Properties should almost certainly be excluded**) · preferred companies ·
preferred/excluded locations · remote / hybrid / on-site preference · target
salary · currency confirmation (assumed AED) · employment types · visa
requirements · notice period · availability date · working hours · target
seniority · min/max years · max commute · preferred/excluded technologies ·
company size · startup vs corporate.

**Design note:** every preference must be tagged `hard` or `soft` in config. Hard
requirements are **filters** (binary reject, evaluated before scoring). Soft
preferences are **weights** (contribute to score). Conflating the two is the most
common failure mode in job-scoring systems — it produces either an empty pipeline
or an unfiltered firehose.

---

## 9. Resume Analysis

**Only one resume is accessible: the copy Indeed holds.** No local resumes exist
here (Section 5), so "which is strongest / newest / most ATS-compatible" cannot
be answered across a set. Analysis of the one available:

| Dimension | Finding |
|---|---|
| ATS compatibility | ❌ **Failing** — broken text layer, spaces stripped |
| Newest | Only copy visible |
| Target roles | Mixed: graphic design, creative direction, marketing management |
| Target industries | Real estate, agency/creative, logistics, petroleum |
| Duplicated info | Not detectable from a single copy |
| Outdated info | ⚠️ Current role has **no title** |
| Conflicting dates | ⚠️ Start dates only; four roles undated; no chronology verifiable |
| Conflicting titles | ⚠️ Company/title inverted (Digital Maven FZE) |
| Missing achievements | ⚠️ **No quantified outcomes anywhere** — no budgets, ROAS, CPL, team size, revenue |
| Weak descriptions | ⚠️ Skills are a keyword dump, not evidence |
| Missing keywords | ⚠️ No web/software stack despite demonstrable Next.js/TS/Supabase work |
| Formatting | ❌ Broken extraction; certification and project mis-filed as jobs |

### Recommendations for a future resume-generation module

1. **Fix the source PDF first.** Regenerate from a text-native tool (not an image
   export), verify with `pdftotext -layout` before upload. No generation module
   can compensate for a broken input.
2. **Establish a single canonical `profile.json`** as the one source of truth.
   Every generated document derives from it. Never let a generated document
   introduce a fact absent from it.
3. **Add quantified achievements.** This is the single highest-leverage change,
   and it requires your input — the numbers are not in any file I can reach.
4. **Split into role-family variants** — Design / Marketing / Hybrid-Tech — since
   your history genuinely spans all three. Variants select and reorder *existing*
   facts; they never invent.
5. **Build an ATS validator** that round-trips every generated PDF through text
   extraction and fails the build if extraction is lossy. This would have caught
   the current defect automatically.
6. **Enforce a factual-consistency check** — assert every claim in output traces
   to a `profile.json` field, with the trace recorded.

**No resume was rewritten in this phase, as instructed.**

---

## 10. LinkedIn Feasibility

**`NOT AUDITABLE FROM THIS ENVIRONMENT.`** No browser, no profile, no session
here. Your logged-in session lives on your laptop.

### What is technically true

- `curl https://www.linkedin.com` → HTTP 200 (reachable)
- Chromium → `ERR_CONNECTION_RESET` (cannot navigate)
- No LinkedIn MCP server is connected
- Reading your **own** profile via **your own** headed browser, from your own IP,
  is technically feasible on your laptop with Playwright + a persistent profile

### What is a genuine constraint

LinkedIn's User Agreement prohibits accessing the service via bots or automated
methods and prohibits scraping. Automated Easy-Apply submission at volume is a
terms violation with a realistic consequence: restriction of the account your job
search depends on. LinkedIn's automation detection is mature and specifically
targets this pattern.

This is not a reason to abandon the project — it is a reason to place the
automation boundary correctly:

| Activity | Recommendation |
|---|---|
| Read your own profile (one-off, to seed `profile.json`) | 🟢 **Use LinkedIn's official "Get a copy of your data" export** — sanctioned, complete, zero risk. Strongly preferred over scraping. |
| Browse job listings | 🟡 Human-driven, assisted capture |
| Bulk-scrape listings | 🔴 Terms violation — do not build |
| Automated Easy Apply at volume | 🔴 Terms violation + account risk — do not build |
| Human-triggered single application with pre-filled data | 🟡 Defensible: you click submit |
| Modify your profile | ⛔ Out of scope this phase (and `usama-linkedin-profile` already handles profile work) |

**Recommended LinkedIn path:** request your official data export
(`Settings → Data Privacy → Get a copy of your data`). It yields profile,
positions, skills, education, and `Job Applications.csv` — everything Section 8
of your prompt wanted, obtained legitimately and more completely than scraping
would manage. Import that file. That is the whole LinkedIn integration.

---

## 11. Indeed Feasibility

**Materially better than expected — and verified live.**

### Sanctioned MCP path ✅

`mcp__Indeed__*` is connected and working:

| Tool | Verified |
|---|---|
| `get_resume` | ✅ returned your resume, skills, preferences |
| `search_jobs` | ✅ returned 10 live Dubai listings |
| `get_job_details` | Available, not exercised |
| `get_company_data` | Available, not exercised |

Live probe — `search_jobs("Marketing Manager", "Dubai", "AE")` returned e.g.
Performance Marketing Manager @ Maison Etherique (21 Jul 2026); MARKETING MANAGER
@ Sky Avenue Real Estate Brokerage (22 Jul 2026); Marketing Manager @ Address
Montgomerie Hotel Dubai (7 Aug 2026) — each with `job_id`, company, location,
posted date, job type, and an apply URL.

Observations for the parser:
- **Compensation is `N/A` on all 10 results** — salary filtering cannot rely on
  the search payload; it needs `get_job_details` or JD text parsing
- Posted dates span Feb–Aug 2026 → **staleness filtering is required**
- Duplicates appear in-feed (Sky Avenue listed twice under different IDs) →
  **deduplication is mandatory, not optional**
- Result IDs are positional (`JOBSEARCH_1`…) → **not stable keys**; dedupe on a
  content hash of `(normalised_company, normalised_title, location)` plus the
  canonical apply URL

### Direct-scraping path ❌

`curl https://www.indeed.com` → **HTTP 403**. Indeed blocks datacentre/non-browser
clients outright. Combined with terms that prohibit automated access, direct
scraping is both blocked and not permitted. **Do not build it.**

### Application flow

`UNKNOWN — REQUIRES USER INPUT.` Indeed's apply flow (screening questions,
employer-hosted redirects, application history, saved jobs) cannot be observed
from here — no browser, no session. **No application was submitted.**

**Verdict:** Indeed MCP is the **primary discovery source**. It is authorised,
works for the UAE, and needs no scraping, no CAPTCHA, no evasion.

---

## 12. Browser Automation Comparison

Evaluated for a **laptop** deployment. ✅ available here / ⚠️ constrained / ❌ absent.

| Criterion | **Playwright** ✅ | Puppeteer ❌ | Selenium ❌ | Raw CDP ⚠️ | Extension ❌ | Browser MCP ❌ |
|---|---|---|---|---|---|---|
| Installed here | 1.56.1 + Chromium 1194 | no | no (chromedriver only) | via Chromium | n/a | none connected |
| Reliability | Excellent (auto-wait) | Good | Fragile | Manual | Good | n/a |
| Persistent profile | ✅ `launchPersistentContext` | ✅ | ⚠️ | ✅ | ✅ native | n/a |
| Authenticated session | ✅ persistent profile | ✅ | ⚠️ | ✅ | ✅ best | n/a |
| Multi-tab | ✅ | ✅ | ⚠️ | ✅ | ✅ | n/a |
| Downloads | ✅ first-class | ⚠️ | ⚠️ | ⚠️ | ⚠️ | n/a |
| **Uploads / file picker** | ✅ `setInputFiles` | ✅ | ✅ | ⚠️ | ❌ **blocked** | n/a |
| Form filling | ✅ | ✅ | ✅ | ⚠️ | ✅ | n/a |
| Dynamic sites | ✅ auto-wait | ⚠️ manual | ❌ sleeps | ❌ | ✅ | n/a |
| iframes | ✅ `frameLocator` | ⚠️ | ⚠️ | ❌ | ⚠️ | n/a |
| **CAPTCHA** | **Detect & stop only** | same | same | same | same | n/a |
| Recovery | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ | n/a |
| Headed / headless | both | both | both | both | headed only | n/a |
| Long-run stability | ✅ w/ context recycling | ⚠️ leaks | ❌ | ❌ | ✅ | n/a |
| Tracing / video | ✅ best-in-class | ⚠️ | ❌ | ❌ | ❌ | n/a |
| Screenshots | ✅ **verified working here** | ✅ | ✅ | ✅ | ⚠️ | n/a |
| Maintenance | Low | Medium | High | Very high | Medium | n/a |

### Recommendation

**PRIMARY: Playwright (Node/TypeScript), headed, `launchPersistentContext`
against a dedicated Chrome profile you log into once by hand.**

Rationale: already installed; best auto-wait and trace tooling; `setInputFiles`
is essential for resume upload; persistent context means you authenticate
manually and the automation inherits the session without ever touching a cookie
or token.

**FALLBACK: CDP attach to a manually launched Chrome**
(`chrome --remote-debugging-port=9222`), driven by Playwright's
`chromium.connectOverCDP`.

Rationale: you launch and own the browser; automation attaches to what is already
there. The strongest posture for the human-in-the-loop model — the browser is
visibly yours, you watch it work, and you close it to stop everything.

**Explicit non-goal:** no stealth plugins, no fingerprint spoofing, no CAPTCHA
solving, no anti-bot evasion. CAPTCHA detection results in **stop and notify** —
never an attempt to solve. This is both your instruction and the only defensible
engineering position.

---

## 13. Security Model

### Absolute rules (enforced in code, not convention)

1. No credential ever in source, config, logs, or the database
2. No cookie, token, or session artefact ever read, stored, or transmitted
3. Authentication is **always** manual, by you, in a visible browser
4. No document leaves the laptop except to the target job site during a submission you approved
5. No CAPTCHA solving, no anti-bot evasion, no fingerprint spoofing
6. No fabricated qualification, employment date, or credential — ever
7. No answer to an unknown question — escalate, never guess
8. No legally significant declaration answered without explicit prior configuration
9. No submission when a materially important field is unknown
10. Protected-characteristic questions (disability, criminal history, veteran/ethnicity, sponsorship) are **never** auto-answered without an explicit, per-question configured policy

### Enforcement mechanisms

| Rule | Mechanism |
|---|---|
| No secrets in code | Nothing to store — no credentials exist by design |
| No cookies read | No code path calls `context.cookies()`; forbidden by lint rule |
| Log hygiene | Central redaction filter on every log write |
| No fabrication | `profile.json` is the only fact source; a provenance assertion fails the build on any untraceable claim |
| Dry-run safety | Submission module is **not imported** unless `MODE=production` — physically absent from the dry-run call graph |
| Sensitive questions | Question classifier defaults to `HUMAN_REQUIRED`; automation is opt-in per question, never a default |

### Risk classification

| Level | Actions | Automation |
|---|---|---|
| 🟢 **LOW** | Search jobs (MCP), fetch JD, parse, dedupe, score, store, generate a *draft* document, screenshot | Fully automatic |
| 🟡 **MEDIUM** | Navigate to a job page, open an application form, fill fields from verified profile data, upload a pre-approved resume | Automatic, logged, **stops before submit** |
| 🔴 **HIGH** | Answer free-text screening questions, salary expectations, availability dates, cover-letter customisation | Prepared automatically, **requires approval** |
| ⛔ **HUMAN REQUIRED** | Final submit · any legal declaration · sponsorship/visa questions · protected characteristics · criminal history · disability · references · anything with a CAPTCHA · re-authentication · any unrecognised question | **Never automated.** Blocks and notifies. |

**Default posture: the final submit click is HUMAN REQUIRED.** You may later
promote specific low-risk flows to automatic, per-site, after evidence they work
— but the system ships with the boundary at submission.

---

## 14. Job Scoring Model

### Two-stage: filter, then score

**Stage 1 — Hard filters (binary, before scoring).** Any failure → `REJECT`, no
score computed:
- salary below hard minimum (when known)
- location violates a hard requirement
- title on the exclusion list
- company on the exclusion list (**include your current employer**)
- required experience substantially above profile (configurable, default +5 yrs)
- posting older than `max_age_days`
- work authorisation impossible

**Stage 2 — Weighted score (0–100), only for survivors:**

```
JOB_SCORE = Σ(wᵢ × factorᵢ) / Σ(wᵢ) × 100
```

| Factor | Default weight | Computation |
|---|---|---|
| `title_match` | 20 | Fuzzy match vs preferred titles; exact = 1.0, family = 0.7, adjacent = 0.4 |
| `skill_match` | 18 | Overlap of JD-extracted skills with profile skills, weighted by proficiency |
| `experience_match` | 12 | Gaussian around required years; penalise under- and over-qualification |
| `seniority_match` | 8 | Distance on the seniority ladder |
| `salary` | 10 | 0 at hard min → 1.0 at target; `null` when undisclosed (see below) |
| `location` | 10 | Exact = 1.0, same city = 0.9, relocatable = 0.5 |
| `remote_match` | 6 | Match against remote/hybrid/on-site preference |
| `industry_match` | 6 | Preferred-industry membership |
| `company_preference` | 4 | Preferred list / size / startup-vs-corporate |
| `technology_match` | 4 | Preferred minus excluded technologies |
| `application_complexity` | −8 | **Penalty**: more screening questions → lower score |
| `recency` | 2 | Decay from posted date |

**Undisclosed-salary rule.** All 10 live Indeed results returned `N/A` for
compensation. A naive implementation scores those 0 and rejects the entire UAE
market. Correct behaviour: `salary = null` → **exclude the factor and renormalise
the denominator**, then flag `salary_unknown` on the job. Never score a missing
value as zero.

### Bands

| Band | Score | Action |
|---|---|---|
| ⛔ REJECT | hard filter, or < 30 | Record, never surface |
| 🔵 LOW | 30–49 | Store only |
| 🟡 MEDIUM | 50–64 | Queue if daily target unmet |
| 🟠 HIGH | 65–79 | Prepare documents, queue for review |
| 🟢 TOP | 80–100 | Prepare, prioritise, notify |

All weights, thresholds, and band cutoffs live in `config/scoring.yaml` — no code
change to retune. Every score is stored with a **per-factor breakdown** so a
result is always explainable, and weights can be back-tested against outcomes.

---

## 15. If/Else Decision Engine

Evaluated in order; first match wins. Every decision is persisted with its rule
ID and inputs.

```
# ── Deduplication ────────────────────────────────────────────
IF job_hash IN applications(status=SUBMITTED)        → SKIP  [already_applied]
IF job_hash IN jobs AND unchanged                    → SKIP  [already_seen]
IF job_hash IN jobs AND changed                      → UPDATE, rescore
IF same (company, title_family) applied < N days     → SKIP  [company_cooldown]

# ── Hard filters ─────────────────────────────────────────────
IF company IN excluded_companies                     → SKIP  [excluded_company]
IF title matches excluded_titles                     → SKIP  [excluded_title]
IF salary_known AND salary < hard_minimum            → SKIP  [below_minimum]
IF location violates hard requirement                → SKIP  [location_violation]
IF required_years > profile_years + tolerance        → SKIP  [overqualified_requirement]
IF posted_date older than max_age_days               → SKIP  [stale]

# ── Scoring ──────────────────────────────────────────────────
IF score < 30                                        → REJECT
IF score < 50                                        → LOW_PRIORITY, store only
IF score >= 80                                       → TOP_PRIORITY, notify

# ── Application-method routing ───────────────────────────────
IF method == EXTERNAL_ATS (Workday/Greenhouse/Taleo) → HUMAN_REVIEW [unsupported_ats]
IF method == ONE_CLICK AND score >= threshold
   AND no_screening_questions AND mode == PRODUCTION
   AND daily_limit_not_reached                       → MAY_AUTOMATE (still needs approval by default)
IF screening_questions > 0                           → HUMAN_REVIEW [has_questions]
IF requires_cover_letter                             → prepare draft → HUMAN_REVIEW
IF any answer.confidence < 0.9                       → HUMAN_REVIEW [low_confidence]
IF any question class IN {SENSITIVE, LEGAL, UNKNOWN}
   AND no configured policy                          → HUMAN_REVIEW [needs_policy]
IF required field missing from profile               → HUMAN_REVIEW [missing_data]

# ── Runtime guards ───────────────────────────────────────────
IF captcha_detected                    → STOP, screenshot, notify   [NEVER solve]
IF login_wall OR session_expired       → STOP, notify: re-authenticate
IF 403/429 OR anti-bot interstitial    → STOP site, exponential backoff, notify
IF robots/ToS signal prohibits         → STOP site permanently, flag config
IF unexpected_modal                    → screenshot, attempt known dismissals, else HUMAN_REVIEW
IF form_validation_error               → screenshot, re-derive, retry ONCE, else HUMAN_REVIEW
IF navigation_timeout                  → retry ≤2 with backoff, else mark FAILED
IF browser_crash                       → restart context, resume from checkpoint
IF consecutive_failures >= threshold   → PAUSE run, notify
IF daily_limit_reached                 → STOP cleanly until tomorrow

# ── Outcome ──────────────────────────────────────────────────
IF confirmation_detected               → RECORD SUCCESS + screenshot
IF submit_clicked AND outcome unclear  → status = UNCERTAIN
                                         → ⚠️ NEVER auto-retry
                                         → queue for human verification
```

### The uncertainty rule

`UNCERTAIN` is a **terminal state for automation**. If a submit was clicked and
the outcome could not be confirmed, the system records `UNCERTAIN`, captures a
screenshot and the final URL, and **stops touching that job forever** until you
resolve it manually. Blind retry risks duplicate applications — a real,
visible-to-the-employer harm. The dedupe key blocks any future run from
re-attempting a job in `UNCERTAIN`.

---

## 16. Question Engine

### Classification

| Class | Description | Automation |
|---|---|---|
| **A** Known factual | Name, email, phone, city | 🟢 Automatic |
| **B** Resume-derived | Years of experience, employers, education | 🟢 Automatic (verified against `profile.json`) |
| **C** Preference-derived | Notice period, availability, employment type | 🟢 Automatic **if configured**, else escalate |
| **D** Judgment | "Why this company?", "Describe a project" | 🟠 Draft, require approval |
| **E** Sensitive | Salary expectations, current salary | 🔴 Policy required |
| **F** Legal declaration | Visa/sponsorship, right to work, criminal history, disability, veteran/ethnicity | ⛔ **Never automated without explicit per-question policy** |
| **G** Unknown | Unrecognised | ⛔ Escalate — **never guess** |
| **H** Human required | Explicitly configured as such | ⛔ Always human |

### Answer record

```jsonc
{
  "question_raw": "How many years of experience do you have with Meta Ads?",
  "question_normalized": "years_experience:meta_ads",
  "class": "B",
  "answer": "5",
  "source": "profile.skills.meta_ads.years",   // must resolve, or answer is void
  "confidence": 0.95,
  "last_verified": "2026-08-12",
  "automation_level": "AUTO",                  // AUTO | APPROVE | HUMAN
  "times_used": 12,
  "user_corrected": false
}
```

### Rules

1. **Every answer must cite a resolvable `profile.json` path.** No path → no
   answer → escalate. This makes fabrication structurally impossible rather than
   merely discouraged.
2. **Normalisation before lookup** — strip punctuation/casing, map synonyms, so
   the library generalises across sites.
3. **Confidence gate** — `< 0.9` always escalates.
4. **Class F never auto-answers by default.** Enabling it requires an explicit
   per-question entry in `config/answer-policies.yaml` written by you.
5. **Learning loop** — when you correct an answer, store the correction with
   `user_corrected: true` and raise its confidence for future matches.
6. **Never invent numbers.** If years-of-experience for a skill is `UNKNOWN` in
   `profile.json` (currently: *all of them* — see Section 7), the engine must
   escalate rather than estimate.

---

## 17. Document Engine

### Pipeline

```
profile.json (single source of truth — every fact traceable)
      ↓
target role family  (design | marketing | hybrid-tech)
      ↓
base resume variant (pre-built, human-approved, immutable)
      ↓
job description → keyword & relevance analysis
      ↓
SAFE CUSTOMISATION  ── select · reorder · re-emphasise ONLY
      ↓
VALIDATION          ── factual consistency · ATS text-layer check
      ↓
final document (PDF + extracted-text sidecar for verification)
```

### The safety boundary

**Permitted:** selecting which true bullets appear; reordering by relevance;
adjusting the summary using only existing facts; matching JD terminology to
equivalent true skills.

**Forbidden:** adding a skill absent from `profile.json`; changing dates, titles,
or employers; inflating years or metrics; inventing achievements; claiming tools
never used.

### Validation gates (all must pass, or the document is not produced)

1. **Provenance** — every factual claim traces to a `profile.json` path
2. **Date integrity** — all dates byte-identical to source
3. **Title integrity** — employers and titles unchanged
4. **Skill whitelist** — no skill outside `profile.skills`
5. **ATS round-trip** — extract text from the generated PDF; fail if lossy or
   spacing is stripped *(this gate would have caught the live Indeed defect)*
6. **Length/format** — page count and margins within bounds

### Cover letters

Generated per job from JD + `profile.json` under the same constraints, and
**always** `HUMAN_REVIEW` before use. Store as drafts; never auto-attach.

Model: **Anthropic `claude-opus-5`** via `@anthropic-ai/sdk` — already proven in
`taskcreator`'s `lib/claude/`. Reuse that structured-call wrapper; do not
reimplement. Do **not** carry over `workflux`'s `gpt-3.5-turbo` path.

---

## 18. Database Design

**SQLite** (`better-sqlite3`), single file, WAL mode. Rationale: local, zero-ops,
synchronous API well-suited to a single-writer job runner, trivially backed up by
file copy, and matches your "no cloud" preference. Postgres would add a daemon
for no benefit at this scale. Note the `sqlite3` **CLI is absent** in this
container, but `better-sqlite3` bundles its own engine — no system dependency.

### Schema

```sql
companies(id PK, name, normalized_name UNIQUE, domain, industry,
          size, is_excluded, is_preferred, notes, created_at)

jobs(id PK, job_hash UNIQUE, source, source_job_id, url, apply_url,
     title, normalized_title, company_id FK→companies,
     location, remote_type, employment_type,
     salary_min, salary_max, salary_currency, salary_disclosed BOOL,
     description_raw, description_parsed_json,
     required_years, seniority, posted_date, discovered_at,
     last_seen_at, is_stale, application_method, raw_payload_json)

job_scores(id PK, job_id FK, score, band, factor_breakdown_json,
           weights_version, scored_at, hard_filter_failed, filter_reason)

applications(id PK, job_id FK UNIQUE, resume_id FK, cover_letter_id FK,
             status, method, submitted_at, confirmed_at,
             confirmation_evidence, external_ref,
             uncertainty_reason, approved_by_user_at, created_at)
-- status: DRAFT | READY | NEEDS_REVIEW | AUTO_APPROVED | BLOCKED
--       | SUBMITTED | UNCERTAIN | FAILED | SKIPPED

documents(id PK, type, variant, file_path, sha256, generated_from_profile_version,
          job_id FK NULL, validation_passed BOOL, validation_report_json, created_at)

questions(id PK, question_raw, question_normalized UNIQUE, class,
          site, seen_count, first_seen, last_seen)

answers(id PK, question_id FK, answer, source_path, confidence,
        automation_level, last_verified, user_corrected, times_used)

application_questions(id PK, application_id FK, question_id FK,
                      answer_used, was_escalated, user_edited)

automation_runs(id PK, run_id UNIQUE, mode, started_at, ended_at, status,
                jobs_discovered, jobs_scored, apps_prepared, apps_submitted,
                errors_count, stop_reason)

events(id PK, run_id FK, timestamp, level, job_id, application_id,
       site, action, status, message, error_code, screenshot_id FK, context_json)

screenshots(id PK, run_id FK, job_id, application_id, kind,
            file_path, sha256, taken_at, retention_class)

sessions(id PK, site, profile_path, last_verified_at, status)
-- ⚠️ metadata ONLY. Stores NO cookie, token, or credential.

user_preferences(id PK, key UNIQUE, value_json, is_hard_requirement, updated_at)

contacts(id PK, company_id FK, name, role, source, notes)
```

### Identity & deduplication

**Primary key for a job:**

```
job_hash = sha256(
  normalize(company_name) + '|' +
  normalize(title)        + '|' +
  normalize(location)
)
```

Normalisation: lowercase, strip punctuation/legal suffixes (`LLC`, `FZE`,
`Pvt. Ltd.`), collapse whitespace, expand abbreviations. Secondary key: canonical
`apply_url` with tracking parameters stripped.

**Not** the source ID — the live Indeed probe returned positional IDs
(`JOBSEARCH_1`…) that change between searches, and the *same* Sky Avenue role
appeared twice under different IDs. Content hashing is required.

**Application-level dedupe:** `UNIQUE(job_id)` on `applications`, plus a guard
blocking any `(company, title_family)` applied within a configurable cooldown,
plus an absolute bar on re-attempting anything in `UNCERTAIN`.

---

## 19. Directory Architecture

Designed for the **laptop** deployment, informed by what actually exists.

```
job-automation/
├── CLAUDE.md                  # Instructions for Claude Code as dev agent
├── README.md
├── package.json               # Node 22 + TypeScript (matches your stack)
│
├── config/                    # ── All tuning lives here; no code edits ──
│   ├── profile.json           #  ★ SINGLE SOURCE OF TRUTH for every fact
│   ├── preferences.yaml       #  hard requirements vs soft preferences
│   ├── scoring.yaml           #  weights, thresholds, band cutoffs
│   ├── answer-policies.yaml   #  per-question automation policy (Class E/F)
│   ├── sites.yaml             #  per-site limits, selectors, enabled flags
│   ├── automation.yaml        #  mode, daily limits, delays, cooldowns
│   └── notifications.yaml
│
├── src/
│   ├── orchestrator/          # run lifecycle, scheduler, checkpointing
│   ├── discovery/
│   │   ├── indeed-mcp.ts      #  ★ PRIMARY — verified working, incl. Dubai
│   │   ├── linkedin-export.ts #  parses official LinkedIn data export
│   │   └── browser-assisted.ts#  human-driven capture, last resort
│   ├── parser/                # JD → structured (skills, years, salary, seniority)
│   ├── dedupe/                # job_hash, fuzzy company/title matching
│   ├── scoring/               # two-stage filter + weighted score
│   ├── eligibility/           # hard-requirement evaluation
│   ├── documents/
│   │   ├── profile-loader.ts  #  loads + validates profile.json
│   │   ├── resume-builder.ts  #  variant selection, safe customisation
│   │   ├── cover-letter.ts
│   │   └── validators/        #  provenance · dates · ATS round-trip
│   ├── questions/             # classifier + answer library + escalation
│   ├── browser/
│   │   ├── controller.ts      #  Playwright persistent context (headed)
│   │   ├── guards.ts          #  CAPTCHA / login-wall / 403 detection → STOP
│   │   └── recovery.ts
│   ├── application/           # planner, filler, submission controller
│   ├── approval/              # human-in-the-loop queue
│   ├── db/                    # better-sqlite3, migrations, repositories
│   ├── logging/               # structured JSONL + redaction filter
│   └── notify/                # terminal, desktop, dashboard
│
├── dashboard/                 # ← adapt workflux's Next.js pages here
│
├── data/
│   ├── jobs.db                #  SQLite (WAL)
│   └── checkpoints/
│
├── documents/
│   ├── source/                #  your originals (never modified)
│   ├── resumes/base/          #  human-approved variants
│   ├── resumes/generated/     #  per-job, with validation reports
│   └── cover_letters/
│
├── browser-profile/           # ⚠️ dedicated Chrome profile, gitignored.
│                              #    You log in here manually, once.
├── logs/                      # rotated JSONL
├── screenshots/               # retention-managed (Section 22)
├── reports/                   # dry-run output
├── scripts/                   # audit-laptop.sh, import-linkedin-export.ts, backup.sh
├── tests/                     # unit · integration · fixtures · mock-ats
└── backups/                   # nightly SQLite + config snapshots
```

**Why this differs from your example structure:** `config/profile.json` is
elevated to the architectural centre (everything derives from it, nothing may
contradict it); `discovery/` is split by *authorisation path* rather than by
site, so the sanctioned MCP route is structurally primary and browser-assisted
capture is visibly the fallback; `browser/guards.ts` exists as a first-class
module because stop-conditions are a core feature, not error handling; and
`documents/validators/` is separate because the ATS round-trip check is what
would have caught the live defect in Section 7.

`.gitignore` must include `browser-profile/`, `data/`, `logs/`, `screenshots/`,
`documents/`, `config/profile.json`.

---

## 20. Runtime Architecture & Claude Code's Role

### The critical separation

| | **Claude Code — Development Agent** | **Local Runtime — Production** |
|---|---|---|
| Runs when | You open a session | Continuously, on your laptop |
| Purpose | Write, test, debug, refactor, extend selectors | Discover, score, prepare, queue |
| Lifetime | Ephemeral | Long-running, supervised |
| Requires you present | Yes | No |
| Network | Proxied, browser blocked | Your own connection |
| Depends on Anthropic | Yes | Only for document generation (one SDK call) |

**Claude Code must not be the runtime.** This session proves why: the container is
ephemeral, has no scheduler, and its browser has no egress. A system that stops
working when you close a chat window is not a long-running system.

The runtime is a **plain Node process** you can start, stop, and inspect without
Claude. Claude Code builds it, and later maintains it — a site changes its DOM,
you open Claude Code, fix the selector, redeploy. That is the correct division.

### Orchestrator modules

| Module | Responsibility |
|---|---|
| **Scheduler** | Fires bounded jobs on cron expressions. **Never an infinite loop.** Each run has a hard deadline and a max-work budget. |
| **Job Discovery** | Indeed MCP first; LinkedIn export import; browser-assisted last. Returns raw postings. |
| **Job Parser** | Raw posting → structured fields (skills, years, salary, seniority, method). |
| **Deduplication** | Computes `job_hash`; resolves fuzzy company/title collisions. |
| **Scoring Engine** | Two-stage filter + weighted score; persists per-factor breakdown. |
| **Eligibility Engine** | Evaluates hard requirements; produces the reject reason. |
| **Resume Matcher** | Picks the best base variant for the role family. |
| **Document Generator** | Safe customisation + validation gates. |
| **Application Planner** | Determines method, required fields, question set; builds a plan. |
| **Browser Controller** | Owns the Playwright persistent context; enforces guards; captures screenshots. |
| **Question Engine** | Classifies, answers from the library, escalates on low confidence. |
| **Human Approval Queue** | Everything needing your judgment, with full context. |
| **Submission Controller** | The *only* module that can click submit. Absent from the call graph unless `MODE=production`. |
| **Application Tracker** | Records outcome, confirmation evidence, uncertainty. |
| **Error Recovery** | Classifies failure, decides retry vs stop, restores checkpoints. |
| **Logging** | Structured JSONL with redaction. |
| **Monitoring** | Health, rate-limit budgets, consecutive-failure counters. |
| **Notifications** | Terminal, desktop, dashboard. |

---

## 21. 24/7 Operation

| Concern | Design |
|---|---|
| Process supervision | macOS `launchd` / Linux `systemd --user` / Windows Task Scheduler. **Not** an infinite `while` loop. |
| Scheduling | `node-cron` in-process: discovery every 4 h, scoring on new jobs, preparation batched. Each run **bounded** by deadline and work budget. |
| Auto-restart | Supervisor restarts on crash with exponential backoff and a crash-loop breaker. |
| State persistence | All state in SQLite (WAL). Zero state in memory across runs. |
| Checkpointing | Each run writes a checkpoint after every job; resume skips completed items. |
| Graceful shutdown | `SIGTERM` → finish current job, never mid-submission → close browser → checkpoint → exit. |
| Browser lifecycle | New context per run; **recycle after N jobs** to bound memory; hard kill on unresponsive. |
| Memory | Bounded queues, streamed JD parsing, no unbounded accumulation; RSS watchdog restarts on threshold. |
| Reboot recovery | Supervisor auto-starts; runtime replays from last checkpoint; **anything in `UNCERTAIN` stays untouched.** |
| Log rotation | Daily rotation, 30-day retention, gzip after 2 days. |
| DB backup | Nightly `VACUUM INTO` snapshot; keep 14. |
| Resource ceiling | Configurable CPU/RSS caps; sleep when on battery below a threshold. |

**Rate limiting and safety** (`config/automation.yaml`, all configurable, none
designed to evade anything):

```yaml
daily_application_target: 10
per_site_daily_limit: { indeed: 8, linkedin: 0 }   # linkedin off by default
delay_between_actions_ms: [3000, 9000]             # human-paced, not evasive
session_max_duration_min: 45
cooldown_between_runs_min: 90
max_consecutive_failures: 3                        # → PAUSE + notify
max_applications_per_run: 5
max_applications_per_company: 2
max_applications_per_job_family_per_week: 6
stop_on_anti_bot_signal: true                      # non-negotiable
```

The delays exist so the system behaves considerately toward the sites it uses —
not to disguise it. **On any 403, 429, CAPTCHA, or automation-prohibited signal,
the system stops that site and notifies you.** It does not adapt, rotate, or retry
around the block.

---

## 22. Failure Recovery, Logging & Evidence

### Recovery matrix

| Failure | Response |
|---|---|
| Browser crash | Restart context, resume from checkpoint, cap 3 restarts/run |
| Browser closed by you | Treat as intentional stop; checkpoint and exit cleanly |
| Computer restart | Supervisor auto-starts; replay from checkpoint |
| Internet outage | Detect, exponential backoff, pause run, resume on recovery |
| Website timeout | Retry ≤2 with backoff, then mark job `FAILED`, continue |
| Website redesign | Selector assertions fail fast → screenshot → `HUMAN_REVIEW` → notify "selectors need updating" |
| Session expired | **STOP.** Notify: re-authenticate manually. Never attempt automated login. |
| CAPTCHA | **STOP.** Screenshot, notify. **Never solve.** |
| Unexpected modal | Screenshot, try known dismissals, else `HUMAN_REVIEW` |
| Form validation error | Screenshot, re-derive from profile, retry once, else escalate |
| Missing field | `HUMAN_REVIEW` — never guess |
| Duplicate detected | `SKIP`, log both hashes |
| Upload failure | Verify file exists + type, retry once, else escalate |
| Navigation failure | Retry ≤2, then `FAILED` |
| **Submission uncertain** | **`UNCERTAIN` — terminal. Screenshot + URL. Never auto-retry. Human verification only.** |

### Logging

Structured JSONL, one event per line:

```jsonc
{
  "timestamp": "2026-08-12T18:30:00.000Z",
  "run_id": "run_2026-08-12T18-00-00Z_a3f9",
  "level": "info",
  "job_id": 4821,
  "application_id": null,
  "site": "indeed",
  "action": "job.scored",
  "status": "ok",
  "score": 74,
  "band": "HIGH",
  "error": null,
  "screenshot_path": null,
  "duration_ms": 142
}
```

A **redaction filter runs on every write** — pattern-matching cookies, tokens,
`Authorization` headers, and anything resembling a credential — as a safety net,
not the primary control. The primary control is that the system never obtains
these values in the first place.

### Screenshots

Captured at: job page (`TOP` band only), application start, each question page,
validation error, unexpected page, submission confirmation, and every stop
condition (CAPTCHA, login wall, 403).

Path: `screenshots/{YYYY-MM-DD}/{run_id}/{job_id}_{kind}_{seq}.png`

Retention by class — evidence of a submission is what you may need months later;
debug noise is not:

| Class | Kept |
|---|---|
| `confirmation` (proof of submission) | **Forever** |
| `error` / `stop_condition` | 90 days |
| `debug` | 7 days |
| `routine` | 3 days |

Enforced nightly, with a global cap (default 2 GB) evicting oldest-lowest-class
first. Screenshots may contain personal data — same disk-hygiene treatment as
documents; never uploaded anywhere.

---

## 23. Human-in-the-Loop

### Statuses

`DRAFT → READY → NEEDS_REVIEW → {AUTO_APPROVED | BLOCKED} → SUBMITTED | UNCERTAIN | FAILED | SKIPPED`

### The review card

Each queued item shows: job title, company, location, salary (or
`undisclosed`) · **score with per-factor breakdown** · matched skills ·
**missing skills** · proposed resume variant (with diff vs base) · proposed cover
letter · **every proposed answer with its source path and confidence** ·
escalation reasons · estimated complexity · direct link to the posting.

Actions: **Approve** · **Approve with edits** (edits feed the answer library) ·
**Reject** (with reason, feeding scoring calibration) · **Skip** · **Block company**.

**Bulk approval is deliberately limited** to items with zero escalations and no
Class D/E/F questions. Everything else is reviewed individually — the point of the
queue is judgment, and bulk-approving judgment items defeats it.

---

## 24. Testing Strategy

| Layer | Scope |
|---|---|
| **Unit** | Scoring maths (incl. the `salary=null` renormalisation), `job_hash`, question classification, hard filters, redaction, document validators |
| **Integration** | Discovery → parse → dedupe → score → prepare, against recorded fixtures |
| **Browser** | Playwright against a **local mock ATS** in `tests/mock-ats/` — a small Express app reproducing one-click apply, multi-step forms, screening questions, file upload, validation errors, and a simulated CAPTCHA. **All browser tests run against this, never against live sites.** |
| **Fixtures** | Recorded Indeed MCP payloads (incl. the observed duplicates and `N/A` salaries) and saved JD HTML |

### Modes

| Mode | Behaviour |
|---|---|
| `SIMULATION` | No network. Fixtures only. Full pipeline, fake browser. |
| `DRY_RUN` | **Default.** Real discovery, real scoring, real document generation, real navigation up to the application form — **stops before submit**, emits a report. |
| `HUMAN_APPROVAL` | Dry-run plus a populated approval queue; you approve; system prepares but **you** click submit. |
| `PRODUCTION` | Approved items may be submitted automatically, within limits. |

### The dry-run guarantee

Enforced **structurally**, not by a flag check: the submission module is
dynamically imported **only** when `MODE === 'production'`. In any other mode the
submit code path does not exist in the process. Backed by (a) a startup assertion,
(b) a test that greps the dry-run call graph for submission imports, and (c) a
mode banner in every log line and dashboard view.

Mode is set in `config/automation.yaml` and requires an explicit
`i_understand_this_submits_real_applications: true` acknowledgement to reach
`PRODUCTION`.

---

## 25. Configuration

All in `config/`, no code changes to retune. YAML for human-edited settings, JSON
for `profile.json` (machine-validated against a schema).

Files: `profile.json` (facts) · `preferences.yaml` (hard vs soft) ·
`scoring.yaml` (weights, thresholds, bands) · `answer-policies.yaml`
(per-question automation for Class E/F) · `sites.yaml` (per-site limits,
selectors, enable flags) · `automation.yaml` (mode, limits, delays) ·
`notifications.yaml`.

Every config is schema-validated at startup with a clear error on violation.
Changes are hot-reloaded between runs, never mid-run. `scoring.yaml` carries a
`version` recorded on every score so results stay comparable after retuning.

**Notifications** — local only, no external dependency: terminal output (always),
desktop notification (`node-notifier`), dashboard badge, optional sound on
`HUMAN_REQUIRED`. Email only via your already-connected Gmail/Zoho, and only if
you explicitly enable it later.

---

## 26. Technical Decisions

| Decision | Options | **Recommended** | Reason | Alternative | Risk |
|---|---|---|---|---|---|
| Language | TS/Node · Python · Go | **TypeScript on Node 22** | Matches both repos and your stack; Playwright's primary binding; one language end-to-end | Python | Weaker document/PDF ecosystem than Python |
| Browser | Playwright · Puppeteer · Selenium · CDP | **Playwright (headed, persistent context)** | Installed; best auto-wait, tracing, `setInputFiles`; session inherited without touching cookies | CDP attach to your own Chrome | Selector drift on site redesigns |
| Discovery | MCP · scraping · paid API | **Indeed MCP primary; LinkedIn official export; browser-assisted last** | Authorised, verified working for Dubai, no anti-bot conflict | Human-assisted capture | MCP coverage may be narrower than the site's own search |
| Database | SQLite · Postgres · JSON files | **SQLite (`better-sqlite3`, WAL)** | Local, zero-ops, file-copy backups, sync API suits single-writer | Postgres | Single-writer only — fine here |
| Scheduler | node-cron · systemd/launchd · Agenda | **node-cron in-process, under an OS supervisor** | Bounded jobs, no infinite loop, survives reboot | launchd/systemd timers | Missed runs while laptop asleep |
| Dashboard | CLI · local web · desktop | **Local web (Next.js) + CLI** | You asked for simple and local; **adapt `workflux`'s existing pages** — reuses real work | CLI only | Scope creep into UI polish |
| Logging | JSONL+pino · winston · console | **JSONL via `pino` + redaction filter** | Structured, fast, greppable, rotatable | winston | Redaction must be tested, not assumed |
| Doc processing | pdfjs+mammoth · LibreOffice · Python | **`pdfjs-dist` + `mammoth` + Puppeteer HTML→PDF** | `mammoth` already proven in `taskcreator`; HTML→PDF gives a reliable text layer | LibreOffice headless | PDF layout fidelity needs iteration |
| OCR | tesseract.js · none | **None initially** | Your documents are text-native; OCR solves a problem you don't have | Add `tesseract.js` if scans appear | Unnecessary complexity if added early |
| Config | YAML · JSON · TOML | **YAML + schema-validated `profile.json`** | Comments matter for policy files; JSON schema for facts | TOML | YAML footguns — mitigate with strict schema |
| Supervisor | launchd/systemd · pm2 · Docker | **Native OS supervisor** | No extra runtime; correct reboot semantics; **your OS is `UNKNOWN`** | pm2 | Cross-platform config differs |
| Notifications | terminal · desktop · email | **Terminal + `node-notifier` desktop** | Local, zero external dependency | Gmail/Zoho MCP later | Notification fatigue |
| LLM | Claude Opus 5 · GPT-3.5 · local | **`claude-opus-5` via `@anthropic-ai/sdk`** | Already wired in `taskcreator` with structured output; **replaces `workflux`'s `gpt-3.5-turbo`** | Local model | Sole external dependency — see below |
| Testing | node:test · vitest · jest | **`node:test`** (as `taskcreator` uses) + Playwright | Consistent with existing repo; zero extra deps | vitest | Fewer conveniences |

### The one unavoidable external dependency

Your Section 28 preference is "no external API". Document generation and JD
parsing need an LLM, and no local runtime exists on this machine (and `UNKNOWN` on
yours). **Recommendation:** accept exactly one external dependency — the Anthropic
API — and isolate it behind `src/documents/llm.ts` so it can be swapped for Ollama
later without touching callers. Everything else (discovery, scoring, dedupe,
database, browser, dashboard) runs fully locally. If you want true zero-external,
Ollama + a 7–14B model can handle JD parsing acceptably, but cover-letter quality
will drop noticeably.

---

## 27. Risks & Limitations

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | **Terms of service.** LinkedIn prohibits automated access; Indeed's terms are similar. Automated submission at volume risks restriction of the account your job search depends on. | 🔴 **High** | Sanctioned MCP for discovery; LinkedIn via official export only; submission human-triggered by default; hard stop on any prohibition signal |
| 2 | **This environment cannot host the system.** Ephemeral, no scheduler, browser has no egress. | 🔴 High | Build for the laptop; use this session for design and non-browser code only |
| 3 | **Your laptop is entirely unaudited.** OS, RAM, disk, Node, browsers, documents — all `UNKNOWN`. | 🔴 High | Run `scripts/audit-laptop.sh` (Section 28) before Phase 2 |
| 4 | **Your Indeed resume has a broken text layer.** ATS systems are reading mangled text *today*. | 🔴 High | **Fix this week, independent of the project** |
| 5 | Selector drift when sites redesign | 🟡 Medium | Assert selectors, fail fast, escalate; keep selectors in `sites.yaml` |
| 6 | Duplicate applications from uncertain submissions | 🔴 High | `UNCERTAIN` is terminal; never auto-retry; unique constraint + cooldowns |
| 7 | **Every skill's years/proficiency is `UNKNOWN`** — the question engine will escalate constantly | 🟡 Medium | Populate `profile.json` in Phase 1; it is the gating input |
| 8 | Salary undisclosed on all observed listings | 🟡 Medium | `null`-aware scoring with renormalisation; never score missing as zero |
| 9 | Over-automation producing low-quality applications at volume | 🟡 Medium | Daily limits; quality gates; approval queue; success-rate tracking |
| 10 | LLM fabrication in generated documents | 🔴 High | Provenance validation — every claim traces to `profile.json` or the build fails |
| 11 | Local PII concentration (documents, screenshots, DB) | 🟡 Medium | Local only; disk encryption; retention rules; gitignored |
| 12 | ZipRecruiter MCP is US/CA only | 🟢 Low | Disable for a Dubai search; do not build against it |
| 13 | Indeed MCP coverage may be narrower than the site's own search | 🟡 Medium | Measure coverage in Phase 3 before assuming sufficiency |
| 14 | `workflux`'s Supabase project is absent and its client silently mocks | 🟡 Medium | Rewire to local SQLite; remove the silent-mock fallback (it hides failure) |
| 15 | Laptop asleep → missed scheduled runs | 🟢 Low | Catch-up on wake; caffeinate during scheduled windows |

---

## 28. Required User Input

### 🔴 REQUIRED — blocking

**A. MACHINE** — run this on your laptop and paste the output:

```bash
echo "OS: $(uname -a)"; sw_vers 2>/dev/null || cat /etc/os-release 2>/dev/null
echo "RAM/DISK:"; df -h ~ ; free -h 2>/dev/null || vm_stat 2>/dev/null | head -3
echo "Node: $(node -v 2>/dev/null)  npm: $(npm -v 2>/dev/null)"
echo "Python: $(python3 -V 2>/dev/null)  Git: $(git --version 2>/dev/null)"
echo "Browsers:"; ls /Applications 2>/dev/null | grep -iE 'chrome|firefox|edge|brave' \
  || which google-chrome chromium firefox microsoft-edge brave-browser 2>/dev/null
echo "Docs found:"; find ~/Desktop ~/Documents ~/Downloads -maxdepth 3 -type f \
  \( -iname '*resume*' -o -iname '*cv*' -o -iname '*cover*letter*' -o -iname '*portfolio*' \) 2>/dev/null
```

**B. DOCUMENTS** — upload or point me at: every resume/CV version, any cover
letters, your **LinkedIn data export** (`Settings → Data Privacy → Get a copy of
your data` — request it now, it takes ~24 h), certificates, portfolio/Behance
links.

**C. CAREER FACTS** (none of these are in any file I can reach)
1. Your exact current title at Sykon Properties
2. **End dates** for every past role (Indeed has start dates only, and none for four roles)
3. Nationality, UAE visa status/type, notice period
4. **Years of experience per major skill** — the question engine escalates on every
   unanswerable one; supply at least your top 10
5. Quantified achievements — budgets managed, ROAS/CPL, team sizes, revenue
   influenced. This is the single biggest resume weakness.

**D. JOB PREFERENCES**
Target titles (confirm or revise the seven on Indeed) · **excluded** titles ·
**excluded companies — confirm Sykon Properties is excluded** · target locations
(Dubai only? UAE? GCC? international?) · remote/hybrid/on-site · **target** salary
(only the AED 12,000 minimum is known) · employment types · industries to pursue
and avoid · seniority target.

**E. AUTOMATION POLICY** — the decisions only you can make
1. Which sites may the system touch? (Indeed MCP only? Add browser automation? LinkedIn at all?)
2. **May it ever click submit, or does it always stop at "prepared, awaiting you"?**
   *(Recommended: always stop — at least until you have watched a full month of dry runs.)*
3. Daily application ceiling
4. Answer policy for sponsorship/visa, salary expectations, availability
5. Which protected-characteristic questions, if any, may be auto-answered
   *(Recommended: none)*

### 🟡 OPTIONAL — improves quality

Preferred companies · company size/startup vs corporate · preferred and excluded
technologies · max commute · working-hours preference · relocation targets ·
references · past application history to seed dedupe · which of `workflux`'s UI
you want kept versus rebuilt.

---

## 29. Development Phases

| Phase | Objective | Key files | Depends on | Completion criteria |
|---|---|---|---|---|
| **0 · Discovery** ✅ | This report | `docs/PHASE1_DISCOVERY.md` | — | **Done** |
| **0.5 · Laptop audit** | Real environment facts | `scripts/audit-laptop.sh` | Your input **A** | Machine profile known |
| **1 · Profile intelligence** | Canonical `profile.json` | `config/profile.json`, `src/documents/profile-loader.ts`, `scripts/import-linkedin-export.ts` | Inputs **B**, **C** | Schema-validated; **zero `UNKNOWN` in required fields**; ATS text-layer defect fixed |
| **2 · Database** | Local persistence | `src/db/`, migrations | Phase 1 | Schema migrated; dedupe unit-tested |
| **3 · Job discovery** | Indeed MCP ingestion | `src/discovery/indeed-mcp.ts`, `src/parser/` | Phase 2 | 100+ real jobs ingested, deduped, coverage measured |
| **4 · Scoring** | Rank against preferences | `src/scoring/`, `config/scoring.yaml` | Phases 1+3, input **D** | Scores explainable; you agree with the top 20 |
| **5 · Browser automation** | Playwright controller + guards | `src/browser/`, `tests/mock-ats/` | Phase 0.5, **laptop only** | All mock-ATS tests pass; CAPTCHA/login-wall guards verified to STOP |
| **6 · Application prep** | Documents + answers | `src/documents/`, `src/questions/` | Phases 1+4 | Validation gates pass; ATS round-trip enforced |
| **7 · Human approval** | Queue + dashboard | `src/approval/`, `dashboard/` | Phase 6 | You review and approve 20 real items end-to-end |
| **8 · Controlled submission** | The dangerous one | `src/application/submission.ts` | Phase 7, input **E** | **≥30 dry runs clean first**; then 1 manual, 3 supervised, then limited auto |
| **9 · Monitoring** | Logs, notifications, health | `src/logging/`, `src/notify/` | Phase 8 | Failures surface within one run |
| **10 · Long-running** | Supervised 24/7 | supervisor config, `src/orchestrator/` | Phase 9 | 7 days unattended, no leak, clean reboot recovery |

**Phases 0.5 and 1 are the real prerequisites.** Every later phase consumes
`profile.json`, and it currently cannot be written — the facts are not in any file
I can reach. Do not start Phase 2 before Phase 1 is genuinely complete.

---

## 30. Proposed Final Architecture

```
                        ┌─────────────────────────────┐
                        │   YOUR LAPTOP (24/7)        │
                        │   OS supervisor             │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │       ORCHESTRATOR          │
                        │   node-cron · bounded runs  │
                        │   checkpointing · recovery  │
                        └──────────────┬──────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
┌───────▼────────┐          ┌──────────▼─────────┐         ┌──────────▼────────┐
│   DISCOVERY    │          │   INTELLIGENCE     │         │   PREPARATION     │
│                │          │                    │         │                   │
│ Indeed MCP  ★  │─────────▶│ Parser             │────────▶│ Resume Matcher    │
│  (authorised,  │          │ Dedupe (job_hash)  │         │ Document Gen      │
│   Dubai ✓)     │          │ Scoring (0-100)    │         │  + validators     │
│ LinkedIn export│          │ Eligibility        │         │ Question Engine   │
│ Browser-assist │          │                    │         │                   │
└────────────────┘          └────────────────────┘         └─────────┬─────────┘
        │                              │                              │
        └──────────────┬───────────────┴──────────────────────────────┘
                       │
              ┌────────▼────────┐
              │  SQLite (WAL)   │◀──── nightly backup
              │  jobs · scores  │
              │  applications   │
              │  Q&A · events   │
              └────────┬────────┘
                       │
        ┌──────────────▼───────────────┐
        │   HUMAN APPROVAL QUEUE       │  ◀── local Next.js dashboard
        │   (adapted from workflux)    │      + CLI
        └──────────────┬───────────────┘
                       │  you approve
        ┌──────────────▼───────────────┐
        │   BROWSER CONTROLLER         │
        │   Playwright · headed        │
        │   persistent profile         │
        │   ┌────────────────────────┐ │
        │   │ GUARDS                 │ │
        │   │ CAPTCHA    → STOP      │ │
        │   │ login wall → STOP      │ │
        │   │ 403 / 429  → STOP      │ │
        │   │ prohibited → STOP      │ │
        │   └────────────────────────┘ │
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼───────────────┐
        │  SUBMISSION CONTROLLER       │
        │  ⚠️ imported ONLY when       │
        │     MODE = production        │
        │  Default: STOPS before submit│
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼───────────────┐
        │  TRACKER · LOGGING · NOTIFY  │
        │  UNCERTAIN = terminal        │
        │  never auto-retry            │
        └──────────────────────────────┘

External dependencies: Anthropic API (document generation only, isolated
behind src/documents/llm.ts). Everything else is local.
```

### Design invariants

1. `profile.json` is the only source of facts. No module may assert what it does not contain.
2. Discovery prefers the authorised path. Browser automation is a fallback, never the default.
3. Submission is human-triggered by default, and structurally absent from non-production modes.
4. Any block signal stops the system. It never adapts around one.
5. `UNCERTAIN` is terminal. Duplicate applications are treated as real harm.
6. No credential, cookie, or token is ever read, stored, or logged.

---

## PHASE 1 DISCOVERY COMPLETE — READY FOR IMPLEMENTATION PROMPT

### Carry into the next prompt

**Environment**
- Build target is **your laptop** — specs `UNKNOWN`, audit script in Section 28
- This cloud session: Node 22.22.2, Playwright 1.56.1 + Chromium 1194 installed but **browser has no network egress**; no scheduler; ephemeral
- Use this session for design, schema, scoring, parsing, and tests. **Browser code must be written and tested on your laptop.**

**Confirmed assets**
- ✅ **Indeed MCP works and covers Dubai/AE** — `search_jobs`, `get_job_details`, `get_resume`, `get_company_data`
- ⚠️ ZipRecruiter MCP is **US/CA only** — do not build against it
- ✅ `taskcreator` — reuse `lib/claude/` (structured Anthropic calls, `claude-opus-5`), `lib/extract.ts`, `mammoth`; note its `AGENTS.md` Next.js warning
- ⚠️ `workflux` — reuse page structure + `applications`/`profiles`/`resumes` model; **replace `gpt-3.5-turbo`/OpenAI with `claude-opus-5`**; **remove the silent Supabase mock fallback**; its Supabase project does not exist in your account
- ✅ Your real profile recovered from Indeed (Section 7)
- ✅ 23 synced skills — **`usama-linkedin-profile` already covers LinkedIn profile work; call it, don't rebuild it**

**Decided architecture**
- TypeScript / Node 22 · SQLite (`better-sqlite3`, WAL) · Playwright headed persistent context · `node-cron` under an OS supervisor · local Next.js dashboard · `pino` JSONL with redaction · `claude-opus-5` for generation only
- Two-stage scoring: hard filters, then weighted 0–100 with **`null`-aware salary renormalisation**
- `job_hash = sha256(normalized_company | normalized_title | location)` — **not** source IDs (verified unstable and duplicated)
- Dry-run enforced by **conditional import**, not a flag

**Blocking inputs** — Section 28 **A–E**. Phase 1 cannot start without **B** and **C**.

**Do first, before any code**
1. **Fix the broken text layer on your Indeed resume.** ATS systems are reading
   mangled text right now — this costs you interviews today.
2. Fix the inverted company/title, add end dates, add your current Sykon title,
   move the certification and the DLD project out of the employment section.
3. Request your LinkedIn data export (~24 h lead time).

**Constraints that do not move**
- No CAPTCHA solving, no anti-bot evasion, no fingerprint spoofing
- No cookie/token/credential access — authentication is always manual, by you
- No fabricated facts — provenance validation fails the build
- Submission stays human-triggered until you have watched a full month of dry runs
- Any prohibition signal stops the system permanently for that site

---

*Nothing was submitted, modified, purchased, or created on any job platform. No
credential, cookie, or session token was read. No LinkedIn or Indeed profile was
altered. All external calls were read-only: one Indeed resume fetch, one Indeed
job search, one Supabase project list.*
