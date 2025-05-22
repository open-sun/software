import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import ReactMarkdown from "react-markdown"; // ✅ 引入 react-markdown
import { sendInputmessage } from "../../services/smartcenter";

interface Message {
  sender: "user" | "ai";
  text: string;
}

const AiTalk: React.FC = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  const handleSubmit = async () => {
    if (!userInput) return;

    const newUserMessage: Message = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setLoading(true);
    setError(null);

    try {
      const data = await sendInputmessage(newUserMessage.text);
      const newAiMessage: Message = { sender: "ai", text: data.response };
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error: any) {
      setError(error.message || "An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
<Box sx={{ padding: 2, maxWidth: 700, margin: "0 auto" }}>
  <Box
    sx={{
      mb: 2,
      p: 2,
      border: "1px solid #ccc",
      borderRadius: 2,
      height: "550px", // ⬅️ 放大高度
      overflowY: "auto",
      backgroundColor: "#f9f9f9",
    }}
  >
    {messages.map((msg, index) => (
      <Box
        key={index}
        sx={{
          display: "flex",
          justifyContent:
            msg.sender === "user" ? "flex-end" : "flex-start",
          mb: 1,
        }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            backgroundColor: msg.sender === "user" ? "#1976d2" : "#e0e0e0",
            color: msg.sender === "user" ? "#fff" : "#000",
            maxWidth: "90%",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: "0.85rem", // ⬅️ 字体变小
            lineHeight: 1.4,               // ✅ 行高变小
            "& p": { 
              margin: 0,
              lineHeight: 1.1,

             },
            "& ul, & ol": {
              paddingLeft: "1.2em",     // 控制缩进
              margin: 0,
              lineHeight: 0.9,
            },
            "& li": {
              margin: 0,                // 去除默认 margin
              padding: 0,               // 去除 padding
              lineHeight: 1,          // 控制每一项的行高
            },
            "& h1, & h2, & h3": { margin: "4px 0" },
          }}
        >
          {msg.sender === "ai" ? (
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          ) : (
            msg.text
          )}
        </Paper>
      </Box>
    ))}
  </Box>


      <TextField
        label="Type your message"
        variant="outlined"
        fullWidth
        value={userInput}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={loading}
        sx={{ mb: 2 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading || !userInput}
        fullWidth
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Send"}
      </Button>

      {error && (
        <Typography variant="body2" sx={{ mt: 2, color: "error.main" }}>
          <strong>Error:</strong> {error}
        </Typography>
      )}
    </Box>
  );
};

export default AiTalk;
