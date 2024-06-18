import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { v4 as uuidv4 } from "uuid";

//根節點元件
const RootNode = ({ addNode, rootRef, rootNode, setRootNode, rootNodeRef }) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  //當isEditing改變時，執行該useEffect。若處於編輯模式且inputRef不為空，則將焦點設置到輸入框上。
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  //開啟編輯模式
  const editMode = () => {
    setIsEditing(true);
  };
  //關閉編輯模式
  const unEditMode = (e) => {
    setRootNode((prev) => ({ ...prev, name: e.target.innerText }));
    setIsEditing(false);
    if (rootRef.current) {
      rootRef.current.focus(); // 關閉編輯模式後將焦點設置回根節點
    }
  };

  return (
    <div
      className="rootnode"
      tabIndex="0"
      ref={rootRef}
      onDoubleClick={editMode}
      onKeyDown={(e) => {
        if ((e.key === "Tab" || e.key === "Enter") && !isEditing) {
          e.preventDefault();
          addNode();
        }
      }}
    >
      {isEditing ? (
        <>
          <div
            ref={inputRef}
            className="input-box"
            style={{
              minWidth: rootNodeRef.current.getBoundingClientRect().width, //至少要與根節點同寬
              maxWidth: "500px", //最大不能超過500
            }}
            contentEditable="true"
            //加上這行才不會有Warning: A component is `contentEditable` and contains `children` managed by React....
            suppressContentEditableWarning="true"
            onBlur={unEditMode}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                unEditMode(e);
              }
            }}
          >
            {rootNode.name}
          </div>
          <span>{rootNode.name}</span>
        </>
      ) : (
        <span>{rootNode.name}</span>
      )}
    </div>
  );
};

//節點元件(第二層)
const Node = ({ node, nodeRef, setNodes, addNode }) => {
  const [isEditing, setIsEditing] = useState(node.isNew);
  const inputRef = useRef(null);

  // 新增新節點自動聚焦該節點的inputbox
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      setNodes((prev) =>
        prev.map((item) =>
          item.id === node.id ? { ...item, isNew: false } : item
        )
      );
    }
  }, [isEditing, node.id, setNodes]);

  //開啟編輯模式
  const editMode = () => {
    setIsEditing(true);
  };
  //關閉編輯模式
  const unEditMode = (e) => {
    const newName = e.target.innerText;
    setNodes((prev) =>
      prev.map((item) =>
        item.id === node.id ? { ...item, name: newName } : item
      )
    );
    setIsEditing(false);
    if (nodeRef.current) {
      nodeRef.current.focus(); // 關閉編輯模式後將焦點設置回節點
    }
  };

  return (
    <div
      className="node"
      tabIndex="0"
      ref={nodeRef}
      onDoubleClick={editMode}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          addNode(node.id);
        }
      }}
    >
      {isEditing ? (
        <>
          <div
            ref={inputRef}
            className="input-box"
            style={{
              minWidth: nodeRef.current
                ? nodeRef.current.getBoundingClientRect().width
                : "68px",
              maxWidth: "500px",
            }}
            contentEditable="true"
            suppressContentEditableWarning="true"
            onBlur={unEditMode}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                unEditMode(e);
              }
            }}
          >
            {node.name}
          </div>
          <span>{node.name}</span>
        </>
      ) : (
        <span>{node.name}</span>
      )}
    </div>
  );
};

//心智圖組件
const MindMap = () => {
  const [rootNode, setRootNode] = useState({ name: "根節點" });
  const [nodes, setNodes] = useState([]);
  const nodeRefs = useRef([]); //宣告一個nodeRefs引用並初始化為空陣列，用來存儲每個節點Dom的引用
  const rootNodeRef = useRef(null); //用來存儲根節點Dom的引用
  const pathRef = useRef(null); // 用來存儲線段Dom的引用

  // 新增節點及每個節點的唯一id，參數id預設為null用來處理根結點新增的部分
  const addNode = (id = null) => {
    const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 90%, 65%)`;
    setNodes((prev) => {
      const newNodes = [...prev];
      const newNode = {
        id: uuidv4(),
        name: "節點",
        color: randomColor,
        isNew: true,
      };
      if (id === null) {
        newNodes.push(newNode); // 如果 id 為 null，將新節點添加到數組末尾
        nodeRefs.current.push(React.createRef()); // 為每個新節點添加一個引用
      } else {
        const index = newNodes.findIndex((node) => node.id === id);
        newNodes.splice(index + 1, 0, newNode); // 在指定id的位置之後插入新節點
        nodeRefs.current.splice(index + 1, 0, React.createRef()); // 為每個新節點添加一個引用
      }
      return newNodes;
    });
  };

  const getRootNodeLoc = () => {
    if (rootNodeRef.current && pathRef.current) {
      const rootRect = rootNodeRef.current.getBoundingClientRect(); // 獲取根節點的矩形對象
      const pathRect = pathRef.current.getBoundingClientRect(); // 獲取 SVG 的矩形對象

      return {
        x: rootRect.left - pathRect.left + rootRect.width, // 計算path根節點接點的X坐標(相對於g，也就是將g當作視口去計算)
        y: rootRect.top - pathRect.top + rootRect.height / 2, // 計算根節點的中心點相對於g的Y坐標
      };
    }
    return { x: 0, y: 0 };
  };

  const getNodeLoc = (nodeRef) => {
    if (nodeRef.current && pathRef.current) {
      const nodeRect = nodeRef.current.getBoundingClientRect(); // 獲取節點的矩形對象
      const pathRect = pathRef.current.getBoundingClientRect(); // 獲取 path 的矩形對象
      return {
        x: nodeRect.left - pathRect.left, // 計算節點的中心點相對於g的X坐標，也就是將g當作視口去計算
        y: nodeRect.top - pathRect.top + nodeRect.height / 2, // 計算節點的中心點相對於g的Y坐標
      };
    }
    return { x: 0, y: 0 };
  };

  useLayoutEffect(() => {
    const updateLocs = () => {
      const rootNodeLoc = getRootNodeLoc();
      const nodeLocs = nodeRefs.current.map((ref) => getNodeLoc(ref)); // 獲取每個節點的位置
      setNodes((prev) =>
        prev.map((node, index) => ({
          ...node,
          position: nodeLocs[index] || node.position,
        }))
      );

      setRootNode((prev) => ({ ...prev, position: rootNodeLoc }));
    };
    updateLocs(); // 更新位置
  }, [nodes.length, rootNode.name]); // 當 nodes 的長度發生變化時，重新計算位置

  const rootNodeLoc = getRootNodeLoc();

  // 在 useEffect 中初始滾動至畫布的中心點
  useEffect(() => {
    // 處理Tab鍵預設動作
    window.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
      }
    });
    const canvas = document.querySelector(".canvas-wrap");
    if (canvas) {
      const { clientWidth, clientHeight, scrollWidth, scrollHeight } = canvas;
      canvas.scrollTo({
        left: (scrollWidth - clientWidth) / 2,
        top: (scrollHeight - clientHeight) / 2,
      });
    }
  }, []);

  return (
    <div className="mindmap d-flex align-items-center justify-content-center">
      <RootNode
        addNode={addNode}
        rootRef={rootNodeRef}
        rootNode={rootNode}
        setRootNode={setRootNode}
        rootNodeRef={rootNodeRef}
      />

      <div className="nodes d-flex justify-content-center flex-column align-items-start">
        {nodes.map((node, index) => (
          <Node
            key={node.id}
            nodeRef={nodeRefs.current[index]}
            node={nodes[index]}
            setNodes={setNodes}
            addNode={addNode}
          />
        ))}
      </div>
      <div className=""></div>
      <svg
        className="svg"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        ref={pathRef}
      >
        {nodes.map((node, index) => {
          const nodeLoc = getNodeLoc(nodeRefs.current[index]); // 獲取每個節點的位置
          return (
            <React.Fragment key={node.id}>
              <path
                d={`M ${rootNodeLoc.x} ${rootNodeLoc.y} Q ${rootNodeLoc.x} ${nodeLoc.y}, ${nodeLoc.x} ${nodeLoc.y}`}
                stroke={node.color}
                fill="none"
                strokeWidth="3"
              />
              <circle cx={nodeLoc.x} cy={nodeLoc.y} r="5" fill="blue" />
            </React.Fragment>
          );
        })}
        <circle cx={rootNodeLoc.x} cy={rootNodeLoc.y} r="5" fill="red" />
      </svg>
    </div>
  );
};

export default MindMap;
