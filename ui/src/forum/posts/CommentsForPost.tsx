import { HolochainError, Link, SignalCb, SignalType } from "@holochain/client";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import CommentDetail from "./CommentDetail";
import type { PostsSignal } from "./types";

const CommentsForPost: FC<CommentsForPostProps> = ({ postHash }) => {
  const { client } = useContext(ClientContext);
  const [hashes, setHashes] = useState<Uint8Array[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const links: Link[] = await client?.callZome({
        cap_secret: null,
        role_name: "forum",
        zome_name: "posts",
        fn_name: "get_comments_for_post",
        payload: postHash,
      });
      if (links?.length) {
        setHashes(links.map((l) => l.target));
      }
    } catch (e) {
      setError(e as HolochainError);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const handleSignal: SignalCb = useCallback(async (signal) => {
    if (!(SignalType.App in signal)) return;
    if (signal.App.zome_name !== "posts") return;
    const payload = signal.App.payload as PostsSignal;
    if (!(payload.type === "EntryCreated" && payload.app_entry.type === "Comment")) return;
    await fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    fetchComments();
    client?.on("signal", handleSignal);
  }, [client, handleSignal]);

  if (loading) {
    return <progress />;
  }

  return (
    <div>
      {error ? <div className="alert">Error fetching the comments: {error.message}</div> : hashes.length > 0
        ? (
          <div>
            {hashes.map((hash, i) => <CommentDetail key={i} commentHash={hash} onCommentDeleted={fetchComments} />)}
          </div>
        )
        : <div className="alert">No comments found for this post.</div>}
    </div>
  );
};

interface CommentsForPostProps {
  postHash: Uint8Array;
}

export default CommentsForPost;
