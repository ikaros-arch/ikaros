import React from 'react';
import { useNavigate  } from 'react-router-dom';

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
        onClick={() => handlePress('/surv_line')}>
        <i className="fa fa-angle-double-up" style={{fontSize: "18vmin"}}></i><br/ >Add Line
      </button>    
      <button 
        className="w3-button w3-card-4 w3-col m6" 
        style={{marginBottom: "2vh", padding: "5vh"}}
        onClick={() => handlePress('/surv_tract')}>
        <i className="fa fa-square-o" style={{fontSize: "18vmin"}}></i><br/ >Add Tract
      </button> 
      <button 
        className="w3-button w3-card-4 w3-col m6" 
        style={{marginBottom: "2vh", padding: "5vh"}}
        onClick={() => handlePress('/surv_feature')}>
        <i className="fa fa-map-marker" style={{fontSize: "18vmin"}}></i><br/ >Add Feature
      </button>    
      <button 
        className="w3-button w3-card-4 w3-col m6" 
        style={{marginBottom: "2vh", padding: "5vh"}}
        onClick={() => handlePress('/surv_scape')}>
        <i className="  fa fa-bullseye" style={{fontSize: "18vmin"}}></i><br/ >Add Scape
      </button>       
    </div>
  );
};

export default SurveyMenu;
