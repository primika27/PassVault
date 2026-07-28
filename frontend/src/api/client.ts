// src/api/client.ts
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

export async function getVerificationCode(email: string) {
  const res = await fetch(`${API_BASE_URL}/verification-code?email=${email}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.json();
}

export async function registerUser(userData: { userId: string; name: string; email: string;}) {
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

  return {
    userId: crypto.randomUUID(),
    name: form.name,
    email: form.email,
    password: form.password,
  };
}

export async function createLoginPayload(form: { email: string; password: string }) {
  return {
    email: form.email,
    password: form.password,
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
    body: JSON.stringify({ verificationCode: authData.verificationCode }),
  });
  return res.json();
}

export async function loginUser(loginData: { email: string; password: string }) {
  
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    credentials: "include", // Include cookies in the request
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });
  return res.json();
}
