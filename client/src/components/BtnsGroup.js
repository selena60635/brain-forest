import React from "react";
import { Button } from "@headlessui/react";

function BtnsGroup({
  rootNode,
  nodes,
  selectedNodes,
  addNode,
  delNode,
  findParentNode,
  addSiblingNode,
  addSiblingChildNode,
  addChildNode,
}) {
  const handleAddSiblingNode = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    //處理根節點的部分
    if (selectedNodes.length === 1 && selectedNodes[0] === rootNode.id) {
      addNode();
      return;
    }
    const parentNode = findParentNode([rootNode, ...nodes]);
    if (parentNode && parentNode.children.length > 0) {
      addSiblingChildNode(parentNode);
    } else {
      addSiblingNode();
    }
  };

  const handleAddChildNode = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (selectedNodes.length === 1 && selectedNodes[0] === rootNode.id) {
      addNode();
    } else {
      addChildNode(selectedNodes[0]);
    }
  };

  const handleDelNode = (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (selectedNodes.length > 0) {
      delNode(selectedNodes);
    }
  };

  return (
    <>
      <div className="btns-group">
        <Button className="btn aspect-square" onClick={handleAddSiblingNode}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            version="1.1"
            id="svg1"
          >
            <g>
              <rect
                style={{
                  fill: "none",
                  fillOpacity: 1,
                  stroke: "currentColor",
                  strokeWidth: 2,
                  strokeDasharray: "none",
                  strokeOpacity: 1,
                  paintOrder: "markers fill stroke",
                }}
                width="13.374903"
                height="7.4706345"
                x="19.542086"
                y="21.763767"
                rx="2.2264786"
                ry="2.5317783"
              />
              <ellipse
                style={{
                  fill: "currentColor",
                  fillOpacity: 1,
                  stroke: "currentColor",
                  strokeWidth: 1.5,
                  strokeDasharray: "none",
                  strokeOpacity: 1,
                  paintOrder: "markers fill stroke",
                }}
                cx="21.200758"
                cy="11.890943"
                rx="1.6733522"
                ry="1.8349136"
              />
              <path
                style={{
                  fill: "none",
                  fillOpacity: 1,
                  stroke: "currentColor",
                  strokeWidth: 1.5,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeDasharray: "none",
                  strokeOpacity: 1,
                  paintOrder: "markers fill stroke",
                }}
                d="m 21.504903,11.868453 -6.693409,0.05846 v 13.739343 l 4.715911,-5e-6"
              />
            </g>
          </svg>
        </Button>
        <Button onClick={handleAddChildNode} className="btn aspect-square">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            version="1.1"
            id="svg1"
          >
            <g>
              <rect
                style={{
                  fill: "none",
                  fillOpacity: 1,
                  stroke: "currentColor",
                  strokeWidth: 2,
                  strokeDasharray: "none",
                  strokeOpacity: 1,
                  paintOrder: "markers fill stroke",
                }}
                width="13.374903"
                height="7.4706345"
                x="19.783123"
                y="16.966305"
                rx="2.2264786"
                ry="2.5317783"
              />
              <ellipse
                style={{
                  fill: "currentColor",
                  fillOpacity: 1,
                  stroke: "currentColor",
                  strokeWidth: 1.5,
                  strokeDasharray: "none",
                  strokeOpacity: 1,
                  paintOrder: "markers fill stroke",
                }}
                cx="16.096079"
                cy="20.746698"
                rx="1.6733522"
                ry="1.8349136"
              />
              <path
                style={{
                  fill: "none",
                  fillOpacity: 1,
                  stroke: "currentColor",
                  strokeWidth: 1.5,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeDasharray: "none",
                  strokeOpacity: 1,
                  paintOrder: "markers fill stroke",
                }}
                d="m 15.052531,20.868794 4.715911,-5e-6"
              />
            </g>
          </svg>
        </Button>
        <Button onClick={handleDelNode} className="btn aspect-square">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-4"
          >
            <path
              fillRule="evenodd"
              d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>
    </>
  );
}

export default BtnsGroup;
