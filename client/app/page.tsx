"use client";

import { useState } from "react";
import axios from "axios";
import { Upload, Send, FileText, Bot, User, Loader2 } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string; pages?: number[] }>>([]);

  const API_URL = "http://localhost:8000";

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Upload PDF to FastAPI backend
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadStatus("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus(`Success! Indexed ${response.data.chunks_indexed} text chunks.`);
    } catch (error: any) {
      setUploadStatus(`Upload failed: ${error.response?.data?.detail || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Send question to backend chat endpoint
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userQuery = question;
    setQuestion("");
    setChatHistory((prev) => [...prev, { role: "user", content: userQuery }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, { question: userQuery });
      setChatHistory((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: response.data.relevant_context,
          pages: response.data.source_pages 
        },
      ]);
    } catch (error: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error.response?.data?.detail || "Could not reach backend server."}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar - Document Upload Panel */}
      <aside className="w-80 border-r border-slate-800 p-6 flex flex-col justify-between bg-slate-950">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-indigo-400 flex items-center gap-2">
            <FileText className="w-6 h-6" /> ContextDocs AI
          </h1>
          <p className="text-sm text-slate-400 mt-1">Chat directly with your technical papers or documents.</p>

          <div className="mt-8 space-y-4">
            <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-900/50 transition">
              <Upload className="w-8 h-8 text-indigo-400 mb-2" />
              <span className="text-sm font-medium text-slate-300">Choose a PDF file</span>
              <span className="text-xs text-slate-500 mt-1">{file ? file.name : "No file selected"}</span>
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? "Processing Vectors..." : "Upload & Index PDF"}
            </button>

            {uploadStatus && (
              <p className={`text-xs p-3 rounded-lg ${uploadStatus.includes("Success") ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-rose-950 text-rose-300 border border-rose-800"}`}>
                {uploadStatus}
              </p>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-500 border-t border-slate-800 pt-4">
          Phase 1 Portfolio Project • Next.js & FastAPI RAG
        </div>
      </aside>

      {/* Main Chat Interface */}
      <section className="flex-1 flex flex-col h-screen">
        <header className="border-b border-slate-800 p-4 px-8 bg-slate-950/50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-200">Active Document Assistant</h2>
          <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-full">
            Local ChromaDB + HuggingFace
          </span>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl w-full mx-auto">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
              <Bot className="w-12 h-12 text-slate-700" />
              <p>Upload a PDF document on the left, then ask questions about its contents here.</p>
            </div>
          ) : (
            chatHistory.map((msg, index) => (
              <div key={index} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none"}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.pages && msg.pages.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-700 text-xs text-indigo-300 flex gap-2">
                      <span>Source Pages: {msg.pages.join(", ")}</span>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-slate-200" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-4 items-center text-slate-400 text-sm">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span>Searching document vector memory...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your uploaded document..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-6 rounded-xl transition flex items-center justify-center font-medium"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}