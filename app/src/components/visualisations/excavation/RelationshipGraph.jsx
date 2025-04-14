import React, { useEffect, useRef } from 'react';
import { useStore } from 'services/store';
import { useNavigate } from 'react-router-dom';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import {
  goToRecord
} from 'helpers/buttonActions';

cytoscape.use(dagre);

const RelationshipGraph = ({ rels, currUUID, useFilterRows }) => {
  console.log("Render RelationshipGraph");
  const filteredRows = useStore(state => state.filteredRows);
  const setFilteredRows = useStore(state => state.setFilteredRows);
  const selRow = useStore(state => state.selRow);
  const setSelRow = useStore(state => state.setSelRow);

  const navigate = useNavigate();
  const cyRef = useRef(null);
  const cyInstanceRef = useRef(null);

  useEffect(() => {
    let relationships = useFilterRows ? filteredRows : rels;
    if (useFilterRows && selRow) {
      currUUID = selRow.uuid;
    }
    if (relationships && relationships.length > 0) {
      console.log(relationships);
      const nodesMap = {};
      const elements = [];
      const trenches = new Set();

      // Helper function to add/update node information in nodesMap
      const addNode = (uuid, label, type, trench) => {
        if (!nodesMap[uuid]) {
          nodesMap[uuid] = { id: uuid, label, type, trench };
        } else {
          nodesMap[uuid] = {
            ...nodesMap[uuid],
            label,
            type,
            trench,
          };
        }
        // Track unique trenches
        trenches.add(trench);
      };

      // First, create a unique set of nodes
      relationships.forEach(edge => {
        if (edge.parent_uuid) {
          addNode(edge.parent_uuid, edge.parent, edge.parent_type, edge.trench);
        }
        if (edge.child_uuid) {
          addNode(edge.child_uuid, edge.child, edge.child_type, edge.trench);
        }
      });

      // Add trench parent nodes
      trenches.forEach(trench => {
        elements.push({
          data: {
            id: `trench-${trench}`,
            label: trench,
          },
          classes: 'trench'
        });
      });

      // Convert the nodes into the Cytoscape format and associate with trench parent
      Object.values(nodesMap).forEach(node => {
        elements.push({
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            trench: node.trench,
            parent: `trench-${node.trench}`
          }
        });
      });

      // Then, create the edges
      relationships.forEach(edge => {
        if (edge.parent_uuid && edge.child_uuid) {
          elements.push({
            data: {
              id: edge.uuid,
              source: edge.parent_uuid,
              target: edge.child_uuid,
              relationship: edge.relationship_type || '',
              comment: edge.comment || '',
              label_active: edge.label_active,
              label_passive: edge.label_passive,
              isEqual: edge.label_active === edge.label_passive,
            }
          });
        }
      });

      // Initialize Cytoscape with nodes and edges
      cyInstanceRef.current = cytoscape({
        container: cyRef.current,
        elements,
        style: [ // the stylesheet for the graph
          {
            selector: 'node',
            style: {
              'background-color': node => node.data('id') === currUUID ? '#9a9a9a' : '#666',
              'label': 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              'text-events': 'yes',
              'color': '#fff',
              'text-outline-color': node => node.data('id') === currUUID ? '#9a9a9a' : '#666',
              'text-outline-width': '3',
              'shape': node => {
                switch (node.data('type')) {
                  case 'Fill': return 'ellipse';
                  case 'Deposit': return 'ellipse';
                  case 'Surface': return 'diamond';
                  case 'Cut': return 'rectangle';
                  case 'Structure': return 'hexagon';
                  default: return 'tag';
                }
              },
              'width': '4em',
              'height': '2em'
            }
          },
          {
            selector: ':parent',
            css: {
              'display': 'element',
              'background-opacity': '0',
              'border-width': '3px',
              'border-color': '#666',
              'border-style': 'dashed',
              'border-opacity': '0.5',
              'label': 'data(label)',
              'color': '#666',
              'text-outline-width': '0',
              'text-valign': 'top',
              'text-halign': 'center',
              'text-margin-y': '-0.5em'
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
              'label': 'data(label_active)',
              'text-rotation': 'autorotate',
              'padding': 10,
              'font-size': 10,
              'text-wrap': 'wrap',
              'text-max-width': 80,
              'text-background-opacity': 1,
              'text-background-color': '#ffffff',
              'text-background-padding': 2,
              'text-background-shape': 'roundrectangle',
              'color': '#000',
              'edge-text-rotation': 'autorotate',
              'text-valign': 'center',
              'text-halign': 'center'
            }
          }
        ],
        layout: {
          name: 'dagre',
          rankDir: 'TB', // Top-to-bottom
        }
      });

      cyInstanceRef.current.on('tap', 'node', function(event){
        goToRecord(navigate, event.target.data('id'))
      });

      return () => {
        // Destroy Cytoscape instance when component unmounts or relationships change
        if (cyInstanceRef.current) {
          cyInstanceRef.current.destroy();
        }
      };
    }
  }, [rels, filteredRows, selRow, useFilterRows, currUUID]);

  return (
    <div style={{ height: '100%' }} ref={cyRef} />
  );
};

export default RelationshipGraph;
