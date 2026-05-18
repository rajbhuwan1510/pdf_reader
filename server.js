import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const { HuggingFaceTransformersEmbeddings } = require("langchain/embeddings/hf_transformers");
const { ChatGroq } = require("@langchain/groq");
const pdfParse = require("pdf-parse-fork");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

let vectorStore = null;

// Endpoint to upload and process PDF
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded." });
        }

        const filePath = req.file.path;
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        
        const docs = [{
            pageContent: data.text,
            metadata: { source: req.file.originalname }
        }];
        
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        
        const splitDocs = await splitter.splitDocuments(docs);
        
        const embeddings = new HuggingFaceTransformersEmbeddings({
            modelName: "Xenova/all-MiniLM-L6-v2",
        });
        vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);
        
        // Clean up temporary file
        fs.unlinkSync(filePath);
        
        res.json({ message: "PDF uploaded and indexed successfully." });
    } catch (error) {
        console.error(error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "Failed to process PDF." });
    }
});

// Endpoint to query the RAG system
app.post('/api/chat', async (req, res) => {
    const { query } = req.body;
    
    if (!vectorStore) {
        return res.json({ response: "Response data insufficient. (No document indexed)" });
    }

    try {
        // Step 2: Retrieve relevant context
        const results = await vectorStore.similaritySearch(query, 10);
        console.log("Retrieved context chunks:", results.length);
        
        // Step 3: Validate context
        if (results.length === 0) {
            return res.json({ response: "I couldn't find any information in the document to answer that." });
        }

        const context = results.map(r => r.pageContent).join("\n\n");
        
        // Step 4: Generate Response
        const model = new ChatGroq({ 
            apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY, 
            modelName: "llama-3.1-8b-instant", 
            temperature: 0 
        });
        const prompt = `You are a helpful AI assistant. Answer the user's question based on the provided document context.
        
        Context:
        ${context}
        
        User Query: ${query}
        
        Guidelines:
        - Use the context to provide a helpful, natural response.
        - If the information is missing, politely explain that it's not in the document.
        - Keep the tone professional yet approachable.
        - Do not mention "PDF" or "context" unless necessary.`;

        console.log("Sending prompt to LLM...");
        const response = await model.call([{ role: "user", content: prompt }]);
        console.log("LLM response received.");
        
        res.json({ response: response.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error generating response." });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Force process to stay alive
setInterval(() => {}, 1000000);
