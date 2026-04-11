import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Upload, FileText, CheckCircle, X, AlertCircle, Loader2 } from "lucide-react";
import { uploadDocument, getMyDocuments } from "../../api/documents";
import { useAuth } from "../../context/AuthContext";

interface UploadedFile { name: string; size: string; uploaded: boolean; serverPath?: string; }

const REQUIRED_DOCS = [
  { id: "aadhaar", name: "Aadhaar Card", description: "Both sides, clear and readable" },
  { id: "income", name: "Income Certificate", description: "Issued within 6 months" },
  { id: "caste", name: "Caste Certificate", description: "Government issued certificate" },
  { id: "marksheet", name: "12th Marksheet", description: "Attested copy" },
  { id: "bank", name: "Bank Details", description: "Passbook first page" },
  { id: "photo", name: "Passport Photo", description: "Recent photograph" },
];

export function DocumentUploadPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState<Record<string, UploadedFile>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) loadExistingDocs();
  }, [isAuthenticated]);

  const loadExistingDocs = async () => {
    try {
      const data = await getMyDocuments();
      const existing: Record<string, UploadedFile> = {};
      (data.documents || []).forEach((doc: any) => {
        existing[doc.docType] = { name: doc.filename || doc.docType, size: "", uploaded: true, serverPath: doc.filePath };
      });
      setFiles(existing);
    } catch { /* ignore, user may not have any docs yet */ }
  };

  const handleFileSelect = async (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Immediately show local state
    setFiles(prev => ({ ...prev, [docId]: { name: file.name, size: (file.size / 1024).toFixed(2) + " KB", uploaded: true } }));
    // Upload to backend if authenticated
    if (isAuthenticated) {
      setUploading(docId); setError("");
      try {
        const data = await uploadDocument(docId, file);
        setFiles(prev => ({ ...prev, [docId]: { name: file.name, size: (file.size / 1024).toFixed(2) + " KB", uploaded: true, serverPath: data.document?.filePath } }));
      } catch (err: any) {
        setError(`Failed to upload ${REQUIRED_DOCS.find(d => d.id === docId)?.name}: ${err.message}`);
      } finally { setUploading(null); }
    }
  };

  const handleDrop = async (docId: string, e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const fakeEvent = { target: { files: [file] } } as any;
    handleFileSelect(docId, fakeEvent);
  };

  const handleRemoveFile = (docId: string) => {
    const newFiles = { ...files }; delete newFiles[docId]; setFiles(newFiles);
  };

  const handleSubmit = () => navigate("/applications");

  const uploadedCount = Object.keys(files).length;
  const progress = (uploadedCount / REQUIRED_DOCS.length) * 100;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Upload Documents</h1>
          <p className="text-xl text-muted-foreground">Upload required documents to complete your application</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-sm border border-border mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg">Upload Progress</h3>
            <span className="text-sm text-muted-foreground">{uploadedCount} of {REQUIRED_DOCS.length} documents</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="mb-1">Please ensure:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All documents are clear and readable</li>
              <li>File size should not exceed 2MB per document</li>
              <li>Accepted formats: PDF, JPG, PNG</li>
              <li>Documents should be recent and valid</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          {REQUIRED_DOCS.map((doc) => {
            const file = files[doc.id];
            const isUploaded = !!file;
            const isCurrentlyUploading = uploading === doc.id;

            return (
              <div key={doc.id} className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${isUploaded ? 'bg-green-50' : 'bg-primary/10'}`}>
                        {isCurrentlyUploading ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> :
                          isUploaded ? <CheckCircle className="w-5 h-5 text-green-600" /> : <FileText className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <h3 className="text-lg">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground">{doc.description}</p>
                      </div>
                    </div>
                    {isUploaded && (
                      <div className="ml-11 flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>{file.name}</span>
                        {file.size && <span className="text-xs">({file.size})</span>}
                        {file.serverPath && <span className="text-xs text-green-600">✓ Saved</span>}
                      </div>
                    )}
                  </div>
                  {isUploaded ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleRemoveFile(doc.id)}
                        className="px-4 py-2 border border-border rounded-lg hover:border-destructive hover:text-destructive hover:bg-destructive/5 transition-all flex items-center gap-2">
                        <X className="w-4 h-4" />Remove
                      </button>
                    </div>
                  ) : (
                    <div className="w-full md:w-auto">
                      <label htmlFor={`file-${doc.id}`} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(doc.id, e)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg cursor-pointer hover:shadow-lg transition-all">
                        <Upload className="w-5 h-5" /><span>Upload File</span>
                      </label>
                      <input id={`file-${doc.id}`} type="file" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileSelect(doc.id, e)} className="hidden" />
                      <p className="text-xs text-center text-muted-foreground mt-2">or drag and drop</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex gap-4">
          <button onClick={() => navigate("/scholarships")}
            className="flex-1 px-6 py-4 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
            Save as Draft
          </button>
          <button onClick={handleSubmit} disabled={uploadedCount < REQUIRED_DOCS.length}
            className={`flex-1 px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${uploadedCount < REQUIRED_DOCS.length ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-xl"}`}>
            <CheckCircle className="w-5 h-5" />Submit Application
          </button>
        </div>

        <div className="mt-8 bg-primary/5 rounded-xl p-6">
          <h3 className="mb-3">Need Help with Documents?</h3>
          <p className="text-sm text-muted-foreground mb-4">Our support team can guide you through the documentation process</p>
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-white border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all">Chat with Support</button>
            <button className="px-6 py-2 bg-white border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all">View Sample Documents</button>
          </div>
        </div>
      </div>
    </div>
  );
}
