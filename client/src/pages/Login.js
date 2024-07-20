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

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("demo@gmail.com");
  const [password, setPassword] = useState("000000");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("登入成功！");
        navigate("/folder");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("註冊成功！");
        navigate("/folder");
      }
    } catch (err) {
      setError(
        isLogin ? `登入失敗：${err.message}` : `註冊失敗：${err.message}`
      );
    }

    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsSubmitting(true);

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert("登入成功！");
      navigate("/folder");
    } catch (err) {
      setError(`Google 登入失敗：${err.message}`);
    }

    setIsSubmitting(false);
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
                className="w-full bg-secondary text-white p-2 mt-4 flex justify-center rounded-md font-medium text-white hover:bg-primary"
                disabled={isSubmitting}
              >
                使用
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="40"
                  height="40"
                  viewBox="0 0 100 100"
                >
                  <path
                    fill="#f9e65c"
                    d="M84.467,44H50v13h20.856C67.931,65.717,59.702,72,50,72c-12.15,0-22-9.85-22-22s9.85-22,22-22	c4.799,0,9.235,1.541,12.851,4.149l9.269-9.269C66.091,17.956,58.391,15,50,15c-19.33,0-35,15.67-35,35s15.67,35,35,35	s35-15.67,35-35C85,47.952,84.806,45.951,84.467,44z"
                  ></path>
                  <path
                    fill="#78a2d2"
                    d="M50,57h20.856c-1.577,4.699-4.704,8.679-8.763,11.36l9.87,8.884C79.911,70.828,85,61.01,85,50	c0-2.048-0.194-4.049-0.533-6H50V57z"
                  ></path>
                  <path
                    fill="#60be92"
                    d="M62.093,68.36C58.622,70.653,54.472,72,50,72c-8.997,0-16.727-5.403-20.137-13.139L18.818,65.89	C24.609,77.23,36.393,85,50,85c8.32,0,15.957-2.908,21.963-7.756L62.093,68.36z"
                  ></path>
                  <path
                    fill="#f15b6c"
                    d="M29.677,41.569C32.985,33.603,40.837,28,50,28c4.799,0,9.235,1.541,12.851,4.149l9.269-9.269	C66.091,17.956,58.391,15,50,15c-13.772,0-25.681,7.958-31.394,19.524L29.677,41.569z"
                  ></path>
                  <path
                    fill="#1f212b"
                    d="M50,86c-19.851,0-36-16.149-36-36s16.149-36,36-36c8.271,0,16.353,2.878,22.753,8.105	c0.219,0.179,0.352,0.442,0.366,0.724c0.014,0.282-0.092,0.558-0.292,0.757l-9.269,9.269c-0.347,0.347-0.895,0.391-1.292,0.104	C58.675,30.369,54.433,29,50,29c-11.579,0-21,9.42-21,21s9.421,21,21,21c8.563,0,16.196-5.168,19.417-13H50c-0.553,0-1-0.448-1-1V44	c0-0.552,0.447-1,1-1h34.467c0.486,0,0.902,0.35,0.985,0.829C85.815,45.922,86,47.999,86,50C86,69.851,69.851,86,50,86z M50,16	c-18.748,0-34,15.252-34,34s15.252,34,34,34s34-15.252,34-34c0-1.624-0.129-3.302-0.384-5H51v11h19.856	c0.322,0,0.624,0.155,0.812,0.416c0.188,0.261,0.239,0.597,0.137,0.902C68.657,66.698,59.895,73,50,73c-12.683,0-23-10.318-23-23	s10.317-23,23-23c4.569,0,8.954,1.329,12.735,3.851l7.883-7.883C64.72,18.467,57.442,16,50,16z"
                  ></path>
                  <path
                    fill="#1f212b"
                    d="M71.5,78c-0.119,0-0.239-0.042-0.335-0.128l-4-3.6c-0.205-0.185-0.222-0.501-0.037-0.706	c0.187-0.205,0.502-0.221,0.707-0.037l4,3.6c0.205,0.185,0.222,0.501,0.037,0.706C71.772,77.944,71.637,78,71.5,78z"
                  ></path>
                  <path
                    fill="#1f212b"
                    d="M65.5,72.6c-0.119,0-0.239-0.042-0.335-0.128l-1.777-1.6c-0.205-0.185-0.222-0.501-0.037-0.706	c0.187-0.205,0.502-0.221,0.707-0.037l1.777,1.6c0.205,0.185,0.222,0.501,0.037,0.706C65.772,72.544,65.637,72.6,65.5,72.6z"
                  ></path>
                  <path
                    fill="#1f212b"
                    d="M27.929,60c-0.165,0-0.326-0.082-0.422-0.231c-0.148-0.233-0.079-0.542,0.153-0.69l1.571-1	c0.231-0.146,0.541-0.08,0.69,0.153c0.148,0.233,0.079,0.542-0.153,0.69l-1.571,1C28.114,59.975,28.021,60,27.929,60z"
                  ></path>
                  <path
                    fill="#1f212b"
                    d="M23.5,62.818c-0.165,0-0.326-0.082-0.422-0.231c-0.148-0.233-0.079-0.542,0.153-0.69l2-1.273	c0.231-0.146,0.541-0.081,0.69,0.153c0.148,0.233,0.079,0.542-0.153,0.69l-2,1.273C23.686,62.793,23.593,62.818,23.5,62.818z"
                  ></path>
                  <path
                    fill="#1f212b"
                    d="M18.5,66c-0.165,0-0.326-0.082-0.422-0.231c-0.148-0.233-0.079-0.542,0.153-0.69l3-1.909	c0.23-0.146,0.541-0.08,0.69,0.153c0.148,0.233,0.079,0.542-0.153,0.69l-3,1.909C18.686,65.975,18.593,66,18.5,66z"
                  ></path>
                  <path
                    fill="#1f212b"
                    d="M24.5,38.182c-0.093,0-0.186-0.025-0.269-0.078l-5-3.182c-0.232-0.148-0.302-0.458-0.153-0.69	c0.149-0.233,0.46-0.299,0.69-0.153l5,3.182c0.232,0.148,0.302,0.458,0.153,0.69C24.826,38.1,24.665,38.182,24.5,38.182z"
                  ></path>
                  <path
                    fill="#1f212b"
                    d="M27.5,40.091c-0.093,0-0.186-0.025-0.269-0.078l-1-0.636c-0.232-0.148-0.302-0.458-0.153-0.69	c0.15-0.233,0.46-0.299,0.69-0.153l1,0.636c0.232,0.148,0.302,0.458,0.153,0.69C27.826,40.009,27.665,40.091,27.5,40.091z"
                  ></path>
                </svg>
                登入
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
