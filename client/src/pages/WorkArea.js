// import React from "react";
// import MindMap from "../MindMap";

// const WorkArea = () => {
//   return (
//     <div className="canvas-wrap">
//       <div className="canvas">
//         <MindMap />
//       </div>
//     </div>
//   );
// };

// export default WorkArea;

import React, { useState, useRef, useEffect } from "react";
import MindMap from "../MindMap";

const WorkArea = () => {
  const [selectBox, setSelectBox] = useState(null); //存儲選擇框位置
  const selectStart = useRef({ x: 0, y: 0 }); //用來引用並存儲鼠標起始位置，始終不變
  const canvasRef = useRef(null); //用來引用並存儲畫布Dom

  // 初始滾動至畫布的中心點
  useEffect(() => {
    // 處理Tab鍵預設動作
    window.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
      }
    });
    if (canvasRef.current) {
      const { clientWidth, clientHeight, scrollWidth, scrollHeight } =
        canvasRef.current;
      canvasRef.current.scrollTo({
        left: (scrollWidth - clientWidth) / 2,
        top: (scrollHeight - clientHeight) / 2,
      });
    }
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // 只有點擊左鍵觸發
    const rect = canvasRef.current.getBoundingClientRect(); // 獲取畫布的矩形物件
    //設定鼠標起點位置
    selectStart.current = {
      x: e.clientX + canvasRef.current.scrollLeft - rect.left,
      y: e.clientY + canvasRef.current.scrollTop - rect.top,
    };
    //設定選擇框狀態起點(初始)的尺寸及位置
    setSelectBox({
      left: selectStart.current.x,
      top: selectStart.current.y,
      width: 0,
      height: 0,
    });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect(); // 獲取畫布的矩形物件
    const x = e.clientX - rect.left + canvasRef.current.scrollLeft; //計算鼠標與畫布的相對x坐標，且隨滾動幅度調整
    const y = e.clientY - rect.top + canvasRef.current.scrollTop; //計算鼠標與畫布的相對y坐標，且隨滾動幅度調整

    // 檢查鼠標是否靠近視口邊緣，並滾動視口
    const scrollMargin = 10; // 滾動觸發的邊緣距離
    const scrollSpeed = 10; // 每次滾動的距離

    if (e.clientX > rect.right - scrollMargin) {
      canvasRef.current.scrollLeft += scrollSpeed;
    } else if (e.clientX < rect.left + scrollMargin) {
      canvasRef.current.scrollLeft -= scrollSpeed;
    }
    if (e.clientY > rect.bottom - scrollMargin) {
      canvasRef.current.scrollTop += scrollSpeed;
    } else if (e.clientY < rect.top + scrollMargin) {
      canvasRef.current.scrollTop -= scrollSpeed;
    }

    // 更新選擇框的位置和尺寸
    setSelectBox({
      left: Math.min(x, selectStart.current.x), //不管從哪個方向開始拉，選擇框左測(x座標)始終會是左側，也就是鼠標目前位置與起始位置中比較小的那個值
      top: Math.min(y, selectStart.current.y),
      width: Math.abs(x - selectStart.current.x),
      height: Math.abs(y - selectStart.current.y),
    });
  };

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove); //移除mousemove事件監聽器，以及該事件監聽器會執行的函式
    window.removeEventListener("mouseup", handleMouseUp); //移除mouseup事件監聽器，以及該事件監聽器會執行的函式
    setSelectBox(null); // 放開滑鼠左鍵後隱藏選取框
  };

  return (
    <div className="canvas-wrap" onMouseDown={handleMouseDown} ref={canvasRef}>
      {selectBox && (
        <div
          className="select-box"
          style={{
            left: selectBox.left,
            top: selectBox.top,
            width: selectBox.width,
            height: selectBox.height,
          }}
        />
      )}
      <div className="canvas">
        <MindMap selectBox={selectBox} canvasRef={canvasRef} />
      </div>
    </div>
  );
};

export default WorkArea;
