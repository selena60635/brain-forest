import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { unified } from "unified";
import parse from "remark-parse";
import frontmatter from "remark-frontmatter";
import { parse as parseYaml } from "yaml";
import { delay } from "../pages/WorkArea";

import { trio } from "ldrs";

const FileTool = ({
  rootNode,
  nodes,
  setRootNode,
  setNodes,
  setCurrentColorStyle,
  currentColorStyle,
  colorStyles,
  setSelectedNodes,
  setLoading,
  nodeRefs,
}) => {
  trio.register();

  const [markdown, setMarkdown] = useState(""); // 用來存儲 Markdown 內容

  const [fileName, setFileName] = useState("請選取 .md 檔案");

  //將心智圖轉換成Markdown
  const convertMindmap = (nodes, level = 0, preface = true) => {
    let content = "";

    // 包含 YAML 元數據來存儲顏色風格
    if (preface) {
      content += `---\ncolorStyle: ${currentColorStyle}\n---\n\n`;
    }

    nodes.forEach((node) => {
      if (level === 0) {
        content += `# ${node.name || "未命名"}\n`;
        level++;
      } else if (level === 1) {
        content += `## ${node.name || "未命名"}\n`;
      } else {
        content += `${"  ".repeat(level - 2)}- ${node.name || "未命名"}\n`;
      }
      if (node.children && node.children.length > 0) {
        content += convertMindmap(node.children, level + 1, false);
      }
    });
    return content;
  };

  //將轉換完成的Markdown匯出
  const exportMarkdown = () => {
    const markdownContent = convertMindmap([rootNode, ...nodes]);
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mindmap.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  //處理匯入的Markdown文件
  const importMarkdown = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const markdown = e.target.result;
      setMarkdown(markdown);
    };
    reader.readAsText(file);
  };
  //上傳檔案後執行處理文件等操作
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      importMarkdown(file);
    } else {
      setFileName("請選取 .md 檔案");
      setMarkdown("");
    }
  };

  //解析Markdown文件並轉換為子節點元件
  const parseTochildNodes = (listItems, colorStyle, colorIndex) => {
    return listItems.map((listItem) => {
      const style = colorStyles[colorStyle];
      // 使用父節點的顏色索引來選擇子節點的顏色
      const bkColor = style.child[colorIndex % style.child.length];
      const node = {
        id: uuidv4(),
        name: listItem.children[0]?.children[0]?.value || "未命名",
        children: [],
        bkColor: bkColor,
        pathColor: bkColor,
        outline: { color: bkColor, width: "3px", style: "none" },
        font: {
          family: "Noto Sans TC",
          size: "16px",
          weight: "400",
          color: style.text,
        },
        path: {
          width: "3",
          style: "0",
        },
      };

      // 處理嵌套列表，傳遞當前父節點顏色索引
      if (listItem.children[1] && listItem.children[1].type === "list") {
        node.children = parseTochildNodes(
          listItem.children[1].children,
          colorStyle,
          colorIndex // 傳遞父節點顏色索引
        );
      }

      return node;
    });
  };
  //解析Markdown文件並轉換為節點元件
  const parseToNodes = (content) => {
    const processor = unified().use(parse).use(frontmatter, ["yaml"]);

    const tree = processor.parse(content);
    console.log(tree);
    let colorStyle = 2;
    let result = [];

    const yamlNode = tree.children.find((node) => node.type === "yaml");
    if (yamlNode) {
      try {
        const data = parseYaml(yamlNode.value);
        colorStyle = data.colorStyle || colorStyle;
      } catch (error) {
        console.error("Failed to parse YAML frontmatter:", error);
      }
    }

    const createNode = (name, colorStyle, index = null) => {
      const style = colorStyles[colorStyle];
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
          family: "Noto Sans TC",
          size: index !== null ? "20px" : "24px",
          weight: "400",
          color: style.text,
        },
        path: {
          width: "3",
          style: "0",
        },
      };
    };

    let currentParent = [];
    let colorIndex = 2;
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
          (colorIndex - 1) % colorStyles[colorStyle].nodes.length
        );
        if (currentParent) {
          currentParent.children.push(...nodes);
        }
      }
    });

    setCurrentColorStyle(colorStyle);
    setSelectedNodes([]);

    return {
      rootNode: result[0],
      nodes: result.slice(1),
    };
  };
  //將Markdown文件轉換為心智圖組件並渲染
  const handleCreateMindMap = async (content) => {
    if (content) {
      try {
        setLoading(true);
        await delay(1000);
        const mindMapData = parseToNodes(content);
        setRootNode(mindMapData.rootNode);
        setNodes(mindMapData.nodes);
        nodeRefs.current = new Array(mindMapData.nodes.length)
          .fill(null)
          .map(() => React.createRef());
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="">
      <div className="flex flex-col pt-2 pb-4 px-4 border-t">
        <span className="font-medium mb-2">匯出</span>

        <button
          onClick={exportMarkdown}
          className="bg-primary text-white p-2 rounded hover:bg-[#078B68]"
        >
          匯出成 Markdown
        </button>
      </div>
      <div className="flex flex-col pt-2 pb-4 px-4 border-t">
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
    </div>
  );
};

export default FileTool;
