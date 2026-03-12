import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, supabaseUrl } from "../lib/supabase";
import {
  Shield,
  Users,
  ArrowUp,
  ArrowDown,
  Trash2,
  Send,
  Upload,
  Plus,
  BookOpen,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
} from "lucide-react";

// ----- Custom confirm dialog -----
function useConfirm() {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback(
    (message) =>
      new Promise((resolve) => {
        setDialog({ message, resolve });
      }),
    [],
  );

  const handleOk = () => {
    dialog?.resolve(true);
    setDialog(null);
  };
  const handleCancel = () => {
    dialog?.resolve(false);
    setDialog(null);
  };

  const ConfirmDialog = dialog ? (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-carbon/50 backdrop-blur-sm px-4 pb-6 sm:pb-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[fadeUp_150ms_ease-out]">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-sans text-sm text-carbon leading-relaxed pt-1.5">
            {dialog.message}
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-sm font-sans font-medium text-carbon/60 hover:text-carbon hover:bg-parchment transition"
          >
            Cancel
          </button>
          <button
            onClick={handleOk}
            className="px-4 py-2 rounded-xl text-sm font-sans font-bold bg-carbon text-parchment hover:bg-carbon/80 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmDialog };
}

// ----- Toast notifications -----
function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const ToastContainer = (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-sans pointer-events-auto
            ${t.type === "error" ? "bg-red-600 text-white" : t.type === "success" ? "bg-carbon text-lime" : "bg-carbon text-parchment"}`}
        >
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="opacity-60 hover:opacity-100 transition shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );

  return { toast, ToastContainer };
}

const ADMIN_PASSWORD = "under-the-lamp-2026"; // In production, use Supabase Auth

// ----- Demo waitlist data -----
const DEMO_WAITLIST = [
  {
    id: "1",
    name: "Amara Johnson",
    email: "amara@email.com",
    phone: "555-0101",
    position: 1,
    status: "waiting",
    created_at: "2025-12-15",
  },
  {
    id: "2",
    name: "Chen Wei",
    email: "chen@email.com",
    phone: "555-0102",
    position: 2,
    status: "waiting",
    created_at: "2025-12-20",
  },
  {
    id: "3",
    name: "Priya Patel",
    email: "priya@email.com",
    phone: "555-0103",
    position: 3,
    status: "invited",
    created_at: "2026-01-02",
  },
  {
    id: "4",
    name: "Luca Rossi",
    email: "luca@email.com",
    phone: null,
    position: 4,
    status: "accepted",
    created_at: "2026-01-10",
  },
  {
    id: "5",
    name: "Sofia Martinez",
    email: "sofia@email.com",
    phone: "555-0105",
    position: 5,
    status: "waiting",
    created_at: "2026-01-15",
  },
  {
    id: "6",
    name: "Kwame Asante",
    email: "kwame@email.com",
    phone: "555-0106",
    position: 6,
    status: "declined",
    created_at: "2026-02-01",
  },
  {
    id: "7",
    name: "Yuki Tanaka",
    email: "yuki@email.com",
    phone: null,
    position: 7,
    status: "waiting",
    created_at: "2026-02-10",
  },
];

const statusConfig = {
  waiting: {
    label: "Waiting",
    color: "bg-parchment text-carbon-muted",
    icon: Clock,
  },
  invited: {
    label: "Invited",
    color: "bg-lavender/30 text-brand-blue",
    icon: Send,
  },
  accepted: {
    label: "Accepted",
    color: "bg-lime/30 text-carbon",
    icon: CheckCircle,
  },
  declined: {
    label: "Declined",
    color: "bg-red-50 text-red-600",
    icon: XCircle,
  },
  expired: {
    label: "Expired",
    color: "bg-parchment text-carbon-muted/60",
    icon: Clock,
  },
};

// ----- Admin Login Gate -----
function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-32 text-center">
      <Shield className="w-12 h-12 text-lime mx-auto mb-4" />
      <h2 className="font-display text-2xl mb-2 uppercase font-bold">
        Admin Access
      </h2>
      <p className="text-carbon-muted text-sm mb-6 font-sans">
        Enter the admin password to continue.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          className="w-full px-4 py-3 rounded-xl border border-parchment-dark bg-white text-carbon
                     focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-center font-sans"
          placeholder="Password"
        />
        {error && (
          <p className="text-red-500 text-sm font-sans">Incorrect password.</p>
        )}
        <button
          type="submit"
          className="w-full bg-lime hover:bg-lime-dark text-carbon font-display font-bold uppercase tracking-wider py-3 rounded-xl transition"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

// ----- Waitlist Management Tab -----
function WaitlistTab() {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirm, ConfirmDialog } = useConfirm();
  const { toast, ToastContainer } = useToast();

  useEffect(() => {
    async function fetchWaitlist() {
      const { data } = await supabase
        .from("waitlist")
        .select("*")
        .order("position");

      setWaitlist(data && data.length > 0 ? data : DEMO_WAITLIST);
      setLoading(false);
    }
    fetchWaitlist();
  }, []);

  const moveUp = async (index) => {
    if (index === 0) return;
    const updated = [...waitlist];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((item, i) => (item.position = i + 1));
    setWaitlist(updated);
    await Promise.all([
      supabase
        .from("waitlist")
        .update({ position: updated[index - 1].position })
        .eq("id", updated[index - 1].id),
      supabase
        .from("waitlist")
        .update({ position: updated[index].position })
        .eq("id", updated[index].id),
    ]);
  };

  const moveDown = async (index) => {
    if (index === waitlist.length - 1) return;
    const updated = [...waitlist];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    updated.forEach((item, i) => (item.position = i + 1));
    setWaitlist(updated);
    await Promise.all([
      supabase
        .from("waitlist")
        .update({ position: updated[index].position })
        .eq("id", updated[index].id),
      supabase
        .from("waitlist")
        .update({ position: updated[index + 1].position })
        .eq("id", updated[index + 1].id),
    ]);
  };

  const remove = async (item) => {
    if (!(await confirm(`Remove ${item.name} from the waitlist?`))) return;
    const { error } = await supabase
      .from("waitlist")
      .delete()
      .eq("id", item.id);
    if (error) {
      toast(`❌ ${error.message}`, "error");
      return;
    }
    setWaitlist(waitlist.filter((w) => w.id !== item.id));
  };

  const triggerInvite = async (item) => {
    if (!(await confirm(`Send invitation to ${item.name} (${item.email})?`)))
      return;
    try {
      const res = await fetch(
        `${supabaseUrl}/functions/v1/send-monthly-invites`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ waitlistId: item.id }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      await refreshWaitlist();
      toast(`Invitation sent to ${item.name}!`, "success");
    } catch (err) {
      toast(`Error: ${err.message || JSON.stringify(err)}`, "error");
    }
  };

  const [sending, setSending] = useState(false);

  const refreshWaitlist = async () => {
    const { data } = await supabase
      .from("waitlist")
      .select("*")
      .order("position");
    if (data && data.length > 0) setWaitlist(data);
  };

  const triggerMonthlyRound = async () => {
    if (
      !(await confirm(
        `Send invitations to the top 4 people currently waiting?`,
      ))
    )
      return;

    setSending(true);
    try {
      console.log("[UTL] Invoking send-monthly-invites...");
      const res = await fetch(
        `${supabaseUrl}/functions/v1/send-monthly-invites`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );
      const data = await res.json();
      console.log("[UTL] Response:", data);
      if (!res.ok) throw new Error(data.error || "Request failed");
      await refreshWaitlist();
      toast(`Sent ${data?.invited ?? 0} invitation(s)!`, "success");
    } catch (err) {
      console.error("[UTL] Error:", err);
      toast(`Error: ${err.message || JSON.stringify(err)}`, "error");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-2 border-parchment-dark border-t-brand-blue rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const counts = {
    waiting: waitlist.filter((w) => w.status === "waiting").length,
    invited: waitlist.filter((w) => w.status === "invited").length,
    accepted: waitlist.filter((w) => w.status === "accepted").length,
  };

  return (
    <div>
      {ConfirmDialog}
      {ToastContainer}
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Waiting", value: counts.waiting, color: "text-carbon" },
          { label: "Invited", value: counts.invited, color: "text-brand-blue" },
          { label: "Accepted", value: counts.accepted, color: "text-carbon" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 border border-parchment-dark text-center"
          >
            <p className={`text-2xl font-display font-bold ${s.color}`}>
              {s.value}
            </p>
            <p className="text-xs text-carbon-muted font-sans">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Trigger button */}
      <button
        onClick={triggerMonthlyRound}
        disabled={sending}
        className="w-full mb-6 flex items-center justify-center gap-2 bg-lime hover:bg-lime-dark
                   text-carbon font-display font-bold uppercase tracking-wider py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className={`w-4 h-4 ${sending ? "animate-pulse" : ""}`} />
        {sending ? "Sending Invites..." : "Send Invites Now (Top 4)"}
      </button>

      {/* Waitlist table */}
      <div className="space-y-2">
        {waitlist.map((item, index) => {
          const cfg = statusConfig[item.status];
          const StatusIcon = cfg.icon;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-parchment-dark"
            >
              <span className="text-xs text-carbon-muted/50 w-6 text-center font-mono">
                #{item.position}
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-carbon truncate font-sans">
                  {item.name}
                </p>
                <p className="text-xs text-carbon-muted truncate font-sans">
                  {item.email}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}
              >
                <StatusIcon className="w-3 h-3" />
                {cfg.label}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveUp(index)}
                  className="p-1.5 rounded-lg hover:bg-parchment text-carbon-muted hover:text-carbon transition"
                  title="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  className="p-1.5 rounded-lg hover:bg-parchment text-carbon-muted hover:text-carbon transition"
                  title="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                {item.status === "waiting" && (
                  <button
                    onClick={() => triggerInvite(item)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition"
                    title="Send invite"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => remove(item)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-carbon-muted/40 hover:text-red-500 transition"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----- Photo Upload Tab -----
function PhotoUploadTab() {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumMonth, setNewAlbumMonth] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [photosMap, setPhotosMap] = useState({});
  const { confirm, ConfirmDialog } = useConfirm();
  const { toast, ToastContainer } = useToast();

  const loadPhotos = async (albumId) => {
    const { data } = await supabase
      .from("photos")
      .select("*")
      .eq("album_id", albumId)
      .order("created_at");
    setPhotosMap((prev) => ({ ...prev, [albumId]: data || [] }));
  };

  const deleteAlbum = async (album) => {
    if (!(await confirm(`Delete album "${album.title}" and all its photos?`)))
      return;
    const { error } = await supabase.from("albums").delete().eq("id", album.id);
    if (error) {
      toast(`❌ ${error.message}`, "error");
      return;
    }
    setAlbums(albums.filter((a) => a.id !== album.id));
    if (selectedAlbum === album.id) setSelectedAlbum("");
  };

  const deletePhoto = async (photo) => {
    if (!(await confirm("Delete this photo?"))) return;
    const { error } = await supabase.from("photos").delete().eq("id", photo.id);
    if (error) {
      toast(`❌ ${error.message}`, "error");
      return;
    }
    setPhotosMap((prev) => ({
      ...prev,
      [photo.album_id]: prev[photo.album_id].filter((p) => p.id !== photo.id),
    }));
  };

  useEffect(() => {
    async function fetchAlbums() {
      const { data } = await supabase
        .from("albums")
        .select("*")
        .order("month", { ascending: false });
      if (data) setAlbums(data);
    }
    fetchAlbums();
  }, []);

  const createAlbum = async (e) => {
    e.preventDefault();
    if (!newAlbumTitle || !newAlbumMonth) return;

    const { data, error } = await supabase
      .from("albums")
      .insert({ title: newAlbumTitle, month: newAlbumMonth + "-01" })
      .select()
      .single();

    if (data) {
      setAlbums([data, ...albums]);
      setSelectedAlbum(data.id);
      setNewAlbumTitle("");
      setNewAlbumMonth("");
    } else {
      toast(error?.message || "Failed to create album", "error");
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!selectedAlbum || files.length === 0) return;

    setUploading(true);
    const uploaded = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedAlbum}/${crypto.randomUUID()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) {
        console.error("[UTL] Storage upload error:", uploadError);
        toast(`Upload failed: ${uploadError.message}`, "error");
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      // Insert photo record
      const { data: photoData, error: insertError } = await supabase
        .from("photos")
        .insert({
          album_id: selectedAlbum,
          url: urlData.publicUrl,
          caption: file.name.replace(/\.[^.]+$/, ""),
        })
        .select()
        .single();

      if (insertError) {
        console.error("[UTL] DB insert error:", insertError);
        toast(`DB insert failed: ${insertError.message}`, "error");
        setUploading(false);
        return;
      }

      if (photoData) uploaded.push(photoData);
    }

    setUploadedFiles([...uploadedFiles, ...uploaded]);
    setUploading(false);
    // Reset input so same file can be re-selected
    e.target.value = "";
    // Refresh photo list for the album
    await loadPhotos(selectedAlbum);
  };

  return (
    <div className="space-y-6">
      {ConfirmDialog}
      {ToastContainer}
      {/* Create Album */}
      <div className="bg-white rounded-xl p-6 border border-parchment-dark">
        <h3 className="font-display text-lg mb-4 flex items-center gap-2 uppercase font-bold">
          <Plus className="w-4 h-4 text-lime" />
          Create Album
        </h3>
        <form
          onSubmit={createAlbum}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={newAlbumTitle}
            onChange={(e) => setNewAlbumTitle(e.target.value)}
            placeholder="Album title"
            className="flex-1 px-3 py-2 rounded-lg border border-parchment-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-sans"
          />
          <input
            type="month"
            value={newAlbumMonth}
            onChange={(e) => setNewAlbumMonth(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-parchment-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-sans"
          />
          <button
            type="submit"
            className="w-full sm:w-auto bg-lime hover:bg-lime-dark text-carbon font-display font-bold uppercase text-sm px-4 py-2 rounded-lg transition"
          >
            Create
          </button>
        </form>
      </div>

      {/* Upload Photos */}
      <div className="bg-white rounded-xl p-6 border border-parchment-dark">
        <h3 className="font-display text-lg mb-4 flex items-center gap-2 uppercase font-bold">
          <Upload className="w-4 h-4 text-lime" />
          Upload Photos
        </h3>

        <div className="space-y-4">
          {/* Album list with delete */}
          {albums.length > 0 && (
            <div className="space-y-2 mb-2">
              {albums.map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAlbum(a.id);
                      if (!photosMap[a.id]) loadPhotos(a.id);
                    }}
                    className={`flex-1 text-left px-3 py-2 rounded-lg border text-sm transition font-sans
                      ${
                        selectedAlbum === a.id
                          ? "border-brand-blue bg-lavender/20 text-brand-blue"
                          : "border-parchment-dark hover:border-carbon-muted"
                      }`}
                  >
                    {a.title}{" "}
                    <span className="text-carbon-muted">
                      ({a.month?.slice(0, 7)})
                    </span>
                  </button>
                  <button
                    onClick={() => deleteAlbum(a)}
                    className="p-2 rounded-lg hover:bg-red-50 text-carbon-muted/40 hover:text-red-500 transition"
                    title="Delete album"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed
                        rounded-xl transition
                        ${
                          selectedAlbum && !uploading
                            ? "border-brand-blue hover:border-brand-blue-dark hover:bg-lavender/10 cursor-pointer"
                            : "border-parchment-dark opacity-50 cursor-not-allowed"
                        }`}
          >
            <Camera className="w-8 h-8 text-carbon-muted mb-2" />
            <p className="text-sm text-carbon-muted font-sans">
              {uploading
                ? "Uploading..."
                : selectedAlbum
                  ? "Click to upload photos"
                  : "Select an album first"}
            </p>
            <p className="text-xs text-carbon-muted/50 mt-1 font-sans">
              PNG, JPG, WEBP up to 10MB each
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                if (!selectedAlbum || uploading) return;
                handleUpload(e);
              }}
              className="hidden"
            />
          </label>

          {uploadedFiles.length > 0 && (
            <div className="text-sm text-green-600 mb-2">
              ✓ {uploadedFiles.length} photo(s) uploaded this session
            </div>
          )}

          {/* Photos in selected album */}
          {selectedAlbum &&
            photosMap[selectedAlbum] &&
            (photosMap[selectedAlbum].length === 0 ? (
              <p className="text-xs text-carbon-muted text-center py-4 font-sans">
                No photos in this album yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {photosMap[selectedAlbum].map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-lg overflow-hidden bg-parchment-dark"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full aspect-square object-cover"
                    />
                    <button
                      onClick={() => deletePhoto(photo)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5
                                   opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {photo.caption && (
                      <p className="text-xs text-carbon-muted px-1.5 py-1 truncate font-sans">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ----- Book Management Tab -----
function BookTab() {
  const [mode, setMode] = useState("single"); // 'single' | 'bulk'
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    cover_url: "",
    month: "",
    setAsCurrent: true,
  });
  const [coverMode, setCoverMode] = useState("url"); // 'url' | 'upload'
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);
  const { toast, ToastContainer } = useToast();

  // ----- Bulk import state -----
  const [bulkText, setBulkText] = useState("");
  const [bulkParsed, setBulkParsed] = useState([]); // { month, title, author, description, cover_url }
  const [bulkSaving, setBulkSaving] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [fetchingSingle, setFetchingSingle] = useState(false);

  // ----- Google Books metadata fetch -----
  async function fetchBookMeta(title, author) {
    try {
      // Open Library search — free, no API key, no quota
      const q = encodeURIComponent(`${title} ${author}`);
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${q}&limit=1&fields=title,cover_i,key,first_sentence`,
      );
      if (!res.ok) return null;
      const data = await res.json();
      const doc = data.docs?.[0];
      if (!doc) return null;

      const cover_url = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : null;

      // Use first_sentence if available, otherwise fetch the work record for description
      let description = "";
      if (doc.first_sentence) {
        const fs = doc.first_sentence;
        description = Array.isArray(fs) ? fs[0] : (fs?.value ?? fs ?? "");
      } else if (doc.key) {
        try {
          const workRes = await fetch(`https://openlibrary.org${doc.key}.json`);
          if (workRes.ok) {
            const work = await workRes.json();
            const d = work.description;
            description = typeof d === "string" ? d : (d?.value ?? "");
          }
        } catch {
          // description stays empty
        }
      }

      return { cover_url, description };
    } catch {
      return null;
    }
  }

  function parseBulk(raw) {
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        if (parts.length < 3) return null;
        const [month, title, author, description = ""] = parts;
        if (!month.match(/^\d{4}-\d{2}$/)) return null;
        return { month, title, author, description };
      })
      .filter(Boolean);
  }

  const fetchAllMeta = async () => {
    if (!bulkParsed.length) return;
    setFetchingMeta(true);
    const enriched = await Promise.all(
      bulkParsed.map(async (b) => {
        if (b.cover_url && b.description) return b; // already has data
        const meta = await fetchBookMeta(b.title, b.author);
        return {
          ...b,
          description: b.description || meta?.description || "",
          cover_url: b.cover_url || meta?.cover_url || null,
        };
      }),
    );
    setBulkParsed(enriched);
    setFetchingMeta(false);
  };

  const handleBulkImport = async () => {
    if (!bulkParsed.length) return;
    setBulkSaving(true);
    const rows = bulkParsed.map((b) => ({
      title: b.title,
      author: b.author,
      description: b.description || null,
      cover_url: b.cover_url || null,
      month: b.month + "-01",
      is_current: false,
    }));
    const { error } = await supabase
      .from("books")
      .upsert(rows, { onConflict: "month,title" });
    setBulkSaving(false);
    if (error) {
      toast(`Import failed: ${error.message}`, "error");
    } else {
      toast(`${rows.length} book(s) imported!`, "success");
      setBulkText("");
      setBulkParsed([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleFetchSingle = async () => {
    if (!form.title || !form.author) return;
    setFetchingSingle(true);
    const meta = await fetchBookMeta(form.title, form.author);
    setFetchingSingle(false);
    if (!meta) {
      toast("Couldn't find metadata for this book.", "error");
      return;
    }
    setForm((prev) => ({
      ...prev,
      description: prev.description || meta.description,
      cover_url: prev.cover_url || meta.cover_url || "",
    }));
    if (meta.cover_url) setCoverMode("url");
    toast("Metadata fetched!", "success");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    let finalCoverUrl = form.cover_url || null;

    // Upload file if chosen
    if (coverMode === "upload" && coverFile) {
      const ext = coverFile.name.split(".").pop();
      const path = `covers/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("photos")
        .upload(path, coverFile, { contentType: coverFile.type });
      if (upErr) {
        toast(`Upload failed: ${upErr.message}`, "error");
        setUploading(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("photos")
        .getPublicUrl(path);
      finalCoverUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("books").upsert(
      {
        title: form.title,
        author: form.author,
        description: form.description,
        cover_url: finalCoverUrl,
        month: form.month + "-01",
        is_current: form.setAsCurrent,
      },
      { onConflict: "month,title" },
    );

    if (!error) {
      if (form.setAsCurrent) {
        // Mark all other months' books as not current
        await supabase
          .from("books")
          .update({ is_current: false })
          .neq("month", form.month + "-01");
        // Ensure all books of this month are marked current
        await supabase
          .from("books")
          .update({ is_current: true })
          .eq("month", form.month + "-01");
      }

      setSaved(true);
      setUploading(false);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-parchment-dark">
      {ToastContainer}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg flex items-center gap-2 uppercase font-bold">
          <BookOpen className="w-4 h-4 text-lime" />
          {mode === "single" ? "Set Book of the Month" : "Bulk Import Books"}
        </h3>
        <div className="flex rounded-lg overflow-hidden border border-parchment-dark text-xs font-sans">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`px-3 py-1.5 transition ${mode === "single" ? "bg-carbon text-parchment" : "bg-white text-carbon-muted hover:bg-parchment"}`}
          >
            Single
          </button>
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={`px-3 py-1.5 transition ${mode === "bulk" ? "bg-carbon text-parchment" : "bg-white text-carbon-muted hover:bg-parchment"}`}
          >
            Bulk import
          </button>
        </div>
      </div>

      {mode === "bulk" ? (
        <div className="space-y-4">
          <p className="text-xs text-carbon-muted font-sans leading-relaxed">
            Paste one book per line in this format:
          </p>
          <pre className="bg-parchment rounded-lg px-4 py-3 text-xs font-mono text-carbon overflow-x-auto">
            {`YYYY-MM | Title | Author | Description (optional)

# Example:
2025-06 | The Remains of the Day | Kazuo Ishiguro | A butler reflects on his life.
2025-07 | Station Eleven | Emily St. John Mandel`}
          </pre>
          <textarea
            value={bulkText}
            onChange={(e) => {
              setBulkText(e.target.value);
              setBulkParsed(parseBulk(e.target.value));
            }}
            rows={8}
            placeholder="2025-06 | The Remains of the Day | Kazuo Ishiguro | Description..."
            className="w-full px-3 py-2 rounded-lg border border-parchment-dark text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue/30 resize-y"
          />

          {bulkParsed.length > 0 && (
            <>
              <button
                type="button"
                onClick={fetchAllMeta}
                disabled={fetchingMeta}
                className="flex items-center gap-2 text-xs font-sans font-medium px-3 py-1.5 rounded-lg border border-brand-blue/40 text-brand-blue hover:bg-brand-blue/5 disabled:opacity-40 transition"
              >
                {fetchingMeta ? (
                  <span className="w-3 h-3 border border-brand-blue border-t-transparent rounded-full animate-spin" />
                ) : (
                  <BookOpen className="w-3 h-3" />
                )}
                {fetchingMeta
                  ? "Fetching metadata…"
                  : "Auto-fetch covers & descriptions"}
              </button>

              <div className="rounded-lg border border-parchment-dark overflow-hidden text-sm">
                <div className="bg-parchment px-3 py-2 text-xs font-sans font-bold uppercase tracking-wide text-carbon-muted">
                  Preview — {bulkParsed.length} book(s) to import
                </div>
                <div className="divide-y divide-parchment-dark">
                  {bulkParsed.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                      {b.cover_url ? (
                        <img
                          src={b.cover_url}
                          alt={b.title}
                          className="w-8 h-11 object-cover rounded shrink-0 border border-parchment-dark"
                        />
                      ) : (
                        <div className="w-8 h-11 rounded bg-parchment-dark shrink-0 flex items-center justify-center">
                          <BookOpen className="w-3 h-3 text-carbon-muted/40" />
                        </div>
                      )}
                      <span className="shrink-0 text-xs text-carbon-muted font-mono">
                        {b.month}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-carbon font-sans truncate">
                          {b.title}
                        </p>
                        <p className="text-xs text-carbon-muted font-sans">
                          by {b.author}
                        </p>
                        {b.description && (
                          <p className="text-xs text-carbon-muted/60 font-sans truncate mt-0.5">
                            {b.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={handleBulkImport}
            disabled={!bulkParsed.length || bulkSaving}
            className="bg-lime hover:bg-lime-dark disabled:opacity-50 text-carbon font-display font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg transition text-sm"
          >
            {bulkSaving
              ? "Importing…"
              : `Import ${bulkParsed.length || 0} Book(s)`}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Book title"
              required
              className="px-3 py-2 rounded-lg border border-parchment-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-sans"
            />
            <input
              type="text"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Author"
              required
              className="px-3 py-2 rounded-lg border border-parchment-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-sans"
            />
          </div>

          {/* Auto-fetch metadata */}
          <button
            type="button"
            onClick={handleFetchSingle}
            disabled={!form.title || !form.author || fetchingSingle}
            className="flex items-center gap-2 text-xs font-sans font-medium px-3 py-1.5 rounded-lg border border-brand-blue/40 text-brand-blue hover:bg-brand-blue/5 disabled:opacity-40 transition"
          >
            {fetchingSingle ? (
              <span className="w-3 h-3 border border-brand-blue border-t-transparent rounded-full animate-spin" />
            ) : (
              <BookOpen className="w-3 h-3" />
            )}
            {fetchingSingle ? "Fetching…" : "Auto-fetch cover & description"}
          </button>

          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-parchment-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 resize-none font-sans"
          />

          {/* Cover image — URL or upload toggle */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-carbon-muted font-sans uppercase tracking-wide">
                Cover image
              </span>
              <div className="flex rounded-lg overflow-hidden border border-parchment-dark text-xs font-sans">
                <button
                  type="button"
                  onClick={() => setCoverMode("url")}
                  className={`px-3 py-1 transition ${coverMode === "url" ? "bg-brand-blue text-white" : "bg-white text-carbon-muted hover:bg-parchment"}`}
                >
                  Paste URL
                </button>
                <button
                  type="button"
                  onClick={() => setCoverMode("upload")}
                  className={`px-3 py-1 transition ${coverMode === "upload" ? "bg-brand-blue text-white" : "bg-white text-carbon-muted hover:bg-parchment"}`}
                >
                  Upload file
                </button>
              </div>
            </div>

            {coverMode === "url" ? (
              <input
                type="url"
                value={form.cover_url}
                onChange={(e) =>
                  setForm({ ...form, cover_url: e.target.value })
                }
                placeholder="https://... (optional)"
                className="w-full px-3 py-2 rounded-lg border border-parchment-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-sans"
              />
            ) : (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg border-2 border-dashed border-parchment-dark text-sm text-carbon-muted hover:border-brand-blue hover:text-brand-blue transition font-sans"
                >
                  {coverFile ? coverFile.name : "Choose image…"}
                </button>
                {coverPreview && (
                  <img
                    src={coverPreview}
                    alt="preview"
                    className="w-12 h-16 object-cover rounded-lg border border-parchment-dark"
                  />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          <input
            type="month"
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg border border-parchment-dark text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-sans"
          />

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.setAsCurrent}
              onChange={(e) =>
                setForm({ ...form, setAsCurrent: e.target.checked })
              }
              className="w-4 h-4 accent-brand-blue"
            />
            <span className="text-sm text-carbon font-sans">
              Set as current book
            </span>
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="bg-lime hover:bg-lime-dark disabled:opacity-60 text-carbon font-display font-bold uppercase tracking-wider py-2.5 px-6 rounded-lg transition text-sm"
          >
            {uploading ? "Saving…" : "Save Book"}
          </button>
          {saved && (
            <span className="text-carbon font-sans text-sm ml-3">✓ Saved!</span>
          )}
        </form>
      )}
    </div>
  );
}

// ----- Admin Page -----
export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("waitlist");

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  const tabs = [
    { id: "waitlist", label: "Waitlist", icon: Users },
    { id: "photos", label: "Photos", icon: Camera },
    { id: "book", label: "Book", icon: BookOpen },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl uppercase font-extrabold">
            Admin Dashboard
          </h2>
          <p className="text-carbon-muted text-sm mt-1 font-sans">
            Manage your book club
          </p>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-sm text-carbon-muted hover:text-carbon transition flex items-center gap-1 font-sans"
        >
          <EyeOff className="w-3.5 h-3.5" />
          Lock
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-parchment-dark rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition
              ${
                activeTab === id
                  ? "bg-white text-carbon shadow-sm font-display font-bold uppercase"
                  : "text-carbon-muted hover:text-carbon font-sans"
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "waitlist" && <WaitlistTab />}
      {activeTab === "photos" && <PhotoUploadTab />}
      {activeTab === "book" && <BookTab />}
    </div>
  );
}
