// JEE 2026 Tracker App
class JEETracker {
    constructor() {
        this.jeeExamDate = new Date('2026-04-05');
        this.defaultTarget = 50;
        this.motivationalQuotes = [
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "The expert in anything was once a beginner.",
            "Don't watch the clock; do what it does. Keep going.",
            "Believe you can and you're halfway there.",
            "The future belongs to those who believe in the beauty of their dreams."
        ];
        
        // Sample progress data
        this.progressData = [
            {date: "2025-08-16", questions: 45, target: 50},
            {date: "2025-08-17", questions: 52, target: 50},
            {date: "2025-08-18", questions: 38, target: 50},
            {date: "2025-08-19", questions: 61, target: 50},
            {date: "2025-08-20", questions: 48, target: 50},
            {date: "2025-08-21", questions: 55, target: 50},
            {date: "2025-08-22", questions: 42, target: 50}
        ];
        
        this.todoList = [
            {id: 1, text: "Complete Organic Chemistry Chapter 1", completed: false, priority: "high"},
            {id: 2, text: "Practice 20 Physics numericals", completed: true, priority: "medium"},
            {id: 3, text: "Review Mathematics formulae", completed: false, priority: "low"}
        ];
        
        this.chart = null;
        this.init();
    }

    init() {
        this.createParticles();
        this.updateCountdown();
        this.updateCurrentDate();
        this.setupEventListeners();
        this.updateProgressDisplay();
        this.renderTodoList();
        this.updateAnalytics();
        this.updateMotivationalQuote();
        this.updateTimelineProgress();
        
        // Set up intervals
        setInterval(() => this.updateCountdown(), 1000);
        setInterval(() => this.updateMotivationalQuote(), 30000); // Change quote every 30 seconds
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    updateCountdown() {
        const now = new Date();
        const timeLeft = this.jeeExamDate - now;
        
        if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days;
            document.getElementById('hours').textContent = hours;
            document.getElementById('minutes').textContent = minutes;
            document.getElementById('seconds').textContent = seconds;
        }
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
    }

    setupEventListeners() {
        // Daily target input
        const dailyTargetInput = document.getElementById('dailyTarget');
        dailyTargetInput.addEventListener('input', () => {
            this.updateProgressDisplay();
        });

        // Questions today input
        const questionsTodayInput = document.getElementById('questionsToday');
        questionsTodayInput.addEventListener('input', () => {
            this.updateProgressDisplay();
        });

        // Save progress button
        document.getElementById('saveProgress').addEventListener('click', () => {
            this.saveProgress();
        });

        // Todo list functionality
        document.getElementById('addTodo').addEventListener('click', () => {
            this.addTodo();
        });

        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
    }

    updateProgressDisplay() {
        const questionsToday = parseInt(document.getElementById('questionsToday').value) || 0;
        const dailyTarget = parseInt(document.getElementById('dailyTarget').value) || this.defaultTarget;
        
        const progressPercentage = Math.min((questionsToday / dailyTarget) * 100, 100);
        
        document.getElementById('progressText').textContent = `${questionsToday} / ${dailyTarget}`;
        document.getElementById('progressFill').style.width = progressPercentage + '%';
    }

    saveProgress() {
        const questionsToday = parseInt(document.getElementById('questionsToday').value) || 0;
        const dailyTarget = parseInt(document.getElementById('dailyTarget').value) || this.defaultTarget;
        const today = new Date().toISOString().split('T')[0];
        
        // Update or add today's progress
        const existingIndex = this.progressData.findIndex(entry => entry.date === today);
        if (existingIndex !== -1) {
            this.progressData[existingIndex] = {date: today, questions: questionsToday, target: dailyTarget};
        } else {
            this.progressData.push({date: today, questions: questionsToday, target: dailyTarget});
        }
        
        // Keep only last 7 days
        this.progressData = this.progressData.slice(-7);
        
        this.updateAnalytics();
        this.showSuccessMessage();
    }

    showSuccessMessage() {
        const button = document.getElementById('saveProgress');
        const originalText = button.textContent;
        button.textContent = 'Progress Saved! ✓';
        button.style.background = 'var(--color-success)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }

    addTodo() {
        const todoInput = document.getElementById('todoInput');
        const todoPriority = document.getElementById('todoPriority');
        const text = todoInput.value.trim();
        
        if (text) {
            const newTodo = {
                id: Date.now(),
                text: text,
                completed: false,
                priority: todoPriority.value
            };
            
            this.todoList.unshift(newTodo);
            todoInput.value = '';
            this.renderTodoList();
        }
    }

    renderTodoList() {
        const todoListContainer = document.getElementById('todoList');
        todoListContainer.innerHTML = '';
        
        this.todoList.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.className = 'todo-item';
            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                       onchange="jeeTracker.toggleTodo(${todo.id})">
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <span class="todo-priority ${todo.priority}">${todo.priority}</span>
                <button class="todo-delete" onclick="jeeTracker.deleteTodo(${todo.id})">Delete</button>
            `;
            todoListContainer.appendChild(todoItem);
        });
    }

    toggleTodo(id) {
        const todo = this.todoList.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.renderTodoList();
        }
    }

    deleteTodo(id) {
        this.todoList = this.todoList.filter(t => t.id !== id);
        this.renderTodoList();
    }

    updateAnalytics() {
        this.updateStats();
        this.updateChart();
        this.updateCircularProgress();
        this.updateAchievements();
    }

    updateStats() {
        const weeklyTotal = this.progressData.reduce((sum, entry) => sum + entry.questions, 0);
        const averageDaily = Math.round(weeklyTotal / this.progressData.length) || 0;
        const bestDay = Math.max(...this.progressData.map(entry => entry.questions), 0);
        const currentStreak = this.calculateStreak();
        
        document.getElementById('weeklyTotal').textContent = weeklyTotal;
        document.getElementById('averageDaily').textContent = averageDaily;
        document.getElementById('bestDay').textContent = bestDay;
        document.getElementById('currentStreak').textContent = currentStreak;
    }

    calculateStreak() {
        let streak = 0;
        for (let i = this.progressData.length - 1; i >= 0; i--) {
            if (this.progressData[i].questions >= this.progressData[i].target) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    updateChart() {
        const ctx = document.getElementById('progressChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const labels = this.progressData.map(entry => {
            const date = new Date(entry.date);
            return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
        });
        
        const questionsData = this.progressData.map(entry => entry.questions);
        const targetData = this.progressData.map(entry => entry.target);
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Questions Solved',
                    data: questionsData,
                    borderColor: '#32b8c6',
                    backgroundColor: 'rgba(50, 184, 198, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#32b8c6',
                    pointBorderColor: '#ffffff',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }, {
                    label: 'Daily Target',
                    data: targetData,
                    borderColor: '#e6819f',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    tension: 0,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#f5f5f5'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#a7a9a9'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#a7a9a9'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    updateCircularProgress() {
        const weeklyTotal = this.progressData.reduce((sum, entry) => sum + entry.questions, 0);
        const weeklyTarget = this.progressData.reduce((sum, entry) => sum + entry.target, 0);
        const percentage = weeklyTarget > 0 ? Math.min((weeklyTotal / weeklyTarget) * 100, 100) : 0;
        
        const circle = document.getElementById('progressCircle');
        const circumference = 2 * Math.PI * 90; // radius is 90
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        
        circle.style.strokeDashoffset = strokeDashoffset;
        document.getElementById('weeklyPercentage').textContent = Math.round(percentage) + '%';
    }

    updateAchievements() {
        const achievementBadges = document.getElementById('achievementBadges');
        achievementBadges.innerHTML = '';
        
        const weeklyTotal = this.progressData.reduce((sum, entry) => sum + entry.questions, 0);
        const streak = this.calculateStreak();
        const bestDay = Math.max(...this.progressData.map(entry => entry.questions), 0);
        
        const achievements = [];
        
        if (weeklyTotal >= 350) achievements.push('Week Warrior');
        if (streak >= 3) achievements.push(`${streak} Day Streak`);
        if (bestDay >= 100) achievements.push('Century Club');
        if (weeklyTotal >= 250) achievements.push('Consistent Performer');
        
        if (achievements.length === 0) {
            achievements.push('Getting Started');
        }
        
        achievements.forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = 'achievement-badge';
            badge.textContent = achievement;
            achievementBadges.appendChild(badge);
        });
    }

    updateMotivationalQuote() {
        const quoteElement = document.getElementById('dailyQuote');
        const randomQuote = this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
        
        quoteElement.style.opacity = '0';
        setTimeout(() => {
            quoteElement.textContent = randomQuote;
            quoteElement.style.opacity = '1';
        }, 300);
    }

    updateTimelineProgress() {
        const startDate = new Date('2024-04-06'); // One year before JEE 2026
        const now = new Date();
        const totalDuration = this.jeeExamDate - startDate;
        const elapsedDuration = now - startDate;
        const progressPercentage = Math.min((elapsedDuration / totalDuration) * 100, 100);
        
        document.getElementById('timelineFill').style.width = progressPercentage + '%';
        document.getElementById('timelinePercentage').textContent = Math.round(progressPercentage) + '%';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jeeTracker = new JEETracker();
});

// Add some utility functions for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for any internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add focus states for better accessibility
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .focused {
        transform: translateY(-2px);
        transition: transform 0.2s ease;
    }
    
    .todo-text {
        transition: all 0.3s ease;
    }
    
    .motivational-quote {
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);