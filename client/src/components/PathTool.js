import React, { useState, useEffect, useRef } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { SketchPicker } from "react-color";

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
}) => {
  const [pathWidth, setPathWidth] = useState("3");
  const [pathStyle, setPathStyle] = useState("solid");
  const [color, setColor] = useState(nodesColor);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const stylePickerRef = useRef(null);
  const styleBtnRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);
  const colorBtnRef = useRef(null);

  const updateNodes = (nodes, updateFn) => {
    return nodes.map((node) => ({
      ...node,
      ...updateFn(node),
      children: node.children ? updateNodes(node.children, updateFn) : [],
    }));
  };
  const updateSelectedNodes = (nodes, selectedNodes, updateFn) => {
    return nodes.map((node) => {
      if (selectedNodes.includes(node.id)) {
        return {
          ...node,
          ...updateFn(node),
          children: node.children
            ? updateSelectedNodes(node.children, selectedNodes, updateFn)
            : [],
        };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateSelectedNodes(node.children, selectedNodes, updateFn),
        };
      }
      return node;
    });
  };

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
  //節點顏色風格
  const updateNodesColor = (nodes, colorStyle, parentColorIndex = null) => {
    return nodes.map((node, index) => {
      const nodeColorIndex = index % colorStyle.nodes.length;
      const newBkColor =
        parentColorIndex === null
          ? colorStyle.nodes[nodeColorIndex]
          : colorStyle.child[parentColorIndex];
      return {
        ...node,
        bkColor: newBkColor,
        pathColor: newBkColor,
        outline: { ...node.outline, color: newBkColor },
        font: { ...node.font, color: colorStyle.text },
        children: node.children
          ? updateNodesColor(node.children, colorStyle, nodeColorIndex)
          : [],
      };
    });
  };

  const colorStyleChange = (index) => {
    if (selectedNodes.length > 0 && selectedNodes[0] === rootNode.id) {
      setCurrentColorStyle(index);
      setColorIndex(0);
      // 更新根節點
      setRootNode((prevRootNode) => ({
        ...prevRootNode,
        bkColor: colorStyles[index].root,
        outline: { ...prevRootNode.outline, color: colorStyles[index].root },
        font: { ...prevRootNode.font, color: colorStyles[index].text },
      }));

      // 更新所有子節點
      setNodes((prevNodes) => updateNodesColor(prevNodes, colorStyles[index]));
    }
  };
  //nodesColor
  const stylePickerToggle = () => {
    setShowStylePicker((prev) => !prev);
  };
  const colorStyleEnabledChange = (e) => {
    if (selectedNodes.length > 0 && selectedNodes[0] === rootNode.id) {
      const index = e.target.checked ? 2 : 0;
      setCurrentColorStyle(index);
      setColorIndex(0);
      setColorStyleEnabled(e.target.checked);
      setNodes((prevNodes) => updateNodesColor(prevNodes, colorStyles[index]));
      setRootNode((prevRootNode) => ({
        ...prevRootNode,
        bkColor: colorStyles[index].root,
        outline: { ...prevRootNode.outline, color: colorStyles[index].root },
        font: { ...prevRootNode.font, color: colorStyles[index].text },
      }));
    }
  };
  const nodesColorChange = (newColor) => {
    setNodesColor(newColor.hex);

    if (selectedNodes.length > 0 && selectedNodes[0] === rootNode.id) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          bkColor: newColor.hex,
          outline: { ...prev.outline, color: newColor.hex },
          font: { ...prev.font, color: "#FFFFFF" },
        }));
      }
      setNodes((prev) =>
        updateNodes(prev, (node) => ({
          bkColor: newColor.hex,
          pathColor: newColor.hex,
          outline: { ...prev.outline, color: newColor.hex },
          font: { ...node.font, color: "#FFFFFF" },
        }))
      );
    }
  };
  const colorPickerToggle = () => {
    setShowColorPicker((prev) => !prev);
  };
  const nodeColorChange = (newColor) => {
    setColor(newColor.hex);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setNodesColor(newColor.hex);
        setRootNode((prev) => ({
          ...prev,
          bkColor: newColor.hex,
          pathColor: newColor.hex,
          outline: { ...prev.outline, color: newColor.hex },
        }));
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          bkColor: newColor.hex,
          pathColor: newColor.hex,
          outline: { ...prev.outline, color: newColor.hex },
        }))
      );
    }
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        stylePickerRef.current &&
        !stylePickerRef.current.contains(e.target) &&
        !styleBtnRef.current.contains(e.target)
      ) {
        setShowStylePicker(false);
      }
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target) &&
        !colorBtnRef.current.contains(e.target)
      ) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
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
        setColor(selectedNode.pathColor || nodesColor);
      }
      if (selectedNode.id === rootNode.id) {
        setColorStyleEnabled(currentColorStyle !== 0); // 根據多彩模式的 index 設定狀態
      }
    }
  }, [
    selectedNodes,
    rootNode,
    nodes,
    findNode,
    nodesColor,
    currentColorStyle,
    setColorStyleEnabled,
  ]);

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
        {!(selectedNodes[0] === rootNode.id) && (
          <>
            <div
              ref={colorBtnRef}
              className="w-12 h-6 rounded-md border border-gray-300 shrink-0"
              style={{ backgroundColor: color }}
              onClick={colorPickerToggle}
            ></div>
            {showColorPicker && (
              <div
                className="absolute z-10 top-0 right-0 react-color-sketch"
                ref={colorPickerRef}
              >
                <SketchPicker
                  color={color}
                  onChangeComplete={nodeColorChange}
                  disableAlpha={true}
                  presetColors={[]}
                  className="!shadow-none"
                />
                {colorStyleEnabled && (
                  <div className="bg-white w-full rounded-b border-t text-xs p-2.5">
                    目前風格
                    <div className="flex justify-between mt-2">
                      {colorStyleopts[currentColorStyle - 1]?.colors.map(
                        (styleColor, index) => (
                          <div
                            key={index}
                            className="w-5 h-5 cursor-pointer"
                            style={{ backgroundColor: styleColor }}
                            onClick={() => nodeColorChange({ hex: styleColor })}
                          ></div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {selectedNodes[0] === rootNode.id && (
        <div className="flex justify-between">
          <label htmlFor="colorStyleEnabled" className="flex items-center">
            <input
              id="colorStyleEnabled"
              name="colorStyleEnabled"
              type="checkbox"
              checked={colorStyleEnabled}
              onChange={colorStyleEnabledChange}
              className="mr-1"
            />
            多彩
          </label>

          {colorStyleEnabled && (
            <Menu as="div" className="relative inline-block">
              <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow w-full h-6 px-2 py-1 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white">
                <div className="flex">
                  {colorStyleopts[currentColorStyle - 1]?.colors.map(
                    (color, colorIndex) => (
                      <span
                        key={colorIndex}
                        style={{
                          backgroundColor: color,
                          width: "10px",
                          height: "10px",
                          display: "inline-block",
                        }}
                      ></span>
                    )
                  )}
                </div>
                <ChevronDownIcon className="size-4" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute z-10 left-0 right-0 origin-top-right rounded-md border shadow-lg bg-white py-1 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
              >
                {colorStyleopts.map((style, index) => (
                  <MenuItem key={index}>
                    <button
                      onClick={() => colorStyleChange(index + 1)}
                      className="group flex items-center gap-2 p-2  w-full data-[focus]:bg-gray-100"
                    >
                      <div className="flex justify-between w-full">
                        {style.colors.map((color, colorIndex) => (
                          <span
                            key={colorIndex}
                            className="grow"
                            style={{
                              backgroundColor: color,
                              height: "12px",
                            }}
                          ></span>
                        ))}
                      </div>
                    </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          )}
          {!colorStyleEnabled && (
            <>
              <div
                ref={styleBtnRef}
                className="w-12 h-6 rounded-md border border-gray-300"
                style={{ backgroundColor: nodesColor }}
                onClick={stylePickerToggle}
              ></div>
              {showStylePicker && (
                <div
                  className="absolute z-10 top-6 right-10"
                  ref={stylePickerRef}
                >
                  <SketchPicker
                    color={nodesColor}
                    onChangeComplete={nodesColorChange}
                    disableAlpha={true}
                    presetColors={[]}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PathTool;
