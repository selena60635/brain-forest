import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import Node from "./components/Node";
import RootNode from "./components/RootNode";
import { v4 as uuidv4 } from "uuid";

// 心智圖組件
const MindMap = ({
  selectBox,
  canvasRef,
  addNode,
  setNodes,
  nodes,
  rootNode,
  setRootNode,
  setSelectedNodes,
  selectedNodes,
  nodeRefs,
  delNode,
}) => {
  const [isEditRoot, setIsEditRoot] = useState(false); //定義根節點編輯模式狀態，初始為false
  const rootNodeRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的根節點Dom元素
  const svgRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的svg Dom元素

  // 取得根結點svg位置
  const getRootSvgLoc = () => {
    if (rootNodeRef.current && svgRef.current) {
      const rootRect = rootNodeRef.current.getBoundingClientRect(); // 獲取根節點的矩形物件
      const svgRect = svgRef.current.getBoundingClientRect(); // 獲取 SVG 的矩形物件
      return {
        x: rootRect.left - svgRect.left + rootRect.width, // 計算path根節點接點的X坐標(相對於g，也就是將g當作視口去計算)
        y: rootRect.top - svgRect.top + rootRect.height / 2, // 計算根節點的中心點相對於g的Y坐標
      };
    }
    return { x: 0, y: 0 };
  };

  // 取得節點svg位置
  const getNodeSvgLoc = useCallback(
    (nodeRef) => {
      if (nodeRef && nodeRef.current && svgRef.current) {
        const nodeRect = nodeRef.current.getBoundingClientRect();
        const svgRect = svgRef.current.getBoundingClientRect();
        return {
          x: nodeRect.left - svgRect.left,
          y: nodeRect.top - svgRect.top + nodeRect.height / 2,
        };
      }
      return { x: 0, y: 0 };
    },
    [svgRef]
  );
  // 取得節點canvas位置
  const getNodeCanvasLoc = useCallback(
    (nodeRef) => {
      if (nodeRef && nodeRef.current && canvasRef.current) {
        const nodeRect = nodeRef.current.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        return {
          left: nodeRect.left - canvasRect.left + canvasRef.current.scrollLeft,
          top: nodeRect.top - canvasRect.top + canvasRef.current.scrollTop,
          right:
            nodeRect.right - canvasRect.left + canvasRef.current.scrollLeft,
          bottom:
            nodeRect.bottom - canvasRect.top + canvasRef.current.scrollTop,
        };
      }
      return { left: 0, top: 0, right: 0, bottom: 0 };
    },
    [canvasRef]
  );

  //更新節點與根節點的連接線
  const nodesString = JSON.stringify(nodes);
  useLayoutEffect(() => {
    setNodes((prev) => [...prev]);
    setRootNode((prev) => ({ ...prev }));
  }, [
    nodesString,
    rootNode.name,
    nodeRefs,
    setNodes,
    setRootNode,
    getNodeSvgLoc,
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
    [selectBox] //當selectBox 發生變化時，重新執行函式
  );

  useLayoutEffect(() => {
    if (selectBox) {
      const selected = []; //存放被選中的節點ID
      const rootRect = getNodeCanvasLoc(rootNodeRef); //取得根節點在canvas上的位置
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
      setSelectedNodes(selected); //更新選擇名單
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
  ]);

  //處理新增子節點操作
  const addChildNode = useCallback(
    (parentId) => {
      const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 90%, 50%)`;
      const newChildNode = {
        id: uuidv4(),
        name: "子節點",
        color: randomColor,
        isNew: true,
        parentId,
        children: [],
      };
      //遞迴一層層遍歷nodes，確保子節點新增到其父節點的children內
      const addChildToParent = (nodes) =>
        nodes.map((node) => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [...(node.children || []), newChildNode],
            };
          } else if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: addChildToParent(node.children),
            };
          }
          return node;
        });
      setNodes((prev) => addChildToParent(prev));
      setSelectedNodes([newChildNode.id]);
    },
    [setNodes, setSelectedNodes]
  );

  // 查找父節點及其子節點
  const findParentNode = useCallback(
    (nodes) => {
      let parentNodeId = null;
      let parentNodeChildren = null;

      const findNode = (nodes) => {
        for (let node of nodes) {
          if (node.children) {
            if (node.children.some((child) => child.id === selectedNodes[0])) {
              parentNodeId = node.id;
              parentNodeChildren = node.children;
              return;
            }
            findNode(node.children);
          }
        }
      };

      findNode(nodes);
      return { parentNodeId, parentNodeChildren };
    },
    [selectedNodes]
  );

  //新增相鄰子節點
  const addSiblingChildNode = useCallback(
    (parentNodeId, parentNodeChildren) => {
      const selectedNodeIndex = parentNodeChildren.findIndex(
        (child) => child.id === selectedNodes[0]
      );

      const newSiblingNode = {
        id: uuidv4(),
        name: "子節點",
        color: `hsl(${Math.floor(Math.random() * 360)}, 90%, 50%)`,
        isNew: true,
        children: [],
      };

      const addSibling = (nodes) => {
        return nodes.map((node) => {
          if (node.id === parentNodeId) {
            return {
              ...node,
              children: [
                ...node.children.slice(0, selectedNodeIndex + 1),
                newSiblingNode,
                ...node.children.slice(selectedNodeIndex + 1),
              ],
            };
          } else if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: addSibling(node.children),
            };
          }
          return node;
        });
      };

      setNodes((prev) => addSibling(prev));
      setSelectedNodes([newSiblingNode.id]);

      if (!nodeRefs.current[parentNodeId]) {
        nodeRefs.current[parentNodeId] = [];
      }
      nodeRefs.current[parentNodeId].splice(
        selectedNodeIndex + 1,
        0,
        React.createRef()
      );
    },
    [selectedNodes, setNodes, setSelectedNodes, nodeRefs]
  );

  //新增相鄰節點
  const addSiblingNode = useCallback(() => {
    const selectedNodeIndex = nodes.findIndex(
      (node) => node.id === selectedNodes[0]
    );
    const newSiblingNode = {
      id: uuidv4(),
      name: "節點",
      color: `hsl(${Math.floor(Math.random() * 360)}, 90%, 50%)`,
      isNew: true,
      children: [],
    };
    setNodes((prevNodes) => {
      const newNodes = [
        ...prevNodes.slice(0, selectedNodeIndex + 1),
        newSiblingNode,
        ...prevNodes.slice(selectedNodeIndex + 1),
      ];
      return newNodes;
    });

    setSelectedNodes([newSiblingNode.id]);
    nodeRefs.current.splice(selectedNodeIndex + 1, 0, React.createRef());
  }, [nodes, selectedNodes, setNodes, setSelectedNodes, nodeRefs]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        ["Enter", "Delete", "Tab"].includes(e.key) &&
        selectedNodes.length === 1
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.key === "Enter" && selectedNodes.length === 1) {
        if (selectedNodes[0] === rootNode.id) {
          addNode(null);
          return;
        }

        const { parentNodeId, parentNodeChildren } = findParentNode([
          rootNode,
          ...nodes,
        ]);

        if (parentNodeId && parentNodeChildren) {
          addSiblingChildNode(parentNodeId, parentNodeChildren);
        } else {
          addSiblingNode();
        }
      }

      if (e.key === "Delete" && selectedNodes.length > 0) {
        delNode(selectedNodes);
      }

      if (e.key === "Tab" && selectedNodes.length === 1) {
        if (selectedNodes[0] === rootNode.id) {
          addNode(null);
        } else {
          addChildNode(selectedNodes[0]);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedNodes,
    isEditRoot,
    rootNode.id,
    delNode,
    addNode,
    addChildNode,
    nodeRefs,
    nodes,
    rootNode,
    setNodes,
    setSelectedNodes,
    addSiblingNode,
    addSiblingChildNode,
    findParentNode,
  ]);

  const rootSvgLoc = getRootSvgLoc();

  return (
    <div className="mindmap">
      <RootNode
        isEditRoot={isEditRoot}
        setIsEditRoot={setIsEditRoot}
        rootRef={rootNodeRef}
        rootNode={rootNode}
        setRootNode={setRootNode}
        rootNodeRef={rootNodeRef}
        isSelected={selectedNodes.includes(rootNode.id)}
        setSelectedNodes={setSelectedNodes}
      />

      <div className="nodes flex flex-col items-start">
        {nodes.map((node, index) => (
          <Node
            key={node.id}
            nodeRef={nodeRefs.current[index]}
            node={nodes[index]}
            setNodes={setNodes}
            delNode={delNode}
            isSelected={selectedNodes.includes(node.id)}
            selectedNodes={selectedNodes}
            setSelectedNodes={setSelectedNodes}
            nodeRefs={nodeRefs}
          />
        ))}
      </div>
      <svg
        className="lines"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        ref={svgRef}
      >
        {nodes.map((node, index) => {
          const nodeLoc = getNodeSvgLoc(nodeRefs.current[index]);
          return (
            <React.Fragment key={node.id}>
              <path
                d={`M${rootSvgLoc.x} ${rootSvgLoc.y} Q ${rootSvgLoc.x} ${nodeLoc.y}, ${nodeLoc.x} ${nodeLoc.y}`}
                stroke={node.color}
                fill="none"
                strokeWidth="3"
              />
              <circle cx={nodeLoc.x} cy={nodeLoc.y} r="5" fill="blue" />
            </React.Fragment>
          );
        })}
        <circle cx={rootSvgLoc.x} cy={rootSvgLoc.y} r="5" fill="red" />
      </svg>
    </div>
  );
};

export default MindMap;
