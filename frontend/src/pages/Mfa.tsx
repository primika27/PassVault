import { useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/ui/input-otp"
import { authenticateUser } from "../api/client";

export default function Mfa() {

  const [otp, setOtp] = useState("");

   const handleAutoSubmit = async (code: string) => {
    try {
      console.log("Verifying code:", code);
      const response = await authenticateUser({ verificationCode: code });
      console.log("Verification response:", response);

    } catch (error) {
      console.error("Verification failed", error);
    }
  };

  const maxLength = 6;

   useEffect(() => {
    if (otp.length === maxLength) {
      handleAutoSubmit(otp);
    }
  }, [otp]);
    

    return (
    <div className="flex flex-col items-center justify-center gap-5">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'sans-serif' }}>Please enter your 6 digit one-time password</h1>
      </div>
    <InputOTP id="otp" maxLength={maxLength} defaultValue="000000" value={otp} onChange={setOtp}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup >
    </InputOTP>

    <h2 style={{fontFamily: 'sans-serif', opacity: 0.7}}>Didn't receive the code?</h2>
    <button>Resend Code</button>
    </div>
  )
}