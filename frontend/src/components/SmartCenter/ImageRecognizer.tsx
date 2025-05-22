import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Input,
  IconButton,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { sendImageForRecognition } from "../../services/smartcenter"; // ⬅️ 根据你项目路径调整
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const ImageRecognizer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult("");
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResult("");

    try {
      const response = await sendImageForRecognition(selectedFile);
      setResult(response.result);
    } catch (err: any) {
      setError("图片识别失败，请稍后重试。");
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
          上传一张图片进行识别
        </Typography>

        <Box sx={{ mb: 2 }}>
          {/* 自定义上传按钮 */}
          <input
            type="file"
            accept="image/*"
            id="file-upload"
            onChange={handleFileChange}
            style={{ display: "none" }} // 隐藏原始上传按钮
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              color="primary"
              startIcon={<CloudUploadIcon />}
              sx={{
                padding: "10px 20px",
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "16px",
              }}
              disabled={loading}
            >
              {selectedFile ? selectedFile.name : "选择图片"}
            </Button>
          </label>
        </Box>

        {imagePreview && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <img
              src={imagePreview}
              alt="预览"
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
        {loading ? <CircularProgress size={24} color="inherit" /> : "识别图片"}
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

export default ImageRecognizer;
