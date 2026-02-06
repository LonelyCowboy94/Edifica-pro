// utils/formatDate.ts
export function formatDateToDDMMYYYY(dateString: string | null | undefined): string {
  if (!dateString) {
    return "/"; // Ili neki drugi default za null/undefined
  }
  try {
    const date = new Date(dateString);
    // Proveravamo da li je validan datum, inace vraca "/"
    if (isNaN(date.getTime())) {
      return "/";
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meseci su 0-bazirani
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "/";
  }
}