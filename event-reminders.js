/**
 * 📅 MULTIPLE REMINDERS SYSTEM
 * Like Google Calendar
 * 
 * OPTIONS:
 * - 3 days before
 * - 2 days before
 * - 1 day before
 * - 12 hours before
 * - 6 hours before
 * - 1 hour before
 * - 30 minutes before
 * - 15 minutes before
 */

class EventReminderSystem {
    constructor() {
        this.reminderOptions = [
            { label: '3 days before', minutes: 4320 },
            { label: '2 days before', minutes: 2880 },
            { label: '1 day before', minutes: 1440 },
            { label: '12 hours before', minutes: 720 },
            { label: '6 hours before', minutes: 360 },
            { label: '1 hour before', minutes: 60 },
            { label: '30 minutes before', minutes: 30 },
            { label: '15 minutes before', minutes: 15 },
            { label: 'At time of event', minutes: 0 }
        ];
    }
    
    /**
     * Get reminder options HTML
     */
    getReminderOptionsHTML() {
        let html = '<div class="reminder-options" style="margin-top: 10px;">';
        html += '<label style="display: block; margin-bottom: 5px; font-weight: bold;">📬 Reminders:</label>';
        
        this.reminderOptions.forEach((option, index) => {
            html += `
                <div style="margin-bottom: 5px;">
                    <label style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <input 
                            type="checkbox" 
                            class="reminder-checkbox" 
                            value="${option.minutes}"
                            data-label="${option.label}"
                            style="cursor: pointer;"
                        >
                        <span>${option.label}</span>
                    </label>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    /**
     * Get selected reminders from checkboxes
     */
    getSelectedReminders() {
        const checkboxes = document.querySelectorAll('.reminder-checkbox:checked');
        const reminders = [];
        
        checkboxes.forEach(cb => {
            reminders.push({
                minutes: parseInt(cb.value),
                label: cb.getAttribute('data-label')
            });
        });
        
        return reminders;
    }
    
    /**
     * Save event with reminders
     */
    saveEventWithReminders(event) {
        const events = this.getStoredEvents();
        
        // Add reminders to event
        event.reminders = this.getSelectedReminders();
        
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        
        console.log(`✅ Event saved with ${event.reminders.length} reminders`);
        return event;
    }
    
    /**
     * Check and send reminders
     */
    checkReminders(now) {
        const events = this.getStoredEvents();
        
        events.forEach(event => {
            if (!event.date || !event.time || !event.reminders) return;
            
            const eventDateTime = new Date(`${event.date}T${event.time}:00`);
            
            // Check each reminder
            event.reminders.forEach(reminder => {
                const reminderTime = new Date(eventDateTime.getTime() - (reminder.minutes * 60000));
                const timeDiff = Math.abs(now - reminderTime);
                
                // If within 2 minutes of reminder time
                if (timeDiff < 120000) {
                    const notifId = `reminder_${event.date}_${event.time}_${reminder.minutes}`;
                    
                    if (!this.wasReminderSent(notifId)) {
                        this.sendReminder(event, reminder);
                        this.markReminderSent(notifId);
                    }
                }
            });
        });
    }
    
    /**
     * Send reminder notification
     */
    sendReminder(event, reminder) {
        if (Notification.permission !== 'granted') return;
        
        let message = '';
        if (reminder.minutes === 0) {
            message = `Now: ${event.title}`;
        } else {
            message = `${reminder.label}: ${event.title}`;
        }
        
        const notification = new Notification('📅 Event Reminder', {
            body: message,
            icon: '/icon-192.png',
            badge: '/icon-72.png',
            tag: `event_${Date.now()}`,
            requireInteraction: reminder.minutes <= 15 // Keep visible for last-minute reminders
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        console.log(`📨 Reminder sent: ${message}`);
    }
    
    /**
     * Get stored events
     */
    getStoredEvents() {
        try {
            const events = localStorage.getItem('events');
            return events ? JSON.parse(events) : [];
        } catch (e) {
            return [];
        }
    }
    
    /**
     * Check if reminder was sent
     */
    wasReminderSent(id) {
        const sent = this.getSentReminders();
        return sent.includes(id);
    }
    
    /**
     * Mark reminder as sent
     */
    markReminderSent(id) {
        const sent = this.getSentReminders();
        sent.push(id);
        localStorage.setItem('sentReminders', JSON.stringify(sent));
    }
    
    /**
     * Get sent reminders
     */
    getSentReminders() {
        try {
            const stored = localStorage.getItem('sentReminders');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }
    
    /**
     * Clean old reminders (7 days)
     */
    cleanOldReminders() {
        const sent = this.getSentReminders();
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        const recent = sent.filter(id => {
            if (id.includes('2026-')) {
                const dateMatch = id.match(/2026-\d{2}-\d{2}/);
                if (dateMatch) {
                    const reminderDate = new Date(dateMatch[0]);
                    return reminderDate >= sevenDaysAgo;
                }
            }
            return true;
        });
        
        if (recent.length !== sent.length) {
            localStorage.setItem('sentReminders', JSON.stringify(recent));
            console.log(`🧹 Cleaned ${sent.length - recent.length} old reminders`);
        }
    }
}

// Global instance
window.eventReminders = new EventReminderSystem();

// Clean old reminders on load
window.eventReminders.cleanOldReminders();

console.log('✅ Event Reminder System loaded');
console.log('   Reminder options: 3d, 2d, 1d, 12h, 6h, 1h, 30m, 15m, 0m');
