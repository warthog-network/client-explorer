import rawNodes from '../../config/nodes.json';

export const NODES = rawNodes.nodes;

export function getNodeList() {
  return NODES.map(node => node.url);
}

export function getNodeLabelList() {
  return NODES.map(node => node.label);
}