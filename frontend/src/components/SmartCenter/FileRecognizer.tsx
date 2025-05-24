import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ReactMarkdown from "react-markdown";
import { sendFileForRecognition } from "../../services/smartcenter"; // ⬅️ 可替换为泛用识别函数

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// 支持的 MIME 类型列表（对应常见后缀）
const SUPPORTED_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/bmp",
  "image/gif",
  "text/csv",
  "text/plain", // .txt
  "text/markdown", // .md
  "text/x-python", // .py
];

const FileRecognizer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 文件类型校验
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError("不支持的文件类型。请上传 PDF、Word、Excel、图片、CSV、TXT、Python 等文件。");
      setSelectedFile(null);
      return;
    }

    // 文件大小校验
    if (file.size > MAX_FILE_SIZE) {
      setError("文件大小不能超过 50MB。");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    setResult("");

    try {
      const response = await sendFileForRecognition(selectedFile); // 可替换为 sendFileForRecognition
      setResult(response.result);
    } catch (err) {
      setError("文件识别失败，请稍后重试。");
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
          请上传你的养殖现状
        </Typography>

        <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
          支持格式：.pdf .doc .docx .xls .xlsx .ppt .pptx .png .jpg .jpeg .bmp .gif .csv .py .txt .md
          <br />
          文件大小 ≤ 50MB
        </Typography>

        <Box sx={{ mb: 2 }}>
          <input
            type="file"
            accept={SUPPORTED_TYPES.join(",")}
            id="file-upload"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              color="primary"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
              sx={{
                padding: "10px 20px",
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "16px",
              }}
            >
              {selectedFile ? selectedFile.name : "选择文件"}
            </Button>
          </label>
        </Box>
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
        {loading ? <CircularProgress size={24} color="inherit" /> : "生成建议"}
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
            maxHeight: 300, // ⬅️ 最大高度限制（单位：px）
            overflowY: "auto", // ⬅️ 启用垂直滚动
            whiteSpace: "pre-wrap", // 防止文字超出区域不换行
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

export default FileRecognizer;
