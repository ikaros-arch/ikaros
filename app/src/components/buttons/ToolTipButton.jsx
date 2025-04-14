import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

/**
 * ToolTipButton
 * 
 * This is a higher-order component that wraps around Material-UI input components (e.g., TextField, Checkbox)
 * to provide additional information through an info button with a popover, if a tooltip text is provided.
 * 
 * The tooltip text can contain URLs, which will be rendered as clickable links in the popover.
 * Max width of the popover is set to 30vw, and the text will wrap if it exceeds the width. The tooltip 
 * also respects line breaks and white-spaces in the text.
 * 
 * Props:
 * - children (ReactNode): The input component to be wrapped by this HOC.
 * - toolTip (string): The tooltip text to be displayed in the popover when the info button is clicked. 
 *   If not provided, the component will render its children directly without any extra elements.
 * 
 * Usage Example:
 * 
 * import React, { useState } from 'react';
 * import TextField from '@mui/material/TextField';
 * import Checkbox from '@mui/material/Checkbox';
 * import FormControlLabel from '@mui/material/FormControlLabel';
 * import ToolTipButton from 'components/buttons/ToolTipButton';
 * import Box from '@mui/material/Box';
 * 
 * const App = () => {
 *   const [inputValue, setInputValue] = useState('');
 *   const [checkboxValue, setCheckboxValue] = useState(false);
 * 
 *   return (
 *     <Box sx={{ padding: 2 }}>
 *       <ToolTipButton toolTip="Additional information about this text field.">
 *         <TextField
 *           label="Example Text Field"
 *           variant="outlined"
 *           value={inputValue}
 *           onChange={(e) => setInputValue(e.target.value)}
 *           fullWidth
 *           sx={{ mb: 2 }}
 *         />
 *       </ToolTipButton>
 * 
 *       <ToolTipButton toolTip="Additional information about this checkbox.">
 *         <FormControlLabel
 *           control={
 *             <Checkbox
 *               checked={checkboxValue}
 *               onChange={(e) => setCheckboxValue(e.target.checked)}
 *             />
 *           }
 *           label="Example Checkbox"
 *         />
 *       </ToolTipButton>
 *     </Box>
 *   );
 * };
 * 
 * export default App;
 * 
 * In this example, the ToolTipButton component is used to wrap around a TextField and a Checkbox component
 * to provide additional information through a popover. Simply provide the toolTip prop to display the desired 
 * information in the popover.
 * 
 */

const ToolTipButton = ({ children, toolTip }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  // If no tooltip is provided, return the children directly
  if (!toolTip) {
    return children;
  }

  const handleInfoClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleInfoClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const renderToolTip = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <Link key={index} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </Link>
        );
      }
      return part + ' ';
    });
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {children}
      <IconButton
        size="small"
        aria-describedby={id}
        onClick={handleInfoClick}
        sx={{
          position: 'absolute',
          top: -5,
          right: -5,
        }}
      >
        <InfoIcon fontSize="small" />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleInfoClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, maxWidth: '30vw' }}>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {renderToolTip(toolTip)}
          </Typography>
        </Box>
      </Popover>
    </Box>
  );
};

export default ToolTipButton;
