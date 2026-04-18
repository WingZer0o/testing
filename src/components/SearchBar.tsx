'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { SearchResult } from '@/types/stock';

interface SearchBarProps {
  onSelect: (result: SearchResult) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      setError(null);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          setResults([]);
        } else {
          setResults(data);
          setShowDropdown(true);
        }
      } catch {
        setError('Search failed');
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 bg-[#1a1a24] border border-[#1e1e2e] rounded-lg px-3 py-2 focus-within:border-[#4d9eff] transition-colors">
        {loading ? (
          <FontAwesomeIcon icon={faSpinner} className="text-[#8888aa] text-sm animate-spin shrink-0" />
        ) : (
          <FontAwesomeIcon icon={faSearch} className="text-[#8888aa] text-sm shrink-0" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Search stocks, ETFs..."
          className="flex-1 bg-transparent text-[#e8e8f0] placeholder-[#44445a] text-sm outline-none min-w-0"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setShowDropdown(false); }}
            className="shrink-0 text-[#8888aa] hover:text-[#e8e8f0] transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xs" />
          </button>
        )}
      </div>

      {(showDropdown || error) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#13131a] border border-[#1e1e2e] rounded-lg shadow-2xl z-50 overflow-hidden">
          {error ? (
            <div className="px-4 py-3 text-[#ff4d6d] text-sm">{error}</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-[#8888aa] text-sm">No results found</div>
          ) : (
            results.map((r) => (
              <button
                key={`${r.symbol}-${r.region}`}
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 hover:bg-[#1a1a24] border-b border-[#1e1e2e] last:border-0 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#e8e8f0] font-semibold text-sm font-mono">{r.symbol}</span>
                    <span className="text-[#44445a] text-xs bg-[#1a1a24] px-1.5 py-0.5 rounded">{r.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#44445a]">
                    <span className="text-xs">{r.region} · {r.currency}</span>
                    <FontAwesomeIcon
                      icon={faPlus}
                      className="text-xs opacity-0 group-hover:opacity-100 text-[#4d9eff] transition-opacity"
                    />
                  </div>
                </div>
                <p className="text-[#8888aa] text-xs mt-0.5 truncate">{r.name}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
