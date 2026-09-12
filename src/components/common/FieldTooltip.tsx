import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import './FieldTooltip.css';

interface FieldTooltipProps {
  content: string;
  id?: string;
}

export const FieldTooltip: React.FC<FieldTooltipProps> = ({ content, id }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="tooltip-container">
      <button
        type="button"
        className="tooltip-trigger"
        aria-label="More information"
        aria-describedby={id}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        <HelpCircle size={14} aria-hidden="true" />
      </button>

      {isVisible && (
        <span role="tooltip" id={id} className="tooltip-bubble">
          {content}
        </span>
      )}
    </span>
  );
};
