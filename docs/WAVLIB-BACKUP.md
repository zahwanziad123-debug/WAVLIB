# WAVLIB Recovery & Backup Guide

This file is a safe recovery map for WAVLIB. It intentionally contains **no passwords, API keys, service-role keys, or other secrets**.

## 1. Core services

| Service | Purpose | Recovery location |
|---|---|---|
| GitHub | Source code and version history | This repository |
| GitHub Pages | Live website deployment | Repository Pages settings |
| Supabase | Authentication and project data | Supabase dashboard |
| Resend | Transactional email delivery | Resend dashboard |
| DigitalPlat | WAVLIB domain | `wavlib.dpdns.org` |

## 2. Current domain

**Domain:** `wavlib.dpdns.org`

The domain is managed through DigitalPlat. DNS records are maintained there.

### Current Resend DNS records

These are configuration values, not account secrets.

- DKIM TXT
  - Name: `resend._domainkey.wavlib`
  - Value: stored in the DigitalPlat DNS record and Resend dashboard
- Return-path MX
  - Name: `send.wavlib`
  - Value: `10 feedback-smtp.ap-northeast-1.amazonses.com.`
- SPF TXT
  - Name: `send.wavlib`
  - Value: `v=spf1 include:amazonses.com ~all`

**Do not store the DKIM private/key material, API keys, passwords, or access tokens in this repository.**

## 3. WAVLIB email identities

Planned sender identities:

- `noreply@wavlib.dpdns.org` — automated authentication and account emails
- `hello@wavlib.dpdns.org` — general contact
- `support@wavlib.dpdns.org` — support

These addresses do not need to be separate mailbox accounts just to send through Resend.

## 4. GitHub recovery

The WAVLIB source is stored in this repository, so Git history is the primary code backup.

On a new computer:

1. Sign in to GitHub.
2. Open the WAVLIB repository.
3. Clone/download the repository.
4. Continue development from the repository rather than from an old laptop copy.
5. Never commit `.env` files or secrets.

## 5. Supabase recovery

On a new computer:

1. Sign in to the Supabase account that owns the WAVLIB project.
2. Open the WAVLIB project.
3. Confirm Authentication settings and URL configuration.
4. Confirm the production site URL and redirect URLs.
5. Confirm email/SMTP settings.
6. Confirm database tables, policies, and storage configuration.

Do not put the Supabase service-role key in GitHub or frontend code.

## 6. Resend recovery

On a new computer:

1. Sign in to the Resend account used by WAVLIB.
2. Open Domains.
3. Confirm `wavlib.dpdns.org` is verified.
4. Confirm the sender identity used by Supabase.
5. If SMTP/API credentials need to be recreated, create them in Resend and configure them in Supabase only.

Never store a Resend API key in this repository.

## 7. DigitalPlat recovery

On a new computer:

1. Sign in to the DigitalPlat account that owns `wavlib.dpdns.org`.
2. Open the domain management page.
3. Confirm the domain is active.
4. Confirm the DNS records still exist.
5. Do not delete or replace working Resend DNS records unless the provider requires a change.

## 8. Secrets policy

Keep these **out of GitHub**:

- GitHub personal access tokens
- Supabase service-role keys
- Supabase database passwords
- Resend API keys
- SMTP passwords
- DigitalPlat passwords
- Recovery codes
- Personal email passwords

Store secrets in a password manager or another encrypted secret store. Keep recovery codes somewhere secure and separate from the project repository.

## 9. Recommended recovery test

Periodically verify that WAVLIB can be recovered without the original laptop:

- [ ] GitHub repository opens and contains the current code
- [ ] Git history contains recent changes
- [ ] Supabase project is accessible
- [ ] Supabase authentication works
- [ ] Production redirect URL is correct
- [ ] Resend domain remains verified
- [ ] DigitalPlat domain remains active
- [ ] DNS records are present
- [ ] A test signup can receive a verification email
- [ ] No secrets are committed to the repository

## 10. Important rule

The repository is a **configuration and code backup**, not a password vault. If a secret is ever committed accidentally, rotate/revoke it immediately and remove it from the repository history as appropriate.
