import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Chats from "./components/Chat/ChatPage";
import Home from "./components/Home/Home";

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/chats" element={<Chats />} />
      </Routes>
    </div>
  );
};

export default App;
