import { initNavigation } from "./navigation.js";
import { initAnimations } from "./animations.js";
import { initRSVP } from "./rsvp.js";

function initEnvelope() {

    const intro =
        document.getElementById("envelopeIntro");

    const openButton =
        document.getElementById("openInvitation");

    const scene =
        document.querySelector(".envelope-scene");


    if (!intro || !scene) {
        return;
    }


    document.body.classList.add(
        "envelope-locked"
    );


    const openEnvelope = () => {

        if (intro.classList.contains("is-opening")) {
            return;
        }

        intro.classList.add("is-opening");


        setTimeout(() => {

            intro.classList.add("is-hidden");

            document.body.classList.remove(
                "envelope-locked"
            );

        }, 1500);
    };


    // Klik bilo gde na kovertu
    scene.addEventListener("click", (event) => {

        const envelope =
            event.target.closest("#envelope");

        if (envelope) {
            openEnvelope();
        }
    });


    // Klik na dugme
    if (openButton) {
        openButton.addEventListener(
            "click",
            openEnvelope
        );
    }
}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initNavigation();

        initAnimations();

        initRSVP();

        initEnvelope();
    }
);