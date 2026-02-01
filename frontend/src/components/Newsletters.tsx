'use client';

import Link from 'next/link';

export default function Newsletters() {
    return (
        <section id="newsletters" className="jms js_section">
            <div className="jms_ttl_wrap" style={{ flexWrap: 'wrap' }}>
                <h2 className="jms_ttl">
                    <span className="text_wrap js_text_wrap" aria-hidden="true">
                        {'Newsletters'.split('').map((letter, i) => (
                            <span key={i} className="letter">{letter}</span>
                        ))}
                    </span>
                    <span className="sr_only">Newsletters</span>
                </h2>
                <div className="jms_info">
                    <p className="jms_info_ttl">Latest Updates</p>
                    <p className="history_txt" style={{ fontSize: '16px', maxWidth: '600px', marginTop: '30px' }}>
                        Stay tuned for our upcoming newsletters and updates from the Old Royalists Engineering Professionals' Association.
                    </p>
                    <Link
                        href="/newsletters"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '30px',
                            padding: '12px 24px',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 500,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            transition: 'all 0.3s ease',
                            textDecoration: 'none'
                        }}
                    >
                        View All Newsletters
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </Link>
                </div>
            </div>
             <div className="jms_movie_wrap is_active" style={{ marginTop: '60px' }}>
                 <div style={{ width: '100%', height: '100px' }}></div>
            </div>
        </section>
    );
}
