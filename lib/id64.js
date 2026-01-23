// // utils/id64.js
// const SALT = "LMS";

// export function encodeId(id) {
//   return btoa(`${SALT}:${id}`)
//     .replace(/=/g, "")
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_");
// }

// export function decodeId(token) {
//   const decoded = atob(token.replace(/-/g, "+").replace(/_/g, "/"));

//   return decoded.split(":")[1];
// }

// utils/id64.js
const SALT = "lms";
const ALPHABET = "abcdefghijklmnopqrstuvwxyz234567";

// Base32 encode
function base32Encode(str) {
  let bits = "";
  for (const c of str) {
    bits += c.charCodeAt(0).toString(2).padStart(8, "0");
  }

  let output = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    output += ALPHABET[parseInt(chunk, 2)];
  }

  return output;
}

// Base32 decode
function base32Decode(str) {
  let bits = "";
  for (const c of str) {
    bits += ALPHABET.indexOf(c).toString(2).padStart(5, "0");
  }

  let output = "";
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.slice(i, i + 8);
    if (byte.length === 8) {
      output += String.fromCharCode(parseInt(byte, 2));
    }
  }

  return output;
}

export function encodeId(id) {
  return base32Encode(`${SALT}:${id}`);
}

export function decodeId(token) {
  const decoded = base32Decode(token);
  return decoded.split(":")[1];
}
