  /**
   * Checks if a given string is a valid UUID.
   *
   * A UUID (Universally Unique Identifier) is a 128-bit number used to identify information in computer systems.
   * This function uses a regular expression to validate the format of the UUID.
   *
   * @param {string} str - The string to be checked.
   * @returns {boolean} - Returns true if the string is a valid UUID, otherwise false.
   */
  export function isUUID(str) {
    const regexp = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return regexp.test(str);
  }