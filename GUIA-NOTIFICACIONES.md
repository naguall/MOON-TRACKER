# 🔔 SISTEMA DE NOTIFICACIONES - GUÍA COMPLETA

## ⚠️ LIMITACIONES IMPORTANTES

### **1. LA APP DEBE ESTAR ABIERTA**
Las notificaciones **SOLO funcionan** cuando:
- ✅ El navegador está abierto
- ✅ La pestaña de Moon Tracker está activa (o en segundo plano)

**NO funcionan:**
- ❌ Navegador cerrado
- ❌ Computadora apagada
- ❌ App cerrada

**Esto es una limitación de las notificaciones web.** Para notificaciones cuando la app está cerrada necesitarías:
- Backend con servidor
- Sistema de push notifications
- O una app móvil nativa

---

## 🧪 CÓMO PROBAR QUE FUNCIONA

### **TEST 1: Notificación Inmediata**

1. **Crea un evento AHORA:**
   - Hora: La hora actual (ej: 14:25)
   - Recordatorio: ☑️ A la hora exacta

2. **Espera 1 minuto**

3. **Resultado esperado:**
   - ⚠️ **NO** recibirás notificación
   - **Razón:** El sistema verifica cada 5 minutos

---

### **TEST 2: Notificación en 10 Minutos (RECOMENDADO)**

1. **Mira la hora:** 14:25

2. **Crea evento:**
   - Título: "Test Notificación"
   - Hora: **14:35** (10 min después)
   - Recordatorio: ☑️ 15 minutos antes

3. **Espera hasta 14:20** (15 min antes del evento)

4. **Resultado esperado:**
   - ✅ A las **14:20** recibes: "15 minutes before: Test Notificación"

---

### **TEST 3: Múltiples Recordatorios**

1. **Crea evento mañana mismo día, 1 hora adelante:**
   - Título: "Reunión"
   - Fecha: Mañana
   - Hora: La hora actual + 1 hora
   - Recordatorios:
     - ☑️ 1 día antes
     - ☑️ 1 hora antes
     - ☑️ 15 minutos antes

2. **Resultado:**
   - **Hoy a esta hora:** "1 day before: Reunión"
   - **Mañana (1h antes):** "1 hour before: Reunión"
   - **Mañana (15min antes):** "15 minutes before: Reunión"

---

## ⏰ FRECUENCIA DE VERIFICACIÓN

El sistema verifica notificaciones cada **5 minutos**.

**Ejemplo:**
- Evento a las 14:30
- Recordatorio: 15 min antes (14:15)
- Sistema verifica a: 14:10, 14:15, 14:20...
- **Notificación llega:** Entre 14:15 y 14:20

**Margen de error:** ±5 minutos

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### **Problema: No recibo notificaciones**

**Verificaciones:**

1. **¿Tienes permiso activado?**
   - Click en 🔔 arriba derecha
   - Debe estar en verde/activo

2. **¿La app está abierta?**
   - Pestaña puede estar en segundo plano
   - Pero navegador debe estar abierto

3. **¿Pasaron 5 minutos?**
   - El sistema NO verifica instantáneamente
   - Espera hasta el próximo ciclo de verificación

4. **¿El evento tiene hora?**
   - Eventos SIN hora NO generan notificaciones
   - Solo eventos CON hora específica

5. **¿Configuración del navegador?**
   - Chrome: Configuración → Privacidad → Notificaciones
   - Verifica que el sitio esté en "Permitido"

---

## 📊 TIPOS DE NOTIFICACIONES

### **1. Eventos Personales** 📅
- Se envían según los recordatorios que marcaste
- Requiere que el evento tenga hora
- Margen: ±5 minutos

### **2. Aspectos Planetarios** ⭐
- Se envían UNA VEZ al día
- Hora: Al iniciar el día (entre 00:00 y 05:00)
- Solo si hay aspectos importantes

### **3. Mensajes CSV** 💫
- Se envían a la hora exacta del CSV
- Ejemplo: `2026-03-10,08:00,Mensaje,personal`
- Margen: ±2 minutos

---

## ✅ TEST RÁPIDO (5 MINUTOS)

**Para verificar que TODO funciona:**

1. Mira la hora: **14:25**

2. Crea evento:
   - Título: "Test"
   - Hora: **14:30**
   - Recordatorio: ☑️ 15 minutos antes

3. **Espera hasta 14:15** (ahora - 10 min)

4. **Refresca la página** (para que cargue el evento)

5. **Espera 5-10 minutos**

6. **Resultado:** Deberías recibir notificación entre 14:15 y 14:20

---

## 🚀 NOTIFICACIONES CUANDO APP CERRADA (FUTURO)

**Opciones avanzadas:**

### **Opción 1: Backend + Push Notifications**
- Servidor Node.js
- Firebase Cloud Messaging
- Funciona con app cerrada
- ⚠️ Requiere programación backend

### **Opción 2: App Móvil Nativa**
- React Native o Flutter
- Notificaciones locales del sistema
- Funciona con app cerrada
- ⚠️ Requiere desarrollo de app

### **Opción 3: PWA Mejorada**
- Service Worker avanzado
- Background Sync API
- Funciona con app cerrada (limitado)
- ⚠️ No todos los navegadores lo soportan

**Por ahora:** La versión web actual funciona **solo con app abierta**.

---

## 📝 RESUMEN

✅ **Funcionan:**
- Recordatorios de eventos (app abierta)
- Notificaciones programadas del CSV
- Resumen diario de aspectos

❌ **NO funcionan:**
- Notificaciones con app cerrada
- Notificaciones instantáneas (hay delay de 5 min)
- Notificaciones sin hora específica

⏰ **Timing:**
- Verificación cada 5 minutos
- Margen de error: ±5 minutos
- Notificaciones exactas solo para CSV (±2 min)

🔔 **Requisitos:**
- Permisos de notificación activados
- App abierta en navegador
- Evento con hora específica
- Recordatorios marcados

---

**¿Preguntas? Usa los tests arriba para verificar que funcione.** 🚀
