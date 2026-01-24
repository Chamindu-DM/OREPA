'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_CONFIG, getApiUrl } from '@/config/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const engineeringFields = [
    'Aerospace Engineering', 'Agricultural Engineering', 'Architecture',
    'Biomedical Engineering', 'Civil Engineering', 'Computer Engineering',
    'Computer Science', 'Chemical & Process Engineering', 'Earth Resource Engineering',
    'Electrical Engineering', 'Electronic Engineering', 'Environmental Engineering',
    'Industrial Engineering', 'Manufacturing Engineering', 'Material Science & Engineering',
    'Marine Engineering', 'Mechanical Engineering', 'Mechatronics Engineering',
    'Software Engineering', 'Telecommunication Engineering', 'Textile Engineering',
    'Not Yet Specified', 'Other'
];

const university= [
    'University of Moratuwa',
    'University of Peradeniya',
    'University of Sri Jayewardenepura',
    'University of Ruhuna',
    'University of Colombo',
    'University of Sabaragamuwa',
    'University of Kelaniya',
    'General Sir John Kotelawala Defence University (KDU)',
    'Sri Lanka Institute of Information Technology (SLIIT)',
    'Informatics Institute of Technology (IIT)',
    'Sri Lanka Technological Campus (SLTC)',
    'Colombo International Nautical and Engineering College (CINEC)',
    'Uva Wellassa University',
    'Open University of Sri Lanka (OUSL)',
    'An Overseas University'
];

const universityLevels = [
    'First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Graduated', 'Other'
];

export default function Register() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        nameWithInitials: '',
        phone: '',
        country: 'Sri Lanka',
        address: '',
        dateOfBirth: '',
        email: '',
        confirmEmail: '',
        password: '',
        confirmPassword: '',
        batch: '',
        admissionNumber: '',
        alShy: '1st shy',
        university: '',
        faculty: 'Faculty of Engineering',
        universityLevel: 'First Year',
        engineeringField: '',
        declaration: false
    });

    const formRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.email !== formData.confirmEmail) {
            setError('Emails do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (!formData.declaration) {
            setError('Please accept the declaration');
            setIsLoading(false);
            return;
        }

        try {
            const payload = { ...formData };
            delete (payload as any).confirmEmail;

            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REGISTER), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle validation errors array if present
                if (data.errors && Array.isArray(data.errors)) {
                    throw new Error(data.errors.map((e: any) => e.message).join(', '));
                }
                throw new Error(data.message || 'Registration failed');
            }

            alert('Registration successful! Please wait for approval.');
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: 'transparent',
        border: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '10px 0',
        color: '#fff',
        fontSize: '16px',
        borderRadius: 0,
        outline: 'none',
        marginBottom: '20px',
        transition: 'border-color 0.3s'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '12px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        marginBottom: '5px',
        color: 'rgba(255, 255, 255, 0.6)'
    };

    return (
        <div className="wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main style={{ flex: 1, paddingTop: '100px', paddingBottom: '100px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>

                    <div className="jms_ttl_wrap" style={{ justifyContent: 'center', marginBottom: '40px' }}>
                        <h1 className="jms_ttl" ref={titleRef}>
                            <span className="text_wrap" style={{ display: 'flex', overflow: 'hidden' }} aria-hidden="true">
                                {'Registration'.split('').map((letter, i) => (
                                    <span key={i} className="letter" style={{
                                        display: 'inline-block',
                                        transform: 'translateY(100%)',
                                        opacity: 0
                                    }}>
                                        {letter}
                                    </span>
                                ))}
                            </span>
                            <span className="sr_only">Registration</span>
                        </h1>
                    </div>

                    <p style={{ textAlign: 'center', marginBottom: '40px', color: '#ccc' }}>
                        Already a member? <Link href="/login" style={{ color: '#fff', textDecoration: 'underline' }}>Log-in</Link>
                    </p>

                    <div ref={formRef} style={{ opacity: 0 }}>
                        {error && (
                            <div style={{
                                padding: '15px',
                                marginBottom: '20px',
                                border: '1px solid rgba(255, 100, 100, 0.4)',
                                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                color: '#ff6b6b',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Personal Details */}
                            <h3 style={{ color: '#fff', fontSize: '18px', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Personal Details</h3>

                            <div className="form_grid">
                                <div>
                                    <label style={labelStyle}>First Name *</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Last Name *</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required style={inputStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Name with Initials *</label>
                                <input type="text" name="nameWithInitials" value={formData.nameWithInitials} onChange={handleChange} required style={inputStyle} placeholder="Ex: A.B.C. Perera" />
                            </div>

                            <div className="form_grid">
                                <div>
                                    <label style={labelStyle}>Phone Number *</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={inputStyle} placeholder="+947xxxxxxxx" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Date of Birth *</label>
                                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required style={{...inputStyle, colorScheme: 'dark'}} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Address *</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} required style={inputStyle} placeholder="Enter your current address Ex: 123/A, Galle Road, Colombo." />
                            </div>

                            <div>
                                <label style={labelStyle}>Country</label>
                                <input type="text" name="country" value={formData.country} onChange={handleChange} style={inputStyle} />
                            </div>

                            {/* Account Details */}
                            <h3 style={{ color: '#fff', fontSize: '18px', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px', marginTop: '20px' }}>Account Credentials</h3>

                            <div className="form_grid">
                                <div>
                                    <label style={labelStyle}>Email Address *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Confirm Email Address *</label>
                                    <input type="email" name="confirmEmail" value={formData.confirmEmail} onChange={handleChange} required style={inputStyle} />
                                </div>
                            </div>

                            <div className="form_grid">
                                <div>
                                    <label style={labelStyle}>Password *</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Confirm Password *</label>
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={inputStyle} />
                                </div>
                            </div>

                            {/* Academic Details */}
                            <h3 style={{ color: '#fff', fontSize: '18px', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px', marginTop: '20px' }}>Academic Details</h3>

                            <div className="form_grid">
                                <div>
                                    <label style={labelStyle}>Batch of School *</label>
                                    <input type="number" name="batch" value={formData.batch} onChange={handleChange} required style={inputStyle} placeholder="Ex: 2024" />
                                </div>
                                <div>
                                    <label style={labelStyle}>School Admission Number *</label>
                                    <input type="text" name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} required style={inputStyle} placeholder="Ex: 20XX/XXXX" />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>A/L's Shy *</label>
                                <select name="alShy" value={formData.alShy} onChange={handleChange} required style={{...inputStyle, background: '#111'}}>
                                    <option value="1st shy">1st Shy</option>
                                    <option value="2nd shy">2nd Shy</option>
                                    <option value="3rd shy">3rd Shy</option>
                                </select>
                            </div>

                            <div className="form_grid">
                                <div>
                                    <label style={labelStyle}>University *</label>
                                    <select name="university" value={formData.university} onChange={handleChange} required style={{...inputStyle, background: '#111'}}>
                                        <option value="">Select University</option>
                                        {university.map(field => (
                                            <option key={field} value={field}>{field}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Faculty *</label>
                                    <input type="text" name="faculty" value={formData.faculty} onChange={handleChange} required style={inputStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Current University Level *</label>
                                <select name="universityLevel" value={formData.universityLevel} onChange={handleChange} required style={{...inputStyle, background: '#111'}}>
                                    {universityLevels.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={labelStyle}>Engineering Field (Currently Studying) *</label>
                                <select name="engineeringField" value={formData.engineeringField} onChange={handleChange} required style={{...inputStyle, background: '#111'}}>
                                    <option value="">Select Field</option>
                                    {engineeringFields.map(field => (
                                        <option key={field} value={field}>{field}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>OREPA_SC_ID</label>
                                <input type="text" value="Will be filled by admins" disabled style={{...inputStyle, opacity: 0.5, fontStyle: 'italic'}} />
                            </div>

                            {/* Declaration */}
                            <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    name="declaration"
                                    checked={formData.declaration}
                                    onChange={handleChange}
                                    id="declaration"
                                    style={{ width: '20px', height: '20px' }}
                                />
                                <label htmlFor="declaration" style={{ fontSize: '14px', color: '#ccc' }}>
                                    I hereby declare that the above information is true and correct.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="hover_text"
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: '#fff',
                                    padding: '15px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    fontSize: '14px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                    transition: 'all 0.3s ease'
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
                                {isLoading ? 'Submitting...' : 'Register'}
                            </button>
                        </form>

                        <div style={{ marginTop: '50px', textAlign: 'center', color: '#888', fontSize: '14px', lineHeight: '1.6' }}>
                            <p>If you have any issue regarding the registration please contact,</p>
                            <p style={{ marginTop: '10px', color: '#fff' }}>Sumudu Nadeera</p>
                            <p>Co – Membership Director</p>
                            <p>Old Royalists Engineering Professionals’ Association</p>
                            <p>+94753115018</p>
                            <p><a href="mailto:sumudunadeera01@gmail.com" style={{ textDecoration: 'underline' }}>sumudunadeera01@gmail.com</a></p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
