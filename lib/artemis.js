const BASE_URL = 'https://artemis.unnamed.team/';

export function uploadTemporaryFile(blob) {
  const formData = new FormData();
  formData.set('file', blob);
  return fetch(
    BASE_URL + 'tempfiles/upload',
    { method: 'POST', body: formData },
  );
}