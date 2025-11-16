/* ========== ELEMENTOS ========== */
const restOverlay = document.getElementById("restOverlay");
const restBar = document.getElementById("restBar");
const elapsedText = document.getElementById("elapsedTime");
const remainingText = document.getElementById("remainingTime");

let washTimer = null;
let startTimestamp = null;
let endTimestamp = null;
let totalMillis = 0;

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
    const programTime = document.getElementById("programTime").textContent;
    const match = programTime.match(/(\d+)\s*h\s*(\d+)?/);

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;

    /* 2️⃣ Inicio y fin reales */
    startTimestamp = Date.now();
    totalMillis = (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
    endTimestamp = startTimestamp + totalMillis;

    /* 3️⃣ Iniciar intervalo REAL */
    washTimer = setInterval(() => {
        const now = Date.now();

        /* TIEMPO TRANSCURRIDO */
        const elapsed = now - startTimestamp;

        /* TIEMPO RESTANTE */
        let remaining = endTimestamp - now;
        if (remaining < 0) remaining = 0;

        /* Mostrar en h y min */
        elapsedText.textContent = formatTime(elapsed);
        remainingText.textContent = formatTime(remaining);

        /* Barra de progreso */
        let progress = elapsed / totalMillis;
        if (progress > 1) progress = 1;

        restBar.style.width = (progress * 100) + "%";

        /* Finalización */
        if (remaining <= 0) {
            clearInterval(washTimer);
            closeRestScreen();
            showAlert("Lavado finalizado ✔", "success");
        }

    }, 1000);
}

/* ============================================
   🔥 Convertir milisegundos a "1 h 20 min"
============================================ */
function formatTime(ms) {
    let totalSec = Math.floor(ms / 1000);
    let totalMin = Math.floor(totalSec / 60);
    let totalHrs = Math.floor(totalMin / 60);

    totalMin %= 60;

    if (totalHrs > 0) {
        return `${totalHrs} h ${totalMin} min`;
    } else {
        return `${totalMin} min`;
    }
}

/* ============================================
   🔥 BOTONES
============================================ */
document.getElementById("pauseRestBtn").addEventListener("click", () => {
    clearInterval(washTimer);
    showAlert("Lavado en pausa ⏸", "success");
});

document.getElementById("stopRestBtn").addEventListener("click", () => {
    closeRestScreen();
    showAlert("Lavado detenido ⏹", "error");
});
