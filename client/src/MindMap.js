import React, { useState, useRef, useEffect } from "react";

//根節點元件
const RootNode = (props) => {
  const [rootNodeName, setRootNodeName] = useState("根節點");
  const [isEditing, setIsEditing] = useState(false);
  const inputDivRef = useRef(null);

  //當isEditing改變時，執行該useEffect。若處於編輯模式且inputDivRef不為空，則將焦點設置到輸入框上。
  useEffect(() => {
    if (isEditing && inputDivRef.current) {
      inputDivRef.current.focus();
    }
  }, [isEditing]);

  //開啟編輯模式
  const editMode = () => {
    setIsEditing(true);
  };
  //關閉編輯模式
  const unEditMode = (e) => {
    setRootNodeName(e.target.innerText);
    setIsEditing(false);
  };

  return (
    <div className="rootnode" tabIndex="0" onDoubleClick={editMode}>
      {isEditing ? (
        <div
          ref={inputDivRef}
          className="input-box"
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
          {rootNodeName}
        </div>
      ) : (
        <span>{rootNodeName}</span>
      )}
    </div>
  );
};

//節點元件(第二層)
const Node = (props) => {
  return (
    <div className="node">
      <span>節點</span>
    </div>
  );
};

//心智圖組件
const MindMap = () => {
  const [nodes, setNodes] = useState([]);

  return (
    <div className="d-flex align-items-center">
      <RootNode />
      <div className="nodes"></div>
      <div className=""></div>
    </div>
  );
};

export default MindMap;
