import { useEffect, useState } from "react";
import { createLoginPayload, healthCheck, loginUser } from "../api/client";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../components/ui/field";
import { Input } from "../components/ui/input";
import { Button } from "#components/ui/button";
import { Link } from "react-router-dom";

export default function Login() {
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

    const loginData = await createLoginPayload({
      email: form.name,
      password: form.password,
    });
        try {
          const response = await loginUser({
            email: loginData.email,
            password: loginData.password,
          });
          console.log("User logged in successfully:", response);
        
        } catch (error) {
          console.error("Login failed:", error);
        }
  };
  
  return (
  
 <FieldSet>
  <FieldLegend>Login</FieldLegend>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="name">username</FieldLabel>
      <Input id="name" name="username" autoComplete="off" placeholder="enter username or email" value={form.name}
              onChange={handleChange} />
    </Field>
    <Field>
      <FieldLabel htmlFor="password">password</FieldLabel>
      <Input id="password" name="password" autoComplete="off" aria-invalid placeholder="enter password" value={form.password}
              onChange={handleChange} />
    </Field>
    <Button onClick={handleLogin}>Login</Button>
    <Link className="text-sm text-muted-foreground hover:underline" to="/register">
      Don't have an account? Register
    </Link>
  </FieldGroup>
</FieldSet>
);
}
