/* ================================
   🔥 ELEMENTOS
================================ */
const restOverlay = document.getElementById("restOverlay");

const remainingTimeEl = document.getElementById("remainingTime");
const finishRestTimeEl = document.getElementById("finishRestTime");
const programNameRest = document.getElementById("programNameRest");
const programTempRest = document.getElementById("programTempRest");
const programSpinRest = document.getElementById("programSpinRest");

const pausePlayBtn = document.getElementById("pausePlayBtn");
const circleIcon = document.getElementById("circleIcon");
const smallStopBtn = document.getElementById("smallStopBtn");

/* ================================
   🔥 VARIABLES
================================ */
let timer = null;
let paused = false;

let totalMs = 0;
let startTime = null;
let endTime = null;

let pauseTimestamp = null;
const SPEED = 200; 



/* ============================================
      🔥 ABRIR PANTALLA Y EMPEZAR LAVADO
============================================ */
function openRestScreen() {
    // Mostrar overlay
    restOverlay.classList.remove("hidden");
    setTimeout(() => restOverlay.classList.add("show"), 20);

    // Cargar datos del programa actual (Delicado, Colores, etc.)
    loadProgramData();

    // Iniciar cuenta regresiva
    startCountdown();
}


/* ============================================
   🔥 CARGAR DATOS DEL PROGRAMA ACTUAL
============================================ */
function loadProgramData() {
    const data = programData[currentProgram.name];

    programNameRest.textContent = currentProgram.name;
    programTempRest.textContent = data.temp;
    programSpinRest.textContent = data.spin;

    // Sacar horas + minutos de "1 h 15 min"
    const match = data.time.match(/(\d+)\s*h\s*(\d+)?/);
    const h = parseInt(match[1]) || 0;
    const m = parseInt(match[2]) || 0;

    totalMs = (h * 60 * 60 * 1000) + (m * 60 * 1000);

    startTime = Date.now();
    endTime   = startTime + totalMs;

    // Hora de finalización fija (solo cambia si se pausa)
    finishRestTimeEl.textContent = getFinishHour(endTime);
}


/* ============================================
      🔥 INICIAR EL TEMPORIZADOR
============================================ */
function startCountdown() {
    clearInterval(timer);
    timer = setInterval(updateCountdown, 1000);
    updateCountdown(); // para que actualice de una
}


/* ============================================
      🔥 ACTUALIZAR TIEMPO
============================================ */
function updateCountdown() {
    if (paused) return;

    const now = Date.now();
    const elapsedReal = now - startTime;

    // 🔥 Simular velocidad acelerada
    const elapsedSim = elapsedReal * SPEED;
    let remaining = totalMs - elapsedSim;
    if (remaining < 0) remaining = 0;

    // Mostrar
    remainingTimeEl.textContent = formatTime(remaining);

    // ⬇⬇ ACTUALIZA LOS PUNTICOS
    const progress = elapsedSim / totalMs;
    updateSteps(progress);

    if (remaining <= 0) {

        addWashHistory({
            program: currentProgram.name,
            date: new Date().toISOString().split("T")[0],
            duration: formatTime(totalMs),
            temp: programTempRest.textContent
        });

        // Detenemos el timer aquí para que no se siga llamando
        clearInterval(timer);

        // Cerramos pantalla de reposo y volvemos al inicio
        stopAll();

        // Mensaje de éxito
        showAlert("Lavado finalizado ✔", "success");
        return;
    }
}

/* ============================================
      🔥 PAUSAR / REANUDAR
============================================ */
pausePlayBtn.addEventListener("click", () => {

    if (!paused) {
        // PAUSAR
        paused = true;
        clearInterval(timer);
        pauseTimestamp = Date.now();

        circleIcon.textContent = "▶"; // Mostrar play
        showAlert("Lavado en pausa ⏸", "success");

    } else {
        // REANUDAR
        paused = false;

        const pausedFor = Date.now() - pauseTimestamp;
        startTime += pausedFor;
        endTime   += pausedFor;

        circleIcon.textContent = "⏸"; // Mostrar pausa

        startCountdown();
        showAlert("Lavado reanudado ▶", "success");
    }
});


/* ============================================
      🔥 DETENER (reset total + volver a inicio)
============================================ */
smallStopBtn.addEventListener("click", stopAll);

function stopAll() {
    clearInterval(timer);
    paused = false;

    // Reset visual de la pantalla de reposo
    circleIcon.textContent       = "⏸";
    remainingTimeEl.textContent  = "--";
    finishRestTimeEl.textContent = "--";

    // Cerrar overlay inmediatamente
    restOverlay.classList.remove("show");
    restOverlay.classList.add("hidden");

    // Volver a la pantalla de inicio
    const home    = document.getElementById("screen-home");
    const screens = document.querySelectorAll(".screen");

    screens.forEach(s => {
        s.classList.add("hidden");
        s.classList.remove("active");
    });

    home.classList.remove("hidden");
    home.classList.add("active");

    showAlert("Lavado detenido ⏹", "error");
}


/* ============================================
      🔥 FORMATOS
============================================ */
function formatTime(ms) {
    let s = Math.floor(ms / 1000);
    let m = Math.floor(s / 60);
    let h = Math.floor(m / 60);

    s %= 60;
    m %= 60;

    if (h > 0) return `${h} h ${m} min ${s} s`;
    if (m > 0) return `${m} min ${s} s`;

    return `${s} s`;
}

function getFinishHour(endMs) {
    const d = new Date(endMs);
    let h = d.getHours();
    let m = d.getMinutes().toString().padStart(2, "0");

    const ampm = h >= 12 ? "pm" : "am";
    h = (h % 12) || 12;

    return `${h}:${m} ${ampm}`;
}


function updateSteps(progress) {
    const steps = document.querySelectorAll(".step-circle");
    const stepCount = steps.length;

    // El ancho real que debe alcanzar el centro del paso
    const stepZone = 1 / (stepCount - 1);

    // Determinar en qué paso estamos
    let activeStep = Math.floor(progress / stepZone);

    steps.forEach((step, index) => {
        step.classList.toggle("active", index <= activeStep);
    });

    // Actualizar línea azul
    document.getElementById("stepsProgress").style.width = (progress * 100) + "%";
}


/* ====================================================
   🌟 HACER FUNCIONES GLOBALES PARA VOZ
==================================================== */

// PAUSAR DESDE ASISTENTE
window.pauseRestScreen = function () {
    if (!paused) {
        paused = true;
        clearInterval(timer);
        pauseTimestamp = Date.now();
        circleIcon.textContent = "▶";
        showAlert("Lavado en pausa ⏸", "success");
    }
};

// REANUDAR DESDE ASISTENTE
window.resumeRestScreen = function () {
    if (paused) {
        paused = false;
        const pausedFor = Date.now() - pauseTimestamp;
        startTime += pausedFor;
        endTime += pausedFor;

        circleIcon.textContent = "⏸";
        startCountdown();

        showAlert("Lavado reanudado ▶", "success");
    }
};

// DETENER DESDE ASISTENTE
window.stopRestScreen = function () {
    stopAll(); // usamos tu función real
};
