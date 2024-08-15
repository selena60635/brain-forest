import React from "react";
import { Button } from "@headlessui/react";
import { MdOutlinePanTool, MdAdd, MdRemove } from "react-icons/md";
import { HiArrowsPointingIn, HiArrowsPointingOut } from "react-icons/hi2";

function BtnsGroupRow({ scrollToCenter, handleFullScreen }) {
  return (
    <div className="flex space-x-4">
      <div className="btns-group h-12">
        <Button className="btn aspect-square">
          <MdOutlinePanTool size={24} />
        </Button>
      </div>
      <div className="btns-group h-12">
        <Button className="btn aspect-square" onClick={handleFullScreen}>
          <HiArrowsPointingOut size={24} />
        </Button>
        <Button
          className="btn aspect-square"
          onClick={() => scrollToCenter("smooth")}
        >
          <HiArrowsPointingIn size={24} />
        </Button>
        <Button className="btn aspect-square">
          <MdAdd size={24} />
        </Button>
        <Button className="btn aspect-square">
          <MdRemove size={24} />
        </Button>
      </div>
    </div>
  );
}

export default BtnsGroupRow;
