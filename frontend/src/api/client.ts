// src/api/client.ts
export const API_BASE_URL = "http://127.0.0.1:8000";

async function hashPassword(password: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function makeSalt(length = 64) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return btoa(String.fromCharCode(...bytes));
}

export async function healthCheck() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}

export async function getSalt(email: string) {
  const res = await fetch(`${API_BASE_URL}/salt?email=${email}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

export async function registerUser(userData: { userId: string; name: string; email: string; authHash: string; kdfSalt: string }) {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function createRegistrationPayload(form: { name: string; email: string; password: string }) {
  const authHash = await hashPassword(form.password);
  const kdfSalt = makeSalt();

  return {
    userId: crypto.randomUUID(),
    name: form.name,
    email: form.email,
    authHash,
    kdfSalt,
  };
}

export async function verifyUser(verificationData: { email: string; verificationCode: string }) {
  const res = await fetch(`${API_BASE_URL}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(verificationData),
  });
  return res.json();
}

export async function loginUser(loginData: { email: string; authHash: string }) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });
  return res.json();
}
