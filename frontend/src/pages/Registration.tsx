import { useEffect } from "react";
import { healthCheck } from "../api/client";
import {
  Field,
  FieldDescription,
  //FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../components/ui/field";
import { Input } from "../components/ui/input";
import { Button } from "#components/ui/button";



export default function Registration() {
  useEffect(() => {
    healthCheck().then(console.log);
  }, []);

  return (
  
 <FieldSet>
  <FieldLegend>Create your account with us</FieldLegend>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="name">Username</FieldLabel>
      <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
      <FieldDescription>This appears on emails.</FieldDescription>
    </Field>    
    <Field>
      <FieldLabel htmlFor="username">Email</FieldLabel>
      <Input id="username" autoComplete="off" aria-invalid placeholder="you@example.com" />
      {/* {Valid && <FieldError>Please enter a valid email address.</FieldError>} */}
    </Field>
    <Field>
      <FieldLabel htmlFor="name">Password</FieldLabel>
      <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
      <FieldDescription>Enter a secure password.</FieldDescription>
    </Field>

    <Button type="submit">Create Account</Button>
  </FieldGroup>
</FieldSet>
);
}
