// Study Schedule App with Daily Hours Input
class StudySchedule {
    constructor() {
        this.days = [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
            'Friday', 'Saturday', 'Sunday'
        ];
        
        this.subjects = [
            'Mathematics', 'Science', 'English', 
            'Social Studies', 'Hindi', 'Computer'
        ];
        
        this.schedule = this.loadSchedule();
        this.init();
    }

    init() {
        this.renderHoursInputs();
        this.renderSchedule();
        this.attachEventListeners();
    }

    loadSchedule() {
        const saved = localStorage.getItem('sohamStudySchedule');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default schedule with 0 hours (will be set by user)
        return this.days.map(day => ({
            day,
            totalHours: 0,
            subjects: []
        }));
    }

    saveSchedule() {
        localStorage.setItem('sohamStudySchedule', JSON.stringify(this.schedule));
    }

    renderHoursInputs() {
        const container = document.getElementById('hoursInputContainer');
        
        container.innerHTML = this.days.map(day => {
            const dayData = this.schedule.find(d => d.day === day);
            return `
                <div class="hour-input-item">
                    <label for="${day}-hours">${day}:</label>
                    <input 
                        type="number" 
                        id="${day}-hours" 
                        class="hour-input"
                        min="0" 
                        max="24" 
                        step="0.5" 
                        value="${dayData.totalHours}"
                        placeholder="Enter hours"
                    >
                </div>
            `;
        }).join('');
    }

    renderSchedule() {
        const container = document.getElementById('scheduleContainer');
        const hasSchedule = this.schedule.some(day => day.subjects.length > 0);

        if (!hasSchedule) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>🎯 Set your daily study hours and generate your schedule!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.schedule.map(day => `
            <div class="day-card">
                <div class="day-header">
                    <span class="day-name">${day.day}</span>
                    <span class="total-hours">${day.totalHours} hrs</span>
                </div>
                <div class="subjects-list">
                    ${day.subjects.map(subject => `
                        <div class="subject-item">
                            <span class="subject-name">${subject.name}</span>
                            <span class="subject-hours">${subject.hours} hr${subject.hours !== 1 ? 's' : ''}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    renderSummary() {
        const container = document.getElementById('summaryContainer');
        const totalWeeklyHours = this.schedule.reduce((sum, day) => sum + day.totalHours, 0);
        const studyDays = this.schedule.filter(day => day.totalHours > 0).length;
        const averageDailyHours = studyDays > 0 ? (totalWeeklyHours / studyDays).toFixed(1) : 0;

        container.innerHTML = `
            <div class="summary-card">
                <div class="summary-value">${totalWeeklyHours}</div>
                <div class="summary-label">Total Weekly Hours</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">${studyDays}</div>
                <div class="summary-label">Study Days</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">${averageDailyHours}</div>
                <div class="summary-label">Avg Hours/Day</div>
            </div>
        `;
    }

    attachEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.updateHoursFromInputs();
            this.generateSchedule();
            this.renderSchedule();
            this.renderSummary();
            this.saveSchedule();
        });

        // Update hours when inputs change
        this.days.forEach(day => {
            const input = document.getElementById(`${day}-hours`);
            if (input) {
                input.addEventListener('change', () => {
                    this.updateHoursFromInputs();
                    this.saveSchedule();
                });
            }
        });
    }

    updateHoursFromInputs() {
        this.schedule = this.days.map(day => {
            const input = document.getElementById(`${day}-hours`);
            const totalHours = input ? parseFloat(input.value) || 0 : 0;
            
            const existingDay = this.schedule.find(d => d.day === day);
            return {
                day,
                totalHours,
                subjects: existingDay ? existingDay.subjects : []
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
        const availableSubjects = [...this.subjects];
        const distributed = [];
        let remainingHours = totalHours;

        // Ensure minimum 1 hour for important subjects first
        const prioritySubjects = ['Mathematics', 'Science', 'English'];
        
        // Assign priority subjects first with at least 1 hour
        prioritySubjects.forEach(subject => {
            if (availableSubjects.includes(subject) && remainingHours >= 1) {
                distributed.push({ name: subject, hours: 1 });
                availableSubjects.splice(availableSubjects.indexOf(subject), 1);
                remainingHours -= 1;
            }
        });

        // Distribute remaining hours among all subjects
        while (remainingHours > 0 && availableSubjects.length > 0) {
            const hoursPerSubject = Math.max(0.5, remainingHours / availableSubjects.length);
            
            availableSubjects.forEach(subject => {
                if (remainingHours >= 0.5) {
                    const hours = Math.min(hoursPerSubject, 2); // Max 2 hours per subject in one distribution
                    distributed.push({ name: subject, hours: this.roundToHalf(hours) });
                    remainingHours -= hours;
                }
            });
            
            // Break if we can't distribute more
            if (remainingHours < 0.5) break;
        }

        // Combine hours for same subjects
        const combined = [];
        distributed.forEach(item => {
            const existing = combined.find(i => i.name === item.name);
            if (existing) {
                existing.hours += item.hours;
            } else {
                combined.push({ ...item });
            }
        });

        // Round to nearest 0.5 and ensure total matches
        let finalTotal = 0;
        combined.forEach(item => {
            item.hours = this.roundToHalf(item.hours);
            finalTotal += item.hours;
        });

        // Adjust for rounding differences
        if (finalTotal !== totalHours) {
            const diff = totalHours - finalTotal;
            if (combined.length > 0 && Math.abs(diff) >= 0.5) {
                combined[0].hours = this.roundToHalf(combined[0].hours + diff);
            }
        }

        return combined.sort((a, b) => b.hours - a.hours);
    }

    roundToHalf(num) {
        return Math.round(num * 2) / 2;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudySchedule();
});
