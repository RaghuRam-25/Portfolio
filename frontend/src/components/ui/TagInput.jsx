import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const TagInput = ({ tags, setTags, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInputValue('');
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            e.preventDefault();
            setTags(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="w-full p-2 text-sm rounded-md bg-neutral-100 dark:bg-neutral-800 border border-light-border dark:border-neutral-700 flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-accent-blue/50">
            {tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-1 bg-accent-blue/10 text-accent-blue dark:bg-accent-purple/10 dark:text-accent-purple text-xs font-bold px-2 py-1 rounded">
                    <span>{tag}</span>
                    <button type="button" onClick={() => removeTag(tag)} className="font-mono hover:text-red-500"><FiX size={14} /></button>
                </div>
            ))}
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder || "Add tags..."} className="flex-grow bg-transparent outline-none text-sm p-1" />
        </div>
    );
};

export default TagInput;