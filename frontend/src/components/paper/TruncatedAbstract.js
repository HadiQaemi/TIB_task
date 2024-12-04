import React, { useState } from 'react';

const TruncatedAbstract = ({ text, maxLength = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  
  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded ? text : text.slice(0, maxLength);
  
  return (
    <div className="space-y-2">
      <p className="text-gray-700 mb-1">
        {displayText}
        {!isExpanded && shouldTruncate && '...'}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-medium show-more-abstract"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

export default TruncatedAbstract;