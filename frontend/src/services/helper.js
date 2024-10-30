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
            // 'P117003': { backgroundColor: '#1ABC9C', color: '#ffffff' },
            'P135053': { backgroundColor: '#8E44AD', color: '#ffffff' },
            // 'P135054': { backgroundColor: '#D35400', color: '#ffffff' },
            'P135055': { backgroundColor: '#2C3E50', color: '#ffffff' },
            'P135056': { backgroundColor: '#7F8C8D', color: '#ffffff' },
            'P4015': { backgroundColor: '#16A085', color: '#ffffff' },
            // 'P149023': { backgroundColor: '#C0392B', color: '#ffffff' },
            'P4003': { backgroundColor: '#27AE60', color: '#ffffff' }
        };
        if (typeof colorMap[key] !== 'object')
            return orginal;
        else
            if (part === "all")
                return colorMap[key];
            else if (typeof colorMap[key] == 'object')
                return colorMap[key].backgroundColor;
        // return helper.adjustColorOpacity(colorMap[key].backgroundColor);
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
        width: '100%',
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
    },
    linkLabel: {
        color: 'rgb(15 74 161)',
    },
    nodeLabel: {
        color: '#555',
        fontSize: 'smaller',
        fontWeight: '100',
    },
};
