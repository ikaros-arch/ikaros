import React from 'react';
import { useNavigate  } from 'react-router-dom';
import {
  ContextIcon,
  TrenchIcon,
  FindIcon,
  BagIcon,
} from 'components/LocalIcons';

const SurveyMenu = () => {
  const navigate = useNavigate();

  const handlePress = (target) => {
    navigate(target);
  };

  return (
    <div className="w3-row  w3-padding">
      <button 
        className="w3-button w3-card-4 w3-col m6 " 
        style={{marginBottom: "2vh", padding: "5vh"}}
        onClick={() => handlePress('/add_context')}>
        <ContextIcon size={104}/> <br/>Add Context
      </button>
      <button
        className="w3-button w3-card-4 w3-col m6" 
        style={{marginBottom: "2vh", padding: "5vh"}}
        onClick={() => handlePress('/add_trench')}>
        <TrenchIcon size={104}/><br/>Add Tract
      </button>
      <button
        className="w3-button w3-card-4 w3-col m6" 
        style={{marginBottom: "2vh", padding: "5vh"}}
        onClick={() => handlePress('/add_find')}>
        <FindIcon size={104}/><br/>Add Find
      </button>
      <button
        className="w3-button w3-card-4 w3-col m6" 
        style={{marginBottom: "2vh", padding: "5vh"}}
        onClick={() => handlePress('/Bag/Add')}>
        <BagIcon size={104}/><br/>Add Bag
      </button>
    </div>
  );
};

export default SurveyMenu;
