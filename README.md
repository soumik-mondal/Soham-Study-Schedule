# Soham's Study Schedule App

A comprehensive web-based study schedule planner for creating personalized daily study plans based on subject priorities and available time.

## Live Demo
🌐 **Live App**: [https://soumik-mondal.github.io/Soham-Study-Schedule/](https://soumik-mondal.github.io/Soham-Study-Schedule/)

---

## Features Overview

### 📅 Date Range Selection
- Set custom start and end dates for your study period
- Automatic calendar generation for selected date range
- Visual indicators for weekdays vs weekends
- Default 7-day planning period

### 🎯 Subject Priority Management
- 10 Subjects: Math, Physics, Chemistry, Biology, AI & Robotics, History, Geography, English Lit, English Lang, Bengali
- Priority Levels: 0 (Exclude) to 5 (Highest)
- Color-coded priority badges
- Real-time priority updates

### ⚙️ Smart Configuration
**Base Hours by Priority**
- Configure study hours for each priority level
- 0.5-hour increments
- Priority 0 automatically set to 0 hours

**Advanced Settings**
- Minimum Hours to Include: Filter subjects below threshold
- Rounding Options: 0.25h, 0.5h, or 1h
- Distribution Methods:
  - **Priority Weighted**: Hours distributed by priority ratio
  - **Equal Distribution**: Equal hours among all subjects
  - **High Priority First**: Highest priority subjects allocated first

### ⏰ Daily Study Hours
- Set study hours for each day (0-24 hours)
- Bulk edit options (All Days, Weekdays only, Weekends only)
- Smart defaults: 4 hours for weekdays, 6 hours for weekends
- Real-time totals and averages

### 📊 Intelligent Schedule Generation
- Three distribution algorithms
- Automatic rounding to selected increment
- Minimum hours filtering
- Total hour matching
- **Critical Feature**: Subjects with priority 0 NEVER appear in the schedule

### 📋 Schedule Display
- Daily study cards with all subjects and hours
- Priority badges for each subject
- Responsive card layout
- Color-coded by priority level

### 📈 Study Summary
- Total study hours across all days
- Number of study days
- Number of subjects included
- Visual summary cards

### 🖨️ Print Functionality
- Printer-friendly formatted output
- Date range included
- Summary section
- Proper page breaks

### 💾 Data Persistence
- Auto-saves all data to browser storage
- Persists schedule, priorities, and configuration
- Automatic reload on page refresh
- Robust error handling

### 📱 Progressive Web App (PWA)
- Works offline with service worker
- Installable on mobile devices
- Responsive design (mobile, tablet, desktop)
- Touch-friendly interface
- App manifest for installability

---

## Technical Details

### Architecture
- **Structure**: ES6 Class-based (StudySchedule)
- **Storage**: Browser LocalStorage
- **Offline**: Service Worker caching
- **Responsive**: Mobile-first CSS Grid
- **Compatible**: All modern browsers

### Files
- `index.html` - Semantic HTML structure
- `script.js` - Core application logic (1200+ lines)
- `style.css` - Responsive styling (900+ lines)
- `manifest.json` - PWA configuration
- `service-worker.js` - Offline support
- `FEATURES_CHECKLIST.md` - Complete feature list
- `IMPLEMENTATION_SUMMARY.md` - Implementation details

### Browser Support
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## How to Use

### Quick Start
1. **Set Study Period**: Select start and end dates
2. **Click Generate Days**: Creates calendar for your period
3. **Configure Settings**: Set base hours and distribution method
4. **Set Priorities**: Assign priority levels to each subject
5. **Input Daily Hours**: Set study hours for each day
6. **Generate Schedule**: Creates your personalized plan
7. **View & Print**: See your schedule or print it out

### Example Workflow
```
📅 Date Range: Dec 25 - Dec 31, 2025
🎯 Priorities: Math (P5), Physics (P5), Chemistry (P5), Biology (P5)
⚙️ Config: Priority Weighted, Min 1h, Round 0.5h
⏰ Daily: Weekday 4h, Weekend 6h
📊 Result: Personalized schedule optimized for your priorities
```

### Understanding Priority 0
- Priority 0 means "Exclude this subject"
- These subjects will NEVER appear in the generated schedule
- Useful for subjects you don't need to study
- Default priority is shown per subject

---

## Distribution Methods Explained

### Priority Weighted Distribution
Allocates remaining hours based on each subject's priority level.
```
Example: 10 remaining hours, 4 subjects
- Math (P5): 5 hours
- Physics (P4): 4 hours
- Chemistry (P3): 1 hour
```

### Equal Distribution
Distributes remaining hours equally among all included subjects.
```
Example: 10 remaining hours, 5 subjects
- Each subject gets 2 hours
```

### High Priority First
Allocates all hours to highest priority subjects first, then moves to lower priorities.
```
Example: 10 remaining hours
- Math (P5): Gets filled first
- Physics (P4): Gets remaining hours
```

---

## Keyboard Shortcuts & Tips

### Tips for Best Results
- Set realistic daily study hours (4-6 is typical)
- Use Priority Weighted for balanced schedules
- Use High Priority First for focused prep
- Adjust minimum hours to filter out small allocations
- Print for a physical reference

### Console Access
Press F12 to open developer console and see:
- Initialization logs
- Data loading confirmation
- Schedule generation steps
- Detailed algorithm information
- Validation messages

---

## Data Storage

Your data is stored locally in your browser:
- `sohamStudySchedule` - Your daily schedule
- `sohamSubjectPriorities` - Subject priority levels
- `sohamStudyConfig` - Your configuration settings

**Reset Everything** (if needed):
1. Open Console (F12)
2. Paste: `localStorage.clear(); location.reload();`
3. Press Enter

---

## Features Checklist

- ✅ Date range selection
- ✅ Calendar generation
- ✅ 10 fixed subjects
- ✅ Priority levels (0-5)
- ✅ Base hours configuration
- ✅ Three distribution methods
- ✅ Advanced settings
- ✅ Daily hours input
- ✅ Bulk edit tools
- ✅ Smart schedule generation
- ✅ Schedule display
- ✅ Study summary
- ✅ Print functionality
- ✅ Data persistence
- ✅ PWA offline support
- ✅ Responsive design
- ✅ Debug logging

---

## Installation & Setup

### Online
Simply visit: [https://soumik-mondal.github.io/Soham-Study-Schedule/](https://soumik-mondal.github.io/Soham-Study-Schedule/)

### Install as App
1. Visit the live link
2. Click install button in browser address bar
3. Or go to menu → Install app
4. Works offline once installed

### Local Setup
1. Clone the repository
2. Serve with local web server (required for service worker)
3. Open `index.html` in your browser

---

## Version History

### v1.0 (December 2025) - Complete Release ✅
- All 10 core features implemented
- Three distribution algorithms
- Complete schedule generation
- Data persistence
- PWA functionality
- Comprehensive testing
- Debug logging

---

## Support & Troubleshooting

### Common Questions

**Q: Can I exclude subjects?**
A: Yes! Set priority to 0 for any subject to exclude it.

**Q: What if subjects don't add up to exactly my total hours?**
A: The system automatically adjusts the largest subject to match your total.

**Q: Can I use this offline?**
A: Yes! Once loaded, it works offline with service worker.

**Q: Where is my data stored?**
A: Locally in your browser's storage. Not sent to any server.

**Q: Can I use on mobile?**
A: Yes! Fully responsive and can be installed as an app.

### Still Having Issues?
1. Check the console (F12) for error messages
2. Try refreshing the page
3. Clear cache and reload
4. Check browser compatibility

---

## Credits
Made with ❤️ for Soham

---

## License
Free to use and modify

---

## Feedback & Suggestions
Have ideas to improve? Feel free to create an issue or suggest features!

---

## Key Requirements Met

✅ Date range selection with auto-generation
✅ 10 fixed subjects with priorities
✅ Priority levels 0-5 (0=exclude)
✅ Base hours configurable by priority
✅ Three distribution methods
✅ Advanced settings (min hours, rounding)
✅ Daily hours input with bulk edit
✅ Smart schedule generation algorithm
✅ Proper handling of priority 0 (NEVER appears)
✅ Schedule display with priorities
✅ Study summary statistics
✅ Print functionality
✅ Data persistence (LocalStorage)
✅ PWA with offline support
✅ Responsive design
✅ ES6 class-based architecture
✅ Event-driven updates
✅ Input validation
✅ Error handling
✅ Debug logging

---

**Status**: Production Ready ✅
**Last Updated**: December 26, 2025
