// Enhanced JEE 2026 Comprehensive Tracker with Chapter Management - FIXED VERSION
let firebaseInitialized = false;
let auth, db;

// Configuration and Data
const CONFIG = {
    examDates: {
        jeeMain1: new Date('2026-01-20T09:00:00'),
        jeeMain2: new Date('2026-04-01T09:00:00'),
        jeeAdvanced: new Date('2026-05-18T09:00:00')
    },
    defaultSettings: {
        dailyTarget: 50,
        theme: 'dark'
    },
    motivationalQuotes: [
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "The expert in anything was once a beginner.",
        "Don't watch the clock; do what it does. Keep going.",
        "Believe you can and you're halfway there.",
        "Champions keep playing until they get it right.",
        "Every accomplishment starts with the decision to try.",
        "Success is the sum of small efforts repeated day in and day out.",
        "The only impossible journey is the one you never begin."
    ],
    subjects: {
        physics: {
            name: "Physics",
            chapters: [
                { id: "mech", name: "Mechanics", topics: ["Kinematics", "Laws of Motion", "Work Energy Power", "Rotational Motion", "Gravitation"] },
                { id: "thermo", name: "Thermodynamics", topics: ["Thermal Properties", "Kinetic Theory", "Thermodynamics Laws"] },
                { id: "waves", name: "Waves and Oscillations", topics: ["SHM", "Wave Motion", "Sound Waves"] },
                { id: "electro", name: "Electrostatics", topics: ["Electric Charge", "Electric Field", "Electric Potential", "Capacitor"] },
                { id: "current", name: "Current Electricity", topics: ["Ohm's Law", "Resistance", "DC Circuits"] },
                { id: "magnetic", name: "Magnetic Effects", topics: ["Magnetic Field", "Force on Current", "Electromagnetic Induction"] },
                { id: "ac", name: "Alternating Current", topics: ["AC Circuits", "LC Oscillations", "Transformers"] },
                { id: "emwaves", name: "Electromagnetic Waves", topics: ["Wave Properties", "Spectrum"] },
                { id: "optics", name: "Optics", topics: ["Reflection", "Refraction", "Interference", "Diffraction"] },
                { id: "modern", name: "Modern Physics", topics: ["Photoelectric Effect", "Bohr Model", "Nuclear Physics"] }
            ]
        },
        chemistry: {
            name: "Chemistry",
            chapters: [
                { id: "atomic", name: "Atomic Structure", topics: ["Bohr Model", "Quantum Numbers", "Electronic Configuration"] },
                { id: "bonding", name: "Chemical Bonding", topics: ["Ionic Bonding", "Covalent Bonding", "Molecular Orbital Theory"] },
                { id: "periodic", name: "Periodic Properties", topics: ["Trends", "Periodicity"] },
                { id: "equilibrium", name: "Chemical Equilibrium", topics: ["Equilibrium Constant", "Le Chatelier Principle"] },
                { id: "ionic", name: "Ionic Equilibrium", topics: ["Acids", "Bases", "Buffer Solutions"] },
                { id: "thermochem", name: "Thermodynamics", topics: ["Enthalpy", "Entropy", "Gibbs Free Energy"] },
                { id: "kinetics", name: "Chemical Kinetics", topics: ["Rate of Reaction", "Order", "Mechanism"] },
                { id: "electrochem", name: "Electrochemistry", topics: ["Galvanic Cells", "Electrolysis", "Batteries"] },
                { id: "solid", name: "Solid State", topics: ["Crystal Lattice", "Unit Cell", "Defects"] },
                { id: "solutions", name: "Solutions", topics: ["Concentration", "Colligative Properties"] },
                { id: "surface", name: "Surface Chemistry", topics: ["Adsorption", "Catalysis", "Colloids"] },
                { id: "goc", name: "General Organic Chemistry", topics: ["Nomenclature", "Isomerism", "Electronic Effects"] },
                { id: "hydrocarbons", name: "Hydrocarbons", topics: ["Alkanes", "Alkenes", "Alkynes", "Aromatic"] },
                { id: "organic", name: "Organic Functional Groups", topics: ["Alcohols", "Ethers", "Aldehydes", "Ketones"] },
                { id: "biomolecules", name: "Biomolecules", topics: ["Carbohydrates", "Proteins", "Nucleic Acids"] },
                { id: "everyday", name: "Chemistry in Everyday Life", topics: ["Drugs", "Soaps", "Polymers"] },
                { id: "coordination", name: "Coordination Compounds", topics: ["Werner Theory", "IUPAC", "Bonding"] },
                { id: "pblock", name: "P-Block Elements", topics: ["Groups 13-18", "Properties"] },
                { id: "dblock", name: "D and F Block Elements", topics: ["Transition Elements", "Lanthanides"] },
                { id: "metallurgy", name: "Metallurgy", topics: ["Extraction", "Refining"] }
            ]
        },
        mathematics: {
            name: "Mathematics", 
            chapters: [
                { id: "sets", name: "Sets Relations Functions", topics: ["Set Theory", "Relations", "Functions"] },
                { id: "complex", name: "Complex Numbers", topics: ["Algebra", "Argand Plane", "De Moivre"] },
                { id: "quadratic", name: "Quadratic Equations", topics: ["Nature of Roots", "Applications"] },
                { id: "sequences", name: "Sequences and Series", topics: ["AP", "GP", "HP"] },
                { id: "permutations", name: "Permutations Combinations", topics: ["Fundamental Principle", "Applications"] },
                { id: "binomial", name: "Binomial Theorem", topics: ["Expansions", "Properties"] },
                { id: "matrices", name: "Matrices Determinants", topics: ["Operations", "Properties", "Cramer's Rule"] },
                { id: "probability", name: "Probability", topics: ["Basic Concepts", "Conditional Probability", "Bayes"] },
                { id: "trigonometry", name: "Trigonometry", topics: ["Ratios", "Identities", "Equations"] },
                { id: "coordinate", name: "Coordinate Geometry", topics: ["Straight Line", "Circle", "Conic Sections"] },
                { id: "limits", name: "Limits Continuity", topics: ["Definition", "Properties", "Applications"] },
                { id: "differentiation", name: "Differentiation", topics: ["Rules", "Applications", "Mean Value Theorems"] },
                { id: "integration", name: "Integration", topics: ["Techniques", "Definite Integration", "Applications"] },
                { id: "differential", name: "Differential Equations", topics: ["Formation", "Solution Methods"] },
                { id: "vectors", name: "Vector Algebra", topics: ["Operations", "Scalar Product", "Vector Product"] },
                { id: "3d", name: "3D Geometry", topics: ["Direction Cosines", "Planes", "Lines"] },
                { id: "statistics", name: "Statistics", topics: ["Central Tendency", "Dispersion"] },
                { id: "reasoning", name: "Mathematical Reasoning", topics: ["Logical Statements", "Quantifiers"] }
            ]
        }
    },
    pyqYears: ["2019", "2020", "2021", "2022", "2023", "2024"],
    examTypes: ["JEE Main", "JEE Advanced"]
};

// Application State
let appState = {
    currentSection: 'dashboard',
    progressData: [],
    todos: [],
    chapterData: {},
    settings: { ...CONFIG.defaultSettings },
    currentMonth: new Date(),
    charts: {},
    user: null,
    isOnline: navigator.onLine,
    syncQueue: [],
    lastSyncTime: null,
    retryCount: 0,
    authRetryCount: 0,
    isInitialized: false
};

// Utility Functions
const utils = {
    formatDate: (date) => date.toISOString().split('T')[0],
    parseDate: (dateString) => new Date(dateString + 'T00:00:00'),
    getToday: () => utils.formatDate(new Date()),
    
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;margin-left:12px;cursor:pointer;">&times;</button>
        `;
        
        const colors = {
            error: '#ff4444',
            success: '#44ff44', 
            info: '#4444ff',
            warning: '#ffaa44'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            border-left: 4px solid ${colors[type] || colors.info};
            z-index: 3000;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        // Add animation keyframe
        if (!document.getElementById('notificationStyles')) {
            const style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
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
    }
};

// Enhanced Firebase Authentication
const FirebaseAuth = {
    provider: null,
    isInitialized: false,
    
    async waitForFirebase() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max
            
            const check = () => {
                attempts++;
                if (window.firebaseApp && window.auth && window.db) {
                    auth = window.auth;
                    db = window.db;
                    firebaseInitialized = true;
                    resolve(true);
                } else if (window.firebaseError || attempts >= maxAttempts) {
                    console.error('Firebase initialization failed:', window.firebaseError);
                    resolve(false);
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    },
    
    async initializeAuth() {
        if (this.isInitialized) return true;
        
        try {
            const available = await this.waitForFirebase();
            if (!available) {
                console.warn('Firebase not available, continuing with demo mode');
                this.showAuthModal();
                return false;
            }
            
            const { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, 
                    createUserWithEmailAndPassword, signOut, onAuthStateChanged } = 
                    await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            
            this.provider = new GoogleAuthProvider();
            this.signInWithPopup = signInWithPopup;
            this.signInWithEmailAndPassword = signInWithEmailAndPassword;
            this.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
            this.signOut = signOut;
            this.onAuthStateChanged = onAuthStateChanged;
            
            // Setup auth state listener
            this.onAuthStateChanged(auth, (user) => {
                console.log('Auth state changed:', user?.email || 'No user');
                appState.user = user;
                this.updateUI();
                
                if (user) {
                    updateConnectionStatus('connected');
                    this.syncUserData();
                } else {
                    updateConnectionStatus('offline');
                    // Show auth modal only if not in demo mode
                    if (!appState.user || !appState.user.isDemo) {
                        this.showAuthModal();
                    }
                }
            });
            
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Auth initialization error:', error);
            this.showAuthError('googleAuthError', 'Authentication system unavailable. Please try demo mode.');
            this.showAuthModal();
            return false;
        }
    },
    
    async signInWithGoogle() {
        try {
            this.clearAuthError('googleAuthError');
            updateConnectionStatus('connecting');
            
            if (!this.provider) {
                const initialized = await this.initializeAuth();
                if (!initialized) throw new Error('Auth system unavailable');
            }
            
            const result = await this.signInWithPopup(auth, this.provider);
            appState.user = result.user;
            appState.authRetryCount = 0;
            
            utils.showNotification(`Welcome ${result.user.displayName}!`, 'success');
            this.hideAuthModal();
            await this.syncUserData();
            
            return result.user;
        } catch (error) {
            console.error('Google sign in error:', error);
            
            const errorMessages = {
                'auth/popup-blocked': 'Popup was blocked. Please allow popups and try again.',
                'auth/popup-closed-by-user': 'Sign-in was cancelled.',
                'auth/network-request-failed': 'Network error. Please check your connection.',
                'auth/too-many-requests': 'Too many attempts. Please try again later.',
                'auth/internal-error': 'Internal error. Please try again or use email sign-in.'
            };
            
            const message = errorMessages[error.code] || 'Google sign-in failed. Please try again.';
            this.showAuthError('googleAuthError', message);
            updateConnectionStatus('offline');
            
            appState.authRetryCount++;
            if (appState.authRetryCount >= 3) {
                this.showTroubleshooting();
            }
            
            throw error;
        }
    },
    
    async signInWithEmail() {
        try {
            this.clearAuthError('emailAuthError');
            
            const email = document.getElementById('emailInput')?.value;
            const password = document.getElementById('passwordInput')?.value;
            
            if (!email || !password) {
                throw new Error('Please enter both email and password');
            }
            
            updateConnectionStatus('connecting');
            
            if (!this.signInWithEmailAndPassword) {
                const initialized = await this.initializeAuth();
                if (!initialized) throw new Error('Auth system unavailable');
            }
            
            const result = await this.signInWithEmailAndPassword(auth, email, password);
            appState.user = result.user;
            
            utils.showNotification('Successfully signed in!', 'success');
            this.hideAuthModal();
            await this.syncUserData();
            
            return result.user;
        } catch (error) {
            console.error('Email sign in error:', error);
            
            const errorMessages = {
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password.',
                'auth/invalid-email': 'Invalid email address.',
                'auth/too-many-requests': 'Too many failed attempts. Try again later.',
                'auth/network-request-failed': 'Network error. Please check your connection.'
            };
            
            const message = errorMessages[error.code] || error.message || 'Sign-in failed. Please try again.';
            this.showAuthError('emailAuthError', message);
            updateConnectionStatus('offline');
            
            throw error;
        }
    },
    
    async signUpWithEmail() {
        try {
            this.clearAuthError('emailAuthError');
            
            const email = document.getElementById('emailInput')?.value;
            const password = document.getElementById('passwordInput')?.value;
            
            if (!email || !password) {
                throw new Error('Please enter both email and password');
            }
            
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }
            
            updateConnectionStatus('connecting');
            
            if (!this.createUserWithEmailAndPassword) {
                const initialized = await this.initializeAuth();
                if (!initialized) throw new Error('Auth system unavailable');
            }
            
            const result = await this.createUserWithEmailAndPassword(auth, email, password);
            appState.user = result.user;
            
            utils.showNotification('Account created successfully!', 'success');
            this.hideAuthModal();
            await this.syncUserData();
            
            return result.user;
        } catch (error) {
            console.error('Email sign up error:', error);
            
            const errorMessages = {
                'auth/email-already-in-use': 'An account already exists with this email.',
                'auth/invalid-email': 'Invalid email address.',
                'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
                'auth/network-request-failed': 'Network error. Please check your connection.'
            };
            
            const message = errorMessages[error.code] || error.message || 'Sign-up failed. Please try again.';
            this.showAuthError('emailAuthError', message);
            updateConnectionStatus('offline');
            
            throw error;
        }
    },
    
    async signOutUser() {
        try {
            if (this.signOut && appState.user && !appState.user.isDemo) {
                await this.signOut(auth);
            }
            
            appState.user = null;
            appState.progressData = [];
            appState.todos = [];
            appState.chapterData = {};
            
            this.updateUI();
            updateDashboardStats();
            updateSubjectProgress();
            renderTodos();
            this.showAuthModal();
            
            utils.showNotification('Successfully signed out!', 'success');
            updateConnectionStatus('offline');
        } catch (error) {
            console.error('Sign out error:', error);
            utils.showNotification('Sign out failed.', 'error');
        }
    },
    
    enterDemoMode() {
        appState.user = { uid: 'demo', email: 'demo@jeetracker.com', displayName: 'Demo User', isDemo: true };
        this.updateUI();
        this.hideAuthModal();
        updateConnectionStatus('offline');
        
        // Load sample data for demo
        loadSampleData();
        loadSampleChapterData();
        
        // Update all displays
        updateDashboardStats();
        updateTodayProgress();
        updateSubjectProgress();
        renderTodos();
        renderChapters();
        
        utils.showNotification('Demo Mode Active - Data will not sync across devices', 'info');
    },
    
    updateUI() {
        const authModal = document.getElementById('authModal');
        const userInfo = document.getElementById('userInfo');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        
        if (appState.user) {
            if (userInfo) {
                userInfo.style.display = 'flex';
                if (userAvatar && appState.user.photoURL) {
                    userAvatar.src = appState.user.photoURL;
                }
                if (userName) {
                    userName.textContent = appState.user.displayName || appState.user.email || 'User';
                }
            }
        } else {
            if (userInfo) userInfo.style.display = 'none';
        }
    },
    
    showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },
    
    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },
    
    showAuthError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    },
    
    clearAuthError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
        }
    },
    
    showTroubleshooting() {
        const troubleshooting = document.getElementById('troubleshooting');
        if (troubleshooting) {
            troubleshooting.classList.remove('hidden');
        }
    },
    
    async syncUserData() {
        if (!appState.user || appState.user.isDemo) return;
        
        try {
            await Promise.all([
                FirebaseDB.loadProgressData(),
                FirebaseDB.loadTodos(),
                FirebaseDB.loadChapterData(),
                FirebaseDB.loadSettings()
            ]);
            
            updateDashboardStats();
            updateTodayProgress();
            updateSubjectProgress();
            renderCalendar();
            renderTodos();
            renderChapters();
            
            appState.lastSyncTime = new Date();
        } catch (error) {
            console.error('Sync error:', error);
            utils.showNotification('Failed to sync some data. Working offline.', 'warning');
        }
    }
};

// Enhanced Firebase Database Operations
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
        if (!appState.user || appState.user.isDemo) {
            storage.save('progressData', appState.progressData);
            return;
        }
        
        try {
            await this.initializeFirestore();
            const { doc, setDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'progress', entry.date);
            await setDoc(docRef, entry);
        } catch (error) {
            console.error('Error saving progress:', error);
            storage.save('progressData', appState.progressData);
            throw error;
        }
    },
    
    async loadProgressData() {
        if (!appState.user || appState.user.isDemo) return;
        
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
        } catch (error) {
            console.error('Error loading progress data:', error);
            throw error;
        }
    },
    
    async saveChapterData(chapterData) {
        if (!appState.user || appState.user.isDemo) {
            storage.save('chapterData', appState.chapterData);
            return;
        }
        
        try {
            await this.initializeFirestore();
            const { doc, setDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'chapters', 'data');
            await setDoc(docRef, chapterData);
        } catch (error) {
            console.error('Error saving chapter data:', error);
            storage.save('chapterData', appState.chapterData);
            throw error;
        }
    },
    
    async loadChapterData() {
        if (!appState.user || appState.user.isDemo) return;
        
        try {
            await this.initializeFirestore();
            const { doc, getDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'chapters', 'data');
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                appState.chapterData = docSnap.data();
            }
        } catch (error) {
            console.error('Error loading chapter data:', error);
            throw error;
        }
    },
    
    async saveTodo(todo) {
        if (!appState.user || appState.user.isDemo) {
            storage.save('todos', appState.todos);
            return;
        }
        
        try {
            await this.initializeFirestore();
            const { doc, setDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'todos', todo.id.toString());
            await setDoc(docRef, todo);
        } catch (error) {
            console.error('Error saving todo:', error);
            storage.save('todos', appState.todos);
            throw error;
        }
    },
    
    async deleteTodo(todoId) {
        if (!appState.user || appState.user.isDemo) {
            storage.save('todos', appState.todos);
            return;
        }
        
        try {
            await this.initializeFirestore();
            const { doc, deleteDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'todos', todoId.toString());
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting todo:', error);
            storage.save('todos', appState.todos);
            throw error;
        }
    },
    
    async loadTodos() {
        if (!appState.user || appState.user.isDemo) return;
        
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
        if (!appState.user || appState.user.isDemo) {
            storage.save('settings', appState.settings);
            return;
        }
        
        try {
            await this.initializeFirestore();
            const { doc, setDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'settings', 'userSettings');
            await setDoc(docRef, settings);
        } catch (error) {
            console.error('Error saving settings:', error);
            storage.save('settings', appState.settings);
            throw error;
        }
    },
    
    async loadSettings() {
        if (!appState.user || appState.user.isDemo) return;
        
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
    }
};

// Connection Status Management
const updateConnectionStatus = (status) => {
    const indicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const retryBtn = document.getElementById('retryBtn');
    
    if (!indicator || !statusText) return;
    
    indicator.className = 'status-indicator';
    if (retryBtn) retryBtn.classList.add('hidden');
    
    switch (status) {
        case 'connected':
            indicator.classList.add('connected');
            statusText.textContent = appState.user?.isDemo ? 'Demo Mode' : 'Connected';
            break;
        case 'connecting':
            statusText.textContent = 'Connecting...';
            break;
        case 'offline':
            indicator.classList.add('offline');
            statusText.textContent = 'Offline Mode';
            if (!appState.user?.isDemo && retryBtn) {
                retryBtn.classList.remove('hidden');
            }
            break;
        default:
            statusText.textContent = 'Unknown';
    }
};

// Local Storage
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

// Application Initialization
const init = async () => {
    console.log('Initializing JEE 2026 Tracker...');
    
    // Load local state first
    loadAppState();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start countdowns and quotes
    startCountdowns();
    updateMotivationalQuote();
    
    // Set current date
    const questionDateInput = document.getElementById('questionDate');
    if (questionDateInput) {
        questionDateInput.value = utils.getToday();
    }
    
    // Show dashboard by default
    showSection('dashboard');
    
    // Always show auth modal initially (will be hidden if user is logged in)
    FirebaseAuth.showAuthModal();
    
    // Initialize Firebase Auth
    try {
        const initialized = await FirebaseAuth.initializeAuth();
        if (!initialized) {
            console.warn('Firebase unavailable, demo mode available');
            updateConnectionStatus('offline');
        }
    } catch (error) {
        console.error('Firebase initialization error:', error);
        updateConnectionStatus('offline');
    }
    
    // Network listeners
    window.addEventListener('online', () => {
        appState.isOnline = true;
        if (appState.user && !appState.user.isDemo) {
            updateConnectionStatus('connected');
        }
    });
    
    window.addEventListener('offline', () => {
        appState.isOnline = false;
        updateConnectionStatus('offline');
    });
    
    appState.isInitialized = true;
    console.log('App initialized successfully');
};

// Load Application State
const loadAppState = () => {
    appState.progressData = storage.load('progressData', []);
    appState.todos = storage.load('todos', []);
    appState.chapterData = storage.load('chapterData', {});
    appState.settings = { ...CONFIG.defaultSettings, ...storage.load('settings', {}) };
    
    const targetInput = document.getElementById('dailyTarget');
    if (targetInput) {
        targetInput.value = appState.settings.dailyTarget;
    }
    
    updateDashboardStats();
    updateTodayProgress();
    updateSubjectProgress();
    renderCalendar();
    renderTodos();
    renderChapters();
};

// Sample Data Functions
const loadSampleData = () => {
    const sampleProgressData = [
        {"date": "2025-08-20", "questions": 45, "target": 50, "subjects": {"Physics": 15, "Chemistry": 20, "Mathematics": 10}},
        {"date": "2025-08-21", "questions": 52, "target": 50, "subjects": {"Physics": 18, "Chemistry": 16, "Mathematics": 18}},
        {"date": "2025-08-22", "questions": 61, "target": 50, "subjects": {"Physics": 20, "Chemistry": 21, "Mathematics": 20}}
    ];
    
    const sampleTodos = [
        {"id": 1, "task": "Complete Mechanics chapter revision", "priority": "High", "subject": "Physics", "completed": false, "dueDate": "2025-08-25"},
        {"id": 2, "task": "Practice Organic Chemistry reactions", "priority": "Medium", "subject": "Chemistry", "completed": false, "dueDate": "2025-08-24"}
    ];
    
    appState.progressData = sampleProgressData;
    appState.todos = sampleTodos;
};

const loadSampleChapterData = () => {
    // Sample chapter completion data
    const sampleChapterData = {
        physics_mech: { completed: true, confidence: 8, notes: "Good understanding of kinematics", pyq: { "jeeMain2023": true, "jeeMain2022": true } },
        chemistry_atomic: { completed: true, confidence: 7, notes: "Need more practice on quantum numbers", pyq: { "jeeMain2023": true } },
        mathematics_sets: { completed: false, confidence: 5, notes: "", pyq: {} }
    };
    
    appState.chapterData = sampleChapterData;
};

// Event Listeners Setup
const setupEventListeners = () => {
    // Navigation - FIXED
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            console.log('Navigating to section:', section);
            showSection(section);
        });
    });
    
    // Authentication
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const emailSignInBtn = document.getElementById('emailSignInBtn');
    const emailSignUpBtn = document.getElementById('emailSignUpBtn');
    const demoModeBtn = document.getElementById('demoModeBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const retryBtn = document.getElementById('retryBtn');
    
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', () => FirebaseAuth.signInWithGoogle().catch(console.error));
    }
    
    if (emailSignInBtn) {
        emailSignInBtn.addEventListener('click', () => FirebaseAuth.signInWithEmail().catch(console.error));
    }
    
    if (emailSignUpBtn) {
        emailSignUpBtn.addEventListener('click', () => FirebaseAuth.signUpWithEmail().catch(console.error));
    }
    
    if (demoModeBtn) {
        demoModeBtn.addEventListener('click', () => FirebaseAuth.enterDemoMode());
    }
    
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => FirebaseAuth.signOutUser().catch(console.error));
    }
    
    if (retryBtn) {
        retryBtn.addEventListener('click', () => FirebaseAuth.initializeAuth());
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
    
    // Auto-calculate total - FIXED
    ['physicsCount', 'chemistryCount', 'mathCount'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateTotal);
        }
    });
    
    // Export functionality
    const exportBtn = document.getElementById('exportBtn');
    const exportAllJSONBtn = document.getElementById('exportAllJSON');
    const exportProgressCSVBtn = document.getElementById('exportProgressCSV');
    const exportChaptersCSVBtn = document.getElementById('exportChaptersCSV');
    const backupDataBtn = document.getElementById('backupData');
    const closeExportModalBtn = document.getElementById('closeExportModal');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const modal = document.getElementById('exportModal');
            if (modal) modal.classList.remove('hidden');
        });
    }
    
    if (exportAllJSONBtn) exportAllJSONBtn.addEventListener('click', exportAllData);
    if (exportProgressCSVBtn) exportProgressCSVBtn.addEventListener('click', exportProgressCSV);
    if (exportChaptersCSVBtn) exportChaptersCSVBtn.addEventListener('click', exportChaptersCSV);
    if (backupDataBtn) backupDataBtn.addEventListener('click', backupData);
    if (closeExportModalBtn) {
        closeExportModalBtn.addEventListener('click', () => {
            const modal = document.getElementById('exportModal');
            if (modal) modal.classList.add('hidden');
        });
    }
    
    // Chapter data export/import
    const exportChapterDataBtn = document.getElementById('exportChapterData');
    const importChapterDataBtn = document.getElementById('importChapterData');
    const importChapterFileInput = document.getElementById('importChapterFile');
    
    if (exportChapterDataBtn) exportChapterDataBtn.addEventListener('click', exportChapterData);
    if (importChapterDataBtn) {
        importChapterDataBtn.addEventListener('click', () => {
            if (importChapterFileInput) importChapterFileInput.click();
        });
    }
    if (importChapterFileInput) importChapterFileInput.addEventListener('change', importChapterData);
    
    // Calendar
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));
    
    // Todo management
    const addTodoBtn = document.getElementById('addTodo');
    if (addTodoBtn) addTodoBtn.addEventListener('click', addTodo);
    
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
};

// Navigation - FIXED
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
        
        if (sectionName === 'chapters') {
            setTimeout(() => renderChapters(), 100);
        }
        
        console.log('Successfully switched to section:', sectionName);
    } else {
        console.error('Section not found:', sectionName);
    }
};

// Countdown Functions
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
        [daysEl, hoursEl, minutesEl, secondsEl].forEach(el => el.textContent = '00');
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

// Motivational Quotes
const updateMotivationalQuote = () => {
    const quoteElement = document.getElementById('motivationalQuote');
    if (quoteElement) {
        const randomQuote = CONFIG.motivationalQuotes[Math.floor(Math.random() * CONFIG.motivationalQuotes.length)];
        quoteElement.textContent = randomQuote;
    }
    setTimeout(updateMotivationalQuote, 30000);
};

// Chapter Management Functions
const renderChapters = () => {
    console.log('Rendering chapters...');
    Object.keys(CONFIG.subjects).forEach(subject => {
        renderSubjectChapters(subject);
    });
    updateSubjectProgress();
};

const renderSubjectChapters = (subject) => {
    const container = document.getElementById(`${subject}Chapters`);
    if (!container) {
        console.warn(`Container not found for ${subject}Chapters`);
        return;
    }
    
    console.log(`Rendering ${subject} chapters`);
    const subjectData = CONFIG.subjects[subject];
    container.innerHTML = '';
    
    subjectData.chapters.forEach(chapter => {
        const chapterKey = `${subject}_${chapter.id}`;
        const chapterData = appState.chapterData[chapterKey] || {
            completed: false,
            confidence: 5,
            notes: '',
            pyq: {}
        };
        
        const chapterElement = document.createElement('div');
        chapterElement.className = 'chapter-card';
        chapterElement.innerHTML = `
            <div class="chapter-header">
                <input type="checkbox" class="chapter-checkbox" id="checkbox_${chapterKey}" 
                       ${chapterData.completed ? 'checked' : ''}>
                <label for="checkbox_${chapterKey}" class="chapter-title">${chapter.name}</label>
            </div>
            <div class="chapter-topics">${chapter.topics.join(' • ')}</div>
            
            <div class="chapter-controls">
                <div class="confidence-control">
                    <span class="confidence-label">Confidence:</span>
                    <input type="range" class="confidence-slider" min="1" max="10" 
                           value="${chapterData.confidence}" id="confidence_${chapterKey}">
                    <span class="confidence-value" id="value_${chapterKey}">${chapterData.confidence}</span>
                </div>
                
                <div class="pyq-section">
                    <div class="pyq-group">
                        <h5>JEE Main PYQs</h5>
                        <div class="pyq-years">
                            ${CONFIG.pyqYears.map(year => `
                                <div class="pyq-year">
                                    <input type="checkbox" id="main_${chapterKey}_${year}" 
                                           ${chapterData.pyq[`jeeMain${year}`] ? 'checked' : ''}>
                                    <label for="main_${chapterKey}_${year}">${year}</label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="pyq-group">
                        <h5>JEE Advanced PYQs</h5>
                        <div class="pyq-years">
                            ${CONFIG.pyqYears.map(year => `
                                <div class="pyq-year">
                                    <input type="checkbox" id="adv_${chapterKey}_${year}" 
                                           ${chapterData.pyq[`jeeAdvanced${year}`] ? 'checked' : ''}>
                                    <label for="adv_${chapterKey}_${year}">${year}</label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="notes-section">
                    <label class="notes-label" for="notes_${chapterKey}">Personal Notes:</label>
                    <textarea class="notes-textarea" id="notes_${chapterKey}" 
                              placeholder="Add your notes, important points, or areas to review...">${chapterData.notes}</textarea>
                </div>
            </div>
        `;
        
        container.appendChild(chapterElement);
        
        // Add event listeners for this chapter
        setupChapterEventListeners(chapterKey);
    });
    
    console.log(`Rendered ${subjectData.chapters.length} chapters for ${subject}`);
};

const setupChapterEventListeners = (chapterKey) => {
    // Completion checkbox
    const checkbox = document.getElementById(`checkbox_${chapterKey}`);
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            updateChapterData(chapterKey, 'completed', checkbox.checked);
        });
    }
    
    // Confidence slider
    const slider = document.getElementById(`confidence_${chapterKey}`);
    const valueDisplay = document.getElementById(`value_${chapterKey}`);
    if (slider && valueDisplay) {
        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
            updateChapterData(chapterKey, 'confidence', parseInt(slider.value));
        });
    }
    
    // PYQ checkboxes
    CONFIG.pyqYears.forEach(year => {
        const mainCheckbox = document.getElementById(`main_${chapterKey}_${year}`);
        const advCheckbox = document.getElementById(`adv_${chapterKey}_${year}`);
        
        if (mainCheckbox) {
            mainCheckbox.addEventListener('change', () => {
                updateChapterPYQ(chapterKey, `jeeMain${year}`, mainCheckbox.checked);
            });
        }
        
        if (advCheckbox) {
            advCheckbox.addEventListener('change', () => {
                updateChapterPYQ(chapterKey, `jeeAdvanced${year}`, advCheckbox.checked);
            });
        }
    });
    
    // Notes textarea
    const notesTextarea = document.getElementById(`notes_${chapterKey}`);
    if (notesTextarea) {
        const debouncedUpdate = utils.debounce((value) => {
            updateChapterData(chapterKey, 'notes', value);
        }, 500);
        
        notesTextarea.addEventListener('input', () => {
            debouncedUpdate(notesTextarea.value);
        });
    }
};

const updateChapterData = (chapterKey, field, value) => {
    if (!appState.chapterData[chapterKey]) {
        appState.chapterData[chapterKey] = {
            completed: false,
            confidence: 5,
            notes: '',
            pyq: {}
        };
    }
    
    appState.chapterData[chapterKey][field] = value;
    
    // Save data
    saveChapterData();
    updateSubjectProgress();
};

const updateChapterPYQ = (chapterKey, pyqKey, checked) => {
    if (!appState.chapterData[chapterKey]) {
        appState.chapterData[chapterKey] = {
            completed: false,
            confidence: 5,
            notes: '',
            pyq: {}
        };
    }
    
    if (checked) {
        appState.chapterData[chapterKey].pyq[pyqKey] = true;
    } else {
        delete appState.chapterData[chapterKey].pyq[pyqKey];
    }
    
    saveChapterData();
};

const saveChapterData = async () => {
    try {
        if (appState.user && !appState.user.isDemo) {
            await FirebaseDB.saveChapterData(appState.chapterData);
        } else {
            storage.save('chapterData', appState.chapterData);
        }
    } catch (error) {
        console.error('Error saving chapter data:', error);
        storage.save('chapterData', appState.chapterData);
    }
};

const updateSubjectProgress = () => {
    Object.keys(CONFIG.subjects).forEach(subject => {
        const subjectData = CONFIG.subjects[subject];
        const totalChapters = subjectData.chapters.length;
        let completedChapters = 0;
        let totalConfidence = 0;
        let confidenceCount = 0;
        
        subjectData.chapters.forEach(chapter => {
            const chapterKey = `${subject}_${chapter.id}`;
            const chapterData = appState.chapterData[chapterKey];
            
            if (chapterData) {
                if (chapterData.completed) completedChapters++;
                totalConfidence += chapterData.confidence || 0;
                confidenceCount++;
            }
        });
        
        const completionPercentage = Math.round((completedChapters / totalChapters) * 100);
        const avgConfidence = confidenceCount > 0 ? Math.round(totalConfidence / confidenceCount * 10) / 10 : 0;
        
        // Update dashboard cards
        const completedEl = document.getElementById(`${subject}Completed`);
        const confidenceEl = document.getElementById(`${subject}Confidence`);
        const percentageEl = document.getElementById(`${subject}Percentage`);
        const progressCircle = document.getElementById(`${subject}ProgressCircle`);
        
        if (completedEl) completedEl.textContent = `${completedChapters}/${totalChapters}`;
        if (confidenceEl) confidenceEl.textContent = avgConfidence;
        if (percentageEl) percentageEl.textContent = `${completionPercentage}%`;
        
        if (progressCircle) {
            const circumference = 2 * Math.PI * 54;
            const offset = circumference - (completionPercentage / 100) * circumference;
            progressCircle.style.strokeDasharray = circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
        
        // Update chapter section progress bars
        const progressBar = document.getElementById(`${subject}ProgressBar`);
        const progressText = document.getElementById(`${subject}ProgressText`);
        
        if (progressBar) {
            progressBar.style.width = `${completionPercentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${completedChapters}/${totalChapters}`;
        }
    });
};

// Progress Tracking Functions - FIXED
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
    console.log('Saving progress...');
    
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
    
    const progressEntry = {
        date,
        questions,
        target,
        subjects: {
            Physics: physics,
            Chemistry: chemistry,
            Mathematics: math
        }
    };
    
    console.log('Progress entry:', progressEntry);
    
    // Update local state
    const existingIndex = appState.progressData.findIndex(entry => entry.date === date);
    if (existingIndex >= 0) {
        appState.progressData[existingIndex] = progressEntry;
    } else {
        appState.progressData.push(progressEntry);
    }
    
    appState.progressData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Save data
    try {
        await FirebaseDB.saveProgressEntry(progressEntry);
        console.log('Progress saved to Firebase');
    } catch (error) {
        console.log('Firebase save failed, using localStorage');
        storage.save('progressData', appState.progressData);
    }
    
    updateDashboardStats();
    updateTodayProgress();
    renderCalendar();
    
    // Clear form
    [questionsInput, physicsInput, chemistryInput, mathInput].forEach(input => {
        if (input) input.value = '';
    });
    
    utils.showNotification('Progress saved successfully!', 'success');
    console.log('Progress saved successfully');
};

const updateDailyTarget = async () => {
    const targetInput = document.getElementById('dailyTarget');
    if (targetInput) {
        const newTarget = parseInt(targetInput.value) || 50;
        appState.settings.dailyTarget = newTarget;
        
        try {
            await FirebaseDB.saveSettings(appState.settings);
        } catch (error) {
            storage.save('settings', appState.settings);
        }
        
        updateTodayProgress();
    }
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

// Dashboard Statistics
const updateDashboardStats = () => {
    // This function can be expanded to update any dashboard statistics
    console.log('Dashboard stats updated');
};

const updateTodayProgress = () => {
    const today = utils.getToday();
    const todayEntry = appState.progressData.find(entry => entry.date === today);
    const target = appState.settings.dailyTarget;
    
    const questionsToday = todayEntry ? todayEntry.questions : 0;
    const progress = Math.min(Math.round((questionsToday / target) * 100), 100);
    
    console.log('Updating today progress:', { questionsToday, target, progress });
    
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
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (progress / 100) * circumference;
        
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
        percentageEl.textContent = progress + '%';
    }
};

// Charts Implementation
const initializeCharts = () => {
    if (appState.progressData.length === 0) {
        utils.showNotification('No data available for charts. Start logging your progress!', 'info');
        return;
    }
    
    try {
        createProgressChart();
        createSubjectChart();
        createChapterChart();
        createConfidenceChart();
    } catch (error) {
        console.error('Error initializing charts:', error);
        utils.showNotification('Failed to load some charts', 'error');
    }
};

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
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
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

const createChapterChart = () => {
    const ctx = document.getElementById('chapterChart');
    if (!ctx) return;
    
    if (appState.charts.chapter) {
        appState.charts.chapter.destroy();
    }
    
    const subjectCompletion = {};
    
    Object.keys(CONFIG.subjects).forEach(subject => {
        const subjectData = CONFIG.subjects[subject];
        const totalChapters = subjectData.chapters.length;
        let completedChapters = 0;
        
        subjectData.chapters.forEach(chapter => {
            const chapterKey = `${subject}_${chapter.id}`;
            const chapterData = appState.chapterData[chapterKey];
            if (chapterData && chapterData.completed) {
                completedChapters++;
            }
        });
        
        subjectCompletion[CONFIG.subjects[subject].name] = Math.round((completedChapters / totalChapters) * 100);
    });
    
    appState.charts.chapter = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: Object.keys(subjectCompletion),
            datasets: [{
                label: 'Completion Percentage',
                data: Object.values(subjectCompletion),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
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
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
};

const createConfidenceChart = () => {
    const ctx = document.getElementById('confidenceChart');
    if (!ctx) return;
    
    if (appState.charts.confidence) {
        appState.charts.confidence.destroy();
    }
    
    const confidenceLevels = Object.keys(CONFIG.subjects).map(subject => {
        const subjectData = CONFIG.subjects[subject];
        let totalConfidence = 0;
        let count = 0;
        
        subjectData.chapters.forEach(chapter => {
            const chapterKey = `${subject}_${chapter.id}`;
            const chapterData = appState.chapterData[chapterKey];
            if (chapterData && chapterData.confidence) {
                totalConfidence += chapterData.confidence;
                count++;
            }
        });
        
        return count > 0 ? totalConfidence / count : 0;
    });
    
    appState.charts.confidence = new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: Object.values(CONFIG.subjects).map(s => s.name),
            datasets: [{
                label: 'Average Confidence Level',
                data: confidenceLevels,
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
                    beginAtZero: true,
                    max: 10,
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
};

// Calendar Functions
const renderCalendar = () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('currentMonth');
    
    if (!calendarGrid || !monthYear) return;
    
    const year = appState.currentMonth.getFullYear();
    const month = appState.currentMonth.getMonth();
    
    monthYear.textContent = `${appState.currentMonth.toLocaleString('default', { month: 'long' })} ${year}`;
    
    calendarGrid.innerHTML = '';
    
    // Day headers
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
    
    // Empty days for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Days of the month
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
    if (modal) modal.classList.add('hidden');
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
    
    const progressEntry = {
        date,
        questions,
        target: appState.settings.dailyTarget,
        subjects: {
            Physics: physics,
            Chemistry: chemistry,
            Mathematics: math
        }
    };
    
    const existingIndex = appState.progressData.findIndex(entry => entry.date === date);
    if (existingIndex >= 0) {
        appState.progressData[existingIndex] = progressEntry;
    } else {
        appState.progressData.push(progressEntry);
    }
    
    appState.progressData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    try {
        await FirebaseDB.saveProgressEntry(progressEntry);
    } catch (error) {
        storage.save('progressData', appState.progressData);
    }
    
    updateDashboardStats();
    updateTodayProgress();
    renderCalendar();
    closeModal();
    
    utils.showNotification('Progress updated successfully!', 'success');
};

// Todo Management
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
    
    try {
        await FirebaseDB.saveTodo(newTodo);
    } catch (error) {
        storage.save('todos', appState.todos);
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
        
        try {
            await FirebaseDB.saveTodo(todo);
        } catch (error) {
            storage.save('todos', appState.todos);
        }
        
        renderTodos();
        utils.showNotification(`Task ${todo.completed ? 'completed' : 'reopened'}!`, 'success');
    }
};

const deleteTodo = async (id) => {
    appState.todos = appState.todos.filter(item => item.id !== id);
    
    try {
        await FirebaseDB.deleteTodo(id);
    } catch (error) {
        storage.save('todos', appState.todos);
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

// Data Export Functions
const exportAllData = () => {
    const data = {
        progressData: appState.progressData,
        chapterData: appState.chapterData,
        todos: appState.todos,
        settings: appState.settings,
        exportDate: new Date().toISOString(),
        version: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jee-tracker-complete-${utils.getToday()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    utils.showNotification('All data exported successfully!', 'success');
    
    const modal = document.getElementById('exportModal');
    if (modal) modal.classList.add('hidden');
};

const exportProgressCSV = () => {
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
    a.download = `jee-progress-${utils.getToday()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    utils.showNotification('Progress data exported to CSV!', 'success');
    
    const modal = document.getElementById('exportModal');
    if (modal) modal.classList.add('hidden');
};

const exportChaptersCSV = () => {
    const csvRows = [
        ['Subject', 'Chapter', 'Completed', 'Confidence', 'Notes', 'JEE Main PYQs', 'JEE Advanced PYQs']
    ];
    
    Object.keys(CONFIG.subjects).forEach(subject => {
        const subjectData = CONFIG.subjects[subject];
        
        subjectData.chapters.forEach(chapter => {
            const chapterKey = `${subject}_${chapter.id}`;
            const chapterData = appState.chapterData[chapterKey] || {};
            
            const mainPYQs = CONFIG.pyqYears.filter(year => 
                chapterData.pyq && chapterData.pyq[`jeeMain${year}`]
            ).join('; ');
            
            const advPYQs = CONFIG.pyqYears.filter(year => 
                chapterData.pyq && chapterData.pyq[`jeeAdvanced${year}`]
            ).join('; ');
            
            csvRows.push([
                CONFIG.subjects[subject].name,
                chapter.name,
                chapterData.completed ? 'Yes' : 'No',
                chapterData.confidence || 5,
                (chapterData.notes || '').replace(/,/g, ';'), // Replace commas to avoid CSV issues
                mainPYQs,
                advPYQs
            ]);
        });
    });
    
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jee-chapters-${utils.getToday()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    utils.showNotification('Chapter data exported to CSV!', 'success');
    
    const modal = document.getElementById('exportModal');
    if (modal) modal.classList.add('hidden');
};

const backupData = () => {
    const data = {
        progressData: appState.progressData,
        chapterData: appState.chapterData,
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
    
    const modal = document.getElementById('exportModal');
    if (modal) modal.classList.add('hidden');
};

const exportChapterData = () => {
    const blob = new Blob([JSON.stringify(appState.chapterData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chapter-data-${utils.getToday()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    utils.showNotification('Chapter data exported!', 'success');
};

const importChapterData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (typeof data === 'object' && data !== null) {
                appState.chapterData = { ...appState.chapterData, ...data };
                renderChapters();
                updateSubjectProgress();
                saveChapterData();
                utils.showNotification('Chapter data imported successfully!', 'success');
            } else {
                throw new Error('Invalid data format');
            }
        } catch (error) {
            utils.showNotification('Failed to import chapter data. Invalid file format.', 'error');
        }
    };
    reader.readAsText(file);
};

// Theme Management
const toggleTheme = () => {
    const currentTheme = appState.settings.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    appState.settings.theme = newTheme;
    document.documentElement.setAttribute('data-color-scheme', newTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
    }
    
    try {
        FirebaseDB.saveSettings(appState.settings);
    } catch (error) {
        storage.save('settings', appState.settings);
    }
};

// Make functions globally available
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
