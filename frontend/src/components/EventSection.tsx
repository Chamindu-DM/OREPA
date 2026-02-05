'use client';

import Image from 'next/image';
import HoverText from './HoverText';

const jmsImages = [
    { src: '/images/jms_img_1.jpg', width: 680, height: 380 },
    { src: '/images/jms_img_2.jpg', width: 680, height: 380 },
    { src: '/images/jms_img_3.jpg', width: 680, height: 380 },
    { src: '/images/jms_img_1.jpg', width: 680, height: 380 },
    { src: '/images/jms_img_2.jpg', width: 680, height: 380 },
    { src: '/images/jms_img_3.jpg', width: 680, height: 380 },
];

export default function EventSection() {
    return (
        <section id="jms" className="jms js_section">
            <div className="jms_ttl_wrap">
                <h2 className="jms_ttl">
                    <span className="text_wrap js_text_wrap" aria-hidden="true">
                        {'Event'.split('').map((letter, i) => (
                            <span key={i} className="letter">{letter}</span>
                        ))}
                    </span>
                    <span className="sr_only">Event</span>
                </h2>
                <div className="jms_info">
                    <p className="jms_info_ttl">Japan</p>
                    <div className="jms_date_wrap">
                        <div className="jms_date">
                            <span className="jms_date_num">10.30</span>
                            <span className="jms_date_day">THU</span>
                        </div>
                        <div className="jms_date">
                            <span className="jms_date_num">11.09</span>
                            <span className="jms_date_day">SUN</span>
                        </div>
                    </div>
                    <p className="jms_venue">TOKYO BIG SIGHT</p>
                </div>
            </div>

            <div className="jms_slider" id="jms_slider">
                <div className="swiper-wrapper" style={{ display: 'flex', gap: '20px' }}>
                    {jmsImages.map((img, index) => (
                        <div key={index} className="swiper-slide" style={{ width: '680px', flexShrink: 0 }}>
                            <Image
                                loading="lazy"
                                src={img.src}
                                alt=""
                                width={img.width}
                                height={img.height}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
