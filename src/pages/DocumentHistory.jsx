import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchDocumentHistory, getDownloadUrl } from '../utils/api';

const DocumentHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const document = location.state?.document;

  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!document) {
      navigate('/documents');
      return;
    }
    loadHistory();
  }, [document]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetchDocumentHistory(document.id);
      setHistoryData(response.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (versionId) => {
    const url = getDownloadUrl(document.id, versionId, false);
    window.location.href = url;
  };

  if (!document) return null;

  return (
    <>
      {/* Header */}
      <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md border-b border-outline-variant pb-md">
        <div>
          <Link to="/documents" className="flex items-center gap-xs text-on-surface-variant hover:text-on-surface text-sm font-medium mb-md transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Documents
          </Link>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">{document.title} - Version History</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Track changes, compare versions, and manage document iterations.</p>
        </div>
        <div>
          <button className="flex items-center gap-xs border border-outline-variant text-on-surface hover:bg-surface-container-low font-button text-button py-sm px-md rounded-md transition-colors bg-surface opacity-50 cursor-not-allowed" title="Coming soon">
            <span className="material-symbols-outlined text-[20px]">upload</span>
            Upload New Version
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="max-w-4xl pt-sm pb-xl">
        <div className="relative pl-6 md:pl-8 border-l-2 border-outline-variant ml-3 md:ml-4 flex flex-col gap-xl">
          
          {isLoading ? (
            <div className="py-xl flex items-center text-on-surface-variant font-body-sm">
              <span className="material-symbols-outlined animate-spin mr-sm" style={{fontSize: '20px'}}>sync</span> Loading history...
            </div>
          ) : historyData.length === 0 ? (
            <div className="py-xl text-on-surface-variant font-body-sm italic">
              No history found for this document.
            </div>
          ) : (
            historyData.map((ver, index) => {
              const isCurrent = index === 0;
              
              return (
                <div className="relative" key={ver.id}>
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[35px] md:-left-[41px] top-4 w-4 h-4 rounded-full ${isCurrent ? 'bg-primary ring-surface' : 'bg-outline-variant ring-surface'} ring-4`}></div>
                  
                  {/* Card Content */}
                  <div className={`bg-surface border ${isCurrent ? 'border-primary border-l-4' : 'border-outline-variant'} rounded-lg shadow-sm overflow-hidden`}>
                    <div className="p-md flex flex-col gap-md">
                      
                      {/* Card Header */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-sm">
                        <div className="flex flex-wrap items-center gap-sm">
                          <span className={`${isCurrent ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant'} px-sm py-[2px] rounded font-label-mono text-label-mono`}>
                            {ver.version_label}
                          </span>
                          <h3 className="font-title-md text-base font-semibold text-on-surface">Version {ver.version_label}</h3>
                          {isCurrent && <span className="bg-[#bbf7d0] text-[#166534] px-xs py-[2px] rounded text-xs font-medium">Current</span>}
                        </div>
                        
                        <div className="flex items-center gap-sm">
                          <button 
                            onClick={() => handleDownload(ver.id)}
                            className={`flex items-center gap-xs ${isCurrent ? 'text-primary hover:text-[#003ea8]' : 'text-on-surface-variant hover:text-on-surface'} font-medium text-sm transition-colors`}
                          >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Download
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="font-body-sm text-on-surface">{ver.changes_summary || "No change description provided."}</p>
                      
                      {/* Meta */}
                      <div className="flex items-center gap-md text-on-surface-variant text-xs">
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {new Date(ver.created_at).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-xs">
                          <span className="material-symbols-outlined text-[14px]">person</span>
                          {ver.uploaded_by_name}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default DocumentHistory;
