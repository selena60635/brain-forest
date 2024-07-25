import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import Loading from "./loading";
import { v4 as uuidv4 } from "uuid";
import { delay } from "./WorkArea";

const Folder = () => {
  const [mindMaps, setMindMaps] = useState([]); //存儲使用者所有心智圖檔案
  const [loading, setLoading] = useState(true); //是否開啟loading page
  const navigate = useNavigate();

  //初始載入時取得firstore中，該使用者的mindMaps
  useEffect(() => {
    const fetchMindMaps = async () => {
      try {
        const userId = auth.currentUser.uid;
        const mindMapsCollection = collection(db, "users", userId, "mindMaps");
        const mindMapsSnapshot = await getDocs(mindMapsCollection);
        const mindMapsList = mindMapsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMindMaps(mindMapsList);
      } catch (err) {
        console.error("載入檔案失敗: ", err);
      } finally {
        await delay(1000);
        setLoading(false);
      }
    };

    fetchMindMaps();
  }, []);
  //刪除相應id的心智圖檔案
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const userId = auth.currentUser.uid;
      await deleteDoc(doc(db, "users", userId, "mindMaps", id));
      setMindMaps((prevMindMaps) =>
        prevMindMaps.filter((mindMap) => mindMap.id !== id)
      );
    } catch (err) {
      console.error("刪除檔案失敗: ", err);
    }
  };
  //新增一個初始心智圖新檔案
  const handleAddNewFile = async () => {
    try {
      const userId = auth.currentUser.uid;
      const newMindMapData = {
        colorStyle: 2,
        rootNode: {
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
        },
        nodes: [],
        lastSavedAt: Timestamp.now(),
      };
      const docRef = await addDoc(
        collection(db, "users", userId, "mindMaps"),
        newMindMapData
      );
      navigate(`/workArea/${docRef.id}`); //重導向至該檔案頁面
    } catch (err) {
      console.error("新增檔案失敗: ", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Folder</h2>
      <button
        className="mb-6 bg-secondary text-white px-4 py-2 rounded"
        onClick={handleAddNewFile}
      >
        新增檔案
      </button>
      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {mindMaps.length > 0 &&
            mindMaps.map((mindMap) => (
              <div
                key={mindMap.id}
                className="p-4 bg-primary text-white rounded-lg relative cursor-pointer"
                onClick={() => navigate(`/workArea/${mindMap.id}`)}
              >
                <h3 className="text-lg font-bold mb-2">
                  {mindMap.rootNode?.name || "未命名"}
                </h3>
                <p className="text-sm mb-4">
                  {mindMap.lastSavedAt
                    ? `最後儲存時間: ${new Date(
                        mindMap.lastSavedAt.seconds * 1000
                      ).toLocaleString()}`
                    : "未知"}
                </p>
                <button
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                  onClick={(e) => handleDelete(mindMap.id, e)}
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Folder;
