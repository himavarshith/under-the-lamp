import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, supabaseUrl } from "../lib/supabase";
import { CheckCircle, XCircle, Lamp, Loader2, Clock } from "lucide-react";

export default function RSVP() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | prompt | accepted | declined | expired | error
  const [invitation, setInvitation] = useState(null);

  useEffect(() => {
    async function fetchInvitation() {
      const { data, error } = await supabase
        .from("invitations")
        .select("*, waitlist(*)")
        .eq("token", token)
        .maybeSingle();

      if (error || !data) {
        setStatus("error");
        return;
      }

      if (data.status === "accepted") {
        setStatus("accepted");
      } else if (data.status === "declined") {
        setStatus("declined");
      } else if (new Date(data.expires_at) < new Date()) {
        setStatus("expired");
      } else {
        setStatus("prompt");
      }
      setInvitation(data);
    }

    if (token) fetchInvitation();
  }, [token]);

  const respond = async (response) => {
    setStatus("loading");
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/handle-rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, response }),
      });
      const data = await res.json();
      if (!res.ok || data.error)
        throw new Error(data.error || "Request failed");
      setStatus(response === "yes" ? "accepted" : "declined");
    } catch (err) {
      console.error("[UTL] RSVP error:", err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-lime/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lamp className="w-8 h-8 text-lime" />
          </div>
          <h1 className="font-display text-2xl text-parchment uppercase font-normal tracking-wider">
            Under the Lamp
          </h1>
          <p className="text-parchment/40 text-sm font-sans">Book Club RSVP</p>
        </div>

        <div className="bg-carbon-light rounded-2xl p-8 border border-parchment/10 text-center">
          {status === "loading" && (
            <div className="py-8">
              <Loader2 className="w-8 h-8 text-lime animate-spin mx-auto" />
            </div>
          )}

          {status === "prompt" && invitation && (
            <>
              <h2 className="font-display text-xl mb-2 text-parchment uppercase font-bold">
                You're Invited!
              </h2>
              <p className="text-parchment/60 text-sm mb-6 font-sans">
                Hi{" "}
                <strong className="text-parchment">
                  {invitation.waitlist?.name}
                </strong>
                , a spot has opened up at our next book club gathering! Would
                you like to join us?
              </p>
              <p className="text-xs text-parchment/30 mb-8 font-sans">
                This invitation expires in 24 hours.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => respond("yes")}
                  className="flex-1 flex items-center justify-center gap-2 bg-lime hover:bg-lime-dark
                             text-carbon font-display font-bold uppercase tracking-wide py-3 rounded-xl transition"
                >
                  <CheckCircle className="w-5 h-5" />
                  Yes, I'm in!
                </button>
                <button
                  onClick={() => respond("no")}
                  className="flex-1 flex items-center justify-center gap-2 bg-carbon border border-parchment/20
                             hover:bg-parchment/10 text-parchment/70 font-sans font-medium py-3 rounded-xl transition"
                >
                  <XCircle className="w-5 h-5" />
                  Not this time
                </button>
              </div>
            </>
          )}

          {status === "accepted" && (
            <>
              <CheckCircle className="w-16 h-16 text-lime mx-auto mb-4" />
              <h2 className="font-display text-xl text-parchment mb-2 uppercase font-bold">
                You're In!
              </h2>
              <p className="text-parchment/60 text-sm font-sans">
                Your spot is confirmed. We'll send you the details soon. See you
                under the lamp!
              </p>
            </>
          )}

          {status === "declined" && (
            <>
              <XCircle className="w-16 h-16 text-parchment/30 mx-auto mb-4" />
              <h2 className="font-display text-xl text-parchment mb-2 uppercase font-bold">
                Maybe Next Time
              </h2>
              <p className="text-parchment/60 text-sm font-sans">
                No worries! You'll stay on the list and we'll reach out again
                next month.
              </p>
            </>
          )}

          {status === "expired" && (
            <>
              <Clock className="w-16 h-16 text-parchment/30 mx-auto mb-4" />
              <h2 className="font-display text-xl text-parchment mb-2 uppercase font-bold">
                Invitation Expired
              </h2>
              <p className="text-parchment/60 text-sm font-sans">
                This invitation has expired, but don't worry — you'll be offered
                the next available spot.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="font-display text-xl text-parchment mb-2 uppercase font-bold">
                Invalid Link
              </h2>
              <p className="text-parchment/60 text-sm font-sans">
                This RSVP link doesn't seem valid. Please check your email for
                the correct link.
              </p>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-parchment/30 hover:text-lime transition font-sans"
          >
            ← Back to Under the Lamp
          </Link>
        </div>
      </div>
    </div>
  );
}
