const powerCircle = document.querySelector(".power-circle");
const powerOverlay = document.getElementById("powerOverlay");
const powerReturnBtn = document.getElementById("powerReturnBtn");
const transitionOverlay = document.getElementById("transitionOverlay");

// Si vienes desde Programas o Historial, la lavadora debe aparecer encendida
if (localStorage.getItem("returnToHome") === "1") {
    isOn = true;  
    powerOverlay.classList.add("hidden");  // Oculta pantalla apagada
    localStorage.removeItem("returnToHome"); // limpiar
} else {
    isOn = false; // carga normal
}

powerCircle.addEventListener("click", turnOff);
powerReturnBtn.addEventListener("click", turnOn);

function turnOff() {
    if (!isOn) return;

    // Cubrir todo con fade a negro
    transitionOverlay.classList.remove("hidden");
    transitionOverlay.classList.add("fade-to-black");

    setTimeout(() => {
        powerOverlay.classList.remove("hidden");
        transitionOverlay.classList.remove("fade-to-black");
        transitionOverlay.classList.add("hidden");
    }, 650);

    isOn = false;
}

function turnOn() {
    // Fade desde negro
    transitionOverlay.classList.remove("hidden");
    transitionOverlay.classList.add("fade-from-black");

    // Ocultar pantalla negra
    powerOverlay.classList.add("hidden");

    setTimeout(() => {
        transitionOverlay.classList.remove("fade-from-black");
        transitionOverlay.classList.add("hidden");
    }, 650);

    isOn = true;
}

