import React, { useState, useEffect, useRef } from "react";
import { WebLLM } from "webllm";

export default function App() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Loading AI model, please wait..." },
  ]);
  const [input, setInput] = useState("");
  const modelRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    async function loadModel() {
      // Load GPT4All-J model
      modelRef.current = new WebLLM({
        model: "https://huggingface.co/nomic-ai/gpt4all-j/resolve/main/gpt4all-j.bin",
        backend: "wasm", // or "webgpu" if supported
      });
      await modelRef.current.load();
      setMessages([{ role: "ai", content: "Model loaded! How can I help you?" }]);
    }
    loadModel();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || !modelRef.current) return;

    const userMessage = input.trim();
    setMessages((msgs) => [...msgs, { role: "user", content: userMessage }]);
    setInput("");

    setMessages((msgs) => [...msgs, { role: "ai", content: "🤖 Thinking..." }]);

    try {
      let response = "";
      for await (const output of modelRef.current.stream(userMessage)) {
        response += output;
        setMessages((msgs) => {
          const newMsgs = [...msgs];
          newMsgs[newMsgs.length - 1] = { role: "ai", content: response };
          return newMsgs;
        });
      }
    } catch (err) {
      setMessages((msgs) => {
        const newMsgs = [...msgs];
        newMsgs[newMsgs.length - 1] = {
          role: "ai",
          content: "Error generating response. Try again.",
        };
        return newMsgs;
      });
    }
  }

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <h1>Ultimate AI Chat</h1>
        </div>
        <small style={{ color: "#888" }}>© 2025 Ultimate AI</small>
      </aside>
      <main style={styles.chatContainer}>
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                ...(msg.role === "user" ? styles.userMsg : styles.aiMsg),
              }}
            >
              {msg.content}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
          />
          <button style={styles.button} type="submit" disabled={!modelRef.current}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    background: "#202123",
    color: "#eee",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  sidebar: {
    width: 280,
    background: "#111",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  brand: {
    fontWeight: "700",
    fontSize: 24,
    letterSpacing: 2,
  },
  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#282c34",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  message: {
    maxWidth: "60%",
    padding: "12px 16px",
    borderRadius: 18,
    fontSize: 16,
    lineHeight: 1.4,
    whiteSpace: "pre-wrap",
  },
  userMsg: {
    backgroundColor: "#4f46e5",
    alignSelf: "flex-end",
    color: "white",
    borderBottomRightRadius: 4,
  },
  aiMsg: {
    backgroundColor: "#3a3f47",
    alignSelf: "flex-start",
    color: "#ddd",
    borderBottomLeftRadius: 4,
  },
  form: {
    display: "flex",
    padding: 12,
    borderTop: "1px solid #444",
    backgroundColor: "#1e1f23",
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    borderRadius: 18,
    border: "none",
    outline: "none",
    backgroundColor: "#333642",
    color: "#eee",
  },
  button: {
    marginLeft: 12,
    padding: "0 24px",
    borderRadius: 18,
    border: "none",
    backgroundColor: "#4f46e5",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
  },
};
