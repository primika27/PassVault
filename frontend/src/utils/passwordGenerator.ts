// src/utils/passwordGenerator.ts

export interface PasswordGeneratorOptions {
  length?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
  excludeAmbiguous?: boolean; 
}

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  ambiguous: /[il1Lo0O]/g,
};

export function generateSecurePassword(options: PasswordGeneratorOptions = {}): string {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    excludeAmbiguous = false,
  } = options;

  let pool = "";
  const guaranteedChars: string[] = [];

  const addCharset = (chars: string) => {
    let filtered = chars;
    if (excludeAmbiguous) {
      filtered = filtered.replace(CHARSETS.ambiguous, "");
    }
    if (filtered.length > 0) {
      pool += filtered;
      // Guarantee at least one character from each enabled set
      guaranteedChars.push(getRandomChar(filtered));
    }
  };

  if (uppercase) addCharset(CHARSETS.uppercase);
  if (lowercase) addCharset(CHARSETS.lowercase);
  if (numbers) addCharset(CHARSETS.numbers);
  if (symbols) addCharset(CHARSETS.symbols);

  if (!pool) {
    throw new Error("At least one character set must be selected.");
  }

  // Generate remaining random characters using CSPRNG
  const remainingLength = Math.max(0, length - guaranteedChars.length);
  const randomChars: string[] = [];
  const randomBytes = new Uint32Array(remainingLength);
  window.crypto.getRandomValues(randomBytes);

  for (let i = 0; i < remainingLength; i++) {
    randomChars.push(pool[randomBytes[i] % pool.length]);
  }

  // Combine and shuffle using Fisher-Yates with CSPRNG
  const allChars = [...guaranteedChars, ...randomChars];
  return secureShuffle(allChars).slice(0, length).join("");
}

function getRandomChar(str: string): string {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return str[array[0] % str.length];
}

function secureShuffle(array: string[]): string[] {
  const randomValues = new Uint32Array(array.length);
  window.crypto.getRandomValues(randomValues);

  for (let i = array.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}