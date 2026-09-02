# PassVault

A zero-knowledge password vault: users generate, evaluate, and store passwords, with all vault
encryption and decryption executing exclusively client-side. The server never has access to a
user's master password, encryption key, or plaintext vault contents.

---

## Tech Stack

**Frontend**
- **Core:** React + TypeScript, React Router (`react-router-dom`)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui on **Base UI** primitives (`base-vega` style preset)
- **Forms & Validation:** `react-hook-form` + `zod`
- **Strength Scoring:** `zxcvbn` (with contextual inputs)
- **Hosting:** Vercel

**Backend**
- **Framework:** FastAPI (Python 3.11+)
- **Database & ORM:** PostgreSQL (Neon serverless) / SQLite (local dev), SQLAlchemy 2.0+
- **Hashing:** Argon2 (`argon2-cffi`) for server-side verification of client-derived auth hashes
- **Email:** `smtplib` for expiring verification token dispatch
- **Hosting:** Render (Linux web service via Uvicorn)

---

## Architecture: Why Zero-Knowledge

There are two distinct classes of "password" in this app, handled differently on purpose:

1. **The user's master/login password** — never transmitted in plaintext, never stored, and never
   recoverable. Used strictly to derive keys client-side.
2. **Passwords stored inside the vault** (e.g., service credentials) — reversible, since the
   user needs to decrypt and view them. Encrypted client-side before ever reaching the network.

1. On login, the client fetches the user's stored `kdf_salt` (`GET /auth/salt`).
2. The browser runs Argon2id over `(master password + salt)`.
3. The stretched output is split via domain-separated derivation (HKDF-style) into two
   independent values:
   - **Auth hash** — sent to the server, hashed again server-side with Argon2, and compared
     against the stored value to verify login.
   - **Encryption key** — never leaves the browser. Held only in memory (React context), never
     written to persistent web storage, and cleared on logout or page refresh.
4. Vault items are encrypted client-side with **AES-256-GCM**, using a fresh, random 96-bit IV
   per item. The server only ever stores `ciphertext` + `iv`.

This guarantees that a full server or database compromise exposes salts, auth hashes, and
ciphertext — but never master passwords, encryption keys, or plaintext credentials.

---

### Data Model

| Table         | Fields                                                               |
|---------------|----------------------------------------------------------------------|
| `users`       | `id`, `username`, `email`, `kdf_salt`, `auth_hash`, `verified`       |
| `vault_items` | `id`, `user_id` (FK), `ciphertext`, `iv`, `created_at`, `updated_at` |

*Metadata note:* Service identifiers/labels are currently left server-visible to enable efficient
query filtering; this represents an explicit tradeoff between search convenience and full
zero-knowledge metadata masking.

---

## Security Decisions

- **Contextual Password Strength:** Evaluated with `zxcvbn(password, user_inputs=[...])`, passing
  username, email, and the target service name so contextual passwords (e.g., `"Netflix123!"` for
  a Netflix entry) score realistically low rather than generically "strong."
- **Cryptographically Secure Password Generation:** Relies on CSPRNGs (`secrets` in Python and
  `crypto.getRandomValues()` in the browser), avoiding standard pseudorandom libraries. Character
  category inclusion (uppercase, lowercase, digits, symbols) is enforced via rejection sampling
  rather than fixed-position insertion, preventing predictable structural leakage.
- **Single-Use Email Verification:** Ephemeral, expiring tokens tracked in a database table with an
  explicit `expires_at` timestamp.
- **Strict HTTP Methods:** All credential-handling routes strictly mandate `POST` to ensure
  sensitive payload parameters are never exposed in server logs, reverse-proxy traces, or browser history.
- **Guaranteed IV Freshness:** Explicitly enforced — AES-GCM security depends on a unique, non-repeating
  IV per encryption call to prevent keystream reuse attacks.
- **Database Pool Resilience:** Configured SQLAlchemy engine with `pool_pre_ping=True` and connection
  recycling to gracefully handle serverless PostgreSQL compute suspends on Neon.

---

## Styling Decisions

- **Base UI over Radix:** Selected for active maintenance and a consistent long-term primitive API
  while maintaining shadcn/ui component parity.
- **`base-vega` Preset:** Clean, neutral aesthetic chosen deliberately over stylized presets
  (`nova`, `maia`, `lyra`) so the interface conveys trust and clarity suitable for a security tool.
- **High-Visibility Validation States:** Warning alerts, breach indicators, and validation failures
  are given high visual prominence rather than subtle treatments to prioritize security feedback over
  minimalist aesthetics.

---



