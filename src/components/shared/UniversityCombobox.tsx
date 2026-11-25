"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, ChevronDown, X, Check, Landmark, Award, MapPin } from "lucide-react";
import { UniversityBadge } from "./UniversityLogo";

export interface UniversityOption {
  id: string;
  name: string;
  country: string;
  city?: string;
  qsRankDisplay?: string;
  tuitionFeeFormatted?: string;
  currency?: string;
}

export interface UniversityComboboxProps {
  universities: UniversityOption[];
  value: string; // Selected university name or ID
  onChange: (universityName: string) => void;
  disabled?: boolean;
  placeholder?: string;
  disabledPlaceholder?: string;
  required?: boolean;
  className?: string;
}

/**
 * UniversityCombobox: Searchable, typeahead university selector.
 * Allows typing to search and filter universities in real-time,
 * keeping the typed query clearly visible with live feedback.
 */
export function UniversityCombobox({
  universities,
  value,
  onChange,
  disabled = false,
  placeholder = "Type to search university (e.g. Oxford, Manchester, Heriot)...",
  disabledPlaceholder = "-- Select Country First --",
  required = false,
  className = "",
}: UniversityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync internal searchTerm with external value prop
  useEffect(() => {
    if (value) {
      const match = universities.find(
        (u) => u.name.toLowerCase() === value.toLowerCase() || u.id === value
      );
      setSearchTerm(match ? match.name : value);
    } else {
      setSearchTerm("");
    }
  }, [value, universities]);

  // Real-time filtered universities
  const filteredUniversities = useMemo(() => {
    if (!searchTerm.trim()) {
      return universities;
    }
    const query = searchTerm.toLowerCase().trim();
    return universities.filter((u) => {
      const nameMatch = u.name.toLowerCase().includes(query);
      const cityMatch = (u.city || "").toLowerCase().includes(query);
      const countryMatch = (u.country || "").toLowerCase().includes(query);
      const rankMatch = (u.qsRankDisplay || "").toLowerCase().includes(query);
      return nameMatch || cityMatch || countryMatch || rankMatch;
    });
  }, [universities, searchTerm]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // If closed without selection, restore selected value text or clear
        if (value) {
          const match = universities.find(
            (u) => u.name.toLowerCase() === value.toLowerCase() || u.id === value
          );
          setSearchTerm(match ? match.name : value);
        } else {
          setSearchTerm("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [value, universities]);

  // Keep highlighted item visible when navigating with keyboard
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (uni: UniversityOption) => {
    onChange(uni.name);
    setSearchTerm(uni.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
    setHighlightedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredUniversities.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredUniversities.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < filteredUniversities.length
      ) {
        handleSelect(filteredUniversities[highlightedIndex]);
      } else if (filteredUniversities.length === 1) {
        handleSelect(filteredUniversities[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Helper to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-amber-100 text-amber-900 rounded-xs px-0.5 font-bold"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Searchable Input Field */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none shrink-0" />
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          required={required && !value}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? disabledPlaceholder : placeholder}
          className={`w-full pl-9 pr-16 py-2.5 border rounded-xl text-xs font-semibold outline-none transition-all ${
            disabled
              ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed placeholder:text-slate-400"
              : isOpen
              ? "bg-white text-slate-900 border-[#253775] ring-2 ring-[#253775]/20 shadow-xs"
              : value
              ? "bg-white text-slate-900 border-slate-300 hover:border-slate-400"
              : "bg-white text-slate-800 border-slate-300 placeholder:text-slate-400 hover:border-slate-400"
          }`}
        />

        {/* Action icons right: Clear button & Dropdown toggle */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear university"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen);
                if (!isOpen && inputRef.current) {
                  inputRef.current.focus();
                }
              }
            }}
            className={`p-1 text-slate-400 hover:text-slate-700 rounded-md transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#253775]" : ""
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Filtered Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Header indicator: Displays what the user is typing in real-time */}
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5 truncate">
              {searchTerm.trim() ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0"></span>
                  <span className="text-slate-500">Searching:</span>
                  <span className="font-bold text-[#253775] truncate">
                    &ldquo;{searchTerm}&rdquo;
                  </span>
                </>
              ) : (
                <span className="text-slate-500">
                  Select or type university name:
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 font-bold shrink-0">
              {filteredUniversities.length}{" "}
              {filteredUniversities.length === 1 ? "university" : "universities"}
            </span>
          </div>

          {/* List of matching universities */}
          <ul
            ref={listRef}
            className="max-h-60 overflow-y-auto divide-y divide-slate-100 focus:outline-none"
            role="listbox"
          >
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((uni, index) => {
                const isSelected =
                  value &&
                  (uni.name.toLowerCase() === value.toLowerCase() ||
                    uni.id === value);
                const isHighlighted = highlightedIndex === index;

                return (
                  <li
                    key={uni.id || uni.name}
                    role="option"
                    aria-selected={isSelected ? true : false}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(uni)}
                    className={`px-3 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isHighlighted
                        ? "bg-blue-50/80 text-[#253775]"
                        : isSelected
                        ? "bg-indigo-50/50 text-[#253775]"
                        : "hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Crest Badge */}
                      <UniversityBadge
                        name={uni.name}
                        country={uni.country}
                        size="xs"
                        showCountryFlag
                      />

                      <div className="min-w-0">
                        {/* University Name with Highlight */}
                        <div className="text-xs font-bold leading-snug truncate">
                          {highlightMatch(uni.name, searchTerm)}
                        </div>

                        {/* Location & Meta */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                          {uni.city && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              {uni.city}
                            </span>
                          )}
                          {uni.qsRankDisplay && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[9px]">
                              <Award className="w-2.5 h-2.5" />
                              QS {uni.qsRankDisplay}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Checkmark if selected */}
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#253775] shrink-0 font-bold" />
                    )}
                  </li>
                );
              })
            ) : (
              <div className="p-4 text-center">
                <Landmark className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">
                  No universities match &ldquo;{searchTerm}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Check your spelling or choose from all {universities.length} universities.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setHighlightedIndex(-1);
                    if (inputRef.current) inputRef.current.focus();
                  }}
                  className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <X className="w-3 h-3" /> Clear Search
                </button>
              </div>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
