const fetchWithAuth = async (url, options = {}) => {

    const headers = {
        ...options.headers
    };
    const authToken = 'AUTH TOKEN FROM INSTANCE';
    if (authToken) {
        headers['Authorization'] = authToken;
    }


    let response = await fetch(`${url}`, {
        ...options,
        headers
    });

    if (!response.ok && response.status === 302) {
        const redirectUrl = response.headers.get('Location');
        if (redirectUrl) {
            response = await fetch(redirectUrl, {
                ...options,
                headers
            });
        }
        const returnedData = await response.json();
        console.log(`302 fetchWithAuth `,returnedData);
        return returnedData;
    } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    } else {
        const returnedData = await response.json();
        console.log(`302 fetchWithAuth `,returnedData);
        return returnedData;
    }
};

export default fetchWithAuth;