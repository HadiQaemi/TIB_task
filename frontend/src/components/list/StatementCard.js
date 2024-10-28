import { Col, Row } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import StatementPredicate from "./StatementPredicate";
import { Card, Badge } from 'react-bootstrap';

// Import the useNavigate hook from the react-router-dom library
const StatementCard = (props) => {
    const { info, entity, author, title, contribution, tab } = props
    const navigate = useNavigate();

    const handleCardClick = (paper, tab) => {
        navigate(`/statement/${paper}/${tab}`); // Replace with your desired route
    };

    function analyzeJSONStructure(jsonElement) {
        // Check if the input is not an object or is null
        if (typeof jsonElement !== 'object' || jsonElement === null) {
            return "The input is not a JSON object";
        }

        // Check if it's an array
        if (Array.isArray(jsonElement)) {
            // Check if it's an empty array
            if (jsonElement.length === 0) {
                return "Empty array";
            }

            // Check if all elements are objects
            const allObjects = jsonElement.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));

            if (allObjects) {
                return "Array of objects";
            } else {
                return "Array of mixed types";
            }
        } else {
            // It's an object, so we'll check its structure
            const keys = Object.keys(jsonElement);

            // Check if it's an empty object
            if (keys.length === 0) {
                return "Empty object";
            }

            // Check if all values are primitive (not objects or arrays)
            const allPrimitive = Object.values(jsonElement).every(value =>
                typeof value !== 'object' || value === null
            );

            if (allPrimitive) {
                return "Key-value pairs";
            } else {
                return "Object with mixed value types";
            }
        }
    }
    return (
        <>
            <Card className="m-2">
                <Card.Body className="pointer" onClick={() => handleCardClick(title, tab)}>
                    <Card.Title>{contribution["label"]}</Card.Title>
                    <blockquote className="blockquote mb-3">
                        <Card.Subtitle className="mb-4 mt-3 text-muted">
                            {info['title']}
                        </Card.Subtitle>
                        <footer className="blockquote-footer italic">
                            By:
                            {
                                analyzeJSONStructure(info) === 'Object with mixed value types' && (
                                    info['author'].map((row, rowIndex) => (
                                        <span key={rowIndex}> {row},</span>
                                    ))
                                )
                            }
                            {
                                analyzeJSONStructure(info) === 'The input is not a JSON object' && (
                                    <span> {author}</span>
                                )
                            }
                        </footer>
                    </blockquote>
                    <StatementPredicate obj={contribution} />
                </Card.Body>
            </Card>
        </>
    );
}
export default StatementCard;