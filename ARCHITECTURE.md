# 🏗️ System Architecture

This document outlines the architecture and data flow of the PDF Knowledge Retrieval application. The system is designed to be fully serverless-compatible, utilizing an in-memory vector database and lightning-fast cloud LLM inference.

## High-Level Architecture Diagram

The following Mermaid diagram illustrates the exact path a document takes from upload to the final user response.

```mermaid
graph TD
    %% User Inputs
    User[User] -->|Uploads PDF| UI(Streamlit Frontend)
    User -->|Submits Query| UI
    
    %% Ingestion Flow
    subgraph Document Ingestion Pipeline
        UI -->|Temp File| Loader(PyPDFLoader)
        Loader -->|Raw Text Docs| Splitter(Recursive Character Text Splitter)
        Splitter -->|Text Chunks| Embedder(HuggingFace all-MiniLM-L6-v2)
        Embedder -->|Vectors| FAISS[(FAISS In-Memory Vector Store)]
    end
    
    %% Retrieval & Generation Flow
    subgraph RAG Execution (LCEL)
        UI -->|User Query| Retriever(FAISS Retriever)
        FAISS -->|Similarity Search k=5| Retriever
        Retriever -->|Top-K Context| Prompt(Prompt Template)
        UI -->|User Query| Prompt
        
        Prompt -->|Formatted Prompt| LLM(Groq Cloud: Llama-3.1-8b)
        LLM -->|Raw LLM Response| Parser(String Output Parser)
    end
    
    %% Final Output
    Parser -->|Final Answer| UI
    
    %% Styling
    classDef frontend fill:#ff4b4b,stroke:#fff,stroke-width:2px,color:#fff;
    classDef processing fill:#6366f1,stroke:#fff,stroke-width:2px,color:#fff;
    classDef database fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff;
    classDef llm fill:#f55036,stroke:#fff,stroke-width:2px,color:#fff;
    
    class UI frontend;
    class Loader,Splitter,Embedder,Retriever,Prompt,Parser processing;
    class FAISS database;
    class LLM llm;
```

## Component Breakdown

1.  **Frontend Interface (Streamlit):** Handles session state, file uploads, and renders the dynamic chat UI.
2.  **Document Ingestion:**
    *   Files are temporarily saved to disk.
    *   `PyPDFLoader` extracts text.
    *   Text is chunked to bypass token limits and improve search granularity.
3.  **Vector Store (FAISS):** The chunks are converted into dense vectors using local HuggingFace embeddings. FAISS holds these vectors in RAM for instant similarity lookups.
4.  **Inference Engine (Groq):** Groq is chosen for its specialized LPU (Language Processing Unit) architecture, providing ultra-low latency token generation, making the chatbot feel real-time.
