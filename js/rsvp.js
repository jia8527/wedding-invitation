export function initRSVP() {
// =========================================================
// CONFIGURATION
// =========================================================

const RSVP_API_URL =
    "https://script.google.com/macros/s/AKfycbxzAejiKgeFWKm6mYd-6fEvOO78t4qz_F7Ovo7hggA79X2ud3mGXd_YxOEYFBdf7Lw/exec";

const MAX_GUESTS = 10;


// =========================================================
// DOM ELEMENTS
// =========================================================

const form =
    document.getElementById("rsvpForm");

const guestsContainer =
    document.getElementById("guestsContainer");

const addGuestButton =
    document.getElementById("addGuestButton");

const attendingDetails =
    document.getElementById("attendingDetails");

const mainGuestDetails =
    document.getElementById("mainGuestDetails");

const rsvpStatus =
    document.getElementById("rsvpStatus");

const accommodationGroup =
    document.getElementById("accommodationGroup");


// =========================================================
// STATE
// =========================================================

let guestIndex = 0;


// =========================================================
// HELPERS
// =========================================================

function show(element) {

    if (!element) {
        return;
    }

    element.classList.remove("is-hidden");
}


function hide(element) {

    if (!element) {
        return;
    }

    element.classList.add("is-hidden");
}


function clearElement(element) {

    if (!element) {
        return;
    }

    element.innerHTML = "";
}


function isValidName(value) {

    const name = value.trim();

    if (!name) {
        return false;
    }

    /*
     * Dozvoljava:
     * - slova
     * - srpska slova
     * - razmak
     * - crtica
     * - apostrof
     *
     * Ne dozvoljava brojeve.
     */

    const namePattern =
        /^[A-Za-zČĆŽŠĐčćžšđÀ-ž]+(?:[\s'-][A-Za-zČĆŽŠĐčćžšđÀ-ž]+)+$/;

    return namePattern.test(name);
}


function setFieldError(input, message) {

    if (!input) {
        return;
    }

    input.classList.add("input-error");

    let errorElement =
        input.parentElement.querySelector(
            ".field-error"
        );

    if (!errorElement) {

        errorElement =
            document.createElement("small");

        errorElement.className =
            "field-error";

        input.parentElement.appendChild(
            errorElement
        );
    }

    errorElement.textContent = message;
}


function clearFieldError(input) {

    if (!input) {
        return;
    }

    input.classList.remove("input-error");

    const errorElement =
        input.parentElement.querySelector(
            ".field-error"
        );

    if (errorElement) {
        errorElement.remove();
    }
}


// =========================================================
// CREATE ADDITIONAL GUEST
// =========================================================

function addGuest() {

    const currentGuests =
        guestsContainer.querySelectorAll(
            ".additional-guest"
        ).length;


    if (currentGuests >= MAX_GUESTS) {
        return;
    }


    guestIndex++;


    const guestCard =
        document.createElement("div");

    guestCard.className =
        "guest-card additional-guest";


    guestCard.dataset.guestIndex =
        guestIndex;


    guestCard.innerHTML = `

        <div class="guest-card-header">

            <span class="guest-number">
                ${String(currentGuests + 2).padStart(2, "0")}
            </span>

            <div>

                <p class="guest-label">
                    Gost
                </p>

                <h3>
                    Osoba ${currentGuests + 1}
                </h3>

            </div>

        </div>


        <div class="form-group">

            <label for="guest${guestIndex}Name">
                Ime i prezime
            </label>

            <input
                type="text"
                id="guest${guestIndex}Name"
                name="guest${guestIndex}Name"
                placeholder="Ime i prezime gosta"
                autocomplete="off"
                required
            >

        </div>


        <fieldset class="form-group">

            <legend>
                Meni
            </legend>

            <div class="radio-group">

                <label class="radio-option">

                    <input
                        type="radio"
                        name="guest${guestIndex}Menu"
                        value="Standardni"
                        required
                    >

                    <span>
                        Standardni
                    </span>

                </label>


                <label class="radio-option">

                    <input
                        type="radio"
                        name="guest${guestIndex}Menu"
                        value="Vegetarijanski"
                    >

                    <span>
                        Vegetarijanski
                    </span>

                </label>

            </div>

        </fieldset>


        <div class="form-group">

            <label for="guest${guestIndex}Allergies">

                Alergije / posebne napomene

                <span class="optional">
                    (opciono)
                </span>

            </label>

            <input
                type="text"
                id="guest${guestIndex}Allergies"
                name="guest${guestIndex}Allergies"
                placeholder="Npr. orašasti plodovi, gluten..."
                autocomplete="off"
            >

        </div>


        <button
            type="button"
            class="remove-guest-button"
            data-remove-guest="${guestIndex}"
        >
            Ukloni gosta
        </button>

    `;


    guestsContainer.appendChild(
        guestCard
    );


    updateGuestNumbers();

    updateAddButton();


    const firstInput =
        guestCard.querySelector(
            'input[type="text"]'
        );


    if (firstInput) {

        setTimeout(() => {

            firstInput.focus();

        }, 100);

    }

}


// =========================================================
// REMOVE GUEST
// =========================================================

function removeGuest(index) {

    const guestCard =
        guestsContainer.querySelector(
            `[data-guest-index="${index}"]`
        );


    if (!guestCard) {
        return;
    }


    guestCard.remove();


    updateGuestNumbers();

    updateAddButton();

}


// =========================================================
// UPDATE NUMBERS
// =========================================================

function updateGuestNumbers() {

    const guestCards =
        guestsContainer.querySelectorAll(
            ".additional-guest"
        );


    guestCards.forEach(
        (card, position) => {

            const number =
                String(position + 2)
                    .padStart(2, "0");


            const numberElement =
                card.querySelector(
                    ".guest-number"
                );


            if (numberElement) {

                numberElement.textContent =
                    number;

            }


            const title =
                card.querySelector("h3");


            if (title) {

                title.textContent =
                    `Osoba ${position + 1}`;

            }

        }
    );

}


// =========================================================
// UPDATE ADD BUTTON
// =========================================================

function updateAddButton() {

    const currentGuests =
        guestsContainer.querySelectorAll(
            ".additional-guest"
        ).length;


    if (currentGuests >= MAX_GUESTS) {

        addGuestButton.disabled = true;

        addGuestButton.textContent =
            "Dostignut je maksimalan broj gostiju";

    } else {

        addGuestButton.disabled = false;

        addGuestButton.textContent =
            "+ Dodaj gosta";

    }

}


// =========================================================
// RESET ADDITIONAL GUESTS
// =========================================================

function resetAdditionalGuests() {

    clearElement(
        guestsContainer
    );

    guestIndex = 0;

    updateAddButton();

}


// =========================================================
// ATTENDANCE
// =========================================================

const attendanceInputs =
    document.querySelectorAll(
        'input[name="attendance"]'
    );


attendanceInputs.forEach(
    (input) => {

        input.addEventListener(
            "change",
            () => {

                const attending =
                    input.value === "Da";


                if (attending) {

                    // Prikaži detalje glavne osobe
                    show(mainGuestDetails);

                    // Prikaži dodatne goste
                    show(attendingDetails);

                    // Prikaži smeštaj
                    show(accommodationGroup);


                    // Meni glavne osobe postaje obavezan
                    document
                        .querySelectorAll(
                            'input[name="mainMenu"]'
                        )
                        .forEach(
                            menu => {
                                menu.required = true;
                            }
                        );

                } else {

                    // Sakrij sve što je vezano za dolazak
                    hide(mainGuestDetails);

                    hide(attendingDetails);

                    hide(accommodationGroup);


                    // Obriši dodatne goste
                    resetAdditionalGuests();


                    // Očisti meni glavne osobe
                    document
                        .querySelectorAll(
                            'input[name="mainMenu"]'
                        )
                        .forEach(
                            menu => {

                                menu.required = false;
                                menu.checked = false;

                            }
                        );


                    // Očisti alergije
                    const allergies =
                        document.getElementById(
                            "mainAllergies"
                        );

                    if (allergies) {
                        allergies.value = "";
                    }


                    // Očisti smeštaj
                    document
                        .querySelectorAll(
                            'input[name="accommodation"]'
                        )
                        .forEach(
                            accommodation => {

                                accommodation.checked =
                                    false;

                                accommodation.required =
                                    false;

                            }
                        );

                }

            }
        );

    }
);


// =========================================================
// ADD GUEST BUTTON
// =========================================================

if (addGuestButton) {

    addGuestButton.addEventListener(
        "click",
        addGuest
    );

}


// =========================================================
// REMOVE GUEST BUTTON
// =========================================================

if (guestsContainer) {

    guestsContainer.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    "[data-remove-guest]"
                );


            if (!button) {
                return;
            }


            const index =
                Number(
                    button.dataset.removeGuest
                );


            removeGuest(index);

        }
    );

}


// =========================================================
// LIVE NAME VALIDATION
// =========================================================

document.addEventListener(
    "blur",
    (event) => {

        if (
            !event.target.matches(
                'input[type="text"]'
            )
        ) {
            return;
        }


        const input =
            event.target;


        /*
         * Validiramo samo polja za ime.
         * Alergije i napomene mogu sadržati
         * brojeve i druge karaktere.
         */

        const isNameField =
            input.id === "name" ||
            input.id.endsWith("Name");


        if (!isNameField) {
            return;
        }


        if (
            input.value.trim() &&
            !isValidName(input.value)
        ) {

            setFieldError(
                input,
                "Unesite ime i prezime bez brojeva."
            );

        } else {

            clearFieldError(input);

        }

    },
    true
);


// =========================================================
// COLLECT ADDITIONAL GUESTS
// =========================================================

function collectGuests() {

    const guestCards =
        guestsContainer.querySelectorAll(
            ".additional-guest"
        );


    const guests = [];


    guestCards.forEach(
        (card) => {

            const index =
                card.dataset.guestIndex;


            const nameInput =
                card.querySelector(
                    `input[name="guest${index}Name"]`
                );


            const menuInput =
                card.querySelector(
                    `input[name="guest${index}Menu"]:checked`
                );


            const allergiesInput =
                card.querySelector(
                    `input[name="guest${index}Allergies"]`
                );


            guests.push({

                name:
                    nameInput
                        ? nameInput.value.trim()
                        : "",

                menu:
                    menuInput
                        ? menuInput.value
                        : "",

                allergies:
                    allergiesInput
                        ? allergiesInput.value.trim()
                        : ""

            });

        }
    );


    return guests;
}


// =========================================================
// VALIDATE FORM
// =========================================================

function validateForm() {

    let valid = true;


    // -----------------------------------------
    // MAIN NAME
    // -----------------------------------------

    const nameInput =
        document.getElementById("name");


    clearFieldError(nameInput);


    if (!nameInput.value.trim()) {

        setFieldError(
            nameInput,
            "Molimo unesite ime i prezime."
        );

        valid = false;

    } else if (
        !isValidName(nameInput.value)
    ) {

        setFieldError(
            nameInput,
            "Unesite ime i prezime bez brojeva."
        );

        valid = false;

    }


    // -----------------------------------------
    // ATTENDANCE
    // -----------------------------------------

    const attendance =
        form.querySelector(
            'input[name="attendance"]:checked'
        );


    if (!attendance) {

        rsvpStatus.textContent =
            "Molimo izaberite da li dolazite.";

        rsvpStatus.className =
            "form-status error";

        valid = false;

    }


    // -----------------------------------------
    // IF ATTENDING
    // -----------------------------------------

    if (
        attendance &&
        attendance.value === "Da"
    ) {

        // Main menu
        const mainMenu =
            form.querySelector(
                'input[name="mainMenu"]:checked'
            );


        if (!mainMenu) {

            rsvpStatus.textContent =
                "Molimo izaberite meni.";

            rsvpStatus.className =
                "form-status error";

            valid = false;

        }


        // Accommodation
        const accommodation =
            form.querySelector(
                'input[name="accommodation"]:checked'
            );


        if (!accommodation) {

            rsvpStatus.textContent =
                "Molimo izaberite da li vam je potreban smeštaj.";

            rsvpStatus.className =
                "form-status error";

            valid = false;

        }


        // Additional guests
        const guestCards =
            guestsContainer.querySelectorAll(
                ".additional-guest"
            );


        guestCards.forEach(
            (card) => {

                const index =
                    card.dataset.guestIndex;


                const nameInput =
                    card.querySelector(
                        `input[name="guest${index}Name"]`
                    );


                const menuInput =
                    card.querySelector(
                        `input[name="guest${index}Menu"]:checked`
                    );


                clearFieldError(
                    nameInput
                );


                if (
                    !nameInput.value.trim()
                ) {

                    setFieldError(
                        nameInput,
                        "Molimo unesite ime i prezime."
                    );

                    valid = false;

                } else if (
                    !isValidName(
                        nameInput.value
                    )
                ) {

                    setFieldError(
                        nameInput,
                        "Unesite ime i prezime bez brojeva."
                    );

                    valid = false;

                }


                if (!menuInput) {

                    rsvpStatus.textContent =
                        "Molimo izaberite meni za svakog gosta.";

                    rsvpStatus.className =
                        "form-status error";

                    valid = false;

                }

            }
        );

    }


    return valid;
}


// =========================================================
// SUBMIT FORM
// =========================================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        rsvpStatus.textContent = "";

        rsvpStatus.className =
            "form-status";


        // -----------------------------------------
        // HONEYPOT
        // -----------------------------------------

        const honeypot =
            document.getElementById(
                "website"
            );


        if (
            honeypot &&
            honeypot.value.trim() !== ""
        ) {

            return;

        }


        // -----------------------------------------
        // VALIDATION
        // -----------------------------------------

        if (!validateForm()) {
            return;
        }


        // -----------------------------------------
        // ATTENDANCE
        // -----------------------------------------

        const attendance =
            form.querySelector(
                'input[name="attendance"]:checked'
            )?.value;


        const attending =
            attendance === "Da";


        // -----------------------------------------
        // SUBMIT BUTTON
        // -----------------------------------------

        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );


        submitButton.disabled = true;

        submitButton.textContent =
            "Šaljem...";


        // -----------------------------------------
        // BUILD DATA
        // -----------------------------------------

        const formData = {

            name:
                document
                    .getElementById("name")
                    .value
                    .trim(),


            attendance,


            mainMenu:
                attending
                    ? (
                        form.querySelector(
                            'input[name="mainMenu"]:checked'
                        )?.value || ""
                    )
                    : "",


            mainAllergies:
                attending
                    ? (
                        document
                            .getElementById(
                                "mainAllergies"
                            )
                            ?.value
                            .trim() || ""
                    )
                    : "",


            guests:
                attending
                    ? collectGuests()
                    : [],


            accommodation:
                attending
                    ? (
                        form.querySelector(
                            'input[name="accommodation"]:checked'
                        )?.value || ""
                    )
                    : "",


            note:
                document
                    .getElementById("note")
                    .value
                    .trim()

        };


        // -----------------------------------------
        // SEND
        // -----------------------------------------

        try {

            await fetch(
                RSVP_API_URL,
                {
                    method: "POST",

                    mode: "no-cors",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(
                            formData
                        )
                }
            );


            showSuccess();


        } catch (error) {

            console.error(
                "RSVP error:",
                error
            );


            showError();

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "Pošalji potvrdu";

        }

    }
);


// =========================================================
// SUCCESS
// =========================================================

function showSuccess() {

    rsvpStatus.textContent =
        "Hvala! Vaša potvrda je uspešno poslata.";

    rsvpStatus.className =
        "form-status success";


    form.reset();


    resetAdditionalGuests();


    hide(mainGuestDetails);

    hide(attendingDetails);

    hide(accommodationGroup);


    window.scrollTo({

        top:
            rsvpStatus.offsetTop - 150,

        behavior:
            "smooth"

    });

}


// =========================================================
// ERROR
// =========================================================

function showError() {

    rsvpStatus.textContent =
        "Došlo je do greške. Molimo pokušajte ponovo.";

    rsvpStatus.className =
        "form-status error";

}
}