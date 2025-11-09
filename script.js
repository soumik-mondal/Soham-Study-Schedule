// Enhanced Study Schedule App with Date Range and Priority
class StudySchedule {
    constructor() {
        this.subjects = [
            'Mathematics', 'Science', 'English', 
            'Social Studies', 'Hindi', 'Computer',
            'Bengali', 'Physics', 'Chemistry', 'Biology'
        ];
        
        this.schedule = this.loadSchedule();
        this.subjectPriorities = this.loadPriorities();
        this.init();
    }

    init() {
        this.setDefaultDates();
        this.renderPriorityInputs();
        this.attachEventListeners();
    }

    setDefaultDates() {
        const today = new Date();
        const startDate = new Date(today);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 6); // Default 1 week
        
        document.getElementById('startDate').value = this.formatDate(startDate);
        document.getElementById('endDate').value = this.formatDate(endDate);
    }

    loadSchedule() {
        const saved = localStorage.getItem('sohamStudySchedule');
        return saved ? JSON.parse(saved) : [];
    }

    loadPriorities() {
        const saved = localStorage.getItem('sohamSubjectPriorities');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default priorities
        return {
            'Mathematics': 5,
            'Science': 5,
            'English': 4,
            'Physics': 4,
            'Chemistry': 4,
            'Biology': 4,
            'Computer': 3,
            'Social Studies': 3,
            'Hindi': 2,
            'Bengali': 1
        };
    }

    saveSchedule() {
        localStorage.setItem('sohamStudySchedule', JSON.stringify(this.schedule));
    }

    savePriorities() {
        localStorage.setItem('sohamSubjectPriorities', JSON.stringify(this.subjectPriorities));
    }

    renderPriorityInputs() {
        const container = document.getElementById('priorityContainer');
        
        container.innerHTML = this.subjects.map(subject => {
            const priority = this.subjectPriorities[subject] || 3;
            return `
                <div class="priority-item">
                    <label for="priority-${subject}">
                        ${subject} 
                        <span class="priority-badge priority-${priority}">P${priority}</span>
                    </label>
                    <select id="priority-${subject}" class="priority-input" data-subject="${subject}">
                        ${[1, 2, 3, 4, 5].map(p => 
                            `<option value="${p}" ${p === priority ? 'selected' : ''}>Priority ${p}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
        }).join('');
    }

    renderHoursInputs(days) {
        const container = document.getElementById('hoursInputContainer');
        
        if (!days || days.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Set date range first to generate days</p></div>';
            return;
        }

        container.innerHTML = days.map(day => {
            const existingDay = this.schedule.find(d => d.date === day.date);
            const totalHours = existingDay ? existingDay.totalHours : 0;
            
            return `
                <div class="hour-input-item">
                    <label for="hours-${day.date}">
                        ${day.name} (${day.date})
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

        // Enable generate button if we have days
        document.getElementById('generateScheduleBtn').disabled = days.length === 0;
    }

    renderSchedule() {
        const container = document.getElementById('scheduleContainer');
        const hasSchedule = this.schedule.some(day => day.subjects.length > 0);

        if (!hasSchedule) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Generate schedule to see your study plan</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.schedule.map(day => `
            <div class="day-card">
                <div class="day-header">
                    <div>
                        <div class="day-name">${day.name}</div>
                        <div class="day-date">${day.date}</div>
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
        const totalStudyHours = this.schedule.reduce((sum, day) => sum + day.totalHours, 0);
        const studyDays = this.schedule.filter(day => day.totalHours > 0).length;
        const totalSubjects = new Set(this.schedule.flatMap(day => day.subjects.map(s => s.name))).size;

        container.innerHTML = `
            <div class="summary-card">
                <div class="summary-value">${totalStudyHours}</div>
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
        // Generate days based on date range
        document.getElementById('generateDaysBtn').addEventListener('click', () => {
            this.generateDaysFromRange();
        });

        // Generate schedule
        document.getElementById('generateScheduleBtn').addEventListener('click', () => {
            this.updateHoursFromInputs();
            this.generateSchedule();
            this.renderSchedule();
            this.renderSummary();
            this.saveSchedule();
        });

        // Priority changes
        document.querySelectorAll('.priority-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const subject = e.target.dataset.subject;
                const priority = parseInt(e.target.value);
                this.subjectPriorities[subject] = priority;
                this.savePriorities();
                this.renderPriorityInputs(); // Refresh to show updated badges
            });
        });

        // Auto-save hour changes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('hour-input')) {
                this.updateHoursFromInputs();
                this.saveSchedule();
            }
        });
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
            days.push({
                name: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
                date: this.formatDate(currentDate),
                totalHours: 0,
                subjects: []
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

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
            priority: this.subjectPriorities[subject] || 3,
            hours: 0
        })).filter(subject => subject.priority > 0); // Only include subjects with priority > 0

        // Sort by priority (highest first)
        subjectList.sort((a, b) => b.priority - a.priority);

        let remainingHours = totalHours;

        // Phase 1: Assign minimum 1.5 hours to high priority subjects first
        const highPrioritySubjects = subjectList.filter(s => s.priority >= 4);
        for (const subject of highPrioritySubjects) {
            if (remainingHours >= 1.5) {
                subject.hours = 1.5;
                remainingHours -= 1.5;
            }
        }

        // Phase 2: Distribute remaining hours based on priority
        const totalPriority = subjectList.reduce((sum, s) => sum + s.priority, 0);
        
        subjectList.forEach(subject => {
            if (remainingHours <= 0) return;

            const priorityWeight = subject.priority / totalPriority;
            let allocatedHours = priorityWeight * remainingHours;

            // Ensure minimum 1.5 hours for subjects that don't have it yet
            if (subject.hours === 0 && allocatedHours < 1.5 && remainingHours >= 1.5) {
                allocatedHours = 1.5;
            }

            // Round to nearest 0.5 and ensure we don't exceed remaining hours
            allocatedHours = Math.min(allocatedHours, remainingHours);
            allocatedHours = this.roundToHalf(allocatedHours);

            if (allocatedHours >= 1.5) {
                subject.hours += allocatedHours;
                remainingHours -= allocatedHours;
            }
        });

        // Phase 3: Distribute any small remaining hours
        if (remainingHours > 0) {
            const subjectsWithHours = subjectList.filter(s => s.hours > 0);
            if (subjectsWithHours.length > 0) {
                const extraPerSubject = this.roundToHalf(remainingHours / subjectsWithHours.length);
                subjectsWithHours.forEach(subject => {
                    if (remainingHours >= 0.5) {
                        subject.hours += extraPerSubject;
                        remainingHours -= extraPerSubject;
                    }
                });
            }
        }

        // Final adjustment to ensure total matches
        let finalTotal = subjectList.reduce((sum, s) => sum + s.hours, 0);
        if (Math.abs(finalTotal - totalHours) > 0.1) {
            const diff = totalHours - finalTotal;
            const subjectToAdjust = subjectList.find(s => s.hours > 0);
            if (subjectToAdjust) {
                subjectToAdjust.hours = this.roundToHalf(subjectToAdjust.hours + diff);
            }
        }

        // Filter out subjects with 0 hours and ensure minimum 1.5 hours
        return subjectList
            .filter(subject => subject.hours >= 1.5)
            .map(subject => ({
                name: subject.name,
                priority: subject.priority,
                hours: this.roundToHalf(subject.hours)
            }))
            .sort((a, b) => b.priority - a.priority || b.hours - a.hours);
    }

    roundToHalf(num) {
        return Math.round(num * 2) / 2;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudySchedule();
});
