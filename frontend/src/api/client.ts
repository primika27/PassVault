
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
  password: string; 
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

export async function createRegistrationPayload(form: { name: string; email: string; password: string }) {

  return {
    user_id: crypto.randomUUID(),
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
    body: JSON.stringify({ otp: authData.verificationCode }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(typeof data?.detail === "string" ? data.detail : "MFA verification failed");
  }

  return data as { message: string };
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

  const data = await res.json();
  if (!res.ok) {
    throw new Error(typeof data?.detail === "string" ? data.detail : "Login failed");
  }

  return data as { mfaRequired: boolean; next?: string };
}
