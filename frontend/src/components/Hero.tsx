'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [showText, setShowText] = useState(false);
  const [titleBlur, setTitleBlur] = useState(0);
  const [titleOpacity, setTitleOpacity] = useState(1);
  const [titleOverlay, setTitleOverlay] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Main overlay: starts at 0, reaches 0.7 after scrolling 100vh
      const opacity = Math.min((scrollY / windowHeight) * 0.7, 0.7);
      setOverlayOpacity(opacity);

      // Title blur effect: starts blurring immediately on scroll
      // Max blur of 20px reached at 300px scroll
      const blur = Math.min((scrollY / 300) * 20, 20);
      setTitleBlur(blur);

      // Title opacity: fades out as user scrolls
      // Completely faded at 400px scroll
      const titleOp = Math.max(1 - (scrollY / 400), 0);
      setTitleOpacity(titleOp);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Show text after loading screen (2 seconds) + small delay
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 2200);

    // Add slight dark overlay when title appears
    const overlayTimer = setTimeout(() => {
      setTitleOverlay(0.3);
    }, 2200);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(overlayTimer);
    };
  }, []);

  return (
    <div className="hero_fixed">
      <Image
        src="/images/homepage-cover.jpg"
        alt="Hero Image"
        fill
        className="hero_img"
        priority
      />
      <div
        className="hero_overlay"
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
      />
      <div
        className="hero_title_overlay"
        style={{
          backgroundColor: `rgba(0,0,0,${titleOverlay})`,
          transition: 'background-color 1.5s ease-out'
        }}
      />
      <div
        className={`hero_text ${showText ? 'hero_text--visible' : ''}`}
        style={{
          filter: `blur(${titleBlur}px)`,
          opacity: titleOpacity,
        }}
      >
        <h1 className="hero_title">Old Royalists Engineering Professionals' Association</h1>
      </div>
    </div>
  );
}
