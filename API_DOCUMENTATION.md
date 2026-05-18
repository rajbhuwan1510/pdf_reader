# 🧩 RAG Pipeline & API Documentation

Because this application is built as a unified Streamlit monolithic app, it does not expose traditional RESTful HTTP endpoints (like GET/POST). Instead, it relies on an **Internal LangChain API Pipeline**. 

This document explains the core internal APIs and functions used to achieve Retrieval-Augmented Generation (RAG).

## 1. Document Ingestion Pipeline

**Purpose:** Extract text from raw PDFs and prepare it for semantic search.

*   **`PyPDFLoader`**: An API from `langchain_community` used to parse the binary PDF file and extract raw text along with page metadata.
*   **`RecursiveCharacterTextSplitter`**: 
    *   `chunk_size=1000`: Breaks the document into digestible 1000-character pieces.
    *   `chunk_overlap=200`: Ensures context isn't lost between chunk boundaries.

## 2. Vector Embeddings API

**Purpose:** Convert text chunks into mathematical vectors for similarity comparison.

*   **`HuggingFaceEmbeddings`**: Uses the `all-MiniLM-L6-v2` model (via `sentence-transformers`) to generate dense vector embeddings locally without requiring paid API calls to OpenAI.
*   **`FAISS` (Facebook AI Similarity Search)**: An efficient, locally-hosted in-memory vector database API. 
    *   `FAISS.from_documents()`: Takes the chunked text and embeds them into the index.
    *   `vector_store.as_retriever(search_kwargs={"k": 5})`: Exposes an API to retrieve the top 5 most semantically similar chunks based on a user's query.

## 3. Inference Engine API (Groq)

**Purpose:** Generate natural language responses using the retrieved context.

*   **`ChatGroq`**: Interfaces with the Groq REST API. We use the `llama-3.1-8b-instant` model with `temperature=0` to ensure factual, deterministic outputs based *only* on the provided context.

## 4. LangChain Expression Language (LCEL) Pipeline

We utilize LCEL to chain these APIs together seamlessly:

```python
rag_chain = (
    {"context": retriever | format_docs, "input": RunnablePassthrough()}
    | prompt_template
    | llm
    | StrOutputParser()
)
```

**Workflow Breakdown:**
1.  **Input:** The user's query is passed via `RunnablePassthrough()`.
2.  **Retrieval:** The `retriever` fetches the top 5 chunks from FAISS, which are merged into a single string by `format_docs`.
3.  **Prompt:** The context and user input are injected into the `ChatPromptTemplate`.
4.  **Generation:** The formatted prompt is sent to the `llm` (Groq).
5.  **Parsing:** The `StrOutputParser` extracts the raw string response to be displayed in the Streamlit chat UI.
