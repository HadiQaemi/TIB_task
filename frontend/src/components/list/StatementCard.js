import { useNavigate } from 'react-router-dom';
import { Card, Col, Row } from 'react-bootstrap';
import ConceptItemsList from "./ConceptItemsList";
import { FaTag, FaUser } from 'react-icons/fa';

// Import the useNavigate hook from the react-router-dom library
const StatementCard = (props) => {
    const { statement, tab } = props
    const navigate = useNavigate();

    const handleStatementClick = (statement) => {
        navigate(`/statement/${statement}`); // Replace with your desired route
    };

    const handlePaperClick = (statement) => {
        navigate(`/paper/${statement}`);
    };
    return (
        <>
            {statement && (
                <div className="bg-light">
                    <Row className="mb-3 statement p-3">
                        <h5 className="statement-title">{statement.content['doi:a72ca256dc49e55a1a57#has_notation']['doi:44164d31a37c28d8efbf#label']}</h5>
                        <Col sm={2}>
                            {statement.author && statement.author.map(function (item, k) {
                                return (
                                    <span key={k} className="badge bg-light me-2 mb-2 text-secondary"><FaUser className='me-1 font-green' />{item.givenName} {item.familyName}</span>
                                )
                            })}
                        </Col>
                        <Col sm={10}>
                            <ConceptItemsList concepts={statement.concepts} />
                        </Col>
                    </Row>
                </div>
            )}
            {/* <Card className="m-2">
                <Card.Body>
                    <Card.Title className="pointer" onClick={() => handleStatementClick(statement._id, tab)}>{statement.label}</Card.Title>
                    <div className="custom-blockquote">
                        <blockquote className="blockquote pointer" onClick={() => handlePaperClick(statement.article.id, tab)}>
                            <Card.Subtitle className="mb-4 mt-3 text-muted">
                                {statement.article.name}
                            </Card.Subtitle>
                            <footer className="blockquote-footer italic">
                                By:
                                {
                                    statement.article.author.map((row, rowIndex) => (
                                        <span key={rowIndex}> {row.givenName} {row.familyName},</span>
                                    ))
                                }
                            </footer>
                        </blockquote>
                    </div>
                    <ConceptItemsList concepts={statement.concepts} />
                </Card.Body>
            </Card> */}
        </>
    );
}
export default StatementCard;