import React, { useEffect, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from 'services/store';
import TableDrawer from 'components/layout/TableDrawer';
import { colDef, standardColDef } from 'helpers/tableRenders';
import { TermIcon } from 'components/LocalIcons';
import { NavMenu } from 'components/layout/NavMenu';
import { PageContent } from 'components/layout/Sheets';
import PageHeader from 'components/layout/PageHeader';

const Terms = lazy(() => import('components/sheets/mima/MimaTerms'));
const Places = lazy(() => import('components/sheets/mima/MimaPlaces'));
const Actors = lazy(() => import('components/sheets/mima/MimaActors'));

const NavLeft = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const changeType = (newType) => {
    // This function changes the category while keeping the id the same.
    navigate(`/Vocabulary/${newType}/${id ? id : ''}`);
  };

  const leftMenuItems = [
    { iconClass: 'fa fa-language fa-fw', onClick: () => changeType('Term'), title: 'Term' },
    { iconClass: 'fa fa-map-marker fa-fw', onClick: () => changeType('Place'), title: 'Place' },
    { iconClass: 'fa fa-users fa-fw', onClick: () => changeType('Actor'), title: 'Actor' },
  ];

    return (
      <NavMenu menuItems={leftMenuItems} additionalClasses="leftMenu"  />
    );
};

const Vocabulary = () => {
  console.log("Render Vocabulary")
  const setTableOpen = useStore(state => state.setTableOpen);
  const vocabType = useStore(state => state.vocabType);
  const setVocabType = useStore(state => state.setVocabType);

  const { type } = useParams();

  useEffect(() => {
    if (type !== vocabType) {
      setVocabType(type);
    }
  }, [type, setVocabType]);

  const apiTable = 'list_vocab'

  const listColumns = [
    colDef.uuid,
    colDef.name,
    standardColDef('parent', 'Type'),
    standardColDef('type', 'Sub-Type'),
    colDef.authorities, 
  ];

  return (
    <>
      <PageHeader
        IconComponent={TermIcon}
        title="Vocabulary Sources"
        setTableOpen={setTableOpen}
      />
      <PageContent>
      { vocabType === 'Term' ?
        <Terms />
        : vocabType === 'Place' ?
        <Places />
        : vocabType === 'Actor' ?
        <Actors />
        : <Terms />
      }
        <NavLeft />
      </PageContent>
      <TableDrawer 
        columns={listColumns}
        listTable={apiTable}
        subCol={'parent'}
      />
    </>
  );
};

export default Vocabulary;
