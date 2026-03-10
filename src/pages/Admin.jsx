import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
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
} from "lucide-react";

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
    color: "bg-warm-100 text-warm-600",
    icon: Clock,
  },
  invited: { label: "Invited", color: "bg-blue-50 text-blue-600", icon: Send },
  accepted: {
    label: "Accepted",
    color: "bg-green-50 text-green-600",
    icon: CheckCircle,
  },
  declined: {
    label: "Declined",
    color: "bg-red-50 text-red-600",
    icon: XCircle,
  },
  expired: {
    label: "Expired",
    color: "bg-warm-100 text-warm-400",
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
      <Shield className="w-12 h-12 text-lamp-500 mx-auto mb-4" />
      <h2 className="font-serif text-2xl mb-2">Admin Access</h2>
      <p className="text-warm-400 text-sm mb-6">
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
          className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-warm-900
                     focus:outline-none focus:ring-2 focus:ring-lamp-400/50 text-center"
          placeholder="Password"
        />
        {error && <p className="text-red-500 text-sm">Incorrect password.</p>}
        <button
          type="submit"
          className="w-full bg-lamp-500 hover:bg-lamp-600 text-white font-medium py-3 rounded-xl transition"
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

  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...waitlist];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((item, i) => (item.position = i + 1));
    setWaitlist(updated);
  };

  const moveDown = (index) => {
    if (index === waitlist.length - 1) return;
    const updated = [...waitlist];
    [updated[index + 1], updated[index]] = [updated[index], updated[index + 1]];
    updated.forEach((item, i) => (item.position = i + 1));
    setWaitlist(updated);
  };

  const remove = (index) => {
    setWaitlist(waitlist.filter((_, i) => i !== index));
  };

  const triggerInvite = async (item) => {
    // In production, this calls the Supabase Edge Function
    alert(`📧 Invitation email would be sent to ${item.name} (${item.email})`);
    setWaitlist(
      waitlist.map((w) => (w.id === item.id ? { ...w, status: "invited" } : w)),
    );
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
    if (!confirm(`Send invitations to the top 4 people currently waiting?`))
      return;

    setSending(true);
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke(
        "send-monthly-invites",
      );

      if (error) throw error;

      await refreshWaitlist();
      alert(`✅ Sent ${data?.invited ?? 0} invitation(s)!`);
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-2 border-lamp-300 border-t-lamp-600 rounded-full animate-spin mx-auto" />
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
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Waiting", value: counts.waiting, color: "text-warm-600" },
          { label: "Invited", value: counts.invited, color: "text-blue-600" },
          {
            label: "Accepted",
            value: counts.accepted,
            color: "text-green-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 border border-warm-100 text-center"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-warm-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Trigger button */}
      <button
        onClick={triggerMonthlyRound}
        disabled={sending}
        className="w-full mb-6 flex items-center justify-center gap-2 bg-lamp-500 hover:bg-lamp-600
                   text-white font-medium py-3 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
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
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-warm-100"
            >
              <span className="text-xs text-warm-300 w-6 text-center font-mono">
                #{item.position}
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-warm-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-warm-400 truncate">{item.email}</p>
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
                  className="p-1.5 rounded-lg hover:bg-warm-100 text-warm-400 hover:text-warm-600 transition"
                  title="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  className="p-1.5 rounded-lg hover:bg-warm-100 text-warm-400 hover:text-warm-600 transition"
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
                  onClick={() => remove(index)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-warm-300 hover:text-red-500 transition"
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
      alert(error?.message || "Failed to create album");
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

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("photos")
          .getPublicUrl(fileName);

        // Insert photo record
        const { data: photoData } = await supabase
          .from("photos")
          .insert({
            album_id: selectedAlbum,
            url: urlData.publicUrl,
            caption: file.name.replace(/\.[^.]+$/, ""),
          })
          .select()
          .single();

        if (photoData) uploaded.push(photoData);
      }
    }

    setUploadedFiles([...uploadedFiles, ...uploaded]);
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      {/* Create Album */}
      <div className="bg-white rounded-xl p-6 border border-warm-100">
        <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-lamp-500" />
          Create Album
        </h3>
        <form onSubmit={createAlbum} className="flex gap-3">
          <input
            type="text"
            value={newAlbumTitle}
            onChange={(e) => setNewAlbumTitle(e.target.value)}
            placeholder="Album title"
            className="flex-1 px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-lamp-400/50"
          />
          <input
            type="month"
            value={newAlbumMonth}
            onChange={(e) => setNewAlbumMonth(e.target.value)}
            className="px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-lamp-400/50"
          />
          <button
            type="submit"
            className="bg-lamp-500 hover:bg-lamp-600 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Create
          </button>
        </form>
      </div>
      {/* Upload Photos */}
      <div className="bg-white rounded-xl p-6 border border-warm-100">
        <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-lamp-500" />
          Upload Photos
        </h3>

        <div className="space-y-4">
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-lamp-400/50"
          >
            <option value="">Select an album...</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.month})
              </option>
            ))}
          </select>

          <label
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed
                        rounded-xl cursor-pointer transition
                        ${
                          selectedAlbum
                            ? "border-lamp-300 hover:border-lamp-500 hover:bg-lamp-50/50"
                            : "border-warm-200 opacity-50 cursor-not-allowed"
                        }`}
          >
            <Camera className="w-8 h-8 text-warm-400 mb-2" />
            <p className="text-sm text-warm-500">
              {uploading ? "Uploading..." : "Click to upload photos"}
            </p>
            <p className="text-xs text-warm-300 mt-1">
              PNG, JPG, WEBP up to 10MB each
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleUpload}
              disabled={!selectedAlbum || uploading}
              className="hidden"
            />
          </label>

          {uploadedFiles.length > 0 && (
            <div className="text-sm text-green-600">
              ✓ {uploadedFiles.length} photo(s) uploaded successfully
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Book Management Tab -----
function BookTab() {
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    cover_url: "",
    month: "",
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("books").upsert(
      {
        title: form.title,
        author: form.author,
        description: form.description,
        cover_url: form.cover_url || null,
        month: form.month + "-01",
        is_current: true,
      },
      { onConflict: "month" },
    );

    // Unset previous current book
    if (!error) {
      await supabase
        .from("books")
        .update({ is_current: false })
        .neq("month", form.month + "-01");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-warm-100">
      <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-lamp-500" />
        Set Book of the Month
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Book title"
            required
            className="px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-lamp-400/50"
          />
          <input
            type="text"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            placeholder="Author"
            required
            className="px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-lamp-400/50"
          />
        </div>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-lamp-400/50 resize-none"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="url"
            value={form.cover_url}
            onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
            placeholder="Cover image URL (optional)"
            className="px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-lamp-400/50"
          />
          <input
            type="month"
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
            required
            className="px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-lamp-400/50"
          />
        </div>
        <button
          type="submit"
          className="bg-lamp-500 hover:bg-lamp-600 text-white font-medium py-2.5 px-6 rounded-lg transition text-sm"
        >
          Save Book
        </button>
        {saved && <span className="text-green-600 text-sm ml-3">✓ Saved!</span>}
      </form>
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
          <h2 className="font-serif text-3xl">Admin Dashboard</h2>
          <p className="text-warm-400 text-sm mt-1">Manage your book club</p>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-sm text-warm-400 hover:text-warm-600 transition flex items-center gap-1"
        >
          <EyeOff className="w-3.5 h-3.5" />
          Lock
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-warm-100 rounded-xl p-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition
              ${
                activeTab === id
                  ? "bg-white text-warm-900 shadow-sm"
                  : "text-warm-400 hover:text-warm-600"
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
