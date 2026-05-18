# NLP-Powered RAG Chatbot

This document tracks our progress, tasks, and modifications made to the project.

## Project Overview
An intelligent NLP-powered chatbot built using a Retrieval-Augmented Generation (RAG) architecture. The chatbot answers user queries based strictly on the content retrieved from uploaded PDF documents.

## Core Behavior
- **Information Priority**: Always prioritize information retrieved from the PDF knowledge base.
- **Strict Grounding**: Do NOT use external knowledge or assumptions. Responses must be grounded only in the retrieved context.
- **NLP Processing**: Uses tokenization, intent recognition, and semantic understanding to process queries.

## Implementation Workflow
1. **Understand User Query**: Process query and convert into embeddings for semantic search.
2. **Retrieve Context**: Perform similarity search in the vector database and retrieve relevant chunks.
3. **Validate Context**: Check similarity scores. Proceed if above threshold; otherwise, respond "Response data insufficient."
4. **Generate Response**: Use only retrieved context for accurate, contextual, and clear answers.

## Strict Rules
- Respond ONLY with **"Response data insufficient."** if the answer is not clearly supported.
- Do not guess, infer, or provide general knowledge.
- Keep responses natural and conversational but structured.
- Do not mention the retrieval process, PDF, or vector database in final answers.

## Activity Log
- **2026-05-15**: Initialized project in `C:\Users\rajbh\Desktop\assignment`.
- **2026-05-15**: Scaffolded Vite React project.
- **2026-05-15**: Switched chat engine to **Groq** (Mixtral-8x7b).
- **2026-05-15**: Integrated **local embeddings** using Xenova/Transformers (No API key needed for embeddings).
- **2026-05-15**: Updated backend to support `GROQ_API_KEY`.
- **2026-05-15**: Implemented **Dashboard File Upload** using Multer and FormData.
