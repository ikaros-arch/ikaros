import React, { useState, useMemo } from 'react';
import { ViewTable } from 'components/layout/Table';
import { colDef } from 'helpers/tableRenders';


const RecordsTable = ({ currData, parent }) => {
  console.log("Render RecordsTable")
  const [listTable, setListTable] = useState('v_all_data');  
  
  const listCcolumns = [
    colDef.uuid,
    colDef.link,
    colDef.id,
    colDef.entryName,
    colDef.placeName,
    colDef.completeBool,
  ]

  const getTableBasedOnType = (type) => {
    if (type?.startsWith('doc_')) {
      return 'v_documentary';
    } else if (type?.startsWith('arch_')) {
      return 'v_archaeological';
    } else if (type?.startsWith('viz_')) {
      return 'v_visual';
    }
    return 'v_all_data';
  };

  const getQueryBasedOnType = (type, uuid) => {
    // Check if the term_type is a regular UUID or UUID[].  
    const arrayTermTypes = ["index_topic", "keyword", "tag"]; 

    if(uuid){
      if(arrayTermTypes.includes(type)) {
        // For UUID arrays, use 'contains' operation rather than 'equals'.
        return `?${type}=cs.{"${uuid}"}`;  
      } else {
        // For regular UUIDs, just append the term_type and uuid to the query string.
        return `?${type}=eq.${uuid}`;
      }    
    } else {
      return '';
    }
  };

  useMemo(() => {
    const uuid = currData?.uuid;
    if (parent === 'term') {
      const termType = currData?.term_type;
      const table = getTableBasedOnType(termType);
      const query = getQueryBasedOnType(termType, uuid);  
      setListTable(`${table}${query}`)
    } else if (parent === 'place') {
      setListTable(`v_all_data?place_uuid=eq.${uuid}`)
    } else if (parent === 'actor') {
      setListTable(`v_all_data?updated_by_uuid=eq.${uuid}`)
      //NB: updated_by_uuid doesn't exist in theis view atm!
    } 
  }, [currData]);

  return (
    <ViewTable
      columns={listCcolumns}
      listTable={listTable}
    />
  );
};

export default RecordsTable;
