import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  useLayoutEffect,
} from "react";
import { Button } from "@headlessui/react";
import MindMap from "../components/MindMap";
import BtnsGroupCol from "../components/BtnsGroupCol";
import BtnsGroupRow from "../components/BtnsGroupRow";
import Shortcuts from "../components/Shortcuts";
import ToolBox from "../components/tools/ToolBox";
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
import Loading from "./Loading";
import SweetAlert from "../components/SweetAlert";
import { PiToolbox } from "react-icons/pi";

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const WorkArea = () => {
  const { id } = useParams(); //取得當前頁面id
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); //是否開啟loading page
  const [isSaved, setIsSaved] = useState(true); //紀錄檔案是否還未儲存
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectBox, setSelectBox] = useState(null); //存儲選擇框位置
  const selectStart = useRef({ x: 0, y: 0 }); //用來引用並存儲鼠標起始位置，始終不變
  const canvasRef = useRef(null); //用來引用並存儲畫布Dom
  const pageRef = useRef(null);

  const [currentTheme, setCurrentTheme] = useState(0); // 當前主題索引
  const [currentColorStyle, setCurrentColorStyle] = useState(1); //目前顏色風格索引
  const [colorIndex, setColorIndex] = useState(0); //目前節點顏色索引
  const [nodesColor, setNodesColor] = useState("#17493b"); //純色模式目前顏色
  const [canvasBgColor, setCanvasBgColor] = useState("#fff");
  const [canvasBgStyle, setCanvasBgStyle] = useState("none");
  const [pathWidth, setPathWidth] = useState("3");
  const [pathStyle, setPathStyle] = useState("solid");
  const [fontFamily, setFontFamily] = useState("Noto Sans TC");

  const themes = useMemo(
    () => [
      {
        name: "繽紛彩虹",
        colorStyles: [
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
      },
      {
        name: "紅粉佳人",
        colorStyles: [
          {
            root: "#3A0715",
            text: "#fff",
            nodes: [
              "#E81C56",
              "#CB184B",
              "#A3143C",
              "#911136",
              "#990000",
              "#C21E56",
            ],
            child: [
              "#E81C56",
              "#CB184B",
              "#A3143C",
              "#911136",
              "#990000",
              "#C21E56",
            ],
          },
          {
            root: "#C05D64",
            text: "#fff",
            nodes: [
              "#D17075",
              "#C98087",
              "#C58B8F",
              "#D7847F",
              "#C99499",
              "#E1A1A1",
            ],
            child: [
              "#D17075",
              "#C98087",
              "#C58B8F",
              "#D7847F",
              "#C99499",
              "#E1A1A1",
            ],
          },
          {
            root: "#C8657A",
            text: "#fff",
            nodes: [
              "#B0737F",
              "#CE8091",
              "#A45F63",
              "#D2848C",
              "#AD6B71",
              "#996566",
            ],
            child: [
              "#B0737F",
              "#CE8091",
              "#A45F63",
              "#D2848C",
              "#AD6B71",
              "#996566",
            ],
          },
        ],
      },
      {
        name: "復古狂潮",
        colorStyles: [
          {
            root: "#0C1440",
            text: "#fff",
            nodes: [
              "#D90467",
              "#027373",
              "#03A678",
              "#F26A1B",
              "#B81B83",
              "#22B859",
            ],
            child: [
              "#D90467",
              "#027373",
              "#03A678",
              "#F26A1B",
              "#B81B83",
              "#22B859",
            ],
          },
          {
            root: "#260101",
            text: "#fff",
            nodes: [
              "#A68A56",
              "#8AB5BF",
              "#384759",
              "#F26D85",
              "#A04A2D",
              "#916A46",
            ],
            child: [
              "#A68A56",
              "#8AB5BF",
              "#384759",
              "#F26D85",
              "#A04A2D",
              "#916A46",
            ],
          },
          {
            root: "#BAB86C",
            text: "#000000",
            nodes: [
              "#98CBCB",
              "#EDB458",
              "#D2B48C",
              "#B0C4DE",
              "#A9A9A9",
              "#C0C0C0",
            ],
            child: [
              "#98CBCB",
              "#EDB458",
              "#D2B48C",
              "#B0C4DE",
              "#A9A9A9",
              "#C0C0C0",
            ],
          },
        ],
      },
    ],
    []
  );
  //所有顏色風格
  const colorStyles = useMemo(
    () => [
      {
        root: nodesColor,
        text: "#FFFFFF",
        nodes: [nodesColor],
        child: [nodesColor],
      },
      ...themes[currentTheme].colorStyles,
    ],
    [nodesColor, themes, currentTheme]
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
      family: fontFamily,
      size: "24px",
      weight: "400",
      color: textColor,
    },
    path: {
      width: pathStyle === "none" ? "0" : pathWidth,
      style: pathStyle === "dashed" ? "8" : "0",
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
        family: fontFamily,
        size: "20px",
        weight: "400",
        color: textColor,
      },
      path: {
        width: pathStyle === "none" ? "0" : pathWidth,
        style: pathStyle === "dashed" ? "8" : "0",
      },
    }),
    [color, textColor, pathWidth, pathStyle, fontFamily]
  );

  const newChildNode = useMemo(
    () => ({
      id: uuidv4(),
      name: "子節點",
      isNew: true,
      children: [],
      outline: { width: "3px", style: "none" },
      font: {
        family: fontFamily,
        size: "16px",
        weight: "400",
      },
      path: {
        width: pathStyle === "none" ? "0" : pathWidth,
        style: pathStyle === "dashed" ? "8" : "0",
      },
    }),
    [pathWidth, pathStyle, fontFamily]
  );
  const [selectedNodes, setSelectedNodes] = useState([]); //定義選中節點們的狀態，初始為空陣列，用來存儲所有被選中的節點id
  const rootRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的根節點Dom元素
  const nodeRefs = useRef([]); //宣告一個引用，初始為空陣列，用來存儲每個引用的節點Dom元素
  const btnsRef = useRef(null); //宣告一個引用，初始為null，用來存儲引用的按鈕群組
  const [isToolBoxOpen, setIsToolBoxOpen] = useState(false);

  //取得節點canvas位置
  const getNodeCanvasLoc = useCallback(
    (nodeRef) => {
      if (nodeRef && nodeRef.current && canvasRef.current) {
        const nodeRect = nodeRef.current.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        return {
          left: nodeRect.left - canvasRect.left + canvasRef.current.scrollLeft,
          top: nodeRect.top - canvasRect.top + canvasRef.current.scrollTop,
          right:
            nodeRect.right - canvasRect.left + canvasRef.current.scrollLeft,
          bottom:
            nodeRect.bottom - canvasRect.top + canvasRef.current.scrollTop,
        };
      }
      return { left: 0, top: 0, right: 0, bottom: 0 };
    },
    [canvasRef]
  );

  //儲存心智圖組件並重導向
  const saveMindMap = async (id = null) => {
    try {
      const mindMapData = {
        currentTheme,
        currentColorStyle,
        canvasBg: { canvasBgStyle, canvasBgColor },
        path: { pathWidth, pathStyle },
        fontFamily,
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
  const handleSaveMindMap = async () => {
    if (!user) {
      //若是訪客，將試用的檔案暫存到localStorage
      const state = {
        currentTheme,
        currentColorStyle,
        canvasBg: { canvasBgStyle, canvasBgColor },
        path: { pathWidth, pathStyle },
        fontFamily,
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
      await saveMindMap(id);
      setIsSaved(true);
    }
  };

  //重置心智圖組件為初始狀態
  const resetMindMap = useCallback(async () => {
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
    nodeRefs.current = [];
    await delay(1000); // loading頁面至少顯示1秒
    setLoading(false);
    setIsSaved(true);
  }, [setRootNode, setNodes, nodeRefs]);

  //獲取檔案並設定心智圖組件狀態
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
          setCurrentColorStyle((prev) => mindMapData.currentColorStyle || prev);
          setCurrentTheme((prev) => mindMapData.currentTheme || prev);
          setCanvasBgColor(
            (prev) => mindMapData.canvasBg?.canvasBgColor || prev
          );
          setCanvasBgStyle(
            (prev) => mindMapData.canvasBg?.canvasBgStyle || prev
          );
          setPathWidth((prev) => mindMapData.path?.pathWidth || prev);
          setPathStyle((prev) => mindMapData.path?.pathStyle || prev);
          setFontFamily((prev) => mindMapData.fontFamily || prev);

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
        console.log(err);
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
  }, [nodesString, rootNodeString, canvasBgStyle, canvasBgColor]);

  //滾動至畫布的中心點(根節點)
  const scrollToCenter = useCallback(
    (behavior) => {
      if (canvasRef.current && rootRef.current) {
        const rootPosition = getNodeCanvasLoc(rootRef);
        const { clientWidth, clientHeight } = canvasRef.current;
        const scrollToX =
          rootPosition.left -
          clientWidth / 2 +
          (rootPosition.right - rootPosition.left) / 2;
        const scrollToY =
          rootPosition.top -
          clientHeight / 2 +
          (rootPosition.bottom - rootPosition.top) / 2;
        canvasRef.current.scrollTo({
          left: scrollToX,
          top: scrollToY,
          behavior: behavior,
        });
      }
    },
    [canvasRef, rootRef, getNodeCanvasLoc]
  );

  const handleFullScreen = () => {
    if (!isFullScreen) {
      if (pageRef.current.requestFullscreen) {
        //最新版瀏覽器幾乎都支援
        pageRef.current.requestFullscreen();
      } else if (pageRef.current.mozRequestFullScreen) {
        //Firefox
        pageRef.current.mozRequestFullScreen();
      } else if (pageRef.current.webkitRequestFullscreen) {
        //Safari、Chrome、Opera
        pageRef.current.webkitRequestFullscreen();
      } else if (pageRef.current.msRequestFullscreen) {
        //Edge
        pageRef.current.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);
  // 初始渲染設定
  useLayoutEffect(() => {
    if (rootRef.current) {
      scrollToCenter("auto");
    }
  }, [scrollToCenter, loading, rootRef]);

  const handleZoom = (type) => {
    setZoomLevel((prev) => {
      if (type === "in") {
        return Math.min(prev * 1.25, 3); // 放大，最大300% (3)
      } else if (type === "out") {
        return Math.max(prev * 0.8, 0.4); // 縮小，最小40% (0.4)
      } else if (type === "reset") {
        return 1;
      } else {
        return prev;
      }
    });
  };
  return (
    <>
      {loading && <Loading />}

      <div
        className={`flex w-full ${isFullScreen && "h-screen"}`}
        ref={pageRef}
      >
        <div
          className={`transition-all duration-300 ease-in-out ${
            isToolBoxOpen ? "w-6/12 sm:w-10/12" : "w-screen"
          }`}
        >
          <div
            className={`canvas-wrap ${
              isFullScreen ? "h-screen" : "h-[calc(100vh-65px)]"
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
                className={`bottom-10 fixed z-20 transition-all duration-300 ease-in-out ${
                  isToolBoxOpen ? "right-[356px]" : "right-10"
                }`}
              >
                <BtnsGroupRow
                  scrollToCenter={scrollToCenter}
                  handleFullScreen={handleFullScreen}
                  handleZoom={handleZoom}
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
            <div
              className={`canvas ${canvasBgStyle}`}
              style={{
                "--zoomLevel": zoomLevel,
                backgroundColor: canvasBgColor,
                transform: `scale(${zoomLevel})`,
              }}
            >
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
                rootRef={rootRef}
                getNodeCanvasLoc={getNodeCanvasLoc}
                scrollToCenter={scrollToCenter}
                handleFullScreen={handleFullScreen}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                handleZoom={handleZoom}
              />
            </div>
          </div>
        </div>

        <div
          className={`bg-white absolute right-0 w-6/12 sm:w-2/12 transition-all duration-300 ease-in-out ${
            isToolBoxOpen ? "translate-x-0" : "translate-x-full "
          }`}
        >
          <div
            className={`${isFullScreen ? "h-screen" : "h-[calc(100vh-65px)]"}`}
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
              themes={themes}
              currentTheme={currentTheme}
              setCurrentTheme={setCurrentTheme}
              canvasBgColor={canvasBgColor}
              setCanvasBgColor={setCanvasBgColor}
              canvasBgStyle={canvasBgStyle}
              setCanvasBgStyle={setCanvasBgStyle}
              pathWidth={pathWidth}
              setPathWidth={setPathWidth}
              pathStyle={pathStyle}
              setPathStyle={setPathStyle}
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
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
      </div>
    </>
  );
};

export default WorkArea;
