/**
 * Global handler for fetch responses using Generics to avoid 'any'.
 * Parses JSON and handles HTTP errors with strict type enforcement.
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();

    if (!response.ok) {
      // Create a temporary structure to safely extract error messages
      const errorData = data as { message?: string; error?: string };
      const errorMessage = errorData.message || errorData.error || response.statusText;
      
      console.error(`[API Error] Status: ${response.status}, Message: ${errorMessage}`);
      return Promise.reject(new Error(errorMessage));
    }

    // Cast data to the generic type T
    return data as T;
  }

  // Handle non-JSON or empty successful responses
  if (!response.ok) {
    return Promise.reject(new Error(response.statusText));
  }

  // If we expect T but get a string/text, we use unknown as a bridge for the cast
  const textData = await response.text();
  return textData as unknown as T;
}