import { useContext } from "react";

import "./app.css";
import holochainLogo from "./assets/holochainLogo.svg";
import { ClientContext } from "./ClientContext";
import AllPosts from "./forum/posts/AllPosts";
import CreatePost from "./forum/posts/CreatePost";

const App = () => {
  const { error, loading } = useContext(ClientContext);
  return (
    <>
      <div>
        <a href="https://developer.holochain.org/get-started/" target="_blank">
          <img
            src={holochainLogo}
            className="logo holochain"
            alt="holochain logo"
          />
        </a>
      </div>
      <h1>My forum hApp</h1>
      <div>
        <div className="card">
          {loading
            ? "connecting..."
            : error
            ? error.message
            : "Client is connected."}
        </div>

        <CreatePost />

        <AllPosts />
      </div>
    </>
  );
};

export default App;
