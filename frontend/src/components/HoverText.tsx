'use client';

interface HoverTextProps {
    text: string;
    className?: string;
}

export default function HoverText({ text, className = '' }: HoverTextProps) {
    const letters = text.split('');

    return (
        <span className={`hover_text_wrap ${className}`} aria-hidden="true">
            <span className="text_wrap hover_text_before">
                {letters.map((letter, index) => (
                    <span
                        key={index}
                        className="letter"
                        style={{ '--index': index } as React.CSSProperties}
                    >
                        {letter === ' ' ? '\u00A0' : letter}
                    </span>
                ))}
            </span>
            <span className="hover_text_after">{text}</span>
        </span>
    );
}
