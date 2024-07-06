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
  const pathRef = useRef(null);

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

  const editMode = () => {
    setIsEditing(true);
  };

  const unEditMode = (e) => {
    const updateNodeName = (nodes) => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          return {
            ...node,
            children: node.children.map((child) =>
              child.id === childnode.id
                ? { ...child, name: e.target.innerText }
                : child
            ),
          };
        } else if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: updateNodeName(node.children),
          };
        }
        return node;
      });
    };

    setNodes((prevNodes) => updateNodeName(prevNodes));
    setIsEditing(false);
  };

  const getChildSvgLoc = (childRef, parentRef, pathRef) => {
    if (childRef?.current && parentRef?.current && pathRef?.current) {
      const childRect = childRef.current.getBoundingClientRect();
      const parentRect = parentRef.current.getBoundingClientRect();
      const svgRect = pathRef.current.getBoundingClientRect();
      return {
        x: parentRect.left - svgRect.left + parentRect.width,
        y: parentRect.top - svgRect.top + parentRect.height / 2,
        childX: childRect.left - svgRect.left,
        childY: childRect.top - svgRect.top + childRect.height / 2,
      };
    }
    return { x: 0, y: 0, childX: 0, childY: 0 };
  };

  const childLoc = getChildSvgLoc(childRef, parentRef, pathRef);

  return (
    <div className="flex items-center">
      <div
        className={`child-node ${isSelected ? "selected" : ""}`}
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
            <span>{childnode.name}</span>
          </>
        ) : (
          <span>{childnode.name}</span>
        )}
      </div>
      <div className="children">
        {childnode.children &&
          childnode.children.length > 0 &&
          childnode.children.map((subChildNode, index) => {
            if (!nodeRefs.current[childnode.id]) {
              nodeRefs.current[childnode.id] = [];
            }
            return (
              <ChildNode
                key={subChildNode.id}
                childnode={subChildNode}
                setNodes={setNodes}
                parentId={childnode.id}
                isSelected={selectedNodes.includes(subChildNode.id)}
                nodeRefs={nodeRefs}
                setSelectedNodes={setSelectedNodes}
                selectedNodes={selectedNodes}
                parentRef={childRef}
                childRef={
                  nodeRefs.current[childnode.id][index] ||
                  (nodeRefs.current[childnode.id][index] = React.createRef())
                }
              />
            );
          })}
      </div>

      <svg className="subLines" overflow="visible" ref={pathRef}>
        <path
          d={`M ${childLoc.x} ${childLoc.y} Q ${childLoc.x} ${childLoc.childY}, ${childLoc.childX} ${childLoc.childY}`}
          stroke={childnode.color}
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

  if (!nodeRefs.current[node.id]) {
    nodeRefs.current[node.id] = [];
  }

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

  const editMode = () => {
    setIsEditing(true);
  };

  const unEditMode = (e) => {
    const updateNodeName = (nodes) => {
      return nodes.map((item) => {
        if (item.id === node.id) {
          return { ...item, name: e.target.innerText };
        } else if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateNodeName(item.children),
          };
        }
        return item;
      });
    };

    setNodes((prevNodes) => updateNodeName(prevNodes));
    setIsEditing(false);
  };

  return (
    <div className="nodes-wrap flex items-center">
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
      {node.children && node.children.length > 0 && (
        <div className="children flex flex-col items-start">
          {node.children.map((childnode, childIndex) => {
            if (!nodeRefs.current[node.id][childIndex]) {
              nodeRefs.current[node.id][childIndex] = React.createRef();
            }
            const childRef = nodeRefs.current[node.id][childIndex];
            return (
              <ChildNode
                key={childnode.id}
                childnode={childnode}
                setNodes={setNodes}
                parentId={node.id}
                childRef={childRef}
                parentRef={nodeRef}
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
