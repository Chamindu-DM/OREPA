'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimation() {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        // Lead text blur reveal animation
        const leadTexts = document.querySelectorAll('.js_lead_txt');
        leadTexts.forEach((txt) => {
            gsap.fromTo(
                txt,
                {
                    opacity: 0,
                    filter: 'blur(20px)',
                    y: 50,
                },
                {
                    opacity: 1,
                    filter: 'blur(0px)',
                    y: 0,
                    duration: 1.5,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: txt,
                        start: 'top 80%',
                        end: 'top 30%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        });

        // Statement section parallax
        const statementKvImg = document.querySelector('#statement_kv_img');
        if (statementKvImg) {
            gsap.to(statementKvImg, {
                yPercent: 20,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#statement',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }

        // Movie section scale-in animation
        const movieSection = document.querySelector('.section_movie');
        if (movieSection) {
            gsap.fromTo(
                movieSection,
                { scale: 0.9, opacity: 0 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: movieSection,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        }

        // Gallery items fade in
        const galleryItems = document.querySelectorAll('.gallery_item');
        galleryItems.forEach((item, index) => {
            gsap.fromTo(
                item,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: item,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        });

        // Event section fade in
        const eventSection = document.querySelector('.section_event');
        if (eventSection) {
            gsap.fromTo(
                eventSection,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: eventSection,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        }

        // Lineup section stagger animation
        const lineupItems = document.querySelectorAll('.lineup_item');
        gsap.fromTo(
            lineupItems,
            { opacity: 0, x: -30 },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.section_lineup',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
            }
        );

/*
        // Footer fade in logic removed to ensure visibility
        const footer = document.querySelector('.footer');
        // ... (removed)
*/

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);
}

// Hook for horizontal scroll (History section)
export function useHorizontalScroll(containerRef: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const sections = container.querySelectorAll('.history_item');
        const totalWidth = Array.from(sections).reduce(
            (acc, section) => acc + (section as HTMLElement).offsetWidth,
            0
        );

        const scrollTween = gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: 'none',
            scrollTrigger: {
                trigger: container,
                pin: true,
                scrub: 1,
                snap: 1 / (sections.length - 1),
                end: () => `+=${totalWidth}`,
                invalidateOnRefresh: true,
            },
        });

        return () => {
            scrollTween.kill();
            ScrollTrigger.getAll()
                .filter((st) => st.vars.trigger === container)
                .forEach((st) => st.kill());
        };
    }, [containerRef]);
}

// Hook for parallax effect
export function useParallax(elementRef: React.RefObject<HTMLElement | null>, speed: number = 0.5) {
    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const tween = gsap.to(element, {
            yPercent: speed * 100,
            ease: 'none',
            scrollTrigger: {
                trigger: element.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
            },
        });

        return () => {
            tween.kill();
        };
    }, [elementRef, speed]);
}

// Letter by letter reveal animation
export function useLetterReveal(containerRef: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const letters = container.querySelectorAll('.letter');

        gsap.fromTo(
            letters,
            { y: '100%', opacity: 0 },
            {
                y: '0%',
                opacity: 1,
                duration: 0.8,
                stagger: 0.03,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: container,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
            }
        );
    }, [containerRef]);
}
