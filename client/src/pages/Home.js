import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../context/AuthContext";
import { handleSignOut } from "../components/Layout";
import { FaGithub } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { FaPhone } from "react-icons/fa6";

const Home = () => {
  const { user } = useContext(Context);
  return (
    <>
      <section
        className="bg-light/50  h-[calc(100vh-65px)] flex item-start justify-center px-8 text-gray-700"
        style={{
          background: "url(/BG-01.jpg) center no-repeat",
        }}
      >
        <div className="max-w-6xl w-full mx-auto mt-28 text-center ">
          <h2 className="text-8xl font-black gradient-text">BRAIN FOREST</h2>
          <p className="text-3xl font-bold mt-8">
            Record your brainstorm and Unleash your creative potential.
          </p>
        </div>
      </section>
      <section className="bg-light/50 flex item-start justify-center  px-8 ">
        <div className="max-w-6xl mx-auto my-28 bg-white/80 p-8 rounded-xl shadow-xl ">
          <div className="flex text-secondary">
            <h3 className="text-5xl font-bold leading-normal w-8/12">
              Plant Idea Seeds <br />
              and
              <br />
              Nurture Idea Trees
            </h3>

            <img className="w-4/12" src="motionTest.jpg" alt=""></img>
          </div>
        </div>
      </section>
      <section className="bg-light/50  flex item-start justify-center  px-8">
        <div className="max-w-6xl w-full mx-auto mb-28 mt-10">
          <h3 className="text-6xl font-bold leading-normal text-center text-secondary py-10">
            Feature
          </h3>
          <ul className="space-y-20 flex flex-col text-white">
            <li className="flex justify-between drop-shadow-md justify-self-start w-3/4 mr-auto">
              <div className="rounded-l-full bg-secondary p-8 pl-12">
                <h4 className="text-xl font-semibold mb-2">
                  Idea visualization
                </h4>
                <p>
                  Turn your creativity into tangible forms, making every idea
                  clearly visible.
                </p>
              </div>
              <img
                className="rounded-r-full w-96"
                src="Idea visualization.jpg"
                alt="Idea visualization"
              ></img>
            </li>
            <li className="flex justify-between drop-shadow-md justify-self-start w-3/4 ml-auto">
              <img
                className="rounded-l-full w-96"
                src="Rich Style Tools.jpg"
                alt="Rich Style Tools"
              ></img>
              <div className="rounded-r-full bg-secondary p-8">
                <h4 className="text-xl font-semibold mb-2">Rich Style Tools</h4>
                <p>
                  Enjoy the rich style tools provided by Brain Forest to easily
                  design unique mind maps.
                </p>
              </div>
            </li>
            <li className="flex justify-between drop-shadow-md justify-self-start w-3/4 mr-auto">
              <div className="rounded-l-full bg-secondary p-8 pl-12">
                <h4 className="text-xl font-semibold mb-2">
                  Share Your Idea Tree
                </h4>
                <p>
                  Provide export and import functionality to share your idea
                  tree with others, allowing creativity to grow together.
                </p>
              </div>
              <img
                className="rounded-r-full w-96"
                src="Share Your Idea Tree.jpg"
                alt="Share Your Idea Tree"
              ></img>
            </li>
            <li className="flex justify-between drop-shadow-md justify-self-start w-3/4 ml-auto">
              <img className="rounded-l-full w-96" src="AI.jpg" alt="AI"></img>
              <div className="rounded-r-full bg-secondary p-8">
                <h4 className="text-xl font-semibold mb-2">
                  AI Generation Tool
                </h4>
                <p>
                  Let OpenAI help you quickly build your idea tree, ensuring
                  every idea takes shape rapidly.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>
      <section className="bg-light/50 flex item-start justify-center px-8">
        <div className="max-w-6xl w-full mx-auto mt-28 mb-48 text-center">
          <h3 className="text-7xl font-bold gradient-text pb-8">
            Start Planting Today
          </h3>
          <p className="text-2xl font-semibold mb-16 text-gray-700">
            Try Brain Forest for Free. Immediately spark your creativity and
            harvest unlimited inspiration.
          </p>
          <button className="rounded-md font-bold text-white text-5xl bg-secondary hover:bg-primary ml-4 transition-all duration-100 hover:scale-125">
            <Link to={user ? "/folder" : "/login"} className="px-12 py-4 block">
              Go
            </Link>
          </button>
        </div>
      </section>
      <footer className="bg-light border-t border-secondary px-4">
        <nav className="container mx-auto flex item-center justify-between text-secondary py-2">
          <ul className="flex items-center space-x-8 font-medium">
            <li className="">
              <Link to="/folder" className="hover:text-primary">
                Folder
              </Link>
            </li>
            <li className="">
              <Link to="/workArea" className="hover:text-primary">
                Workarea
              </Link>
            </li>
            <li className="">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="rounded-md px-2 py-1 text-white bg-secondary hover:bg-primary "
                >
                  Sign Out
                </button>
              ) : (
                <Link to="/login" className="hover:text-primary">
                  Sign In
                </Link>
              )}
            </li>
          </ul>

          <ul className="flex items-center space-x-8">
            <li>
              <Link
                to="https://github.com/selena60635/brain-forest"
                target="_blank"
              >
                <FaGithub size={24} />
              </Link>
            </li>
            <li>
              <Link to="mailto:selena606352000@gmail.com">
                <IoMail size={26} />
              </Link>
            </li>
            <li>
              <Link to="tel:0975319299">
                <FaPhone size={22} />
              </Link>
            </li>
          </ul>
        </nav>
      </footer>
    </>
  );
};

export default Home;
