'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutUs() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        // Animate title letters - triggering via class added by ScrollTrigger
        const textWrap = section.querySelector('.js_text_wrap');
        if (textWrap) {
            ScrollTrigger.create({
                trigger: section,
                start: 'top 70%',
                onEnter: () => textWrap.classList.add('is_animated'),
            });
        }

        // Animate content
        const info = section.querySelector('.jms_info');
        gsap.fromTo(info,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.3,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 70%',
                }
            }
        );

        // Animate image
        const img = section.querySelector('.jms_movie_img');
        if (img) {
            gsap.to(img, {
                opacity: 1,
                duration: 1,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 60%',
                }
            });
        }

    }, []);

    return (
        <section id="about" className="jms js_section" ref={sectionRef}>
            {/* Added style for responsive wrapping */}
            <div className="jms_ttl_wrap" style={{ flexWrap: 'wrap' }}>
                <h2 className="jms_ttl">
                    <span className="text_wrap js_text_wrap" aria-hidden="true">
                        {'About'.split('').map((letter, i) => (
                            <span key={i} className="letter">{letter}</span>
                        ))}
                    </span>
                    <span className="sr_only">About</span>
                </h2>
                <div className="jms_info" style={{ width: '100%' }}>
                    <div className="who_we_are_container">
                        <div className="who_we_are_content">
                            <p className="jms_info_ttl">Who We Are</p>
                            <div style={{ marginTop: '30px' }}>
                                <p className="history_txt" style={{ fontSize: '16px', maxWidth: '600px' }}>
                                    The Old Royalists’ Engineering Professionals’ Association (OREPA) serves as the unified platform for Royal College alumni in the engineering and technological sectors. We are more than just a professional network; we are a bridge between the legacy of Reid Avenue and the frontiers of modern industry.
                                </p>
                                <p className="history_txt" style={{ fontSize: '16px', maxWidth: '600px', marginTop: '20px' }}>
                                    Join us in shaping a future that honours our past while embracing new challenges and opportunities
                                    in the engineering world.
                                </p>
                            </div>
                        </div>
                        <div className="who_we_are_logo">
                            <Image
                                src="/images/OREPA Term Logo for 2025-26.jpeg"
                                alt="OREPA Term Logo 2025-26"
                                width={300}
                                height={300}
                                style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
                            />
                            <span>OREPA Term Logo for 2025-26</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="jms_movie_wrap is_active">
                <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
                    <Image
                        loading="lazy"
                        src="/images/hero.png" // Using an existing image for now
                        alt="About OREPA"
                        width={1200}
                        height={675}
                        className="jms_movie_img is_visible"
                        style={{ width: '100%', height: 'auto', opacity: 1 }}
                    />
                </div>
            </div>
        </section>
    );
}
