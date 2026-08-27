import { argon2id } from 'hash-wasm';
import { encryptVaultEntry, type VaultEntry } from '../utils/passwordVault';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export interface EncryptedVaultItem {
  id: string;
  encrypted_data: string;
  created_at: string;
  updated_at: string;
}
export async function healthCheck() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}

export async function logout() {

  localStorage.removeItem("user_email");
  localStorage.removeItem("auth_salt");

  const res = await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

export async function getSalt(email: string) {
  const res = await fetch(`${API_BASE_URL}/salt?email=${email}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch salt (${res.status}): ${errorText}`);
  }
  
  return res.json();
}

export async function getVerificationCode(email: string) {
  const res = await fetch(`${API_BASE_URL}/verification-code?email=${email}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

export async function registerUser(userData: { 
  user_id: string; 
  name: string; 
  email: string; 
  auth_salt: string;
  auth_hash: string; 
}) {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await res.json();

  if (!res.ok) {
    let errorMessage = "Registration failed";
    
    if (Array.isArray(data.detail)) {
      errorMessage = data.detail
        .map((e: unknown) => {
          if (typeof e === "object" && e !== null && "loc" in e && "msg" in e) {
            const detailError = e as { loc: unknown; msg: unknown };
            const location = Array.isArray(detailError.loc)
              ? detailError.loc.at(-1)
              : detailError.loc;
            return `${location}: ${detailError.msg}`;
          }

          return String(e);
        })
        .join(", ");
    } else if (typeof data.detail === "string") {
      errorMessage = data.detail;
    }

    throw new Error(errorMessage);
  }

  return data; 
}

export function generateSalt(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export async function deriveAuthHash(password: string, salt: string): Promise<string> {
  const hash = await argon2id({
    password: password,
    salt,
    parallelism: 1,
    iterations: 3,
    memorySize: 65536,
    hashLength: 32,
    outputType: 'encoded'
  });
  return hash; 
}

export async function createRegistrationPayload(form: { name: string; email: string; password: string }) {

  //generate salt and hash the password
  const authSalt = generateSalt();
  const authHash = await deriveAuthHash(form.password, authSalt);
  
  return {
    user_id: crypto.randomUUID(),
    name: form.name,
    email: form.email,
    auth_salt: authSalt,
    auth_hash: authHash,
  };
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
export async function loginUser(loginData: { email: string; auth_hash: string }) {
  
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    credentials: "include", // Include cookies in the request
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  const data = await res.json();
  if (!res.ok) {
    const message= typeof data?.detail === "string" ? data.detail : "Login failed";
    throw new ApiError(message, res.status);
  }

  return data as { mfaRequired: boolean; next?: string };
}

export async function createLoginPayload(form: { email: string; password: string }) {
  
  const { salt } = await getSalt(form.email);
  if (!salt) {
    throw new Error("User not found or missing salt");
  }

  localStorage.setItem("user_email", form.email);
  localStorage.setItem("auth_salt", salt); 

  const [authHash, masterKey] = await Promise.all([
    deriveAuthHash(form.password, salt),
    deriveMasterKey(form.password, salt),
  ]);

return {
    loginData: {
      email: form.email,
      auth_hash: authHash,
    },
    masterKey, 
  };
}

export async function deriveMasterKey(password: string, salt: string): Promise<Uint8Array> {
  const binaryKey = await argon2id({
    password: password,
    salt: `enc:${salt}`, // Prefix ensures encryption key is mathematically distinct from auth hash
    parallelism: 1,
    iterations: 3,
    memorySize: 65536, // 64 MB in KiB
    hashLength: 32,    // 32 bytes (256 bits) required by XChaCha20
    outputType: 'binary' // Returns Uint8Array directly
  });
  return binaryKey;
}

export async function verifyEmail(token: string) {
  
  const res = await fetch(`${API_BASE_URL}/verify`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  return res.json();
}

export async function authenticateUser(authData: { verificationCode: string }) {
  const res = await fetch(`${API_BASE_URL}/mfa`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp: authData.verificationCode }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(typeof data?.detail === "string" ? data.detail : "MFA verification failed");
  }

  return data as { message: string };
}



export async function fetchVault(): Promise<EncryptedVaultItem[]> {
  const res = await fetch(`${API_BASE_URL}/vault`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail || "Failed to fetch vault");
  }
  return data.vault;
}

export async function fetchVaultItemById(itemId: string): Promise<EncryptedVaultItem> {
  const res = await fetch(`${API_BASE_URL}/vault/${itemId}`, {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail || "Failed to fetch vault item");
  }
  return data.vault_item;
}

export function createVaultItemPayload(entry: VaultEntry, masterKey: Uint8Array) {
  const encryptedData = encryptVaultEntry(entry, masterKey);
  return { encrypted_data: encryptedData };
}
export async function saveVaultItem(payload: {encrypted_data: string }) {
  const res = await fetch(`${API_BASE_URL}/vault`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.detail || "Failed to save vault item");
  }
  return data as { id: string; message: string };
}