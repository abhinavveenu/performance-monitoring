# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-21

### Added
- Initial release
- Core Web Vitals tracking (LCP, FID, CLS, INP, TTFB)
- Session management with sessionStorage
- Configurable sampling rate
- Error tracking (JavaScript errors and unhandled rejections)
- Resource timing tracking
- Batched metric sending
- TypeScript support
- UMD, ESM, and CommonJS builds
- Comprehensive documentation
- Framework-agnostic design

### Features
- Zero-impact performance monitoring
- < 5KB gzipped bundle size
- GDPR compliant (no PII collection)
- Automatic retry on network failures
- Configurable flush intervals and batch sizes
- Support for all modern browsers

### Technical
- Uses `web-vitals` v4.0.0 for Core Web Vitals
- Uses `fetch` with `keepalive` for reliable delivery
- Singleton pattern for single instance
- Session persistence in sessionStorage
- Event batching for efficiency

