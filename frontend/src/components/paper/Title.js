import { Button, ButtonGroup, Container, Dropdown, Navbar } from 'react-bootstrap';

export default function NavTitle({ title, dropdown }) {
    return (
        <Navbar>
            <Container>
                <Navbar.Brand href="#home">{title}</Navbar.Brand>
                <Navbar.Toggle />
                {dropdown && (
                    <Navbar.Collapse className="justify-content-end">
                        <Dropdown as={ButtonGroup}>
                            <Button variant="secondary">Export citations</Button>
                            <Dropdown.Toggle variant="secondary" id="dropdown-custom-2" />
                            <Dropdown.Menu className="super-colors">
                                <Dropdown.Item eventKey="1">Action</Dropdown.Item>
                                <Dropdown.Item eventKey="2">Another action</Dropdown.Item>
                                <Dropdown.Item eventKey="3" active>
                                    Active Item
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item eventKey="4">Separated link</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Navbar.Collapse>
                )}
            </Container>
        </Navbar>
    )
}
