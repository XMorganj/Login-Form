# StarGifts

A celebrity fan gift site. Fans browse celebrity profiles, add gifts to a cart and pay by card (Stripe) or Bitcoin (CoinGate sandbox). Admins manage celebrities, products and orders from `/admin/`.

**Stack:** Node.js, Express, MongoDB (Mongoose), plain HTML/CSS/JS frontend served from `public/`.

## Run locally

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

Open http://localhost:3000. On the first run an admin account is created: set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`, or copy the generated password from the server logs.

## Environment variables

See `.env.example`. Required: `MONGODB_URI`, `JWT_SECRET`. Needed for payments: `STRIPE_*`, `COINGATE_*`, `APP_URL`. Needed for image uploads: `CLOUDINARY_*`.

## Deploy on Render

`render.yaml` defines the service. Set the secret env vars in the Render dashboard (`JWT_SECRET` is generated for you). With MongoDB Atlas, allow Render's IPs under Network Access (`0.0.0.0/0` works). A health check is available at `/healthz`.

More detail on the code layout and API is in `CLAUDE.md`.
