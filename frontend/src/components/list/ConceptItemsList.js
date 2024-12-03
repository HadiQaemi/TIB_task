import React from 'react';
import { FaTag } from 'react-icons/fa';
import CustomPopover from './CustomPopover';
import { usePopoverManager } from './hooks/usePopoverManager';

const ConceptItemsList = ({ concepts, onConceptSelect }) => {
  const { activePopover, containerRef, handlePopoverToggle } = usePopoverManager();

  const renderIdentifiersList = (identifiers) => (
    <>
      {identifiers.length > 0 && <div className='mt-2'>See also</div>}
      {
        identifiers.map((id, index) => (
          <div key={index} className="mb-1 p-3 pt-0 pb-0">
            <a
              href={id}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 break-all"
              onClick={(e) => {
                if (e.target.closest('.overlay-trigger')) {
                  e.stopPropagation();
                  handlePopoverToggle(null, false);
                }
              }}
            >
              {id}
            </a>
          </div>
        ))
      }
    </>
  );

  return (
    <div className="p-6" ref={containerRef}>
      <div className="flex flex-wrap gap-3">
        {concepts.map((item, index) => (
          <div key={index} className="inline-block m-1 concepts">
            {item.identifier.length > 0 ? (
              <CustomPopover
                id={`popover-${item.label}`}
                subTitle='Show content in '
                title={`${item.label}`}
                show={activePopover === item.label}
                onToggle={(show) => handlePopoverToggle(item.label, show)}
                icon={FaTag}
                onSelect={() => onConceptSelect(item)}
                trigger={
                  <span
                    className="badge bg-light me-2 mb-2 text-secondary text-underline pointer overlay-trigger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePopoverToggle(item.label, activePopover !== item.label);
                    }}
                  >
                    <FaTag className="me-1 font-red" />{item.label}
                  </span>
                }
              >
                {renderIdentifiersList(item.identifier)}
              </CustomPopover>
            ) : (
              <CustomPopover
                id={`popover-${item.label}`}
                subTitle='Show content in '
                title={`${item.label}`}
                show={activePopover === item.label}
                onToggle={(show) => handlePopoverToggle(item.label, show)}
                trigger={
                  <span
                    className="badge bg-light me-2 mb-2 text-secondary pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePopoverToggle(item.label, activePopover !== item.label);
                    }}
                  >
                    <FaTag className="me-1 font-red" />{item.label}
                  </span>
                }
              >
                {renderIdentifiersList(item.identifier)}
              </CustomPopover>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConceptItemsList;