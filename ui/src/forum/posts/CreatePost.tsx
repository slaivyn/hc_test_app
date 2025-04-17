import type { ActionHash, AgentPubKey, AppClient, DnaHash, EntryHash, Record } from "@holochain/client";
import { FC, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import type { Post } from "./types";

const CreatePost: FC<CreatePostProps> = ({ onPostCreated }) => {
  const { client } = useContext(ClientContext);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isPostValid, setIsPostValid] = useState(false);

  const createPost = async () => {
    const postEntry: Post = {
      title: title!,
      content: content!,
    };
    try {
      const record = await client?.callZome({
        cap_secret: null,
        role_name: "forum",
        zome_name: "posts",
        fn_name: "create_post",
        payload: postEntry,
      });
      onPostCreated && onPostCreated(record.signed_action.hashed.hash);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsPostValid(true && title !== "" && content !== "");
  }, [title, content]);

  return (
    <div>
      <h3>Create Post</h3>
      <div>
        <label htmlFor="Title">Title</label>
        <input type="text" name="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label htmlFor="Content">Content</label>
        <textarea name="Content" value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
      </div>

      <button disabled={!isPostValid} onClick={() => createPost()}>
        Create Post
      </button>
    </div>
  );
};

interface CreatePostProps {
  onPostCreated?: (hash?: Uint8Array) => void;
}

export default CreatePost;
