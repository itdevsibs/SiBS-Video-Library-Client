import { Search, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch, assetUrl } from "../lib/api.js";

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "General", status: "published" });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  async function load() {
    try {
      const data = await apiFetch(`/admin/videos?search=${encodeURIComponent(search)}`);
      setVideos(data.videos || []);
    } catch (err) {
      setError(err.message || "Failed to load videos.");
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search]);

  async function upload(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("category", form.category);
      data.append("status", form.status);
      data.append("video", videoFile);
      if (thumbnailFile) data.append("thumbnail", thumbnailFile);

      await apiFetch("/admin/videos/upload", {
        method: "POST",
        body: data,
      });

      setMessage("Video uploaded successfully.");
      setForm({ title: "", description: "", category: "General", status: "published" });
      setVideoFile(null);
      setThumbnailFile(null);
      e.target.reset();
      await load();
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  async function updateVideo(id, changes) {
    try {
      await apiFetch(`/admin/videos/${id}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      await load();
    } catch (err) {
      setError(err.message || "Failed to update video.");
    }
  }

  async function deleteVideo(id) {
    if (!confirm("Delete this video? This will remove the uploaded file.")) return;
    try {
      await apiFetch(`/admin/videos/${id}`, { method: "DELETE" });
      setMessage("Video deleted.");
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete video.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5C28]">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#FF5C28]">Admin</p>
            <h2 className="text-2xl font-extrabold text-[#0D4676]">Upload Video</h2>
          </div>
        </div>

        {message && <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{message}</div>}
        {error && <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

        <form onSubmit={upload} className="grid gap-4 lg:grid-cols-4">
          <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
          <Input label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["published", "draft", "archived"]} />
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">Video File</span>
            <input required type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold file:mr-3 file:rounded-xl file:border-0 file:bg-[#0D4676] file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" />
          </label>
          <label className="block lg:col-span-3">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">Description</span>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0D4676]" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold text-slate-700">Thumbnail</span>
            <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold file:mr-3 file:rounded-xl file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-700" />
          </label>
          <div className="lg:col-span-4">
            <button disabled={loading} className="rounded-2xl bg-[#FF5C28] px-6 py-3 text-sm font-extrabold text-white hover:bg-orange-600 disabled:opacity-60">
              {loading ? "Uploading..." : "Upload Video"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#0D4676]">Manage Videos</h2>
            <p className="text-sm font-semibold text-slate-500">Publish, draft, archive, or remove uploaded videos.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:w-96">
            <Search className="h-5 w-5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search videos..." className="w-full bg-transparent text-sm font-semibold outline-none" />
          </div>
        </div>

        <div className="grid gap-4">
          {videos.map((video) => (
            <div key={video.id} className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[180px_1fr_auto] lg:items-center">
              <div className="aspect-video overflow-hidden rounded-2xl bg-[#0D4676]">
                {video.thumbnailUrl ? <img src={assetUrl(video.thumbnailUrl)} className="h-full w-full object-cover" alt="" /> : null}
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900">{video.title}</p>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-500">{video.description || "No description."}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#0D4676] ring-1 ring-slate-200">{video.category || "General"}</span>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-extrabold text-[#FF5C28]">{video.status}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">Uploaded by {video.uploaderName || "—"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <select value={video.status} onChange={(e) => updateVideo(video.id, { status: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none">
                  <option value="published">published</option>
                  <option value="draft">draft</option>
                  <option value="archived">archived</option>
                </select>
                <button onClick={() => deleteVideo(video.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
          {!videos.length && <div className="py-10 text-center font-bold text-slate-400">No videos uploaded.</div>}
        </div>
      </section>
    </div>
  );
}

function Input({ label, value, onChange, required = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      <input required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0D4676]" />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0D4676]">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
