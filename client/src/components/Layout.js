import React, { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Context } from "../context/AuthContext";
import SweetAlert from "./SweetAlert";

export async function handleSignOut() {
  const logoutAlert = await SweetAlert({
    type: "alert",
    title: "Confirm sign out?",
    icon: "warning",
    confirmButtonText: "Yes, sign out",
    showCancelButton: true,
    cancelButtonText: "No, cancel",
  });
  if (logoutAlert.isConfirmed) {
    try {
      await signOut(auth);
    } catch (err) {
      SweetAlert({
        type: "toast",
        title: "Signed out failed!",
        icon: "error",
      });
    }
  }
}

const Layout = () => {
  const { user } = useContext(Context);

  return (
    <>
      <header className="bg-light border-b border-secondary text-secondary">
        <nav className="flex justify-between items-center container mx-auto px-4">
          <div className="flex space-x-3 items-center my-4">
            <Link className="text-2xl font-bold " to="/">
              <h1>Brain Forest</h1>
            </Link>
          </div>
          <ul className="flex items-center space-x-8">
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
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="rounded-md px-3 py-2 font-medium text-white bg-secondary hover:bg-primary"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 font-medium text-white bg-secondary hover:bg-primary"
                >
                  Sign In
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </header>

      <Outlet />
    </>
  );
};

export default Layout;
