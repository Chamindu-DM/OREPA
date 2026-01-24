'use client';

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
                </div>
            </div>
             <div className="jms_movie_wrap is_active" style={{ marginTop: '60px' }}>
                 <div style={{ width: '100%', height: '100px' }}></div>
            </div>
        </section>
    );
}
