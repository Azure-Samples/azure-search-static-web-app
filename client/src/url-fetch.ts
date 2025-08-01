// Use localhost in development, empty string in production for relative URLs
const baseURL = import.meta.env.DEV 
    ? (import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:7071')
    : (import.meta.env.VITE_REACT_APP_BACKEND_URL || '');
console.log(`baseURL = ${baseURL}`);
console.log(`Environment: ${import.meta.env.MODE}`);

function buildQueryString(params: Record<string, string | number | boolean>): string {
    return Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key].toString())}`)
        .join('&');
}

interface FetchOptions {
    query?: Record<string, string | number | boolean>;
    body?: any;
    headers?: Record<string, string>;
    method?: string;
}

async function fetchInstance<T = any>(url: string, { query = {}, body = null, headers = {}, method = 'GET' }: FetchOptions = {}): Promise<T> {
    const queryString = buildQueryString(query as Record<string, string | number | boolean>);
    // Handle empty baseURL for production (relative URLs)
    const fullUrl = baseURL ? `${baseURL}${url}${queryString ? `?${queryString}` : ''}` : `${url}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(fullUrl, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: body ? JSON.stringify(body) : null
    });

    if (response.ok || (response.status >= 200 && response.status < 400)) {
        return await response.json() as T;
    } else {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

export default fetchInstance;