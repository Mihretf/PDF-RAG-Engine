

```markdown
# ContextDocs 📄🤖

A lightweight, local Retrieval-Augmented Generation (RAG) web application that allows users to upload PDFs, chunk and embed documents locally using ChromaDB, and query them with semantic search via a FastAPI backend and a modern frontend interface.

## 🚀 Tech Stack

- **Backend:** FastAPI, Python, LangChain, ChromaDB (Persistent Client), PyPDF
- **Frontend:** Next.js, React, Tailwind CSS
- **Containerization:** Docker & Docker Compose

## 🛠️ Features

- **Local Vector Store:** Uses ChromaDB for persistent vector embedding storage without relying on external paid vector DB services.
- **Robust Document Ingestion:** Automatically handles PDF loading, recursive character chunking, and text normalization.
- **Context-Aware Retrieval:** Performs semantic similarity searches against uploaded document chunks and returns exact source page citations.
- **Containerized Workflow:** Fully dockerized backend service setup for effortless local deployment.

## 📂 Project Structure

```text
├── server/
│   ├── main.py          # FastAPI application, embeddings adapter, and RAG routes
│   ├── Dockerfile       # Container setup for the backend service
│   └── requirements.txt # Python dependencies
├── client/              # Next.js frontend application
├── chroma_db/           # Persistent ChromaDB storage directory
├── uploaded_files/      # Temporary storage for uploaded PDFs
└── docker-compose.yml   # Multi-container configuration

```

## ⚙️ Getting Started Locally

### Prerequisites

* Docker and Docker Compose installed on your machine.
* Python 3.10+ (if running locally outside of Docker).

### Running with Docker

1. Clone the repository:
```bash
git clone [https://github.com/YOUR_USERNAME/ContextDocs.git](https://github.com/YOUR_USERNAME/ContextDocs.git)
cd ContextDocs

```


2. Spin up the containers using Docker Compose:
```bash
docker-compose up --build

```


3. The FastAPI backend will be running at `http://localhost:8000`. You can check the health endpoint at `http://localhost:8000/`.

## 📌 API Endpoints

* `GET /` — Health check endpoint.
* `POST /api/upload` — Uploads and indexes a PDF document into ChromaDB.
* `POST /api/chat` — Queries the vector store for semantic matches and returns relevant document chunks with source page citations.

## 🚧 Versioning

* **v1.0.0** — Initial MVP release with PDF upload, local ChromaDB embeddings, FastAPI backend integration, and core semantic chunk retrieval.

---

## 🗂️ Complete File Configuration Layout

```text
.
├── client
│   ├── AGENTS.md
│   ├── app
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── CLAUDE.md
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── public
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── vercel.svg
│   │   └── window.svg
│   ├── README.md
│   └── tsconfig.json
├── docker-compose.yml
└── server
    ├── chroma_db
    │   ├── 513e989b-f40b-4b63-8327-4b8e08f2f2ef
    │   ├── chroma.sqlite3
    │   └── ff357a93-c9ad-4919-8b25-056ca644f782
    ├── Dockerfile
    ├── main.py
    ├── README.md
    ├── requirements.txt
    ├── uploaded_files
    │   ├── Documentation_ Fraud Detection via LSTM-VAE.pdf
    │   └── Web Develoer Vacant Position.pdf
    └── venv
        ├── Include
        ├── Lib
        ├── pyvenv.cfg
        ├── Scripts
        └── share

```

```

