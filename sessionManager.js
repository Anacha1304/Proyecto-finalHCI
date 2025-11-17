/* ======================================================
   🌟 SESSION MANAGER — GLOBAL (SIN IMPORTS)
====================================================== */

function normalize(name) {
    return name.toLowerCase();
}

if (!sessionStorage.getItem("sessionData")) {
    sessionStorage.setItem("sessionData", JSON.stringify({
        programSettings: {},
        lastProgram: null,
        washHistory: []
    }));
}

// Get session
window.loadSession = function () {
    return JSON.parse(sessionStorage.getItem("sessionData"));
};

// Save session
window.saveSession = function (data) {
    sessionStorage.setItem("sessionData", JSON.stringify(data));
};

function selectProgram(programName) {
    const key = programName.toLowerCase();  // 🔥 normalizado
    
    setLastProgram(key);

    const settings = getProgramSettings(key);

    if (settings) {
        document.getElementById("programTemp").textContent = settings.temp;
        document.getElementById("programSpin").textContent = settings.spin;
    }

    localStorage.setItem("selectedProgram", key); // 🔥 corregido
    location.href = "personalizarPrograma.html";
}


// Save settings for a specific program
function saveProgramSettings(programName, settings) {
    programName = normalize(programName);
    sessionStorage.setItem("settings_" + programName, JSON.stringify(settings));
}

function getProgramSettings(programName) {
    programName = normalize(programName);
    const data = sessionStorage.getItem("settings_" + programName);
    return data ? JSON.parse(data) : null;
}


// Save last selected program
window.setLastProgram = function (programName) {
    const data = loadSession();
    data.lastProgram = programName;
    saveSession(data);
};

// Add wash history entry
window.addWashHistory = function (entry) {
    const data = loadSession();
    data.washHistory.push(entry);
    saveSession(data);
};

// List of washes
window.getWashHistory = function () {
    return loadSession().washHistory;
};
