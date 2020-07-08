# API Documentation

This is used to list API documentation generated from the OpenApi v3 standard into HTML format.

## Setup

1. Ensure `node (>8.6 and <= 10)` and `npm` are installed
2. Run `npm install @openapitools/openapi-generator-cli -g`
3. Run `openapi-generator validate -i docs.yaml`
4. Run `openapi-generator generate -i docs.yaml -g html2`
5. Open file index.html in browser