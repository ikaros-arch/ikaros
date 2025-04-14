// src/services/keycloak.js
import Keycloak from 'keycloak-js';
import { useStore } from 'services/store';

const env = useStore.getState().env;
console.log(env);

const keycloakConfig = {
  url: env.kcUrl, // Replace with your Keycloak server URL
  realm: env.kcRealm,
  clientId: env.kcClient, // Replace with your client ID
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;