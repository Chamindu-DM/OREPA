'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    const toastRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Entrance animation
        if (toastRef.current) {
            gsap.fromTo(toastRef.current,
                { y: -100, opacity: 0 },
                { y: 20, opacity: 1, duration: 0.5, ease: 'power3.out' }
            );

            // Auto dismiss
            const timer = setTimeout(() => {
                handleClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [onClose]);

    const handleClose = () => {
        if (toastRef.current) {
            gsap.to(toastRef.current, {
                y: -100,
                opacity: 0,
                duration: 0.5,
                ease: 'power3.in',
                onComplete: onClose
            });
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success': return {
                border: '1px solid rgba(46, 204, 113, 0.4)',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                color: '#2ecc71'
            };
            case 'error': return {
                border: '1px solid rgba(231, 76, 60, 0.4)',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                color: '#e74c3c'
            };
            case 'info': return {
                border: '1px solid rgba(52, 152, 219, 0.4)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                color: '#3498db'
            };
        }
    };

    const styles = getStyles();

    return (
        <div
            ref={toastRef}
            style={{
                position: 'fixed',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)', // Centered horizontally
                backgroundColor: styles.backgroundColor,
                border: styles.border,
                color: styles.color,
                padding: '12px 24px',
                borderRadius: '0px', // No rounded corners
                zIndex: 9999,
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backdropFilter: 'blur(5px)',
                minWidth: '300px',
                justifyContent: 'center'
            }}
        >
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{message}</span>
            <button
                onClick={handleClose}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: styles.color,
                    marginLeft: 'auto',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 5px'
                }}
            >
                ✕
            </button>
        </div>
    );
}
