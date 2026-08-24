import os
import shutil
import traceback
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
import chromadb
from chromadb.utils import embedding_functions
from langchain_core.embeddings import Embeddings

app = FastAPI(title="ContextDocs API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PERSIST_DIRECTORY = "./chroma_db"
UPLOAD_DIRECTORY = "./uploaded_files"

os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
os.makedirs(PERSIST_DIRECTORY, exist_ok=True)

# Create a clean adapter so LangChain can use Chroma's default embedding function seamlessly
class ChromaDefaultEmbedding(Embeddings):
    def __init__(self):
        self._ef = embedding_functions.DefaultEmbeddingFunction()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self._ef(texts)

    def embed_query(self, text: str) -> list[float]:
        return self._ef([text])[0]

embeddings_adapter = ChromaDefaultEmbedding()

class QueryRequest(BaseModel):
    question: str

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "ContextDocs API is live"}

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        loader = PyPDFLoader(file_path)
        documents = loader.load()

        for doc in documents:
            text = doc.page_content
            # Replace multiple whitespace/newlines with a single space
            text = " ".join(text.split())
            doc.page_content = text
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        docs = text_splitter.split_documents(documents)
        
        client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
        
        vector_store = Chroma.from_documents(
            documents=docs,
            embedding=embeddings_adapter,
            client=client,
            collection_name="context_docs"
        )
        
        return {
            "filename": file.filename, 
            "status": "Success", 
            "chunks_indexed": len(docs)
        }
        
    except Exception as e:
        print("--- ERROR DURING PDF UPLOAD ---")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/api/chat")
async def chat_with_docs(query: QueryRequest):
    if not os.path.exists(PERSIST_DIRECTORY) or not os.listdir(PERSIST_DIRECTORY):
        raise HTTPException(status_code=400, detail="No documents have been uploaded yet.")
    
    try:
        print(f"Received query: {query.question}")
        client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
        
        vector_store = Chroma(
            client=client,
            collection_name="context_docs",
            embedding_function=embeddings_adapter
        )
        
        results = vector_store.similarity_search(query.question, k=3)
        print(f"Search results found: {len(results)}")
        
        if not results:
            return {
                "answer": "I couldn't find any relevant information in the uploaded documents.",
                "relevant_context": "I couldn't find any relevant information in the uploaded documents.",
                "source_pages": []
            }
        
        context = "\n\n".join([doc.page_content for doc in results])
        
        return {
            "answer": context,
            "response": context,
            "text": context,
            "result": context,
            "message": context,
            "question": query.question,
            "relevant_context": context,
            "source_pages": [doc.metadata.get("page", 0) + 1 for doc in results]
        }
        
    except Exception as e:
        print("--- CRITICAL ERROR DURING CHAT SEARCH ---")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")