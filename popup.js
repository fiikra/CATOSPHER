// --- Helper Functions ---
function ab2b64(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function b642ab(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

// --- Cryptographic Functions ---
async function deriveKeyForEncrypt(pin, salt) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
}

async function deriveKeyForDecrypt(pin, salt, iter) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

function genPIN() {
  return String(crypto.getRandomValues(new Uint32Array(1))[0] % 1e8).padStart(8, "0");
}

// --- Save & Load Form State ---
function saveState() {
  const state = {
    plaintext: document.getElementById("plaintext").value,
    jsonInput: document.getElementById("jsonInput").value,
    pinInput: document.getElementById("pinInput").value,
    decrypted: document.getElementById("decrypted").value,
    jsonOutput: document.getElementById("jsonOutput").value,
    pin: document.getElementById("pin").textContent
  };
  localStorage.setItem("catospherState", JSON.stringify(state));
}

function loadState() {
  const state = JSON.parse(localStorage.getItem("catospherState") || "{}");
  if (state.plaintext) document.getElementById("plaintext").value = state.plaintext;
  if (state.jsonInput) document.getElementById("jsonInput").value = state.jsonInput;
  if (state.pinInput) document.getElementById("pinInput").value = state.pinInput;
  if (state.decrypted) document.getElementById("decrypted").value = state.decrypted;
  if (state.jsonOutput) document.getElementById("jsonOutput").value = state.jsonOutput;
  if (state.pin) document.getElementById("pin").textContent = state.pin;
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
      const pin = genPIN();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKeyForEncrypt(pin, salt.buffer);
      const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain));

      const obj = {
        v: 1,
        salt: ab2b64(salt.buffer),
        iv: ab2b64(iv.buffer),
        ct: ab2b64(ct),
        iter: 200000,
      };

      document.getElementById("pin").textContent = pin;
      document.getElementById("jsonOutput").value = JSON.stringify(obj, null, 2);
      saveState();
    } catch (e) {
      console.error("Encryption Error:", e.message);
    }
  });

  // DECRYPT
  document.getElementById("decryptBtn").addEventListener("click", async () => {
    const jsonTxt = document.getElementById("jsonInput").value.trim();
    const pin = document.getElementById("pinInput").value.trim();
    if (!jsonTxt || !pin) return;

    try {
      const obj = JSON.parse(jsonTxt);
      const key = await deriveKeyForDecrypt(pin, b642ab(obj.salt), obj.iter || 200000);
      const plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(b642ab(obj.iv)) },
        key,
        b642ab(obj.ct)
      );

      document.getElementById("decrypted").value = new TextDecoder().decode(plain);
      saveState();
    } catch (e) {
      console.error("Decryption Error:", e.message);
    }
  });

  // COPY
  const copyToClipboard = (elementId) => {
    const text = document.getElementById(elementId).value || document.getElementById(elementId).textContent;
    if (!text || text === "--------") return;
    navigator.clipboard.writeText(text).catch(err => console.error("Copy failed:", err));
  };

  document.getElementById("copyPinBtn").addEventListener("click", () => copyToClipboard("pin"));
  document.getElementById("copyJsonBtn").addEventListener("click", () => copyToClipboard("jsonOutput"));
  document.getElementById("copyDecryptedBtn").addEventListener("click", () => copyToClipboard("decrypted"));

  // CLEAR
  document.getElementById("clearBtn").addEventListener("click", () => clearState());
});
