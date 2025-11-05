/* ========================================
   CONFIGURATION DE BASE
======================================== */

// Système d'utilisateurs
let currentUser = null;

function getAllUsers() {
    return JSON.parse(originalGetItem('allUsers') || '{}');
}

function saveAllUsers(users) {
    originalSetItem('allUsers', JSON.stringify(users));
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

// Remplacer localStorage.getItem et setItem par les versions utilisateur
const originalGetItem = (key, defaultValue) => {
    return getCurrentUserData(key, defaultValue);
};

const originalSetItem = (key, value) => {
    setCurrentUserData(key, value);
};

// Configurations par religion
const religionConfigs = {
    islam: {
        name: 'Islam',
        icon: '☪️',
        habits: [
            'sommeil', 'sport', 'proteines',
            'douche-matin', 'douche-soir', 
            'brossage-matin', 'brossage-midi', 'brossage-soir',
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
            'brossage-matin', 'brossage-midi', 'brossage-soir',
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
            'brossage-matin', 'brossage-midi', 'brossage-soir',
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
    'brossage-midi': 'men',
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

/* ========================================
   FONCTIONS UTILITAIRES
======================================== */

function showReligionSelector() {
    const overlay = document.createElement('div');
    overlay.id = 'religionOverlay';
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
            max-width: 800px;
            padding: 40px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #00d9ff;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 0 50px rgba(0, 217, 255, 0.5);
        ">
            <h1 style="
                font-size: 2.5em;
                color: #00d9ff;
                margin-bottom: 20px;
                text-shadow: 0 0 20px rgba(0, 217, 255, 0.8);
            ">⚔️ CRÉATION DE PERSONNAGE ⚔️</h1>
            
            <div style="margin-bottom: 30px;">
                <input type="text" id="usernameInput" placeholder="Entre ton pseudo..." style="
                    width: 100%;
                    padding: 15px;
                    font-size: 1.2em;
                    background: rgba(0, 0, 0, 0.5);
                    border: 2px solid #00d9ff;
                    color: white;
                    border-radius: 10px;
                    text-align: center;
                    margin-bottom: 20px;
                ">
            </div>
            
            <p style="
                font-size: 1.2em;
                color: #aaa;
                margin-bottom: 30px;
            ">Choisis ta voie spirituelle</p>
            
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            ">
                <button onclick="createUser('islam')" class="religion-btn" style="
                    padding: 30px 20px;
                    background: linear-gradient(135deg, #00cc66, #008844);
                    border: none;
                    border-radius: 15px;
                    color: white;
                    font-size: 1.5em;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 5px 20px rgba(0, 204, 102, 0.4);
                ">
                    <div style="font-size: 3em; margin-bottom: 10px;">☪️</div>
                    <div style="font-weight: bold;">ISLAM</div>
                </button>
                
                <button onclick="createUser('christianity')" class="religion-btn" style="
                    padding: 30px 20px;
                    background: linear-gradient(135deg, #667eea, #4a5fd4);
                    border: none;
                    border-radius: 15px;
                    color: white;
                    font-size: 1.5em;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
                ">
                    <div style="font-size: 3em; margin-bottom: 10px;">✝️</div>
                    <div style="font-weight: bold;">CHRISTIANISME</div>
                </button>
                
                <button onclick="createUser('neutral')" class="religion-btn" style="
                    padding: 30px 20px;
                    background: linear-gradient(135deg, #ffa500, #ff6b00);
                    border: none;
                    border-radius: 15px;
                    color: white;
                    font-size: 1.5em;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 5px 20px rgba(255, 165, 0, 0.4);
                ">
                    <div style="font-size: 3em; margin-bottom: 10px;">🌟</div>
                    <div style="font-weight: bold;">NEUTRE</div>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function createUser(religion) {
    const username = document.getElementById('usernameInput').value.trim();
    
    if (!username) {
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
    
    // Définir comme utilisateur actuel
    originalSetItem('currentUser', username);
    currentUser = username;
    
    selectReligion(religion);
}

function showUserSelector() {
    const users = getAllUsers();
    const userList = Object.keys(users);
    
    if (userList.length === 0) {
        showReligionSelector();
        return;
    }
    
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
        usersHTML += `
            <button onclick="selectUser('${username}')" style="
                padding: 20px;
                background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(0, 150, 200, 0.1));
                border: 2px solid #00d9ff;
                border-radius: 15px;
                color: white;
                cursor: pointer;
                transition: all 0.3s;
                text-align: left;
                width: 100%;
                margin-bottom: 15px;
            ">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 2em;">${config.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-size: 1.3em; font-weight: bold;">${username}</div>
                        <div style="font-size: 0.9em; color: #aaa;">${config.name}</div>
                    </div>
                </div>
            </button>
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
    localStorage.setItem('selectedReligion', religion);
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
    
    // Ajouter des points de rang selon progression
    if (percentage === 100) {
        addRankProgress(1); // Journée parfaite = +1 jour
    } else if (percentage >= 50) {
        addRankProgress(0.5); // Demi-journée = +0.5 jour
    }
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
    });
    
    const powerLevel = Object.values(stats).reduce((sum, val) => sum + val, 0);
    const powerElement = document.getElementById('powerLevel');
    if (powerElement) {
        powerElement.textContent = powerLevel;
    }
    
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

const allQuests = [
    { id: 'quest-sport', name: '💪 Séance de sport intense', reward: 'str', bonus: '+0.5 jour de rang' },
    { id: 'quest-prayers', name: '🕌 Toutes les 5 prières à l\'heure', reward: 'spi', bonus: '+0.5 jour de rang' },
    { id: 'quest-study', name: '📚 1h d\'étude/lecture', reward: 'men', bonus: '+0.5 jour de rang' },
    { id: 'quest-hygiene', name: '🧼 Hygiène parfaite toute la journée', reward: 'hp', bonus: '+0.5 jour de rang' },
    { id: 'quest-discipline', name: '🎯 Zéro distraction aujourd\'hui', reward: 'dis', bonus: '+0.5 jour de rang' },
    { id: 'quest-cardio', name: '🏃 30min de cardio', reward: 'end', bonus: '+0.5 jour de rang' },
    { id: 'quest-nutrition', name: '🍗 Nutrition parfaite', reward: 'str', bonus: '+0.5 jour de rang' },
    { id: 'quest-wake', name: '⏰ Réveil à 5h du matin', reward: 'dis', bonus: '+0.5 jour de rang' }
];

function initDailyQuests() {
    const today = getTodayDate();
    const savedDate = originalGetItem('questsDate');
    
    if (savedDate !== today) {
        const shuffled = [...allQuests].sort(() => Math.random() - 0.5);
        const dailyQuests = shuffled.slice(0, 5).map(q => q.id);
        originalSetItem('dailyQuests', JSON.stringify(dailyQuests));
        originalSetItem('questsDate', today);
        
        dailyQuests.forEach(qid => localStorage.removeItem('quest_' + qid));
    }
    
    displayDailyQuests();
    updateQuestTimer();
    setInterval(updateQuestTimer, 1000);
}

function displayDailyQuests() {
    const dailyQuests = JSON.parse(originalGetItem('dailyQuests') || '[]');
    const container = document.getElementById('dailyQuestsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    dailyQuests.forEach(questId => {
        const quest = allQuests.find(q => q.id === questId);
        if (!quest) return;
        
        const completed = originalGetItem('quest_' + questId) === 'true';
        
        const questDiv = document.createElement('div');
        questDiv.className = 'quest-item' + (completed ? ' completed' : '');
        questDiv.innerHTML = `
            <div class="quest-info">
                <div class="quest-name">${quest.name}</div>
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
        hygiene: { icon: '🧼', name: 'Hygiène', habits: ['douche-matin', 'douche-soir', 'brossage-matin', 'brossage-midi', 'brossage-soir', 'ongles', 'rasage'] },
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
        'brossage-midi': 'Brossage de dents - Midi',
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
window.createUser = createUser;
window.selectUser = selectUser;
window.showLeaderboard = showLeaderboard;

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
    const progressPoints = parseFloat(localStorage.getItem('rankProgressPoints') || '0');
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
    
    displayLeaderboard();
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
window.completeQuest = completeQuest;
