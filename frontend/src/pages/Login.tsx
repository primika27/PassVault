import { useEffect } from "react";
import { healthCheck } from "../api/client";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../components/ui/field";
import { Input } from "../components/ui/input";
import { Button } from "#components/ui/button";

export default function Login() {
  useEffect(() => {
    healthCheck().then(console.log);
  }, []);

  return (
  
 <FieldSet>
  <FieldLegend>Login</FieldLegend>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="name">username</FieldLabel>
      <Input id="name" autoComplete="off" placeholder="enter username or email" />
    </Field>
    <Field>
      <FieldLabel htmlFor="username">password</FieldLabel>
      <Input id="username" autoComplete="off" aria-invalid placeholder="enter password" />
    </Field>
    <Button type="submit">Login</Button>
  </FieldGroup>
</FieldSet>
);
}
