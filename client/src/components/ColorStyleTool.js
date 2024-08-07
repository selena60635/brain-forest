import React, { useState, useRef, useEffect } from "react";
import { SketchPicker } from "react-color";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { updateNodes, updateSelectedNodes } from "./ToolBox";

const ColorStyleTool = ({
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
  isGlobal,
}) => {
  const [color, setColor] = useState(nodesColor);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);
  const colorBtnRef = useRef(null);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const stylePickerRef = useRef(null);
  const styleBtnRef = useRef(null);

  const nodeColorChange = (newColor) => {
    setColor(newColor.hex);
    setBgColor(newColor.hex);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setNodesColor(newColor.hex);
        setRootNode((prev) => ({
          ...prev,
          bkColor: newColor.hex,
          pathColor: newColor.hex,
          outline: { ...prev.outline, color: newColor.hex },
        }));
        setNodes((prev) =>
          updateNodes(prev, () => ({
            bkColor: newColor.hex,
            pathColor: newColor.hex,
          }))
        );
      }
      setNodes((prev) =>
        updateSelectedNodes(prev, selectedNodes, (node) => ({
          bkColor: newColor.hex,
          pathColor: newColor.hex,
        }))
      );
    }
  };

  const colorPickerToggle = () => {
    setShowColorPicker((prev) => !prev);
  };

  const nodesColorChange = (newColor) => {
    setNodesColor(newColor.hex);

    if (
      isGlobal ||
      (selectedNodes.length > 0 && selectedNodes[0] === rootNode.id)
    ) {
      setRootNode((prev) => ({
        ...prev,
        bkColor: newColor.hex,
        outline: { ...prev.outline, color: newColor.hex },
        font: { ...prev.font, color: "#FFFFFF" },
      }));

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

  const stylePickerToggle = () => {
    setShowStylePicker((prev) => !prev);
  };

  const colorStyleEnabledChange = (e) => {
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
  };
  //節點顏色風格
  const updateNodesColor = (nodes, colorStyle, parentColorIndex = null) => {
    return nodes.map((node, index) => {
      const nodeColorIndex =
        parentColorIndex !== null
          ? parentColorIndex
          : index % colorStyle.nodes.length;
      const newBkColor =
        parentColorIndex === null
          ? colorStyle.nodes[nodeColorIndex]
          : colorStyle.child[nodeColorIndex];
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
  };

  return (
    <>
      {!isGlobal && selectedNodes[0] !== rootNode.id && (
        <div className="flex justify-between items-center">
          <span className="ml-1">分支顏色</span>
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
        </div>
      )}
      {(isGlobal || selectedNodes[0] === rootNode.id) && (
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
    </>
  );
};

export default ColorStyleTool;
