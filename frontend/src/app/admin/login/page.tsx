'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_CONFIG, getApiUrl } from '@/config/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Animation refs
    const formRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        // Animate title letters
        if (titleRef.current) {
            const letters = titleRef.current.querySelectorAll('.letter');
            gsap.to(letters, {
                y: 0,
                opacity: 1,
                stagger: 0.05,
                ease: 'power2.out',
                duration: 0.8,
                delay: 0.2
            });
        }

        // Animate form
        if (formRef.current) {
            gsap.fromTo(formRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: 0.6,
                    ease: 'power2.out'
                }
            );
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN.LOGIN), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Login failed');
                setIsLoading(false);
                return;
            }

            // Store token/user info
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.user));

            // Redirect to admin users management page
            router.push('/admin/users');
        } catch (err: any) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', paddingBottom: '100px' }}>
                <div className="login_container" style={{ width: '100%', maxWidth: '400px', padding: '0 20px' }}>

                    <div className="jms_ttl_wrap" style={{ justifyContent: 'center', marginBottom: '60px' }}>
                        <h1 className="jms_ttl" ref={titleRef} style={{ fontSize: '3rem' }}>
                            <span className="text_wrap" style={{ display: 'flex', overflow: 'hidden' }} aria-hidden="true">
                                {'Admin'.split('').map((letter, i) => (
                                    <span key={i} className="letter" style={{
                                        display: 'inline-block',
                                        transform: 'translateY(100%)',
                                        opacity: 0
                                    }}>
                                        {letter}
                                    </span>
                                ))}
                            </span>
                            <span className="sr_only">Admin Login</span>
                        </h1>
                    </div>

                    <div ref={formRef} style={{ opacity: 0 }}>
                        {error && (
                            <div style={{
                                padding: '15px',
                                marginBottom: '20px',
                                border: '1px solid rgba(255, 100, 100, 0.4)',
                                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                color: '#ff6b6b',
                                fontSize: '14px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div className="input_group">
                                <label htmlFor="email" className="input_label" style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginBottom: '10px',
                                    color: 'rgba(255, 255, 255, 0.6)'
                                }}>
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                                        padding: '10px 0',
                                        color: '#fff',
                                        fontSize: '16px',
                                        borderRadius: 0,
                                        outline: 'none',
                                        transition: 'border-color 0.3s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#fff'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                                />
                            </div>

                            <div className="input_group">
                                <label htmlFor="password" className="input_label" style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginBottom: '10px',
                                    color: 'rgba(255, 255, 255, 0.6)'
                                }}>
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                                        padding: '10px 0',
                                        color: '#fff',
                                        fontSize: '16px',
                                        borderRadius: 0,
                                        outline: 'none',
                                        transition: 'border-color 0.3s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#fff'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="hover_text"
                                style={{
                                    marginTop: '20px',
                                    background: 'transparent',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: '#fff',
                                    padding: '15px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    fontSize: '14px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    if(!isLoading) {
                                        e.currentTarget.style.background = '#fff';
                                        e.currentTarget.style.color = '#000';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if(!isLoading) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#fff';
                                    }
                                }}
                            >
                                {isLoading ? 'Verifying...' : 'Access Panel'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <div style={{ marginTop: 'auto' }}>
                <Footer />
            </div>
        </div>
    );
}
