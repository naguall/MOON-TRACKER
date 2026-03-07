/**
 * SISTEMA DE MENSAJES AUTOMÁTICOS PARA CALENDARIO LUNAR
 * 
 * Integración completa con el calendario HTML existente
 * - Lee mensajes desde un array JavaScript
 * - Programa notificaciones automáticas
 * - Verifica y envía a la hora exacta
 * - Persistencia de mensajes enviados
 */

// ==================================================
// CONFIGURACIÓN DE MENSAJES
// ==================================================

const scheduledMessages = [
    // Formato: { date: 'YYYY-MM-DD', time: 'HH:MM', message: 'texto', type: 'lunar|planetary|personal' }
    
    // ENERO 2027
    { date: '2027-01-07', time: '08:00', message: 'Luna nueva en Capricornio - Inicia ciclo de estructura y disciplina. Semilla de responsabilidad plantada.', type: 'lunar' },
    { date: '2027-01-15', time: '20:00', message: 'Marte entra en Leo - Energía creativa y expresiva disponible. Impulso busca visibilidad.', type: 'planetary' },
    { date: '2027-01-20', time: '12:30', message: 'Reflexión semanal - ¿Qué sembraste esta semana? Pausa para integrar.', type: 'personal' },
    { date: '2027-01-22', time: '07:00', message: 'Cuarto creciente - Energía de expansión. Los proyectos iniciados encuentran resistencia productiva.', type: 'lunar' },
    
    // FEBRERO 2027
    { date: '2027-02-06', time: '06:30', message: 'Luna llena en Leo - Culminación de ciclo de creatividad iniciado hace 6 meses. Revelación sobre autenticidad.', type: 'lunar' },
    { date: '2027-02-13', time: '19:00', message: 'Venus entra en Piscis - Disolución de límites relacionales. Mayor porosidad emocional disponible.', type: 'planetary' },
    { date: '2027-02-20', time: '09:00', message: 'Luna nueva en Acuario - Inicio de ciclo de innovación y colectividad. Semilla de libertad plantada.', type: 'lunar' },
    
    // MARZO 2027
    { date: '2027-03-08', time: '14:30', message: 'Saturno cuadratura Urano - Tensión entre estructura y cambio. Fricción que puede catalizar transformación.', type: 'planetary' },
    { date: '2027-03-15', time: '18:00', message: 'Luna llena en Virgo - Culminación de perfeccionamiento. Cosecha de lo refinado en los últimos 6 meses.', type: 'lunar' },
    { date: '2027-03-20', time: '11:00', message: 'Luna nueva en Piscis - Inicio de ciclo de disolución y fe. Semilla de rendición plantada.', type: 'lunar' },
    { date: '2027-03-20', time: '14:46', message: 'Equinoccio de Primavera - Sol entra en Aries. Impulso hacia lo nuevo. Energía de iniciación.', type: 'planetary' },
    
    // Agregar más mensajes según necesites...
];

// ==================================================
// CLASE PRINCIPAL
// ==================================================

class AutomaticMessagesSystem {
    constructor() {
        this.messages = scheduledMessages;
        this.checkInterval = null;
        this.sentMessagesKey = 'sentMessages';
        this.lastCheckKey = 'lastMessageCheck';
    }
    
    /**
     * Inicializar sistema
     */
    init() {
        console.log('🔔 Iniciando sistema de mensajes automáticos...');
        
        // Verificar permisos de notificación
        if (!('Notification' in window)) {
            console.warn('⚠️ Notificaciones no soportadas en este navegador');
            return;
        }
        
        // Cargar mensajes ya enviados
        this.loadSentMessages();
        
        // Verificar inmediatamente
        this.checkAndSendMessages();
        
        // Verificar cada minuto
        this.checkInterval = setInterval(() => {
            this.checkAndSendMessages();
        }, 60000); // 60 segundos
        
        console.log('✅ Sistema de mensajes iniciado');
        console.log(`   Mensajes programados: ${this.messages.length}`);
        console.log(`   Próximo check: en 1 minuto`);
    }
    
    /**
     * Detener sistema
     */
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            console.log('🛑 Sistema de mensajes detenido');
        }
    }
    
    /**
     * Verificar y enviar mensajes pendientes
     */
    checkAndSendMessages() {
        const now = new Date();
        const currentDate = this.formatDate(now);
        const currentTime = this.formatTime(now);
        
        // Guardar última verificación
        localStorage.setItem(this.lastCheckKey, now.toISOString());
        
        // Buscar mensajes para enviar
        const pendingMessages = this.messages.filter(msg => {
            const msgDateTime = `${msg.date} ${msg.time}`;
            const msgDate = new Date(`${msg.date}T${msg.time}:00`);
            
            // Solo mensajes de hoy a esta hora (±2 minutos)
            const timeDiff = Math.abs(now - msgDate);
            const isNow = timeDiff < 120000; // 2 minutos en milisegundos
            
            // Verificar si ya fue enviado
            const alreadySent = this.wasMessageSent(msgDateTime);
            
            return isNow && !alreadySent;
        });
        
        // Enviar mensajes pendientes
        pendingMessages.forEach(msg => {
            this.sendMessage(msg);
        });
        
        if (pendingMessages.length > 0) {
            console.log(`📨 Enviados ${pendingMessages.length} mensajes`);
        }
    }
    
    /**
     * Enviar un mensaje
     */
    sendMessage(msg) {
        const msgId = `${msg.date} ${msg.time}`;
        
        console.log('📤 Enviando mensaje:', msg.message.substring(0, 50) + '...');
        
        // Verificar permisos
        if (Notification.permission === 'granted') {
            // Crear notificación
            const notification = new Notification(
                this.getNotificationTitle(msg.type),
                {
                    body: msg.message,
                    icon: this.getNotificationIcon(msg.type),
                    badge: '/icon-72.png',
                    tag: msgId,
                    requireInteraction: false,
                    silent: false
                }
            );
            
            // Click en notificación
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            
            // Marcar como enviado
            this.markMessageAsSent(msgId);
            
            console.log('✅ Notificación enviada');
        } else {
            console.warn('⚠️ Permisos de notificación no otorgados');
        }
    }
    
    /**
     * Obtener título según tipo de mensaje
     */
    getNotificationTitle(type) {
        const titles = {
            lunar: '🌙 Fase Lunar',
            planetary: '⭐ Aspecto Planetario',
            personal: '💫 Reflexión Personal'
        };
        return titles[type] || '📅 Calendario Lunar';
    }
    
    /**
     * Obtener icono según tipo
     */
    getNotificationIcon(type) {
        // Usar iconos del calendario si existen
        const icons = {
            lunar: '/icon-192.png',
            planetary: '/icon-192.png',
            personal: '/icon-192.png'
        };
        return icons[type] || '/icon-192.png';
    }
    
    /**
     * Verificar si un mensaje ya fue enviado
     */
    wasMessageSent(msgId) {
        const sent = this.getSentMessages();
        return sent.includes(msgId);
    }
    
    /**
     * Marcar mensaje como enviado
     */
    markMessageAsSent(msgId) {
        const sent = this.getSentMessages();
        if (!sent.includes(msgId)) {
            sent.push(msgId);
            localStorage.setItem(this.sentMessagesKey, JSON.stringify(sent));
        }
    }
    
    /**
     * Obtener lista de mensajes enviados
     */
    getSentMessages() {
        const stored = localStorage.getItem(this.sentMessagesKey);
        return stored ? JSON.parse(stored) : [];
    }
    
    /**
     * Cargar mensajes enviados
     */
    loadSentMessages() {
        const sent = this.getSentMessages();
        console.log(`📋 Mensajes ya enviados: ${sent.length}`);
        
        // Limpiar mensajes antiguos (más de 30 días)
        this.cleanOldSentMessages();
    }
    
    /**
     * Limpiar mensajes enviados antiguos
     */
    cleanOldSentMessages() {
        const sent = this.getSentMessages();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const recent = sent.filter(msgId => {
            const [date] = msgId.split(' ');
            const msgDate = new Date(date);
            return msgDate >= thirtyDaysAgo;
        });
        
        if (recent.length !== sent.length) {
            localStorage.setItem(this.sentMessagesKey, JSON.stringify(recent));
            console.log(`🧹 Limpiados ${sent.length - recent.length} mensajes antiguos`);
        }
    }
    
    /**
     * Formatear fecha YYYY-MM-DD
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * Formatear hora HH:MM
     */
    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    /**
     * Obtener próximos mensajes (para vista previa)
     */
    getUpcomingMessages(limit = 10) {
        const now = new Date();
        
        return this.messages
            .filter(msg => {
                const msgDate = new Date(`${msg.date}T${msg.time}:00`);
                return msgDate > now;
            })
            .sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}:00`);
                const dateB = new Date(`${b.date}T${b.time}:00`);
                return dateA - dateB;
            })
            .slice(0, limit);
    }
    
    /**
     * Agregar mensaje programáticamente
     */
    addMessage(date, time, message, type = 'personal') {
        this.messages.push({ date, time, message, type });
        console.log(`➕ Mensaje agregado: ${date} ${time}`);
    }
    
    /**
     * Reiniciar mensajes enviados (para testing)
     */
    resetSentMessages() {
        localStorage.removeItem(this.sentMessagesKey);
        console.log('🔄 Mensajes enviados reiniciados');
    }
}

// ==================================================
// INTEGRACIÓN CON EL CALENDARIO
// ==================================================

// Crear instancia global
window.automaticMessages = new AutomaticMessagesSystem();

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que las notificaciones estén habilitadas
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            window.automaticMessages.init();
        } else {
            console.log('⏳ Esperando permisos de notificación...');
        }
    }, 2000);
});

// Reiniciar cuando se otorguen permisos
window.addEventListener('notificationPermissionChanged', () => {
    if (Notification.permission === 'granted') {
        window.automaticMessages.init();
    }
});

// ==================================================
// FUNCIONES AUXILIARES PARA UI
// ==================================================

/**
 * Mostrar próximos mensajes en el calendario
 */
function showUpcomingMessages() {
    const upcoming = window.automaticMessages.getUpcomingMessages(5);
    
    let html = '<div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px;">';
    html += '<h3 style="margin-bottom: 10px;">📅 Próximos Mensajes</h3>';
    
    if (upcoming.length === 0) {
        html += '<p style="color: rgba(255,255,255,0.6);">No hay mensajes programados próximamente.</p>';
    } else {
        upcoming.forEach(msg => {
            const icon = msg.type === 'lunar' ? '🌙' : msg.type === 'planetary' ? '⭐' : '💫';
            html += `
                <div style="margin-bottom: 10px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                    <div style="font-size: 0.85em; color: rgba(255,255,255,0.6);">${icon} ${msg.date} ${msg.time}</div>
                    <div style="margin-top: 4px;">${msg.message}</div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    
    return html;
}

/**
 * Botón para ver próximos mensajes (agregar al HTML)
 */
function createMessagesPreviewButton() {
    const button = document.createElement('button');
    button.innerHTML = '📬 Próximos Mensajes';
    button.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        padding: 12px 20px;
        background: rgba(102, 126, 234, 0.9);
        border: none;
        border-radius: 25px;
        color: white;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 999;
    `;
    
    button.onclick = () => {
        alert('Feature: Mostrar modal con próximos mensajes\n(Implementar según diseño del calendario)');
        // Aquí puedes abrir un modal con showUpcomingMessages()
    };
    
    document.body.appendChild(button);
}

// ==================================================
// TESTING & DEBUG
// ==================================================

// Función de testing (eliminar en producción)
window.testMessage = function() {
    const now = new Date();
    const testMsg = {
        date: window.automaticMessages.formatDate(now),
        time: window.automaticMessages.formatTime(now),
        message: '🧪 Mensaje de prueba - El sistema funciona correctamente',
        type: 'personal'
    };
    
    window.automaticMessages.sendMessage(testMsg);
    console.log('✅ Mensaje de prueba enviado');
};

console.log('✅ Sistema de mensajes automáticos cargado');
console.log('   Comandos disponibles:');
console.log('   - window.automaticMessages.init() - Iniciar sistema');
console.log('   - window.automaticMessages.getUpcomingMessages() - Ver próximos');
console.log('   - window.automaticMessages.resetSentMessages() - Reiniciar enviados');
console.log('   - window.testMessage() - Enviar mensaje de prueba');
