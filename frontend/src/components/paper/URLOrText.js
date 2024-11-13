import React from 'react';

const URLOrText = ({ content, styles }) => {
    const isURL = (str) => {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    };

    return isURL(content) ? (
        <a href={content} style={styles.linkLabel} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {content}
        </a>
    ) : (
        <>
            <span style={styles.textLabel}>{content}</span>
        </>
    );
};

export default URLOrText;