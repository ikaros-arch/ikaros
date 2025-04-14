import React from 'react';
import { isTablet, isMobile } from 'react-device-detect';
import PropTypes from 'prop-types';
import { blueGrey, grey } from '@mui/material/colors';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import Tooltip from '@mui/material/Tooltip';
import { scrollto } from 'helpers/navHelpers';
import { useStore } from 'services/store';
import {
  MeasureIcon,
  RelationshipIcon,
  MapIcon,
  AuditIcon,
  SpecialistIcon,
  ContextInfoIcon,
  ShapeIcon,
  ASUIcon,
  AnalysisIcon
} from 'components/LocalIcons';

/**
 * NavMenu Component
 *
 * A reusable navigation component that displays a series of menu items.
 * Each menu item includes an icon and a target for scrolling.
 * The component renders with different sizes based on touch capability.
 *
 * @param {Object} props
 * @param {Array} props.menuItems - An array of objects representing menu items.
 * @param {string} [props.menuItems[].iconClass] - The CSS class for the icon.
 * @param {React.Component} [props.menuItems[].Icon] - The Icon component.
 * @param {string} props.menuItems[].scrollTarget - The target section to scroll to when clicked.
 * @param {string} [props.additionalClasses] - Additional CSS classes for the outer div.
 *
 * @returns {JSX.Element} The rendered navigation component.
 *
 * @example
 * // Example usage:
 *  
 * const menuItems = [
 *   { iconClass: 'fa fa-info-circle fa-fw', scrollTarget: 'info', onClick: customFunction },
 *   { Icon: SomeMuiIcon, scrollTarget: 'translation', onClick: customFunction },
 *   { iconClass: 'fa fa-comment fa-fw', scrollTarget: 'commentary', onClick: customFunction }
 * ];
 *
 * <NavMenu menuItems={menuItems} additionalClasses="leftMenu" />
 */
export const NavMenu = ({ menuItems, additionalClasses }) => { 
  const modules = useStore.getState().modules;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  let sizeClass = 'mouseMenu';
  let tooltipFontSize = '1em';
  let iconSize = 32;
  if (isTablet || (modules && modules.includes("mima"))) {
    sizeClass = 'touchMenu';
    tooltipFontSize = '1.5em';
    iconSize= 48;
  }

  if (isMobile) {
    return (
      <SpeedDial
      ariaLabel="Mobile menu"
      sx={{ 
        position: 'fixed', 
        bottom: 64, 
        right: additionalClasses === 'leftMenu' ? 'auto' : 16, 
        left: additionalClasses === 'leftMenu' ? 16 : 'auto' 
      }}
      FabProps={{ color: blueGrey[100] }}
      icon={<SpeedDialIcon />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
      >
      {menuItems.map((item, index) => (
        <SpeedDialAction
        key={index}
        icon={item.Icon ? <item.Icon /> : <span className={item.iconClass} />}
        tooltipTitle={item.title}
        tooltipOpen
        tooltipPlacement={additionalClasses === 'leftMenu' ? "right" : "left"}
        onClick={() => { 
          item.onClick ? item.onClick() : scrollto(item.scrollTarget);
        }}
        />
      ))}
      </SpeedDial>
    )
  }

  return (
    <div 
      className={`${additionalClasses} ${sizeClass} w3-center w3-dark-grey`}>
      {menuItems.map((item, index) => (
        <Tooltip
          key={index}
          placement={additionalClasses === 'leftMenu' ? "right" : "left" }
          title={<span style={{ fontSize: tooltipFontSize }}>{item.title}</span>}
          enterTouchDelay={0}
          leaveTouchDelay={750}
          arrow
        >
          <span
            key={index}
            className="w3-transparent w3-hover-shadow"
            onClick={() => item.onClick ? item.onClick() : scrollto(item.scrollTarget)}
            style={{ cursor: "pointer" }}
          >
            {item.Icon ? <item.Icon size={iconSize} /> : <span className={`${item.iconClass} ${sizeClass}`} />}
          </span>
        </Tooltip>
      ))}
    </div>
  );
};

NavMenu.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      iconClass: PropTypes.string,
      Icon: PropTypes.elementType,
      scrollTarget: PropTypes.string,
      onClick: PropTypes.func,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
  additionalClasses: PropTypes.string,
};

export const NavLeft = ({ menuItems }) => {  
    return (
      <NavMenu menuItems={menuItems} additionalClasses="leftMenu" />
    );
};
  
export const NavRight = ({ menuItems }) => {  
    return (
      <NavMenu menuItems={menuItems} additionalClasses="w3-display-right w3-margin rightMenu" />
    );
};

export const menuDefs = {
  map: { iconClass: 'fa fa-map-o fa-fw', scrollTarget: 'map', title: 'Map' },
  maptest: { Icon: MapIcon, scrollTarget: 'maptest', title: 'Map-Test' },
  rel: { Icon: RelationshipIcon, scrollTarget: 'rel', title: 'Relationships' },
  asu: { Icon: ASUIcon, scrollTarget: 'asu', title: 'ASUs' },
  images: { iconClass: 'fa fa-picture-o fa-fw', scrollTarget: 'images', title: 'Images' },
  biblio: { iconClass: 'fa fa-book fa-fw', scrollTarget: 'biblio', title: 'Bibliography' },
  documents: { iconClass: 'fa fa-file-text-o fa-fw', scrollTarget: 'documents', title: 'Documents' },
  links: { iconClass: 'fa fa-link fa-fw', scrollTarget: 'links', title: 'Links' },
  audit: { Icon: AuditIcon, scrollTarget: 'audit', title: 'Audit' },
  table: { iconClass: 'fa fa-list fa-fw', scrollTarget: 'table', title: 'List' },
  threed: { iconClass: 'fa fa-cube fa-fw', scrollTarget: '3d', title: '3d' },
  viewer: { iconClass: 'fa fa-link fa-fw', scrollTarget: 'viewer', title: 'Viewer' },

  records: { iconClass: 'fa fa-list fa-fw', scrollTarget: 'records', title: 'Linked Records' },
  orcid: { iconClass: 'fa fa-link fa-fw', scrollTarget: 'orcid', title: 'ORCID' },
  contextinfo: {Icon: ContextInfoIcon, scrollTarget: 'contextinfo', title: 'Contextual Info' },
  baginfo: {Icon: ContextInfoIcon, scrollTarget: 'baginfo', title: 'General bag Info' },
  gendesc: { iconClass: 'fa fa-comment fa-fw', scrollTarget: 'gendesc', title: 'General Description' },
  spesdesc: { Icon: SpecialistIcon, scrollTarget: 'spesdesc',  title: 'Specialist description' },
  physdesc: { Icon: MeasureIcon, scrollTarget: 'physdesc',  title: 'Physical description' },
  shape: { Icon: ShapeIcon, scrollTarget: 'shape', title: 'Shape' },
  bagdetails: { Icon: SpecialistIcon, scrollTarget: 'bagdetails',  title: 'Type-specific details' },
  objectanalysis: { Icon: AnalysisIcon, scrollTarget: 'objectanalysis',  title: 'Object analysis' },


  info: { iconClass: 'fa fa-info-circle fa-fw', scrollTarget: 'info', title: 'Basic information' },
  commentary: { iconClass: 'fa fa-comment fa-fw', scrollTarget: 'commentary', title: 'Commentary' },
  translation: { iconClass: 'fa fa-language fa-fw', scrollTarget: 'translation', title: 'Translation' },
  original: { iconClass: 'fa fa-align-center fa-fw', scrollTarget: 'original', title: 'Original Text' },
};
