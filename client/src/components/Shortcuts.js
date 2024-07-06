import React from "react";
import { Button } from "@headlessui/react";

function Shortcuts() {
  return (
    <>
      <div className="btns-group bottom-10 left-5 fixed z-20">
        <Button className="btn p-1">
          <span>Shortcuts</span>
        </Button>
      </div>
    </>
  );
}

export default Shortcuts;
