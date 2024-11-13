import { useNavigate } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import ConceptItemsList from "./ConceptItemsList";

// Import the useNavigate hook from the react-router-dom library
const StatementCard = (props) => {
    const { statement, tab } = props
    const navigate = useNavigate();

    const handleStatementClick = (statement, tab) => {
        navigate(`/statement/${statement}`); // Replace with your desired route
    };

    const handlePaperClick = (statement, tab) => {
        navigate(`/paper/${statement}`); // Replace with your desired route
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
            </Card>
        </>
    );
}
export default StatementCard;