// Performance Monitoring SDK Integration
// This integrates with the Performance Monitoring Dashboard

(function() {
    'use strict';

    // Load configuration from window.PERF_MONITOR_CONFIG or use defaults
    const CONFIG = window.PERF_MONITOR_CONFIG || {
        apiUrl: 'http://localhost:4000/v1/ingest',
        apiKey: 'test-key',
        projectKey: 'demo',
        batchSize: 10,
        flushInterval: 5000, // 5 seconds
    };

    const eventQueue = [];
    let sessionId = generateSessionId();

    function generateSessionId() {
        return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    function sendToAPI(events) {
        if (events.length === 0) return;

        const payload = {
            projectKey: CONFIG.projectKey,
            events: events
        };

        // Use fetch with keepalive instead of sendBeacon to support custom headers
        fetch(CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CONFIG.apiKey
            },
            body: JSON.stringify(payload),
            keepalive: true
        })
        .then(response => {
            if (!response.ok) {
                console.error('Failed to send metrics:', response.status, response.statusText);
            } else {
                console.log('✅ Metrics sent successfully:', events.length, 'events');
            }
        })
        .catch(err => console.error('❌ Failed to send metrics:', err));
    }

    function queueEvent(event) {
        eventQueue.push({
            type: 'web_vital',
            name: event.name,
            value: event.value,
            ts: Date.now(),
            page: window.location.href,
            sessionId: sessionId,
            data: {
                deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                browser: getBrowserName(),
                country: 'US' // In production, this would come from geolocation
            }
        });

        if (eventQueue.length >= CONFIG.batchSize) {
            flushQueue();
        }
    }

    function flushQueue() {
        if (eventQueue.length === 0) return;
        
        const eventsToSend = eventQueue.splice(0, eventQueue.length);
        sendToAPI(eventsToSend);
    }

    function getBrowserName() {
        const ua = navigator.userAgent;
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Other';
    }

    // Collect Core Web Vitals using web-vitals-like approach
    function observeLCP() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            queueEvent({
                name: 'LCP',
                value: lastEntry.renderTime || lastEntry.loadTime
            });
        });

        try {
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
            console.warn('LCP observation not supported');
        }
    }

    function observeFID() {
        const observer = new PerformanceObserver((list) => {
            const firstInput = list.getEntries()[0];
            queueEvent({
                name: 'FID',
                value: firstInput.processingStart - firstInput.startTime
            });
        });

        try {
            observer.observe({ type: 'first-input', buffered: true });
        } catch (e) {
            console.warn('FID observation not supported');
        }
    }

    function observeCLS() {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
        });

        try {
            observer.observe({ type: 'layout-shift', buffered: true });
            
            // Report CLS on page hide
            window.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    queueEvent({
                        name: 'CLS',
                        value: clsValue
                    });
                }
            });
        } catch (e) {
            console.warn('CLS observation not supported');
        }
    }

    function observeINP() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            let maxDuration = 0;
            
            for (const entry of entries) {
                if (entry.duration > maxDuration) {
                    maxDuration = entry.duration;
                }
            }
            
            if (maxDuration > 0) {
                queueEvent({
                    name: 'INP',
                    value: maxDuration
                });
            }
        });

        try {
            observer.observe({ type: 'event', buffered: true, durationThreshold: 16 });
        } catch (e) {
            // Fallback: observe first-input
            console.warn('INP observation not supported, using FID as fallback');
        }
    }

    function observeTTFB() {
        const navTiming = performance.getEntriesByType('navigation')[0];
        if (navTiming) {
            queueEvent({
                name: 'TTFB',
                value: navTiming.responseStart - navTiming.requestStart
            });
        }
    }

    // Initialize monitoring
    function init() {
        console.log('🎯 Performance Monitoring initialized for project:', CONFIG.projectKey);
        console.log('📊 Session ID:', sessionId);

        observeLCP();
        observeFID();
        observeCLS();
        observeINP();
        observeTTFB();

        // Flush queue periodically
        setInterval(flushQueue, CONFIG.flushInterval);

        // Flush on page unload
        window.addEventListener('beforeunload', flushQueue);
        window.addEventListener('pagehide', flushQueue);

        // Log when page is fully loaded
        window.addEventListener('load', () => {
            console.log('✅ Page loaded, metrics collection active');
        });
    }

    // Start monitoring when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

