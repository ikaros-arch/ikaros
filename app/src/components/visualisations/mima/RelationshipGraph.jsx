import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { useStore } from 'services/store';
import {
  goToRecord
} from 'helpers/buttonActions';

const RelationshipGraph = ({ rels, currUUID = '' }) => {    
  console.log("Render RelationshipGraph")
  const recordLookup = useStore(state => state.recordLookup);  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cyRef = useRef(null);
  cytoscape.use(dagre);

  const getLabel = ( uuid ) => {
    const match = recordLookup.find(option => option.value ===uuid);
    return match ? match.label : '';
  };

  useEffect(() => {
    if (rels.length > 0){
      console.log(rels);
      const nodesMap = {};
      const elements = [];
      // First, create a unique set of nodes
      rels.forEach(edge => {
        if (edge.parent) {
          nodesMap[edge.parent_uuid] = edge.parent;
        } else if (edge.parent_uuid) {
          nodesMap[edge.parent_uuid] = getLabel(edge.parent_uuid);
        }
        if (edge.child) {
          nodesMap[edge.child_uuid] = edge.child;
        } else if (edge.child_uuid) {
          nodesMap[edge.child_uuid] = getLabel(edge.child_uuid);
        }
      });
      // Convert the nodes into the cytoscape format
      Object.entries(nodesMap).forEach(([id, label]) => {
        if (id) {
          elements.push({
              data: { id, label }
          });          
        }
      });
      // Then, create the edges
      rels.forEach(edge => {
        if (edge.parent_uuid && edge.child_uuid) {
          elements.push({
              data: {
                  id: `${edge.uuid}`,
                  source: edge.parent_uuid,
                  target: edge.child_uuid,
                  relationship: edge.relationship || '',
                  comment: edge.comment || ''
              }
          });
        }
      });
      //console.log('nodesMap');
      //console.log(nodesMap);
      //console.log('elements');
      //console.log(elements);

      // Initialize Cytoscape with nodes and edges
      const cy = cytoscape({
        container: cyRef.current,
        elements,
        style: [ // the stylesheet for the graph
          {
            selector: 'node',
            style: {
              'background-color': node => {
                return node.data('id') === currUUID ? '#9a9a9a' : '#666';
              },
              'label': 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              'text-events': 'yes',
              'color': '#fff',
              'text-outline-color': node => {
                return node.data('id') === currUUID ? '#9a9a9a' : '#666';
              },
              'text-outline-width': '3',
              'shape': function(node) {
                const label = node.data('label');
                if (label.startsWith('L')) {
                  return 'rectangle';
                } else if (label.startsWith('D')) {
                  return 'ellipse';
                } else {
                  return 'diamond'; // Default shape
                }
              },              
              'width': '4em',
              'height': '2em'
            }
          },
//          {
//            selector: 'node[type = "SU - Cut"]',
//            style: {
//              'shape': 'polygon',
//              'shape-polygon-points': '1, -1,   0.8, 1,   -0.8, 1,   -1, -1   -0.9, -1   -0.7, 0.7   0.7, 0.7   0.9, -1',
//              'width': '4em',
//              'height': '2em'
//            }
//          },
//          {
//            selector: 'node[type = "SU - Surface"]',
//            style: {
//              'shape': 'rectangle',
//              'width': '4em',
//              'height': '0.5em',
//              "text-valign": "top"
//            }
//          },
//          {
//            selector: 'node[id = currData?.uuid]',
//            style: {
//              'width': '5em',
//              'height': '3em'
//            }
//          }, 
          {
            selector: ':parent',
            css: {
              'display': 'element',
              'background-opacity': '0',
              'border-width': '3px',
              'border-color':'#666',
              'border-style': 'dashed',
              'border-opacity': '0.5',
              'label': 'data(label)',
              'color': '#666',
              'text-outline-width': '0',
              'text-valign': 'top',
              'text-halign': 'center',
              'text-margin-y':'-0.5em'
            }
          },            
          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'vee',
              'arrow-scale': 1.5,
              'curve-style': 'taxi',
              'taxi-direction': 'vertical',
              'taxi-turn-min-distance': 20,
              'label': 'data(relationship)',
              'text-rotation': 'autorotate',
              'padding': 10,
              'font-size': 10, // Reduce font size
              'text-wrap': 'wrap', // Enable text wrapping
              'text-max-width': 80, // Maximum text width before wrapping
              'text-background-opacity': 1, // Fully opaque background
              'text-background-color': '#ffffff', // Background color
              'text-background-padding': 2, // Padding around text
              'text-background-shape': 'roundrectangle', // Shape of background
              'color': '#000', // Text color
              'edge-text-rotation': 'autorotate', // Other possible rotation settings
              'text-valign': 'center',
              'text-halign': 'center'              
            }
          }
        ],
        layout: {
          name: 'dagre'
        }          
      });
      cy.on('tap', 'node', function(event){
        goToRecord(navigate, event.target.data('label'))
      });      
    }
  }, [rels]);

  return (
    <div style={{ height: '100%' }} ref={cyRef} />
  );
};

export default RelationshipGraph