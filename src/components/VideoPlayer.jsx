import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch, SERVER_BASE } from "../lib/api.js";

export default function VideoPlayer({ video, streamUrl }) {
  const { user } = useAuth();
  const ref = useRef(null);
  const lastSavedRef = useRef(0);

  useEffect(() => {
    const videoEl = ref.current;
    if (!videoEl || !video?.progressSeconds) return;

    const onLoaded = () => {
      try {
        videoEl.currentTime = Number(video.progressSeconds || 0);
      } catch (_) {}
    };

    videoEl.addEventListener("loadedmetadata", onLoaded);
    return () => videoEl.removeEventListener("loadedmetadata", onLoaded);
  }, [video?.id]);

  useEffect(() => {
    const videoEl = ref.current;
    if (!videoEl) return;

    async function saveProgress(completed = false) {
      const now = Math.floor(videoEl.currentTime || 0);
      if (!completed && Math.abs(now - lastSavedRef.current) < 5) return;
      lastSavedRef.current = now;

      try {
        await apiFetch(`/videos/${video.id}/progress`, {
          method: "POST",
          body: JSON.stringify({ progressSeconds: now, completed }),
        });
      } catch (_) {}
    }

    const onTimeUpdate = () => saveProgress(false);
    const onEnded = () => saveProgress(true);

    videoEl.addEventListener("timeupdate", onTimeUpdate);
    videoEl.addEventListener("ended", onEnded);

    return () => {
      videoEl.removeEventListener("timeupdate", onTimeUpdate);
      videoEl.removeEventListener("ended", onEnded);
      saveProgress(false);
    };
  }, [video?.id]);

  return (
    <div className="overflow-hidden rounded-[30px] bg-slate-950 shadow-card ring-1 ring-slate-800">
      <div className="relative aspect-video bg-black" onContextMenu={(e) => e.preventDefault()}>
        <video
          ref={ref}
          src={streamUrl ? `${SERVER_BASE}${streamUrl}` : undefined}
          className="h-full w-full"
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          preload="metadata"
        />
        <div className="pointer-events-none absolute right-4 top-4 rounded-2xl bg-black/50 px-4 py-2 text-xs font-extrabold text-white backdrop-blur">
          {user?.fullName} {user?.sibsId ? `| ${user.sibsId}` : ""}
        </div>
        <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl bg-white/90 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#0D4676]">
          SIBS Academy
        </div>
      </div>
    </div>
  );
}
