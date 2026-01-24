'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { getApiUrl } from '@/config/api';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    nameWithInitials: string;
    batch: number;
    university: string;
    engineeringField: string;
    status: string;
    orepaSCId?: string;
    role: string;
    createdAt: string;
}

interface ToastState {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
}

export default function UserManagement() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'members'>('pending');
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(50);
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);
    const [columns, setColumns] = useState({
        personal: true,
        academic: true,
        account: false
    });
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const titleRef = useRef<HTMLHeadingElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        setCurrentPage(1);
        fetchUsers(activeTab, 1);

        // Animate title
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
    }, [activeTab, router]);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ show: true, message, type });
    };

    const fetchUsers = async (tab: 'pending' | 'members', page: number) => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('adminToken');
            const endpoint = tab === 'pending'
                ? `/admin/member-management/pending?page=${page}&limit=${itemsPerPage}`
                : `/admin/member-management/members?page=${page}&limit=${itemsPerPage}`;

            const response = await fetch(getApiUrl(endpoint), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                // Remove setting page error, maybe just show toast?
                // Currently code sets error state. Let's keep error state for page-level errors
                // But for transient errors use toast?
                // The user's request focused on toast replacement for ALERT.
                // Page load errors are fine inline.
                setError(data.message || 'Failed to fetch users');
                setIsLoading(false);
                return;
            }

            setUsers(data.data?.users || data.data?.members || []);

            if (data.data?.pagination) {
                setTotalPages(data.data.pagination.totalPages);
                setCurrentPage(data.data.pagination.currentPage);
            }

            // Animate list items entrance
            if (listRef.current) {
                gsap.fromTo(listRef.current.children,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.1,
                        duration: 0.5,
                        ease: 'power2.out',
                        clearProps: 'all'
                    }
                );
            }

        } catch (err: any) {
            setError(err.message || 'Error fetching users');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchUsers(activeTab, newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleAction = async (userId: string, action: 'approve' | 'reject') => {
        setActionLoading(userId);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(getApiUrl(`/admin/member-management/${userId}/${action}`), {
                method: 'POST',
                headers:
                {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(data.message || `Failed to ${action} user`, 'error');
                setActionLoading(null);
                return;
            }

            // Refresh list
            fetchUsers(activeTab, currentPage);

            // Show success message
            showToast(`User ${action}d successfully`, 'success');

        } catch (err: any) {
            showToast(err.message || `Error: could not ${action} user`, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleBatchAction = async (action: 'approve' | 'reject') => {
        setIsBatchProcessing(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(getApiUrl('/admin/member-management/batch'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userIds: selectedUsers,
                    action
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showToast(data.message || `Failed to ${action} users`, 'error');
                setIsBatchProcessing(false);
                return;
            }

            // Refresh list
            fetchUsers(activeTab, currentPage);

            // Show success message
            showToast(`Users ${action}d successfully`, 'success');

            // Clear selection
            setSelectedUsers([]);

        } catch (err: any) {
            showToast(err.message || `Error: could not ${action} users`, 'error');
        } finally {
            setIsBatchProcessing(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
    };

    const toggleSelectUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const toggleColumn = (key: keyof typeof columns) => {
        setColumns({ ...columns, [key]: !columns[key] });
    };

    const handleDeleteUser = async () => {
        if (!deletingUser) return;

        setActionLoading(deletingUser.id);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(getApiUrl(`/admin/users/${deletingUser.id}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete user');
            }

            showToast('User deleted successfully', 'success');
            setDeletingUser(null);
            fetchUsers(activeTab, currentPage);
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setActionLoading(editingUser.id);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(getApiUrl(`/admin/users/${editingUser.id}`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editingUser)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update user');
            }

            showToast('User updated successfully', 'success');
            setEditingUser(null);
            fetchUsers(activeTab, currentPage);
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#111',
                        border: '1px solid #333',
                        padding: '30px',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ color: '#fff', marginBottom: '20px' }}>Edit User</h2>
                        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '5px' }}>First Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.firstName}
                                        onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                                        style={{ width: '100%', background: '#222', border: '1px solid #444', color: '#fff', padding: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '5px' }}>Last Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.lastName}
                                        onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                                        style={{ width: '100%', background: '#222', border: '1px solid #444', color: '#fff', padding: '8px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '5px' }}>University</label>
                                <input
                                    type="text"
                                    value={editingUser.university}
                                    onChange={(e) => setEditingUser({...editingUser, university: e.target.value})}
                                    style={{ width: '100%', background: '#222', border: '1px solid #444', color: '#fff', padding: '8px' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '5px' }}>Batch</label>
                                    <input
                                        type="number"
                                        value={editingUser.batch}
                                        onChange={(e) => setEditingUser({...editingUser, batch: parseInt(e.target.value) || 0})}
                                        style={{ width: '100%', background: '#222', border: '1px solid #444', color: '#fff', padding: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '5px' }}>Engineering Field</label>
                                    <input
                                        type="text"
                                        value={editingUser.engineeringField}
                                        onChange={(e) => setEditingUser({...editingUser, engineeringField: e.target.value})}
                                        style={{ width: '100%', background: '#222', border: '1px solid #444', color: '#fff', padding: '8px' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '5px' }}>SC ID</label>
                                <input
                                    type="text"
                                    value={editingUser.orepaSCId || ''}
                                    onChange={(e) => setEditingUser({...editingUser, orepaSCId: e.target.value})}
                                    style={{ width: '100%', background: '#222', border: '1px solid #444', color: '#fff', padding: '8px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    style={{ padding: '8px 15px', background: 'transparent', border: '1px solid #f00', color: '#f00', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading === editingUser.id}
                                    style={{ padding: '8px 15px', background: '#fff', border: 'none', color: '#000', cursor: 'pointer' }}
                                >
                                    {actionLoading === editingUser.id ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete User Confirmation Modal */}
            {deletingUser && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#111',
                        border: '1px solid #f00',
                        padding: '30px',
                        width: '100%',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ color: '#f00', marginBottom: '10px' }}>Delete User?</h2>
                        <p style={{ color: '#fff', marginBottom: '20px' }}>
                            Are you sure you want to delete user <strong>{deletingUser.firstName} {deletingUser.lastName}</strong> ({deletingUser.email})?
                            This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            <button
                                onClick={() => setDeletingUser(null)}
                                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #fff', color: '#fff', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={actionLoading === deletingUser.id}
                                style={{ padding: '10px 20px', background: '#f00', border: 'none', color: '#fff', cursor: 'pointer' }}
                            >
                                {actionLoading === deletingUser.id ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main style={{ flex: 1, paddingTop: '100px', paddingBottom: '100px', width: '100%', maxWidth: '1200px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>

                <div className="jms_ttl_wrap" style={{ justifyContent: 'center', marginBottom: '40px' }}>
                    <h1 className="jms_ttl" ref={titleRef} style={{ fontSize: '3rem' }}>
                         <span className="text_wrap" style={{ display: 'flex', overflow: 'hidden' }} aria-hidden="true">
                            {'Management'.split('').map((letter, i) => (
                                <span key={i} className="letter" style={{
                                    display: 'inline-block',
                                    transform: 'translateY(100%)',
                                    opacity: 0
                                }}>
                                    {letter}
                                </span>
                            ))}
                        </span>
                        <span className="sr_only">User Management</span>
                    </h1>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setActiveTab('pending')}
                            style={{
                                padding: '10px 20px',
                                background: activeTab === 'pending' ? '#fff' : 'transparent',
                                color: activeTab === 'pending' ? '#000' : '#fff',
                                border: '1px solid #fff',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                transition: 'all 0.3s ease',
                                fontSize: '13px'
                            }}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            style={{
                                padding: '10px 20px',
                                background: activeTab === 'members' ? '#fff' : 'transparent',
                                color: activeTab === 'members' ? '#000' : '#fff',
                                border: '1px solid #fff',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                transition: 'all 0.3s ease',
                                fontSize: '13px'
                            }}
                        >
                            Members
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowColumnSelector(!showColumnSelector)}
                                style={{
                                    border: '1px solid #fff',
                                    background: 'transparent',
                                    color: '#fff',
                                    padding: '5px 10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
                                    <polyline points="13 3 13 21" />
                                    <polyline points="3 9 21 9" />
                                </svg>
                                Columns
                            </button>
                            {showColumnSelector && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    background: '#222',
                                    border: '1px solid #444',
                                    padding: '10px',
                                    marginTop: '5px',
                                    zIndex: 100,
                                    width: '150px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                                }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#fff', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={columns.personal} onChange={() => toggleColumn('personal')} /> Personal
                                    </label>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#fff', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={columns.academic} onChange={() => toggleColumn('academic')} /> Academic
                                    </label>
                                    <label style={{ display: 'block', color: '#fff', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={columns.account} onChange={() => toggleColumn('account')} /> Account
                                    </label>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setViewMode('grid')} style={{ opacity: viewMode === 'grid' ? 1 : 0.5, border: 'none', background: 'transparent', cursor: 'pointer', color: '#fff' }} title="Grid View">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </button>
                        <button onClick={() => setViewMode('list')} style={{ opacity: viewMode === 'list' ? 1 : 0.5, border: 'none', background: 'transparent', cursor: 'pointer', color: '#fff' }} title="List View">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                        </button>
                        <button onClick={() => setViewMode('table')} style={{ opacity: viewMode === 'table' ? 1 : 0.5, border: 'none', background: 'transparent', cursor: 'pointer', color: '#fff' }} title="Table View">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                {activeTab === 'pending' && selectedUsers.length > 0 && (
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '15px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ color: '#fff' }}>{selectedUsers.length} selected</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => handleBatchAction('approve')}
                                disabled={isBatchProcessing}
                                style={{
                                    padding: '5px 15px',
                                    background: '#2ecc71',
                                    border: 'none',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                {isBatchProcessing ? 'Processing...' : 'Approve Selected'}
                            </button>
                            <button
                                onClick={() => handleBatchAction('reject')}
                                disabled={isBatchProcessing}
                                style={{
                                    padding: '5px 15px',
                                    background: '#e74c3c',
                                    border: 'none',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                {isBatchProcessing ? 'Processing...' : 'Reject Selected'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'pending' && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={users.length > 0 && selectedUsers.length === users.length}
                                onChange={toggleSelectAll}
                                style={{ transform: 'scale(1.2)' }}
                            />
                            Select All
                        </label>
                    </div>
                )}

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

                {isLoading ? (
                    <div style={{ textAlign: 'center', color: '#fff', padding: '40px' }}>Loading...</div>
                ) : (
                    <>
                        {viewMode === 'list' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {users.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>No users found.</div>
                                ) : users.map(user => (
                                    <div key={user.id} style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        padding: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px'
                                    }}>
                                        {activeTab === 'pending' && (
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => toggleSelectUser(user.id)}
                                                style={{ transform: 'scale(1.2)' }}
                                            />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>{user.nameWithInitials}</h3>
                                            <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{user.email}</p>
                                        </div>
                                        <div style={{ color: '#aaa', fontSize: '13px' }}>{user.university} - {user.engineeringField}</div>

                                        {activeTab === 'pending' && (
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => handleAction(user.id, 'approve')} style={{ color: '#2ecc71', background: 'transparent', border: '1px solid #2ecc71', padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}>Approve</button>
                                                <button onClick={() => handleAction(user.id, 'reject')} style={{ color: '#e74c3c', background: 'transparent', border: '1px solid #e74c3c', padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}>Reject</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {viewMode === 'table' && (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #fff', textAlign: 'left' }}>
                                            {activeTab === 'pending' && <th style={{ padding: '10px', width: '40px' }}></th>}
                                            {columns.personal && (
                                                <>
                                                    <th style={{ padding: '10px' }}>Name</th>
                                                    <th style={{ padding: '10px' }}>Email</th>
                                                </>
                                            )}
                                            {columns.academic && (
                                                <>
                                                    <th style={{ padding: '10px' }}>University</th>
                                                    <th style={{ padding: '10px' }}>Batch</th>
                                                    {activeTab === 'members' && <th style={{ padding: '10px' }}>SC ID</th>}
                                                </>
                                            )}
                                            {columns.account && (
                                                <>
                                                    <th style={{ padding: '10px' }}>Role</th>
                                                    <th style={{ padding: '10px' }}>Status</th>
                                                </>
                                            )}
                                            <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>No users found.</td></tr>
                                        ) : users.map(user => (
                                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                {activeTab === 'pending' && (
                                                    <td style={{ padding: '10px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUsers.includes(user.id)}
                                                            onChange={() => toggleSelectUser(user.id)}
                                                        />
                                                    </td>
                                                )}
                                                {columns.personal && (
                                                    <>
                                                        <td style={{ padding: '10px' }}>{user.nameWithInitials}</td>
                                                        <td style={{ padding: '10px', color: '#aaa' }}>{user.email}</td>
                                                    </>
                                                )}
                                                {columns.academic && (
                                                    <>
                                                        <td style={{ padding: '10px' }}>{user.university}</td>
                                                        <td style={{ padding: '10px' }}>{user.batch}</td>
                                                        {activeTab === 'members' && <td style={{ padding: '10px' }}>{user.orepaSCId || '-'}</td>}
                                                    </>
                                                )}
                                                {columns.account && (
                                                    <>
                                                        <td style={{ padding: '10px' }}>{user.role}</td>
                                                        <td style={{ padding: '10px' }}>
                                                            {/* Simple status badge */}
                                                            <span style={{
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                fontSize: '11px',
                                                                backgroundColor: user.status === 'APPROVED' ? 'rgba(46, 204, 113, 0.2)' :
                                                                                user.status === 'PENDING' ? 'rgba(241, 196, 15, 0.2)' :
                                                                                user.status === 'REJECTED' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.1)',
                                                                color: user.status === 'APPROVED' ? '#2ecc71' :
                                                                       user.status === 'PENDING' ? '#f1c40f' :
                                                                       user.status === 'REJECTED' ? '#e74c3c' : '#aaa'
                                                            }}>
                                                                {user.status}
                                                            </span>
                                                        </td>
                                                    </>
                                                )}
                                                <td style={{ padding: '10px', textAlign: 'right' }}>
                                                    {activeTab === 'pending' ? (
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                            <button onClick={() => handleAction(user.id, 'approve')} style={{ color: '#2ecc71', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Approve</button>
                                                            <button onClick={() => handleAction(user.id, 'reject')} style={{ color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Reject</button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                            <button onClick={() => setEditingUser(user)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} title="Edit">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                                </svg>
                                                            </button>
                                                            <button onClick={() => setDeletingUser(user)} style={{ background: 'transparent', border: 'none', color: '#f00', cursor: 'pointer' }} title="Delete">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {viewMode === 'grid' && (
                            <div ref={listRef} style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                                {users.length === 0 ? (
                                    <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                                        No users found.
                                    </div>
                                ) : users.map(user => (
                                    <div key={user.id} style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: selectedUsers.includes(user.id) ? '1px solid #fff' : '1px solid rgba(255, 255, 255, 0.1)',
                                        padding: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        transition: 'all 0.3s ease',
                                        position: 'relative'
                                    }}>
                                        {activeTab === 'pending' && (
                                            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={() => toggleSelectUser(user.id)}
                                                    style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                                                />
                                            </div>
                                        )}

                                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '5px' }}>
                                            <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>{user.nameWithInitials}</h3>
                                            <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{user.email}</p>
                                        </div>

                                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                            <p style={{ margin: '5px 0' }}><strong>Batch:</strong> {user.batch}</p>
                                            <p style={{ margin: '5px 0' }}><strong>University:</strong> {user.university}</p>
                                            <p style={{ margin: '5px 0' }}><strong>Field:</strong> {user.engineeringField}</p>
                                            {user.orepaSCId && <p style={{ margin: '5px 0' }}><strong>ID:</strong> {user.orepaSCId}</p>}
                                        </div>

                                        {activeTab === 'pending' && (
                                            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '15px' }}>
                                                <button
                                                    onClick={() => handleAction(user.id, 'approve')}
                                                    disabled={actionLoading === user.id}
                                                    style={{
                                                        flex: 1,
                                                        padding: '8px',
                                                        background: 'rgba(46, 204, 113, 0.2)',
                                                        border: '1px solid rgba(46, 204, 113, 0.4)',
                                                        color: '#2ecc71',
                                                        cursor: actionLoading === user.id ? 'not-allowed' : 'pointer',
                                                        fontSize: '12px',
                                                        textTransform: 'uppercase',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {actionLoading === user.id ? '...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(user.id, 'reject')}
                                                    disabled={actionLoading === user.id}
                                                    style={{
                                                        flex: 1,
                                                        padding: '8px',
                                                        background: 'rgba(231, 76, 60, 0.2)',
                                                        border: '1px solid rgba(231, 76, 60, 0.4)',
                                                        color: '#e74c3c',
                                                        cursor: actionLoading === user.id ? 'not-allowed' : 'pointer',
                                                        fontSize: '12px',
                                                        textTransform: 'uppercase',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {actionLoading === user.id ? '...' : 'Reject'}
                                                </button>
                                            </div>
                                        )}

                                        {activeTab === 'members' && (
                                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                                                <button onClick={() => setEditingUser(user)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px' }} title="Edit">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button onClick={() => setDeletingUser(user)} style={{ background: 'transparent', border: 'none', color: '#f00', cursor: 'pointer', padding: '5px' }} title="Delete">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: '10px 15px',
                                background: '#2ecc71',
                                border: 'none',
                                color: '#fff',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                borderRadius: '4px',
                                transition: 'background 0.3s'
                            }}
                        >
                            Previous
                        </button>
                        <span style={{ color: '#fff', fontSize: '14px', alignSelf: 'center' }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '10px 15px',
                                background: '#2ecc71',
                                border: 'none',
                                color: '#fff',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                borderRadius: '4px',
                                transition: 'background 0.3s'
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            <div style={{ marginTop: 'auto' }}>
                <Footer />
            </div>
        </div>
    );
}
