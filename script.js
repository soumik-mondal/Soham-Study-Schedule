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
        console.log('========================================');
        console.log('Initializing Study Schedule App v1.0');
        console.log('========================================');
        
        this.loadData();
        this.setDefaultDates();
        this.renderPriorityInputs();
        this.renderConfiguration();
        this.attachEventListeners();
        this.setupPrintFunctionality();
        this.setupBulkEditListeners();
        
        console.log('✓ All event listeners attached');
        console.log('✓ UI rendered successfully');
        
        // Generate days on initial load
        setTimeout(() => {
            this.generateDaysFromRange();
        }, 100);
        
        console.log('✓ Initial setup complete');
        console.log('========================================');
    }

    loadData() {
        console.log('');
        console.log('--- LOADING DATA FROM STORAGE ---');
        
        // Load schedule
        try {
            const savedSchedule = localStorage.getItem('sohamStudySchedule');
            this.schedule = savedSchedule ? JSON.parse(savedSchedule) : [];
            console.log('✓ Schedule loaded:', this.schedule.length > 0 ? `${this.schedule.length} days` : 'empty');
        } catch (error) {
            console.error('✗ Error loading schedule:', error);
            this.schedule = [];
        }

        // Load priorities
        try {
            const savedPriorities = localStorage.getItem('sohamSubjectPriorities');
            if (savedPriorities) {
                this.subjectPriorities = JSON.parse(savedPriorities);
                console.log('✓ Priorities loaded from storage');
                console.log('  Subjects with priorities:', Object.keys(this.subjectPriorities).length);
            } else {
                this.subjectPriorities = this.getDefaultPriorities();
                console.log('✓ Using default priorities');
            }
        } catch (error) {
            console.error('✗ Error loading priorities:', error);
            this.subjectPriorities = this.getDefaultPriorities();
        }

        // Load configuration
        try {
            const savedConfig = localStorage.getItem('sohamStudyConfig');
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                // Merge with default config to ensure all properties exist
                this.config = {
                    ...this.getDefaultConfig(),
                    ...parsedConfig
                };
                console.log('✓ Configuration loaded from storage');
            } else {
                this.config = this.getDefaultConfig();
                console.log('✓ Using default configuration');
            }
        } catch (error) {
            console.error('✗ Error loading config:', error);
            this.config = this.getDefaultConfig();
        }
        
        console.log('Distribution method:', this.config.distributionMethod);
        console.log('Min hours to include:', this.config.minHoursToInclude);
        console.log('Round to:', this.config.roundTo);
        console.log('--- DATA LOADING COMPLETE ---');
        console.log('');
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
                0: 0,   // Priority 0: excluded
                1: 1.0,
                2: 1.0,
                3: 1.5,
                4: 1.5,
                5: 1.5
            },
            minHoursToInclude: 1.0,
            roundTo: 0.5,
            distributionMethod: 'priority',
            includedPriorities: [1, 2, 3, 4, 5]
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
        
        // Format dates as YYYY-MM-DD
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };
        
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) startDateInput.value = formatDate(startDate);
        if (endDateInput) endDateInput.value = formatDate(endDate);
    }

    renderPriorityInputs() {
        const container = document.getElementById('priorityContainer');
        if (!container) return;

        container.innerHTML = this.subjects.map(subject => {
            // Get priority - if it's not set, use default
            let priority = this.subjectPriorities[subject];
            if (priority === undefined) {
                priority = this.getDefaultPriorities()[subject] || 3;
            }
            
            const subjectId = subject.replace(/[&\s]+/g, '-');
            
            return `
                <div class="priority-item">
                    <label for="priority-${subjectId}">
                        ${subject} 
                        <span class="priority-badge priority-${priority}">${priority === 0 ? 'Excluded' : 'P' + priority}</span>
                    </label>
                    <select id="priority-${subjectId}" class="priority-input" data-subject="${subject}">
                        <option value="0" ${priority === 0 ? 'selected' : ''}>Exclude (0)</option>
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
        
        for (let priority = 5; priority >= 0; priority--) {
            const configItem = document.createElement('div');
            configItem.className = 'priority-config';
            const priorityLabel = priority === 0 ? 'Excluded (0)' : `Priority ${priority}`;
            const badgeClass = priority === 0 ? 'priority-excluded' : `priority-${priority}`;
            
            configItem.innerHTML = `
                <span class="priority-label">
                    ${priorityLabel}
                    <span class="priority-badge ${badgeClass}">${priority === 0 ? 'Ex' : 'P' + priority}</span>
                </span>
                <input 
                    type="number" 
                    class="priority-input" 
                    id="baseHours-${priority}"
                    min="0" 
                    max="4" 
                    step="0.5" 
                    value="${this.config.baseHours[priority] || 0}"
                    ${priority === 0 ? 'disabled' : ''}
                >
                <span>hours base</span>
            `;
            container.appendChild(configItem);
        }
    }

    renderAdvancedConfigs() {
        const minHoursInput = document.getElementById('minHoursToInclude');
        const roundToSelect = document.getElementById('roundTo');
        const distributionMethodSelect = document.getElementById('distributionMethod');
        
        if (minHoursInput) minHoursInput.value = this.config.minHoursToInclude;
        if (roundToSelect) roundToSelect.value = this.config.roundTo.toString();
        if (distributionMethodSelect) distributionMethodSelect.value = this.config.distributionMethod;
    }

    renderConfigSummary() {
        const container = document.getElementById('configSummary');
        if (!container) return;

        // Ensure includedPriorities is always an array
        const activePriorities = Array.isArray(this.config.includedPriorities) 
            ? this.config.includedPriorities 
            : [1, 2, 3, 4, 5];
        
        const totalBaseHours = activePriorities.reduce((sum, priority) => {
            return sum + (this.config.baseHours && this.config.baseHours[priority] ? this.config.baseHours[priority] : 0);
        }, 0);
        
        const includedPriorities = activePriorities.map(p => `P${p}`).join(', ');

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
                    <div class="summary-value">${includedPriorities || 'None'}</div>
                    <div class="summary-label">Included Priorities</div>
                </div>
            </div>
        `;
    }

    renderHoursInputs() {
        const container = document.getElementById('hoursInputContainer');
        if (!container) return;
        
        if (!this.schedule || this.schedule.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Set date range first to generate days</p></div>';
            const generateScheduleBtn = document.getElementById('generateScheduleBtn');
            if (generateScheduleBtn) generateScheduleBtn.disabled = true;
            this.updateHoursSummary();
            return;
        }

        container.innerHTML = this.schedule.map(day => {
            const dayOfWeek = new Date(day.date).getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dayType = isWeekend ? 'Weekend' : 'Weekday';
            const defaultHours = isWeekend ? 6 : 4;
            const totalHours = day.totalHours > 0 ? day.totalHours : defaultHours;
            
            return `
                <div class="hour-input-item" data-date="${day.date}" data-weekend="${isWeekend}">
                    <div class="day-info">
                        <div class="day-name">${day.name}</div>
                        <div class="day-date">${day.displayDate}</div>
                        <span class="day-type ${isWeekend ? 'weekend' : ''}">${dayType}</span>
                    </div>
                    <div class="hour-input-container">
                        <input 
                            type="number" 
                            id="hours-${day.date}"
                            class="hour-input"
                            min="0" 
                            max="11" 
                            step="0.5" 
                            value="${totalHours}"
                            placeholder="0"
                            data-date="${day.date}"
                        >
                        <span class="hour-label">hours (max 11)</span>
                    </div>
                </div>
            `;
        }).join('');

        // Attach input listeners for real-time summary updates
        this.attachHourInputListeners();
        
        const generateScheduleBtn = document.getElementById('generateScheduleBtn');
        if (generateScheduleBtn) generateScheduleBtn.disabled = false;
        
        this.updateHoursSummary();
    }

    renderSchedule() {
        const container = document.getElementById('scheduleContainer');
        if (!container) return;
        
        const hasSchedule = this.schedule.some(day => day.subjects && day.subjects.length > 0);

        if (!hasSchedule) {
            container.innerHTML = '<div class="empty-state"><p>Generate schedule to see your study plan</p></div>';
            return;
        }

        const scheduleHTML = this.schedule.map(day => {
            if (day.totalHours <= 0 || !day.subjects || day.subjects.length === 0) {
                return '';
            }
            
            // CRITICAL: Filter out any priority 0 subjects that may have slipped through
            const validSubjects = day.subjects.filter(subject => {
                if (subject.priority === 0) {
                    console.warn(`⚠️ CRITICAL BUG: Priority 0 subject "${subject.name}" found in schedule! Removing.`);
                    return false;
                }
                return true;
            });
            
            if (validSubjects.length === 0) {
                return '';
            }
            
            return `
                <div class="day-card">
                    <div class="day-header">
                        <div>
                            <div class="day-name">${day.name}</div>
                            <div class="day-date">${day.displayDate}</div>
                        </div>
                        <span class="total-hours">${day.totalHours.toFixed(1)} hrs</span>
                    </div>
                    <div class="subjects-list">
                        ${validSubjects.map(subject => `
                            <div class="subject-item">
                                <div class="subject-info">
                                    <span class="subject-name">${subject.name}</span>
                                    <span class="subject-priority">
                                        Priority: ${subject.priority}
                                        <span class="priority-badge priority-${subject.priority}">P${subject.priority}</span>
                                    </span>
                                </div>
                                <span class="subject-hours">${subject.hours.toFixed(1)} hr${subject.hours !== 1 ? 's' : ''}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Remove empty cards
        if (scheduleHTML.trim() === '') {
            container.innerHTML = '<div class="empty-state"><p>No study scheduled (set hours for days to see schedule)</p></div>';
        } else {
            container.innerHTML = scheduleHTML;
        }
        
        console.log('✓ Schedule rendered successfully');
    }

    renderSummary() {
        const container = document.getElementById('summaryContainer');
        if (!container) return;
        
        const totalStudyHours = this.schedule.reduce((sum, day) => sum + day.totalHours, 0);
        const studyDays = this.schedule.filter(day => day.totalHours > 0).length;
        const totalSubjects = new Set(this.schedule.flatMap(day => day.subjects?.map(s => s.name) || [])).size;

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
        const generateDaysBtn = document.getElementById('generateDaysBtn');
        if (generateDaysBtn) {
            generateDaysBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Generate Days button clicked');
                this.generateDaysFromRange();
            });
        }

        const generateScheduleBtn = document.getElementById('generateScheduleBtn');
        if (generateScheduleBtn) {
            generateScheduleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('=== GENERATE SCHEDULE BUTTON CLICKED ===');
                console.log('Current priorities:', this.subjectPriorities);
                this.updateHoursFromInputs();
                this.generateSchedule();
                this.renderSchedule();
                this.renderSummary();
                this.saveData();
            });
        }

        const startDateInput = document.getElementById('startDate');
        if (startDateInput) {
            startDateInput.addEventListener('change', () => {
                this.generateDaysFromRange();
            });
        }
        
        const endDateInput = document.getElementById('endDate');
        if (endDateInput) {
            endDateInput.addEventListener('change', () => {
                this.generateDaysFromRange();
            });
        }
    }

    attachPriorityEventListeners() {
        document.querySelectorAll('.priority-input').forEach(input => {
            if (input.type === 'select-one') {
                input.addEventListener('change', (e) => {
                    const subject = e.target.dataset.subject;
                    const priority = parseInt(e.target.value);
                    
                    console.log(`Priority changed for ${subject} to ${priority}`);
                    
                    // Save the priority (including 0 for excluded)
                    this.subjectPriorities[subject] = priority;
                    this.saveData();
                    
                    // Update the badge
                    const badge = e.target.previousElementSibling.querySelector('.priority-badge');
                    if (badge) {
                        if (priority === 0) {
                            badge.className = 'priority-badge priority-excluded';
                            badge.textContent = 'Excluded';
                        } else {
                            badge.className = `priority-badge priority-${priority}`;
                            badge.textContent = `P${priority}`;
                        }
                    }
                    
                    // Debug
                    console.log('Updated priorities:', this.subjectPriorities);
                });
            }
        });
    }

    attachHourInputListeners() {
        document.querySelectorAll('.hour-input').forEach(input => {
            input.addEventListener('input', (e) => {
                // Enforce 11-hour maximum limit
                if (parseFloat(e.target.value) > 11) {
                    console.warn(`⚠️ Input capped at 11 hours (max daily limit)`);
                    e.target.value = 11;
                }
                this.updateHoursSummary();
                this.updateScheduleButtonState();
            });
            input.addEventListener('change', (e) => {
                // Enforce 11-hour maximum limit
                if (parseFloat(e.target.value) > 11) {
                    console.warn(`⚠️ Input capped at 11 hours (max daily limit)`);
                    e.target.value = 11;
                }
                this.updateHoursSummary();
                this.updateScheduleButtonState();
            });
        });
    }

    setupBulkEditListeners() {
        const applyBulkHoursBtn = document.getElementById('applyBulkHours');
        if (applyBulkHoursBtn) {
            applyBulkHoursBtn.addEventListener('click', () => {
                const bulkHours = parseFloat(document.getElementById('bulkHours').value) || 0;
                this.applyBulkHours(bulkHours);
            });
        }

        const applyWeekdayHoursBtn = document.getElementById('applyWeekdayHours');
        if (applyWeekdayHoursBtn) {
            applyWeekdayHoursBtn.addEventListener('click', () => {
                const bulkHours = parseFloat(document.getElementById('bulkHours').value) || 0;
                this.applyBulkHours(bulkHours, false);
            });
        }

        const applyWeekendHoursBtn = document.getElementById('applyWeekendHours');
        if (applyWeekendHoursBtn) {
            applyWeekendHoursBtn.addEventListener('click', () => {
                const bulkHours = parseFloat(document.getElementById('bulkHours').value) || 0;
                this.applyBulkHours(bulkHours, true);
            });
        }
    }

    applyBulkHours(hours, weekendOnly = null) {
        if (hours < 0 || hours > 11) {
            alert('⚠️ Please enter hours between 0 and 11 (maximum daily limit)');
            return;
        }

        document.querySelectorAll('.hour-input').forEach(input => {
            const dayItem = input.closest('.hour-input-item');
            const isWeekend = dayItem && dayItem.dataset.weekend === 'true';
            
            if (weekendOnly === null || 
                (weekendOnly === true && isWeekend) || 
                (weekendOnly === false && !isWeekend)) {
                input.value = hours;
            }
        });

        this.updateHoursSummary();
        this.updateScheduleButtonState();
    }

    updateHoursSummary() {
        const inputs = document.querySelectorAll('.hour-input');
        let totalHours = 0;
        let validDays = 0;

        inputs.forEach(input => {
            const hours = parseFloat(input.value) || 0;
            if (hours > 0) {
                totalHours += hours;
                validDays++;
            }
        });

        const averageHours = validDays > 0 ? totalHours / validDays : 0;

        const totalHoursElement = document.getElementById('totalHoursSum');
        const averageHoursElement = document.getElementById('averageHours');
        
        if (totalHoursElement) totalHoursElement.textContent = totalHours.toFixed(1);
        if (averageHoursElement) averageHoursElement.textContent = averageHours.toFixed(1);
    }

    updateScheduleButtonState() {
        const totalHours = parseFloat(document.getElementById('totalHoursSum')?.textContent) || 0;
        const button = document.getElementById('generateScheduleBtn');
        if (button) {
            button.disabled = totalHours <= 0;
        }
    }

    attachConfigEventListeners() {
        // Priority base hours changes
        for (let priority = 0; priority <= 5; priority++) {
            const input = document.getElementById(`baseHours-${priority}`);
            if (input) {
                input.addEventListener('change', (e) => {
                    this.config.baseHours[priority] = parseFloat(e.target.value);
                    this.validateAndSaveConfig();
                });
            }
        }

        // Advanced config changes
        const minHoursInput = document.getElementById('minHoursToInclude');
        if (minHoursInput) {
            minHoursInput.addEventListener('change', (e) => {
                this.config.minHoursToInclude = parseFloat(e.target.value);
                this.validateAndSaveConfig();
            });
        }

        const roundToSelect = document.getElementById('roundTo');
        if (roundToSelect) {
            roundToSelect.addEventListener('change', (e) => {
                this.config.roundTo = parseFloat(e.target.value);
                this.validateAndSaveConfig();
            });
        }

        const distributionMethodSelect = document.getElementById('distributionMethod');
        if (distributionMethodSelect) {
            distributionMethodSelect.addEventListener('change', (e) => {
                this.config.distributionMethod = e.target.value;
                this.validateAndSaveConfig();
            });
        }
    }

    validateAndSaveConfig() {
        console.log('=== VALIDATING CONFIG ===');
        const errorContainer = document.getElementById('configError');
        
        // Clear previous errors
        this.hideError();

        // Ensure includedPriorities is always an array
        if (!Array.isArray(this.config.includedPriorities)) {
            this.config.includedPriorities = [1, 2, 3, 4, 5];
            console.log('Initialized includedPriorities as array');
        }

        // Validation 1: Check if total base hours for included priorities is reasonable
        const totalBaseHours = this.config.includedPriorities.reduce((sum, priority) => {
            return sum + (this.config.baseHours[priority] || 0);
        }, 0);
        
        console.log(`Total base hours for included priorities: ${totalBaseHours}`);
        
        if (totalBaseHours > 12) {
            this.showError('⚠️ Total base hours too high! Maximum recommended is 12 hours.');
            console.warn('Validation failed: Total base hours > 12');
            return;
        }

        // Validation 2: Check if minHoursToInclude is valid
        if (this.config.minHoursToInclude < 0.5) {
            this.showError('⚠️ Minimum hours to include cannot be less than 0.5 hours.');
            console.warn('Validation failed: minHoursToInclude < 0.5');
            return;
        }

        // Validation 3: Check if any base hours are negative
        const negativeHours = Object.entries(this.config.baseHours).find(([p, h]) => h < 0);
        if (negativeHours) {
            this.showError('⚠️ Base hours cannot be negative!');
            console.warn('Validation failed: Negative base hours found');
            return;
        }

        // Validation 4: Check if roundTo value is valid
        const validRoundValues = [0.25, 0.5, 1];
        if (!validRoundValues.includes(this.config.roundTo)) {
            this.config.roundTo = 0.5;
            console.log('Reset invalid roundTo value to 0.5');
        }

        // Validation 5: Check if distribution method is valid
        const validMethods = ['priority', 'equal', 'highFirst'];
        if (!validMethods.includes(this.config.distributionMethod)) {
            this.config.distributionMethod = 'priority';
            console.log('Reset invalid distributionMethod to priority');
        }

        // All validations passed
        this.saveData();
        this.renderConfigSummary();
        console.log('✓ Config validation passed and saved');
        this.showSuccess('✓ Configuration saved successfully!');
    }

    showError(message) {
        const errorContainer = document.getElementById('configError');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
            errorContainer.className = 'error-message';
        }
    }

    showSuccess(message) {
        const errorContainer = document.getElementById('configError');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
            errorContainer.className = 'success-message';
            
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                this.hideError();
            }, 3000);
        }
    }

    hideError() {
        const errorContainer = document.getElementById('configError');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
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
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (!startDateInput || !endDateInput) {
            console.error('Date inputs not found');
            return;
        }

        const startDateValue = startDateInput.value;
        const endDateValue = endDateInput.value;

        if (!startDateValue || !endDateValue) {
            console.log('Please select both start and end dates');
            return;
        }

        const startDate = new Date(startDateValue);
        const endDate = new Date(endDateValue);

        if (startDate > endDate) {
            alert('Start date cannot be after end date');
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
            
            // Check if we already have this day in the schedule with saved data
            const existingDay = this.schedule.find(d => d.date === dateString);
            
            days.push({
                name: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
                date: dateString,
                displayDate: displayDate,
                totalHours: existingDay ? existingDay.totalHours : 0,
                subjects: existingDay ? existingDay.subjects : []
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        this.schedule = days;
        this.renderHoursInputs();
        this.renderSchedule();
        this.renderSummary();
        this.saveData();
        
        console.log(`Generated ${days.length} days from ${startDateValue} to ${endDateValue}`);
    }

    updateHoursFromInputs() {
        console.log('Updating hours from inputs...');
        this.schedule = this.schedule.map(day => {
            const input = document.getElementById(`hours-${day.date}`);
            let totalHours = input ? parseFloat(input.value) || 0 : 0;
            // Enforce 11-hour maximum daily limit
            if (totalHours > 11) {
                console.warn(`⚠️ Daily hours capped: ${totalHours} → 11 (max limit)`);
                totalHours = 11;
                if (input) input.value = 11;
            }
            return { ...day, totalHours };
        });
    }

    generateSchedule() {
        console.log('=== STARTING SCHEDULE GENERATION ===');
        console.log('Subject priorities:', this.subjectPriorities);
        
        this.schedule = this.schedule.map(day => {
            console.log(`\nProcessing day: ${day.date} (${day.totalHours} hours)`);
            if (day.totalHours <= 0) {
                console.log('No hours, skipping...');
                return { ...day, subjects: [] };
            }
            const distributedSubjects = this.distributeSubjects(day.totalHours);
            console.log(`Subjects for ${day.date}:`, distributedSubjects);
            return { ...day, subjects: distributedSubjects };
        });
        
        console.log('=== SCHEDULE GENERATION COMPLETE ===');
    }

    distributeSubjects(totalHours) {
        console.log(`\nDistributing ${totalHours} hours...`);
        
        // Get included priorities
        const includedPriorities = Array.isArray(this.config.includedPriorities) 
            ? this.config.includedPriorities 
            : [1, 2, 3, 4, 5];
        
        console.log('Included priorities:', includedPriorities);
        
        // Create subject list with actual priorities
        const subjectList = this.subjects.map(subject => {
            // Get the actual priority - if not set, use default
            let priority = this.subjectPriorities[subject];
            if (priority === undefined) {
                priority = this.getDefaultPriorities()[subject] || 3;
            }
            
            console.log(`  ${subject}: priority = ${priority}`);
            
            return {
                name: subject,
                priority: priority,
                hours: 0
            };
        });

        // Filter out subjects with priority 0 (EXCLUDED) - KEY REQUIREMENT
        const filteredSubjects = subjectList.filter(subject => {
            const isExcluded = subject.priority === 0;
            const isIncluded = includedPriorities.includes(subject.priority);
            const shouldInclude = !isExcluded && isIncluded;
            
            if (isExcluded) {
                console.log(`  ${subject.name}: EXCLUDED (priority=0) - will NOT appear in schedule`);
            } else {
                console.log(`  ${subject.name}: priority=${subject.priority}, included=${isIncluded}`);
            }
            
            return shouldInclude;
        });

        console.log(`Subjects after filtering (${filteredSubjects.length}):`, filteredSubjects.map(s => s.name));

        if (filteredSubjects.length === 0) {
            console.log('No subjects to distribute');
            return [];
        }

        // Sort by priority (highest first) for allocation
        const sortedByPriority = [...filteredSubjects].sort((a, b) => b.priority - a.priority);
        let remainingHours = totalHours;

        // Step 1: Assign base hours - but cap total to not exceed daily limit
        console.log('\nStep 1: Assigning base hours (capped to daily limit)');
        const MAX_DAILY_HOURS = 11;
        let totalBaseHours = 0;
        const baseHoursAllocations = [];
        
        filteredSubjects.forEach(subject => {
            const base = this.config.baseHours[subject.priority] || 0;
            if (base > 0) {
                baseHoursAllocations.push({ subject: subject.name, base, priority: subject.priority });
                totalBaseHours += base;
            }
        });
        
        console.log(`Total base hours (uncapped): ${totalBaseHours.toFixed(2)}`);
        
        if (totalBaseHours > MAX_DAILY_HOURS) {
            // Base hours exceed limit - scale them down proportionally
            const scaleFactor = MAX_DAILY_HOURS / totalBaseHours;
            console.log(`⚠️ Base hours exceed daily limit. Scaling down by factor: ${scaleFactor.toFixed(2)}`);
            
            filteredSubjects.forEach(subject => {
                const base = this.config.baseHours[subject.priority] || 0;
                if (base > 0) {
                    subject.hours = base * scaleFactor;
                    remainingHours -= subject.hours;
                    console.log(`  ${subject.name}: base=${base} × ${scaleFactor.toFixed(2)} = ${subject.hours.toFixed(2)}, remaining=${remainingHours.toFixed(2)}`);
                }
            });
        } else {
            // Base hours are within limit - assign normally
            filteredSubjects.forEach(subject => {
                const base = this.config.baseHours[subject.priority] || 0;
                if (base > 0) {
                    subject.hours = base;
                    remainingHours -= base;
                    console.log(`  ${subject.name}: base=${base}, remaining=${remainingHours.toFixed(2)}`);
                }
            });
        }

        console.log(`After base hours: ${remainingHours.toFixed(2)} hours remaining`);

        // Step 2: Distribute remaining hours based on distribution method
        if (remainingHours > 0.01) {
            console.log(`\nStep 2: Distributing remaining ${remainingHours.toFixed(2)} hours using method: ${this.config.distributionMethod}`);
            
            if (this.config.distributionMethod === 'priority') {
                // Priority Weighted Distribution
                const totalPriority = filteredSubjects.reduce((sum, s) => sum + s.priority, 0);
                console.log(`  Total priority sum: ${totalPriority}`);
                
                filteredSubjects.forEach(subject => {
                    if (remainingHours <= 0.01) return;
                    const priorityWeight = subject.priority / totalPriority;
                    let allocatedHours = priorityWeight * remainingHours;
                    allocatedHours = this.roundTo(allocatedHours, this.config.roundTo);
                    allocatedHours = Math.min(allocatedHours, remainingHours);
                    
                    if (allocatedHours > 0) {
                        subject.hours += allocatedHours;
                        remainingHours -= allocatedHours;
                        console.log(`  ${subject.name}: +${allocatedHours}, new total=${subject.hours}, remaining=${remainingHours.toFixed(2)}`);
                    }
                });
            } else if (this.config.distributionMethod === 'equal') {
                // Equal Distribution
                const subjectsNeedingHours = filteredSubjects.filter(s => s.hours >= 0);
                const hoursPerSubject = remainingHours / subjectsNeedingHours.length;
                console.log(`  Hours per subject: ${hoursPerSubject.toFixed(2)}`);
                
                subjectsNeedingHours.forEach(subject => {
                    let allocatedHours = hoursPerSubject;
                    allocatedHours = this.roundTo(allocatedHours, this.config.roundTo);
                    
                    if (allocatedHours > 0) {
                        subject.hours += allocatedHours;
                        console.log(`  ${subject.name}: +${allocatedHours}, new total=${subject.hours}`);
                    }
                });
                remainingHours = 0;
            } else if (this.config.distributionMethod === 'highFirst') {
                // High Priority First - allocate to highest priority subjects first
                console.log(`  Allocating to highest priority first`);
                
                for (let i = 0; i < sortedByPriority.length && remainingHours > 0.01; i++) {
                    const subject = sortedByPriority[i];
                    const allocationUnit = this.config.roundTo;
                    const allocatedHours = Math.min(allocationUnit, remainingHours);
                    
                    if (allocatedHours > 0) {
                        subject.hours += allocatedHours;
                        remainingHours -= allocatedHours;
                        console.log(`  ${subject.name}: +${allocatedHours}, new total=${subject.hours}, remaining=${remainingHours.toFixed(2)}`);
                    }
                }
            }
        }

        // Step 3: Finalize distribution
        console.log('\nStep 3: Finalizing distribution');
        const result = this.finalizeDistribution(filteredSubjects, totalHours);
        console.log('Final subjects:', result);
        return result;
    }

    finalizeDistribution(subjectList, totalHours) {
        console.log('\nFinalizing distribution...');
        console.log('Before finalization:', subjectList.map(s => `${s.name}:${s.hours}`));
        
        // CRITICAL: Double-check no priority 0 subjects slipped through
        const noPriorityZero = subjectList.filter(s => s.priority !== 0);
        console.log(`Security check: Filtered ${subjectList.length - noPriorityZero.length} priority 0 subjects`);
        if (noPriorityZero.length < subjectList.length) {
            console.warn('⚠️ WARNING: Priority 0 subjects found in finalization! Removing them.');
            subjectList = noPriorityZero;
        }
        
        // Step 1: Apply rounding to all subjects
        subjectList.forEach(subject => {
            subject.hours = this.roundTo(subject.hours, this.config.roundTo);
        });
        
        console.log('After rounding:', subjectList.map(s => `${s.name}:${s.hours}`));

        // Step 2: Calculate current total and adjust to match target
        // NOTE: totalHours is capped at 11 by updateHoursFromInputs()
        // So we should never exceed 11 hours per day when distributing
        const MAX_DAILY_HOURS = 11;
        
        let currentTotal = subjectList.reduce((sum, s) => sum + s.hours, 0);
        const diff = totalHours - currentTotal;
        
        console.log(`Current total: ${currentTotal.toFixed(2)}, Target: ${totalHours.toFixed(2)}, Max daily: ${MAX_DAILY_HOURS}, Diff: ${diff.toFixed(2)}`);

        // Adjust to match total (distribute small differences)
        if (Math.abs(diff) > 0.01) {
            if (diff > 0) {
                // Need to add hours - distribute to subjects, respecting max daily limit
                let remainingDiff = diff;
                const sortedByPriority = [...subjectList].sort((a, b) => b.priority - a.priority);
                
                for (let subject of sortedByPriority) {
                    if (remainingDiff < 0.01) break;
                    
                    // Calculate how much we can add to this subject
                    const headroom = MAX_DAILY_HOURS - subject.hours;
                    const canAdd = Math.min(remainingDiff, headroom);
                    
                    if (canAdd > 0.01) {
                        subject.hours += canAdd;
                        remainingDiff -= canAdd;
                        console.log(`Added ${canAdd.toFixed(2)} hours to ${subject.name} (now ${subject.hours.toFixed(2)}, headroom was ${headroom.toFixed(2)})`);
                    } else {
                        console.log(`Cannot add to ${subject.name}: no headroom (already at ${subject.hours.toFixed(2)} hrs)`);
                    }
                }
                
                if (remainingDiff > 0.01) {
                    console.warn(`⚠️ Could not distribute remaining ${remainingDiff.toFixed(2)} hours while respecting 11-hour daily limit`);
                }
            } else {
                // Need to remove hours - remove from lowest priority subjects
                console.log(`Removing ${Math.abs(diff).toFixed(2)} hours total`);
                let remainingToRemove = Math.abs(diff);
                const sortedByPriority = [...subjectList].sort((a, b) => a.priority - b.priority);
                
                for (let subject of sortedByPriority) {
                    if (remainingToRemove < 0.01) break;
                    
                    if (subject.hours > 0) {
                        const canRemove = Math.min(remainingToRemove, subject.hours);
                        subject.hours -= canRemove;
                        remainingToRemove -= canRemove;
                        console.log(`Removed ${canRemove.toFixed(2)} hours from ${subject.name} (now ${subject.hours.toFixed(2)}), still need to remove ${remainingToRemove.toFixed(2)}`);
                    }
                }
                
                if (remainingToRemove > 0.01) {
                    console.warn(`⚠️ Could not remove all ${Math.abs(diff).toFixed(2)} hours (${remainingToRemove.toFixed(2)} unremoved)`);
                }
            }
        }

        // Step 3: Filter by minimum hours and sort
        const minHours = this.config.minHoursToInclude || 0;
        const finalSubjects = subjectList
            .filter(subject => {
                // CRITICAL: Exclude priority 0 at final stage
                if (subject.priority === 0) {
                    console.log(`FINAL CHECK: Excluding ${subject.name} (priority=0)`);
                    return false;
                }
                const included = subject.hours >= minHours;
                if (!included) {
                    console.log(`Filtered out ${subject.name}: ${subject.hours.toFixed(2)}h < ${minHours}h`);
                }
                return included;
            })
            .map(subject => ({
                name: subject.name,
                priority: subject.priority,
                hours: subject.hours
            }))
            .sort((a, b) => b.priority - a.priority || b.hours - a.hours);

        console.log('Final output:', finalSubjects.map(s => `${s.name}:${s.hours}`));
        return finalSubjects;
    }

    roundTo(num, step) {
        return Math.round(num / step) * step;
    }

    printSchedule() {
        const hasSchedule = this.schedule.some(day => day.subjects && day.subjects.length > 0);
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
        
        const scheduledDays = this.schedule.filter(day => day.totalHours > 0 && day.subjects && day.subjects.length > 0);
        
        if (scheduledDays.length === 0) {
            return '<div style="text-align: center; padding: 40px; color: #666;">No study scheduled</div>';
        }
        
        return scheduledDays.map(day => `
            <div class="day-card">
                <div class="day-header">
                    <div>
                        <div class="day-name">${day.name}</div>
                        <div class="day-date">${day.displayDate}</div>
                    </div>
                    <span class="total-hours">${day.totalHours.toFixed(1)} hrs</span>
                </div>
                <div class="subjects-list">
                    ${day.subjects.map(subject => `
                        <div class="subject-item">
                            <div class="subject-info">
                                <span class="subject-name">${subject.name}</span>
                                <span class="subject-priority">
                                    Priority: ${subject.priority}
                                    <span class="priority-badge">P${subject.priority}</span>
                                </span>
                            </div>
                            <span class="subject-hours">${subject.hours.toFixed(1)} hr${subject.hours !== 1 ? 's' : ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    generateSummaryHTML() {
        if (!this.schedule) return '';
        
        const totalStudyHours = this.schedule.reduce((sum, day) => sum + day.totalHours, 0);
        const studyDays = this.schedule.filter(day => day.totalHours > 0).length;
        const totalSubjects = new Set(this.schedule.flatMap(day => day.subjects?.map(s => s.name) || [])).size;
        
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
        // Show user-friendly error message
        alert('Error loading the study schedule app. Please refresh the page.');
    }
});
