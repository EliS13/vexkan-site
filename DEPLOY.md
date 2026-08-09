# Deploying vexkan.ca

## What is there now

| Thing | Where |
| --- | --- |
| Registrar | Go Daddy Domains Canada |
| Nameservers | `ns1.siteground.net`, `ns2.siteground.net` |
| Web server | `35.208.229.19` — SiteGround, WordPress + Elementor |
| Mail | Microsoft 365, `vexkan-ca.mail.protection.outlook.com` |
| SPF | `v=spf1 include:spf.protection.outlook.com -all` |

**DNS is managed at SiteGround, not GoDaddy**, because the nameservers point
there. Everything below happens in SiteGround's DNS zone editor.

## The rule that matters

**Do not move the nameservers to Vercel.** The `MX` and SPF records that make
`admin@vexkan.ca` work live in the SiteGround zone. Repointing nameservers
abandons that zone, and club email stops arriving with no error anywhere. Change
only the `A` and `CNAME` records for the website itself.

## Who needs to do what

The steps below split across two kinds of access. An engineer can do the
GitHub and Vercel plumbing, but several steps need the club's own accounts and
cannot be done by anyone else:

- **Needs the club's GitHub account:** pushing this repository (step 1).
- **Needs the club's Vercel account:** importing the repository, setting the
  environment variables, and adding the domains (steps 2, 3, 5).
- **Needs the club's SiteGround account:** editing the DNS zone (step 6) and
  unpublishing WordPress (step 9).

## Steps

1. Push this repository to GitHub.
2. In Vercel, import the repository. Framework preset: Next.js. Build command
   and output directory: leave as the defaults.
3. In Vercel project settings, add environment variables for Production:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy, and test the `*.vercel.app` URL end to end: every page loads, a real
   registration submits, and `/admin` shows it.
5. In Vercel, add the domains `vexkan.ca` and `www.vexkan.ca`. Vercel shows the
   exact records to create — read them from the dashboard rather than assuming,
   as the values change.
6. In SiteGround's DNS zone editor for vexkan.ca:
   - Change the apex `A` record from `35.208.229.19` to the address Vercel gives.
   - Point `www` at the target Vercel gives.
   - **Change nothing else.** Leave every `MX` record and the SPF `TXT` record
     exactly as they are.
7. Wait for propagation, then verify:

   ```bash
   dig +short vexkan.ca A
   dig +short vexkan.ca MX
   curl -sSI https://vexkan.ca | head -1
   ```

   The `A` record should show Vercel's address, the `MX` record must still show
   `vexkan-ca.mail.protection.outlook.com`, and the status line should be `200`.
8. Send a test email to `admin@vexkan.ca` from an outside account and confirm it
   arrives. Do this the same day.
9. Leave the WordPress install in place but unpublished for a couple of weeks.

## Rolling back

Set the apex `A` record back to `35.208.229.19` and restore the previous `www`
record. WordPress starts serving again as soon as DNS propagates.

## Supabase

1. Create a project at https://supabase.com.
2. In the SQL editor run `supabase/migrations/0001_init.sql`, then
   `supabase/migrations/0002_registrations.sql`.
3. Copy the Project URL and the anon public key into Vercel's environment
   variables.
4. Visit `/admin`, request a sign-in link for the club address, then grant it
   access:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'admin@vexkan.ca';
   ```

The anon key is meant to be public. Row level security is what protects
registration data, and the policies are in the migration.
