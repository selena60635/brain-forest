import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./Home";
import Folder from "./Folder";
import Login from "./Login";
import WorkArea from "./WorkArea";
import Page404 from "./Page404";
import "bootstrap/dist/css/bootstrap.min.css";
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
