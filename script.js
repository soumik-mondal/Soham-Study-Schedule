// Enhanced Study Schedule App with Date Range, Priority, and Configuration
class StudySchedule {
    constructor() {
        // Define subjects first
        this.subjects = [
            'Math', 'Physics', 'Chemistry', 'Biology', 
            'AI & Robotics', 'History', 'Geography', 
            'English Lit', 'English Lang', 'Bengali'
        ];
        
        // Initialize other properties
        this.schedule = [];
        this.subjectPriorities = {};
        this.config = {};
        
        this.init();
    }

    init() {
        console.log('Initializing Study Schedule App...');
        
        this.loadData();
        this.setDefaultDates();
        this.renderPriorityInputs();
        this.renderConfiguration();
        this.attachEventListeners();
        this.setupPrintFunctionality();
        
        this.generateDaysFromRange();
    }

    loadData() {
        // Load schedule
        try {
            const savedSchedule = localStorage.getItem('sohamStudySchedule');
            this.schedule = savedSchedule ? JSON.parse(savedSchedule) : [];
        } catch (error) {
            console.error('Error loading schedule:', error);
            this.schedule = [];
        }

        // Load priorities
        try {
            const savedPriorities = localStorage.getItem('sohamSubjectPriorities');
            if (savedPriorities) {
                this.subjectPriorities = JSON.parse(savedPriorities);
            } else {
                this.subjectPriorities = this.getDefaultPriorities();
            }
        } catch (error) {
            console.error('Error loading priorities:', error);
            this.subjectPriorities = this.getDefaultPriorities();
        }

        // Load configuration
        try {
            const savedConfig = localStorage.getItem('sohamStudyConfig');
            if (savedConfig) {
                this.config = JSON.parse(savedConfig);
            } else {
                this.config = this.getDefaultConfig();
            }
        } catch (error) {
            console.error('Error loading config:', error);
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultPriorities() {
        return {
            'Math': 5,
            'Physics': 5,
            'Chemistry': 5,
            'Biology': 5,
            'AI & Robotics': 4,
            'English Lang': 4,
            'English Lit': 3,
            'History': 3,
            'Geography': 3,
            'Bengali': 2
        };
    }

    getDefaultConfig() {
        return {
            baseHours: {
                5: 1.5,
                4: 1.5,
                3: 1.5,
                2: 1.0,
                1: 1.0
            },
            minHoursToInclude: 1.0,
            roundTo: 0.5,
            distributionMethod: 'priority'
        };
    }

    saveData() {
        localStorage.setItem('sohamStudySchedule', JSON.stringify(this.schedule));
        localStorage.setItem('sohamSubjectPriorities', JSON.stringify(this.subjectPriorities));
        localStorage.setItem('sohamStudyConfig', JSON.stringify(this.config));
    }

    setDefaultDates() {
        const today = new Date();
        const startDate = new Date(today);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 6);
        
        document.getElementById('startDate').valueAsDate = startDate;
        document.getElementById('endDate').valueAsDate = endDate;
    }

    renderPriorityInputs() {
        const container = document.getElementById('priorityContainer');
        if (!container) return;

        container.innerHTML = this.subjects.map(subject => {
            const priority = this.subjectPriorities[subject] || 3;
            const subjectId = subject.replace(/[&\s]+/g, '-');
            
            return `
                <div class="priority-item">
                    <label for="priority-${subjectId}">
                        ${subject} 
                        <span class="priority-badge priority-${priority}">P${priority}</span>
                    </label>
                    <select id="priority-${subjectId}" class="priority-input" data-subject="${subject}">
                        <option value="1" ${priority === 1 ? 'selected' : ''}>Priority 1</option>
                        <option value="2" ${priority === 2 ? 'selected' : ''}>Priority 2</option>
                        <option value="3" ${priority === 3 ? 'selected' : ''}>Priority 3</option>
                        <option value="4" ${priority === 4 ? 'selected' : ''}>Priority 4</option>
                        <option value="5" ${priority === 5 ? 'selected' : ''}>Priority 5</option>
                    </select>
                </div>
            `;
        }).join('');
        
        this.attachPriorityEventListeners();
    }

    renderConfiguration() {
        this.renderPriorityConfigs();
        this.renderAdvancedConfigs();
        this.renderConfigSummary();
        this.attachConfigEventListeners();
    }

    renderPriorityConfigs() {
        const container = document.getElementById('priorityConfigs');
        if (!container) return;

        container.innerHTML = '';
        
        for (let priority = 5; priority >= 1; priority--) {
            const configItem = document.createElement('div');
            configItem.className = 'priority-config';
            configItem.innerHTML = `
                <span class="priority-label">
                    Priority ${priority}
                    <span class="priority-badge priority-${priority}">P${priority}</span>
                </span>
                <input 
                    type="number" 
                    class="priority-input" 
                    id="baseHours-${priority}"
                    min="0" 
                    max="4" 
                    step="0.5" 
                    value="${this.config.baseHours[priority]}"
                >
                <span>hours base</span>
            `;
            container.appendChild(configItem);
        }
    }

    renderAdvancedConfigs() {
        document.getElementById('minHoursToInclude').value = this.config.minHoursToInclude;
        document.getElementById('roundTo').value = this.config.roundTo.toString();
        document.getElementById('distributionMethod').value = this.config.distributionMethod;
    }

    renderConfigSummary() {
        const container = document.getElementById('configSummary');
        if (!container) return;

        const totalBaseHours = Object.values(this.config.baseHours).reduce((sum, hours) => sum + hours, 0);
        const includedPriorities = Object.entries(this.config.baseHours)
            .filter(([priority, hours]) => hours > 0)
            .map(([priority]) => `P${priority}`)
            .join(', ');

        container.innerHTML = `
            <h3>📋 Configuration Summary</h3>
            <div class="summary-items">
                <div class="summary-item">
                    <div class="summary-value">${totalBaseHours.toFixed(1)}h</div>
                    <div class="summary-label">Total Base Hours</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${this.config.minHoursToInclude}h</div>
                    <div class="summary-label">Min to Include</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${this.config.roundTo}h</div>
                    <div class="summary-label">Round To</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value">${includedPriorities}</div>
                    <div class="summary-label">Active Priorities</div>
                </div>
            </div>
        `;
    }

    renderHoursInputs(days) {
        const container = document.getElementById('hoursInputContainer');
        if (!container) return;
        
        if (!days || days.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Set date range first to generate days</p></div>';
            document.getElementById('generateScheduleBtn').disabled = true;
            return;
        }

        container.innerHTML = days.map(day => {
            const existingDay = this.schedule.find(d => d.date === day.date);
            const totalHours = existingDay ? existingDay.totalHours : 0;
            
            return `
                <div class="hour-input-item">
                    <label for="hours-${day.date}">
                        ${day.name} (${day.displayDate})
                    </label>
                    <input 
                        type="number" 
                        id="hours-${day.date}"
                        class="hour-input"
                        min="0" 
                        max="24" 
                        step="0.5" 
                        value="${totalHours}"
                        placeholder="Enter hours"
                        data-date="${day.date}"
                    >
                </div>
            `;
        }).join('');

        document.getElementById('generateScheduleBtn').disabled = false;
    }

    renderSchedule() {
        const container = document.getElementById('scheduleContainer');
        if (!container) return;
        
        const hasSchedule = this.schedule.some(day => day.subjects && day.subjects.length > 0);

        if (!hasSchedule) {
            container.innerHTML = '<div class="empty-state"><p>Generate schedule to see your study plan</p></div>';
            return;
        }

        container.innerHTML = this.schedule.map(day => `
            <div class="day-card">
                <div class="day-header">
                    <div>
                        <div class="day-name">${day.name}</div>
                        <div class="day-date">${day.displayDate}</div>
                    </div>
                    <span class="total-hours">${day.totalHours} hrs</span>
                </div>
                <div class="subjects-list">
                    ${day.subjects.map(subject => `
                        <div class="subject-item">
                            <div class="subject-info">
                                <span class="subject-name">${subject.name}</span>
                                <span class="subject-priority">
                                    Priority: ${subject.priority}
                                    <span class="priority-badge priority-${subject.priority}">P${subject.priority}</span>
                                </span>
                            </div>
                            <span class="subject-hours">${subject.hours} hr${subject.hours !== 1 ? 's' : ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    renderSummary() {
        const container = document.getElementById('summaryContainer');
        if (!container) return;
        
        const totalStudyHours = this.schedule.reduce((sum, day) => sum + day.totalHours, 0);
        const studyDays = this.schedule.filter(day => day.totalHours > 0).length;
        const totalSubjects = new Set(this.schedule.flatMap(day => day.subjects.map(s => s.name))).size;

        container.innerHTML = `
            <div class="summary-card">
                <div class="summary-value">${totalStudyHours.toFixed(1)}</div>
                <div class="summary-label">Total Study Hours</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">${studyDays}</div>
                <div class="summary-label">Study Days</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">${totalSubjects}</div>
                <div class="summary-label">Subjects</div>
            </div>
        `;
    }

    attachEventListeners() {
        document.getElementById('generateDaysBtn').addEventListener('click', () => {
            this.generateDaysFromRange();
        });

        document.getElementById('generateScheduleBtn').addEventListener('click', () => {
            this.updateHoursFromInputs();
            this.generateSchedule();
            this.renderSchedule();
            this.renderSummary();
            this.saveData();
        });

        document.getElementById('startDate').addEventListener('change', () => {
            this.generateDaysFromRange();
        });
        
        document.getElementById('endDate').addEventListener('change', () => {
            this.generateDaysFromRange();
        });
    }

    attachPriorityEventListeners() {
        document.querySelectorAll('.priority-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const subject = e.target.dataset.subject;
                const priority = parseInt(e.target.value);
                this.subjectPriorities[subject] = priority;
                this.saveData();
                
                const badge = e.target.previousElementSibling.querySelector('.priority-badge');
                if (badge) {
                    badge.className = `priority-badge priority-${priority}`;
                    badge.textContent = `P${priority}`;
                }
            });
        });
    }

    attachConfigEventListeners() {
        // Priority base hours changes
        for (let priority = 1; priority <= 5; priority++) {
            const input = document.getElementById(`baseHours-${priority}`);
            if (input) {
                input.addEventListener('change', (e) => {
                    this.config.baseHours[priority] = parseFloat(e.target.value);
                    this.validateAndSaveConfig();
                });
            }
        }

        // Advanced config changes
        document.getElementById('minHoursToInclude').addEventListener('change', (e) => {
            this.config.minHoursToInclude = parseFloat(e.target.value);
            this.validateAndSaveConfig();
        });

        document.getElementById('roundTo').addEventListener('change', (e) => {
            this.config.roundTo = parseFloat(e.target.value);
            this.validateAndSaveConfig();
        });

        document.getElementById('distributionMethod').addEventListener('change', (e) => {
            this.config.distributionMethod = e.target.value;
            this.validateAndSaveConfig();
        });
    }

    validateAndSaveConfig() {
        const errorContainer = document.getElementById('configError');
        
        // Clear previous errors
        this.hideError();

        // Validation 1: Check if total base hours is reasonable
        const totalBaseHours = Object.values(this.config.baseHours).reduce((sum, hours) => sum + hours, 0);
        if (totalBaseHours > 12) {
            this.showError('Total base hours too high! Maximum recommended is 12 hours.');
            return;
        }

        // Validation 2: Check if minHoursToInclude is valid
        if (this.config.minHoursToInclude < 0.5) {
            this.showError('Minimum hours to include cannot be less than 0.5 hours.');
            return;
        }

        // Validation 3: Check if any base hours are negative
        const negativeHours = Object.entries(this.config.baseHours).find(([p, h]) => h < 0);
        if (negativeHours) {
            this.showError('Base hours cannot be negative!');
            return;
        }

        // Validation 4: Check if distribution makes sense
        const activePriorities = Object.entries(this.config.baseHours).filter(([p, h]) => h > 0);
        if (activePriorities.length === 0) {
            this.showError('At least one priority must have base hours greater than 0!');
            return;
        }

        // All validations passed
        this.saveData();
        this.renderConfigSummary();
        this.showSuccess('Configuration saved successfully!');
    }

    showError(message) {
        const errorContainer = document.getElementById('configError');
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        errorContainer.className = 'error-message';
    }

    showSuccess(message) {
        const errorContainer = document.getElementById('configError');
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        errorContainer.className = 'success-message';
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
            this.hideError();
        }, 3000);
    }

    hideError() {
        const errorContainer = document.getElementById('configError');
        errorContainer.style.display = 'none';
    }

    setupPrintFunctionality() {
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printSchedule();
            });
        }
    }

    generateDaysFromRange() {
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);

        if (!startDate || !endDate || startDate > endDate) {
            alert('Please select a valid date range');
            return;
        }

        const days = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const displayDate = currentDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
            });
            
            days.push({
                name: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
                date: dateString,
                displayDate: displayDate,
                totalHours: 0,
                subjects: []
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        this.schedule = days;
        this.renderHoursInputs(days);
        this.renderSchedule();
        this.renderSummary();
        this.saveData();
    }

    updateHoursFromInputs() {
        this.schedule = this.schedule.map(day => {
            const input = document.getElementById(`hours-${day.date}`);
            const totalHours = input ? parseFloat(input.value) || 0 : 0;
            return { ...day, totalHours };
        });
    }

    generateSchedule() {
        this.schedule = this.schedule.map(day => {
            if (day.totalHours <= 0) {
                return { ...day, subjects: [] };
            }
            const distributedSubjects = this.distributeSubjects(day.totalHours);
            return { ...day, subjects: distributedSubjects };
        });
    }

    distributeSubjects(totalHours) {
        const subjectList = this.subjects.map(subject => ({
            name: subject,
            priority: this.subjectPriorities[subject] || 3,
            hours: 0
        }));

        let remainingHours = totalHours;

        // Phase 1: Assign base hours based on configuration
        subjectList.forEach(subject => {
            const base = this.config.baseHours[subject.priority] || 0;
            if (remainingHours >= base && base > 0) {
                subject.hours = base;
                remainingHours -= base;
            }
        });

        // Phase 2: Distribute remaining hours based on selected method
        if (remainingHours > 0) {
            switch (this.config.distributionMethod) {
                case 'priority':
                    this.distributeByPriority(subjectList, remainingHours);
                    break;
                case 'equal':
                    this.distributeEqually(subjectList, remainingHours);
                    break;
                case 'highFirst':
                    this.distributeHighFirst(subjectList, remainingHours);
                    break;
            }
        }

        // Phase 3: Apply rounding and filtering
        return this.finalizeDistribution(subjectList, totalHours);
    }

    distributeByPriority(subjectList, remainingHours) {
        const totalPriority = subjectList.reduce((sum, s) => sum + s.priority, 0);
        
        subjectList.forEach(subject => {
            if (remainingHours <= 0) return;
            const priorityWeight = subject.priority / totalPriority;
            let allocatedHours = priorityWeight * remainingHours;
            
            allocatedHours = this.roundTo(allocatedHours, this.config.roundTo);
            allocatedHours = Math.min(allocatedHours, remainingHours);

            if (allocatedHours >= this.config.roundTo) {
                subject.hours += allocatedHours;
                remainingHours -= allocatedHours;
            }
        });
    }

    distributeEqually(subjectList, remainingHours) {
        const subjectsWithBase = subjectList.filter(s => s.hours > 0);
        if (subjectsWithBase.length === 0) return;

        const equalShare = remainingHours / subjectsWithBase.length;
        subjectsWithBase.forEach(subject => {
            const share = this.roundTo(equalShare, this.config.roundTo);
            if (share >= this.config.roundTo) {
                subject.hours += share;
                remainingHours -= share;
            }
        });
    }

    distributeHighFirst(subjectList, remainingHours) {
        // Sort by priority (highest first) and hours (lowest first)
        const sortedSubjects = [...subjectList].sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return a.hours - b.hours;
        });

        for (const subject of sortedSubjects) {
            if (remainingHours <= 0) break;
            const allocation = this.roundTo(this.config.roundTo, this.config.roundTo);
            if (remainingHours >= allocation) {
                subject.hours += allocation;
                remainingHours -= allocation;
            }
        }
    }

    finalizeDistribution(subjectList, totalHours) {
        // Apply rounding
        subjectList.forEach(subject => {
            subject.hours = this.roundTo(subject.hours, this.config.roundTo);
        });

        // Final adjustment to match total hours
        let finalTotal = subjectList.reduce((sum, s) => sum + s.hours, 0);
        if (Math.abs(finalTotal - totalHours) > 0.1) {
            const diff = totalHours - finalTotal;
            const subjectToAdjust = subjectList.find(s => s.hours > 0);
            if (subjectToAdjust) {
                subjectToAdjust.hours = this.roundTo(subjectToAdjust.hours + diff, this.config.roundTo);
            }
        }

        // Filter and return
        return subjectList
            .filter(subject => subject.hours >= this.config.minHoursToInclude)
            .map(subject => ({
                name: subject.name,
                priority: subject.priority,
                hours: subject.hours
            }))
            .sort((a, b) => b.priority - a.priority || b.hours - a.hours);
    }

    roundTo(num, step) {
        return Math.round(num / step) * step;
    }

    printSchedule() {
        const hasSchedule = this.schedule.some(day => day.subjects.length > 0);
        if (!hasSchedule) {
            alert('Please generate a schedule first before printing.');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Soham's Study Schedule</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #000;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                    }
                    .print-header h1 {
                        margin: 0;
                        font-size: 24pt;
                    }
                    .print-header .date-range {
                        margin-top: 10px;
                        font-size: 12pt;
                        color: #666;
                    }
                    .schedule-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                        gap: 20px;
                    }
                    .day-card {
                        border: 1px solid #ccc;
                        padding: 15px;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    .day-header {
                        background: #f5f5f5;
                        padding: 10px;
                        margin: -15px -15px 15px -15px;
                        border-bottom: 1px solid #ddd;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .day-name {
                        font-weight: bold;
                        font-size: 14pt;
                    }
                    .day-date {
                        font-size: 10pt;
                        color: #666;
                    }
                    .total-hours {
                        background: #333;
                        color: white;
                        padding: 4px 12px;
                        border-radius: 15px;
                        font-size: 10pt;
                    }
                    .subjects-list {
                        margin-top: 10px;
                    }
                    .subject-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px;
                        margin: 5px 0;
                        background: #f9f9f9;
                        border-left: 4px solid #333;
                    }
                    .subject-info {
                        flex: 1;
                    }
                    .subject-name {
                        font-weight: bold;
                        font-size: 11pt;
                    }
                    .subject-priority {
                        font-size: 9pt;
                        color: #666;
                    }
                    .priority-badge {
                        background: #666;
                        color: white;
                        padding: 2px 6px;
                        border-radius: 10px;
                        font-size: 8pt;
                        margin-left: 5px;
                    }
                    .subject-hours {
                        background: #333;
                        color: white;
                        padding: 4px 10px;
                        border-radius: 12px;
                        font-size: 10pt;
                        font-weight: bold;
                    }
                    .print-summary {
                        margin-top: 30px;
                        padding: 15px;
                        background: #f5f5f5;
                        border-radius: 5px;
                    }
                    .summary-item {
                        margin: 5px 0;
                        font-size: 11pt;
                    }
                    @media print {
                        body { margin: 0; }
                        .day-card { break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>📚 Soham's Study Schedule</h1>
                    <div class="date-range">
                        ${this.getDateRangeText()}
                    </div>
                </div>
                
                <div class="schedule-grid">
                    ${this.generatePrintHTML()}
                </div>
                
                <div class="print-summary">
                    <h3>Study Summary</h3>
                    ${this.generateSummaryHTML()}
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }

    getDateRangeText() {
        if (!this.schedule || this.schedule.length === 0) return '';
        
        const startDate = new Date(this.schedule[0].date);
        const endDate = new Date(this.schedule[this.schedule.length - 1].date);
        
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }

    generatePrintHTML() {
        if (!this.schedule) return '';
        
        return this.schedule.map(day => `
            <div class="day-card">
                <div class="day-header">
                    <div>
                        <div class="day-name">${day.name}</div>
                        <div class="day-date">${day.displayDate}</div>
                    </div>
                    <span class="total-hours">${day.totalHours} hrs</span>
                </div>
                <div class="subjects-list">
                    ${day.subjects && day.subjects.length > 0 ? 
                        day.subjects.map(subject => `
                            <div class="subject-item">
                                <div class="subject-info">
                                    <span class="subject-name">${subject.name}</span>
                                    <span class="subject-priority">
                                        Priority: ${subject.priority}
                                        <span class="priority-badge">P${subject.priority}</span>
                                    </span>
                                </div>
                                <span class="subject-hours">${subject.hours} hr${subject.hours !== 1 ? 's' : ''}</span>
                            </div>
                        `).join('') : 
                        '<div style="text-align: center; color: #666; padding: 20px;">No study scheduled</div>'
                    }
                </div>
            </div>
        `).join('');
    }

    generateSummaryHTML() {
        if (!this.schedule) return '';
        
        const totalStudyHours = this.schedule.reduce((sum, day) => sum + day.totalHours, 0);
        const studyDays = this.schedule.filter(day => day.totalHours > 0).length;
        const totalSubjects = new Set(this.schedule.flatMap(day => day.subjects.map(s => s.name))).size;
        
        return `
            <div class="summary-item"><strong>Total Study Hours:</strong> ${totalStudyHours.toFixed(1)}</div>
            <div class="summary-item"><strong>Study Days:</strong> ${studyDays}</div>
            <div class="summary-item"><strong>Subjects Covered:</strong> ${totalSubjects}</div>
            <div class="summary-item"><strong>Average Daily Hours:</strong> ${studyDays > 0 ? (totalStudyHours / studyDays).toFixed(1) : 0}</div>
        `;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Study Schedule App...');
    try {
        new StudySchedule();
        console.log('Study Schedule App initialized successfully');
    } catch (error) {
        console.error('Error initializing Study Schedule App:', error);
    }
});
