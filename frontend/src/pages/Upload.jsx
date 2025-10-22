import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Upload = () => {
  const [resume, setResume] = useState(null);
  const [jd, setJd] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);

  // Fetch existing documents
  React.useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('/api/documents/list');
        setDocuments(response.data);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    fetchDocuments();
  }, []);

  const onDropResume = useCallback((acceptedFiles) => {
    setResume(acceptedFiles[0]);
  }, []);

  const onDropJd = useCallback((acceptedFiles) => {
    setJd(acceptedFiles[0]);
  }, []);

  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await axios.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  };

  const handleUpload = async () => {
    if (!resume || !jd) {
      toast.error('Please upload both resume and job description');
      return;
    }

    setUploading(true);
    try {
      await Promise.all([
        uploadFile(resume, 'resume'),
        uploadFile(jd, 'jd'),
      ]);

      toast.success('Documents uploaded successfully!');
      setResume(null);
      setJd(null);

      // Refresh documents list
      const response = await axios.get('/api/documents/list');
      setDocuments(response.data);
    } catch (error) {
      toast.error('Upload failed: ' + error.response?.data?.message);
    }
    setUploading(false);
  };

  const deleteDocument = async (id) => {
    try {
      await axios.delete(`/api/documents/${id}`);
      toast.success('Document deleted');
      setDocuments(documents.filter(doc => doc._id !== id));
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const { getRootProps: getResumeProps, getInputProps: getResumeInputProps } = useDropzone({
    onDrop: onDropResume,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  const { getRootProps: getJdProps, getInputProps: getJdInputProps } = useDropzone({
    onDrop: onDropJd,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  const hasBothDocuments = documents.some(doc => doc.type === 'resume') &&
                          documents.some(doc => doc.type === 'jd');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl mt-10 font-bold text-center mb-8">Upload Documents</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Resume Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Resume</h2>
          <div {...getResumeProps()} className="cursor-pointer">
            <input {...getResumeInputProps()} />
            <div className="text-center">
              <div className="text-4xl mb-4">📄</div>
              {resume ? (
                <p className="text-green-600">{resume.name}</p>
              ) : (
                <p className="text-gray-500">
                  Drag & drop your resume PDF here, or click to select
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Job Description Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <div {...getJdProps()} className="cursor-pointer">
            <input {...getJdInputProps()} />
            <div className="text-center">
              <div className="text-4xl mb-4">📋</div>
              {jd ? (
                <p className="text-green-600">{jd.name}</p>
              ) : (
                <p className="text-gray-500">
                  Drag & drop the job description PDF here, or click to select
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <button
          onClick={handleUpload}
          disabled={uploading || !resume || !jd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Documents'}
        </button>
      </div>

      {/* Existing Documents */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Documents</h2>
        {documents.length === 0 ? (
          <p className="text-gray-500">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc._id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="font-medium">{doc.filename}</p>
                  <p className="text-sm text-gray-500 capitalize">{doc.type}</p>
                  <p className="text-xs text-gray-400">
                    Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteDocument(doc._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {hasBothDocuments && (
        <div className="text-center">
          <Link
            to="/chat"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg inline-block"
          >
            Start Interview Practice
          </Link>
        </div>
      )}
    </div>
  );
};

export default Upload;
