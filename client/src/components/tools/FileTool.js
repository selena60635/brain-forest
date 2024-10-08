import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { unified } from "unified";
import parse from "remark-parse";
import frontmatter from "remark-frontmatter";
import { parse as parseYaml } from "yaml";
import { delay } from "../../pages/WorkArea";
import { RiSparkling2Line } from "react-icons/ri";
import { FaArrowCircleUp } from "react-icons/fa";
import { trio } from "ldrs";
import SweetAlert from "../SweetAlert";

const FileTool = ({
  rootNode,
  setRootNode,
  nodes,
  setNodes,
  setSelectedNodes,
  currentColorStyle,
  setCurrentColorStyle,
  colorStyles,
  setLoading,
  nodeRefs,
  currentTheme,
  setCurrentTheme,
  canvasBgColor,
  setCanvasBgColor,
  canvasBgStyle,
  setCanvasBgStyle,
  themes,
  pathWidth,
  setPathWidth,
  pathStyle,
  setPathStyle,
  fontFamily,
  setFontFamily,
  setRels,
}) => {
  trio.register();

  const [markdown, setMarkdown] = useState("");
  const [markdownAI, setMarkdownAI] = useState("");
  const [topic, setTopic] = useState("");
  const [loadingAi, setLoadingAi] = useState(false); // 控制 AI 請求的 loading 狀態
  const [fileName, setFileName] = useState("請選取 .md 檔案");

  //將心智圖轉換成Markdown
  const convertMindmap = (nodes, level = 0, preface = true) => {
    let content = "";
    //前言
    if (preface) {
      content += `---\ncolorStyle: ${currentColorStyle}\ncanvasBgStyle: "${canvasBgStyle}"\ncanvasBgColor: "${canvasBgColor}"\ntheme: ${currentTheme}\npathWidth: "${pathWidth}"\npathStyle: "${pathStyle}"\nfontFamily: "${fontFamily}"\n---\n\n`;
    }
    nodes.forEach((node) => {
      if (level === 0) {
        //處理根節點
        content += `# ${node.name || "未命名"}\n`;
        level++;
      } else if (level === 1) {
        //處理節點
        content += `## ${node.name || "未命名"}\n`;
      } else {
        //處理子節點
        content += `${"  ".repeat(level - 2)}- ${node.name || "未命名"}\n`;
      }

      if (node.children && node.children.length > 0) {
        //若有children，遞迴處理其子節點
        content += convertMindmap(node.children, level + 1, false);
      }
    });
    return content;
  };

  //將轉換完成的Markdown匯出
  const exportMarkdown = () => {
    const markdownContent = convertMindmap([rootNode, ...nodes]); //轉換完畢的心智圖組件內容
    const blob = new Blob([markdownContent], { type: "text/markdown" }); //建立一個包含Markdown內容的Blob物件
    const url = URL.createObjectURL(blob); //建立blob臨時下載連結
    const link = document.createElement("a");
    link.href = url;
    link.download = "mindmap.md";
    link.click(); //觸發點擊事件下載檔案
    URL.revokeObjectURL(url); //釋放臨時URL
  };

  //處理匯入的Markdown文件
  const importMarkdown = (file) => {
    const reader = new FileReader(); //建立一個FileReader物件，用於讀取文件內容
    reader.onload = (e) => {
      //文件讀取完畢時，設定markdown為獲取到的文件內容
      const markdown = e.target.result;
      setMarkdown(markdown);
    };
    reader.readAsText(file); //以文本格式讀取文件
  };

  //上傳檔案後執行處理文件等操作
  const handleFileChange = (e) => {
    const file = e.target.files[0]; //取得上傳的檔案
    if (file) {
      setFileName(file.name); //設置檔案名狀態
      importMarkdown(file); //處理上傳的檔案
    } else {
      setFileName("請選取 .md 檔案");
      setMarkdown("");
    }
  };

  //解析Markdown文件並轉換為子節點元件
  const parseTochildNodes = (
    listItems,
    colorStyle,
    colorIndex,
    theme,
    pathWidth,
    pathStyle,
    fontFamily,
    parentId
  ) => {
    return listItems.map((listItem) => {
      const style =
        colorStyle !== 0
          ? themes[theme].colorStyles[colorStyle - 1]
          : colorStyles[colorStyle];
      //子節點的顏色索引與父節點的顏色索引是相同的
      const bkColor = style.child[colorIndex % style.child.length];
      const node = {
        id: uuidv4(),
        name: listItem.children[0]?.children[0]?.value || "未命名",
        children: [],
        bkColor: bkColor,
        pathColor: bkColor,
        outline: { color: bkColor, width: "3px", style: "none" },
        font: {
          family: fontFamily,
          size: "16px",
          weight: "400",
          color: style.text,
        },
        path: {
          width: pathWidth,
          style: pathStyle,
        },
        parent: parentId,
      };

      if (listItem.children[1] && listItem.children[1].type === "list") {
        node.children = parseTochildNodes(
          listItem.children[1].children,
          colorStyle,
          colorIndex,
          theme,
          pathWidth,
          pathStyle,
          fontFamily,
          node.id
        );
      }
      return node;
    });
  };
  //解析Markdown文件並轉換為節點元件
  const parseToNodes = (content) => {
    const processor = unified().use(parse).use(frontmatter, ["yaml"]);

    const tree = processor.parse(content);
    let colorStyle = 1;
    let canvasBgStyle = "none";
    let canvasBgColor = "#fff";
    let theme = 0;
    let pathWidth = "3";
    let pathStyle = "0";
    let fontFamily = "Noto Sans TC";
    let result = [];

    const yamlNode = tree.children.find((node) => node.type === "yaml");
    if (yamlNode) {
      try {
        const data = parseYaml(yamlNode.value);
        if (data.colorStyle >= 0 && data.colorStyle <= 3) {
          colorStyle = data.colorStyle;
        }
        if (data.theme >= 0 && data.theme <= 2) {
          theme = data.theme;
        }
        if (data.pathStyle === "none") {
          pathWidth = "0";
        } else if (data.pathStyle === "dashed") {
          pathStyle = "8";
          pathWidth = data.pathWidth || "3";
        }
        canvasBgStyle = data.canvasBgStyle || "none";
        canvasBgColor = data.canvasBgColor || "#fff";
        fontFamily = data.fontFamily || "Noto Sans TC";
      } catch (err) {
        console.error(err);
      }
    }
    setCurrentTheme(theme);
    setCanvasBgColor(canvasBgColor);
    setCanvasBgStyle(canvasBgStyle);
    setCurrentColorStyle(colorStyle);
    setPathWidth(pathWidth);
    setPathStyle(pathStyle);
    setFontFamily(fontFamily);
    setSelectedNodes([]);
    setRels([]);
    const createNode = (name, colorStyle, index = null) => {
      const style =
        colorStyle !== 0
          ? themes[theme].colorStyles[colorStyle - 1]
          : colorStyles[colorStyle];
      const nodeColorIndex = index % style.nodes.length;
      const bkColor = index !== null ? style.nodes[nodeColorIndex] : style.root;
      return {
        id: uuidv4(),
        name: name,
        children: [],
        bkColor: bkColor,
        pathColor: bkColor,
        outline: { color: bkColor, width: "3px", style: "none" },
        font: {
          family: fontFamily,
          size: index !== null ? "20px" : "24px",
          weight: "400",
          color: style.text,
        },
        path: {
          width: pathWidth,
          style: pathStyle,
        },
      };
    };

    let currentParent;
    let colorIndex = 2;
    try {
      tree.children.forEach((item) => {
        if (item.type === "heading" && item.depth === 1) {
          const rootNode = createNode(item.children[0].value, colorStyle);
          result.push(rootNode);
        } else if (item.type === "heading" && item.depth === 2) {
          let node = createNode(item.children[0].value, colorStyle, colorIndex);
          result.push(node);
          currentParent = node;
          colorIndex++;
        } else if (item.type === "list") {
          const nodes = parseTochildNodes(
            item.children,
            colorStyle,
            (colorIndex - 1) % colorStyles[colorStyle].nodes.length,
            theme,
            pathWidth,
            pathStyle,
            fontFamily,
            currentParent.id
          );
          if (currentParent) {
            currentParent.children.push(...nodes);
          }
        }
      });
    } catch (err) {
      SweetAlert({
        type: "alert",
        title: "檔案格式錯誤",
        html: `<p class="text-left mb-4">請確認檔案符合範例格式。</p>
        <div class="text-left text-sm">
       <p >範例：</p>
      <div class="bg-gray-100 p-4">
        # Cats<br/>
        ## Basic Features<br/>
        - Physical Characteristics<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;- Four Legs
      </div>
      </div>`,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
    return {
      rootNode: result[0],
      nodes: result.slice(1),
    };
  };

  //將Markdown文件轉換為心智圖組件並渲染
  const handleCreateMindMap = async (content) => {
    if (content) {
      const rootPattern = /^#\s+.+/gm; //檢查文件內容是否至少有一個根節點

      if (!rootPattern.test(content)) {
        SweetAlert({
          type: "alert",
          title: "檔案格式錯誤",
          html: `<p class="text-left mb-4">檔案不符合格式，請確認檔案中至少含有一個 "# 主題"。</p>
          <div class="text-left text-sm">
         <p >範例：</p>
        <div class="bg-gray-100 p-4">
          # Cats<br/>
          ## Basic Features<br/>
          - Physical Characteristics<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;- Four Legs
        </div>
        </div>`,
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      setLoading(true);
      await delay(1000);
      const mindMapData = parseToNodes(content);
      setRootNode((prev) => mindMapData.rootNode || prev);
      setNodes((prev) => mindMapData.nodes || prev);
      nodeRefs.current = new Array(mindMapData.nodes.length)
        .fill(null)
        .map(() => React.createRef());
      setLoading(false);
    }
  };

  //OpenAI生成心智圖
  const fetchMindmapFromOpenAI = async (topic) => {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    try {
      setLoadingAi(true);
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `
              You are a professional mind map expert, skilled in creating structured mind maps in Markdown format based on different themes with strict format rules.

              Expected Format:
              Create a mind map in Markdown format using the following hierarchical structure rules:
              - "# Subject" as the root node
              - "## Subject" as a node
              - "- Subject" as a child node
              - "- Subject" as a sub-child node
              ...and so on.

              Example:
              # Cats
              ## Basic Features
              - Physical Characteristics
                - Four Legs
              - Habits
              ## Breeds
              - Hairless Cats
                - Sphynx
              ## Behavior
              ## Culture
            `,
            },
            { role: "user", content: topic },
          ],
          max_tokens: 500,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const markdownContent = response.data.choices[0].message.content;
      setMarkdownAI(markdownContent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="">
      <div className="flex flex-col p-4 border-t">
        <span className="font-medium mb-2">匯出</span>
        <button
          onClick={exportMarkdown}
          className="bg-primary text-white p-2 rounded hover:bg-[#078B68]"
        >
          匯出成 Markdown
        </button>
      </div>
      <div className="flex flex-col p-4 border-t">
        <span className="font-medium mb-2">匯入</span>

        <div className="flex items-center gap-2  border rounded mb-2">
          <label className="px-2 py-1 rounded-l border-r cursor-pointer hover:bg-gray-100">
            <input
              type="file"
              accept=".md"
              onChange={handleFileChange}
              className=" hidden"
            />
            選擇檔案
          </label>
          <span className="text-gray-400 pointer-events-none">{fileName}</span>
        </div>

        <button
          onClick={() => handleCreateMindMap(markdown)}
          disabled={!markdown}
          className={`p-2 rounded ${
            !markdown
              ? "bg-gray-300 text-white"
              : "cursor-pointer bg-primary text-white hover:bg-[#078B68]"
          }`}
        >
          生成
        </button>
      </div>
      <div className="flex flex-col p-4 border-t">
        <span className="flex items-center font-medium mb-4">
          <RiSparkling2Line className="mr-1" size={18} />
          AI 生成工具
        </span>
        <div className="border rounded p-4 mb-4 h-40 overflow-y-scroll">
          <pre>{markdownAI}</pre>
        </div>
        <div className="pl-3 border rounded flex justify-between mb-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="輸入主題"
          />
          <button
            onClick={() => fetchMindmapFromOpenAI(topic)}
            className="border-l cursor-pointer hover:bg-gray-100 p-2"
            disabled={loadingAi || !topic}
          >
            {loadingAi ? (
              <l-trio size={19} speed="2" color="#3AB795"></l-trio>
            ) : (
              <FaArrowCircleUp size={24} className="text-primary" />
            )}
          </button>
        </div>
        <button
          onClick={() => handleCreateMindMap(markdownAI)}
          className={`p-2 rounded ${
            !markdownAI
              ? "bg-gray-300 text-white"
              : "cursor-pointer bg-primary text-white hover:bg-[#078B68]"
          }`}
          disabled={!markdownAI}
        >
          生成
        </button>
      </div>
    </div>
  );
};

export default FileTool;
