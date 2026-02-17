'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useLenis from '@/hooks/useLenis';

gsap.registerPlugin(ScrollTrigger);

interface Project {
    id: string;
    num: string;
    title: string;
    description: string[];
    images: { src: string; width: number; height: number }[];
    facebookAlbum?: string;
}

const projectsData: Project[] = [
    {
        id: 'tesserx',
        num: '01',
        title: 'TesserX',
        description: [
            "Old Royalists' Engineering Professionals Association (OREPA), joined forces with Royal College Computer Society (RCCS), to organize TesserX, Sri Lanka's largest school-level ideathon. Conducted as a major sub-project under the flagship event Axis with the financial support of OREPA, the grand-finale of TesserX was held on 2nd September at Royal College MAS Arena and RCU Skills Centre.",
            "The team from Royal College emerged victorious, whereas the team of St. Joseph's Girls' School became the runners-up and the team of Kekirawa Central College became the second runners-up. An overall prize pool of LKR 225000 was distributed among the winning teams.",
            "The project unfolded over a five-month timeline starting with opening registrations on 1st May, followed by an extensive workshop series consisting of 8 workshops that covered version control, web and mobile development, business fundamentals, cloud computing, AI, and cybersecurity which were conducted by both OREPA members as well as industry partners. TesserX saw the participation of around 150 competitors from all around Sri Lanka representing almost all the provinces of the country including Western, Northern, Eastern, North-Western, Central, and North-Central.",
            "Kickstarting with the proposal submission stage, the competition then had the semi finals with 15 teams shortlisted for it and mentors from OREPA were allocated to all the semi finalist teams. 7 teams were shortlisted to the finals, which notably had an island-wide distribution. The delegates of TesserX also had the opportunity to take part in the panel discussions, guest speeches, and games organized for the ICT convention Axis as well.",
            "NCINGA came onboard as the Platinum Partner of TesserX. ESNA Holdings supported the initiative as the Silver Partner. ModernPack Lanka joined as the Event Partner and PickMe joined as the Mobility Partner. N-Able joined as the Knowledge Partner. Further, personal contributions from OREPA members too helped strengthen the financial stability of the event.",
            "All in all, OREPA could contribute to the entire Sri Lankan school community at large, bringing technology to every corner of the country being the key objective of the project. It was done through knowledge sessions, mentoring, and a competitive stage to showcase their creative ideas and prototypes that bridged the gap between the industry and schools."
        ],
        images: [
            { src: '/images/axis.jpg', width: 585, height: 350 },
            { src: '/images/axis1.jpg', width: 280, height: 186 },
            { src: '/images/axis2.jpg', width: 280, height: 186 },
            { src: '/images/axis3.jpg', width: 280, height: 186 },
            { src: '/images/axis5.jpg', width: 435, height: 290 },
            { src: '/images/axis6.jpg', width: 435, height: 290 }
        ],
        facebookAlbum: 'https://www.facebook.com/media/set/?set=a.778696154870154&type=3'
    },
    {
        id: 'oceanguard',
        num: '02',
        title: 'OceanGuard',
        description: [
            "OceanGuard was an environmental action initiative aimed at protecting Sri Lanka's coastlines through collective responsibility and community-driven impact. More than a one-day cleanup, OceanGuard was designed to raise awareness about coastal pollution while encouraging long-term environmental stewardship among students and young professionals. Guided by the principle \"Leave nothing but footprints,\" the initiative highlighted the importance of preserving natural spaces by ensuring that human presence leaves no lasting harm.",
            "The beach cleanup was successfully held on Saturday, July 26th, 2025, from 7:00 AM to 9:00 AM at Crow Island Beach, Colombo 15. The event was organized by Center for Beach Cleanups, and brought together over 500 volunteers from various universities and organizations across Sri Lanka. OREPA too proudly joined as a partner. Equipped with gloves, garbage bags, and a shared sense of purpose, participants worked collaboratively to remove plastic waste and debris from the shoreline, demonstrating the power of organized, large-scale community action.",
            "OceanGuard stands as a testament to what can be achieved when institutions and individuals unite for a common cause. The initiative not only resulted in a visibly cleaner coastline but also strengthened inter-university and inter-organization collaboration and civic engagement, with participants receiving service recognition for their contribution. Beyond the cleanup itself, OceanGuard reinforces OREPA's commitment to sustainability and community service, setting a strong foundation for future environmental actions that prioritize responsibility, awareness, and lasting impact."
        ],
        images: [
            { src: '/images/OceanGuard1.jpeg', width: 400, height: 710 },
            { src: '/images/OceanGuard2.jpeg', width: 600, height: 338 },
            { src: '/images/OceanGuard3.jpeg', width: 600, height: 338 },
            { src: '/images/OceanGuard4.jpeg', width: 600, height: 338 },
            { src: '/images/OceanGuard5.jpeg', width: 600, height: 338 }
        ]
    },
    {
        id: 'induction',
        num: '03',
        title: 'Induction',
        description: [
            "The OREPA Student Chapter Induction 2025-26 marked the official welcome of newly admitted Royalist engineering undergraduates from the 2024 G.C.E. Advanced Level batch into the OREPA community. Held on Saturday, 25th October 2025, from 4:00 PM to 7:00 PM at the RCU Skills Centre, the induction served as a major event. It was designed to formally introduce incoming members to the values, vision, and purpose of OREPA, while celebrating their entry into engineering faculties across universities islandwide.",
            "Organized by the OREPA Student Chapter, the event brought together new members, senior student representatives, alumni, and members of the OREPA main body, creating a strong platform for inter-university interaction and professional networking. The program featured keynote speeches, addresses by OREPA leadership including the Main Body President, and an introduction to the association's structure, committees, and annual initiatives.",
            "Beyond orientation, the induction laid the foundation for sustained engagement, leadership development, and active participation throughout the 2025-26 term. It emphasized the importance of maintaining strong ties with the professional body, contributing to technical and social initiatives, and upholding the shared values of Royal College and OREPA. As a unifying event, the Induction 2025-26 strengthened the chapter's member base and set a clear direction for collaborative growth, ensuring that new members were motivated, informed, and ready to contribute to the OREPA Student Chapter in the year ahead."
        ],
        images: [
            { src: '/images/Induction-2025-1.jpg', width: 585, height: 390 },
            { src: '/images/Induction-2025-2.jpg', width: 280, height: 186 },
            { src: '/images/Induction-2025-3.jpg', width: 280, height: 186 },
            { src: '/images/Induction-2025-4.jpg', width: 280, height: 186 },
            { src: '/images/Induction-2025-5.jpg', width: 435, height: 290 }
        ]
    },
    {
        id: 'agm',
        num: '04',
        title: 'AGM',
        description: [
            "The Annual General Meeting (AGM) of the Old Royalists Engineering Professionals' Association (OREPA) Student Chapter for 2025 was held on 18th May 2025 at the RCU Skills Centre. It functioned as the formal conclusion of the OREPA Student Chapter 2024/25 term and the official commencement of the 2025/26 term, bringing together the main body, the student chapter, and undergraduates across multiple universities.",
            "The proceedings began with the College Anthem, followed by a welcome speech delivered by the Co-Director of Membership of the OREPA Student Chapter 2024/25. The Secretary's Report and Treasurer's Report then outlined the major projects and financial performance of the term. The AGM also included the distribution of appreciation letters to the outgoing Executive Board and project contributors, together with addresses by the outgoing Student Chapter President and the Main Body President, formally acknowledging the efforts of the 2024/25 team.",
            "A key outcome of the AGM was the appointment of the OREPA Student Chapter Executive Board for the 2025/26 term and the presentation of their year plan. The AGM positioned the 2025/26 term to further strengthen the link between school students, undergraduates, and engineering professionals, while enhancing both member engagement and OREPA's visibility within the wider community."
        ],
        images: [
            { src: '/images/agm25-main.jpg', width: 585, height: 350 },
            { src: '/images/agm25-1.jpg', width: 464, height: 564 },
            { src: '/images/agm25-2.jpg', width: 464, height: 260 }
        ],
        facebookAlbum: 'https://www.facebook.com/media/set/?set=a.684638667609237&type=3'
    },
    {
        id: 'fraternite',
        num: '05',
        title: "Fraternite '26",
        description: [
            "Fraternite, the annual gathering of OREPA, was held on 13th February 2026 at Rock House, Piliyandala, bringing together members for an evening of connection and celebration. With a relaxed and energetic atmosphere, the event provided a meaningful space for OREPA members to step away from their busy schedules and come together under one roof.",
            "A key highlight of Fraternite was the diverse mix of attendees. There were members representing different universities (both state and private) and multiple batches, which made the gathering especially valuable. The event encouraged conversations across generations, helping members meet new people, strengthen existing friendships, and expand their professional and social networks in a natural, enjoyable way.",
            "Beyond networking, Fraternite was also a chance to simply have fun and relive shared experiences. From laughter-filled conversations to moments of nostalgia, the gathering helped everyone vibe and recall old memories while creating new ones. Overall, it stood out as a memorable and successful event that reinforced the spirit of unity and community within OREPA."
        ],
        images: [
            { src: '/images/Fraternite 24.jpg', width: 585, height: 350 },
            { src: '/images/Fraternite 24-1.jpg', width: 324, height: 231 },
            { src: '/images/Fraternite 24-2.jpg', width: 244, height: 232 }
        ],
        facebookAlbum: 'https://www.facebook.com/media/set/?set=a.533885469351225&type=3'
    }
];

export default function EventsPage() {
    useLenis();
    const pageRef = useRef<HTMLDivElement>(null);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        setHasScrolled(true);
    }, []);

    useEffect(() => {
        const page = pageRef.current;
        if (!page) return;

        // Animate hero title
        const heroTextWrap = page.querySelector('.events_hero .js_text_wrap');
        if (heroTextWrap) {
            setTimeout(() => heroTextWrap.classList.add('is_animated'), 100);
        }

        // Animate each project section
        const projectSections = page.querySelectorAll('.event_project_section');

        projectSections.forEach((section) => {
            const textWrap = section.querySelector('.js_text_wrap');
            const content = section.querySelector('.event_project_content');
            const images = section.querySelectorAll('.event_project_image');

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

            images.forEach((img, index) => {
                gsap.fromTo(img,
                    { opacity: 0, scale: 0.9 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.6,
                        delay: 0.4 + (index * 0.1),
                        scrollTrigger: {
                            trigger: img,
                            start: 'top 85%',
                        }
                    }
                );
            });
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div className={`wrapper animation_loaded ${hasScrolled ? 'has-scrolled' : ''}`} ref={pageRef}>
            <Header />
            <Navigation state="normal" />
            <div className="events_page">
                <div className="events_page_bg" aria-hidden="true"></div>

                <div className="events_hero">
                    <h1 className="events_hero_title">
                        <span className="text_wrap js_text_wrap" aria-hidden="true">
                            {'Events'.split('').map((letter, i) => (
                                <span key={i} className="letter">{letter}</span>
                            ))}
                        </span>
                        <span className="sr_only">Events</span>
                    </h1>
                    <p className="events_hero_subtitle">
                        Projects and initiatives by OREPA Student Chapter
                    </p>
                </div>

                <div className="events_container">

                    {projectsData.map((project) => (
                        <section key={project.id} id={project.id} className="event_project_section js_section">
                            <div className="event_project_inner">
                                <div className="event_project_header">
                                    <div className="event_project_num">{project.num}</div>
                                    <h3 className="event_project_title">
                                        <span className="text_wrap js_text_wrap" aria-hidden="true">
                                            {project.title.split('').map((letter, i) => (
                                                <span key={i} className="letter">{letter === ' ' ? '\u00A0' : letter}</span>
                                            ))}
                                        </span>
                                        <span className="sr_only">{project.title}</span>
                                    </h3>
                                </div>

                                <div className="event_project_content">
                                    <div className="event_project_description">
                                        {project.description.map((paragraph, idx) => (
                                            <p key={idx} className="event_project_text">{paragraph}</p>
                                        ))}
                                    </div>

                                    {project.images.length > 0 && (
                                        <div className="event_project_images">
                                            {project.images.map((img, imgIndex) => (
                                                <div key={imgIndex} className="event_project_image">
                                                    <Image
                                                        src={img.src}
                                                        alt={`${project.title} image ${imgIndex + 1}`}
                                                        width={img.width}
                                                        height={img.height}
                                                        loading="lazy"
                                                        style={{ width: '100%', height: 'auto' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {project.images.length === 0 && (
                                        <div className="event_project_images_placeholder">
                                            <p>Photos coming soon</p>
                                        </div>
                                    )}

                                    {project.facebookAlbum && (
                                        <a
                                            href={project.facebookAlbum}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="event_facebook_album_btn"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                            View More Photos on Facebook
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M7 17L17 7" />
                                                <path d="M7 7h10v10" />
                                            </svg>
                                        </a>
                                    )}
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
