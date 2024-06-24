import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Folder from "./pages/Folder";
import Login from "./pages/Login";
import WorkArea from "./pages/WorkArea";
import Page404 from "./pages/Page404";
import "./styles/all.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />}></Route>
          <Route path="folder" element={<Folder />}></Route>
          <Route path="login" element={<Login />}></Route>
          <Route path="workArea" element={<WorkArea />} />
          <Route path="*" element={<Page404 />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
