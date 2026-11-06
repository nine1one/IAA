# initialace.ca — Domain Sale Landing Page

A responsive, static-first landing page for offering **initialace.ca** for sale. The contact form is handled by a Cloudflare Pages Function and sends enquiries to the domain owner through [Resend](https://resend.com/).

## Features

- Responsive, mobile-friendly domain sale page
- Domain details and direct enquiry form
- Server-side email delivery (the Resend API key is never exposed to the browser)
- Input validation, hidden honeypot field, and generic provider errors
- Cloudflare Pages deployment configuration

## 1. Configure email delivery

The contact form requires a Resend account and a verified sending domain.

1. Create a Resend account at <https://resend.com/>.
2. Add and verify a sending domain you control in Resend.
3. Create a Resend API key.
4. In Cloudflare, open **Workers & Pages → your Pages project → Settings → Variables and Secrets**.
5. Add these three runtime variables:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | Your Resend API key (mark as secret) |
| `OWNER_EMAIL` | The email address that should receive domain enquiries |
| `FROM_EMAIL` | A verified sender, e.g. `Initialace Enquiries <enquiries@your-verified-domain.com>` |

Use a sender address on the domain you verified with Resend. Do not commit API keys or `.dev.vars` to Git.

For local development, create a `.dev.vars` file in the project root:

```dotenv
RESEND_API_KEY=re_xxxxxxxxx
OWNER_EMAIL=you@example.com
FROM_EMAIL="Initialace Enquiries <enquiries@your-verified-domain.com>"
```

Install Wrangler and run locally:

```bash
npm install --save-dev wrangler
npx wrangler pages dev .
```

## 2. Deploy from GitHub to Cloudflare Pages

This project uses a Pages Function, so deploy it to **Cloudflare Pages** (not plain GitHub Pages).

1. Push this project to `nine1one/IAA`.
2. In Cloudflare, go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the `nine1one/IAA` repository.
4. Set the production branch to `main`.
5. Set the build command to **None** (leave it blank) and the build output directory to `.`.
6. Add the three environment variables above to the Pages project.
7. Deploy.

Cloudflare Pages detects the `functions/api/contact.js` function automatically. The form submits to `/api/contact`.

## 3. Connect initialace.ca

In the Cloudflare Pages project, open **Custom domains** and add:

- `initialace.ca`
- `www.initialace.ca` (optional; add if you want both hostnames)

Follow the DNS instructions shown by Cloudflare. If the domain's DNS is hosted elsewhere, create the records Cloudflare specifies at that DNS provider. Wait for DNS and certificate provisioning to complete.

## 4. Test the contact form

After deployment:

1. Submit a test enquiry using an email address you can access.
2. Confirm the message arrives at `OWNER_EMAIL`.
3. Use **Reply** on the received email; `reply_to` is set to the visitor's email address.
4. If it does not arrive, check the Cloudflare Pages Function logs and Resend delivery logs.

## Project structure

```text
.
├── assets/
│   ├── favicon.svg
│   ├── script.js
│   └── styles.css
├── functions/
│   └── api/
│       └── contact.js
├── index.html
├── wrangler.toml
├── .gitignore
└── README.md
```

## Important

- The form will return a configuration error until all three Cloudflare environment variables are set.
- Resend requires a verified sender domain. The visitor's email is used as `reply_to`; it is not used as the sender.
- Do not use GitHub Pages for this deployment: GitHub Pages serves static files and does not execute the Cloudflare Pages Function.
