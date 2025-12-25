# Soham's Study Schedule - Quick Reference Guide

## 📚 Overview
A complete study schedule planner that creates personalized daily study plans based on subject priorities and available time.

---

## 🚀 Quick Start (5 minutes)

### Step 1: Set Your Study Period (1 min)
```
📅 Default: Today ± 6 days
→ Or: Click date inputs to pick your own
→ Then: Click "Generate Days"
```

### Step 2: (Optional) Configure Settings (1 min)
```
⚙️ Base Hours by Priority
   → Set hours for priorities 1-5
   → Priority 0 always stays 0 (excluded)

Advanced Settings
   → Min hours to include: 1.0
   → Round to: 0.5 hours
   → Distribution: Priority Weighted
```

### Step 3: Set Subject Priorities (1 min)
```
🎯 Choose 1-5 for each subject (or 0 to exclude)
   Math (5)
   Physics (5)
   Chemistry (5)
   Biology (5)
   AI & Robotics (4)
   English Language (4)
   History (3)
   Geography (3)
   English Lit (3)
   Bengali (2)
```

### Step 4: Input Study Hours (1 min)
```
⏰ Set hours per day
   → Use bulk edit buttons for quick setup
   → Or manually enter for each day
   
Quick Buttons:
   "Apply to All" → All days same
   "Apply to Weekdays" → Mon-Fri
   "Apply to Weekends" → Sat-Sun
```

### Step 5: Generate & View (1 min)
```
📊 Click "Generate Schedule"
   ↓
   Your personalized study plan appears
   ↓
   Click "Print Schedule" to print
```

---

## 🎯 Subject Priority Levels

| Level | Meaning | What It Means | Color |
|-------|---------|---------------|-------|
| **5** | Highest | Most important, gets most hours | 🔴 Red |
| **4** | High | Very important | 🟠 Orange |
| **3** | Medium | Important | 🟡 Yellow |
| **2** | Low | Less important | 🟢 Green |
| **1** | Lowest | Least important | 🔵 Blue |
| **0** | EXCLUDE | Not in schedule | ⚪ Gray |

---

## 📊 Distribution Methods Explained

### Priority Weighted (Recommended)
```
"Give more hours to higher priority subjects"

Example: 10 hours left, 4 subjects
Math (P5):      5 hours  [████████]
Physics (P4):   4 hours  [██████]
Chemistry (P3): 1 hour   [██]

Total priority sum: 5+4+3 = 12
Math gets: (5/12) × 10 = 4.17 ≈ 4 hours
```

### Equal Distribution
```
"Same hours for all subjects"

Example: 10 hours left, 5 subjects
Math:        2 hours  [██]
Physics:     2 hours  [██]
Chemistry:   2 hours  [██]
Biology:     2 hours  [██]
AI:          2 hours  [██]

Each subject: 10 ÷ 5 = 2 hours
```

### High Priority First
```
"Highest priority subjects studied first"

Example: 10 hours left, prioritized allocation
1st: Math (P5)        → Gets 2 hours
2nd: Physics (P4)     → Gets 2 hours
3rd: Chemistry (P3)   → Gets 2 hours
4th: Biology (P4)     → Gets 2 hours
5th: AI (P4)          → Gets 2 hours

Fills one at a time until hours run out
```

---

## 📱 Display & Interface

### Schedule Card
```
┌─────────────────────────────┐
│ Thursday  Dec 25, 2025      │   ← Day name & date
│                     4.5 hrs │   ← Total hours
├─────────────────────────────┤
│ Math           P5    2.0 hrs │   ← Subject, priority, hours
│ Physics        P5    1.5 hrs │
│ Chemistry      P5    1.0 hrs │
└─────────────────────────────┘
```

### Study Summary
```
Total Study Hours  ← Your total across all days
    32.5 hours

Study Days         ← Days with hours > 0
    7 days

Subjects           ← Different subjects included
    8 subjects
```

---

## ⚡ Tips & Tricks

### 💡 For Better Schedules
1. **Realistic Hours**: 4-6 hours/day is typical
2. **Priority Weighting**: Best for balanced plans
3. **High Priority First**: Good for exams
4. **Adjust Minimum Hours**: Filter out tiny allocations

### 🎯 Quick Setups

**General Study Plan**
```
Priority Weighted method
All subjects P3+
4h weekday, 6h weekend
```

**Exam Preparation**
```
High Priority First method
Only P4-P5 subjects
6h all days
```

**Light Study**
```
Equal Distribution
All subjects P1+
2h all days
```

### 🔧 Advanced Tweaks
- **Higher Min Hours**: Get fewer subjects, more hours each
- **Fine Rounding**: Use 0.25h for precision
- **Custom Config**: Adjust each priority level separately

---

## 💾 Data Management

### Auto-Save
Your data is automatically saved to your browser when you:
- Change a priority
- Change daily hours
- Change configuration
- Generate a schedule

### Your Data Includes
- Study schedule
- Subject priorities
- Configuration settings
- Daily hours

### Access Your Data
```
Browser DevTools → Console → Type:
localStorage.getItem('sohamStudySchedule')
localStorage.getItem('sohamSubjectPriorities')
localStorage.getItem('sohamStudyConfig')
```

### Reset Everything
```
Browser DevTools → Console → Type:
localStorage.clear()
location.reload()
```

---

## 🖨️ Printing Tips

### Before Printing
1. Generate your schedule
2. Click "Print Schedule"
3. Preview should appear
4. Adjust print settings if needed

### Print Layout
```
📄 Header with title and date range
   Your Study Schedule
   Dec 25, 2025 - Dec 31, 2025

📋 Daily cards (one per page or multiple)
   With all subjects and hours

📊 Summary section
   Total hours, study days, subjects
```

### Optimize for Paper
- Change margins to "Minimum"
- Use "Landscape" for more width
- Check "Background Graphics" if needed
- Preview before printing

---

## 🔍 Understanding Priority 0

### What is Priority 0?
```
Priority 0 = EXCLUDE this subject

When you set a subject to Priority 0:
✓ It will NOT appear in the schedule
✓ Its hours are not allocated
✓ Other subjects get those hours
✓ Useful for subjects you don't study
```

### Example
```
If you set Bengali to Priority 0:
→ Bengali won't appear in your schedule
→ Those hours go to other subjects
→ Total still matches your input

Math (P5)  gets MORE hours
Physics (P4) gets MORE hours
Chemistry (P5) gets MORE hours
```

---

## 📚 Features You Have

| Feature | What It Does |
|---------|--------------|
| **Date Range** | Pick when you want to study |
| **Priorities** | Choose what's most important |
| **Base Hours** | Set minimum per priority |
| **Min Hours Filter** | Skip subjects with tiny hours |
| **Rounding** | Clean up decimal hours |
| **Distribution** | How to split remaining hours |
| **Bulk Edit** | Quick setup for all days |
| **Real-time Math** | See totals as you type |
| **Schedule Cards** | Beautiful daily view |
| **Print** | Physical copy of schedule |
| **Storage** | Saves to your browser |
| **Offline** | Works without internet |

---

## 🐛 Troubleshooting

### Issue: Schedule not generating
**Fix**: Make sure at least one day has hours > 0

### Issue: Subject not in schedule
**Fix**: Check if priority is 0 (excluded)

### Issue: Hours don't match total
**Fix**: Algorithm may adjust by ±0.5h due to rounding

### Issue: Subjects appear multiple times?
**Fix**: Shouldn't happen - report if you see this

### Issue: Data disappeared
**Fix**: Check browser storage settings, try clear cache

### Issue: Print looks weird
**Fix**: Try different browser or print settings

---

## 🌐 Offline & Mobile

### Works Offline
Once loaded, the app works without internet:
- ✓ View existing schedules
- ✓ Create new schedules
- ✓ All features available
- ✓ Data still saved

### Install as App
On mobile or compatible browsers:
1. Visit the link
2. Look for "Install" or menu option
3. Click "Install app"
4. Use like native app

### Mobile Tips
- Use landscape orientation for more space
- Tap carefully on inputs
- Use bulk edit buttons for quick setup
- Print from mobile browsers works too

---

## 📋 Complete Checklist

Before you start studying:
- [x] Set realistic daily hours
- [x] Review the generated schedule
- [x] Adjust if needed
- [x] Print or bookmark
- [x] Start studying!

---

## 💡 Useful Formulas

### Calculate Your Total Hours
```
Total = (Weekdays × 4) + (Weekends × 6)
Example: 5 weekdays + 2 weekends
       = (5 × 4) + (2 × 6)
       = 20 + 12
       = 32 hours
```

### Calculate Average Hours
```
Average = Total Hours ÷ Number of Days
Example: 32 hours ÷ 7 days
       = 4.57 hours/day
```

### Calculate Subject Hours
```
Depends on distribution method
(See distribution methods above)
```

---

## 📞 Support

### Getting Help
1. Check console (F12) for messages
2. Try refreshing page
3. Clear browser cache
4. Check browser compatibility

### Common Questions
**Q: Can I edit after generating?**
A: Yes! Change any value and regenerate

**Q: Can I use on multiple devices?**
A: Data stored per device (not synced)

**Q: Can I share my schedule?**
A: Print it! (Share feature coming soon)

**Q: How accurate is the algorithm?**
A: Highly accurate with rounding adjustments

---

## 🎓 Example Scenarios

### High School Student
```
Subjects: Math (P5), Physics (P5), Chemistry (P4), Biology (P4)
Method: Priority Weighted
Hours: 4h weekday, 6h weekend
Result: More balanced study plan
```

### College Student
```
Subjects: 3-4 main subjects (P5)
Method: High Priority First
Hours: 6-8h per day
Result: Focused exam prep
```

### Working Professional
```
Subjects: 1-2 skills (P4-P5)
Method: Equal Distribution
Hours: 1-2h per day
Result: Consistent learning
```

---

## ✨ Key Features Recap

✅ Smart date range selection  
✅ 10 subjects to study  
✅ Priority-based scheduling  
✅ Three distribution algorithms  
✅ Configurable base hours  
✅ Automatic rounding  
✅ Daily hour input  
✅ Bulk editing  
✅ Real-time calculations  
✅ Beautiful schedule view  
✅ Printable output  
✅ Auto-saves everything  
✅ Works offline  
✅ Mobile friendly  
✅ No sign-up needed  

---

## 🚀 You're Ready!

Your complete study schedule app is ready to use.

**Start Planning Now**: 
https://soumik-mondal.github.io/Soham-Study-Schedule/

**Good luck with your studies!** 📚💪

---

**Last Updated**: December 26, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
