# chain.py
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_models import ChatZhipuAI
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv
import os


import base64
import io
from zhipuai import ZhipuAI


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