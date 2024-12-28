import React, { useState, useEffect, useRef } from 'react';
import { Popover, OverlayTrigger, Button } from 'react-bootstrap';
import { X } from 'lucide-react';

const CustomPopover = ({
  id,
  title,
  subTitle,
  children,
  trigger,
  show,
  onToggle,
  placement = "bottom",
  icon: Icon,
  onSelect,
}) => {
  const popover = (
    <Popover id={id} className="popover-width">
      <Popover.Header as="h3" className="title flex items-center justify-between bg-gray-50">
        <span>{Icon && <Icon className='color-gray' />} {title}</span>
        <Button
          variant="link"
          className="p-0 text-gray-600 hover:text-gray-900"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(false);
          }}
        >
          <X size={20} />
        </Button>
      </Popover.Header>
      <Popover.Body>
        <a href="#" onClick={onSelect} className='color-gray text-none-underline'>{subTitle}<span className='color-coral text-underline'>{title}</span></a>
        {children}
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement={placement}
      show={show}
      overlay={popover}
      rootClose
    >
      {trigger}
    </OverlayTrigger>
  );
};

export default CustomPopover;