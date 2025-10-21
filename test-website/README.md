# Test Website

Simple test website to generate performance metrics.

## How to Run

### Option 1: Using Python's HTTP Server

```bash
cd test-website
python3 -m http.server 8080
```

Then open: http://localhost:8080

### Option 2: Using Node.js http-server

```bash
# Install http-server globally (one time)
npm install -g http-server

# Run the server
cd test-website
http-server -p 8080
```

Then open: http://localhost:8080

### Option 3: Using PHP

```bash
cd test-website
php -S localhost:8080
```

Then open: http://localhost:8080

## Configuration

The test website uses a configuration file to connect to the Performance Monitoring API.

### config.js

Edit `config.js` to customize the SDK configuration:

```javascript
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
```

### Configuration Options

- **apiUrl**: The URL of your Ingestion API (default: `http://localhost:4000/v1/ingest`)
- **apiKey**: API key for authentication (default: `test-key`)
- **projectKey**: Unique identifier for your project (default: `demo`)
- **batchSize**: Number of events to batch before sending (default: `10`)
- **flushInterval**: Time in milliseconds between automatic flushes (default: `5000`)

## Usage

1. Start the test website using one of the methods above
2. Navigate between pages (Home, About, Gallery)
3. Interact with elements to generate metrics
4. View metrics in the Performance Dashboard at http://localhost:5173

