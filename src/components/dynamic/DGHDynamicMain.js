import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, TextField, Button, Alert, Paper, Box, Stack, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Ajv from 'ajv';
import HistoryWrapper from '../components/HistoryWrapper'; // Adjust path as needed

const ajv = new Ajv({ allErrors: true, verbose: true });
const dghResponseSchema = {
    type: 'object',
    properties: {
        gsId: { type: 'string' },
        gpId: { type: 'string' },
        requestId: { type: 'string' },
        command: { type: 'string', enum: ['PTC_GetDetailedGameHistoryAck'] },
        data: {
            type: 'object',
            properties: {
                ttlSeconds: { type: 'integer', optional: true },
                url: { type: 'string' }
            },
            required: ['url']
        }
    },
    required: ['gsId', 'gpId', 'requestId', 'command', 'data']
};

const DGHDynamicMain = () => {
    const [transactionLog, setTransactionLog] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [formattedRequest, setFormattedRequest] = useState({});
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [isValid, setIsValid] = useState(null);
    const [history, setHistory] = useState([]);
    const [nextRequestId, setNextRequestId] = useState(uuidv4());
    const [inputMode, setInputMode] = useState('TPI v1'); // 'Manual', 'TPI v1', 'TPI v2'
    const [iframeUrl, setIframeUrl] = useState('');

    // State for manual inputs
    const [manualInputs, setManualInputs] = useState({
        gsId: '',
        playerId: '',
        skinId: '',
        gameId: '',
        gameCycleId: '',
        gameCycleFinishDateTime: ''
    });

    const mapV1Request = useCallback((details) => ({
        gsId: details._meta.gsId,
        gpId: "pop",
        requestId: nextRequestId,
        command: "PTC_GetDetailedGameHistory",
        data: {
            playerId: details.playerId,
            skinId: details.skinId,
            gameId: details.gameId,
            gameCycleId: details.gameCycleId,
            gameCycleFinishDateTime: details.gameCycleFinishDateTime,
            localeCode: details.localeCode
        }
    }), [nextRequestId]);

    const mapV2Request = useCallback((details) => ({
        gsId: details.rgsId,
        gpId: "pop",
        requestId: nextRequestId,
        command: "PTC_GetDetailedGameHistory",
        data: {
            playerId: details.player,
            skinId: details.casino,
            gameId: details.gameCycleData.gameId,
            gameCycleId: details.gameCycleData.id,
            gameCycleFinishDateTime: details.gameCycleFinishData.endTimestamp,
            localeCode: "en"
        }
    }), [nextRequestId]);

    const handleManualInputChange = (e) => {
        const { name, value } = e.target;
        setManualInputs((prev) => ({ ...prev, [name]: value }));
    };

    const updateRequestPreview = useCallback(() => {
        try {
            if (inputMode === 'Manual') {
                setFormattedRequest({
                    gsId: manualInputs.gsId,
                    gpId: "pop",
                    requestId: nextRequestId,
                    command: "PTC_GetDetailedGameHistory",
                    data: {
                        playerId: manualInputs.playerId,
                        skinId: manualInputs.skinId,
                        gameId: manualInputs.gameId,
                        gameCycleId: manualInputs.gameCycleId,
                        gameCycleFinishDateTime: manualInputs.gameCycleFinishDateTime,
                        localeCode: "en"
                    }
                });
            } else {
                const details = JSON.parse(transactionLog);
                const request = inputMode === 'TPI v2' ? mapV2Request(details) : mapV1Request(details);
                setFormattedRequest(request);
            }
        } catch (error) {
            console.error('Failed to parse transaction log:', error);
            setFormattedRequest({});
        }
    }, [transactionLog, inputMode, manualInputs, mapV1Request, mapV2Request, nextRequestId]);

    useEffect(() => {
        document.title = 'DGH PUSHER / dynamic';
    }, []);

    useEffect(() => {
        updateRequestPreview();
    }, [transactionLog, updateRequestPreview]);

    const handleLogChange = (e) => {
        setTransactionLog(e.target.value);
    };

    const handleEndpointChange = (e) => {
        setEndpoint(e.target.value);
    };

    const sendRequest = async () => {
        try {
            setError(null);
            setIsValid(null);
            setResponse(null);

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedRequest)
            });

            const responseData = await res.json();
            const valid = ajv.validate(dghResponseSchema, responseData);
            setResponse(responseData);
            setIsValid(valid);

            setHistory((prev) => [{ endpoint, request: formattedRequest, response: responseData, isValid: valid }, ...prev.slice(0, 9)]);

            setNextRequestId(uuidv4());
            updateRequestPreview();

            if (responseData.data && responseData.data.url) {
                setIframeUrl(responseData.data.url); // Update iframe URL instead of opening new tab
            }
        } catch (error) {
            setError(error.message || 'Request failed');
        }
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const clearInput = () => {
        setTransactionLog('');
        setEndpoint('');
        setFormattedRequest({});
        setManualInputs({
            gsId: '',
            playerId: '',
            skinId: '',
            gameId: '',
            gameCycleId: '',
            gameCycleFinishDateTime: ''
        });
    };

    return (
        <Container>
            <HistoryWrapper iframeUrl={iframeUrl} onClose={() => setIframeUrl('')} />
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="20px">
                <Typography variant="h4" gutterBottom>DGH Pusher / Dynamic Approach</Typography>
                <Box>
                    <Button component={Link} to="/static" variant="outlined" color="primary" style={{ marginRight: '10px' }}>
                        Static Approach
                    </Button>
                    <Button component={Link} to="/" variant="outlined" color="secondary">
                        Home
                    </Button>
                </Box>
            </Box>
            <Box display="flex" alignItems="center" marginBottom="20px">
                <FormControl style={{ minWidth: 120, marginRight: '10px' }}>
                    <InputLabel>Input Mode</InputLabel>
                    <Select value={inputMode} onChange={(e) => setInputMode(e.target.value)}>
                        <MenuItem value="Manual">Manual</MenuItem>
                        <MenuItem value="TPI v1">TPI v1</MenuItem>
                        <MenuItem value="TPI v2">TPI v2</MenuItem>
                    </Select>
                </FormControl>
                <Button variant="outlined" color="secondary" onClick={clearInput} style={{ marginLeft: '10px' }}>
                    Clear Input Data
                </Button>
            </Box>

            {inputMode === 'Manual' ? (
                <Box>
                    <TextField
                        label="gsId"
                        name="gsId"
                        value={manualInputs.gsId}
                        onChange={handleManualInputChange}
                        variant="outlined"
                        fullWidth
                        style={{ marginBottom: '10px' }}
                    />
                    <TextField
                        label="playerId"
                        name="playerId"
                        value={manualInputs.playerId}
                        onChange={handleManualInputChange}
                        variant="outlined"
                        fullWidth
                        style={{ marginBottom: '10px' }}
                    />
                    <TextField
                        label="skinId"
                        name="skinId"
                        value={manualInputs.skinId}
                        onChange={handleManualInputChange}
                        variant="outlined"
                        fullWidth
                        style={{ marginBottom: '10px' }}
                    />
                    <TextField
                        label="gameId"
                        name="gameId"
                        value={manualInputs.gameId}
                        onChange={handleManualInputChange}
                        variant="outlined"
                        fullWidth
                        style={{ marginBottom: '10px' }}
                    />
                    <TextField
                        label="gameCycleId"
                        name="gameCycleId"
                        value={manualInputs.gameCycleId}
                        onChange={handleManualInputChange}
                        variant="outlined"
                        fullWidth
                        style={{ marginBottom: '10px' }}
                    />
                    <TextField
                        label="gameCycleFinishDateTime"
                        name="gameCycleFinishDateTime"
                        value={manualInputs.gameCycleFinishDateTime}
                        onChange={handleManualInputChange}
                        variant="outlined"
                        fullWidth
                        style={{ marginBottom: '10px' }}
                    />
                </Box>
            ) : (
                <TextField
                    label="Transaction Log"
                    name="transactionLog"
                    onChange={handleLogChange}
                    value={transactionLog}
                    multiline
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    style={{ marginBottom: '20px' }}
                />
            )}

            <TextField
                label="Push Endpoint"
                name="endpoint"
                onChange={handleEndpointChange}
                value={endpoint}
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                style={{ marginBottom: '20px' }}
            />
            <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px', position: 'relative' }}>
                <Typography variant="subtitle1" style={{ marginBottom: '-10px', fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>
                    Request Preview
                </Typography>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {JSON.stringify({ method: 'POST', url: endpoint, headers: { "Content-Type": "application/json" }, data: formattedRequest }, null, 2)}
                </pre>
            </Paper>
            <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary" onClick={sendRequest}>
                    Send
                </Button>
            </Stack>
            {error && (
                <Alert severity="error" style={{ marginTop: '20px' }}>
                    {typeof error === 'string' ? error : JSON.stringify(error)}
                </Alert>
            )}
            {response && (
                <Paper elevation={3} style={{ padding: '20px', marginTop: '20px', position: 'relative' }}>
                    <Typography variant="subtitle1" style={{ marginBottom: '-10px', fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>
                        Response
                    </Typography>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {JSON.stringify(response, null, 2)}
                    </pre>
                    {isValid ? (
                        <Alert severity="success">JSON Validation: Passed</Alert>
                    ) : (
                        <Alert severity="error">JSON Validation: Failed</Alert>
                    )}
                </Paper>
            )}
            <Box display="flex" alignItems="center" marginTop="40px">
                <Typography variant="h5" gutterBottom>History</Typography>
                <Button variant="outlined" color="secondary" onClick={clearHistory} style={{ marginLeft: '10px' }}>
                    Clear History
                </Button>
            </Box>
            {history.map((entry, index) => (
                <Paper elevation={3} key={index} style={{ padding: '20px', marginTop: '20px', position: 'relative' }}>
                    <Typography variant="subtitle1" style={{ marginBottom: '-10px', fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>
                        {index === 0 ? 'Latest' : `Push ${index + 1}`}
                    </Typography>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {JSON.stringify(entry.request, null, 2)}
                    </pre>
                    <Typography variant="subtitle1" style={{ marginBottom: '-10px', fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>
                        Endpoint:
                    </Typography>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {entry.endpoint}
                    </pre>
                </Paper>
            ))}
        </Container>
    );
};

export default DGHDynamicMain;