'use client';

import { useState } from 'react';
import Image from 'next/image';
import HoverText from './HoverText';

interface GalleryAccordion {
    id: string;
    num: string;
    btnImage: string;
    btnImageSp: string;
    thumbnails: { src: string; alt: string }[];
}

const galleries: GalleryAccordion[] = [
    {
        id: 'gallery01',
        num: '01',
        btnImage: '/images/gallery_btn_1.jpg',
        btnImageSp: '/images/gallery_btn_1_sp.jpg',
        thumbnails: Array.from({ length: 17 }, (_, i) => ({
            src: `/images/gallery_01_thumb_${String(i + 1).padStart(2, '0')}.${i < 2 ? 'png' : 'jpg'}`,
            alt: `Gallery 01 Thumbnail ${String(i + 1).padStart(2, '0')}`,
        })),
    },
    {
        id: 'gallery02',
        num: '02',
        btnImage: '/images/gallery_btn_2.jpg',
        btnImageSp: '/images/gallery_btn_2_sp.jpg',
        thumbnails: Array.from({ length: 28 }, (_, i) => ({
            src: `/images/gallery_02_thumb_${String(i + 1).padStart(2, '0')}.jpg`,
            alt: `Gallery 02 Thumbnail ${String(i + 1).padStart(2, '0')}`,
        })),
    },
    {
        id: 'gallery03',
        num: '03',
        btnImage: '/images/gallery_btn_3.jpg',
        btnImageSp: '/images/gallery_btn_3_sp.jpg',
        thumbnails: Array.from({ length: 25 }, (_, i) => ({
            src: `/images/gallery_03_thumb_${String(i + 1).padStart(2, '0')}.jpg`,
            alt: `Gallery 03 Thumbnail ${String(i + 1).padStart(2, '0')}`,
        })),
    },
    {
        id: 'gallery04',
        num: '04',
        btnImage: '/images/gallery_btn_4.jpg',
        btnImageSp: '/images/gallery_btn_4_sp.jpg',
        thumbnails: Array.from({ length: 11 }, (_, i) => ({
            src: `/images/gallery_04_thumb_${String(i + 1).padStart(2, '0')}.jpg`,
            alt: `Gallery 04 Thumbnail ${String(i + 1).padStart(2, '0')}`,
        })),
    },
];

export default function Gallery() {
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    return (
        <section id="gallery" className="gallery js_section">
            <h2 className="gallery_ttl">
                <span className="text_wrap js_text_wrap" aria-hidden="true">
                    <span className="letter">A</span>
                    <span className="letter">r</span>
                    <span className="letter">t</span>
                </span>
                <span className="text_wrap js_text_wrap" aria-hidden="true">
                    <span className="letter">G</span>
                    <span className="letter">a</span>
                    <span className="letter">l</span>
                    <span className="letter">l</span>
                    <span className="letter">e</span>
                    <span className="letter">r</span>
                    <span className="letter">y</span>
                </span>
                <span className="sr_only">Art Gallery</span>
            </h2>
            <div className="gallery_contents">
                {galleries.map((gallery) => (
                    <section key={gallery.id} className="accordion js_accordion" aria-labelledby={gallery.id}>
                        <h3 id={gallery.id}>
                            <button
                                className="accordion_trigger js_accordion_trigger"
                                type="button"
                                onClick={() => toggleAccordion(gallery.id)}
                                aria-expanded={openAccordion === gallery.id}
                            >
                                <span className="accordion_trigger_img">
                                    <span className="accordion_trigger_info js_reveal_gallery">
                                        <picture>
                                            <source media="(max-width:768px)" srcSet={gallery.btnImageSp} width={375} height={200} />
                                            <Image
                                                src={gallery.btnImage}
                                                alt={`Open gallery ${gallery.num}`}
                                                width={1000}
                                                height={200}
                                            />
                                        </picture>
                                        <span className="accordion_trigger_num">{gallery.num}</span>
                                        <span className="accordion_trigger_more">
                                            <span className="accordion_trigger_more_icon">+</span>
                                            <span className="accordion_trigger_more_txt">view</span>
                                            <span className="accordion_trigger_more_line"></span>
                                        </span>
                                    </span>
                                </span>
                            </button>
                        </h3>
                        <div
                            className={`accordion_panel js_accordion_panel ${openAccordion === gallery.id ? 'is_open' : ''}`}
                            style={{ display: openAccordion === gallery.id ? 'block' : 'none' }}
                        >
                            <div className="accordion_panel_inner">
                                <button
                                    type="button"
                                    className="js_close_accordion btn_accordion_close"
                                    aria-label="Close accordion"
                                    onClick={() => setOpenAccordion(null)}
                                >
                                    <span className="btn_accordion_close_icon"></span>
                                </button>
                                <div className="gallery_thumb_list_wrap">
                                    <div className="gallery_thumb_list">
                                        {gallery.thumbnails.map((thumb, index) => (
                                            <button
                                                key={index}
                                                className="gallery_thumb js_gallery_thumb"
                                                data-modal={`modal_gallery_${gallery.num}`}
                                            >
                                                <span className="gallery_thumb_img">
                                                    <Image
                                                        loading="lazy"
                                                        src={thumb.src}
                                                        alt={thumb.alt}
                                                        width={187}
                                                        height={104}
                                                    />
                                                </span>
                                            </button>
                                        ))}
                                        <p className="gallery_copy">＊CENTURY Concept Model</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </section>
    );
}
