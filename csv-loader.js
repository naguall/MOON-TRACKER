/**
 * 📊 CSV NOTIFICATION LOADER
 * 
 * HOW IT WORKS:
 * 1. Upload notifications.csv to GitHub
 * 2. System reads it automatically
 * 3. No need to edit JavaScript!
 * 
 * CSV FORMAT:
 * date,time,message,type
 * 2026-03-10,08:00,Your message here,personal
 */

class CSVNotificationLoader {
    constructor() {
        this.messages = [];
        this.loaded = false;
    }
    
    /**
     * Load messages from CSV file
     */
    async loadFromCSV() {
        try {
            console.log('📊 Loading notifications from CSV...');
            
            const response = await fetch('/notifications.csv');
            
            if (!response.ok) {
                console.warn('⚠️ notifications.csv not found, using defaults');
                return this.loadDefaults();
            }
            
            const csvText = await response.text();
            this.messages = this.parseCSV(csvText);
            this.loaded = true;
            
            console.log(`✅ Loaded ${this.messages.length} messages from CSV`);
            return this.messages;
            
        } catch (error) {
            console.error('❌ Error loading CSV:', error);
            return this.loadDefaults();
        }
    }
    
    /**
     * Parse CSV text to JSON
     */
    parseCSV(text) {
        const lines = text.trim().split('\n');
        const messages = [];
        
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Parse CSV (simple, handles basic cases)
            const parts = line.split(',');
            if (parts.length >= 4) {
                messages.push({
                    date: parts[0].trim(),
                    time: parts[1].trim(),
                    message: parts[2].trim(),
                    type: parts[3].trim()
                });
            }
        }
        
        return messages;
    }
    
    /**
     * Default messages if CSV not found
     */
    loadDefaults() {
        console.log('📝 Using default messages');
        this.messages = [
            { date: '2026-03-14', time: '07:00', message: 'Full Moon in Virgo - Culmination of refinement', type: 'lunar' },
            { date: '2026-03-20', time: '14:46', message: 'Spring Equinox - Sun enters Aries', type: 'planetary' },
            { date: '2026-03-29', time: '06:30', message: 'New Moon in Aries - Beginning of action cycle', type: 'lunar' }
        ];
        this.loaded = true;
        return this.messages;
    }
    
    /**
     * Get loaded messages
     */
    getMessages() {
        return this.messages;
    }
    
    /**
     * Check if loaded
     */
    isLoaded() {
        return this.loaded;
    }
}

// Export for use in notification system
window.csvLoader = new CSVNotificationLoader();
