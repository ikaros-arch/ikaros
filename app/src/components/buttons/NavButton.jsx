import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Divider from '@mui/material/Divider';


export const NavButton = ({ linkTo, linkText, LinkIcon, accordion }) => {

  return (
    <NavLink to={linkTo} className={
      ({ isActive }) => `w3-bar-item w3-button w3-padding ${isActive ? 'w3-blue' : ''}` 
    } style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
        <LinkIcon />
      </div>
      <span style={{ flex: 1, marginLeft: '8px' }}>{linkText}</span> 
      {accordion && <i className="fa fa-caret-down fa-fw" style={{ marginLeft: 'auto' }}></i>}
    </NavLink>
  );
};

export const AccordionNav = ({ linkTo, linkText, LinkIcon, children }) => {
  const location = useLocation();

  return (
    <>
      <NavButton linkTo={linkTo} linkText={linkText} LinkIcon={LinkIcon} accordion/>
      {location.pathname.startsWith(linkTo) && (
        <>
          <Divider />
          {children}
          <Divider />
        </>
      )}
    </>
  );
};  