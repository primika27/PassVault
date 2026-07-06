// src/api/client.ts
import * as argon2 from "argon2-browser";
export const API_BASE_URL = "http://127.0.0.1:8000";

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

export async function registerUser(userData: { userId: string; name: string; email: string; authHash: argon2.Argon2BrowserHashResult; kdfSalt: string }) {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return res.json();
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
