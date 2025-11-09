// Study Schedule App
class StudySchedule {
    constructor() {
        this.subjects = [
            'Math', 'Physics', 'Chemistry', 'Biology', 
            'AI & Robotics', 'History', 'Geography', 
            'English Lit', 'English Lang', 'Bengali'
        ];
        
        this.schedule = [];
        this.subjectPriorities = {};
        
        this.init();
    }

    init() {
        console.log('Initializing Study Schedule App...');
        
        this.loadData();
        this.setDefaultDates();
        this.renderPriorityInputs();
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

    setDefaultDates() {
        const today = new Date();
        const startDate = new Date(today);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 6);
        
        document.getElementById('startDate').valueAsDate = startDate;
        document.getElementById('endDate').valueAsDate = endDate;
    }

    saveData() {
        localStorage.setItem('sohamStudySchedule', JSON.stringify(this.schedule));
        localStorage.setItem('sohamSubjectPriorities', JSON.stringify(this.subjectPriorities));
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

    setupPrintFunctionality() {
        document.getElementById('printBtn').addEventListener('click', () => {
            this.printSchedule();
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

        // Assign base hours based on priority
        const baseHours = {5: 1.5, 4: 1.5, 3: 1.5, 2: 1.0, 1: 1.0};
        
        subjectList.forEach(subject => {
            const base = baseHours[subject.priority] || 1.0;
            if (remainingHours >= base) {
                subject.hours = base;
                remainingHours -= base;
            }
        });

        // Distribute remaining hours by priority weight
        if (remainingHours > 0) {
            const totalPriority = subjectList.reduce((sum, s) => sum + s.priority, 0);
            
            subjectList.forEach(subject => {
                if (remainingHours <= 0) return;
                const priorityWeight = subject.priority / totalPriority;
                let allocatedHours = this.roundToHalf(priorityWeight * remainingHours);
                allocatedHours = Math.min(allocatedHours, remainingHours);

                if (allocatedHours >= 0.5) {
                    subject.hours += allocatedHours;
                    remainingHours -= allocatedHours;
                }
            });
        }

        // Final adjustment
        let finalTotal = subjectList.reduce((sum, s) => sum + s.hours, 0);
        if (Math.abs(finalTotal - totalHours) > 0.1) {
            const diff = totalHours - finalTotal;
            const subjectToAdjust = subjectList.find(s => s.hours > 0);
            if (subjectToAdjust) {
                subjectToAdjust.hours = this.roundToHalf(subjectToAdjust.hours + diff);
            }
        }

        return subjectList
            .filter(subject => subject.hours >= 1.0)
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

    printSchedule() {
        const hasSchedule = this.schedule.some(day => day.subjects.length > 0);
        if (!hasSchedule) {
            alert('Please generate a schedule first before printing.');
            return;
        }
        
        window.print();
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new StudySchedule();
});
