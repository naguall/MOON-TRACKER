/**
 * 🌙 MOON TRACKER - FINAL NOTIFICATION SYSTEM
 * 
 * FEATURES:
 * ✅ Reads messages from CSV file (no coding needed!)
 * ✅ Daily aspect summary (7:00 AM)
 * ✅ Lunar phase notifications (8:00 AM)
 * ✅ Multiple reminders for events (like Google Calendar)
 * ✅ All in English
 * 
 * CONFIGURATION:
 * Edit lines 20-22 to change times
 */

// ==================================================
// ⚙️ CONFIGURATION - EDIT HERE
// ==================================================

const DAILY_SUMMARY_TIME = '07:00';      // Daily aspect summary
const LUNAR_PHASE_TIME = '08:00';        // Lunar phase notifications

// ==================================================
// 🚀 MAIN NOTIFICATION SYSTEM
// ==================================================

class MoonTrackerNotifications {
    constructor() {
        this.messages = [];
        this.checkInterval = null;
        this.dailyCheckDone = false;
        this.csvLoader = window.csvLoader;
        this.eventReminders = window.eventReminders;
    }
    
    /**
     * Initialize system
     */
    async init() {
        console.log('🔔 Moon Tracker Notifications Starting...');
        
        if (!('Notification' in window)) {
            console.warn('⚠️ Notifications not supported');
            return;
        }
        
        if (Notification.permission !== 'granted') {
            console.log('⏳ Waiting for notification permission...');
            return;
        }
        
        console.log('✅ Notification permission granted');
        
        // Load messages from CSV
        this.messages = await this.csvLoader.loadFromCSV();
        
        // Start checking
        this.checkAll();
        
        this.checkInterval = setInterval(() => {
            this.checkAll();
        }, 60000); // Every minute
        
        console.log('✅ Notification system active');
        this.showStatus();
    }
    
    /**
     * Check all notifications
     */
    checkAll() {
        const now = new Date();
        const currentTime = this.formatTime(now);
        const currentDate = this.formatDate(now);
        
        // 1. CSV scheduled messages
        this.checkScheduledMessages(now);
        
        // 2. Daily aspect summary
        if (currentTime === DAILY_SUMMARY_TIME) {
            if (!this.dailyCheckDone || this.getStoredDate() !== currentDate) {
                this.sendDailyAspects(now);
                this.dailyCheckDone = true;
                this.storeDate(currentDate);
            }
        }
        
        // 3. Event reminders (multiple)
        if (this.eventReminders) {
            this.eventReminders.checkReminders(now);
        }
        
        // 4. Exact time notifications (10 min before)
        if (window.exactNotifications) {
            window.exactNotifications.checkUpcoming(now);
        }
        
        // 5. Lunar phases
        if (currentTime === LUNAR_PHASE_TIME) {
            if (!this.dailyCheckDone || this.getStoredDate() !== currentDate) {
                this.checkLunarPhases(now);
            }
        }
        
        // Reset daily check at midnight
        if (currentTime === '00:00') {
            this.dailyCheckDone = false;
        }
    }
    
    /**
     * Check CSV scheduled messages
     */
    checkScheduledMessages(now) {
        this.messages.forEach(msg => {
            const msgDateTime = `${msg.date} ${msg.time}`;
            const msgDate = new Date(`${msg.date}T${msg.time}:00`);
            
            const timeDiff = Math.abs(now - msgDate);
            const isNow = timeDiff < 120000; // ±2 minutes
            
            if (isNow && !this.wasSent(msgDateTime)) {
                this.sendNotification(
                    this.getTitle(msg.type),
                    msg.message,
                    msg.type
                );
                this.markSent(msgDateTime);
            }
        });
    }
    
    /**
     * Send daily aspect summary
     */
    sendDailyAspects(date) {
        const aspects = this.getTodaysAspects(date);
        
        if (aspects.length === 0) {
            return;
        }
        
        let message = `Today's planetary aspects:\n`;
        aspects.forEach(asp => {
            message += `• ${asp}\n`;
        });
        
        this.sendNotification(
            '⭐ Today\'s Aspects',
            message.trim(),
            'planetary'
        );
    }
    
    /**
     * Get today's aspects from calendar
     */
    getTodaysAspects(date) {
        const dateStr = this.formatDate(date);
        const aspects = [];
        
        // From calendar data
        if (typeof interPlanetaryAspects2026 !== 'undefined') {
            interPlanetaryAspects2026.forEach(asp => {
                if (asp.date === dateStr) {
                    aspects.push(`${asp.planet1} ${asp.aspect} ${asp.planet2}`);
                }
            });
        }
        
        if (typeof signChanges2026 !== 'undefined') {
            signChanges2026.forEach(change => {
                if (change.date === dateStr) {
                    aspects.push(`${change.planet} enters ${change.sign}`);
                }
            });
        }
        
        if (typeof retrogrades2026 !== 'undefined') {
            retrogrades2026.forEach(retro => {
                if (retro.startDate === dateStr) {
                    aspects.push(`${retro.planet} retrograde starts`);
                }
                if (retro.endDate === dateStr) {
                    aspects.push(`${retro.planet} goes direct`);
                }
            });
        }
        
        return aspects;
    }
    
    /**
     * Check lunar phases
     */
    checkLunarPhases(date) {
        const dateStr = this.formatDate(date);
        
        // New moons
        if (typeof newMoonDates !== 'undefined') {
            newMoonDates.forEach(moon => {
                if (this.formatDate(new Date(moon)) === dateStr) {
                    this.sendNotification(
                        '🌑 New Moon',
                        `New Moon today`,
                        'lunar'
                    );
                }
            });
        }
        
        // Full moons
        if (typeof fullMoonDates !== 'undefined') {
            fullMoonDates.forEach(moon => {
                if (this.formatDate(new Date(moon)) === dateStr) {
                    this.sendNotification(
                        '🌕 Full Moon',
                        `Full Moon today`,
                        'lunar'
                    );
                }
            });
        }
    }
    
    /**
     * Send notification
     */
    sendNotification(title, message, type) {
        if (Notification.permission !== 'granted') return;
        
        const notification = new Notification(title, {
            body: message,
            icon: '/icon-192.png',
            badge: '/icon-72.png',
            tag: `${type}_${Date.now()}`,
            requireInteraction: false
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        console.log(`📨 Notification sent: ${title}`);
    }
    
    /**
     * Get title by type
     */
    getTitle(type) {
        const titles = {
            lunar: '🌙 Lunar Phase',
            planetary: '⭐ Planetary',
            personal: '💫 Personal',
            event: '📅 Event'
        };
        return titles[type] || '🌙 Moon Tracker';
    }
    
    /**
     * Check if notification was sent
     */
    wasSent(id) {
        const sent = this.getSent();
        return sent.includes(id);
    }
    
    /**
     * Mark notification as sent
     */
    markSent(id) {
        const sent = this.getSent();
        sent.push(id);
        localStorage.setItem('sentNotifications', JSON.stringify(sent));
    }
    
    /**
     * Get sent notifications
     */
    getSent() {
        try {
            const stored = localStorage.getItem('sentNotifications');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }
    
    /**
     * Store/get last daily check date
     */
    storeDate(date) {
        localStorage.setItem('lastDailyCheck', date);
    }
    
    getStoredDate() {
        return localStorage.getItem('lastDailyCheck') || '';
    }
    
    /**
     * Format date
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * Format time
     */
    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    /**
     * Show system status
     */
    showStatus() {
        console.log('\n📊 System Status:');
        console.log(`   Daily summary: ${DAILY_SUMMARY_TIME}`);
        console.log(`   Lunar phases: ${LUNAR_PHASE_TIME}`);
        console.log(`   CSV messages: ${this.messages.length}`);
        console.log(`   Event reminders: Multiple (3d to 15m)`);
        console.log('');
    }
    
    /**
     * Reload messages from CSV
     */
    async reloadCSV() {
        console.log('🔄 Reloading CSV...');
        this.messages = await this.csvLoader.loadFromCSV();
        console.log(`✅ Reloaded ${this.messages.length} messages`);
    }
    
    /**
     * Reset system
     */
    reset() {
        localStorage.removeItem('sentNotifications');
        localStorage.removeItem('lastDailyCheck');
        localStorage.removeItem('sentReminders');
        this.dailyCheckDone = false;
        console.log('🔄 System reset');
    }
}

// ==================================================
// 🚀 INITIALIZATION
// ==================================================

window.moonNotifications = new MoonTrackerNotifications();

document.addEventListener('DOMContentLoaded', () => {
    // Wait for CSV loader to be ready
    setTimeout(async () => {
        if (Notification.permission === 'granted') {
            await window.moonNotifications.init();
        } else {
            console.log('⏳ Click 🔔 button to enable notifications');
        }
    }, 2000);
});

// ==================================================
// 🧪 TEST FUNCTIONS
// ==================================================

window.testNotification = function() {
    window.moonNotifications.sendNotification(
        '🧪 Test',
        'Notification system working! ✅',
        'personal'
    );
};

window.testDailyAspects = function() {
    window.moonNotifications.sendDailyAspects(new Date());
};

window.showUpcoming = function() {
    const now = new Date();
    const upcoming = window.moonNotifications.messages
        .filter(msg => new Date(`${msg.date}T${msg.time}:00`) > now)
        .slice(0, 10);
    
    console.log('\n📅 Next 10 notifications (from CSV):');
    upcoming.forEach(msg => {
        console.log(`   ${msg.date} ${msg.time} - ${msg.message}`);
    });
};

window.reloadCSV = async function() {
    await window.moonNotifications.reloadCSV();
};

window.resetNotifications = function() {
    window.moonNotifications.reset();
    if (window.eventReminders) {
        window.eventReminders.cleanOldReminders();
    }
};

console.log('✅ Moon Tracker Final System loaded');
console.log('\n🎮 Test commands:');
console.log('   window.testNotification() - Send test');
console.log('   window.testDailyAspects() - Test daily summary');
console.log('   window.showUpcoming() - Show next 10 from CSV');
console.log('   window.reloadCSV() - Reload notifications.csv');
console.log('   window.resetNotifications() - Reset system');
