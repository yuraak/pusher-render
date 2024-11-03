import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Checkbox, FormControlLabel, Paper, Box, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import queryString from 'query-string';

const DGHStaticMain = () => {
    const [baseUrl, setBaseUrl] = useState('');
    const [selectedParams, setSelectedParams] = useState({
        playerId: false,
        skinId: false,
        gameId: false,
        gameCycleId: false,
        gameCycleFinishDateTime: false,
        localeCode: false,
    });
    const [paramValues, setParamValues] = useState({
        playerId: { name: '', value: '' },
        skinId: { name: '', value: '' },
        gameId: { name: '', value: '' },
        gameCycleId: { name: '', value: '' },
        gameCycleFinishDateTime: { name: '', value: '' },
        localeCode: { name: '', value: '' },
    });
    const [urlPreview, setUrlPreview] = useState('');
    const [history, setHistory] = useState([]);

    const handleBaseUrlChange = (e) => {
        setBaseUrl(e.target.value);
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setSelectedParams((prev) => ({ ...prev, [name]: checked }));
    };

    const handleParamChange = (e, param, field) => {
        const { value } = e.target;
        setParamValues((prev) => ({
            ...prev,
            [param]: {
                ...prev[param],
                [field]: value,
            },
        }));
    };

    useEffect(() => {
        const queryParams = {};
        Object.keys(selectedParams).forEach((param) => {
            if (selectedParams[param]) {
                const paramName = paramValues[param].name || param;
                const paramValue = paramValues[param].value;
                queryParams[paramName] = paramValue;
            }
        });

        const queryStringified = queryString.stringify(queryParams);
        const completeUrl = baseUrl.includes('?')
            ? `${baseUrl}&${queryStringified}`
            : `${baseUrl}?${queryStringified}`;
        setUrlPreview(completeUrl);
    }, [baseUrl, selectedParams, paramValues]);

    const openUrlInIframe = () => {
        if (urlPreview) {
            window.open(urlPreview, '_blank', 'noopener,noreferrer');
            setHistory((prev) => [urlPreview, ...prev.slice(0, 9)]);
        }
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <Container>
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="20px">
                <Typography variant="h4" gutterBottom>DGH Pusher / Static Approach</Typography>
                <Box>
                    <Button component={Link} to="/dynamic" variant="outlined" color="primary" style={{ marginRight: '10px' }}>
                        Dynamic Approach
                    </Button>
                    <Button component={Link} to="/" variant="outlined" color="secondary">
                        Home
                    </Button>
                </Box>
            </Box>
            <TextField
                label="Base URL"
                value={baseUrl}
                onChange={handleBaseUrlChange}
                variant="outlined"
                fullWidth
                style={{ marginBottom: '20px' }}
            />
            <Grid container spacing={2}>
                {Object.keys(selectedParams).map((param) => (
                    <React.Fragment key={param}>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedParams[param]}
                                        onChange={handleCheckboxChange}
                                        name={param}
                                    />
                                }
                                label={param.replace(/([A-Z])/g, ' $1').toUpperCase()}
                            />
                        </Grid>
                        {selectedParams[param] && (
                            <>
                                <Grid item xs={6}>
                                    <TextField
                                        label={`Parameter Name for ${param}`}
                                        value={paramValues[param].name}
                                        onChange={(e) => handleParamChange(e, param, 'name')}
                                        variant="outlined"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label={`Value for ${param}`}
                                        value={paramValues[param].value}
                                        onChange={(e) => handleParamChange(e, param, 'value')}
                                        variant="outlined"
                                        fullWidth
                                    />
                                </Grid>
                            </>
                        )}
                    </React.Fragment>
                ))}
            </Grid>
            <Paper elevation={3} style={{ padding: '20px', marginTop: '20px', position: 'relative' }}>
                <Box position="absolute" top="-8px" left="10px" bgcolor="white" px="5px">
                    <Typography variant="subtitle1" style={{ marginBottom: '-10px', fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>
                        URL Preview
                    </Typography>
                </Box>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{urlPreview}</pre>
            </Paper>
            <Stack direction="row" spacing={2} style={{ marginTop: '20px' }}>
                <Button variant="contained" color="primary" onClick={openUrlInIframe}>
                    Open URL in Iframe
                </Button>
            </Stack>
            <Box display="flex" alignItems="center" marginTop="40px">
                <Typography variant="h5" gutterBottom>History</Typography>
                <Button variant="outlined" color="secondary" onClick={clearHistory} style={{ marginLeft: '10px' }}>
                    Clear History
                </Button>
            </Box>
            {history.map((url, index) => (
                <Paper elevation={3} key={index} style={{ padding: '10px', marginTop: '10px' }}>
                    <Typography variant="subtitle2">{`URL ${index + 1}`}</Typography>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{url}</pre>
                </Paper>
            ))}
        </Container>
    );
};

export default DGHStaticMain;