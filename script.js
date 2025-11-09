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

    // Phase 1: Assign hours based on priority tiers
    const priorityTiers = [
        { priority: 5, minHours: 1.5 },
        { priority: 4, minHours: 1.5 },
        { priority: 3, minHours: 1.5 },
        { priority: 2, minHours: 1.0 },
        { priority: 1, minHours: 1.0 } // Priority 1 gets 1 hour minimum
    ];

    // Assign minimum hours to each priority tier
    priorityTiers.forEach(tier => {
        const tierSubjects = subjectList.filter(s => s.priority === tier.priority);
        
        for (const subject of tierSubjects) {
            if (remainingHours >= tier.minHours) {
                subject.hours = tier.minHours;
                remainingHours -= tier.minHours;
                console.log(`Assigned ${tier.minHours} hours to ${subject.name} (P${tier.priority}), remaining: ${remainingHours}`);
            }
        }
    });

    // Phase 2: Distribute remaining hours based on priority weight
    if (remainingHours > 0) {
        const totalPriority = subjectList.reduce((sum, s) => sum + s.priority, 0);
        console.log('Total priority score for distribution:', totalPriority);
        
        // Distribute to subjects that already have hours first
        const subjectsWithHours = subjectList.filter(s => s.hours > 0);
        
        subjectsWithHours.forEach(subject => {
            if (remainingHours <= 0) return;

            const priorityWeight = subject.priority / totalPriority;
            let allocatedHours = priorityWeight * remainingHours;
            
            // Round to nearest 0.5 and ensure we don't exceed remaining hours
            allocatedHours = this.roundToHalf(allocatedHours);
            allocatedHours = Math.min(allocatedHours, remainingHours);

            if (allocatedHours >= 0.5) {
                subject.hours += allocatedHours;
                remainingHours -= allocatedHours;
                console.log(`Added ${allocatedHours} hours to ${subject.name}, remaining: ${remainingHours}`);
            }
        });
    }

    // Phase 3: If still have hours, distribute to any subject that can take more
    if (remainingHours > 0) {
        console.log(`Distributing remaining ${remainingHours} hours to all subjects`);
        
        // Try to give to subjects with lower hours first
        subjectList.sort((a, b) => a.hours - b.hours);
        
        for (const subject of subjectList) {
            if (remainingHours >= 0.5) {
                const extraHours = Math.min(0.5, remainingHours);
                subject.hours += extraHours;
                remainingHours -= extraHours;
                console.log(`Added ${extraHours} hours to ${subject.name}, remaining: ${remainingHours}`);
            }
        }
    }

    // Phase 4: Final adjustment and ensure Priority 1 subjects are included
    let finalTotal = subjectList.reduce((sum, s) => sum + s.hours, 0);
    console.log(`Final total before adjustment: ${finalTotal}, Target: ${totalHours}`);
    
    if (Math.abs(finalTotal - totalHours) > 0.1) {
        const diff = totalHours - finalTotal;
        // Try to adjust Priority 1 subjects first to include them
        const priority1Subjects = subjectList.filter(s => s.priority === 1 && s.hours > 0);
        if (priority1Subjects.length > 0 && Math.abs(diff) >= 0.5) {
            const subjectToAdjust = priority1Subjects[0];
            subjectToAdjust.hours = this.roundToHalf(subjectToAdjust.hours + diff);
            console.log(`Adjusted ${subjectToAdjust.name} by ${diff} hours`);
        } else {
            // Otherwise adjust any subject with hours
            const subjectToAdjust = subjectList.find(s => s.hours > 0);
            if (subjectToAdjust && Math.abs(diff) >= 0.5) {
                subjectToAdjust.hours = this.roundToHalf(subjectToAdjust.hours + diff);
                console.log(`Adjusted ${subjectToAdjust.name} by ${diff} hours`);
            }
        }
    }

    // Final calculation
    finalTotal = subjectList.reduce((sum, s) => sum + s.hours, 0);
    console.log(`Final total after adjustment: ${finalTotal}, Target: ${totalHours}`);

    // Filter and return - include Priority 1 subjects even with 1 hour
    const finalSubjects = subjectList
        .filter(subject => subject.hours >= 1.0) // Changed from 1.5 to 1.0 to include Priority 1
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
