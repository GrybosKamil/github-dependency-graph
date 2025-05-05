import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useMemo } from "react";

import "@xyflow/react/dist/style.css";

interface RawPackageJson {
  name: string;
  dependencies?: Record<string, string>;
}

interface DependencyGraphProps {
  packageJsonData: RawPackageJson[];
}

export default function DependencyGraph({
  packageJsonData,
}: DependencyGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const addedNodes = new Set<string>();

    packageJsonData.forEach((pkg, pkgIndex) => {
      const mainNodeId = `pkg-${pkgIndex}`;
      if (!addedNodes.has(mainNodeId)) {
        nodes.push({
          id: mainNodeId,
          data: { label: pkg.name || `Package ${pkgIndex + 1}` },
          position: { x: 250, y: pkgIndex * 150 },
          type: "default", // Default node type
        });
        addedNodes.add(mainNodeId);
      }

      if (pkg.dependencies) {
        Object.keys(pkg.dependencies).forEach((dependency, depIndex) => {
          const depNodeId = `dep-${pkgIndex}-${depIndex}`;
          if (!addedNodes.has(depNodeId)) {
            nodes.push({
              id: depNodeId,
              data: { label: dependency },
              position: { x: 500, y: pkgIndex * 150 + depIndex * 50 },
              type: "default", // Default node type
            });
            addedNodes.add(depNodeId);
          }

          edges.push({
            id: `edge-${mainNodeId}-${depNodeId}`,
            source: mainNodeId,
            target: depNodeId,
            animated: true,
            type: "default", // Default edge type
          });
        });
      }
    });

    return { nodes, edges };
  }, [packageJsonData]);

  return (
    <div style={{ height: 500 }}>
      <ReactFlow nodes={nodes} edges={edges} colorMode="dark">
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
