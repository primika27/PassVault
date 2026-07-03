# PassVault

A zero-knowledge password vault: users generate, evaluate, and store passwords, with all vault
encryption/decryption happening client-side. The server never has access to a user's master
password, encryption key, or plaintext vault contents.

## Tech stack

**Frontend**
- React + TypeScript, React Router (`react-router-dom`) for page routing
- Tailwind CSS for styling
- shadcn/ui on **Base UI** primitives (`base-vega` style preset)
- `react-hook-form` + `zod` for form state and validation
- `zxcvbn` for password strength scoring

**Backend**
- FastAPI (Python)
- Argon2 (`argon2-cffi`) for server-side hashing of the client-derived auth value
- SQL database via SQLAlchemy (`app/db`)
- `smtplib` for email verification

## Architecture: why zero-knowledge

There are two distinct classes of "password" in this app, handled differently on purpose:

1. **The user's master/login password** — never transmitted in plaintext, never stored, never
   recoverable. Used only to derive keys client-side.
2. **Passwords stored inside the vault** (e.g. a user's Gmail password) — reversible, since the
   user needs to view them again. Encrypted client-side before ever reaching the server.

### Key derivation flow

1. On login, the client fetches the user's stored `kdf_salt` (`GET /auth/salt`).
2. The browser runs Argon2id over `(master password + salt)`.
3. That stretched output is split via domain-separated derivation (HKDF-style) into two
   independent values:
   - **Auth hash** — sent to the server, hashed again server-side with Argon2, and compared
     against the stored value to verify login.
   - **Encryption key** — never leaves the browser. Held only in memory (React context), never
     written to `localStorage`/`sessionStorage`, and cleared on logout or page refresh.
4. Vault items are encrypted client-side with **AES-256-GCM**, using a fresh random IV per item.
   The server only ever stores `ciphertext` + `iv`.

This means a full server/database compromise exposes salts, auth hashes, and ciphertext — but
not master passwords, encryption keys, or plaintext vault data.

### Data model (simplified)

| Table         | Fields                                                              |
|---------------|----------------------------------------------------------------------|
| `users`       | `id`, `username`, `email`, `kdf_salt`, `auth_hash`, `verified`      |
| `vault_items` | `id`, `user_id` (FK), `ciphertext`, `iv`, `created_at`, `updated_at` |

Metadata (item names/URLs) is currently left server-visible to support search; this is a known
tradeoff between convenience and full zero-knowledge coverage.

## Security decisions

- **Password strength**: `zxcvbn(password, user_inputs=[...])`, passing username, email, and the
  relevant service name as context so contextual passwords (e.g. `"Netflix123!"` for a Netflix
  entry) score realistically low rather than generically "strong."
- **Password generation**: uses a CSPRNG (`secrets` in Python / `crypto.getRandomValues()` in the
  browser), never `random`. Category inclusion (upper/lower/digit/symbol) is enforced via
  rejection sampling rather than fixed-position insertion, to avoid leaking structure.
- **Email verification**: single-use, expiring tokens (not implemented as a bare placeholder
  link), tracked in a separate table with an `expires_at`.
- **Auth routes**: `POST` only for anything carrying credentials (an earlier draft mistakenly used
  `GET` for `/login` and `/register` — corrected, since query strings leak into logs/history).
- **IV reuse**: explicitly avoided — AES-GCM security depends on a unique IV per encryption
  operation.

## Styling decisions

- **Base UI over Radix**: chosen for active full-time maintenance and a more consistent long-term
  API; shadcn/ui's component surface is identical either way, so this doesn't lock in behavior.
- **`base-vega` preset**: the classic, neutral shadcn look — chosen deliberately over more
  stylized presets (`nova`, `maia`, `lyra`, `mira`) so the UI reads as familiar and trustworthy
  rather than distracting, appropriate for a security-sensitive tool.
- Validation/error states (weak password warnings, breach-check failures, login errors) are kept
  visually prominent rather than subtle, since this is a place where "clean and minimal" styling
  can accidentally undercut security UX.

## Setup

```bash
# backend
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

# frontend
cd frontend
npm install
npm run dev
```

## Status / open items

- [ ] `POST /auth/salt`, `/auth/register`, `/auth/login` endpoints to match the client-side KDF flow
- [ ] Email verification token generation + send step
- [ ] Have I Been Pwned k-anonymity check alongside zxcvbn
- [ ] Session handling (JWT) after successful auth
