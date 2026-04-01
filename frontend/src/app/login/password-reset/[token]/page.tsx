'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_CONFIG, getApiUrl } from '@/config/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ResetPassword() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const EyeIcon = ({ visible }: { visible: boolean }) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {visible ? (
                <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </>
            ) : (
                <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                </>
            )}
        </svg>
    );

    const toggleBtnStyle: React.CSSProperties = {
        position: 'absolute',
        right: 0,
        bottom: '10px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

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
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password. The link might have expired.');
            }

            setSuccess('Password has been successfully reset. Redirecting to login...');
            
            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'An error occurred during the request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', paddingBottom: '100px' }}>
                <div className="login_container" style={{ width: '100%', maxWidth: '400px', padding: '0 20px' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '60px', textAlign: 'center' }}>
                        <h1 className="jms_ttl" ref={titleRef}>
                            <span className="text_wrap" style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden', justifyContent: 'center', gap: '8px' }} aria-hidden="true">
                                {'Reset Password'.split(' ').map((word, wIdx) => (
                                    <span key={`word-${wIdx}`} style={{ display: 'flex' }}>
                                        {word.split('').map((letter, i) => (
                                            <span key={`${wIdx}-${i}`} className="letter" style={{
                                                display: 'inline-block',
                                                transform: 'translateY(100%)',
                                                opacity: 0
                                            }}>
                                                {letter}
                                            </span>
                                        ))}
                                    </span>
                                ))}
                            </span>
                            <span className="sr_only">Reset Password</span>
                        </h1>
                        <p style={{ marginTop: '20px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', margin: '20px 0 0' }}>
                            Please enter your new password below.
                        </p>
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

                        {success && (
                            <div style={{
                                padding: '15px',
                                marginBottom: '20px',
                                border: '1px solid rgba(100, 255, 100, 0.4)',
                                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                                color: '#6bff6b',
                                fontSize: '14px',
                                textAlign: 'center'
                            }}>
                                {success}
                            </div>
                        )}

                        {!success && (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <div className="input_group">
                                    <label htmlFor="password" className="input_label" style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        marginBottom: '10px',
                                        color: 'rgba(255, 255, 255, 0.6)'
                                    }}>
                                        New Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            style={{
                                                width: '100%',
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                                                padding: '10px 30px 10px 0',
                                                color: '#fff',
                                                fontSize: '16px',
                                                borderRadius: 0,
                                                outline: 'none',
                                                transition: 'border-color 0.3s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#fff'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={toggleBtnStyle}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            <EyeIcon visible={showPassword} />
                                        </button>
                                    </div>
                                </div>

                                <div className="input_group">
                                    <label htmlFor="confirmPassword" className="input_label" style={{
                                        display: 'block',
                                        fontSize: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.1em',
                                        marginBottom: '10px',
                                        color: 'rgba(255, 255, 255, 0.6)'
                                    }}>
                                        Confirm Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            style={{
                                                width: '100%',
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                                                padding: '10px 30px 10px 0',
                                                color: '#fff',
                                                fontSize: '16px',
                                                borderRadius: 0,
                                                outline: 'none',
                                                transition: 'border-color 0.3s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#fff'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            style={toggleBtnStyle}
                                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                        >
                                            <EyeIcon visible={showConfirmPassword} />
                                        </button>
                                    </div>
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
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        )}
                        
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <Link href="/login" style={{ fontSize: '14px', color: '#fff', textDecoration: 'underline' }}>
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <div style={{ marginTop: 'auto' }}>
                <Footer />
            </div>
        </div>
    );
}
