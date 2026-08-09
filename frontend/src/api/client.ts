import argon2 from "argon2-browser";
// src/api/client.ts
export const API_BASE_URL = import.meta.env.BASE_API_URL ;

export async function healthCheck() {
  const res = await fetch(`${API_BASE_URL}/health`);
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
  return res.json();
}

export async function getVerificationCode(email: string) {
  const res = await fetch(`${API_BASE_URL}/verification-code?email=${email}`, {
    method: "GET",
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
  const result = await argon2.hash({
    pass: password,
    salt: salt,
    time: 3,
    mem: 65536, // 64 MB
    hashLen: 32,
    type: argon2.ArgonType.Argon2id,
  });
  return result.encoded; 
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

export async function createLoginPayload(form: { email: string; password: string }) {
  
  const { salt } = await getSalt(form.email);
  if (!salt) {
    throw new Error("User not found or missing salt");
  }

  const authHash = await deriveAuthHash(form.password, salt);

  return {
    email: form.email,
    auth_hash: authHash,
  };
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
    throw new Error(typeof data?.detail === "string" ? data.detail : "Login failed");
  }

  return data as { mfaRequired: boolean; next?: string };
}
