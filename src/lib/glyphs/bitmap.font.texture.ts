const PNG_MIME_TYPE = 'image/png';
const MAX_SIZE = 256;

/**
 * Processes the given image {@code data} and
 * executes the following operations if necessary:
 * - Convert it to a PNG image
 * - Resize it to less than previously set {@code MAX_SIZE}
 *
 * @param data The image data, must be a valid
 * image {@code src} property
 * @param mimeType {string} The image data mime type
 * @return Promise<string> The processed image data URL (PNG)
 */
export function processImage(data: string, mimeType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('error', reject);
    image.addEventListener('load', () => {
      const { width, height } = image;
      const max = Math.max(width, height);
      const ratio = (max > MAX_SIZE) ? (MAX_SIZE / max) : 1;

      // if width or height exceeds the
      // max glyph size, we have to scale it
      if (mimeType !== PNG_MIME_TYPE || ratio < 1) {
        const scaledWidth = width * ratio;
        const scaledHeight = height * ratio;

        const canvas = document.createElement('canvas');
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        const ctx = canvas.getContext('2d');

        // write scaled image
        if (ctx) {
          ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
        } else {
          console.error('canvas.getContext("2d") returned null');
        }

        resolve(canvas.toDataURL());
      } else {
        resolve(image.src);
      }
    });
    image.src = data;
  });
}
