# chain.py
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_models import ChatZhipuAI
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv
import os

from pathlib import Path
import base64
import io
from zhipuai import ZhipuAI
import json

from werkzeug.utils import secure_filename


load_dotenv()

# 初始化模型和内存
llm = ChatZhipuAI(model="glm-4-flash-250414", temperature=0.5)
memory = ConversationBufferMemory(return_messages=True)

# prompt 模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个海洋牧场管理养殖专家，会为使用者提供建议。"),
    MessagesPlaceholder(variable_name="history"),
    ("user", "{input}")
])

# 构建 chain：新写法
chain = prompt | llm | StrOutputParser()

# 封装函数用于调用
def chat(user_input: str) -> str:
    history = memory.load_memory_variables({})["history"]
    inputs = {"input": user_input, "history": history}
    response = chain.invoke(inputs)
    memory.save_context({"input": user_input}, {"output": response})
    return response



API_KEY = os.getenv("ZHIPU_API_KEY")

def recognize_image_with_zhipu(image_bytes: bytes, model: str = "glm-4v-flash", prompt: str = "请描述这个图片中鱼的种类大约长度和重量") -> str:
    """
    将图像字节流传给 ZhipuAI 模型，返回识别结果文本
    """
    img_base64 = base64.b64encode(image_bytes).decode("utf-8")

    client = ZhipuAI(api_key=API_KEY)
    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{img_base64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ]
    )

    return response.choices[0].message.content


def recognize_file_with_zhipu(file_path: Path, model="glm-4-flash-250414", prompt="请根据文件生成养殖建议") -> str:
    client = ZhipuAI(api_key=API_KEY)

    try:
        # 创建文件对象
        file_object = client.files.create(file=file_path, purpose="file-extract")

        # 获取文本内容
        file_content = json.loads(client.files.content(file_id=file_object.id).content)["content"]

        # 构建分析内容
        message_content = f"{prompt}\n{file_content}"

        # 发起对话请求
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": message_content}]
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"文件处理失败: {str(e)}"
    

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "temp")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # 如果 temp 不存在就创建


def process_uploaded_file(file, upload_dir=UPLOAD_FOLDER, prompt="请根据文件生成养殖建议") -> str:
    """
    处理上传文件的通用流程：保存 -> 读取 -> 调用 ZhipuAI -> 删除

    :param file: Flask 上传的 file 对象
    :param upload_dir: 文件保存目录（如 ./temp）
    :param prompt: 提示词，用于生成内容
    :return: 分析生成的文本
    """
    import uuid

    # 1. 确保保存目录存在
    os.makedirs(upload_dir, exist_ok=True)

    # 2. 生成安全的唯一文件名
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(upload_dir, unique_filename)

    # 3. 保存文件
    file.save(file_path)

    try:
        # 4. 交给 ZhipuAI 分析
        result = recognize_file_with_zhipu(Path(file_path), prompt=prompt)
        return result

    finally:
        # 5. 无论成功与否都尝试删除临时文件
        try:
            os.remove(file_path)
        except Exception:
            pass  # 忽略删除异常
