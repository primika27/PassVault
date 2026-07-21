import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/ui/input-otp"

export default function Mfa() {

    return (
    <div className="flex flex-col items-center justify-center gap-5">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'sans-serif' }}>Please enter your 6 digit one-time password</h1>
      </div>
    <InputOTP maxLength={6} defaultValue="000000">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>

    <h2 style={{fontFamily: 'sans-serif', opacity: 0.7}}>Didn't receive the code?</h2>
    <button>Resend Code</button>
    </div>
  )
}