// Utilitaires blob → data: URL pour contourner les CSP qui bloquent blob:
// Usage:
//   const dataUrl = await blobToDataURL(blob);
//   // ou pour texte
//   const dataUrl = stringToDataURL('text/plain', 'Hello');

/**
 * Convertit un Blob en data: URL (base64) via FileReader.
 * @param {Blob} blob
 * @returns {Promise<string>} data: URL
 */
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Construit une data: URL à partir d'une chaîne (utf-8) et d'un type MIME.
 * @param {string} mimeType ex: 'text/vcard' | 'text/csv' | 'application/json'
 * @param {string} content
 * @returns {string} data: URL
 */
export function stringToDataURL(mimeType, content) {
  const encoded = encodeURIComponent(content);
  return `data:${mimeType};charset=utf-8,${encoded}`;
}

/**
 * Convertit des octets (ArrayBuffer, Uint8Array) en data: URL avec un type MIME donné.
 * @param {string} mimeType
 * @param {ArrayBuffer|Uint8Array} data
 * @returns {Promise<string>}
 */
export async function bytesToDataURL(mimeType, data) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  return blobToDataURL(blob);
}