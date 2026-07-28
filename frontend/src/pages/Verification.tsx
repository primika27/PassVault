import { useEffect, useState } from "react";
import { verifyEmail } from "../api/client";
import { Button } from "#components/ui/button";
export default function Verification() {
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      // If no token is found, set the status to error
      // setStatus("error");
      return;
    }

    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, []);

  if (status === "checking") return <p>Awaiting verification of your email...</p>;
  if (status === "success") return (<>
  <p>Your email is verified! You can now log in.</p>
  <Button onClick={() => window.location.href = "/login"}>Log In</Button>
  </>
  );
  return <p>Verification failed or link expired.</p>;
}