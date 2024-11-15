import React, { useState } from 'react';
import { Badge, Popover, OverlayTrigger, Button } from 'react-bootstrap';
import { X } from 'lucide-react';
import { FaTag } from 'react-icons/fa';

const ConceptItemsList = ({ concepts }) => {
  const [activePopover, setActivePopover] = useState(null);

  const renderPopover = (identifiers, label) => (
    <Popover id={`popover-${label}`} className="popover-width">
      <Popover.Header as="h3" className="title flex items-center justify-between bg-gray-50">
        <span>Identifiers for {label}</span>
        <Button
          variant="link"
          className="p-0 text-gray-600 hover:text-gray-900"
          onClick={() => setActivePopover(null)}
        >
          <X size={20} />
        </Button>
      </Popover.Header>
      <Popover.Body>
        {identifiers.map((id, index) => (
          <div key={index} className="mb-3 last:mb-0">
            <a
              href={id}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline break-all"
            >
              {id}
            </a>
          </div>
        ))}
      </Popover.Body>
    </Popover>
  );

  const handleClick = (label, identifiers) => {
    if (identifiers.length > 0) {
      setActivePopover(label);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap gap-3">
        {concepts.map((item, index) => (
          <div key={index} className="inline-block m-1 concepts">
            {item.identifier.length > 0 ? (
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                show={activePopover === item.label}
                overlay={renderPopover(item.identifier, item.label)}
                onToggle={() => handleClick(item.label, item.identifier)}
                rootClose
              >
                <span key={index} className="badge bg-light me-2 mb-2 text-secondary text-underline pointer"><FaTag className='me-1 font-red' />{item.label}</span>
              </OverlayTrigger>
            ) : (
              <span key={index} className="badge bg-light me-2 mb-2 text-secondary"><FaTag className='me-1 font-red' />{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConceptItemsList;