// Wait for Firebase to be available
let firebaseInitialized = false;
let auth, db;

// Initialize Firebase when available
const waitForFirebase = () => {
    return new Promise((resolve) => {
        const checkFirebase = () => {
            if (window.firebaseApp && window.auth && window.db) {
                auth = window.auth;
                db = window.db;
                firebaseInitialized = true;
                resolve();
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    });
};

// Application state and configuration
const CONFIG = {
    examDates: {
        jeeMain1: new Date('2026-01-20T09:00:00'),
        jeeMain2: new Date('2026-04-01T09:00:00'),
        jeeAdvanced: new Date('2026-05-18T09:00:00')
    },
    defaultSettings: {
        dailyTarget: 50,
        weeklyTarget: 350,
        theme: 'dark'
    },
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'General'],
    priorityLevels: ['High', 'Medium', 'Low'],
    motivationalQuotes: [
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "The expert in anything was once a beginner.",
        "Don't watch the clock; do what it does. Keep going.",
        "Believe you can and you're halfway there.",
        "The future belongs to those who believe in the beauty of their dreams.",
        "Champions keep playing until they get it right.",
        "It does not matter how slowly you go as long as you do not stop.",
        "Every accomplishment starts with the decision to try.",
        "Success is the sum of small efforts repeated day in and day out.",
        "The only impossible journey is the one you never begin."
    ]
};

// Application state
let appState = {
    currentSection: 'dashboard',
    progressData: [],
    todos: [],
    settings: { ...CONFIG.defaultSettings },
    currentMonth: new Date(),
    charts: {},
    user: null,
    isOnline: navigator.onLine,
    syncQueue: [],
    lastSyncTime: null,
    retryCount: 0
};

// Utility functions
const utils = {
    formatDate: (date) => {
        return date.toISOString().split('T')[0];
    },
    
    parseDate: (dateString) => {
        return new Date(dateString + 'T00:00:00');
    },
    
    getToday: () => {
        return utils.formatDate(new Date());
    },
    
    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    
    getWeekStart: (date) => {
        const result = new Date(date);
        const day = result.getDay();
        const diff = result.getDate() - day;
        return new Date(result.setDate(diff));
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;margin-left:12px;cursor:pointer;">&times;</button>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            border-left: 4px solid ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
            z-index: 3000;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
};

// Firebase Authentication (Dynamic imports after Firebase is loaded)
const FirebaseAuth = {
    provider: null,
    
    async initializeAuth() {
        if (!firebaseInitialized) return false;
        
        try {
            const { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            
            this.provider = new GoogleAuthProvider();
            this.signInWithPopup = signInWithPopup;
            this.signOut = signOut;
            this.onAuthStateChanged = onAuthStateChanged;
            
            return true;
        } catch (error) {
            console.error('Failed to load Firebase Auth:', error);
            return false;
        }
    },
    
    async signIn() {
        try {
            if (!this.provider) {
                await this.initializeAuth();
            }
            
            updateConnectionStatus('connecting');
            const result = await this.signInWithPopup(auth, this.provider);
            appState.user = result.user;
            this.updateUI();
            await this.syncUserData();
            utils.showNotification('Successfully signed in!', 'success');
            updateConnectionStatus('connected');
            return result.user;
        } catch (error) {
            console.error('Sign in error:', error);
            utils.showNotification('Sign in failed. Please try again.', 'error');
            updateConnectionStatus('offline');
            throw error;
        }
    },
    
    async signOutUser() {
        try {
            await this.signOut(auth);
            appState.user = null;
            this.updateUI();
            appState.progressData = [];
            appState.todos = [];
            updateDashboardStats();
            renderTodos();
            utils.showNotification('Successfully signed out!', 'success');
            updateConnectionStatus('offline');
        } catch (error) {
            console.error('Sign out error:', error);
            utils.showNotification('Sign out failed.', 'error');
        }
    },
    
    updateUI() {
        const authModal = document.getElementById('authModal');
        const userInfo = document.getElementById('userInfo');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        
        if (appState.user) {
            if (authModal) authModal.classList.add('hidden');
            if (userInfo) {
                userInfo.style.display = 'flex';
                if (userAvatar) userAvatar.src = appState.user.photoURL || '';
                if (userName) userName.textContent = appState.user.displayName || 'User';
            }
        } else {
            if (userInfo) userInfo.style.display = 'none';
        }
    },
    
    async syncUserData() {
        if (!appState.user) return;
        
        try {
            await Promise.all([
                FirebaseDB.loadProgressData(),
                FirebaseDB.loadTodos(),
                FirebaseDB.loadSettings()
            ]);
            
            updateDashboardStats();
            updateTodayProgress();
            renderCalendar();
            renderTodos();
            
            appState.lastSyncTime = new Date();
            updateSyncStatus();
        } catch (error) {
            console.error('Sync error:', error);
            utils.showNotification('Failed to sync data. Working offline.', 'error');
        }
    }
};

// Firestore Database Operations
const FirebaseDB = {
    firestoreImports: null,
    
    async initializeFirestore() {
        if (!firebaseInitialized || this.firestoreImports) return this.firestoreImports !== null;
        
        try {
            this.firestoreImports = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            return true;
        } catch (error) {
            console.error('Failed to load Firestore:', error);
            return false;
        }
    },
    
    async saveProgressEntry(entry) {
        if (!appState.user) {
            this.queueOperation('saveProgress', entry);
            return;
        }
        
        try {
            await this.initializeFirestore();
            const { doc, setDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'progress', entry.date);
            await setDoc(docRef, entry);
            utils.showNotification('Progress saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving progress:', error);
            this.queueOperation('saveProgress', entry);
            utils.showNotification('Failed to save progress. Queued for retry.', 'error');
            throw error;
        }
    },
    
    async loadProgressData() {
        if (!appState.user) return;
        
        try {
            await this.initializeFirestore();
            const { collection, query, orderBy, getDocs } = this.firestoreImports;
            
            const progressRef = collection(db, 'users', appState.user.uid, 'progress');
            const q = query(progressRef, orderBy('date'));
            const querySnapshot = await getDocs(q);
            
            appState.progressData = [];
            querySnapshot.forEach((doc) => {
                appState.progressData.push(doc.data());
            });
            
            updateConnectionStatus('connected');
        } catch (error) {
            console.error('Error loading progress data:', error);
            updateConnectionStatus('offline');
            throw error;
        }
    },
    
    async saveTodo(todo) {
        if (!appState.user) {
            this.queueOperation('saveTodo', todo);
            return;
        }
        
        try {
            await this.initializeFirestore();
            const { doc, setDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'todos', todo.id.toString());
            await setDoc(docRef, todo);
        } catch (error) {
            console.error('Error saving todo:', error);
            this.queueOperation('saveTodo', todo);
            throw error;
        }
    },
    
    async deleteTodo(todoId) {
        if (!appState.user) {
            this.queueOperation('deleteTodo', { id: todoId });
            return;
        }
        
        try {
            await this.initializeFirestore();
            const { doc, deleteDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'todos', todoId.toString());
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting todo:', error);
            this.queueOperation('deleteTodo', { id: todoId });
            throw error;
        }
    },
    
    async loadTodos() {
        if (!appState.user) return;
        
        try {
            await this.initializeFirestore();
            const { collection, getDocs } = this.firestoreImports;
            
            const todosRef = collection(db, 'users', appState.user.uid, 'todos');
            const querySnapshot = await getDocs(todosRef);
            
            appState.todos = [];
            querySnapshot.forEach((doc) => {
                appState.todos.push(doc.data());
            });
        } catch (error) {
            console.error('Error loading todos:', error);
            throw error;
        }
    },
    
    async saveSettings(settings) {
        if (!appState.user) {
            this.queueOperation('saveSettings', settings);
            return;
        }
        
        try {
            await this.initializeFirestore();
            const { doc, setDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'settings', 'userSettings');
            await setDoc(docRef, settings);
        } catch (error) {
            console.error('Error saving settings:', error);
            this.queueOperation('saveSettings', settings);
            throw error;
        }
    },
    
    async loadSettings() {
        if (!appState.user) return;
        
        try {
            await this.initializeFirestore();
            const { doc, getDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'settings', 'userSettings');
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                appState.settings = { ...CONFIG.defaultSettings, ...docSnap.data() };
                const targetInput = document.getElementById('dailyTarget');
                if (targetInput) {
                    targetInput.value = appState.settings.dailyTarget;
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            throw error;
        }
    },
    
    queueOperation(type, data) {
        appState.syncQueue.push({ type, data, timestamp: Date.now() });
        updateSyncStatus();
    },
    
    async processSyncQueue() {
        if (!appState.user || appState.syncQueue.length === 0) return;
        
        const operations = [...appState.syncQueue];
        appState.syncQueue = [];
        
        for (const operation of operations) {
            try {
                switch (operation.type) {
                    case 'saveProgress':
                        await this.saveProgressEntry(operation.data);
                        break;
                    case 'saveTodo':
                        await this.saveTodo(operation.data);
                        break;
                    case 'deleteTodo':
                        await this.deleteTodo(operation.data.id);
                        break;
                    case 'saveSettings':
                        await this.saveSettings(operation.data);
                        break;
                }
            } catch (error) {
                console.error('Sync operation failed:', error);
                appState.syncQueue.push(operation);
            }
        }
        
        if (appState.syncQueue.length === 0) {
            appState.lastSyncTime = new Date();
            utils.showNotification('All data synced successfully!', 'success');
        }
        
        updateSyncStatus();
    }
};

// Connection status management
const updateConnectionStatus = (status) => {
    const indicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    if (!indicator || !statusText) return;
    
    indicator.className = 'status-indicator';
    
    switch (status) {
        case 'connected':
            indicator.classList.add('connected');
            statusText.textContent = 'Connected';
            break;
        case 'connecting':
            statusText.textContent = 'Connecting...';
            break;
        case 'offline':
            indicator.classList.add('offline');
            statusText.textContent = 'Offline';
            break;
        default:
            statusText.textContent = 'Unknown';
    }
};

const updateSyncStatus = () => {
    const statusText = document.getElementById('statusText');
    if (!statusText) return;
    
    if (appState.syncQueue.length > 0) {
        statusText.textContent = `${appState.syncQueue.length} changes pending`;
    } else if (appState.lastSyncTime) {
        const timeDiff = Math.floor((Date.now() - appState.lastSyncTime.getTime()) / 60000);
        statusText.textContent = timeDiff < 1 ? 'Just synced' : `Synced ${timeDiff}m ago`;
    }
};

// Local storage fallback
const storage = {
    save: (key, data) => {
        try {
            localStorage.setItem(`jee-tracker-${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },
    
    load: (key, defaultValue = null) => {
        try {
            const data = localStorage.getItem(`jee-tracker-${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }
};

// Initialize application
const init = async () => {
    console.log('Initializing app...');
    
    // Wait for Firebase to be available
    await waitForFirebase();
    console.log('Firebase loaded');
    
    loadAppState();
    setupEventListeners();
    startCountdowns();
    updateMotivationalQuote();
    
    // Set current date in date input
    const questionDateInput = document.getElementById('questionDate');
    if (questionDateInput) {
        questionDateInput.value = utils.getToday();
    }
    
    // Show dashboard by default
    showSection('dashboard');
    
    // Initialize Firebase Auth
    try {
        await FirebaseAuth.initializeAuth();
        
        // Setup Firebase auth listener
        if (FirebaseAuth.onAuthStateChanged) {
            FirebaseAuth.onAuthStateChanged(auth, (user) => {
                console.log('Auth state changed:', user);
                appState.user = user;
                FirebaseAuth.updateUI();
                
                if (user) {
                    FirebaseAuth.syncUserData();
                } else {
                    // Show auth modal if not signed in
                    const authModal = document.getElementById('authModal');
                    if (authModal) {
                        authModal.classList.remove('hidden');
                    }
                }
            });
        }
    } catch (error) {
        console.error('Failed to initialize Firebase Auth:', error);
        updateConnectionStatus('offline');
        
        // Continue in offline mode
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.remove('hidden');
        }
    }
    
    // Setup network listeners
    window.addEventListener('online', () => {
        appState.isOnline = true;
        updateConnectionStatus('connected');
        if (appState.user) {
            FirebaseDB.processSyncQueue();
        }
    });
    
    window.addEventListener('offline', () => {
        appState.isOnline = false;
        updateConnectionStatus('offline');
    });
    
    // Auto-sync every 2 minutes
    setInterval(() => {
        if (appState.isOnline && appState.user) {
            FirebaseDB.processSyncQueue();
        }
        updateSyncStatus();
    }, 120000);
    
    console.log('App initialized successfully');
};

// Load application state
const loadAppState = () => {
    // Load from localStorage as fallback
    appState.progressData = storage.load('progressData', []);
    appState.todos = storage.load('todos', []);
    appState.settings = { ...CONFIG.defaultSettings, ...storage.load('settings', {}) };
    
    // Set daily target input
    const targetInput = document.getElementById('dailyTarget');
    if (targetInput) {
        targetInput.value = appState.settings.dailyTarget;
    }
    
    // Load sample data if no data exists and not signed in
    if (appState.progressData.length === 0) {
        loadSampleData();
    }
    if (appState.todos.length === 0) {
        loadSampleTodos();
    }
    
    updateDashboardStats();
    updateTodayProgress();
    renderCalendar();
    renderTodos();
};

// Sample data for demo
const loadSampleData = () => {
    const sampleData = [
        {"date": "2025-08-16", "questions": 45, "target": 50, "subjects": {"Physics": 15, "Chemistry": 20, "Mathematics": 10}},
        {"date": "2025-08-17", "questions": 52, "target": 50, "subjects": {"Physics": 18, "Chemistry": 16, "Mathematics": 18}},
        {"date": "2025-08-18", "questions": 38, "target": 50, "subjects": {"Physics": 12, "Chemistry": 14, "Mathematics": 12}},
        {"date": "2025-08-19", "questions": 61, "target": 50, "subjects": {"Physics": 20, "Chemistry": 21, "Mathematics": 20}},
        {"date": "2025-08-20", "questions": 48, "target": 50, "subjects": {"Physics": 16, "Chemistry": 16, "Mathematics": 16}},
        {"date": "2025-08-21", "questions": 55, "target": 50, "subjects": {"Physics": 18, "Chemistry": 19, "Mathematics": 18}},
        {"date": "2025-08-22", "questions": 42, "target": 50, "subjects": {"Physics": 14, "Chemistry": 14, "Mathematics": 14}}
    ];
    appState.progressData = sampleData;
};

const loadSampleTodos = () => {
    const sampleTodos = [
        {"id": 1, "task": "Complete Organic Chemistry Chapter 1", "priority": "High", "subject": "Chemistry", "completed": false, "dueDate": "2025-08-25"},
        {"id": 2, "task": "Practice 20 Physics numericals", "priority": "Medium", "subject": "Physics", "completed": true, "dueDate": "2025-08-23"},
        {"id": 3, "task": "Review Mathematics formulae", "priority": "Low", "subject": "Mathematics", "completed": false, "dueDate": "2025-08-24"}
    ];
    appState.todos = sampleTodos;
};

// Event listeners setup
const setupEventListeners = () => {
    console.log('Setting up event listeners...');
    
    // Navigation - Fixed implementation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            console.log('Navigation clicked:', section);
            showSection(section);
        });
    });
    
    // Authentication
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const continueOfflineBtn = document.getElementById('continueOfflineBtn');
    
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', () => {
            console.log('Google sign in clicked');
            FirebaseAuth.signIn().catch(console.error);
        });
    }
    
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            console.log('Sign out clicked');
            FirebaseAuth.signOutUser().catch(console.error);
        });
    }
    
    if (continueOfflineBtn) {
        continueOfflineBtn.addEventListener('click', () => {
            console.log('Continue offline clicked');
            const authModal = document.getElementById('authModal');
            if (authModal) {
                authModal.classList.add('hidden');
            }
            updateConnectionStatus('offline');
        });
    }
    
    // Progress tracking
    const saveProgressBtn = document.getElementById('saveProgress');
    const dailyTargetInput = document.getElementById('dailyTarget');
    
    if (saveProgressBtn) {
        saveProgressBtn.addEventListener('click', saveProgress);
    }
    
    if (dailyTargetInput) {
        dailyTargetInput.addEventListener('change', updateDailyTarget);
    }
    
    // Auto-calculate total
    ['physicsCount', 'chemistryCount', 'mathCount'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateTotal);
        }
    });
    
    // Data export/import
    const exportJSONBtn = document.getElementById('exportJSON');
    const exportCSVBtn = document.getElementById('exportCSV');
    const backupDataBtn = document.getElementById('backupData');
    const importDataBtn = document.getElementById('importData');
    const importFileInput = document.getElementById('importFile');
    
    if (exportJSONBtn) exportJSONBtn.addEventListener('click', exportDataJSON);
    if (exportCSVBtn) exportCSVBtn.addEventListener('click', exportDataCSV);
    if (backupDataBtn) backupDataBtn.addEventListener('click', backupData);
    if (importDataBtn) {
        importDataBtn.addEventListener('click', () => {
            if (importFileInput) importFileInput.click();
        });
    }
    if (importFileInput) importFileInput.addEventListener('change', importData);
    
    // Calendar navigation
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));
    
    // Todo management
    const addTodoBtn = document.getElementById('addTodo');
    if (addTodoBtn) addTodoBtn.addEventListener('click', addTodo);
    
    // Todo filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => filterTodos(e.target.dataset.filter));
    });
    
    // Modal controls
    const closeModalBtn = document.getElementById('closeModal');
    const saveModalBtn = document.getElementById('saveModalProgress');
    const dayModal = document.getElementById('dayModal');
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (saveModalBtn) saveModalBtn.addEventListener('click', saveModalProgress);
    if (dayModal) {
        dayModal.addEventListener('click', (e) => {
            if (e.target.id === 'dayModal') closeModal();
        });
    }
    
    // Date input change
    const questionDateInput = document.getElementById('questionDate');
    if (questionDateInput) {
        questionDateInput.addEventListener('change', loadDateData);
    }
    
    // Theme toggle
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    console.log('Event listeners set up successfully');
};

// Navigation - Fixed implementation
const showSection = (sectionName) => {
    console.log('Showing section:', sectionName);
    
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (linkHref === `#${sectionName}`) {
            link.classList.add('active');
        }
    });
    
    // Hide all sections and show the target section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        
        appState.currentSection = sectionName;
        
        // Initialize section-specific functionality
        if (sectionName === 'analytics') {
            setTimeout(() => initializeCharts(), 100);
        }
        
        console.log('Section switched to:', sectionName);
    } else {
        console.error('Section not found:', sectionName);
    }
};

// Countdown timers
const startCountdowns = () => {
    const updateCountdowns = () => {
        const examMapping = {
            'jeeMain1': 'main1',
            'jeeMain2': 'main2', 
            'jeeAdvanced': 'advanced'
        };
        
        Object.keys(CONFIG.examDates).forEach(exam => {
            const examKey = examMapping[exam];
            updateCountdown(examKey, CONFIG.examDates[exam]);
        });
    };
    
    updateCountdowns();
    setInterval(updateCountdowns, 1000);
};

const updateCountdown = (exam, targetDate) => {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;
    
    const daysEl = document.getElementById(`days-${exam}`);
    const hoursEl = document.getElementById(`hours-${exam}`);
    const minutesEl = document.getElementById(`minutes-${exam}`);
    const secondsEl = document.getElementById(`seconds-${exam}`);
    
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;
    
    if (distance < 0) {
        daysEl.textContent = '000';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    daysEl.textContent = String(days).padStart(3, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
};

// Motivational quotes
const updateMotivationalQuote = () => {
    const quoteElement = document.getElementById('motivationalQuote');
    if (quoteElement) {
        const randomQuote = CONFIG.motivationalQuotes[Math.floor(Math.random() * CONFIG.motivationalQuotes.length)];
        quoteElement.textContent = randomQuote;
    }
    setTimeout(updateMotivationalQuote, 30000);
};

// Progress tracking
const calculateTotal = () => {
    const physicsInput = document.getElementById('physicsCount');
    const chemistryInput = document.getElementById('chemistryCount');
    const mathInput = document.getElementById('mathCount');
    const totalInput = document.getElementById('questionsCount');
    
    if (physicsInput && chemistryInput && mathInput && totalInput) {
        const physics = parseInt(physicsInput.value) || 0;
        const chemistry = parseInt(chemistryInput.value) || 0;
        const math = parseInt(mathInput.value) || 0;
        
        totalInput.value = physics + chemistry + math;
    }
};

const saveProgress = async () => {
    console.log('Save progress called');
    
    const dateInput = document.getElementById('questionDate');
    const questionsInput = document.getElementById('questionsCount');
    const targetInput = document.getElementById('dailyTarget');
    const physicsInput = document.getElementById('physicsCount');
    const chemistryInput = document.getElementById('chemistryCount');
    const mathInput = document.getElementById('mathCount');
    
    if (!dateInput || !questionsInput || !targetInput) {
        console.error('Required form elements not found');
        return;
    }
    
    const date = dateInput.value;
    const questions = parseInt(questionsInput.value) || 0;
    const target = parseInt(targetInput.value) || 50;
    
    const physics = physicsInput ? parseInt(physicsInput.value) || 0 : 0;
    const chemistry = chemistryInput ? parseInt(chemistryInput.value) || 0 : 0;
    const math = mathInput ? parseInt(mathInput.value) || 0 : 0;
    
    if (!date) {
        utils.showNotification('Please select a date', 'error');
        return;
    }
    
    const subjects = {
        Physics: physics,
        Chemistry: chemistry,
        Mathematics: math
    };
    
    const progressEntry = { date, questions, target, subjects };
    
    console.log('Saving progress entry:', progressEntry);
    
    // Update local state
    const existingIndex = appState.progressData.findIndex(entry => entry.date === date);
    if (existingIndex >= 0) {
        appState.progressData[existingIndex] = progressEntry;
    } else {
        appState.progressData.push(progressEntry);
    }
    
    appState.progressData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Save to localStorage immediately
    storage.save('progressData', appState.progressData);
    
    // Save to Firebase if available
    try {
        await FirebaseDB.saveProgressEntry(progressEntry);
    } catch (error) {
        console.log('Firebase save failed, using localStorage');
    }
    
    updateDashboardStats();
    updateTodayProgress();
    renderCalendar();
    
    // Clear form
    [questionsInput, physicsInput, chemistryInput, mathInput].forEach(input => {
        if (input) input.value = '';
    });
    
    // Show success feedback
    const btn = document.getElementById('saveProgress');
    if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Saved!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'linear-gradient(135deg, #64ffda, #1de9b6)';
        }, 2000);
    }
    
    utils.showNotification('Progress saved successfully!', 'success');
    
    console.log('Progress saved successfully');
};

const loadDateData = () => {
    const dateInput = document.getElementById('questionDate');
    if (!dateInput) return;
    
    const date = dateInput.value;
    const entry = appState.progressData.find(item => item.date === date);
    
    const questionsInput = document.getElementById('questionsCount');
    const physicsInput = document.getElementById('physicsCount');
    const chemistryInput = document.getElementById('chemistryCount');
    const mathInput = document.getElementById('mathCount');
    const targetInput = document.getElementById('dailyTarget');
    
    if (entry) {
        if (questionsInput) questionsInput.value = entry.questions;
        if (physicsInput) physicsInput.value = entry.subjects.Physics || 0;
        if (chemistryInput) chemistryInput.value = entry.subjects.Chemistry || 0;
        if (mathInput) mathInput.value = entry.subjects.Mathematics || 0;
        if (targetInput) targetInput.value = entry.target;
    } else {
        [questionsInput, physicsInput, chemistryInput, mathInput].forEach(input => {
            if (input) input.value = '';
        });
    }
};

const updateDailyTarget = async () => {
    const targetInput = document.getElementById('dailyTarget');
    if (targetInput) {
        const newTarget = parseInt(targetInput.value) || 50;
        appState.settings.dailyTarget = newTarget;
        
        storage.save('settings', appState.settings);
        
        try {
            await FirebaseDB.saveSettings(appState.settings);
        } catch (error) {
            console.log('Firebase settings save failed, using localStorage');
        }
        
        updateTodayProgress();
    }
};

// Dashboard statistics
const updateDashboardStats = () => {
    const totalQuestions = appState.progressData.reduce((sum, entry) => sum + entry.questions, 0);
    const avgQuestions = appState.progressData.length ? Math.round(totalQuestions / appState.progressData.length) : 0;
    const bestDay = appState.progressData.reduce((max, entry) => Math.max(max, entry.questions), 0);
    const currentStreak = calculateStreak();
    
    const totalEl = document.getElementById('totalQuestions');
    const avgEl = document.getElementById('avgQuestions');
    const bestEl = document.getElementById('bestDay');
    const streakEl = document.getElementById('currentStreak');
    
    if (totalEl) totalEl.textContent = totalQuestions;
    if (avgEl) avgEl.textContent = avgQuestions;
    if (bestEl) bestEl.textContent = bestDay;
    if (streakEl) streakEl.textContent = currentStreak;
    
    console.log('Dashboard stats updated:', { totalQuestions, avgQuestions, bestDay, currentStreak });
};

const calculateStreak = () => {
    if (appState.progressData.length === 0) return 0;
    
    const sortedData = [...appState.progressData].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let currentDate = new Date();
    
    for (const entry of sortedData) {
        const entryDate = utils.parseDate(entry.date);
        const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak && entry.questions >= entry.target) {
            streak++;
            currentDate = entryDate;
        } else {
            break;
        }
    }
    
    return streak;
};

const updateTodayProgress = () => {
    const today = utils.getToday();
    const todayEntry = appState.progressData.find(entry => entry.date === today);
    const target = appState.settings.dailyTarget;
    
    const questionsToday = todayEntry ? todayEntry.questions : 0;
    const progress = Math.min(Math.round((questionsToday / target) * 100), 100);
    
    const todayQuestionsEl = document.getElementById('todayQuestions');
    const todayTargetEl = document.getElementById('todayTarget');
    const todayProgressEl = document.getElementById('todayProgress');
    
    if (todayQuestionsEl) todayQuestionsEl.textContent = questionsToday;
    if (todayTargetEl) todayTargetEl.textContent = target;
    if (todayProgressEl) todayProgressEl.textContent = progress + '%';
    
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    
    const circle = document.getElementById('progressCircle');
    const percentageEl = document.getElementById('progressPercentage');
    
    if (circle && percentageEl) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (progress / 100) * circumference;
        
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
        percentageEl.textContent = progress + '%';
        
        if (!document.querySelector('#progressGradient')) {
            const svg = document.querySelector('.circular-chart');
            if (svg) {
                const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
                gradient.setAttribute('id', 'progressGradient');
                gradient.innerHTML = `
                    <stop offset="0%" stop-color="#64ffda"/>
                    <stop offset="100%" stop-color="#1de9b6"/>
                `;
                defs.appendChild(gradient);
                svg.insertBefore(defs, svg.firstChild);
            }
        }
    }
    
    console.log('Today progress updated:', { questionsToday, target, progress });
};

// Enhanced Charts Implementation
const initializeCharts = () => {
    console.log('Initializing charts...');
    
    if (appState.progressData.length === 0) {
        utils.showNotification('No data available for charts. Start logging your progress!', 'info');
        return;
    }
    
    try {
        createProgressChart();
        createSubjectChart();
        createWeeklyChart();
        createTargetChart();
        createRadarChart();
        createHeatmapChart();
        createGoalChart();
        createPredictionChart();
        
        console.log('Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
        utils.showNotification('Failed to load some charts', 'error');
    }
};

// Chart creation functions (simplified for key charts)
const createProgressChart = () => {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    if (appState.charts.progress) {
        appState.charts.progress.destroy();
    }
    
    const last30Days = appState.progressData.slice(-30);
    
    appState.charts.progress = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: last30Days.map(entry => entry.date),
            datasets: [{
                label: 'Questions Solved',
                data: last30Days.map(entry => entry.questions),
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Daily Target',
                data: last30Days.map(entry => entry.target),
                borderColor: '#B4413C',
                backgroundColor: 'rgba(180, 65, 60, 0.1)',
                borderDash: [5, 5]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
};

const createSubjectChart = () => {
    const ctx = document.getElementById('subjectChart');
    if (!ctx) return;
    
    if (appState.charts.subject) {
        appState.charts.subject.destroy();
    }
    
    const subjectTotals = appState.progressData.reduce((acc, entry) => {
        Object.keys(entry.subjects).forEach(subject => {
            acc[subject] = (acc[subject] || 0) + entry.subjects[subject];
        });
        return acc;
    }, {});
    
    appState.charts.subject = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(subjectTotals),
            datasets: [{
                data: Object.values(subjectTotals),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            }
        }
    });
};

const createWeeklyChart = () => {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    
    if (appState.charts.weekly) {
        appState.charts.weekly.destroy();
    }
    
    const weeklyData = {};
    appState.progressData.forEach(entry => {
        const date = utils.parseDate(entry.date);
        const weekStart = utils.getWeekStart(date);
        const weekKey = utils.formatDate(weekStart);
        
        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = 0;
        }
        weeklyData[weekKey] += entry.questions;
    });
    
    const sortedWeeks = Object.keys(weeklyData).sort().slice(-8);
    
    appState.charts.weekly = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: sortedWeeks.map(week => `Week of ${week}`),
            datasets: [{
                label: 'Weekly Questions',
                data: sortedWeeks.map(week => weeklyData[week]),
                backgroundColor: '#FFC185'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
};

const createTargetChart = () => {
    const ctx = document.getElementById('targetChart');
    if (!ctx) return;
    
    if (appState.charts.target) {
        appState.charts.target.destroy();
    }
    
    const last14Days = appState.progressData.slice(-14);
    
    appState.charts.target = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: last14Days.map(entry => entry.date),
            datasets: [
                {
                    label: 'Target',
                    data: last14Days.map(entry => entry.target),
                    backgroundColor: 'rgba(180, 65, 60, 0.7)',
                    borderColor: '#B4413C'
                },
                {
                    label: 'Actual',
                    data: last14Days.map(entry => entry.questions),
                    backgroundColor: 'rgba(31, 184, 205, 0.7)',
                    borderColor: '#1FB8CD'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
};

// Simplified chart functions for radar, heatmap, goal, and prediction charts
const createRadarChart = () => {
    const ctx = document.getElementById('radarChart');
    if (!ctx || !Chart) return;
    
    if (appState.charts.radar) {
        appState.charts.radar.destroy();
    }
    
    const subjects = ['Physics', 'Chemistry', 'Mathematics'];
    const subjectPerformance = {};
    
    subjects.forEach(subject => {
        const subjectData = appState.progressData
            .filter(entry => entry.subjects[subject] > 0)
            .map(entry => entry.subjects[subject]);
        subjectPerformance[subject] = subjectData.length ? 
            subjectData.reduce((a, b) => a + b) / subjectData.length : 0;
    });
    
    appState.charts.radar = new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: subjects,
            datasets: [{
                label: 'Average Performance',
                data: subjects.map(subject => subjectPerformance[subject]),
                backgroundColor: 'rgba(31, 184, 205, 0.2)',
                borderColor: '#1FB8CD',
                pointBackgroundColor: '#1FB8CD'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                r: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
};

// Placeholder functions for remaining charts
const createHeatmapChart = () => {
    const ctx = document.getElementById('heatmapChart');
    if (!ctx) return;
    
    // Simple scatter plot as heatmap substitute
    const currentDate = new Date();
    const monthData = [];
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        const dateStr = utils.formatDate(date);
        const entry = appState.progressData.find(e => e.date === dateStr);
        
        monthData.push({
            x: date.getDate(),
            y: date.getDay(),
            questions: entry ? entry.questions : 0
        });
    }
    
    if (appState.charts.heatmap) {
        appState.charts.heatmap.destroy();
    }
    
    appState.charts.heatmap = new Chart(ctx.getContext('2d'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Daily Questions',
                data: monthData.map(d => ({ x: d.x, y: d.y })),
                backgroundColor: monthData.map(d => {
                    const alpha = Math.min(d.questions / 60, 1);
                    return `rgba(31, 184, 205, ${alpha})`;
                }),
                pointRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'Day of Month', color: 'white' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    title: { display: true, text: 'Day of Week', color: 'white' },
                    ticks: { 
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            return days[value] || value;
                        }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
};

const createGoalChart = () => {
    const ctx = document.getElementById('goalChart');
    if (!ctx) return;
    
    if (appState.charts.goal) {
        appState.charts.goal.destroy();
    }
    
    const goalAchievement = appState.progressData.map(entry => ({
        date: entry.date,
        percentage: Math.min((entry.questions / entry.target) * 100, 150) // Cap at 150% for better visualization
    }));
    
    appState.charts.goal = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: goalAchievement.map(g => g.date),
            datasets: [{
                label: 'Goal Achievement %',
                data: goalAchievement.map(g => g.percentage),
                borderColor: '#ECEBD5',
                backgroundColor: 'rgba(236, 235, 213, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: '100% Target Line',
                data: goalAchievement.map(() => 100),
                borderColor: '#B4413C',
                borderDash: [10, 5],
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
};

const createPredictionChart = () => {
    const ctx = document.getElementById('predictionChart');
    if (!ctx) return;
    
    if (appState.charts.prediction) {
        appState.charts.prediction.destroy();
    }
    
    const last14Days = appState.progressData.slice(-14);
    const avg = last14Days.reduce((sum, entry) => sum + entry.questions, 0) / last14Days.length;
    
    // Generate prediction for next 7 days
    const predictions = [];
    for (let i = 1; i <= 7; i++) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i);
        predictions.push({
            date: utils.formatDate(futureDate),
            predicted: Math.round(avg + (Math.random() - 0.5) * 10) // Simple prediction with variance
        });
    }
    
    appState.charts.prediction = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [...last14Days.map(entry => entry.date), ...predictions.map(p => p.date)],
            datasets: [{
                label: 'Historical',
                data: [...last14Days.map(entry => entry.questions), ...Array(7).fill(null)],
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                fill: false
            }, {
                label: 'Predicted',
                data: [...Array(14).fill(null), ...predictions.map(p => p.predicted)],
                borderColor: '#DB4545',
                backgroundColor: 'rgba(219, 69, 69, 0.1)',
                borderDash: [5, 5],
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
};

// Data export/import functions
const exportDataJSON = () => {
    const data = {
        progressData: appState.progressData,
        todos: appState.todos,
        settings: appState.settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jee-tracker-data-${utils.getToday()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    utils.showNotification('Data exported successfully!', 'success');
};

const exportDataCSV = () => {
    const csvRows = [
        ['Date', 'Total Questions', 'Physics', 'Chemistry', 'Mathematics', 'Target', 'Goal Achieved']
    ];
    
    appState.progressData.forEach(entry => {
        csvRows.push([
            entry.date,
            entry.questions,
            entry.subjects.Physics || 0,
            entry.subjects.Chemistry || 0,
            entry.subjects.Mathematics || 0,
            entry.target,
            entry.questions >= entry.target ? 'Yes' : 'No'
        ]);
    });
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jee-tracker-progress-${utils.getToday()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    utils.showNotification('Progress data exported to CSV!', 'success');
};

const backupData = () => {
    const data = {
        progressData: appState.progressData,
        todos: appState.todos,
        settings: appState.settings,
        user: appState.user ? {
            uid: appState.user.uid,
            email: appState.user.email,
            displayName: appState.user.displayName
        } : null,
        backupDate: new Date().toISOString(),
        version: '2.0'
    };
    
    storage.save('backup', data);
    utils.showNotification('Data backed up locally!', 'success');
};

const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.progressData) appState.progressData = data.progressData;
            if (data.todos) appState.todos = data.todos;
            if (data.settings) appState.settings = { ...CONFIG.defaultSettings, ...data.settings };
            
            updateDashboardStats();
            updateTodayProgress();
            renderCalendar();
            renderTodos();
            
            storage.save('progressData', appState.progressData);
            storage.save('todos', appState.todos);
            storage.save('settings', appState.settings);
            
            utils.showNotification('Data imported successfully!', 'success');
        } catch (error) {
            utils.showNotification('Failed to import data. Invalid file format.', 'error');
        }
    };
    reader.readAsText(file);
};

// Calendar functionality
const renderCalendar = () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('currentMonth');
    
    if (!calendarGrid || !monthYear) return;
    
    const year = appState.currentMonth.getFullYear();
    const month = appState.currentMonth.getMonth();
    
    monthYear.textContent = `${appState.currentMonth.toLocaleString('default', { month: 'long' })} ${year}`;
    
    calendarGrid.innerHTML = '';
    
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        dayHeader.style.cssText = `
            padding: 12px;
            text-align: center;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.8);
            background: rgba(255, 255, 255, 0.1);
            border-radius: 6px;
        `;
        calendarGrid.appendChild(dayHeader);
    });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        const dayDate = utils.formatDate(new Date(year, month, day));
        const progressEntry = appState.progressData.find(entry => entry.date === dayDate);
        const today = utils.getToday();
        
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.dataset.date = dayDate;
        
        if (progressEntry) {
            const questions = progressEntry.questions;
            if (questions === 0) {
                dayElement.classList.add('no-data');
            } else if (questions <= 20) {
                dayElement.classList.add('low');
            } else if (questions <= 40) {
                dayElement.classList.add('medium');
            } else if (questions <= 60) {
                dayElement.classList.add('high');
            } else {
                dayElement.classList.add('very-high');
            }
        } else {
            dayElement.classList.add('no-data');
        }
        
        if (dayDate === today) {
            dayElement.classList.add('today');
        }
        
        dayElement.addEventListener('click', () => openDayModal(dayDate));
        calendarGrid.appendChild(dayElement);
    }
};

const changeMonth = (direction) => {
    appState.currentMonth.setMonth(appState.currentMonth.getMonth() + direction);
    renderCalendar();
};

const openDayModal = (date) => {
    const modal = document.getElementById('dayModal');
    if (!modal) return;
    
    const entry = appState.progressData.find(item => item.date === date);
    
    const modalDateEl = document.getElementById('modalDate');
    if (modalDateEl) {
        modalDateEl.textContent = new Date(date + 'T00:00:00').toLocaleDateString();
    }
    
    const modalQuestions = document.getElementById('modalQuestions');
    const modalPhysics = document.getElementById('modalPhysics');
    const modalChemistry = document.getElementById('modalChemistry');
    const modalMath = document.getElementById('modalMath');
    
    if (entry) {
        if (modalQuestions) modalQuestions.value = entry.questions;
        if (modalPhysics) modalPhysics.value = entry.subjects.Physics || 0;
        if (modalChemistry) modalChemistry.value = entry.subjects.Chemistry || 0;
        if (modalMath) modalMath.value = entry.subjects.Mathematics || 0;
    } else {
        [modalQuestions, modalPhysics, modalChemistry, modalMath].forEach(input => {
            if (input) input.value = '';
        });
    }
    
    modal.dataset.date = date;
    modal.classList.remove('hidden');
};

const closeModal = () => {
    const modal = document.getElementById('dayModal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

const saveModalProgress = async () => {
    const modal = document.getElementById('dayModal');
    if (!modal) return;
    
    const date = modal.dataset.date;
    
    const modalQuestions = document.getElementById('modalQuestions');
    const modalPhysics = document.getElementById('modalPhysics');
    const modalChemistry = document.getElementById('modalChemistry');
    const modalMath = document.getElementById('modalMath');
    
    const questions = modalQuestions ? parseInt(modalQuestions.value) || 0 : 0;
    const physics = modalPhysics ? parseInt(modalPhysics.value) || 0 : 0;
    const chemistry = modalChemistry ? parseInt(modalChemistry.value) || 0 : 0;
    const math = modalMath ? parseInt(modalMath.value) || 0 : 0;
    
    const subjects = {
        Physics: physics,
        Chemistry: chemistry,
        Mathematics: math
    };
    
    const progressEntry = {
        date,
        questions,
        target: appState.settings.dailyTarget,
        subjects
    };
    
    const existingIndex = appState.progressData.findIndex(entry => entry.date === date);
    if (existingIndex >= 0) {
        appState.progressData[existingIndex] = progressEntry;
    } else {
        appState.progressData.push(progressEntry);
    }
    
    appState.progressData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    storage.save('progressData', appState.progressData);
    
    try {
        await FirebaseDB.saveProgressEntry(progressEntry);
    } catch (error) {
        console.log('Firebase save failed, data saved locally');
    }
    
    updateDashboardStats();
    updateTodayProgress();
    renderCalendar();
    closeModal();
    
    utils.showNotification('Progress updated successfully!', 'success');
};

// Todo management
const addTodo = async () => {
    const taskInput = document.getElementById('todoTask');
    const subjectSelect = document.getElementById('todoSubject');
    const prioritySelect = document.getElementById('todoPriority');
    const dueDateInput = document.getElementById('todoDueDate');
    
    if (!taskInput) return;
    
    const task = taskInput.value.trim();
    const subject = subjectSelect ? subjectSelect.value : 'General';
    const priority = prioritySelect ? prioritySelect.value : 'Medium';
    const dueDate = dueDateInput ? dueDateInput.value : '';
    
    if (!task) {
        utils.showNotification('Please enter a task description', 'error');
        return;
    }
    
    const newTodo = {
        id: Date.now(),
        task,
        subject,
        priority,
        dueDate,
        completed: false
    };
    
    appState.todos.push(newTodo);
    
    storage.save('todos', appState.todos);
    
    try {
        await FirebaseDB.saveTodo(newTodo);
    } catch (error) {
        console.log('Firebase todo save failed, saved locally');
    }
    
    renderTodos();
    
    // Clear form
    taskInput.value = '';
    if (subjectSelect) subjectSelect.value = 'General';
    if (prioritySelect) prioritySelect.value = 'Medium';
    if (dueDateInput) dueDateInput.value = '';
    
    utils.showNotification('Task added successfully!', 'success');
};

const renderTodos = (filter = 'all') => {
    const container = document.getElementById('todosContainer');
    if (!container) return;
    
    let filteredTodos = [...appState.todos];
    
    switch (filter) {
        case 'pending':
            filteredTodos = filteredTodos.filter(todo => !todo.completed);
            break;
        case 'completed':
            filteredTodos = filteredTodos.filter(todo => todo.completed);
            break;
        case 'high':
            filteredTodos = filteredTodos.filter(todo => todo.priority === 'High');
            break;
    }
    
    container.innerHTML = '';
    
    if (filteredTodos.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: rgba(255, 255, 255, 0.5); padding: 20px;">No tasks found</div>';
        return;
    }
    
    filteredTodos.forEach(todo => {
        const todoElement = document.createElement('div');
        todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        todoElement.innerHTML = `
            <div class="todo-header">
                <div class="todo-task">${todo.task}</div>
                <div class="todo-actions">
                    <button class="todo-btn" onclick="toggleTodo(${todo.id})" title="${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                        ${todo.completed ? '↶' : '✓'}
                    </button>
                    <button class="todo-btn" onclick="deleteTodo(${todo.id})" title="Delete task">×</button>
                </div>
            </div>
            <div class="todo-meta">
                <span class="todo-priority ${todo.priority.toLowerCase()}">${todo.priority}</span>
                <span class="todo-subject">${todo.subject}</span>
                ${todo.dueDate ? `<span class="todo-due">Due: ${todo.dueDate}</span>` : ''}
            </div>
        `;
        
        container.appendChild(todoElement);
    });
};

const toggleTodo = async (id) => {
    const todo = appState.todos.find(item => item.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        
        storage.save('todos', appState.todos);
        
        try {
            await FirebaseDB.saveTodo(todo);
        } catch (error) {
            console.log('Firebase todo update failed, saved locally');
        }
        
        renderTodos();
        utils.showNotification(`Task ${todo.completed ? 'completed' : 'reopened'}!`, 'success');
    }
};

const deleteTodo = async (id) => {
    appState.todos = appState.todos.filter(item => item.id !== id);
    
    storage.save('todos', appState.todos);
    
    try {
        await FirebaseDB.deleteTodo(id);
    } catch (error) {
        console.log('Firebase todo delete failed, deleted locally');
    }
    
    renderTodos();
    utils.showNotification('Task deleted!', 'success');
};

const filterTodos = (filter) => {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    renderTodos(filter);
};

// Theme management
const toggleTheme = () => {
    const currentTheme = appState.settings.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    appState.settings.theme = newTheme;
    document.documentElement.setAttribute('data-color-scheme', newTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
    }
    
    storage.save('settings', appState.settings);
    
    try {
        FirebaseDB.saveSettings(appState.settings);
    } catch (error) {
        console.log('Firebase settings save failed, saved locally');
    }
};

// Make functions globally available
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
