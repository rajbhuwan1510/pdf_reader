import streamlit as st
import os
from dotenv import load_dotenv
import tempfile

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

# Load environment variables
load_dotenv()

# Streamlit Page Config
st.set_page_config(page_title="PDF Chatbot", page_icon="📄", layout="centered")

st.title("📄 Chatbot for PDF Knowledge Retrieval")
st.caption("Grounded PDF Intelligence powered by Groq & LangChain")

# Initialize session state for chat history
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "Hi there! I am your personal document assistant. Upload a PDF in the sidebar, and we can start exploring it together."}
    ]
if "vector_store" not in st.session_state:
    st.session_state.vector_store = None

# Sidebar for PDF Upload
with st.sidebar:
    st.header("Document Setup")
    uploaded_file = st.file_uploader("Upload your PDF document", type=["pdf"])
    
    if uploaded_file is not None and st.session_state.vector_store is None:
        with st.spinner("Processing document..."):
            # Save uploaded file to a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(uploaded_file.getvalue())
                tmp_path = tmp_file.name
            
            # Load and chunk PDF
            loader = PyPDFLoader(tmp_path)
            docs = loader.load()
            
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            splits = text_splitter.split_documents(docs)
            
            # Create vector store
            embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            vector_store = FAISS.from_documents(splits, embeddings)
            st.session_state.vector_store = vector_store
            
            # Clean up temp file
            os.remove(tmp_path)
            
            st.success(f"Indexed {len(splits)} chunks from the document!")
            st.session_state.messages.append({"role": "assistant", "content": f"I've finished processing '{uploaded_file.name}'. What's sparking your interest in this document?"})
            st.rerun()

# Display chat messages
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# Chat Input
if prompt := st.chat_input("Ask something about the document..."):
    # Add user message to state
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
        
    # Generate response
    with st.chat_message("assistant"):
        if st.session_state.vector_store is None:
            st.warning("Please upload a PDF document first.")
            response = "Please upload a PDF document first."
        else:
            with st.spinner("Thinking..."):
                try:
                    llm = ChatGroq(
                        api_key=os.environ.get("GROQ_API_KEY"),
                        model_name="llama-3.1-8b-instant",
                        temperature=0
                    )
                    
                    retriever = st.session_state.vector_store.as_retriever(search_kwargs={"k": 5})
                    
                    system_prompt = (
                        "You are a helpful AI assistant. Answer the user's question based on the provided document context.\n\n"
                        "Context:\n{context}\n\n"
                        "Guidelines:\n"
                        "- Use the context to provide a helpful, natural response.\n"
                        "- If the information is missing, politely explain that it's not in the document.\n"
                        "- Keep the tone professional yet approachable.\n"
                        "- Do not mention 'PDF' or 'context' unless necessary."
                    )
                    
                    prompt_template = ChatPromptTemplate.from_messages([
                        ("system", system_prompt),
                        ("human", "{input}"),
                    ])
                    
                    rag_chain = (
                        {"context": retriever | format_docs, "input": RunnablePassthrough()}
                        | prompt_template
                        | llm
                        | StrOutputParser()
                    )
                    
                    response = rag_chain.invoke(prompt)
                    st.markdown(response)
                except Exception as e:
                    st.error(f"Error: {e}")
                    response = "I had trouble generating a response. Please check your API key or try again."
        
        st.session_state.messages.append({"role": "assistant", "content": response})
