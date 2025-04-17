import type { ActionHash, AgentPubKey, AppClient, DnaHash, EntryHash, Record } from "@holochain/client";
import { FC, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import type { Comment } from "./types";

const CreateComment: FC<CreateCommentProps> = ({ onCommentCreated, postHash }) => {
  const { client } = useContext(ClientContext);
  const [content, setContent] = useState<string>("");
  const [isCommentValid, setIsCommentValid] = useState(false);

  const createComment = async () => {
    const commentEntry: Comment = {
      content: content!,
      post_hash: postHash!,
    };
    try {
      const record = await client?.callZome({
        cap_secret: null,
        role_name: "forum",
        zome_name: "posts",
        fn_name: "create_comment",
        payload: commentEntry,
      });
      onCommentCreated && onCommentCreated(record.signed_action.hashed.hash);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsCommentValid(true && content !== "");
  }, [content]);

  return (
    <div>
      <h3>Create Comment</h3>
      <div>
        <label htmlFor="Content">Content</label>
        <textarea name="Content" value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
      </div>

      <button disabled={!isCommentValid} onClick={() => createComment()}>
        Create Comment
      </button>
    </div>
  );
};

interface CreateCommentProps {
  onCommentCreated?: (hash?: Uint8Array) => void;
  postHash: ActionHash;
}

export default CreateComment;
