import React, { useEffect, useState } from "react";
import "./Signup.css";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import { ChatState } from "../../context/chatProvider";

const Signup = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { setSelectedChat } = ChatState();

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {}, [loading]);

  const registerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (
      !signupName ||
      !signupEmail ||
      !signupPassword ||
      !signupConfirmPassword
    ) {
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
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setLoading(false);
      return;
    }
    const formData = new FormData();

    formData.append("name", signupName);
    formData.append("email", signupEmail);
    formData.append("password", signupPassword);
    formData.append("photo", avatar);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await axios.post("/api/v1/signup", formData, config);
      setLoading(false);
      setSelectedChat("");
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
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

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <form className="signupForm" onSubmit={registerSubmit}>
            <div className="signupName">
              <span>
                Name<span style={{ color: "rgb(249, 82, 82)" }}>*</span>
              </span>
              <input
                type="text"
                placeholder="Enter Your Name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
              />
            </div>
            <div className="signupEmail">
              <span>
                Email<span style={{ color: "rgb(249, 82, 82)" }}>*</span>
              </span>
              <input
                type="email"
                placeholder="Enter Your Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
            </div>
            <div className="signupPassword">
              <span>
                Password<span style={{ color: "rgb(249, 82, 82)" }}>*</span>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
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
            <div className="signupPassword">
              <span>
                Confirm Password
                <span style={{ color: "rgb(249, 82, 82)" }}>*</span>
              </span>
              <input
                type="password"
                placeholder="Confirm Your Password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
              />
            </div>
            <div className="signupAvatar">
              <span>Upload Profile Pic</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
            </div>
            <input type="submit" value="Signup" className="loginBtn" />
          </form>
        </>
      )}
    </>
  );
};

export default Signup;
