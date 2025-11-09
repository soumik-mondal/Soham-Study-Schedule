// Enhanced Study Schedule App with Date Range and Priority
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
        
        this.init();
    }

    init() {
        console.log('Initializing Study Schedule App...');
        console.log('Subjects:', this.subjects);
        
        // Load data after subjects are defined
        this.schedule = this.loadSchedule();
        this.subjectPriorities = this.loadPriorities();
        
        this.setDefaultDates();
        this.renderPriorityInputs();
        this.attachEventListeners();
        this.setupPrintFunctionality();
        
        // Auto-generate days on load
        this.generateDaysFromRange();
    }

    setDefaultDates() {
        try {
            const today = new Date();
            const startDate = new Date(today);
            const endDate = new Date(today);
            endDate.setDate(today.getDate() + 6); // Default 1 week
            
            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');
            
            if (startDateInput && endDateInput) {
                startDateInput.valueAsDate = startDate;
                endDateInput.valueAsDate = endDate;
            }
        } catch (error) {
            console.error('Error setting default dates:', error);
        }
    }

    loadSchedule() {
        try {
            const saved = localStorage.getItem('sohamStudySchedule');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading schedule:', error);
            return [];
        }
    }

    loadPriorities() {
        try {
            const saved = localStorage.getItem('sohamSubjectPriorities');
            if (saved) {
                const loadedPriorities = JSON.parse(saved);
                // Create fresh priorities object with current subjects
                const cleanedPriorities = {};
                this.subjects.forEach(subject => {
                    cleanedPriorities[subject] = loadedPriorities[subject] || this.getDefaultPriority(subject);
                });
                return cleanedPriorities;
            }
        } catch (error) {
            console.error('Error loading priorities:', error);
        }
        
        // Return default priorities if no saved data or error
        return this.getDefaultPriorities();
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

    getDefaultPriority(subject) {
        const defaultPriorities = this.getDefaultPriorities();
        return defaultPriorities[subject] || 3;
    }

    saveSchedule() {
        try {
            localStorage.setItem('sohamStudySchedule', JSON.stringify(this.schedule));
        } catch (error) {
            console.error('Error saving schedule:', error);
        }
    }

    savePriorities() {
        try {
            localStorage.setItem('sohamSubjectPriorities', JSON.stringify(this.subjectPriorities));
        } catch (error) {
            console.error('Error saving priorities:', error);
        }
    }

    renderPriorityInputs() {
        const container = document.getElementById('priorityContainer');
        if (!container) {
            console.error('Priority container not found!');
            return;
        }

        console.log('Rendering priority inputs for subjects:', this.subjects);
        
        // Clear container
        container.innerHTML = '';
        
        // Render each subject
        this.subjects.forEach(subject => {
            const priority = this.subjectPriorities[subject] || this.getDefaultPriority(subject);
            const subjectId = subject.replace(/[&\s]+/g, '-');
            
            const priorityItem = document.createElement('div');
            priorityItem.className = 'priority-item';
            priorityItem.innerHTML = `
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
            `;
            
            container.appendChild(priorityItem);
        });
        
        // Re-attach event listeners
        this.attachPriorityEventListeners();
        console.log('Priority inputs rendered successfully');
    }

    renderHoursInputs(days) {
        const container = document.getElementById('hoursInputContainer');
        if (!container) return;
        
        if (!days || days.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Set date range first to generate days</p></div>';
            const generateBtn = document.getElementById('generateScheduleBtn');
            if (generateBtn) generateBtn.disabled = true;
            return;
        }

        let html = '';
        days.forEach(day => {
            const existingDay = this.schedule.find(d => d.date === day.date);
            const totalHours = existingDay ? existingDay.totalHours : 0;
            
            html += `
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
        });

        container.innerHTML = html;

        // Enable generate button
        const generateBtn = document.getElementById('generateScheduleBtn');
        if (generateBtn) generateBtn.disabled = false;
    }

    renderSchedule() {
        const container = document.getElementById('scheduleContainer');
        if (!container) return;
        
        const hasSchedule = this.schedule && this.schedule.some(day => day.subjects && day.subjects.length > 0);

        if (!hasSchedule) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Generate schedule to see your study plan</p>
                </div>
            `;
            return;
        }

        let html = '';
        this.schedule.forEach(day => {
            html += `
                <div class="day-card">
                    <div class="day-header">
                        <div>
                            <div class="day-name">${day.name}</div>
                            <div class="day-date">${day.displayDate}</div>
                        </div>
                        <span class="total-hours">${day.totalHours} hrs</span>
                    </div>
                    <div class="subjects-list">
            `;
            
            if (day.subjects && day.subjects.length > 0) {
                day.subjects.forEach(subject => {
                    html += `
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
                    `;
                });
            } else {
                html += `<div class="empty-state"><p>No subjects scheduled</p></div>`;
            }
            
            html += `
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderSummary() {
        const container = document.getElementById('summaryContainer');
        if (!container) return;
        
        if (!this.schedule || this.schedule.length === 0) {
            container.innerHTML = `
                <div class="summary-card">
                    <div class="summary-value">0</div>
                    <div class="summary-label">Total Study Hours</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">0</div>
                    <div class="summary-label">Study Days</div>
                </div>
                <div class="summary-card">
                    <div class="summary-value">0</div>
                    <div class="summary-label">Subjects</div>
                </div>
            `;
            return;
        }

        const totalStudyHours = this.schedule.reduce((sum, day) => sum + (day.totalHours || 0), 0);
        const studyDays = this.schedule.filter(day => day.totalHours > 0).length;
        const totalSubjects = new Set(this.schedule.flatMap(day => (day.subjects || []).map(s => s.name))).size;

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
        console.log('Attaching event listeners...');
        
        // Generate days based on date range
        const generateDaysBtn = document.getElementById('generateDaysBtn');
        if (generateDaysBtn) {
            generateDaysBtn.addEventListener('click', () => {
                this.generateDaysFromRange();
            });
        }

        // Generate schedule
        const generateScheduleBtn = document.getElementById('generateScheduleBtn');
        if (generateScheduleBtn) {
            generateScheduleBtn.addEventListener('click', () => {
                this.updateHoursFromInputs();
                this.generateSchedule();
                this.renderSchedule();
                this.renderSummary();
                this.saveSchedule();
            });
        }

        // Auto-generate days when dates change
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) {
            startDateInput.addEventListener('change', () => {
                this.generateDaysFromRange();
            });
        }
        
        if (endDateInput) {
            endDateInput.addEventListener('change', () => {
                this.generateDaysFromRange();
            });
        }

        console.log('Event listeners attached successfully');
    }

    attachPriorityEventListeners() {
        const priorityInputs = document.querySelectorAll('.priority-input');
        console.log('Found priority inputs:', priorityInputs.length);
        
        priorityInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const subject = e.target.dataset.subject;
                const priority = parseInt(e.target.value);
                this.subjectPriorities[subject] = priority;
                this.savePriorities();
                
                // Update the badge
                const label = e.target.previousElementSibling;
                if (label) {
                    const badge = label.querySelector('.priority-badge');
                    if (badge) {
                        badge.className = `priority-badge priority-${priority}`;
                        badge.textContent = `P${priority}`;
                    }
                }
            });
        });
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
        console.log('Generating days from range...');
        
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (!startDateInput || !endDateInput) {
            console.error('Date inputs not found');
            return;
        }
        
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        if (!startDateInput.value || !endDateInput.value || startDate > endDate) {
            alert('Please select a valid date range');
            return;
        }

        const days = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            const dateString = this.formatDate(currentDate);
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

        console.log('Generated days:', days);
        this.schedule = days;
        this.renderHoursInputs(days);
        this.renderSchedule();
        this.renderSummary();
        this.saveSchedule();
    }

    updateHoursFromInputs() {
        const hourInputs = document.querySelectorAll('.hour-input');
        
        this.schedule = this.schedule.map(day => {
            const input = document.getElementById(`hours-${day.date}`);
            const totalHours = input ? parseFloat(input.value) || 0 : 0;
            
            return {
                ...day,
                totalHours
            };
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
        // Create subject list with priorities
        const subjectList = this.subjects.map(subject => ({
            name: subject,
            priority: this.subjectPriorities[subject] || this.getDefaultPriority(subject),
            hours: 0
        })).filter(subject => subject.priority > 0);

        // Sort by priority (highest first)
        subjectList.sort((a, b) => b.priority - a.priority);

        let remainingHours = totalHours;
        console.log('Initial remaining hours:', remainingHours);

        // Phase 1: Assign base hours to all subjects based on priority
        const baseHours = {
            5: 1.5, // Priority 5: 1.5 hours base
            4: 1.5, // Priority 4: 1.5 hours base  
            3: 1.5, // Priority 3: 1.5 hours base
            2: 1.0, // Priority 2: 1.0 hours base
            1: 1.0  // Priority 1: 1.0 hours base
        };

        // Assign base hours to each subject
        subjectList.forEach(subject => {
            const base = baseHours[subject.priority] || 1.0;
            if (remainingHours >= base) {
                subject.hours = base;
                remainingHours -= base;
                console.log(`Assigned ${base} base hours to ${subject.name} (P${subject.priority}), remaining: ${remainingHours}`);
            }
        });

        // Phase 2: Distribute remaining hours by priority weight
        if (remainingHours > 0) {
            const totalPriority = subjectList.reduce((sum, s) => sum + s.priority, 0);
            console.log('Total priority score for distribution:', totalPriority);
            
            subjectList.forEach(subject => {
                if (remainingHours <= 0) return;

                const priorityWeight = subject.priority / totalPriority;
                let allocatedHours = priorityWeight * remainingHours;
                
                allocatedHours = this.roundToHalf(allocatedHours);
                allocatedHours = Math.min(allocatedHours, remainingHours);

                if (allocatedHours >= 0.5) {
                    subject.hours += allocatedHours;
                    remainingHours -= allocatedHours;
                    console.log(`Added ${allocatedHours} hours to ${subject.name}, remaining: ${remainingHours}`);
                }
            });
        }

        // Phase 3: Final adjustment
        let finalTotal = subjectList.reduce((sum, s) => sum + s.hours, 0);
        console.log(`Final total before adjustment: ${finalTotal}, Target: ${totalHours}`);
        
        if (Math.abs(finalTotal - totalHours) > 0.1) {
            const diff = totalHours - finalTotal;
            const subjectToAdjust = subjectList.find(s => s.hours > 0);
            if (subjectToAdjust && Math.abs(diff) >= 0.5) {
                subjectToAdjust.hours = this.roundToHalf(subjectToAdjust.hours + diff);
                console.log(`Adjusted ${subjectToAdjust.name} by ${diff} hours`);
            }
        }

        // Final calculation
        finalTotal = subjectList.reduce((sum, s) => sum + s.hours, 0);
        console.log(`Final total after adjustment: ${finalTotal}, Target: ${totalHours}`);

        // Return all subjects with at least 1 hour
        const finalSubjects = subjectList
            .filter(subject => subject.hours >= 1.0)
            .map(subject => ({
                name: subject.name,
                priority: subject.priority,
                hours: this.roundToHalf(subject.hours)
            }))
            .sort((a, b) => b.priority - a.priority || b.hours - a.hours);

        console.log('Final distributed subjects:', finalSubjects);
        
        // Log if any subjects were excluded
        const excludedSubjects = subjectList.filter(s => s.hours < 1.0);
        if (excludedSubjects.length > 0) {
            console.log('Excluded subjects (less than 1 hour):', excludedSubjects);
        }
        
        return finalSubjects;
    }

    roundToHalf(num) {
        return Math.round(num * 2) / 2;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    printSchedule() {
        const hasSchedule = this.schedule && this.schedule.some(day => day.subjects && day.subjects.length > 0);
        
        if (!hasSchedule) {
            alert('Please generate a schedule first before printing.');
            return;
        }
        
        // Create a print-friendly version
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

    // Helper methods for printing
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
        
        const totalStudyHours = this.schedule.reduce((sum, day) => sum + (day.totalHours || 0), 0);
        const studyDays = this.schedule.filter(day => day.totalHours > 0).length;
        const totalSubjects = new Set(this.schedule.flatMap(day => (day.subjects || []).map(s => s.name))).size;
        
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
