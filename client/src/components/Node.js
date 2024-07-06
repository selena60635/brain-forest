import React, { useState, useRef, useEffect } from "react";

// 聚焦到 inputbox 並自動選取文本
const selectText = (inputElement) => {
  if (inputElement) {
    inputElement.focus();
    const range = document.createRange();
    range.selectNodeContents(inputElement);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

// 子節點組件
const ChildNode = ({
  childnode,
  setNodes,
  parentId,
  childRef,
  isSelected,
  nodeRefs,
  setSelectedNodes,
  selectedNodes,
  parentRef,
}) => {
  const [isEditing, setIsEditing] = useState(childnode.isNew);
  const inputRef = useRef(null);
  const svgRef = useRef(null);

  //進入編輯模式後切換焦點，更新nodes狀態
  useEffect(() => {
    if (isEditing && inputRef.current) {
      selectText(inputRef.current);
      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          if (node.id === parentId) {
            return {
              ...node,
              children: node.children.map((child) =>
                child.id === childnode.id ? { ...child, isNew: false } : child
              ),
            };
          }
          return node;
        });
      });
    }
  }, [isEditing, childnode.id, parentId, setNodes]);

  //開啟編輯模式
  const editMode = () => {
    setIsEditing(true);
  };
  //關閉編輯模式
  const unEditMode = (e) => {
    //遞迴遍歷nodes每一層，更新子節點名稱
    const updateNodeName = (nodes) => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          //若當前節點是父節點，更新其children內相應的子節點名稱
          return {
            ...node,
            children: node.children.map((child) =>
              child.id === childnode.id
                ? { ...child, name: e.target.textContent }
                : child
            ),
          };
        } else if (node.children && node.children.length > 0) {
          //若當前節點有子節點，遞迴處理其子節點
          return {
            ...node,
            children: updateNodeName(node.children), //遞迴處理其children，繼續查找下一層子節點是否有父節點
          };
        }
        return node; //若當前節點既不是父節點，也沒有子節點，代表是最末層的節點，不做任何修改
      });
    };
    //更新節點數據為更新完名稱的新nodes
    setNodes((prevNodes) => updateNodeName(prevNodes));
    setIsEditing(false);
  };
  //取得子節點svg位置
  const getChildSvgLoc = (childRef, parentRef, svgRef) => {
    if (childRef?.current && parentRef?.current && svgRef?.current) {
      const childRect = childRef.current.getBoundingClientRect();
      const parentRect = parentRef.current.getBoundingClientRect();
      const svgRect = svgRef.current.getBoundingClientRect();
      return {
        x: parentRect.left - svgRect.left + parentRect.width,
        y: parentRect.top - svgRect.top + parentRect.height / 2,
        childX: childRect.left - svgRect.left,
        childY: childRect.top - svgRect.top + childRect.height / 2,
      };
    }
    return { x: 0, y: 0, childX: 0, childY: 0 };
  };

  const childLoc = getChildSvgLoc(childRef, parentRef, svgRef);

  return (
    <div className="flex items-center">
      <div
        className={`child-node ${isSelected ? "selected" : ""}`}
        style={{
          backgroundColor: childnode.bkColor,
          outline: `${childnode.outline.width} ${childnode.outline.style} ${childnode.outline.color}`,
        }}
        tabIndex="0"
        onDoubleClick={editMode}
        ref={childRef}
      >
        {isEditing ? (
          <>
            <div
              ref={inputRef}
              className="input-box"
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
              {childnode.name}
            </div>
            <span className="text-white">{childnode.name}</span>
          </>
        ) : (
          <span className="text-white">{childnode.name}</span>
        )}
      </div>
      <div className="children">
        {childnode.children &&
          childnode.children.length > 0 &&
          childnode.children.map((subChildNode, index) => {
            //確保在引用中有當前子節點，若沒有則新增
            if (!nodeRefs.current[childnode.id]) {
              nodeRefs.current[childnode.id] = [];
            }
            return (
              <ChildNode
                key={subChildNode.id}
                childnode={subChildNode}
                setNodes={setNodes}
                parentId={childnode.id} //父節點id為上一層子節點id
                isSelected={selectedNodes.includes(subChildNode.id)}
                nodeRefs={nodeRefs}
                setSelectedNodes={setSelectedNodes}
                selectedNodes={selectedNodes}
                parentRef={childRef} //父節點引用為上一層子節點引用
                childRef={
                  nodeRefs.current[childnode.id][index] ||
                  (nodeRefs.current[childnode.id][index] = React.createRef())
                } //子節點引用為上一層子節點的對應索引位置元素，若沒有這個引用則建立一個新的引用
              />
            );
          })}
      </div>

      <svg className="subLines" overflow="visible" ref={svgRef}>
        <path
          d={`M ${childLoc.x} ${childLoc.y} Q ${childLoc.x} ${childLoc.childY}, ${childLoc.childX} ${childLoc.childY}`}
          stroke={childnode.pathColor}
          fill="none"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
};

// 節點組件（第二層）
const Node = ({
  node,
  nodeRef,
  setNodes,
  isSelected,
  selectedNodes,
  nodeRefs,
  setSelectedNodes,
}) => {
  const [isEditing, setIsEditing] = useState(node.isNew);
  const inputRef = useRef(null);

  //確保在引用中有當前節點，若沒有則新增
  if (!nodeRefs.current[node.id]) {
    nodeRefs.current[node.id] = [];
  }
  //進入編輯模式後切換焦點
  useEffect(() => {
    if (isEditing && inputRef.current) {
      selectText(inputRef.current);
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
    setNodes((prev) => {
      return prev.map((item) => {
        if (item.id === node.id) {
          return { ...item, name: e.target.textContent };
        }
        return item;
      });
    });
    setIsEditing(false);
  };

  return (
    <div className="nodes-wrap flex items-center">
      <div
        className={`node ${isSelected ? "selected" : ""}`}
        style={{
          backgroundColor: node.bkColor,
          outline: `${node.outline.width} ${node.outline.style} ${node.outline.color}`,
        }}
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
            <span className="text-white">{node.name}</span>
          </>
        ) : (
          <span className="text-white">{node.name}</span>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <div className="children flex flex-col items-start">
          {node.children.map((childnode, childIndex) => {
            if (!nodeRefs.current[node.id][childIndex]) {
              //若nodeRefs中沒有當前子節點的引用，建立一個新的引用
              nodeRefs.current[node.id][childIndex] = React.createRef();
            }
            //取得當前子節點引用
            const childRef = nodeRefs.current[node.id][childIndex];
            return (
              <ChildNode
                key={childnode.id}
                childnode={childnode}
                setNodes={setNodes}
                parentId={node.id}
                childRef={childRef}
                parentRef={nodeRef} //第一層子節點的父節點是節點
                isSelected={selectedNodes.includes(childnode.id)}
                nodeRefs={nodeRefs}
                setSelectedNodes={setSelectedNodes}
                selectedNodes={selectedNodes}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Node;
