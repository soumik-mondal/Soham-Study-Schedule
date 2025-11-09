// Enhanced Study Schedule App with Date Range and Priority
class StudySchedule {
    constructor() {
        this.subjects = [
            'Math', 'Physics', 'Chemistry', 'Biology', 
            'AI & Robotics', 'History', 'Geography', 
            'English Lit', 'English Lang', 'Bengali'
        ];
        
        this.schedule = this.loadSchedule();
        this.subjectPriorities = this.loadPriorities();
        this.init();
    }

    init() {
        this.setDefaultDates();
        this.renderPriorityInputs();
        this.attachEventListeners();
        
        // Auto-generate days on load
        this.generateDaysFromRange();
    }

    setDefaultDates() {
        const today = new Date();
        const startDate = new Date(today);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 6); // Default 1 week
        
        document.getElementById('startDate').valueAsDate = startDate;
        document.getElementById('endDate').valueAsDate = endDate;
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
        
        // Default priorities for the new subjects
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
        
        // Re-attach event listeners after rendering
        this.attachPriorityEventListeners();
    }

    renderHoursInputs(days) {
        const container = document.getElementById('hoursInputContainer');
        
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

        // Enable generate button
        document.getElementById('generateScheduleBtn').disabled = false;
    }

    renderSchedule() {
        const container = document.getElementById('scheduleContainer');
        const hasSchedule = this.schedule && this.schedule.some(day => day.subjects && day.subjects.length > 0);

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
        document.getElementById('generateDaysBtn').addEventListener('click', () => {
            console.log('Generate Days button clicked');
            this.generateDaysFromRange();
        });

        // Generate schedule
        document.getElementById('generateScheduleBtn').addEventListener('click', () => {
            console.log('Generate Schedule button clicked');
            this.updateHoursFromInputs();
            this.generateSchedule();
            this.renderSchedule();
            this.renderSummary();
            this.saveSchedule();
        });

        // Auto-generate days when dates change
        document.getElementById('startDate').addEventListener('change', () => {
            this.generateDaysFromRange();
        });
        
        document.getElementById('endDate').addEventListener('change', () => {
            this.generateDaysFromRange();
        });

        // Attach priority listeners
        this.attachPriorityEventListeners();
    }

    attachPriorityEventListeners() {
        // Priority changes
        document.querySelectorAll('.priority-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const subject = e.target.dataset.subject;
                const priority = parseInt(e.target.value);
                this.subjectPriorities[subject] = priority;
                this.savePriorities();
                // Update the badge without re-rendering everything
                const badge = e.target.previousElementSibling.querySelector('.priority-badge');
                if (badge) {
                    badge.className = `priority-badge priority-${priority}`;
                    badge.textContent = `P${priority}`;
                }
            });
        });
    }

    generateDaysFromRange() {
        console.log('Generating days from range...');
        
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        console.log('Start date:', startDate);
        console.log('End date:', endDate);

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
        console.log('Updating hours from inputs...');
        
        const hourInputs = document.querySelectorAll('.hour-input');
        console.log('Found hour inputs:', hourInputs.length);
        
        this.schedule = this.schedule.map(day => {
            const input = document.getElementById(`hours-${day.date}`);
            const totalHours = input ? parseFloat(input.value) || 0 : 0;
            
            return {
                ...day,
                totalHours
            };
        });
        
        console.log('Updated schedule:', this.schedule);
    }

    generateSchedule() {
        console.log('Generating schedule...');
        
        this.schedule = this.schedule.map(day => {
            if (day.totalHours <= 0) {
                return { ...day, subjects: [] };
            }

            const distributedSubjects = this.distributeSubjects(day.totalHours);
            return { ...day, subjects: distributedSubjects };
        });
        
        console.log('Generated schedule:', this.schedule);
    }

    distributeSubjects(totalHours) {
        console.log(`Distributing ${totalHours} hours among subjects`);
        
        // Create subject list with priorities
        const subjectList = this.subjects.map(subject => ({
            name: subject,
            priority: this.subjectPriorities[subject] || 3,
            hours: 0
        })).filter(subject => subject.priority > 0);

        // Sort by priority (highest first)
        subjectList.sort((a, b) => b.priority - a.priority);

        let remainingHours = totalHours;
        console.log('Initial remaining hours:', remainingHours);

        // Phase 1: Assign minimum 1.5 hours to high priority subjects first
        const highPrioritySubjects = subjectList.filter(s => s.priority >= 4);
        console.log('High priority subjects:', highPrioritySubjects);
        
        for (const subject of highPrioritySubjects) {
            if (remainingHours >= 1.5) {
                subject.hours = 1.5;
                remainingHours -= 1.5;
                console.log(`Assigned 1.5 hours to ${subject.name}, remaining: ${remainingHours}`);
            }
        }

        // Phase 2: Distribute remaining hours based on priority
        const totalPriority = subjectList.reduce((sum, s) => sum + s.priority, 0);
        console.log('Total priority score:', totalPriority);
        
        subjectList.forEach(subject => {
            if (remainingHours <= 0) return;

            const priorityWeight = subject.priority / totalPriority;
            let allocatedHours = priorityWeight * remainingHours;

            // Ensure minimum 1.5 hours for subjects that don't have it yet
            if (subject.hours === 0 && allocatedHours < 1.5 && remainingHours >= 1.5) {
                allocatedHours = 1.5;
            }

            // Only allocate if we have meaningful hours
            if (allocatedHours >= 1.5) {
                allocatedHours = this.roundToHalf(allocatedHours);
                allocatedHours = Math.min(allocatedHours, remainingHours);
                
                subject.hours += allocatedHours;
                remainingHours -= allocatedHours;
                console.log(`Assigned ${allocatedHours} hours to ${subject.name}, remaining: ${remainingHours}`);
            }
        });

        // Phase 3: Distribute any small remaining hours to existing subjects
        if (remainingHours > 0) {
            console.log(`Distributing remaining ${remainingHours} hours`);
            const subjectsWithHours = subjectList.filter(s => s.hours > 0);
            if (subjectsWithHours.length > 0) {
                const extraPerSubject = this.roundToHalf(remainingHours / subjectsWithHours.length);
                subjectsWithHours.forEach(subject => {
                    if (remainingHours >= 0.5) {
                        subject.hours += extraPerSubject;
                        remainingHours -= extraPerSubject;
                        console.log(`Added ${extraPerSubject} hours to ${subject.name}, remaining: ${remainingHours}`);
                    }
                });
            }
        }

        // Final adjustment to ensure total matches
        let finalTotal = subjectList.reduce((sum, s) => sum + s.hours, 0);
        console.log(`Final total: ${finalTotal}, Target: ${totalHours}`);
        
        if (Math.abs(finalTotal - totalHours) > 0.1) {
            const diff = totalHours - finalTotal;
            const subjectToAdjust = subjectList.find(s => s.hours > 0);
            if (subjectToAdjust) {
                subjectToAdjust.hours = this.roundToHalf(subjectToAdjust.hours + diff);
                console.log(`Adjusted ${subjectToAdjust.name} by ${diff} hours`);
            }
        }

        // Filter out subjects with 0 hours and ensure minimum 1.5 hours
        const finalSubjects = subjectList
            .filter(subject => subject.hours >= 1.5)
            .map(subject => ({
                name: subject.name,
                priority: subject.priority,
                hours: this.roundToHalf(subject.hours)
            }))
            .sort((a, b) => b.priority - a.priority || b.hours - a.hours);

        console.log('Final distributed subjects:', finalSubjects);
        return finalSubjects;
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
    console.log('DOM loaded, initializing app...');
    new StudySchedule();
});
