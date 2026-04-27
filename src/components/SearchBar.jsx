import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const trimmed = query.trim();

    if (/^\d+$/.test(trimmed)) {
      navigate(`/block/${trimmed}`);
    } else if (trimmed.length === 64) {
      navigate(`/tx/${trimmed}`);
    } else if (trimmed.length === 48) {
      navigate(`/address/${trimmed}`);
    } else if (trimmed.length === 66 && trimmed.startsWith('0x')) {
      navigate(`/block/${trimmed}`);
    } else {
      navigate(`/block/${trimmed}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search block, tx, or address..."
        className="w-full px-4 py-3 pl-12 bg-white/10 border border-primary/50 rounded-full text-white placeholder-white/40 outline-none focus:border-primary transition-colors"
      />
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-black text-sm font-semibold rounded-full hover:bg-opacity-90 transition-opacity"
      >
        Search
      </button>
    </form>
  );
}