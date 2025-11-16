/* ========== ELEMENTOS ========== */
const restOverlay = document.getElementById("restOverlay");
const restBar = document.getElementById("restBar");
const elapsedText = document.getElementById("elapsedTime");
const remainingText = document.getElementById("remainingTime");

let washTimer = null;
let startTimestamp = null;
let endTimestamp = null;
let totalMillis = 0;
let washing = false;
let paused = false;

let totalSeconds = 0;
let elapsedSeconds = 0;
let interval = null;

// Para reanudar
let pauseTimestamp = null;
let accumulatedPausedTime = 0;



/* ============================================
   🔥 ABRIR PANTALLA DE REPOSO
============================================ */
function openRestScreen() {
    restOverlay.classList.remove("hidden");
    setTimeout(() => restOverlay.classList.add("show"), 20);

    startWashProgress();
}

/* ============================================
   🔥 CERRAR
============================================ */
function closeRestScreen() {
    restOverlay.classList.remove("show");
    setTimeout(() => restOverlay.classList.add("hidden"), 500);

    clearInterval(washTimer);
}

/* ============================================
   🔥 INICIAR PROGRESO REAL
============================================ */
function startWashProgress() {

    /* 1️⃣ Obtener tiempo del programa */
    const timeString = programData[currentProgram.name].time;
    const match = timeString.match(/(\d+)\s*h\s*(\d+)?/);

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;

    /* 2️⃣ Inicio y fin reales */
    startTimestamp = Date.now();
    totalMillis = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
    endTimestamp = startTimestamp + totalMillis;

    /* 3️⃣ Iniciar intervalo REAL */
    washTimer = setInterval(() => {

        const now = Date.now();

        const elapsed = now - startTimestamp;
        let remaining = endTimestamp - now;
        if (remaining < 0) remaining = 0;

        elapsedText.textContent = formatTime(elapsed);
        remainingText.textContent = formatTime(remaining);

        let progress = elapsed / totalMillis;
        if (progress > 1) progress = 1;

        restBar.style.width = (progress * 100) + "%";

        if (remaining <= 0) {
            clearInterval(washTimer);
            closeRestScreen();
            showAlert("Lavado finalizado ✔", "success");
        }

    }, 1000);
}


function runTimer() {
    const now = Date.now();

    const elapsed = now - startTimestamp;
    let remaining = endTimestamp - now;
    if (remaining < 0) remaining = 0;

    elapsedText.textContent = formatTime(elapsed);
    remainingText.textContent = formatTime(remaining);

    let progress = elapsed / totalMillis;
    if (progress > 1) progress = 1;
    restBar.style.width = (progress * 100) + "%";

    if (remaining <= 0) {
        clearInterval(washTimer);
        closeRestScreen();
        showAlert("Lavado finalizado ✔", "success");
    }
}


/* ============================================
   🔥 Convertir milisegundos a "1 h 20 min"
============================================ */
function formatTime(ms) {
    let totalSec = Math.floor(ms / 1000);
    let totalMin = Math.floor(totalSec / 60);
    let totalHrs = Math.floor(totalMin / 60);

    let sec = totalSec % 60;
    let min = totalMin % 60;

    // formato para siempre mostrar 2 dígitos
    sec = sec.toString().padStart(2, "0");

    if (totalHrs > 0) {
        return `${totalHrs} h ${min} min ${sec} s`;
    } else if (min > 0) {
        return `${min} min ${sec} s`;
    } else {
        return `${sec} s`;
    }
}

function resetWashState() {
    clearInterval(washTimer);

    // 🧹 Reset de variables
    washTimer = null;
    startTimestamp = null;
    endTimestamp = null;
    totalMillis = 0;
    paused = false;
    pauseTimestamp = null;

    // 🧼 Reset visual
    elapsedText.textContent = "0 min";
    remainingText.textContent = "--";
    restBar.style.width = "0%";

    // Volver botón a "Pausar"
    const pauseBtn = document.getElementById("pauseRestBtn");
    if (pauseBtn) pauseBtn.textContent = "⏸ Pausar";
}


/* ============================================
   🔥 BOTONES
============================================ */
document.getElementById("pauseRestBtn").addEventListener("click", () => {

    if (!paused) {
        // ========================
        //     PAUSAR
        // ========================
        paused = true;
        clearInterval(washTimer);

        pauseTimestamp = Date.now();
        document.getElementById("pauseRestBtn").textContent = "▶ Reanudar";

        showAlert("Lavado en pausa ⏸", "success");

    } else {
        // ========================
        //     REANUDAR
        // ========================
        paused = false;

        const pausedTime = Date.now() - pauseTimestamp;

        // Ajustar tiempos correctamente sin reiniciar nada
        startTimestamp += pausedTime;
        endTimestamp += pausedTime;

        document.getElementById("pauseRestBtn").textContent = "⏸ Pausar";

        // ❗ IMPORTANTE: NO LLAMAR startWashProgress()
        // Solo reactivar el intervalo
        washTimer = setInterval(runTimer, 1000);

        showAlert("Lavado reanudado ▶", "success");
    }
});


 

document.getElementById("stopRestBtn").addEventListener("click", () => {
    resetWashState();
    closeRestScreen();
    showAlert("Lavado detenido ⏹", "error");
});
