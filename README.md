# Parking Line

A responsive multi-page website prototype for a neighborhood garage parking marketplace. Each primary section has its own page:

- `index.html` — home and navigation
- `find-parking.html` — sample spaces and demo reservations
- `dashboard.html` — monthly demo marketplace estimate
- `list-garage.html` — homeowner listing form
- `my-activity.html` — saved demo reservations
- `ai-team.html` — proposed customer care, marketing, sales, finance, and MIS roles

Shared styling is in `styles.css`; interactions and browser demo storage are in `app.js`.

## Preview locally

Open `index.html` in a modern web browser. The site is static and does not require a build step. On a hosted site, demo reservations, listings, and expenses are stored in that browser's local storage and shared across the pages on the same origin.

## Publish with GitHub Pages

After pushing this project to a GitHub repository, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save. GitHub Pages will publish the static site from `index.html`.

## Prototype limitations

The spaces are sample listings. Reservations and hosting entries are saved only in the current browser; they are not visible to other users. There is no login, shared database, live availability, payment processing, real booking confirmation, or connected AI agent. The dashboard's estimated profit is calculated from demo reservations and expenses entered in that browser, not actual received income.

