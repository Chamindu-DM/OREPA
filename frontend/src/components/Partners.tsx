'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { partnersData } from '@/data/partners';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import 'swiper/css';
import 'swiper/css/pagination';

export default function Partners() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const title = section.querySelector('.partners_title');

        // Animate title
        if (title) {
            gsap.fromTo(title,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                    }
                }
            );
        }

    }, []);

    return (
        <section ref={sectionRef} className="partners_section js_section" style={{ padding: '100px 0', overflow: 'hidden', backgroundColor: '#000', marginTop: '50px' }}>
            <div className="inner" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 40px' }}>
                <div className="partners_header" style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <h2 className="partners_title" style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        textTransform: 'uppercase',
                        fontWeight: '300',
                        letterSpacing: '0.05em',
                        color: '#fff'
                    }}>
                        Our Partners
                    </h2>
                </div>

                <div className="partners_carousel">
                    <Swiper
                        modules={[Autoplay, Pagination]}
                        spaceBetween={30}
                        slidesPerView={1.2}
                        centeredSlides={true}
                        loop={true}
                        speed={1000}
                        autoplay={{
                            delay: 2500,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        breakpoints={{
                            640: {
                                slidesPerView: 2.5,
                                centeredSlides: false,
                            },
                            1024: {
                                slidesPerView: 4,
                                centeredSlides: false,
                            },
                        }}
                        style={{ paddingBottom: '50px' }}
                    >
                        {partnersData.map((partner, index) => (
                            <SwiperSlide key={index}>
                                <div className="partner_card" style={{
                                    background: '#fff',
                                    borderRadius: '15px',
                                    padding: '30px',
                                    height: '320px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.3s ease',
                                    cursor: 'pointer'
                                }}>
                                    <div className="partner_logo_wrapper" style={{
                                        width: '100%',
                                        height: '150px',
                                        position: 'relative',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Image
                                            src={partner.image}
                                            alt={partner.name}
                                            width={200}
                                            height={100}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain',
                                                height: 'auto',
                                                width: 'auto'
                                            }}
                                        />
                                    </div>
                                    <div className="partner_info" style={{ textAlign: 'center', color: '#000' }}>
                                        <h3 style={{
                                            fontSize: '1.2rem',
                                            fontWeight: '600',
                                            marginBottom: '5px',
                                            color: '#000'
                                        }}>
                                            {partner.name}
                                        </h3>
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: '#666',
                                            marginBottom: '5px'
                                        }}>
                                            {partner.title}
                                        </p>
                                        <p style={{
                                            fontSize: '0.8rem',
                                            color: '#999',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {partner.event}
                                        </p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
