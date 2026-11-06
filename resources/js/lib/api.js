const csrf = document.querySelector('meta[name="csrf-token"]')?.content;

export async function api(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrf,
            ...(options.body ? {'Content-Type': 'application/json'} : {}),
            ...options.headers,
        },
        ...options,
    });
    const contentType = response.headers.get('content-type') || '';
    const data = response.status === 204 ? null : contentType.includes('application/json') ? await response.json() : {message: 'Respons server tidak valid. Muat ulang halaman dan coba lagi.'};

    if (!response.ok) {
        throw new Error(data.message || Object.values(data.errors || {}).flat().join(' ') || 'Terjadi kesalahan.');
    }

    return data;
}

export function go(path) {
    window.location.href = path;
}
