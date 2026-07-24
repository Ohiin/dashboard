// PBKDF2-based password hashing using the Web Crypto SubtleCrypto API.
// Only the salt + derived hash are ever persisted — never the raw password.

const ITERATIONS = 150_000;
const HASH_ALGO = "SHA-256";
const KEY_LENGTH_BITS = 256;

function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(password: string, salt: ArrayBuffer): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: HASH_ALGO,
    },
    baseKey,
    KEY_LENGTH_BITS
  );
}

export async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const derived = await deriveKey(password, saltBytes.buffer);
  return {
    salt: bufferToBase64(saltBytes.buffer),
    hash: bufferToBase64(derived),
  };
}

export async function verifyPassword(
  password: string,
  salt: string,
  hash: string
): Promise<boolean> {
  const saltBuffer = base64ToBuffer(salt);
  const derived = await deriveKey(password, saltBuffer);
  const derivedB64 = bufferToBase64(derived);
  // constant-time-ish compare
  if (derivedB64.length !== hash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < derivedB64.length; i++) {
    mismatch |= derivedB64.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return mismatch === 0;
}
