import { HolochainError, Record } from "@holochain/client";
import { decode } from "@msgpack/msgpack";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import EditPost from "./EditPost";
import type { Post } from "./types";
import CreateComment from "./CreateComment";
import CommentsForPost from "./CommentsForPost";
const PostDetail: FC<PostDetailProps> = ({ postHash, onPostDeleted }) => {
  const { client } = useContext(ClientContext);
  const [record, setRecord] = useState<Record | undefined>(undefined);
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setRecord(undefined);
    try {
      const result = await client?.callZome({
        cap_secret: null,
        role_name: "forum",
        zome_name: "posts",
        fn_name: "get_latest_post",
        payload: postHash,
      });
      setRecord(result);
      setLoading(false);
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  }, [client, postHash]);

  useEffect(() => {
    if (!postHash) {
      throw new Error(`The postHash prop is required for this component`);
    }
    fetchPost();
  }, [fetchPost, postHash]);

  useEffect(() => {
    if (!record) return;
    setPost(decode((record.entry as any).Present.entry) as Post);
  }, [record]);

  if (loading) {
    return <progress />;
  }

  if (error) {
    return <div className="alert">Error: {error.message}</div>;
  }

  return (
    <div>
      {editing ? (
        <div>
          <EditPost
            originalPostHash={postHash}
            currentRecord={record}
            currentPost={post}
            onPostUpdated={async () => {
              setEditing(false);
              await fetchPost();
            }}
            onEditCanceled={() => setEditing(false)}
          />
        </div>
      ) : record ? (
        <>
          <section>
            <div>
              <span>
                <strong>Title:</strong>
              </span>
              <span>{post?.title}</span>
            </div>
            <div>
              <span>
                <strong>Content:</strong>
              </span>
              <span>{post?.content}</span>
            </div>
            <div>
              <button onClick={() => setEditing(true)}>edit</button>
            </div>
          </section>

          <CreateComment postHash={postHash} />

          <CommentsForPost postHash={postHash} />
        </>
      ) : (
        <div className="alert">The requested post was not found.</div>
      )}
    </div>
  );
};

interface PostDetailProps {
  postHash: Uint8Array;
  onPostDeleted?: (postHash: Uint8Array) => void;
}

export default PostDetail;
