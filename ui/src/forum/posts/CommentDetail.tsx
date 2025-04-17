import { HolochainError, Record } from "@holochain/client";
import { decode } from "@msgpack/msgpack";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import type { Comment } from "./types";

const CommentDetail: FC<CommentDetailProps> = ({ commentHash, onCommentDeleted }) => {
  const { client } = useContext(ClientContext);
  const [record, setRecord] = useState<Record | undefined>(undefined);
  const [comment, setComment] = useState<Comment | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();

  const fetchComment = useCallback(async () => {
    setLoading(true);
    setRecord(undefined);
    try {
      const result = await client?.callZome({
        cap_secret: null,
        role_name: "forum",
        zome_name: "posts",
        fn_name: "get_comment",
        payload: commentHash,
      });
      setRecord(result);
      setLoading(false);
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  }, [client, commentHash]);

  const deleteComment = async () => {
    setLoading(true);
    try {
      await client?.callZome({
        cap_secret: null,
        role_name: "forum",
        zome_name: "posts",
        fn_name: "delete_comment",
        payload: commentHash,
      });
      onCommentDeleted && onCommentDeleted(commentHash);
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!commentHash) {
      throw new Error(`The commentHash prop is required for this component`);
    }
    fetchComment();
  }, [fetchComment, commentHash]);

  useEffect(() => {
    if (!record) return;
    setComment(decode((record.entry as any).Present.entry) as Comment);
  }, [record]);

  if (loading) {
    return <progress />;
  }

  if (error) {
    return <div className="alert">Error: {error.message}</div>;
  }

  return (
    <div>
      {record
        ? (
          <section>
            <div>
              <span>
                <strong>Content:</strong>
              </span>
              <span>{comment?.content}</span>
            </div>
            <div>
              <button onClick={deleteComment}>delete</button>
            </div>
          </section>
        )
        : <div className="alert">The requested comment was not found.</div>}
    </div>
  );
};

interface CommentDetailProps {
  commentHash: Uint8Array;
  onCommentDeleted?: (commentHash: Uint8Array) => void;
}

export default CommentDetail;
