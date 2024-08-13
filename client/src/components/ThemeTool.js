import React, { useState, useRef, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import ColorStyleTool from "./ColorStyleTool";
import FontFamilyTool from "./FontFamilyTool";
import { SketchPicker } from "react-color";
import { updateNodesColor } from "./ToolBox";

const ThemeTool = ({
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
  themes,
  currentTheme,
  setCurrentTheme,
  canvasBgColor,
  setCanvasBgColor,
  canvasBgStyle,
  setCanvasBgStyle,
  fontFamily,
  setFontFamily,
}) => {
  const [showCanvasBgPicker, setShowCanvasBgPicker] = useState(false);
  const canvasBgPickerRef = useRef(null);
  const canvasBgBtnRef = useRef(null);

  //畫布背景顏色
  const canvasBgPickerToggle = () => {
    setShowCanvasBgPicker((prev) => !prev);
  };
  const canvasBgColorChange = (newColor) => {
    setCanvasBgColor(newColor.hex);
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        canvasBgPickerRef.current &&
        !canvasBgPickerRef.current.contains(e.target) &&
        !canvasBgBtnRef.current.contains(e.target)
      ) {
        setShowCanvasBgPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  //佈景主題選項
  const themeStyleopts = themes.map((theme) => {
    return {
      name: theme.name,
      colors: [...theme.colorStyles[0].nodes, theme.colorStyles[0].root],
    };
  });
  //切換佈景主題
  const themeStyleChange = (index) => {
    setCurrentTheme(index);
    setCurrentColorStyle(1);
    setRootNode((prevRootNode) => ({
      ...prevRootNode,
      bkColor: themes[index].colorStyles[0].root,
      outline: {
        ...prevRootNode.outline,
        color: themes[index].colorStyles[0].root,
      },
      font: {
        ...prevRootNode.font,
        color: themes[index].colorStyles[0].text,
      },
    }));
    setNodes((prevNodes) =>
      updateNodesColor(prevNodes, themes[index].colorStyles[0])
    );
  };

  //畫布背景樣式
  const canvasBgStyleOpts = [
    {
      value: "bg-grid",
      opt: <div className="w-full h-12 rounded-md bg-grid-sm"></div>,
      icon: <div className="w-full h-full rounded-md bg-grid-sm"></div>,
    },
    {
      value: "bg-dot",
      opt: <div className="w-full h-full rounded-md bg-dot-sm"></div>,
      icon: <div className="w-full h-full rounded-md bg-dot-sm"></div>,
    },
    {
      value: "bg-grid-dark",
      opt: <div className="w-full h-12 rounded-md bg-grid-sm-dark"></div>,
      icon: <div className="w-full h-full rounded-md bg-grid-sm-dark"></div>,
    },
    {
      value: "bg-dot-dark",
      opt: <div className="w-full h-full rounded-md bg-dot-sm-dark"></div>,
      icon: <div className="w-full h-full rounded-md bg-dot-sm-dark"></div>,
    },
    {
      value: "none",
      opt: (
        <p className="w-full h-12 rounded-md flex items-center justify-center">
          無
        </p>
      ),
      icon: "無",
    },
  ];
  const canvasBgStyleChange = (style) => {
    setCanvasBgStyle(style);
    const darkStyles = ["bg-grid-dark", "bg-dot-dark"];
    if (darkStyles.includes(style)) {
      setCanvasBgColor("#1a1a1a");
    } else {
      setCanvasBgColor("#fff");
    }
  };

  return (
    <div className="">
      <div className="p-4 border-t">
        <p className="font-medium mb-2">佈景主題</p>
        <Menu as="div" className="relative mb-4">
          <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow w-full p-4 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white">
            <div className="flex items-center gap-1 w-full">
              {themeStyleopts[currentTheme]?.colors.map((color, colorIndex) => (
                <div
                  key={colorIndex}
                  className="grow inline-block rounded-full aspect-square"
                  style={{
                    backgroundColor: color,
                  }}
                ></div>
              ))}
              <span className="ml-2">{themeStyleopts[currentTheme]?.name}</span>
            </div>

            <ChevronDownIcon className="size-4" />
          </MenuButton>

          <MenuItems
            transition
            className="absolute z-10 left-0 right-0 origin-top-right rounded-md border shadow-lg bg-white py-2 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {themeStyleopts.map((style, index) => (
              <MenuItem key={index}>
                <button
                  onClick={() => themeStyleChange(index)}
                  className="group w-full p-4 data-[focus]:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    {style.colors.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className="grow inline-block rounded-full aspect-square"
                        style={{
                          backgroundColor: color,
                        }}
                      ></div>
                    ))}
                    <span className="ml-2">{style.name}</span>
                  </div>
                </button>
              </MenuItem>
            ))}
          </MenuItems>
        </Menu>

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
          isGlobal={true}
        />
      </div>

      <div className="p-4 border-t">
        <div className="flex justify-between items-center relative mb-4">
          <p>畫布背景顏色</p>
          <div
            ref={canvasBgBtnRef}
            className="w-12 h-6 ml-2 rounded-md border border-gray-300 "
            style={{ backgroundColor: canvasBgColor }}
            onClick={canvasBgPickerToggle}
          ></div>
          {showCanvasBgPicker && (
            <div
              className="absolute z-10 top-0 right-10"
              ref={canvasBgPickerRef}
            >
              <SketchPicker
                color={canvasBgColor}
                onChangeComplete={canvasBgColorChange}
                disableAlpha={true}
                presetColors={["#000000", "#FFFFFF"]}
              />
            </div>
          )}
        </div>
        <div className="flex justify-between">
          <p>畫布背景樣式</p>
          <Menu>
            <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow py-2 px-3 w-36 h-12 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white ">
              {
                canvasBgStyleOpts.find((opt) => opt.value === canvasBgStyle)
                  ?.icon
              }
              <ChevronDownIcon className="size-4" />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className="grid grid-cols-2 gap-2 origin-top-right rounded-md border shadow-lg bg-white p-4 w-36 text-sm transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              {canvasBgStyleOpts.map((opt) => (
                <MenuItem key={opt.value}>
                  <button
                    onClick={() => canvasBgStyleChange(opt.value)}
                    className="group rounded-md outline outline-2 outline-transparent border shadow data-[focus]:outline-primary data-[focus]:border-primary"
                  >
                    {opt.opt}
                  </button>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      </div>
      <div className="p-4 border-t">
        <p className="mb-2">整體字型</p>

        <FontFamilyTool
          rootNode={rootNode}
          setRootNode={setRootNode}
          nodes={nodes}
          setNodes={setNodes}
          selectedNodes={selectedNodes}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          isGlobal={true}
        />
        {/* <p>分支線段寬度</p>
        <p>分支線段樣式</p> */}
      </div>
    </div>
  );
};

export default ThemeTool;
