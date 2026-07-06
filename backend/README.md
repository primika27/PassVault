to run backend: uvicorn app.main:app --reload
to activate the venv cd to backend and type : .\venv\Scripts\Activate.ps1


## 1. The KDF split (the foundation)

In the browser (using Web Crypto's `SubtleCrypto` or a library like `argon2-browser`), take the master password + a per-user salt (random, stored server-side, not secret) and run it through Argon2id (preferred) or PBKDF2 if Argon2id isn't available client-side. Then derive two separate keys from that stretched output using domain separation — e.g. HKDF with different "info" labels like `"auth"` vs `"encryption"`. This is exactly what Bitwarden does. The reason you don't just reuse one value for both: if your auth hash were the same as your encryption key, then the server — which necessarily sees the auth hash to verify login — would effectively be able to reconstruct your encryption key too. Splitting them means a compromised server *cannot* decrypt anything, even with full database access.

Things worth researching and documenting your reasoning on:
- Argon2id parameters (memory cost, iterations, parallelism) — there are real tradeoffs between mobile device performance and brute-force resistance
- Why you store the salt server-side but it's fine that it's not secret (its job is to prevent rainbow tables, not to be a secret key)
- What happens on password change (you have to re-derive the encryption key and re-encrypt everything — this is a good "hard problem I solved" interview story)

## 2. zxcvbn customization

The naive `zxcvbn(password)` call is missing the most valuable part: **context**. The library accepts a `user_inputs` list — pass in things like the username, email, first/last name, and even the *service name* the vault entry is for (e.g. if they're storing a Netflix password, pass `"netflix"`). zxcvbn dings the score hard if the password contains those strings, because "Password123!Netflix" scores as strong generically but is trivially guessable given context.

```python
from zxcvbn import zxcvbn
result = zxcvbn(password, user_inputs=["jdoe", "jdoe@gmail.com", "netflix"])
```

The result gives you more than just `score` (0–4) — look at `feedback.warning` and `feedback.suggestions` for actionable UI copy, and `crack_times_display` for a human-readable estimate to show the user. A good design decision to document: **feed `user_inputs` dynamically** from whatever fields are already filled in on the form (as the user types the site name, re-run zxcvbn with that as context).

For a stronger portfolio story, layer in a check zxcvbn doesn't do: query the **Have I Been Pwned** API using the k-anonymity range endpoint (you hash the password, send only the first 5 hex chars of the SHA-1, and check if the suffix appears in the response) — this checks against real breach corpora without ever sending the actual password anywhere.

## 3. Secure password generator

The critical detail: use Python's `secrets` module (or `crypto.getRandomValues()` in-browser), never `random` — `random` is a Mersenne Twister, not cryptographically secure, and its state is predictable from enough output.

Design decisions worth documenting:
- **Character pool composition** as configurable options (length, upper/lower/digits/symbols, exclude-ambiguous-characters like `0`/`O`/`l`/`1`)
- The naive way to "guarantee" one of each category is to force character 1 = uppercase, character 2 = digit, etc. — that's a real anti-pattern because it leaks structure and reduces entropy predictability. The better approach: build the full random string, then verify constraints are satisfied and regenerate if not (rejection sampling), or shuffle a guaranteed-set together with random padding.
- Offer a passphrase mode (Diceware-style, using the EFF wordlist) as an alternative to random strings — worth explaining *why* it's comparably strong despite "looking weaker" (entropy is per-word, not per-character, and word count controls it directly).
- Since you're going zero-knowledge: generate the password **client-side** so it's consistent with your trust model — the server never needs to see a generated password before it's encrypted.

## 4. Storage schema

Two tables, cleanly separated by purpose:

- `users`: id, username, email, `kdf_salt`, `auth_hash` (never a plaintext password, never the encryption key)
- `vault_items`: id, user_id (FK), `ciphertext`, `iv` (a fresh random nonce per item — never reuse an IV with AES-GCM, that's a critical, commonly-tested security fact), `created_at`, `updated_at`

One real design decision to make and document: do you also encrypt the item's **name/URL metadata**, or leave it in plaintext for server-side search? Leaving it plaintext means the server can see *which services* you have accounts for (a privacy leak) but lets you search/filter server-side. Encrypting it means true zero-knowledge but search has to happen client-side after decryption. Either choice is defensible — the point in an interview is that you can articulate the tradeoff.

Want to go deeper on any one of these next — the Argon2id parameter choices, the AES-GCM encryption code path, or the auth/session flow (how a JWT fits in once login is verified)?