export function initAnimations() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    if (!elements.length) {
        return;
    }


    /*
     * Ako browser ne podržava
     * IntersectionObserver, sadržaj
     * mora odmah biti vidljiv.
     */

    if (
        !(
            "IntersectionObserver"
            in window
        )
    ) {

        elements.forEach(
            (element) => {

                element.classList.add(
                    "is-visible"
                );

            }
        );

        return;
    }


    const observer =
        new IntersectionObserver(
            (
                entries,
                obs
            ) => {

                entries.forEach(
                    (entry) => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        entry.target.classList.add(
                            "is-visible"
                        );


                        obs.unobserve(
                            entry.target
                        );

                    }
                );

            },
            {
                threshold: 0.08
            }
        );


    elements.forEach(
        (element) => {

            observer.observe(
                element
            );

        }
    );


    /*
     * Hero treba odmah prikazati.
     */

    const hero =
        document.querySelector(
            "#hero .reveal"
        );

    if (hero) {

        hero.classList.add(
            "is-visible"
        );

    }

}