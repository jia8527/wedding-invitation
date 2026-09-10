import { initNavigation } from "./navigation.js";
import { initAnimations } from "./animations.js";
import { initRSVP } from "./rsvp.js";

// Uvek vrati stranicu na početak, uključujući browser restore posle refresha.
function resetPagePosition() {
    window.scrollTo(0, 0);
}

if ("scrollRestoration" in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener("load", resetPagePosition);
window.addEventListener("pageshow", resetPagePosition);

function initEnvelope() {
    const intro = document.getElementById("envelopeIntro");
    const openButton = document.getElementById("openInvitation");
    const scene = document.querySelector(".envelope-scene");

    if (!intro || !scene) {
        return;
    }

    intro.classList.remove("is-opening", "is-hidden");
    document.body.classList.add("envelope-locked");

    const openEnvelope = () => {
        if (intro.classList.contains("is-opening")) {
            return;
        }

        intro.classList.add("is-opening");

        // Kartica ostaje izvučena dovoljno dugo da se monogram pročita.
        setTimeout(() => {
            intro.classList.add("is-hidden");
            document.body.classList.remove("envelope-locked");
            window.scrollTo(0, 0);
        }, 3200);
    };

    scene.addEventListener("click", (event) => {
        const envelope = event.target.closest("#envelope");
        if (envelope) {
            openEnvelope();
        }
    });

    if (openButton) {
        openButton.addEventListener("click", openEnvelope);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    resetPagePosition();
    initNavigation();
    initAnimations();
    initRSVP();
    initEnvelope();
});