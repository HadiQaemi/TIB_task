import React, { useState } from 'react';
import { Badge, Popover, OverlayTrigger, Button } from 'react-bootstrap';
import { X } from 'lucide-react';

const ConceptItemsList = ({concepts}) => {
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
          <div key={index} className="inline-block m-1">
            {item.identifier.length > 0 ? (
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                show={activePopover === item.label}
                overlay={renderPopover(item.identifier, item.label)}
                onToggle={() => handleClick(item.label, item.identifier)}
                rootClose
              >
                <Badge
                  bg="primary"
                  className="pointer px-3 py-2 text-sm hover:bg-blue-600 transition-colors duration-200"
                >
                  {item.label}
                </Badge>
              </OverlayTrigger>
            ) : (
              <Badge
                bg="secondary"
                className="px-3 py-2 text-sm"
              >
                {item.label}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConceptItemsList;