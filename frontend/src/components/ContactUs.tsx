'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ContactUs() {
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
    }, []);

    return (
        <section id="contact" className="jms js_section" ref={sectionRef} style={{ padding: '60px 0' }}>
            <div className="jms_ttl_wrap" style={{ flexWrap: 'wrap' }}>
                <h2 className="jms_ttl">
                    <span className="text_wrap js_text_wrap" aria-hidden="true">
                        {'Contact'.split('').map((letter, i) => (
                            <span key={i} className="letter">{letter}</span>
                        ))}
                    </span>
                    <span className="sr_only">Contact</span>
                </h2>
                <div className="jms_info">
                    <p className="jms_info_ttl">Get in Touch</p>

                    <div style={{ marginTop: '40px', display: 'grid', gap: '30px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                        <div>
                            <p className="history_txt" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', opacity: 0.7 }}>Email</p>
                            <a href="mailto:info@orepa.org" className="jms_info_ttl" style={{ fontSize: '20px', textDecoration: 'none' }}>info@orepa.org</a>
                        </div>

                        <div>
                            <p className="history_txt" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', opacity: 0.7 }}>Phone</p>
                            <p className="jms_info_ttl" style={{ fontSize: '20px' }}>+94 11 234 5678</p>
                        </div>

                        <div>
                            <p className="history_txt" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', opacity: 0.7 }}>Address</p>
                            <p className="jms_info_ttl" style={{ fontSize: '20px' }}>
                                Royal College Union,<br />
                                Rajakeeya Mawatha,<br />
                                Colombo 00700,<br />
                                Sri Lanka
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="jms_movie_wrap is_active" style={{ marginTop: '60px' }}>
                 {/* Visual placeholder without map text */}
                 <div style={{ width: '100%', height: '100px' }}></div>
            </div>
        </section>
    );
}
