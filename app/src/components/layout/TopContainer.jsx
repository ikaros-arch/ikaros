import React from 'react';
import { useKeycloak } from '@react-keycloak/web';

const TopContainer = ({setSidebarVisible}) => {
  const { keycloak } = useKeycloak();

  function w3_open() {
    setSidebarVisible(true);
    console.log("Open sidebar");
  };

  return (
    <div className="w3-bar w3-top w3-black w3-large" style={{zIndex: 1002}}>
      <button className="w3-bar-item w3-button w3-hide-large w3-hover-none w3-hover-text-light-grey" onClick={() => w3_open()}>
        <i className="fa fa-bars"></i>  Menu
      </button>
      <button className="w3-bar-item w3-button w3-right">
        <i className="fa fa-user"></i> {keycloak.tokenParsed?.preferred_username}
      </button>
      <button className="w3-bar-item w3-button w3-right" type="button" onClick={() => keycloak.logout()}>
        Logout
      </button>
    </div>
  );
};

export default TopContainer;