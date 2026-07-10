import React, { useState, useEffect } from 'react';
import { FiSave, FiLoader, FiMenu, FiPlus, FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { profileAPI } from '../../utils/api';

// আসল প্রোজেক্টে এই mockApi এর পরিবর্তে utils/api.js থেকে আসল API কল করতে হবে।
const mockApi = {
    updateProfile: async (payload) => {
        console.log("Updating navigation with payload:", payload);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true, message: "Navigation updated successfully!" };
    }
};

export default function NavigationEditor({ profile, refetchProfile, showToast }) {
    const [navbarMenu, setNavbarMenu] = useState([]);
    const [footerMenu, setFooterMenu] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const defaultNavMenu = [
            { id: 'home', label: 'Home' },
            { id: 'projects', label: 'Projects' },
            { id: 'about', label: 'About' },
            { id: 'contact', label: 'Contact' },
        ];

        setNavbarMenu(profile?.navigation?.navbarMenu?.length ? profile.navigation.navbarMenu : defaultNavMenu);
        setFooterMenu(profile?.navigation?.footerMenu || []);
    }, [profile]);

    const handleMenuChange = (menu, setMenu, index, field, value) => {
        const newMenu = [...menu];
        newMenu[index][field] = value;
        setMenu(newMenu);
    };

    const addMenuItem = (setMenu) => {
        setMenu(prev => [...prev, { id: '', label: '' }]);
    };

    const deleteMenuItem = (setMenu, index) => {
        setMenu(prev => prev.filter((_, i) => i !== index));
    };

    const moveMenuItem = (setMenu, index, direction) => {
        setMenu(prev => {
            if ((direction === -1 && index === 0) || (direction === 1 && index === prev.length - 1)) return prev;
            const newMenu = [...prev];
            const item = newMenu.splice(index, 1)[0];
            newMenu.splice(index + direction, 0, item);
            return newMenu;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = {
                navigation: {
                    navbarMenu: navbarMenu.filter(item => item.id.trim() && item.label.trim()),
                    footerMenu: footerMenu.filter(item => item.id.trim() && item.label.trim()),
                }
            };
            await profileAPI.updateProfile(payload);
            showToast('Navigation updated successfully!', 'success');
            if (refetchProfile) refetchProfile();
        } catch (error) {
            showToast(error.message || 'An error occurred.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const renderMenuEditor = (title, menu, setMenu) => (
        <div className="p-4 border border-neutral-800 rounded-lg">
            <h3 className="text-md font-bold text-white mb-4">{title}</h3>
            <div className="space-y-3">
                {menu.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-neutral-800/50 rounded-md">
                        <div className="flex flex-col gap-2">
                            <button type="button" onClick={() => moveMenuItem(setMenu, index, -1)} className="text-neutral-500 hover:text-white disabled:opacity-30" disabled={index === 0}><FiArrowUp size={14} /></button>
                            <button type="button" onClick={() => moveMenuItem(setMenu, index, 1)} className="text-neutral-500 hover:text-white disabled:opacity-30" disabled={index === menu.length - 1}><FiArrowDown size={14} /></button>
                        </div>
                        <input type="text" value={item.label} onChange={(e) => handleMenuChange(menu, setMenu, index, 'label', e.target.value)} placeholder="Label (e.g., Home)" className="flex-grow p-2 text-xs rounded-md bg-neutral-700 border border-neutral-600" />
                        <input type="text" value={item.id} onChange={(e) => handleMenuChange(menu, setMenu, index, 'id', e.target.value)} placeholder="ID/Link (e.g., home or https://...)" className="flex-grow p-2 text-xs rounded-md bg-neutral-700 border border-neutral-600" />
                        <button type="button" onClick={() => deleteMenuItem(setMenu, index)} className="p-2 text-red-500 hover:text-red-400"><FiTrash2 /></button>
                    </div>
                ))}
            </div>
            <button type="button" onClick={() => addMenuItem(setMenu)} className="mt-4 flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-neutral-700 hover:bg-neutral-600 text-white rounded-md"><FiPlus /> Add Menu Item</button>
        </div>
    );

    return (
        <div className="p-6 bg-neutral-900 rounded-2xl border border-neutral-800">
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><FiMenu /> Navigation Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                {renderMenuEditor("Navbar Menu", navbarMenu, setNavbarMenu)}
                {renderMenuEditor("Footer Menu", footerMenu, setFooterMenu)}
                <div className="pt-6 border-t border-neutral-800">
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm bg-accent-purple text-white hover:bg-accent-purple/90 transition-all disabled:bg-neutral-600">
                        {isLoading ? <><FiLoader className="animate-spin" /> Saving...</> : <><FiSave /> Save Navigation</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
