import React from 'react';
import { ScrollSheet } from 'components/layout/Sheets';
import CrudButtons from 'components/buttons/DesktopCrudButtons';

const LeftEmpty = () => {
    return (
      <ScrollSheet id="form">
        <CrudButtons rowSelected={false} />
      </ScrollSheet>
    );
};

export default LeftEmpty