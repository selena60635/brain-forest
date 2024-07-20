import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@headlessui/react";
import MindMap from "../MindMap";
import BtnsGroupCol from "../components/BtnsGroupCol";
import BtnsGroupRow from "../components/BtnsGroupRow";
import Shortcuts from "../components/Shortcuts";
import ToolBox from "../components/ToolBox";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";
import { doc, getDoc, setDoc, collection, Timestamp } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const WorkArea = () => {
  const { id } = useParams();
  const [selectBox, setSelectBox] = useState(null); //存儲選擇框位置
  const selectStart = useRef({ x: 0, y: 0 }); //用來引用並存儲鼠標起始位置，始終不變
  const canvasRef = useRef(null); //用來引用並存儲畫布Dom

  const [currentColorStyle, setCurrentColorStyle] = useState(2);
  const [colorIndex, setColorIndex] = useState(0);
  const [nodesColor, setNodesColor] = useState("#17493b");
  const colorStyles = useMemo(
    () => [
      // {
      //   root: "#05120e",
      //   text: "#FFFFFF",
      //   nodes: ["#17493b"],
      //   child: ["#2e9277"],
      // },
      {
        root: nodesColor,
        text: "#FFFFFF",
        nodes: [nodesColor],
        child: [nodesColor],
      },
      {
        root: "#000229",
        text: "#FFFFFF",
        nodes: [
          "#F9423A",
          "#F6A04D",
          "#F3D321",
          "#00BC7B",
          "#486AFF",
          "#4D49BE",
        ],
        child: [
          "#FED9D8",
          "#fdecdb",
          "#FAEB9E",
          "#CCF2E5",
          "#DAE1FF",
          "#DBDBF2",
        ],
      },
      {
        root: "#000229",
        text: "#FFFFFF",
        nodes: [
          "#FA8155",
          "#FFAD36",
          "#B7C82B",
          "#0098B9",
          "#7574BC",
          "#A165A8",
        ],
        child: [
          "#FED9D8",
          "#fdecdb",
          "#FDF6D3",
          "#CCF2E5",
          "#DAE1FF",
          "#DBDBF2",
        ],
      },
      {
        root: "#92C1B7",
        text: "#000000",
        nodes: [
          "#9DCFCE",
          "#F1CD91",
          "#EC936B",
          "#DDB3A4",
          "#C6CA97",
          "#F1C2CA",
        ],
        child: [
          "#FED9D8",
          "#fdecdb",
          "#FDF6D3",
          "#CCF2E5",
          "#DAE1FF",
          "#DBDBF2",
        ],
      },
    ],
    [nodesColor]
  );
  const rootColor = colorStyles[currentColorStyle].root;
  const textColor = colorStyles[currentColorStyle].text;

  //定義根節點狀態
  const [rootNode, setRootNode] = useState({
    id: uuidv4(),
    name: "根節點",
    bkColor: rootColor,
    pathColor: rootColor,
    outline: { color: rootColor, width: "2px", style: "none" },
    font: {
      family: "Noto Sans TC",
      size: "24px",
      weight: "400",
      color: textColor,
      // isBold: false,
      // isItalic: false,
      // isStrikethrough: false
    },
    path: {
      width: "3",
      style: "0",
    },
  });
  const [nodes, setNodes] = useState([]); //定義節點們的狀態，用来存儲所有節點，初始為空陣列
  const [selectedNodes, setSelectedNodes] = useState([]); //定義選中節點們的狀態，初始為空陣列，用來存儲所有被選中的節點id
  const nodeRefs = useRef([]); //宣告一個引用，初始為空陣列，用來存儲每個引用的節點Dom元素
  const btnsRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的按鈕群組
  const [isToolBoxOpen, setIsToolBoxOpen] = useState(false);

  const saveMindMap = async () => {
    try {
      const mindMapData = {
        colorStyle: currentColorStyle,
        rootNode,
        nodes,
        lastSavedAt: Timestamp.now(),
      };
      const userId = auth.currentUser.uid;
      const docRef = id
        ? doc(db, "users", userId, "mindMaps", id)
        : doc(collection(db, "users", userId, "mindMaps"));
      await setDoc(docRef, mindMapData);
      alert("儲存成功！");
    } catch (error) {
      console.error("儲存時發生錯誤: ", error);
      alert("儲存時發生錯誤");
    }
  };

  const resetMindMap = useCallback(() => {
    const defaultRootColor = "#000229";
    const defaultTextColor = "#FFFFFF";

    setCurrentColorStyle(2);
    setColorIndex(0);
    setNodesColor("#17493b");

    setRootNode({
      id: uuidv4(),
      name: "根節點",
      bkColor: defaultRootColor,
      pathColor: defaultRootColor,
      outline: { color: defaultRootColor, width: "2px", style: "none" },
      font: {
        family: "Noto Sans TC",
        size: "24px",
        weight: "400",
        color: defaultTextColor,
      },
      path: {
        width: "3",
        style: "0",
      },
    });
    setNodes([]);
    setSelectedNodes([]);
    nodeRefs.current = [];
  }, []);

  const fetchMindMap = useCallback(async (mindMapId) => {
    try {
      const userId = auth.currentUser.uid;
      const docRef = doc(db, "users", userId, "mindMaps", mindMapId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const mindMapData = docSnap.data();
        setRootNode(mindMapData.rootNode);
        setNodes(mindMapData.nodes);
        setCurrentColorStyle(mindMapData.colorStyle);
        nodeRefs.current = new Array(mindMapData.nodes.length)
          .fill(null)
          .map(() => React.createRef());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching mind map: ", error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchMindMap(id);
    } else {
      resetMindMap();
    }
  }, [id, fetchMindMap, resetMindMap]);

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
  //繪製生成選取框
  const handleMouseDown = (e) => {
    if (e.button !== 0 || btnsRef.current.contains(e.target)) return; //若滑鼠點擊的不是左鍵或點擊目標屬於按鈕群組後代，不執行後續動作

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

  //查找當前選取節點的父節點
  const findParentNode = useCallback(
    (nodes) => {
      let parentNode = null;
      //遞迴查找父節點
      const find = (nodes) => {
        for (let node of nodes) {
          if (node.children && node.children.length > 0) {
            //若當前節點有children且不為空，檢查子節點中是否有匹配選中的節點ID
            if (node.children.some((child) => child.id === selectedNodes[0])) {
              //若有匹配到，代表當前選中節點是在這一層，設定其父節點
              parentNode = node;
              return;
            }
            //若沒匹配到，接續遞迴處理下一層
            find(node.children);
          }
        }
      };

      find(nodes); //遞迴一層層遍歷nodes
      return parentNode;
    },
    [selectedNodes]
  );
  //取得目前選取的節點
  // const findNode = (nodes, id) => {
  //   for (let node of nodes) {
  //     if (node.id === id) {
  //       return node;
  //     }
  //     if (node.children && node.children.length > 0) {
  //       const foundNode = findNode(node.children, id);
  //       if (foundNode) {
  //         return foundNode;
  //       }
  //     }
  //   }
  //   return null;
  // };
  const findNode = useCallback((nodes, id) => {
    const stack = [...nodes];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node.id === id) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        stack.push(...node.children);
      }
    }
    return null;
  }, []);
  //取得當前顏色風格相應的顏色
  const colors = colorStyles[currentColorStyle].nodes;
  const color = colors[colorIndex % colors.length];

  const newNode = useMemo(
    () => ({
      id: uuidv4(),
      name: "節點",
      isNew: true, //標記為新創建的節點
      children: [],
      bkColor: color,
      pathColor: color,
      outline: { color: color, width: "2px", style: "none" },
      font: {
        family: "Noto Sans TC",
        size: "20px",
        weight: "400",
        color: textColor,
        // isItalic: false,
      },
      path: {
        width: rootNode.path.width,
        style: rootNode.path.style,
      },
    }),
    [color, textColor, rootNode.path.style, rootNode.path.width]
  );

  const newChildNode = useMemo(
    () => ({
      id: uuidv4(),
      name: "子節點",
      isNew: true,
      children: [],
      outline: { width: "2px", style: "none" },
      font: {
        family: "Noto Sans TC",
        size: "16px",
        weight: "400",
        // isItalic: false,
      },
      path: {
        width: rootNode.path.width,
        style: rootNode.path.style,
      },
    }),
    [rootNode.path.style, rootNode.path.width]
  );

  // 新增節點
  const addNode = () => {
    setColorIndex((prev) => prev + 1);
    const newNodeInstance = {
      ...newNode,
      id: uuidv4(), // 確保每個節點都有唯一的ID
    };
    //更新節點陣列狀態，加入新的節點
    setNodes((prev) => {
      const newNodes = [...prev, newNodeInstance]; //創建一個新的數組，將新節點添加到數組末尾
      nodeRefs.current.push(React.createRef()); //為每個新節點添加一個引用
      setSelectedNodes([newNodeInstance.id]); //將原先選擇的節點更新為新節點，轉換焦點
      return newNodes;
    });
  };
  //新增相鄰節點
  const addSiblingNode = useCallback(() => {
    setColorIndex((prev) => prev + 1);
    const newNodeInstance = {
      ...newNode,
      id: uuidv4(), // 確保每個節點都有唯一的ID
    };
    //查找當前選中節點在nodes中的索引
    const selectedNodeIndex = nodes.findIndex(
      (node) => node.id === selectedNodes[0]
    );
    //更新nodes狀態，將新的相鄰節點插入到相應位置
    setNodes((prevNodes) => {
      const newNodes = [
        ...prevNodes.slice(0, selectedNodeIndex + 1),
        newNodeInstance,
        ...prevNodes.slice(selectedNodeIndex + 1),
      ];
      return newNodes;
    });
    setSelectedNodes([newNodeInstance.id]); //更新選擇名單為新的相鄰節點
    nodeRefs.current.splice(selectedNodeIndex + 1, 0, React.createRef()); //在引用中相應位置插入新的相鄰節點引用
  }, [nodes, newNode, selectedNodes, setNodes, setSelectedNodes, nodeRefs]);

  //新增子節點
  const addChildNode = useCallback(
    (parentId) => {
      const parentNode = findNode(nodes, parentId);
      let parentColorIndex = colorStyles[currentColorStyle].nodes.indexOf(
        parentNode.bkColor
      );
      if (parentColorIndex === -1) {
        parentColorIndex = colorStyles[currentColorStyle].child.indexOf(
          parentNode.bkColor
        );
      }
      const childColor = colorStyles[currentColorStyle].child[parentColorIndex];
      const newChildInstance = {
        ...newChildNode,
        // parentId: parentId,
        id: uuidv4(),
        bkColor: childColor,
        pathColor: childColor,
        outline: { ...newChildNode.outline, color: childColor },
        font: { ...newChildNode.font, color: textColor },
      };

      //遞迴一層層遍歷nodes找到相應的父節點，並新增子節點
      const addChildToParent = (nodes) =>
        nodes.map((node) => {
          if (node.id === parentId) {
            //若當前節點是父節點，將新的子節點加入到當前節點的children中
            return {
              ...node,
              children: [...(node.children || []), newChildInstance],
            };
          } else if (node.children && node.children.length > 0) {
            //若當前節點有子節點
            return {
              ...node,
              children: addChildToParent(node.children), //遞迴處理其children，繼續查找下一層子節點是否包含父節點
            };
          }
          return node;
        });
      //更新nodes狀態為遞迴處理過的新nodes
      setNodes((prev) => addChildToParent(prev));
      //更新選擇名單為新子節點
      setSelectedNodes([newChildInstance.id]);
    },
    [
      setNodes,
      setSelectedNodes,
      nodes,
      textColor,
      colorStyles,
      currentColorStyle,
      findNode,
      newChildNode,
    ]
  );

  //新增相鄰子節點
  const addSiblingChildNode = useCallback(
    (parentNode) => {
      let parentColorIndex = colorStyles[currentColorStyle].nodes.indexOf(
        parentNode.bkColor
      );
      if (parentColorIndex === -1) {
        parentColorIndex = colorStyles[currentColorStyle].child.indexOf(
          parentNode.bkColor
        );
      }
      const childColor = colorStyles[currentColorStyle].child[parentColorIndex];

      //查找當前選中節點在父節點的children中的索引
      const selectedNodeIndex = parentNode.children.findIndex(
        (child) => child.id === selectedNodes[0]
      );
      const newChildInstance = {
        ...newChildNode,
        // parentId: parentNode.id,
        id: uuidv4(),
        bkColor: childColor,
        pathColor: childColor,
        outline: { ...newChildNode.outline, color: childColor },
        font: { ...newChildNode.font, color: textColor },
      };
      //遞迴查找相應的父節點，並在父節點children中新增相鄰子節點
      const addSibling = (nodes) => {
        return nodes.map((node) => {
          if (node.id === parentNode.id) {
            //若當前節點的ID與父節點ID匹配，在相應位置新增相鄰子節點
            return {
              ...node,
              children: [
                ...node.children.slice(0, selectedNodeIndex + 1),
                newChildInstance,
                ...node.children.slice(selectedNodeIndex + 1),
              ],
            };
          } else if (node.children && node.children.length > 0) {
            //若當前節點有children，則繼續遞迴處理其children
            return {
              ...node,
              children: addSibling(node.children),
            };
          }
          return node; //若當前節點既不是父節點，也沒有子節點，則不做任何改變
        });
      };

      setNodes((prev) => addSibling(prev)); //更新節點狀態為遞迴處理過的新nodes
      setSelectedNodes([newChildInstance.id]); //更新選擇名單為新相鄰子節點
      //確保在引用中有當前父節點，若沒有則新增
      if (!nodeRefs.current[parentNode.id]) {
        nodeRefs.current[parentNode.id] = [];
      }
      // 在引用中相應位置插入新的相鄰子節點引用
      nodeRefs.current[parentNode.id].splice(
        selectedNodeIndex + 1,
        0,
        React.createRef()
      );
    },
    [
      selectedNodes,
      setNodes,
      setSelectedNodes,
      nodeRefs,
      textColor,
      colorStyles,
      currentColorStyle,
      newChildNode,
    ]
  );

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
    <div className="flex ">
      <div
        className={`canvas-wrap transition-all duration-300 ${
          isToolBoxOpen ? "w-6/12 sm:w-10/12" : "w-screen"
        }`}
        onMouseDown={handleMouseDown}
        ref={canvasRef}
      >
        <div ref={btnsRef}>
          <div className="top-20 left-5 fixed z-20">
            <BtnsGroupCol
              selectedNodes={selectedNodes}
              rootNode={rootNode}
              nodes={nodes}
              setRootNode={setRootNode}
              addNode={addNode}
              delNode={delNode}
              addChildNode={addChildNode}
              findParentNode={findParentNode}
              addSiblingNode={addSiblingNode}
              addSiblingChildNode={addSiblingChildNode}
              saveMindMap={saveMindMap}
            />
          </div>

          <div className="btns-group bottom-10 left-5 fixed z-20 h-12">
            <Shortcuts />
          </div>
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
            setNodes={setNodes}
            nodes={nodes}
            nodeRefs={nodeRefs}
            rootNode={rootNode}
            setRootNode={setRootNode}
            selectedNodes={selectedNodes}
            setSelectedNodes={setSelectedNodes}
            addNode={addNode}
            delNode={delNode}
            addChildNode={addChildNode}
            findParentNode={findParentNode}
            addSiblingNode={addSiblingNode}
            addSiblingChildNode={addSiblingChildNode}
          />
        </div>
      </div>
      <div
        className={`absolute right-0 h-screen w-6/12 sm:w-2/12 transition-transform duration-300 ${
          isToolBoxOpen ? "translate-x-0" : "translate-x-full "
        }`}
      >
        <ToolBox
          rootNode={rootNode}
          setRootNode={setRootNode}
          nodes={nodes}
          setNodes={setNodes}
          selectedNodes={selectedNodes}
          currentColorStyle={currentColorStyle}
          setCurrentColorStyle={setCurrentColorStyle}
          colorStyles={colorStyles}
          findNode={findNode}
          colorIndex={colorIndex}
          setColorIndex={setColorIndex}
          nodesColor={nodesColor}
          setNodesColor={setNodesColor}
        />
        <div className="btns-group top-4 -left-[84px] absolute z-20 h-12">
          <Button
            className="btn aspect-square"
            onClick={() => setIsToolBoxOpen(!isToolBoxOpen)}
          >
            <span
              className={`material-symbols-rounded ${
                isToolBoxOpen ? "text-primary" : ""
              }`}
            >
              service_toolbox
            </span>
          </Button>
        </div>
        <div className="bottom-28 -left-[260px] absolute z-20">
          <BtnsGroupRow
            selectedNodes={selectedNodes}
            rootNode={rootNode}
            nodes={nodes}
            setRootNode={setRootNode}
            addNode={addNode}
            delNode={delNode}
            addChildNode={addChildNode}
            findParentNode={findParentNode}
            addSiblingNode={addSiblingNode}
            addSiblingChildNode={addSiblingChildNode}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkArea;
