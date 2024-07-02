import React, { useState, useRef, useEffect, useCallback } from "react";
import MindMap from "../MindMap";
import BtnsGroup from "../components/BtnsGroup";
import { v4 as uuidv4 } from "uuid";

const WorkArea = () => {
  const [selectBox, setSelectBox] = useState(null); //存儲選擇框位置
  const selectStart = useRef({ x: 0, y: 0 }); //用來引用並存儲鼠標起始位置，始終不變
  const canvasRef = useRef(null); //用來引用並存儲畫布Dom

  const [rootNode, setRootNode] = useState({ id: uuidv4(), name: "根節點" }); //定義根節點狀態，並設定如何生成id，初始根節點名稱
  const [nodes, setNodes] = useState([]); //定義節點們的狀態，用来存儲所有節點，初始為空陣列
  const [selectedNodes, setSelectedNodes] = useState([]); //定義選中節點們的狀態，初始為空陣列，用來存儲所有被選中的節點id
  const nodeRefs = useRef([]); //宣告一個引用，初始為空陣列，用來存儲每個引用的節點Dom元素
  const btnsRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的按鈕群組

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
    const btnsGroup = btnsRef.current;
    if (e.button !== 0 || btnsGroup.contains(e.target)) return; //若滑鼠點擊的不是左鍵或點擊目標屬於按鈕群組後代，不執行後續動作

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

  // 新增節點，參數id預設為null
  const addNode = () => {
    const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 90%, 50%)`; //生成一個隨機顏色，用於新節點線段
    const newNode = {
      id: uuidv4(),
      name: "節點",
      color: randomColor,
      isNew: true, //標記為新創建的節點
    };
    //更新節點陣列狀態，加入新的節點
    setNodes((prev) => {
      const newNodes = [...prev, newNode]; //創建一個新的數組，將新節點添加到數組末尾
      nodeRefs.current.push(React.createRef()); //為每個新節點添加一個引用
      setSelectedNodes([newNode.id]); //將原先選擇的節點更新為新節點，轉換焦點
      return newNodes;
    });
  };

  // 刪除節點
  const delNode = useCallback(
    (idArr) => {
      //遞迴處理刪除節點及子節點，返回排除刪除選中節點後的新nodes陣列
      const deleteNodes = (nodes, idsToDelete) => {
        return nodes.filter((node) => {
          if (idsToDelete.includes(node.id)) {
            //若當前節點的id在要刪除的id陣列中，則刪除此節點
            return false;
          }
          if (node.children) {
            //若當前節點有子節點，傳入children繼續遞迴遍歷處理下一層
            node.children = deleteNodes(node.children, idsToDelete);
          }
          //保留沒有選中的節點，也就是不需要刪除的節點
          return true;
        });
      };
      //更新狀態為刪除選中節點後的新nodes
      setNodes((prev) => {
        //遞迴處理所有節點，會得到需要留下的節點陣列
        const newNodes = deleteNodes(prev, idArr);
        //過濾掉需刪除的節點引用的nodeRefs，更新引用
        nodeRefs.current = nodeRefs.current.filter(
          (item, index) => !idArr.includes(prev[index]?.id)
        );
        return newNodes;
      });

      setSelectedNodes([]);
    },
    [nodeRefs, setNodes, setSelectedNodes]
  );

  return (
    <>
      <div
        className="canvas-wrap"
        onMouseDown={handleMouseDown}
        ref={canvasRef}
      >
        <div
          ref={btnsRef}
          className="btns-group z-20 flex shrink-0 grow-0 justify-around gap-4 border-t border-gray-200 bg-white/50 p-2.5 shadow-lg backdrop-blur-lg fixed top-2/4 -translate-y-2/4 left-6 min-h-[auto] min-w-[64px] flex-col rounded-lg border"
        >
          <BtnsGroup
            addNode={addNode}
            delNode={delNode}
            selectedNodes={selectedNodes}
            rootNode={rootNode}
            setRootNode={setRootNode}
          />
        </div>
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
          <MindMap
            selectBox={selectBox}
            canvasRef={canvasRef}
            addNode={addNode}
            delNode={delNode}
            setNodes={setNodes}
            nodes={nodes}
            nodeRefs={nodeRefs}
            rootNode={rootNode}
            setRootNode={setRootNode}
            selectedNodes={selectedNodes}
            setSelectedNodes={setSelectedNodes}
          />
        </div>
      </div>
    </>
  );
};

export default WorkArea;
