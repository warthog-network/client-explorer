import rawNodes from '../../config/nodes.json';

/** One entry of the node picker. */
export interface NodeEntry {
  url: string;
  label: string;
}

export const NODES: NodeEntry[] = rawNodes.nodes;

export function getNodeList(): string[] {
  return NODES.map((node) => node.url);
}

export function getNodeLabelList(): string[] {
  return NODES.map((node) => node.label);
}