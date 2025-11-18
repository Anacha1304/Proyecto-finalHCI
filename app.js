function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();

    // Formato 12h
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;

    // Minutos con cero (ej: 09)
    if (minutes < 10) minutes = "0" + minutes;

    document.getElementById("currentTime").textContent = `${hours}:${minutes} ${ampm}`;
}

// Actualizar de inmediato
updateClock();
// Y actualizar cada minuto
setInterval(updateClock, 1000 * 60);

// JS funcionando = indicador verde
document.getElementById("jsIndicator").style.color = "green";


// 📌 Datos dinámicos de cada programa (tiempo, temp, spin)
const programData = {
    "Delicado": {
        time: "1 h 15 min",
        finish: "10:45 am",
        temp: "40ºC",
        spin: "1200"
    },
    "Colores": {
        time: "1 h 30 min",
        finish: "11:00 am",
        temp: "50ºC",
        spin: "1100"
    },
    "Ropa blanca": {
        time: "1 h 50 min",
        finish: "11:20 am",
        temp: "60ºC",
        spin: "1400"
    },
    "Ropa oscura": {
        time: "1 h 20 min",
        finish: "11:05 am",
        temp: "40ºC",
        spin: "1000"
    },
    "Lavado Rápido": {
        time: "2 h 10 min",
        finish: "12:00 pm",
        temp: "70ºC",
        spin: "1500"
    },
    "Centrifugar": {
        time: "1h 5 min",
        finish: "10:10 am",
        temp: "35ºC",
        spin: "900"
    },
    "Ropa de bebé": {
        time: "1 h 40 min",
        finish: "11:15 am",
        temp: "45ºC",
        spin: "1000"
    }
};

function updateProgramUI() {
    const name = currentProgram.name;
    document.getElementById("programName").textContent = name;

    const data = programData[name];

    if (data) {
        document.getElementById("programTemp").textContent = data.temp;
        document.getElementById("programSpin").textContent = data.spin;
        document.getElementById("programTime").textContent = data.time;

        // 🔥 calcular hora final dinámicamente
        const now = new Date();

        const match = data.time.match(/(\d+)\s*h\s*(\d+)?/);
        let addHours = parseInt(match[1]) || 0;
        let addMinutes = parseInt(match[2]) || 0;

        now.setHours(now.getHours() + addHours);
        now.setMinutes(now.getMinutes() + addMinutes);

        let hours = now.getHours();
        let minutes = now.getMinutes().toString().padStart(2, "0");

        const ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12;
        hours = hours ? hours : 12;

        document.getElementById("finishTime").textContent = `${hours}:${minutes} ${ampm}`;
    }
}


/* --- Sistema de alertas --- */
function showAlert(msg, type = "success") {
    const alertBox = document.getElementById("alertBox");
    const msgBox = document.getElementById("alertMessage");

    msgBox.textContent = msg;

    alertBox.classList.remove("hidden", "success", "error");
    alertBox.classList.add(type, "show");

    clearTimeout(showAlert.timeout);
    showAlert.timeout = setTimeout(() => {
        alertBox.classList.remove("show");
        setTimeout(() => alertBox.classList.add("hidden"), 300);
    }, 2600);
}

/* --- Programas --- */
const programs = {
    delicado: { name: "Delicado", allowed: ["delicate", "light"] },
    colores: { name: "Colores", allowed: ["red", "blue", "light", "jeans"] },
    blanca: { name: "Ropa blanca", allowed: ["white"] },
    oscura: { name: "Ropa oscura", allowed: ["dark", "black", "red", "jeans"] },
    toallas: { name: "Lavado Rápido", allowed: ["towel", "white"] },
    deportivo: { name: "Centrifugar", allowed: ["sport", "light", "synthetic"] },
    bebe: { name: "Ropa de bebé", allowed: ["delicate", "white", "baby"] }
};

const clothingMap = {
    0: "towel", 1: "white", 2: "light", 3: "dark", 4: "red", 5: "blue",
    5: "delicate", 6: "black", 7: "towel", 8: "sport", 9: "sport",
    10: "synthetic", 11: "jeans", 12: "baby"
};

const clothingNames = {
    white: "Ropa blanca",
    light: "Ropa clara",
    dark: "Ropa oscura",
    red: "Ropa roja",
    blue: "Ropa azul",
    black: "Ropa negra",
    delicate: "Prenda delicada",
    towel: "Toalla",
    sport: "Ropa deportiva",
    baby: "Ropa de bebé",
    synthetic: "Tela sintética",
    jeans: "jeans"
};

// Fiducials que cambian el programa completo
const programFiducials = {
    24: "bebe",        // Ropa de bebé
    25: "delicado",    // Delicado
    26: "colores",     // Colores
    27: "blanca",      // Ropa blanca
    28: "oscura",      // Oscura
    29: "toallas",     // Toallas
    30: "deportivo"    // Ropa deportiva
};


let currentProgram = programs.delicado;

const programOrder = [
    "delicado", "colores", "blanca", "oscura",
    "toallas", "deportivo", "bebe"
];

let programIndex = 0;

// 🔥 Cargar ajustes guardados del programa si existen
const saved = getProgramSettings(currentProgram.name);
if (saved) {
    programData[currentProgram.name].temp = saved.temp;
    programData[currentProgram.name].spin = saved.spin;
}


document.getElementById("programBtn").addEventListener("click", () => {
    programIndex = (programIndex + 1) % programOrder.length;
    currentProgram = programs[programOrder[programIndex]];
    // 🔧 Cargar memorias del programa seleccionado
    const saved = getProgramSettings(currentProgram.name);
    if (saved) {
        programData[currentProgram.name].temp = saved.temp;
        programData[currentProgram.name].spin = saved.spin;
    }
    updateProgramUI();


    const name = currentProgram.name;
    document.getElementById("programName").textContent = name;

    // ⭐ ACTUALIZA los datos dinámicos usando programData
    const data = programData[name];

    if (data) {
        document.getElementById("programTemp").textContent = data.temp;
        document.getElementById("programSpin").textContent = data.spin;

        document.getElementById("programTime").textContent = data.time;
            // 🔥 Calcular hora final real
    const now = new Date();

    // Extraer horas y minutos del texto "1 h 15 min"
    const match = data.time.match(/(\d+)\s*h\s*(\d+)?/);

    let addHours = parseInt(match[1]) || 0;
    let addMinutes = parseInt(match[2]) || 0;

    // Sumar al tiempo actual
    now.setHours(now.getHours() + addHours);
    now.setMinutes(now.getMinutes() + addMinutes);

    let hours = now.getHours();
    let minutes = now.getMinutes().toString().padStart(2, "0");

    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;

    const finalTime = `${hours}:${minutes} ${ampm}`;

    document.getElementById("finishTime").textContent = finalTime;
}

    showAlert(`Programa cambiado a ${name}`, "success");
});


/* --- Fiducial --- */
function handleFiducial(id) {
    // 🔥 CORRECCIÓN: convertir 55 en 15
    if (id === 55) {
        console.log("⚠ Ajustando ID 55 → 15 por error de lectura");
        id = 15;
    }


    // 🟦 0. Si NO hay objeto → limpiar
    if (id == -1) {
        resetFiducialView();
        clearOverlay();
        hideText();
        return;
    }

    // 🟥 1. PRIORIDAD MÁXIMA → ERROR DE LAVADORA
    if (id === 15) {
        console.log("👀 FIDUCIAL 15 DETECTADO → MOSTRAR ERROR");
        showErrorOverlay();
        return;
    }

    // 🟥 1.2 FALLA DE MOTOR (FIDUCIAL 16)
    if (id === 16) {
        console.log("👀 FIDUCIAL 16 DETECTADO → MOTOR FALLANDO");
        showMotorOverlay();
        return;
    }

    // 🟩 1.3 MOTOR EN BUEN ESTADO (FIDUCIAL 17)
    if (id === 17) {
        console.log("💚 FIDUCIAL 17 DETECTADO → MOTOR OK");
        showMotorOkOverlay();
        return;
    }


    // 🟩 2. Si es un fiducial de programa → cambiar programa
    if (programFiducials[id]) {
        const programKey = programFiducials[id];
        currentProgram = programs[programKey];

        const saved = getProgramSettings(currentProgram.name);
        if (saved) {
            programData[currentProgram.name].temp = saved.temp;
            programData[currentProgram.name].spin = saved.spin;
        }

        updateProgramUI();
        showAlert(`Programa cambiado a ${currentProgram.name} vía código 🔄`, "success");
        return;
    }

    // 🟨 3. Fiducial de ropa → compatibilidad
    updateFiducialImage(id);

    const type = clothingMap[id];
    if (!type) return;

    const name = clothingNames[type];

    if (currentProgram.allowed.includes(type)) {
        showCheck();
        showText(`${clothingNames[type]} ✔ compatible con ${currentProgram.name}`, "success");
    } else {
        showError();
        showText(`${clothingNames[type]} ✖ NO compatible con ${currentProgram.name}`, "error");
    }

    // 🔊 Activación del asistente de voz
    if (typeof voiceFiducialDetected === "function") {
        voiceFiducialDetected(type);
    }
}



const compatOverlay = document.getElementById("compatOverlay");
const compatIcon = document.getElementById("compatIcon");

// FUNCIONES NUEVAS
function showCheck() {
    compatIcon.src = "icons/comprobado.png"; // ⬅️ chulito verde grande
    compatOverlay.classList.remove("hidden");
    setTimeout(() => compatOverlay.classList.add("show"), 50);
}

function showError() {
    compatIcon.src = "icons/boton-x.png"; // ⬅️ equis roja grande
    compatOverlay.classList.remove("hidden");
    setTimeout(() => compatOverlay.classList.add("show"), 50);
}

function clearOverlay() {
    compatOverlay.classList.remove("show");
    setTimeout(() => compatOverlay.classList.add("hidden"), 200);
}

const compatText = document.getElementById("compatText");

function showText(msg, type) {
    compatText.textContent = msg;
    compatText.classList.remove("hidden", "success", "error");
    compatText.classList.add("show", type);
}

function hideText() {
    compatText.classList.remove("show");
    setTimeout(() => compatText.classList.add("hidden"), 200);
}


/* --- WebSocket TUIO --- */
let ws = new WebSocket("ws://localhost:8081/tuio");

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        if (data.id !== undefined) handleFiducial(data.id);
    } catch (error) {
        console.error("Error leyendo WS:", error);
    }
};

function updateFiducialImage(id) {
    const img = document.getElementById("fiducialImg");
    const placeholder = document.getElementById("fiducialPlaceholder");

    img.src = `fiducials/fiducial${id}.png`;
    img.classList.remove("hidden");
    placeholder.classList.add("hidden");
}

function resetFiducialView() {
    const img = document.getElementById("fiducialImg");
    const placeholder = document.getElementById("fiducialPlaceholder");

    img.classList.add("hidden");
    img.src = "";
    placeholder.classList.remove("hidden");
}

function showErrorOverlay() {
    console.log("🔥 MOSTRANDO OVERLAY DE ERROR...");
    const overlay = document.getElementById("errorOverlay");
    overlay.classList.remove("hidden");
    overlay.classList.add("show");
    overlay.style.display = "flex";
    voiceFiducialDetected(15);
}

function closeErrorOverlay() {
    const overlay = document.getElementById("errorOverlay");
    overlay.classList.add("hidden");
    overlay.classList.remove("show");
    overlay.style.display = "none";
}

function showMotorOverlay() {
    console.log("🔥 MOSTRANDO OVERLAY DE FALLA DE MOTOR...");
    const overlay = document.getElementById("motorOverlay");
    overlay.classList.remove("hidden");
    overlay.classList.add("show");
    overlay.style.display = "flex";
    voiceFiducialDetected(16);
}

function closeMotorOverlay() {
    const overlay = document.getElementById("motorOverlay");
    overlay.classList.add("hidden");
    overlay.classList.remove("show");
    overlay.style.display = "none";
}

function showMotorOkOverlay() {
    console.log("💚 FIDUCIAL 17 → MOTOR EN BUEN ESTADO");
    const overlay = document.getElementById("motorOkOverlay");
    overlay.classList.remove("hidden");
    overlay.classList.add("show");
    overlay.style.display = "flex";
    voiceFiducialDetected(17);
}

function closeMotorOkOverlay() {
    const overlay = document.getElementById("motorOkOverlay");
    overlay.classList.add("hidden");
    overlay.classList.remove("show");
    overlay.style.display = "none";
}



/* --- Botón Iniciar → Pausa / Detener --- */
// 🔥 Ahora app.js solo llama a la pantalla de reposo
document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startBtn");
    if (startBtn) {
        startBtn.addEventListener("click", () => {
            showAlert("Lavado iniciado ✔", "success");
            openRestScreen();   // ⬅️ Esto viene de reposo.js
        });
    }
});



/* ====================================================
      🔥 SISTEMA DE NAVEGACIÓN ENTRE PANTALLAS 🔥
==================================================== */

const bottomItems = document.querySelectorAll(".bottom-item");
const screens = document.querySelectorAll(".screen");

bottomItems.forEach(item => {
    item.addEventListener("click", () => {

        // 1. Actualizar ítem activo
        bottomItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");

        // 2. Mostrar la pantalla correcta
        const target = item.getAttribute("data-screen");

        screens.forEach(screen => {
            if (screen.id === `screen-${target}`) {
                screen.classList.add("active");
                screen.classList.remove("hidden");
            } else {
                screen.classList.remove("active");
                screen.classList.add("hidden");
            }
        });

    });
});

updateProgramUI();


