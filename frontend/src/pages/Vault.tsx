// src/pages/Vault.tsx
import { useEffect, useState } from "react";
import { useVault } from "../context/VaultContext";
import {
  createVaultItemPayload,
  deriveMasterKey,
  fetchVault,
  getKeyCheckBlob,
  getSalt,
  saveVaultItem,
} from "../api/client";
import { decryptVaultEntry, type VaultEntry } from "../utils/passwordVault";
import { Button } from "#components/ui/button";

// Combines the decrypted fields with the database record ID
export type DecryptedVaultItem = VaultEntry & { id: string };

export const Vault = () => {
  const { masterKey, setMasterKey } = useVault();

  const [vaultEntries, setVaultEntries] = useState<DecryptedVaultItem[]>([]);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [masterPassword, setMasterPassword] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError(null);
    setIsUnlocking(true);

    try {
      let salt = localStorage.getItem("auth_salt");
      const email = localStorage.getItem("user_email");

      if (!salt && email) {
        const data = await getSalt(email);
        salt = data.salt;
        if (salt) localStorage.setItem("auth_salt", salt);
      }

      if (!salt) {
        throw new Error("Session metadata missing. Please log in again.");
      }

      // 1. Derive candidate key from the entered password
      const derivedKey = await deriveMasterKey(masterPassword, salt);

      // 2. Fetch the verification ciphertext from the backend
      const checkBlob = await getKeyCheckBlob();
      if (!checkBlob) {
        throw new Error("Key verification token not found. Please log in again.");
      }

      // 3. Authenticate the key using Poly1305 MAC decryption
      try {
        const checkEntry = decryptVaultEntry(checkBlob, derivedKey);
        if (checkEntry.password !== "VALID_KEY") {
          throw new Error("Incorrect master password.");
        }
      } catch {
        throw new Error("Incorrect master password.");
      }

      // 4. Unlock only when key verification succeeds
      setMasterKey(derivedKey);
      setMasterPassword("");
    } catch (err) {
      setUnlockError(
        err instanceof Error ? err.message : "Failed to unlock vault. Incorrect password."
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  useEffect(() => {
    async function loadVault() {
      if (!masterKey) return;

      try {
        setLoading(true);
        setError(null);

        const encryptedItems = await fetchVault();
        const decryptedList: DecryptedVaultItem[] = encryptedItems.map((item) => {
          const entry = decryptVaultEntry(item.encrypted_data, masterKey);
          return { ...entry, id: item.id };
        });

        setVaultEntries(decryptedList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load vault items.");
      } finally {
        setLoading(false);
      }
    }
    loadVault();
  }, [masterKey]);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllRevealed =
    vaultEntries.length > 0 && revealedIds.size === vaultEntries.length;

  const toggleRevealAll = () => {
    if (isAllRevealed) {
      setRevealedIds(new Set());
    } else {
      setRevealedIds(new Set(vaultEntries.map((entry) => entry.id)));
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterKey) return;

    try {
      const entryData = { title, username, password, url, notes };
      const payload = createVaultItemPayload(entryData, masterKey);
      const savedItem = await saveVaultItem(payload);

      setVaultEntries((prev) => [...prev, { ...entryData, id: savedItem.id }]);

      setShowAddForm(false);
      setTitle("");
      setUsername("");
      setPassword("");
      setUrl("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save item.");
    }
  };

  if (!masterKey) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 text-center">
        <h2 className="text-xl font-semibold text-zinc-100">Vault is Locked</h2>
        <p className="text-sm text-zinc-400">
          Enter your master password to decrypt your data.
        </p>

        {unlockError && <p className="text-red-400 text-sm">{unlockError}</p>}

        <form onSubmit={handleUnlock} className="space-y-3">
          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="Enter master password"
            required
            autoFocus
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-100 text-sm outline-none focus:border-zinc-500"
          />
          <Button type="submit" disabled={isUnlocking} className="w-full">
            {isUnlocking ? "Verifying & Decrypting..." : "Unlock Vault"}
          </Button>
        </form>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-zinc-400">Decrypting vault items...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-zinc-100">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Password vault</h1>
          <p className="text-xs text-zinc-400 mt-1">
            {vaultEntries.length} saved {vaultEntries.length === 1 ? "account" : "accounts"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {vaultEntries.length > 0 && (
            <Button variant="outline" size="sm" onClick={toggleRevealAll}>
              {isAllRevealed ? "Hide All" : "Reveal All"}
            </Button>
          )}
          <Button onClick={() => setShowAddForm((prev) => !prev)}>
            {showAddForm ? "Cancel" : "+ Add Password"}
          </Button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Add Password Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddEntry}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3 shadow-lg"
        >
          <input
            type="text"
            placeholder="Account / Service (e.g. GitHub)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-100 text-sm outline-none focus:border-zinc-500"
          />
          <input
            type="text"
            placeholder="Username / Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-100 text-sm outline-none focus:border-zinc-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-100 text-sm outline-none focus:border-zinc-500"
          />
          <input
            type="url"
            placeholder="Website URL (optional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-100 text-sm outline-none focus:border-zinc-500"
          />
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-zinc-100 text-sm outline-none focus:border-zinc-500"
          />
          <Button type="submit" className="w-full">
            Encrypt & Save
          </Button>
        </form>
      )}

      {/* Vault Items List */}
      <div className="space-y-3">
        {vaultEntries.length === 0 ? (
          <p className="text-zinc-500 text-sm">No saved credentials found.</p>
        ) : (
          vaultEntries.map((entry) => {
            const isRevealed = revealedIds.has(entry.id);

            return (
              <div
                key={entry.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-base text-zinc-100">{entry.title}</h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    <span className="text-zinc-600">User:</span> {entry.username}
                  </p>
                  {entry.url && (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:underline block"
                    >
                      {entry.url}
                    </a>
                  )}
                  {entry.notes && (
                    <p className="text-xs text-zinc-400 italic mt-1 bg-zinc-950/60 p-2 rounded border border-zinc-800/50">
                      {entry.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 self-end md:self-center">
                  <div className="bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 min-w-[140px] text-center font-mono text-sm text-zinc-200 select-all">
                    {isRevealed ? entry.password : "••••••••••••"}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleReveal(entry.id)}
                    className="text-xs"
                  >
                    {isRevealed ? "Hide" : "Click to Reveal"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(entry.password)}
                    className="text-xs"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Vault;