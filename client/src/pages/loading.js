import React, { useEffect } from "react";
import { hourglass } from "ldrs";

export default function Loading() {
  hourglass.register("l-hourglass");
  useEffect(() => {
    console.log("loading");
  }, []);
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-light z-50">
      <l-hourglass
        size="150"
        bg-opacity="0.1"
        speed="1.75"
        color="#3AB795"
      ></l-hourglass>
    </div>
  );
}
