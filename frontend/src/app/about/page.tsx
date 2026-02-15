'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useLenis from '@/hooks/useLenis';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
    useLenis();
    const pageRef = useRef<HTMLDivElement>(null);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        setHasScrolled(true);
    }, []);

    useEffect(() => {
        const page = pageRef.current;
        if (!page) return;

        const sections = page.querySelectorAll('.js_section');

        sections.forEach((section) => {
            const textWraps = section.querySelectorAll('.js_text_wrap');
            const fadeElements = section.querySelectorAll('.fade_in_up');
            const imageReveals = section.querySelectorAll('.reveal_image');

            if (textWraps.length > 0) {
                ScrollTrigger.create({
                    trigger: section,
                    start: 'top 80%',
                    onEnter: () => textWraps.forEach(wrap => wrap.classList.add('is_animated')),
                });
            }

            if (fadeElements.length > 0) {
                gsap.fromTo(fadeElements,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 80%',
                        }
                    }
                );
            }

            if (imageReveals.length > 0) {
                gsap.fromTo(imageReveals,
                    { scale: 1.1, opacity: 0 },
                    {
                        scale: 1,
                        opacity: 1,
                        duration: 1.2,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 75%',
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
            <div className="pillars_page"> {/* Reusing base page structure */}
                <div className="pillars_page_bg" aria-hidden="true"></div>

                <div className="pillars_hero">
                    <h1 className="pillars_hero_title">
                        <span className="text_wrap js_text_wrap" aria-hidden="true">
                            {'About Us'.split('').map((letter, i) => (
                                <span key={i} className="letter">{letter === ' ' ? '\u00A0' : letter}</span>
                            ))}
                        </span>
                        <span className="sr_only">About Us</span>
                    </h1>
                </div>

                <div className="pillars_container">

                    {/* WHO ARE WE Section */}
                    <section className="pillar_section js_section" style={{ paddingBottom: '3rem' }}>
                        <div className="pillar_inner">
                            <div className="pillar_content_grid" style={{ alignItems: 'center' }}>
                                <div className="pillar_content_left" style={{ width: '100%', maxWidth: 'none' }}>
                                    <h2 className="pillar_title fade_in_up" style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1.5rem' }}>WHO ARE WE?</h2>
                                    <div className="fade_in_up" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)', lineHeight: '1.8', color: 'rgba(255, 255, 255, 0.85)' }}>
                                        <p style={{ marginBottom: '1.5rem' }}>
                                            OREPA, Old Royalists Engineering Professionals’ Association, instigated on Sunday the 23rd of November, 2014, is the most recent addition to professional bodies under the Royal College Union. A large number of engineers, architects and other professionals in allied fields gathered to bring this organization about and through it, serve the Alma mater.
                                        </p>
                                        <p>
                                            Old Royalists in engineering professions have recognized 5 channels to give back to their Alma mater:
                                        </p>
                                        <ul style={{ listStyle: 'none', padding: '1.5rem 0', marginLeft: '1rem' }}>
                                            {[
                                                'Promote and provide career guidance to the students.',
                                                'Promote engineering related professions among students and school leavers.',
                                                'Share latest trends/ knowledge/ practices/ issues in engineering related fields.',
                                                'Provide scholarships and financial assistance in engineering related education.',
                                                'Support initiatives/ activities of membership, Royal College Union and its affiliated associations.'
                                            ].map((item, i) => (
                                                <li key={i} style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'baseline' }}>
                                                    <span style={{ color: '#cfaa5c', marginRight: '10px' }}>▪</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                        <p>
                                            In addition to those constitutionally sated objectives, OREPA, as a congregation of technical experts in many facets of engineering and related fields, expect to empower this master plan towards sustainability, sharing their prowess to uplift each focus area including sustainable air, water, soil and bio diversity, sustainable energy, sustainable manufacturing and production, sustainable construction, sustainable agriculture and fisheries and sustainable transportation and tourism.
                                        </p>
                                        <p style={{ marginTop: '1.5rem' }}>
                                            More importantly, OREPA will open up a reservoir of knowledge, technical expertise and material support in the fields of engineering, architecture and related fields for the benefit of the College and students. Based on these broader objectives, OREPA is looking forward to become a key stakeholder of the Royal College, continuously working towards the betterment of students and the Alma mater.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* WHAT DO WE STAND FOR Section */}
                    <section className="pillar_section js_section" style={{ paddingBottom: '3rem' }}>
                        <div className="pillar_inner">
                            <div className="pillar_content_grid">
                                <div className="pillar_content_left" style={{ width: '100%', maxWidth: 'none' }}>
                                    <h2 className="pillar_title fade_in_up" style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1.5rem' }}>WHAT DO WE STAND FOR?</h2>
                                    <div className="fade_in_up" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)', lineHeight: '1.8', color: 'rgba(255, 255, 255, 0.85)' }}>
                                        <p style={{ marginBottom: '1.5rem' }}>
                                            Old Royalists Engineering Professionals’ Association was formed under the patronage of Royal College Union. OREPA is a gathering of old Royalist Engineers, Architects, and Quantity Surveyors and other engineering related professionals.
                                        </p>
                                        <p style={{ marginBottom: '1.5rem' }}>
                                            OREPA Student Chapter is the undergraduate body of Old Royalists Engineering Professionals’ Association. The Student Chapter functions as the working body of OREPA, directly involved with projects carried out at Royal College and in the wider society. The organisation consists of dynamic and visionary individuals from various Engineering related higher education institutions and faculties.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* OUR THEME Section */}
                    <section className="pillar_section js_section">
                        <div className="pillar_inner">
                            <div className="pillar_content_grid">
                                <div className="pillar_content_left" style={{ width: '100%', maxWidth: 'none' }}>
                                    <h2 className="pillar_title fade_in_up" style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '1.5rem' }}>OUR THEME</h2>
                                    <div className="fade_in_up" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)', lineHeight: '1.8', color: 'rgba(255, 255, 255, 0.85)' }}>
                                        <p style={{ marginBottom: '1.5rem' }}>
                                            We cater our services to our Alma mater, and the community at large, through various projects. The key themes, derived from the five-fold objectives mentioned in the in our constitution, under which our projects are scoped in and organised, are;
                                        </p>
                                        <ul style={{ listStyle: 'none', padding: '0', marginLeft: '1rem' }}>
                                            {[
                                                'Technology commercialization and use of technology research in promoting technology ventures.',
                                                'Technology transfer and technology mentoring.',
                                                'Youth activism in nation building.',
                                                'Sustainable development through use of green practices.',
                                                'Promoting informed democratic citizenry through cross-cultural interaction in serving the community.',
                                                'Increasing the engineering and related technical know-how of the students.',
                                                'Kindling the interest in self-learning and lifelong learning of the youth.'
                                            ].map((item, i) => (
                                                <li key={i} style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'baseline' }}>
                                                    <span style={{ color: '#cfaa5c', marginRight: '10px' }}>▪</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
            <Footer />
        </div>
    );
}
