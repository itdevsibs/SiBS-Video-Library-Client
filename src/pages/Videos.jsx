import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard.jsx";
import { apiFetch } from "../lib/api.js";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/videos?search=${encodeURIComponent(search)}`);
      setVideos(data.videos || []);
    } catch (err) {
      setError(err.message || "Failed to load videos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[30px] bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#FF5C28]">Video Library</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#0D4676]">Available Training Videos</h2>
        </div>
        <div className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:w-96">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="w-full bg-transparent text-sm font-semibold outline-none"
          />
        </div>
      </section>

      {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-[30px] bg-white p-8 text-center font-bold text-slate-500 ring-1 ring-slate-200">Loading videos...</div>
      ) : videos.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => <VideoCard key={video.id} video={video} />)}
        </div>
      ) : (
        <div className="rounded-[30px] bg-white p-10 text-center ring-1 ring-slate-200">
          <p className="text-lg font-extrabold text-slate-700">No videos found</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">Ask your admin to upload or publish training videos.</p>
        </div>
      )}
    </div>
  );
}
