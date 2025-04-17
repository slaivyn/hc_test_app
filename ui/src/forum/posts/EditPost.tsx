import { HolochainError, Record } from "@holochain/client";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import type { Post } from "./types";

const EditPost: FC<EditPostProps> = ({
  originalPostHash,
  currentRecord,
  currentPost,
  onPostUpdated,
  onPostUpdateError,
  onEditCanceled,
}) => {
  const { client } = useContext(ClientContext);
  const [title, setTitle] = useState<string | undefined>(currentPost?.title);
  const [content, setContent] = useState<string | undefined>(currentPost?.content);
  const [isPostValid, setIsPostValid] = useState(false);

  const updatePost = useCallback(async () => {
    const post: Partial<Post> = {
      title: title,
      content: content,
    };
    try {
      const updateRecord = await client?.callZome({
        cap_secret: null,
        role_name: "forum",
        zome_name: "posts",
        fn_name: "update_post",
        payload: {
          original_post_hash: originalPostHash,
          previous_post_hash: currentRecord?.signed_action.hashed.hash,
          updated_post: post,
        },
      });
      onPostUpdated(updateRecord.signed_action.hashed.hash);
    } catch (e) {
      onPostUpdateError && onPostUpdateError(e as HolochainError);
    }
  }, [
    client,
    currentRecord,
    onPostUpdated,
    onPostUpdateError,
    originalPostHash,
    title,
    content,
  ]);

  useEffect(() => {
    if (!currentRecord) {
      throw new Error(`The currentRecord prop is required`);
    }
    if (!originalPostHash) {
      throw new Error(`The originalPostHash prop is required`);
    }
  }, [currentRecord, originalPostHash]);

  useEffect(() => {
    setIsPostValid(true && title !== "" && content !== "");
  }, [title, content]);

  return (
    <section>
      <div>
        <label htmlFor="Title">Title</label>
        <input type="text" name="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label htmlFor="Content">Content</label>
        <textarea name="Content" value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
      </div>

      <div>
        <button onClick={onEditCanceled}>Cancel</button>
        <button onClick={updatePost} disabled={!isPostValid}>Edit Post</button>
      </div>
    </section>
  );
};

interface EditPostProps {
  originalPostHash: Uint8Array;
  currentRecord: Record | undefined;
  currentPost: Post | undefined;
  onPostUpdated: (hash?: Uint8Array) => void;
  onEditCanceled: () => void;
  onPostUpdateError?: (error: HolochainError) => void;
}

export default EditPost;
