import React, { useState, useEffect, useRef } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { SketchPicker } from "react-color";
import clsx from "clsx";
import TextTool from "../components/TextTool ";

const ToolBox = ({ rootNode, setRootNode, nodes, setNodes, selectedNodes }) => {
  const [bgColor, setBgColor] = useState("#1A227E");
  const [borderColor, setBorderColor] = useState("#1A227E");
  const [borderStyle, setBorderStyle] = useState("none");
  const [borderWidth, setBorderWidth] = useState("3");
  const [selectedTabIndex, setSelectedTabIndex] = useState(1);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showBorderPicker, setShowBorderPicker] = useState(false);
  const bgPickerRef = useRef(null);
  const bgBtnRef = useRef(null);
  const borderPickerRef = useRef(null);
  const borderBtnRef = useRef(null);
  const [currentStyleColors] = useState([
    "#000229",
    "#F9423A",
    "#F6A04D",
    "#F3D321",
    "#00BC7B",
    "#486AFF",
    "#4D49BE",
  ]);

  const updateNodes = (nodes, selectedNodes, updateFn) => {
    return nodes.map((node) => {
      if (selectedNodes.includes(node.id)) {
        return {
          ...node,
          ...updateFn(node),
          children: updateNodes(node.children || [], selectedNodes, updateFn),
        };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateNodes(node.children, selectedNodes, updateFn),
        };
      }
      return node;
    });
  };

  const bgColorChange = (newColor) => {
    setBgColor(newColor.hex);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          bkColor: newColor.hex,
        }));
      }
      setNodes((prev) =>
        updateNodes(prev, selectedNodes, (node) => ({ bkColor: newColor.hex }))
      );
    }
  };

  const borderColorChange = (newColor) => {
    setBorderColor(newColor.hex);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          outline: { ...prev.outline, color: newColor.hex },
        }));
      }
      setNodes((prev) =>
        updateNodes(prev, selectedNodes, (node) => ({
          outline: { ...node.outline, color: newColor.hex },
        }))
      );
    }
  };

  const borderStyleChange = (style) => {
    setBorderStyle(style);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          outline: { ...prev.outline, style: style },
        }));
      }
      setNodes((prev) =>
        updateNodes(prev, selectedNodes, (node) => ({
          outline: { ...node.outline, style: style },
        }))
      );
    }
  };
  const borderWidthChange = (width) => {
    setBorderWidth(width);
    if (selectedNodes.length > 0) {
      if (selectedNodes.includes(rootNode.id)) {
        setRootNode((prev) => ({
          ...prev,
          outline: { ...prev.outline, width: width + "px" },
        }));
      }
      setNodes((prev) =>
        updateNodes(prev, selectedNodes, (node) => ({
          outline: { ...node.outline, width: width + "px" },
        }))
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        bgPickerRef.current &&
        !bgPickerRef.current.contains(e.target) &&
        !bgBtnRef.current.contains(e.target)
      ) {
        setShowBgPicker(false);
      }
      if (
        borderPickerRef.current &&
        !borderPickerRef.current.contains(e.target) &&
        !borderBtnRef.current.contains(e.target)
      ) {
        setShowBorderPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedNodes.length === 0) {
      setSelectedTabIndex(1);
    } else {
      setSelectedTabIndex(0);
    }
    if (selectedNodes.length === 1) {
      const findNode = (nodes) => {
        for (const node of nodes) {
          if (node.id === selectedNodes[0]) return node;
          if (node.children) {
            const foundNode = findNode(node.children);
            if (foundNode) return foundNode;
          }
        }
        return null;
      };

      const selectedNode =
        rootNode.id === selectedNodes[0]
          ? rootNode
          : findNode(nodes) || rootNode;

      if (selectedNode) {
        setBgColor(selectedNode.bkColor || "#FFFFFF");
        setBorderColor(selectedNode.outline?.color || "#000000");
        setBorderStyle(selectedNode.outline?.style || "none");
        setBorderWidth(
          selectedNode.outline?.width
            ? selectedNode.outline.width.replace("px", "")
            : "3"
        );
      }
    }
  }, [selectedNodes, rootNode, nodes]);

  const bgPickerToggle = () => {
    setShowBgPicker((prev) => !prev);
  };
  const borderPickerToggle = () => {
    setShowBorderPicker((prev) => !prev);
  };
  const borderStyleOpts = [
    {
      value: "solid",
      icon: (
        <div className="w-8 h-4 border-2 border-secondary rounded-md"></div>
      ),
    },
    {
      value: "dashed",
      icon: (
        <div className="w-8 h-4 border-dashed border-2 border-secondary rounded-md"></div>
      ),
    },
    {
      value: "dotted",
      icon: (
        <div className="w-8 h-4 border-dotted border-2 border-secondary rounded-md"></div>
      ),
    },
    {
      value: "double",
      icon: (
        <div className="w-8 h-4 border-double border-4 border-secondary rounded-md"></div>
      ),
    },
    {
      value: "none",
      icon: "無邊框",
    },
  ];
  const borderWidthOpts = [
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

  return (
    <>
      <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
        <TabList className="flex justify-between divide-x">
          <Tab
            className={clsx(
              "grow",
              selectedNodes.length === 0 && "pointer-events-none opacity-50",
              "data-[selected]:bg-secondary data-[selected]:text-white data-[hover]:bg-primary data-[hover]:text-white data-[selected]:data-[hover]:bg-secondary data-[selected]:data-[hover]:text-white"
            )}
          >
            樣式
          </Tab>
          <Tab className="grow p-1 data-[selected]:bg-secondary data-[selected]:text-white data-[hover]:bg-primary data-[hover]:text-white data-[selected]:data-[hover]:bg-secondary data-[selected]:data-[hover]:text-white">
            圖面
          </Tab>
          <Tab className="grow p-1 data-[selected]:bg-secondary data-[selected]:text-white data-[hover]:bg-primary data-[hover]:text-white data-[selected]:data-[hover]:bg-secondary data-[selected]:data-[hover]:text-white">
            匯出
          </Tab>
        </TabList>
        <TabPanels className="">
          <TabPanel>
            <Disclosure
              as="div"
              className="pt-2 pb-4 px-4 border-t"
              defaultOpen={true}
            >
              <DisclosureButton className="group flex w-full items-center">
                <ChevronDownIcon className="-rotate-90 size-5 fill-gray-400 group-data-[hover]:fill-gray-700 group-data-[open]:rotate-0" />
                <span className="text-sm/6 text-gray-700 font-medium">
                  形狀
                </span>
              </DisclosureButton>
              <DisclosurePanel className="mt-2 text-sm/5 text-gray/50 space-y-2">
                <div className="flex justify-between items-center relative">
                  <span>底色</span>
                  <div
                    ref={bgBtnRef}
                    className="w-12 h-6 ml-2 rounded-md border border-gray-300"
                    style={{ backgroundColor: bgColor }}
                    onClick={bgPickerToggle}
                  />
                  {showBgPicker && (
                    <div
                      className="absolute z-10  top-0 right-10"
                      ref={bgPickerRef}
                    >
                      <SketchPicker
                        color={bgColor}
                        onChangeComplete={bgColorChange}
                        presetColors={currentStyleColors}
                        disableAlpha={true}
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap justify-between items-center relative">
                  <span>邊框</span>
                  <div className="flex">
                    <Menu>
                      <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow w-20 h-6 px-1 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white ">
                        {
                          borderStyleOpts.find(
                            (opt) => opt.value === borderStyle
                          )?.icon
                        }
                        <ChevronDownIcon className="size-4 " />
                      </MenuButton>

                      <MenuItems
                        transition
                        anchor="bottom end"
                        className="w-20 origin-top-right rounded-xl border shadow-lg bg-white p-1 text-sm/6 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                      >
                        {borderStyleOpts.map((opt) => (
                          <MenuItem key={opt.value}>
                            <button
                              onClick={() => borderStyleChange(opt.value)}
                              className="group flex items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-gray-100"
                            >
                              {opt.icon}
                            </button>
                          </MenuItem>
                        ))}
                      </MenuItems>
                    </Menu>

                    <div
                      ref={borderBtnRef}
                      className="w-12 h-6 ml-2 rounded-md border border-gray-300"
                      style={{ backgroundColor: borderColor }}
                      onClick={borderPickerToggle}
                    />
                    {showBorderPicker && (
                      <div
                        className="absolute z-10  top-0 right-10"
                        ref={borderPickerRef}
                      >
                        <SketchPicker
                          color={borderColor}
                          onChangeComplete={borderColorChange}
                          presetColors={currentStyleColors}
                          disableAlpha={true}
                        />
                      </div>
                    )}
                  </div>
                  <Menu as="div" className="relative inline-block w-full mt-4">
                    <MenuButton className="flex items-center justify-between gap-2 rounded-md border shadow w-full h-6 px-2 py-1 focus:outline-none data-[hover]:bg-gray-100 data-[open]:bg-gray-100 data-[focus]:outline-1 data-[focus]:outline-white">
                      {
                        borderWidthOpts.find((opt) => opt.value === borderWidth)
                          ?.icon
                      }
                      <ChevronDownIcon className="size-4 " />
                    </MenuButton>

                    <MenuItems
                      transition
                      className="absolute z-10 left-0 right-0 origin-top-right rounded-md border shadow-lg bg-white py-1 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                    >
                      {borderWidthOpts.map((opt) => (
                        <MenuItem key={opt.value}>
                          <button
                            onClick={() => borderWidthChange(opt.value)}
                            className="group flex items-center gap-2 px-2 py-1 w-full data-[focus]:bg-gray-100"
                          >
                            {opt.icon}
                          </button>
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Menu>
                </div>
              </DisclosurePanel>
            </Disclosure>
            <Disclosure
              as="div"
              className="pt-2 pb-4 px-4 border-t"
              defaultOpen={true}
            >
              <DisclosureButton className="group flex w-full items-center">
                <ChevronDownIcon className="-rotate-90 size-5 fill-gray-400 group-data-[hover]:fill-gray-700 group-data-[open]:rotate-0" />
                <span className="text-sm/6 text-gray-700 font-medium">
                  文字
                </span>
              </DisclosureButton>
              <DisclosurePanel className="mt-3 text-sm/5 text-gray/50 space-y-4">
                <TextTool
                  rootNode={rootNode}
                  setRootNode={setRootNode}
                  nodes={nodes}
                  setNodes={setNodes}
                  selectedNodes={selectedNodes}
                />
              </DisclosurePanel>
            </Disclosure>
            <Disclosure
              as="div"
              className="pt-2 pb-4 px-4 border-t"
              defaultOpen={true}
            >
              <DisclosureButton className="group flex w-full items-center">
                <ChevronDownIcon className="-rotate-90 size-5 fill-gray-400 group-data-[hover]:fill-gray-700 group-data-[open]:rotate-0" />
                <span className="text-sm/6 text-gray-700 font-medium">
                  線段
                </span>
              </DisclosureButton>
              <DisclosurePanel className="mt-3 text-sm/5 text-gray/50 space-y-4"></DisclosurePanel>
            </Disclosure>
          </TabPanel>
          <TabPanel>
            <Disclosure as="div" className="p-2 border" defaultOpen={true}>
              <DisclosureButton className="group flex w-full items-center">
                <ChevronDownIcon className="-rotate-90 size-5 fill-gray-400 group-data-[hover]:fill-gray-700 group-data-[open]:rotate-0" />
                <span className="text-sm/6 text-gray-700 font-medium">
                  主圖架構
                </span>
              </DisclosureButton>
              <DisclosurePanel className="mt-2 text-sm/5 text-gray/50">
                If you're unhappy with your purchase, we'll refund you in full.
              </DisclosurePanel>
            </Disclosure>
          </TabPanel>
          <TabPanel>
            <Disclosure as="div" className="p-2 border" defaultOpen={true}>
              <DisclosureButton className="group flex w-full items-center">
                <ChevronDownIcon className="-rotate-90 size-5 fill-gray-400 group-data-[hover]:fill-gray-700 group-data-[open]:rotate-0" />
                <span className="text-sm/6 text-gray-700 font-medium">
                  匯出
                </span>
              </DisclosureButton>
              <DisclosurePanel className="mt-2 text-sm/5 text-gray/50">
                If you're unhappy with your purchase, we'll refund you in full.
              </DisclosurePanel>
            </Disclosure>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </>
  );
};

export default ToolBox;
