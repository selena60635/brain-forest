import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import Node from "./Node";
import RootNode from "./RootNode";

// 心智圖組件
const MindMap = ({
  nodes,
  setNodes,
  rootNode,
  setRootNode,
  selectedNodes,
  setSelectedNodes,
  selectBox,
  rootRef,
  canvasRef,
  nodeRefs,
  delNode,
  findParentNode,
  addNode,
  addSiblingNode,
  addSiblingChildNode,
  addChildNode,
  handleSaveMindMap,
  getNodeCanvasLoc,
  scrollToCenter,
  toggleFullScreen,
  zoomLevel,
  handleZoom,
  togglePanMode,
}) => {
  const [isAnyEditing, setIsAnyEditing] = useState(false);
  const svgRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的svg Dom元素

  //取得根結點svg位置
  const getRootSvgLoc = (outlineWidth) => {
    if (rootRef.current && svgRef.current) {
      const rootRect = rootRef.current.getBoundingClientRect(); // 獲取根節點的矩形物件
      const svgRect = svgRef.current.getBoundingClientRect(); // 獲取 SVG 的矩形物件
      const offset = parseInt(outlineWidth, 10);
      return {
        x:
          rootRect.left -
          svgRect.left +
          rootRect.width +
          (rootNode.outline.style !== "none" ? offset : -2) * zoomLevel, // 計算path根節點接點的X坐標(相對於g，也就是將g當作視口去計算)
        y: rootRect.top - svgRect.top + rootRect.height / 2, // 計算根節點的中心點相對於g的Y坐標
      };
    }

    return { x: 0, y: 0 };
  };

  //取得節點svg位置
  const getNodeSvgLoc = useCallback(
    (nodeRef, node) => {
      if (nodeRef && nodeRef.current && svgRef.current) {
        const nodeRect = nodeRef.current.getBoundingClientRect();
        const svgRect = svgRef.current.getBoundingClientRect();
        const offset = parseInt(node.outline.width, 10);
        return {
          x:
            nodeRect.left -
            svgRect.left -
            (node.outline.style !== "none" ? offset : 0) * zoomLevel,
          y: nodeRect.top - svgRect.top + nodeRect.height / 2,
        };
      }
      return { x: 0, y: 0 };
    },
    [svgRef, zoomLevel]
  );

  //更新節點與根節點的連接線
  const updateLocs = useCallback(() => {
    setNodes((prev) => [...prev]);
    setRootNode((prev) => ({ ...prev }));
  }, [setNodes, setRootNode]);

  const nodesString = JSON.stringify(nodes);
  const rootNodeString = JSON.stringify(rootNode);

  useLayoutEffect(() => {
    updateLocs();
  }, [
    nodesString,
    rootNodeString,
    setNodes,
    setRootNode,
    updateLocs,
    zoomLevel,
  ]);

  //判定是否被選取
  const isNodeSelected = useCallback(
    (nodeRect) => {
      if (!selectBox) return false; // 如果沒有生成選擇框，返回false
      // 計算選擇框的四個邊位置
      const selBox = {
        left: selectBox.left,
        right: selectBox.left + selectBox.width,
        top: selectBox.top,
        bottom: selectBox.top + selectBox.height,
      };
      // 計算節點的四個邊位置
      const nodeBox = {
        left: nodeRect.left,
        right: nodeRect.right,
        top: nodeRect.top,
        bottom: nodeRect.bottom,
      };
      //滿足以下的條件就表示選擇框有接觸到節點
      return (
        selBox.right > nodeBox.left &&
        selBox.left < nodeBox.right &&
        selBox.bottom > nodeBox.top &&
        selBox.top < nodeBox.bottom
      );
    },
    [selectBox]
  );

  useLayoutEffect(() => {
    if (selectBox) {
      const selected = []; //存放被選中的節點ID
      const rootRect = getNodeCanvasLoc(rootRef); //取得根節點在canvas上的位置
      //如果根節點被選中，將根節點ID加入到selected中
      if (isNodeSelected(rootRect)) {
        selected.push(rootNode.id);
      }

      //一層層遞迴遍歷nodes中所有的節點，判斷每一個節點是否有被選中
      const traverseNodes = (nodes, refs, parentRefs) => {
        nodes.forEach((node, index) => {
          //取得當前節點的引用
          const nodeRef = parentRefs
            ? parentRefs.current[index]
            : refs.current[index];

          if (nodeRef) {
            const nodeRect = getNodeCanvasLoc(nodeRef); // 取得當前節點在canvas上的位置
            if (isNodeSelected(nodeRect)) {
              //若當前節點在選擇範圍內，將節點ID加入到selected中
              selected.push(node.id);
            }
            if (node.children) {
              //若當前節點不在選擇範圍內，檢查是否有children，如果有則繼續檢查
              if (!nodeRefs.current[node.id]) {
                //若引用中沒有包含當前節點，代表...，在引用中新增當前節點的..
                nodeRefs.current[node.id] = [];
              }
              //將當前節點的children、children中子節點的引用、子節點的父節點引用傳入，遞迴一層層遍歷子節點
              traverseNodes(node.children, nodeRefs, {
                current: nodeRefs.current[node.id],
              });
            }
          }
        });
      };

      traverseNodes(nodes, nodeRefs); //開始遞迴遍歷所有節點

      setSelectedNodes((prev) => {
        const newSelectedNodes = prev.filter((id) => selected.includes(id));
        selected.forEach((id) => {
          if (!newSelectedNodes.includes(id)) {
            newSelectedNodes.push(id);
          }
        });
        return newSelectedNodes;
      }); //更新選擇名單
    }
  }, [
    selectBox,
    nodes,
    isNodeSelected,
    rootNode.id,
    canvasRef,
    nodeRefs,
    setSelectedNodes,
    getNodeCanvasLoc,
    rootRef,
  ]);

  const handleKeyDown = useCallback(
    (e) => {
      if (
        (["Enter", "Delete", "Tab"].includes(e.key) &&
          selectedNodes.length === 1) ||
        ["F1", "F2", " "].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === "Enter" && selectedNodes.length === 1) {
        if (selectedNodes[0] === rootNode.id) {
          addNode();
          return;
        }

        const parentNode = findParentNode([rootNode, ...nodes]);

        if (parentNode && parentNode.children.length > 0) {
          addSiblingChildNode(parentNode);
        } else {
          addSiblingNode();
        }
      }

      if (e.key === "Delete" && selectedNodes.length > 0) {
        delNode(selectedNodes);
      }

      if (e.key === "Tab" && selectedNodes.length === 1) {
        if (selectedNodes[0] === rootNode.id) {
          addNode();
        } else {
          addChildNode(selectedNodes[0]);
        }
      }
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        e.stopPropagation();
        handleSaveMindMap();
      }
      //ToCenter
      if (e.key === "F1") {
        scrollToCenter("smooth");
      }
      //FullScreen
      if (e.key === "F2") {
        toggleFullScreen();
      }
      //zoom in/zoom out/reset
      if (!isAnyEditing) {
        if (e.key === "=") {
          e.stopPropagation();
          handleZoom("in");
        } else if (e.key === "-") {
          e.stopPropagation();
          handleZoom("out");
        } else if (e.key === "0") {
          e.stopPropagation();
          handleZoom("reset");
        }
      }
      //pan mode
      if (e.key === " ") {
        togglePanMode();
      }
    },
    [
      selectedNodes,
      addNode,
      addChildNode,
      addSiblingChildNode,
      addSiblingNode,
      delNode,
      findParentNode,
      handleSaveMindMap,
      nodes,
      rootNode,
      scrollToCenter,
      toggleFullScreen,
      handleZoom,
      isAnyEditing,
      togglePanMode,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const rootSvgLoc = getRootSvgLoc(rootNode.outline.width);

  return (
    <div className="mindmap">
      <RootNode
        rootNode={rootNode}
        setRootNode={setRootNode}
        rootRef={rootRef}
        isSelected={selectedNodes.includes(rootNode.id)}
        zoomLevel={zoomLevel}
        setIsAnyEditing={setIsAnyEditing}
      />

      <div className="nodes flex flex-col items-start">
        {nodes.map((node, index) => (
          <Node
            key={node.id}
            rootNode={rootNode}
            node={nodes[index]}
            setNodes={setNodes}
            nodeRef={nodeRefs.current[index]}
            nodeRefs={nodeRefs}
            delNode={delNode}
            isSelected={selectedNodes.includes(node.id)}
            selectedNodes={selectedNodes}
            setSelectedNodes={setSelectedNodes}
            zoomLevel={zoomLevel}
            isAnyEditing={isAnyEditing}
            setIsAnyEditing={setIsAnyEditing}
          />
        ))}
      </div>
      <svg
        className="lines"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: `scale(${1 / zoomLevel})`,
        }}
        ref={svgRef}
      >
        {nodes.map((node, index) => {
          const nodeLoc = getNodeSvgLoc(nodeRefs.current[index], node);
          return (
            <React.Fragment key={node.id}>
              <path
                d={`M${rootSvgLoc.x} ${rootSvgLoc.y} Q ${rootSvgLoc.x} ${nodeLoc.y}, ${nodeLoc.x} ${nodeLoc.y}`}
                stroke={node.pathColor}
                fill="none"
                strokeWidth={node.path.width * zoomLevel}
                strokeDasharray={node.path.style * zoomLevel}
              />
              {/* <circle cx={nodeLoc.x} cy={nodeLoc.y} r="5" fill="blue" /> */}
            </React.Fragment>
          );
        })}
        {/* <circle cx={rootSvgLoc.x} cy={rootSvgLoc.y} r="5" fill="red" /> */}
      </svg>
    </div>
  );
};

export default MindMap;