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
    const paper = document.querySelector(".invitation-card");
    const heroTitle = document.querySelector("#hero h1");
    const heroDate = document.querySelector("#hero .hero-date");
    const heroContent = document.querySelector("#hero .hero-content");

    if (!intro || !scene || !paper || !heroTitle || !heroDate || !heroContent) {
        return;
    }

    const body = document.body;
    const originalBodyPaddingRight = body.style.paddingRight;
    const originalComputedPaddingRight = getComputedStyle(body).paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
        body.style.paddingRight = `calc(${originalComputedPaddingRight} + ${scrollbarWidth}px)`;
    }

    intro.classList.remove("is-opening", "is-hidden");
    body.classList.add("envelope-locked");

    const unlockPage = () => {
        intro.classList.add("is-hidden");
        body.classList.remove("envelope-locked");
        body.style.paddingRight = originalBodyPaddingRight;
        window.scrollTo(0, 0);
    };

    const openEnvelope = () => {
        if (intro.classList.contains("is-opening")) {
            return;
        }

        intro.classList.add("is-opening");

        // Kartica ostaje izvučena dovoljno dugo da se monogram pročita.
        setTimeout(() => {
            const paperRect = paper.getBoundingClientRect();
            const titleRect = heroTitle.getBoundingClientRect();
            const heroDateRect = heroDate.getBoundingClientRect();
            const transitionPaper = paper.cloneNode(true);
            const transitionMonogram = transitionPaper.querySelector(".invitation-monogram");
            const transitionMessage = transitionPaper.querySelector(".invitation-message");
            const transitionDate = transitionPaper.querySelector(".invitation-date");

            if (!transitionMonogram || !transitionMessage || !transitionDate) {
                unlockPage();
                return;
            }

            const getTypography = (element) => {
                const style = getComputedStyle(element);
                return {
                    fontFamily: style.fontFamily,
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    fontStyle: style.fontStyle,
                    lineHeight: style.lineHeight,
                    letterSpacing: style.letterSpacing,
                    textTransform: style.textTransform,
                    textAlign: style.textAlign,
                    color: style.color
                };
            };
            const heroDateTypography = getTypography(heroDate);
            transitionPaper.setAttribute("aria-hidden", "true");
            Object.assign(transitionPaper.style, {
                position: "fixed",
                inset: "auto",
                top: `${paperRect.top}px`,
                left: `${paperRect.left}px`,
                right: "auto",
                bottom: "auto",
                width: `${paperRect.width}px`,
                height: `${paperRect.height}px`,
                margin: "0",
                transform: "none",
                transformOrigin: "center center",
                zIndex: "1101",
                pointerEvents: "none",
                willChange: "transform"
            });
            document.body.append(transitionPaper);

            const monogramTypography = getTypography(transitionMonogram);
            const messageTypography = getTypography(transitionMessage);
            const dateTypography = getTypography(transitionDate);
            const ampersandIndex = transitionMonogram.textContent.indexOf("&");
            if (ampersandIndex < 0) {
                transitionPaper.remove();
                unlockPage();
                return;
            }

            const originalMonogramText = transitionMonogram.textContent;
            const nameSegments = [
                originalMonogramText.slice(0, ampersandIndex),
                "&",
                originalMonogramText.slice(ampersandIndex + 1)
            ].map((text) => {
                const segment = document.createElement("span");
                segment.textContent = text;
                return segment;
            });
            transitionMonogram.replaceChildren(...nameSegments);

            const originalNameRects = nameSegments.map((segment) => segment.getBoundingClientRect());
            Object.assign(transitionMonogram.style, {
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            });
            nameSegments.forEach((segment) => {
                segment.style.display = "block";
            });
            const stackedNameRects = nameSegments.map((segment) => segment.getBoundingClientRect());
            const monogramRect = transitionMonogram.getBoundingClientRect();
            const scale = Math.min(
                titleRect.width / monogramRect.width,
                titleRect.height / monogramRect.height
            );
            const paperCenterX = paperRect.left + paperRect.width / 2;
            const paperCenterY = paperRect.top + paperRect.height / 2;
            const monogramCenterX = monogramRect.left + monogramRect.width / 2;
            const monogramCenterY = monogramRect.top + monogramRect.height / 2;
            const titleCenterX = titleRect.left + titleRect.width / 2;
            const titleCenterY = titleRect.top + titleRect.height / 2;
            const translateX = titleCenterX - paperCenterX - (monogramCenterX - paperCenterX) * scale;
            const translateY = titleCenterY - paperCenterY - (monogramCenterY - paperCenterY) * scale;
            const timing = {
                duration: 1800,
                easing: "cubic-bezier(0.65, 0, 0.35, 1)",
                fill: "forwards"
            };
            paper.style.visibility = "hidden";
            scene.animate(
                [{ opacity: 1 }, { opacity: 0 }],
                { duration: 180, easing: "ease-out", fill: "forwards" }
            );
            const nameLayoutAnimations = nameSegments.map((segment, index) => {
                const start = originalNameRects[index];
                const end = stackedNameRects[index];
                return segment.animate(
                    [
                        { transform: `translate(${start.left - end.left}px, ${start.top - end.top}px)` },
                        { transform: "translate(0, 0)" }
                    ],
                    timing
                );
            });
            const zoomAnimation = transitionPaper.animate(
                [
                    { transform: "translate(0, 0) scale(1)" },
                    { transform: `translate(${translateX}px, ${translateY}px) scale(${scale})` }
                ],
                timing
            );

            zoomAnimation.addEventListener("finish", () => {
                const paperSurfaceFade = transitionPaper.animate(
                    [
                        {
                            backgroundColor: getComputedStyle(transitionPaper).backgroundColor,
                            borderColor: getComputedStyle(transitionPaper).borderColor,
                            boxShadow: getComputedStyle(transitionPaper).boxShadow
                        },
                        {
                            backgroundColor: "rgba(247, 244, 239, 0)",
                            borderColor: "rgba(227, 217, 201, 0)",
                            boxShadow: "none"
                        }
                    ],
                    { duration: 180, easing: "ease-out", fill: "forwards" }
                );
                const supportingTextFade = [transitionMessage, transitionDate].map((element) =>
                    element.animate(
                        [{ opacity: 1 }, { opacity: 0 }],
                        { duration: 120, easing: "ease-out", fill: "forwards" }
                    )
                );
                const messageRectBeforeWrap = transitionMessage.getBoundingClientRect();
                const maxMessageWidth = Math.max(1, window.innerWidth - 40);
                const originalMessageWidth = messageRectBeforeWrap.width / scale;
                const wrappedMessageWidth = Math.min(originalMessageWidth, maxMessageWidth / scale);
                if (wrappedMessageWidth < originalMessageWidth) {
                    const messageContainer = transitionMessage.parentElement;
                    const messageContainerRect = messageContainer.getBoundingClientRect();
                    const placeholder = document.createElement("span");
                    const wrappedMessageLeft = messageRectBeforeWrap.left +
                        (messageRectBeforeWrap.width - wrappedMessageWidth * scale) / 2;
                    Object.assign(placeholder.style, {
                        display: "block",
                        width: `${originalMessageWidth}px`,
                        height: `${messageRectBeforeWrap.height / scale}px`,
                        flex: "0 0 auto",
                        visibility: "hidden"
                    });
                    placeholder.setAttribute("aria-hidden", "true");
                    messageContainer.insertBefore(placeholder, transitionMessage);
                    messageContainer.style.position = "relative";
                    Object.assign(transitionMessage.style, {
                        position: "absolute",
                        left: `${(wrappedMessageLeft - messageContainerRect.left) / scale}px`,
                        top: `${(messageRectBeforeWrap.top - messageContainerRect.top) / scale}px`,
                        width: `${wrappedMessageWidth}px`,
                        margin: "0",
                        transform: "none"
                    });
                } else {
                    transitionMessage.style.width = `${wrappedMessageWidth}px`;
                }
                const wrappedMessageRect = transitionMessage.getBoundingClientRect();
                const desiredMessageTop = Math.min(
                    wrappedMessageRect.top,
                    titleRect.top - wrappedMessageRect.height - 8
                );
                if (wrappedMessageWidth < originalMessageWidth) {
                    const messageContainerRect = transitionMessage.parentElement.getBoundingClientRect();
                    transitionMessage.style.top = `${(desiredMessageTop - messageContainerRect.top) / scale}px`;
                } else {
                    transitionMessage.style.transform =
                        `translateY(${(desiredMessageTop - wrappedMessageRect.top) / scale}px)`;
                }

                paperSurfaceFade.finished.then(() => {
                    return Promise.all(supportingTextFade.map((animation) => animation.finished));
                }).then(() => {
                    const targetTitleFontSize = parseFloat(getComputedStyle(heroTitle).fontSize);
                    const targetNameFontSize = targetTitleFontSize / scale;
                    const targetNameLineHeight = (targetTitleFontSize * 0.82) / scale;
                    const targetAmpersandFontSize = (targetTitleFontSize * 0.48) / scale;
                    const nameTypographyAnimations = nameSegments.map((segment, index) => {
                        const isAmpersand = index === 1;
                        const fontSize = isAmpersand ? targetAmpersandFontSize : targetNameFontSize;
                        const lineHeight = isAmpersand
                            ? targetAmpersandFontSize
                            : targetNameLineHeight;
                        const margin = isAmpersand ? `${targetAmpersandFontSize * 0.15}px 0` : "0";
                        return segment.animate(
                            [
                                {
                                    fontSize: getComputedStyle(segment).fontSize,
                                    lineHeight: getComputedStyle(segment).lineHeight,
                                    margin: getComputedStyle(segment).margin
                                },
                                {
                                    fontSize: `${fontSize}px`,
                                    lineHeight: `${lineHeight}px`,
                                    margin
                                }
                            ],
                            { duration: 600, easing: "ease-out", fill: "forwards" }
                        );
                    });
                    const targetMessageFontSize = parseFloat(heroDateTypography.fontSize) / scale;
                    const targetMessageLineHeight = parseFloat(heroDateTypography.lineHeight) / scale;
                    const messageColorFade = transitionMessage.animate(
                        [{
                            color: messageTypography.color,
                            fontSize: messageTypography.fontSize,
                            lineHeight: messageTypography.lineHeight
                        }, {
                            color: "rgb(255, 255, 255)",
                            fontSize: `${targetMessageFontSize}px`,
                            lineHeight: `${targetMessageLineHeight}px`
                        }],
                        { duration: 600, easing: "ease-out", fill: "forwards" }
                    );
                    const dateColorFade = transitionDate.animate(
                        [{ color: dateTypography.color }, { color: "rgb(255, 255, 255)" }],
                        { duration: 600, easing: "ease-out", fill: "forwards" }
                    );
                    const monogramColorFade = transitionMonogram.animate(
                        [{ color: monogramTypography.color }, { color: "rgb(255, 255, 255)" }],
                        { duration: 600, easing: "ease-out", fill: "forwards" }
                    );

                    return Promise.all([
                        messageColorFade.finished,
                        dateColorFade.finished,
                        monogramColorFade.finished,
                        ...nameTypographyAnimations.map((animation) => animation.finished),
                        ...nameLayoutAnimations.map((animation) => animation.finished)
                    ]).then(() => ({
                        messageColorFade,
                        dateColorFade,
                        monogramColorFade,
                        nameTypographyAnimations,
                        targetNameFontSize,
                        targetNameLineHeight,
                        targetAmpersandFontSize,
                        targetMessageFontSize,
                        targetMessageLineHeight
                    }));
                }).then(({
                    messageColorFade,
                    dateColorFade,
                    monogramColorFade,
                    nameTypographyAnimations,
                    targetNameFontSize,
                    targetNameLineHeight,
                    targetAmpersandFontSize,
                    targetMessageFontSize,
                    targetMessageLineHeight
                }) => {
                    const heroContentRect = heroContent.getBoundingClientRect();
                    const messageWidth = Math.max(
                        1,
                        Math.min(
                            document.documentElement.clientWidth - 40,
                            window.innerWidth - 40,
                            Math.max(titleRect.width, 400)
                        )
                    );

                    messageColorFade.cancel();
                    dateColorFade.cancel();
                    monogramColorFade.cancel();
                    supportingTextFade.forEach((animation) => animation.cancel());
                    nameTypographyAnimations.forEach((animation) => animation.cancel());
                    Object.assign(transitionMessage.style, heroDateTypography, {
                        color: "var(--color-white)",
                        fontSize: `${targetMessageFontSize}px`,
                        lineHeight: `${targetMessageLineHeight}px`,
                        position: "absolute",
                        left: "0",
                        top: "0",
                        width: `${messageWidth / scale}px`,
                        margin: "0",
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        zIndex: "1001"
                    });
                    Object.assign(transitionDate.style, heroDateTypography, {
                        color: "var(--color-white)",
                        fontSize: `${parseFloat(heroDateTypography.fontSize) / scale}px`,
                        lineHeight: `${parseFloat(heroDateTypography.lineHeight) / scale}px`,
                        position: "absolute",
                        left: `${heroDateRect.left - heroContentRect.left}px`,
                        top: `${heroDateRect.top - heroContentRect.top}px`,
                        width: `${heroDateRect.width / scale}px`,
                        margin: "0",
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        zIndex: "1001"
                    });
                    const titleRectAfterZoom = heroTitle.getBoundingClientRect();
                    heroContent.insertBefore(transitionMessage, heroTitle);
                    heroDate.setAttribute("aria-hidden", "true");
                    heroDate.style.visibility = "hidden";
                    heroTitle.replaceChildren(transitionMonogram);
                    Object.assign(heroTitle.style, {
                        position: "relative",
                        width: `${titleRectAfterZoom.width}px`,
                        height: `${titleRectAfterZoom.height}px`,
                        zIndex: "1001"
                    });
                    Object.assign(transitionMonogram.style, monogramTypography, {
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: `${monogramRect.width}px`,
                        height: `${monogramRect.height}px`,
                        margin: "0",
                        transform: `translate(-50%, -50%) scale(${scale})`,
                        transformOrigin: "center",
                        color: "var(--color-white)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    });
                    nameSegments.forEach((segment) => {
                        const isAmpersand = segment.textContent.trim() === "&";
                        Object.assign(segment.style, {
                            display: "block",
                            fontSize: `${isAmpersand ? targetAmpersandFontSize : targetNameFontSize}px`,
                            lineHeight: `${isAmpersand ? targetAmpersandFontSize : targetNameLineHeight}px`,
                            margin: isAmpersand ? `${targetAmpersandFontSize * 0.15}px 0` : "0"
                        });
                    });
                    heroContent.append(transitionDate);
                    const messageRectAfterTypography = transitionMessage.getBoundingClientRect();
                    transitionMessage.style.left = `${
                        titleRectAfterZoom.left + titleRectAfterZoom.width / 2 -
                        messageWidth / 2 - heroContentRect.left
                    }px`;
                    transitionMessage.style.top = `${
                        titleRectAfterZoom.top - messageRectAfterTypography.height -
                        heroContentRect.top - 8
                    }px`;
                    heroContent.style.zIndex = "1001";
                    transitionPaper.remove();
                    intro.classList.add("is-transitioning");

                    setTimeout(() => {
                        intro.classList.add("is-hidden");
                        heroContent.style.zIndex = "";
                        heroTitle.style.zIndex = "";
                        body.classList.remove("envelope-locked");
                        body.style.paddingRight = originalBodyPaddingRight;
                        window.scrollTo(0, 0);
                    }, 600);
                });
            }, { once: true });
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
    initAnimations();
    initRSVP();
    initEnvelope();
});