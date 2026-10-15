import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck, FaEdit } from 'react-icons/fa';
import { useNode } from '../context/NodeContext';
import nodeApi from '../api/nodeApi';
import { NODES } from '../config/nodes';

const normalizeUrl = (url) => {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '');
};

const PRESET_NODES = NODES.map(node => ({
  label: node.label,
  value: normalizeUrl(node.url),
}));

export default function NodeSelector() {
  const { nodeUrl, setNodeUrl, error } = useNode();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(nodeUrl);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setInputValue(nodeUrl);
  }, [nodeUrl]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSelect = (value) => {
    setNodeUrl(value);
    setIsOpen(false);
    setIsEditing(false);
  };

  const handleEditSubmit = () => {
    if (inputValue.trim()) {
      setNodeUrl(inputValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setInputValue(nodeUrl);
      setIsEditing(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/50 backdrop-blur-md cursor-pointer hover:border-primary/70 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent text-sm text-white outline-none border-b border-primary/50"
              placeholder="host:port"
            />
          ) : (
            <span className="text-sm text-white/70">Node:</span>
          )}
          {!isEditing && (
            <span className="ml-2 text-sm text-white font-medium">{nodeUrl}</span>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 hover:text-primary transition-colors"
          >
            <FaEdit size={14} />
          </button>
        )}
        <FaChevronDown
          size={14}
          className={`text-white/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {error && (
        <p className="text-xs text-error mt-1">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-2 left-0 w-full bg-black border border-primary/50 rounded-lg overflow-hidden">
          {PRESET_NODES.map((node) => (
            <div
              key={node.value}
              className="p-3 hover:bg-white/10 cursor-pointer flex items-center justify-between transition-colors"
              onClick={() => handleSelect(node.value)}
            >
              <span className="text-sm text-white">{node.label}</span>
              {nodeUrl === node.value && (
                <FaCheck size={14} className="text-primary" />
              )}
            </div>
          ))}
          <div className="border-t border-white/20">
            <div
              className="p-3 hover:bg-white/10 cursor-pointer text-sm text-white/70 transition-colors"
              onClick={() => {
                setIsOpen(false);
                setIsEditing(true);
              }}
            >
              Custom node...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}