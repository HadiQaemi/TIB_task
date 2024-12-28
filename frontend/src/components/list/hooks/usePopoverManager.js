import { useState, useEffect, useRef } from 'react';

export const usePopoverManager = () => {
  const [activePopover, setActivePopover] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActivePopover(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handlePopoverToggle = (id, shouldShow) => {
    setActivePopover(shouldShow ? id : null);
  };

  return {
    activePopover,
    containerRef,
    handlePopoverToggle
  };
};