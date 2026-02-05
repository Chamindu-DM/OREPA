'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useLenis from '@/hooks/useLenis';
import { execBoardData, pillarsData, mainBodyData } from '@/data/organization';

gsap.registerPlugin(ScrollTrigger);

export default function OurTeamPage() {
    useLenis();
    const pageRef = useRef<HTMLDivElement>(null);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        setHasScrolled(true);
    }, []);

    useEffect(() => {
        const page = pageRef.current;
        if (!page) return;

        // Animate sections
        const sections = page.querySelectorAll('.js_section');

        sections.forEach((section) => {
            const textWraps = section.querySelectorAll('.js_text_wrap');
            const content = section.querySelector('.pillar_content, .team_grid');

            if (textWraps.length > 0) {
                ScrollTrigger.create({
                    trigger: section,
                    start: 'top 80%',
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
                        delay: 0.2,
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 80%',
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
            <div className="pillars_page"> {/* Reusing pillars_page class for consistent styling */}
                <div className="pillars_page_bg" aria-hidden="true"></div>

                <div className="pillars_hero">
                    <h1 className="pillars_hero_title">
                        <span className="text_wrap js_text_wrap" aria-hidden="true">
                            {'Our Team'.split('').map((letter, i) => (
                                <span key={i} className="letter">{letter === ' ' ? '\u00A0' : letter}</span>
                            ))}
                        </span>
                        <span className="sr_only">Our Team</span>
                    </h1>
                </div>

                <div className="pillars_container">

                    {/* Main Body Executive Committee Section */}
                    <section className="pillar_section js_section" style={{ paddingBottom: '3rem' }}>
                        <div className="pillar_inner">
                            <div className="pillar_header" style={{ justifyContent: 'center' }}>
                                <h2 className="pillar_title" style={{ textAlign: 'center', flex: 'none', fontSize: '2.2rem' }}>
                                    <span className="text_wrap js_text_wrap" aria-hidden="true">
                                        {'OREPA Executive Committee'.split('').map((letter, i) => (
                                            <span key={i} className="letter">{letter === ' ' ? '\u00A0' : letter}</span>
                                        ))}
                                    </span>
                                    <span className="sr_only">OREPA Executive Committee</span>
                                </h2>
                            </div>
                            <div className="pillar_content">
                                <div className="pillar_directors_list" style={{
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    maxWidth: '1000px',
                                    margin: '0 auto',
                                    justifyContent: 'center'
                                }}>
                                    {mainBodyData.map((member, idx) => (
                                        <div key={idx} className="pillar_director">
                                            <div className="pillar_director_image">
                                                <img
                                                    src={member.image}
                                                    alt={member.name}
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="pillar_director_name">
                                                {member.name}
                                            </div>
                                            <div className="pillar_director_title">
                                                {member.title}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Student Chapter Executive Board Section */}
                    <section className="pillar_section js_section">
                        <div className="pillar_inner">
                            <div className="pillar_header" style={{ justifyContent: 'center' }}>
                                <h2 className="pillar_title" style={{ textAlign: 'center', flex: 'none' }}>
                                    <span className="text_wrap js_text_wrap" aria-hidden="true">
                                        {'Student Chapter Executive Board'.split('').map((letter, i) => (
                                            <span key={i} className="letter">{letter === ' ' ? '\u00A0' : letter}</span>
                                        ))}
                                    </span>
                                    <span className="sr_only">Student Chapter Executive Board</span>
                                </h2>
                            </div>
                            <div className="pillar_content">
                                <div className="pillar_directors_list" style={{
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    maxWidth: '1200px',
                                    margin: '0 auto',
                                    justifyContent: 'center'
                                }}>
                                    {execBoardData.map((member, idx) => (
                                        <div key={idx} className="pillar_director">
                                            <div className="pillar_director_image">
                                                <img
                                                    src={member.image}
                                                    alt={member.name}
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="pillar_director_name">
                                                {member.name}
                                            </div>
                                            <div className="pillar_director_title">
                                                {member.title}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Co-Directors Section Grouped by Pillar */}
                    <div style={{ marginTop: '5rem' }}>
                        <section className="js_section" style={{ marginBottom: '3rem' }}>
                            <h2 className="pillar_title" style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
                                <span className="text_wrap js_text_wrap" aria-hidden="true">
                                    {'Co-Directors'.split('').map((letter, i) => (
                                        <span key={i} className="letter">{letter === ' ' ? '\u00A0' : letter}</span>
                                    ))}
                                </span>
                                <span className="sr_only">Co-Directors</span>
                            </h2>
                        </section>

                        {pillarsData.map((pillar) => (
                            <section key={pillar.id} className="pillar_section js_section" style={{ marginBottom: '4rem' }}>
                                <div className="pillar_inner">
                                    <div className="pillar_header" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                                        <h3 className="pillar_title" style={{ fontSize: '1.8rem', textAlign: 'center', flex: 'none' }}>
                                            <span className="text_wrap js_text_wrap" aria-hidden="true">
                                                {pillar.title} {pillar.titleLine2}
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="pillar_content">
                                        <div className="pillar_directors_list" style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            justifyContent: 'center',
                                            gap: '30px',
                                            maxWidth: '1000px',
                                            margin: '0 auto',
                                            width: '100%',
                                            padding: '0 20px'
                                        }}>
                                            {pillar.coDirectors.map((director, idx) => (
                                                <div key={idx} className="pillar_director" style={{ flex: '0 1 250px' }}>
                                                    <div className="pillar_director_image">
                                                        {director.image && (
                                                            <img
                                                                src={director.image}
                                                                alt={director.name}
                                                                loading="lazy"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="pillar_director_name">
                                                        {director.name}
                                                    </div>
                                                    <div className="pillar_director_title">
                                                        {director.title}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}
