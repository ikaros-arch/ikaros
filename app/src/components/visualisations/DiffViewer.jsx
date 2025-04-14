import React from 'react';
import { createTwoFilesPatch } from 'diff';
import { html } from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';

const DiffViewer = ({ oldData, newData }) => {
  if (!oldData || !newData) {
    return <p>No data to compare.</p>;
  }

  // Generate the diff string using the `diff` library
  const diffString = createTwoFilesPatch('Old Data', 'New Data', oldData, newData);

  // Render the diff using `diff2html`
  const diffHtml = html(diffString, {
    inputFormat: 'diff',
    showFiles: false,
    drawFileList: false,
    matching: 'lines',
    outputFormat: 'side-by-side',
  });

  return (
    <div className="fill-most">
      <div
        dangerouslySetInnerHTML={{
          __html: diffHtml,
        }}
      />
    </div>
  );
};

export default DiffViewer;
