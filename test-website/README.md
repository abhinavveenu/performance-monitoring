# Test Website for Performance Monitoring

This is a simple test website to generate real performance metrics for the Performance Monitoring Dashboard.

## Features

- 3 pages (Home, About, Gallery)
- Multiple images (using placeholder images from picsum.photos)
- Lorem ipsum content
- Interactive elements to generate INP metrics
- Integrated Performance Monitoring SDK

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

## Generating Metrics

1. Make sure your Performance Monitoring services are running:
   ```bash
   ./start-all.sh
   ```

2. Configure the test website (edit `config.js` if needed)

3. Open the test website in your browser

4. Navigate between pages (Home, About, Gallery)

5. Click buttons and interact with elements

6. Scroll through the page

7. Load more images on the Gallery page

The SDK will automatically:
- Collect Core Web Vitals (LCP, FID, CLS, INP, TTFB)
- Batch events every 5 seconds or 10 events
- Send metrics to the configured Ingestion API
- Add device type, browser, and session information

## Viewing Metrics

1. Open the Performance Dashboard: http://localhost:5173
2. Wait a few seconds for workers to process the metrics
3. View real-time performance data!

## Pages

- **index.html** - Home page with hero section and content
- **about.html** - About page with team grid
- **gallery.html** - Gallery page with 9+ images

## Cleanup

To delete this test website when done:

```bash
rm -rf test-website
```

