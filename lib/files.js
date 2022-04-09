// Module dedicated to file utility functions such
// as extension manipulation, file saving and loading,
// etc
/**
 * Strips the extension from a file name
 * if it exists
 *
 * @param filename {string} The filename
 * @returns {string} The filename, without
 * extension
 */
export function stripExtension(filename) {
  const index = filename.lastIndexOf('.');
  return (index === -1)
    ? filename
    : filename.substring(0, index);
}

/**
 * Client-side function to ask the client to
 * save a file with the given blob data and
 * recommended filename
 *
 * @param {Blob} blob The file data
 * @param {string} filename The file name
 */
export function saveFile(blob, filename) {
  const a = document.createElement('a');
  a.setAttribute('href', URL.createObjectURL(blob));
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Asks the client to select a file or multiple files
 *
 * @param options The file prompt options
 * @return Promise<FileList> The input files
 */
export function promptFiles(options = { multiple: false }) {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = options.multiple;
    if (options.accept) input.accept = options.accept.join(',');
    input.addEventListener('change', event => resolve(event.target.files));
    input.addEventListener('abort', reject);
    input.addEventListener('error', reject);
    document.body.appendChild(input);
    input.click();
    input.remove();
  });
}

export async function readAsArrayBuffer(file) {
  return readAs(file, 'readAsArrayBuffer');
}

export async function readAsDataURL(file) {
  return readAs(file, 'readAsDataURL');
}

async function readAs(file, func) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', event => resolve(event.target.result));
    reader.addEventListener('error', reject);
    reader.addEventListener('abort', reject);
    reader[func](file);
  });
}