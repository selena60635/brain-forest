import React, { useEffect, useState, useContext } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import Loading from "./loading";
import MindMapContext from "../context/MindMapContext";

const Folder = () => {
  const [mindMaps, setMindMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { saveMindMap } = useContext(MindMapContext);

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
      } catch (error) {
        console.error("Error fetching mind maps: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMindMaps();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const userId = auth.currentUser.uid;
      await deleteDoc(doc(db, "users", userId, "mindMaps", id));
      setMindMaps((prevMindMaps) =>
        prevMindMaps.filter((mindMap) => mindMap.id !== id)
      );
    } catch (error) {
      console.error("Error deleting mind map: ", error);
    }
  };

  const handleAddNew = async () => {
    const newMindMapId = await saveMindMap();
    if (newMindMapId) {
      navigate(`/workArea/${newMindMapId}`);
    } else {
      console.error("Error creating new mind map.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Folder</h2>
      <button
        className="mb-6 bg-secondary text-white px-4 py-2 rounded"
        onClick={handleAddNew}
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
