'use client';

import Image from 'next/image';

interface StatementProps {
    state: 'top' | 'video' | 'statement' | 'normal';
}

const leadTexts = [
    [
        'OREPA is the professional home',
        'for every Engineer who once walked the',
        'corridors of Royal College.',
    ],
    [
        'Bridging Generations, Engineering the Future...',
        'Join us in shaping a future that honours our past.',
    ],
];

export default function Statement({ state }: StatementProps) {
    return (
        <div id="statement" className="section_statement">
            <div className="statement_kv" id="statement_kv" style={{ opacity: state !== 'top' ? 1 : 0 }}>
                 <div className="statement_kv_blur" id="statement_kv_blur"></div>
                <div className="statement_kv_scroll" id="kv_scroll">
                    <p className="statement_kv_scroll_txt">Scroll</p>
                    <div className="statement_kv_scroll_line"></div>
                </div>
            </div>
            <div className="kv_space" id="kv_space1"></div>
            <div className="lead_txt_wrap">
                {leadTexts.map((group, groupIndex) => (
                    <p key={groupIndex} className="lead_txt js_lead_txt">
                        {group.map((line, lineIndex) => (
                            <span key={lineIndex} className="lead_txt_pc">
                                <span className="lead_txt_sp">{line}</span>
                            </span>
                        ))}
                    </p>
                ))}
            </div>
        </div>
    );
}
