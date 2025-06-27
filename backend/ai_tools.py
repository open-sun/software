from flask import Blueprint, request, jsonify, send_file
from SmartAI import chat, recognize_image_with_zhipu, process_uploaded_file
import cv2
import numpy as np
import tempfile
import os
from deep_sort_realtime.deepsort_tracker import DeepSort
from ultralytics import YOLO
import traceback
import uuid


TEMP_DIR = "./temp"
os.makedirs(TEMP_DIR, exist_ok=True)  # 确保 temp 目录存在

def analyze_video(file_storage):
    os.makedirs(TEMP_DIR, exist_ok=True)

    # 为输入和输出文件生成唯一名称，防止覆盖
    unique_id = str(uuid.uuid4())
    input_path = os.path.join(TEMP_DIR, f"upload_{unique_id}.mp4")
    output_path = os.path.join(TEMP_DIR, f"processed_{unique_id}.mp4")

    # 保存上传视频到 ./temp
    file_storage.save(input_path)

    # 初始化 YOLO 模型和 DeepSort 跟踪器
    model = YOLO("yolov8m.pt")
    model.conf = 0.2

    fish_class_id = None
    for i, name in model.names.items():
        if name.lower() == "bird":
            fish_class_id = i
            break

    if fish_class_id is None:
        raise ValueError("No class named 'bird' found in model.")

    # 初始化 Deep SORT 跟踪器
    tracker = DeepSort(max_age=30)

    # 视频读取和写入初始化
    cap = cv2.VideoCapture(input_path)
    colors = {}

    fourcc = cv2.VideoWriter_fourcc(*'avc1')  # H.264

    out = cv2.VideoWriter(output_path, fourcc, 30,
                        (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                        int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))))

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame, verbose=False)
        result = results[0]
        boxes = result.boxes

        boxes_xyxy = boxes.xyxy.cpu().numpy()
        confs = boxes.conf.cpu().numpy()
        classes = boxes.cls.cpu().numpy()

        fish_detections = []
        for xyxy, conf, cls in zip(boxes_xyxy, confs, classes):
            if int(cls) != fish_class_id:
                continue
            x1, y1, x2, y2 = map(int, xyxy)
            w, h = x2 - x1, y2 - y1
            fish_detections.append(([x1, y1, w, h], float(conf), 'fish'))

        tracks = tracker.update_tracks(fish_detections, frame=frame)

        for track in tracks:
            if not track.is_confirmed():
                continue
            track_id = track.track_id
            l, t, r, b = track.to_ltrb()
            l, t, r, b = map(int, [l, t, r, b])
            color = colors.setdefault(track_id, tuple(np.random.randint(0, 255, 3).tolist()))
            cv2.rectangle(frame, (l, t), (r, b), color, 2)
            cv2.putText(frame, f'ID: {track_id}', (l, t - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        out.write(frame)

    # 清理资源
    cap.release()
    out.release()

    return input_path, output_path  # 返回两个路径


ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/chat", methods=["POST"])
def chat_route():
    data = request.get_json()
    user_input = data.get("input")

    if not user_input:
        return jsonify({"error": "Missing input field"}), 400

    try:
        response = chat(user_input)
        return jsonify({"response": response})
    except Exception as e:
        import traceback
        traceback.print_exc()  # 打印完整的错误栈
        return jsonify({"error": str(e)}), 500
    

@ai_bp.route("/recognizeIMG", methods=["POST"])
def recognize_image():
    if "file" not in request.files:
        return jsonify({"error": "Missing file field"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        image_bytes = file.read()

        # ✅ 调用封装的函数
        result_text = recognize_image_with_zhipu(image_bytes)

        return jsonify({"result": result_text})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@ai_bp.route("/recognizeFile", methods=["POST"])
def recognize_file():
    if "file" not in request.files:
        return jsonify({"error": "Missing file field"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        result_text = process_uploaded_file(file)
        return jsonify({"result": result_text})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

from flask import send_from_directory

@ai_bp.route('/temp/<filename>')
def serve_temp_file(filename):
    return send_from_directory(TEMP_DIR, filename, mimetype='video/mp4')


@ai_bp.route("/analyzeVideo", methods=["POST"])
def analyze_video_route():
    if "file" not in request.files:
        return jsonify({"error": "Missing file field"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        input_path, processed_video_path = analyze_video(file)


        if os.path.exists(input_path):
            os.remove(input_path)

        # 返回视频的访问URL
        processed_filename = processed_video_path.split(os.sep)[-1]
        video_url = f"http://localhost:5000/temp/{processed_filename}"

        return jsonify({"video_url": video_url}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

