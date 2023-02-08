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