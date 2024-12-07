import React, { useState } from 'react';
import { useRouter } from 'next/router';

const SearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/gallery/image?search=${query}`);
            router.push(`/gallery/audio?search=${query}`);
        }
    };

    return (
        <form onSubmit={handleSearch}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files..."
            />
            <button type="submit">Search</button>
        </form>
    );
};

export default SearchBar;