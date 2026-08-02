import { useEffect, useState } from "react";
import { verifyEmail } from "../api/client";
import { Button } from "#components/ui/button";
export default function Verification() {
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const userId = urlParams.get("userId");

    if (token) {
      verifyEmail(token)
        .then(() => setStatus("success"))
        .catch(() => setStatus("error"));
      return;
    }

    if (userId) {
      const scheme = window.location.protocol === "https:" ? "wss" : "ws";
      const wsUrl = `${scheme}://${window.location.hostname}:8000/ws/verify/${encodeURIComponent(userId)}`;
      let ws: WebSocket | null = null;
      try {
        ws = new WebSocket(wsUrl);
      } catch (e) {
        console.error("Failed to create WebSocket:", e);
        return;
      }

      ws.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload && payload.verified) {
            setStatus("success");
            ws?.close();
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      ws.onerror = () => {
        setStatus("error");
        ws?.close();
      };

      // keep attempting to receive ping messages; if the socket closes without success,
      // we'll set error state in onclose if not already success.
      ws.onclose = () => {
        // Only mark error if we haven't already transitioned to success
        setStatus((prev) => (prev === "success" ? prev : "error"));
      };

      return () => {
        ws?.close();
      };
    }

  }, []);

  if (status === "checking") return <p>Awaiting verification of your email...</p>;
  if (status === "success") return (<>
  <p>Your email is verified! You can now log in.</p>
  <Button onClick={() => window.location.href = "/"}>Log In</Button>
  </>
  );
  return <p>Verification failed or link expired.</p>;
}