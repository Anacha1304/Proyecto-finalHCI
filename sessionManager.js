/* ======================================================
   🌟 SESSION MANAGER — GLOBAL (SIN IMPORTS)
====================================================== */

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

// Save settings for a specific program
window.saveProgramSettings = function (programName, settings) {
    const data = loadSession();
    data.programSettings[programName] = settings;
    saveSession(data);
};

// Get settings
window.getProgramSettings = function (programName) {
    return loadSession().programSettings[programName] || null;
};

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
