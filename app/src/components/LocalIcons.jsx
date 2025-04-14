import React from "react";
import SvgIcon from '@mui/material/SvgIcon';
import { 
  mdiScript,
  mdiBookshelf,
  mdiBank,
  mdiEye,
  mdiSetAll,
  mdiSitemap,
  mdiPuzzle,
  mdiImageMultiple,
  mdiMap,
  mdiInformationVariant,
  mdiCog,
  mdiLayersTriple,
  mdiRhombusSplitOutline,
  mdiNotebookOutline,
  mdiViolin,
  mdiSack,
  mdiSetSquare,
  mdiClipboardTextSearch,
  mdiTapeMeasure,
  mdiClipboardEdit,
  mdiTextBox,
  mdiCrosshairsGps
} from '@mdi/js';
import { SiObsidian } from "react-icons/si";
import {
  GiBrokenPottery,
  GiFishbone,
  GiJawbone,
  GiRibcage,
  GiSpiralShell,
  GiPlantSeed,
  GiStonePile,
  GiAtom,
  GiSpikedShell,
  GiAbstract070,
  GiMetalBar
} from "react-icons/gi";
import {
  FaFlaskVial,
  FaGlassWater,
  FaMagnifyingGlassChart
} from "react-icons/fa6";
import { MdShelves } from "react-icons/md";
import { PiSubtractSquare } from "react-icons/pi";
import BiotechIcon from '@mui/icons-material/Biotech';

function LocalIcon({ size = 24, path }) {
  return (
    <SvgIcon
    sx={{ fontSize: size }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={0.2}
        stroke="currentColor"
        style={{ verticalAlign: "middle" }}
      >
        <path d={path} />
      </svg>
    </SvgIcon>
  );
}

export function OverviewIcon({ size }) {
  return <LocalIcon size={size} path={mdiSetAll} />;
}

export function ContextIcon({ size }) {
  return <LocalIcon size={size} path={mdiLayersTriple} />;
}

export function ASUIcon({ size }) {
  return <PiSubtractSquare size={size} />;
}

export function TrenchIcon({ size }) {
  return <LocalIcon size={size} path={mdiRhombusSplitOutline} />;
}

export function DocumentaryIcon({ size }) {
  return <LocalIcon size={size} path={mdiScript} />;
}

export function LiteraryIcon({ size }) {
  return <LocalIcon size={size} path={mdiBookshelf} />;
}

export function ArchIcon({ size }) {
  return <LocalIcon size={size} path={mdiBank} />;
}

export function VisualIcon({ size }) {
  return <LocalIcon size={size} path={mdiEye} />;
}

export function RelationshipIcon({ size }) {
  return <LocalIcon size={size} path={mdiSitemap} />;
}

export function TermIcon({ size }) {
  return <LocalIcon size={size} path={mdiPuzzle} />;
}

export function MediaIcon({ size }) {
  return <LocalIcon size={size} path={mdiImageMultiple} />;
}

export function MapIcon({ size }) {
  return <LocalIcon size={size} path={mdiMap} />;
}

export function ApothikiIcon({ size }) {
  return <MdShelves size={size} />;
}

export function AnalysisIcon({ size }) {
  return <FaMagnifyingGlassChart size={size} />;
}

export function AboutIcon({ size }) {
  return <LocalIcon size={size} path={mdiInformationVariant} />;
}

export function SettingsIcon({ size  }) {
  return <LocalIcon size={size} path={mdiCog} />;
}

export function NotesIcon({ size }) {
  return <LocalIcon size={size} path={mdiNotebookOutline} />;
}

export function FindIcon({ size }) {
  return <LocalIcon size={size} path={mdiViolin} />;
}

export function TopoIcon({ size }) {
  return <LocalIcon size={size} path={mdiCrosshairsGps} />;
}

export function BagIcon({ size }) {
  return <LocalIcon size={size} path={mdiSack} />;
}

export function PotteryIcon({ size }) {
  return <GiBrokenPottery size={size} />;
}

export function ObsidianIcon({ size }) {
  return <SiObsidian size={size} />;
}

export function AnimalBoneIcon({ size }) {
  return <GiJawbone size={size} />;
}

export function HumanBoneIcon({ size }) {
  return <GiRibcage size={size} />;
}

export function FishIcon({ size }) {
  return <GiFishbone size={size} />;
}

export function ShellIcon({ size }) {
  return <GiSpiralShell size={size} />;
}

export function FlotationIcon({ size }) {
  return <FaGlassWater size={size} />;
}

export function SeedIcon({ size }) {
  return <GiPlantSeed size={size} />;
}

export function CharcoalIcon({ size }) {
  return <GiStonePile size={size} />;
}

export function MicromorphologyIcon({ size }) {
  return <GiAbstract070 size={size} />;
}

export function ResidueIcon({ size }) {
  return <FaFlaskVial size={size} />;
}

export function RadiocarbonIcon({ size }) {
  return <GiAtom size={size} />;
}

export function PhytolithIcon({ size }) {
  return <GiSpikedShell size={size} />;
}

export function SoilChemistryIcon({ size }) {
  return <BiotechIcon sx={{ fontSize: size }} />;
}

export function MetalIcon({ size }) {
  return <GiMetalBar size={size} />;
}

export function MeasureIcon({ size }) {
  return <LocalIcon size={size} path={mdiSetSquare} />;
}

export function ShapeIcon({ size }) {
  return <LocalIcon size={size} path={mdiTapeMeasure} />;
}

export function HomeIcon({ size = 24 }) {
  return <i className="fa fa-home fa-fw" style={{ fontSize: size }}></i>;
}
export function LineIcon({ size = 24 }) {
  return <i className="fa fa-long-arrow-up fa-fw" style={{ fontSize: size }}></i>;
}

export function TractIcon({ size = 24 }) {
  return <i className="fa fa-square-o fa-fw" style={{ fontSize: size }}></i>;
}

export function ScapeIcon({ size = 24 }) {
  return <i className="fa fa-bullseye fa-fw" style={{ fontSize: size }}></i>;
}

export function FeatureIcon({ size = 24 }) {
  return <i className="fa fa-map-marker fa-fw" style={{ fontSize: size }}></i>;
}

export function SampleIcon({  size = 24 }) {
  return <BiotechIcon sx={{ fontSize: size }} />;
}

export function ResourceIcon({ size = 24 }) {
  return <i className="fa fa-book fa-fw" style={{ fontSize: size }}></i>;
}

export function AuditIcon({ size }) {
  return <LocalIcon size={size} path={mdiClipboardTextSearch} />;
}

export function SpecialistIcon({ size = 24 }) {
  return <BiotechIcon sx={{ fontSize: size }} />;
}

export function ContextInfoIcon({ size }) {
  return <LocalIcon size={size} path={mdiClipboardEdit} />;
}

export function DescriptionIcon({ size }) {
  return <LocalIcon size={size} path={mdiTextBox} />;
}