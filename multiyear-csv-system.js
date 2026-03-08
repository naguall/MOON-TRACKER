/**
 * 🌙 MOON TRACKER - MULTI-YEAR CSV SYSTEM
 * 
 * FEATURES:
 * ✅ Reads from CSV based on current year
 * ✅ Calendar displays data from CSV
 * ✅ Notifications at 7 AM (daily summary)
 * ✅ Notifications 10 minutes before exact aspect time
 * ✅ Auto-switches year on January 1st
 * 
 * CSV FILES NEEDED:
 * - notifications-2026.csv
 * - notifications-2027.csv
 * - notifications-2028.csv
 * (Upload as many years as you want)
 */

class MultiYearCSVSystem {
    constructor() {
        this.currentYear = new Date().getFullYear();
        this.allData = [];
        this.aspectsData = [];
        this.lunarData = [];
        this.loaded = false;
    }
    
    /**
     * Load CSV for current year
     */
    async loadCurrentYear() {
        try {
            console.log(`📅 Loading data for ${this.currentYear}...`);
            
            // Try current year
            let response = await fetch(`/notifications-${this.currentYear}.csv`);
            
            if (!response.ok) {
                console.warn(`⚠️ notifications-${this.currentYear}.csv not found`);
                // Try generic notifications.csv
                response = await fetch('/notifications.csv');
            }
            
            if (!response.ok) {
                console.warn('⚠️ No CSV found, using defaults');
                return this.loadDefaults();
            }
            
            const csvText = await response.text();
            this.parseCSV(csvText);
            this.loaded = true;
            
            console.log(`✅ Loaded ${this.allData.length} events from CSV`);
            console.log(`   Aspects: ${this.aspectsData.length}`);
            console.log(`   Lunar: ${this.lunarData.length}`);
            
            return this.allData;
            
        } catch (error) {
            console.error('❌ Error loading CSV:', error);
            return this.loadDefaults();
        }
    }
    
    /**
     * Parse CSV and categorize data
     */
    parseCSV(text) {
        const lines = text.trim().split('\n');
        this.allData = [];
        this.aspectsData = [];
        this.lunarData = [];
        
        // Skip header
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split(',');
            if (parts.length >= 4) {
                const event = {
                    date: parts[0].trim(),
                    time: parts[1].trim(),
                    message: parts[2].trim(),
                    type: parts[3].trim()
                };
                
                this.allData.push(event);
                
                // Categorize
                if (event.type === 'lunar') {
                    this.lunarData.push(event);
                } else if (event.type === 'planetary') {
                    this.aspectsData.push(event);
                }
            }
        }
    }
    
    /**
     * Get events for a specific date
     */
    getEventsForDate(dateString) {
        return this.allData.filter(event => event.date === dateString);
    }
    
    /**
     * Get all aspects
     */
    getAllAspects() {
        return this.aspectsData;
    }
    
    /**
     * Get all lunar phases
     */
    getAllLunarPhases() {
        return this.lunarData;
    }
    
    /**
     * Get events for today
     */
    getTodaysEvents() {
        const today = this.formatDate(new Date());
        return this.getEventsForDate(today);
    }
    
    /**
     * Default data if CSV not found
     */
    loadDefaults() {
        console.log('📝 Using default data');
        const defaults = [
            { date: '2026-03-14', time: '07:00', message: 'Full Moon in Virgo', type: 'lunar' },
            { date: '2026-03-20', time: '14:46', message: 'Spring Equinox - Sun enters Aries', type: 'planetary' },
            { date: '2026-03-29', time: '06:30', message: 'New Moon in Aries', type: 'lunar' }
        ];
        
        this.allData = defaults;
        this.aspectsData = defaults.filter(e => e.type === 'planetary');
        this.lunarData = defaults.filter(e => e.type === 'lunar');
        this.loaded = true;
        
        return defaults;
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
     * Reload CSV (for updates)
     */
    async reload() {
        console.log('🔄 Reloading CSV...');
        return await this.loadCurrentYear();
    }
    
    /**
     * Check if new year and reload
     */
    async checkYearChange() {
        const now = new Date();
        const currentYear = now.getFullYear();
        
        if (currentYear !== this.currentYear) {
            console.log(`🎉 New year detected: ${currentYear}`);
            this.currentYear = currentYear;
            await this.loadCurrentYear();
            
            // Refresh calendar display
            if (typeof renderCalendar === 'function') {
                renderCalendar();
            }
        }
    }
}

// ==================================================
// 📅 CALENDAR INTEGRATION
// ==================================================

/**
 * Enhance calendar to read from CSV
 */
class CalendarCSVIntegration {
    constructor(csvSystem) {
        this.csvSystem = csvSystem;
    }
    
    /**
     * Get aspects for calendar day
     */
    getAspectsForDay(dateString) {
        return this.csvSystem.getEventsForDate(dateString)
            .filter(e => e.type === 'planetary');
    }
    
    /**
     * Get lunar phases for calendar day
     */
    getLunarForDay(dateString) {
        return this.csvSystem.getEventsForDate(dateString)
            .filter(e => e.type === 'lunar');
    }
    
    /**
     * Add events to calendar day cell
     */
    addEventsToDay(dayCell, dateString) {
        const events = this.csvSystem.getEventsForDate(dateString);
        
        if (events.length === 0) return;
        
        // Create events container
        let eventsContainer = dayCell.querySelector('.csv-events');
        if (!eventsContainer) {
            eventsContainer = document.createElement('div');
            eventsContainer.className = 'csv-events';
            eventsContainer.style.cssText = `
                font-size: 0.7em;
                margin-top: 4px;
                color: rgba(255, 255, 255, 0.8);
            `;
            dayCell.appendChild(eventsContainer);
        }
        
        // Add events
        events.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.style.cssText = `
                background: ${event.type === 'lunar' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(240, 230, 140, 0.2)'};
                padding: 2px 4px;
                border-radius: 2px;
                margin-bottom: 2px;
                font-size: 0.9em;
            `;
            eventEl.textContent = `${event.time} ${event.message.substring(0, 20)}...`;
            eventsContainer.appendChild(eventEl);
        });
    }
}

// ==================================================
// 🔔 EXACT TIME NOTIFICATIONS
// ==================================================

class ExactTimeNotifications {
    constructor(csvSystem) {
        this.csvSystem = csvSystem;
    }
    
    /**
     * Check for upcoming events (10 minutes before)
     */
    checkUpcoming(now) {
        const events = this.csvSystem.allData;
        
        events.forEach(event => {
            const eventDateTime = new Date(`${event.date}T${event.time}:00`);
            
            // Calculate 10 minutes before
            const tenMinBefore = new Date(eventDateTime.getTime() - (10 * 60000));
            
            // Check if it's time for 10-min warning
            const timeDiff = Math.abs(now - tenMinBefore);
            
            if (timeDiff < 120000) { // Within 2 minutes
                const notifId = `exact_${event.date}_${event.time}`;
                
                if (!this.wasSent(notifId)) {
                    this.send10MinWarning(event, eventDateTime);
                    this.markSent(notifId);
                }
            }
        });
    }
    
    /**
     * Send 10-minute warning
     */
    send10MinWarning(event, eventDateTime) {
        if (Notification.permission !== 'granted') return;
        
        const timeStr = eventDateTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const notification = new Notification(
            `⏰ In 10 minutes (${timeStr})`,
            {
                body: event.message,
                icon: '/icon-192.png',
                badge: '/icon-72.png',
                tag: `exact_${Date.now()}`,
                requireInteraction: true // Keep visible
            }
        );
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        console.log(`⏰ 10-min warning sent: ${event.message}`);
    }
    
    /**
     * Check if sent
     */
    wasSent(id) {
        const sent = this.getSent();
        return sent.includes(id);
    }
    
    /**
     * Mark as sent
     */
    markSent(id) {
        const sent = this.getSent();
        sent.push(id);
        localStorage.setItem('sentExactNotifications', JSON.stringify(sent));
    }
    
    /**
     * Get sent
     */
    getSent() {
        try {
            const stored = localStorage.getItem('sentExactNotifications');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }
}

// ==================================================
// 🚀 INITIALIZATION
// ==================================================

// Global instances
window.multiYearCSV = new MultiYearCSVSystem();
window.calendarCSV = null;
window.exactNotifications = null;

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    // Load CSV data
    await window.multiYearCSV.loadCurrentYear();
    
    // Initialize integrations
    window.calendarCSV = new CalendarCSVIntegration(window.multiYearCSV);
    window.exactNotifications = new ExactTimeNotifications(window.multiYearCSV);
    
    console.log('✅ Multi-year CSV system ready');
    
    // Check for year change every hour
    setInterval(() => {
        window.multiYearCSV.checkYearChange();
    }, 3600000); // 1 hour
});

// ==================================================
// 🧪 TEST FUNCTIONS
// ==================================================

window.testCSVLoad = async function() {
    await window.multiYearCSV.reload();
    console.log('✅ CSV reloaded');
};

window.showCSVData = function() {
    console.log('\n📊 CSV Data:');
    console.log(`   Total events: ${window.multiYearCSV.allData.length}`);
    console.log(`   Aspects: ${window.multiYearCSV.aspectsData.length}`);
    console.log(`   Lunar: ${window.multiYearCSV.lunarData.length}`);
    console.log('\nToday\'s events:');
    const today = window.multiYearCSV.getTodaysEvents();
    today.forEach(e => console.log(`   ${e.time} - ${e.message}`));
};

window.testExactNotification = function() {
    // Test with a fake event 10 minutes from now
    const now = new Date();
    const in10min = new Date(now.getTime() + (10 * 60000));
    
    const testEvent = {
        date: window.multiYearCSV.formatDate(in10min),
        time: in10min.toTimeString().substring(0, 5),
        message: 'TEST: This is a 10-minute warning test',
        type: 'planetary'
    };
    
    window.exactNotifications.send10MinWarning(testEvent, in10min);
};

console.log('✅ Multi-year CSV system loaded');
console.log('\n🎮 Commands:');
console.log('   window.testCSVLoad() - Reload CSV');
console.log('   window.showCSVData() - Show loaded data');
console.log('   window.testExactNotification() - Test 10-min warning');
