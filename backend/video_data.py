from flask import Blueprint, request, jsonify, send_from_directory, abort
import os

video_bp = Blueprint("video", __name__)
VIDEO_DIR = os.path.join(os.path.dirname(__file__), 'data', 'videos')

@video_bp.route('/api/videos')
def get_videos():
    date = request.args.get('date')
    video_list = []

    try:
        if date:
            folder_path = os.path.join(VIDEO_DIR, date)
            if os.path.exists(folder_path):
                video_list = [
                    {
                        "filename": file,
                        "url": f"http://localhost:5000/data/videos/{date}/{file}"
                    }
                    for file in os.listdir(folder_path) if file.endswith('.mp4')
                ]
        
        # 调试输出
        print(f"Video List for {date}: {video_list}")
        
        return jsonify({"videos": video_list}), 200

    except Exception as e:
        print(f"Error fetching videos: {e}")
        return jsonify({"error": "获取视频列表失败"}), 500

@video_bp.route('/data/videos/<date>/<filename>')
def serve_video(date, filename):
    """
    根据日期和文件名提供视频文件
    """
    folder_path = os.path.join(VIDEO_DIR, date)
    file_path = os.path.join(folder_path, filename)

    # 确保路径合法且文件存在
    if not os.path.exists(file_path):
        abort(404)

    # 设置 Content-Type
    return send_from_directory(folder_path, filename, mimetype='video/mp4')


