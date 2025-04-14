import React from 'react';
import Typography from '@mui/material/Typography'; 

/**
 * PageHeader Component
 *
 * A reusable header component that displays a title with an optional icon
 * and a button to open the table list view. This component abstracts away the common header structure
 * while allowing for specified icon and title customization.
 *
 * @param {Object} props
 * @param {React.ElementType} props.IconComponent - The icon component to display alongside the title.
 * @param {string} props.title - The title text to display in the header.
 * @param {function} props.setTableOpen - The function to set the state of whether the table view is open or not.
 * @param {Object} props.currData - The currently selected data.
 *
 * @returns {JSX.Element} The rendered header component.
 *
 * @example
 * import PageHeader from './PageHeader';
 * import MyIcon from './MyIcon';
 * const MyComponent = ({ navigate, entryId }) => {
 *   const { setTableOpen } = useStore();
 *   return (
 *     <div>
 *       <PageHeader
 *         IconComponent={MyIcon}
 *         title="My Title"
 *         setTableOpen={setTableOpen}
 *         currData={currData}
 *       />
 *     </div>
 *   );
 * };
 */
const PageHeader = ({ IconComponent, title, setTableOpen, currData }) => {
  return (
    <header className="w3-container">
      <Typography variant="h5" gutterBottom>
        <IconComponent /> {title}{currData && ` \u2014 ${currData.entry_id}:  ${currData.entry_name}`}
      </Typography>
      <a href="#" className="w3-bar-item w3-button w3-padding w3-right" type="button" onClick={() => setTableOpen(true)}>
        <i className="fa fa-list fa-fw"></i> View list
      </a>
    </header>
  );
};

export default PageHeader;
