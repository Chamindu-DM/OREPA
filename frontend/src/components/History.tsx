'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const historyItems = [
    {
        num: '01',
        title: ["Annual General Meeting-2025"],
        texts: [
            [
                "The Annual General Meeting (AGM) of the Old Royalists Engineering Professionals’ Association (OREPA) Student Chapter for 2025 was held on 18th May 2025 at the RCU Skills Centre. It functioned as the formal conclusion of the OREPA Student Chapter 2024/25 term and the official commencement of the 2025/26 term, bringing together the main body, the student chapter, and undergraduates across multiple universities."
            ],
            [
                "The proceedings began with the College Anthem, followed by a welcome speech delivered by the Co-Director of Membership of the OREPA Student Chapter 2024/25. The Secretary’s Report and Treasurer’s Report then outlined the major projects and financial performance of the term. The AGM also included the distribution of appreciation letters to the outgoing Executive Board and project contributors, together with addresses by the outgoing Student Chapter President and the Main Body President, formally acknowledging the efforts of the 2024/25 team."
            ],
        ],
        images: [
            { src: '/images/agm25-1.jpg', width: 464, height: 564 },
            { src: '/images/agm25-2.jpg', width: 464, height: 260 },
        ],
    },
    {
        num: '02',
        title: ["Fraternite '26"],
        texts: [
            [
                "Fraternite, the annual gathering of OREPA, was held on 13th February 2026 at Rock House, Piliyandala, bringing together members for an evening of connection and celebration. With a relaxed and energetic atmosphere, the event provided a meaningful space for OREPA members to step away from their busy schedules and come together under one roof.",
                "A key highlight of Fraternite was the diverse mix of attendees. There were members representing different universities (both state and private) and multiple batches, which made the gathering especially valuable. The event encouraged conversations across generations, helping members meet new people, strengthen existing friendships, and expand their professional and social networks in a natural, enjoyable way."
            ],
        ],
        images: [
            { src: '/images/Fraternite 24-1.jpg', width: 324, height: 231 },
            { src: '/images/Fraternite 24-2.jpg', width: 244, height: 232 },
            { src: '/images/Fraternite 24.jpg', width: 585, height: 350 },
        ],
    },
    {
        num: '03',
        title: ["Next Generation of Leaders"],
        texts: [
            [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            ],
        ],
        images: [
            { src: '/images/axis2.jpg', width: 280, height: 186 },
            { src: '/images/axis3.jpg', width: 280, height: 186 },
            { src: '/images/axis.jpg', width: 280, height: 186 },
            { src: '/images/axis5.jpg', width: 435, height: 290 },
            { src: '/images/axis6.jpg', width: 435, height: 290 },
        ],
    },
    /*{
        num: '04',
        title: ["One of One"],
        texts: [
            [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            ],
        ],
        images: [
            { src: '/images/history_4_img_1.jpg', width: 280, height: 186 },
            { src: '/images/history_4_img_2.jpg', width: 280, height: 186 },
            { src: '/images/history_4_img_3.jpg', width: 280, height: 186 },
            { src: '/images/history_4_img_4.png', width: 435, height: 290 },
            { src: '/images/history_4_img_5.jpg', width: 435, height: 290 },
        ],
    },*/
];

export default function History() {
    const containerRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const sticky = stickyRef.current;
        if (!container || !sticky) return;

        const itemList = container.querySelector('#history_item_list') as HTMLElement;
        if (!itemList) return;

        // Calculate total width for horizontal scroll
        const getScrollWidth = () => {
            return itemList.scrollWidth - window.innerWidth;
        };

        const ctx = gsap.context(() => {
            // Horizontal scroll animation
            gsap.to(itemList, {
                x: () => -getScrollWidth(),
                ease: 'none',
                scrollTrigger: {
                    trigger: container,
                    pin: sticky,
                    scrub: 1,
                    start: 'top top',
                    end: () => `+=${getScrollWidth()}`,
                    invalidateOnRefresh: true,
                    id: 'historyScroll',
                },
            });

            // Letter reveal animation for "History" title
            const letters = container.querySelectorAll('.history_item_0_ttl .letter');
            gsap.fromTo(
                letters,
                { y: '100%', opacity: 0 },
                {
                    y: '0%',
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.05,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: container,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // History images fade in with stagger
            const historyImages = container.querySelectorAll('.js_history_item_img');
            historyImages.forEach((img) => {
                gsap.fromTo(
                    img,
                    { opacity: 0, scale: 0.9 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: img,
                            containerAnimation: gsap.getById('historyScroll'),
                            start: 'left 80%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            });

            // History text items fade in
            const textItems = container.querySelectorAll('.js_history_txt_item');
            textItems.forEach((textItem) => {
                gsap.fromTo(
                    textItem,
                    { opacity: 0, scale: 0.9 },
                    {
                        opacity: 1,
                        scale: 1,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: textItem,
                            containerAnimation: gsap.getById('historyScroll'),
                            start: 'left 70%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            });

            // History divider mask reveal
            const dividers = container.querySelectorAll('.js_history_divider_mask');
            dividers.forEach((divider) => {
                gsap.to(divider, {
                    scaleX: 0,
                    duration: 1,
                    ease: 'power2.inOut',
                    scrollTrigger: {
                        trigger: divider.parentElement,
                        start: 'left 60%',
                        toggleActions: 'play none none reverse',
                    },
                });
            });
        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <section id="history" className="history js_section" ref={containerRef}>
            <div className="history_inner" id="history_inner">
                <div className="history_sticky" id="history_sticky" ref={stickyRef}>
                    <div className="history_item_list" id="history_item_list">
                        {/* History KV */}
                        <div className="history_item history_item_0 js_history_item">
                            <div className="history_item_0_ttl_wrap">
                                <h2 className="history_item_0_ttl">
                                    <span className="text_wrap js_text_wrap" aria-hidden="true">
                                        {'Events'.split('').map((letter, i) => (
                                            <span key={i} className="letter">{letter}</span>
                                        ))}
                                    </span>
                                    <span className="sr_only">Events</span>
                                </h2>
                                <span className="history_item_0_year">Annual General Meeting-</span>
                            </div>
                            <div className="history_item_0_scroll">
                                <Image
                                    className="history_item_0_scroll_img"
                                    src="/images/history_scroll.svg"
                                    alt="Scroll"
                                    width={150}
                                    height={150}
                                />
                                <span className="history_item_0_scroll_arrow"></span>
                            </div>
                            <div className="history_item_0_inner">
                                <Image
                                    className="history_item_0_img"
                                    src="/images/agm25.jpg"
                                    alt=""
                                    width={1440}
                                    height={809}
                                />
                            </div>
                        </div>

                        {/* History Items */}
                        {historyItems.map((item, index) => (
                            <div key={index} className={`history_item history_item_${index + 1} js_history_item`}>
                                <div className={`history_item_${index + 1}_inner`}>
                                    <div className="history_item_txt_wrap">
                                        <div className="history_item_ttl_wrap">
                                            <span className="history_item_num">{item.num}</span>
                                            <h3 className="history_item_ttl">
                                                {item.title.map((line, i) => (
                                                    <span key={i}>{line}</span>
                                                ))}
                                            </h3>
                                        </div>
                                        <div className="history_txt_area fw300">
                                            {item.texts.map((group, groupIndex) => (
                                                <div key={groupIndex} className="history_txt_item js_history_txt_item">
                                                    {group.map((text, textIndex) => (
                                                        <p key={textIndex} className="history_txt">{text}</p>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`history_item_${index + 1}_img_area`}>
                                        {item.images.map((img, imgIndex) => (
                                            <div key={imgIndex} className="js_history_item_img">
                                                <Image
                                                    loading="lazy"
                                                    src={img.src}
                                                    alt=""
                                                    width={img.width}
                                                    height={img.height}
                                                    style={{ width: img.width, height: img.height }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
