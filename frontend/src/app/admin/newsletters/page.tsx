'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { getApiUrl, API_CONFIG } from '@/config/api';
import gsap from 'gsap';

const getMediaUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('/uploads/')) {
        // If we are developing locally, force the local backend URL
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return `http://localhost:5001${url}`;
        }
        const baseUrl = API_CONFIG.BASE_URL || 'http://localhost:5001/api';
        return baseUrl.replace(/\/api\/?$/, '') + url;
    }
    return url;
};

interface Newsletter {
    id: string;
    title: string;
    date: string;
    pdfUrl: string;
    coverImage: string | null;
    description: string | null;
    isPublished: boolean;
    sortOrder: number;
    createdAt: string;
    createdBy?: { firstName: string; lastName: string; email: string };
}

interface ToastState {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
}

export default function NewsletterManagement() {
    const router = useRouter();
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
    const [searchQuery, setSearchQuery] = useState('');
    const titleRef = useRef<HTMLHeadingElement>(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null);
    const [deletingNewsletter, setDeletingNewsletter] = useState<Newsletter | null>(null);

    // Form states
    const [formTitle, setFormTitle] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPublished, setFormPublished] = useState(true);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
    };

    // Title animation
    useEffect(() => {
        if (titleRef.current) {
            const letters = titleRef.current.querySelectorAll('.letter');
            gsap.to(letters, { y: 0, opacity: 1, stagger: 0.03, duration: 0.5, ease: 'power2.out' });
        }
    }, []);

    // Auth check
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
        }
    }, [router]);

    // Fetch newsletters
    const fetchNewsletters = async (search = '') => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('adminToken');
            const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
            const response = await fetch(getApiUrl(`/admin/newsletters?limit=100${searchParam}`), {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }
            const data = await response.json();
            if (data.success) {
                setNewsletters(data.data.newsletters);
            } else {
                setError(data.message || 'Failed to fetch newsletters');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNewsletters();
    }, []);

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => fetchNewsletters(searchQuery), 350);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Create newsletter
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle || !formDate || !pdfFile) {
            showToast('Title, date, and PDF file are required', 'error');
            return;
        }
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('adminToken');
            const formData = new FormData();
            formData.append('title', formTitle);
            formData.append('date', formDate);
            formData.append('description', formDescription);
            formData.append('isPublished', String(formPublished));
            formData.append('pdf', pdfFile);
            if (coverFile) formData.append('cover', coverFile);

            const response = await fetch(getApiUrl('/admin/newsletters'), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                showToast('Newsletter created successfully', 'success');
                setShowCreateModal(false);
                resetForm();
                fetchNewsletters(searchQuery);
            } else {
                showToast(data.message || 'Failed to create newsletter', 'error');
            }
        } catch {
            showToast('Failed to create newsletter', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update newsletter
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingNewsletter) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('adminToken');
            const formData = new FormData();
            formData.append('title', formTitle);
            formData.append('date', formDate);
            formData.append('description', formDescription);
            formData.append('isPublished', String(formPublished));
            if (pdfFile) formData.append('pdf', pdfFile);
            if (coverFile) formData.append('cover', coverFile);

            const response = await fetch(getApiUrl(`/admin/newsletters/${editingNewsletter.id}`), {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                showToast('Newsletter updated successfully', 'success');
                setEditingNewsletter(null);
                resetForm();
                fetchNewsletters(searchQuery);
            } else {
                showToast(data.message || 'Failed to update newsletter', 'error');
            }
        } catch {
            showToast('Failed to update newsletter', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete newsletter
    const handleDelete = async () => {
        if (!deletingNewsletter) return;
        setActionLoading(deletingNewsletter.id);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(getApiUrl(`/admin/newsletters/${deletingNewsletter.id}`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                showToast('Newsletter deleted successfully', 'success');
                setDeletingNewsletter(null);
                fetchNewsletters(searchQuery);
            } else {
                showToast(data.message || 'Failed to delete', 'error');
            }
        } catch {
            showToast('Failed to delete newsletter', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    // Toggle publish
    const handleTogglePublish = async (id: string) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(getApiUrl(`/admin/newsletters/${id}/toggle-publish`), {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                showToast(data.message, 'success');
                fetchNewsletters(searchQuery);
            } else {
                showToast(data.message || 'Failed to toggle', 'error');
            }
        } catch {
            showToast('Failed to toggle publish status', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const resetForm = () => {
        setFormTitle('');
        setFormDate('');
        setFormDescription('');
        setFormPublished(true);
        setPdfFile(null);
        setCoverFile(null);
    };

    const openEditModal = (nl: Newsletter) => {
        setEditingNewsletter(nl);
        setFormTitle(nl.title);
        setFormDate(nl.date);
        setFormDescription(nl.description || '');
        setFormPublished(nl.isPublished);
        setPdfFile(null);
        setCoverFile(null);
    };

    // Shared styles
    const inputStyle: React.CSSProperties = {
        width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid #333',
        color: '#fff', padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    };
    const labelStyle: React.CSSProperties = { display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' };
    const btnPrimary: React.CSSProperties = {
        padding: '10px 24px', background: '#fff', color: '#000', border: 'none',
        cursor: 'pointer', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em',
        transition: 'all 0.3s ease',
    };
    const btnOutline: React.CSSProperties = {
        padding: '10px 24px', background: 'transparent', color: '#fff', border: '1px solid #fff',
        cursor: 'pointer', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em',
        transition: 'all 0.3s ease',
    };

    // Form modal JSX (shared between create and edit)
    const renderFormModal = (isEdit: boolean) => (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                background: '#111', border: '1px solid #333', padding: '30px',
                width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto',
            }}>
                <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '20px' }}>
                    {isEdit ? 'Edit Newsletter' : 'Add Newsletter'}
                </h2>
                <form onSubmit={isEdit ? handleUpdate : handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={labelStyle}>Title *</label>
                        <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)}
                            placeholder="OREPA Newsletter - January 2026" style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Date *</label>
                        <input type="text" value={formDate} onChange={e => setFormDate(e.target.value)}
                            placeholder="January 2026" style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)}
                            placeholder="Optional short description..." rows={3}
                            style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                    <div>
                        <label style={labelStyle}>PDF File {!isEdit && '*'}</label>
                        <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)}
                            style={{ color: '#aaa', fontSize: '13px' }} />
                        {isEdit && !pdfFile && (
                            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#555' }}>
                                Leave empty to keep current PDF
                            </p>
                        )}
                    </div>
                    <div>
                        <label style={labelStyle}>Cover Image</label>
                        <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setCoverFile(e.target.files?.[0] || null)}
                            style={{ color: '#aaa', fontSize: '13px' }} />
                        {isEdit && editingNewsletter?.coverImage && !coverFile && (
                            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#555' }}>
                                Current: {editingNewsletter.coverImage.split('/').pop()}
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" id="published" checked={formPublished}
                            onChange={e => setFormPublished(e.target.checked)}
                            style={{ transform: 'scale(1.2)', cursor: 'pointer' }} />
                        <label htmlFor="published" style={{ color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>
                            Published (visible on public page)
                        </label>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" disabled={isSubmitting} style={{
                            ...btnPrimary, opacity: isSubmitting ? 0.5 : 1,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        }}>
                            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                        </button>
                        <button type="button" onClick={() => { isEdit ? setEditingNewsletter(null) : setShowCreateModal(false); resetForm(); }}
                            style={btnOutline}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            {toast.show && (
                <Toast message={toast.message} type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })} />
            )}

            {/* Create Modal */}
            {showCreateModal && renderFormModal(false)}

            {/* Edit Modal */}
            {editingNewsletter && renderFormModal(true)}

            {/* Delete Confirmation Modal */}
            {deletingNewsletter && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{ background: '#111', border: '1px solid #333', padding: '30px', maxWidth: '440px', width: '100%' }}>
                        <h2 style={{ color: '#fff', marginBottom: '10px', fontSize: '20px' }}>Delete Newsletter</h2>
                        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>
                            Are you sure you want to delete <strong style={{ color: '#fff' }}>{deletingNewsletter.title}</strong>?
                            This will also remove the uploaded PDF and cover image.
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleDelete} disabled={actionLoading === deletingNewsletter.id}
                                style={{ ...btnPrimary, background: '#e74c3c', color: '#fff', opacity: actionLoading ? 0.5 : 1 }}>
                                {actionLoading === deletingNewsletter.id ? 'Deleting...' : 'Delete'}
                            </button>
                            <button onClick={() => setDeletingNewsletter(null)} style={btnOutline}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <main style={{ flex: 1, paddingTop: '100px', paddingBottom: '100px', width: '100%', maxWidth: '1200px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>

                {/* Title */}
                <div className="jms_ttl_wrap" style={{ justifyContent: 'center', marginBottom: '40px' }}>
                    <h1 className="jms_ttl" ref={titleRef} style={{ fontSize: '3rem' }}>
                        <span className="text_wrap" style={{ display: 'flex', overflow: 'hidden' }} aria-hidden="true">
                            {'Newsletters'.split('').map((letter, i) => (
                                <span key={i} className="letter" style={{
                                    display: 'inline-block', transform: 'translateY(100%)', opacity: 0
                                }}>
                                    {letter}
                                </span>
                            ))}
                        </span>
                        <span className="sr_only">Newsletter Management</span>
                    </h1>
                </div>

                {/* Admin Nav */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <button onClick={() => router.push('/admin/users')} style={btnOutline}>
                        ← Users
                    </button>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => { resetForm(); setShowCreateModal(true); }} style={btnPrimary}>
                        + Add Newsletter
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ position: 'relative', maxWidth: '460px' }}>
                        <svg style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search newsletters by title..."
                            style={{ ...inputStyle, padding: '9px 32px 9px 34px', fontSize: '13px' }} />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{
                                position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)',
                                background: 'transparent', border: 'none', color: '#666',
                                cursor: 'pointer', fontSize: '18px', lineHeight: 1, padding: 0
                            }}>×</button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
                        Loading newsletters...
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#e74c3c' }}>{error}</div>
                ) : newsletters.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
                        {searchQuery ? `No newsletters found for "${searchQuery}"` : 'No newsletters yet. Click "+ Add Newsletter" to create one.'}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        {/* Table header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 140px 90px 180px',
                            gap: '16px',
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.05)',
                            borderBottom: '1px solid #222',
                            fontSize: '11px',
                            color: '#555',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}>
                            <span>Title</span>
                            <span>Date</span>
                            <span>Status</span>
                            <span style={{ textAlign: 'right' }}>Actions</span>
                        </div>

                        {/* Table rows */}
                        {newsletters.map(nl => (
                            <div key={nl.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 140px 90px 180px',
                                gap: '16px',
                                padding: '14px 16px',
                                alignItems: 'center',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                transition: 'background 0.2s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                {/* Title + description */}
                                <div>
                                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {nl.coverImage && (
                                            <img src={getMediaUrl(nl.coverImage)} alt="Cover" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                                        )}
                                        {nl.title}
                                    </div>
                                    {nl.description && (
                                        <div style={{ color: '#555', fontSize: '12px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                                            {nl.description}
                                        </div>
                                    )}
                                </div>

                                {/* Date */}
                                <div style={{ color: '#aaa', fontSize: '13px' }}>{nl.date}</div>

                                {/* Status */}
                                <div>
                                    <span style={{
                                        display: 'inline-block', padding: '3px 8px', fontSize: '11px',
                                        background: nl.isPublished ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.06)',
                                        color: nl.isPublished ? '#2ecc71' : '#666',
                                        border: `1px solid ${nl.isPublished ? 'rgba(46,204,113,0.3)' : '#333'}`,
                                    }}>
                                        {nl.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleTogglePublish(nl.id)}
                                        disabled={actionLoading === nl.id}
                                        title={nl.isPublished ? 'Unpublish' : 'Publish'}
                                        style={{ background: 'transparent', border: 'none', color: nl.isPublished ? '#2ecc71' : '#666', cursor: 'pointer', padding: '5px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            {nl.isPublished
                                                ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                                                : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                                            }
                                        </svg>
                                    </button>
                                    <button onClick={() => openEditModal(nl)}
                                        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px' }}
                                        title="Edit">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button onClick={() => setDeletingNewsletter(nl)}
                                        style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '5px' }}
                                        title="Delete">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats */}
                {!isLoading && newsletters.length > 0 && (
                    <div style={{ marginTop: '20px', fontSize: '12px', color: '#444', textAlign: 'center' }}>
                        {newsletters.length} newsletter{newsletters.length !== 1 ? 's' : ''} • {newsletters.filter(n => n.isPublished).length} published • {newsletters.filter(n => !n.isPublished).length} drafts
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
