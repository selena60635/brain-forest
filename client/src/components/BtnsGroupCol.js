import React from "react";
import { Button } from "@headlessui/react";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdError } from "react-icons/md";

function BtnsGroupCol({
  rootNode,
  nodes,
  selectedNodes,
  addNode,
  delNode,
  findParentNode,
  addSiblingNode,
  addSiblingChildNode,
  addChildNode,
  isSaved,
  handleSaveMindMap,
}) {
  const handleAddSiblingNode = (e) => {
    e.stopPropagation();
    if (selectedNodes.length === 1) {
      if (selectedNodes[0] === rootNode.id) {
        addNode();
        return;
      }
      const parentNode = findParentNode([rootNode, ...nodes]);
      if (parentNode && parentNode.children.length > 0) {
        addSiblingChildNode(parentNode);
      } else {
        addSiblingNode();
      }
    }
  };

  const handleAddChildNode = (e) => {
    e.stopPropagation();
    if (selectedNodes.length === 1) {
      if (selectedNodes[0] === rootNode.id) {
        addNode();
        return;
      }
      addChildNode(selectedNodes[0]);
    }
  };

  const handleDelNode = (e) => {
    e.stopPropagation();
    if (selectedNodes.length > 0) {
      delNode(selectedNodes);
    }
  };

  return (
    <div className="space-y-4">
      <div className="btns-group flex-col w-12">
        <Button
          className="btn aspect-square text-gray-700"
          onClick={handleAddSiblingNode}
        >
          <svg
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path
              d="M 307.46194 -874.92035 C 270.97776 -874.92035 239.6392 -853.23512 225.50881 -822.02973 L 105.82131 -822.02973 A 40.004702 40.004702 0 0 0 65.821311 -782.02973 L 65.821311 -327.18598 A 40.004702 40.004702 0 0 0 105.82131 -287.18598 L 279.72756 -287.18598 L 279.72756 -274.60785 C 279.72756 -211.21943 332.04225 -158.98285 395.43069 -158.98285 L 668.55569 -158.98285 C 731.94412 -158.98285 784.25881 -211.21943 784.25881 -274.60785 L 784.25881 -389.37348 C 784.25881 -452.76191 731.94412 -505.0766 668.55569 -505.0766 L 395.43069 -505.0766 C 332.04225 -505.0766 279.72756 -452.76191 279.72756 -389.37348 L 279.72756 -367.18598 L 145.82131 -367.18598 L 145.82131 -742.02973 L 228.32131 -742.02973 C 243.56183 -713.97449 273.28935 -694.92035 307.46194 -694.92035 C 357.16752 -694.92035 397.46194 -735.21477 397.46194 -784.92035 C 397.46194 -834.62593 357.16752 -874.92035 307.46194 -874.92035 z M 395.43069 -425.0766 L 668.55569 -425.0766 C 689.00799 -425.0766 704.25881 -409.82578 704.25881 -389.37348 L 704.25881 -274.60785 C 704.25881 -254.15555 689.00799 -238.98285 668.55569 -238.98285 L 395.43069 -238.98285 C 374.97839 -238.98285 359.72756 -254.15555 359.72756 -274.60785 L 359.72756 -389.37348 C 359.72756 -409.82578 374.97839 -425.0766 395.43069 -425.0766 z"
              transform="translate(53.788064,36.24848)"
            />
          </svg>
        </Button>
        <Button
          onClick={handleAddChildNode}
          className="btn aspect-square text-gray-700"
        >
          <svg
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path d="M 449.14062 -653.04688 C 385.75219 -653.04688 333.51562 -600.73219 333.51562 -537.34375 L 333.51562 -520 L 286.71875 -520 A 90 90 0 0 0 206.09375 -570 A 90 90 0 0 0 116.09375 -480 A 90 90 0 0 0 206.09375 -390 A 90 90 0 0 0 286.5625 -440 L 333.51562 -440 L 333.51562 -422.65625 C 333.51562 -359.26781 385.75219 -306.95313 449.14062 -306.95312 L 722.34375 -306.95312 C 785.73219 -306.95312 837.96875 -359.26781 837.96875 -422.65625 L 837.96875 -537.34375 C 837.96875 -600.73219 785.73219 -653.04688 722.34375 -653.04688 L 449.14062 -653.04688 z M 449.14062 -573.04688 L 722.34375 -573.04688 C 742.79605 -573.04688 757.96875 -557.79605 757.96875 -537.34375 L 757.96875 -422.65625 C 757.96875 -402.20395 742.79605 -386.95313 722.34375 -386.95312 L 449.14062 -386.95312 C 428.68833 -386.95312 413.51562 -402.20395 413.51562 -422.65625 L 413.51562 -537.34375 C 413.51562 -557.79605 428.68833 -573.04688 449.14062 -573.04688 z" />
          </svg>
        </Button>
        <Button className="btn aspect-square text-gray-700">
          <svg
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path d="M 458.75 -635.15625 C 349.5142 -632.92694 275.18909 -572.90775 230.46875 -519.45312 A 90 90 0 0 0 207.65625 -522.42188 A 90 90 0 0 0 117.65625 -432.42188 A 90 90 0 0 0 207.65625 -342.42188 A 90 90 0 0 0 297.65625 -432.42188 A 90 90 0 0 0 290.70312 -467.26562 C 324.23074 -507.74146 379.59984 -553.35461 459.92188 -555.15625 C 540.17677 -555.08695 587.93173 -534.34431 620.07812 -508.98438 C 633.5753 -498.3366 644.34149 -486.56008 653.28125 -474.53125 L 586.64062 -449.92188 A 20.356897 20.356897 0 0 0 580.70312 -415.23438 L 673.82812 -337.73438 L 766.95312 -260.3125 A 20.356897 20.356897 0 0 0 800 -272.5 L 820.54688 -391.875 L 841.01562 -511.25 A 20.356897 20.356897 0 0 0 821.48438 -535.07812 A 20.356897 20.356897 0 0 0 813.90625 -533.82812 L 730.54688 -503.04688 C 716.16933 -526.09086 696.74082 -550.39318 669.60938 -571.79688 C 622.8815 -608.65999 554.429 -635.15625 459.53125 -635.15625 A 40.004 40.004 0 0 0 458.75 -635.15625 z" />
          </svg>
        </Button>
        <Button className="btn aspect-square text-gray-700">
          <svg
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path d="M 155 -795 A 40 40 0 0 0 115 -755 A 40 40 0 0 0 155 -715 L 179.375 -715 L 182.03125 -555.85938 A 40.004 40.004 0 0 0 197.03125 -525.3125 L 249.14062 -483.59375 L 197.03125 -441.875 A 40.004 40.004 0 0 0 182.03125 -411.32812 L 179.375 -252.26562 L 155 -252.26562 A 40 40 0 0 0 115 -212.26562 A 40 40 0 0 0 155 -172.26562 L 218.75 -172.26562 A 40.004 40.004 0 0 0 258.75 -211.5625 L 261.71875 -391.17188 L 329.6875 -445.625 A 40 40 0 0 0 334.45312 -450.15625 L 334.45312 -424.14062 C 334.45312 -360.7522 386.76782 -308.4375 450.15625 -308.4375 L 723.28125 -308.4375 C 786.66968 -308.4375 838.98438 -360.7522 838.98438 -424.14062 L 838.98438 -538.90625 C 838.98438 -602.29468 786.66968 -654.53125 723.28125 -654.53125 L 450.15625 -654.53125 C 386.76782 -654.53125 334.45313 -602.29468 334.45312 -538.90625 L 334.45312 -517.03125 A 40 40 0 0 0 329.6875 -521.5625 L 261.71875 -576.01562 L 258.75 -755.625 A 40.004 40.004 0 0 0 218.75 -795 L 155 -795 z M 450.15625 -574.53125 L 723.28125 -574.53125 C 743.73354 -574.53125 758.98438 -559.35854 758.98438 -538.90625 L 758.98438 -424.14062 C 758.98438 -403.68834 743.73354 -388.4375 723.28125 -388.4375 L 450.15625 -388.4375 C 429.70396 -388.4375 414.45312 -403.68834 414.45312 -424.14062 L 414.45312 -538.90625 C 414.45312 -559.35854 429.70396 -574.53125 450.15625 -574.53125 z" />
          </svg>
        </Button>
        <Button
          onClick={handleDelNode}
          className="btn aspect-square text-gray-700"
        >
          <RiDeleteBinLine size={22} />
        </Button>
      </div>
      <div className="btns-group flex-col w-12">
        <Button className="btn aspect-square text-gray-700">
          <svg
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path d="M 468.32426 -855.13715 A 80 80 0 0 0 388.32765 -775.14053 A 80 80 0 0 0 430.21913 -705.05286 L 430.21913 -556.7409 A 110 110 0 0 0 388.16652 -527.57799 L 247.02446 -575.1087 A 80 80 0 0 0 168.96129 -637.70425 A 80 80 0 0 0 88.964675 -557.70763 A 80 80 0 0 0 168.96129 -477.71101 A 80 80 0 0 0 222.93685 -498.81787 L 360.4537 -452.49556 A 110 110 0 0 0 380.59383 -391.35011 L 295.1191 -283.1573 A 80 80 0 0 0 270.70926 -287.02421 A 80 80 0 0 0 190.71264 -207.02759 A 80 80 0 0 0 270.70926 -127.03098 A 80 80 0 0 0 350.70587 -207.02759 A 80 80 0 0 0 349.17522 -222.65634 L 447.70076 -347.2835 A 110 110 0 0 0 470.33828 -344.625 A 110 110 0 0 0 498.0511 -348.33078 L 592.22637 -229.18174 A 80 80 0 0 0 589.00395 -207.02759 A 80 80 0 0 0 669.00057 -127.03098 A 80 80 0 0 0 749.07775 -207.02759 A 80 80 0 0 0 669.00057 -287.02421 A 80 80 0 0 0 650.39108 -284.60739 L 562.90234 -395.29758 A 110 110 0 0 0 579.17557 -439.12251 L 729.82378 -489.87565 A 80 80 0 0 0 772.0375 -477.71101 A 80 80 0 0 0 852.03412 -557.70763 A 80 80 0 0 0 772.0375 -637.70425 A 80 80 0 0 0 692.28257 -561.65509 L 560.64664 -517.26624 A 110 110 0 0 0 510.21574 -557.06314 L 510.21574 -707.14743 A 80 80 0 0 0 548.32088 -775.14053 A 80 80 0 0 0 468.32426 -855.13715 z" />
          </svg>
        </Button>
        <Button className="btn aspect-square text-gray-700">
          <svg
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path
              d="M 649.2716 -750.42044 A 61.943905 61.943905 0 0 0 593.98183 -716.06093 A 30.971951 30.971951 0 0 0 587.3277 -716.90782 L 451.34148 -718.17815 C 408.15185 -718.56671 372.27831 -682.97177 372.27831 -639.7804 L 372.27831 -521.03442 L 304.34569 -520.12704 A 77.429878 77.429878 0 0 0 233.20699 -566.94792 A 77.429878 77.429878 0 0 0 155.77711 -489.51804 A 77.429878 77.429878 0 0 0 233.20699 -412.08816 A 77.429878 77.429878 0 0 0 303.92224 -458.18313 L 372.27831 -459.09052 L 372.27831 -339.67912 C 372.27831 -296.51634 407.93672 -260.85793 451.09951 -260.85793 L 591.98559 -260.85793 A 30.971951 30.971951 0 0 0 597.79283 -261.46285 A 61.943905 61.943905 0 0 0 649.2716 -233.75747 A 61.943905 61.943905 0 0 0 711.21551 -295.70137 A 61.943905 61.943905 0 0 0 649.2716 -357.64528 A 61.943905 61.943905 0 0 0 593.61888 -322.74134 A 30.971951 30.971951 0 0 0 591.98559 -322.80183 L 451.09951 -322.80183 C 441.41362 -322.80183 434.22221 -329.99323 434.22221 -339.67912 L 434.22221 -639.7804 C 434.22221 -649.29787 441.27996 -656.31987 450.79705 -656.23425 L 586.78327 -654.96391 A 30.971951 30.971951 0 0 0 596.40152 -656.41572 A 61.943905 61.943905 0 0 0 649.2716 -626.53263 A 61.943905 61.943905 0 0 0 711.21551 -688.47653 A 61.943905 61.943905 0 0 0 649.2716 -750.42044 z"
              transform="matrix(1.2914912,0,0,1.2914912,-81.184748,152.2082) "
            />
          </svg>
        </Button>
        <Button className="btn aspect-square text-gray-700">
          <svg
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
          >
            <path
              d="M 649.2716 -750.42044 A 61.943905 61.943905 0 0 0 593.98183 -716.06093 A 30.971951 30.971951 0 0 0 587.3277 -716.90782 L 451.34148 -718.17815 C 408.15185 -718.56671 372.27831 -682.97177 372.27831 -639.7804 L 372.27831 -521.03442 L 304.34569 -520.12704 A 77.429878 77.429878 0 0 0 233.20699 -566.94792 A 77.429878 77.429878 0 0 0 155.77711 -489.51804 A 77.429878 77.429878 0 0 0 233.20699 -412.08816 A 77.429878 77.429878 0 0 0 303.92224 -458.18313 L 372.27831 -459.09052 L 372.27831 -339.67912 C 372.27831 -296.51634 407.93672 -260.85793 451.09951 -260.85793 L 591.98559 -260.85793 A 30.971951 30.971951 0 0 0 597.79283 -261.46285 A 61.943905 61.943905 0 0 0 649.2716 -233.75747 A 61.943905 61.943905 0 0 0 711.21551 -295.70137 A 61.943905 61.943905 0 0 0 649.2716 -357.64528 A 61.943905 61.943905 0 0 0 593.61888 -322.74134 A 30.971951 30.971951 0 0 0 591.98559 -322.80183 L 451.09951 -322.80183 C 441.41362 -322.80183 434.22221 -329.99323 434.22221 -339.67912 L 434.22221 -639.7804 C 434.22221 -649.29787 441.27996 -656.31987 450.79705 -656.23425 L 586.78327 -654.96391 A 30.971951 30.971951 0 0 0 596.40152 -656.41572 A 61.943905 61.943905 0 0 0 649.2716 -626.53263 A 61.943905 61.943905 0 0 0 711.21551 -688.47653 A 61.943905 61.943905 0 0 0 649.2716 -750.42044 z"
              transform="matrix(1.2914912,0,0,1.2914912,-81.184748,152.2082) scale(-1, 1) translate(-960, 0)"
            />
          </svg>
        </Button>
      </div>
      <div className="btns-group flex-col w-12 relative">
        {!isSaved && (
          <MdError
            size={24}
            className="text-red-500 absolute -top-2 -right-2"
          />
        )}
        <Button className="btn aspect-square text-gray-700">
          <svg
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
            onClick={handleSaveMindMap}
          >
            <path
              d="M 172.20515 -855.79142 C 131.28199 -855.79142 97.201503 -821.73853 97.201503 -780.81538 L 97.201503 -175.66922 C 97.201503 -134.74606 131.28199 -100.69318 172.20515 -100.69318 L 776.07435 -100.69318 C 816.99751 -100.69318 851.07799 -134.74606 851.07799 -175.66922 L 851.07799 -621.33731 C 851.07799 -653.23136 838.92827 -683.99115 817.08941 -707.23538 L 712.59087 -818.42658 C 690.23341 -842.22279 658.9636 -855.79142 626.31217 -855.79142 L 172.20515 -855.79142 z M 181.11081 -771.86424 L 257.2583 -771.86424 L 257.2583 -674.46929 C 257.2583 -623.06031 302.76802 -580.44129 357.75337 -580.44129 L 537.82748 -580.44129 C 592.81285 -580.44129 638.32256 -623.06031 638.32256 -674.46929 L 638.32256 -769.56486 C 643.22038 -767.73038 647.72904 -764.9263 651.39509 -761.02433 L 755.97533 -649.75102 C 763.2192 -642.04099 767.25039 -631.91644 767.25039 -621.33731 L 767.25039 -184.53824 L 696.41362 -184.53824 A 41.938751 41.938751 0 0 0 696.49532 -185.85217 L 696.49532 -395.09527 C 696.49532 -433.99335 664.0664 -466.39739 625.16833 -466.37588 L 317.80045 -466.21164 C 278.91351 -466.19014 246.55516 -433.73585 246.55516 -394.8489 L 246.55516 -184.53824 L 181.11081 -184.53824 L 181.11081 -771.86424 z M 344.02722 -771.86424 L 551.55364 -771.86424 L 551.55364 -674.46929 C 551.55364 -666.89201 545.9319 -661.57637 537.82748 -661.57637 L 357.75337 -661.57637 C 349.64897 -661.57637 344.02722 -666.89201 344.02722 -674.46929 L 344.02722 -771.86424 z M 612.58601 -382.53083 L 612.58601 -185.85217 A 41.938751 41.938751 0 0 0 612.83112 -184.53824 L 330.38276 -184.53824 L 330.38276 -382.36658 L 612.58601 -382.53083 z"
              transform="matrix(0.9562036,0,0,0.9513456,25.727453,-23.26848)"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}

export default BtnsGroupCol;
