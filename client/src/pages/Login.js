import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../pages/loading";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { delay } from "../pages/WorkArea";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("demo@gmail.com");
  const [password, setPassword] = useState("000000");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); //是否正在提交表單
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true); //利用是否正在提交表單狀態避免重複提交表單，並且判斷是否載入loading頁面

    try {
      if (isLogin) {
        //若目前表單是登入表單，執行一般登入
        await signInWithEmailAndPassword(auth, email, password);
        // alert("登入成功！");
        await delay(1000);
        navigate("/folder");
      } else {
        //若不是登入表單，執行註冊
        await createUserWithEmailAndPassword(auth, email, password);
        // alert("註冊成功！");
        navigate("/folder");
      }
    } catch (err) {
      setError(
        isLogin ? `登入失敗：${err.message}` : `註冊失敗：${err.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsSubmitting(true);

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // alert("登入成功！");
      await delay(1000);
      navigate("/folder");
    } catch (err) {
      setError(`Google 登入失敗：${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  return (
    <>
      {isSubmitting && <Loading />}
      <section className="bg-light/50">
        <div
          className="flex items-center max-w-screen-xl justify-between mx-auto space-x-12 w-full h-screen"
          style={{
            backgroundImage: "url(/tree.png)",
          }}
        >
          <div className="bg-white rounded-lg p-8 shadow-2xl text-center w-4/6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-secondary text-white p-2 mt-4 flex justify-center rounded-md font-medium text-white hover:bg-primary"
                disabled={isSubmitting}
              >
                {isLogin ? "登入" : "註冊"}
              </button>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <p className="text-sm mt-4">
                {isLogin ? (
                  <>
                    還沒有帳號嗎?{" "}
                    <span
                      onClick={toggleForm}
                      className="text-warning cursor-pointer"
                    >
                      註冊
                    </span>
                  </>
                ) : (
                  <>
                    已經有帳號了?{" "}
                    <span
                      onClick={toggleForm}
                      className="text-warning cursor-pointer"
                    >
                      登入
                    </span>
                  </>
                )}
              </p>
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-secondary text-white p-2 mt-4 flex justify-center items-center rounded-md font-medium text-white hover:bg-primary"
                disabled={isSubmitting}
              >
                {/* <span>Sign in with </span> */}
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="24"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                </svg>
              </button>
            </form>
          </div>
          <div className="border h-full w-full text-2xl font-bold  text-secondary">
            登入以查看更多
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
