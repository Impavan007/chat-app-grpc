import { useEffect, useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(storedUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const evtSource = new EventSource(`http://localhost:5000/api/chat/connect?user=${user}`);

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };

    return () => evtSource.close();
  }, [user]);

  useEffect(() => {
    const chatContainer = document.getElementById("chat-messages");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    await fetch("http://localhost:5000/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, message: input })
    });
    setInput("");
  };

  return (
    <div className="container">
      <div className="chat-container">
        <header className="chat-header">
          <h2>Nexus Chat PLATFORM</h2>
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Connected as <span style={{ color: "var(--success)", fontWeight: "bold" }}>{user}</span>
          </div>
        </header>

        <div id="chat-messages" className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.user === user ? 'sent' : 'received'}`}>
              <div className="message-user">{m.user === user ? 'You' : m.user}</div>
              <div className="message-content">{m.message}</div>
            </div>
          ))}
        </div>

        <div className="chat-input-area">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
