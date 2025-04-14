/**
 * Parses a PostgreSQL daterange string and converts it to an array of JavaScript Date objects.
 *
 * @param {string} range - The PostgreSQL daterange string, e.g., '[2012-06-01,2013-09-15)'.
 * @returns {Array<Date|null>} An array containing the start and end dates as Date objects.
 *                             If the range is null or an empty string, returns [null, null].
 */
export const parsePostgresDateRange = (range) => {
    if (!range || range === '') {
        return [null, null];
    }

    const strippedRange = range.replace(/[\[\]\(\)]/g, '');
    const [startDateString, endDateString] = strippedRange.split(',');
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    return [startDate, endDate];
};

/**
 * Formats an array of two JavaScript Date objects into a PostgreSQL daterange string.
 *
 * Validates dates to ensure they can be properly formatted to string.
 * 
 * @param {Array<Date|null>} dateRange - An array containing the start and end dates as Date objects.
 *                                       If a date is invalid or null, it will be represented as an empty string in the output.
 * @returns {string} The formatted PostgreSQL daterange string, e.g., '[2012-06-01,2013-09-15)'.
 */
export const formatToPostgresDateRange = ([startDate, endDate]) => {
    const isValidDate = (date) => date instanceof Date && !isNaN(date);
  
    const start = isValidDate(startDate) ? startDate.toISOString().split('T')[0] : '';
    const end = isValidDate(endDate) ? endDate.toISOString().split('T')[0] : '';
  
    return `[${start},${end})`;
  };



/**
 * Formats a date string by replacing 'BC' with ' BCE' and removing leading zeros.
 *
 * @param {string} dateString - The date string to format.
 * @returns {string} - The formatted date string.
 */
export const formatDateString = (dateString) => {
    let formatted = dateString;
    if (formatted.includes('BC')) {
    formatted = formatted.replace(/\s*BC$/, ' BCE'); // Add space before BC for consistency
    }
    formatted = formatted.replace(/^0+/, ''); // Remove leading zeros
    return formatted;
};

/**
 * Compares two date strings and returns a value indicating their relative order.
 * The date strings can include BCE dates, which are handled appropriately.
 *
 * @param {string} v1 - The first date string to compare.
 * @param {string} v2 - The second date string to compare.
 * @param {any} param1 - An additional parameter (not used in the comparison).
 * @param {any} param2 - An additional parameter (not used in the comparison).
 * @returns {number} - Returns -1 if v1 is earlier than v2, 1 if v1 is later than v2, or 0 if they are equal.
 */
export const dateSortComparator = (v1, v2, param1, param2) => {
    // A helper function to handle BCE and convert date to a sortable value
    const getSortableDateValue = (dateString) => {
    const era = dateString.includes('BCE') ? -1 : 1;
    dateString = dateString.replace(/\s*BCE$/, ''); // Removes ' BC' if present
    const dateParts = dateString.split('-').map(part => parseInt(part, 10));
    const [year, month = 1, day = 1] = dateParts; // Default to Jan 1st if not full date
    // Construct a new Date or a comparable value using era and date parts
    const dateValue = (era === -1 ? -1 : 1) * (year * 10000 + month * 100 + day);
    return dateValue;
    };

    const dateValue1 = getSortableDateValue(v1);
    const dateValue2 = getSortableDateValue(v2);
    return dateValue1 < dateValue2 ? -1 : (dateValue1 > dateValue2 ? 1 : 0);
};  


/**
 * Extracts a date from a given dating string based on the specified type.
 *
 * @param {string} dating - The string containing the date range.
 * @param {string} type - The position of the date to extract ('TPQ' for the first - post quem, or 'TAQ' for the second - ante quem).
 * @returns {string} - The extracted date formatted as a string, or an empty string if no date is found.
 */
  export const extractRangeDate = (dating, type, format) => {
    if (!dating) return '';
  
    let regex;
    if (type === 'TPQ') {
      regex = /\[(?:"?)(.*?)(?:"?)\s*,/;
    } else if (type === 'TAQ') {
      regex = /,\s*(?:"?)(.*?)(?:"?)\)/;
    }
  
    const matches = dating.match(regex);
    if (matches && matches[1]) {
      if (format === 'year') {
        return parseDateStringToYear(matches[1]);
      }
      return parseDateString(matches[1]);
    }
  
    return '';
  };
  
  /**
   * Extracts the date parts (era, year, month, day) from a given date string.
   *
   * @param {string} dateString - The date string to extract parts from. The string can include 'BCE' to indicate a negative era.
   * @returns {Object} An object containing the extracted date parts:
   *   - {number} era - The era of the date, 1 for CE (Common Era) and -1 for BCE (Before Common Era).
   *   - {number} year - The year part of the date.
   *   - {number} month - The month part of the date, defaults to 1 if not provided.
   *   - {number} day - The day part of the date, defaults to 1 if not provided.
   */
  const extractDateParts = (dateString) => { 
    let era = 1;

    if (dateString.includes('BC')) {
      era = -1;
      dateString = dateString.replace(/\s*BC$/, ''); // Removes ' BC' if present
    }
  
    const dateParts = dateString.split('-').map(part => parseInt(part, 10));
    const [year, month = 1, day = 1] = dateParts; // Default to Jan 1st if not full date
  
    return { era, year, month, day };
  };

  /**
   * Parses a date string and returns a Date object.
   *
   * @param {string} dateString - The date string to parse.
   * @returns {Date|null} - The parsed Date object, or null if the date string is invalid.
   */
  const parseDateString = (dateString) => {
    if (!dateString) return null;
    const dateParts = extractDateParts(dateString);
  
    // Construct a Date object using era and date parts
    const paddedYear = dateParts.year.toString().padStart(4, '0');
    const eraString = dateParts.era === -1 ? '-' : '';
    const date = new Date(`${eraString}00${paddedYear}-${dateParts.month}-${dateParts.day}`);
  
    return date;
  };

  /**
   * Parses a date string and returns an object containing integer and string representations of the year.
   *
   * @param {string} dateString - The date string to parse.
   * @returns {Object|null} An object containing the year as an integer (`yearInt`), 
   *                        the year as a string with notation (`yearStr`), 
   *                        and the notation (`notation`), or null if the input is falsy.
   * @property {number} yearInt - The year as an integer, with era taken into account.
   * @property {string} yearStr - The year as a string with notation (e.g., '2021 CE').
   * @property {string} notation - The notation indicating the era ('BCE' or 'CE').
   */
  const parseDateStringToYear = (dateString) => {
    if (!dateString) return null;
    const dateParts = extractDateParts(dateString);
    // Construct an object containing integer and string representations of the year
    const notation = dateParts.era === -1 ? 'BCE' : 'CE';
    const yearObject = {
      yearInt: dateParts.era * dateParts.year,
      yearStr: `${dateParts.year} ${notation}`, // e.g., '2021 CE'
      notation: notation
    }
    return yearObject;
  };

  /**
   * Capitalizes the first letter of a given string.
   *
   * @param {string} string - The string to be transformed.
   * @returns {string} The transformed string with the first letter capitalized.
   */
  export function capitalizeFirstLetter(string) {
    if (!string) return string; // Return the original string if it's empty
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * Transforms the input string by capitalizing the first letter and removing all spaces.
   *
   * @param {string} string - The input string to be transformed.
   * @returns {string} - The transformed string with the first letter capitalized and spaces removed.
   */
  export function getAddressString(string) {
    if (!string) return string; // Return the original string if it's empty
    return capitalizeFirstLetter(string).replace(/\s+/g, ''); // Capitalize and remove spaces
  }