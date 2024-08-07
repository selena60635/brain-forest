import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { Button } from "@headlessui/react";
import MindMap from "../MindMap";
import BtnsGroupCol from "../components/BtnsGroupCol";
import BtnsGroupRow from "../components/BtnsGroupRow";
import Shortcuts from "../components/Shortcuts";
import ToolBox from "../components/ToolBox";
import { v4 as uuidv4 } from "uuid";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { Context } from "../context/AuthContext";
import Loading from "./loading";
import SweetAlert from "../components/SweetAlert";
import { PiToolbox } from "react-icons/pi";

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WorkArea = () => {
  const { id } = useParams(); //取得當前頁面id
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); //是否開啟loading page
  const [isSaved, setIsSaved] = useState(true); //紀錄檔案是否還未儲存
  const [selectBox, setSelectBox] = useState(null); //存儲選擇框位置
  const selectStart = useRef({ x: 0, y: 0 }); //用來引用並存儲鼠標起始位置，始終不變
  const canvasRef = useRef(null); //用來引用並存儲畫布Dom

  const [currentColorStyle, setCurrentColorStyle] = useState(2); //目前顏色風格索引
  const [colorIndex, setColorIndex] = useState(0); //目前節點顏色索引
  const [nodesColor, setNodesColor] = useState("#17493b"); //純色模式目前顏色
  //所有顏色風格
  const colorStyles = useMemo(
    () => [
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
          "#F9423A",
          "#F6A04D",
          "#F3D321",
          "#00BC7B",
          "#486AFF",
          "#4D49BE",
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
          "#FA8155",
          "#FFAD36",
          "#B7C82B",
          "#0098B9",
          "#7574BC",
          "#A165A8",
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
          "#9DCFCE",
          "#F1CD91",
          "#EC936B",
          "#DDB3A4",
          "#C6CA97",
          "#F1C2CA",
        ],
      },
    ],
    [nodesColor]
  );
  const rootColor = colorStyles[currentColorStyle].root; //取得當前顏色風格的根節點顏色
  const textColor = colorStyles[currentColorStyle].text; //取得當前顏色風格的文字顏色
  //取得當前顏色風格相應的節點顏色，並按照順序提取使用
  const colors = colorStyles[currentColorStyle].nodes;
  const color = colors[colorIndex % colors.length];

  //定義根節點狀態
  const [rootNode, setRootNode] = useState({
    id: uuidv4(),
    name: "根節點",
    bkColor: rootColor,
    pathColor: rootColor,
    outline: { color: rootColor, width: "3px", style: "none" },
    font: {
      family: "Noto Sans TC",
      size: "24px",
      weight: "400",
      color: textColor,
    },
    path: {
      width: "3",
      style: "0",
    },
  });
  const [nodes, setNodes] = useState([]); //定義節點們的狀態，用来存儲所有節點，初始為空陣列

  const newNode = useMemo(
    () => ({
      id: uuidv4(),
      name: "節點",
      isNew: true, //標記為新創建的節點
      children: [],
      bkColor: color,
      pathColor: color,
      outline: { color: color, width: "3px", style: "none" },
      font: {
        family: "Noto Sans TC",
        size: "20px",
        weight: "400",
        color: textColor,
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
      outline: { width: "3px", style: "none" },
      font: {
        family: "Noto Sans TC",
        size: "16px",
        weight: "400",
      },
      path: {
        width: rootNode.path.width,
        style: rootNode.path.style,
      },
    }),
    [rootNode.path.style, rootNode.path.width]
  );
  const [selectedNodes, setSelectedNodes] = useState([]); //定義選中節點們的狀態，初始為空陣列，用來存儲所有被選中的節點id
  const nodeRefs = useRef([]); //宣告一個引用，初始為空陣列，用來存儲每個引用的節點Dom元素
  const btnsRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的按鈕群組
  const [isToolBoxOpen, setIsToolBoxOpen] = useState(false);

  //儲存心智圖組件並重導向
  const saveMindMap = async (id = null) => {
    console.log("saveMindMap");
    try {
      const mindMapData = {
        colorStyle: currentColorStyle,
        rootNode,
        nodes,
        lastSavedAt: Timestamp.now(),
      };
      const userId = auth.currentUser.uid;
      let docRef;
      if (id) {
        docRef = doc(db, "users", userId, "mindMaps", id);
        await setDoc(docRef, mindMapData);
        SweetAlert({
          type: "toast",
          title: "Save successfully!",
          icon: "success",
        });
      } else {
        docRef = await addDoc(
          collection(db, "users", userId, "mindMaps"),
          mindMapData
        );
        SweetAlert({
          type: "toast",
          title: "Save new file successfully!",
          icon: "success",
        });
        navigate(`/workArea/${docRef.id}`);
      }
    } catch (err) {
      SweetAlert({
        type: "toast",
        title: `Save ${id ? "" : "new"} file failed!`,
        icon: "error",
      });
    }
  };
  const handleSaveMindMap = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      //若是訪客，將試用的檔案暫存到localStorage
      const state = {
        colorStyle: currentColorStyle,
        rootNode,
        nodes,
        lastSavedAt: Timestamp.now(),
      };
      localStorage.setItem("mindMapTest", JSON.stringify(state));

      const needLoginAlert = await SweetAlert({
        type: "alert",
        title: "Please sign in.",
        icon: "warning",
        text: "You need to sign in to save files. Would you like to go to the login page now?",
        confirmButtonText: "Yes",
        showCancelButton: true,
        cancelButtonText: "No",
      });

      if (needLoginAlert.isConfirmed) {
        navigate(`/login`);
      }
    } else {
      console.log("id:" + id);
      await saveMindMap(id);
      setIsSaved(true);
    }
  };
  //重置心智圖組件為初始狀態
  const resetMindMap = useCallback(async () => {
    setCurrentColorStyle(2);
    setColorIndex(0);
    setNodesColor("#17493b");
    setRootNode({
      id: uuidv4(),
      name: "根節點",
      bkColor: "#000229",
      pathColor: "#000229",
      outline: { color: "#000229", width: "3px", style: "none" },
      font: {
        family: "Noto Sans TC",
        size: "24px",
        weight: "400",
        color: "#FFFFFF",
      },
      path: {
        width: "3",
        style: "0",
      },
    });
    setNodes([]);
    setSelectedNodes([]);
    nodeRefs.current = [];
    await delay(1000); // loading頁面至少顯示1秒
    setLoading(false);
    setIsSaved(true);
  }, [
    setCurrentColorStyle,
    setNodesColor,
    setRootNode,
    setNodes,
    setColorIndex,
    nodeRefs,
    setSelectedNodes,
  ]);

  //獲取並設定心智圖組件狀態
  const fetchMindMap = useCallback(
    async (mindMapId) => {
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
        }
      } catch (err) {
        SweetAlert({
          type: "toast",
          title: "Failed to load file!",
          icon: "error",
        });
      } finally {
        await delay(1000); // loading頁面至少顯示1秒
        setLoading(false);
        setIsSaved(true);
      }
    },
    [setCurrentColorStyle, setRootNode, setNodes]
  );

  //繪製生成選取框
  const handleMouseDown = (e) => {
    if (e.button !== 0 || btnsRef.current.contains(e.target)) return;

    const rect = canvasRef.current.getBoundingClientRect();
    selectStart.current = {
      x: e.clientX + canvasRef.current.scrollLeft - rect.left,
      y: e.clientY + canvasRef.current.scrollTop - rect.top,
    };
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
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + canvasRef.current.scrollLeft;
    const y = e.clientY - rect.top + canvasRef.current.scrollTop;

    const scrollMargin = 10;
    const scrollSpeed = 10;

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

    setSelectBox({
      left: Math.min(x, selectStart.current.x),
      top: Math.min(y, selectStart.current.y),
      width: Math.abs(x - selectStart.current.x),
      height: Math.abs(y - selectStart.current.y),
    });
  };

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    setSelectBox(null);
  };

  const findParentNode = useCallback(
    (nodes) => {
      let parentNode = null;
      const find = (nodes) => {
        for (let node of nodes) {
          if (node.children && node.children.length > 0) {
            if (node.children.some((child) => child.id === selectedNodes[0])) {
              parentNode = node;
              return;
            }
            find(node.children);
          }
        }
      };

      find(nodes);
      return parentNode;
    },
    [selectedNodes]
  );

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

  const addNode = () => {
    setColorIndex((prev) => prev + 1);
    const newNodeInstance = {
      ...newNode,
      id: uuidv4(),
    };
    setNodes((prev) => {
      const newNodes = [...prev, newNodeInstance];
      nodeRefs.current.push(React.createRef());
      setSelectedNodes([newNodeInstance.id]);
      return newNodes;
    });
  };

  const addSiblingNode = useCallback(() => {
    setColorIndex((prev) => prev + 1);
    const newNodeInstance = {
      ...newNode,
      id: uuidv4(),
    };
    const selectedNodeIndex = nodes.findIndex(
      (node) => node.id === selectedNodes[0]
    );
    setNodes((prevNodes) => {
      const newNodes = [
        ...prevNodes.slice(0, selectedNodeIndex + 1),
        newNodeInstance,
        ...prevNodes.slice(selectedNodeIndex + 1),
      ];
      return newNodes;
    });
    setSelectedNodes([newNodeInstance.id]);
    nodeRefs.current.splice(selectedNodeIndex + 1, 0, React.createRef());
  }, [nodes, newNode, selectedNodes, setNodes, setSelectedNodes, nodeRefs]);

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
        id: uuidv4(),
        bkColor: childColor,
        pathColor: childColor,
        outline: { ...newChildNode.outline, color: childColor },
        font: { ...newChildNode.font, color: textColor },
      };

      const addChildToParent = (nodes) =>
        nodes.map((node) => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [...(node.children || []), newChildInstance],
            };
          } else if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: addChildToParent(node.children),
            };
          }
          return node;
        });
      setNodes((prev) => addChildToParent(prev));
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

      const selectedNodeIndex = parentNode.children.findIndex(
        (child) => child.id === selectedNodes[0]
      );
      const newChildInstance = {
        ...newChildNode,
        id: uuidv4(),
        bkColor: childColor,
        pathColor: childColor,
        outline: { ...newChildNode.outline, color: childColor },
        font: { ...newChildNode.font, color: textColor },
      };
      const addSibling = (nodes) => {
        return nodes.map((node) => {
          if (node.id === parentNode.id) {
            return {
              ...node,
              children: [
                ...node.children.slice(0, selectedNodeIndex + 1),
                newChildInstance,
                ...node.children.slice(selectedNodeIndex + 1),
              ],
            };
          } else if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: addSibling(node.children),
            };
          }
          return node;
        });
      };

      setNodes((prev) => addSibling(prev));
      setSelectedNodes([newChildInstance.id]);
      if (!nodeRefs.current[parentNode.id]) {
        nodeRefs.current[parentNode.id] = [];
      }
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

  const delNode = useCallback(
    (idArr) => {
      const deleteNodes = (nodes, idsToDelete) => {
        return nodes.filter((node) => {
          if (idsToDelete.includes(node.id)) {
            return false;
          }
          if (node.children) {
            node.children = deleteNodes(node.children, idsToDelete);
          }
          return true;
        });
      };
      setNodes((prev) => {
        const newNodes = deleteNodes(prev, idArr);
        nodeRefs.current = nodeRefs.current.filter(
          (item, index) => !idArr.includes(prev[index]?.id)
        );
        return newNodes;
      });

      setSelectedNodes([]);
    },
    [nodeRefs, setNodes, setSelectedNodes]
  );

  //若id改變，重新載入相應的心智圖檔案
  useEffect(() => {
    setLoading(true);
    if (id) {
      fetchMindMap(id);
    } else {
      resetMindMap();
    }
  }, [id, fetchMindMap, resetMindMap]);

  //更新isSaved狀態
  const nodesString = JSON.stringify(nodes);
  const rootNodeString = JSON.stringify(rootNode);
  useEffect(() => {
    setIsSaved(false);
  }, [nodesString, rootNodeString]);

  // 初始滾動至畫布的中心點
  useEffect(() => {
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

  return (
    <>
      {loading && <Loading />}
      <div className="flex w-full">
        <div
          className={`canvas-wrap transition-all duration-300 ${
            isToolBoxOpen ? "w-6/12 sm:w-10/12" : "w-screen"
          }`}
          onMouseDown={handleMouseDown}
          ref={canvasRef}
        >
          <div ref={btnsRef}>
            <div className="top-[90px] left-5 fixed z-20">
              <BtnsGroupCol
                selectedNodes={selectedNodes}
                rootNode={rootNode}
                nodes={nodes}
                addNode={addNode}
                delNode={delNode}
                addChildNode={addChildNode}
                findParentNode={findParentNode}
                addSiblingNode={addSiblingNode}
                addSiblingChildNode={addSiblingChildNode}
                isSaved={isSaved}
                handleSaveMindMap={handleSaveMindMap}
              />
            </div>

            <div className="btns-group bottom-10 left-5 fixed z-20 h-12">
              <Shortcuts />
            </div>
            <div
              className={`bottom-10 fixed z-20 transition-all duration-300 ${
                isToolBoxOpen ? "right-[356px]" : "right-10"
              }`}
            >
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
              handleSaveMindMap={handleSaveMindMap}
            />
          </div>
        </div>
        <div
          className={`absolute right-0 w-6/12 sm:w-2/12 transition-transform duration-300 ${
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
            newChildNode={newChildNode}
            setSelectedNodes={setSelectedNodes}
            setLoading={setLoading}
            nodeRefs={nodeRefs}
          />
          <div className="btns-group top-4 -left-[84px] absolute z-20 h-12">
            <Button
              className="btn aspect-square"
              onClick={() => setIsToolBoxOpen(!isToolBoxOpen)}
            >
              <PiToolbox
                size={24}
                strokeWidth="3"
                className={`${isToolBoxOpen ? "text-primary" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkArea;
