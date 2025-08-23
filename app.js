// Enhanced JEE 2026 Comprehensive Tracker - FULLY FIXED VERSION WITH CHARTS AND CALENDAR
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
    isInitialized: false,
    chartsInitialized: false,
    calendarInitialized: false
};

// Utility Functions
const utils = {
    formatDate: (date) => date.toISOString().split('T')[0],
    parseDate: (dateString) => new Date(dateString + 'T00:00:00'),
    getToday: () => utils.formatDate(new Date()),
    
    showNotification: (message, type = 'info') => {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
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
    },

    // Check if Chart.js is loaded
    waitForChartJS: () => {
        return new Promise((resolve) => {
            if (window.Chart) {
                resolve(true);
                return;
            }
            
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkChart = () => {
                attempts++;
                if (window.Chart) {
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    console.error('Chart.js failed to load');
                    resolve(false);
                } else {
                    setTimeout(checkChart, 100);
                }
            };
            
            checkChart();
        });
    }
};

// Enhanced Firebase Authentication - COMPLETELY FIXED
const FirebaseAuth = {
    provider: null,
    isInitialized: false,
    
    async waitForFirebase() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const check = () => {
                attempts++;
                if (window.firebaseInitialized && window.auth && window.db) {
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
                updateConnectionStatus('offline');
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
                    this.hideAuthModal();
                    this.syncUserData();
                } else {
                    updateConnectionStatus('offline');
                    if (!appState.user || !appState.user.isDemo) {
                        this.showAuthModal();
                    }
                }
            });
            
            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Auth initialization error:', error);
            updateConnectionStatus('offline');
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
            appState.chartsInitialized = false;
            appState.calendarInitialized = false;
            
            // Clear charts
            Object.values(appState.charts).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                }
            });
            appState.charts = {};
            
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
        console.log('Entering demo mode...');
        appState.user = { uid: 'demo', email: 'demo@jeetracker.com', displayName: 'Demo User', isDemo: true };
        this.updateUI();
        this.hideAuthModal();
        updateConnectionStatus('offline');
        
        // Load sample data for demo
        loadSampleData();
        loadSampleChapterData();
        
        // Update all displays with a delay to ensure DOM is ready
        setTimeout(() => {
            updateDashboardStats();
            updateTodayProgress();
            updateSubjectProgress();
            renderTodos();
            renderChapters();
            
            // Reset chart and calendar initialization flags
            appState.chartsInitialized = false;
            appState.calendarInitialized = false;
            
            // Re-render calendar if we're on the calendar tab
            if (appState.currentSection === 'calendar') {
                renderCalendar();
            }
        }, 200);
        
        utils.showNotification('Demo Mode Active - Data will not sync across devices', 'info');
    },
    
    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        
        if (appState.user && userInfo) {
            userInfo.style.display = 'flex';
            if (userAvatar && appState.user.photoURL) {
                userAvatar.src = appState.user.photoURL;
                userAvatar.style.display = 'block';
            } else if (userAvatar) {
                userAvatar.style.display = 'none';
            }
            if (userName) {
                userName.textContent = appState.user.displayName || appState.user.email || 'User';
            }
        } else if (userInfo) {
            userInfo.style.display = 'none';
        }
    },
    
    showAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            modal.style.opacity = '1';
            modal.style.visibility = 'visible';
        }
    },
    
    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
            setTimeout(() => {
                if (modal.classList.contains('hidden')) {
                    modal.style.display = 'none';
                }
            }, 300);
        }
    },
    
    showAuthError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
            errorElement.style.display = 'block';
            errorElement.style.visibility = 'visible';
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
            troubleshooting.style.display = 'block';
            troubleshooting.style.visibility = 'visible';
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
            renderTodos();
            renderChapters();
            
            // Reset initialization flags to force re-render
            appState.chartsInitialized = false;
            appState.calendarInitialized = false;
            
            if (appState.currentSection === 'analytics') {
                initializeCharts();
            }
            if (appState.currentSection === 'calendar') {
                renderCalendar();
            }
            
            appState.lastSyncTime = new Date();
        } catch (error) {
            console.error('Sync error:', error);
            utils.showNotification('Failed to sync some data. Working offline.', 'warning');
        }
    }
};

// Enhanced Firebase Database Operations - FIXED
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
            const initialized = await this.initializeFirestore();
            if (!initialized) throw new Error('Firestore not available');
            
            const { doc, setDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'progress', entry.date);
            await setDoc(docRef, entry);
            console.log('Progress entry saved to Firebase');
        } catch (error) {
            console.error('Error saving progress:', error);
            storage.save('progressData', appState.progressData);
            throw error;
        }
    },
    
    async loadProgressData() {
        if (!appState.user || appState.user.isDemo) return;
        
        try {
            const initialized = await this.initializeFirestore();
            if (!initialized) throw new Error('Firestore not available');
            
            const { collection, query, orderBy, getDocs } = this.firestoreImports;
            
            const progressRef = collection(db, 'users', appState.user.uid, 'progress');
            const q = query(progressRef, orderBy('date'));
            const querySnapshot = await getDocs(q);
            
            appState.progressData = [];
            querySnapshot.forEach((doc) => {
                appState.progressData.push(doc.data());
            });
            console.log('Progress data loaded from Firebase:', appState.progressData.length, 'entries');
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
            const initialized = await this.initializeFirestore();
            if (!initialized) throw new Error('Firestore not available');
            
            const { doc, setDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'chapters', 'data');
            await setDoc(docRef, chapterData);
            console.log('Chapter data saved to Firebase');
        } catch (error) {
            console.error('Error saving chapter data:', error);
            storage.save('chapterData', appState.chapterData);
            throw error;
        }
    },
    
    async loadChapterData() {
        if (!appState.user || appState.user.isDemo) return;
        
        try {
            const initialized = await this.initializeFirestore();
            if (!initialized) throw new Error('Firestore not available');
            
            const { doc, getDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'chapters', 'data');
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                appState.chapterData = docSnap.data();
                console.log('Chapter data loaded from Firebase');
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
            const initialized = await this.initializeFirestore();
            if (!initialized) throw new Error('Firestore not available');
            
            const { doc, setDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'todos', todo.id.toString());
            await setDoc(docRef, todo);
            console.log('Todo saved to Firebase');
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
            const initialized = await this.initializeFirestore();
            if (!initialized) throw new Error('Firestore not available');
            
            const { doc, deleteDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'todos', todoId.toString());
            await deleteDoc(docRef);
            console.log('Todo deleted from Firebase');
        } catch (error) {
            console.error('Error deleting todo:', error);
            storage.save('todos', appState.todos);
            throw error;
        }
    },
    
    async loadTodos() {
        if (!appState.user || appState.user.isDemo) return;
        
        try {
            const initialized = await this.initializeFirestore();
            if (!initialized) throw new Error('Firestore not available');
            
            const { collection, getDocs } = this.firestoreImports;
            
            const todosRef = collection(db, 'users', appState.user.uid, 'todos');
            const querySnapshot = await getDocs(todosRef);
            
            appState.todos = [];
            querySnapshot.forEach((doc) => {
                appState.todos.push(doc.data());
            });
            console.log('Todos loaded from Firebase:', appState.todos.length, 'items');
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
            const initialized = await this.initializeFirestore();
            if (!initialized) throw new Error('Firestore not available');
            
            const { doc, setDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'settings', 'userSettings');
            await setDoc(docRef, settings);
            console.log('Settings saved to Firebase');
        } catch (error) {
            console.error('Error saving settings:', error);
            storage.save('settings', appState.settings);
            throw error;
        }
    },
    
    async loadSettings() {
        if (!appState.user || appState.user.isDemo) return;
        
        try {
            const initialized = await this.initializeFirestore();
            if (!initialized) throw new Error('Firestore not available');
            
            const { doc, getDoc } = this.firestoreImports;
            
            const docRef = doc(db, 'users', appState.user.uid, 'settings', 'userSettings');
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                appState.settings = { ...CONFIG.defaultSettings, ...docSnap.data() };
                const targetInput = document.getElementById('dailyTarget');
                if (targetInput) {
                    targetInput.value = appState.settings.dailyTarget;
                }
                console.log('Settings loaded from Firebase');
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            throw error;
        }
    }
};

// Connection Status Management - FIXED
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
    
    console.log('Connection status updated:', status);
};

// Local Storage - FIXED
const storage = {
    save: (key, data) => {
        try {
            const dataToSave = JSON.stringify(data);
            localStorage.setItem(`jee-tracker-${key}`, dataToSave);
            console.log(`Saved ${key} to localStorage`);
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },
    
    load: (key, defaultValue = null) => {
        try {
            const data = localStorage.getItem(`jee-tracker-${key}`);
            if (data) {
                const parsed = JSON.parse(data);
                console.log(`Loaded ${key} from localStorage`);
                return parsed;
            }
            return defaultValue;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }
};

// Application Initialization - FULLY FIXED
const init = async () => {
    console.log('Initializing JEE 2026 Tracker...');
    
    // Load local state first
    loadAppState();
    
    // Setup event listeners FIRST before showing auth modal
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
    
    // Initialize Firebase Auth
    updateConnectionStatus('connecting');
    try {
        const initialized = await FirebaseAuth.initializeAuth();
        if (initialized) {
            console.log('Firebase initialized successfully');
        } else {
            console.warn('Firebase unavailable, demo mode available');
            updateConnectionStatus('offline');
            // Show auth modal for demo/offline mode after slight delay
            setTimeout(() => FirebaseAuth.showAuthModal(), 500);
        }
    } catch (error) {
        console.error('Firebase initialization error:', error);
        updateConnectionStatus('offline');
        setTimeout(() => FirebaseAuth.showAuthModal(), 500);
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
    
    // Window resize listener for chart responsiveness
    window.addEventListener('resize', utils.debounce(() => {
        if (appState.chartsInitialized) {
            Object.values(appState.charts).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
        }
    }, 250));
    
    appState.isInitialized = true;
    console.log('App initialized successfully');
};

// Load Application State - FIXED
const loadAppState = () => {
    console.log('Loading application state...');
    
    appState.progressData = storage.load('progressData', []);
    appState.todos = storage.load('todos', []);
    appState.chapterData = storage.load('chapterData', {});
    appState.settings = { ...CONFIG.defaultSettings, ...storage.load('settings', {}) };
    
    const targetInput = document.getElementById('dailyTarget');
    if (targetInput) {
        targetInput.value = appState.settings.dailyTarget;
    }
    
    // Force update all displays with delay to ensure DOM elements exist
    setTimeout(() => {
        updateDashboardStats();
        updateTodayProgress();
        updateSubjectProgress();
        renderTodos();
        renderChapters();
    }, 200);
    
    console.log('Application state loaded:', {
        progressEntries: appState.progressData.length,
        todos: appState.todos.length,
        chaptersTracked: Object.keys(appState.chapterData).length
    });
};

// Sample Data Functions - FIXED
const loadSampleData = () => {
    const today = utils.getToday();
    const yesterday = utils.formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const dayBeforeYesterday = utils.formatDate(new Date(Date.now() - 48 * 60 * 60 * 1000));
    const threeDaysAgo = utils.formatDate(new Date(Date.now() - 72 * 60 * 60 * 1000));
    const fourDaysAgo = utils.formatDate(new Date(Date.now() - 96 * 60 * 60 * 1000));
    
    const sampleProgressData = [
        {"date": fourDaysAgo, "questions": 35, "target": 50, "subjects": {"Physics": 12, "Chemistry": 15, "Mathematics": 8}},
        {"date": threeDaysAgo, "questions": 42, "target": 50, "subjects": {"Physics": 14, "Chemistry": 18, "Mathematics": 10}},
        {"date": dayBeforeYesterday, "questions": 48, "target": 50, "subjects": {"Physics": 16, "Chemistry": 20, "Mathematics": 12}},
        {"date": yesterday, "questions": 55, "target": 50, "subjects": {"Physics": 18, "Chemistry": 19, "Mathematics": 18}},
        {"date": today, "questions": 62, "target": 50, "subjects": {"Physics": 21, "Chemistry": 20, "Mathematics": 21}}
    ];
    
    const sampleTodos = [
        {"id": Date.now() - 1000, "task": "Complete Mechanics chapter revision", "priority": "High", "subject": "Physics", "completed": false, "dueDate": utils.formatDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000))},
        {"id": Date.now(), "task": "Practice Organic Chemistry reactions", "priority": "Medium", "subject": "Chemistry", "completed": false, "dueDate": utils.formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000))}
    ];
    
    appState.progressData = sampleProgressData;
    appState.todos = sampleTodos;
    
    console.log('Sample data loaded');
};

const loadSampleChapterData = () => {
    // Sample chapter completion data
    const sampleChapterData = {
        physics_mech: { completed: true, confidence: 8, notes: "Good understanding of kinematics and dynamics", pyq: { "jeeMain2023": true, "jeeMain2022": true, "jeeAdvanced2023": true } },
        physics_thermo: { completed: true, confidence: 7, notes: "Need more practice on entropy calculations", pyq: { "jeeMain2023": true } },
        chemistry_atomic: { completed: true, confidence: 7, notes: "Need more practice on quantum numbers", pyq: { "jeeMain2023": true, "jeeAdvanced2022": true } },
        chemistry_bonding: { completed: false, confidence: 5, notes: "Working on molecular orbital theory", pyq: {} },
        mathematics_sets: { completed: false, confidence: 5, notes: "", pyq: {} },
        mathematics_complex: { completed: true, confidence: 9, notes: "Strong understanding of all concepts", pyq: { "jeeMain2023": true, "jeeMain2022": true, "jeeAdvanced2023": true, "jeeAdvanced2022": true } }
    };
    
    appState.chapterData = sampleChapterData;
    console.log('Sample chapter data loaded');
};

// Event Listeners Setup - COMPLETELY FIXED
const setupEventListeners = () => {
    console.log('Setting up event listeners...');
    
    // Navigation - FIXED
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
            e.preventDefault();
            const section = e.target.getAttribute('href').substring(1);
            console.log('Navigating to section:', section);
            showSection(section);
        }
    });
    
    // Authentication - FIXED WITH IMMEDIATE HANDLERS
    document.addEventListener('click', async (e) => {
        const target = e.target;
        
        // Google Sign In
        if (target.id === 'googleSignInBtn' || target.closest('#googleSignInBtn')) {
            e.preventDefault();
            console.log('Google sign in clicked');
            try {
                await FirebaseAuth.signInWithGoogle();
            } catch (error) {
                console.error('Google sign in failed:', error);
            }
        }
        
        // Email Sign In
        if (target.id === 'emailSignInBtn' || target.closest('#emailSignInBtn')) {
            e.preventDefault();
            console.log('Email sign in clicked');
            try {
                await FirebaseAuth.signInWithEmail();
            } catch (error) {
                console.error('Email sign in failed:', error);
            }
        }
        
        // Email Sign Up
        if (target.id === 'emailSignUpBtn' || target.closest('#emailSignUpBtn')) {
            e.preventDefault();
            console.log('Email sign up clicked');
            try {
                await FirebaseAuth.signUpWithEmail();
            } catch (error) {
                console.error('Email sign up failed:', error);
            }
        }
        
        // Demo Mode - CRITICAL FIX
        if (target.id === 'demoModeBtn' || target.closest('#demoModeBtn')) {
            e.preventDefault();
            console.log('Demo mode clicked');
            FirebaseAuth.enterDemoMode();
        }
        
        // Sign Out
        if (target.id === 'signOutBtn' || target.closest('#signOutBtn')) {
            e.preventDefault();
            console.log('Sign out clicked');
            try {
                await FirebaseAuth.signOutUser();
            } catch (error) {
                console.error('Sign out failed:', error);
            }
        }
        
        // Retry Connection
        if (target.id === 'retryBtn' || target.closest('#retryBtn')) {
            e.preventDefault();
            console.log('Retry connection clicked');
            updateConnectionStatus('connecting');
            await FirebaseAuth.initializeAuth();
        }
        
        // Progress Saving
        if (target.id === 'saveProgress' || target.closest('#saveProgress')) {
            e.preventDefault();
            console.log('Save progress clicked');
            await saveProgress();
        }
        
        // Todo Management
        if (target.id === 'addTodo' || target.closest('#addTodo')) {
            e.preventDefault();
            console.log('Add todo clicked');
            await addTodo();
        }
        
        // Export/Import buttons
        if (target.id === 'exportBtn' || target.closest('#exportBtn')) {
            e.preventDefault();
            const modal = document.getElementById('exportModal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                modal.style.visibility = 'visible';
                modal.style.opacity = '1';
            }
        }
        
        // Calendar navigation
        if (target.id === 'prevMonth' || target.closest('#prevMonth')) {
            e.preventDefault();
            changeMonth(-1);
        }
        
        if (target.id === 'nextMonth' || target.closest('#nextMonth')) {
            e.preventDefault();
            changeMonth(1);
        }
        
        // Modal closes
        if (target.classList.contains('modal-close')) {
            e.preventDefault();
            const modal = target.closest('.modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.opacity = '0';
                modal.style.visibility = 'hidden';
                setTimeout(() => modal.style.display = 'none', 300);
            }
        }
        
        // Calendar day clicks
        if (target.classList.contains('calendar-day') && target.dataset.date) {
            openDayModal(target.dataset.date);
        }
        
        // Filter buttons
        if (target.classList.contains('filter-btn')) {
            const filter = target.dataset.filter;
            if (filter) {
                filterTodos(filter);
            }
        }
        
        // Theme toggle
        if (target.id === 'themeToggle' || target.closest('#themeToggle')) {
            toggleTheme();
        }
        
        // Export functions
        if (target.id === 'exportAllJSON') {
            exportAllData();
        }
        if (target.id === 'exportProgressCSV') {
            exportProgressCSV();
        }
        if (target.id === 'exportChaptersCSV') {
            exportChaptersCSV();
        }
        if (target.id === 'backupData') {
            backupData();
        }
        if (target.id === 'exportChapterData') {
            exportChapterData();
        }
        if (target.id === 'importChapterData') {
            const fileInput = document.getElementById('importChapterFile');
            if (fileInput) fileInput.click();
        }
        if (target.id === 'saveModalProgress') {
            await saveModalProgress();
        }
        if (target.id === 'closeModal') {
            closeModal();
        }
    });
    
    // Input event listeners
    document.addEventListener('input', (e) => {
        const target = e.target;
        
        // Auto-calculate total - FIXED
        if (['physicsCount', 'chemistryCount', 'mathCount'].includes(target.id)) {
            calculateTotal();
        }
    });
    
    // Change event listeners
    document.addEventListener('change', (e) => {
        const target = e.target;
        
        if (target.id === 'dailyTarget') {
            updateDailyTarget();
        }
        
        if (target.id === 'questionDate') {
            loadDateData();
        }
        
        if (target.id === 'importChapterFile') {
            importChapterData(e);
        }
    });
    
    // Modal background clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') && !e.target.classList.contains('auth-modal')) {
            e.target.classList.add('hidden');
            e.target.style.opacity = '0';
            e.target.style.visibility = 'hidden';
            setTimeout(() => e.target.style.display = 'none', 300);
        }
    });
    
    console.log('Event listeners setup complete with delegation');
};

// Navigation - FIXED WITH CHART AND CALENDAR INITIALIZATION
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
        targetSection.style.visibility = 'visible';
        
        appState.currentSection = sectionName;
        
        // Initialize section-specific functionality with proper delays
        if (sectionName === 'analytics') {
            const loadingState = document.getElementById('analyticsLoading');
            const chartsContainer = document.getElementById('chartsContainer');
            
            if (loadingState) loadingState.style.display = 'flex';
            if (chartsContainer) chartsContainer.style.display = 'none';
            
            // Delay to ensure DOM is ready and visible
            setTimeout(async () => {
                console.log('Initializing analytics charts...');
                try {
                    await initializeCharts();
                    if (loadingState) loadingState.style.display = 'none';
                    if (chartsContainer) chartsContainer.style.display = 'grid';
                } catch (error) {
                    console.error('Failed to initialize charts:', error);
                    if (loadingState) loadingState.innerHTML = '<p>Failed to load charts</p>';
                    utils.showNotification('Failed to load charts', 'error');
                }
            }, 300);
        }
        
        if (sectionName === 'chapters') {
            setTimeout(() => {
                console.log('Rendering chapters...');
                renderChapters();
            }, 100);
        }
        
        if (sectionName === 'calendar') {
            const loadingState = document.getElementById('calendarLoading');
            const calendarContainer = document.getElementById('calendarContainer');
            
            if (loadingState) loadingState.style.display = 'flex';
            if (calendarContainer) calendarContainer.style.display = 'none';
            
            setTimeout(() => {
                console.log('Rendering calendar...');
                try {
                    renderCalendar();
                    if (loadingState) loadingState.style.display = 'none';
                    if (calendarContainer) calendarContainer.style.display = 'block';
                } catch (error) {
                    console.error('Failed to render calendar:', error);
                    if (loadingState) loadingState.innerHTML = '<p>Failed to load calendar</p>';
                }
            }, 200);
        }
        
        console.log('Successfully switched to section:', sectionName);
    } else {
        console.error('Section not found:', sectionName);
    }
};

// Countdown Functions - FIXED
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
    console.log('Countdown timers started');
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

// Motivational Quotes - FIXED
const updateMotivationalQuote = () => {
    const quoteElement = document.getElementById('motivationalQuote');
    if (quoteElement) {
        const randomQuote = CONFIG.motivationalQuotes[Math.floor(Math.random() * CONFIG.motivationalQuotes.length)];
        quoteElement.textContent = randomQuote;
        quoteElement.style.display = 'block';
        quoteElement.style.visibility = 'visible';
    }
    setTimeout(updateMotivationalQuote, 30000);
};

// Chapter Management Functions - FIXED
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
    container.style.display = 'grid';
    container.style.visibility = 'visible';
    
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
        chapterElement.style.display = 'block';
        chapterElement.style.visibility = 'visible';
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
        
        // Add event listeners for this chapter using delegation
        setupChapterEventListeners(chapterKey);
    });
    
    console.log(`Rendered ${subjectData.chapters.length} chapters for ${subject}`);
};

const setupChapterEventListeners = (chapterKey) => {
    // Use event delegation to handle chapter interactions
    document.addEventListener('change', (e) => {
        const target = e.target;
        
        // Completion checkbox
        if (target.id === `checkbox_${chapterKey}`) {
            updateChapterData(chapterKey, 'completed', target.checked);
        }
        
        // Confidence slider
        if (target.id === `confidence_${chapterKey}`) {
            const valueDisplay = document.getElementById(`value_${chapterKey}`);
            if (valueDisplay) {
                valueDisplay.textContent = target.value;
            }
            updateChapterData(chapterKey, 'confidence', parseInt(target.value));
        }
        
        // PYQ checkboxes
        CONFIG.pyqYears.forEach(year => {
            if (target.id === `main_${chapterKey}_${year}`) {
                updateChapterPYQ(chapterKey, `jeeMain${year}`, target.checked);
            }
            if (target.id === `adv_${chapterKey}_${year}`) {
                updateChapterPYQ(chapterKey, `jeeAdvanced${year}`, target.checked);
            }
        });
    });
    
    // Notes textarea with debouncing
    document.addEventListener('input', (e) => {
        if (e.target.id === `notes_${chapterKey}`) {
            const debouncedUpdate = utils.debounce((value) => {
                updateChapterData(chapterKey, 'notes', value);
            }, 500);
            debouncedUpdate(e.target.value);
        }
    });
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
    
    console.log(`Updated chapter data for ${chapterKey}:`, field, value);
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
    console.log(`Updated PYQ data for ${chapterKey}:`, pyqKey, checked);
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
        
        if (completedEl) {
            completedEl.textContent = `${completedChapters}/${totalChapters}`;
            completedEl.style.display = 'block';
            completedEl.style.visibility = 'visible';
        }
        if (confidenceEl) {
            confidenceEl.textContent = avgConfidence;
            confidenceEl.style.display = 'block';
            confidenceEl.style.visibility = 'visible';
        }
        if (percentageEl) {
            percentageEl.textContent = `${completionPercentage}%`;
            percentageEl.style.display = 'block';
            percentageEl.style.visibility = 'visible';
        }
        
        if (progressCircle) {
            const circumference = 2 * Math.PI * 54;
            const offset = circumference - (completionPercentage / 100) * circumference;
            progressCircle.style.strokeDasharray = circumference;
            progressCircle.style.strokeDashoffset = offset;
            progressCircle.style.display = 'block';
            progressCircle.style.visibility = 'visible';
        }
        
        // Update chapter section progress bars
        const progressBar = document.getElementById(`${subject}ProgressBar`);
        const progressText = document.getElementById(`${subject}ProgressText`);
        
        if (progressBar) {
            progressBar.style.width = `${completionPercentage}%`;
            progressBar.style.display = 'block';
            progressBar.style.visibility = 'visible';
        }
        if (progressText) {
            progressText.textContent = `${completedChapters}/${totalChapters}`;
            progressText.style.display = 'block';
            progressText.style.visibility = 'visible';
        }
    });
    
    console.log('Subject progress updated');
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
        utils.showNotification('Error: Form elements not found', 'error');
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
    
    // Re-render calendar if we're on that tab and reset charts if we're on analytics
    if (appState.currentSection === 'calendar') {
        renderCalendar();
    }
    if (appState.currentSection === 'analytics') {
        appState.chartsInitialized = false;
        initializeCharts();
    }
    
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
        console.log('Daily target updated to:', newTarget);
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
    
    console.log('Loaded date data for:', date);
};

// Dashboard Statistics - FIXED
const updateDashboardStats = () => {
    console.log('Updating dashboard stats...');
    // This function can be expanded to update any dashboard statistics
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
    
    if (todayQuestionsEl) {
        todayQuestionsEl.textContent = questionsToday;
        todayQuestionsEl.style.display = 'block';
        todayQuestionsEl.style.visibility = 'visible';
    }
    if (todayTargetEl) {
        todayTargetEl.textContent = target;
        todayTargetEl.style.display = 'block';
        todayTargetEl.style.visibility = 'visible';
    }
    if (todayProgressEl) {
        todayProgressEl.textContent = progress + '%';
        todayProgressEl.style.display = 'block';
        todayProgressEl.style.visibility = 'visible';
    }
    
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = progress + '%';
        progressFill.style.display = 'block';
        progressFill.style.visibility = 'visible';
    }
    
    const circle = document.getElementById('progressCircle');
    const percentageEl = document.getElementById('progressPercentage');
    
    if (circle && percentageEl) {
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (progress / 100) * circumference;
        
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
        circle.style.display = 'block';
        circle.style.visibility = 'visible';
        
        percentageEl.textContent = progress + '%';
        percentageEl.style.display = 'block';
        percentageEl.style.visibility = 'visible';
    }
};

// Charts Implementation - COMPLETELY FIXED WITH ERROR HANDLING
const initializeCharts = async () => {
    console.log('Initializing charts with data length:', appState.progressData.length);
    
    // Check if charts are already initialized
    if (appState.chartsInitialized) {
        console.log('Charts already initialized');
        return;
    }
    
    // Wait for Chart.js to load
    const chartJSLoaded = await utils.waitForChartJS();
    if (!chartJSLoaded) {
        console.error('Chart.js failed to load');
        utils.showNotification('Chart.js failed to load', 'error');
        return;
    }
    
    console.log('Chart.js loaded successfully');
    
    try {
        // Destroy existing charts first
        Object.values(appState.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        appState.charts = {};
        
        // Create all charts
        await Promise.all([
            createProgressChart(),
            createSubjectChart(), 
            createChapterChart(),
            createConfidenceChart()
        ]);
        
        appState.chartsInitialized = true;
        console.log('All charts initialized successfully');
        
    } catch (error) {
        console.error('Error initializing charts:', error);
        utils.showNotification('Failed to load some charts', 'error');
    }
};

const createProgressChart = async () => {
    const ctx = document.getElementById('progressChart');
    if (!ctx) {
        console.warn('Progress chart canvas not found');
        return;
    }
    
    const chartData = appState.progressData.length > 0 ? 
        appState.progressData.slice(-14) : // Show last 14 days
        [
            { date: '2025-08-20', questions: 42, target: 50 },
            { date: '2025-08-21', questions: 48, target: 50 },
            { date: '2025-08-22', questions: 55, target: 50 },
            { date: '2025-08-23', questions: 62, target: 50 }
        ];
    
    try {
        appState.charts.progress = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: chartData.map(entry => {
                    const date = new Date(entry.date + 'T00:00:00');
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'Questions Solved',
                    data: chartData.map(entry => entry.questions),
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#1FB8CD',
                    pointBorderColor: '#1FB8CD',
                    pointRadius: 5
                }, {
                    label: 'Daily Target',
                    data: chartData.map(entry => entry.target),
                    borderColor: '#B4413C',
                    backgroundColor: 'rgba(180, 65, 60, 0.1)',
                    borderDash: [5, 5],
                    pointBackgroundColor: '#B4413C',
                    pointBorderColor: '#B4413C',
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        labels: { color: 'white' },
                        display: true
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#1FB8CD',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        
        console.log('Progress chart created');
    } catch (error) {
        console.error('Error creating progress chart:', error);
        throw error;
    }
};

const createSubjectChart = async () => {
    const ctx = document.getElementById('subjectChart');
    if (!ctx) {
        console.warn('Subject chart canvas not found');
        return;
    }
    
    const subjectTotals = appState.progressData.length > 0 
        ? appState.progressData.reduce((acc, entry) => {
            Object.keys(entry.subjects).forEach(subject => {
                acc[subject] = (acc[subject] || 0) + entry.subjects[subject];
            });
            return acc;
        }, {})
        : { Physics: 150, Chemistry: 140, Mathematics: 130 };
    
    try {
        appState.charts.subject = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(subjectTotals),
                datasets: [{
                    data: Object.values(subjectTotals),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                    borderColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        labels: { color: 'white' },
                        display: true,
                        position: 'bottom'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#1FB8CD',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.raw / total) * 100);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Subject chart created');
    } catch (error) {
        console.error('Error creating subject chart:', error);
        throw error;
    }
};

const createChapterChart = async () => {
    const ctx = document.getElementById('chapterChart');
    if (!ctx) {
        console.warn('Chapter chart canvas not found');
        return;
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
    
    try {
        appState.charts.chapter = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(subjectCompletion),
                datasets: [{
                    label: 'Completion Percentage',
                    data: Object.values(subjectCompletion),
                    backgroundColor: ['rgba(31, 184, 205, 0.8)', 'rgba(255, 193, 133, 0.8)', 'rgba(180, 65, 60, 0.8)'],
                    borderColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        labels: { color: 'white' },
                        display: true
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#1FB8CD',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}% complete`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
        
        console.log('Chapter chart created');
    } catch (error) {
        console.error('Error creating chapter chart:', error);
        throw error;
    }
};

const createConfidenceChart = async () => {
    const ctx = document.getElementById('confidenceChart');
    if (!ctx) {
        console.warn('Confidence chart canvas not found');
        return;
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
        
        return count > 0 ? Math.round((totalConfidence / count) * 10) / 10 : 5;
    });
    
    try {
        appState.charts.confidence = new Chart(ctx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: Object.values(CONFIG.subjects).map(s => s.name),
                datasets: [{
                    label: 'Average Confidence Level',
                    data: confidenceLevels,
                    backgroundColor: 'rgba(31, 184, 205, 0.2)',
                    borderColor: '#1FB8CD',
                    pointBackgroundColor: '#1FB8CD',
                    pointBorderColor: '#1FB8CD',
                    pointRadius: 6,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        labels: { color: 'white' },
                        display: true
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: '#1FB8CD',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}/10`;
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: { 
                            color: 'rgba(255, 255, 255, 0.7)',
                            stepSize: 2
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' },
                        angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                        pointLabels: { 
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
        
        console.log('Confidence chart created');
    } catch (error) {
        console.error('Error creating confidence chart:', error);
        throw error;
    }
};

// Calendar Functions - COMPLETELY FIXED
const renderCalendar = () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('currentMonth');
    
    if (!calendarGrid || !monthYear) {
        console.warn('Calendar elements not found');
        return;
    }
    
    const year = appState.currentMonth.getFullYear();
    const month = appState.currentMonth.getMonth();
    
    monthYear.textContent = `${appState.currentMonth.toLocaleString('default', { month: 'long' })} ${year}`;
    monthYear.style.display = 'block';
    monthYear.style.visibility = 'visible';
    
    calendarGrid.innerHTML = '';
    calendarGrid.style.display = 'grid';
    calendarGrid.style.visibility = 'visible';
    
    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
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
        emptyDay.style.display = 'flex';
        emptyDay.style.visibility = 'visible';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Days of the month
    const today = utils.getToday();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        const dayDate = utils.formatDate(new Date(year, month, day));
        const progressEntry = appState.progressData.find(entry => entry.date === dayDate);
        
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.dataset.date = dayDate;
        dayElement.style.display = 'flex';
        dayElement.style.visibility = 'visible';
        
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
            
            // Add tooltip with question count
            dayElement.title = `${questions} questions solved`;
        } else {
            dayElement.classList.add('no-data');
            dayElement.title = 'No data recorded';
        }
        
        if (dayDate === today) {
            dayElement.classList.add('today');
        }
        
        calendarGrid.appendChild(dayElement);
    }
    
    appState.calendarInitialized = true;
    console.log('Calendar rendered for', monthYear.textContent);
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
        const dateObj = new Date(date + 'T00:00:00');
        modalDateEl.textContent = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        modalDateEl.style.display = 'block';
        modalDateEl.style.visibility = 'visible';
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
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
};

const closeModal = () => {
    const modal = document.getElementById('dayModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        setTimeout(() => modal.style.display = 'none', 300);
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
    
    // Update charts if we're on analytics tab
    if (appState.currentSection === 'analytics') {
        appState.chartsInitialized = false;
        initializeCharts();
    }
    
    closeModal();
    
    utils.showNotification('Progress updated successfully!', 'success');
};

// Todo Management - FIXED
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
    console.log('Todo added:', newTodo);
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
    container.style.display = 'block';
    container.style.visibility = 'visible';
    
    if (filteredTodos.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: rgba(255, 255, 255, 0.5); padding: 20px;">No tasks found</div>';
        return;
    }
    
    filteredTodos.forEach(todo => {
        const todoElement = document.createElement('div');
        todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoElement.style.display = 'block';
        todoElement.style.visibility = 'visible';
        
        todoElement.innerHTML = `
            <div class="todo-header">
                <div class="todo-task">${todo.task}</div>
                <div class="todo-actions">
                    <button class="todo-btn" data-action="toggle" data-id="${todo.id}" title="${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                        ${todo.completed ? '↶' : '✓'}
                    </button>
                    <button class="todo-btn" data-action="delete" data-id="${todo.id}" title="Delete task">×</button>
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
    
    // Add event listeners for todo actions using delegation
    container.removeEventListener('click', handleTodoActions); // Remove previous listener to avoid duplicates
    container.addEventListener('click', handleTodoActions);
    
    console.log('Todos rendered:', filteredTodos.length, 'items');
};

const handleTodoActions = async (e) => {
    const button = e.target.closest('.todo-btn');
    if (!button) return;
    
    const action = button.dataset.action;
    const id = parseInt(button.dataset.id);
    
    if (action === 'toggle') {
        await toggleTodo(id);
    } else if (action === 'delete') {
        await deleteTodo(id);
    }
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

// Data Export Functions - FIXED
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
    if (modal) {
        modal.classList.add('hidden');
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        setTimeout(() => modal.style.display = 'none', 300);
    }
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
    if (modal) {
        modal.classList.add('hidden');
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        setTimeout(() => modal.style.display = 'none', 300);
    }
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
    if (modal) {
        modal.classList.add('hidden');
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        setTimeout(() => modal.style.display = 'none', 300);
    }
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
    if (modal) {
        modal.classList.add('hidden');
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        setTimeout(() => modal.style.display = 'none', 300);
    }
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

// Theme Management - FIXED
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
    
    console.log('Theme toggled to:', newTheme);
};

// Make functions globally available - FIXED
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.FirebaseAuth = FirebaseAuth;
window.updateConnectionStatus = updateConnectionStatus;

// Initialize when DOM is loaded - FIXED
const initApp = () => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        console.log('DOM ready - Starting initialization...');
        init();
    }
};

// Start the application
initApp();