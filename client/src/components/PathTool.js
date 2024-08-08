import React, { useState, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import ColorStyleTool from "./ColorStyleTool";
import { updateNodes, updateSelectedNodes } from "./ToolBox";

const PathTool = ({
  rootNode,
  setRootNode,
  nodes,
  setNodes,
  selectedNodes,
  currentColorStyle,
  setCurrentColorStyle,
  colorStyles,
  setColorIndex,
  nodesColor,
  setNodesColor,
  findNode,
  colorStyleEnabled,
  setColorStyleEnabled,
  colorStyleopts,
  setBgColor,
}) => {
  const [pathWidth, setPathWidth] = useState("3");
  const [pathStyle, setPathStyle] = useState("solid");
  const pathWidthOpts = [
    {
      value: "1",
      icon: "極細",
    },
    {
      value: "2",
      icon: "細",
    },
    {
      value: "3",
      icon: "適中",
    },
    {
      value: "4",
      icon: "粗",
    },
    {
      value: "5",
      icon: "極粗",
    },
  ];
  const pathWidthChange = (width) => {
    setPathWidth(width);

    if (selectedNodes.length > 0) {
      if (selectedNodes[0] === rootNode.id) {
        setRootNode((prev) => ({
          ...prev,
          path: { ...prev.path, width: width },
        }));
        setNodes((prev) =>
          updateNodes(prev, (node) => ({
            path: { ...node.path, width: width },
          }))
        );
      } else {
        setNodes((prev) =>
          updateSelectedNodes(prev, selectedNodes, (node) => ({
            path: { ...node.path, width: width },
          }))
        );
      }
    }
  };

  const pathStyleOpts = [
    {
      label: "solid",
      value: "0",
      icon: (
        <svg width="100%" height="20">
          <line
            x1="0"
            y1="10"
            x2="100%"
            y2="10"
            stroke="black"
            strokeWidth="2"
          />
        </svg>
      ),
    },
    {
      label: "dashed",
      value: "8",
      icon: (
        <svg width="100%" height="20">
          <line
            x1="0"
            y1="10"
            x2="100%"
            y2="10"
            stroke="black"
            strokeWidth="2"
            strokeDasharray="8,8"
          />
        </svg>
      ),
    },

    {
      label: "none",
      value: "0",
      icon: "無",
    },
  ];
  const pathStyleChange = (value, style) => {
    let newWidth = pathWidth;
    if (style === "none") {
      newWidth = "0";
    } else if (pathWidth === "0") {
      newWidth = "3";
    }
    setPathWidth(newWidth);
    setPathStyle(style);

    if (selectedNodes.length > 0) {
      if (selectedNodes[0] === rootNode.id) {
        setRootNode((prev) => ({
          ...prev,
          path: {
            ...prev.path,
            style: value,
            width: newWidth,
          },
        }));
        setNodes((prev) =>
          updateNodes(prev, (node) => ({
            path: {
              ...node.path,
              style: value,
              width: newWidth,
            },
          }))
        );
      } else {
        setNodes((prev) =>
          updateSelectedNodes(prev, selectedNodes, (node) => ({
            path: {
              ...node.path,
              style: value,
              width: newWidth,
            },
          }))
        );
      }
    }
  };

  useEffect(() => {
    if (selectedNodes.length > 0) {
      const selectedNode = findNode([rootNode, ...nodes], selectedNodes[0]);

      if (selectedNode) {
        setPathWidth(selectedNode.path.width || "3");
        setPathStyle(
          selectedNode.path.width === "0"
            ? "none"
            : selectedNode.path.style === "0"
            ? "solid"
            : "dashed"
        );
      }
    }
  }, [selectedNodes, rootNode, nodes, findNode]);

  return (
    <div className="space-y-4">
      <Menu as="div" className="relative inline-block w-full">
        <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow w-full h-6 px-2 py-1 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white">
          {pathStyleOpts.find((opt) => opt.label === pathStyle)?.icon}

          <ChevronDownIcon className="shrink-0 size-4" />
        </MenuButton>

        <MenuItems
          transition
          className="absolute z-10 left-0 right-0 origin-top-right rounded-md border shadow-lg bg-white py-1 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {pathStyleOpts.map((opt, index) => (
            <MenuItem key={index}>
              <button
                onClick={() => pathStyleChange(opt.value, opt.label)}
                className="group flex items-center gap-2 px-4 py-1 w-full data-[focus]:bg-gray-100"
              >
                {opt.icon}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
      <div className="flex gap-4">
        <Menu as="div" className="relative inline-block w-full">
          <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow w-full h-6 px-2 py-1 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white">
            {pathWidthOpts.find((opt) => opt.value === pathWidth)?.icon || "無"}
            <ChevronDownIcon className="size-4 " />
          </MenuButton>

          <MenuItems
            transition
            className="absolute z-10 left-0 right-0 origin-top-right rounded-md border shadow-lg bg-white py-1 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {pathWidthOpts.map((opt) => (
              <MenuItem key={opt.value}>
                <button
                  onClick={() => pathWidthChange(opt.value)}
                  className="group flex items-center gap-2 px-2 py-1 w-full data-[focus]:bg-gray-100"
                >
                  {opt.icon}
                </button>
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>
      </div>
      <ColorStyleTool
        rootNode={rootNode}
        setRootNode={setRootNode}
        nodes={nodes}
        setNodes={setNodes}
        selectedNodes={selectedNodes}
        currentColorStyle={currentColorStyle}
        setCurrentColorStyle={setCurrentColorStyle}
        colorStyles={colorStyles}
        setColorIndex={setColorIndex}
        nodesColor={nodesColor}
        setNodesColor={setNodesColor}
        findNode={findNode}
        colorStyleEnabled={colorStyleEnabled}
        setColorStyleEnabled={setColorStyleEnabled}
        colorStyleopts={colorStyleopts}
        setBgColor={setBgColor}
        isGlobal={false}
      />
    </div>
  );
};

export default PathTool;
