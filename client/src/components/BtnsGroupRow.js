import React from "react";
import { Button } from "@headlessui/react";

function BtnsGroup() {
  return (
    <div className="flex space-x-4">
      <div className="btns-group h-12">
        <Button className="btn aspect-square">
          <span className="material-symbols-rounded">pan_tool</span>
        </Button>
      </div>
      <div className="btns-group h-12">
        <Button className="btn aspect-square">
          <span className="material-symbols-rounded">open_with</span>
        </Button>
        <Button className="btn aspect-square">
          <span className="material-symbols-rounded">recenter</span>
        </Button>
        <Button className="btn aspect-square">
          <span className="material-symbols-rounded">add</span>
        </Button>
        <Button className="btn aspect-square">
          <span className="material-symbols-rounded">remove</span>
        </Button>
      </div>
    </div>
  );
}

export default BtnsGroup;
