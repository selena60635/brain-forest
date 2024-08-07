import React from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { unified } from "unified";
import parse from "remark-parse";
import frontmatter from "remark-frontmatter";
import { parse as parseYaml } from "yaml";
import { delay } from "../pages/WorkArea";
import { RiSparkling2Line } from "react-icons/ri";
import { FaArrowCircleUp } from "react-icons/fa";
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
    </div>
  );
};

export default FileTool;
