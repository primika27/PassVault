import { useEffect, useState, type SubmitEvent } from "react";
import { healthCheck, registerUser } from "../api/client";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../components/ui/field";
import { Input } from "../components/ui/input";
import { Button } from "#components/ui/button";
import { useNavigate } from "react-router-dom";
export default function Registration() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    healthCheck().then(console.log);
  }, []);
  
  const navigate=useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const payload = {
        userId: crypto.randomUUID(),
        name: form.name,
        email: form.email,
        authHash: form.password,
        kdfSalt: crypto.getRandomValues(new Uint8Array(64)),
        verification_status: "unverified",
      };

      const response = await registerUser(payload);
      console.log("User registered successfully:", response);
      setMessage("Account created successfully, please check your email for verification."); 
      navigate('/verification');

    } catch (error) {
      console.error("Registration failed:", error);
      setMessage("Registration failed. Please try again.");
    }
  };

  return (
    <FieldSet>
      <FieldLegend>Create your account with us</FieldLegend>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Username</FieldLabel>
            <Input
              id="name"
              name="name"
              autoComplete="off"
              placeholder="Evil Rabbit"
              value={form.name}
              onChange={handleChange}
            />
            <FieldDescription>This appears on emails.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              autoComplete="off"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="off"
              placeholder="Enter a secure password"
              value={form.password}
              onChange={handleChange}
            />
            <FieldDescription>Enter a secure password.</FieldDescription>
          </Field>

          <Button type="submit">Create Account</Button>
          {message ? <p className="text-sm text-muted-foreground shimmer-color-orange-600">{message}</p> : null}
        </FieldGroup>
      </form>
    </FieldSet>
  );
}
