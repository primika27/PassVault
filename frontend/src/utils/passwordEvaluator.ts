import zxcvbn, { type ZXCVBNResult } from "zxcvbn";

export const evaluatePassword = (password: string) => {

    if (!password) {
    return {
      guesses: 0,
      crackTimeDisplay: "Instant",
      score: 0,
      warning: "",
      suggestions: [],
    };
  }

    const result: ZXCVBNResult = zxcvbn(password);

    const { 
        guesses, 
        crack_times_display, 
        score, 
        feedback 
    } = result;

return {
    guesses: guesses,
    crackTimeDisplay: crack_times_display.offline_slow_hashing_1e4_per_second,
    score: score, // 0 to 4
    warning: feedback.warning, // e.g., "This is a top-10 common password"
    suggestions: feedback.suggestions, // e.g., ["Add another word or two"]
  };
    

}