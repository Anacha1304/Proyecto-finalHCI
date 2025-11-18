/* ====================================================
      🎤 ASISTENTE DE VOZ — GAM WASH PRO
==================================================== */

/* ------------------------------
      ESTADOS
--------------------------------*/
let conversationState = "start";
let pendingClothes = null;
let pendingProgram = null;


/* ====================================================
      🔊 TEXT TO SPEECH
==================================================== */
function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-ES";
    utter.pitch = 1;
    utter.rate = 1;

    speechSynthesis.cancel();
    speechSynthesis.speak(utter);

    // Mostrar mensaje visual bonito (si existe el contenedor)
    showAssistantMessage(text);
}


/* ====================================================
      🎤 SPEECH RECOGNITION
==================================================== */
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = new SpeechRecognition();
recognition.lang = "es-ES";
recognition.interimResults = false;
recognition.continuous = false;

let voiceBtn = null;


/* Cuando carga la página */
document.addEventListener("DOMContentLoaded", () => {
    voiceBtn = document.getElementById("voiceBtn");
    if (voiceBtn) voiceBtn.addEventListener("click", startListening);

    if (window.location.pathname.includes("personalizarPrograma.html")) {
        conversationState = "customizing";   // Evita saludo
        console.log("Asistente en modo personalización 🎛️");
    }
});


/* ====================================================
      ▶ INICIAR ESCUCHA
==================================================== */
function startListening() {

    setButtonListeningState(true);

    if (conversationState === "start") {
        speak("Hola, soy Gam, tu asistente inteligente de lavado. ¿Qué prenda deseas lavar hoy?");
        conversationState = "waiting_for_intent";
    }

    recognition.start();
}


/* ====================================================
      🎧 PROCESAR RESULTADO
==================================================== */
recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    console.log("🗣️ Usuario dijo:", command);

    handleVoiceCommand(command);
};

recognition.onend = () => setButtonListeningState(false);




/* ====================================================
      🧠 MANEJO DE COMANDOS PRINCIPALES
==================================================== */
function handleVoiceCommand(command) {

    /* ====================================================
   🔵 MODO PERSONALIZACIÓN — evitar saludo
==================================================== */
if (conversationState === "customizing") {
    return handleCustomizationCommands(command);
}

    /* ====================================================
         🔵 NAVEGACIÓN GLOBAL (SIEMPRE DISPONIBLE)
    ==================================================== */
    if (command.includes("inicio") || command.includes("pantalla principal")) {
        conversationState = "idle";
        assistantNavigate("home", "Regresando a la pantalla principal.");
        return;
    }

    if (
        command.includes("personalizar") ||
        command.includes("configurar") ||
        command.includes("ajustar ciclo")
    ) {
        conversationState = "idle";
        assistantNavigate("personalizar", "Vamos a personalizar tu ciclo.");
        return;
    }

    if (command.includes("ver programas") || command.includes("abrir programas")) {
        conversationState = "idle";
        assistantNavigate("programas", "Abriendo lista de ciclos disponibles.");
        return;
    }

    // Mostrar SOLO los nombres de los ciclos
    if (
        command.includes("qué programas") ||
        command.includes("programas disponibles") ||
        command.includes("qué ciclos")
    ) {
        listAllPrograms();
        return;
    }


    /* ====================================================
         🔵 COMANDOS DE ESTADO DEL LAVADO
    ==================================================== */
    if (
        command.includes("cómo va") ||
        command.includes("estado") ||
        command.includes("lavado va")
    ) {
        const remaining = document.getElementById("remainingTime")?.textContent || "--";
        const prog = currentProgram?.name || "desconocido";
        const temp = document.getElementById("programTemp")?.textContent || "--";
        const spin = document.getElementById("programSpin")?.textContent || "--";

        speak(`El lavado sigue en curso. Faltan ${remaining}. Estás usando el programa ${prog}, a ${temp}, con un spin de ${spin}.`);
        return;
    }

    if (command.includes("pausar")) {
        speak("Pausando el lavado.");
        pauseRestScreen?.();
        return;
    }

    if (command.includes("detener")) {
        speak("Deteniendo el lavado.");
        stopRestScreen?.();
        return;
    }

    if (command.includes("reanudar") || command.includes("continuar")) {
        speak("Reanudando el lavado.");
        resumeRestScreen?.();
        return;
    }

    /* ====================================================
   🔵 SELECCIÓN DE PROGRAMA DESPUÉS DE LISTARLOS
==================================================== */
if (conversationState === "askProgramInstead") {

    // Detectar si el usuario mencionó un programa válido
    const match = matchesProgram(command);

    if (match) {
        pendingProgram = match;
        activateProgram(match);

        speak(`Programa ${programs[match].name} activado. ¿Quieres iniciar el lavado ahora?`);

        conversationState = "confirmStart";
        return;
    }

    // Si no reconoce el programa
    speak("No reconocí ese programa, ¿cuál deseas usar?");
    return;
}


    /* ====================================================
          🔵 FLUJO CONVERSACIONAL
    ==================================================== */

    if (conversationState === "waiting_for_intent") {

        if (command.includes("lavar") || command.includes("ropa")) {
            speak("Perfecto. ¿Qué prenda quieres lavar?");
            conversationState = "askingClothes";
            return;
        }

        speak("Puedo ayudarte a elegir un programa o iniciar un lavado. ¿Qué deseas hacer?");
        return;
    }

    if (conversationState === "askingClothes") {

        pendingClothes = detectClothes(command);

        if (!pendingClothes) {
            speak("No reconocí la prenda. ¿Me repites cuál es?");
            return;
        }

        pendingProgram = recommendProgramForClothes(pendingClothes);

        speak(`Según la prenda, te recomiendo el programa ${programs[pendingProgram].name}. ¿Quieres usarlo?`);

        conversationState = "confirmProgram";
        return;
    }

    if (conversationState === "confirmProgram") {

        if (command.includes("sí") || command.includes("claro")) {
            activateProgram(pendingProgram);
            speak(`Programa ${programs[pendingProgram].name} activado. ¿Quieres iniciar el lavado ahora?`);
            conversationState = "confirmStart";
            return;
        }

        if (command.includes("no")) {
            speak("Está bien. ¿Qué otro programa deseas?");
            conversationState = "askProgramInstead";
            return;
        }

        speak("¿Lo activamos sí o no?");
        return;
    }


    if (conversationState === "confirmStart") {

        if (command.includes("sí") || command.includes("inicia")) {

            const duration = document.getElementById("programTime")?.textContent || "--";
            speak(`Perfecto. Iniciando el lavado. Duración total ${duration}.`);

            openRestScreen();
            conversationState = "idle";
            return;
        }

        if (command.includes("no")) {
            speak("Muy bien, lo iniciaré cuando me indiques.");
            conversationState = "idle";
            return;
        }

        speak("¿Quieres iniciar el lavado ahora?");
        return;
    }


    /* ====================================================
          🔵 PERSONALIZACIÓN (solo en la página correcta)
    ==================================================== */
    if (window.location.pathname.includes("personalizarPrograma.html")) {
        return handleCustomizationCommands(command);
    }

    speak("No entendí eso. ¿Me lo repites?");
    conversationState = "waiting_for_intent";
}


/* ====================================================
      🔥 PERSONALIZACIÓN POR VOZ
==================================================== */
function handleCustomizationCommands(command) {

    /* TEMPERATURA */
    const tempMatch = command.match(/(\d+)\s*(grados|grado|º|c)/);
    if (tempMatch) {
        const value = parseInt(tempMatch[1]);
        const valid = [10,20,30,40,50];

        if (valid.includes(value)) {
            const btn = [...document.querySelectorAll("#tempOptions .opt-btn")]
                .find(b => b.textContent.includes(value));

            btn?.click();
            speak(`Temperatura configurada a ${value} grados.`);
        } else {
            speak("Esa temperatura no está disponible.");
        }
        return;
    }

    /* SPIN */
    const spinMatch = command.match(/(\d+)\s*(rpm|revoluciones|spin|centrifugado)/);
    if (spinMatch) {
        const value = parseInt(spinMatch[1]);
        const valid = [400,800,1000,1200,1400];

        if (valid.includes(value)) {
            const btn = [...document.querySelectorAll("#spinOptions .opt-btn")]
                .find(b => b.textContent.includes(value));

            btn?.click();
            speak(`Centrifugado configurado a ${value} revoluciones.`);
        } else {
            speak("No tengo esa velocidad.");
        }
        return;
    }

    /* SHAMPOO EXTRA */
    if (command.includes("shampoo")) {
        const toggle = document.getElementById("shampooToggle");

        if (command.includes("activar") || command.includes("enciende")) {
            toggle.checked = true;
            speak("Shampoo extra activado.");
        } else if (command.includes("desactivar") || command.includes("apaga")) {
            toggle.checked = false;
            speak("Shampoo extra desactivado.");
        }
        return;
    }

    /* PRELAVADO */
    if (command.includes("prelavado")) {
        const toggle = document.getElementById("prelavadoToggle");

        if (command.includes("activar")) {
            toggle.checked = true;
            speak("Prelavado activado.");
        } else if (command.includes("desactivar")) {
            toggle.checked = false;
            speak("Prelavado desactivado.");
        }
        return;
    }

    /* GUARDAR */
    if (command.includes("guardar") || command.includes("confirmar")) {
        speak("Guardando la configuración.");
        guardarCambios?.();
        return;
    }

    /* CANCELAR */
    if (command.includes("cancelar") || command.includes("volver")) {
        speak("Cancelando y regresando al menú.");
        cancelar?.();
        return;
    }
}


/* ====================================================
      🟣 FIDUCIALES
==================================================== */
window.voiceFiducialDetected = function(clothingType) {

    pendingClothes = clothingType;
    const ropa = clothingNames[clothingType] || clothingType;

    const recomendado = recommendProgramForClothes(clothingType);
    pendingProgram = recomendado;

    const actual = currentProgram.name;
    const recomendadoNombre = programs[recomendado].name;

    const esCompatible = currentProgram.allowed.includes(clothingType);

    if (esCompatible) {
        speak(`La prenda ${ropa} es compatible con el ciclo actual.`);
        return;
    }

    speak(`La prenda ${ropa} no es compatible con el ciclo actual. Te recomiendo ${recomendadoNombre}. ¿Deseas cambiarlo?`);

    conversationState = "confirmProgram";
};


/* ====================================================
      🔧 UTILIDADES
==================================================== */
function detectClothes(text) {
    if (text.includes("toalla")) return "towel";
    if (text.includes("blanca")) return "white";
    if (text.includes("oscura") || text.includes("negra")) return "dark";
    if (text.includes("bebé")) return "baby";
    if (text.includes("deportiva")) return "sport";
    if (text.includes("delicada")) return "delicate";
    if (text.includes("jean")) return "jeans";
    return null;
}

function recommendProgramForClothes(type) {
    for (let key in programs) {
        if (programs[key].allowed.includes(type)) return key;
    }
    return "delicado";
}

function matchesProgram(command) {
    if (command.includes("delicado")) return "delicado";
    if (command.includes("colores")) return "colores";
    if (command.includes("blanca")) return "blanca";
    if (command.includes("oscura")) return "oscura";
    if (command.includes("rápido")) return "toallas";
    if (command.includes("bebé")) return "bebe";
    if (command.includes("centrifugar")) return "deportivo";
    return null;
}

function activateProgram(key) {
    currentProgram = programs[key];
    updateProgramUI();
}


/* ====================================================
      ⭐ FUNCIÓN GLOBAL
==================================================== */
window.startListening = startListening;
window.speak = speak;


/* ====================================================
      🎨 ESTADOS VISUALES DEL BOTÓN DEL ASISTENTE
==================================================== */
const btn = document.getElementById("voiceBtn");
const bubble = document.getElementById("assistantBubble");

btn?.addEventListener("mouseenter", () => bubble?.classList.add("show"));
btn?.addEventListener("mouseleave", () => bubble?.classList.remove("show"));

function setButtonListeningState(isListening) {
    if (!btn) return;

    if (isListening) {
        btn.classList.add("listening");
        btn.querySelector(".mic-icon").textContent = "🎧";
    } else {
        btn.classList.remove("listening");
        btn.querySelector(".mic-icon").textContent = "🎤";
    }
}


/* ====================================================
      🔧 MOSTRAR / OCULTAR ASISTENTE SEGÚN PANTALLA
==================================================== */

const assistantWrapper = document.querySelector(".assistant-wrapper");
const restOverlay = document.getElementById("restOverlay");
const powerOverlay = document.getElementById("powerOverlay");

window.moveAssistantToRest = function () {
    if (assistantWrapper && restOverlay) {
        restOverlay.appendChild(assistantWrapper);
    }
};

window.moveAssistantToHome = function () {
    if (assistantWrapper) {
        document.body.appendChild(assistantWrapper);
    }
};

function hideAssistantWhenPowerOff() {
    if (!assistantWrapper) return;

    // Si no hay powerOverlay (por ejemplo, en personalizarPrograma.html), siempre mostramos el asistente
    if (!powerOverlay) {
        assistantWrapper.style.display = "flex";
        return;
    }

    if (
        powerOverlay.classList.contains("active") ||
        powerOverlay.style.display === "flex"
    ) {
        assistantWrapper.style.display = "none";
    } else {
        assistantWrapper.style.display = "flex";
    }
}

// Solo crear observer si existe powerOverlay en esta página
if (powerOverlay) {
    const powerObserver = new MutationObserver(hideAssistantWhenPowerOff);
    powerObserver.observe(powerOverlay, { attributes: true, attributeFilter: ["class", "style"] });
}

// Llamar una vez al inicio
hideAssistantWhenPowerOff();


/* ====================================================
      🌟 BURBUJA DE MENSAJES VISUALES
==================================================== */
window.showAssistantMessage = function(text){
    const msg = document.getElementById("assistantMessage");
    if(!msg) return;

    msg.textContent = text;
    msg.classList.add("show");

    setTimeout(() => msg.classList.remove("show"), 2000);
};


/* ====================================================
      🚀 NAVEGACIÓN ENTRE PANTALLAS
==================================================== */
window.assistantNavigate = function(screen, message="") {

    if (message) speak(message);

    const overlay = document.getElementById("transitionOverlay");

    if (overlay) {
        overlay.classList.remove("hidden");
        overlay.classList.add("showing");
    }

    setTimeout(() => {

        switch(screen) {
            case "home":        location.href = "index.html"; break;
            case "programas":   location.href = "programas.html"; break;
            case "personalizar":location.href = "personalizarPrograma.html"; break;
            case "reposo":      openRestScreen?.(); break;
        }

        setTimeout(() => {
            overlay?.classList.remove("showing");
            overlay?.classList.add("hidden");
        }, 700);

    }, 600);
};


/* ====================================================
      📢 LISTA DE PROGRAMAS DISPONIBLES
==================================================== */
window.listAllPrograms = function () {

    if (!programs) {
        speak("Lo siento, no encontré los programas disponibles.");
        return;
    }

    const nombres = Object.values(programs).map(p => p.name);

    const lista = nombres.join(", ");

    speak(`Estos son los programas disponibles: ${lista}. ¿Cuál deseas usar?`);

    conversationState = "askProgramInstead"; 
};
