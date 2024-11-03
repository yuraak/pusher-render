import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, TextField, Button, Alert, Paper, Box, Stack, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Ajv from 'ajv';

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
                // Create request from manual inputs
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

            const res = await axios.post(endpoint, formattedRequest);

            const valid = ajv.validate(dghResponseSchema, res.data);
            setResponse(res.data);
            setIsValid(valid);

            setHistory(prev => [{ endpoint, request: formattedRequest, response: res.data, isValid: valid }, ...prev.slice(0, 9)]);

            setNextRequestId(uuidv4());
            updateRequestPreview();

            if (res.data.data && res.data.data.url) {
                window.open(res.data.data.url, '_blank', 'width=800,height=600,noopener,noreferrer');
            }

        } catch (error) {
            setError(error.response ? error.response.data : 'Request failed');
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

    const reopenIframe = () => {
        if (response && response.data && response.data.url) {
            window.open(response.data.url, '_blank', 'width=800,height=600,noopener,noreferrer');
        }
    };

    const renderTitle = (text) => (
        <Typography variant="subtitle1" style={{ marginBottom: '-10px', fontWeight: 500, color: 'rgba(0, 0, 0, 0.6)' }}>
            {text}
        </Typography>
    );

    return (
        <Container>
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
                <Box position="absolute" top="-8px" left="10px" bgcolor="white" px="5px">
                    {renderTitle('Request Preview')}
                </Box>
                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                    {JSON.stringify({ method: 'POST', url: endpoint, headers: { "Content-Type": "application/json" }, data: formattedRequest }, null, 2)}
                </pre>
            </Paper>
            <Stack direction="row" spacing={2}>
                <Button variant="contained" color="primary" onClick={sendRequest}>
                    Send
                </Button>
                <Button variant="outlined" color="primary" onClick={reopenIframe}>
                    Re-open Iframe
                </Button>
            </Stack>
            {error && (
                <Alert severity="error" style={{ marginTop: '20px' }}>
                    {typeof error === 'string' ? error : JSON.stringify(error)}
                </Alert>
            )}
            {response && (
                <Paper elevation={3} style={{ padding: '20px', marginTop: '20px', position: 'relative' }}>
                    <Box position="absolute" top="-8px" left="10px" bgcolor="white" px="5px">
                        {renderTitle('Response')}
                    </Box>
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
                    <Box position="absolute" top="-8px" left="10px" bgcolor="white" px="5px">
                        {renderTitle(index === 0 ? 'Latest' : `Push ${index + 1}`)}
                    </Box>
                    <Typography variant="subtitle1" style={{ marginTop: '10px', fontWeight: 500 }}>Endpoint:</Typography>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{entry.endpoint}</pre>
                    <Typography variant="subtitle1" style={{ marginTop: '10px', fontWeight: 500 }}>Request:</Typography>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                        {JSON.stringify(entry.request, null, 2)}
                    </pre>
                    <Typography variant="subtitle1" style={{ marginTop: '10px', fontWeight: 500 }}>Response:</Typography>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                        {JSON.stringify(entry.response, null, 2)}
                    </pre>
                    {entry.isValid ? (
                        <Alert severity="success">JSON Validation: Passed</Alert>
                    ) : (
                        <Alert severity="error">JSON Validation: Failed</Alert>
                    )}
                </Paper>
            ))}
        </Container>
    );
};

export default DGHDynamicMain;