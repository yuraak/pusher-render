import React from 'react';
import { useLocation } from 'react-router-dom';

const HistoryWrapper = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const url = queryParams.get('url');

    if (!url) {
        return <div>No URL provided</div>;
    }

    return (
        <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
            <iframe
                src={url}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="History URL"
            ></iframe>
        </div>
    );
};

export default HistoryWrapper;