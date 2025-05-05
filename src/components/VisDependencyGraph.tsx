import { useEffect, useRef } from "react";
import { Network } from "vis-network/standalone";
import { RawPackageJson } from "../types";

interface DependencyGraphProps {
  packageJsonData: RawPackageJson[];
}

export default function VisDependencyGraph({
  packageJsonData,
}: DependencyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const nodes: { id: string; label: string }[] = [];
    const edges: {
      from: string;
      to: string;
      arrows: string;
      label?: string;
    }[] = [];
    const addedNodes = new Set<string>();

    packageJsonData.forEach((pkg, pkgIndex) => {
      const mainNodeId = `pkg-${pkgIndex}`;
      if (!addedNodes.has(pkg.name)) {
        const mainNode = {
          id: mainNodeId,
          label: pkg.name || `Package ${pkgIndex + 1}`,
        };
        nodes.push(mainNode);
        addedNodes.add(pkg.name);
      }

      if (pkg.dependencies) {
        Object.entries(pkg.dependencies).forEach(([dependency, version]) => {
          if (!addedNodes.has(dependency)) {
            nodes.push({
              id: dependency,
              label: dependency,
            });
            addedNodes.add(dependency);
          }

          edges.push({
            from: mainNodeId,
            to: dependency,
            arrows: "to",
            label: version,
          });
        });
      }
    });

    const network = new Network(
      containerRef.current,
      { nodes, edges },
      {
        nodes: {
          shape: "box",
          size: 15,
          font: { size: 14 },
        },
        edges: {
          color: "#848484",
          length: 200,
          arrows: { to: { enabled: true } },
          font: { align: "middle" },
        },
        physics: {
          enabled: true,
        },
      }
    );

    return () => {
      network.destroy();
    };
  }, [packageJsonData]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
}
