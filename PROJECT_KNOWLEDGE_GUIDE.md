# PropWise Project Knowledge Guide

This guide documents the current PropWise codebase as it exists in this repository. The app root is:

```text
/Users/digantachoudhury/Documents/PropWise/propwise
```

PropWise is a static, multi-page frontend for Indian property buyers, supported by Supabase for authentication, saved data, profiles, and analytics, plus a small FastAPI backend for AI agreement analysis.

## High-Level Architecture

```text
Browser pages
  -> shared HTML components loaded by JS
  -> page-specific JS modules
  -> Supabase for auth, profiles, comparisons, analytics
  -> FastAPI /analyze endpoint for agreement document analysis
  -> OpenRouter/OpenAI-compatible API for AI clause review
```

The frontend is not bundled. Each HTML page includes CSS and JavaScript files directly with `<link>` and `<script>` tags. Most JavaScript functions are attached to `window` so pages can call them from inline handlers.

## Top-Level File Structure

```text
propwise/
├── index.html
├── about.html
├── admin.html
├── calculator.html
├── compare.html
├── dashboard.html
├── faq.html
├── guides.html
├── login.html
├── privacy.html
├── profile.html
├── report.html
├── signup.html
├── terms.html
├── tools.html
├── app.js
├── styles.css
├── robots.txt
├── sitemap.xml
├── structure.txt
├── supabase-analytics.sql
├── assets/
├── backend/
├── components/
├── css/
├── guides/
└── js/
```

Ignored or generated folders/files also present include `.git/`, `backend/venv/`, `backend/__pycache__/`, and `.DS_Store` files.

## Main Product Areas

### Public Website

Primary public pages:

- `index.html`: homepage and primary product entry.
- `about.html`: company/about content.
- `faq.html`: FAQ page.
- `privacy.html`: privacy policy.
- `terms.html`: terms page.
- `guides.html`: guide index.
- `guides/*.html`: SEO/content articles about Indian real estate buying.

The public pages mostly share the same core CSS/JS stack and load `components/navbar.html` and `components/footer.html` dynamically.

### Tools

Primary tool pages:

- `tools.html`: AI agreement analyzer.
- `calculator.html`: property cost calculator.
- `compare.html`: property comparison tool.
- `report.html`: report/PDF export page.

### Authenticated Areas

Authenticated pages:

- `dashboard.html`: saved reports/comparisons for the current user.
- `profile.html`: user profile view/update.
- `admin.html`: admin analytics dashboard for users with `admin` or `super_admin` role.

Authentication is handled with Supabase Auth via browser-side JavaScript.

## Shared Frontend Runtime

Core JavaScript lives in `js/core/`.

```text
js/core/
├── analytics.js
├── api.js
├── bootstrap.js
├── component-loader.js
├── config.js
├── dom.js
├── dropdowns.js
├── path.js
├── supabase-client.js
└── utils.js
```

Important responsibilities:

- `config.js`: defines `window.PROPWISE_CONFIG`, including backend URL, Supabase URL/key, storage keys, and feature flags.
- `supabase-client.js`: initializes and returns the singleton Supabase client.
- `api.js`: auth, signup/login/logout, profile lookup/creation, role helpers, and global exports.
- `bootstrap.js`: page startup sequence. Initializes Supabase, loads shared components, initializes dropdowns/auth UI, runs page-specific initializers, then tracks page views.
- `component-loader.js`: fetches shared navbar/footer components and adjusts relative links when inside `/guides/`.
- `path.js`: provides `appPath()` and guide-aware path prefixing.
- `analytics.js`: inserts page view events into Supabase `analytics_events`.
- `dom.js`: `escapeHtml()` and `showError()`.
- `utils.js`: debounce, INR formatting, datetime formatting.
- `dropdowns.js`: shared dropdown behavior.

Typical page boot flow:

```text
DOMContentLoaded
  -> initPage()
  -> initSupabase()
  -> loadSharedComponents()
  -> initDropdowns()
  -> updateAuthUI()
  -> initFeaturePage()
  -> trackPageView()
```

`initFeaturePage()` uses `document.body.dataset.page` or the HTML filename to run page-specific loaders for `admin`, `dashboard`, `profile`, and `report`.

## CSS Structure

CSS is split into core, reusable components, feature styles, and page styles.

```text
css/
├── core/
│   ├── variables.css
│   ├── reset.css
│   ├── typography.css
│   └── layout.css
├── components/
│   ├── buttons.css
│   ├── cards.css
│   ├── content.css
│   ├── dropdowns.css
│   ├── footer.css
│   ├── forms.css
│   ├── loaders.css
│   └── navbar.css
├── features/
│   ├── admin.css
│   ├── analyzer.css
│   ├── auth.css
│   ├── compare.css
│   └── dashboard.css
└── pages/
    ├── faq.css
    ├── guides.css
    ├── home.css
    ├── legal.css
    └── responsive.css
```

`styles.css` is a compatibility manifest that imports:

- `css/components/content.css`
- `css/pages/home.css`
- `css/pages/legal.css`
- `css/pages/faq.css`
- `css/pages/guides.css`
- `css/pages/responsive.css`

Design tokens are in `css/core/variables.css`, including the primary blue palette, typography, spacing scale, radii, shadows, layout widths, navbar height, and z-index values.

## Shared Components

Reusable HTML components live in `components/`.

```text
components/
├── faq-section.html
├── footer.html
├── guide-cta.html
├── navbar.html
├── related-guides.html
└── schema-article.html
```

`navbar.html` contains:

- Logo and brand link.
- Main nav links.
- Tools dropdown for Compare Properties, Cost Calculator, Agreement Analyzer.
- Login/signup buttons.
- Profile dropdown for authenticated users.
- Admin link hidden until `updateAuthUI()` confirms admin role.

`footer.html` provides the common footer. Pages need `<div id="navbar"></div>` and `<div id="footer"></div>` for dynamic loading.

## Feature Modules

### Agreement Analyzer

Files:

```text
tools.html
js/features/analyzer/analyzer-core.js
js/features/analyzer/analyzer-ui.js
css/features/analyzer.css
backend/main.py
backend/analyzer.py
js/report-generator.js
js/pdf-generator.js
```

Frontend behavior:

- Supports PDF, TXT, and DOCX extraction in the browser.
- PDF text extraction uses `pdf.js`.
- DOCX text extraction uses Mammoth.
- Pasted text mode runs simple local checks.
- File upload mode posts the file to `${PROPWISE_CONFIG.API.BASE_URL}/analyze`.
- Results are normalized into `summary`, `critical`, `moderate`, `recommendations`, `score`, and `riskLevel`.
- `window.latestAnalyzerResult` stores the latest result for report export.

Backend behavior:

- FastAPI app exposes `GET /` and `POST /analyze`.
- Upload limit is 10 MB.
- Supported files: PDF, DOCX, DOC, TXT.
- PDF extraction uses PyMuPDF.
- DOCX extraction uses `python-docx`.
- DOC extraction uses `textract`.
- Extracted text is passed to `analyze_agreement()`.

AI analysis:

- `backend/analyzer.py` uses the OpenAI Python SDK pointed at OpenRouter.
- API key is read from `OPENROUTER_API_KEY`.
- Model is currently `openai/gpt-4o-mini`.
- The prompt asks for strict JSON containing `risk_level`, `score`, `critical`, `moderate`, and `summary`.

### Property Cost Calculator

Files:

```text
calculator.html
js/features/calculator/calculator-core.js
js/features/calculator/calculator-ui.js
```

Responsibilities:

- `calculateLoan()` computes EMI, total payment, and total interest.
- `calculate()` estimates total cost using base price, extra charges, and state-specific registration/stamp assumptions.
- Registration defaults to 5%, with rates for KA, MH, TN, and DL.

### Property Compare

Files:

```text
compare.html
js/features/compare/compare-core.js
js/features/compare/charts.js
css/features/compare.css
js/pdf-generator.js
```

Responsibilities:

- Formats numeric inputs in Indian number format.
- Autosaves comparison draft to `localStorage.compareDraft`.
- Validates required fields.
- Calculates total acquisition cost, price per sq. ft., EMI, rental yield, five-year maintenance, and projected future values.
- Renders comparison result table.
- Renders appreciation chart with Chart.js.
- Renders five-year ownership projection.
- Renders a rule-based "Smart Recommendation".
- Stores `window.latestComparisonData` for PDF export.

Local storage keys used here:

- `compareDraft`
- `lastComparison`

### Dashboard

Files:

```text
dashboard.html
js/features/dashboard/dashboard-ui.js
css/features/dashboard.css
```

Responsibilities:

- Requires authenticated user.
- Redirects unauthenticated users to `login.html`.
- Reads rows from Supabase `comparisons` where `user_id` equals the current user.
- Renders dashboard cards and report cards.

### Profile

Files:

```text
profile.html
js/features/profile/profile-ui.js
```

Responsibilities:

- Loads profile through `getProfile()`.
- Displays full name, email, role, and created date.
- Allows updating `profiles.full_name`.
- Shows admin quick card if the profile role is admin-like.

### Admin

Files:

```text
admin.html
js/features/admin/admin-ui.js
js/features/admin/admin-analytics.js
css/features/admin.css
supabase-analytics.sql
```

Responsibilities:

- Requires signed-in user.
- Requires `profile.role` of `admin` or `super_admin`.
- Displays counts for profiles, comparisons, total page views, recent unique visitors, and logged-in visits.
- Shows top pages, recent activity, and user journeys from `analytics_events`.

Admin data depends on policies/functions in `supabase-analytics.sql`.

## Supabase Integration

Configuration lives in `js/core/config.js`.

Supabase is used for:

- Auth sessions.
- User profile records in `profiles`.
- Saved comparisons/reports in `comparisons`.
- Analytics events in `analytics_events`.
- Role-based admin access using `profiles.role`.

Important frontend functions:

- `initSupabase()`
- `getSupabaseClient()`
- `requireSupabase()`
- `getUser()`
- `signIn()`
- `signUp()`
- `logout()`
- `getProfile()`
- `isAdminRole()`
- `isSuperAdmin()`

`getProfile()` creates a fallback profile client-side if one does not exist, using user metadata and defaulting role to `user`.

## Analytics Schema

`supabase-analytics.sql` creates and configures:

- `analytics_events` table.
- Indexes for `created_at`, `page_path`, `user_id`, and `visitor_id`.
- RLS policies for anonymous/authenticated event inserts.
- `public.is_super_admin()` helper.
- Select policies allowing super admins to read analytics, profiles, and comparisons.

The analytics insert payload includes:

- `user_id`
- `email`
- `visitor_id`
- `event_type`
- `page_path`
- `page_title`
- `referrer`
- `timezone`
- `locale`
- `device_type`
- `user_agent`

## Backend Structure

```text
backend/
├── analyzer.py
├── main.py
├── requirements.txt
├── venv/
└── __pycache__/
```

`main.py`:

- Creates the FastAPI app.
- Enables permissive CORS.
- Implements file text extraction helpers.
- Implements `POST /analyze`.

`analyzer.py`:

- Loads environment variables.
- Creates OpenRouter client via OpenAI SDK.
- Extracts relevant clauses by keyword.
- Calls the AI model.
- Cleans/parses JSON response.
- Returns safe fallback objects on failure.

`requirements.txt` includes FastAPI, Uvicorn, OpenAI, dotenv, PyMuPDF, python-docx, textract, python-multipart, plus some duplicate package names.

## External Browser Libraries

The app loads several browser libraries from CDNs:

- Supabase JS v2.
- Chart.js.
- jsPDF.
- jsPDF AutoTable.
- html2canvas.
- pdf.js.
- Mammoth browser build.
- Lucide icons.
- Google Fonts.

Because these are loaded directly in HTML, pages depend on script order. Core config and helper files must load before modules that call them.

## Content And SEO Files

SEO and content files:

- `robots.txt`: allows all crawlers and points to the deployed sitemap.
- `sitemap.xml`: lists the production site URLs.
- `google066e2feb283294a7.html`: Google verification file, currently empty.
- Guide pages include article-style content and, in some cases, JSON-LD schema.
- `assets/og-compare.jpg` appears to support social preview metadata for compare-related pages.

Guide pages currently include:

- `apartment-maintenance-charges-guide.html`
- `apartment-vs-villa-cost-calculator.html`
- `builder-buyer-agreement-checklist.html`
- `hidden-builder-charges-guide.html`
- `home-loan-hidden-costs.html`
- `parking-rights-india.html`
- `possession-delay-compensation-guide.html`
- `property-agreement-checklist.html`
- `rera-clauses-explained.html`
- `stamp-duty-karnataka.html`
- `total-cost-bangalore.html`
- `guide-template.html`

## Assets

```text
assets/
├── PropWiseLogo.png
├── PropWiseLogoold.png
├── favicon.ico
├── favicon.png
└── og-compare.jpg
```

The navbar uses `assets/PropWiseLogo.png`.

## Local Development

Because shared components are loaded with `fetch()`, opening HTML files directly may fail due to browser file restrictions. Serve the project root over HTTP instead.

From the app root:

```bash
cd /Users/digantachoudhury/Documents/PropWise/propwise
python3 -m http.server 8770
```

Then open:

```text
http://127.0.0.1:8770/
```

Backend local run, from `backend/` after dependencies and `.env` are configured:

```bash
uvicorn main:app --reload
```

If running the frontend against a local backend, update `PROPWISE_CONFIG.API.BASE_URL` in `js/core/config.js`.

## Deployment Clues

The frontend production URL in `robots.txt` and `sitemap.xml` is:

```text
https://propwise-zeta.vercel.app
```

The configured backend URL is:

```text
https://propwise-backend-0b32.onrender.com
```

This suggests:

- Static frontend deployed on Vercel.
- FastAPI backend deployed on Render.
- Supabase hosted separately.

## Current Data Flow Examples

### Login

```text
login.html form
  -> handleLogin()
  -> signIn()
  -> Supabase auth.signInWithPassword()
  -> redirect to postLoginRedirect or dashboard.html
```

### Page View Analytics

```text
bootstrap.js initPage()
  -> trackPageView()
  -> getUser()
  -> insert row into analytics_events
```

### Agreement File Analysis

```text
tools.html upload
  -> analyzeAgreementHandler()
  -> extractTextFromFile() for preview/local checks
  -> analyzeAgreement(file)
  -> POST backend /analyze
  -> backend extracts text
  -> analyze_agreement()
  -> OpenRouter AI response
  -> normalized result rendered in browser
```

### Property Compare

```text
compare.html form
  -> compareAdvanced()
  -> validateComparisonInputs()
  -> calculate totals, EMI, yield, projections
  -> render chart/table/recommendation
  -> save latestComparisonData for PDF
```

## Known Gotchas And Maintenance Notes

- `api.js` exports `window.analyzeAgreement = analyzeAgreement`, but `analyzeAgreement` is defined in `js/features/analyzer/analyzer-core.js`, which is not loaded on every page. On pages that do not load analyzer-core before `api.js`, this can throw a `ReferenceError`.
- `handleLogin()` calls `await signIn()` twice. That is likely unintended.
- `structure.txt` is an older planned structure and does not fully match the current repository.
- `app.js` is only a compatibility shim.
- `styles.css` is also a compatibility layer, not the full design system.
- `requirements.txt` contains duplicated package names and both pinned and unpinned entries.
- `backend/main.py` imports `docx`, but `requirements.txt` lists `python-docx`; that is correct for the import, but the distinction is easy to miss.
- `backend/main.py` creates temporary files for `.doc` extraction but does not remove them afterward.
- Supabase anon key is checked into `config.js`, which is normal for Supabase browser apps only if RLS policies are correct.
- Admin access depends on `profiles.role`; without the SQL policies in `supabase-analytics.sql`, admin data queries may fail.
- Several guide pages load fewer shared JS/CSS files than full app pages, so shared component behavior can vary by guide.
- Many UI actions use inline `onclick` handlers, so function names attached to `window` are part of the page API.

## Useful Entry Points For Future Work

- Change app-wide config: `js/core/config.js`
- Change startup behavior: `js/core/bootstrap.js`
- Change nav/footer: `components/navbar.html`, `components/footer.html`
- Change auth/profile behavior: `js/core/api.js`, `js/features/profile/profile-ui.js`
- Change analytics: `js/core/analytics.js`, `js/features/admin/admin-analytics.js`, `supabase-analytics.sql`
- Change agreement analysis UI: `tools.html`, `js/features/analyzer/*`
- Change backend agreement analysis: `backend/main.py`, `backend/analyzer.py`
- Change compare calculations: `js/features/compare/compare-core.js`
- Change compare charts/recommendations: `js/features/compare/charts.js`
- Change PDF exports: `js/pdf-generator.js`, `js/report-generator.js`
- Change design tokens: `css/core/variables.css`

## Suggested Cleanup Backlog

1. Guard `window.analyzeAgreement = analyzeAgreement` in `api.js` or move that export into analyzer-core only.
2. Remove the duplicate `await signIn()` call in `handleLogin()`.
3. Normalize script loading across all pages so core modules are loaded consistently.
4. Split `api.js` into auth/profile/data modules once the app grows further.
5. Remove or update stale `structure.txt`.
6. Clean `requirements.txt` to one pinned dependency list.
7. Delete generated `.DS_Store`, `__pycache__`, and committed virtual environment files if they are tracked.
8. Add a README with deployment and environment variable instructions.
9. Add basic smoke tests for calculator, compare math, and analyzer response normalization.

