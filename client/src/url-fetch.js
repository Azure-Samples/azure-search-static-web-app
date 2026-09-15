// Use localhost in development, runtime-injected config or env var in production
const runtimeBackendUrl = (typeof window !== 'undefined' && window.__APP_CONFIG__ && window.__APP_CONFIG__.BACKEND_URL) || '';
const baseURL = import.meta.env.DEV
    ? (import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:7071')
    : (runtimeBackendUrl || import.meta.env.VITE_REACT_APP_BACKEND_URL || '');
console.log(`baseURL = ${baseURL}`);
console.log(`Environment: ${import.meta.env.MODE}`);

function buildQueryString(params) {
    return Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
}

async function fetchInstance(url, { query = {}, body = null, headers = {}, method = 'GET', signal } = {}) {
    const queryString = buildQueryString(query);
    const fullUrl = baseURL
        ? `${baseURL}${url}${queryString ? `?${queryString}` : ''}`
        : `${url}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(fullUrl, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: body ? JSON.stringify(body) : null,
        signal
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export default fetchInstance;
