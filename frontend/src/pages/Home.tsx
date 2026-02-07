import { useEffect } from "react";
import { healthCheck } from "../api/client";

export default function Home() {
  useEffect(() => {
    healthCheck().then(console.log);
  }, []);

  return <h1>Secure Vault</h1>;
}
