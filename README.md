📌 Aperçu

Catospher est une extension de navigateur  permettant d’encrypter et décrypter du texte (comme des mots de passe ou notes sensibles) en utilisant AES-GCM et un PIN à usage unique.

L’objectif : partager des informations sensibles de manière sécurisée en séparant le message chiffré et le code PIN.

✨ Fonctionnalités principales

🔒 Chiffrement AES-GCM 256 bits basé sur un PIN aléatoire à 8 chiffres.

📑 Génération d’un objet JSON chiffré à partager.

🔑 Déchiffrement via le JSON + le PIN transmis par un autre canal.

📋 Copie rapide du PIN, du JSON et du texte déchiffré.

💾 Sauvegarde automatique de l’état via localStorage.

🗑️ Bouton Clear All pour réinitialiser les champs.

Interface claire avec onglets Encrypt / Decrypt.

🖥️ Interface
Onglet Encrypt

Entrée du texte secret.

Génération d’un PIN unique.

Génération d’un JSON chiffré prêt à partager.
⚠️ Recommandation : ne jamais transmettre le PIN et le JSON par le même canal.

Onglet Decrypt

Coller le JSON chiffré reçu.

Saisir le PIN reçu séparément.

Obtenir instantanément le texte déchiffré.

⚙️ Installation locale

Clone ou télécharge ce repo.

Ouvre Chrome/Edge → chrome://extensions/

Active le mode développeur.

Clique sur Charger l’extension non empaquetée.

Sélectionne le dossier contenant :

manifest.json

popup.html

popup.js

le dossier icons/

L’icône 🐱 apparaîtra dans la barre d’outils.

🔐 Sécurité

Algorithme : AES-GCM 256 bits

Dérivation de clé : PBKDF2 + SHA-256 (200 000 itérations)

Chaque chiffrement génère :

un sel aléatoire,

un vecteur d’initialisation (IV),

un PIN unique à 8 chiffres.

📄 Licence & Usage

✅ Usage personnel, éducatif, expérimental.

❌ Usage commercial interdit sans autorisation écrite du propriétaire.

📧 Contact : chaib.nassim@outlook.com

© 2025 Catospher – Tous droits réservés.
