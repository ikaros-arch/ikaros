import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from 'services/store';
import { NavButton, AccordionNav } from 'components/buttons/NavButton';
import {
  DocumentaryIcon,
  LiteraryIcon,
  ArchIcon,
  VisualIcon,
  OverviewIcon,
  RelationshipIcon,
  TermIcon,
  MediaIcon,
  MapIcon,
  AboutIcon,
  ContextIcon,
  TrenchIcon,
  SettingsIcon,
  NotesIcon,
  FindIcon,
  BagIcon,
  HomeIcon,
  LineIcon,
  TractIcon,
  ScapeIcon,
  FeatureIcon,
  SampleIcon,
  ResourceIcon,
  PotteryIcon,
  ObsidianIcon,
  AnimalBoneIcon,
  HumanBoneIcon,
  FishIcon,
  ShellIcon,
  FlotationIcon,
  SeedIcon,
  CharcoalIcon,
  MicromorphologyIcon,
  ResidueIcon,
  RadiocarbonIcon,
  PhytolithIcon,
  SoilChemistryIcon,
  MetalIcon,
  TopoIcon,
  ApothikiIcon,
  AnalysisIcon,
  AuditIcon,
} from 'components/LocalIcons';

const SidebarComponent = ({ sidebarVisible, setSidebarVisible }) => {
  // Use useMemo to only get the value once on initial render
  // This behaves like getState() but follows hook rules
  const modules = useMemo(() => {
    return useStore.getState().modules;
  }, []);
  
  // Close the sidebar with the close button
  function w3_close() {
    setSidebarVisible(false);
  }

  useEffect(() => {
    // Get the Sidebar
    var menuSidebar = document.getElementById("menuSidebar");
    
    // Get the DIV with overlay effect
    var overlayBg = document.getElementById("myOverlay");

    if (sidebarVisible) {
      menuSidebar.style.display = 'block';
      overlayBg.style.display = 'block';
    } else {
      menuSidebar.style.display = 'none';
      overlayBg.style.display = 'none';
    }
  }, [sidebarVisible]);  

  return (
    <>
      <nav className="w3-sidebar w3-collapse w3-white w3-animate-left" style={{zIndex:1001,width:"200px"}} id="menuSidebar"><br />
        <div className="w3-bar-block">
          <Link className="w3-bar-item w3-button w3-padding-16 w3-hide-large w3-dark-grey w3-hover-black" onClick={() => w3_close()} title="close menu"><i className="fa fa-remove fa-fw"></i>  Close Menu</Link>

          {modules.includes("excavation") &&
            <>
              <NavButton linkTo='/' linkText='Home' LinkIcon={OverviewIcon} />
              <AccordionNav linkTo='/Context' linkText='Context' LinkIcon={ContextIcon} >
                <NavButton linkTo='/Context/Deposit' linkText='Deposit' LinkIcon={ContextIcon} />
                <NavButton linkTo='/Context/Fill' linkText='Fill' LinkIcon={ContextIcon} />
                <NavButton linkTo='/Context/GraveFill' linkText='Grave Fill' LinkIcon={ContextIcon} />
                <NavButton linkTo='/Context/Cut' linkText='Cut' LinkIcon={ContextIcon} />
                <NavButton linkTo='/Context/Surface' linkText='Surface' LinkIcon={ContextIcon} />
                <NavButton linkTo='/Context/Structure' linkText='Structure' LinkIcon={ContextIcon} />
              </AccordionNav> 
              <NavButton linkTo='/Trench' linkText='Trench' LinkIcon={TrenchIcon} />
              <NavButton linkTo='/Find' linkText='Find' LinkIcon={FindIcon} />
              <AccordionNav linkTo='/Bag' linkText='Bag' LinkIcon={BagIcon} accordion>
                <NavButton linkTo='/Bag/Pottery' linkText='Pottery' LinkIcon={PotteryIcon} />
                <NavButton linkTo='/Bag/Obsidian' linkText='Obsidian' LinkIcon={ObsidianIcon} />
                <NavButton linkTo='/Bag/Bone_animal' linkText='Animal Bone' LinkIcon={AnimalBoneIcon} />
                <NavButton linkTo='/Bag/Bone_human' linkText='Human Bone' LinkIcon={HumanBoneIcon} />
                <NavButton linkTo='/Bag/Fish' linkText='Fish' LinkIcon={FishIcon} />
                <NavButton linkTo='/Bag/Shell' linkText='Shell' LinkIcon={ShellIcon} />
                <NavButton linkTo='/Bag/Flotation' linkText='Flotation' LinkIcon={FlotationIcon} />
                <NavButton linkTo='/Bag/Seeds' linkText='Seed' LinkIcon={SeedIcon} />
                <NavButton linkTo='/Bag/Charcoal' linkText='Charcoal' LinkIcon={CharcoalIcon} />
                <NavButton linkTo='/Bag/Micromorphology' linkText='Micromorphology' LinkIcon={MicromorphologyIcon} />
                <NavButton linkTo='/Bag/Residue' linkText='Residue' LinkIcon={ResidueIcon} />
                <NavButton linkTo='/Bag/Radiocarbon' linkText='Radiocarbon' LinkIcon={RadiocarbonIcon} />
                <NavButton linkTo='/Bag/Phytolith' linkText='Phytolith' LinkIcon={PhytolithIcon} />
                <NavButton linkTo='/Bag/Soil_chemistry' linkText='Soil Chemistry' LinkIcon={SoilChemistryIcon} />
                <NavButton linkTo='/Bag/Metal' linkText='Metal' LinkIcon={MetalIcon} />
              </AccordionNav>
              <AccordionNav linkTo='/Analysis' linkText='Analysis' LinkIcon={AnalysisIcon} accordion>
                <NavButton linkTo='/Analysis/Pottery' linkText='Pottery' LinkIcon={PotteryIcon} />
                <NavButton linkTo='/Analysis/Obsidian' linkText='Obsidian' LinkIcon={ObsidianIcon} />
                <NavButton linkTo='/Analysis/Bone_animal' linkText='Animal Bone' LinkIcon={AnimalBoneIcon} />
                <NavButton linkTo='/Analysis/Bone_human' linkText='Human Bone' LinkIcon={HumanBoneIcon} />
                <NavButton linkTo='/Analysis/Fish' linkText='Fish' LinkIcon={FishIcon} />
                <NavButton linkTo='/Analysis/Shell' linkText='Shell' LinkIcon={ShellIcon} />
                <NavButton linkTo='/Analysis/Flotation' linkText='Flotation' LinkIcon={FlotationIcon} />
                <NavButton linkTo='/Analysis/Seeds' linkText='Seed' LinkIcon={SeedIcon} />
                <NavButton linkTo='/Analysis/Charcoal' linkText='Charcoal' LinkIcon={CharcoalIcon} />
                <NavButton linkTo='/Analysis/Micromorphology' linkText='Micromorphology' LinkIcon={MicromorphologyIcon} />
                <NavButton linkTo='/Analysis/Residue' linkText='Residue' LinkIcon={ResidueIcon} />
                <NavButton linkTo='/Analysis/Radiocarbon' linkText='Radiocarbon' LinkIcon={RadiocarbonIcon} />
                <NavButton linkTo='/Analysis/Phytolith' linkText='Phytolith' LinkIcon={PhytolithIcon} />
                <NavButton linkTo='/Analysis/Soil_chemistry' linkText='Soil Chemistry' LinkIcon={SoilChemistryIcon} />
                <NavButton linkTo='/Analysis/Metal' linkText='Metal' LinkIcon={MetalIcon} />
              </AccordionNav>
              <NavButton linkTo='/Topo' linkText='Topo Point' LinkIcon={TopoIcon} />
              <NavButton linkTo='/Relationships' linkText='Relationships' LinkIcon={RelationshipIcon} />
              <NavButton linkTo='/Vocabulary/Term' linkText='Vocabulary' LinkIcon={TermIcon} />
              <NavButton linkTo='/Media' linkText='Media' LinkIcon={MediaIcon} />
              <NavButton linkTo='/Apothiki' linkText='Apothiki' LinkIcon={ApothikiIcon} />
              <NavButton linkTo='/Notes' linkText='Notes' LinkIcon={NotesIcon} />
            </>
          }
          {modules.includes("survey") &&
            <>
              <NavButton linkTo='/' linkText='Home' LinkIcon={HomeIcon} />
              <NavButton linkTo='/surv_line' linkText='Line' LinkIcon={LineIcon} />
              <NavButton linkTo='/surv_tract' linkText='Tract' LinkIcon={TractIcon} />
              <NavButton linkTo='/surv_scape' linkText='Scape' LinkIcon={ScapeIcon} />
              <NavButton linkTo='/surv_feature' linkText='Feature' LinkIcon={FeatureIcon} />
              <NavButton linkTo='/surv_sample' linkText='Sample' LinkIcon={SampleIcon} />
              <NavButton linkTo='/surv_map' linkText='Map' LinkIcon={MapIcon} />
              <NavButton linkTo='/surv_resource' linkText='Resources' LinkIcon={ResourceIcon} />
            </>
          }
          {modules.includes("mima") &&
            <>
              <NavButton linkTo='/' linkText='Overview' LinkIcon={OverviewIcon} />
              <NavButton linkTo='/Documentary' linkText='Documentary' LinkIcon={DocumentaryIcon} />
              <NavButton linkTo='/Literary' linkText='Literary' LinkIcon={LiteraryIcon} />
              <NavButton linkTo='/Archaeological' linkText='Archaeological' LinkIcon={ArchIcon} />
              <NavButton linkTo='/Visual' linkText='Visual' LinkIcon={VisualIcon} />
              <NavButton linkTo='/Relationships' linkText='Relationships' LinkIcon={RelationshipIcon} />
              <NavButton linkTo='/Vocabulary/Term' linkText='Vocabulary' LinkIcon={TermIcon} />
              <NavButton linkTo='/Media' linkText='Media' LinkIcon={MediaIcon} />
              <NavButton linkTo='/Map' linkText='Map' LinkIcon={MapIcon} />
            </>
          }
          <NavButton linkTo='/Audit' linkText='Audit' LinkIcon={AuditIcon} />
          <NavButton linkTo='/About' linkText='About' LinkIcon={AboutIcon} />
          <NavButton linkTo='/Settings' linkText='Settings' LinkIcon={SettingsIcon} />
        </div>
      </nav>
      
      {//Overlay effect when opening sidebar on small screens
      }
      <div className="w3-overlay w3-hide-large w3-animate-opacity" onClick={() => w3_close()} style={{cursor:"pointer"}} title="close side menu" id="myOverlay">
      </div>
    </>
  );
};

// Create a named export for clarity
const Sidebar = React.memo(SidebarComponent);

export default Sidebar;
