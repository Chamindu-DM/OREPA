'use client';

import { useEffect, useRef, useState } from 'react';
import Loading from '@/components/Loading';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Navigation from '@/components/Navigation';
import Statement from '@/components/Statement';
import Gallery from '@/components/Gallery';
import History from '@/components/History';
import Partners from '@/components/Partners';
import AboutUs from '@/components/AboutUs';
import Newsletters from '@/components/Newsletters';
import EventSection from '@/components/EventSection';
import ContactUs from '@/components/ContactUs';
import Footer from '@/components/Footer';
import GalleryModals from '@/components/GalleryModals';
import useLenis from '@/hooks/useLenis';
import { useScrollAnimation } from '@/hooks/useAnimations';

export default function Home() {
  // Initialize smooth scroll and animations
  useLenis();
  useScrollAnimation();
  const [isLoading, setIsLoading] = useState(true);
  const [showOpening, setShowOpening] = useState(true);
  const [animationLoaded, setAnimationLoaded] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [state, setState] = useState<'top' | 'video' | 'statement' | 'normal'>('top');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50 && state === 'top') {
        handleScroll();
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [state]);

  const handleOpeningEnd = () => {
    setShowOpening(false);
    setAnimationLoaded(true);
  };

  const handleScroll = () => {
    if (state === 'top') {
      setState('statement');
      setHasScrolled(true);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`wrapper ${animationLoaded ? 'animation_loaded' : 'animation_ready'} ${hasScrolled ? 'has-scrolled' : ''}`}
      id="wrapper"
    >
      {isLoading && <Loading />}

      <Header />
      <Navigation state={state} />

      <Hero />
      <div className="hero_spacer" />

      <main>
        <Statement state={state} />
        <AboutUs />
        <History />
        {/*<Gallery />*/}
        <Partners />
        {/* <EventSection /> */}
        <Newsletters />
        <ContactUs />
      </main>

      <Footer />

      {/* Modals */}
      <GalleryModals />
    </div>
  );
}
