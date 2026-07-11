import React, { useState, useEffect } from 'react';
import { userAPI } from '../../utils/api';
import Spinner from '../ui/Spinner';
import { FiUsers, FiStar } from 'react-icons/fi';

const UserManager = ({ currentUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updateStatus, setUpdateStatus] = useState({}); // { userId: { status, message } }

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const res = await userAPI.getAll();
            if (res.success) {
                setUsers(res.data);
            } else {
                setError(res.message || 'Failed to load users.');
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        setUpdateStatus(prev => ({ ...prev, [userId]: { status: 'loading' } }));
        const res = await userAPI.updateRole(userId, newRole);
        if (res.success) {
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            setUpdateStatus(prev => ({ ...prev, [userId]: { status: 'success' } }));
        } else {
            setUpdateStatus(prev => ({ ...prev, [userId]: { status: 'error', message: res.message } }));
        }
        setTimeout(() => setUpdateStatus(prev => ({ ...prev, [userId]: undefined })), 3000);
    };

    const handleSetPortfolioProfile = async (userId) => {
        if (window.confirm('Are you sure you want to set this user as the main portfolio profile? This will affect the public site.')) {
            setUpdateStatus(prev => ({ ...prev, [userId]: { status: 'loading' } }));
            const res = await userAPI.setAsPortfolioProfile(userId);
            if (res.success) {
                setUsers(prev => prev.map(u => ({ ...u, isPortfolioProfile: u._id === userId })));
                setUpdateStatus(prev => ({ ...prev, [userId]: { status: 'success' } }));
            } else {
                setUpdateStatus(prev => ({ ...prev, [userId]: { status: 'error', message: res.message } }));
            }
            setTimeout(() => setUpdateStatus(prev => ({ ...prev, [userId]: undefined })), 3000);
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-light-border dark:border-neutral-800">
            <h3 className="text-lg font-bold flex items-center gap-2"><FiUsers /> User Role Management</h3>

            {loading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
            ) : error ? (
                <p className="text-red-500 p-4">{error}</p>
            ) : (
                <div className="mt-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                    {users.map(user => (
                        <div key={user._id} className="flex justify-between items-center p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                            <div className="flex items-center gap-3 overflow-hidden">
                                {user.isPortfolioProfile && <FiStar className="text-amber-400 flex-shrink-0" title="This is the main portfolio profile" />}
                                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full flex-shrink-0 bg-neutral-200" />
                                <div className="truncate">
                                    <p className="font-semibold text-sm truncate">{user.name}</p>
                                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={() => handleSetPortfolioProfile(user._id)}
                                    disabled={user.isPortfolioProfile || updateStatus[user._id]?.status === 'loading'}
                                    className="p-1.5 rounded-md bg-neutral-200 dark:bg-neutral-700 border-none disabled:opacity-50 disabled:cursor-not-allowed text-neutral-500 hover:text-amber-500 focus:ring-2 focus:ring-accent-blue"
                                    title="Set as main portfolio profile"
                                >
                                    <FiStar size={14} />
                                </button>
                                <select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)} disabled={user.email === currentUser.email || updateStatus[user._id]?.status === 'loading'} className="text-xs p-1 rounded-md bg-neutral-200 dark:bg-neutral-700 border-none disabled:opacity-50 focus:ring-2 focus:ring-accent-blue"><option value="user">User</option><option value="admin">Admin</option></select>
                                {updateStatus[user._id]?.status === 'loading' && <Spinner />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserManager;
