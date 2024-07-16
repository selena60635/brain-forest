import React from "react";
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <header className="bg-light border-b border-secondary text-secondary">
        <nav className="flex justify-between items-center container mx-auto">
          <div className="flex space-x-3 items-center my-2">
            <Link to="/">
              <img src="我.png" alt="" width="40"></img>
            </Link>
            <Link className="text-2xl font-bold " to="/">
              <h1>Brain Forest</h1>
            </Link>
          </div>
          <ul className="flex space-x-8">
            <li className="">
              <Link
                to="/folder"
                className="px-3 py-2 font-medium hover:text-primary"
              >
                Folder
              </Link>
            </li>
            <li className="">
              <Link
                to="/workArea"
                className="px-3 py-2 font-medium  hover:text-primary"
              >
                Workarea
              </Link>
            </li>
            <li className="">
              <Link
                to="/login"
                className="rounded-md px-3 py-2 font-medium text-white bg-secondary hover:bg-primary"
              >
                Sign In
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
