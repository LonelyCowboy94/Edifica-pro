export async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();

    if (!response.ok) {
      // Ovdje izvlačimo čistu poruku iz tvog JSON-a
      const errorData = data as { message?: string; error?: string };
      const errorMessage = errorData.message || errorData.error || response.statusText;
      
  
      
      // BACAMO Error umesto Promise.reject da bi try-catch u LoginPage radio lakše
      throw new Error(errorMessage); 
    }

    return data as T;
  }

  // Handle non-JSON or empty successful responses
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  const textData = await response.text();
  return textData as unknown as T;
}