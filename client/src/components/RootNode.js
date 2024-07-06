import React, { useRef, useEffect } from "react";

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
  // 進入編輯模式後切換焦點
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
    setRootNode((prev) => ({ ...prev, name: e.target.innerText }));
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
              minWidth: rootNodeRef.current.getBoundingClientRect().width,
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
export default RootNode;
