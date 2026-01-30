'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Pillars', path: '/pillars' },
        { name: 'Events', path: '/#history' },
        { name: 'Newsletters', path: '/#newsletters' },
        { name: 'LMS', path: '/lms' },
        { name: 'Contact', path: '/#contact' },
        { name: 'About', path: '/#about' },
        { name: 'Log-in', path: '/login' },
    ];

    // Close menu when clicking outside or when route changes
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="header_inner">
                <p className="header_logo">
                    <Link href="/">
                        <Image
                            src="/images/Orepa_logo_h.png"
                            alt="logo"
                            width={100}
                            height={38}
                            priority
                        />
                    </Link>
                </p>

                {/* Hamburger Menu Button - visible only on mobile */}
                <button
                    className={`hamburger_menu ${isMenuOpen ? 'hamburger_menu--active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={isMenuOpen}
                >
                    <span className="hamburger_line"></span>
                    <span className="hamburger_line"></span>
                    <span className="hamburger_line"></span>
                </button>

                {/* Desktop Navigation */}
                <nav className="header_nav header_nav--desktop">
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <Link href={item.path}>{item.name}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Mobile Navigation Overlay */}
                <div className={`mobile_nav_overlay ${isMenuOpen ? 'mobile_nav_overlay--active' : ''}`} onClick={handleLinkClick}></div>

                {/* Mobile Navigation */}
                <nav className={`header_nav header_nav--mobile ${isMenuOpen ? 'header_nav--mobile-active' : ''}`}>
                    <ul>
                        {navItems.map((item, index) => (
                            <li key={index} style={{ transitionDelay: `${0.1 + index * 0.05}s` }}>
                                <Link href={item.path} onClick={handleLinkClick}>
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
