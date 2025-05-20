import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Paper,
} from "@mui/material";
import { sendInputmessage } from "../../services/aitalk";

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
    <Box sx={{ padding: 2, maxWidth: 600, margin: "0 auto" }}>
      <Box
        sx={{
          mb: 2,
          p: 2,
          border: "1px solid #ccc",
          borderRadius: 2,
          height: "400px",
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              mb: 1,
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                backgroundColor:
                  msg.sender === "user" ? "#1976d2" : "#e0e0e0",
                color: msg.sender === "user" ? "#fff" : "#000",
                maxWidth: "70%",
              }}
            >
              {msg.text}
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
