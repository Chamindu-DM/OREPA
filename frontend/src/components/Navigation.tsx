'use client';

import HoverText from './HoverText';

interface NavigationProps {
    state: 'top' | 'video' | 'statement' | 'normal';
}

const menuItems = [
    { id: 'js_menu_top', href: '#top', text: 'Top' },
    { id: 'js_menu_statement', href: '#statement', text: 'Statement' },
    { id: 'js_menu_link', href: '#movie', text: 'Movie' },
    { id: 'js_menu_link', href: '#gallery', text: 'Gallery' },
    { id: 'js_menu_link', href: '#history', text: 'history' },
    { id: 'js_menu_link', href: '#jms', text: 'Event' },
    { id: 'js_menu_link', href: '#lineup', text: 'Lineup' },
];

export default function Navigation({ state }: NavigationProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="menu" id="menu">
            <ul className="menu_list">
                {menuItems.map((item, index) => (
                    <li
                        key={index}
                        className={`${item.id} ${index === 0 && state === 'top' ? 'is_active' : ''}`}
                    >
                        <a
                            href={item.href}
                            className="hover_text"
                            onClick={(e) => handleClick(e, item.href)}
                        >
                            <HoverText text={item.text} />
                            <span className="sr_only">{item.text}</span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
