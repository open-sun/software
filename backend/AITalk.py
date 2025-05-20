# chain.py
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_models import ChatZhipuAI
from langchain.memory import ConversationBufferMemory
from dotenv import load_dotenv
import os

load_dotenv()

# 初始化模型和内存
llm = ChatZhipuAI(model="glm-4-flash-250414", temperature=0.5)
memory = ConversationBufferMemory(return_messages=True)

# prompt 模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个智能助理，可以与人进行对话。"),
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
