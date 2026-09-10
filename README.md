# rabanichadha.com

Personal portfolio for Rabani Chadha. Static site — no build step, no framework.

```
rabanichadha-site/
├── index.html      # markup: nav + logo, hero, about, resume, footer
├── styles.css      # design system (palette, type, layout, motion)
├── script.js       # orb background, scroll fade, reveal-on-scroll
├── assets/
│   ├── Rabani_Chadha_Resume.pdf
│   └── favicon.svg
├── CNAME           # custom domain for GitHub Pages
└── README.md
```

## Run locally

```bash
cd rabanichadha-site
python3 -m http.server 5173
```

Open http://localhost:5173.

## Update content

- **Hero text** — `index.html`, the `<section class="hero">` block.
- **About cards** — each `<article class="card">` in `index.html`. Change `data-tone` to `pink`, `blue`, `peach`, or `matcha` to recolor a card.
- **Resume** — replace `assets/Rabani_Chadha_Resume.pdf` with a new file of the same name.
- **Colors / fonts** — the `:root` block at the top of `styles.css`.
- **Logo stamp text** — the `<textPath>` strings in `index.html` (they appear in the nav, footer, and resume preview).

---

## Deploy — Option A: Vercel (recommended)

1. Push this folder to a GitHub repo (see "Push to GitHub" below).
2. Go to https://vercel.com/new, sign in with GitHub, and import the repo.
3. Framework preset: **Other**. Leave build command and output directory empty. Click **Deploy**.
4. In the project, open **Settings → Domains**, add `rabanichadha.com` and `www.rabanichadha.com`.
5. Vercel then shows you two DNS records. **Copy the exact values off that screen** — the
   `www` CNAME target is unique per project (something like `d1d4fc829fe7bc7c.vercel-dns-017.com`),
   so values copied from a tutorial will not work. The apex `A` record is usually `76.76.21.21`.
   Add both records at your domain registrar.
6. Wait for DNS to propagate (minutes to a few hours). Vercel issues HTTPS automatically.

Every push to `main` redeploys the site.

## Deploy — Option B: GitHub Pages

1. Push this folder to a GitHub repo named anything (e.g. `portfolio`).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. Under **Custom domain**, enter `rabanichadha.com` and save. The `CNAME` file in this folder keeps it set.
5. At your registrar, add DNS records:
   - Four `A` records, host `@`, values `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record, host `www`, value `<your-github-username>.github.io`
6. Back in **Settings → Pages**, tick **Enforce HTTPS** once the DNS check passes.

## Push to GitHub

```bash
cd rabanichadha-site
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
