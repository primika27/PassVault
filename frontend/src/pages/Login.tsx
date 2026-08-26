import { useEffect, useState } from "react";
import { ApiError, createLoginPayload, healthCheck, loginUser } from "../api/client";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../components/ui/field";
import { Input } from "../components/ui/input";
import { Button } from "#components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useVault } from "../context/VaultContext";

export default function Login() {
  const navigate = useNavigate();
  const { setMasterKey } = useVault();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);

  useEffect(() => {
    healthCheck().then(console.log);
  }, []);

  const [form, setForm] = useState({
    name: "",
    password: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }
  const handleLogin = async () => {

    setErrorMessage(null);
    setIsUnverified(false);
    setLoading(true);

    try {
      const { loginData, masterKey } = await createLoginPayload({
        email: form.name,
        password: form.password,
      });

      const response = await loginUser({
        email: loginData.email,
        auth_hash: loginData.auth_hash,
      });

      setMasterKey(masterKey);

        if (response.mfaRequired) {
          navigate(response.next ?? "/mfa");
          return;
        }
        console.log("User logged in successfully:", response);

        } catch (err) {
          if (err instanceof ApiError) {
            setErrorMessage(err.message);
            if (err.status === 403) {
              setIsUnverified(true);
            }
          } else if (err instanceof Error) {
            setErrorMessage(err.message);
          } else {
            setErrorMessage("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
  };
  
  return (
  
 <FieldSet>
  <FieldLegend>Login</FieldLegend>
  <FieldGroup>
    {isUnverified ? (
      <FieldError>
        Your email is not verified. Please check your inbox for a verification email.
      </FieldError>
    ) : errorMessage && (
      <FieldError >{errorMessage}</FieldError>
    )}
    <Field>
      <FieldLabel htmlFor="name">email</FieldLabel>
      <Input id="name" name="name" autoComplete="off" placeholder="enter email" value={form.name}
              onChange={handleChange} />
    </Field>
    <Field>
      <FieldLabel htmlFor="password">password</FieldLabel>
      <Input id="password" name="password" autoComplete="off" placeholder="enter password" type="password" value={form.password}
              onChange={handleChange} />
    </Field>
    <Button onClick={handleLogin} disabled={loading}>
      {loading ? "Logging in..." : "Login"}
    </Button>
    <Link className="text-sm text-muted-foreground hover:underline" to="/register">
      Don't have an account? Register
    </Link>
  </FieldGroup>
</FieldSet>
);
}
