# Calm AI — Deploy Guide
## From zero to live in under 20 minutes

---

## Step 1 — Set up Supabase (5 min)

1. Go to **supabase.com** → Create account (GitHub login is fastest)
2. Click **New project** → Name it `calmai` → Pick region **South Asia (Mumbai)** → Create
3. Wait ~2 min for project to spin up
4. Go to **SQL Editor** → paste the entire contents of `supabase-setup.sql` → click **Run**
5. Go to **Settings → API** → copy:
   - `Project URL` → this is your `VITE_SUPABASE_URL`
   - `anon public` key → this is your `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret, never expose in frontend)
6. Go to **Authentication → Settings** → under Email, disable "Confirm email" for testing (re-enable for production)

---

## Step 2 — Get your Anthropic API key (2 min)

1. Go to **console.anthropic.com**
2. Click **API Keys** → **Create Key** → copy it
3. This is your `ANTHROPIC_API_KEY`

---

## Step 3 — Push to GitHub (2 min)

```bash
cd calmai-v2
git init
git add .
git commit -m "Initial commit — Calm AI v2"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/calm-ai.git
git push -u origin main
```

---

## Step 4 — Deploy to Vercel (5 min)

1. Go to **vercel.com** → Sign up with GitHub
2. Click **New Project** → Import your `calm-ai` repo
3. Framework: **Vite** (auto-detected)
4. Click **Environment Variables** and add ALL of these:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | your Anthropic key |
| `VITE_SUPABASE_URL` | your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service role key |
| `ALLOWED_ORIGIN` | https://YOUR-PROJECT.vercel.app |
| `VITE_RAZORPAY_KEY_ID` | (add later when you set up Razorpay) |

5. Click **Deploy** — done. Your app is live.

---

## Step 5 — Set up Razorpay (optional, do after testing)

1. Go to **razorpay.com** → Create account → Complete KYC
2. Go to **Settings → API Keys** → Generate test key pair
3. Add `VITE_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to Vercel env vars
4. Set up webhook: Razorpay Dashboard → Webhooks → add your Vercel URL + `/api/razorpay-webhook`

---

## Step 6 — Point your custom domain (optional)

1. In Vercel → your project → **Settings → Domains**
2. Add `calmai.in` or `app.calmcreatives.com`
3. Update Supabase Auth → **Settings → URL Configuration** → add your domain to allowed redirects

---

## Environment variables — full reference

```env
# Required for AI to work
ANTHROPIC_API_KEY=sk-ant-...

# Required for auth and DB
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (never expose in frontend)

# Required for CORS security
ALLOWED_ORIGIN=https://yourapp.vercel.app

# Optional — payments
VITE_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

---

## After deploying — first 10 things to do

1. Sign up as a test user, complete onboarding, generate ideas
2. Check Supabase → Table Editor → confirm `profiles` and `usage` rows are being created
3. Re-enable email confirmation in Supabase Auth settings
4. Test the plan gate: try generating 11 ideas on Starter (should block at 10)
5. Test mobile on your phone — everything should be readable
6. Set up Razorpay test mode → test a payment flow end to end
7. Share with 5 creators and get feedback before public launch
8. Add your custom domain
9. Set `ALLOWED_ORIGIN` to your real domain (not `*`)
10. Enable Supabase email confirmations and test the full flow

---

## Troubleshooting

**App loads but AI calls fail** → Check `ANTHROPIC_API_KEY` is set in Vercel env vars, not just `.env`

**Auth not working** → Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — these must start with `VITE_` to be exposed to the frontend

**Usage limits not enforcing** → Check `SUPABASE_SERVICE_ROLE_KEY` is set — this is what allows the API proxy to write to the usage table

**CORS errors** → Update `ALLOWED_ORIGIN` to exactly match your Vercel deployment URL
