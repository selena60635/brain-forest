import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Folder from "./pages/Folder";
import Login from "./pages/Login";
import WorkArea from "./pages/WorkArea";
import Page404 from "./pages/Page404";
import "./styles/all.css";
import { AuthContext } from "./context/AuthContext";
import { PrivateRoute } from "./pages/PrivateRoute";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <Page404 />,
      children: [
        { index: true, element: <Home /> },
        {
          path: "folder",
          element: (
            <PrivateRoute>
              <Folder />
            </PrivateRoute>
          ),
        },
        {
          path: "workArea",
          element: <WorkArea />,
        },

        {
          path: "workArea/:id",
          element: (
            <PrivateRoute>
              <WorkArea />
            </PrivateRoute>
          ),
        },

        { path: "login", element: <Login /> },
      ],
    },
  ]);
  return (
    <AuthContext>
      <RouterProvider router={router} />
    </AuthContext>
  );
}
export default App;
