import { HolochainError, Link, SignalCb, SignalType } from "@holochain/client";
import { FC, useCallback, useContext, useEffect, useState } from "react";

import { ClientContext } from "../../ClientContext";
import PostDetail from "./PostDetail";
import type { PostsSignal } from "./types";

const AllPosts: FC = () => {
  const { client } = useContext(ClientContext);
  const [hashes, setHashes] = useState<Uint8Array[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HolochainError | undefined>();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const links: Link[] = await client?.callZome({
        cap_secret: null,
        role_name: "forum",
        zome_name: "posts",
        fn_name: "get_all_posts",
        payload: null,
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

  const handleSignal: SignalCb = useCallback((signal) => {
    if (!(SignalType.App in signal)) return;
    if (signal.App.zome_name !== "posts") return;
    const payload = signal.App.payload as PostsSignal;
    if (payload.type !== "EntryCreated") return;
    if (payload.app_entry.type !== "Post") return;
    setHashes((prevHashes) => [...prevHashes, payload.action.hashed.hash]);
  }, [setHashes]);

  useEffect(() => {
    fetchPosts();
    client?.on("signal", handleSignal);
  }, [client, handleSignal, fetchPosts]);

  if (loading) {
    return <progress />;
  }

  return (
    <div>
      {error ? <div className="alert">Error fetching the posts: {error.message}</div> : hashes.length > 0
        ? (
          <div>
            {hashes.map((hash, i) => <PostDetail key={i} postHash={hash} onPostDeleted={fetchPosts} />)}
          </div>
        )
        : <div className="alert">No posts found.</div>}
    </div>
  );
};

export default AllPosts;
