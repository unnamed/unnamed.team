/*
 * String utility module
 */

/**
 * Capitalizes a string, i.e. makes the string's
 * first character uppercase, note that this function
 * does not execute type checking
 *
 * If the string is empty, an empty string is
 * returned as well
 *
 * @param {string} string The input string
 * @returns {string} The output string
 */
export function capitalize(string: string): string {
  if (string.length === 0) {
    return string;
  } else {
    return string.charAt(0).toUpperCase() + string.substring(1);
  }
}

/**
 * Replaces all occurrences of a pattern in a string
 * with the result of an async function
 *
 * @param string The input string
 * @param pattern The pattern to replace
 * @param asyncFn The async replacer function to call
 */
export async function replaceAsync(
  string: string,
  pattern: RegExp,
  asyncFn: (match: string, ...args: any[]) => Promise<string>
): Promise<string> {
  const promises: Promise<string>[] = [];
  string.replace(pattern, (match, ...args) => {
    promises.push(asyncFn(match, ...args));
    return match;
  });
  const data = await Promise.all(promises);
  return string.replace(pattern, () => data.shift()!);
}