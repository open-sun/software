import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { sendVideoForAnalysis } from "../../services/smartcenter"; // 修改为你的视频分析接口路径

const VideoAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setResult("");
      setError(null);
    }
  };

  const handleUpload = async () => {
  if (!selectedFile) return;

  setLoading(true);
  setError(null);
  setResult(""); // 如果你还想显示文本结果的话

  try {
    const videoBlob = await sendVideoForAnalysis(selectedFile);
    // 生成视频预览URL
    const videoUrl = URL.createObjectURL(videoBlob);
    setVideoPreview(videoUrl);

    // 如果你不需要额外文字结果，这里可以直接留空或者提示
    setResult("视频分析完成，已生成分析视频。");
  } catch (err) {
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

        {videoPreview && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <video
              src={videoPreview}
              controls
              style={{
                maxWidth: "100%",
                maxHeight: 300,
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
          <ReactMarkdown>{result}</ReactMarkdown>
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
