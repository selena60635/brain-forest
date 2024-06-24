import React from "react";
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <header className="bg-gray-800">
        <nav className="flex justify-between items-center px-20">
          <div className="flex space-x-3 items-center my-1">
            <Link to="/">
              <img src="我.png" alt="" width="40"></img>
            </Link>
            <Link className="text-gray-300 text-xl font-bold" to="/">
              <h1>Brain Forest</h1>
            </Link>
          </div>
          <ul className="flex space-x-8">
            <li className="">
              <Link
                to="/folder"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Folder
              </Link>
            </li>
            <li className="">
              <Link
                to=""
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Export
              </Link>
            </li>
            <li className="">
              <Link
                to="/workArea"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Workarea
              </Link>
            </li>
            <li className="">
              <Link
                to="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <Outlet />
    </>
  );
};

export default Layout;
