import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";

//聚焦到inputbox並自動選取文本
const selectText = (inputElement) => {
  if (inputElement) {
    inputElement.focus(); //將焦點設置到inputRef目前引用的Dom元素上
    //選取整個文本
    const range = document.createRange(); //創建一個新的Range物件，用來表示文本
    range.selectNodeContents(inputElement); //加入inputRef目前引用的Dom元素的所有內容(包含textnode的文本)
    const selection = window.getSelection(); //取得目前選擇的文本範圍(Selection物件)
    selection.removeAllRanges(); //清除目前選擇的文本範圍
    selection.addRange(range); //將包含目前選取文本內容的Range物件加入到目前selection中
  }
};

// 根節點元件
const RootNode = ({
  isEditRoot,
  setIsEditRoot,
  rootRef,
  rootNode,
  setRootNode,
  rootNodeRef,
  isSelected,
}) => {
  const inputRef = useRef(null);

  //進入編輯模式後切換焦點
  useEffect(() => {
    if (isEditRoot && inputRef.current) {
      selectText(inputRef.current);
    }
  }, [isEditRoot]);

  // 開啟編輯模式
  const editMode = () => {
    setIsEditRoot(true);
  };

  // 關閉編輯模式
  const unEditMode = (e) => {
    setRootNode((prev) => ({ ...prev, name: e.target.innerText })); //將inputbox輸入的新名稱更新到rootNode狀態中
    setIsEditRoot(false);
  };

  return (
    <div
      className={`rootnode ${isSelected ? "selected" : ""}`}
      tabIndex="0"
      ref={rootRef}
      onDoubleClick={editMode}
    >
      {isEditRoot ? (
        <>
          <div
            ref={inputRef}
            className="input-box"
            style={{
              minWidth: rootNodeRef.current.getBoundingClientRect().width, //至少要與根節點同寬
              maxWidth: "500px", //最大不能超過500
            }}
            contentEditable="true"
            // 加上這行才不會有Warning: A component is `contentEditable` and contains `children` managed by React....
            suppressContentEditableWarning="true"
            onBlur={unEditMode}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                e.stopPropagation();
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

// 節點元件(第二層)
const Node = ({ node, nodeRef, setNodes, isSelected }) => {
  const [isEditing, setIsEditing] = useState(node.isNew);
  const inputRef = useRef(null);

  // 新增新節點時自動聚焦該節點的inputbox
  useEffect(() => {
    if (isEditing && inputRef.current) {
      setNodes((prev) =>
        prev.map((item) =>
          item.id === node.id ? { ...item, isNew: false } : item
        )
      );
      selectText(inputRef.current);
    }
  }, [isEditing, node.id, setNodes]);

  // 開啟編輯模式
  const editMode = () => {
    setIsEditing(true);
  };

  // 關閉編輯模式
  const unEditMode = (e) => {
    setNodes((prev) =>
      prev.map((item) =>
        item.id === node.id ? { ...item, name: e.target.innerText } : item
      )
    ); //找出nodes中符合當前節點ID的元件，並將inputbox輸入的新名稱更新到該節點上
    setIsEditing(false);
  };

  return (
    <div
      className={`node ${isSelected ? "selected" : ""}`}
      tabIndex="0"
      ref={nodeRef}
      onDoubleClick={editMode}
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
              if (e.key === "Enter" || e.key === "Tab") {
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

// 心智圖組件
const MindMap = ({ selectBox, canvasRef }) => {
  const [rootNode, setRootNode] = useState({ id: uuidv4(), name: "根節點" }); //定義根節點狀態，並設定如何生成id，初始根節點名稱
  const [isEditRoot, setIsEditRoot] = useState(false); //定義根節點編輯模式狀態，初始為false
  const [nodes, setNodes] = useState([]); //定義節點們的狀態，用来存儲所有節點，初始為空陣列
  const [selectedNodes, setSelectedNodes] = useState([]); //定義選中節點們的狀態，初始為空陣列，用來存儲所有被選中的節點id
  const nodeRefs = useRef([]); //宣告一個引用，初始為空陣列，用來存儲每個引用的節點Dom元素
  const rootNodeRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的根節點Dom元素
  const pathRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的線段Dom元素

  // 新增節點，參數id預設為null
  const addNode = (id = null) => {
    const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 90%, 50%)`; //生成一個隨機顏色，用於新節點線段
    //更新節點陣列狀態，加入新的節點
    setNodes((prev) => {
      const newNodes = [...prev]; //創建一個新的數組，其中包含目前所有節點
      //創建新節點物件，其中包含所需的屬性
      const newNode = {
        id: uuidv4(),
        name: "節點",
        color: randomColor,
        isNew: true, //標記為新創建的節點
      };
      //如果id為 null代表目前選取的是根節點
      if (id === null) {
        newNodes.push(newNode); //將新節點添加到數組末尾
        nodeRefs.current.push(React.createRef()); //為每個新節點添加一個引用
      } else {
        const index = newNodes.findIndex((node) => node.id === id); //找出陣列中符合id節點之索引
        newNodes.splice(index + 1, 0, newNode); // 在指定id的位置之後插入新節點
        nodeRefs.current.splice(index + 1, 0, React.createRef()); // 為每個新節點添加一個引用
      }
      setSelectedNodes([newNode.id]); //將原先選擇的節點更新為新節點，轉換焦點
      return newNodes;
    });
  };

  // 刪除節點
  const delNode = useCallback((idArr) => {
    //更新節點
    setNodes((prev) => {
      //去除掉選中的節點；在nodes中篩選出id不包含在idArr中的節點，組成新的節點陣列，代表沒被選中的節點
      const newNodes = prev.filter((node) => !idArr.includes(node.id));
      //去除掉選中的節點Dom；在目前引用的節點Dom元素中，篩選出與nodes中對應索引的id不包含在idArr中的引用，組成新的引用陣列，代表沒被選中的節點Dom
      const newRefs = nodeRefs.current.filter(
        (item, index) => !idArr.includes(prev[index].id)
      );
      nodeRefs.current = newRefs; //更新引用的節點Dom
      return newNodes;
    });
  }, []);

  // 取得根結點svg位置
  const getRootSvgLoc = () => {
    if (rootNodeRef.current && pathRef.current) {
      const rootRect = rootNodeRef.current.getBoundingClientRect(); // 獲取根節點的矩形物件
      const pathRect = pathRef.current.getBoundingClientRect(); // 獲取 SVG 的矩形物件

      return {
        x: rootRect.left - pathRect.left + rootRect.width, // 計算path根節點接點的X坐標(相對於g，也就是將g當作視口去計算)
        y: rootRect.top - pathRect.top + rootRect.height / 2, // 計算根節點的中心點相對於g的Y坐標
      };
    }
    return { x: 0, y: 0 };
  };

  // 取得節點svg位置
  const getNodeSvgLoc = (nodeRef) => {
    if (nodeRef.current && pathRef.current) {
      const nodeRect = nodeRef.current.getBoundingClientRect(); // 獲取節點的矩形物件
      const pathRect = pathRef.current.getBoundingClientRect(); // 獲取 path 的矩形物件
      return {
        x: nodeRect.left - pathRect.left, // 計算節點的中心點相對於g的X坐標，也就是將g當作視口去計算
        y: nodeRect.top - pathRect.top + nodeRect.height / 2, // 計算節點的中心點相對於g的Y坐標
      };
    }
    return { x: 0, y: 0 };
  };

  // 取得節點canvas位置
  const getNodeCanvasLoc = (nodeRef, canvasRef) => {
    if (nodeRef.current && canvasRef.current) {
      const nodeRect = nodeRef.current.getBoundingClientRect();
      const canvasRect = canvasRef.current.getBoundingClientRect();
      return {
        left: nodeRect.left - canvasRect.left + canvasRef.current.scrollLeft,
        top: nodeRect.top - canvasRect.top + canvasRef.current.scrollTop,
        right: nodeRect.right - canvasRect.left + canvasRef.current.scrollLeft,
        bottom: nodeRect.bottom - canvasRect.top + canvasRef.current.scrollTop,
      };
    }
    return { left: 0, top: 0, right: 0, bottom: 0 };
  };

  const rootSvgLoc = getRootSvgLoc();

  //判斷節點是否被選中
  const isNodeSelected = useCallback(
    (nodeRect) => {
      if (!selectBox) return false;
      const selBox = {
        left: selectBox.left,
        right: selectBox.left + selectBox.width,
        top: selectBox.top,
        bottom: selectBox.top + selectBox.height,
      };

      const nodeBox = {
        left: nodeRect.left,
        right: nodeRect.right,
        top: nodeRect.top,
        bottom: nodeRect.bottom,
      };

      return !(
        selBox.right < nodeBox.left ||
        selBox.left > nodeBox.right ||
        selBox.bottom < nodeBox.top ||
        selBox.top > nodeBox.bottom
      );
    },
    [selectBox]
  );
  //處理節點與根節點的連接線
  useLayoutEffect(() => {
    const updateLocs = () => {
      const rootSvgLoc = getRootSvgLoc();
      const nodeLocs = nodeRefs.current.map((ref) => getNodeSvgLoc(ref)); // 獲取每個節點的位置
      setNodes((prev) =>
        prev.map((node, index) => ({
          ...node,
          position: nodeLocs[index] || node.position,
        }))
      );

      setRootNode((prev) => ({ ...prev, position: rootSvgLoc }));
    };
    updateLocs(); // 更新位置
  }, [nodes.length, rootNode.name]); // 當 nodes 的長度發生變化時，重新計算位置

  //更新選擇名單
  useLayoutEffect(() => {
    if (selectBox) {
      const selected = [];
      const rootNodeRect = getNodeCanvasLoc(rootNodeRef, canvasRef);
      if (isNodeSelected(rootNodeRect)) {
        selected.push(rootNode.id);
      }
      nodes.forEach((node, index) => {
        const nodeRect = getNodeCanvasLoc(nodeRefs.current[index], canvasRef);
        if (isNodeSelected(nodeRect)) {
          selected.push(node.id);
        }
      });
      setSelectedNodes(selected);
    }
  }, [selectBox, nodes, isNodeSelected, rootNode.id, canvasRef]);

  //處理新增、刪除節點事件監聽
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === "Enter" && selectedNodes.length === 1) ||
        (e.key === "Tab" && selectedNodes[0] === rootNode.id)
      ) {
        e.preventDefault();
        e.stopPropagation();
        const selectedNodeId = selectedNodes[0];
        addNode(selectedNodeId === rootNode.id ? null : selectedNodeId);
      }

      if (e.key === "Delete" && selectedNodes.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        delNode(selectedNodes);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown); //要移除事件，否則會導致無限循環造成錯誤
  }, [selectedNodes, isEditRoot, rootNode.id, delNode]);

  return (
    <div className="mindmap d-flex align-items-center justify-content-center">
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

      <div className="nodes d-flex justify-content-center flex-column align-items-start">
        {nodes.map((node, index) => (
          <Node
            key={node.id}
            nodeRef={nodeRefs.current[index]}
            node={nodes[index]}
            setNodes={setNodes}
            delNode={delNode}
            isSelected={selectedNodes.includes(node.id)}
            setSelectedNodes={setSelectedNodes}
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
          const nodeLoc = getNodeSvgLoc(nodeRefs.current[index]); // 獲取每個節點的位置
          return (
            <React.Fragment key={node.id}>
              <path
                d={`M ${rootSvgLoc.x} ${rootSvgLoc.y} Q ${rootSvgLoc.x} ${nodeLoc.y}, ${nodeLoc.x} ${nodeLoc.y}`}
                stroke={node.color}
                fill="none"
                strokeWidth="3"
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
