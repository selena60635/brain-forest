import React from "react";
import { Button } from "@headlessui/react";
import { MdOutlinePanTool, MdAdd, MdRemove } from "react-icons/md";
import { HiArrowsPointingIn, HiArrowsPointingOut } from "react-icons/hi2";

function BtnsGroupRow({
  scrollToCenter,
  toggleFullScreen,
  handleZoom,
  togglePanMode,
  isPanMode,
}) {
  return (
    <div className="flex space-x-4">
      <div className="btns-group h-12">
        <Button
          className={`btn aspect-square ${
            isPanMode && "bg-primary text-white hover:bg-primary"
          }`}
          onClick={togglePanMode}
        >
          <MdOutlinePanTool size={24} />
        </Button>
      </div>
      <div className="btns-group h-12">
        <Button
          className="btn aspect-square"
          onClick={() => scrollToCenter("smooth")}
        >
          <HiArrowsPointingIn size={24} />
        </Button>
        <Button className="btn aspect-square" onClick={toggleFullScreen}>
          <HiArrowsPointingOut size={24} />
        </Button>

        <Button className="btn aspect-square">
          <MdAdd size={24} onClick={() => handleZoom("in")} />
        </Button>
        <Button className="btn aspect-square">
          <MdRemove size={24} onClick={() => handleZoom("out")} />
        </Button>
      </div>
    </div>
  );
}

export default BtnsGroupRow;
