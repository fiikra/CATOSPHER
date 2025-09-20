// popup.js — updated to use secure alphanumeric passphrase with special chars (@ # ! ?)

// --- Helper Functions ---
function ab2b64(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function b642ab(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

// --- Cryptographic Functions ---
async function deriveKeyForEncrypt(secret, salt) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
}

async function deriveKeyForDecrypt(secret, salt, iter) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

// --- Passphrase generator ---
// Generates a cryptographically secure passphrase with uppercase, lowercase, digits and selected specials.
function genPassphrase(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#!?";
  const max = chars.length;
  const rnd = new Uint32Array(length);
  crypto.getRandomValues(rnd);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[rnd[i] % max];
  }
  return out;
}

// --- Save & Load Form State ---
function saveState() {
  const state = {
    plaintext: document.getElementById("plaintext")?.value,
    jsonInput: document.getElementById("jsonInput")?.value,
    passphraseInput: document.getElementById("pinInput")?.value, // keep old id pinInput for compatibility
    decrypted: document.getElementById("decrypted")?.value,
    jsonOutput: document.getElementById("jsonOutput")?.value,
    passphrase: document.getElementById("pin")?.textContent // element with id "pin" is kept in html
  };
  localStorage.setItem("catospherState", JSON.stringify(state));
}

function loadState() {
  const state = JSON.parse(localStorage.getItem("catospherState") || "{}");
  if (state.plaintext) document.getElementById("plaintext").value = state.plaintext;
  if (state.jsonInput) document.getElementById("jsonInput").value = state.jsonInput;
  if (state.passphraseInput) document.getElementById("pinInput").value = state.passphraseInput;
  if (state.decrypted) document.getElementById("decrypted").value = state.decrypted;
  if (state.jsonOutput) document.getElementById("jsonOutput").value = state.jsonOutput;
  if (state.passphrase) document.getElementById("pin").textContent = state.passphrase;
}

function clearState() {
  localStorage.removeItem("catospherState");
  document.getElementById("plaintext").value = "";
  document.getElementById("jsonInput").value = "";
  document.getElementById("pinInput").value = "";
  document.getElementById("decrypted").value = "";
  document.getElementById("jsonOutput").value = "";
  document.getElementById("pin").textContent = "--------";
}

// --- Event Listeners and Main Logic ---
document.addEventListener("DOMContentLoaded", () => {
  loadState();

  ["plaintext", "jsonInput", "pinInput", "decrypted", "jsonOutput"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", saveState);
  });

  // Tabs
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      tabContents.forEach((content) => content.classList.remove("active"));
      document.getElementById(button.dataset.tab).classList.add("active");
    });
  });

  // ENCRYPT
  document.getElementById("encryptBtn").addEventListener("click", async () => {
    const plain = document.getElementById("plaintext").value.trim();
    if (!plain) return;

    try {
      // generate a passphrase (alphanumeric + @ # ! ?)
      const pass = genPassphrase(12); // default length 12 (tune as needed)
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKeyForEncrypt(pass, salt.buffer);
      const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain));

      const obj = {
        v: 1,
        salt: ab2b64(salt.buffer),
        iv: ab2b64(iv.buffer),
        ct: ab2b64(ct),
        iter: 200000,
        kdf: "PBKDF2-SHA256"
      };

      // show passphrase in the same UI element as before (id="pin") for compatibility
      document.getElementById("pin").textContent = pass;
      document.getElementById("jsonOutput").value = JSON.stringify(obj, null, 2);
      saveState();
    } catch (e) {
      console.error("Encryption Error:", e.message);
    }
  });

  // DECRYPT
  document.getElementById("decryptBtn").addEventListener("click", async () => {
    const jsonTxt = document.getElementById("jsonInput").value.trim();
    // read passphrase from the input (id pinInput retained)
    const pass = document.getElementById("pinInput").value.trim();
    if (!jsonTxt || !pass) return;

    try {
      const obj = JSON.parse(jsonTxt);
      const key = await deriveKeyForDecrypt(pass, b642ab(obj.salt), obj.iter || 200000);
      const plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(b642ab(obj.iv)) },
        key,
        b642ab(obj.ct)
      );

      document.getElementById("decrypted").value = new TextDecoder().decode(plain);
      saveState();
    } catch (e) {
      console.error("Decryption Error:", e.message);
      // optional: show user friendly message
    }
  });

  // COPY
  const copyToClipboard = (elementId) => {
    const el = document.getElementById(elementId);
    const text = el ? (el.value || el.textContent) : "";
    if (!text || text === "--------") return;
    navigator.clipboard.writeText(text).catch(err => console.error("Copy failed:", err));
  };

  document.getElementById("copyPinBtn").addEventListener("click", () => copyToClipboard("pin"));
  document.getElementById("copyJsonBtn").addEventListener("click", () => copyToClipboard("jsonOutput"));
  document.getElementById("copyDecryptedBtn").addEventListener("click", () => copyToClipboard("decrypted"));

  // CLEAR
  document.getElementById("clearBtn").addEventListener("click", () => clearState());
});
