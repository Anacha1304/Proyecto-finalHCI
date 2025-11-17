/* ====================================================
      🎤 ASISTENTE DE VOZ — GAM WASH PRO
==================================================== */

/* ------------------------------
      ESTADOS DE LA CONVERSACIÓN
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

/* Cuando carga la página, engancha el botón */
document.addEventListener("DOMContentLoaded", () => {
    voiceBtn = document.getElementById("voiceBtn");
    if (voiceBtn) {
        voiceBtn.addEventListener("click", startListening);
    }
});

/* Cambiar estado visual */
function setButtonListeningState(isListening) {
    if (!voiceBtn) return;

    if (isListening) {
        voiceBtn.classList.add("listening");
        voiceBtn.querySelector(".mic-icon").textContent = "🎧";
    } else {
        voiceBtn.classList.remove("listening");
        voiceBtn.querySelector(".mic-icon").textContent = "🎤";
    }
}



function startListening() {

    // Activar animación de escucha
    setButtonListeningState(true);

    if (conversationState === "start") {
        speak("Hola, soy Gam, tu asistente inteligente de lavado. ¿Qué prenda deseas lavar hoy?");
        conversationState = "waiting_for_intent";
    } else {
        speak("");
    }

    recognition.start();
}

/* ====================================================
      🎧 PROCESAR RESPUESTA DE VOZ
==================================================== */
recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    console.log("🗣️ Usuario dijo:", command);
    handleVoiceCommand(command);
};

/* ====================================================
      🧠 LÓGICA COMPLETA DE DIÁLOGO
==================================================== */

function handleVoiceCommand(command) {

    /* ------------------------------
          INICIO DE CONVERSACIÓN
    ------------------------------*/
    if (conversationState === "waiting_for_intent") {

        if (command.includes("lavar") || command.includes("ropa") || command.includes("prenda")) {
            speak("Perfecto. ¿Qué prenda quieres lavar?");
            conversationState = "askingClothes";
            return;
        }

        speak("Puedo ayudarte a lavar tu ropa o recomendarte un programa. ¿Qué deseas hacer?");
        return;
    }

    /* ------------------------------
          IDENTIFICAR PRENDA (POR VOZ)
    ------------------------------*/
    if (conversationState === "askingClothes") {

        pendingClothes = detectClothes(command);

        if (!pendingClothes) {
            speak("No reconocí la prenda. ¿Podrías repetir qué prenda deseas lavar?");
            return;
        }

        pendingProgram = recommendProgramForClothes(pendingClothes);

        speak(`Según la prenda, te recomiendo el programa ${programs[pendingProgram].name}. ¿Deseas usarlo?`);
        
        conversationState = "confirmProgram";
        return;
    }

    /* ------------------------------
          CONFIRMAR PROGRAMA
    ------------------------------*/
    if (conversationState === "confirmProgram") {

        if (command.includes("sí") || command.includes("claro") || command.includes("dale")) {
            activateProgram(pendingProgram);
            speak(`Programa ${programs[pendingProgram].name} activado. ¿Quieres iniciar el lavado ahora?`);
            conversationState = "confirmStart";
            return;
        }

        if (command.includes("no")) {
            speak("Está bien. ¿Qué otro programa quieres usar?");
            conversationState = "askProgramInstead";
            return;
        }

        speak("¿Quieres usar ese programa sí o no?");
        return;
    }

    /* ------------------------------
          INICIAR LAVADO
    ------------------------------*/
    if (conversationState === "confirmStart") {

        if (command.includes("sí") || command.includes("inicia") || command.includes("empieza")) {
            speak("Perfecto. Iniciando el lavado.");
            openRestScreen();
            conversationState = "idle";
            return;
        }

        if (command.includes("no")) {
            speak("Muy bien, dime cuando quieras iniciar.");
            conversationState = "idle";
            return;
        }

        speak("¿Deseas iniciar el lavado?");
        return;
    }

    /* ------------------------------
          ELEGIR OTRO PROGRAMA
    ------------------------------*/
    if (conversationState === "askProgramInstead") {

        let match = matchesProgram(command);

        if (match) {
            activateProgram(match);
            speak(`Programa ${programs[match].name} activado. ¿Deseas iniciar el lavado ahora?`);
            conversationState = "confirmStart";
            return;
        }

        speak("No reconocí ese programa. ¿Cuál deseas usar?");
        return;
    }

    /* ------------------------------
          COMANDOS GLOBALES
    ------------------------------*/
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

    speak("No entendí eso. ¿Quieres que te ayude a lavar algo?");
    conversationState = "waiting_for_intent";
}

/* ====================================================
      🟣 🔥 INTEGRACIÓN CON FIDUCIALES
==================================================== */

/*  
   🔥 LLAMA ESTA FUNCIÓN DESDE handleFiducial(id)
   en tu archivo app.js:

   → voiceFiducialDetected("white");
*/

window.voiceFiducialDetected = function(clothingType) {

    pendingClothes = clothingType;

    const ropa = clothingNames[clothingType] || clothingType;

    const recomendado = recommendProgramForClothes(clothingType);
    pendingProgram = recomendado;

    const nombreProgramaActual = currentProgram.name;
    const nombreProgramaRecomendado = programs[recomendado].name;

    const esCompatible = currentProgram.allowed.includes(clothingType);

    // ✔ 1. Si es compatible → SOLO informar, nada más
    if (esCompatible) {
        speak(`La prenda ${ropa} sí la puedes meter con el ciclo ${nombreProgramaActual}.`);
        conversationState = "idle"; // No seguimos conversación, se queda feliz
        return;
    }

    // ✘ 2. Si NO es compatible → Informar + recomendar
    speak(`La prenda ${ropa} no es compatible con el ciclo ${nombreProgramaActual} que tienes programado en este momento.Te recomiendo usar el programa ${nombreProgramaRecomendado}. ¿Deseas cambiarlo?`);

    conversationState = "confirmProgram"; // Ahora sí esperamos respuesta
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

/* ====================================================
      ⭐ ACTIVAR PROGRAMA
==================================================== */
function activateProgram(key) {
    currentProgram = programs[key];
    updateProgramUI();
}

/* ====================================================
      ⭐ HACER FUNCIONES GLOBALES
==================================================== */
window.startListening = startListening;
window.speak = speak;

console.log("🎤 Asistente de voz GAM cargado ✔ con soporte para FIDUCIALES");


recognition.onend = () => {
    setButtonListeningState(false);
};
