/* ========================================
   CONFIGURATION DE BASE
======================================== */

// Flag pour éviter l'initialisation multiple de l'application
let appInitialized = false;

// Fonctions de stockage de base (utilise directement localStorage)
const originalGetItem = (key) => {
    return localStorage.getItem(key);
};

const originalSetItem = (key, value) => {
    localStorage.setItem(key, value);
};

// Fonctions getAllUsers et saveAllUsers supprimées - utilisation exclusive de Firebase Firestore

// Configurations par religion
const religionConfigs = {
    santeoptimale: {
        name: 'Santé Optimale',
        icon: '💪',
        habits: [
            // SANTÉ PHYSIQUE - Base
            'sommeil-optimal', 'alimentation-animal', 'musculation',
            'marche-matinale', 'douche-froide',
            
            // HYGIÈNE AVANCÉE
            'brossage-matin', 'brossage-soir', 'routine-cheveux', 'routine-corps',
            'ongles', 'rasage',
            
            // NUTRITION
            'programme-nutrition',
            
            // ENVIRONNEMENT SOMMEIL
            'environnement-sommeil',
            
            // MENTAL - SOCIAL
            'socialisation', 'gestion-stress', 'decisions-optimal',
            'meditation-matin'
        ],
        habitLabels: {
            'sommeil-optimal': 'Sommeil 8h (23h-00h) - Obscurité totale, pas de lumière bleue 1h avant',
            'alimentation-animal': 'Alimentation animal based - Produits bruts, fruits, laitiers, viande rouge',
            'musculation': 'Entraînement musculation salle de sport',
            'marche-matinale': 'Marche 30min au lever du soleil (horloge circadienne)',
            'douche-froide': 'Douche froide - Hygiène naturelle sans produits toxiques',
            'brossage-matin': 'Brossage de dents - Matin',
            'brossage-soir': 'Brossage de dents - Soir',
            'routine-cheveux': 'Routine cheveux : Huile coco + huile olive + jaune oeuf + miel cru',
            'routine-corps': 'Routine corps : Beef tallow / beurre karité / miel / eau seule',
            'programme-nutrition': '🥩 Programme nutritionnel complet - 5 repas journaliers',
            'environnement-sommeil': 'Environnement sommeil optimal : Matelas, draps, coussins naturels',
            'socialisation': 'Socialiser sans honte - Parler aux gens sans gêne',
            'gestion-stress': 'Stress 0 - Gestion complète du stress',
            'decisions-optimal': 'Prise de décision optimale - Bénéfique long terme = FAIRE MAINTENANT',
            'meditation-matin': 'Méditation & gratitude quotidienne'
        },
        categoryIcons: {
            physical: '🏋️',
            hygiene: '🛁',
            nutrition: '🥩',
            environment: '🌙',
            mental: '🧠'
        },
        categoryNames: {
            physical: 'Santé Physique',
            hygiene: 'Hygiène Avancée',
            nutrition: 'Nutrition & Micronutriments',
            environment: 'Environnement Optimal',
            mental: 'Mental & Social'
        }
    },
    islam: {
        name: 'Islam',
        icon: '☪️',
        habits: [
            'sommeil', 'proteines', 'entrainement-foot',
            'douche-apres-entrainement',
            'brossage-matin', 'brossage-soir',
            'ongles', 'rasage',
            'fajr', 'dhuhr', 'asr', 'maghrib', 'isha',
            'peches', 'argent'
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
            ethics: 'Mental'
        }
    },
    christianity: {
        name: 'Christianisme',
        icon: '✝️',
        habits: [
            'sommeil', 'proteines', 'entrainement-foot',
            'douche-apres-entrainement',
            'brossage-matin', 'brossage-soir',
            'ongles', 'rasage',
            'priere-matin', 'priere-midi', 'priere-soir', 'priere-repas', 'priere-nuit',
            'commandements', 'argent'
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
            ethics: 'Mental'
        }
    },
    neutral: {
        name: 'Neutre',
        icon: '🌟',
        habits: [
            'sommeil', 'proteines', 'entrainement-foot',
            'douche-apres-entrainement',
            'brossage-matin', 'brossage-soir',
            'ongles', 'rasage',
            'meditation-matin', 'meditation-midi', 'meditation-soir', 'gratitude', 'journal',
            'ethique', 'argent'
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
    // Habitudes existantes
    'proteines': 'str',
    'entrainement-foot': 'str',
    'sommeil': 'hp',
    'douche-apres-entrainement': 'hp',
    'brossage-matin': 'end',
    'brossage-soir': 'end',
    'ongles': 'men',
    'rasage': 'men',
    'argent': 'dis',
    
    // NOUVELLES HABITUDES SANTÉ OPTIMALE
    'sommeil-optimal': 'hp',
    'alimentation-animal': 'str',
    'musculation': 'str',
    'marche-matinale': 'hp',
    'douche-froide': 'hp',
    'routine-cheveux': 'end',
    'routine-corps': 'end',
    'routine-dents': 'end',
    'programme-nutrition': 'str',
    'environnement-sommeil': 'hp',
    'masque-yeux': 'hp',
    'bruit-blanc': 'hp',
    'socialisation': 'men',
    'gestion-stress': 'men',
    'decisions-optimal': 'dis'
};

const spiritualStatMapping = {
    // Islam
    'fajr': 'spi', 'dhuhr': 'spi', 'asr': 'spi', 'maghrib': 'spi', 'isha': 'spi',
    'peches': 'spi',
    // Christianity
    'priere-matin': 'spi', 'priere-midi': 'spi', 'priere-soir': 'spi', 
    'priere-repas': 'spi', 'priere-nuit': 'spi',
    'commandements': 'spi',
    // Neutral + Santé Optimale
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

// Système de particules pour la page des stats
let statsParticlesInterval = null;

// Flag pour éviter l'initialisation multiple du leaderboard Firebase
let firebaseInitDone = false;

/* ========================================
   FONCTIONS UTILITAIRES
======================================== */

/* ========================================
   SYSTÈME DE PRIÈRES (Islam)
======================================== */

const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

function getPrayerProgress() {
    return JSON.parse(originalGetItem('prayerProgress') || '{}');
}

function savePrayerProgress(progress) {
    originalSetItem('prayerProgress', JSON.stringify(progress));
}

function isPrayerCompleted(prayerId) {
    const progress = getPrayerProgress();
    return progress[prayerId] === true;
}

function markPrayerCompleted(prayerId) {
    const progress = getPrayerProgress();
    progress[prayerId] = true;
    savePrayerProgress(progress);
    
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

// Fonction loadReligionConfig supprimée - la configuration est chargée depuis Firebase lors de la connexion

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function updateDate() {
    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = today.toLocaleDateString('fr-FR', options);
    }
}

// Fonction getYesterdayDate supprimée - utilisation directe de la date

// Obtenir le jour de la semaine (0 = dimanche, 6 = samedi)
function getDayOfWeek() {
    return new Date().getDay();
}

/* ========================================
   SYSTÈME DE PRIÈRES (Islam)
======================================== */

function updatePrayerProgress() {
    if (currentConfig?.name !== 'Islam') return;
    
    const today = getTodayDate();
    const progress = getPrayerProgress();
    const history = JSON.parse(originalGetItem('habitHistory') || '{}');
    
    // Initialiser si nécessaire
    if (!progress.lastUpdateDate) {
        progress.lastUpdateDate = today;
        progress.fajrStreak = 0;
        progress.dhuhrStreak = 0;
        progress.asrStreak = 0;
        progress.maghribStreak = 0;
        progress.ishaStreak = 0;
    }
    
    // Si c'est un nouveau jour, mettre à jour les streaks
    if (progress.lastUpdateDate !== today) {
        const yesterday = getYesterdayDate();
        const yesterdayHabits = history[yesterday]?.habits || {};
        
        // Mettre à jour les streaks basé sur hier
        if (yesterdayHabits['fajr']) {
            progress.fajrStreak = (progress.fajrStreak || 0) + 1;
        } else {
            progress.fajrStreak = 0;
        }
        
        if (yesterdayHabits['dhuhr']) {
            progress.dhuhrStreak = (progress.dhuhrStreak || 0) + 1;
        } else {
            progress.dhuhrStreak = 0;
        }
        
        if (yesterdayHabits['asr']) {
            progress.asrStreak = (progress.asrStreak || 0) + 1;
        } else {
            progress.asrStreak = 0;
        }
        
        if (yesterdayHabits['maghrib']) {
            progress.maghribStreak = (progress.maghribStreak || 0) + 1;
        } else {
            progress.maghribStreak = 0;
        }
        
        if (yesterdayHabits['isha']) {
            progress.ishaStreak = (progress.ishaStreak || 0) + 1;
        } else {
            progress.ishaStreak = 0;
        }
        
        progress.lastUpdateDate = today;
        savePrayerProgress(progress);
    }
}

function getYesterdayDate() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function showLockedMessage(deadline) {
    // Afficher un message temporaire
    const existingMsg = document.querySelector('.locked-message');
    if (existingMsg) existingMsg.remove();
    
    const msg = document.createElement('div');
    msg.className = 'locked-message';
    msg.innerHTML = `🔒 Trop tard ! Cette tâche était à faire avant ${deadline}h. Reviens demain pour réessayer !`;
    msg.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #ff4444, #cc0000);
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        font-weight: bold;
        font-size: 0.9em;
        z-index: 10000;
        box-shadow: 0 5px 25px rgba(255, 68, 68, 0.5);
        animation: slideUp 0.3s ease;
        max-width: 90%;
        text-align: center;
    `;
    
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => msg.remove(), 300);
    }, 3000);
}

/* ========================================
   SYSTÈME DE CITATIONS MOTIVANTES
======================================== */

const motivationalQuotes = [
    // Pensées spirituelles / Dieu
    "Pense à comment Dieu te voit en ce moment. Rends-le fier. 🙏",
    "Chaque effort que tu fais, Dieu le voit. Continue. ✨",
    "Tu veux que Dieu soit fier de toi ? Alors lève-toi et agis. 💪",
    "Dieu t'a donné ce jour. Ne le gaspille pas. ⚡",
    
    // Famille / Mère
    "Pense au moment où ta mère sera fière de toi quand t'auras la richesse. 👩‍👦",
    "Ta mère a sacrifié sa vie pour toi. Honore-la par tes actions. ❤️",
    "Imagine le sourire de ta mère quand tu réussiras. Travaille pour ça. 🌟",
    "Un jour, tu pourras lui offrir tout ce qu'elle mérite. Continue. 💎",
    
    // Toi petit / Version future
    "Pense à toi petit. Qu'est-ce qu'il dirait de toi aujourd'hui ? 👦",
    "Le petit garçon que tu étais rêvait de devenir quelqu'un. Deviens-le. 🚀",
    "Ton toi du futur te remercie pour chaque effort d'aujourd'hui. ⏳",
    "Dans 5 ans, tu seras content d'avoir commencé aujourd'hui. 📈",
    
    // Discipline / Guerre intérieure
    "La discipline bat le talent quand le talent n'est pas discipliné. 🔥",
    "Tu es en guerre contre toi-même. Qui va gagner aujourd'hui ? ⚔️",
    "Les excuses ne construisent pas des empires. L'action, oui. 👑",
    "Pendant que tu hésites, quelqu'un d'autre travaille. 💀",
    
    // Richesse / Succès
    "La richesse ne vient pas à ceux qui dorment. Réveille-toi. 💰",
    "Chaque tâche cochée te rapproche de la vie que tu mérites. ✅",
    "Les winners font ce que les losers refusent de faire. 🏆",
    "Tu veux le lifestyle ? Alors assume le grind. 🔄",
    
    // Moment présent
    "Aujourd'hui est le jour où tu changes ta vie. Pas demain. AUJOURD'HUI. ⚡",
    "Ce moment de flemme va passer. Le regret, lui, reste. 😤",
    "Arrête de réfléchir. Agis. Maintenant. 🎯",
    "Chaque jour sans effort est un jour perdu. Ne perds plus de temps. ⏰"
];

function updateMotivationQuote() {
    const quoteElement = document.getElementById('motivationQuote');
    if (!quoteElement) return;
    
    // Utiliser la date du jour comme seed pour avoir la même citation toute la journée
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % motivationalQuotes.length;
    
    quoteElement.textContent = motivationalQuotes[index];
}

// Changer la citation au clic
function initMotivationQuote() {
    const quoteElement = document.getElementById('motivationQuote');
    if (!quoteElement) return;
    
    updateMotivationQuote();
    
    // Permettre de changer la citation en cliquant dessus
    quoteElement.style.cursor = 'pointer';
    quoteElement.title = 'Clique pour une autre citation';
    quoteElement.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        quoteElement.textContent = motivationalQuotes[randomIndex];
        quoteElement.style.animation = 'none';
        setTimeout(() => {
            quoteElement.style.animation = 'quoteFlash 0.5s ease';
        }, 10);
    });
}

/* ========================================
   SYSTÈME DE NOTIFICATIONS
======================================== */

async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Ce navigateur ne supporte pas les notifications');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    return false;
}

function sendNotification(title, body, icon = '🔥') {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'rpg-tracker',
            requireInteraction: false
        });
    }
}

function scheduleNotifications() {
    // Vérifier toutes les minutes
    setInterval(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        // Notification du matin à 6h00
        if (hours === 6 && minutes === 0) {
            sendNotification(
                "🌅 C'est l'heure !",
                "Réveille-toi guerrier ! C'est le moment de commencer fort ta journée."
            );
        }
        
        // Notification midi à 12h00
        if (hours === 12 && minutes === 0) {
            sendNotification(
                "☀️ Check du midi",
                "As-tu fait toutes tes tâches du matin ? Il est encore temps !"
            );
        }
        
        // Notification soir à 20h00
        if (hours === 20 && minutes === 0) {
            sendNotification(
                "🌙 Bilan du soir",
                "La journée touche à sa fin. As-tu tout validé ? Finis en beauté !"
            );
        }
        
        // ⚠️ RAPPEL SOMMEIL : 21h30 - Couper les écrans et préparer le coucher
        if (hours === 21 && minutes === 30) {
            sendNotification(
                "😴 Prépare-toi à dormir !",
                "Dans 30 min c'est dodo ! Coupe les écrans maintenant, prépare-toi pour être au lit à 22h."
            );
        }
        
        // Notification 22h00 - Heure du coucher
        if (hours === 22 && minutes === 0) {
            sendNotification(
                "🛏️ AU LIT MAINTENANT !",
                "C'est 22h ! Pose le téléphone et dors. Objectif : levé à 6h demain. 💪"
            );
        }
    }, 60000); // Check toutes les 60 secondes
}

async function initNotifications() {
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
        console.log('✅ Notifications activées');
        scheduleNotifications();
    } else {
        console.log('❌ Notifications refusées ou non supportées');
    }
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
    // Cycle: auto -> light -> dark -> auto
    let newTheme;
    if (currentTheme === 'auto' || !currentTheme) {
        newTheme = 'light';
    } else if (currentTheme === 'light') {
        newTheme = 'dark';
    } else {
        newTheme = 'auto';
    }
    
    originalSetItem('theme', newTheme);
    applyTheme(newTheme);
    updateThemeButton(newTheme);
    playSound('click');
}

function getAutoTheme() {
    const hour = new Date().getHours();
    // Mode sombre de 20h à 7h
    if (hour >= 20 || hour < 7) {
        return 'dark';
    }
    return 'light';
}

function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'auto') {
        const autoTheme = getAutoTheme();
        html.setAttribute('data-theme', autoTheme);
        html.setAttribute('data-theme-mode', 'auto');
    } else {
        html.setAttribute('data-theme', theme);
        html.setAttribute('data-theme-mode', 'manual');
    }
}

function updateThemeButton(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    
    if (theme === 'auto') {
        btn.textContent = '🔄';
        btn.title = 'Thème auto (selon l\'heure)';
    } else if (theme === 'light') {
        btn.textContent = '☀️';
        btn.title = 'Thème clair';
    } else {
        btn.textContent = '🌙';
        btn.title = 'Thème sombre';
    }
}

function loadTheme() {
    const savedTheme = originalGetItem('theme') || 'auto';
    applyTheme(savedTheme);
    updateThemeButton(savedTheme);
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
        if (checkbox) {
            history[today].habits[habit] = checkbox.checked;
        }
    });
    
    originalSetItem('habitHistory', JSON.stringify(history));
}

function loadHabits() {
    const today = getTodayDate();
    const history = JSON.parse(originalGetItem('habitHistory') || '{}');
    
    if (history[today] && history[today].habits) {
        habits.forEach(habit => {
            const checkbox = document.getElementById(habit);
            // Vérifier que le checkbox existe avant de définir sa propriété
            if (checkbox) {
            checkbox.checked = history[today].habits[habit] || false;
            }
        });
    }
}

function updateProgress() {
    let completed = 0;
    habits.forEach(habit => {
        const checkbox = document.getElementById(habit);
        if (checkbox && checkbox.checked) {
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
    if (value >= 30000) return { rank: 'X', class: 'rank-x' };
    if (value >= 10000) return { rank: 'MR', class: 'rank-mr' };
    if (value >= 8000) return { rank: 'UR', class: 'rank-ur' };
    if (value >= 4000) return { rank: 'LR', class: 'rank-lr' };
    if (value >= 2000) return { rank: 'SSR', class: 'rank-ssr' };
    if (value >= 1000) return { rank: 'SR', class: 'rank-sr' };
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
    let rendered = 0;
    habits.forEach(habit => {
        const el = document.getElementById(habit);
        if (!el) return;
        rendered++;
        if (el.checked) {
            completed++;
        }
    });
    const todayPerfect = rendered > 0 && completed === rendered;
    
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
    
    window.addEventListener('resize', function() {
        updateStatsDisplay();
    });
}

// Fonction pour obtenir les détails HTML d'une habitude
function getHabitDetailsHTML(habitId) {
    const details = {
        'sommeil-optimal': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">🌙 PROTOCOLE SOMMEIL OPTIMAL</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">✅ <strong>Timing:</strong> Se coucher entre 23h et 00h</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Durée:</strong> Exactement 8 heures de sommeil</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Lumière bleue:</strong> Aucun écran 1h avant le coucher</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Obscurité:</strong> Pièce totalement noire (masque yeux recommandé)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Température:</strong> 18-19°C idéal</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Bruit blanc:</strong> Ventilateur ou machine à bruit blanc</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Digestion:</strong> Dernier repas 3h avant le coucher</li>
                </ul>
                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    💡 Le sommeil est la base de la récupération musculaire et hormonale.
                </p>
            </div>
        `,
        'alimentation-animal': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">🥩 ALIMENTATION ANIMAL BASED</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">✅ <strong>Produits bruts:</strong> Pas de transformés industriels</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Viande rouge:</strong> Bœuf, agneau, cheval (grass-fed si possible)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Abats:</strong> Foie, rognons, cœur (nutriments denses)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Fruits:</strong> Bananes, pommes, baies, fruits de saison</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Laitiers:</strong> Fromage, beurre, crème (entiers et crus si possible)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Œufs:</strong> Entiers, jaune compris (nutriments dans le jaune)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>À éviter:</strong> Graines, huiles végétales, céréales, sucre raffiné</li>
                </ul>
                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    💡 Focus sur les nutriments bio-disponibles et la biodisponibilité.
                </p>
            </div>
        `,
        'musculation': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">🏋️‍♂️ PROTOCOLE MUSCULATION</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">✅ <strong>Échauffement:</strong> 5-10 min cardio léger + mobilité</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Exercices composés:</strong> Squat, Soulevé de terre, Développé couché</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Séries:</strong> 3-5 séries de 5-8 répétitions</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Récupération:</strong> 2-3 min entre séries</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Progression:</strong> Augmenter poids chaque semaine</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Split suggéré:</strong> Haut du corps / Bas du corps</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Intensité:</strong> À 1-2 reps de l'échec</li>
                </ul>
                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    💡 La progression linéaire est la clé de la force.
                </p>
            </div>
        `,
        'marche-matinale': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">🌅 MARCHE MATINALE - HORLOGE CIRCADIENNE</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">✅ <strong>Timing:</strong> Dans les 30 min après le lever du soleil</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Durée:</strong> Minimum 10 minutes</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Lieu:</strong> Extérieur, regarder vers le soleil</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Lumière:</strong> Pas de lunettes de soleil (capteurs oculaires)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Rythme:</strong> Modéré, respiration profonde</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Pieds nus:</strong> Si possible sur terre/grass (grounding)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Bénéfices:</strong> Cortisol matinal, régulation du sommeil</li>
                </ul>
                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    💡 La lumière du matin ancre ton rythme circadien pour la journée.
                </p>
            </div>
        `,
        'douche-froide': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">🚿 PROTOCOLE DOUCHE FROIDE</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">✅ <strong>Progression:</strong> Commencer par 30 secondes froid</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Objectif:</strong> 3-5 minutes sous eau froide</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Température:</strong> La plus froide possible</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Respiration:</strong> Respirations profondes, ne pas hyperventiler</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Mouvement:</strong> Bouger sous l'eau (mieux que statique)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Bénéfices:</strong> Noradrénaline, dopamine, récupération</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Savon:</strong> Naturel, sans produits chimiques</li>
                </ul>
                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    💡 La douche froide est un exercice de résilience mentale autant que physique.
                </p>
            </div>
        `,
        'routine-cheveux': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">💇‍♂️ ROUTINE CHEVEUX NATURELLE</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">✅ <strong>Recette:</strong> Huile coco + huile olive + jaune d'œuf + miel cru</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Proportions:</strong> 2 cuillères coco, 1 olive, 1 jaune, 1 miel</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Application:</strong> Racines jusqu'aux pointes</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Temps:</strong> Laisser poser 30 min à 2h</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Rinçage:</strong> À l'eau tiède, pas chaude</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Fréquence:</strong> 1-2 fois par semaine</li>
                    <li style="margin-bottom: 8px;">✅ <strong>À éviter:</strong> Shampoings industriels avec sulfates</li>
                </ul>
                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    💡 Les lipides naturels nourrissent le cuir chevelu sans le dessécher.
                </p>
            </div>
        `,
        'routine-corps': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">🧴 ROUTINE CORPS NATURELLE</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">✅ <strong>Option 1 - Tallow:</strong> Beef tallow (gras de bœuf rendu)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Option 2 - Karité:</strong> Beurre de karité pur et brut</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Option 3 - Miel:</strong> Miel cru (hydratant naturel)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Option 4 - Minimaliste:</strong> Eau seule (pH naturel de la peau)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Application:</strong> Après douche sur peau encore humide</li>
                    <li style="margin-bottom: 8px;">✅ <strong>À éviter:</strong> Savons industriels, déodorants aluminium</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Parfum:</strong> Huiles essentielles naturelles si besoin</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Peau:</strong> Laisser respirer, pas de vêtements synthétiques</li>
                </ul>
                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    💡 La peau est un organe absorbant - pas de produits toxiques.
                </p>
            </div>
        `,
        'routine-dents': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">🦷 ROUTINE DENTAIRE NATURELLE</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">✅ <strong>Huile de coco:</strong> 1 cuillère à café, brossage 2-3 min</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Siwak/Miswak:</strong> Branche naturelle d'arak (brossage traditionnel)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Fil dentaire:</strong> Soie dentaire naturelle (pas de plastique)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Rinçage:</strong> Eau tiède + sel de mer (antibactérien)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>À éviter:</strong> Dentifrices fluorés, alcools buccaux</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Fréquence:</strong> Matin et soir minimum</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Bonus:</strong> Oil pulling (huile de coco) 10 min le matin</li>
                </ul>
                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    💡 La microbiome buccal est la porte d'entrée de la santé digestive.
                </p>
            </div>
        `,
        'programme-nutrition': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">🥩 PROGRAMME NUTRITIONNEL COMPLET</h4>
                <div style="margin-bottom: 15px;">
                    <h5 style="color: #ffd700; margin-bottom: 8px;">🌅 MATIN</h5>
                    <ul style="list-style: none; padding-left: 10px;">
                        <li style="margin-bottom: 5px;">• Kéfir/lait 400-500 ml</li>
                        <li style="margin-bottom: 5px;">• 2-3 bananes</li>
                        <li style="margin-bottom: 5px;">• Kiwi/baies</li>
                        <li style="margin-bottom: 5px;">• 2 jaunes d'œuf</li>
                    </ul>
                </div>
                <div style="margin-bottom: 15px;">
                    <h5 style="color: #ffd700; margin-bottom: 8px;">🍳 BRUNCH</h5>
                    <ul style="list-style: none; padding-left: 10px;">
                        <li style="margin-bottom: 5px;">• 3-4 œufs</li>
                        <li style="margin-bottom: 5px;">• 250-300 g steak (ou mélange haché)</li>
                        <li style="margin-bottom: 5px;">• Fromage 80-100 g</li>
                        <li style="margin-bottom: 5px;">• ½ avocat</li>
                    </ul>
                </div>
                <div style="margin-bottom: 15px;">
                    <h5 style="color: #ffd700; margin-bottom: 8px;">🍽️ DÉJEUNER</h5>
                    <ul style="list-style: none; padding-left: 10px;">
                        <li style="margin-bottom: 5px;">• Steak 200-250 g</li>
                        <li style="margin-bottom: 5px;">• Fromage</li>
                        <li style="margin-bottom: 5px;">• Fruits</li>
                        <li style="margin-bottom: 5px;">• ½ avocat</li>
                        <li style="margin-bottom: 5px;">• Sardines 1x/semaine</li>
                    </ul>
                </div>
                <div style="margin-bottom: 15px;">
                    <h5 style="color: #ffd700; margin-bottom: 8px;">💪 COLLATION POST-MUSCU</h5>
                    <ul style="list-style: none; padding-left: 10px;">
                        <li style="margin-bottom: 5px;">• Kéfir 300 ml</li>
                        <li style="margin-bottom: 5px;">• 1-2 bananes</li>
                        <li style="margin-bottom: 5px;">• Eau de coco</li>
                    </ul>
                </div>
                <div style="margin-bottom: 15px;">
                    <h5 style="color: #ffd700; margin-bottom: 8px;">🌙 DÎNER</h5>
                    <ul style="list-style: none; padding-left: 10px;">
                        <li style="margin-bottom: 5px;">• Steak 250-350 g</li>
                        <li style="margin-bottom: 5px;">• Fromage</li>
                        <li style="margin-bottom: 5px;">• Banane/kiwi/baies</li>
                        <li style="margin-bottom: 5px;">• Éventuellement 20 g chocolat noir 2-3x/semaine</li>
                    </ul>
                </div>
                <p style="margin-top: 15px; color: #aaa; font-size: 0.9em;">
                    💡 Animal-based : produits bruts, fruits, laitiers, viande rouge. Privilégier le local et le saisonnier.
                </p>
            </div>
        `,
        'socialisation': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">🗣️ SOCIALISATION SANS HONTE</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">✅ <strong>Approche:</strong> Parler à au moins 1 inconnu par jour</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Contexte:</strong> Rue, magasin, transports, café</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Mindset:</strong> Tout le monde est concentré sur soi</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Technique:</strong> Commentaire sur l'environnement</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Langage corporel:</strong> Épaules ouvertes, eye contact</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Rejet:</strong> Ne pas le prendre personnellement</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Progression:</strong> Commencer par des interactions courtes</li>
                </ul>
                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    💡 La confiance sociale s'acquiert par la pratique, pas la théorie.
                </p>
            </div>
        `,
        'gestion-stress': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">🧘 GESTION DU STRESS - ZÉRO</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">✅ <strong>Respiration:</strong> 4-7-8 (inspire 4s, retiens 7s, expire 8s)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Box breathing:</strong> 4s chaque phase x 5 cycles</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Physiologique:</strong> Double expiration active (sighing)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Physique:</strong> Exercice quand stress monte (cortisol)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Nature:</strong> 10 min dans la nature = cortisol ↓</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Digital:</strong> Pas de téléphone au réveil et coucher</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Mindset:</strong> Accepter ce qu'on ne contrôle pas</li>
                </ul>
                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    💡 Le stress chronique détruit la testostérone et la récupération.
                </p>
            </div>
        `,
        'decisions-optimal': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">🎯 PRISE DE DÉCISION OPTIMALE</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">✅ <strong>Règle d'or:</strong> Bénéfique long terme = FAIRE MAINTENANT</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Inverse:</strong> Mauvais long terme = ÉVITER</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Questions:</strong> "Mon futur moi me remerciera ?"</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Plaisir court:</strong> TikTok, fast-food, procrastination → NON</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Discipline:</strong> Court difficile = Long gratifiant</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Priorités:</strong> Santé, relations, croissance personnelle</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Instantané:</strong> Pas de "je commence demain"</li>
                </ul>
                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    💡 Chaque décision te rapproche ou t'éloigne de la version ultime de toi-même.
                </p>
            </div>
        `,
        'environnement-sommeil': `
            <div class="habit-details-section">
                <h4 style="color: #00d9ff; margin-bottom: 10px;">🏠 ENVIRONNEMENT SOMMEIL OPTIMAL</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 8px;">✅ <strong>Matelas:</strong> Latex naturel ou mousse bio (pas mémoire chimique)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Draps:</strong> Coton bio, lin, ou bambou (respirant)</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Coussins:</strong> Sarrasin, latex naturel, ou kapok</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Literie:</strong> Changer tout les 1-2 ans max</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Air:</strong> Ventilation ou purificateur d'air</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Électromagnétique:</strong> Pas de téléphone près du lit</li>
                    <li style="margin-bottom: 8px;">✅ <strong>Température:</strong> 18-19°C, humidité 40-60%</li>
                </ul>
                <p style="margin-top: 10px; color: #aaa; font-size: 0.9em;">
                    💡 On passe 1/3 de sa vie au lit - investissement prioritaire.
                </p>
            </div>
        `
    };
    
    return details[habitId] || null;
}

function generateHabitsHTML() {
    const container = document.getElementById('habitsContainer');
    if (!container || !currentConfig) return;
    
    container.innerHTML = '';
    
    // Catégories organisées chronologiquement pour configurations existantes
    let morningSpiritual = [];
    let middaySpiritual = [];
    let eveningSpiritual = [];
    let ethicsHabit = [];
    
    if (currentConfig.name === 'Islam') {
        // Toutes les prières sont toujours disponibles
        morningSpiritual = ['fajr'];
        middaySpiritual = ['dhuhr', 'asr'];
        eveningSpiritual = ['maghrib', 'isha'];
        ethicsHabit = ['peches'];
    } else if (currentConfig.name === 'Christianisme') {
        morningSpiritual = ['priere-matin'];
        middaySpiritual = ['priere-midi', 'priere-repas'];
        eveningSpiritual = ['priere-soir', 'priere-nuit'];
        ethicsHabit = ['commandements'];
    } else if (currentConfig.name === 'Neutre') {
        morningSpiritual = ['meditation-matin'];
        middaySpiritual = ['meditation-midi', 'gratitude'];
        eveningSpiritual = ['meditation-soir', 'journal'];
        ethicsHabit = ['ethique'];
    } else if (currentConfig.name === 'Santé Optimale') {
        // Configuration spéciale pour Santé Optimale avec ses propres catégories
        const categories = {
            physical: { 
                icon: '🏋️', 
                name: 'Santé Physique', 
                timeRange: 'matin',
                deadline: 12,
                habits: ['sommeil-optimal', 'alimentation-animal', 'musculation', 'marche-matinale']
            },
            hygiene: { 
                icon: '🛁', 
                name: 'Hygiène Avancée', 
                timeRange: 'matin',
                deadline: 12,
                habits: ['douche-froide', 'brossage-matin', 'routine-cheveux', 'routine-corps', 'ongles', 'rasage']
            },
            nutrition: { 
                icon: '🥩', 
                name: 'Nutrition & Micronutriments', 
                timeRange: 'journee',
                deadline: 18,
                habits: ['programme-nutrition']
            },
            environment: { 
                icon: '🌙', 
                name: 'Environnement Optimal', 
                timeRange: 'soir',
                deadline: 24,
                habits: ['environnement-sommeil']
            },
            mental: { 
                icon: '🧠', 
                name: 'Mental & Social', 
                timeRange: 'soir',
                deadline: 24,
                habits: ['socialisation', 'gestion-stress', 'decisions-optimal', 'meditation-matin']
            }
        };
        
        const habitLabels = currentConfig.habitLabels || {};
        
        // Déterminer le moment de la journée actuel
        const currentHour = new Date().getHours();
        let currentTimeRange = 'matin';
        if (currentHour >= 12 && currentHour < 18) {
            currentTimeRange = 'journee';
        } else if (currentHour >= 18 || currentHour < 5) {
            currentTimeRange = 'soir';
        }
        
        Object.values(categories).forEach(category => {
            if (category.habits.length === 0) return;
            
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            
            // Vérifier si la catégorie est bloquée (heure dépassée)
            const isLocked = currentHour >= category.deadline;
            
            // Mettre en évidence la catégorie active selon l'heure
            if (category.timeRange === currentTimeRange && !isLocked) {
                categoryDiv.classList.add('category-active-time');
            }
            
            if (isLocked) {
                categoryDiv.classList.add('category-locked');
            }
            
            const title = document.createElement('h2');
            let statusIndicator = '';
            if (isLocked) {
                statusIndicator = `<span class="time-indicator locked">🔒 Bloqué (${category.deadline}h passé)</span>`;
            } else if (category.timeRange === currentTimeRange) {
                statusIndicator = '<span class="time-indicator">⏰ C\'est le moment !</span>';
            }
            title.innerHTML = `<span class="category-icon">${category.icon}</span> ${category.name} ${statusIndicator}`;
            categoryDiv.appendChild(title);
            
            category.habits.forEach(habitId => {
                const habitDiv = document.createElement('div');
                habitDiv.className = 'habit-item';
                
                const isLocked = currentHour >= category.deadline;
                
                habitDiv.innerHTML = `
                    <input type="checkbox" id="${habitId}" ${isLocked ? 'disabled' : ''}>
                    <label for="${habitId}">${habitLabels[habitId] || habitId}</label>
                `;
                
                // Gestion du clic
                habitDiv.addEventListener('click', function(event) {
                    if (isLocked) {
                        event.preventDefault();
                        event.stopPropagation();
                        showLockedMessage(category.deadline);
                        return;
                    }
                    if (habitDiv.dataset.uiLongPress === 'active') {
                        return;
                    }
                    if (event.target.tagName !== 'INPUT') {
                        toggleCheckbox(habitId);
                    }
                });

                categoryDiv.appendChild(habitDiv);
            });
            
            container.appendChild(categoryDiv);
        });
        
        return; // Sortir prématurément pour Santé Optimale
    }
    
    // Configuration par défaut pour les autres religions
    const categories = {
        morning: { 
            icon: '🌅', 
            name: 'Matin', 
            timeRange: 'matin',
            deadline: 12, // Bloqué après 12h
            habits: ['sommeil', 'entrainement-foot', 'douche-apres-entrainement', 'brossage-matin', ...morningSpiritual]
        },
        midday: { 
            icon: '☀️', 
            name: 'Journée', 
            timeRange: 'journee',
            deadline: 18, // Bloqué après 18h
            habits: ['argent', 'ongles', 'rasage', ...middaySpiritual]
        },
        evening: { 
            icon: '🌙', 
            name: 'Soir', 
            timeRange: 'soir',
            deadline: 24, // Bloqué après minuit (jamais bloqué le même jour)
            habits: ['proteines', 'brossage-soir', ...eveningSpiritual, ...ethicsHabit]
        }
    };
    
    const habitLabels = {
        'sommeil': 'Dormir régulièrement entre 23h et 00h (8h de sommeil)',
        'proteines': 'Manger suffisamment de protéines aujourd\'hui',
        'entrainement-foot': 'Entraînement Foot à la Ronaldo',
        'douche-apres-entrainement': 'Douche froide après séance de sport',
        'brossage-matin': 'Brossage de dents - Matin',
        'brossage-soir': 'Brossage de dents - Soir',
        'ongles': 'Coupage d\'ongles',
        'rasage': 'Rasage',
        'argent': 'Faire de l\'argent',
        ...currentConfig.habitLabels
    };
    
    // Déterminer le moment de la journée actuel
    const currentHour = new Date().getHours();
    let currentTimeRange = 'matin';
    if (currentHour >= 12 && currentHour < 18) {
        currentTimeRange = 'journee';
    } else if (currentHour >= 18 || currentHour < 5) {
        currentTimeRange = 'soir';
    }
    
    Object.values(categories).forEach(category => {
        if (category.habits.length === 0) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        
        // Vérifier si la catégorie est bloquée (heure dépassée)
        const isLocked = currentHour >= category.deadline;
        
        console.log(`Catégorie: ${category.name}, Heure actuelle: ${currentHour}, Deadline: ${category.deadline}, Bloqué: ${isLocked}`);
        
        // Mettre en évidence la catégorie active selon l'heure
        if (category.timeRange === currentTimeRange && !isLocked) {
            categoryDiv.classList.add('category-active-time');
        }
        
        if (isLocked) {
            categoryDiv.classList.add('category-locked');
        }
        
        const title = document.createElement('h2');
        let statusIndicator = '';
        if (isLocked) {
            statusIndicator = `<span class="time-indicator locked">🔒 Bloqué (${category.deadline}h passé)</span>`;
        } else if (category.timeRange === currentTimeRange) {
            statusIndicator = '<span class="time-indicator">⏰ C\'est le moment !</span>';
        }
        title.innerHTML = `<span class="category-icon">${category.icon}</span> ${category.name} ${statusIndicator}`;
        categoryDiv.appendChild(title);
        
        category.habits.forEach(habitId => {
            const habitDiv = document.createElement('div');
            habitDiv.className = 'habit-item';
            
            if (isLocked) {
                habitDiv.classList.add('habit-locked');
            }
            
            habitDiv.innerHTML = `
                <input type="checkbox" id="${habitId}" ${isLocked ? 'disabled' : ''}>
                <label for="${habitId}">${habitLabels[habitId] || habitId}</label>
            `;
            
            // Gestion du clic (avec blocage si un long-press a été déclenché ou si bloqué)
            habitDiv.addEventListener('click', (event) => {
                if (isLocked) {
                    event.preventDefault();
                    event.stopPropagation();
                    showLockedMessage(category.deadline);
                    return;
                }
                if (habitDiv.dataset.uiLongPress === 'active') {
                    habitDiv.dataset.uiLongPress = '';
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                toggleCheckbox(habitId);
            });

            categoryDiv.appendChild(habitDiv);
            
            // Ajouter le détail déroulant pour l'entraînement foot
            if (habitId === 'entrainement-foot') {
                const footDetailsContainer = document.createElement('div');
                footDetailsContainer.className = 'foot-training-details-container';
                
                const toggleButton = document.createElement('button');
                toggleButton.className = 'foot-training-toggle';
                toggleButton.innerHTML = '📋 Voir le programme';
                toggleButton.type = 'button';
                
                const detailsContent = document.createElement('div');
                detailsContent.className = 'foot-training-details';
                detailsContent.style.display = 'none';
                detailsContent.innerHTML = `
                    <div class="foot-training-content">
                        <h3 class="foot-training-title">⚽ Entraînement Foot à la Ronaldo</h3>
                        
                        <div class="foot-section">
                            <h4 class="foot-section-title">🔥 Échauffement (15 minutes)</h4>
                            <ul class="foot-list">
                                <li>5 minutes de footing léger (autour du terrain ou sur place)</li>
                                <li>5 minutes d'étirements dynamiques (fentes, talons-fesses, montées de genoux)</li>
                                <li>5 minutes de travail de mobilité articulaire (cercles avec les chevilles, rotations des hanches, épaules)</li>
                            </ul>
                        </div>
                        
                        <div class="foot-section">
                            <h4 class="foot-section-title">💪 Partie 1 : Travail physique et explosivité (30 minutes)</h4>
                            <ul class="foot-list">
                                <li><strong>Sprints courts :</strong> 6 x 30 mètres à 90-100% intensité, récupération 1 min entre chaque</li>
                                <li><strong>Pliométrie :</strong>
                                    <ul>
                                        <li>3 x 10 sauts verticaux (explosivité)</li>
                                        <li>3 x 10 sauts latéraux (agilité)</li>
                                    </ul>
                                </li>
                                <li><strong>Gainage :</strong>
                                    <ul>
                                        <li>Planche frontale : 3 x 1 minute</li>
                                        <li>Planche latérale : 3 x 30 secondes de chaque côté</li>
                                        <li>Abdos : 3 séries de 20 crunchs + 15 relevés de jambes</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        
                        <div class="foot-section">
                            <h4 class="foot-section-title">⚽ Partie 2 : Technique balle au pied (30 minutes)</h4>
                            <ul class="foot-list">
                                <li><strong>Jongles :</strong> 3 x 50 jongles (pieds, cuisses, tête)</li>
                                <li><strong>Conduite de balle :</strong> 4 x 40 mètres en slalom entre des plots (ou bouteilles)</li>
                                <li><strong>Passes courtes :</strong> 4 x 20 passes contre un mur, avec précision</li>
                                <li><strong>Tirs au but :</strong> 4 x 10 tirs, en alternant puissance et précision (gauche, droite, pied faible)</li>
                            </ul>
                        </div>
                        
                        <div class="foot-section">
                            <h4 class="foot-section-title">🧠 Partie 3 : Travail tactique et situations de match (15 minutes)</h4>
                            <ul class="foot-list">
                                <li>Dribbles rapides en situation de un contre un (si possible avec un partenaire) : 4 séries de 1 minute</li>
                                <li>Reproduire des accélérations et changements de direction rapides</li>
                                <li><strong>Visualisation mentale :</strong> imagine-toi dans un match, la balle aux pieds, la stratégie à appliquer</li>
                            </ul>
                        </div>
                    </div>
                `;
                
                toggleButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = detailsContent.style.display !== 'none';
                    if (isOpen) {
                        detailsContent.style.display = 'none';
                        toggleButton.innerHTML = '📋 Voir le programme';
                    } else {
                        detailsContent.style.display = 'block';
                        toggleButton.innerHTML = '📋 Masquer le programme';
                    }
                });
                
                footDetailsContainer.appendChild(toggleButton);
                footDetailsContainer.appendChild(detailsContent);
                categoryDiv.appendChild(footDetailsContainer);
            }
        });
        
        container.appendChild(categoryDiv);
    });
}

// Note: L'initialisation principale se fait dans le DOMContentLoaded en fin de fichier

/* ========================================
   SYSTÈME DE LEADERBOARD
======================================== */

// Fonction showLeaderboard modifiée pour utiliser uniquement Firebase
async function showLeaderboard() {
    if (!window.firebaseDb) {
        alert('❌ Firebase n\'est pas disponible. Le classement nécessite Firebase.');
        return;
    }
    
    // Utiliser le leaderboard Firebase
    displayFirebaseLeaderboard();
}

// Exposer les fonctions globalement
window.showLeaderboard = showLeaderboard;
window.changeConfig = changeConfig;
window.initConfigSelector = initConfigSelector;

/* ========================================
   CHANGEMENT DE CONFIGURATION
======================================== */

function changeConfig(configName) {
    if (!religionConfigs[configName]) {
        console.error('Configuration inconnue:', configName);
        return;
    }
    
    // Sauvegarder les habitudes actuelles avant de changer
    saveHabits();
    
    // Mettre à jour la configuration
    localStorage.setItem('selectedReligion', configName);
    currentConfig = religionConfigs[configName];
    habits = currentConfig.habits;
    
    // Régénérer l'interface
    generateHabitsHTML();
    
    // Recharger les états des checkboxes
    setTimeout(() => {
        loadHabits();
        updateProgress();
        updateStatsDisplay();
    }, 100);
    
    console.log('✅ Configuration changée pour:', currentConfig.name);
    playSound('click');
}

function initConfigSelector() {
    const configSelect = document.getElementById('configSelect');
    if (configSelect) {
        const savedConfig = localStorage.getItem('selectedReligion') || 'santeoptimale';
        configSelect.value = savedConfig;
    }
}

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

// EXPOSE TOUTES LES FONCTIONS NÉCESSAIRES
window.toggleCheckbox = toggleCheckbox;
window.resetAll = resetAll;
window.toggleTheme = toggleTheme;
window.toggleSound = toggleSound;
window.showPage = showPage;

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
    const pageIndex = ['daily', 'stats', 'leaderboard'].indexOf(pageName);
    if (tabs[pageIndex]) {
        tabs[pageIndex].classList.add('active');
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

// Détecter si on est sur mobile
function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Créer une particule (optimisé pour mobile)
function createParticle(x, y, color, size = 5) {
    // Réduire les effets sur mobile pour les performances
    if (isMobileDevice()) {
        // Moins de particules et plus petites sur mobile
        if (Math.random() > 0.5) return; // 50% de chance de créer une particule
        size = size * 0.7;
    }
    
    const container = createParticlesContainer();
    if (!container) {
        console.warn('Impossible de créer le conteneur de particules');
        return;
    }
    
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const drift = (Math.random() - 0.5) * 100;
    const duration = 2 + Math.random() * 2;
    
    // Utiliser will-change pour optimiser les performances
    particle.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        --drift: ${drift}px;
        animation-duration: ${duration}s;
        box-shadow: 0 0 ${size * 2}px ${color};
        will-change: transform, opacity;
    `;
    
    container.appendChild(particle);
    
    setTimeout(() => {
        if (particle && particle.parentNode) {
            particle.remove();
        }
    }, duration * 1000);
}

function stopStatsParticles() {
    if (statsParticlesInterval) {
        clearInterval(statsParticlesInterval);
        statsParticlesInterval = null;
    }
}

function startStatsParticles() {
    // Arrêter les particules existantes si elles tournent déjà
    stopStatsParticles();
    
    const statsPage = document.getElementById('page-stats');
    if (!statsPage || !statsPage.classList.contains('active')) return;
    
    // Désactiver ou réduire les particules sur mobile pour les performances
    if (isMobileDevice()) {
        // Sur mobile, réduire drastiquement les particules (70% de moins)
        const intervalTime = 1000; // 1 seconde au lieu de 300ms
        statsParticlesInterval = setInterval(() => {
            // Vérifier si la page est toujours visible
            if (document.hidden || !document.getElementById('page-stats')?.classList.contains('active')) {
                stopStatsParticles();
                return;
            }
            
            // Sur mobile, créer des particules beaucoup moins souvent
            if (Math.random() > 0.3) return; // 70% de chance de ne pas créer de particule
            
            const statsSystem = document.querySelector('.stats-system');
            if (statsSystem && Math.random() > 0.5) {
                const rect = statsSystem.getBoundingClientRect();
                const x = rect.left + Math.random() * rect.width;
                const y = rect.top + Math.random() * rect.height;
                const colors = ['#00d4ff', '#7b68ee'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                createFloatingParticle(x, y, color, 2 + Math.random() * 2);
            }
        }, intervalTime);
        return;
    }
    
    // Version desktop avec toutes les particules
    statsParticlesInterval = setInterval(() => {
        // Vérifier si la page est toujours visible
        if (document.hidden || !document.getElementById('page-stats')?.classList.contains('active')) {
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
// Variable pour stocker le listener Firebase et éviter les doublons
let firebaseLeaderboardUnsubscribe = null;

let rankParticlesInterval = null;

// Variables pour gérer la visibilité de la page
let isPageVisible = true;

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

async function updateMyRankOnFirebase() {
    const username = localStorage.getItem('username');
    const religion = localStorage.getItem('selectedReligion');
    const rank = getCurrentUserRank();
    const firebaseUID = localStorage.getItem('firebaseUID');
    
    if (window.firebaseDb && username && religion && rank && firebaseUID) {
        // Mettre à jour dans la collection 'users' avec le firebaseUID comme ID
        const userRef = window.firebaseDoc(window.firebaseDb, 'users', firebaseUID);
        await window.firebaseSetDoc(userRef, {
            username: username,
            religion: religion,
            rank: rank,
            lastUpdated: new Date().toISOString()
        }, { merge: true });
        
        console.log('✅ Rang synchronisé sur Firebase !');
    }
}

/* ========================================
   INITIALISATION
======================================== */

// Attendre que Firebase soit chargé (une seule fois)
setTimeout(() => {
    if (window.firebaseDb && !firebaseInitDone) {
        displayFirebaseLeaderboard();
        firebaseInitDone = true;
    }
}, 1000);

// Initialiser l'application au chargement
document.addEventListener('DOMContentLoaded', async function() {
    console.log('App starting...');
    
    // Charger le thème immédiatement
    loadTheme();
    
    // Initialiser l'application directement sans authentification
    initApp();
});

function initApp() {
    // Éviter l'initialisation multiple
    if (appInitialized) {
        console.log('⚠️ App déjà initialisée, ignoré');
        return;
    }
    appInitialized = true;
    console.log('✅ Initialisation de l\'application...');
    
    // Configuration par défaut (sans authentification)
    const savedReligion = localStorage.getItem('selectedReligion') || 'santeoptimale';
    currentConfig = religionConfigs[savedReligion];
    habits = currentConfig.habits;
    
    updateDate();
    initMotivationQuote();
    initNotifications();
    initConfigSelector();
    
    // Mettre à jour la progression des prières (Islam)
    updatePrayerProgress();
    
    // Générer les habitudes HTML d'abord si nécessaire
    const habitsContainer = document.getElementById('habitsContainer');
    if (!habitsContainer || !habitsContainer.hasChildNodes()) {
        generateHabitsHTML();
    }
    
    // Attendre un peu que le DOM soit prêt avant de charger les habitudes
    setTimeout(() => {
    loadHabits();
        updateProgress(); // Met à jour la progression et le rang en temps réel
    }, 100);
    
    updateStatsDisplay();
    updateRankSystem();
    calculateStats();
    
    // Gérer la visibilité de la page pour optimiser les timers
    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
    });
    
    // Vérifier les deadlines toutes les minutes et rafraîchir si nécessaire
    let lastCheckedHour = new Date().getHours();
    setInterval(() => {
        const currentHour = new Date().getHours();
        // Si l'heure a changé, régénérer les habitudes pour mettre à jour les blocages
        if (currentHour !== lastCheckedHour) {
            console.log(`🕐 Changement d'heure détecté: ${lastCheckedHour}h → ${currentHour}h, mise à jour des blocages...`);
            lastCheckedHour = currentHour;
            
            // Sauvegarder les habitudes actuelles avant de régénérer
            saveHabits();
            
            // Régénérer l'interface des habitudes
            generateHabitsHTML();
            
            // Recharger les états des checkboxes
            loadHabits();
            
            // Mettre à jour la progression
            updateProgress();
        }
    }, 60000); // Vérifier toutes les 60 secondes
    
    // Recréer les particules de rang toutes les 5 secondes (seulement si page visible)
    rankParticlesInterval = setInterval(() => {
        if (isPageVisible && document.getElementById('page-stats')?.classList.contains('active')) {
            const currentRankEl = document.getElementById('currentRank');
            if (currentRankEl) {
                createRankParticles(currentRankEl.textContent);
            }
        }
    }, 5000);
    
    window.addEventListener('offline', () => {
        console.warn('?? Connexion perdue, mode hors ligne activé');
    });
    
    // Afficher le leaderboard Firebase (seulement si pas déjà initialisé)
    if (window.firebaseDb && !firebaseInitDone) {
        displayFirebaseLeaderboard();
        firebaseInitDone = true;
    }
    
    // Afficher la page quotidien par défaut
    showPage('daily');
}

