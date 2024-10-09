import React from 'react';
import { css } from 'emotion';
import classNames from 'classnames';
import { FaAngleDoubleDown } from "react-icons/fa";

export function Container({ children, innerProps }) {
    return <div {...innerProps}>{children}</div>;
}

export function TabContainer({ innerRef, children, innerProps }) {
    return (
        <div className={css`width: 100%; border-top-right-radius: 10px; border-top-left-radius: 10px;`} ref={innerRef} {...innerProps}>
            {children}
        </div>
    );
}

export function MenuContainer({ innerRef, children, innerProps }) {
    return (
        <div
            className="more-tab"
            ref={innerRef}
            {...innerProps}
        >
            {children}
        </div>
    );
}

export function MenuButton({ menuIsOpen, innerProps, innerRef }) {
    return (
        <button
            className={classNames({
                [css`
                    font-weight: bold;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    padding: 0.5em;
                    background: #fff;
                    border: 1px solid #dfdfdf;
                    border-top-right-radius: 10px;
                    &:hover {
                        background: #fff;
                    }
                `]: true,
                [css`
                    background: #fff;
                    border: 1px solid #dfdfdf;
                    border-top-right-radius: 10px;
                    &:hover {
                        background: #fff;
                    }
                `]: menuIsOpen,
            })}
            ref={innerRef}
            title="More"
            aria-label="More"
            {...innerProps}
        >
            <FaAngleDoubleDown />
        </button>
    );
}

export function Menu({ children, innerProps }) {
    return (
        <div
            className={css`
                position: absolute;
                top: 100%;
                right: 0;
                background: #fff;
                box-shadow: 0px 0px 10px 1px hsla(0, 0%, 0%, 0.2);
                max-width: 400px;
                overflow: scroll;
                max-height: 300px;
            `}
            {...innerProps}
        >
            {children}
        </div>
    );
}

export default { Container, TabContainer, MenuContainer, MenuButton, Menu, };