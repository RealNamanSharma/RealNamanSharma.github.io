// JEE 2026 Ultimate Tracker - Enhanced JavaScript (Fixed Version)
// Enhanced Application State and Configuration

let firebaseInitialized = false;
let auth, db;

// Enhanced Configuration
const CONFIG = {
    examDates: {
        jeeMain1: new Date('2026-01-20T09:00:00'),
        jeeMain2: new Date('2026-04-01T09:00:00'),
        jeeAdvanced: new Date('2026-05-18T09:00:00')
    },
    defaultSettings: {
        dailyTarget: 50,
        theme: 'dark',
        notifications: true,
        studyReminders: true
    },
    motivationalQuotes: [
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "The expert in anything was once a beginner. Keep pushing forward!",
        "Don't watch the clock; do what it does. Keep going towards your JEE dream.",
        "Believe you can crack JEE and you're halfway there.",
        "Champions keep solving until they get it right. You're a champion!",
        "Every problem solved takes you one step closer to IIT.",
        "Success is the sum of small efforts repeated day in and day out.",
        "The only impossible JEE journey is the one you never begin.",
        "Your limitation—it's only your imagination. Dream big, achieve bigger!",
        "Great things never come from comfort zones. Push your limits!",
        "Dream it. Wish it. Do it. JEE 2026 is yours to conquer!",
        "The harder you work for something, the greater you'll feel when you achieve it."
    ],
    
    // Enhanced JEE Syllabus Structure - Class 11 & 12
    subjects: {
        physics: {
            name: "Physics",
            totalChapters: 29,
            chapters: [
                { id: "units", name: "Units and Measurements", topics: ["Physical Quantities", "SI Units", "Dimensional Analysis", "Significant Figures", "Error Analysis"], class: "11" },
                { id: "kinematics", name: "Kinematics", topics: ["Motion in 1D", "Motion in 2D", "Projectile Motion", "Circular Motion"], class: "11" },
                { id: "motion", name: "Laws of Motion", topics: ["Newton's Laws", "Friction", "Circular Motion", "Banking"], class: "11" },
                { id: "workpower", name: "Work Energy Power", topics: ["Work-Energy Theorem", "Potential Energy", "Power", "Collisions"], class: "11" },
                { id: "system", name: "System of Particles & Rigid Body", topics: ["Center of Mass", "Angular Motion", "Moment of Inertia", "Rolling Motion"], class: "11" },
                { id: "gravitation", name: "Gravitation", topics: ["Universal Law", "Planetary Motion", "Satellites", "Escape Velocity"], class: "11" },
                { id: "bulk", name: "Properties of Bulk Matter", topics: ["Elasticity", "Surface Tension", "Viscosity", "Bernoulli's Principle"], class: "11" },
                { id: "thermo", name: "Thermodynamics", topics: ["Heat Transfer", "Thermal Expansion", "Calorimetry", "Laws of Thermodynamics"], class: "11" },
                { id: "kinetic", name: "Kinetic Theory", topics: ["Gas Laws", "Kinetic Theory", "Mean Free Path", "Degrees of Freedom"], class: "11" },
                { id: "oscillations", name: "Oscillations and Waves", topics: ["SHM", "Pendulum", "Wave Motion", "Sound Waves", "Doppler Effect"], class: "11" },
                { id: "electrostatics", name: "Electrostatics", topics: ["Electric Charge", "Electric Field", "Gauss Law", "Electric Potential", "Capacitors"], class: "12" },
                { id: "current", name: "Current Electricity", topics: ["Ohm's Law", "Kirchhoff's Laws", "Wheatstone Bridge", "Potentiometer"], class: "12" },
                { id: "magnetic", name: "Magnetic Effects of Current", topics: ["Magnetic Field", "Ampere's Law", "Force on Current", "Galvanometer"], class: "12" },
                { id: "induction", name: "Electromagnetic Induction", topics: ["Faraday's Law", "Lenz Law", "Self & Mutual Inductance", "Eddy Currents"], class: "12" },
                { id: "ac", name: "Alternating Current", topics: ["AC Circuits", "LC Oscillations", "Transformers", "Power in AC"], class: "12" },
                { id: "emwaves", name: "Electromagnetic Waves", topics: ["Maxwell's Equations", "EM Spectrum", "Wave Properties"], class: "12" },
                { id: "optics", name: "Optics", topics: ["Reflection", "Refraction", "Mirrors", "Lenses", "Interference", "Diffraction", "Polarization"], class: "12" },
                { id: "dual", name: "Dual Nature of Matter", topics: ["Photoelectric Effect", "de Broglie Wavelength", "Davisson-Germer"], class: "12" },
                { id: "atoms", name: "Atoms and Nuclei", topics: ["Bohr Model", "X-rays", "Radioactivity", "Nuclear Reactions", "Nuclear Energy"], class: "12" },
                { id: "electronic", name: "Electronic Devices", topics: ["Semiconductors", "PN Junction", "Transistors", "Logic Gates"], class: "12" }
            ]
        },
        
        chemistry: {
            name: "Chemistry",
            totalChapters: 27,
            chapters: [
                { id: "basic", name: "Basic Concepts of Chemistry", topics: ["Stoichiometry", "Atomic & Molecular Mass", "Mole Concept", "Equivalent Weight"], class: "11" },
                { id: "atomic", name: "Structure of Atom", topics: ["Bohr Model", "Quantum Numbers", "Electronic Configuration", "Aufbau Principle"], class: "11" },
                { id: "periodic", name: "Classification & Periodicity", topics: ["Modern Periodic Law", "Periodic Trends", "s,p,d,f Block Elements"], class: "11" },
                { id: "bonding", name: "Chemical Bonding", topics: ["Ionic Bonding", "Covalent Bonding", "VSEPR Theory", "Hybridization", "MOT"], class: "11" },
                { id: "states", name: "States of Matter", topics: ["Gas Laws", "Liquid State", "Solid State", "Phase Transitions"], class: "11" },
                { id: "thermodynamics", name: "Thermodynamics", topics: ["First Law", "Enthalpy", "Entropy", "Gibbs Free Energy"], class: "11" },
                { id: "equilibrium", name: "Equilibrium", topics: ["Chemical Equilibrium", "Le Chatelier", "Ionic Equilibrium", "pH"], class: "11" },
                { id: "hydrogen", name: "Hydrogen", topics: ["Properties", "Hydrides", "Water", "Hydrogen Peroxide"], class: "11" },
                { id: "sblock", name: "s-Block Elements", topics: ["Alkali Metals", "Alkaline Earth Metals", "Properties", "Compounds"], class: "11" },
                { id: "pblock11", name: "p-Block Elements (Group 13-14)", topics: ["Boron Family", "Carbon Family", "Allotropes"], class: "11" },
                { id: "purification", name: "Purification & Characterization", topics: ["Separation Methods", "Qualitative Analysis", "Quantitative Analysis"], class: "11" },
                { id: "principles", name: "Basic Principles", topics: ["IUPAC Nomenclature", "Isomerism", "Electronic Effects", "Reaction Mechanisms"], class: "11" },
                { id: "hydrocarbons", name: "Hydrocarbons", topics: ["Alkanes", "Alkenes", "Alkynes", "Aromatic Hydrocarbons"], class: "11" },
                { id: "solutions", name: "Solutions", topics: ["Concentration Terms", "Raoult's Law", "Colligative Properties", "Abnormal Molecular Mass"], class: "12" },
                { id: "electrochemistry", name: "Electrochemistry", topics: ["Galvanic Cells", "Nernst Equation", "Electrolysis", "Batteries", "Corrosion"], class: "12" },
                { id: "kinetics", name: "Chemical Kinetics", topics: ["Rate Laws", "Order & Molecularity", "Arrhenius Equation", "Catalysis"], class: "12" },
                { id: "surface", name: "Surface Chemistry", topics: ["Adsorption", "Catalysis", "Colloids", "Emulsions"], class: "12" },
                { id: "metallurgy", name: "Metallurgy", topics: ["Occurrence", "Extraction", "Refining", "Uses of Metals"], class: "12" },
                { id: "pblock12", name: "p-Block Elements", topics: ["Group 15-18", "Oxygen Family", "Halogen Family", "Noble Gases"], class: "12" },
                { id: "dblock", name: "d & f Block Elements", topics: ["Transition Elements", "Coordination Compounds", "Lanthanides", "Actinides"], class: "12" },
                { id: "coordination", name: "Coordination Compounds", topics: ["Werner Theory", "IUPAC Nomenclature", "VBT", "CFT", "Applications"], class: "12" },
                { id: "haloalkanes", name: "Haloalkanes & Haloarenes", topics: ["Nomenclature", "Preparation", "Reactions", "Uses"], class: "12" },
                { id: "alcohols", name: "Alcohols, Phenols & Ethers", topics: ["Classification", "Preparation", "Properties", "Reactions"], class: "12" },
                { id: "aldehydes", name: "Aldehydes, Ketones & Carboxylic Acids", topics: ["Nomenclature", "Preparation", "Properties", "Reactions"], class: "12" },
                { id: "nitrogen", name: "Organic Compounds with Nitrogen", topics: ["Amines", "Diazonium Salts", "Cyanides"], class: "12" },
                { id: "biomolecules", name: "Biomolecules", topics: ["Carbohydrates", "Proteins", "Lipids", "Nucleic Acids", "Vitamins"], class: "12" },
                { id: "polymers", name: "Polymers", topics: ["Classification", "Polymerization", "Important Polymers", "Biodegradable Polymers"], class: "12" },
                { id: "everyday", name: "Chemistry in Everyday Life", topics: ["Drugs", "Soaps & Detergents", "Food Chemistry"], class: "12" }
            ]
        },
        
        mathematics: {
            name: "Mathematics",
            totalChapters: 29,
            chapters: [
                { id: "sets", name: "Sets", topics: ["Set Operations", "Venn Diagrams", "Relations", "Functions"], class: "11" },
                { id: "relations", name: "Relations and Functions", topics: ["Types of Relations", "Equivalence Relations", "Functions", "Inverse Functions"], class: "11" },
                { id: "trigonometry", name: "Trigonometric Functions", topics: ["Trigonometric Ratios", "Identities", "Equations", "Inverse Functions"], class: "11" },
                { id: "induction", name: "Mathematical Induction", topics: ["Principle", "Applications", "Variations"], class: "11" },
                { id: "complex", name: "Complex Numbers", topics: ["Algebra", "Argand Plane", "Polar Form", "De Moivre's Theorem"], class: "11" },
                { id: "inequalities", name: "Linear Inequalities", topics: ["Algebraic Solutions", "Graphical Solutions", "System of Inequalities"], class: "11" },
                { id: "permutations", name: "Permutations & Combinations", topics: ["Fundamental Principle", "Permutations", "Combinations", "Applications"], class: "11" },
                { id: "binomial", name: "Binomial Theorem", topics: ["Binomial Expansion", "General Term", "Middle Term", "Properties"], class: "11" },
                { id: "sequences", name: "Sequences and Series", topics: ["AP", "GP", "HP", "AGP", "Sum to n Terms"], class: "11" },
                { id: "straightlines", name: "Straight Lines", topics: ["Slope", "Equations", "Distance", "Area"], class: "11" },
                { id: "conics", name: "Conic Sections", topics: ["Circle", "Parabola", "Ellipse", "Hyperbola"], class: "11" },
                { id: "3dgeometry", name: "3D Geometry (Introduction)", topics: ["Coordinates", "Distance", "Section Formula"], class: "11" },
                { id: "limits", name: "Limits and Derivatives", topics: ["Limits", "Continuity", "Derivatives", "Applications"], class: "11" },
                { id: "reasoning", name: "Mathematical Reasoning", topics: ["Statements", "Logical Operations", "Implications", "Quantifiers"], class: "11" },
                { id: "statistics", name: "Statistics", topics: ["Mean", "Median", "Mode", "Standard Deviation", "Variance"], class: "11" },
                { id: "probability", name: "Probability", topics: ["Sample Space", "Events", "Addition & Multiplication Rules"], class: "11" },
                { id: "relations12", name: "Relations and Functions", topics: ["Types of Functions", "Composition", "Inverse Functions"], class: "12" },
                { id: "inverse", name: "Inverse Trigonometric Functions", topics: ["Principal Values", "Properties", "Equations"], class: "12" },
                { id: "matrices", name: "Matrices", topics: ["Types", "Operations", "Inverse", "Elementary Operations"], class: "12" },
                { id: "determinants", name: "Determinants", topics: ["Properties", "Cofactor", "Adjoint", "Cramer's Rule", "Area & Volume"], class: "12" },
                { id: "continuity", name: "Continuity & Differentiability", topics: ["Continuity", "Differentiability", "Chain Rule", "Derivative of Parametric Functions"], class: "12" },
                { id: "applications", name: "Applications of Derivatives", topics: ["Rate of Change", "Tangents & Normals", "Maxima & Minima", "Curve Sketching"], class: "12" },
                { id: "integrals", name: "Integrals", topics: ["Indefinite Integrals", "Integration by Parts", "Partial Fractions", "Substitution"], class: "12" },
                { id: "integrals_app", name: "Applications of Integrals", topics: ["Area Under Curves", "Area Between Curves", "Volume of Solids"], class: "12" },
                { id: "differential", name: "Differential Equations", topics: ["Formation", "Order & Degree", "Solution Methods", "Applications"], class: "12" },
                { id: "vectors", name: "Vector Algebra", topics: ["Addition", "Scalar Product", "Vector Product", "Scalar Triple Product"], class: "12" },
                { id: "3d", name: "Three Dimensional Geometry", topics: ["Direction Cosines", "Line", "Plane", "Distance"], class: "12" },
                { id: "programming", name: "Linear Programming", topics: ["Constraints", "Objective Function", "Graphical Method", "Optimal Solution"], class: "12" },
                { id: "probability12", name: "Probability", topics: ["Conditional Probability", "Bayes Theorem", "Random Variables", "Distributions"], class: "12" }
            ]
        }
    },
    
    pyqYears: ["2019", "2020", "2021", "2022", "2023", "2024"],
    examTypes: ["JEE Main", "JEE Advanced"],
    
    // Achievement levels
    achievements: {
        questionsPerDay: [
            { min: 0, max: 20, icon: "🌱", title: "Getting Started", color: "#81C784" },
            { min: 21, max: 40, icon: "🔥", title: "Building Momentum", color: "#FFA726" },
            { min: 41, max: 60, icon: "⚡", title: "Power Mode", color: "#FF7043" },
            { min: 61, max: 80, icon: "🚀", title: "Beast Mode", color: "#AB47BC" },
            { min: 81, max: 999, icon: "👑", title: "JEE Warrior", color: "#FFD700" }
        ]
    }
};

// Enhanced Application State
let appState = {
    currentSection: 'dashboard',
    currentClass: 'all',
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
    currentStreak: 0,
    longestStreak: 0,
    studyPlans: [],
    revisionSchedule: [],
    achievements: [],
    mobileMenuOpen: false
};

// Enhanced Utility Functions
const utils = {
    formatDate: (date) => date.toISOString().split('T')[0],
    parseDate: (dateString) => new Date(dateString + 'T00:00:00'),
    getToday: () => utils.formatDate(new Date()),
    
    showNotification: (message, type = 'info', duration = 5000) => {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        
        const icons = {
            success: '✅',
            error: '❌', 
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        const colors = {
            error: 'linear-gradient(135deg, #ff4444, #cc1f1f)',
            success: 'linear-gradient(135deg, #FFA726, #FFB74D)', 
            info: 'linear-gradient(135deg, #42A5F5, #1976D2)',
            warning: 'linear-gradient(135deg, #FF7043, #F4511E)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            z-index: 3000;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideInRight 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            max-width: 400px;
            min-width: 300px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.2);
        `;
        
        if (!document.getElementById('notificationStyles')) {
            const style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%) scale(0.8); opacity: 0; }
                    to { transform: translateX(0) scale(1); opacity: 1; }
                }
                .notification-icon { font-size: 18px; }
                .notification-message { flex: 1; font-weight: 500; line-height: 1.4; }
                .notification-close {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .notification-close:hover {
                    background: rgba(255,255,255,0.3);
                    transform: scale(1.1);
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in-out forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
        
        return notification;
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
    
    checkAchievement: (questionsToday) => {
        const achievement = CONFIG.achievements.questionsPerDay.find(
            level => questionsToday >= level.min && questionsToday <= level.max
        );
        return achievement || CONFIG.achievements.questionsPerDay[0];
    },
    
    calculateStreak: () => {
        if (appState.progressData.length === 0) return 0;
        
        const sortedData = appState.progressData
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let streak = 0;
        let currentDate = new Date();
        
        for (const entry of sortedData) {
            const entryDate = new Date(entry.date);
            const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak && entry.questions > 0) {
                streak++;
                currentDate = entryDate;
            } else {
                break;
            }
        }
        
        return streak;
    },
    
    isMobile: () => window.innerWidth <= 768,
    
    scrollToSection: (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};

// Enhanced Firebase Authentication with better error handling
const FirebaseAuth = {
    provider: null,
    isInitialized: false,
    
    async waitForFirebase() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 30; // Reduced timeout
            
            const check = () => {
                attempts++;
                if (window.firebaseReady && window.firebaseApp && window.auth && window.db) {
                    auth = window.auth;
                    db = window.db;
                    firebaseInitialized = true;
                    console.log('Firebase initialized successfully');
                    resolve(true);
                } else if (window.firebaseError || attempts >= maxAttempts) {
                    console.warn('Firebase initialization timeout or error:', window.firebaseError);
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
                console.warn('Firebase not available, showing auth modal with demo mode');
                updateConnectionStatus('offline');
                this.showAuthModal();
                return false;
            }
            
            const { 
                GoogleAuthProvider, 
                signInWithPopup, 
                signInWithEmailAndPassword, 
                createUserWithEmailAndPassword, 
                signOut, 
                onAuthStateChanged
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            
            this.provider = new GoogleAuthProvider();
            this.signInWithPopup = signInWithPopup;
            this.signInWithEmailAndPassword = signInWithEmailAndPassword;
            this.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
            this.signOut = signOut;
            this.onAuthStateChanged = onAuthStateChanged;
            
            this.onAuthStateChanged(auth, async (user) => {
                console.log('Auth state changed:', user?.email || 'No user');
                
                if (user) {
                    appState.user = user;
                    updateConnectionStatus('connected');
                    this.hideAuthModal();
                    this.updateUI();
                    await this.syncUserData();
                    utils.showNotification(`Welcome back, ${user.displayName || user.email}!`, 'success');
                } else {
                    appState.user = null;
                    updateConnectionStatus('offline');
                    if (!appState.user?.isDemo) {
                        this.showAuthModal();
                    }
                }
            });
            
            this.isInitialized = true;
            return true;
            
        } catch (error) {
            console.error('Auth initialization error:', error);
            this.showAuthError('googleAuthError', 'Authentication system temporarily unavailable. Please try demo mode.');
            updateConnectionStatus('offline');
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
            
            utils.showNotification(`Welcome, ${result.user.displayName}! 🎉`, 'success');
            this.hideAuthModal();
            await this.syncUserData();
            
            return result.user;
            
        } catch (error) {
            console.error('Google sign in error:', error);
            
            const errorMessages = {
                'auth/popup-blocked': 'Popup was blocked. Please allow popups and try again.',
                'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
                'auth/network-request-failed': 'Network error. Please check your connection and try again.',
                'auth/too-many-requests': 'Too many attempts. Please wait a few minutes before trying again.',
                'auth/internal-error': 'Internal error occurred. Please try again or use email sign-in.'
            };
            
            const message = errorMessages[error.code] || 'Google sign-in failed. Please try again or use email sign-in.';
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
            
            const email = document.getElementById('emailInput')?.value.trim();
            const password = document.getElementById('passwordInput')?.value;
            
            if (!email || !password) {
                throw new Error('Please enter both email and password');
            }
            
            updateConnectionStatus('connecting');
            
            const result = await this.signInWithEmailAndPassword(auth, email, password);
            appState.user = result.user;
            
            utils.showNotification('Successfully signed in! 🚀', 'success');
            this.hideAuthModal();
            await this.syncUserData();
            
            return result.user;
            
        } catch (error) {
            console.error('Email sign in error:', error);
            
            const errorMessages = {
                'auth/user-not-found': 'No account found with this email. Please sign up first.',
                'auth/wrong-password': 'Incorrect password. Please try again.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/too-many-requests': 'Too many failed attempts. Please try again later.'
            };
            
            const message = errorMessages[error.code] || 'Sign-in failed. Please try again.';
            this.showAuthError('emailAuthError', message);
            updateConnectionStatus('offline');
            
            throw error;
        }
    },
    
    async signUpWithEmail() {
        try {
            this.clearAuthError('emailAuthError');
            
            const email = document.getElementById('emailInput')?.value.trim();
            const password = document.getElementById('passwordInput')?.value;
            
            if (!email || !password) {
                throw new Error('Please enter both email and password');
            }
            
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }
            
            updateConnectionStatus('connecting');
            
            const result = await this.createUserWithEmailAndPassword(auth, email, password);
            appState.user = result.user;
            
            utils.showNotification('Account created successfully! Welcome! 🎉', 'success');
            this.hideAuthModal();
            await this.syncUserData();
            
            return result.user;
            
        } catch (error) {
            console.error('Email sign up error:', error);
            
            const errorMessages = {
                'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/weak-password': 'Password is too weak. Please use at least 6 characters.'
            };
            
            const message = errorMessages[error.code] || 'Sign-up failed. Please try again.';
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
            appState.currentStreak = 0;
            
            this.updateUI();
            updateDashboardStats();
            updateSubjectProgress();
            renderTodos();
            this.showAuthModal();
            
            utils.showNotification('Successfully signed out! 👋', 'success');
            updateConnectionStatus('offline');
            
        } catch (error) {
            console.error('Sign out error:', error);
            utils.showNotification('Sign out failed. Please try again.', 'error');
        }
    },
    
    enterDemoMode() {
        appState.user = { 
            uid: 'demo', 
            email: 'demo@jeetracker.com', 
            displayName: 'Demo User', 
            isDemo: true,
            photoURL: null
        };
        
        this.updateUI();
        this.hideAuthModal();
        updateConnectionStatus('offline');
        
        loadSampleData();
        loadSampleChapterData();
        
        updateAllDisplays();
        
        utils.showNotification('Demo Mode Active 🎯 - Explore all features!', 'info', 7000);
    },
    
    updateUI() {
        const userInfo = document.getElementById('userInfo');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        
        if (appState.user) {
            if (userInfo) {
                userInfo.style.display = 'flex';
                
                if (userAvatar) {
                    if (appState.user.photoURL) {
                        userAvatar.src = appState.user.photoURL;
                        userAvatar.style.display = 'block';
                    } else {
                        userAvatar.style.display = 'none';
                    }
                }
                
                if (userName) {
                    const displayName = appState.user.displayName || 
                                     appState.user.email?.split('@')[0] || 
                                     'User';
                    userName.textContent = displayName.length > 15 ? 
                                          displayName.substring(0, 15) + '...' : 
                                          displayName;
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
            errorElement.innerHTML = `<span style="color: #ff6b6b;">⚠️ ${message}</span>`;
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
            updateConnectionStatus('connecting');
            await Promise.all([
                FirebaseDB.loadProgressData(),
                FirebaseDB.loadTodos(),
                FirebaseDB.loadChapterData(),
                FirebaseDB.loadSettings()
            ]);
            
            updateAllDisplays();
            appState.lastSyncTime = new Date();
            updateConnectionStatus('connected');
            
        } catch (error) {
            console.error('Sync error:', error);
            utils.showNotification('Some data failed to sync. Working in offline mode.', 'warning');
            updateConnectionStatus('offline');
        }
    }
};

// Simple Firebase DB operations (placeholder for offline mode)
const FirebaseDB = {
    async loadProgressData() {
        // Simulate loading
        console.log('Loading progress data...');
    },
    
    async loadTodos() {
        console.log('Loading todos...');
    },
    
    async loadChapterData() {
        console.log('Loading chapter data...');
    },
    
    async loadSettings() {
        console.log('Loading settings...');
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
            if (appState.user?.isDemo) {
                statusText.textContent = '🎯 Demo Mode';
            } else {
                statusText.textContent = '🟢 Connected';
            }
            break;
            
        case 'connecting':
            statusText.textContent = '🔄 Syncing...';
            break;
            
        case 'offline':
            indicator.classList.add('offline');
            statusText.textContent = '🔴 Offline';
            
            if (!appState.user?.isDemo && retryBtn) {
                retryBtn.classList.remove('hidden');
            }
            break;
            
        default:
            statusText.textContent = '⚠️ Unknown';
    }
};

// Local Storage
const storage = {
    save: (key, data) => {
        try {
            localStorage.setItem(`jee-tracker-v2-${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    },
    
    load: (key, defaultValue = null) => {
        try {
            const data = localStorage.getItem(`jee-tracker-v2-${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }
};

// Enhanced Application Initialization (FIXED)
const init = async () => {
    console.log('🚀 Initializing JEE 2026 Ultimate Tracker...');
    
    try {
        // Show loader initially
        showSmoothLoader();
        
        // Load app state
        loadAppState();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start features
        startCountdowns();
        updateMotivationalQuote();
        
        // Set current date
        const questionDateInput = document.getElementById('questionDate');
        if (questionDateInput) {
            questionDateInput.value = utils.getToday();
            questionDateInput.max = utils.getToday();
        }
        
        // Show dashboard
        showSection('dashboard');
        
        // Initialize Firebase Auth (non-blocking)
        setTimeout(async () => {
            try {
                await FirebaseAuth.initializeAuth();
            } catch (error) {
                console.error('Firebase init error:', error);
                updateConnectionStatus('offline');
                FirebaseAuth.showAuthModal();
            }
        }, 500);
        
        // Network listeners
        window.addEventListener('online', () => {
            appState.isOnline = true;
            utils.showNotification('🌐 Back online!', 'success');
        });
        
        window.addEventListener('offline', () => {
            appState.isOnline = false;
            utils.showNotification('📡 Working offline', 'warning');
        });
        
        // Mobile optimizations
        if (utils.isMobile()) {
            initMobileOptimizations();
        }
        
        appState.isInitialized = true;
        console.log('✅ App initialized successfully!');
        
        // Hide loader after initialization
        setTimeout(() => {
            hideSmoothLoader();
            // Show auth modal if no user
            if (!appState.user) {
                FirebaseAuth.showAuthModal();
            }
        }, 2000); // Ensure smooth loading experience
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        hideSmoothLoader();
        utils.showNotification('App initialization failed. Please refresh the page.', 'error');
    }
};

// Mobile Optimizations
const initMobileOptimizations = () => {
    console.log('📱 Initializing mobile optimizations...');
    
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            if (utils.isMobile()) {
                input.style.fontSize = '16px'; // Prevent zoom on iOS
            }
        });
    });
};

// Loader Functions (FIXED)
const showSmoothLoader = () => {
    const loader = document.getElementById('smoothLoader');
    if (loader) {
        loader.classList.remove('hidden');
        loader.style.display = 'flex';
    }
};

const hideSmoothLoader = () => {
    const loader = document.getElementById('smoothLoader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.classList.add('hidden');
            loader.style.display = 'none';
            loader.style.opacity = '1'; // Reset for future use
        }, 500);
    }
};

// Load Application State
const loadAppState = () => {
    console.log('💾 Loading application state...');
    
    try {
        appState.progressData = storage.load('progressData', []);
        appState.todos = storage.load('todos', []);
        appState.chapterData = storage.load('chapterData', {});
        appState.settings = { ...CONFIG.defaultSettings, ...storage.load('settings', {}) };
        
        appState.currentStreak = utils.calculateStreak();
        appState.longestStreak = storage.load('longestStreak', 0);
        
        if (appState.currentStreak > appState.longestStreak) {
            appState.longestStreak = appState.currentStreak;
            storage.save('longestStreak', appState.longestStreak);
        }
        
        const targetInput = document.getElementById('dailyTarget');
        if (targetInput) {
            targetInput.value = appState.settings.dailyTarget;
        }
        
        console.log('✅ Application state loaded successfully');
        
    } catch (error) {
        console.error('❌ Failed to load application state:', error);
        utils.showNotification('Failed to load some data. Using defaults.', 'warning');
    }
};

// Enhanced Sample Data
const loadSampleData = () => {
    console.log('📊 Loading sample data for demo...');
    
    const sampleProgressData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = utils.formatDate(date);
        
        const baseQuestions = 30 + Math.floor(Math.random() * 40);
        const physics = Math.floor(baseQuestions * (0.3 + Math.random() * 0.2));
        const chemistry = Math.floor(baseQuestions * (0.3 + Math.random() * 0.2));
        const mathematics = baseQuestions - physics - chemistry;
        
        sampleProgressData.push({
            date: dateString,
            questions: baseQuestions,
            target: 50,
            subjects: {
                Physics: Math.max(0, physics),
                Chemistry: Math.max(0, chemistry),
                Mathematics: Math.max(0, mathematics)
            }
        });
    }
    
    const sampleTodos = [
        {
            id: Date.now() + 1,
            task: "Complete Mechanics chapter revision",
            priority: "High",
            subject: "Physics",
            completed: false,
            dueDate: utils.formatDate(new Date(Date.now() + 86400000))
        },
        {
            id: Date.now() + 2,
            task: "Practice Organic Chemistry reactions",
            priority: "Medium",
            subject: "Chemistry",
            completed: false,
            dueDate: utils.formatDate(new Date(Date.now() + 2 * 86400000))
        },
        {
            id: Date.now() + 3,
            task: "Solve Integration problems",
            priority: "High",
            subject: "Mathematics",
            completed: false,
            dueDate: utils.formatDate(new Date(Date.now() + 86400000))
        }
    ];
    
    appState.progressData = sampleProgressData;
    appState.todos = sampleTodos;
    appState.currentStreak = 5;
    
    console.log('✅ Sample data loaded');
};

const loadSampleChapterData = () => {
    console.log('📚 Loading sample chapter data...');
    
    const sampleChapterData = {
        'physics_kinematics': {
            completed: true,
            confidence: 8,
            notes: "Strong understanding of projectile motion",
            pyq: { "jeeMain2023": true, "jeeMain2022": true }
        },
        'chemistry_atomic': {
            completed: true,
            confidence: 9,
            notes: "Excellent grasp of quantum numbers",
            pyq: { "jeeMain2023": true }
        },
        'mathematics_sets': {
            completed: true,
            confidence: 8,
            notes: "Set operations mastered",
            pyq: { "jeeMain2023": true }
        }
    };
    
    appState.chapterData = sampleChapterData;
    console.log('✅ Sample chapter data loaded');
};

// Event Listeners Setup
const setupEventListeners = () => {
    console.log('🔧 Setting up event listeners...');
    
    // Navigation
    document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section') || 
                           link.getAttribute('href')?.substring(1);
            
            if (section) {
                showSection(section);
                closeMobileMenu();
            }
        });
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            appState.mobileMenuOpen = !appState.mobileMenuOpen;
            
            if (appState.mobileMenuOpen) {
                navMenu.classList.add('active');
                mobileMenuToggle.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Authentication
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const emailSignInBtn = document.getElementById('emailSignInBtn');
    const emailSignUpBtn = document.getElementById('emailSignUpBtn');
    const demoModeBtn = document.getElementById('demoModeBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    
    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', () => {
            FirebaseAuth.signInWithGoogle().catch(console.error);
        });
    }
    
    if (emailSignInBtn) {
        emailSignInBtn.addEventListener('click', () => {
            FirebaseAuth.signInWithEmail().catch(console.error);
        });
    }
    
    if (emailSignUpBtn) {
        emailSignUpBtn.addEventListener('click', () => {
            FirebaseAuth.signUpWithEmail().catch(console.error);
        });
    }
    
    if (demoModeBtn) {
        demoModeBtn.addEventListener('click', () => {
            FirebaseAuth.enterDemoMode();
        });
    }
    
    if (signOutBtn) {
        signOutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to sign out?')) {
                FirebaseAuth.signOutUser().catch(console.error);
            }
        });
    }
    
    // Progress tracking
    const saveProgressBtn = document.getElementById('saveProgress');
    if (saveProgressBtn) {
        saveProgressBtn.addEventListener('click', saveProgress);
    }
    
    // Auto-calculation
    ['physicsCount', 'chemistryCount', 'mathCount'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateTotal);
        }
    });
    
    // Todo management
    const addTaskBtn = document.getElementById('addTaskBtn');
    const addTodoBtn = document.getElementById('addTodo');
    const closeTodoFormBtn = document.getElementById('closeTodoForm');
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            const form = document.getElementById('todoFormCompact');
            if (form) {
                form.classList.toggle('active');
            }
        });
    }
    
    if (addTodoBtn) {
        addTodoBtn.addEventListener('click', addTodo);
    }
    
    if (closeTodoFormBtn) {
        closeTodoFormBtn.addEventListener('click', () => {
            const form = document.getElementById('todoFormCompact');
            if (form) {
                form.classList.remove('active');
            }
        });
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            filterTodos(filter);
        });
    });
    
    // Class selector
    document.querySelectorAll('.class-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const classType = e.target.dataset.class;
            setClassFilter(classType);
        });
    });
    
    // Modal controls
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
        
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }
    });
    
    // Export functionality
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const modal = document.getElementById('exportModal');
            if (modal) modal.classList.remove('hidden');
        });
    }
    
    console.log('✅ Event listeners setup complete');
};

// Helper Functions
const closeMobileMenu = () => {
    const navMenu = document.getElementById('navMenu');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    if (navMenu && mobileMenuToggle && appState.mobileMenuOpen) {
        navMenu.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        document.body.style.overflow = '';
        appState.mobileMenuOpen = false;
    }
};

const showSection = (sectionName) => {
    console.log('🎯 Showing section:', sectionName);
    
    // Update navigation
    document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(link => {
        link.classList.remove('active');
        const linkSection = link.getAttribute('data-section') || 
                           link.getAttribute('href')?.substring(1);
        if (linkSection === sectionName) {
            link.classList.add('active');
        }
    });
    
    // Switch sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        appState.currentSection = sectionName;
        
        // Initialize section content
        setTimeout(() => {
            switch (sectionName) {
                case 'chapters':
                    renderChapters();
                    break;
                case 'todos':
                    renderTodos();
                    break;
                case 'analytics':
                    initializeCharts();
                    break;
                case 'calendar':
                    renderCalendar();
                    break;
            }
        }, 100);
    }
};

// Countdown Functions
const startCountdowns = () => {
    const updateCountdowns = () => {
        Object.keys(CONFIG.examDates).forEach(exam => {
            const examKey = exam.replace('jee', '').replace('Main1', 'main1').replace('Main2', 'main2').replace('Advanced', 'advanced');
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
    
    if (!daysEl || !hoursEl || !minutesEl) return;
    
    if (distance < 0) {
        [daysEl, hoursEl, minutesEl].forEach(el => el.textContent = '00');
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    
    daysEl.textContent = String(days).padStart(3, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
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

// Progress Functions
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

const saveProgress = () => {
    const dateInput = document.getElementById('questionDate');
    const questionsInput = document.getElementById('questionsCount');
    const physicsInput = document.getElementById('physicsCount');
    const chemistryInput = document.getElementById('chemistryCount');
    const mathInput = document.getElementById('mathCount');
    
    if (!dateInput || !questionsInput) return;
    
    const date = dateInput.value;
    const questions = parseInt(questionsInput.value) || 0;
    const physics = parseInt(physicsInput?.value) || 0;
    const chemistry = parseInt(chemistryInput?.value) || 0;
    const math = parseInt(mathInput?.value) || 0;
    
    if (!date) {
        utils.showNotification('Please select a date', 'error');
        return;
    }
    
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
    
    storage.save('progressData', appState.progressData);
    
    updateAllDisplays();
    
    // Clear form
    [questionsInput, physicsInput, chemistryInput, mathInput].forEach(input => {
        if (input) input.value = '';
    });
    
    utils.showNotification('Progress saved successfully! 🎉', 'success');
};

// Todo Functions
const addTodo = () => {
    const taskInput = document.getElementById('todoTask');
    const subjectSelect = document.getElementById('todoSubject');
    const prioritySelect = document.getElementById('todoPriority');
    const dueDateInput = document.getElementById('todoDueDate');
    
    if (!taskInput) return;
    
    const task = taskInput.value.trim();
    if (!task) {
        utils.showNotification('Please enter a task description', 'error');
        return;
    }
    
    const newTodo = {
        id: Date.now(),
        task,
        subject: subjectSelect?.value || 'General',
        priority: prioritySelect?.value || 'Medium',
        dueDate: dueDateInput?.value || '',
        completed: false
    };
    
    appState.todos.push(newTodo);
    storage.save('todos', appState.todos);
    
    renderTodos();
    
    // Clear form
    taskInput.value = '';
    if (subjectSelect) subjectSelect.value = 'General';
    if (prioritySelect) prioritySelect.value = 'Medium';
    if (dueDateInput) dueDateInput.value = '';
    
    // Hide form
    const form = document.getElementById('todoFormCompact');
    if (form) form.classList.remove('active');
    
    utils.showNotification('Task added successfully! ✅', 'success');
};

const toggleTodo = (id) => {
    const todo = appState.todos.find(item => item.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        storage.save('todos', appState.todos);
        renderTodos();
        utils.showNotification(`Task ${todo.completed ? 'completed' : 'reopened'}! 🎯`, 'success');
    }
};

const deleteTodo = (id) => {
    appState.todos = appState.todos.filter(item => item.id !== id);
    storage.save('todos', appState.todos);
    renderTodos();
    utils.showNotification('Task deleted! 🗑️', 'success');
};

const filterTodos = (filter) => {
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    renderTodos(filter);
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
        container.innerHTML = '<div style="text-align: center; color: rgba(255, 255, 255, 0.5); padding: 40px;">No tasks found</div>';
        return;
    }
    
    filteredTodos.forEach(todo => {
        const todoElement = document.createElement('div');
        todoElement.className = `todo-item glass-card ${todo.completed ? 'completed' : ''}`;
        
        todoElement.innerHTML = `
            <div class="todo-header">
                <div class="todo-task">${todo.task}</div>
                <div class="todo-actions">
                    <button class="btn btn--sm btn--outline" onclick="toggleTodo(${todo.id})" title="${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                        ${todo.completed ? '↶' : '✓'}
                    </button>
                    <button class="btn btn--sm btn--outline" onclick="deleteTodo(${todo.id})" title="Delete task" style="color: #ff6b6b; border-color: #ff6b6b;">×</button>
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
    
    // Update stats
    const pendingCount = appState.todos.filter(todo => !todo.completed).length;
    const completedToday = appState.todos.filter(todo => 
        todo.completed && todo.dueDate === utils.getToday()
    ).length;
    
    const pendingEl = document.getElementById('pendingCount');
    const completedTodayEl = document.getElementById('completedToday');
    
    if (pendingEl) pendingEl.textContent = `${pendingCount} pending`;
    if (completedTodayEl) completedTodayEl.textContent = `${completedToday} completed today`;
};

// Chapter Functions
const setClassFilter = (classType) => {
    document.querySelectorAll('.class-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.class === classType) {
            btn.classList.add('active');
        }
    });
    
    appState.currentClass = classType;
    renderChapters();
};

const renderChapters = () => {
    console.log('Rendering chapters...');
    Object.keys(CONFIG.subjects).forEach(subject => {
        renderSubjectChapters(subject);
    });
    updateSubjectProgress();
};

const renderSubjectChapters = (subject) => {
    const container = document.getElementById(`${subject}Chapters`);
    if (!container) return;
    
    const subjectData = CONFIG.subjects[subject];
    container.innerHTML = '';
    
    let chaptersToShow = subjectData.chapters;
    if (appState.currentClass !== 'all') {
        chaptersToShow = subjectData.chapters.filter(chapter => 
            chapter.class === appState.currentClass
        );
    }
    
    chaptersToShow.forEach(chapter => {
        const chapterKey = `${subject}_${chapter.id}`;
        const chapterData = appState.chapterData[chapterKey] || {
            completed: false,
            confidence: 5,
            notes: '',
            pyq: {}
        };
        
        const chapterElement = document.createElement('div');
        chapterElement.className = 'chapter-card glass-card';
        chapterElement.innerHTML = `
            <div class="chapter-header">
                <input type="checkbox" class="chapter-checkbox" id="checkbox_${chapterKey}" 
                       ${chapterData.completed ? 'checked' : ''}>
                <label for="checkbox_${chapterKey}" class="chapter-title">${chapter.name}</label>
                <span class="class-badge">Class ${chapter.class}</span>
            </div>
            <div class="chapter-topics">${chapter.topics.slice(0, 3).join(' • ')}${chapter.topics.length > 3 ? '...' : ''}</div>
            
            <div class="chapter-controls">
                <div class="confidence-control">
                    <span class="confidence-label">Confidence:</span>
                    <input type="range" class="confidence-slider" min="1" max="10" 
                           value="${chapterData.confidence}" id="confidence_${chapterKey}">
                    <span class="confidence-value" id="value_${chapterKey}">${chapterData.confidence}</span>
                </div>
                
                <div class="pyq-section">
                    <h5>PYQ Progress</h5>
                    <div class="pyq-checkboxes">
                        ${CONFIG.pyqYears.slice(-3).map(year => `
                            <label class="pyq-checkbox">
                                <input type="checkbox" id="main_${chapterKey}_${year}" 
                                       ${chapterData.pyq[`jeeMain${year}`] ? 'checked' : ''}>
                                <span>${year}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="notes-section">
                    <textarea class="notes-textarea" id="notes_${chapterKey}" 
                              placeholder="Add your notes...">${chapterData.notes}</textarea>
                </div>
            </div>
        `;
        
        container.appendChild(chapterElement);
        setupChapterEventListeners(chapterKey);
    });
};

const setupChapterEventListeners = (chapterKey) => {
    const checkbox = document.getElementById(`checkbox_${chapterKey}`);
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            updateChapterData(chapterKey, 'completed', checkbox.checked);
        });
    }
    
    const slider = document.getElementById(`confidence_${chapterKey}`);
    const valueDisplay = document.getElementById(`value_${chapterKey}`);
    if (slider && valueDisplay) {
        slider.addEventListener('input', () => {
            valueDisplay.textContent = slider.value;
            updateChapterData(chapterKey, 'confidence', parseInt(slider.value));
        });
    }
    
    CONFIG.pyqYears.forEach(year => {
        const mainCheckbox = document.getElementById(`main_${chapterKey}_${year}`);
        if (mainCheckbox) {
            mainCheckbox.addEventListener('change', () => {
                updateChapterPYQ(chapterKey, `jeeMain${year}`, mainCheckbox.checked);
            });
        }
    });
    
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
    storage.save('chapterData', appState.chapterData);
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
    
    storage.save('chapterData', appState.chapterData);
};

// Update Functions
const updateAllDisplays = () => {
    try {
        updateDashboardStats();
        updateTodayProgress();
        updateSubjectProgress();
        renderCalendar();
        renderTodos();
        updateStreakDisplay();
    } catch (error) {
        console.error('Error updating displays:', error);
    }
};

const updateDashboardStats = () => {
    console.log('Updating dashboard stats...');
    // Calculate overall statistics and update dashboard
};

const updateTodayProgress = () => {
    const today = utils.getToday();
    const todayEntry = appState.progressData.find(entry => entry.date === today);
    const target = appState.settings.dailyTarget;
    
    const questionsToday = todayEntry ? todayEntry.questions : 0;
    const progress = Math.min(Math.round((questionsToday / target) * 100), 100);
    
    const todayQuestionsEl = document.getElementById('todayQuestions');
    const todayTargetEl = document.getElementById('todayTarget');
    const progressPercentageEl = document.getElementById('progressPercentage');
    
    if (todayQuestionsEl) todayQuestionsEl.textContent = questionsToday;
    if (todayTargetEl) todayTargetEl.textContent = target;
    if (progressPercentageEl) progressPercentageEl.textContent = progress + '%';
    
    // Update circular progress
    const circle = document.getElementById('progressCircle');
    if (circle) {
        const circumference = 2 * Math.PI * 60;
        const offset = circumference - (progress / 100) * circumference;
        
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
    }
    
    // Update achievement
    const achievement = utils.checkAchievement(questionsToday);
    const achievementEl = document.getElementById('achievementLevel');
    if (achievementEl && achievement) {
        achievementEl.textContent = achievement.icon;
        achievementEl.title = achievement.title;
    }
    
    // Update status message
    const statusEl = document.getElementById('progressStatus');
    if (statusEl) {
        if (progress >= 100) {
            statusEl.textContent = 'Goal Achieved! 🎉';
        } else if (progress >= 75) {
            statusEl.textContent = 'Almost There! 💪';
        } else if (progress >= 50) {
            statusEl.textContent = 'Good Progress! 🔥';
        } else {
            statusEl.textContent = 'Keep Going! 🚀';
        }
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
            const circumference = 2 * Math.PI * 45;
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

const updateStreakDisplay = () => {
    const streakEl = document.getElementById('streakCount');
    if (streakEl) {
        streakEl.textContent = appState.currentStreak;
    }
};

const renderCalendar = () => {
    console.log('Rendering calendar...');
    // Calendar rendering logic would go here
};

const initializeCharts = () => {
    console.log('Initializing charts...');
    // Chart initialization would go here
};

// Make functions globally available
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.showSection = showSection;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

console.log('📱 JEE 2026 Ultimate Tracker JavaScript loaded successfully!');
