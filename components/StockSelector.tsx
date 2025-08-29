
import React, { useState, useEffect } from 'react';
import { Company } from '../types';
import { AVAILABLE_STOCKS } from '../constants';
import { Select } from './ui/Select';
import { useStockSearch } from '../hooks/useStockData';
import { Input } from './ui/Input';

interface StockSelectorProps {
  onStockSelect: (symbol: string | null) => void;
  selectedSymbol: string | null;
  idSuffix?: string; // To make IDs unique if multiple selectors are used
  label?: string;
  placeholder?: string;
}

export const StockSelector: React.FC<StockSelectorProps> = ({ onStockSelect, selectedSymbol, idSuffix = '', label="Select Stock", placeholder="Search or pick a stock..." }) => {
  const { searchResults, search, isSearching } = useStockSearch();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = (symbol: string) => {
    onStockSelect(symbol);
    setSearchTerm(searchResults.find(s => s.symbol === symbol)?.name || '');
    setIsDropdownOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    search(e.target.value);
    setIsDropdownOpen(true);
  }
  
  useEffect(() => {
    // Set initial search term if a stock is pre-selected
    if (selectedSymbol) {
      const stock = AVAILABLE_STOCKS.find(s => s.symbol === selectedSymbol);
      if (stock) setSearchTerm(stock.name);
    } else {
      setSearchTerm(''); // Clear search term if no stock is selected
    }
  }, [selectedSymbol]);


  return (
    <div className="relative w-full">
      {label && <label htmlFor={`stock-search-${idSuffix}`} className="block text-sm font-medium text-neutral-300 mb-1">{label}</label>}
      <Input
        id={`stock-search-${idSuffix}`}
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setIsDropdownOpen(true)}
        // onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)} // Delay to allow click on dropdown
        className="w-full"
      />
      {isDropdownOpen && searchResults.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-neutral-700 border border-neutral-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {isSearching && <li className="px-4 py-2 text-neutral-400">Searching...</li>}
          {!isSearching && searchResults.map((stock) => (
            <li
              key={stock.symbol}
              className={`px-4 py-2 hover:bg-primary-600 cursor-pointer ${selectedSymbol === stock.symbol ? 'bg-primary-700' : ''}`}
              onClick={() => handleSelect(stock.symbol)}
            >
              <div className="flex items-center">
                {stock.logoUrl && <img src={stock.logoUrl} alt={stock.name} className="w-6 h-6 mr-2 rounded-full"/>}
                <span>{stock.name} ({stock.symbol})</span>
              </div>
            </li>
          ))}
          {!isSearching && searchResults.length === 0 && searchTerm && (
             <li className="px-4 py-2 text-neutral-400">No stocks found for "{searchTerm}"</li>
          )}
        </ul>
      )}
    </div>
  );
};
