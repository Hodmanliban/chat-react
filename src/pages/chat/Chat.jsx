import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllMessages, postMessage, deleteMessage } from "../../services/api";
import "./Chat.css";

function sanitize(text) {
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const fakeChat = [
    { id: "fake1", text: "Tja tja, hur mår du?", avatar: "https://i.pravatar.cc/100?img=14", username: "Johnny", userId: "fake", conversationId: null },
    { id: "fake2", text: "Hallå!! Svara då!!", avatar: "https://i.pravatar.cc/100?img=14", username: "Johnny", userId: "fake", conversationId: null },
    { id: "fake3", text: "Sover du eller?! 😴", avatar: "https://i.pravatar.cc/100?img=14", username: "Johnny", userId: "fake", conversationId: null }
];

// Hjälpfunktion för att mappa egna meddelanden
function normalizeMessages(data, user) {
    return data.map(msg => {
        // Egna meddelanden ska vara höger
        if (msg.username === user?.username) {
            return { ...msg, userId: user.id };
        }
        // Alla andra (utom fakeChat) → vänster
        return msg;
    });
}

function Chat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const [contextMenuId, setContextMenuId] = useState(null);

    function handleContextMenu(e, id) {
        e.preventDefault();
        setContextMenuId(id);
    }

    useEffect(() => {
        async function fetchMessages() {
            setLoading(true);
            try {
                const data = await getAllMessages();
                const fixed = normalizeMessages(data, user);
                // FakeChat alltid först
                setMessages([...fakeChat, ...fixed]);
            } catch {
                setError("Kunde inte hämta meddelanden.");
            }
            setLoading(false);
        }
        fetchMessages();
    }, [user]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    async function handleSend(e) {
        e.preventDefault();
        setError("");
        if (!text.trim()) return;
        try {
            await postMessage(text, null, user.avatar);
            setText("");
            const data = await getAllMessages();
            const fixed = normalizeMessages(data, user);
            // FakeChat alltid först
            setMessages([...fakeChat, ...fixed]);
        } catch {
            setError("Kunde inte skicka meddelande.");
        }
    }

    async function handleDelete(id) {
        setError("");
        if (id.startsWith("fake")) {
            // Fakechat ska inte kunna raderas
            setContextMenuId(null);
            return;
        }
        try {
            await deleteMessage(id);
            setMessages(messages.filter(msg => msg.id !== id));
            setContextMenuId(null);
        } catch {
            setError("Kunde inte radera meddelande.");
        }
    }

    if (loading) return <p>Laddar meddelanden...</p>;

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map(msg => {
                    const isRight = msg.userId === user?.id;
                    const showDelete = msg.userId === user?.id && !msg.id.startsWith("fake");

                    return (
                        <div
                            key={msg.id}
                            className={`chat-message-wrapper ${isRight ? "chat-message-right" : "chat-message-left"}`}
                            onContextMenu={e => handleContextMenu(e, msg.id)}
                        >
                            <div className="chat-message">
                                <div className="chat-message-header">
                                    <img
                                        src={msg.avatar || "https://i.pravatar.cc/150?img=1"}
                                        alt="Avatar"
                                        className="chat-message-avatar"
                                    />
                                    <span className="chat-message-user">{msg.username}</span>
                                </div>
                                <div className="chat-message-text">{sanitize(msg.text || "")}</div>
                                {showDelete && (
                                    <button
                                        className="chat-delete-btn"
                                        onClick={() => handleDelete(msg.id)}
                                        title="Radera"
                                        type="button"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="chat-delete-icon"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-form" onSubmit={handleSend}>
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Skriv ett meddelande..."
                />
                <button type="submit">Skicka</button>
            </form>
        </div>
    );
}

export default Chat;
