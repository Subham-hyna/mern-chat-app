import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/toast";
import Loader from "../Loader/Loader";
import { ChatState } from "../../context/chatProvider";

const Signup = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { setSelectedChat } = ChatState();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("email", loginEmail);
    formData.append("password", loginPassword);

    try {
      const config = { headers: { "Content-Type": "application/json" } };
      const { data } = await axios.post("/api/v1/login", formData, config);
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setSelectedChat("");
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setLoading(false);
    }
  };

  // const guestHandler = () => {
  //   setLoginEmail("guest@gmail.com")
  //   setLoginPassword("12345678")
  // };


  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <form className="loginForm" onSubmit={loginSubmit}>
            <div className="loginEmail">
              <span>
                Email<span style={{ color: "rgb(249, 82, 82)" }}>*</span>
              </span>
              <input
                type="email"
                placeholder="Enter Your Email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="loginPassword">
              <span>
                Password<span style={{ color: "rgb(249, 82, 82)" }}>*</span>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <div
                className="pass-toggle"
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </div>
            </div>
            <input
              type="submit"
              placeholder="Login"
              className="loginBtn"
              value="Login"
            />
            {/* <button className="guestLoginBtn" onClick={guestHandler} >Get Guest Credentials</button> */}
          </form>
        </>
      )}
    </>
  );
};

export default Signup;
