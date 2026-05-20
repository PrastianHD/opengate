# Stage 1 — Database setup

This stage creates the database schema, RLS policies, and seed data for OpenGate.

## Prerequisites

1. **Supabase account** — sign up at https://supabase.com (free tier is fine to start)
2. Create a new project. Choose region closest to your users (Singapore for SEA).
3. Wait for the project to provision (~2 minutes)

## Files

| File | What it does |
|---|---|
| `001_schema.sql` | Creates all tables, indexes, triggers, helper functions (`debit_credit`, `topup_credit`) |
| `002_rls.sql` | Enables RLS, defines policies (user reads own data, admin reads all) |
| `003_seed.sql` | Seeds 7 providers + 12 models with pricing (already includes 20% markup) |

## How to run

### Option A — Supabase Dashboard (easiest)

1. Go to your Supabase project → **SQL Editor**
2. Click **New query**
3. Paste `001_schema.sql`, click **Run**
4. New query → paste `002_rls.sql`, click **Run**
5. New query → paste `003_seed.sql`, click **Run**

### Option B — Supabase CLI (if you prefer)

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## Verify

After running, in the dashboard:

```sql
-- Should return 7
select count(*) from public.providers;

-- Should return 12
select count(*) from public.models where enabled = true;

-- See the model catalog
select slug, display_name, tier,
       (input_price_per_m_micro_cents::float / 1000000) as input_usd_per_m,
       (output_price_per_m_micro_cents::float / 1000000) as output_usd_per_m
from public.models
order by tier, slug;
```

## Become admin

After your first user signs up via the app (Stage 2), flip your own role:

```sql
update public.users
set role = 'admin'
where email = 'your.email@gmail.com';
```

## Get keys for the Next.js app

In Supabase dashboard → **Settings → API**:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key (secret!) → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to client)

Add to `.env.local` (created in Stage 2).

## Notes on the schema

- **`balance_micro_cents`** uses BIGINT. 1 USD = 1,000,000 micro-cents. Aman dari floating point error, presisi sampai $0.000001.
- **`debit_credit()`** function locks the user row before deducting — atomic, race-condition-safe.
- **`transactions`** table is the source of truth (append-only ledger). `users.balance_micro_cents` is a cache.
- **`gateway_keys.key_hash`** stores `sha256(plain_key)`. The plain key is shown to user only once at creation.
- **RLS** is on for every table. Service role (used by the gateway API) bypasses RLS.
- **`handle_new_user()` trigger** auto-creates a `public.users` row when someone signs up via NextAuth + Supabase adapter.

## Markup adjustment

Models are seeded with 20% markup over upstream provider prices. To change later:

```sql
-- Bump all models by another 10%
update public.models set
  input_price_per_m_micro_cents = (input_price_per_m_micro_cents * 110 / 100),
  output_price_per_m_micro_cents = (output_price_per_m_micro_cents * 110 / 100);
```

Or per-model in the admin dashboard (Stage 7).
