export const helper = {
    getPredicateStyle: (key, orginal = "", part = "all") => {
        const colorMap = {
            'P117001': { backgroundColor: '#FF6B6B', color: '#ffffff' },
            'P117002': { backgroundColor: '#e33232', color: '#ffffff' },
            'P1005': { backgroundColor: '#a33232', color: '#ffffff' },
            'P71164': { backgroundColor: '#4ECDC4', color: '#ffffff' },
            'P149023': { backgroundColor: '#45B7D1', color: '#ffffff' },
            'P71163': { backgroundColor: '#96CEB4', color: '#000000' },
            'P135054': { backgroundColor: '#FFEEAD', color: '#000000' },
            'P117003': { backgroundColor: '#D4A5A5', color: '#ffffff' },
            'P71162': { backgroundColor: '#9B59B6', color: '#ffffff' },
            'P1004': { backgroundColor: '#3498DB', color: '#ffffff' },
            'P4077': { backgroundColor: '#E67E22', color: '#ffffff' },
            'P32': { backgroundColor: '#2ECC71', color: '#ffffff' },
            'PWC_HAS_BENCHMARK': { backgroundColor: '#E74C3C', color: '#ffffff' },
            'P110081': { backgroundColor: '#F1C40F', color: '#000000' },
            'P135053': { backgroundColor: '#8E44AD', color: '#ffffff' },
            'P135055': { backgroundColor: '#2C3E50', color: '#ffffff' },
            'P135056': { backgroundColor: '#7F8C8D', color: '#ffffff' },
            'P4015': { backgroundColor: '#16A085', color: '#ffffff' },
            'P4003': { backgroundColor: '#27AE60', color: '#ffffff' }
        };
        if (typeof colorMap[key] !== 'object')
            return orginal;
        else
            if (part === "all")
                return colorMap[key];
            else if (typeof colorMap[key] == 'object')
                return colorMap[key].backgroundColor;
    },
    analyzeJSONStructure: (jsonElement) => {
        if (typeof jsonElement !== 'object' || jsonElement === null) {
            return "The input is not a JSON object";
        }

        if (Array.isArray(jsonElement)) {
            if (jsonElement.length === 0) {
                return "Empty array";
            }

            const allObjects = jsonElement.every(item => typeof item === 'object' && item !== null && !Array.isArray(item));

            if (allObjects) {
                return "Array of objects";
            } else {
                return "Array of mixed types";
            }
        } else {
            const keys = Object.keys(jsonElement);

            if (keys.length === 0) {
                return "Empty object";
            }
            const allPrimitive = Object.values(jsonElement).every(value =>
                typeof value !== 'object' || value === null
            );

            if (allPrimitive) {
                return "Key-value pairs";
            } else {
                return "Object with mixed value types";
            }
        }
    },
    validURL: (str) => {
        if (typeof str !== 'string') {
            return false;
        }

        const urlPattern = new RegExp(
            '^' +
            '(?:(?:https?|ftp)://)?' +
            '(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
            '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
            '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
            '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
            '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
            '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
            '|' +
            '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
            '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
            '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
            ')' +
            '(?::\\d{2,5})?' +
            '(?:[/?#][^\\s]*)?$',
            'i'
        );

        try {
            if (!urlPattern.test(str)) {
                return false;
            }

            new URL(str.startsWith('http') ? str : `http://${str}`);
            return true;
        } catch (err) {
            return false;
        }
    },
    isFileURL: (url) => {
        const validExtensions = {
            images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
            sourceCode: ['.r', '.py']
        };

        try {
            const urlObject = new URL(url);
            if (!['http:', 'https:'].includes(urlObject.protocol)) {
                return {
                    isValid: false,
                    reason: 'Invalid protocol. URL must use HTTP or HTTPS'
                };
            }
            const pathname = urlObject.pathname.toLowerCase();
            const extension = pathname.substring(pathname.lastIndexOf('.'));
            const isImage = validExtensions.images.includes(extension);
            const isSourceCode = validExtensions.sourceCode.includes(extension);

            if (!isImage && !isSourceCode) {
                return {
                    isValid: true,
                    fileType: 'string',
                    extension: extension
                };
            }
            return {
                isValid: true,
                fileType: isImage ? 'image' : 'sourceCode',
                extension: extension
            };

        } catch (error) {
            return {
                isValid: false,
                reason: 'Invalid URL format'
            };
        }
    },
    getLevelColor: (level) => {
        const colors = [
            '#ffffff',
            '#f8f9fa',
            '#f1f3f5',
            '#e9ecef',
            '#dee2e6',
            '#ced4da',
            '#adb5bd',
            '#868e96',
            '#495057',
            '#343a40',
        ];
        return colors[level % colors.length];
    },
    checkType: (key, data, key_data) => {
        let newKey = ''
        let newType = ''
        if (key === undefined || data === undefined || data['@type'] === undefined)
            return false
        if (data[data['@type'] + '#' + key] === undefined) {
            newKey = data['@type'].replace('doi:', 'doi:21.T11969/') + '#' + key
            newType = data['@type'].replace('doi:', 'doi:21.T11969/')
        } else {
            newKey = data['@type'] + '#' + key
            newType = data['@type']
        }
        if (key_data)
            return data[newKey]
        return newKey
    },
    capitalizeFirstLetter: (val) => {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1).toLowerCase();
    },
    cleanFirstLetter: (val) => {
        return String(val).replace('_', ' ');
    },
    newGetLevelColor: (color, level) => {
        return helper.adjustColorOpacity(color, (level + 1) * 0.05);
    },
    adjustColorOpacity: (hex, opacity = 0.1) => {
        if (hex !== undefined) {
            hex = hex.replace('#', '');

            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            const validOpacity = Math.max(0, Math.min(1, opacity));

            return `rgba(${r}, ${g}, ${b}, ${validOpacity})`;
        }
    },
}

export const styles = {
    container: {
        width: '100%',
        margin: '20px 0',
        fontFamily: 'Arial, sans-serif',
    },
    tabContainer: {
        display: 'flex',
        borderBottom: '1px solid #ccc',
        marginBottom: '20px',
        position: 'relative',
        width: '100%',
    },
    tabList: {
        display: 'flex',
        flex: 1,
        width: '100%',
        overflow: 'hidden',
    },
    tab: {
        flex: 1,
        padding: '10px 20px',
        cursor: 'pointer',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ccc',
        borderBottom: 'none',
        marginRight: '1px',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabText: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '100%',
    },
    lastTab: {
        marginRight: 0,
    },
    activeTab: {
        backgroundColor: '#fff',
        borderBottom: '1px solid #fff',
        marginBottom: '-1px',
    },
    moreButton: {
        padding: '10px 20px',
        cursor: 'pointer',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ccc',
        borderBottom: 'none',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        position: 'relative',
        minWidth: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        maxHeight: '300px',
        overflowY: 'auto',
        minWidth: '200px',
    },
    dropdownItem: {
        padding: '10px 20px',
        cursor: 'pointer',
        borderBottom: '1px solid #eee',
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    treeContainer: {
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '20px',
        margin: '0px 20px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
    },
    treeNode: {
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '5px',
        margin: '5px 0px',
    },
    label: {
        fontWeight: '600',
    },
    nodeContent: {
        paddingLeft: '20px',
    },
    nodeRow: {
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
    },
    toggleButton: {
        width: '20px',
        height: '20px',
        marginRight: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#666',
    },
    keyName: {
        fontWeight: 'bold',
        marginRight: '8px',
    },
    valueText: {
        color: '#444',
        width: '100%',
    },
    activeDropdownItem: {
        backgroundColor: '#f0f0f0',
    },
    codeBlock: {
        backgroundColor: '#f4f4f4',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '10px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        fontSize: '14px',
        width: '100%',
    },
    codePre: {
        width: '100%',
        maxHeight: '500px',
        overflow: 'scroll',
        color: '#000',
    },
    image: {
        maxWidth: '100%',
        maxHeight: '500px',
        height: 'auto',
        margin: '10px',
    },
    loadingSpinner: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100px',
    },
    redColor: {
        backgroundColor: 'rgb(255, 100, 100)',
        borderColor: 'rgb(255, 100, 100)',
    },
    textLabel: {
        color: '#000',
        width: '90%',
        display: 'inline-block',
    },
    buttonLabel: {
        padding: '5px',
        border: '1px solid #555',
        borderRadius: '5px',
        margin: '0px 10px',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        color: "#fff",
        fontWeight: "400"
    },
    linkLabel: {
        color: 'rgb(15 74 161)',
        fontWeight: '800',
    },
    nodeLabel: {
        color: '#555',
        fontSize: 'smaller',
        fontWeight: '100',
    },
};
