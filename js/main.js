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
        setTimeout(async () => {
            await document.fonts.ready;

            const paperRect = paper.getBoundingClientRect();
            const titleRect = heroTitle.getBoundingClientRect();
            const transitionPaper = paper.cloneNode(true);
            const transitionMonogram = transitionPaper.querySelector(".invitation-monogram");
            const transitionMessage = transitionPaper.querySelector(".invitation-message");
            const transitionDate = transitionPaper.querySelector(".invitation-date");

            if (
                !transitionMonogram ||
                !transitionMessage ||
                !transitionDate
            ) {
                unlockPage();
                return;
            }

            const sourceNameElements = [
                ...transitionMonogram.querySelectorAll(".invitation-name, .invitation-ampersand")
            ];
            const targetNameElements = [
                ...heroTitle.querySelectorAll(".hero-name, .hero-ampersand")
            ];

            if (sourceNameElements.length !== 3 || targetNameElements.length !== 3) {
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
            const sourceDateRange = rangeForText(
                transitionDate,
                0,
                transitionDate.textContent.length
            );
            const targetDateRange = rangeForText(heroDate, 0, heroDate.textContent.length);
            const sourceNameRects = sourceNameElements.map((element) =>
                element.getBoundingClientRect()
            );
            const targetNameRects = targetNameElements.map((element) =>
                element.getBoundingClientRect()
            );
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

            const sourceRects = [...sourceNameRects, sourceDateRect];
            const targetRects = [...targetNameRects, targetDateRect];
            const textTargets = [...targetNameElements, heroDate];
            const cardStyle = getComputedStyle(transitionPaper);
            const borderLeft = parseFloat(cardStyle.borderLeftWidth);
            const borderTop = parseFloat(cardStyle.borderTopWidth);
            const sourceColors = [
                ...sourceNameElements.map((element) => getComputedStyle(element).color),
                getComputedStyle(transitionDate).color
            ];
            const textSegments = [...sourceNameElements, transitionDate].map(
                (source, index) => {
                    const targetStyle = getComputedStyle(textTargets[index]);
                    const segment = document.createElement("span");
                    segment.textContent = source.textContent;
                    Object.assign(segment.style, {
                        position: "absolute",
                        left: `${sourceRects[index].left - paperRect.left - borderLeft}px`,
                        top: `${sourceRects[index].top - paperRect.top - borderTop}px`,
                        display: "block",
                        width: "max-content",
                        margin: "0",
                        whiteSpace: "pre",
                        transformOrigin: "0 0",
                        color: sourceColors[index],
                        fontFamily: targetStyle.fontFamily,
                        fontSize: targetStyle.fontSize,
                        fontWeight: targetStyle.fontWeight,
                        fontStyle: targetStyle.fontStyle,
                        lineHeight: targetStyle.lineHeight,
                        letterSpacing: targetStyle.letterSpacing,
                        textTransform: targetStyle.textTransform
                    });
                    return segment;
                }
            );
            transitionMonogram.remove();
            transitionDate.remove();
            transitionPaper.append(...textSegments);

            const naturalTextRects = textSegments.map((segment) =>
                segment.getBoundingClientRect()
            );
            const naturalGlyphRects = textSegments.map((segment) =>
                rectForRange(rangeForText(segment, 0, segment.textContent.length))
            );

            if (naturalGlyphRects.some((rect) => !rect)) {
                transitionPaper.remove();
                unlockPage();
                return;
            }

            textSegments.forEach((segment, index) => {
                const sourceRect = sourceRects[index];
                const naturalRect = naturalTextRects[index];
                const naturalGlyphRect = naturalGlyphRects[index];

                if (index === 3) {
                    Object.assign(segment.style, {
                        left: `${parseFloat(segment.style.left) -
                        (naturalGlyphRect.left - naturalRect.left)}px`,
                        top: `${parseFloat(segment.style.top) -
                        (naturalGlyphRect.top - naturalRect.top)}px`
                    });
                }

                const scaleX = sourceRect.width / naturalGlyphRect.width;
                const scaleY = sourceRect.height / naturalGlyphRect.height;
                Object.assign(segment.style, {
                    transform:
                        index === 3
                            ? `scale(${scaleY})`
                            : `scale(${scaleX}, ${scaleY})`
                });
            });

            const sourceTextRects = textSegments.map((segment, index) =>
                index === 3
                    ? rectForRange(rangeForText(segment, 0, segment.textContent.length))
                    : segment.getBoundingClientRect()
            );
            const animationTextRects = naturalTextRects.map((rect, index) =>
                index === 3 ? naturalGlyphRects[index] : rect
            );
            const contentBounds = targetRects.reduce((bounds, rect) => ({
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
            const textAnimations = textSegments.map((element, index) => {
                const sourceRect = sourceTextRects[index];
                const naturalRect = animationTextRects[index];
                const targetRect = targetRects[index];
                const mappedLeft = contentCenter.x +
                    (sourceRect.left - transitionPaperCenter.x) * paperScale;
                const mappedTop = contentCenter.y +
                    (sourceRect.top - transitionPaperCenter.y) * paperScale;
                const translateX = (targetRect.left - mappedLeft) / paperScale;
                const translateY = (targetRect.top - mappedTop) / paperScale;
                const scaleX = targetRect.width / (naturalRect.width * paperScale);
                const scaleY = targetRect.height / (naturalRect.height * paperScale);

                element.style.transformOrigin = "0 0";
                return element.animate(
                    [
                        { transform: element.style.transform },
                        {
                            transform:
                                `translate(${translateX}px, ${translateY}px) ` +
                                `scale(${scaleX}, ${scaleY})`
                        }
                    ],
                    timing
                );
            });
            const textColorAnimations = textSegments.map((element) =>
                element.animate(
                    [{ color: element.style.color }, { color: "#fff" }],
                    timing
                )
            );

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
                const textFade = textSegments.map((element) =>
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
        }, 3600);
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
