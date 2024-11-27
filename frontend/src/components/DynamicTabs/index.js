import React, {useState, useRef, useEffect, useLayoutEffect} from 'react';

import defaultComponents from './components';
import useOnClickOutside from './useOnClickOutside';

export default function DynamicTabs({children, components = {}, ...props}) {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [visibleTabIndices, setVisibleTabIndices] = useState([]);
    const [measuringRender, setMeasuringRender] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const overflowRef = useRef(null);

    useEffect(() => {
        setIsMounted(true);
        setMeasuringRender(true);
    }, []);

    useLayoutEffect(() => {
        if (measuringRender) {
            const tabElements = Array.from(containerRef.current.children);

            let stopWidth = 0;
            const visible = [];
            tabElements.forEach((tab, index) => {
                if (visible.length === tabElements.length - 1) {
                    stopWidth -= buttonRef.current.offsetWidth;
                }

                stopWidth += tab.offsetWidth;
                if (containerRef.current.offsetWidth >= stopWidth) {
                    visible.push(index);
                }
            });
            setVisibleTabIndices(visible);
            setMeasuringRender(false);
        }
    }, [measuringRender]);

    useOnClickOutside(overflowRef, () => {
        setMenuIsOpen(false);
    });

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                setMenuIsOpen(false);
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return function cleanUp() {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        function handleResize() {
            setMeasuringRender(true);
            setMenuIsOpen(false);
        }
        window.addEventListener('resize', handleResize);
        return function cleanUp() {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        setMeasuringRender(true);
    }, [children]);

    const allTabs = React.Children.map(children, (tab, index) => {
        return React.cloneElement(tab, {
            key: index,
        });
    });

    let visibleTabs = [];
    const overflowTabs = [];
    if (!isMounted || measuringRender) {
        visibleTabs = allTabs;
    } else {
        allTabs.forEach((tab, index) => {
            if (visibleTabIndices.includes(index)) {
                visibleTabs.push(tab);
            } else {
                overflowTabs.push(tab);
            }
        });
    }

    const {Container, TabContainer, MenuContainer, MenuButton, Menu} = {
        ...defaultComponents,
        ...components,
    };

    return (
        <Container
            innerProps={{
                ...props,
                style: {...props.style, display: 'flex'},
            }}
        >
            <TabContainer innerRef={containerRef}>{visibleTabs}</TabContainer>

            {(measuringRender || overflowTabs.length > 0) && (
                <MenuContainer innerRef={overflowRef}>
                    <MenuButton
                        innerRef={buttonRef}
                        menuIsOpen={menuIsOpen}
                        innerProps={{
                            onClick: () => setMenuIsOpen(!menuIsOpen),
                            'aria-haspopup': true,
                            'aria-expanded': menuIsOpen,
                        }}
                    />
                    {menuIsOpen && <Menu>{overflowTabs}</Menu>}
                </MenuContainer>
            )}
        </Container>
    );
}