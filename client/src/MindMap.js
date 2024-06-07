import React, { useState, useRef, useEffect } from "react";

//根節點元件
const RootNode = (props) => {
  const inputDivRef = useRef(null);
  //當isEditing改變時，執行該useEffect。若處於編輯模式且inputDivRef不為空，則將焦點設置到輸入框上。
  useEffect(() => {
    // console.log("inputDivRef.current:", inputDivRef.current);
    if (props.isEditing && inputDivRef.current) {
      console.log("inputDivRef.current:", inputDivRef.current);
      inputDivRef.current.focus();
    }
  }, [props.isEditing]);

  return (
    <div className="rootnode" tabIndex="0" onDoubleClick={props.editMode}>
      {props.isEditing ? (
        <div
          ref={inputDivRef}
          className="input-box"
          contentEditable="true"
          //加上這行才不會有Warning: A component is `contentEditable` and contains `children` managed by React....
          suppressContentEditableWarning="true"
          onBlur={props.unEditMode}
          onKeyDown={props.unEditMode}
        >
          {props.rootNodeName}
        </div>
      ) : (
        <span>{props.rootNodeName}</span>
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
  const [rootNodeName, setRootNodeName] = useState("根節點");
  const [isEditing, setIsEditing] = useState(false);

  //開啟編輯模式
  const editMode = () => {
    setIsEditing(true);
  };
  //關閉編輯模式git
  const unEditMode = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setRootNodeName(e.target.innerText);
    } else {
      setRootNodeName(e.target.innerText);
    }
    setIsEditing(false);
  };

  return (
    <div className="">
      <RootNode
        editMode={editMode}
        unEditMode={unEditMode}
        isEditing={isEditing}
        rootNodeName={rootNodeName}
      />
    </div>
  );
};

export default MindMap;
