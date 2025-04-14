import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { LinearLoading } from "@/components/layout/Loading";
import { ScrollSheet } from "@/components/layout/Sheets";

export const Threed = ({ currData, parent }) => {
  console.log("Render Threed")
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (currData) {
      if (currData.link) {
        setSrc(currData.url);
      } else if (currData.filename) {
        setSrc(`/resources/3dviewer?model=${currData.filename}`);
      } else {
        setSrc(null); // Ensure src is reset if currData changes and doesn't have link or filename
      }
    } else {
      setSrc(null); // Reset src if currData is null
    }
  }, [currData]);

   // setSrc("/resources/3dviewer?model=gargo.nxz") // This is a placeholder for the actual 3D model URL

  if (!currData) {
    return (
      <ScrollSheet id="3d">
        <LinearLoading />
      </ScrollSheet>
    );
  }  
  if (!src) {
    return (
      <ScrollSheet id="3d">
        <Typography variant="h6" component="p"  sx={{ padding: 1 }}>
          No 3D model available.
        </Typography>
      </ScrollSheet>
    );
  } 
  return (
    <ScrollSheet id="3d" >
      <iframe 
        src={src} 
        scrolling="0" 
        frameBorder="0" 
        width="100%" 
        height="100%" 
        allow="autoplay; fullscreen; vr" 
        mozallowfullscreen="true" 
        webkitallowfullscreen="true"
      ></iframe>
    </ScrollSheet>
  );
};






