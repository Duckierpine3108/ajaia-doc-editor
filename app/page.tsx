"use client";

import { useState, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { FileText, Share2, Plus, Upload, User, CheckCircle2 } from "lucide-react";
import { parse } from "marked";

export default function Home() {
  const [currentUser, setCurrentUser] = useState({ id: "alice-id", name: "Alice (Owner)", email: "alice@ajaia.internal" });
  const [ownedDocs, setOwnedDocs] = useState<any[]>([]);
  const [sharedDocs, setSharedDocs] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetchDocs(currentUser.id);
  }, [currentUser]);

  const fetchDocs = async (userId: string) => {
    const res = await fetch(`/api/documents?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setOwnedDocs(data.owned || []);
      setSharedDocs(data.shared || []);
    }
  };

  const handleUserSwitch = (email: string) => {
    const id = email === "alice@ajaia.internal" ? "alice-id" : "bob-id";
    const name = email === "alice@ajaia.internal" ? "Alice (Owner)" : "Bob (Collaborator)";
    setCurrentUser({ id, name, email });
    setSelectedDoc(null);
  };

  const createNewDoc = async (initialTitle = "Untitled Document", initialContent = "<p>Start typing...</p>") => {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: initialTitle, content: initialContent, ownerId: currentUser.id }),
    });
    if (res.ok) {
      const newDoc = await res.json();
      setSelectedDoc(newDoc);
      setTitle(newDoc.title);
      setContent(newDoc.content);
      fetchDocs(currentUser.id);
    }
  };

  const saveDoc = async () => {
    if (!selectedDoc) return;
    const res = await fetch(`/api/documents/${selectedDoc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      setStatusMsg("Saved!");
      setTimeout(() => setStatusMsg(""), 2000);
      fetchDocs(currentUser.id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      let parsedHtml = file.name.endsWith(".md") ? await parse(text) : `<p>${text.replace(/\n/g, "<br/>")}</p>`;
      createNewDoc(file.name.replace(/\.[^/.]+$/, ""), parsedHtml);
    };
    reader.readAsText(file);
  };

  const handleShare = async () => {
    if (!selectedDoc || !shareEmail) return;
    const res = await fetch(`/api/documents/${selectedDoc.id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetEmail: shareEmail }),
    });
    if (res.ok) {
      setStatusMsg(`Shared with ${shareEmail}`);
      setShareEmail("");
      setTimeout(() => setStatusMsg(""), 3000);
      fetchDocs(currentUser.id);
    } else {
      setStatusMsg("User not found!");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-black">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" />
          <h1 className="font-bold text-lg">Ajaia DocEditor</h1>
        </div>
        <div className="flex items-center gap-3">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium">Viewing As:</span>
          <select
            value={currentUser.email}
            onChange={(e) => handleUserSwitch(e.target.value)}
            className="bg-slate-800 text-white text-sm p-1.5 rounded border border-slate-700"
          >
            <option value="alice@ajaia.internal">Alice (alice@ajaia.internal)</option>
            <option value="bob@ajaia.internal">Bob (bob@ajaia.internal)</option>
          </select>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-white border-r p-4 flex flex-col gap-6">
          <button onClick={() => createNewDoc()} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium text-sm transition">
            <Plus className="w-4 h-4" /> New Document
          </button>
          
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Import File (.txt / .md)</label>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 p-3 rounded-lg hover:border-blue-500 cursor-pointer bg-slate-50 text-xs text-gray-600">
              <Upload className="w-4 h-4 text-blue-500" /> Upload File
              <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">My Documents ({ownedDocs.length})</span>
              <div className="space-y-1">
                {ownedDocs.map((doc) => (
                  <button key={doc.id} onClick={() => { setSelectedDoc(doc); setTitle(doc.title); setContent(doc.content); }} className={`w-full text-left p-2 rounded text-sm flex items-center justify-between ${selectedDoc?.id === doc.id ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-100"}`}>
                    <span className="truncate">{doc.title}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Shared With Me ({sharedDocs.length})</span>
              <div className="space-y-1">
                {sharedDocs.map((doc) => (
                  <button key={doc.id} onClick={() => { setSelectedDoc(doc); setTitle(doc.title); setContent(doc.content); }} className={`w-full text-left p-2 rounded text-sm flex items-center justify-between ${selectedDoc?.id === doc.id ? "bg-purple-50 text-purple-700 font-medium" : "hover:bg-gray-100"}`}>
                    <span className="truncate">{doc.title}</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Shared</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
          {selectedDoc ? (
            <>
              <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="font-bold text-xl border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 flex-1 bg-transparent" />
                <div className="flex items-center gap-3">
                  {statusMsg && <span className="text-xs text-green-600 flex items-center gap-1 font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> {statusMsg}</span>}
                  <button onClick={saveDoc} className="bg-slate-800 text-white text-sm px-4 py-2 rounded hover:bg-slate-900 transition">Save Changes</button>
                </div>
              </div>

              {selectedDoc.ownerId === currentUser.id && (
                <div className="bg-white p-3 rounded-lg border flex items-center gap-3">
                  <Share2 className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Share:</span>
                  <input type="email" placeholder="Email (e.g. bob@ajaia.internal)" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} className="text-xs border p-1.5 rounded flex-1 max-w-xs bg-transparent" />
                  <button onClick={handleShare} className="bg-blue-50 text-blue-600 border border-blue-200 text-xs px-3 py-1.5 rounded hover:bg-blue-100 font-medium">Grant Access</button>
                </div>
              )}

              <Editor content={content} onChange={(html) => setContent(html)} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
              <FileText className="w-12 h-12 stroke-1" />
              <p className="text-sm">Select a document or create a new one to start editing</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}