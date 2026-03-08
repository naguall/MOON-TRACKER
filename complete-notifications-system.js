/**
 * 🔔 SISTEMA COMPLETO DE NOTIFICACIONES AUTOMÁTICAS
 * 
 * ACTIVA NOTIFICACIONES PARA:
 * ✅ Aspectos planetarios diarios
 * ✅ Fases lunares
 * ✅ Eventos personales
 * ✅ Mensajes programados
 * 
 * Versión: 1.0 - Moon Tracker
 */

// ==================================================
// ⚙️ CONFIGURACIÓN
// ==================================================

const notificationConfig = {
    // ¿A qué hora enviar resumen diario de aspectos?
    dailyAspectsTime: '07:00',
    
    // ¿Cuánto tiempo antes de un evento personal avisar?
    eventReminderMinutes: 60, // 1 hora antes
    
    // ¿Activar notificaciones de fases lunares?
    lunarPhasesEnabled: true,
    
    // ¿Hora de notificación de fase lunar?
    lunarPhaseTime: '08:00',
    
    // ¿Activar notificaciones de aspectos diarios?
    dailyAspectsEnabled: true,
    
    // ¿Activar notificaciones de eventos personales?
    personalEventsEnabled: true
};

// ==================================================
// 📅 MENSAJES PERSONALIZADOS (Edita aquí)
// ==================================================

const scheduledMessages = [
    // MARZO 2026 - MENSAJES DE PRUEBA
    { date: '2026-03-09', time: '08:00', message: 'Venus entra en Aries - Energía relacional directa e iniciática', type: 'planetary' },
    { date: '2026-03-14', time: '07:00', message: 'Luna llena en Virgo - Culminación de perfeccionamiento', type: 'lunar' },
    { date: '2026-03-20', time: '14:46', message: 'Equinoccio de Primavera - Sol entra en Aries', type: 'planetary' },
    
    // ABRIL 2026
    { date: '2026-04-13', time: '08:00', message: 'Luna llena en Libra - Culminación de búsqueda de equilibrio', type: 'lunar' },
    { date: '2026-04-20', time: '09:00', message: 'Sol entra en Tauro - Energía solar busca estabilidad', type: 'planetary' },
    
    // MAYO 2026
    { date: '2026-05-12', time: '08:00', message: 'Luna llena en Escorpio - Transformación profunda', type: 'lunar' },
    { date: '2026-05-21', time: '09:00', message: 'Sol entra en Géminis - Energía de comunicación', type: 'planetary' },
    
    // Agregar más mensajes según necesites...
];

// ==================================================
// 🌙 CLASE PRINCIPAL - SISTEMA DE NOTIFICACIONES
// ==================================================

class MoonTrackerNotifications {
    constructor() {
        this.config = notificationConfig;
        this.messages = scheduledMessages;
        this.checkInterval = null;
        this.dailyCheckDone = false;
    }
    
    /**
     * Inicializar sistema completo
     */
    async init() {
        console.log('🔔 Iniciando sistema completo de notificaciones...');
        
        // Verificar soporte
        if (!('Notification' in window)) {
            console.warn('⚠️ Notificaciones no soportadas');
            return;
        }
        
        // Verificar permisos
        if (Notification.permission !== 'granted') {
            console.log('⏳ Esperando permisos de notificación...');
            return;
        }
        
        console.log('✅ Permisos de notificación otorgados');
        
        // Verificar inmediatamente
        this.checkAll();
        
        // Verificar cada minuto
        this.checkInterval = setInterval(() => {
            this.checkAll();
        }, 60000);
        
        console.log('✅ Sistema de notificaciones activo');
        this.logStatus();
    }
    
    /**
     * Verificar todo
     */
    checkAll() {
        const now = new Date();
        const currentTime = this.formatTime(now);
        const currentDate = this.formatDate(now);
        
        // 1. Verificar mensajes programados
        this.checkScheduledMessages(now);
        
        // 2. Verificar resumen diario de aspectos (solo una vez al día)
        if (this.config.dailyAspectsEnabled && currentTime === this.config.dailyAspectsTime) {
            if (!this.dailyCheckDone || this.getStoredDate() !== currentDate) {
                this.sendDailyAspectsNotification(now);
                this.dailyCheckDone = true;
                this.storeDate(currentDate);
            }
        }
        
        // 3. Verificar eventos personales
        if (this.config.personalEventsEnabled) {
            this.checkPersonalEvents(now);
        }
        
        // 4. Verificar fases lunares
        if (this.config.lunarPhasesEnabled && currentTime === this.config.lunarPhaseTime) {
            if (!this.dailyCheckDone || this.getStoredDate() !== currentDate) {
                this.checkLunarPhases(now);
            }
        }
    }
    
    /**
     * Verificar mensajes programados
     */
    checkScheduledMessages(now) {
        const currentDate = this.formatDate(now);
        const currentTime = this.formatTime(now);
        
        this.messages.forEach(msg => {
            const msgDateTime = `${msg.date} ${msg.time}`;
            const msgDate = new Date(`${msg.date}T${msg.time}:00`);
            
            const timeDiff = Math.abs(now - msgDate);
            const isNow = timeDiff < 120000; // ±2 minutos
            
            if (isNow && !this.wasNotificationSent(msgDateTime)) {
                this.sendNotification(
                    this.getTitle(msg.type),
                    msg.message,
                    msg.type
                );
                this.markNotificationSent(msgDateTime);
            }
        });
    }
    
    /**
     * Enviar resumen diario de aspectos planetarios
     */
    sendDailyAspectsNotification(date) {
        const aspects = this.getTodaysAspects(date);
        
        if (aspects.length === 0) {
            return;
        }
        
        let message = `Today's planetary aspects:\n`;
        aspects.forEach(asp => {
            message += `• ${asp}\n`;
        });
        
        this.sendNotification(
            '⭐ Today\'s Planetary Aspects',
            message.trim(),
            'planetary'
        );
        
        console.log('✅ Resumen diario enviado');
    }
    
    /**
     * Obtener aspectos de hoy
     */
    getTodaysAspects(date) {
        const dateStr = this.formatDate(date);
        const aspects = [];
        
        // Obtener del calendario (si existe la variable global)
        if (typeof interPlanetaryAspects2026 !== 'undefined') {
            interPlanetaryAspects2026.forEach(asp => {
                if (asp.date === dateStr) {
                    aspects.push(`${asp.planet1} ${asp.aspect} ${asp.planet2}`);
                }
            });
        }
        
        // Obtener cambios de signo
        if (typeof signChanges2026 !== 'undefined') {
            signChanges2026.forEach(change => {
                if (change.date === dateStr) {
                    aspects.push(`${change.planet} enters ${change.sign}`);
                }
            });
        }
        
        // Obtener retrogradaciones
        if (typeof retrogrades2026 !== 'undefined') {
            retrogrades2026.forEach(retro => {
                if (retro.startDate === dateStr) {
                    aspects.push(`${retro.planet} goes retrograde`);
                }
                if (retro.endDate === dateStr) {
                    aspects.push(`${retro.planet} goes direct`);
                }
            });
        }
        
        return aspects;
    }
    
    /**
     * Verificar eventos personales
     */
    checkPersonalEvents(now) {
        const events = this.getStoredEvents();
        const reminderTime = new Date(now.getTime() + (this.config.eventReminderMinutes * 60000));
        
        events.forEach(event => {
            if (!event.date || !event.time) return;
            
            const eventDateTime = new Date(`${event.date}T${event.time}:00`);
            const timeDiff = Math.abs(reminderTime - eventDateTime);
            
            // Si estamos a 1 hora del evento (±2 min)
            if (timeDiff < 120000) {
                const notifId = `event_${event.date}_${event.time}`;
                
                if (!this.wasNotificationSent(notifId)) {
                    this.sendNotification(
                        '📅 Event Reminder',
                        `In ${this.config.eventReminderMinutes} minutes: ${event.title}`,
                        'event'
                    );
                    this.markNotificationSent(notifId);
                }
            }
        });
    }
    
    /**
     * Verificar fases lunares
     */
    checkLunarPhases(date) {
        const dateStr = this.formatDate(date);
        
        // Verificar lunas nuevas
        if (typeof newMoonDates !== 'undefined') {
            newMoonDates.forEach(moon => {
                if (this.formatDate(new Date(moon)) === dateStr) {
                    this.sendNotification(
                        '🌑 New Moon',
                        `New Moon today in ${this.getMoonSign(moon)}`,
                        'lunar'
                    );
                }
            });
        }
        
        // Verificar lunas llenas
        if (typeof fullMoonDates !== 'undefined') {
            fullMoonDates.forEach(moon => {
                if (this.formatDate(new Date(moon)) === dateStr) {
                    this.sendNotification(
                        '🌕 Full Moon',
                        `Full Moon today in ${this.getMoonSign(moon)}`,
                        'lunar'
                    );
                }
            });
        }
    }
    
    /**
     * Obtener signo de la luna (aproximado)
     */
    getMoonSign(date) {
        // Simplificado - en producción usar cálculo real
        return 'the current sign';
    }
    
    /**
     * Enviar notificación
     */
    sendNotification(title, message, type) {
        if (Notification.permission !== 'granted') {
            console.warn('⚠️ Sin permisos de notificación');
            return;
        }
        
        const notification = new Notification(title, {
            body: message,
            icon: this.getIcon(type),
            badge: '/icon-72.png',
            tag: `${type}_${Date.now()}`,
            requireInteraction: false,
            silent: false
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        console.log(`📨 Notificación enviada: ${title}`);
    }
    
    /**
     * Obtener título según tipo
     */
    getTitle(type) {
        const titles = {
            lunar: '🌙 Lunar Phase',
            planetary: '⭐ Planetary Aspect',
            personal: '💫 Personal Message',
            event: '📅 Event Reminder'
        };
        return titles[type] || '🌙 Moon Tracker';
    }
    
    /**
     * Obtener icono según tipo
     */
    getIcon(type) {
        return '/icon-192.png';
    }
    
    /**
     * Obtener eventos guardados
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
     * Verificar si notificación ya fue enviada
     */
    wasNotificationSent(id) {
        const sent = this.getSentNotifications();
        return sent.includes(id);
    }
    
    /**
     * Marcar notificación como enviada
     */
    markNotificationSent(id) {
        const sent = this.getSentNotifications();
        sent.push(id);
        localStorage.setItem('sentNotifications', JSON.stringify(sent));
    }
    
    /**
     * Obtener notificaciones enviadas
     */
    getSentNotifications() {
        try {
            const stored = localStorage.getItem('sentNotifications');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }
    
    /**
     * Guardar/obtener fecha del último check diario
     */
    storeDate(date) {
        localStorage.setItem('lastDailyCheck', date);
    }
    
    getStoredDate() {
        return localStorage.getItem('lastDailyCheck') || '';
    }
    
    /**
     * Formatear fecha
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * Formatear hora
     */
    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    /**
     * Mostrar estado
     */
    logStatus() {
        console.log('\n📊 Estado del sistema:');
        console.log(`   Aspectos diarios: ${this.config.dailyAspectsEnabled ? '✅' : '❌'} (${this.config.dailyAspectsTime})`);
        console.log(`   Fases lunares: ${this.config.lunarPhasesEnabled ? '✅' : '❌'} (${this.config.lunarPhaseTime})`);
        console.log(`   Eventos personales: ${this.config.personalEventsEnabled ? '✅' : '❌'} (${this.config.eventReminderMinutes} min antes)`);
        console.log(`   Mensajes programados: ${this.messages.length}`);
        console.log('');
    }
    
    /**
     * Limpiar notificaciones antiguas
     */
    cleanOldNotifications() {
        const sent = this.getSentNotifications();
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        const recent = sent.filter(id => {
            // Filtrar solo IDs que contienen fecha
            if (id.includes('2026-')) {
                const dateMatch = id.match(/2026-\d{2}-\d{2}/);
                if (dateMatch) {
                    const notifDate = new Date(dateMatch[0]);
                    return notifDate >= sevenDaysAgo;
                }
            }
            return true; // Mantener otros tipos de IDs
        });
        
        if (recent.length !== sent.length) {
            localStorage.setItem('sentNotifications', JSON.stringify(recent));
            console.log(`🧹 Limpiadas ${sent.length - recent.length} notificaciones antiguas`);
        }
    }
    
    /**
     * Reiniciar sistema
     */
    reset() {
        localStorage.removeItem('sentNotifications');
        localStorage.removeItem('lastDailyCheck');
        this.dailyCheckDone = false;
        console.log('🔄 Sistema reiniciado');
    }
}

// ==================================================
// 🚀 INICIALIZACIÓN AUTOMÁTICA
// ==================================================

// Crear instancia global
window.moonNotifications = new MoonTrackerNotifications();

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            window.moonNotifications.init();
        } else {
            console.log('⏳ Sistema esperando permisos de notificación...');
            console.log('   Click en el botón 🔔 para activar');
        }
    }, 2000);
});

// Reiniciar cuando se otorguen permisos
window.addEventListener('storage', (e) => {
    if (e.key === 'notificationsEnabled' && e.newValue === 'true') {
        if (Notification.permission === 'granted') {
            window.moonNotifications.init();
        }
    }
});

// ==================================================
// 🧪 FUNCIONES DE PRUEBA
// ==================================================

/**
 * Enviar notificación de prueba
 */
window.testNotification = function() {
    window.moonNotifications.sendNotification(
        '🧪 Test Notification',
        'The notification system is working correctly! ✅',
        'personal'
    );
    console.log('✅ Test notification sent');
};

/**
 * Ver próximos eventos
 */
window.showUpcomingNotifications = function() {
    const now = new Date();
    console.log('\n📅 Próximas notificaciones:');
    console.log(`   Resumen diario: Todos los días a las ${notificationConfig.dailyAspectsTime}`);
    console.log(`   Fases lunares: Cuando ocurran a las ${notificationConfig.lunarPhaseTime}`);
    console.log(`   Eventos personales: ${notificationConfig.eventReminderMinutes} minutos antes`);
    console.log(`   Mensajes programados: ${scheduledMessages.length} mensajes`);
    
    // Mostrar próximos 5 mensajes
    const upcoming = scheduledMessages
        .filter(msg => new Date(`${msg.date}T${msg.time}:00`) > now)
        .sort((a, b) => new Date(`${a.date}T${a.time}:00`) - new Date(`${b.date}T${b.time}:00`))
        .slice(0, 5);
    
    console.log('\n📬 Próximos mensajes programados:');
    upcoming.forEach(msg => {
        console.log(`   ${msg.date} ${msg.time} - ${msg.message.substring(0, 50)}...`);
    });
};

/**
 * Simular resumen diario
 */
window.testDailyAspects = function() {
    const now = new Date();
    window.moonNotifications.sendDailyAspectsNotification(now);
    console.log('✅ Resumen diario simulado');
};

/**
 * Reiniciar notificaciones enviadas
 */
window.resetNotifications = function() {
    window.moonNotifications.reset();
};

// Limpiar notificaciones antiguas al cargar
window.moonNotifications.cleanOldNotifications();

console.log('✅ Sistema completo de notificaciones cargado');
console.log('\n🎮 Comandos de prueba:');
console.log('   window.testNotification() - Enviar notificación de prueba');
console.log('   window.testDailyAspects() - Simular resumen diario');
console.log('   window.showUpcomingNotifications() - Ver próximas notificaciones');
console.log('   window.resetNotifications() - Reiniciar sistema');
