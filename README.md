# 🐱 Catospher — Secure Text Encryption Extension

**Encrypt and decrypt text locally using AES-GCM and a generated passphrase.**  
Split the encrypted JSON and the passphrase, and send them through different channels for secure sharing.

---

## 🔎 Overview
Catospher is a browser extension (Manifest V3) that lets you:
- Encrypt arbitrary text (passwords, notes) to an encrypted JSON object.
- Generate a secure **alphanumeric passphrase** (includes `@ # ! ?`) for the recipient.
- Decrypt a JSON object when given the correct passphrase.
- Keep state locally using `localStorage` and copy/cross-share easily.

Files of interest:
- `manifest.json` — extension manifest
- `popup.html` — UI
- `popup.js` — encryption/decryption logic

---

## ✨ Features
- AES-GCM 256 bits for authenticated encryption.  
- KDF: PBKDF2-SHA256 (200,000 iterations by default).  
- Generated passphrase: alphanumeric + `@ # ! ?` (default length: 12).  
- Copy-to-clipboard helpers for passphrase, encrypted JSON, or decrypted text.  
- Local state saved in `localStorage`.  
- Clear and simple UI: Encrypt / Decrypt tabs + Clear All.  

---

## 🔐 Security Hardness

### Example passphrase
`VkzIJ?ri6#Mu`  
- Length: **12 characters**  
- Character set: 66 characters (upper + lower + digits + `@ # ! ?`)  

### Entropy
- ≈ **72.5 bits**  
- Keyspace = `66^12 ≈ 6.8 × 10^21` possible passphrases  

### Brute-force expectations
Average guesses needed ≈ `3.4 × 10^21`.  

| Guesses per second | Expected time to crack |
|--------------------|-------------------------|
| 1 billion (10⁹)    | ~108,000 years |
| 1 million (10⁶)    | ~108 million years |
| 10,000 (10⁴)       | ~10.8 billion years |
| 1,000 (10³)        | ~108 billion years |
| 100 (10²)          | ~1 trillion years |

With **PBKDF2 (200k iterations)** each guess is even slower → practical brute-force infeasible.

### Takeaways
- 12+ char passphrases are already very strong.  
- Using PBKDF2 at 200k iterations makes brute-force astronomically expensive.  
- Switching to **Argon2id** (memory-hard) makes GPU/ASIC brute-force even more costly.  
- Never transmit JSON + passphrase over the same channel.  

---

## ⚙️ Installation (local testing)
1. Clone or download this repository.  
2. Open Chrome/Edge → `chrome://extensions/`.  
3. Enable **Developer mode**.  
4. Click **Load unpacked** and select the folder containing the extension files.  
5. The 🐱 Catospher icon will appear in the toolbar.  

---

## 🧪 Usage
- **Encrypt**: type your text → click **Encrypt** → copy the JSON and the generated passphrase (send separately).  
- **Decrypt**: paste JSON + passphrase → click **Decrypt** to reveal plaintext.  
- **Clear All**: resets saved state in localStorage.  

---

## 📌 Roadmap
- [ ] Switch PBKDF2 → Argon2id (WASM).  
- [ ] Add UI lockout after N failed decrypt attempts.  
- [ ] Optional QR-code output for easier sharing.  

---

## ⚠️ Limitations
- If both JSON + passphrase are leaked together, encryption cannot help → always use separate channels.  
- Local brute-force is theoretically possible if attacker has both JSON and unlimited time/resources, but practically infeasible given entropy + KDF.  
- Adding Argon2id or hybrid public-key crypto would further improve security.  

---

## 📜 License & Contact
- ✅ Usage: personal, educational, experimental.  
- ❌ Commercial usage requires prior written authorization.  
- 📧 Contact: `chaib.nassim@outlook.com`  

☕ If you’d like to **buy me a coffee**, contact me via email.  

© 2025 **Catospher** – All rights reserved.  
