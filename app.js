// Enhanced JEE 2026 Tracker with Google Authentication and Perfect Alignment
const CONFIG = {
    examDates: {
        jeeMain1: new Date('2026-01-20T09:00:00'),
        jeeMain2: new Date('2026-04-01T09:00:00'),
        jeeAdvanced: new Date('2026-05-18T09:00:00')
    },
    defaultSettings: {
        dailyTarget: 50,
        weeklyTarget: 350
    },
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    motivationalQuotes: [
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "The expert in anything was once a beginner.",
        "Don't watch the clock; do what it does. Keep going.",
        "Believe you can and you're halfway there.",
        "The future belongs to those who believe in the beauty of their dreams."
    ],
    firebase: {
        apiKey: "AIzaSyDTIqOQxIAoxXbrv-CTBjQncDyy_EcHjWA",
        authDomain: "jee-tracker-5e1e3.firebaseapp.com",
        projectId: "jee-tracker-5e1e3"
    }
};

// Application state
let appState = {
    user: null,
    currentSection: 'dashboard',
    progressData: [],
    settings: { ...CONFIG.defaultSettings },
    currentMonth: new Date(),
    charts: {},
    isAuthenticated: false
};

// Initialize Firebase (demo configuration)
const initializeFirebase = () => {
    if (typeof firebase !== 'undefined') {
        try {
            firebase.initializeApp(CONFIG.firebase);
            console.log('Firebase initialized (demo mode)');
        } catch (error) {
            console.log('Firebase demo mode - using local storage');
        }
    }
};

// Authentication functions
const initAuth = () => {
    // Check if user is already signed in (using localStorage for demo)
    const savedUser = localStorage.getItem('jee-tracker-user');
    if (savedUser) {
        appState.user = JSON.parse(savedUser);
        appState.isAuthenticated = true;
        showMainApp();
    } else {
        showAuthScreen();
    }
};

const showAuthScreen = () => {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('mainApp').classList.add('hidden');
};

const showMainApp = () => {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('mainApp').classList.remove('hidden');
    
    if (appState.user) {
        const avatar = document.getElementById('userAvatar');
        if (avatar && appState.user.photoURL) {
            avatar.src = appState.user.photoURL;
        }
    }
    
    // Initialize the main app
    loadAppState();
    updateDashboard();
    startCountdowns();
    renderCalendar();
};

const handleGoogleSignIn = async () => {
    try {
        // Demo implementation - replace with actual Google Sign-In
        const demoUser = {
            uid: 'demo-user-' + Date.now(),
            email: 'demo@example.com',
            displayName: 'Demo User',
            photoURL: 'https://via.placeholder.com/32x32/64ffda/000000?text=DU'
        };
        
        appState.user = demoUser;
        appState.isAuthenticated = true;
        localStorage.setItem('jee-tracker-user', JSON.stringify(demoUser));
        
        showMainApp();
        showSuccessMessage('Successfully signed in!');
    } catch (error) {
        console.error('Sign-in error:', error);
        showErrorMessage('Sign-in failed. Please try again.');
    }
};

const handleSignOut = () => {
    appState.user = null;
    appState.isAuthenticated = false;
    localStorage.removeItem('jee-tracker-user');
    showAuthScreen();
};

// Utility functions
const utils = {
    formatDate: (date) => date.toISOString().split('T')[0],
    parseDate: (dateString) => new Date(dateString + 'T00:00:00'),
    getToday: () => utils.formatDate(new Date()),
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

// Local storage management with user-specific data
const storage = {
    save: (key, data) => {
        if (!appState.user) return;
        try {
            const userKey = `jee-tracker-${appState.user.uid}-${key}`;
            localStorage.setItem(userKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    },
    
    load: (key, defaultValue = null) => {
        if (!appState.user) return defaultValue;
        try {
            const userKey = `jee-tracker-${appState.user.uid}-${key}`;
            const data = localStorage.getItem(userKey);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Failed to load data:', error);
            return defaultValue;
        }
    }
};

// Load and save app state
const loadAppState = () => {
    appState.progressData = storage.load('progressData', []);
    appState.settings = { ...CONFIG.defaultSettings, ...storage.load('settings', {}) };
    
    // Load sample data if none exists
    if (appState.progressData.length === 0) {
        loadSampleData();
    }
    
    // Set form values
    const dailyTargetInput = document.getElementById('dailyTarget');
    const questionDateInput = document.getElementById('questionDate');
    
    if (dailyTargetInput) dailyTargetInput.value = appState.settings.dailyTarget;
    if (questionDateInput) questionDateInput.value = utils.getToday();
};

const saveAppState = () => {
    storage.save('progressData', appState.progressData);
    storage.save('settings', appState.settings);
};

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

// Event listeners setup
const setupEventListeners = () => {
    // Authentication
    const googleSignInBtn = document.getElementById('googleSignIn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (googleSignInBtn) googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    if (logoutBtn) logoutBtn.addEventListener('click', handleSignOut);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            showSection(section);
        });
    });
    
    // Progress tracking
    const saveProgressBtn = document.getElementById('saveProgress');
    const dailyTargetInput = document.getElementById('dailyTarget');
    
    if (saveProgressBtn) saveProgressBtn.addEventListener('click', saveProgress);
    if (dailyTargetInput) dailyTargetInput.addEventListener('change', updateDailyTarget);
    
    // Auto-calculate total when subject inputs change
    ['physicsCount', 'chemistryCount', 'mathCount'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateTotal);
        }
    });
    
    // Calendar navigation
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    if (prevBtn) prevBtn.addEventListener('click', () => changeMonth(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeMonth(1));
    
    // Modal
    const closeModalBtn = document.getElementById('closeModal');
    const saveModalBtn = document.getElementById('saveModalProgress');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (saveModalBtn) saveModalBtn.addEventListener('click', saveModalProgress);
    
    // Close modal when clicking outside
    const dayModal = document.getElementById('dayModal');
    if (dayModal) {
        dayModal.addEventListener('click', (e) => {
            if (e.target.id === 'dayModal') closeModal();
        });
    }
};

// Navigation
const showSection = (sectionName) => {
    // Update navigation active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionName}`) {
            link.classList.add('active');
        }
    });
    
    // Hide all sections and show target
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        appState.currentSection = sectionName;
        
        // Initialize section-specific functionality
        if (sectionName === 'analytics') {
            setTimeout(() => initializeCharts(), 100);
        }
    }
};

// Enhanced countdown timers with perfect positioning
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
    
    if (!daysEl || !hoursEl || !minutesEl) return;
    
    if (distance < 0) {
        daysEl.textContent = '000';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    
    daysEl.textContent = String(days).padStart(3, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
};

// Progress tracking with enhanced features
const calculateTotal = () => {
    const physicsInput = document.getElementById('physicsCount');
    const chemistryInput = document.getElementById('chemistryCount');
    const mathInput = document.getElementById('mathCount');
    
    if (physicsInput && chemistryInput && mathInput) {
        const physics = parseInt(physicsInput.value) || 0;
        const chemistry = parseInt(chemistryInput.value) || 0;
        const math = parseInt(mathInput.value) || 0;
        
        // Update individual progress bars
        updateSubjectProgress('physics', physics);
        updateSubjectProgress('chemistry', chemistry);
        updateSubjectProgress('math', math);
    }
};

const updateSubjectProgress = (subject, count) => {
    const maxQuestions = 30; // Max questions per subject for visualization
    const percentage = Math.min((count / maxQuestions) * 100, 100);
    
    const progressBar = document.getElementById(`${subject}Progress`);
    const countDisplay = document.getElementById(`${subject}Today`);
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    if (countDisplay) {
        countDisplay.textContent = count;
    }
};

const saveProgress = () => {
    const dateInput = document.getElementById('questionDate');
    const targetInput = document.getElementById('dailyTarget');
    const physicsInput = document.getElementById('physicsCount');
    const chemistryInput = document.getElementById('chemistryCount');
    const mathInput = document.getElementById('mathCount');
    
    if (!dateInput || !targetInput) return;
    
    const date = dateInput.value;
    const target = parseInt(targetInput.value) || 50;
    const physics = parseInt(physicsInput?.value) || 0;
    const chemistry = parseInt(chemistryInput?.value) || 0;
    const math = parseInt(mathInput?.value) || 0;
    const questions = physics + chemistry + math;
    
    if (!date) {
        showErrorMessage('Please select a date');
        return;
    }
    
    const subjects = {
        Physics: physics,
        Chemistry: chemistry,
        Mathematics: math
    };
    
    // Find existing entry or create new
    const existingIndex = appState.progressData.findIndex(entry => entry.date === date);
    const progressEntry = { date, questions, target, subjects };
    
    if (existingIndex >= 0) {
        appState.progressData[existingIndex] = progressEntry;
    } else {
        appState.progressData.push(progressEntry);
    }
    
    // Sort by date
    appState.progressData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    saveAppState();
    updateDashboard();
    renderCalendar();
    
    // Clear form
    if (physicsInput) physicsInput.value = '';
    if (chemistryInput) chemistryInput.value = '';
    if (mathInput) mathInput.value = '';
    
    showSuccessMessage('Progress saved successfully!');
};

const updateDailyTarget = () => {
    const targetInput = document.getElementById('dailyTarget');
    if (targetInput) {
        const newTarget = parseInt(targetInput.value) || 50;
        appState.settings.dailyTarget = newTarget;
        saveAppState();
        updateTodayProgress();
    }
};

// FIXED: Perfect circular progress alignment
const updateTodayProgress = () => {
    const today = utils.getToday();
    const todayEntry = appState.progressData.find(entry => entry.date === today);
    const target = appState.settings.dailyTarget;
    
    const questionsToday = todayEntry ? todayEntry.questions : 0;
    const progress = Math.min(Math.round((questionsToday / target) * 100), 100);
    
    // Update stats
    const todayQuestionsEl = document.getElementById('todayQuestions');
    const todayTargetEl = document.getElementById('todayTarget');
    
    if (todayQuestionsEl) todayQuestionsEl.textContent = questionsToday;
    if (todayTargetEl) todayTargetEl.textContent = target;
    
    // FIXED: Update circular progress with perfect center alignment
    const circle = document.getElementById('progressCircle');
    const percentageEl = document.getElementById('progressPercentage');
    
    if (circle && percentageEl) {
        const circumference = 2 * Math.PI * 54; // radius = 54
        const offset = circumference - (progress / 100) * circumference;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = offset;
        
        // Perfect center alignment for percentage text
        percentageEl.textContent = progress + '%';
    }
    
    // Update subject progress if today's data exists
    if (todayEntry) {
        updateSubjectProgress('physics', todayEntry.subjects.Physics || 0);
        updateSubjectProgress('chemistry', todayEntry.subjects.Chemistry || 0);
        updateSubjectProgress('math', todayEntry.subjects.Mathematics || 0);
    }
};

// Dashboard statistics update
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

const updateDashboard = () => {
    updateDashboardStats();
    updateTodayProgress();
};

// Charts initialization
const initializeCharts = () => {
    if (appState.progressData.length === 0) return;
    
    createProgressChart();
    createSubjectChart();
};

const createProgressChart = () => {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    if (appState.charts.progress) {
        appState.charts.progress.destroy();
    }
    
    const last14Days = appState.progressData.slice(-14);
    
    appState.charts.progress = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: last14Days.map(entry => entry.date),
            datasets: [{
                label: 'Questions Solved',
                data: last14Days.map(entry => entry.questions),
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: 'white' }
                }
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
                legend: {
                    labels: { color: 'white' }
                }
            }
        }
    });
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
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.style.cssText = `
            padding: 8px;
            text-align: center;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.8);
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            font-size: 12px;
        `;
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add empty cells
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days
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
            } else {
                dayElement.classList.add('high');
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
    
    document.getElementById('modalDate').textContent = new Date(date + 'T00:00:00').toLocaleDateString();
    
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
        if (modalQuestions) modalQuestions.value = '';
        if (modalPhysics) modalPhysics.value = '';
        if (modalChemistry) modalChemistry.value = '';
        if (modalMath) modalMath.value = '';
    }
    
    modal.dataset.date = date;
    modal.classList.remove('hidden');
};

const closeModal = () => {
    const modal = document.getElementById('dayModal');
    if (modal) modal.classList.add('hidden');
};

const saveModalProgress = () => {
    const modal = document.getElementById('dayModal');
    if (!modal) return;
    
    const date = modal.dataset.date;
    const physics = parseInt(document.getElementById('modalPhysics')?.value) || 0;
    const chemistry = parseInt(document.getElementById('modalChemistry')?.value) || 0;
    const math = parseInt(document.getElementById('modalMath')?.value) || 0;
    const questions = physics + chemistry + math;
    
    const subjects = { Physics: physics, Chemistry: chemistry, Mathematics: math };
    const existingIndex = appState.progressData.findIndex(entry => entry.date === date);
    const progressEntry = {
        date,
        questions,
        target: appState.settings.dailyTarget,
        subjects
    };
    
    if (existingIndex >= 0) {
        appState.progressData[existingIndex] = progressEntry;
    } else {
        appState.progressData.push(progressEntry);
    }
    
    appState.progressData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    saveAppState();
    updateDashboard();
    renderCalendar();
    closeModal();
    showSuccessMessage('Progress updated successfully!');
};

// Notification functions
const showSuccessMessage = (message) => {
    showNotification(message, 'success');
};

const showErrorMessage = (message) => {
    showNotification(message, 'error');
};

const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 3000;
        font-weight: 500;
        backdrop-filter: blur(10px);
        border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Add CSS for notification animations
const addNotificationStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
};

// Initialize application
const init = () => {
    addNotificationStyles();
    initializeFirebase();
    setupEventListeners();
    initAuth();
    
    // Auto-save every 30 seconds
    setInterval(() => {
        if (appState.isAuthenticated) {
            saveAppState();
        }
    }, 30000);
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
