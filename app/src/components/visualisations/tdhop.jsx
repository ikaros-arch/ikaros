import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useStore } from 'services/store';
import { ScrollSheet } from "components/layout/Sheets";

function Tdhop() {
  const containerRef = useRef(null);
  const [viewerContent, setViewerContent] = useState(null);
  const domain = useStore(state => state.env.domainName);

  const fetchViewerContent = async () => {
    try {
      const response = await fetch(`${domain}/resources/3dviewer/start.html`);
      if (!response.ok) {
        throw new Error(`Failed to fetch viewer content: ${response.status}`);
      }
      const htmlContent = await response.text();
      setViewerContent(htmlContent);
    } catch (error) {
      console.error('Error fetching viewer content:', error);
    }
  };

  useEffect(() => {
    fetchViewerContent();
  }, []);

  useEffect(() => {
    if (containerRef.current && viewerContent) {
      const processedContent = processHTMLContent(viewerContent); // Optional processing
      const portalContent = (
        <>
          <link type="text/css" rel="stylesheet" href={`https://${domain}/resources/3dviewer/stylesheet/3dhop.css`}/>
          <script type="text/javascript" src={`https://${domain}/resources/3dviewer/js/spidergl.js`}></script>
          <script type="text/javascript" src={`https://${domain}/resources/3dviewer/js/jquery.js`}></script>
          <script type="text/javascript" src={`https://${domain}/resources/3dviewer/js/presenter.js`}></script>
          <script type="text/javascript" src={`https://${domain}/resources/3dviewer/js/nexus.js`}></script>
          <script type="text/javascript" src={`https://${domain}/resources/3dviewer/js/ply.js`}></script>
          <script type="text/javascript" src={`https://${domain}/resources/3dviewer/js/trackball_turntable.js`}></script>
          <script type="text/javascript" src={`https://${domain}/resources/3dviewer/js/trackball_turntable_pan.js`}></script>
          <script type="text/javascript" src={`https://${domain}/resources/3dviewer/js/trackball_pantilt.js`}></script>
          <script type="text/javascript" src={`https://${domain}/resources/3dviewer/js/trackball_sphere.js`}></script>
          <script type="text/javascript" src={`https://${domain}/resources/3dviewer/js/init.js`}></script>        
          <div dangerouslySetInnerHTML={{ __html: processedContent }} />
        </>
      );
      ReactDOM.createPortal(portalContent, containerRef.current);
    }
  }, [containerRef.current, viewerContent]);

  return (
    <ScrollSheet id="3d" >
      {/* Other content in your component */}
      <div ref={containerRef} />  {/* Container element for the portal */}
    </ScrollSheet>
  );
}

function processHTMLContent(htmlString) {
  // This function can optionally process the HTML content before rendering (e.g., adjust paths)
  // You can modify script and link tags to point to local dependencies within your React project
  // ... processing logic ...
  return htmlString;
}

export default Tdhop;
