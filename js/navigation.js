export function initNavigation() {

    const toggle =
        document.querySelector(
            ".menu-toggle"
        );

    const nav =
        document.querySelector(
            "#site-nav"
        );


    if (!toggle || !nav) {
        return;
    }


    const closeMenu = () => {

        nav.classList.remove(
            "is-open"
        );

        document.body.classList.remove(
            "menu-open"
        );

        toggle.setAttribute(
            "aria-expanded",
            "false"
        );

    };


    toggle.addEventListener(
        "click",
        () => {

            const isOpen =
                nav.classList.toggle(
                    "is-open"
                );

            document.body.classList.toggle(
                "menu-open",
                isOpen
            );

            toggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        }
    );


    nav.querySelectorAll("a").forEach(
        (link) => {

            link.addEventListener(
                "click",
                closeMenu
            );

        }
    );

}