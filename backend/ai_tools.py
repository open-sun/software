from flask import Blueprint, request, jsonify
from SmartAI import chat, recognize_image_with_zhipu, process_uploaded_file

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

