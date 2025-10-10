import React, { useState } from 'react';
import { Upload, Download, Search, Filter, FileText, Image, File, Eye, Edit, Trash2, Tag, User, Calendar, HardDrive } from 'lucide-react';
import * as XLSX from 'xlsx';

type DocCategory = 'Onboarding' | 'Troubleshooting';

interface DocItem {
  id: string;
  title: string;
  category: DocCategory;
  tags: string[];
  owner: string;
  sizeKB: number;
  version: number;
  updatedAt: string;
  url: string;
  description?: string;
  fileType: string;
}

const mockDocs: DocItem[] = [
  {
    id: 'doc-1',
    title: 'Security Agent Installation Guide',
    category: 'Onboarding',
    tags: ['installation', 'windows', 'agent'],
    owner: 'Omar Sleem',
    sizeKB: 2048,
    version: 3,
    updatedAt: '2025-01-15T10:30:00Z',
    url: '/docs/security-agent-install.pdf',
    description: 'Complete guide for installing security agents on Windows systems',
    fileType: 'pdf'
  },
  {
    id: 'doc-2',
    title: 'Network Troubleshooting Playbook',
    category: 'Troubleshooting',
    tags: ['network', 'connectivity', 'firewall'],
    owner: 'Sara Ibrahim',
    sizeKB: 1536,
    version: 2,
    updatedAt: '2025-01-14T14:20:00Z',
    url: '/docs/network-troubleshooting.pdf',
    description: 'Step-by-step network troubleshooting procedures',
    fileType: 'pdf'
  },
  {
    id: 'doc-3',
    title: 'API Integration Architecture',
    category: 'Onboarding',
    tags: ['api', 'integration', 'architecture'],
    owner: 'Omar Sleem',
    sizeKB: 3072,
    version: 1,
    updatedAt: '2025-01-13T09:15:00Z',
    url: '/docs/api-architecture.png',
    description: 'System architecture diagram for API integrations',
    fileType: 'image'
  },
  {
    id: 'doc-4',
    title: 'Log Analysis Best Practices',
    category: 'Troubleshooting',
    tags: ['logs', 'analysis', 'siem'],
    owner: 'Omar Sleem',
    sizeKB: 1024,
    version: 4,
    updatedAt: '2025-01-12T16:45:00Z',
    url: '/docs/log-analysis.md',
    description: 'Best practices for analyzing security logs and events',
    fileType: 'markdown'
  },
  {
    id: 'doc-5',
    title: 'Client Onboarding Checklist',
    category: 'Onboarding',
    tags: ['checklist', 'onboarding', 'process'],
    owner: 'John Smith',
    sizeKB: 512,
    version: 2,
    updatedAt: '2025-01-11T11:30:00Z',
    url: '/docs/onboarding-checklist.pdf',
    description: 'Complete checklist for new client onboarding process',
    fileType: 'pdf'
  }
];

const DocsPage: React.FC = () => {
  const [docs, setDocs] = useState<DocItem[]>(mockDocs);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);

  // Get all unique tags
  const allTags = [...new Set(docs.flatMap(doc => doc.tags))];

  // Filter documents
  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesTag = tagFilter === 'all' || doc.tags.includes(tagFilter);
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-400" />;
      case 'image':
        return <Image className="h-5 w-5 text-blue-400" />;
      case 'markdown':
        return <File className="h-5 w-5 text-green-400" />;
      default:
        return <File className="h-5 w-5 text-gray-400" />;
    }
  };

  // Format file size
  const formatFileSize = (sizeKB: number) => {
    if (sizeKB < 1024) return `${sizeKB} KB`;
    return `${(sizeKB / 1024).toFixed(1)} MB`;
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = filteredDocs.map(doc => ({
      'Title': doc.title,
      'Category': doc.category,
      'Tags': doc.tags.join(', '),
      'Owner': doc.owner,
      'Size': formatFileSize(doc.sizeKB),
      'Version': doc.version,
      'Updated': new Date(doc.updatedAt).toLocaleDateString(),
      'Description': doc.description || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Documents');
    XLSX.writeFile(wb, `documentation-library-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="mx-auto px-6 w-full max-w-[1800px] 2xl:max-w-[2000px] space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#E9EEF6]">Documentation Library</h1>
          <p className="text-[#A7B0C0] mt-2">Centralized repository for onboarding guides and troubleshooting documentation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToExcel}
            className="bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-4 py-2 rounded-lg hover:bg-[#14D8C4]/30 transition-colors duration-200 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-[#14D8C4] to-[#7C4DFF] hover:from-[#14D8C4]/80 hover:to-[#7C4DFF]/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
            <input
              type="text"
              placeholder="Search documents, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0B0F1A]/50 border border-white/8 rounded-2xl text-[#E9EEF6] placeholder-[#A7B0C0] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-white/70" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#0B0F1A]/50 border border-white/8 rounded-2xl px-4 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
              >
                <option value="all">All Categories</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Troubleshooting">Troubleshooting</option>
              </select>
            </div>

            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="bg-[#0B0F1A]/50 border border-white/8 rounded-2xl px-4 py-2 text-[#E9EEF6] focus:ring-2 focus:ring-[#14D8C4]/50 focus:border-[#14D8C4]/50 transition-all duration-200"
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-[#111726]/80 backdrop-blur-sm rounded-2xl border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#E9EEF6]">Documents ({filteredDocs.length})</h2>
          </div>

          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[28%]" />   {/* Document */}
                <col className="w-[12%]" />   {/* Category */}
                <col className="w-[22%]" />   {/* Tags */}
                <col className="w-[10%]" />   {/* Owner */}
                <col className="w-[10%]" />   {/* Updated */}
                <col className="w-[8%]"  />   {/* Size */}
                <col className="w-[10%]" />   {/* Actions */}
              </colgroup>
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Document</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Tags</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Owner</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Updated</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Size</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#A7B0C0]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="border-b border-white/5 hover:bg-[#0B0F1A]/30 transition-colors duration-200">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(doc.fileType)}
                        <div>
                          <div className="text-sm font-medium text-[#E9EEF6]">{doc.title}</div>
                          {doc.description && (
                            <div className="text-xs text-[#A7B0C0] mt-1 max-w-xs truncate">{doc.description}</div>
                          )}
                          <div className="text-xs text-[#A7B0C0] mt-1">v{doc.version}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                        doc.category === 'Onboarding' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {doc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0B0F1A]/50 text-[#A7B0C0] border border-white/10">
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 2 && (
                          <span className="text-xs text-[#A7B0C0]">+{doc.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 whitespace-nowrap">
                        <User className="h-4 w-4 text-white/70" />
                        <span className="text-sm text-[#E9EEF6]">{doc.owner}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 whitespace-nowrap">
                        <Calendar className="h-4 w-4 text-white/70" />
                        <span className="text-sm text-[#E9EEF6]">{new Date(doc.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 whitespace-nowrap">
                        <HardDrive className="h-4 w-4 text-white/70" />
                        <span className="text-sm text-[#E9EEF6]">{formatFileSize(doc.sizeKB)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDocs.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-white/70 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#E9EEF6] mb-2">No documents found</h3>
              <p className="text-[#A7B0C0]">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal Placeholder */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6">
            <h2 className="text-xl font-semibold text-[#E9EEF6] mb-4">Upload Document</h2>
            <p className="text-[#A7B0C0] mb-4">Upload functionality will be implemented here.</p>
            <button
              onClick={() => setShowUploadModal(false)}
              className="bg-[#14D8C4]/20 text-[#14D8C4] border border-[#14D8C4]/30 px-4 py-2 rounded-lg hover:bg-[#14D8C4]/30 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Document Details Modal Placeholder */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#111726]/95 backdrop-blur-md border border-white/8 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#E9EEF6]">{selectedDoc.title}</h2>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 text-[#A7B0C0] hover:text-[#E9EEF6] hover:bg-[#0B0F1A]/50 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Category</label>
                  <p className="text-[#E9EEF6]">{selectedDoc.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Owner</label>
                  <p className="text-[#E9EEF6]">{selectedDoc.owner}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Version</label>
                  <p className="text-[#E9EEF6]">v{selectedDoc.version}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Size</label>
                  <p className="text-[#E9EEF6]">{formatFileSize(selectedDoc.sizeKB)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {selectedDoc.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#0B0F1A]/50 text-[#A7B0C0] border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {selectedDoc.description && (
                <div>
                  <label className="block text-sm font-medium text-[#A7B0C0] mb-1">Description</label>
                  <p className="text-[#E9EEF6]">{selectedDoc.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocsPage;