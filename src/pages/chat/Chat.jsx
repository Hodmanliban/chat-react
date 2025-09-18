import { useEffect, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { useAuth } from "../../context/AuthContext";
import SideNav from "../sidenav/Sidenav";
import { getAllMessages, postMessage, deleteMessage } from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

const fakeChat = [
  { id: "fake1", text: "Tja tja, hur mår du?", avatar: "https://i.pravatar.cc/100?img=14", username: "Johnny" },
  { id: "fake2", text: "Hallå!! Svara då!!", avatar: "https://i.pravatar.cc/100?img=14", username: "Johnny" },
  { id: "fake3", text: "Sover du eller?! 😴", avatar: "https://i.pravatar.cc/100?img=14", username: "Johnny" },
];

export default function Chat() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const endRef = useRef(null);

  const isMine = (m) =>
    !!user && (
      m.userId === user.id ||
      m.authorId === user.id ||
      m.ownerId === user.id ||
      m.username === user.username
    );

  async function load() {
    try {
      const data = await getAllMessages();
      setMsgs(data || []);
    } catch (e) {
      if (e?.message === "EXPIRED_TOKEN") { logout(); nav("/login"); return; }
      setErr("Kunde inte hämta meddelanden."); setMsgs([]);
    }
  }

  useEffect(() => { load(); }, [user?.id, user?.username]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    try {
      await postMessage(text, null, user.avatar, user.username);
      setText(""); await load();
    } catch (e) {
      if (e?.message === "EXPIRED_TOKEN") { logout(); nav("/login"); return; }
      setErr("Kunde inte skicka meddelande.");
    }
  }

  async function remove(id) {
    try { await deleteMessage(id); setMsgs((p) => p.filter((m) => m.id !== id)); }
    catch (e) {
      if (e?.message === "EXPIRED_TOKEN") { logout(); nav("/login"); return; }
      setErr("Kunde inte radera meddelande.");
    }
  }

  const all = [...fakeChat, ...msgs];

  return (
    <>
      <SideNav />
      <div className="chat-container">
        {err && <p className="error">{err}</p>}

        <div className="chat-messages">
          {all.map((m, i) => {
            const mine = isMine(m);
            const name = mine ? (user?.username || m.username || "Okänd") : (m.username || "Okänd");
            const avatar = mine
              ? (user?.avatar || "https://i.pravatar.cc/150?img=1")
              : (m.avatar || "https://i.pravatar.cc/150?img=1");

            return (
              <div
                key={m.id || `fake-${i}`}
                className={`chat-message-wrapper ${mine ? "chat-message-right" : "chat-message-left"}`}
              >
                <div className="chat-message">
                  <div className="chat-message-header">
                    <img src={avatar} alt="" className="chat-message-avatar" />
                    <span className="chat-message-user">{name}</span>
                  </div>

                  <div className="chat-message-text">
                    {DOMPurify.sanitize(String(m.text ?? m.message ?? m.content ?? m.body ?? ""))}
                  </div>


                  {mine && m.id && !String(m.id).startsWith("fake") && (
                    <button className="chat-delete-btn" onClick={() => remove(m.id)} aria-label="Radera">
                      🗑
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <form className="chat-form" onSubmit={send}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Skriv ett meddelande..."
            disabled={!user}
          />
          <button disabled={!user || !text.trim()}>Skicka</button>
        </form>
      </div>
    </>
  );
}