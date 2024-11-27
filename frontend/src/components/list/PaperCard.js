import { Col, Row } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
const PaperCard = (props) => {
    const { info, entity, author, title } = props
    const navigate = useNavigate();

    const handleCardClick = (cardId) => {
        navigate(`/paper/${cardId}`);
    };

    function truncateString(str, maxLength) {
        return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
    }
    return (
        <>
            <Row className="align-items-center py-3">
                {
                    typeof info === 'string' ? (
                        <Col xs={12}>
                            <h5 className="mb-0 pointer" onClick={() => handleCardClick(title)}>{title}</h5>
                        </Col>
                    ) : (
                        <Col xs={12}>
                            <h5 className="mb-0 pointer" onClick={() => handleCardClick(title)}>{info["title"]}</h5>
                            <span className="mt-2 mb-0 abstract">{truncateString(info["abstract"], 600)}</span>
                        </Col>
                    )
                }
            </Row>
            <Row className="align-items-center border-bottom mb-2 list">
                <Col xs={12} className="mt-0 mb-2">
                    {
                        typeof info === 'string' ? (
                            <span className="authors">
                                Authers:
                                <span>{author}</span>
                            </span>
                        ) : (
                            <span className="authors">
                                Authers:
                                {info["author"].map((row, rowIndex) => (
                                    <span key={rowIndex}>{row}</span>
                                ))}
                            </span>
                        )
                    }
                </Col>
            </Row>
        </>
    );
}
export default PaperCard;