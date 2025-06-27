import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { sendVideoForAnalysis } from "../../services/smartcenter"; // 发送视频并返回 Blob

const VideoAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
      setVideoUrl(null); // 清除之前的视频链接
      setResult("");
      setError(null);
    }
  };

  const handleUpload = async () => {
  if (!selectedFile) return;

  setLoading(true);
  setError(null);
  setResult("");
  if (videoUrl) {
    URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
  }

  try {
    const url = await sendVideoForAnalysis(selectedFile);
    setVideoUrl(url);
    setResult("视频分析完成，已生成分析视频。");
  } catch (err) {
    console.error(err);
    setError("视频分析失败，请稍后重试。");
  } finally {
    setLoading(false);
  }
};

  return (
    <Box sx={{ padding: 2, maxWidth: 700, margin: "0 auto" }}>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 2,
          border: "1px dashed #ccc",
          textAlign: "center",
          backgroundColor: "#fdfdfd",
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          上传一个视频进行分析
        </Typography>

        <Box sx={{ mb: 2 }}>
          <input
            type="file"
            accept="video/*"
            id="video-upload"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <label htmlFor="video-upload">
            <Button
              variant="outlined"
              component="span"
              color="primary"
              startIcon={<VideoLibraryIcon />}
              sx={{
                padding: "10px 20px",
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "16px",
              }}
              disabled={loading}
            >
              {selectedFile ? selectedFile.name : "选择视频"}
            </Button>
          </label>
        </Box>

        {videoUrl && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <video
              src={videoUrl}
              controls
              style={{
                maxWidth: "100%",
                maxHeight: 360,
                borderRadius: 8,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
          </Box>
        )}
      </Paper>

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        fullWidth
        sx={{
          padding: "12px",
          borderRadius: 4,
          textTransform: "none",
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "分析视频"}
      </Button>

      {result && (
        <Paper
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: "#f0f0f0",
            fontSize: "0.9rem",
            lineHeight: 1.4,
            borderRadius: 2,
          }}
        >
          {result}
        </Paper>
      )}

      {error && (
        <Typography variant="body2" sx={{ mt: 2, color: "error.main" }}>
          <strong>错误：</strong> {error}
        </Typography>
      )}
    </Box>
  );
};

export default VideoAnalyzer;
