
/**
 * Solves the "Alphabetical Substitution" problem.
 * 
 * Common interpretations:
 * 1. Alphabetic Shift: Replace each character with the next one (z -> a).
 * 2. Atbash Cipher: Replace A with Z, B with Y, etc.
 * 3. Caesar Cipher: Shift by N.
 */

function alphabeticShift(inputString: string): string {
  return inputString.split('').map(char => {
    const code = char.charCodeAt(0);
    // Uppercase
    if (code >= 65 && code <= 90) {
      return code === 90 ? 'A' : String.fromCharCode(code + 1);
    }
    // Lowercase
    if (code >= 97 && code <= 122) {
      return code === 122 ? 'a' : String.fromCharCode(code + 1);
    }
    return char;
  }).join('');
}

function atbashCipher(inputString: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const reversed = 'ZYXWVUTSRQPONMLKJIHGFEDCBA';
  
  return inputString.split('').map(char => {
    const upper = char.toUpperCase();
    const index = alphabet.indexOf(upper);
    if (index !== -1) {
      const substituted = reversed[index];
      return char === upper ? substituted : substituted.toLowerCase();
    }
    return char;
  }).join('');
}

function caesarCipher(inputString: string, shift: number): string {
    return inputString.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        }
        if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        return char;
    }).join('');
}

const input = "PVMZ3XUUOX2GYJLW0YDAJMRC7QA2YFA8";

console.log("Input:", input);
console.log("1. Alphabetic Shift (+1):", alphabeticShift(input));
console.log("2. Atbash Cipher:", atbashCipher(input));
console.log("3. Caesar Cipher (+13 / ROT13):", caesarCipher(input, 13));

// Try to decode as Base32 (ignoring invalid chars or assuming standard)
// Note: '8' is not valid in standard Base32 (A-Z, 2-7). 0, 1, 8, 9 are excluded.
// But let's see if we can decode the valid part or if it's a different variant.
console.log("\nNote: The string contains '8', '0', '1' which might be invalid in standard Base32.");
