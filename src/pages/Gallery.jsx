import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import {
  Camera,
  FolderOpen,
  FolderClosed,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ----- Masonry Grid Component -----
function MasonryGrid({ photos }) {
  // Distribute photos into columns for masonry effect
  const columns = useMemo(() => {
    const cols = [[], [], []];
    photos.forEach((photo, i) => {
      cols[i % 3].push(photo);
    });
    return cols;
  }, [photos]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-4">
          {col.map((photo) => (
            <div
              key={photo.id}
              className="rounded-xl overflow-hidden bg-parchment-dark group cursor-pointer"
            >
              <img
                src={photo.url}
                alt={photo.caption || "Book club photo"}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {photo.caption && (
                <p className="px-3 py-2 text-xs text-carbon-muted font-sans">
                  {photo.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ----- Album Folder Component -----
function AlbumFolder({ album, photos }) {
  const [isOpen, setIsOpen] = useState(false);
  const monthLabel = new Date(album.month + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
    },
  );

  return (
    <div className="border border-parchment-dark rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-parchment transition text-left"
      >
        {isOpen ? (
          <FolderOpen className="w-6 h-6 text-brand-blue shrink-0" />
        ) : (
          <FolderClosed className="w-6 h-6 text-brand-blue shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg text-carbon uppercase font-bold tracking-wide">
            {album.title || monthLabel}
          </h3>
          <p className="text-xs text-carbon-muted mt-0.5 font-sans">
            {monthLabel} · {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Album cover thumbnail */}
        {album.cover_url && (
          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
            <img
              src={album.cover_url}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-carbon-muted shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-carbon-muted shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-6">
          {photos.length > 0 ? (
            <MasonryGrid photos={photos} />
          ) : (
            <p className="text-carbon-muted text-sm text-center py-8 font-sans">
              No photos in this album yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ----- Demo Data -----
const DEMO_ALBUMS = [
  {
    id: "demo-1",
    title: "March 2026 Meet",
    month: "2026-03-01",
    cover_url: null,
  },
  {
    id: "demo-2",
    title: "February 2026 Meet",
    month: "2026-02-01",
    cover_url: null,
  },
  {
    id: "demo-3",
    title: "January 2026 Meet",
    month: "2026-01-01",
    cover_url: null,
  },
];

const DEMO_PHOTOS = {
  "demo-1": [
    {
      id: "p1",
      url: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=600&fit=crop",
      caption: "Reading corner setup",
    },
    {
      id: "p2",
      url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop",
      caption: "Discussion in progress",
    },
    {
      id: "p3",
      url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=500&fit=crop",
      caption: "Our cozy spot",
    },
    {
      id: "p4",
      url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
      caption: "This month's read",
    },
    {
      id: "p5",
      url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=350&fit=crop",
      caption: "Stacked reads",
    },
  ],
  "demo-2": [
    {
      id: "p6",
      url: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=500&fit=crop",
      caption: "Feb gathering",
    },
    {
      id: "p7",
      url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=300&fit=crop",
      caption: "The library",
    },
    {
      id: "p8",
      url: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400&h=450&fit=crop",
      caption: "Warm light",
    },
  ],
  "demo-3": [],
};

// ----- Gallery Page -----
export default function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [photosMap, setPhotosMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlbums() {
      const { data: albumData } = await supabase
        .from("albums")
        .select("*")
        .order("month", { ascending: false });

      if (albumData && albumData.length > 0) {
        setAlbums(albumData);

        // Fetch all photos for these albums
        const { data: photoData } = await supabase
          .from("photos")
          .select("*")
          .in(
            "album_id",
            albumData.map((a) => a.id),
          )
          .order("position");

        if (photoData) {
          const grouped = {};
          for (const photo of photoData) {
            if (!grouped[photo.album_id]) grouped[photo.album_id] = [];
            grouped[photo.album_id].push(photo);
          }
          setPhotosMap(grouped);
        }
      } else {
        // No albums yet — show empty state
        setAlbums([]);
        setPhotosMap({});
      }

      setLoading(false);
    }
    fetchAlbums();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-brand-blue text-xs uppercase tracking-widest mb-3 font-display font-bold">
          <Camera className="w-4 h-4" />
          Photo Archive
        </div>
        <h2 className="font-display text-4xl mb-3 uppercase font-bold">
          Moments Under the Lamp
        </h2>
        <p className="text-carbon/60 max-w-lg mx-auto font-sans">
          A visual story of our gatherings — each album a memory, each photo a
          page turned together.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-parchment-dark border-t-brand-blue rounded-full animate-spin mx-auto" />
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-16 text-carbon-muted">
          <Camera className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-sans">
            No photos yet — check back after our first gathering!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {albums.map((album) => (
            <AlbumFolder
              key={album.id}
              album={album}
              photos={photosMap[album.id] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
