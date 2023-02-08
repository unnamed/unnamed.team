/*!
 * Module that provides a high-level interface for
 * the Artemis backend (https://github.com/unnamed/backend)
 */
const BASE_URL = 'https://artemis.unnamed.team/';

/**
 * Uploads a temporary file to the Artemis backend
 * that can be requested once later
 *
 * @param {Blob} blob The file data to upload
 * @returns {Promise<Response>} The upload response
 */
export function uploadTemporaryFile(blob: Blob): Promise<Response> {
  const formData = new FormData();
  formData.set('file', blob);
  return fetch(
    BASE_URL + 'tempfiles/upload',
    { method: 'POST', body: formData },
  );
}