# ⚙️ Setup Instructions

Follow these instructions to run the PDF Knowledge Retrieval Chatbot locally on your machine.

## Prerequisites

- **Python 3.10+**
- **Git**
- A **Groq API Key** (Get one for free at [console.groq.com](https://console.groq.com))

## Local Installation

### 1. Clone the Repository
```bash
git clone https://github.com/rajbhuwan1510/pdf_reader.git
cd pdf_reader
```

### 2. Create a Virtual Environment (Recommended)
It is highly recommended to isolate the project dependencies using a virtual environment.

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
Install all required packages from the `requirements.txt` file. This includes Streamlit, LangChain, FAISS, and PyPDF.

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
The application requires a Groq API key to run the LLM inference.

1. Create a file named `.env` in the root directory.
2. Add your Groq API key to the file:

```env
GROQ_API_KEY=gsk_your_actual_api_key_here
```

*(Note: The `.env` file is included in `.gitignore` and will not be pushed to version control.)*

## Running the Application

Once the dependencies are installed and the environment variables are set, start the Streamlit server:

```bash
streamlit run app.py
```

The application will launch automatically in your default web browser at `http://localhost:8501`.

## Usage

1. **Upload:** Use the sidebar on the left to browse and upload a local PDF file.
2. **Indexing:** Wait a few seconds for the app to chunk the document and generate the FAISS vector store.
3. **Query:** Use the chat input at the bottom to ask questions specific to the uploaded document.
