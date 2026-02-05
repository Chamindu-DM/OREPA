'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useLenis from '@/hooks/useLenis';
import { pillarsData } from '@/data/organization';

gsap.registerPlugin(ScrollTrigger);

export default function PillarsPage() {
    useLenis();
    const pageRef = useRef<HTMLDivElement>(null);
    const [hasScrolled, setHasScrolled] = useState(false);

    // Show header immediately on mount for pillars page
    useEffect(() => {
        setHasScrolled(true);
    }, []);

    useEffect(() => {
        const page = pageRef.current;
        if (!page) return;

        // Animate each pillar section
        const pillarSections = page.querySelectorAll('.pillar_section');

        pillarSections.forEach((section) => {
            const textWraps = section.querySelectorAll('.js_text_wrap');
            const content = section.querySelector('.pillar_content');

            if (textWraps.length > 0) {
                ScrollTrigger.create({
                    trigger: section,
                    start: 'top 70%',
                    onEnter: () => textWraps.forEach(wrap => wrap.classList.add('is_animated')),
                });
            }

            if (content) {
                gsap.fromTo(content,
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
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div className={`wrapper animation_loaded ${hasScrolled ? 'has-scrolled' : ''}`} ref={pageRef}>
            <Header />
            <Navigation state="normal" />
            <div className="pillars_page">
                <div className="pillars_page_bg" aria-hidden="true"></div>
                <div className="pillars_hero">
                    <h1 className="pillars_hero_title">
                        <span className="text_wrap js_text_wrap" aria-hidden="true">
                            {'Our Pillars'.split('').map((letter, i) => (
                                <span key={i} className="letter">{letter === ' ' ? '\u00A0' : letter}</span>
                            ))}
                        </span>
                        <span className="sr_only">Our Pillars</span>
                    </h1>
                    <p className="pillars_hero_subtitle">
                        The six pillars that drive OREPA Student Chapter forward
                    </p>
                </div>

                <div className="pillars_container">
                    {/* Pillars Loop */}
                    {pillarsData.map((pillar) => (
                        <section key={pillar.id} className="pillar_section js_section">
                            <div className="pillar_inner">
                                <div className="pillar_header">
                                    <div className="pillar_number">
                                        {String(pillar.id).padStart(2, '0')}
                                    </div>
                                    <h2 className="pillar_title">
                                        <span className="text_wrap js_text_wrap" aria-hidden="true">
                                            {pillar.title.split('').map((letter, i) => (
                                                <span key={i} className="letter">{letter === ' ' ? '\u00A0' : letter}</span>
                                            ))}
                                        </span>
                                        {pillar.titleLine2 && (
                                            <span className="text_wrap js_text_wrap pillar_title_line2" aria-hidden="true">
                                                {pillar.titleLine2.split('').map((letter, i) => (
                                                    <span key={i} className="letter">{letter === ' ' ? '\u00A0' : letter}</span>
                                                ))}
                                            </span>
                                        )}
                                        <span className="sr_only">{pillar.title}{pillar.titleLine2 ? ` ${pillar.titleLine2}` : ''}</span>
                                    </h2>
                                </div>
                                <div className="pillar_content">
                                    <div className="pillar_content_grid">
                                        <div className="pillar_content_left" style={{ width: '100%', maxWidth: 'none' }}>
                                            <p className="pillar_description">
                                                {pillar.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
