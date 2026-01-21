// --- Configurable Subject Priorities ---
const subjectsContainer = document.getElementById('subjectsContainer');
const numSubjectsInput = document.getElementById('numSubjects');
const generateSubjectsBtn = document.getElementById('generateSubjects');
const saveDefaultsBtn = document.getElementById('saveDefaults');

function renderSubjectInputs(subjects = []) {
    subjectsContainer.innerHTML = '';
    const numSubjects = parseInt(numSubjectsInput.value, 10);
    for (let i = 0; i < numSubjects; i++) {
        const subjectName = subjects[i]?.name || '';
        const priority = subjects[i]?.priority ?? 5;
        const div = document.createElement('div');
        div.className = 'subject-col';
        div.innerHTML = `
            <input type="text" placeholder="Subject Name" value="${subjectName}" class="subject-name" style="margin-bottom:8px;font-weight:600;">
            <select class="subject-priority">
                <option value="5">5 (Highest)</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
                <option value="0">0 (Exclude)</option>
            </select>
        `;
        div.querySelector('.subject-priority').value = priority;
        subjectsContainer.appendChild(div);
    }
}

generateSubjectsBtn.onclick = () => {
    renderSubjectInputs();
};

saveDefaultsBtn.onclick = () => {
    const subjects = [];
    subjectsContainer.querySelectorAll('div').forEach(div => {
        const name = div.querySelector('.subject-name').value.trim();
        const priority = parseInt(div.querySelector('.subject-priority').value, 10);
        if (name) subjects.push({ name, priority });
    });
        localStorage.setItem('defaultSubjects', JSON.stringify(subjects));
        // Custom modal for confirmation
        let modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.3)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div style="background:#fff;padding:32px 24px;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,0.15);text-align:center;min-width:260px;">
                <div style="font-size:1.2em;font-weight:600;margin-bottom:16px;">Default Subjects Saved</div>
                <button id="closeDefaultModal" style="padding:8px 24px;font-size:1em;border-radius:6px;border:none;background:#764ba2;color:#fff;cursor:pointer;">OK</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('closeDefaultModal').onclick = () => {
            document.body.removeChild(modal);
        };
};

window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('defaultSubjects');
    if (saved) {
        const subjects = JSON.parse(saved);
        numSubjectsInput.value = subjects.length;
        renderSubjectInputs(subjects);
    } else {
        renderSubjectInputs();
    }
});
// Enhanced Study Schedule App with Date Range, Priority, and Configuration
class StudySchedule {
    constructor() {
        // Load user-defined subjects from localStorage, fallback to default
        const savedSubjects = localStorage.getItem('defaultSubjects');
        if (savedSubjects) {
            this.subjects = JSON.parse(savedSubjects).map(s => s.name);
            this.subjectPriorities = {};
            JSON.parse(savedSubjects).forEach(s => {
                this.subjectPriorities[s.name] = s.priority;
            });
        } else {
            this.subjects = [
                'Math', 'Physics', 'Chemistry', 'Biology', 
                'AI & Robotics', 'History', 'Geography', 
                'English Lit', 'English Lang', 'Bengali'
            ];
            this.subjectPriorities = {};
        }
        // Initialize other properties
        this.schedule = [];
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
                4: 2.0, // P4 base hours for 8h+ days
                5: 3.0  // P5 base hours for 6h+ days
            },
            minHoursToInclude: 1.0,
            roundTo: 0.5,
            includedPriorities: [1, 2, 3, 4, 5],
            maxSubjectsPerDay: 4
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
        container.innerHTML = '';
        this.subjects.forEach(subject => {
            const subjectId = subject.replace(/[&\s]+/g, '-');
            let priority = this.subjectPriorities[subject];
            if (priority === undefined) {
                priority = this.getDefaultPriorities()[subject] || 3;
            }
            const div = document.createElement('div');
            div.className = 'priority-item';
            div.innerHTML = `
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
            `;
            container.appendChild(div);
        });
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
        const maxSubjectsInput = document.getElementById('maxSubjectsPerDay');
        const p5SingleInput = document.getElementById('p5SingleThreshold');
        const p5DoubleMinInput = document.getElementById('p5DoubleMinThreshold');
        const p5DoubleMaxInput = document.getElementById('p5DoubleMaxThreshold');
        
        if (minHoursInput) minHoursInput.value = this.config.minHoursToInclude;
        if (roundToSelect) roundToSelect.value = this.config.roundTo.toString();
        if (distributionMethodSelect) distributionMethodSelect.value = this.config.distributionMethod;
        if (maxSubjectsInput) maxSubjectsInput.value = this.config.maxSubjectsPerDay;
        if (p5SingleInput) p5SingleInput.value = this.config.p5SplitThresholds.single;
        if (p5DoubleMinInput) p5DoubleMinInput.value = this.config.p5SplitThresholds.doubleMin;
        if (p5DoubleMaxInput) p5DoubleMaxInput.value = this.config.p5SplitThresholds.doubleMax;
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
            // Use direct local date parsing for correct day-of-week
            const dateObj = new Date(day.date + 'T00:00:00');
            const dayOfWeek = dateObj.getDay();
            // Weekend is strictly Saturday (6) and Sunday (0)
            const isWeekend = (dayOfWeek === 6 || dayOfWeek === 0);
            const dayType = isWeekend ? 'Weekend' : 'Weekday';
            const defaultHours = isWeekend ? 6 : 4;
            const totalHours = day.totalHours > 0 ? day.totalHours : defaultHours;
            // Debug log for verification
            console.log(`Date: ${day.date}, DayOfWeek: ${dayOfWeek}, Weekend: ${isWeekend}`);

            return `
                <div class="hour-input-item" data-date="${day.date}" data-weekend="${isWeekend}">
                    <div class="day-info">
                        <div class="day-name">${day.name}</div>
                        <div class="day-date">${day.displayDate}</div>
                        <!-- Removed weekday/weekend label -->
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
                // P5 split threshold changes
                const p5SingleInput = document.getElementById('p5SingleThreshold');
                if (p5SingleInput) {
                    p5SingleInput.addEventListener('change', (e) => {
                        this.config.p5SplitThresholds.single = parseFloat(e.target.value) || 3;
                        this.validateAndSaveConfig();
                    });
                }
                const p5DoubleMinInput = document.getElementById('p5DoubleMinThreshold');
                if (p5DoubleMinInput) {
                    p5DoubleMinInput.addEventListener('change', (e) => {
                        this.config.p5SplitThresholds.doubleMin = parseFloat(e.target.value) || 4;
                        this.validateAndSaveConfig();
                    });
                }
                const p5DoubleMaxInput = document.getElementById('p5DoubleMaxThreshold');
                if (p5DoubleMaxInput) {
                    p5DoubleMaxInput.addEventListener('change', (e) => {
                        this.config.p5SplitThresholds.doubleMax = parseFloat(e.target.value) || 6;
                        this.validateAndSaveConfig();
                    });
                }
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

        const maxSubjectsInput = document.getElementById('maxSubjectsPerDay');
        if (maxSubjectsInput) {
            maxSubjectsInput.addEventListener('change', (e) => {
                this.config.maxSubjectsPerDay = parseInt(e.target.value, 10) || 4;
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
        // distributionMethodSelect event listener removed
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

        // Distribution method validation removed

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
        // Parse as local date (not UTC)
        const startDate = new Date(startDateValue + 'T00:00:00');
        const endDate = new Date(endDateValue + 'T00:00:00');
        if (startDate > endDate) {
            alert('Start date cannot be after end date');
            return;
        }
        const days = [];
        // Ensure currentDate is set to the selected start date exactly
        let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        while (currentDate.getTime() <= endDate.getTime()) {
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
        
        // NEW: Schedule-aware rotation logic
        this.createRotatingSchedule();
        
        console.log('=== SCHEDULE GENERATION COMPLETE ===');
    }

    createRotatingSchedule() {
                // Helper to force overdue P3/P2/P1 inclusion if not scheduled in their window
                function forceOverdueInclusion(subjectsForDay, maxSubjects, dayIndex) {
                    // Check for overdue P3 (strict: every 3 days)
                    for (let i = 0; i < p3Subjects.length; i++) {
                        if (daysSinceP3[i] > 2) { // Missed in 3 days
                            // Remove lowest priority subject if needed
                            if (subjectsForDay.length >= maxSubjects) {
                                let minIdx = -1, minPriority = 99;
                                for (let j = 0; j < subjectsForDay.length; j++) {
                                    if (subjectsForDay[j].priority < minPriority) {
                                        minPriority = subjectsForDay[j].priority;
                                        minIdx = j;
                                    }
                                }
                                if (minIdx !== -1 && minPriority < 3) {
                                    subjectsForDay.splice(minIdx, 1);
                                } else {
                                    continue;
                                }
                            }
                            subjectsForDay.push({ name: p3Subjects[i], priority: 3, hours: 1 });
                            daysSinceP3[i] = 0;
                        }
                    }
                    // Check for overdue P2 (strict: every 5 days)
                    for (let i = 0; i < p2Subjects.length; i++) {
                        if (daysSinceP2[i] > 4) { // Missed in 5 days
                            if (subjectsForDay.length >= maxSubjects) {
                                let minIdx = -1, minPriority = 99;
                                for (let j = 0; j < subjectsForDay.length; j++) {
                                    if (subjectsForDay[j].priority < minPriority) {
                                        minPriority = subjectsForDay[j].priority;
                                        minIdx = j;
                                    }
                                }
                                if (minIdx !== -1 && minPriority < 2) {
                                    subjectsForDay.splice(minIdx, 1);
                                } else {
                                    continue;
                                }
                            }
                            subjectsForDay.push({ name: p2Subjects[i], priority: 2, hours: 1 });
                            daysSinceP2[i] = 0;
                        }
                    }
                    // Check for overdue P1 (strict: every 5 days)
                    for (let i = 0; i < subjectsByPriority[1].length; i++) {
                        if (daysSinceP2[i] > 4) { // Missed in 5 days
                            if (subjectsForDay.length >= maxSubjects) {
                                let minIdx = -1, minPriority = 99;
                                for (let j = 0; j < subjectsForDay.length; j++) {
                                    if (subjectsForDay[j].priority < minPriority) {
                                        minPriority = subjectsForDay[j].priority;
                                        minIdx = j;
                                    }
                                }
                                if (minIdx !== -1 && minPriority < 1) {
                                    subjectsForDay.splice(minIdx, 1);
                                } else {
                                    continue;
                                }
                            }
                            subjectsForDay.push({ name: subjectsByPriority[1][i], priority: 1, hours: 1 });
                            daysSinceP2[i] = 0;
                        }
                    }
                }
        // Always reload latest user-defined subjects and priorities from localStorage
        const savedSubjects = localStorage.getItem('defaultSubjects');
        if (savedSubjects) {
            this.subjects = JSON.parse(savedSubjects).map(s => s.name);
            this.subjectPriorities = {};
            JSON.parse(savedSubjects).forEach(s => {
                this.subjectPriorities[s.name] = s.priority;
            });
        }
        console.log('\n--- CREATING ROTATING SCHEDULE ---');
        const subjectsByPriority = { 5: [], 4: [], 3: [], 2: [], 1: [] };
        Object.entries(this.subjectPriorities).forEach(([subject, priority]) => {
            if (priority > 0 && priority <= 5) {
                subjectsByPriority[priority].push(subject);
            }
        });
        console.log('Subjects by priority:', {
            P5: subjectsByPriority[5],
            P4: subjectsByPriority[4],
            P3: subjectsByPriority[3],
            P2: subjectsByPriority[2],
            P1: subjectsByPriority[1]
        });
        const p5Subjects = subjectsByPriority[5];
        const p4Subjects = subjectsByPriority[4];
        const p3Subjects = subjectsByPriority[3];
        const p2Subjects = subjectsByPriority[2];
        const p1Subjects = subjectsByPriority[1];
        // Use config for P5 split thresholds and max subjects
        const p5Split = this.config.p5SplitThresholds || { single: 3, doubleMin: 4, doubleMax: 6 };
        const maxSubjects = this.config.maxSubjectsPerDay || 4;
        const p5Hours = 3;
        const p4Hours = 2.5;
        const p3Hours = 1.5;
        const p2Hours = 1.0;
        let p5Index = 0, p4Index = 0, p3Index = 0, p2Index = 0, p1Index = 0;
        let p123RotationIndex = 0; // Track rotation through P3, P2, P1 (0 = P3, 1 = P2, 2 = P1)
        let daysSinceP3 = [];
        let daysSinceP2 = [];
        let daysSinceP1 = [];
        // Initialize to negative values so they don't force on early days
        // P3: -1 means forced check triggers on day 4 (when >= 3)
        // P2/P1: -4 means forced check triggers on day 9 (when >= 5)
        p3Subjects.forEach(() => daysSinceP3.push(-1));
        p2Subjects.forEach(() => daysSinceP2.push(-4));
        p1Subjects.forEach(() => daysSinceP1.push(-4));
        this.schedule = this.schedule.map((day, dayIndex) => {
            const maxHours = day.totalHours;
            console.log(`\nDay ${dayIndex + 1}: ${day.date} (${maxHours}h available)`);
            if (maxHours <= 0) {
                return { ...day, subjects: [] };
            }
            // End of main allocation logic
            let subjectsForDay = [];
            let hoursUsed = 0;
            // Increment days since last appearance for all P3, P2, and P1
            daysSinceP3 = daysSinceP3.map(d => d + 1);
            daysSinceP2 = daysSinceP2.map(d => d + 1);
            daysSinceP1 = daysSinceP1.map(d => d + 1);

            // Helper to add subject only if not already present
            function addSubjectOnce(subjectsArr, subjectObj) {
                if (!subjectsArr.some(s => s.name === subjectObj.name)) {
                    subjectsArr.push(subjectObj);
                    return true;
                }
                return false;
            }

            // --- STRICT HOUR-BASED ALLOCATION LOGIC ---
            // Base hour config
            const basep5Hours = this.config.baseHours[5] || 3;
            const basep4Hours = this.config.baseHours[4] || 2;
            const basep3Hours = this.config.baseHours[3] || 1.5;
            const basep2Hours = this.config.baseHours[2] || 1;
            const basep1Hours = this.config.baseHours[1] || 1;

            if (maxHours >= 1 && maxHours <= 3) {
                // 1-3 hrs: Assign 1 P5 subject
                if (p5Subjects.length > 0) {
                    const subject = p5Subjects[p5Index % p5Subjects.length];
                    addSubjectOnce(subjectsForDay, { name: subject, priority: 5, hours: maxHours });
                    p5Index++;
                }
            } else if (maxHours >= 4 && maxHours <= 5) {
                // 4-5 hrs: Assign 2 P5 subjects with equal hours distribution
                if (p5Subjects.length > 0) {
                    const hoursPerP5 = maxHours / 2;
                    const subject1 = p5Subjects[p5Index % p5Subjects.length];
                    addSubjectOnce(subjectsForDay, { name: subject1, priority: 5, hours: hoursPerP5 });
                    p5Index++;
                    if (p5Subjects.length > 1) {
                        const subject2 = p5Subjects[p5Index % p5Subjects.length];
                        addSubjectOnce(subjectsForDay, { name: subject2, priority: 5, hours: hoursPerP5 });
                        p5Index++;
                    } else {
                        // Only 1 P5 subject, give it all hours
                        subjectsForDay[0].hours = maxHours;
                    }
                }
            } else if (maxHours === 6) {
                // 6 hrs: Assign 2 P5 subjects with base hours distribution (3+3)
                if (p5Subjects.length > 0) {
                    const subject1 = p5Subjects[p5Index % p5Subjects.length];
                    addSubjectOnce(subjectsForDay, { name: subject1, priority: 5, hours: basep5Hours });
                    p5Index++;
                    if (p5Subjects.length > 1) {
                        const subject2 = p5Subjects[p5Index % p5Subjects.length];
                        addSubjectOnce(subjectsForDay, { name: subject2, priority: 5, hours: basep5Hours });
                        p5Index++;
                    } else {
                        // Only 1 P5 subject, give it all hours
                        subjectsForDay[0].hours = maxHours;
                    }
                }
            } else if (maxHours >= 7 && maxHours <= 8) {
                // 7-8 hrs: Assign 2 P5 (base) + 1 P4 (remaining)
                let used = 0;
                if (p5Subjects.length > 0) {
                    const subject1 = p5Subjects[p5Index % p5Subjects.length];
                    addSubjectOnce(subjectsForDay, { name: subject1, priority: 5, hours: basep5Hours });
                    used += basep5Hours;
                    p5Index++;
                    if (p5Subjects.length > 1) {
                        const subject2 = p5Subjects[p5Index % p5Subjects.length];
                        addSubjectOnce(subjectsForDay, { name: subject2, priority: 5, hours: basep5Hours });
                        used += basep5Hours;
                        p5Index++;
                    }
                }
                // Add P4 with remaining hours
                if (p4Subjects.length > 0 && subjectsForDay.length < maxSubjects) {
                    const remainingHours = maxHours - used;
                    const subject = p4Subjects[p4Index % p4Subjects.length];
                    addSubjectOnce(subjectsForDay, { name: subject, priority: 4, hours: remainingHours });
                    p4Index++;
                }
            } else if (maxHours >= 9 && maxHours <= 11) {
                // 9-11 hrs: Assign 2 P5 (base) + 1 P4 (base) + 1 P1/P2/P3 (with frequency enforcement)
                let used = 0;

                // Add 2 P5 subjects with base hours
                if (p5Subjects.length > 0) {
                    const subject1 = p5Subjects[p5Index % p5Subjects.length];
                    addSubjectOnce(subjectsForDay, { name: subject1, priority: 5, hours: basep5Hours });
                    used += basep5Hours;
                    p5Index++;
                    if (p5Subjects.length > 1) {
                        const subject2 = p5Subjects[p5Index % p5Subjects.length];
                        addSubjectOnce(subjectsForDay, { name: subject2, priority: 5, hours: basep5Hours });
                        used += basep5Hours;
                        p5Index++;
                    }
                }

                // Add 1 P4 subject with base hours
                if (p4Subjects.length > 0 && subjectsForDay.length < maxSubjects) {
                    const subject = p4Subjects[p4Index % p4Subjects.length];
                    addSubjectOnce(subjectsForDay, { name: subject, priority: 4, hours: basep4Hours });
                    used += basep4Hours;
                    p4Index++;
                }

                // Add 1 P3/P2/P1 with remaining hours (enforce frequency rules)
                if (subjectsForDay.length < maxSubjects) {
                    const remainingHours = maxHours - used;
                    let added = false;

                    // Find the MOST overdue subject across all priorities
                    let mostOverdueInfo = null;
                    let maxDaysSince = 0;

                    // Check P3 (threshold: 3 days)
                    for (let attempt = 0; attempt < p3Subjects.length; attempt++) {
                        const i = (p3Index + attempt) % p3Subjects.length;
                        if (daysSinceP3[i] >= 3 && daysSinceP3[i] > maxDaysSince) {
                            maxDaysSince = daysSinceP3[i];
                            mostOverdueInfo = { priority: 3, index: i, daysSince: daysSinceP3[i], subjects: p3Subjects, daysSinceArr: daysSinceP3 };
                        }
                    }

                    // Check P2 (threshold: 5 days)
                    for (let attempt = 0; attempt < p2Subjects.length; attempt++) {
                        const i = (p2Index + attempt) % p2Subjects.length;
                        if (daysSinceP2[i] >= 5 && daysSinceP2[i] > maxDaysSince) {
                            maxDaysSince = daysSinceP2[i];
                            mostOverdueInfo = { priority: 2, index: i, daysSince: daysSinceP2[i], subjects: p2Subjects, daysSinceArr: daysSinceP2 };
                        }
                    }

                    // Check P1 (threshold: 5 days)
                    for (let attempt = 0; attempt < p1Subjects.length; attempt++) {
                        const i = (p1Index + attempt) % p1Subjects.length;
                        if (daysSinceP1[i] >= 5 && daysSinceP1[i] > maxDaysSince) {
                            maxDaysSince = daysSinceP1[i];
                            mostOverdueInfo = { priority: 1, index: i, daysSince: daysSinceP1[i], subjects: p1Subjects, daysSinceArr: daysSinceP1 };
                        }
                    }

                    // Force the MOST overdue subject if any found
                    if (mostOverdueInfo) {
                        const { priority, index, daysSince, subjects, daysSinceArr } = mostOverdueInfo;
                        const subject = subjects[index];
                        console.log(`  Day ${dayIndex + 1} force: P${priority} subject "${subject}" is ${daysSince} days old, forcing (MOST OVERDUE)...`);
                        addSubjectOnce(subjectsForDay, { name: subject, priority, hours: remainingHours });
                        daysSinceArr[index] = 0;
                        if (priority === 3) p3Index = (index + 1) % p3Subjects.length;
                        else if (priority === 2) p2Index = (index + 1) % p2Subjects.length;
                        else p1Index = (index + 1) % p1Subjects.length;
                        added = true;
                    }

                    // If none overdue, rotate through P3, P2, P1 in round-robin fashion
                    if (!added) {
                        // Simple round-robin: try each priority once in rotation order
                        const rotationPriority = p123RotationIndex % 3; // 0=P3, 1=P2, 2=P1
                        console.log(`  Day ${dayIndex + 1} rotation: index=${p123RotationIndex}, priority=${rotationPriority}, trying P${[3,2,1][rotationPriority]}`);
                        
                        if (rotationPriority === 0 && p3Subjects.length > 0) {
                            // Rotate P3
                            const subject = p3Subjects[p3Index % p3Subjects.length];
                            if (addSubjectOnce(subjectsForDay, { name: subject, priority: 3, hours: remainingHours })) {
                                console.log(`    → Added P3: ${subject}`);
                                daysSinceP3[p3Index % p3Subjects.length] = 0;
                                p3Index++;
                                added = true;
                            }
                        } else if (rotationPriority === 1 && p2Subjects.length > 0) {
                            // Rotate P2
                            const subject = p2Subjects[p2Index % p2Subjects.length];
                            if (addSubjectOnce(subjectsForDay, { name: subject, priority: 2, hours: remainingHours })) {
                                console.log(`    → Added P2: ${subject}`);
                                daysSinceP2[p2Index % p2Subjects.length] = 0;
                                p2Index++;
                                added = true;
                            }
                        } else if (rotationPriority === 2 && p1Subjects.length > 0) {
                            // Rotate P1
                            const subject = p1Subjects[p1Index % p1Subjects.length];
                            if (addSubjectOnce(subjectsForDay, { name: subject, priority: 1, hours: remainingHours })) {
                                console.log(`    → Added P1: ${subject}`);
                                daysSinceP1[p1Index % p1Subjects.length] = 0;
                                p1Index++;
                                added = true;
                            }
                        } else {
                            console.log(`    → Rotation priority ${rotationPriority} has no subjects or condition failed`);
                        }
                        
                        // Always advance rotation index at end of day, whether we added or not
                        p123RotationIndex++;
                    }
                }
            }



            // Ensure no duplicate subjects and maxSubjectsPerDay enforced
            subjectsForDay = subjectsForDay.slice(0, maxSubjects);

            // Ensure total hours do not exceed maxHours
            let total = subjectsForDay.reduce((sum, s) => sum + s.hours, 0);
            if (total > maxHours) {
                // Scale down proportionally
                subjectsForDay.forEach(s => s.hours = (s.hours / total) * maxHours);
            }
            // Enforce minHoursToInclude for all except P4/P5 (always included)
            let minHoursFilter = this.config.minHoursToInclude || 0;
            const filteredSubjects = subjectsForDay.filter(s => {
                if (s.priority === 5 || s.priority === 4) return true;
                return s.hours >= minHoursFilter;
            });
            // Log for validation
            console.log(`Subjects for day ${dayIndex + 1}:`, filteredSubjects.map(s => `${s.name} (P${s.priority}, ${s.hours.toFixed(2)}h)`));
            return { ...day, subjects: filteredSubjects };
        });
    }
    distributeSubjects(totalHours) {
        // This method is now superseded by createRotatingSchedule()
        // Kept for backward compatibility
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

        // Step 1: Assign base hours - Scale proportionally if needed, respecting config
        console.log('\nStep 1: Assigning base hours (respecting config)');
        const MAX_DAILY_HOURS = 11;
        let totalBaseHours = 0;
        
        // Calculate total base hours needed
        filteredSubjects.forEach(subject => {
            const base = this.config.baseHours[subject.priority] || 0;
            totalBaseHours += base;
        });
        
        console.log(`Total base hours (uncapped): ${totalBaseHours.toFixed(2)}`);
        
        // Allocate base hours - scale if needed to fit within 11 hours
        if (totalBaseHours > MAX_DAILY_HOURS) {
            const scaleFactor = MAX_DAILY_HOURS / totalBaseHours;
            console.log(`⚠️ Base hours exceed limit. Scaling by factor: ${scaleFactor.toFixed(2)}`);
            
            filteredSubjects.forEach(subject => {
                const base = this.config.baseHours[subject.priority] || 0;
                if (base > 0) {
                    subject.hours = base * scaleFactor;
                    remainingHours -= subject.hours;
                    console.log(`  ${subject.name} (P${subject.priority}): ${base}h × ${scaleFactor.toFixed(2)} = ${subject.hours.toFixed(2)}h`);
                }
            });
        } else {
            // Base hours fit - assign normally
            filteredSubjects.forEach(subject => {
                const base = this.config.baseHours[subject.priority] || 0;
                if (base > 0) {
                    subject.hours = base;
                    remainingHours -= base;
                    console.log(`  ${subject.name} (P${subject.priority}): ${base}h`);
                }
            });
        }

        console.log(`After base hours: ${remainingHours.toFixed(2)} hours remaining`);

        // Step 2: Distribute remaining hours based on distribution method
        if (remainingHours > 0.01) {
            // Only priority-based distribution remains
            const totalPriority = filteredSubjects.reduce((sum, s) => sum + s.priority, 0);
            filteredSubjects.forEach(subject => {
                if (remainingHours <= 0.01) return;
                const priorityWeight = subject.priority / totalPriority;
                let allocatedHours = priorityWeight * remainingHours;
                allocatedHours = this.roundTo(allocatedHours, this.config.roundTo);
                allocatedHours = Math.min(allocatedHours, remainingHours);
                if (allocatedHours > 0) {
                    subject.hours += allocatedHours;
                    remainingHours -= allocatedHours;
                }
            });
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
                // CRITICAL: NEVER remove hours from P4 or P5 subjects - they're mandatory
                // Only remove from P1-P3, and accept if we can't hit exact target
                const minHours = this.config.minHoursToInclude || 0;
                console.log(`Removing ${Math.abs(diff).toFixed(2)} hours total (protecting P4/P5 subjects)`);
                let remainingToRemove = Math.abs(diff);
                
                // Sort by priority, but skip P4 and P5
                const removableSubjects = subjectList
                    .filter(s => s.priority < 4)  // Only P1-P3 are removable
                    .sort((a, b) => a.priority - b.priority);
                
                console.log(`Removable subjects (P1-P3): ${removableSubjects.map(s => s.name).join(', ')}`);
                
                for (let subject of removableSubjects) {
                    if (remainingToRemove < 0.01) break;
                    
                    if (subject.hours > minHours) {
                        // Can only remove down to the minimum threshold
                        const maxCanRemove = subject.hours - minHours;
                        const canRemove = Math.min(remainingToRemove, maxCanRemove);
                        
                        if (canRemove > 0.01) {
                            subject.hours -= canRemove;
                            remainingToRemove -= canRemove;
                            console.log(`Removed ${canRemove.toFixed(2)} hours from ${subject.name} (P${subject.priority}, now ${subject.hours.toFixed(2)}), still need to remove ${remainingToRemove.toFixed(2)}`);
                        } else {
                            console.log(`Cannot remove from ${subject.name} (P${subject.priority}): would drop below minimum`);
                        }
                    }
                }
                
                if (remainingToRemove > 0.01) {
                    console.warn(`⚠️ Could not remove all ${Math.abs(diff).toFixed(2)} hours while protecting P4/P5 subjects (${remainingToRemove.toFixed(2)} unremoved). Accepting slight overage to ensure P4/P5 coverage.`);
                }
            }
        }

        // Step 3: Filter by minimum hours and sort
        // CRITICAL: P5 and P4 subjects are ALWAYS included (no minimum threshold)
        const minHours = this.config.minHoursToInclude || 0;
        const finalSubjects = subjectList
            .filter(subject => {
                // CRITICAL: Exclude priority 0 at final stage
                if (subject.priority === 0) {
                    console.log(`FINAL CHECK: Excluding ${subject.name} (priority=0)`);
                    return false;
                }
                
                // CRITICAL: P5 and P4 subjects are ALWAYS included (mandatory)
                if (subject.priority === 5 || subject.priority === 4) {
                    console.log(`✓ MANDATORY: Including ${subject.name} (Priority ${subject.priority}) - always included`);
                    return true;
                }
                
                // For P1-P3 subjects, apply minimum hours threshold
                const included = subject.hours >= minHours;
                if (!included) {
                    console.log(`Filtered out ${subject.name} (P${subject.priority}): ${subject.hours.toFixed(2)}h < ${minHours}h minimum`);
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
