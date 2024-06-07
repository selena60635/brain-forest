import React, { useState, useRef, useEffect } from "react";

const RootNode = () => {
  return <div className="rootnode">根節點</div>;
};
const Node = (props) => {
  return <div className="node">節點</div>;
};
const MindMap = () => {
  return (
    <div>
      <RootNode />
    </div>
  );
};

export default MindMap;
