/*!
 * YearRange component, returns a year, or a year range depending
 * on the starting year ('from' prop), useful for copyright texts,
 * e.g.:
 *
 * <p>Copyright &copy; <YearRange from={2017} /></p>
 *
 * Will be rendered as:
 *
 * Copyright &copy; 2017-2023
 *
 * If 2023 is the current year.
 *
 *
 * If the "from" year is the same as
 * the current year, it will not be displayed as a year range
 *
 * <p>Copyright &copy; <YearRange from={2023} /></p>
 *
 * Will be rendered as:
 *
 * Copyright &copy; 2023
 *
 *
 * Author: Andre Roldan
 */
export default function YearRange({ from }: { from?: number }) {
  const currentYear = new Date().getFullYear();
  return <>{currentYear === from ? currentYear : `${from}-${currentYear}`}</>;
}