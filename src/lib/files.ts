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
export function stripExtension(filename: string): string {
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
export function saveFile(blob: Blob, filename: string) {
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
export function promptFiles(options: { multiple?: boolean, accept?: string[] }): Promise<FileList> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = options.multiple || false;
    if (options.accept) input.accept = options.accept.join(',');
    input.addEventListener('change', event => resolve((event.target as any)['files'] as FileList));
    input.addEventListener('abort', reject);
    input.addEventListener('error', reject);
    document.body.appendChild(input);
    input.click();
    input.remove();
  });
}

export async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return readAs(file, 'readAsArrayBuffer') as Promise<ArrayBuffer>;
}

export async function readAsDataURL(file: File): Promise<string> {
  return readAs(file, 'readAsDataURL') as Promise<string>;
}

async function readAs(file: File, func: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', event => resolve(event.target!.result));
    reader.addEventListener('error', reject);
    reader.addEventListener('abort', reject);
    (reader as any)[func](file);
  });
}