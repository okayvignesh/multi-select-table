import React, { useState, useEffect, useRef } from 'react';

const MultiSelect = ({
    options,
    selectedValues,
    onChange,
    placeholder = 'Select options',
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [allSelected, setAllSelected] = useState(false);
    const dropdownRef = useRef(null);

    const handleSelect = (e, label) => {
        e.stopPropagation();

        if (label === 'ALL') {
            if (selectedValues.length === options.length) {
                onChange([]);
            } else {
                onChange(options.map((option) => option.id));
            }
        } else {
            const newSelectedValues = selectedValues.includes(label)
                ? selectedValues.filter((v) => v !== label)
                : [...selectedValues, label];
            onChange(newSelectedValues);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setAllSelected(selectedValues.length === options.length);
    }, [selectedValues, options.length]);

    return (
        <div className="dropdown" ref={dropdownRef}>
            <button
                className="form-select"
                type="button"
                data-bs-toggle="dropdown"
                data-bs-auto-close="auto"
                onClick={toggleDropdown}
                aria-expanded={isOpen}>
                {selectedValues.length > 0
                    ? allSelected
                        ? 'ALL'
                        : selectedValues.length > 1
                            ? '[Multiple]'
                            : selectedValues.join(', ')
                    : placeholder
                }
            </button>
            <ul
                className={`dropdown-menu${isOpen ? ' show' : ''}`}
                style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <li>
                    <label
                        className={`dropdown-item ${allSelected ? 'selected' : ''}`}
                        onClick={(e) => handleSelect(e, 'ALL')}>
                        ALL
                    </label>
                </li>
                {options.map((option) => (
                    <li key={option.id}>
                        <label
                            className={`dropdown-item ${selectedValues.includes(option.id) ? 'selected' : ''}`}
                            onClick={(e) => handleSelect(e, option.id)}>
                            {option.label}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MultiSelect;
