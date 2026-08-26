// src/utils/cryptoVault.ts
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { bytesToHex, hexToBytes, managedNonce } from '@noble/ciphers/utils.js';

export type VaultEntry = {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
};

/**
 * Encrypts a VaultEntry into a single Hex string (Nonce + Ciphertext + Auth Tag)
 */
export function encryptVaultEntry(entry: VaultEntry, masterKey: Uint8Array): string {
  // 1. Serialize object to UTF-8 bytes
  const plaintextBytes = new TextEncoder().encode(JSON.stringify(entry));

  // 2. Initialize XChaCha20 with automatic random nonce management
  const cipher = managedNonce(xchacha20poly1305)(masterKey);

  // 3. Encrypt (automatically generates and prepends a 24-byte nonce)
  const encryptedBytes = cipher.encrypt(plaintextBytes);

  // 4. Return as a hex string for easy JSON / SQL transport
  return bytesToHex(encryptedBytes);
}

/**
 * Decrypts a Hex string back into a typed VaultEntry
 */
export function decryptVaultEntry(encryptedHex: string, masterKey: Uint8Array): VaultEntry {
  const encryptedBytes = hexToBytes(encryptedHex);

  // managedNonce extracts the first 24 bytes as the nonce automatically
  const cipher = managedNonce(xchacha20poly1305)(masterKey);
  const decryptedBytes = cipher.decrypt(encryptedBytes);

  const jsonString = new TextDecoder().decode(decryptedBytes);
  return JSON.parse(jsonString) as VaultEntry;
}