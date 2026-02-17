'use client';

import { useEffect, useRef, useState, forwardRef } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import useLenis from '@/hooks/useLenis';

// Dynamically import HTMLFlipBook to avoid SSR issues
const HTMLFlipBook = dynamic(() => import('react-pageflip').then(mod => mod.default), {
    ssr: false,
    loading: () => <div className="flipbook-loading"><div className="flipbook-spinner"></div></div>
});

interface Newsletter {
    id: number;
    title: string;
    date: string;
    pdfUrl: string;
    coverImage: string;
}

// Newsletters data - sorted newest to oldest
const newslettersData: Newsletter[] = [
    {
        id: 1,
        title: 'OREPA Newsletter - January 2026',
        date: 'January 2026',
        pdfUrl: '/newsletters/January%202026.pdf',
        coverImage: '/newsletters/covers/January%202026.png'
    },
    {
        id: 2,
        title: 'OREPA Newsletter - March 2024',
        date: 'March 2024',
        pdfUrl: '/newsletters/March%202024.pdf',
        coverImage: '/newsletters/covers/March%202024.png'
    },
    {
        id: 3,
        title: 'OREPA Newsletter - March 2023',
        date: 'March 2023',
        pdfUrl: '/newsletters/March%202023.pdf',
        coverImage: '/newsletters/covers/March%202023.jpg'
    },
    {
        id: 4,
        title: 'OREPA Newsletter - September 2022',
        date: 'September 2022',
        pdfUrl: '/newsletters/September%202022.pdf',
        coverImage: '/newsletters/covers/September%202022.png'
    },
    {
        id: 5,
        title: 'OREPA Newsletter - December 2021',
        date: 'December 2021',
        pdfUrl: '/newsletters/December%202021.pdf',
        coverImage: '/newsletters/covers/December%202021.png'
    },
    {
        id: 6,
        title: 'OREPA Newsletter - June 2021',
        date: 'June 2021',
        pdfUrl: '/newsletters/June%202021.pdf',
        coverImage: '/newsletters/covers/June%202021.png'
    },
    {
        id: 7,
        title: 'OREPA Newsletter - December 2020',
        date: 'December 2020',
        pdfUrl: '/newsletters/December%202020.pdf',
        coverImage: '/newsletters/covers/December%202020.jpg'
    },
    {
        id: 8,
        title: 'OREPA Newsletter - June 2020',
        date: 'June 2020',
        pdfUrl: '/newsletters/June%202020.pdf',
        coverImage: '/newsletters/covers/June%202020.jpg'
    },
    {
        id: 9,
        title: 'OREPA Newsletter - February 2020',
        date: 'February 2020',
        pdfUrl: '/newsletters/February%202020.pdf',
        coverImage: '/newsletters/covers/February%202020.png'
    },
    {
        id: 10,
        title: 'OREPA Newsletter - December 2019',
        date: 'December 2019',
        pdfUrl: '/newsletters/December%202019.pdf',
        coverImage: '/newsletters/covers/December%202019.png'
    },
    {
        id: 11,
        title: 'OREPA Newsletter - August 2019',
        date: 'August 2019',
        pdfUrl: '/newsletters/August%202019.pdf',
        coverImage: '/newsletters/covers/August%202019.png'
    },
    {
        id: 12,
        title: 'OREPA Newsletter - December 2018',
        date: 'December 2018',
        pdfUrl: '/newsletters/December%202018.pdf',
        coverImage: '/newsletters/covers/December%202018.png'
    },
    {
        id: 13,
        title: 'OREPA Newsletter - May 2018',
        date: 'May 2018',
        pdfUrl: '/newsletters/May%202018.pdf',
        coverImage: '/newsletters/covers/May%202018.png'
    },
    {
        id: 14,
        title: 'OREPA Newsletter - October 2017',
        date: 'October 2017',
        pdfUrl: '/newsletters/October%202017.pdf',
        coverImage: '/newsletters/covers/October%202017.png'
    },
    {
        id: 15,
        title: 'OREPA Newsletter - March 2017',
        date: 'March 2017',
        pdfUrl: '/newsletters/March%202017.pdf',
        coverImage: '/newsletters/covers/March%202017.png'
    },
    {
        id: 16,
        title: 'OREPA Newsletter - October 2016',
        date: 'October 2016',
        pdfUrl: '/newsletters/October%202016.pdf',
        coverImage: '/newsletters/covers/October%202016.jpg'
    },
    {
        id: 17,
        title: 'OREPA Newsletter - July 2016',
        date: 'July 2016',
        pdfUrl: '/newsletters/July%202016.pdf',
        coverImage: '/newsletters/covers/July%202016.jpg'
    },
    {
        id: 18,
        title: 'OREPA Newsletter - January 2016',
        date: 'January 2016',
        pdfUrl: '/newsletters/January%202016.pdf',
        coverImage: '/newsletters/covers/January%202016.jpg'
    }
];

// Page component for the flipbook
const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; number?: number }>(
    ({ children, number }, ref) => {
        return (
            <div className="flipbook-page" ref={ref} style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
                <div className="flipbook-page-content" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {children}
                </div>
                {number !== undefined && (
                    <div className="flipbook-page-number" style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '12px', color: '#666' }}>{number}</div>
                )}
            </div>
        );
    }
);

Page.displayName = 'Page';

interface FlipBookViewerProps {
    pdfUrl: string;
    onClose: () => void;
    title: string;
}

function FlipBookViewer({ pdfUrl, onClose, title }: FlipBookViewerProps) {
    const [pages, setPages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const book = useRef<any>(null);

    useEffect(() => {
        const loadPdf = async () => {
            try {
                setLoading(true);
                setError(null);

                // Dynamically import pdfjs-dist only on client side
                const pdfjsLib = await import('pdfjs-dist');
                // Use unpkg CDN which is more reliable for specific version
                // We're using 4.8.69 which is a stable version
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs`;

                const loadingTask = pdfjsLib.getDocument({
                    url: pdfUrl,
                    cMapUrl: `https://unpkg.com/pdfjs-dist@4.8.69/cmaps/`,
                    cMapPacked: true,
                    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@4.8.69/standard_fonts/`,
                    enableXfa: true,
                    disableAutoFetch: false,
                    disableStream: false,
                    isEvalSupported: true,
                });

                const pdf = await loadingTask.promise;
                const numPages = pdf.numPages;
                const pageImages: string[] = [];

                for (let i = 1; i <= numPages; i++) {
                    const page = await pdf.getPage(i);

                    // Calculate scale to fit A4 ratio while maintaining quality
                    // A4 aspect ratio is 1:√2 (1:1.414)
                    const scale = 3.0; // Higher scale for better quality
                    const viewport = page.getViewport({ scale });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d', {
                        alpha: false,
                        willReadFrequently: false
                    });

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (context) {
                        // Set white background before rendering
                        context.fillStyle = 'white';
                        context.fillRect(0, 0, canvas.width, canvas.height);

                        // Render with proper settings for images
                        const renderContext = {
                            canvasContext: context,
                            canvas: canvas,
                            viewport: viewport,
                            intent: 'display' as any,
                            enableWebGL: false,
                            renderInteractiveForms: false,
                            background: 'white'
                        };

                        await page.render(renderContext as any).promise;

                        // Convert to high-quality JPEG
                        pageImages.push(canvas.toDataURL('image/jpeg', 0.95));
                    }
                }

                setPages(pageImages);
                setLoading(false);
            } catch (err) {
                console.error('Error loading PDF:', err);
                setError('Failed to load the newsletter. Please try again.');
                setLoading(false);
            }
        };

        loadPdf();
    }, [pdfUrl]);

    const [bookDimensions, setBookDimensions] = useState({ width: 595, height: 842 });
    const [usePortrait, setUsePortrait] = useState(false);

    useEffect(() => {
        const calculateDimensions = () => {
            const isMobile = window.innerWidth < 768;
            setUsePortrait(isMobile);

            // Available space calculations
            // Subtracting header, footer, padding (approx 200px vertical for controls)
            const availableWidth = window.innerWidth - (isMobile ? 40 : 80);
            const availableHeight = window.innerHeight - 200;

            if (isMobile) {
                // SINGLE PAGE MODE (Portrait)
                // A4 = 595 x 842 (Ratio ~0.707)
                const pageRatio = 595 / 842;

                let pageWidth = availableWidth;
                let pageHeight = pageWidth / pageRatio;

                // Fit by height if needed
                if (pageHeight > availableHeight) {
                    pageHeight = availableHeight;
                    pageWidth = pageHeight * pageRatio;
                }

                setBookDimensions({
                    width: Math.floor(pageWidth),
                    height: Math.floor(pageHeight)
                });
            } else {
                // TWO PAGE SPREAD MODE - LOCKED A4 ASPECT RATIO
                // A4 single page = 595 x 842 (ratio ~0.707)
                // Two A4 pages spread = 1190 x 842 (ratio ~1.413)
                const a4PageWidth = 595;
                const a4PageHeight = 842;
                const spreadRatio = (a4PageWidth * 2) / a4PageHeight; // ~1.413

                // Maximum spread dimensions to fit comfortably on screen
                const maxSpreadWidth = Math.min(availableWidth, 1300);
                const maxSpreadHeight = Math.min(availableHeight, 750);

                let spreadWidth = maxSpreadWidth;
                let spreadHeight = spreadWidth / spreadRatio;

                // Fit by height if needed
                if (spreadHeight > maxSpreadHeight) {
                    spreadHeight = maxSpreadHeight;
                    spreadWidth = spreadHeight * spreadRatio;
                }

                // HTMLFlipBook takes dimensions for a SINGLE PAGE
                // So we pass half of the spread width for proper A4 aspect ratio
                setBookDimensions({
                    width: Math.floor(spreadWidth / 2),
                    height: Math.floor(spreadHeight)
                });
            }
        };

        // Initial calculation
        calculateDimensions();

        // Add event listener
        window.addEventListener('resize', calculateDimensions);
        return () => window.removeEventListener('resize', calculateDimensions);
    }, []);



    const handleFlip = (e: any) => {
        setCurrentPage(e.data);
    };

    const goToPrevPage = () => {
        if (book.current) {
            book.current.pageFlip().flipPrev();
        }
    };

    const goToNextPage = () => {
        if (book.current) {
            book.current.pageFlip().flipNext();
        }
    };

    return (
        <div className="flipbook-overlay">
            <div className="flipbook-modal">
                <div className="flipbook-header">
                    <h2 className="flipbook-title">{title}</h2>
                    <button className="flipbook-close" onClick={onClose}>
                        <span>&times;</span>
                    </button>
                </div>

                {loading && (
                    <div className="flipbook-loading">
                        <div className="flipbook-spinner"></div>
                        <p>Loading newsletter...</p>
                    </div>
                )}

                {error && (
                    <div className="flipbook-error">
                        <p>{error}</p>
                        <button onClick={onClose}>Close</button>
                    </div>
                )}

                {!loading && !error && pages.length > 0 && (
                    <>
                        <div className="flipbook-container">
                            <HTMLFlipBook
                                ref={book}
                                width={bookDimensions.width}
                                height={bookDimensions.height}
                                size="fixed"
                                minWidth={300}
                                maxWidth={2000}
                                minHeight={400}
                                maxHeight={2000}
                                maxShadowOpacity={0.5}
                                showCover={true}
                                mobileScrollSupport={true}
                                onFlip={handleFlip}
                                className="flipbook"
                                startPage={0}
                                startZIndex={0}
                                drawShadow={true}
                                flippingTime={1000}
                                usePortrait={usePortrait}
                                autoSize={true}
                                style={{ margin: '0 auto' }}
                                clickEventForward={true}
                                useMouseEvents={true}
                                swipeDistance={30}
                                showPageCorners={true}
                                disableFlipByClick={false}
                            >
                                {pages.map((page, index) => (
                                    <Page key={index} number={index + 1}>
                                        <img
                                            src={page}
                                            alt={`Page ${index + 1}`}
                                            className="flipbook-page-img"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                display: 'block'
                                            }}
                                        />
                                    </Page>
                                ))}
                            </HTMLFlipBook>
                        </div>

                        <div className="flipbook-controls">
                            <button
                                className="flipbook-nav-btn"
                                onClick={goToPrevPage}
                                disabled={currentPage === 0}
                            >
                                ← Previous
                            </button>
                            <span className="flipbook-page-info">
                                Page {currentPage + 1} of {pages.length}
                            </span>
                            <button
                                className="flipbook-nav-btn"
                                onClick={goToNextPage}
                                disabled={currentPage >= pages.length - 1}
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function NewslettersPage() {
    useLenis();
    const [animationLoaded, setAnimationLoaded] = useState(false);
    const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimationLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const openNewsletter = (newsletter: Newsletter) => {
        setSelectedNewsletter(newsletter);
        document.body.style.overflow = 'hidden';
    };

    const closeNewsletter = () => {
        setSelectedNewsletter(null);
        document.body.style.overflow = '';
    };

    return (
        <div className={`wrapper ${animationLoaded ? 'animation_loaded' : 'animation_ready'} has-scrolled`} id="wrapper">
            <Header />
            <Navigation state="normal" />

            {/* Hero Background */}
            <div className="newsletters-page-bg">
                <div className="newsletters-page-bg-overlay"></div>
            </div>

            <main className="newsletters-page">
                <section className="newsletters-hero">
                    <div className="newsletters-hero-content">
                        <h1 className="newsletters-title">
                            <span className="text_wrap js_text_wrap" aria-hidden="true">
                                {'Newsletters'.split('').map((letter, i) => (
                                    <span key={i} className="letter">{letter}</span>
                                ))}
                            </span>
                        </h1>
                        <p className="newsletters-subtitle">
                            Stay updated with the latest news, events, and stories from OREPA
                        </p>
                    </div>
                </section>

                <section className="newsletters-grid-section">
                    <div className="newsletters-grid">
                        {newslettersData.map((newsletter) => (
                            <article
                                key={newsletter.id}
                                className="newsletter-card"
                                onClick={() => openNewsletter(newsletter)}
                            >
                                <div className="newsletter-card-cover">
                                    {newsletter.coverImage ? (
                                        <img
                                            src={newsletter.coverImage}
                                            alt={newsletter.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div className="newsletter-card-placeholder">
                                            <span className="newsletter-icon">📰</span>
                                            <span className="newsletter-date">{newsletter.date}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="newsletter-card-info">
                                    <h3 className="newsletter-card-title">{newsletter.title}</h3>
                                    <p className="newsletter-card-date">{newsletter.date}</p>
                                    <button className="newsletter-read-btn">
                                        Read Newsletter
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {newslettersData.length === 0 && (
                        <div className="newsletters-empty">
                            <p>No newsletters available yet. Stay tuned for updates!</p>
                        </div>
                    )}
                </section>
            </main>

            <Footer />

            {selectedNewsletter && (
                <FlipBookViewer
                    pdfUrl={selectedNewsletter.pdfUrl}
                    title={selectedNewsletter.title}
                    onClose={closeNewsletter}
                />
            )}
        </div>
    );
}
