/* ========================================
   CONFIGURATION DE BASE
======================================== */

// Système d'utilisateurs
let currentUser = null;

// Fonctions de stockage de base (utilise directement localStorage)
const originalGetItem = (key) => {
    return localStorage.getItem(key);
};

const originalSetItem = (key, value) => {
    localStorage.setItem(key, value);
};

function getAllUsers() {
    return JSON.parse(originalGetItem('allUsers') || '{}');
}

function saveAllUsers(users) {
    originalSetItem('allUsers', JSON.stringify(users));
}

/* ========================================
   SYSTÈME D'ADMINISTRATION PAR IP
======================================== */

// Liste des IPs autorisées pour l'administration
// Remplacez par votre IP réelle
const ADMIN_IPS = [
    '213.44.129.20'  // IP admin
];

// Variable pour stocker l'IP de l'utilisateur
let userIP = null;

// Fonction pour récupérer l'IP de l'utilisateur
async function getUserIP() {
    if (userIP) return userIP;
    
    try {
        // Essayer plusieurs services pour récupérer l'IP
        const services = [
            'https://api.ipify.org?format=json',
            'https://api64.ipify.org?format=json',
            'https://ipapi.co/json/'
        ];
        
        for (const service of services) {
            try {
                const response = await fetch(service);
                const data = await response.json();
                userIP = data.ip || data.query || null;
                if (userIP) {
                    console.log('IP détectée:', userIP);
                    return userIP;
                }
            } catch (e) {
                continue;
            }
        }
        
        // Fallback : essayer avec une autre méthode
        return null;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'IP:', error);
        return null;
    }
}

// Fonction pour vérifier si l'utilisateur est admin
async function isAdmin() {
    const ip = await getUserIP();
    if (!ip) {
        console.warn('Impossible de récupérer l\'IP, accès admin refusé');
        return false;
    }
    
    // Nettoyer l'IP (enlever les espaces, etc.)
    const cleanIP = ip.trim();
    
    // Vérifier si l'IP est dans la liste des admins
    const isAdminIP = ADMIN_IPS.some(adminIP => adminIP.trim() === cleanIP);
    
    if (isAdminIP) {
        console.log('✅ Accès admin autorisé pour IP:', cleanIP);
    } else {
        console.log('❌ Accès admin refusé pour IP:', cleanIP);
        console.log('IPs admin configurées:', ADMIN_IPS);
        console.log('Comparaison:', {
            'Votre IP': cleanIP,
            'Type': typeof cleanIP,
            'IPs dans ADMIN_IPS': ADMIN_IPS.map(ip => ({ ip: ip.trim(), type: typeof ip, match: ip.trim() === cleanIP }))
        });
    }
    
    return isAdminIP;
}

// Fonction pour supprimer un compte utilisateur (local)
function deleteUser(username) {
    if (!confirm(`⚠️ Êtes-vous sûr de vouloir supprimer le compte "${username}" ?\n\nCette action est irréversible !`)) {
        return;
    }
    
    const users = getAllUsers();
    
    if (!users[username]) {
        alert('❌ Utilisateur introuvable localement !');
        return;
    }
    
    // Supprimer l'utilisateur
    delete users[username];
    saveAllUsers(users);
    
    // Si c'est l'utilisateur actuel, le déconnecter
    if (currentUser === username) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('username');
        currentUser = null;
        alert('✅ Compte supprimé. Redirection...');
        location.reload();
    } else {
        alert(`✅ Compte "${username}" supprimé avec succès !`);
        // Rafraîchir l'affichage si on est dans le sélecteur
        const overlay = document.getElementById('userOverlay');
        if (overlay) {
            showUserSelector();
        }
    }
}

// Fonction pour supprimer un utilisateur depuis Firebase
async function deleteUserFromFirebase(username) {
    if (!confirm(`⚠️ Êtes-vous sûr de vouloir supprimer le compte "${username}" depuis Firebase ?\n\nCette action est irréversible !`)) {
        return;
    }
    
    if (!window.firebaseDb) {
        alert('❌ Firebase n\'est pas disponible !');
        return;
    }
    
    try {
        const userRef = window.firebaseDoc(window.firebaseDb, 'users', username);
        await window.firebaseDeleteDoc(userRef);
        alert(`✅ Compte "${username}" supprimé de Firebase avec succès !`);
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression Firebase:', error);
        alert(`❌ Erreur lors de la suppression: ${error.message}`);
        return false;
    }
}

// Fonction pour supprimer un utilisateur (local + Firebase)
async function deleteUserCompletely(username) {
    if (!confirm(`⚠️ Êtes-vous sûr de vouloir supprimer COMPLÈTEMENT le compte "${username}" ?\n\nCette action supprimera le compte localement ET sur Firebase.\n\nCette action est irréversible !`)) {
        return;
    }
    
    // Supprimer localement
    const users = getAllUsers();
    if (users[username]) {
        delete users[username];
        saveAllUsers(users);
    }
    
    // Supprimer de Firebase
    if (window.firebaseDb) {
        await deleteUserFromFirebase(username);
    }
    
    // Si c'est l'utilisateur actuel, le déconnecter
    if (currentUser === username) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('username');
        currentUser = null;
        alert('✅ Compte supprimé complètement. Redirection...');
        location.reload();
    } else {
        alert(`✅ Compte "${username}" supprimé complètement !`);
    }
}

function getCurrentUserData(key, defaultValue = null) {
    if (!currentUser) return defaultValue;
    const users = getAllUsers();
    const userData = users[currentUser] || {};
    return userData[key] !== undefined ? userData[key] : defaultValue;
}

function setCurrentUserData(key, value) {
    if (!currentUser) return;
    const users = getAllUsers();
    if (!users[currentUser]) {
        users[currentUser] = {};
    }
    users[currentUser][key] = value;
    saveAllUsers(users);
}

// Configurations par religion
const religionConfigs = {
    islam: {
        name: 'Islam',
        icon: '☪️',
        habits: [
            'sommeil', 'sport', 'proteines',
            'douche-matin', 'douche-soir', 
            'brossage-matin', 'brossage-soir',
            'ongles', 'rasage',
            'fajr', 'dhuhr', 'asr', 'maghrib', 'isha',
            'chambre', 'peches'
        ],
        habitLabels: {
            'fajr': 'Fajr (Aube)',
            'dhuhr': 'Dhuhr (Midi)',
            'asr': 'Asr (Après-midi)',
            'maghrib': 'Maghrib (Coucher du soleil)',
            'isha': 'Isha (Nuit)',
            'peches': 'Aucun acte en rapport avec les 7 péchés capitaux'
        },
        categoryIcons: {
            spiritual: '🕌'
        },
        categoryNames: {
            spiritual: 'Prières',
            ethics: 'Spiritualité'
        }
    },
    christianity: {
        name: 'Christianisme',
        icon: '✝️',
        habits: [
            'sommeil', 'sport', 'proteines',
            'douche-matin', 'douche-soir', 
            'brossage-matin', 'brossage-soir',
            'ongles', 'rasage',
            'priere-matin', 'priere-midi', 'priere-soir', 'priere-repas', 'priere-nuit',
            'chambre', 'commandements'
        ],
        habitLabels: {
            'priere-matin': 'Prière du matin',
            'priere-midi': 'Prière de midi',
            'priere-soir': 'Prière du soir',
            'priere-repas': 'Prière avant repas',
            'priere-nuit': 'Prière avant de dormir',
            'commandements': 'Respecter les enseignements du Christ'
        },
        categoryIcons: {
            spiritual: '⛪'
        },
        categoryNames: {
            spiritual: 'Prières',
            ethics: 'Spiritualité'
        }
    },
    neutral: {
        name: 'Neutre',
        icon: '🌟',
        habits: [
            'sommeil', 'sport', 'proteines',
            'douche-matin', 'douche-soir', 
            'brossage-matin', 'brossage-soir',
            'ongles', 'rasage',
            'meditation-matin', 'meditation-midi', 'meditation-soir', 'gratitude', 'journal',
            'chambre', 'ethique'
        ],
        habitLabels: {
            'meditation-matin': 'Méditation/réflexion du matin',
            'meditation-midi': 'Pause méditative à midi',
            'meditation-soir': 'Méditation du soir',
            'gratitude': 'Moment de gratitude',
            'journal': 'Journal personnel',
            'ethique': 'Agir selon mes valeurs éthiques'
        },
        categoryIcons: {
            spiritual: '🧘'
        },
        categoryNames: {
            spiritual: 'Bien-être Mental',
            ethics: 'Développement Personnel'
        }
    }
};

let currentConfig = null;
let habits = [];

const baseStatMapping = {
    'sport': 'str',
    'proteines': 'str',
    'chambre': 'dis',
    'sommeil': 'hp',
    'douche-matin': 'hp',
    'douche-soir': 'hp',
    'brossage-matin': 'end',
    'brossage-soir': 'end',
    'ongles': 'men',
    'rasage': 'men'
};

const spiritualStatMapping = {
    // Islam
    'fajr': 'spi', 'dhuhr': 'spi', 'asr': 'spi', 'maghrib': 'spi', 'isha': 'spi',
    'peches': 'spi',
    // Christianity
    'priere-matin': 'spi', 'priere-midi': 'spi', 'priere-soir': 'spi', 
    'priere-repas': 'spi', 'priere-nuit': 'spi',
    'commandements': 'spi',
    // Neutral
    'meditation-matin': 'men', 'meditation-midi': 'men', 'meditation-soir': 'men',
    'gratitude': 'spi', 'journal': 'men',
    'ethique': 'spi'
};

const statMapping = { ...baseStatMapping, ...spiritualStatMapping };

const rankSystem = [
    { name: 'F', days: 14, color: '#8B4513' },
    { name: 'E', days: 14, color: '#CD853F' },
    { name: 'D', days: 14, color: '#DAA520' },
    { name: 'C', days: 14, color: '#FFD700' },
    { name: 'B', days: 14, color: '#32CD32' },
    { name: 'A', days: 14, color: '#00CED1' },
    { name: 'S', days: 14, color: '#1E90FF' },
    { name: 'SS', days: 14, color: '#4169E1' },
    { name: 'SSS', days: 14, color: '#8A2BE2' },
    { name: 'SR', days: 14, color: '#9370DB' },
    { name: 'SR+', days: 14, color: '#BA55D3' },
    { name: 'SSR', days: 14, color: '#FF1493' },
    { name: 'SSR+', days: 14, color: '#FF69B4' },
    { name: 'UR', days: 14, color: '#FF4500' },
    { name: 'UR+', days: 14, color: '#FF6347' },
    { name: 'LR', days: 14, color: '#FFD700' },
    { name: 'LR+', days: 14, color: '#FFA500' },
    { name: 'MR', days: 14, color: '#DC143C' },
    { name: 'MR+', days: 14, color: '#B22222' },
    { name: 'X', days: 14, color: '#8B0000' },
    { name: 'XX', days: 21, color: '#800080' },
    { name: 'XXX', days: 21, color: '#4B0082' },
    { name: 'EX', days: 21, color: '#00FFFF' },
    { name: 'DX', days: 21, color: '#00CED1' },
    { name: 'INHUMAIN', days: 21, color: '#FF00FF' },
    { name: 'DIVIN', days: 21, color: '#FFD700' },
    { name: 'INCONNU', days: 21, color: '#000000' }
];

let soundEnabled = true;

// Traînée de curseur (effet premium) - déclaré tôt pour éviter les erreurs d'initialisation
let cursorTrailEnabled = false;
let lastCursorTime = 0;

/* ========================================
   FONCTIONS UTILITAIRES
======================================== */

/* ========================================
   SYSTÈME D'AUTHENTIFICATION
======================================== */

// Variables pour le système de login
let selectedReligion = null;

// Afficher l'interface de login
function showLoginScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'loginOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    overlay.innerHTML = `
        <div style="
            max-width: 500px;
            width: 90%;
            padding: 40px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #00d9ff;
            border-radius: 20px;
            box-shadow: 0 0 50px rgba(0, 217, 255, 0.5);
        ">
            <h1 style="
                font-size: 2.5em;
                color: #00d9ff;
                margin-bottom: 30px;
                text-align: center;
                text-shadow: 0 0 20px rgba(0, 217, 255, 0.8);
            ">⚔️ CONNEXION ⚔️</h1>
            
            <div id="loginForm" style="display: block;">
                <input type="email" id="loginEmail" placeholder="Email" style="
                    width: 100%;
                    padding: 15px;
                    font-size: 1.1em;
                    background: rgba(0, 0, 0, 0.5);
                    border: 2px solid #00d9ff;
                    color: white;
                    border-radius: 10px;
                    margin-bottom: 15px;
                    box-sizing: border-box;
                ">
                <input type="password" id="loginPassword" placeholder="Mot de passe" style="
                    width: 100%;
                    padding: 15px;
                    font-size: 1.1em;
                    background: rgba(0, 0, 0, 0.5);
                    border: 2px solid #00d9ff;
                    color: white;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    box-sizing: border-box;
                ">
                <button onclick="handleLogin()" style="
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(135deg, #00d9ff, #0088cc);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 1.2em;
                    font-weight: bold;
                    cursor: pointer;
                    margin-bottom: 15px;
                ">🔐 SE CONNECTER</button>
                <button onclick="showRegisterForm()" style="
                    width: 100%;
                    padding: 15px;
                    background: transparent;
                    border: 2px solid #00d9ff;
                    border-radius: 10px;
                    color: #00d9ff;
                    font-size: 1em;
                    cursor: pointer;
                ">📝 Créer un compte</button>
                <div id="loginError" style="
                    margin-top: 15px;
                    padding: 10px;
                    background: rgba(255, 0, 0, 0.1);
                    border: 1px solid #ff4444;
                    border-radius: 8px;
                    color: #ff4444;
                    display: none;
                    text-align: center;
                "></div>
            </div>
            
            <div id="registerForm" style="display: none;">
                <input type="text" id="registerUsername" placeholder="Pseudo (minimum 3 caractères)" style="
                    width: 100%;
                    padding: 15px;
                    font-size: 1.1em;
                    background: rgba(0, 0, 0, 0.5);
                    border: 2px solid #00d9ff;
                    color: white;
                    border-radius: 10px;
                    margin-bottom: 15px;
                    box-sizing: border-box;
                ">
                <input type="email" id="registerEmail" placeholder="Email" style="
                    width: 100%;
                    padding: 15px;
                    font-size: 1.1em;
                    background: rgba(0, 0, 0, 0.5);
                    border: 2px solid #00d9ff;
                    color: white;
                    border-radius: 10px;
                    margin-bottom: 15px;
                    box-sizing: border-box;
                ">
                <input type="password" id="registerPassword" placeholder="Mot de passe (minimum 6 caractères)" style="
                    width: 100%;
                    padding: 15px;
                    font-size: 1.1em;
                    background: rgba(0, 0, 0, 0.5);
                    border: 2px solid #00d9ff;
                    color: white;
                    border-radius: 10px;
                    margin-bottom: 15px;
                    box-sizing: border-box;
                ">
                <p style="
                    font-size: 1em;
                    color: #aaa;
                    margin-bottom: 20px;
                    text-align: center;
                ">Choisis ta voie spirituelle</p>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 20px;
                ">
                    <button onclick="selectRegisterReligion('islam')" id="religion-islam" style="
                        padding: 15px;
                        background: rgba(0, 204, 102, 0.2);
                        border: 2px solid #00cc66;
                        border-radius: 10px;
                        color: white;
                        font-size: 1.2em;
                        cursor: pointer;
                    ">☪️</button>
                    <button onclick="selectRegisterReligion('christianity')" id="religion-christianity" style="
                        padding: 15px;
                        background: rgba(102, 126, 234, 0.2);
                        border: 2px solid #667eea;
                        border-radius: 10px;
                        color: white;
                        font-size: 1.2em;
                        cursor: pointer;
                    ">✝️</button>
                    <button onclick="selectRegisterReligion('neutral')" id="religion-neutral" style="
                        padding: 15px;
                        background: rgba(255, 165, 0, 0.2);
                        border: 2px solid #ffa500;
                        border-radius: 10px;
                        color: white;
                        font-size: 1.2em;
                        cursor: pointer;
                    ">🌟</button>
                </div>
                <button onclick="handleRegister()" style="
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(135deg, #00d9ff, #0088cc);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 1.2em;
                    font-weight: bold;
                    cursor: pointer;
                    margin-bottom: 15px;
                ">✨ CRÉER LE COMPTE</button>
                <button onclick="showLoginForm()" style="
                    width: 100%;
                    padding: 15px;
                    background: transparent;
                    border: 2px solid #00d9ff;
                    border-radius: 10px;
                    color: #00d9ff;
                    font-size: 1em;
                    cursor: pointer;
                ">← Retour à la connexion</button>
                <div id="registerError" style="
                    margin-top: 15px;
                    padding: 10px;
                    background: rgba(255, 0, 0, 0.1);
                    border: 1px solid #ff4444;
                    border-radius: 8px;
                    color: #ff4444;
                    display: none;
                    text-align: center;
                "></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    selectedReligion = null;
    // Réinitialiser les sélections de religion
    ['islam', 'christianity', 'neutral'].forEach(rel => {
        const btn = document.getElementById(`religion-${rel}`);
        if (btn) {
            btn.style.background = `rgba(${rel === 'islam' ? '0, 204, 102' : rel === 'christianity' ? '102, 126, 234' : '255, 165, 0'}, 0.2)`;
            btn.style.border = `2px solid ${rel === 'islam' ? '#00cc66' : rel === 'christianity' ? '#667eea' : '#ffa500'}`;
        }
    });
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function selectRegisterReligion(religion) {
    selectedReligion = religion;
    ['islam', 'christianity', 'neutral'].forEach(rel => {
        const btn = document.getElementById(`religion-${rel}`);
        if (btn) {
            if (rel === religion) {
                btn.style.background = rel === 'islam' ? '#00cc66' : rel === 'christianity' ? '#667eea' : '#ffa500';
                btn.style.border = `2px solid ${rel === 'islam' ? '#00ff88' : rel === 'christianity' ? '#8b9aff' : '#ffcc00'}`;
            } else {
                btn.style.background = `rgba(${rel === 'islam' ? '0, 204, 102' : rel === 'christianity' ? '102, 126, 234' : '255, 165, 0'}, 0.2)`;
                btn.style.border = `2px solid ${rel === 'islam' ? '#00cc66' : rel === 'christianity' ? '#667eea' : '#ffa500'}`;
            }
        }
    });
}

// Gérer la connexion
async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (!email || !password) {
        errorDiv.textContent = '⚠️ Veuillez remplir tous les champs';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Vérifier si Firebase Auth est disponible
    if (!window.firebaseAuth || !window.firebaseSignIn) {
        errorDiv.textContent = '⚠️ Firebase Authentication n\'est pas configuré. Utilisez le système local.';
        errorDiv.style.display = 'block';
        // Fallback vers le système local
        handleLocalLogin(email, password);
        return;
    }
    
    try {
        const userCredential = await window.firebaseSignIn(window.firebaseAuth, email, password);
        console.log('✅ Connexion réussie:', userCredential.user.email);
        // L'authentification déclenchera onAuthStateChanged qui chargera l'app
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        let errorMessage = 'Erreur de connexion';
        
        // Si c'est une erreur de configuration, utiliser le système local
        if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
            errorDiv.textContent = '⚠️ Firebase Auth non configuré. Utilisation du système local...';
            errorDiv.style.display = 'block';
            handleLocalLogin(email, password);
            return;
        }
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = '❌ Aucun compte trouvé avec cet email';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = '❌ Mot de passe incorrect';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = '❌ Email invalide';
        } else {
            errorMessage = `❌ ${error.message}`;
        }
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
    }
}

// Système de login local (fallback) - utilise Firebase Firestore pour synchronisation
async function handleLocalLogin(email, password) {
    const errorDiv = document.getElementById('loginError');
    const normalizedEmail = email.toLowerCase().trim();
    
    // D'abord, chercher sur Firebase Firestore (même sans Auth)
    if (window.firebaseDb) {
        try {
            // Chercher un utilisateur avec cet email dans Firestore
            const usersCollection = window.firebaseCollection(window.firebaseDb, 'users');
            const snapshot = await window.firebaseGetDocs(usersCollection);
            
            let foundUser = null;
            snapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData.email && userData.email.toLowerCase() === normalizedEmail) {
                    foundUser = { ...userData, uid: doc.id };
                }
            });
            
            if (foundUser) {
                // Vérifier le mot de passe (encodé en base64)
                const storedPassword = foundUser.password || '';
                if (storedPassword && btoa(password) === storedPassword) {
                    // Connexion réussie
                    currentUser = foundUser.username;
                    localStorage.setItem('currentUser', foundUser.username);
                    localStorage.setItem('username', foundUser.username);
                    localStorage.setItem('selectedReligion', foundUser.religion);
                    localStorage.setItem('firebaseUID', foundUser.uid);
                    
                    const loginOverlay = document.getElementById('loginOverlay');
                    if (loginOverlay) {
                        loginOverlay.remove();
                    }
                    
                    currentConfig = religionConfigs[foundUser.religion];
                    habits = currentConfig.habits;
                    
                    // Restaurer les données depuis Firebase
                    await restoreUserDataFromFirebase(foundUser.uid);
                    
                    initApp();
                    return;
                } else {
                    errorDiv.textContent = '❌ Mot de passe incorrect';
                    errorDiv.style.display = 'block';
                    return;
                }
            }
        } catch (error) {
            console.error('Erreur lors de la recherche Firebase:', error);
        }
    }
    
    // Fallback : chercher dans le système local
    const users = getAllUsers();
    let userData = null;
    let foundUsername = null;
    
    // Chercher par email dans les comptes locaux
    for (const [username, data] of Object.entries(users)) {
        if (data.email && data.email.toLowerCase() === normalizedEmail) {
            userData = data;
            foundUsername = username;
            break;
        }
    }
    
    if (!userData || !foundUsername) {
        errorDiv.textContent = '❌ Aucun compte trouvé avec cet email. Créez un compte d\'abord.';
        errorDiv.style.display = 'block';
        showRegisterForm();
        return;
    }
    
    // Vérifier le mot de passe
    const storedPassword = userData.password || '';
    if (storedPassword && btoa(password) !== storedPassword) {
        errorDiv.textContent = '❌ Mot de passe incorrect';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Connexion réussie avec le système local
    currentUser = foundUsername;
    localStorage.setItem('currentUser', foundUsername);
    localStorage.setItem('username', foundUsername);
    localStorage.setItem('selectedReligion', userData.religion);
    
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
        loginOverlay.remove();
    }
    
    currentConfig = religionConfigs[userData.religion];
    habits = currentConfig.habits;
    
    initApp();
}

// Gérer l'inscription
async function handleRegister() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const errorDiv = document.getElementById('registerError');
    
    // Validation
    if (!username || !email || !password) {
        errorDiv.textContent = '⚠️ Veuillez remplir tous les champs';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (username.length < 3) {
        errorDiv.textContent = '⚠️ Le pseudo doit faire au moins 3 caractères';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = '⚠️ Le mot de passe doit faire au moins 6 caractères';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!selectedReligion) {
        errorDiv.textContent = '⚠️ Veuillez choisir une voie spirituelle';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Vérifier si Firebase Auth est disponible
    if (!window.firebaseAuth || !window.firebaseCreateUser) {
        // Utiliser le système local
        handleLocalRegister(username, email, password);
        return;
    }
    
    try {
        // Créer le compte Firebase Auth
        const userCredential = await window.firebaseCreateUser(window.firebaseAuth, email, password);
        const user = userCredential.user;
        
        // Sauvegarder les infos utilisateur dans Firestore
        const userRef = window.firebaseDoc(window.firebaseDb, 'users', user.uid);
        await window.firebaseSetDoc(userRef, {
            username: username,
            email: email,
            religion: selectedReligion,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
        }, { merge: true });
        
        // Sauvegarder aussi dans localStorage pour compatibilité
        localStorage.setItem('currentUser', username);
        localStorage.setItem('username', username);
        localStorage.setItem('selectedReligion', selectedReligion);
        localStorage.setItem('firebaseUID', user.uid);
        
        console.log('✅ Compte créé avec succès!');
        // L'authentification déclenchera onAuthStateChanged qui chargera l'app
    } catch (error) {
        console.error('❌ Erreur d\'inscription:', error);
        
        // Si c'est une erreur de configuration, utiliser le système local
        if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
            errorDiv.textContent = '⚠️ Firebase Auth non configuré. Utilisation du système local...';
            errorDiv.style.display = 'block';
            handleLocalRegister(username, email, password);
            return;
        }
        
        let errorMessage = 'Erreur lors de la création du compte';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = '❌ Cet email est déjà utilisé';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = '❌ Email invalide';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = '❌ Mot de passe trop faible';
        } else {
            errorMessage = `❌ ${error.message}`;
        }
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
    }
}

// Système d'inscription local (fallback) - sauvegarde sur Firebase Firestore pour synchronisation
async function handleLocalRegister(username, email, password) {
    const errorDiv = document.getElementById('registerError');
    const normalizedEmail = email.toLowerCase().trim();
    
    // Vérifier d'abord sur Firebase si l'email existe déjà
    if (window.firebaseDb) {
        try {
            const usersCollection = window.firebaseCollection(window.firebaseDb, 'users');
            const snapshot = await window.firebaseGetDocs(usersCollection);
            
            snapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData.email && userData.email.toLowerCase() === normalizedEmail) {
                    errorDiv.textContent = '❌ Cet email est déjà utilisé !';
                    errorDiv.style.display = 'block';
                    throw new Error('Email déjà utilisé');
                }
                if (userData.username === username) {
                    errorDiv.textContent = '❌ Ce pseudo est déjà utilisé !';
                    errorDiv.style.display = 'block';
                    throw new Error('Pseudo déjà utilisé');
                }
            });
        } catch (error) {
            if (error.message.includes('déjà utilisé')) {
                return; // L'erreur est déjà affichée
            }
            console.error('Erreur lors de la vérification Firebase:', error);
        }
    }
    
    // Vérifier dans le système local
    const users = getAllUsers();
    
    // Vérifier si le pseudo existe déjà
    if (users[username]) {
        errorDiv.textContent = '❌ Ce pseudo existe déjà !';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Vérifier si l'email existe déjà
    for (const [existingUsername, data] of Object.entries(users)) {
        if (data.email && data.email.toLowerCase() === normalizedEmail) {
            errorDiv.textContent = '❌ Cet email est déjà utilisé !';
            errorDiv.style.display = 'block';
            return;
        }
    }
    
    // Créer un ID unique basé sur l'email (hash simple)
    const userId = btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    
    // Créer le compte local
    users[username] = {
        religion: selectedReligion,
        email: normalizedEmail,
        password: btoa(password), // Encodage basique (pas sécurisé mais fonctionnel)
        userId: userId,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
    };
    saveAllUsers(users);
    
    // Sauvegarder aussi sur Firebase Firestore pour synchronisation entre appareils
    if (window.firebaseDb) {
        try {
            const userRef = window.firebaseDoc(window.firebaseDb, 'users', userId);
            await window.firebaseSetDoc(userRef, {
                username: username,
                email: normalizedEmail,
                religion: selectedReligion,
                password: btoa(password), // Stocké pour le système local
                userId: userId,
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            }, { merge: true });
            console.log('✅ Compte sauvegardé sur Firebase pour synchronisation');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde Firebase:', error);
            // Continuer quand même avec le système local
        }
    }
    
    // Connecter l'utilisateur
    currentUser = username;
    localStorage.setItem('currentUser', username);
    localStorage.setItem('username', username);
    localStorage.setItem('selectedReligion', selectedReligion);
    localStorage.setItem('firebaseUID', userId);
    
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
        loginOverlay.remove();
    }
    
    currentConfig = religionConfigs[selectedReligion];
    habits = currentConfig.habits;
    
    initApp();
}

// Gérer la déconnexion
async function handleLogout() {
    try {
        // Déconnexion Firebase si disponible
        if (window.firebaseAuth && window.firebaseSignOut) {
            await window.firebaseSignOut(window.firebaseAuth);
        }
    } catch (error) {
        console.error('Erreur de déconnexion Firebase:', error);
    }
    
    // Déconnexion locale
    localStorage.clear();
    currentUser = null;
    location.reload();
}

function showReligionSelector() {
    // Rediriger vers le login
    showLoginScreen();
}

function createUser(religion) {
    // Essayer plusieurs fois de récupérer l'input (problème mobile)
    let usernameInput = document.getElementById('usernameInput');
    
    if (!usernameInput) {
        console.error('Input not found!');
        alert('⚠️ Erreur : champ de texte introuvable. Recharge la page.');
        return;
    }
    
    // Forcer le focus puis récupérer la valeur
    usernameInput.focus();
    let username = usernameInput.value.trim();
    
    console.log('createUser called with religion:', religion);
    console.log('Username input element:', usernameInput);
    console.log('Username input value:', username);
    console.log('Input element HTML:', usernameInput.outerHTML);
    
    // Si l'input est vide, utiliser un prompt comme fallback
    if (!username || username === '') {
        username = prompt('⚡ Entre ton pseudo (minimum 3 caractères) :');
        if (!username) {
            return;
        }
        username = username.trim();
    }
    
    if (!username || username === '') {
        alert('⚠️ Entre un pseudo !');
        return;
    }
    
    if (username.length < 3) {
        alert('⚠️ Le pseudo doit faire au moins 3 caractères !');
        return;
    }
    
    const users = getAllUsers();
    if (users[username]) {
        alert('⚠️ Ce pseudo existe déjà ! Choisis-en un autre.');
        return;
    }
    
    // Créer le nouvel utilisateur
    users[username] = {
        religion: religion,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
    };
    saveAllUsers(users);
    
    console.log('User created:', username);
    console.log('All users:', users);
    
    // Définir comme utilisateur actuel - SAUVEGARDER PARTOUT
    localStorage.setItem('currentUser', username);
    localStorage.setItem('username', username);
    localStorage.setItem('selectedReligion', religion);
    originalSetItem('currentUser', username);
    currentUser = username;
    
    console.log('Current user set to:', currentUser);
    console.log('localStorage check:', {
        currentUser: localStorage.getItem('currentUser'),
        username: localStorage.getItem('username'),
        selectedReligion: localStorage.getItem('selectedReligion')
    });
    
    selectReligion(religion);
}

async function showUserSelector() {
    const users = getAllUsers();
    const userList = Object.keys(users);
    
    if (userList.length === 0) {
        showReligionSelector();
        return;
    }
    
    // S'assurer que l'IP est chargée
    if (!userIP) {
        await getUserIP();
    }
    
    // Vérifier si l'utilisateur est admin
    const adminMode = await isAdmin();
    
    console.log('🔍 Debug showUserSelector:');
    console.log('  - userIP:', userIP);
    console.log('  - ADMIN_IPS:', ADMIN_IPS);
    console.log('  - adminMode:', adminMode);
    
    const overlay = document.createElement('div');
    overlay.id = 'userOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
        overflow-y: auto;
    `;
    
    let usersHTML = '';
    userList.forEach(username => {
        const userData = users[username];
        const config = religionConfigs[userData.religion];
        const isCurrentUser = username === currentUser;
        
        // Construire le HTML du bouton de suppression séparément
        const deleteButtonHTML = adminMode ? `
            <button onclick="deleteUser('${username}')" style="
                padding: 20px 15px;
                background: linear-gradient(135deg, #ff4444, #cc0000);
                border: 2px solid #ff4444;
                border-radius: 15px;
                color: white;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 1.5em;
                min-width: 60px;
            " title="Supprimer ce compte" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                🗑️
            </button>
        ` : '';
        
        usersHTML += `
            <div style="
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;
                margin-bottom: 15px;
            ">
                <button onclick="selectUser('${username}')" style="
                    flex: 1;
                    padding: 20px;
                    background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(0, 150, 200, 0.1));
                    border: 2px solid #00d9ff;
                    border-radius: 15px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-align: left;
                ">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="font-size: 2em;">${config.icon}</div>
                        <div style="flex: 1;">
                            <div style="font-size: 1.3em; font-weight: bold;">${username}${isCurrentUser ? ' (Actuel)' : ''}</div>
                            <div style="font-size: 0.9em; color: #aaa;">${config.name}</div>
                        </div>
                    </div>
                </button>
                ${deleteButtonHTML}
            </div>
        `;
    });
    
    overlay.innerHTML = `
        <div style="
            max-width: 600px;
            padding: 40px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #00d9ff;
            border-radius: 20px;
            box-shadow: 0 0 50px rgba(0, 217, 255, 0.5);
        ">
            <h1 style="
                font-size: 2.5em;
                color: #00d9ff;
                margin-bottom: 30px;
                text-align: center;
                text-shadow: 0 0 20px rgba(0, 217, 255, 0.8);
            ">👥 SÉLECTIONNE TON PROFIL</h1>
            ${adminMode ? `
                <div style="
                    padding: 15px;
                    background: rgba(255, 215, 0, 0.1);
                    border: 2px solid #ffd700;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    text-align: center;
                    color: #ffd700;
                    font-weight: bold;
                ">
                    🔑 MODE ADMIN ACTIVÉ
                    <div style="font-size: 0.8em; color: #aaa; margin-top: 5px;">IP: ${userIP || 'Non détectée'}</div>
                </div>
            ` : ''}
            
            <div style="margin-bottom: 20px;">
                ${usersHTML}
            </div>
            
            <button onclick="showReligionSelector(); document.getElementById('userOverlay').remove();" style="
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #ff6b6b, #ff4444);
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
            ">
                ➕ CRÉER UN NOUVEAU PROFIL
            </button>
            
            <button onclick="showLeaderboard()" style="
                width: 100%;
                margin-top: 15px;
                padding: 15px;
                background: linear-gradient(135deg, #ffd700, #ffaa00);
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
            ">
                🏆 VOIR LE CLASSEMENT
            </button>
            
            ${adminMode ? `
                <button onclick="showAdminPanel()" style="
                    width: 100%;
                    margin-top: 15px;
                    padding: 15px;
                    background: linear-gradient(135deg, #9b59b6, #8e44ad);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 1.1em;
                    font-weight: bold;
                    cursor: pointer;
                ">
                    ⚙️ PANEL ADMIN
                </button>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function selectUser(username) {
    currentUser = username;
    originalSetItem('currentUser', username);
    
    const users = getAllUsers();
    const userData = users[username];
    
    // Mettre à jour la dernière activité
    userData.lastActive = new Date().toISOString();
    users[username] = userData;
    saveAllUsers(users);
    
    const overlay = document.getElementById('userOverlay');
    if (overlay) {
        overlay.remove();
    }
    
    loadReligionConfig();
    initializeApp();
}

function selectReligion(religion) {
    // Sauvegarder la religion dans localStorage classique pour compatibilité
    localStorage.setItem('selectedReligion', religion);
    
    // Sauvegarder aussi dans les données utilisateur
    if (currentUser) {
        const users = getAllUsers();
        if (users[currentUser]) {
            users[currentUser].religion = religion;
            saveAllUsers(users);
        }
    }
    
    // Sauvegarder username dans localStorage aussi
    if (currentUser) {
        localStorage.setItem('username', currentUser);
    }
    
    currentConfig = religionConfigs[religion];
    habits = currentConfig.habits;
    
    const overlay = document.getElementById('religionOverlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => overlay.remove(), 300);
    }
    
    initializeApp();
}

function updateHabitLabels() {
    if (!currentConfig) return;
    
    // Mettre à jour les labels des catégories spirituelles
    const spiritualCategory = document.querySelector('.category:has(#' + habits[10] + ')');
    if (spiritualCategory) {
        const h2 = spiritualCategory.querySelector('h2');
        if (h2) {
            const icon = h2.querySelector('.category-icon');
            if (icon) {
                icon.textContent = currentConfig.categoryIcons.spiritual;
            }
            h2.childNodes[1].textContent = ' ' + currentConfig.categoryNames.spiritual;
        }
    }
}

function loadReligionConfig() {
    // Charger l'utilisateur actuel
    currentUser = originalGetItem('currentUser');
    
    if (!currentUser) {
        showUserSelector();
        return false;
    }
    
    // Vérifier que l'utilisateur existe
    const users = getAllUsers();
    if (!users[currentUser]) {
        localStorage.removeItem('currentUser');
        showUserSelector();
        return false;
    }
    
    // Charger la religion de l'utilisateur
    const userData = users[currentUser];
    currentConfig = religionConfigs[userData.religion];
    habits = currentConfig.habits;
    return true;
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Fonction pour obtenir le jour de la semaine (0 = dimanche, 6 = samedi)
function getDayOfWeek() {
    return new Date().getDay();
}

// Fonction pour obtenir la quête d'exercice du jour (rotation pompes/abdos/squats)
function getExerciseQuestForToday() {
    const dayOfWeek = getDayOfWeek();
    
    // Samedi (6) = pas de quête
    if (dayOfWeek === 6) {
        return null;
    }
    
    // Rotation : pompes (0,3), abdos (1,4), squats (2,5)
    // Dimanche=0, Lundi=1, Mardi=2, Mercredi=3, Jeudi=4, Vendredi=5
    const exerciseRotation = dayOfWeek % 3;
    
    if (exerciseRotation === 0) {
        return 'quest-pushups'; // Dimanche, Mercredi
    } else if (exerciseRotation === 1) {
        return 'quest-abs'; // Lundi, Jeudi
    } else {
        return 'quest-squats'; // Mardi, Vendredi
    }
}

function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    document.getElementById('dateDisplay').textContent = today.toLocaleDateString('fr-FR', options);
}

function playSound(type) {
    if (!soundEnabled) return;
    const sounds = {
        'check': 1046.50,
        'levelUp': 1318.51,
        'click': 880.00
    };
    const freq = sounds[type] || 880;
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch(e) {}
}

/* ========================================
   SYSTÈME DE THÈME
======================================== */

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    originalSetItem('theme', newTheme);
    playSound('click');
}

function loadTheme() {
    const savedTheme = originalGetItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    originalSetItem('soundEnabled', soundEnabled);
    playSound('click');
}

/* ========================================
   GESTION DES HABITUDES
======================================== */

function toggleCheckbox(id) {
    const checkbox = document.getElementById(id);
    checkbox.checked = !checkbox.checked;
    
    // Effet de particules si la checkbox est cochée
    if (checkbox.checked) {
        checkbox.classList.add('completed');
        setTimeout(() => checkbox.classList.remove('completed'), 500);
        createCheckboxParticles(checkbox);
    }
    
    saveHabits();
    updateProgress();
    updateStatsDisplay();
    updateStreaks();
    playSound('check');
}

function saveHabits() {
    const today = getTodayDate();
    const history = JSON.parse(originalGetItem('habitHistory') || '{}');
    
    if (!history[today]) {
        history[today] = { habits: {}, date: today };
    }
    
    habits.forEach(habit => {
        const checkbox = document.getElementById(habit);
        history[today].habits[habit] = checkbox.checked;
    });
    
    originalSetItem('habitHistory', JSON.stringify(history));
    
    // Sauvegarder sur Firebase en arrière-plan (sans bloquer)
    if (currentUser && window.firebaseDb) {
        saveAllUserDataToFirebase().catch(err => console.error('Erreur sauvegarde Firebase:', err));
    }
}

function loadHabits() {
    const today = getTodayDate();
    const history = JSON.parse(originalGetItem('habitHistory') || '{}');
    
    if (history[today] && history[today].habits) {
        habits.forEach(habit => {
            const checkbox = document.getElementById(habit);
            checkbox.checked = history[today].habits[habit] || false;
        });
    }
}

function updateProgress() {
    let completed = 0;
    habits.forEach(habit => {
        if (document.getElementById(habit).checked) {
            completed++;
        }
    });
    
    const percentage = Math.round((completed / habits.length) * 100);
    
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('percentCount').textContent = percentage + '%';
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressFill').textContent = percentage + '%';
    
    // Mettre à jour le rang en temps réel selon la progression actuelle
    // Passer aussi le nombre d'habitudes complétées pour calculer la contribution
    updateRankProgressRealtime(completed, habits.length);
}

function addRankProgress(points) {
    const today = getTodayDate();
    const lastUpdate = originalGetItem('lastRankUpdate') || '';
    
    if (lastUpdate !== today) {
        let currentPoints = parseFloat(originalGetItem('rankProgressPoints') || '0');
        currentPoints += points;
        originalSetItem('rankProgressPoints', currentPoints.toString());
        originalSetItem('lastRankUpdate', today);
        updateRankSystem();
    }
}

// Nouvelle fonction pour mettre à jour le rang en temps réel
function updateRankProgressRealtime(completed, total) {
    const today = getTodayDate();
    const lastUpdate = originalGetItem('lastRankUpdate') || '';
    
    // Récupérer les points actuels
    let currentPoints = parseFloat(originalGetItem('rankProgressPoints') || '0');
    
    // Si c'est un nouveau jour, on commence avec les points de base
    if (lastUpdate !== today) {
        // Nouveau jour : les points actuels sont déjà corrects (sans contribution d'aujourd'hui)
        // On va juste ajouter la contribution actuelle
    } else {
        // Même jour : retirer la contribution précédente pour recalculer
        const previousContribution = parseFloat(originalGetItem('todayRankContribution') || '0');
        currentPoints -= previousContribution;
    }
    
    // Calculer la contribution actuelle proportionnellement
    // Chaque habitude complétée = 1/total de jour
    // Exemple : 7 habitudes complétées sur 14 = 7/14 = 0.5 jour
    // Toutes les habitudes complétées = 1 jour complet
    const todayContribution = completed / total;
    
    // Calculer les points totaux avec la contribution actuelle
    const totalPoints = currentPoints + todayContribution;
    
    // Sauvegarder la contribution d'aujourd'hui pour les prochains calculs
    originalSetItem('todayRankContribution', todayContribution.toString());
    originalSetItem('lastRankUpdate', today);
    
    // Sauvegarder les points pour l'affichage en temps réel
    // La progression est visible immédiatement et se met à jour à chaque habitude cochée
    originalSetItem('rankProgressPoints', totalPoints.toString());
    
    // Mettre à jour l'affichage du rang en temps réel
    updateRankSystem();
}

function resetAll() {
    if (confirm('Réinitialiser toutes les habitudes pour demain ?')) {
        habits.forEach(habit => {
            document.getElementById(habit).checked = false;
        });
        saveHabits();
        updateProgress();
        updateStatsDisplay();
        updateStreaks();
        playSound('click');
    }
}

/* ========================================
   SYSTÈME DE RANGS
======================================== */

function updateRankSystem() {
    setTimeout(() => updateMyRankOnFirebase(), 1000);
    const progressPoints = parseFloat(originalGetItem('rankProgressPoints') || '0');
    
    let remainingPoints = progressPoints;
    let currentIndex = 0;
    let pointsInCurrentRank = 0;
    
    for (let i = 0; i < rankSystem.length; i++) {
        if (remainingPoints >= rankSystem[i].days) {
            remainingPoints -= rankSystem[i].days;
            currentIndex++;
        } else {
            pointsInCurrentRank = remainingPoints;
            break;
        }
    }
    
    if (currentIndex >= rankSystem.length) {
        currentIndex = rankSystem.length - 1;
        pointsInCurrentRank = rankSystem[currentIndex].days;
    }
    
    const currentRank = rankSystem[currentIndex];
    const nextRank = currentIndex < rankSystem.length - 1 ? rankSystem[currentIndex + 1] : currentRank;
    
    const daysRequired = currentRank.days;
    const daysRemaining = daysRequired - pointsInCurrentRank;
    const percentage = Math.round((pointsInCurrentRank / daysRequired) * 100);
    
    document.getElementById('currentRank').textContent = currentRank.name;
    document.getElementById('nextRank').textContent = nextRank.name;
    document.getElementById('daysCompleted').textContent = pointsInCurrentRank.toFixed(1);
    document.getElementById('daysTotal').textContent = daysRequired;
    document.getElementById('daysRemaining').textContent = daysRemaining.toFixed(1);
    document.getElementById('rankPercentage').textContent = percentage + '%';
    
    const progressFill = document.getElementById('rankProgressFill');
    progressFill.style.width = percentage + '%';
    progressFill.textContent = percentage + '%';
    
    document.getElementById('totalProgressPoints').textContent = progressPoints.toFixed(1);
    
    // Créer des particules selon le rang
    createRankParticles(currentRank.name);
    
    // Activer la traînée de curseur pour les rangs élevés
    updateCursorTrailForRank(currentRank.name);
}

/* ========================================
   SYSTÈME DE STATS RPG
======================================== */

function calculateStats() {
    const history = JSON.parse(originalGetItem('habitHistory') || '{}');
    const dates = Object.keys(history).sort().slice(-30);
    
    const stats = { str: 0, dis: 0, spi: 0, hp: 0, end: 0, men: 0 };
    
    // Stats d'aujourd'hui EN TEMPS RÉEL
    habits.forEach(habit => {
        const checkbox = document.getElementById(habit);
        if (checkbox && checkbox.checked) {
            const statType = statMapping[habit];
            if (statType) {
                stats[statType] += 1;
            }
        }
    });
    
    // Stats de l'historique
    dates.forEach(date => {
        const dayData = history[date];
        if (dayData && dayData.habits) {
            Object.keys(dayData.habits).forEach(habit => {
                if (dayData.habits[habit] === true) {
                    const statType = statMapping[habit];
                    if (statType) {
                        stats[statType] += 1;
                    }
                }
            });
        }
    });
    
    return stats;
}

function getStatRank(value) {
    if (value >= 500) return { rank: 'SSS', class: 'rank-sss' };
    if (value >= 400) return { rank: 'SS', class: 'rank-ss' };
    if (value >= 300) return { rank: 'S', class: 'rank-s' };
    if (value >= 200) return { rank: 'A', class: 'rank-a' };
    if (value >= 150) return { rank: 'B', class: 'rank-b' };
    if (value >= 100) return { rank: 'C', class: 'rank-c' };
    if (value >= 50) return { rank: 'D', class: 'rank-d' };
    if (value >= 20) return { rank: 'E', class: 'rank-e' };
    return { rank: 'F', class: 'rank-f' };
}

function updateStatsDisplay() {
    const stats = calculateStats();
    
    const maxValues = { str: 100, dis: 150, spi: 200, hp: 100, end: 150, men: 100 };
    
    Object.keys(stats).forEach(stat => {
        const value = stats[stat];
        const percentage = Math.min((value / maxValues[stat]) * 100, 100);
        
        const rankData = getStatRank(value);
        
        const valueElement = document.getElementById(`${stat}Value`);
        if (valueElement) {
            valueElement.textContent = rankData.rank;
            valueElement.className = 'stat-value ' + rankData.class;
            valueElement.title = `${value} points`;
        }
        
        const barElement = document.getElementById(`${stat}Bar`);
        if (barElement) {
            barElement.style.width = percentage + '%';
        }
        
        // Créer des particules pour les stats élevées
        createStatParticles(stat, value, maxValues[stat]);
    });
    
    const powerLevel = Object.values(stats).reduce((sum, val) => sum + val, 0);
    const powerElement = document.getElementById('powerLevel');
    if (powerElement) {
        powerElement.textContent = powerLevel;
    }
    
    // Effet sur le power level
    updatePowerLevelEffect(powerLevel);
    
    // Dessiner le graphique radar
    drawRadarChart(stats, maxValues);
}

function drawRadarChart(stats, maxValues) {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const isMobile = window.innerWidth <= 768;
    
    // Taille responsive
    const size = isMobile ? Math.min(window.innerWidth - 80, 300) : 400;
    canvas.width = size;
    canvas.height = size;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - (isMobile ? 40 : 60);
    
    const statOrder = ['str', 'dis', 'spi', 'hp', 'end', 'men'];
    const labels = isMobile 
        ? ['STR', 'DIS', 'SPI', 'HP', 'END', 'MEN']
        : ['FORCE', 'DISCIPLINE', 'SPIRITUALITÉ', 'SANTÉ', 'ENDURANCE', 'MENTAL'];
    const colors = ['#ff6b6b', '#4ecdc4', '#ffd700', '#96fbc4', '#fa709a', '#667eea'];
    
    // Cercles de fond
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    statOrder.forEach((stat, index) => {
        const angle = (Math.PI * 2 * index) / statOrder.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Labels
        const labelDistance = isMobile ? 30 : 40;
        const labelX = centerX + Math.cos(angle) * (radius + labelDistance);
        const labelY = centerY + Math.sin(angle) * (radius + labelDistance);
        
        ctx.fillStyle = colors[index];
        ctx.font = isMobile ? 'bold 10px Arial' : 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[index], labelX, labelY);
    });
    
    // Polygone des stats
    ctx.beginPath();
    statOrder.forEach((stat, index) => {
        const value = stats[stat];
        const maxValue = maxValues[stat];
        const percentage = Math.min(value / maxValue, 1);
        
        const angle = (Math.PI * 2 * index) / statOrder.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius * percentage;
        const y = centerY + Math.sin(angle) * radius * percentage;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.closePath();
    
    // Remplissage
    ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.fill();
    
    // Contour
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = isMobile ? 2 : 3;
    ctx.stroke();
    
    // Points
    statOrder.forEach((stat, index) => {
        const value = stats[stat];
        const maxValue = maxValues[stat];
        const percentage = Math.min(value / maxValue, 1);
        
        const angle = (Math.PI * 2 * index) / statOrder.length - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius * percentage;
        const y = centerY + Math.sin(angle) * radius * percentage;
        
        ctx.beginPath();
        ctx.arc(x, y, isMobile ? 4 : 6, 0, Math.PI * 2);
        ctx.fillStyle = colors[index];
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

/* ========================================
   SYSTÈME DE STREAKS
======================================== */

function updateStreaks() {
    const today = getTodayDate();
    
    let completed = 0;
    habits.forEach(habit => {
        if (document.getElementById(habit).checked) {
            completed++;
        }
    });
    const todayPerfect = completed === habits.length;
    
    let currentStreak = parseInt(originalGetItem('currentStreak') || '0');
    let bestStreak = parseInt(originalGetItem('bestStreak') || '0');
    let lastStreakDate = originalGetItem('lastStreakDate') || '';
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastStreakDate !== today) {
        if (lastStreakDate === yesterdayStr) {
            if (todayPerfect) {
                currentStreak++;
                originalSetItem('lastStreakDate', today);
            }
        } else if (lastStreakDate !== today) {
            if (todayPerfect) {
                currentStreak = 1;
                originalSetItem('lastStreakDate', today);
            } else {
                currentStreak = 0;
            }
        }
        
        if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
            originalSetItem('bestStreak', bestStreak.toString());
        }
        
        originalSetItem('currentStreak', currentStreak.toString());
    } else if (todayPerfect && currentStreak === 0) {
        currentStreak = 1;
        originalSetItem('currentStreak', '1');
        originalSetItem('lastStreakDate', today);
        if (bestStreak === 0) {
            originalSetItem('bestStreak', '1');
            bestStreak = 1;
        }
    }
    
    document.getElementById('currentStreak').textContent = `${currentStreak} jour${currentStreak > 1 ? 's' : ''}`;
    document.getElementById('bestStreak').textContent = `${bestStreak} jour${bestStreak > 1 ? 's' : ''}`;
    
    const bonusContainer = document.getElementById('streakBonus');
    if (currentStreak >= 7) {
        bonusContainer.style.display = 'block';
        bonusContainer.textContent = `🔥 SÉRIE DE ${currentStreak} JOURS ! Continue ! 🔥`;
    } else {
        bonusContainer.style.display = 'none';
    }
}

/* ========================================
   SYSTÈME DE QUÊTES QUOTIDIENNES
======================================== */

/* ========================================
   SYSTÈME DE QUÊTES ÉPIQUES
======================================== */

// Quêtes quotidiennes classiques
const dailyQuests = [
    { id: 'quest-sport', name: '💪 Séance de sport intense', reward: 'str', bonus: '+0.5 jour de rang', points: 5 },
    { id: 'quest-prayers', name: '🕌 Toutes les 5 prières à l\'heure', reward: 'spi', bonus: '+0.5 jour de rang', points: 5 },
    { id: 'quest-pushups', name: '💪 50 pompes', reward: 'str', bonus: '+0.5 jour de rang', points: 5 },
    { id: 'quest-abs', name: '💪 50 abdos', reward: 'str', bonus: '+0.5 jour de rang', points: 5 },
    { id: 'quest-squats', name: '💪 50 squats', reward: 'str', bonus: '+0.5 jour de rang', points: 5 },
    { id: 'quest-hygiene', name: '🧼 Hygiène parfaite toute la journée', reward: 'hp', bonus: '+0.5 jour de rang', points: 5 },
    { id: 'quest-discipline', name: '🎯 Zéro distraction aujourd\'hui', reward: 'dis', bonus: '+0.5 jour de rang', points: 5 },
    { id: 'quest-cardio', name: '🏃 30min de cardio', reward: 'end', bonus: '+0.5 jour de rang', points: 5 },
    { id: 'quest-nutrition', name: '🍗 Nutrition parfaite', reward: 'str', bonus: '+0.5 jour de rang', points: 5 }
];

// QUÊTES ÉPIQUES - Objectifs à long terme
const epicQuests = [
    {
        id: 'epic-blackbelt',
        name: '🥋 CEINTURE NOIRE',
        description: 'Atteindre le niveau de ceinture noire en arts martiaux',
        category: 'martial-arts',
        icon: '🥋',
        targetDays: 365,
        rewards: {
            rankBonus: 30,
            stats: { str: 50, dis: 40, men: 30 }
        },
        milestones: [
            { days: 30, name: 'Ceinture Blanche', bonus: 2 },
            { days: 90, name: 'Ceinture Jaune', bonus: 5 },
            { days: 180, name: 'Ceinture Orange', bonus: 10 },
            { days: 270, name: 'Ceinture Verte', bonus: 15 },
            { days: 365, name: 'CEINTURE NOIRE 🥋', bonus: 30 }
        ]
    },
    {
        id: 'epic-wealth',
        name: '💰 FORTUNE',
        description: 'Gagner 10 000€ grâce à tes efforts',
        category: 'wealth',
        icon: '💰',
        targetAmount: 10000,
        currentAmount: 0,
        rewards: {
            rankBonus: 50,
            stats: { dis: 60, men: 50 }
        },
        milestones: [
            { amount: 1000, name: 'Premiers 1000€', bonus: 5 },
            { amount: 2500, name: '2500€ - En route', bonus: 10 },
            { amount: 5000, name: '5000€ - Mi-chemin', bonus: 20 },
            { amount: 7500, name: '7500€ - Presque là', bonus: 30 },
            { amount: 10000, name: '10 000€ ATTEINTS 💰', bonus: 50 }
        ]
    },
    {
        id: 'epic-marathon',
        name: '🏃 MARATHON',
        description: 'Courir un marathon complet (42.195 km)',
        category: 'endurance',
        icon: '🏃',
        targetKm: 42.195,
        currentKm: 0,
        rewards: {
            rankBonus: 25,
            stats: { end: 60, hp: 40, str: 30 }
        },
        milestones: [
            { km: 5, name: '5km - Démarrage', bonus: 2 },
            { km: 10, name: '10km - Bon rythme', bonus: 5 },
            { km: 21, name: '21km - Semi-marathon', bonus: 10 },
            { km: 35, name: '35km - Presque là', bonus: 15 },
            { km: 42.195, name: 'MARATHON TERMINÉ 🏃', bonus: 25 }
        ]
    },
    {
        id: 'epic-muscle',
        name: '💪 TRANSFORMATION',
        description: 'Prendre 10kg de muscle pur',
        category: 'bodybuilding',
        icon: '💪',
        targetKg: 10,
        currentKg: 0,
        rewards: {
            rankBonus: 35,
            stats: { str: 80, end: 40, hp: 30 }
        },
        milestones: [
            { kg: 2, name: '+2kg - Début', bonus: 3 },
            { kg: 5, name: '+5kg - Moitié', bonus: 10 },
            { kg: 8, name: '+8kg - Presque là', bonus: 20 },
            { kg: 10, name: '+10KG DE MUSCLE 💪', bonus: 35 }
        ]
    }
];

// SYSTÈME DE DÉFIS ENTRE AMIS
const challengeTypes = [
    {
        id: 'cardio-race',
        name: '🏃 Course de Cardio',
        description: 'Qui court le plus de km en 7 jours ?',
        duration: 7,
        metric: 'distance',
        unit: 'km',
        icon: '🏃'
    },
    {
        id: 'pushups-challenge',
        name: '💪 Défi Pompes',
        description: 'Qui fait le plus de pompes en 30 jours ?',
        duration: 30,
        metric: 'count',
        unit: 'pompes',
        icon: '💪'
    },
    {
        id: 'streak-battle',
        name: '🔥 Bataille de Streaks',
        description: 'Qui maintient le plus long streak ?',
        duration: 30,
        metric: 'streak',
        unit: 'jours',
        icon: '🔥'
    },
    {
        id: 'weight-loss',
        name: '⚖️ Perte de Poids',
        description: 'Qui perd le plus de kg en 60 jours ?',
        duration: 60,
        metric: 'weight',
        unit: 'kg',
        icon: '⚖️'
    },
    {
        id: 'study-hours',
        name: '📚 Heures d\'Étude',
        description: 'Qui étudie le plus en 14 jours ?',
        duration: 14,
        metric: 'hours',
        unit: 'heures',
        icon: '📚'
    }
];

const allQuests = dailyQuests; // Pour compatibilité avec ancien code

function initDailyQuests() {
    const today = getTodayDate();
    const savedDate = originalGetItem('questsDate');
    const dayOfWeek = getDayOfWeek();
    
    // Samedi : pas de quêtes quotidiennes
    if (dayOfWeek === 6) {
        originalSetItem('dailyQuests', JSON.stringify([]));
        originalSetItem('questsDate', today);
        displayDailyQuests();
        return;
    }
    
    if (savedDate !== today) {
        // Nouveau jour : générer de nouvelles quêtes
        // Obtenir la quête d'exercice du jour (rotation pompes/abdos/squats)
        const exerciseQuestId = getExerciseQuestForToday();
        const exerciseQuest = exerciseQuestId ? allQuests.find(q => q.id === exerciseQuestId) : null;
        
        // Exclure toutes les quêtes d'exercice (pompes, abdos, squats) sauf celle du jour
        const otherQuests = allQuests.filter(q => 
            q.id !== 'quest-pushups' && 
            q.id !== 'quest-abs' && 
            q.id !== 'quest-squats'
        );
        
        // Mélanger les autres quêtes
        const shuffled = [...otherQuests].sort(() => Math.random() - 0.5);
        
        // Prendre 4 autres quêtes + la quête d'exercice du jour = 5 quêtes au total
        const selectedQuests = exerciseQuest 
            ? [exerciseQuest, ...shuffled.slice(0, 4)].filter(q => q !== undefined)
            : shuffled.slice(0, 5).filter(q => q !== undefined);
        
        const dailyQuests = selectedQuests.map(q => q.id);
        
        originalSetItem('dailyQuests', JSON.stringify(dailyQuests));
        originalSetItem('questsDate', today);
        
        dailyQuests.forEach(qid => localStorage.removeItem('quest_' + qid));
    } else {
        // Même jour : vérifier si la quête d'exercice du jour est présente
        const exerciseQuestId = getExerciseQuestForToday();
        if (exerciseQuestId) {
            const currentQuests = JSON.parse(originalGetItem('dailyQuests') || '[]');
            const hasExerciseQuest = currentQuests.some(qid => 
                qid === 'quest-pushups' || qid === 'quest-abs' || qid === 'quest-squats'
            );
            
            if (!hasExerciseQuest) {
                // Aucune quête d'exercice présente, ajouter celle du jour
                const exerciseQuest = allQuests.find(q => q.id === exerciseQuestId);
                if (exerciseQuest) {
                    // Retirer les autres quêtes d'exercice si présentes
                    const filteredQuests = currentQuests.filter(qid => 
                        qid !== 'quest-pushups' && qid !== 'quest-abs' && qid !== 'quest-squats'
                    );
                    
                    if (filteredQuests.length < 5) {
                        filteredQuests.push(exerciseQuestId);
                    } else {
                        // Remplacer une quête aléatoire
                        const indexToReplace = Math.floor(Math.random() * filteredQuests.length);
                        filteredQuests[indexToReplace] = exerciseQuestId;
                    }
                    originalSetItem('dailyQuests', JSON.stringify(filteredQuests));
                }
            } else {
                // Vérifier si c'est la bonne quête d'exercice
                const hasCorrectExercise = currentQuests.includes(exerciseQuestId);
                if (!hasCorrectExercise) {
                    // Remplacer la quête d'exercice par celle du jour
                    const filteredQuests = currentQuests.map(qid => {
                        if (qid === 'quest-pushups' || qid === 'quest-abs' || qid === 'quest-squats') {
                            return exerciseQuestId;
                        }
                        return qid;
                    });
                    originalSetItem('dailyQuests', JSON.stringify(filteredQuests));
                }
            }
        }
    }
    
    displayDailyQuests();
    updateQuestTimer();
    setInterval(updateQuestTimer, 1000);
}

// Fonction pour calculer le nombre d'exercices selon le rang (pompes, abdos, squats)
function getExerciseCount() {
    try {
        const currentRankName = getCurrentUserRank();
        if (!currentRankName) return 50; // Valeur par défaut si pas de rang
        
        const rankIndex = rankSystem.findIndex(r => r.name === currentRankName);
        // Rang F (index 0) = 50, puis +15 par rang
        // F = 50, E = 65, D = 80, C = 95, etc.
        const count = 50 + (Math.max(0, rankIndex) * 15);
        return count;
    } catch (error) {
        console.error('Erreur dans getExerciseCount:', error);
        return 50; // Valeur par défaut en cas d'erreur
    }
}

function displayDailyQuests() {
    const dayOfWeek = getDayOfWeek();
    const dailyQuests = JSON.parse(originalGetItem('dailyQuests') || '[]');
    const container = document.getElementById('dailyQuestsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Samedi : afficher un message spécial
    if (dayOfWeek === 6) {
        container.innerHTML = `
            <div style="
                text-align: center;
                padding: 40px 20px;
                color: var(--text-secondary);
                font-size: 1.3em;
                background: var(--bg-card);
                border: 2px dashed var(--border-color);
                border-radius: 15px;
            ">
                🎉 <strong>JOUR DE REPOS !</strong> 🎉<br><br>
                Profite de ton samedi, pas de quêtes aujourd'hui !
            </div>
        `;
        // Mettre à jour les stats des quêtes
        const completedEl = document.getElementById('dailyQuestsCompleted');
        const bonusEl = document.getElementById('dailyQuestBonus');
        if (completedEl) completedEl.textContent = '0/0';
        if (bonusEl) bonusEl.textContent = '+0';
        return;
    }
    
    dailyQuests.forEach(questId => {
        const quest = allQuests.find(q => q.id === questId);
        if (!quest) {
            console.warn(`Quête non trouvée: ${questId}`);
            return;
        }
        
        const completed = originalGetItem('quest_' + questId) === 'true';
        
        // Si c'est une quête d'exercice, calculer dynamiquement le nombre selon le rang
        let questName = quest.name;
        if (questId === 'quest-pushups') {
            try {
                const count = getExerciseCount();
                questName = `💪 ${count} pompes`;
            } catch (error) {
                console.error('Erreur lors du calcul des pompes:', error);
                questName = `💪 50 pompes`; // Valeur par défaut
            }
        } else if (questId === 'quest-abs') {
            try {
                const count = getExerciseCount();
                questName = `💪 ${count} abdos`;
            } catch (error) {
                console.error('Erreur lors du calcul des abdos:', error);
                questName = `💪 50 abdos`; // Valeur par défaut
            }
        } else if (questId === 'quest-squats') {
            try {
                const count = getExerciseCount();
                questName = `💪 ${count} squats`;
            } catch (error) {
                console.error('Erreur lors du calcul des squats:', error);
                questName = `💪 50 squats`; // Valeur par défaut
            }
        }
        
        const questDiv = document.createElement('div');
        questDiv.className = 'quest-item' + (completed ? ' completed' : '');
        questDiv.innerHTML = `
            <div class="quest-info">
                <div class="quest-name">${questName}</div>
                <div class="quest-reward">${quest.bonus}</div>
            </div>
            <button class="quest-btn" onclick="completeQuest('${questId}')" ${completed ? 'disabled' : ''}>
                ${completed ? '✓ Terminée' : 'Compléter'}
            </button>
        `;
        
        container.appendChild(questDiv);
    });
    
    updateQuestStats();
}

function completeQuest(questId) {
    originalSetItem('quest_' + questId, 'true');
    
    // +0.5 jour de rang par quête !
    let currentPoints = parseFloat(originalGetItem('rankProgressPoints') || '0');
    currentPoints += 0.5;
    originalSetItem('rankProgressPoints', currentPoints.toString());
    
    playSound('levelUp');
    displayDailyQuests();
    updateRankSystem();
}

function updateQuestStats() {
    const dailyQuests = JSON.parse(originalGetItem('dailyQuests') || '[]');
    let completed = 0;
    
    dailyQuests.forEach(qid => {
        if (originalGetItem('quest_' + qid) === 'true') {
            completed++;
        }
    });
    
    document.getElementById('dailyQuestsCompleted').textContent = `${completed}/5`;
    document.getElementById('dailyQuestBonus').textContent = `+${(completed * 0.5).toFixed(1)}`;
}

function updateQuestTimer() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    const timerElement = document.getElementById('questTimer');
    if (timerElement) {
        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

/* ========================================
   SYSTÈME DE QUÊTES ÉPIQUES
======================================== */

function displayEpicQuests() {
    const container = document.getElementById('epicQuestsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    epicQuests.forEach(quest => {
        const progress = getEpicQuestProgress(quest.id);
        const percentage = calculateEpicProgress(quest, progress);
        const nextMilestone = getNextMilestone(quest, progress);
        
        const questDiv = document.createElement('div');
        questDiv.className = 'epic-quest-card';
        
        questDiv.innerHTML = `
            <div class="epic-quest-header">
                <span class="epic-quest-icon">${quest.icon}</span>
                <div class="epic-quest-title">
                    <h3>${quest.name}</h3>
                    <p>${quest.description}</p>
                </div>
            </div>
            <div class="epic-quest-progress">
                <div class="epic-progress-bar">
                    <div class="epic-progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="epic-progress-text">${progress} / ${getEpicTarget(quest)} ${getEpicUnit(quest)}</div>
            </div>
            <div class="epic-quest-milestones">
                ${renderMilestones(quest, progress)}
            </div>
            <div class="epic-quest-actions">
                <button class="epic-quest-btn" onclick="updateEpicProgress('${quest.id}')">
                    ⚡ Mettre à jour
                </button>
                <div class="epic-quest-reward">
                    Récompense : +${quest.rewards.rankBonus} jours de rang
                </div>
            </div>
        `;
        
        container.appendChild(questDiv);
    });
}

function getEpicQuestProgress(questId) {
    return parseFloat(originalGetItem(`epic_${questId}`) || '0');
}

function calculateEpicProgress(quest, current) {
    const target = getEpicTarget(quest);
    return Math.min((current / target) * 100, 100);
}

function getEpicTarget(quest) {
    if (quest.targetDays) return quest.targetDays;
    if (quest.targetAmount) return quest.targetAmount;
    if (quest.targetKm) return quest.targetKm;
    if (quest.targetKg) return quest.targetKg;
    if (quest.targetHours) return quest.targetHours;
    return 100;
}

function getEpicUnit(quest) {
    if (quest.targetDays) return 'jours';
    if (quest.targetAmount) return '€';
    if (quest.targetKm) return 'km';
    if (quest.targetKg) return 'kg';
    if (quest.targetHours) return 'heures';
    return '';
}

function getNextMilestone(quest, current) {
    for (let milestone of quest.milestones) {
        const value = milestone.days || milestone.amount || milestone.km || milestone.kg || milestone.hours;
        if (current < value) {
            return milestone;
        }
    }
    return null;
}

function renderMilestones(quest, current) {
    return quest.milestones.map(milestone => {
        const value = milestone.days || milestone.amount || milestone.km || milestone.kg || milestone.hours;
        const reached = current >= value;
        return `
            <div class="epic-milestone ${reached ? 'reached' : ''}">
                <span class="milestone-check">${reached ? '✅' : '⭕'}</span>
                <span class="milestone-name">${milestone.name}</span>
                <span class="milestone-bonus">+${milestone.bonus}</span>
            </div>
        `;
    }).join('');
}

function updateEpicProgress(questId) {
    const quest = epicQuests.find(q => q.id === questId);
    if (!quest) return;
    
    const current = getEpicQuestProgress(questId);
    const unit = getEpicUnit(quest);
    
    const newValue = prompt(`📊 ${quest.name}\n\nProgression actuelle : ${current} ${unit}\n\nNouvelle valeur :`, current);
    
    if (newValue === null) return;
    
    const numValue = parseFloat(newValue);
    if (isNaN(numValue) || numValue < 0) {
        alert('❌ Valeur invalide !');
        return;
    }
    
    // Vérifier les milestones franchis
    const oldMilestones = quest.milestones.filter(m => {
        const val = m.days || m.amount || m.km || m.kg || m.hours;
        return current >= val;
    });
    
    const newMilestones = quest.milestones.filter(m => {
        const val = m.days || m.amount || m.km || m.kg || m.hours;
        return numValue >= val && current < val;
    });
    
    // Donner les récompenses des nouveaux milestones
    newMilestones.forEach(milestone => {
        let currentPoints = parseFloat(originalGetItem('rankProgressPoints') || '0');
        currentPoints += milestone.bonus;
        originalSetItem('rankProgressPoints', currentPoints.toString());
        
        // Particules épiques !
        createEpicMilestoneEffect(milestone.name, milestone.bonus);
        
        playSound('levelUp');
    });
    
    // Sauvegarder
    originalSetItem(`epic_${questId}`, numValue.toString());
    
    // Vérifier si complété
    if (numValue >= getEpicTarget(quest)) {
        // QUÊTE ÉPIQUE TERMINÉE !
        let currentPoints = parseFloat(originalGetItem('rankProgressPoints') || '0');
        currentPoints += quest.rewards.rankBonus;
        originalSetItem('rankProgressPoints', currentPoints.toString());
        
        alert(`🎉 QUÊTE ÉPIQUE TERMINÉE !\n\n${quest.name}\n\n+${quest.rewards.rankBonus} jours de rang !`);
        playSound('levelUp');
    }
    
    displayEpicQuests();
    updateRankSystem();
}

function createEpicMilestoneEffect(name, bonus) {
    // Effet visuel pour milestone atteint
    const container = createParticlesContainer();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Explosion de particules dorées
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const angle = (Math.PI * 2 * i) / 30;
            const radius = 100 + Math.random() * 150;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            createParticle(x, y, '#FFD700', 8);
        }, i * 30);
    }
    
    // Message
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #FFD700, #FFA500);
        padding: 30px 50px;
        border-radius: 20px;
        font-size: 2em;
        font-weight: bold;
        color: #000;
        z-index: 10001;
        box-shadow: 0 0 50px rgba(255, 215, 0, 0.8);
        animation: epicPulse 0.5s ease-out;
    `;
    message.textContent = `🎉 ${name} +${bonus} 🎉`;
    document.body.appendChild(message);
    
    setTimeout(() => message.remove(), 3000);
}

/* ========================================
   SYSTÈME DE DÉFIS ENTRE AMIS
======================================== */

function displayChallenges() {
    const container = document.getElementById('challengesList');
    if (!container) return;
    
    const activeChallenges = getActiveChallenges();
    
    container.innerHTML = '';
    
    if (activeChallenges.length === 0) {
        container.innerHTML = `
            <div class="no-challenges">
                <p>🎯 Aucun défi actif</p>
                <button class="create-challenge-btn" onclick="showCreateChallenge()">
                    ➕ Créer un défi
                </button>
            </div>
        `;
        return;
    }
    
    activeChallenges.forEach(challenge => {
        const challengeDiv = document.createElement('div');
        challengeDiv.className = 'challenge-card';
        
        const daysLeft = getDaysLeft(challenge.endDate);
        const leaderboard = getChallengeLeaderboard(challenge);
        
        challengeDiv.innerHTML = `
            <div class="challenge-header">
                <span class="challenge-icon">${challenge.icon}</span>
                <div class="challenge-info">
                    <h3>${challenge.name}</h3>
                    <p>${challenge.description}</p>
                </div>
            </div>
            <div class="challenge-timer">
                ⏱️ ${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}
            </div>
            <div class="challenge-leaderboard">
                ${renderChallengeLeaderboard(leaderboard)}
            </div>
            <button class="update-challenge-btn" onclick="updateChallengeProgress('${challenge.id}')">
                📊 Mettre à jour ma progression
            </button>
        `;
        
        container.appendChild(challengeDiv);
    });
}

function getActiveChallenges() {
    return JSON.parse(originalGetItem('activeChallenges') || '[]');
}

function getDaysLeft(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getChallengeLeaderboard(challenge) {
    return challenge.participants.sort((a, b) => b.score - a.score);
}

function renderChallengeLeaderboard(leaderboard) {
    const username = localStorage.getItem('username');
    
    return leaderboard.map((participant, index) => {
        const isMe = participant.username === username;
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        
        return `
            <div class="challenge-participant ${isMe ? 'me' : ''}">
                <span class="participant-rank">${medal}</span>
                <span class="participant-name">${participant.username}${isMe ? ' (TOI)' : ''}</span>
                <span class="participant-score">${participant.score}</span>
            </div>
        `;
    }).join('');
}

function showCreateChallenge() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        overflow-y: auto;
    `;
    
    overlay.innerHTML = `
        <div style="
            max-width: 600px;
            padding: 40px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #ffa500;
            border-radius: 20px;
            margin: 20px;
        ">
            <h2 style="color: #ffa500; text-align: center; margin-bottom: 20px;">🎯 CRÉER UN DÉFI</h2>
            
            <div style="margin-bottom: 20px;">
                <label style="color: #fff; display: block; margin-bottom: 10px;">Type de défi :</label>
                <select id="challengeType" style="
                    width: 100%;
                    padding: 15px;
                    background: #0a0a0a;
                    border: 2px solid #ffa500;
                    color: white;
                    border-radius: 10px;
                    font-size: 1.1em;
                ">
                    ${challengeTypes.map(ct => `
                        <option value="${ct.id}">${ct.icon} ${ct.name}</option>
                    `).join('')}
                </select>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="color: #fff; display: block; margin-bottom: 10px;">Pseudo de ton ami :</label>
                <input type="text" id="friendUsername" placeholder="Pseudo..." style="
                    width: 100%;
                    padding: 15px;
                    background: #0a0a0a;
                    border: 2px solid #ffa500;
                    color: white;
                    border-radius: 10px;
                    font-size: 1.1em;
                ">
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="createChallenge()" style="
                    flex: 1;
                    padding: 15px;
                    background: linear-gradient(135deg, #ffa500, #ff6b00);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 1.2em;
                    font-weight: bold;
                    cursor: pointer;
                ">CRÉER</button>
                <button onclick="this.closest('[style*=fixed]').remove()" style="
                    flex: 1;
                    padding: 15px;
                    background: #444;
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 1.2em;
                    cursor: pointer;
                ">ANNULER</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function createChallenge() {
    const typeId = document.getElementById('challengeType').value;
    const friendUsername = document.getElementById('friendUsername').value.trim();
    const myUsername = localStorage.getItem('username');
    
    if (!friendUsername) {
        alert('⚠️ Entre le pseudo de ton ami !');
        return;
    }
    
    const challengeType = challengeTypes.find(ct => ct.id === typeId);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + challengeType.duration);
    
    const challenge = {
        id: 'challenge_' + Date.now(),
        ...challengeType,
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
        participants: [
            { username: myUsername, score: 0 },
            { username: friendUsername, score: 0 }
        ]
    };
    
    const activeChallenges = getActiveChallenges();
    activeChallenges.push(challenge);
    originalSetItem('activeChallenges', JSON.stringify(activeChallenges));
    
    document.querySelector('[style*="position: fixed"]').remove();
    displayChallenges();
    
    alert(`🎯 Défi créé !\n\n${challenge.name}\nDurée : ${challenge.duration} jours\n\nQue le meilleur gagne !`);
}

function updateChallengeProgress(challengeId) {
    const challenges = getActiveChallenges();
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    const myUsername = localStorage.getItem('username');
    const me = challenge.participants.find(p => p.username === myUsername);
    
    const newScore = prompt(`📊 ${challenge.name}\n\nTon score actuel : ${me.score} ${challenge.unit}\n\nNouveau score :`, me.score);
    
    if (newScore === null) return;
    
    const numScore = parseFloat(newScore);
    if (isNaN(numScore) || numScore < 0) {
        alert('❌ Valeur invalide !');
        return;
    }
    
    me.score = numScore;
    originalSetItem('activeChallenges', JSON.stringify(challenges));
    
    displayChallenges();
    
    // Particules si nouveau record
    if (numScore > (challenge.participants.find(p => p.username !== myUsername)?.score || 0)) {
        createCheckboxParticles(document.body);
    }
}

/* ========================================
   INITIALISATION
======================================== */

function initializeApp() {
    generateHabitsHTML();
    updateDate();
    loadHabits();
    updateProgress();
    updateStatsDisplay();
    updateRankSystem();
    updateStreaks();
    initDailyQuests();
    initLeaderboard();
    
    window.addEventListener('resize', function() {
        updateStatsDisplay();
    });
}

function generateHabitsHTML() {
    const container = document.getElementById('habitsContainer');
    if (!container || !currentConfig) return;
    
    container.innerHTML = '';
    
    const categories = {
        sleep: { icon: '😴', name: 'Sommeil', habits: ['sommeil'] },
        sport: { icon: '💪', name: 'Sport', habits: ['sport'] },
        food: { icon: '🍗', name: 'Alimentation', habits: ['proteines'] },
        hygiene: { icon: '🧼', name: 'Hygiène', habits: ['douche-matin', 'douche-soir', 'brossage-matin', 'brossage-soir', 'ongles', 'rasage'] },
        spiritual: { icon: currentConfig.categoryIcons.spiritual, name: currentConfig.categoryNames.spiritual, habits: [] },
        clean: { icon: '🧹', name: 'Rangement', habits: ['chambre'] },
        ethics: { icon: '✨', name: currentConfig.categoryNames.ethics, habits: [] }
    };
    
    // Habitudes spirituelles selon la religion
    if (currentConfig.name === 'Islam') {
        categories.spiritual.habits = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        categories.ethics.habits = ['peches'];
    } else if (currentConfig.name === 'Christianisme') {
        categories.spiritual.habits = ['priere-matin', 'priere-midi', 'priere-soir', 'priere-repas', 'priere-nuit'];
        categories.ethics.habits = ['commandements'];
    } else {
        categories.spiritual.habits = ['meditation-matin', 'meditation-midi', 'meditation-soir', 'gratitude', 'journal'];
        categories.ethics.habits = ['ethique'];
    }
    
    const habitLabels = {
        'sommeil': '7-8 heures de sommeil',
        'sport': 'Séance de sport aujourd\'hui',
        'proteines': '140g de protéines minimum',
        'douche-matin': 'Douche du matin',
        'douche-soir': 'Douche du soir',
        'brossage-matin': 'Brossage de dents - Matin',
        'brossage-soir': 'Brossage de dents - Soir',
        'ongles': 'Coupage d\'ongles',
        'rasage': 'Rasage',
        'chambre': 'Ranger ma chambre',
        ...currentConfig.habitLabels
    };
    
    Object.values(categories).forEach(category => {
        if (category.habits.length === 0) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        
        const title = document.createElement('h2');
        title.innerHTML = `<span class="category-icon">${category.icon}</span> ${category.name}`;
        categoryDiv.appendChild(title);
        
        category.habits.forEach(habitId => {
            const habitDiv = document.createElement('div');
            habitDiv.className = 'habit-item';
            habitDiv.onclick = () => toggleCheckbox(habitId);
            
            habitDiv.innerHTML = `
                <input type="checkbox" id="${habitId}">
                <label for="${habitId}">${habitLabels[habitId] || habitId}</label>
            `;
            
            categoryDiv.appendChild(habitDiv);
        });
        
        container.appendChild(categoryDiv);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    
    if (loadReligionConfig()) {
        initializeApp();
    }
});

// Fonction globale pour sélection (appelée depuis HTML inline)
window.selectReligion = selectReligion;

/* ========================================
   SYSTÈME DE LEADERBOARD
======================================== */

function showLeaderboard() {
    const users = getAllUsers();
    const userList = Object.keys(users);
    
    if (userList.length === 0) {
        alert('Aucun utilisateur pour le moment !');
        return;
    }
    
    // Calculer les stats de chaque utilisateur
    const rankings = userList.map(username => {
        const userData = users[username];
        const savedUser = currentUser;
        currentUser = username;
        
        const rankIndex = parseInt(originalGetItem('currentRankIndex', '0'));
        const progressPoints = parseFloat(originalGetItem('rankProgressPoints', '0'));
        const currentStreak = parseInt(originalGetItem('currentStreak', '0'));
        const bestStreak = parseInt(originalGetItem('bestStreak', '0'));
        
        // Calculer le power level
        const history = JSON.parse(originalGetItem('habitHistory', '{}'));
        let powerLevel = 0;
        Object.keys(history).forEach(date => {
            const dayData = history[date];
            if (dayData && dayData.habits) {
                Object.keys(dayData.habits).forEach(habit => {
                    if (dayData.habits[habit]) powerLevel += 1;
                });
            }
        });
        
        currentUser = savedUser;
        
        return {
            username,
            religion: userData.religion,
            rankIndex,
            progressPoints,
            currentStreak,
            bestStreak,
            powerLevel,
            rank: rankSystem[Math.min(rankIndex, rankSystem.length - 1)].name
        };
    });
    
    // Trier par progression totale
    rankings.sort((a, b) => b.progressPoints - a.progressPoints);
    
    let leaderboardHTML = '';
    rankings.forEach((user, index) => {
        const config = religionConfigs[user.religion];
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const isCurrentUser = user.username === currentUser;
        
        leaderboardHTML += `
            <div style="
                padding: 20px;
                background: ${isCurrentUser ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))' : 'linear-gradient(135deg, rgba(0, 217, 255, 0.05), rgba(0, 150, 200, 0.05))'};
                border: 2px solid ${isCurrentUser ? '#ffd700' : '#00d9ff'};
                border-radius: 15px;
                margin-bottom: 15px;
                ${isCurrentUser ? 'box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);' : ''}
            ">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 2em; min-width: 40px;">${medal}</div>
                    <div style="font-size: 2em;">${config.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 1.4em; font-weight: bold; color: ${isCurrentUser ? '#ffd700' : 'white'};">
                            ${user.username} ${isCurrentUser ? '(TOI)' : ''}
                        </div>
                        <div style="font-size: 0.9em; color: #aaa;">${config.name}</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; font-size: 0.9em;">
                    <div style="text-align: center; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 10px;">
                        <div style="color: #aaa; margin-bottom: 5px;">RANG</div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #ffd700;">${user.rank}</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 10px;">
                        <div style="color: #aaa; margin-bottom: 5px;">POWER LEVEL</div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #00d9ff;">${user.powerLevel}</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 10px;">
                        <div style="color: #aaa; margin-bottom: 5px;">STREAK</div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #ff6b6b;">🔥 ${user.currentStreak}</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 10px;">
                        <div style="color: #aaa; margin-bottom: 5px;">RECORD</div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #00cc66;">🏆 ${user.bestStreak}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    const overlay = document.createElement('div');
    overlay.id = 'leaderboardOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
        overflow-y: auto;
        padding: 20px;
    `;
    
    overlay.innerHTML = `
        <div style="
            max-width: 900px;
            width: 100%;
            padding: 40px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #ffd700;
            border-radius: 20px;
            box-shadow: 0 0 50px rgba(255, 215, 0, 0.5);
            max-height: 90vh;
            overflow-y: auto;
        ">
            <h1 style="
                font-size: 2.5em;
                color: #ffd700;
                margin-bottom: 30px;
                text-align: center;
                text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
            ">🏆 CLASSEMENT DES GUERRIERS 🏆</h1>
            
            <div>${leaderboardHTML}</div>
            
            <button onclick="document.getElementById('leaderboardOverlay').remove()" style="
                width: 100%;
                margin-top: 20px;
                padding: 15px;
                background: linear-gradient(135deg, #667eea, #4a5fd4);
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
            ">
                ✖️ FERMER
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Exposer les fonctions globalement
window.showLeaderboard = showLeaderboard;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.selectRegisterReligion = selectRegisterReligion;

/* ========================================
   SYSTÈME DE CLASSEMENT
======================================== */

function showUsernamePrompt() {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) return;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
    `;
    
    overlay.innerHTML = `
        <div style="
            max-width: 500px;
            padding: 40px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #00d9ff;
            border-radius: 20px;
            text-align: center;
        ">
            <h2 style="color: #00d9ff; margin-bottom: 20px;">⚔️ CHOISIS TON NOM DE GUERRIER ⚔️</h2>
            <input type="text" id="usernameInput" placeholder="Entre ton pseudo..." style="
                width: 100%;
                padding: 15px;
                font-size: 1.2em;
                background: #0f1419;
                border: 2px solid #00d9ff;
                color: white;
                border-radius: 10px;
                margin-bottom: 20px;
            ">
            <button onclick="saveUsername()" style="
                padding: 15px 40px;
                background: linear-gradient(135deg, #00d9ff, #0088cc);
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 1.2em;
                font-weight: bold;
                cursor: pointer;
            ">CONFIRMER</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function saveUsername() {
    const input = document.getElementById('usernameInput');
    const username = input.value.trim();
    
    if (!username) {
        alert('Entre un pseudo !');
        return;
    }
    
    localStorage.setItem('username', username);
    document.querySelector('[style*="z-index: 10001"]').remove();
    initLeaderboard();
}

function getCurrentUserRank() {
    const progressPoints = parseFloat(originalGetItem('rankProgressPoints') || '0');
    let currentIndex = 0;
    let remainingPoints = progressPoints;
    
    for (let i = 0; i < rankSystem.length; i++) {
        if (remainingPoints >= rankSystem[i].days) {
            remainingPoints -= rankSystem[i].days;
            currentIndex++;
        } else {
            break;
        }
    }
    
    if (currentIndex >= rankSystem.length) {
        currentIndex = rankSystem.length - 1;
    }
    
    return rankSystem[currentIndex].name;
}

function initLeaderboard() {
    const username = localStorage.getItem('username');
    if (!username) {
        showUsernamePrompt();
        return;
    }
    
    // Sauvegarder sur Firebase
    setTimeout(() => updateMyRankOnFirebase(), 1000);
    
    // Afficher le classement Firebase
    if (window.firebaseDb) {
        displayFirebaseLeaderboard();
    } else {
        // Fallback si Firebase pas chargé
        displayLeaderboard();
    }
}

function displayLeaderboard() {
    const container = document.getElementById('leaderboardList');
    if (!container) return;
    
    const username = localStorage.getItem('username');
    const religion = localStorage.getItem('selectedReligion');
    const currentRank = getCurrentUserRank();
    
    const religionIcons = {
        islam: '☪️',
        christianity: '✝️',
        neutral: '🌟'
    };
    
    // Liste des utilisateurs (toi + ceux que tu as ajoutés)
    let users = JSON.parse(localStorage.getItem('leaderboardUsers') || '[]');
    
    // Ajouter/mettre à jour ton propre profil
    const myProfile = {
        username: username,
        rank: currentRank,
        religion: religion,
        isMe: true
    };
    
    users = users.filter(u => u.username !== username);
    users.push(myProfile);
    
    // Trier par rang (du meilleur au moins bon)
    const rankValues = {};
    rankSystem.forEach((r, i) => rankValues[r.name] = i);
    users.sort((a, b) => rankValues[b.rank] - rankValues[a.rank]);
    
    container.innerHTML = '';
    
    users.forEach((user, index) => {
        const rank = rankSystem.find(r => r.name === user.rank);
        const userDiv = document.createElement('div');
        userDiv.className = 'leaderboard-item' + (user.isMe ? ' my-rank' : '');
        
        userDiv.innerHTML = `
            <div class="leaderboard-position">#${index + 1}</div>
            <div class="leaderboard-user">
                <span class="leaderboard-icon">${religionIcons[user.religion] || '🌟'}</span>
                <span class="leaderboard-username">${user.username}${user.isMe ? ' (TOI)' : ''}</span>
            </div>
            <div class="leaderboard-rank" style="background: ${rank.color};">${user.rank}</div>
        `;
        
        container.appendChild(userDiv);
    });
    
    localStorage.setItem('leaderboardUsers', JSON.stringify(users));
}

function showAddUserDialog() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10002;
    `;
    
    overlay.innerHTML = `
        <div style="
            max-width: 500px;
            padding: 40px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #ffa500;
            border-radius: 20px;
            text-align: center;
        ">
            <h2 style="color: #ffa500; margin-bottom: 20px;">➕ AJOUTER UN RIVAL</h2>
            <input type="text" id="friendUsernameInput" placeholder="Pseudo de ton pote..." style="
                width: 100%;
                padding: 15px;
                font-size: 1.2em;
                background: #0f1419;
                border: 2px solid #ffa500;
                color: white;
                border-radius: 10px;
                margin-bottom: 15px;
            ">
            <select id="friendReligionInput" style="
                width: 100%;
                padding: 15px;
                font-size: 1.2em;
                background: #0f1419;
                border: 2px solid #ffa500;
                color: white;
                border-radius: 10px;
                margin-bottom: 15px;
            ">
                <option value="islam">☪️ Islam</option>
                <option value="christianity">✝️ Christianisme</option>
                <option value="neutral">🌟 Neutre</option>
            </select>
            <select id="friendRankInput" style="
                width: 100%;
                padding: 15px;
                font-size: 1.2em;
                background: #0f1419;
                border: 2px solid #ffa500;
                color: white;
                border-radius: 10px;
                margin-bottom: 20px;
            ">
                ${rankSystem.map(r => `<option value="${r.name}">${r.name}</option>`).join('')}
            </select>
            <div style="display: flex; gap: 10px;">
                <button onclick="addFriend()" style="
                    flex: 1;
                    padding: 15px;
                    background: linear-gradient(135deg, #ffa500, #ff6b00);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 1.2em;
                    font-weight: bold;
                    cursor: pointer;
                ">AJOUTER</button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    flex: 1;
                    padding: 15px;
                    background: #444;
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 1.2em;
                    cursor: pointer;
                ">ANNULER</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function addFriend() {
    const username = document.getElementById('friendUsernameInput').value.trim();
    const religion = document.getElementById('friendReligionInput').value;
    const rank = document.getElementById('friendRankInput').value;
    
    if (!username) {
        alert('Entre un pseudo !');
        return;
    }
    
    let users = JSON.parse(localStorage.getItem('leaderboardUsers') || '[]');
    users.push({ username, rank, religion, isMe: false });
    localStorage.setItem('leaderboardUsers', JSON.stringify(users));
    
    document.querySelector('[style*="z-index: 10002"]').remove();
    displayLeaderboard();
}

window.saveUsername = saveUsername;
window.addFriend = addFriend;
window.showAddUserDialog = showAddUserDialog;

// Fonction pour afficher le panel admin
async function showAdminPanel() {
    const adminMode = await isAdmin();
    if (!adminMode) {
        alert('❌ Accès refusé. Vous n\'êtes pas administrateur.');
        return;
    }
    
    const users = getAllUsers();
    const localUserList = Object.keys(users);
    
    // Récupérer les utilisateurs Firebase
    let firebaseUsers = [];
    if (window.firebaseDb) {
        try {
            const usersCollection = window.firebaseCollection(window.firebaseDb, 'users');
            const snapshot = await window.firebaseGetDocs(usersCollection);
            snapshot.forEach((doc) => {
                firebaseUsers.push(doc.data());
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs Firebase:', error);
        }
    }
    
    // Créer un Set de tous les usernames uniques
    const allUsernames = new Set([...localUserList, ...firebaseUsers.map(u => u.username)]);
    
    const overlay = document.createElement('div');
    overlay.id = 'adminOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
        backdrop-filter: blur(10px);
        overflow-y: auto;
        padding: 20px;
    `;
    
    let adminHTML = '';
    allUsernames.forEach(username => {
        const userData = users[username];
        const firebaseUser = firebaseUsers.find(u => u.username === username);
        const isLocal = !!userData;
        const isFirebase = !!firebaseUser;
        
        let config = { icon: '🌟', name: 'Inconnu' };
        if (userData && userData.religion) {
            config = religionConfigs[userData.religion];
        } else if (firebaseUser && firebaseUser.religion) {
            const religionConfig = religionConfigs[firebaseUser.religion];
            if (religionConfig) config = religionConfig;
        }
        
        const createdAt = userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('fr-FR') : 
                         (firebaseUser?.lastUpdated ? new Date(firebaseUser.lastUpdated).toLocaleDateString('fr-FR') : 'Inconnu');
        const lastActive = userData?.lastActive ? new Date(userData.lastActive).toLocaleDateString('fr-FR') : 
                          (firebaseUser?.lastUpdated ? new Date(firebaseUser.lastUpdated).toLocaleDateString('fr-FR') : 'Jamais');
        const rank = firebaseUser?.rank || 'F';
        
        const sourceBadge = [];
        if (isLocal) sourceBadge.push('<span style="background: #00d9ff; color: #000; padding: 2px 8px; border-radius: 5px; font-size: 0.75em; margin-left: 5px;">LOCAL</span>');
        if (isFirebase) sourceBadge.push('<span style="background: #ffaa00; color: #000; padding: 2px 8px; border-radius: 5px; font-size: 0.75em; margin-left: 5px;">FIREBASE</span>');
        
        adminHTML += `
            <div style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px;
                background: rgba(155, 89, 182, 0.1);
                border: 2px solid #9b59b6;
                border-radius: 15px;
                margin-bottom: 15px;
            ">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 1.5em;">${config.icon}</span>
                        <div>
                            <div style="font-size: 1.2em; font-weight: bold; color: white;">
                                ${username} ${sourceBadge.join('')}
                            </div>
                            <div style="font-size: 0.9em; color: #aaa;">
                                ${config.name} | Rang: ${rank}
                            </div>
                        </div>
                    </div>
                    <div style="font-size: 0.85em; color: #888;">
                        Créé: ${createdAt} | Dernière activité: ${lastActive}
                    </div>
                </div>
                <div style="display: flex; gap: 5px; flex-direction: column;">
                    ${isLocal ? `
                        <button onclick="deleteUser('${username}'); document.getElementById('adminOverlay').remove(); setTimeout(() => showAdminPanel(), 500);" style="
                            padding: 8px 15px;
                            background: linear-gradient(135deg, #ff4444, #cc0000);
                            border: 2px solid #ff4444;
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 0.85em;
                            transition: all 0.3s;
                        " title="Supprimer localement">
                            🗑️ Local
                        </button>
                    ` : ''}
                    ${isFirebase ? `
                        <button onclick="deleteUserFromFirebase('${username}'); document.getElementById('adminOverlay').remove(); setTimeout(() => showAdminPanel(), 500);" style="
                            padding: 8px 15px;
                            background: linear-gradient(135deg, #ff8800, #ff6600);
                            border: 2px solid #ff8800;
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 0.85em;
                            transition: all 0.3s;
                        " title="Supprimer de Firebase">
                            🔥 Firebase
                        </button>
                    ` : ''}
                    ${isLocal && isFirebase ? `
                        <button onclick="deleteUserCompletely('${username}'); document.getElementById('adminOverlay').remove(); setTimeout(() => showAdminPanel(), 1000);" style="
                            padding: 8px 15px;
                            background: linear-gradient(135deg, #cc0000, #990000);
                            border: 2px solid #cc0000;
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 0.85em;
                            transition: all 0.3s;
                        " title="Supprimer complètement (local + Firebase)">
                            ⚡ Tout
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    overlay.innerHTML = `
        <div style="
            max-width: 900px;
            width: 100%;
            padding: 40px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #9b59b6;
            border-radius: 20px;
            box-shadow: 0 0 50px rgba(155, 89, 182, 0.5);
        ">
            <h1 style="
                font-size: 2.5em;
                color: #9b59b6;
                margin-bottom: 20px;
                text-align: center;
                text-shadow: 0 0 20px rgba(155, 89, 182, 0.8);
            ">⚙️ PANEL ADMINISTRATEUR</h1>
            
            <div style="
                padding: 15px;
                background: rgba(155, 89, 182, 0.1);
                border: 2px solid #9b59b6;
                border-radius: 10px;
                margin-bottom: 20px;
                text-align: center;
                color: #9b59b6;
            ">
                <div style="font-weight: bold; margin-bottom: 5px;">Votre IP: ${userIP || 'Chargement...'}</div>
                <div style="font-size: 0.9em; color: #aaa; margin-top: 10px;">
                    <div>📊 Utilisateurs locaux: ${localUserList.length}</div>
                    <div>🔥 Utilisateurs Firebase: ${firebaseUsers.length}</div>
                    <div>👥 Total unique: ${allUsernames.size}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h2 style="color: #9b59b6; margin-bottom: 15px; font-size: 1.5em;">👥 GESTION DES COMPTES</h2>
                <div style="margin-bottom: 10px; padding: 10px; background: rgba(255, 170, 0, 0.1); border: 1px solid #ffaa00; border-radius: 8px; font-size: 0.9em; color: #ffaa00;">
                    💡 <strong>LOCAL</strong> = Compte stocké localement | <strong>FIREBASE</strong> = Compte sur le classement en ligne
                </div>
                ${allUsernames.size === 0 ? '<p style="text-align: center; color: #aaa;">Aucun utilisateur</p>' : adminHTML}
            </div>
            
            <button onclick="document.getElementById('adminOverlay').remove()" style="
                width: 100%;
                padding: 15px;
                background: linear-gradient(135deg, #667eea, #4a5fd4);
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
            ">
                ✖️ FERMER
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// EXPOSE TOUTES LES FONCTIONS NÉCESSAIRES
window.toggleCheckbox = toggleCheckbox;
window.resetAll = resetAll;
window.toggleTheme = toggleTheme;
window.toggleSound = toggleSound;
window.completeQuest = completeQuest;
window.showPage = showPage;
window.updateEpicProgress = updateEpicProgress;
window.showCreateChallenge = showCreateChallenge;
window.createChallenge = createChallenge;
window.updateChallengeProgress = updateChallengeProgress;
window.deleteUser = deleteUser;
window.deleteUserFromFirebase = deleteUserFromFirebase;
window.deleteUserCompletely = deleteUserCompletely;
window.showAdminPanel = showAdminPanel;

/* ========================================
   NAVIGATION SYSTEM
======================================== */

function showPage(pageName) {
    // Cache toutes les pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    
    // Retire l'état actif de tous les onglets
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Affiche la page sélectionnée
    const selectedPage = document.getElementById(`page-${pageName}`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Active l'onglet correspondant
    const tabs = document.querySelectorAll('.nav-tab');
    const pageIndex = ['daily', 'stats', 'quests', 'leaderboard'].indexOf(pageName);
    if (tabs[pageIndex]) {
        tabs[pageIndex].classList.add('active');
    }
    
    // Mettre à jour les quêtes si on affiche la page des quêtes (pour refléter le rang actuel)
    if (pageName === 'quests') {
        displayDailyQuests();
    }
    
    // Activer les particules sur la page des stats
    if (pageName === 'stats') {
        startStatsParticles();
        updateStatsDisplay(); // Mettre à jour l'affichage des stats
    } else {
        stopStatsParticles();
    }
    
    // Joue un son si activé
    if (soundEnabled) {
        playSound('assets/ui-click.mp3');
    }
}

/* ========================================
   PARTICLE EFFECTS SYSTEM
======================================== */

// Créer le conteneur de particules
function createParticlesContainer() {
    let container = document.getElementById('particles-container');
    if (container) return container;
    
    container = document.createElement('div');
    container.id = 'particles-container';
    container.className = 'particles-container';
    document.body.appendChild(container);
    return container;
}

// Créer une particule
function createParticle(x, y, color, size = 5) {
    const container = createParticlesContainer();
    if (!container) {
        console.warn('Impossible de créer le conteneur de particules');
        return;
    }
    
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const drift = (Math.random() - 0.5) * 100;
    const duration = 2 + Math.random() * 2;
    
    particle.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        --drift: ${drift}px;
        animation-duration: ${duration}s;
        box-shadow: 0 0 ${size * 2}px ${color};
    `;
    
    container.appendChild(particle);
    
    setTimeout(() => {
        if (particle && particle.parentNode) {
            particle.remove();
        }
    }, duration * 1000);
}

// Système de particules pour la page des stats
let statsParticlesInterval = null;

function startStatsParticles() {
    // Arrêter les particules existantes si elles tournent déjà
    stopStatsParticles();
    
    const statsPage = document.getElementById('page-stats');
    if (!statsPage || !statsPage.classList.contains('active')) return;
    
    // Créer des particules flottantes en continu
    statsParticlesInterval = setInterval(() => {
        if (!document.getElementById('page-stats')?.classList.contains('active')) {
            stopStatsParticles();
            return;
        }
        
        // Particules aléatoires dans la zone des stats
        const statsSystem = document.querySelector('.stats-system');
        const rankSystem = document.querySelector('.rank-system');
        
        if (statsSystem) {
            const rect = statsSystem.getBoundingClientRect();
            const x = rect.left + Math.random() * rect.width;
            const y = rect.top + Math.random() * rect.height;
            const colors = ['#00d4ff', '#7b68ee', '#ffd700', '#00ff88', '#ff6b6b'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            createFloatingParticle(x, y, color, 3 + Math.random() * 3);
        }
        
        if (rankSystem) {
            const rect = rankSystem.getBoundingClientRect();
            const x = rect.left + Math.random() * rect.width;
            const y = rect.top + Math.random() * rect.height;
            const colors = ['#ffd700', '#00d4ff', '#7b68ee'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            createFloatingParticle(x, y, color, 3 + Math.random() * 3);
        }
        
        // Particules autour des barres de stats
        const statBars = document.querySelectorAll('.stat-bar-fill');
        statBars.forEach(bar => {
            if (Math.random() > 0.7) { // 30% de chance
                const rect = bar.getBoundingClientRect();
                const percentage = parseFloat(bar.style.width) || 0;
                if (percentage > 0) {
                    const x = rect.left + (percentage / 100) * rect.width;
                    const y = rect.top + rect.height / 2;
                    const color = getComputedStyle(bar).background || '#00d4ff';
                    createStatBarParticle(x, y, color);
                }
            }
        });
        
        // Particules autour du power level
        const powerLevel = document.querySelector('.power-level');
        if (powerLevel && Math.random() > 0.8) { // 20% de chance
            const rect = powerLevel.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const angle = Math.random() * Math.PI * 2;
            const radius = 30 + Math.random() * 40;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            createFloatingParticle(x, y, '#ffd700', 4 + Math.random() * 2);
        }
    }, 300); // Toutes les 300ms
}

function stopStatsParticles() {
    if (statsParticlesInterval) {
        clearInterval(statsParticlesInterval);
        statsParticlesInterval = null;
    }
}

// Créer une particule flottante (plus lente et douce)
function createFloatingParticle(x, y, color, size = 3) {
    const container = createParticlesContainer();
    if (!container) return;
    
    const particle = document.createElement('div');
    particle.className = 'particle floating-particle';
    
    const driftX = (Math.random() - 0.5) * 50;
    const driftY = (Math.random() - 0.5) * 50;
    const duration = 4 + Math.random() * 3;
    
    particle.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        --drift-x: ${driftX}px;
        --drift-y: ${driftY}px;
        animation-duration: ${duration}s;
        box-shadow: 0 0 ${size * 3}px ${color};
        opacity: 0.6;
    `;
    
    container.appendChild(particle);
    
    setTimeout(() => {
        if (particle && particle.parentNode) {
            particle.remove();
        }
    }, duration * 1000);
}

// Créer une particule autour d'une barre de stat
function createStatBarParticle(x, y, color) {
    const container = createParticlesContainer();
    if (!container) return;
    
    const particle = document.createElement('div');
    particle.className = 'particle stat-bar-particle';
    
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 30;
    const finalX = x + Math.cos(angle) * radius;
    const finalY = y + Math.sin(angle) * radius;
    const duration = 1.5 + Math.random() * 1;
    const deltaX = finalX - x;
    const deltaY = finalY - y;
    
    particle.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: ${color};
        box-shadow: 0 0 8px ${color};
        --delta-x: ${deltaX}px;
        --delta-y: ${deltaY}px;
    `;
    
    // Animation avec requestAnimationFrame pour un mouvement fluide
    let startTime = null;
    const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = (currentTime - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const currentX = x + deltaX * easeOut;
        const currentY = y + deltaY * easeOut;
        const scale = 1 - easeOut;
        const opacity = 1 - easeOut;
        
        particle.style.transform = `translate(${currentX - x}px, ${currentY - y}px) scale(${scale})`;
        particle.style.opacity = opacity;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            if (particle && particle.parentNode) {
                particle.remove();
            }
        }
    };
    
    container.appendChild(particle);
    requestAnimationFrame(animate);
}

// Effet de particules selon le rang
function createRankParticles(rankName) {
    const rankBadge = document.getElementById('currentRank');
    if (!rankBadge) return;
    
    const rect = rankBadge.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Déterminer la classe d'effet selon le rang
    const rankIndex = rankSystem.findIndex(r => r.name === rankName);
    let effectClass = 'rank-particles-low';
    let particleCount = 3;
    let colors = ['#00d4ff'];
    
    if (rankIndex >= 20) { // X, XX, XXX, EX, DX, INHUMAIN, DIVIN, INCONNU
        effectClass = 'rank-particles-legendary';
        particleCount = 20;
        colors = ['#FFD700', '#FF00FF', '#00FFFF', '#FF1493', '#00FF00'];
    } else if (rankIndex >= 13) { // UR à MR+
        effectClass = 'rank-particles-high';
        particleCount = 12;
        colors = ['#FF4500', '#FFD700', '#FF1493'];
    } else if (rankIndex >= 6) { // A à SSR+
        effectClass = 'rank-particles-mid';
        particleCount = 8;
        colors = ['#00CED1', '#1E90FF', '#9370DB'];
    }
    
    // Appliquer la classe au badge
    rankBadge.className = `rank-badge ${effectClass}`;
    
    // Créer les particules
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const angle = (Math.PI * 2 * i) / particleCount;
            const radius = 50 + Math.random() * 30;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 3 + Math.random() * 5;
            
            createParticle(x, y, color, size);
        }, i * 100);
    }
}

// Effet de particules pour les stats élevées
function createStatParticles(statName, value, maxValue = 100) {
    const statBar = document.getElementById(`${statName}Bar`);
    if (!statBar) return;
    
    const percentage = (value / maxValue) * 100;
    const rect = statBar.getBoundingClientRect();
    
    // Déterminer la classe d'effet
    let effectClass = '';
    let particleCount = 0;
    let color = getComputedStyle(statBar).backgroundColor;
    
    if (percentage >= 80) {
        effectClass = 'stat-high';
        particleCount = 5;
    } else if (percentage >= 50) {
        effectClass = 'stat-mid';
        particleCount = 3;
    }
    
    // Appliquer la classe
    const statItem = statBar.closest('.stat-item-detailed');
    if (statItem && effectClass) {
        statItem.classList.add(effectClass);
        
        // Créer quelques particules
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const x = rect.left + Math.random() * rect.width;
                const y = rect.top + rect.height / 2;
                createParticle(x, y, color, 4);
            }, i * 200);
        }
    }
}

// Effet sur le power level
function updatePowerLevelEffect(powerLevel) {
    const powerLevelEl = document.querySelector('.power-level');
    if (!powerLevelEl) return;
    
    powerLevelEl.classList.remove('power-level-high');
    
    if (powerLevel >= 400) {
        powerLevelEl.classList.add('power-level-high');
        
        // Créer des particules autour
        const rect = powerLevelEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const angle = Math.random() * Math.PI * 2;
                const radius = 50 + Math.random() * 50;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                const colors = ['#FFD700', '#FF00FF', '#00FFFF'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                createParticle(x, y, color, 6);
            }, i * 150);
        }
    }
}

// Effet lors du clic sur une checkbox
function createCheckboxParticles(checkbox) {
    const rect = checkbox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Explosion de particules
    for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        const x = centerX + Math.cos(angle) * 30;
        const y = centerY + Math.sin(angle) * 30;
        const colors = ['#00ff88', '#00d4ff', '#FFD700'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        createParticle(x, y, color, 4);
    }
}

// Fonction pour activer/désactiver la traînée de curseur
function enableCursorTrail(enabled) {
    cursorTrailEnabled = enabled;
}

document.addEventListener('mousemove', (e) => {
    if (!cursorTrailEnabled) return;
    
    const now = Date.now();
    if (now - lastCursorTime < 50) return; // Limiter la fréquence
    lastCursorTime = now;
    
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = e.pageX + 'px';
    trail.style.top = e.pageY + 'px';
    
    document.body.appendChild(trail);
    
    setTimeout(() => trail.remove(), 800);
});

// Activer la traînée de curseur pour les rangs élevés
function updateCursorTrailForRank(rankName) {
    const rankIndex = rankSystem.findIndex(r => r.name === rankName);
    enableCursorTrail(rankIndex >= 13); // UR+ et au-dessus
}

/* ========================================
   FIREBASE REAL-TIME LEADERBOARD
======================================== */

// Sauvegarder toutes les données utilisateur sur Firebase
async function saveAllUserDataToFirebase() {
    if (!window.firebaseDb || !window.firebaseAuth) {
        return;
    }
    
    const firebaseUser = window.firebaseAuth.currentUser;
    if (!firebaseUser) {
        return;
    }
    
    try {
        const userData = {
            username: currentUser,
            religion: localStorage.getItem('selectedReligion'),
            rank: getCurrentUserRank(),
            lastUpdated: new Date().toISOString(),
            
            // Données de progression
            habitHistory: JSON.parse(originalGetItem('habitHistory') || '{}'),
            rankProgressPoints: parseFloat(originalGetItem('rankProgressPoints') || '0'),
            currentRankIndex: parseInt(originalGetItem('currentRankIndex') || '0'),
            currentStreak: parseInt(originalGetItem('currentStreak') || '0'),
            bestStreak: parseInt(originalGetItem('bestStreak') || '0'),
            
            // Données des quêtes
            dailyQuests: JSON.parse(originalGetItem('dailyQuests') || '[]'),
            epicQuests: JSON.parse(originalGetItem('epicQuests') || '[]'),
            challenges: JSON.parse(originalGetItem('challenges') || '[]'),
            
            // Stats RPG
            stats: calculateStats(),
            
            // Métadonnées
            createdAt: getCurrentUserData('createdAt') || new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
        
        const userRef = window.firebaseDoc(window.firebaseDb, 'userData', firebaseUser.uid);
        await window.firebaseSetDoc(userRef, userData, { merge: true });
        console.log('✅ Toutes les données sauvegardées sur Firebase !');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde Firebase:', error);
        return false;
    }
}

// Restaurer les données utilisateur depuis Firebase
async function restoreUserDataFromFirebase(uid) {
    if (!window.firebaseDb || !uid) {
        return false;
    }
    
    try {
        const userRef = window.firebaseDoc(window.firebaseDb, 'userData', uid);
        const userDoc = await window.firebaseGetDoc(userRef);
        
        if (!userDoc.exists()) {
            console.log('Aucune donnée Firebase trouvée pour', uid);
            return false;
        }
        
        const userData = userDoc.data();
        console.log('📥 Restauration des données depuis Firebase...', userData);
        
        // Restaurer les données de progression
        if (userData.habitHistory) {
            originalSetItem('habitHistory', JSON.stringify(userData.habitHistory));
        }
        if (userData.rankProgressPoints !== undefined) {
            originalSetItem('rankProgressPoints', userData.rankProgressPoints.toString());
        }
        if (userData.currentRankIndex !== undefined) {
            originalSetItem('currentRankIndex', userData.currentRankIndex.toString());
        }
        if (userData.currentStreak !== undefined) {
            originalSetItem('currentStreak', userData.currentStreak.toString());
        }
        if (userData.bestStreak !== undefined) {
            originalSetItem('bestStreak', userData.bestStreak.toString());
        }
        
        // Restaurer les quêtes
        if (userData.dailyQuests) {
            originalSetItem('dailyQuests', JSON.stringify(userData.dailyQuests));
        }
        if (userData.epicQuests) {
            originalSetItem('epicQuests', JSON.stringify(userData.epicQuests));
        }
        if (userData.challenges) {
            originalSetItem('challenges', JSON.stringify(userData.challenges));
        }
        
        console.log('✅ Données restaurées depuis Firebase !');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la restauration Firebase:', error);
        return false;
    }
}

async function saveUserToFirebase(username, religion, rank) {
    if (!window.firebaseDb) {
        console.log('Firebase pas encore chargé...');
        return;
    }
    
    try {
        const userRef = window.firebaseDoc(window.firebaseDb, 'users', username);
        await window.firebaseSetDoc(userRef, {
            username: username,
            religion: religion,
            rank: rank,
            lastUpdated: new Date().toISOString()
        }, { merge: true });
        console.log('✅ Rang synchronisé sur Firebase !');
    } catch (error) {
        console.error('❌ Erreur Firebase:', error);
    }
}

// Variable pour stocker le listener Firebase et éviter les doublons
let firebaseLeaderboardUnsubscribe = null;

function displayFirebaseLeaderboard() {
    const container = document.getElementById('leaderboardList');
    if (!container || !window.firebaseDb) return;
    
    // Si un listener existe déjà, ne pas en créer un nouveau
    if (firebaseLeaderboardUnsubscribe) {
        console.log('Listener Firebase déjà actif, pas de nouveau listener');
        return;
    }
    
    const username = localStorage.getItem('username');
    
    const religionIcons = {
        islam: '☪️',
        christianity: '✝️',
        neutral: '🌟'
    };
    
    const usersCollection = window.firebaseCollection(window.firebaseDb, 'users');
    const q = window.firebaseQuery(usersCollection, window.firebaseOrderBy('lastUpdated', 'desc'));
    
    // Stocker la fonction de déconnexion
    firebaseLeaderboardUnsubscribe = window.firebaseOnSnapshot(q, (snapshot) => {
        const users = [];
        snapshot.forEach((doc) => {
            users.push(doc.data());
        });
        
        const rankValues = {};
        rankSystem.forEach((r, i) => rankValues[r.name] = i);
        users.sort((a, b) => rankValues[b.rank] - rankValues[a.rank]);
        
        container.innerHTML = '';
        
        if (users.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 30px; color: #666; font-size: 1.1em;">🔍 Aucun guerrier pour le moment...<br><br>Sois le premier à rejoindre le classement !</div>';
            return;
        }
        
        users.forEach((user, index) => {
            const rank = rankSystem.find(r => r.name === user.rank);
            const isMe = user.username === username;
            
            const userDiv = document.createElement('div');
            userDiv.className = 'leaderboard-item' + (isMe ? ' my-rank' : '');
            
            userDiv.innerHTML = `
                <div class="leaderboard-position">#${index + 1}</div>
                <div class="leaderboard-user">
                    <span class="leaderboard-icon">${religionIcons[user.religion] || '🌟'}</span>
                    <span class="leaderboard-username">${user.username}${isMe ? ' (TOI 👑)' : ''}</span>
                </div>
                <div class="leaderboard-rank" style="background: ${rank?.color || '#666'};">${user.rank}</div>
            `;
            
            container.appendChild(userDiv);
        });
    });
    
    console.log('✅ Listener Firebase créé pour le leaderboard');
}

function updateMyRankOnFirebase() {
    const username = localStorage.getItem('username');
    const religion = localStorage.getItem('selectedReligion');
    const rank = getCurrentUserRank();
    
    if (username && religion && rank) {
        saveUserToFirebase(username, religion, rank);
    }
}

/* ========================================
   INITIALISATION
======================================== */

// Attendre que Firebase soit chargé (une seule fois)
let firebaseInitDone = false;
setTimeout(() => {
    if (window.firebaseDb && !firebaseInitDone) {
        displayFirebaseLeaderboard();
        firebaseInitDone = true;
    }
}, 1000);

// Initialiser l'application au chargement
document.addEventListener('DOMContentLoaded', async function() {
    console.log('App starting...');
    
    // Récupérer l'IP de l'utilisateur au démarrage
    await getUserIP();
    if (userIP) {
        console.log('IP de l\'utilisateur:', userIP);
        // Vérifier si c'est un admin et afficher un message
        const adminMode = await isAdmin();
        if (adminMode) {
            console.log('🔑 Mode admin activé');
            // Afficher le bouton admin dans le header
            setTimeout(() => updateAdminButton(), 500);
        } else {
            console.log('💡 Pour activer l\'admin, ajoutez votre IP dans ADMIN_IPS:', userIP);
        }
    }
    
    // Attendre que Firebase Auth soit chargé
    if (!window.firebaseAuth) {
        setTimeout(() => {
            if (window.firebaseAuth) {
                initAuth();
            } else {
                console.error('Firebase Auth non disponible');
                showLoginScreen();
            }
        }, 1000);
    } else {
        initAuth();
    }
});

// Initialiser l'authentification
function initAuth() {
    // Vérifier si Firebase Auth est disponible
    if (!window.firebaseAuth || !window.firebaseOnAuthStateChanged) {
        console.log('⚠️ Firebase Auth non disponible, utilisation du système local');
        // Vérifier s'il y a un utilisateur local sauvegardé
        const savedCurrentUser = localStorage.getItem('currentUser');
        const savedUsername = localStorage.getItem('username');
        const savedReligion = localStorage.getItem('selectedReligion');
        
        const username = savedCurrentUser || savedUsername;
        
        if (username && savedReligion) {
            // Utilisateur local trouvé, charger l'app
            currentUser = username;
            currentConfig = religionConfigs[savedReligion];
            
            if (currentConfig) {
                habits = currentConfig.habits;
                const loginOverlay = document.getElementById('loginOverlay');
                if (loginOverlay) {
                    loginOverlay.remove();
                }
                
                // Restaurer les données depuis Firebase si disponible
                const firebaseUID = localStorage.getItem('firebaseUID');
                if (firebaseUID && window.firebaseDb) {
                    restoreUserDataFromFirebase(firebaseUID).then(() => {
                        initApp();
                    });
                } else {
                    initApp();
                }
                return;
            }
        }
        
        // Aucun utilisateur local, afficher le login
        showLoginScreen();
        return;
    }
    
    // Écouter les changements d'état d'authentification Firebase
    window.firebaseOnAuthStateChanged(window.firebaseAuth, async (firebaseUser) => {
        if (firebaseUser) {
            // Utilisateur connecté
            console.log('✅ Utilisateur connecté:', firebaseUser.email);
            
            // Récupérer les données utilisateur depuis Firestore
            try {
                const userRef = window.firebaseDoc(window.firebaseDb, 'users', firebaseUser.uid);
                const userDoc = await window.firebaseGetDoc(userRef);
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const username = userData.username;
                    const religion = userData.religion;
                    
                    // Sauvegarder dans localStorage pour compatibilité
                    localStorage.setItem('currentUser', username);
                    localStorage.setItem('username', username);
                    localStorage.setItem('selectedReligion', religion);
                    localStorage.setItem('firebaseUID', firebaseUser.uid);
                    
                    currentUser = username;
                    currentConfig = religionConfigs[religion];
                    
                    if (!currentConfig) {
                        console.error('Config not found for religion:', religion);
                        showLoginScreen();
                        return;
                    }
                    
                    habits = currentConfig.habits;
                    
                    // Fermer l'overlay de login s'il existe
                    const loginOverlay = document.getElementById('loginOverlay');
                    if (loginOverlay) {
                        loginOverlay.remove();
                    }
                    
                    // Restaurer les données depuis Firebase
                    await restoreUserDataFromFirebase(firebaseUser.uid);
                    
                    // Initialiser l'app
                    initApp();
                } else {
                    console.error('Données utilisateur non trouvées');
                    showLoginScreen();
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
                showLoginScreen();
            }
        } else {
            // Utilisateur non connecté - vérifier le système local
            const savedCurrentUser = localStorage.getItem('currentUser');
            const savedUsername = localStorage.getItem('username');
            const savedReligion = localStorage.getItem('selectedReligion');
            
            const username = savedCurrentUser || savedUsername;
            
            if (username && savedReligion) {
                // Utilisateur local trouvé
                currentUser = username;
                currentConfig = religionConfigs[savedReligion];
                
                if (currentConfig) {
                    habits = currentConfig.habits;
                    const loginOverlay = document.getElementById('loginOverlay');
                    if (loginOverlay) {
                        loginOverlay.remove();
                    }
                    
                    // Restaurer les données depuis Firebase si disponible
                    const firebaseUID = localStorage.getItem('firebaseUID');
                    if (firebaseUID && window.firebaseDb) {
                        await restoreUserDataFromFirebase(firebaseUID);
                    }
                    
                    initApp();
                    return;
                }
            }
            
            // Aucun utilisateur, afficher le login
            console.log('❌ Aucun utilisateur connecté');
            showLoginScreen();
        }
    });
}

// Fonction pour afficher/masquer le bouton admin dans le header
async function updateAdminButton() {
    const adminButton = document.getElementById('adminButton');
    if (!adminButton) return;
    
    const adminMode = await isAdmin();
    if (adminMode) {
        adminButton.style.display = 'flex';
        console.log('✅ Bouton admin affiché dans le header');
    } else {
        adminButton.style.display = 'none';
    }
}

function initApp() {
    updateDate();
    loadHabits();
    updateProgress(); // Met à jour la progression et le rang en temps réel
    updateStatsDisplay();
    updateRankSystem();
    calculateStats();
    initDailyQuests();
    displayDailyQuests();
    updateQuestTimer();
    
    // Nouvelles fonctionnalités
    displayEpicQuests();
    displayChallenges();
    
    // Vérifier et afficher le bouton admin
    updateAdminButton();
    
    // Afficher le bouton de déconnexion
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.style.display = 'flex';
    }
    
    // Mettre à jour le timer toutes les secondes
    setInterval(updateQuestTimer, 1000);
    
    // Recréer les particules de rang toutes les 5 secondes
    setInterval(() => {
        const currentRankEl = document.getElementById('currentRank');
        if (currentRankEl) {
            createRankParticles(currentRankEl.textContent);
        }
    }, 5000);
    
    // Sauvegarder automatiquement toutes les données sur Firebase toutes les 30 secondes
    if (window.firebaseDb && currentUser) {
        setInterval(() => {
            saveAllUserDataToFirebase().catch(err => console.error('Erreur sauvegarde auto:', err));
        }, 30000); // Toutes les 30 secondes
    }
    
    // Sauvegarder aussi quand l'utilisateur quitte la page
    window.addEventListener('beforeunload', () => {
        if (currentUser && window.firebaseDb) {
            // Utiliser sendBeacon pour une sauvegarde synchrone
            saveAllUserDataToFirebase();
        }
    });
    
    // Afficher le leaderboard Firebase (seulement si pas déjà initialisé)
    if (window.firebaseDb && !firebaseInitDone) {
        displayFirebaseLeaderboard();
        firebaseInitDone = true;
    }
    
    // Afficher la page quotidien par défaut
    showPage('daily');
}

