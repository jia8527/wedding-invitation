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

    if (!intro || !scene || !paper || !heroTitle || !heroDate) {
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
            const transitionPaper = paper.cloneNode(true);
            const transitionMonogram = transitionPaper.querySelector(".invitation-monogram");
            const transitionMessage = transitionPaper.querySelector(".invitation-message");
            const transitionDate = transitionPaper.querySelector(".invitation-date");

            if (!transitionMonogram || !transitionMessage || !transitionDate) {
                unlockPage();
                return;
            }

            const transitionPaperCenter = {
                x: paperRect.left + paperRect.width / 2,
                y: paperRect.top + paperRect.height / 2
            };
            const timing = {
                duration: 1800,
                easing: "cubic-bezier(0.65, 0, 0.35, 1)",
                fill: "forwards"
            };
            const text = transitionMonogram.textContent;
            const ampersandIndex = text.indexOf("&");

            if (ampersandIndex < 0) {
                unlockPage();
                return;
            }

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

            const rangeForText = (element, start, end) => {
                const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
                const nodes = [];
                let node;

                while ((node = walker.nextNode())) {
                    nodes.push(node);
                }

                const range = document.createRange();
                let offset = 0;
                let startNode;
                let startOffset;
                let endNode;
                let endOffset;

                for (const textNode of nodes) {
                    const nodeEnd = offset + textNode.textContent.length;

                    if (!startNode && start <= nodeEnd) {
                        startNode = textNode;
                        startOffset = Math.max(0, start - offset);
                    }

                    if (end <= nodeEnd) {
                        endNode = textNode;
                        endOffset = end - offset;
                        break;
                    }

                    offset = nodeEnd;
                }

                if (!startNode || !endNode) {
                    return null;
                }

                range.setStart(startNode, startOffset);
                range.setEnd(endNode, endOffset);
                return range;
            };
            const rectForRange = (range) => {
                const rect = range?.getBoundingClientRect();
                return rect && rect.width && rect.height ? rect : null;
            };
            const sourceNameRanges = [
                rangeForText(transitionMonogram, 0, ampersandIndex - 1),
                rangeForText(transitionMonogram, ampersandIndex, ampersandIndex + 1),
                rangeForText(transitionMonogram, ampersandIndex + 2, text.length)
            ];
            const targetNameRanges = [
                rangeForText(heroTitle, 0, ampersandIndex - 1),
                rangeForText(heroTitle, ampersandIndex, ampersandIndex + 1),
                rangeForText(heroTitle, ampersandIndex + 2, text.length)
            ];
            const sourceDateRange = rangeForText(
                transitionDate,
                0,
                transitionDate.textContent.length
            );
            const targetDateRange = rangeForText(heroDate, 0, heroDate.textContent.length);
            const sourceNameRects = sourceNameRanges.map(rectForRange);
            const targetNameRects = targetNameRanges.map(rectForRange);
            const sourceDateRect = rectForRange(sourceDateRange);
            const targetDateRect = rectForRange(targetDateRange);

            if (
                sourceNameRects.some((rect) => !rect) ||
                targetNameRects.some((rect) => !rect) ||
                !sourceDateRect ||
                !targetDateRect
            ) {
                transitionPaper.remove();
                unlockPage();
                return;
            }

            const monogramRect = transitionMonogram.getBoundingClientRect();
            const nameSegments = [
                text.slice(0, ampersandIndex).trim(),
                "&",
                text.slice(ampersandIndex + 1).trim()
            ].map((segmentText, index) => {
                const segment = document.createElement("span");
                const sourceRect = sourceNameRects[index];
                segment.textContent = segmentText;
                Object.assign(segment.style, {
                    position: "absolute",
                    left: `${sourceRect.left - monogramRect.left}px`,
                    top: `${sourceRect.top - monogramRect.top}px`,
                    display: "block",
                    whiteSpace: "pre",
                    transformOrigin: "0 0"
                });
                return segment;
            });
            Object.assign(transitionMonogram.style, {
                position: "relative",
                width: `${monogramRect.width}px`,
                height: `${monogramRect.height}px`,
                flex: "0 0 auto"
            });
            transitionMonogram.replaceChildren(...nameSegments);

            const targetTextRects = [
                ...targetNameRects,
                targetDateRect
            ];
            const contentBounds = targetTextRects.reduce((bounds, rect) => ({
                left: Math.min(bounds.left, rect.left),
                top: Math.min(bounds.top, rect.top),
                right: Math.max(bounds.right, rect.right),
                bottom: Math.max(bounds.bottom, rect.bottom)
            }), {
                left: Infinity,
                top: Infinity,
                right: -Infinity,
                bottom: -Infinity
            });
            const contentWidth = contentBounds.right - contentBounds.left;
            const contentHeight = contentBounds.bottom - contentBounds.top;
            const padding = 18;
            const stackedNameWidth = Math.max(...sourceNameRects.map((rect) => rect.width));
            const stackedNameHeight = sourceNameRects.reduce((height, rect) => height + rect.height, 0);
            const nameScale = Math.min(
                titleRect.width / stackedNameWidth,
                titleRect.height / stackedNameHeight
            );
            const paperScale = Math.max(
                1,
                nameScale,
                (contentWidth + padding * 2) / paperRect.width,
                (contentHeight + padding * 2) / paperRect.height
            );
            const contentCenter = {
                x: contentBounds.left + contentWidth / 2,
                y: contentBounds.top + contentHeight / 2
            };
            const paperTranslateX = contentCenter.x - transitionPaperCenter.x;
            const paperTranslateY = contentCenter.y - transitionPaperCenter.y;
            const transitioningTexts = [
                ...nameSegments,
                transitionDate
            ];
            const sourceTextRects = [
                ...nameSegments.map((segment) => segment.getBoundingClientRect()),
                sourceDateRect
            ];
            const targetRects = [
                ...targetNameRects,
                targetDateRect
            ];
            const textAnimations = transitioningTexts.map((element, index) => {
                const sourceRect = sourceTextRects[index];
                const targetRect = targetRects[index];
                const mappedLeft = contentCenter.x +
                    (sourceRect.left - transitionPaperCenter.x) * paperScale;
                const mappedTop = contentCenter.y +
                    (sourceRect.top - transitionPaperCenter.y) * paperScale;
                const translateX = (targetRect.left - mappedLeft) / paperScale;
                const translateY = (targetRect.top - mappedTop) / paperScale;
                const scaleX = targetRect.width / (sourceRect.width * paperScale);
                const scaleY = targetRect.height / (sourceRect.height * paperScale);

                element.style.transformOrigin = "0 0";
                return element.animate(
                    [
                        { transform: "translate(0px, 0px) scale(1, 1)" },
                        {
                            transform:
                                `translate(${translateX}px, ${translateY}px) ` +
                                `scale(${scaleX}, ${scaleY})`
                        }
                    ],
                    timing
                );
            });
            const textColorAnimations = [
                transitionMonogram.animate(
                    [{ color: getComputedStyle(transitionMonogram).color }, { color: "#fff" }],
                    timing
                ),
                transitionDate.animate(
                    [{ color: getComputedStyle(transitionDate).color }, { color: "#fff" }],
                    timing
                )
            ];

            paper.style.visibility = "hidden";
            scene.animate(
                [{ opacity: 1 }, { opacity: 0 }],
                { duration: 180, easing: "ease-out", fill: "forwards" }
            );
            const zoomAnimation = transitionPaper.animate(
                [
                    { transform: "translate(0px, 0px) scale(1)" },
                    {
                        transform:
                            `translate(${paperTranslateX}px, ${paperTranslateY}px) ` +
                            `scale(${paperScale})`
                    }
                ],
                timing
            );
            transitionMessage.animate(
                [{ opacity: 1 }, { opacity: 0 }],
                { duration: 180, easing: "ease-out", fill: "forwards" }
            );

            zoomAnimation.finished.then(() => {
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
                    { duration: 250, easing: "ease-out", fill: "forwards" }
                );
                const textFade = transitioningTexts.map((element) =>
                    element.animate(
                        [{ opacity: 1 }, { opacity: 0 }],
                        { duration: 250, easing: "ease-out", fill: "forwards" }
                    )
                );
                intro.classList.add("is-transitioning");
                Promise.all([
                    paperSurfaceFade.finished,
                    ...textFade.map((animation) => animation.finished)
                ]).then(() => {
                    transitionPaper.remove();
                    setTimeout(unlockPage, 350);
                });
            });
        }, 3200);
    };

    scene.addEventListener("click", (event) => {
        if (event.target.closest("#envelope")) {
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
