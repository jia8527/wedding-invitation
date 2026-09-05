import { initNavigation } from "./navigation.js";
import { initAnimations } from "./animations.js";
import { initRSVP } from "./rsvp.js";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initNavigation();

        initAnimations();

        initRSVP();

    }
);