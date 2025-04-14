// authHelpers.js
/**
 * Checks if the user has a specific role in Keycloak.
 * 
 * @param {Object} keycloak - The Keycloak instance.
 * @param {string} role - The role to check for.
 * @returns {boolean} - True if the user has the role, false otherwise.
 */
export function hasRole(keycloak, role) {
  //console.log(keycloak?.resourceAccess?.mima?.roles)
  //console.log(keycloak?.hasResourceRole(role, 'mima'))
  return Boolean(keycloak && keycloak.realmAccess && keycloak.realmAccess.roles.includes(role));
}
