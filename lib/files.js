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
 * @param {(File) => void} cb The file callback
 * @param options The file prompt options
 */
export function promptFiles(cb, options = { multiple: false }) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = options.multiple;
  input.addEventListener('change', event => {
    /** @type FileList */
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      cb(files[i]);
    }
  });
  document.body.appendChild(input);
  input.click();
  input.remove();
}

/**
 * @callback processFileCallback
 * @param {File} file
 * @param {ArrayBuffer} buffer
 */

/**
 * Asks the client to select a file or multiple files and
 * reads them as array buffers
 *
 * @param {processFileCallback} cb The file data callback
 * @param options The file prompt options
 */
export function promptFilesAndReadAsBuffer(cb, options = { multiple: false }) {
  promptFiles(file => {
    const reader = new FileReader();
    reader.addEventListener('load', event => cb(file, event.target.result));
    reader.readAsArrayBuffer(file);
  }, options);
}