# 📄 Chatbot for PDF Knowledge Retrieval

![DocuIntel Banner](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python) ![Streamlit](https://img.shields.io/badge/Streamlit-FF4B4B?style=for-the-badge&logo=Streamlit&logoColor=white) ![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain) ![Groq](https://img.shields.io/badge/Groq-f55036?style=for-the-badge)

A powerful, high-performance RAG (Retrieval-Augmented Generation) application designed to extract, index, and query information from PDF documents. Built with **Streamlit** for the frontend, **LangChain** for the RAG orchestration, and the **Groq Llama-3.1-8b** model for lightning-fast inference.

## 🚀 Features

- **Instant PDF Ingestion:** Upload any PDF document and have it processed in seconds.
- **Advanced Contextual Retrieval:** Uses `RecursiveCharacterTextSplitter` and `FAISS` (Facebook AI Similarity Search) to ensure high-accuracy semantic search.
- **Lightning Fast Inference:** Powered by Groq's LPU inference engine, delivering responses almost instantly via the `llama-3.1-8b-instant` model.
- **Cyberpunk Glassmorphism UI:** A sleek, modern dark-themed interface built natively into Streamlit.
- **Strict Grounding:** The LLM is strictly instructed to only answer based on the provided document context, preventing hallucinations.

## 🛠️ Tech Stack

- **Frontend:** Streamlit
- **Orchestration:** LangChain Core (LCEL)
- **Vector Store:** FAISS (Local Vector Database)
- **Embeddings:** HuggingFace (`all-MiniLM-L6-v2`) via `sentence-transformers`
- **LLM Engine:** Groq API (`llama-3.1-8b-instant`)

## 📂 Project Documentation

To help you navigate this project, I have separated the documentation into focused files:

1. [**Setup Instructions (`SETUP.md`)**](./SETUP.md) - How to run this app locally.
2. [**Architecture (`ARCHITECTURE.md`)**](./ARCHITECTURE.md) - System design and data flow.
3. [**API & Pipeline (`API_DOCUMENTATION.md`)**](./API_DOCUMENTATION.md) - Detailed breakdown of the LangChain RAG pipeline.

## 🔗 Live Demo
*App is deployed via Streamlit Community Cloud. Check the repository settings for the live link.*
