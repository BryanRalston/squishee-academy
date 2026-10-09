# Squishee Academy

Free K–3 learning games at **https://squisheeacademy.com**. No ads, no accounts, no payment.

This repo only hosts the site. The source lives in [BryanRalston/times-tables](https://github.com/BryanRalston/times-tables) (`src/academy`).

`.github/workflows/deploy.yml` checks out `times-tables` `main`, runs `npm run build:academy-domain`, and deploys `dist-domain/` to GitHub Pages (custom domain `squisheeacademy.com`, `www` redirects to the apex).

- Hourly it checks `times-tables` `main` and redeploys only if the commit changed (`/build-source.txt` on the live site holds the deployed commit).
- Deploy now: `gh workflow run deploy.yml -R BryanRalston/squishee-academy`
- No secrets are used.

Squishee Math stays at https://bryanralston.github.io/times-tables/.
