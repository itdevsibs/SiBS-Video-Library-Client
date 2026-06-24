import { PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { assetUrl } from "../lib/api.js";

export default function VideoCard({ video }) {
  const progress = Number(video.progressSeconds || 0);

  return (
    <Link
      to={`/videos/${video.id}`}
      className="group overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#0D4676] to-slate-900">
        {video.thumbnailUrl ? (
          <img src={assetUrl(video.thumbnailUrl)} alt={video.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white">
            <PlayCircle className="h-16 w-16 opacity-80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-[#0D4676]">
            {video.category || "General"}
          </span>
          <span className="rounded-full bg-[#FF5C28] px-3 py-1 text-xs font-extrabold text-white">
            Watch
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-base font-extrabold text-slate-900">{video.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-500">{video.description || "No description provided."}</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-[#FF5C28]" style={{ width: video.completed ? "100%" : progress > 0 ? "35%" : "0%" }} />
        </div>
        <p className="mt-2 text-xs font-bold text-slate-400">
          {video.completed ? "Completed" : progress > 0 ? "Started" : "Not started"}
        </p>
      </div>
    </Link>
  );
}
