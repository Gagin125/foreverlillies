# Forever Lilies Storefront

Production-ready storefront built with Next.js (App Router), TypeScript, Tailwind CSS, and PayPal Complete Payments.

## Setup

```bash
npm install
npm run dev
```

## Windows / OneDrive note

- Avoid running the project inside OneDrive/Dropbox synced folders. Sync tools and antivirus can lock `.next` and cause missing manifests/chunks.
- Prefer a local path like `C:\dev\forever-lilies`.
- If you must keep it in OneDrive, mark the folder "Always keep on this device" and add a Windows Defender exclusion for this path.
- If you see missing chunk or manifest errors, run:

```bash
npm run dev:clean
```

## Dev cache note

Do not sync the `.next` folder with OneDrive/Dropbox. If you see chunk/module errors (e.g. missing `./682.js`), run:

```bash
npm run clean:next
```

Create an `.env.local` file in the project root:

```
PAYPAL_ENV=sandbox
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_CLIENT_SECRET
NEXT_PUBLIC_PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
PAYPAL_MERCHANT_ID=YOUR_PAYPAL_MERCHANT_ID
PUBLIC_BASE_URL=https://your-domain.com
```

If `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is missing, checkout will show a "PayPal not configured" warning and payment UI will be disabled.

## PayPal notes

- Apple Pay requires HTTPS and domain verification in your PayPal dashboard.
- Place the Apple Pay domain association file in `public/.well-known/` when provided.

## Notes

- Cart is persisted in LocalStorage.
- PayPal orders are created server-side at `/api/paypal/order/create`.
- Placeholder product images live in `public/products` and can be replaced later.
