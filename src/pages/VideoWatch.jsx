import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { apiFetch } from "../lib/api.js";

export default function VideoWatch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [videoData, tokenData] = await Promise.all([
          apiFetch(`/videos/${id}`),
          apiFetch(`/videos/${id}/play-token`),
        ]);
        if (!alive) return;
        setVideo(videoData.video);
        setStreamUrl(tokenData.streamUrl);
      } catch (err) {
        if (!alive) return;
        setError(err.message || "Failed to load video.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [id]);

  if (loading) {
    return <div className="rounded-[30px] bg-white p-8 text-center font-bold text-slate-500 ring-1 ring-slate-200">Loading video...</div>;
  }

  if (error) {
    return <div className="rounded-[30px] bg-red-50 p-8 text-center font-bold text-red-700 ring-1 ring-red-100">{error}</div>;
  }

  return (
    <div className="space-y-5">
      <Link to="/videos" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-[#0D4676] shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
        <ArrowLeft className="h-4 w-4" />
        Back to videos
      </Link>

      <VideoPlayer video={video} streamUrl={streamUrl} />

      <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#FF5C28]">{video?.category || "General"}</p>
        <h2 className="mt-2 text-2xl font-extrabold text-[#0D4676]">{video?.title}</h2>
        <p className="mt-3 whitespace-pre-line text-sm font-medium leading-7 text-slate-600">{video?.description || "No description provided."}</p>
      </section>
    </div>
  );
}
