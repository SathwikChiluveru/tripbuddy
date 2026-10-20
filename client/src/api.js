export async function api(path, options = {}) {
  const multipart = options.body instanceof FormData;
  let response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: 'include',
      ...options,
      headers: {
        ...(!multipart && options.body ? {
          'Content-Type': 'application/json'
        } : {}),
        ...options.headers
      },
      body: options.body && !multipart ? JSON.stringify(options.body) : options.body
    });
  } catch {
    throw new Error('We could not reach TripBuddy. Check your connection and try again.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || data.error || (Array.isArray(data.errors) ? data.errors.join(', ') : 'Something went wrong. Please try again.'));
    error.status = response.status;
    throw error;
  }
  return data;
}
export const idOf = value => typeof value === 'object' ? value?._id || value?.id : value;
export const dateLabel = value => value ? new Date(value).toLocaleDateString('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
}) : 'Dates to be confirmed';
