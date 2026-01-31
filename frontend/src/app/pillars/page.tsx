'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useLenis from '@/hooks/useLenis';

gsap.registerPlugin(ScrollTrigger);

const execBoardData = [
    {
        name: 'Kavin Siriwardana',
        title: 'President',
        image: '/images/EB Portraits/Kavin Siriwardana - President.jpg'
    },
    {
        name: 'Samod Dharmaraja',
        title: 'Vice President',
        image: '/images/EB Portraits/Samod Dharmaraja - Vice President.jpg'
    },
    {
        name: 'Amoda Attanayake',
        title: 'Secretary',
        image: '/images/EB Portraits/Amoda Attanayake - Secretary.jpg'
    },
    {
        name: 'Sumudu Nadeera',
        title: 'Assistant Secretary',
        image: '/images/EB Portraits/Sumudu Nadeera - Assistant Secretary.jpg'
    },
    {
        name: 'Hasindu Warnapura',
        title: 'Treasurer',
        image: '/images/EB Portraits/Hasindu Warnapura - Treasurer.jpg'
    }
];

const pillarsData = [
    {
        id: 1,
        title: 'Events',
        description: 'The Events pillar leads the full lifecycle of OREPA\'s flagship programmes, ceremonies, and initiatives from idea generation and planning to execution and post-event review. It is responsible for making sure every event is purposeful, well-structured, and aligned with OREPA\'s mission and yearly objectives. In essence, Events turns OREPA\'s vision into tangible experiences for members, students, and partners.',
        coDirectors: [
            { name: 'Dulan Fernando', title: 'Co-director', image: '/images/EB Portraits/Dulan Fernando - Co-director of Events.jpg' },
            { name: 'Lasen Kodithuwakku', title: 'Co-director', image: '/images/EB Portraits/Lasen Kodithuwakku - Co-director of Events.jpg' }
        ]
    },
    {
        id: 2,
        title: 'Information Management & Marketing',
        description: 'Information Management & Marketing acts as the guardian of OREPA\'s data, and digital presence. This pillar maintains organized records, and systems so that information is accurate, accessible, and secure for the Executive Board and project teams. The team ensures that communication channels such as websites, newsletters, and other online media are consistent with OREPA\'s identity. By managing both information flow and visibility, this pillar helps the entire organization operate efficiently and look professional to the outside world.',
        coDirectors: [
            { name: 'Chamindu Dissanayake', title: 'Co-director', image: '/images/EB Portraits/Chamindu Dissanayake - Co-directors of Information Management & Marketing.jpg' },
            { name: 'Chehara Amarasekara', title: 'Co-director', image: '/images/EB Portraits/Chehara Amarasekara - Co-directors of Information Management & Marketing.jpg' }
        ]
    },
    {
        id: 3,
        title: 'Membership',
        description: 'The Membership pillar focuses on building a strong, connected, and motivated member base. It maintains up-to-date member data and contribution records, ensuring transparency in how effort and involvement are recognized. This team designs initiatives such as inductions, engagement drives, and appreciation mechanisms so members feel valued and included. Membership also acts as a support hub for project teams, sharing contribution forms and tracking involvement throughout the term. Ultimately, this pillar safeguards the culture of community and belonging within the OREPA Student Chapter.',
        coDirectors: [
            { name: 'Hiran Dharmapala', title: 'Co-director', image: '/images/EB Portraits/Hiran Dharmapala - Co-director of Membership.jpg' },
            { name: 'Nirmala Warushavithana', title: 'Co-director', image: '/images/EB Portraits/Nirmala Warushavithana - Co-director of Membership.jpg' }
        ]
    },
    {
        id: 4,
        title: 'Public Relations (PR)',
        description: 'Public Relations is responsible for shaping how OREPA is seen and heard by the world. This pillar handles official communications, storytelling, and visual content so that every public message reflects OREPA\'s values and professionalism. It works closely with other pillars to approve designs, captions, and posts, and to manage the PR calendar for consistent, well-timed outreach. The PR team also ensures that branding guidelines are followed across all flyers, videos, and social media campaigns. Through careful messaging and visibility, they strengthen OREPA\'s credibility with students, professionals, and partner organizations.',
        coDirectors: [
            { name: 'Sumudu Wijebandara', title: 'Co-director', image: '/images/EB Portraits/Sumudu Wijebandara - Co-director of Public Relations.jpg' },
            { name: 'Thevindu Dissanayake', title: 'Co-director', image: '/images/EB Portraits/Thevindu Dissanayake - Co-director of Public Relations.jpg' }
        ]
    },
    {
        id: 5,
        title: 'Research & Development (R&D)',
        description: 'The R&D pillar drives innovation and continuous improvement across the Student Chapter. It studies how existing processes, projects, and structures are functioning, and proposes evidence-based enhancements or new initiatives. R&D also supports long-term sustainability by documenting insights and best practices for future terms. In short, this pillar keeps OREPA evolving.',
        coDirectors: [
            { name: 'Anjana Viduranga', title: 'Director', image: '/images/EB Portraits/Anjana Viduranga - Director of Research & Development.jpg' }
        ]
    },
    {
        id: 6,
        title: 'School Projects',
        description: 'The School Projects pillar is OREPA\'s direct bridge to Royal College and its students. It designs and runs programmes that promote STEM awareness, career guidance, and practical exposure to engineering and technology. These projects combine mentoring, workshops, competitions, and structured support so that school students can interact closely with undergraduates and professionals. The team ensures that each initiative is impactful, and aligned with OREPA\'s core themes such as self-learning and sustainable development. By nurturing the next generation, School Projects keeps the spirit of OREPA rooted in its alma mater.',
        coDirectors: [
            { name: 'Dehan Wijesinghe', title: 'Co-director', image: '/images/EB Portraits/Dehan Wijesinghe - Co-director of School Projects.jpg' },
            { name: 'Sithum de Zoysa', title: 'Co-director', image: '/images/EB Portraits/Sithum de Zoysa  - Co-director of School Projects.jpg' }
        ]
    }
];

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
            const textWrap = section.querySelector('.js_text_wrap');
            const content = section.querySelector('.pillar_content');

            if (textWrap) {
                ScrollTrigger.create({
                    trigger: section,
                    start: 'top 70%',
                    onEnter: () => textWrap.classList.add('is_animated'),
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
                        {/* Executive Board Section */}
                        <section className="pillar_section js_section">
                            <div className="pillar_inner">
                                <div className="pillar_header" style={{ justifyContent: 'center' }}>
                                    <h2 className="pillar_title" style={{ textAlign: 'center', flex: 'none' }}>
                                        <span className="text_wrap js_text_wrap" aria-hidden="true">
                                            {'Executive Board'.split('').map((letter, i) => (
                                                <span key={i} className="letter">{letter === ' ' ? '\u00A0' : letter}</span>
                                            ))}
                                        </span>
                                        <span className="sr_only">Executive Board</span>
                                    </h2>
                                </div>
                                <div className="pillar_content">
                                    <div className="pillar_directors_list" style={{
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                        maxWidth: '1000px',
                                        margin: '0 auto'
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
                                            <span className="sr_only">{pillar.title}</span>
                                        </h2>
                                    </div>
                                    <div className="pillar_content">
                                        <div className="pillar_content_grid">
                                            <div className="pillar_content_left">
                                                <p className="pillar_description">
                                                    {pillar.description}
                                                </p>
                                            </div>
                                            <div className="pillar_content_right">
                                                <div className="pillar_directors">
                                                    <h3 className="pillar_directors_title">Co-Directors</h3>
                                                    <div className="pillar_directors_list">
                                                        {pillar.coDirectors.map((director, idx) => (
                                                            <div key={idx} className="pillar_director">
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
                                                                    {director.name || 'To be announced'}
                                                                </div>
                                                                <div className="pillar_director_title">
                                                                    {director.title}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
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
