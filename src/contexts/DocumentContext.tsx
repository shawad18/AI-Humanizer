import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface DocumentVersion {
  id: string;
  content: string;
  timestamp: Date;
  author: string;
  changes: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  originalContent?: string;
  humanizedContent?: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  collaborators: string[];
  isPublic: boolean;
  tags: string[];
  folder?: string;
  versions: DocumentVersion[];
  settings: {
    humanizationLevel: number;
    preserveFormatting: boolean;
    language: string;
  };
  metadata: {
    wordCount: number;
    characterCount: number;
    readingTime: number;
    aiDetectionScore?: number;
  };
}

interface DocumentContextType {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  createDocument: (title: string, content?: string) => Document;
  saveDocument: (document: Document) => Promise<void>;
  loadDocument: (id: string) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<void>;
  duplicateDocument: (id: string) => Promise<Document>;
  setCurrentDocument: (document: Document | null) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  addVersion: (documentId: string, content: string, changes: string) => void;
  shareDocument: (id: string, collaboratorEmail: string) => Promise<void>;
  exportDocument: (id: string, format: 'txt' | 'pdf' | 'docx' | 'latex') => Promise<void>;
  searchDocuments: (query: string) => Document[];
  getDocumentsByFolder: (folder: string) => Document[];
  getFolders: () => string[];
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

interface DocumentProviderProps {
  children: ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load documents from localStorage on mount
  useEffect(() => {
    const savedDocuments = localStorage.getItem('ai-humanizer-documents');
    if (savedDocuments) {
      try {
        const parsedDocs = JSON.parse(savedDocuments).map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
          versions: doc.versions.map((v: any) => ({
            ...v,
            timestamp: new Date(v.timestamp)
          }))
        }));
        setDocuments(parsedDocs);
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    }
  }, []);

  // Save documents to localStorage whenever documents change
  useEffect(() => {
    localStorage.setItem('ai-humanizer-documents', JSON.stringify(documents));
  }, [documents]);

  const calculateMetadata = (content: string) => {
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = content.length;
    const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute

    return {
      wordCount,
      characterCount,
      readingTime
    };
  };

  const createDocument = (title: string, content: string = ''): Document => {
    const newDocument: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: user?.email || 'anonymous',
      collaborators: [],
      isPublic: false,
      tags: [],
      versions: [],
      settings: {
        humanizationLevel: 5,
        preserveFormatting: true,
        language: 'en'
      },
      metadata: calculateMetadata(content)
    };

    setDocuments(prev => [newDocument, ...prev]);
    return newDocument;
  };

  const saveDocument = async (document: Document): Promise<void> => {
    setIsLoading(true);
    try {
      const updatedDocument = {
        ...document,
        updatedAt: new Date(),
        metadata: calculateMetadata(document.content)
      };

      setDocuments(prev => 
        prev.map(doc => doc.id === document.id ? updatedDocument : doc)
      );

      if (currentDocument?.id === document.id) {
        setCurrentDocument(updatedDocument);
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocument = async (id: string): Promise<Document | null> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const document = documents.find(doc => doc.id === id) || null;
      setCurrentDocument(document);
      return document;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      if (currentDocument?.id === id) {
        setCurrentDocument(null);
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
    } finally {
      setIsLoading(false);
    }
  };

  const duplicateDocument = async (id: string): Promise<Document> => {
    const originalDoc = documents.find(doc => doc.id === id);
    if (!originalDoc) {
      throw new Error('Document not found');
    }

    const duplicatedDoc = createDocument(
      `${originalDoc.title} (Copy)`,
      originalDoc.content
    );

    return duplicatedDoc;
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id
          ? { 
              ...doc, 
              ...updates, 
              updatedAt: new Date(),
              metadata: updates.content ? calculateMetadata(updates.content) : doc.metadata
            }
          : doc
      )
    );

    if (currentDocument?.id === id) {
      setCurrentDocument(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  const addVersion = (documentId: string, content: string, changes: string) => {
    const version: DocumentVersion = {
      id: `version_${Date.now()}`,
      content,
      timestamp: new Date(),
      author: user?.email || 'anonymous',
      changes
    };

    updateDocument(documentId, {
      versions: [...(documents.find(doc => doc.id === documentId)?.versions || []), version]
    });
  };

  const shareDocument = async (id: string, collaboratorEmail: string): Promise<void> => {
    setIsLoading(true);
    try {
      const document = documents.find(doc => doc.id === id);
      if (document && !document.collaborators.includes(collaboratorEmail)) {
        updateDocument(id, {
          collaborators: [...document.collaborators, collaboratorEmail]
        });
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setIsLoading(false);
    }
  };

  const exportDocument = async (id: string, format: 'txt' | 'pdf' | 'docx' | 'latex'): Promise<void> => {
    const document = documents.find(doc => doc.id === id);
    if (!document) {
      throw new Error('Document not found');
    }

    // Create downloadable content based on format
    let content = document.content;
    let mimeType = 'text/plain';
    let filename = `${document.title}.${format}`;

    switch (format) {
      case 'txt':
        mimeType = 'text/plain';
        break;
      case 'pdf':
        // In a real implementation, you'd use a PDF library
        mimeType = 'application/pdf';
        content = `PDF Export of: ${document.title}\n\n${content}`;
        break;
      case 'docx':
        // In a real implementation, you'd use a DOCX library
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'latex':
        mimeType = 'application/x-latex';
        content = `\\documentclass{article}\n\\begin{document}\n\\title{${document.title}}\n\\maketitle\n\n${content}\n\\end{document}`;
        break;
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = (document as any).createElement('a') as HTMLAnchorElement;
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const searchDocuments = (query: string): Document[] => {
    if (!query.trim()) return documents;

    const lowercaseQuery = query.toLowerCase();
    return documents.filter(doc =>
      doc.title.toLowerCase().includes(lowercaseQuery) ||
      doc.content.toLowerCase().includes(lowercaseQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getDocumentsByFolder = (folder: string): Document[] => {
    return documents.filter(doc => doc.folder === folder);
  };

  const getFolders = (): string[] => {
    const folders = new Set(documents.map(doc => doc.folder).filter(Boolean));
    return Array.from(folders) as string[];
  };

  const value: DocumentContextType = {
    documents,
    currentDocument,
    isLoading,
    createDocument,
    saveDocument,
    loadDocument,
    deleteDocument,
    duplicateDocument,
    setCurrentDocument,
    updateDocument,
    addVersion,
    shareDocument,
    exportDocument,
    searchDocuments,
    getDocumentsByFolder,
    getFolders
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};