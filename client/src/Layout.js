import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <header className="bg-dark">
        <nav className="container navbar">
          <div>
            <Link to="/" className="navbar-brand">
              <img src="我.png" alt="" width="40"></img>
            </Link>
          </div>
          <ul className="nav">
            <li className="nav-item">
              <Link to="/folder" className="nav-link link-light">
                資料夾
              </Link>
            </li>
            <li className="nav-item">
              <Link to="" className="nav-link link-light">
                匯出
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/workArea" className="nav-link link-light">
                工作區
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/login" className="nav-link link-light">
                登入
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
