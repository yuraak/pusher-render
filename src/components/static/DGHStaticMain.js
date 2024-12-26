import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, TextField, Checkbox, FormControlLabel, Paper, Box, Stack, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const DGHStaticMain = () => {
    const [baseUrl, setBaseUrl] = useState('');
    const [selectedParameters, setSelectedParameters] = useState({
        playerId: false,
        skinId: false,
        gameId: false,
        gameCycleId: false,
        gameCycleFinishDateTime: false,
        localeCode: false,
    });
    const [parameterValues, setParameterValues] = useState({
        playerId: { name: '', value: '' },
        skinId: { name: '', value: '' },
        gameId: { name: '', value: '' },
        gameCycleId: { name: '', value: '' },
        gameCycleFinishDateTime: { name: '', value: '' },
        localeCode: { name: '', value: '' },
    });
    const [urlPreview, setUrlPreview] = useState('');
    const [history, setHistory] = useState([]);

    useEffect(() => {
        document.title = 'DGH PUSHER / static'; // Set tab title
    }, []);

    const handleBaseUrlChange = (e) => {
        setBaseUrl(e.target.value);
    };

    const handleCheckboxChange = (e) => {
        setSelectedParameters({
            ...selectedParameters,
            [e.target.name]: e.target.checked,
        });
    };

    const handleParameterChange = (e, key, type) => {
        setParameterValues({
            ...parameterValues,
            [key]: {
                ...parameterValues[key],
                [type]: e.target.value,
            },
        });
    };

    const updateUrlPreview = useCallback(() => {
        const params = new URLSearchParams();
        for (const key in selectedParameters) {
            if (selectedParameters[key]) {
                const name = parameterValues[key].name || key;
                const value = parameterValues[key].value || '';
                params.append(name, value);
            }
        }
        setUrlPreview(`${baseUrl}?${params.toString()}`);
    }, [baseUrl, selectedParameters, parameterValues]);

    useEffect(() => {
        updateUrlPreview();
    }, [updateUrlPreview]);

    const handleOpenIframe = async () => {
        try {
            const response = await fetch('/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: urlPreview }),
            });
            if (response.ok) {
                const html = await response.text();
                const newWindow = window.open();
                newWindow.document.write(html);
                newWindow.document.close();
                setHistory((prev) => [urlPreview, ...prev.slice(0, 9)]);
            } else {
                console.error('Failed to open URL');
            }
        } catch (error) {
            console.error('Error opening URL:', error);
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
                name="baseUrl"
                onChange={handleBaseUrlChange}
                value={baseUrl}
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                style={{ marginBottom: '20px' }}
            />
            <Box style={{ marginBottom: '20px' }}>
                {Object.keys(selectedParameters).map((param) => (
                    <FormControlLabel
                        key={param}
                        control={
                            <Checkbox
                                checked={selectedParameters[param]}
                                onChange={handleCheckboxChange}
                                name={param}
                                color="primary"
                            />
                        }
                        label={param.replace(/([A-Z])/g, ' $1').trim()} // Format label for readability
                    />
                ))}
            </Box>
            <Grid container spacing={2} style={{ marginBottom: '20px' }}>
                {Object.keys(selectedParameters).map(
                    (key) =>
                        selectedParameters[key] && (
                            <React.Fragment key={key}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label={`Parameter Name for ${key}`}
                                        value={parameterValues[key].name}
                                        onChange={(e) => handleParameterChange(e, key, 'name')}
                                        variant="outlined"
                                        fullWidth
                                        style={{ marginBottom: '10px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label={`Value for ${key}`}
                                        value={parameterValues[key].value}
                                        onChange={(e) => handleParameterChange(e, key, 'value')}
                                        variant="outlined"
                                        fullWidth
                                        style={{ marginBottom: '10px' }}
                                    />
                                </Grid>
                            </React.Fragment>
                        )
                )}
            </Grid>
            <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px', position: 'relative' }}>
                <Typography variant="subtitle1" style={{ marginBottom: '-10px', fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>
                    URL Preview
                </Typography>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{urlPreview}</pre>
            </Paper>
            <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary" onClick={handleOpenIframe}>
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
                <Paper elevation={3} key={index} style={{ padding: '20px', marginTop: '20px', position: 'relative' }}>
                    <Typography variant="subtitle1" style={{ marginBottom: '-10px', fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>
                        {index === 0 ? 'Latest' : `URL ${index + 1}`}
                    </Typography>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{url}</pre>
                </Paper>
            ))}
        </Container>
    );
};

export default DGHStaticMain;