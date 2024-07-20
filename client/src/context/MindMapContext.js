import React, { createContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const MindMapContext = createContext();

export const MindMapProvider = ({ children }) => {
  const [currentColorStyle, setCurrentColorStyle] = useState(2);
  const [colorIndex, setColorIndex] = useState(0);
  const [nodesColor, setNodesColor] = useState("#17493b");
  const [rootNode, setRootNode] = useState({
    id: uuidv4(),
    name: "根節點",
    bkColor: "#000229",
    pathColor: "#000229",
    outline: { color: "#000229", width: "2px", style: "none" },
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
  const [nodes, setNodes] = useState([]);

  const saveMindMap = async () => {
    try {
      const userId = auth.currentUser.uid;
      const newMindMap = {
        colorStyle: 2,
        rootNode,
        nodes,
        lastSavedAt: Timestamp.now(),
      };
      const docRef = await addDoc(
        collection(db, "users", userId, "mindMaps"),
        newMindMap
      );
      return docRef.id;
    } catch (error) {
      console.error("Error saving mind map: ", error);
      return null;
    }
  };

  return (
    <MindMapContext.Provider
      value={{
        currentColorStyle,
        setCurrentColorStyle,
        colorIndex,
        setColorIndex,
        nodesColor,
        setNodesColor,
        rootNode,
        setRootNode,
        nodes,
        setNodes,
        saveMindMap,
      }}
    >
      {children}
    </MindMapContext.Provider>
  );
};

export default MindMapContext;
