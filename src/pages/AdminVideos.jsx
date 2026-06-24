import {
  AlertTriangle,
  CheckCircle2,
  Film,
  Loader2,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  API_BASE,
  apiFetch,
  assetUrl,
  getDeviceId,
  getToken,
} from "../lib/api.js";

const emptyForm = {
  title: "",
  description: "",
  category: "General",
  status: "published",
  video: null,
  thumbnail: null,
};

function uploadVideoWithProgress(formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${API_BASE}/admin/videos/upload`);
    xhr.withCredentials = true;

    const token = getToken();

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.setRequestHeader("X-Device-Id", getDeviceId());

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;

      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(Math.min(percent, 100));
    };

    xhr.onload = () => {
      let data = null;

      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = xhr.responseText;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve(data);
        return;
      }

      const message =
        typeof data === "string"
          ? data
          : data?.message || "Failed to upload video.";

      reject(new Error(message));
    };

    xhr.onerror = () => {
      reject(new Error("Network error while uploading video."));
    };

    xhr.onabort = () => {
      reject(new Error("Upload was cancelled."));
    };

    xhr.send(formData);
  });
}

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingVideos, setLoadingVideos] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const [updatingVideoId, setUpdatingVideoId] = useState(null);
  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const [deletingVideoInfo, setDeletingVideoInfo] = useState(null);
  const [deleteConfirmVideo, setDeleteConfirmVideo] = useState(null);

  async function loadVideos() {
    setLoadingVideos(true);
    setError("");

    try {
      const data = await apiFetch(
        `/admin/videos?search=${encodeURIComponent(search)}`,
      );

      const rawVideos = Array.isArray(data.videos) ? data.videos : [];

      const uniqueVideos = Array.from(
        new Map(rawVideos.map((video) => [String(video.id), video])).values(),
      );

      setVideos(uniqueVideos);
    } catch (err) {
      setError(err.message || "Failed to load videos.");
    } finally {
      setLoadingVideos(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadVideos, 250);
    return () => clearTimeout(timer);
  }, [search]);

  function updateForm(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function clearFileInputs() {
    const videoInput = document.getElementById("video-file-input");
    const thumbnailInput = document.getElementById("thumbnail-file-input");

    if (videoInput) videoInput.value = "";
    if (thumbnailInput) thumbnailInput.value = "";
  }

  async function uploadVideo(e) {
    e.preventDefault();

    if (uploading || deletingVideoId) return;

    setError("");
    setMessage("");
    setUploadSuccess(null);

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!form.video) {
      setError("Video file is required.");
      return;
    }

    const uploadedVideoInfo = {
      title: form.title.trim(),
      fileName: form.video.name,
      category: form.category || "General",
      status: form.status || "published",
    };

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("category", form.category || "General");
      formData.append("status", form.status || "published");
      formData.append("video", form.video);

      if (form.thumbnail) {
        formData.append("thumbnail", form.thumbnail);
      }

      await uploadVideoWithProgress(formData, setUploadProgress);

      setForm(emptyForm);
      clearFileInputs();

      await loadVideos();

      setUploadSuccess(uploadedVideoInfo);
    } catch (err) {
      setError(err.message || "Failed to upload video.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function updateVideoStatus(videoId, status) {
    if (updatingVideoId || uploading || deletingVideoId) return;

    setError("");
    setMessage("");
    setUpdatingVideoId(videoId);

    try {
      await apiFetch(`/admin/videos/${videoId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMessage("Video status updated.");
      await loadVideos();
    } catch (err) {
      setError(err.message || "Failed to update video status.");
    } finally {
      setUpdatingVideoId(null);
    }
  }

  function openDeleteModal(video) {
    if (deletingVideoId || uploading) return;
    setDeleteConfirmVideo(video);
  }

  function closeDeleteModal() {
    if (deletingVideoId) return;
    setDeleteConfirmVideo(null);
  }

  async function confirmDeleteVideo() {
    if (!deleteConfirmVideo || deletingVideoId || uploading) return;

    const video = deleteConfirmVideo;

    setError("");
    setMessage("");
    setDeleteConfirmVideo(null);
    setDeletingVideoId(video.id);
    setDeletingVideoInfo({
      title: video.title,
      fileName: video.originalFilename || video.filename || "Video file",
    });

    try {
      await apiFetch(`/admin/videos/${video.id}`, {
        method: "DELETE",
      });

      setMessage("Video and file deleted successfully.");
      await loadVideos();
    } catch (err) {
      setError(err.message || "Failed to delete video.");
    } finally {
      setTimeout(() => {
        setDeletingVideoId(null);
        setDeletingVideoInfo(null);
      }, 500);
    }
  }

  return (
    <div className="space-y-6">
      <style>
        {`
          @keyframes sibsRunningLine {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(260%);
            }
          }

          .sibs-running-line {
            animation: sibsRunningLine 1.1s linear infinite;
          }
        `}
      </style>

      {uploadSuccess && (
        <UploadSuccessModal
          upload={uploadSuccess}
          onClose={() => setUploadSuccess(null)}
        />
      )}

      {deleteConfirmVideo && (
        <DeleteConfirmModal
          video={deleteConfirmVideo}
          onCancel={closeDeleteModal}
          onConfirm={confirmDeleteVideo}
        />
      )}

      {deletingVideoInfo && <DeleteLoadingModal deleteInfo={deletingVideoInfo} />}

      <section className="relative rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {uploading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[30px] bg-white/85 backdrop-blur-sm">
            <div className="w-[380px] rounded-3xl bg-white p-6 text-center shadow-xl ring-1 ring-slate-200">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5C28]">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-[#0D4676]">
                Uploading video...
              </h3>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                Please wait. Large videos may take a few minutes.
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                  Progress
                </span>
                <span className="text-sm font-extrabold text-[#FF5C28]">
                  {uploadProgress}%
                </span>
              </div>

              <ProgressBar percent={uploadProgress} />

              <p className="mt-3 text-xs font-bold text-slate-400">
                {uploadProgress >= 100
                  ? "Finalizing upload..."
                  : "Uploading to server..."}
              </p>
            </div>
          </div>
        )}

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5C28]">
            <UploadCloud className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#FF5C28]">
              Admin
            </p>
            <h2 className="text-2xl font-extrabold text-[#0D4676]">
              Upload Video
            </h2>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={uploadVideo} className="grid gap-4 lg:grid-cols-4">
          <Input
            label="Title"
            value={form.title}
            disabled={uploading || Boolean(deletingVideoId)}
            onChange={(value) => updateForm("title", value)}
            required
          />

          <Input
            label="Category"
            value={form.category}
            disabled={uploading || Boolean(deletingVideoId)}
            onChange={(value) => updateForm("category", value)}
          />

          <Select
            label="Status"
            value={form.status}
            disabled={uploading || Boolean(deletingVideoId)}
            onChange={(value) => updateForm("status", value)}
            options={["published", "draft", "archived"]}
          />

          <FileInput
            id="video-file-input"
            label="Video File"
            accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,video/mpeg,.mp4,.m4v,.webm,.mov,.mkv,.avi,.mpeg,.mpg"
            disabled={uploading || Boolean(deletingVideoId)}
            file={form.video}
            onChange={(file) => updateForm("video", file)}
            required
          />

          <div className="lg:col-span-3">
            <TextArea
              label="Description"
              value={form.description}
              disabled={uploading || Boolean(deletingVideoId)}
              onChange={(value) => updateForm("description", value)}
            />
          </div>

          <FileInput
            id="thumbnail-file-input"
            label="Thumbnail"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            disabled={uploading || Boolean(deletingVideoId)}
            file={form.thumbnail}
            onChange={(file) => updateForm("thumbnail", file)}
          />

          {uploading && (
            <div className="lg:col-span-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">
                  Uploading
                </span>
                <span className="text-sm font-extrabold text-[#FF5C28]">
                  {uploadProgress}%
                </span>
              </div>

              <ProgressBar percent={uploadProgress} />
            </div>
          )}

          <div className="flex items-end">
            <button
              type="submit"
              disabled={uploading || Boolean(deletingVideoId)}
              className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-2xl bg-[#FF5C28] px-5 py-3 text-sm font-extrabold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadProgress}%
                </>
              ) : (
                "Upload Video"
              )}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#0D4676]">
              Manage Videos
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              Publish, draft, archive, or remove uploaded videos.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:w-96">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={search}
              disabled={Boolean(deletingVideoId)}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos..."
              className="w-full bg-transparent text-sm font-semibold outline-none disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {loadingVideos ? (
          <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-8 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#0D4676]" />
            <p className="mt-3 text-sm font-bold text-slate-500">
              Loading videos...
            </p>
          </div>
        ) : videos.length ? (
          <div className="space-y-4">
            {videos.map((video) => (
              <VideoRow
                key={video.id}
                video={video}
                updating={updatingVideoId === video.id}
                deleting={deletingVideoId === video.id}
                disableActions={Boolean(deletingVideoId) || uploading}
                onStatusChange={(status) =>
                  updateVideoStatus(video.id, status)
                }
                onDelete={() => openDeleteModal(video)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-8 text-center">
            <Film className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-400">
              No videos uploaded.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function DeleteConfirmModal({ video, onCancel, onConfirm }) {
  const fileName = video.originalFilename || video.filename || "Video file";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[30px] bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-500">
                Confirm Delete
              </p>
              <h3 className="text-xl font-extrabold text-[#0D4676]">
                Delete this video?
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-sm font-semibold leading-6 text-slate-600">
            This action will delete the video record and also remove the video
            file from the file server. This cannot be undone.
          </p>

          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
              Video Title
            </p>
            <p className="mt-1 break-words text-sm font-extrabold text-slate-900">
              {video.title}
            </p>

            <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">
              File Name
            </p>
            <p className="mt-1 break-words text-sm font-bold text-slate-700">
              {fileName}
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            Are you sure you want to continue?
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete Video
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteLoadingModal({ deleteInfo }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[30px] bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="px-6 py-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>

          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-red-500">
            Deleting Video
          </p>

          <h3 className="mt-2 text-xl font-extrabold text-[#0D4676]">
            Removing video and file...
          </h3>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            Please wait while the video record and file server copy are being
            deleted.
          </p>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-100">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
              Video Title
            </p>
            <p className="mt-1 break-words text-sm font-extrabold text-slate-900">
              {deleteInfo.title}
            </p>

            <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-slate-400">
              File Name
            </p>
            <p className="mt-1 break-words text-sm font-bold text-slate-700">
              {deleteInfo.fileName}
            </p>
          </div>

          <div className="mt-5">
            <IndeterminateProgressBar />
          </div>

          <p className="mt-3 text-xs font-bold text-slate-400">
            Do not close or refresh this page.
          </p>
        </div>
      </div>
    </div>
  );
}

function UploadSuccessModal({ upload, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[30px] bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-green-600">
                Upload Complete
              </p>
              <h3 className="text-xl font-extrabold text-[#0D4676]">
                File uploaded successfully
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
              Video Title
            </p>
            <p className="mt-1 break-words text-sm font-extrabold text-slate-900">
              {upload.title}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
              File Name
            </p>
            <p className="mt-1 break-words text-sm font-bold text-slate-700">
              {upload.fileName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-orange-50 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#FF5C28]">
                Category
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {upload.category}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#0D4676]">
                Status
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {upload.status}
              </p>
            </div>
          </div>

          <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            The video is now saved and available in Manage Videos.
          </p>
        </div>

        <div className="flex justify-end gap-3 bg-slate-50 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-[#FF5C28] px-5 py-3 text-sm font-extrabold text-white hover:bg-orange-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ percent }) {
  const safePercent = Math.max(0, Math.min(Number(percent) || 0, 100));

  return (
    <div className="mt-2 overflow-hidden rounded-full bg-slate-100">
      <div className="relative h-3 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-[#FF5C28] transition-all duration-300"
          style={{ width: `${safePercent}%` }}
        />

        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="sibs-running-line h-full w-1/3 bg-white/45 blur-[1px]" />
        </div>
      </div>
    </div>
  );
}

function IndeterminateProgressBar() {
  return (
    <div className="overflow-hidden rounded-full bg-slate-100">
      <div className="relative h-3 overflow-hidden rounded-full">
        <div className="absolute inset-0 bg-red-100" />
        <div className="sibs-running-line h-full w-1/3 rounded-full bg-red-500 shadow-sm" />
      </div>
    </div>
  );
}

function VideoRow({
  video,
  updating,
  deleting,
  disableActions,
  onStatusChange,
  onDelete,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center">
      <div className="h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-[#0D4676] lg:w-52">
        {video.thumbnailUrl ? (
          <img
            src={assetUrl(video.thumbnailUrl)}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-lg font-extrabold text-slate-950">
          {video.title}
        </h3>

        <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-500">
          {video.description || "No description."}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <Capsule>{video.category || "General"}</Capsule>
          <Capsule tone="orange">{video.status}</Capsule>
          {video.uploaderName && (
            <Capsule>Uploaded by {video.uploaderName}</Capsule>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <select
          value={video.status}
          disabled={updating || deleting || disableActions}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="published">published</option>
          <option value="draft">draft</option>
          <option value="archived">archived</option>
        </select>

        <button
          type="button"
          disabled={deleting || updating || disableActions}
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-600 hover:border-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">
        {label}
      </span>

      <input
        required={required}
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0D4676] disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, disabled = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">
        {label}
      </span>

      <textarea
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0D4676] disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function Select({ label, value, onChange, options, disabled = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">
        {label}
      </span>

      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#0D4676] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FileInput({
  id,
  label,
  accept,
  file,
  onChange,
  required = false,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">
        {label}
      </span>

      <div className="flex min-h-[50px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
        <input
          id={id}
          required={required}
          disabled={disabled}
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="w-full text-sm font-semibold file:mr-4 file:rounded-xl file:border-0 file:bg-[#0D4676] file:px-4 file:py-2 file:text-sm file:font-extrabold file:text-white disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {file && (
        <p className="mt-1 truncate text-xs font-semibold text-slate-400">
          {file.name}
        </p>
      )}
    </label>
  );
}

function Capsule({ children, tone = "blue" }) {
  const style =
    tone === "orange"
      ? "bg-orange-50 text-[#FF5C28]"
      : "bg-white text-[#0D4676] ring-1 ring-slate-200";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${style}`}>
      {children}
    </span>
  );
}