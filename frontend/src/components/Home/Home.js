import React, { useEffect, useState } from "react";
import "./Home.css";
import Login from "../Login/Login";
import Signup from "../Signup/Signup";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [activeLink, setActiveLink] = useState("login");
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <>
      <div className="home-container">
        <div className="home-heading">
          <h1>Chatter Box</h1>
        </div>
        <div className="home-content">
          <div className="home-tabs">
            <span
              className={activeLink === "login" ? "tab active-tab" : "tab"}
              onClick={() => {
                setActiveLink("login");
              }}
            >
              Login
            </span>
            <span
              className={activeLink === "signup" ? "tab active-tab" : "tab"}
              onClick={() => {
                setActiveLink("signup");
              }}
            >
              Signup
            </span>
          </div>
          <div>{activeLink === "login" ? <Login /> : <Signup />}</div>
        </div>
      </div>
    </>
  );
};

export default Home;
