// Configuration for Performance Monitoring SDK
// This file should be loaded before perf-monitor.js

window.PERF_MONITOR_CONFIG = {
    // API endpoint for sending metrics
    apiUrl: 'http://localhost:4000/v1/ingest',
    
    // API key for authentication
    apiKey: 'test-key',
    
    // Project identifier
    projectKey: 'demo',
    
    // Batch size before auto-flush
    batchSize: 10,
    
    // Flush interval in milliseconds
    flushInterval: 5000,
};

