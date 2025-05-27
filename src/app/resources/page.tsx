'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StoredResource } from '../../../lib/database';
import { ConfirmModal, FormModal } from '../../components/Modal';

export default function ResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<StoredResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResources, setFilteredResources] = useState<StoredResource[]>([]);

  // File upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    // Filter resources based on search query
    if (searchQuery.trim()) {
      const filtered = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.parsedContent.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredResources(filtered);
    } else {
      setFilteredResources(resources);
    }
  }, [searchQuery, resources]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) {
      alert('请选择文件并输入标题');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle);
      formData.append('description', uploadDescription);

      const response = await fetch('/api/resources/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('文件上传成功！');
        setShowUploadModal(false);
        setUploadTitle('');
        setUploadDescription('');
        setSelectedFile(null);
        fetchResources(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`上传失败: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    console.log('Delete button clicked for resource:', id);
    setResourceToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;

    try {
      setDeleting(true);
      console.log('Deleting resource with ID:', resourceToDelete);
      const response = await fetch(`/api/resources/${resourceToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Delete result:', result);
        alert('资源删除成功！');
        fetchResources(); // Refresh the list
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
        alert(`删除失败: ${error.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('删除失败，请检查网络连接后重试');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setResourceToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    console.log('User cancelled deletion');
    setShowDeleteModal(false);
    setResourceToDelete(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'md':
        return '📝';
      case 'text':
        return '📰';
      default:
        return '📁';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'PDF文档';
      case 'md':
        return 'Markdown文件';
      case 'text':
        return '文本文件';
      default:
        return '未知类型';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">资源管理</h1>
            <p className="text-sm text-gray-600">管理和上传您的文档资源</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              📤 上传文件
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              返回主页
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索资源..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">加载中...</p>
            </div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-4">📚</div>
              <p className="text-lg font-medium text-gray-900">
                {searchQuery ? '未找到匹配的资源' : '暂无资源'}
              </p>
              <p className="text-sm text-gray-500">
                {searchQuery ? '试试其他搜索词' : '点击上传文件按钮开始添加资源'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getTypeIcon(resource.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getTypeLabel(resource.type)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteClick(resource.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除资源"
                  >
                    🗑️
                  </button>
                </div>

                {resource.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>文件名:</span>
                    <span className="font-mono">{resource.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>大小:</span>
                    <span>{formatFileSize(resource.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>创建时间:</span>
                    <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 line-clamp-3">
                    {resource.parsedContent.substring(0, 150)}
                    {resource.parsedContent.length > 150 && '...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <FormModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadTitle('');
          setUploadDescription('');
          setSelectedFile(null);
        }}
        onSubmit={handleFileUpload}
        title="上传文件"
        submitText="上传"
        cancelText="取消"
        isSubmitting={uploading}
        canSubmit={!!(selectedFile && uploadTitle.trim())}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标题 *
          </label>
          <input
            type="text"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="输入资源标题"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            描述
          </label>
          <textarea
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="输入资源描述（可选）"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文件 *
          </label>
          <input
            type="file"
            accept=".pdf,.md,.markdown,.txt"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            支持的文件类型: PDF, Markdown (.md), 文本文件 (.txt)
          </p>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="确认删除"
        message="确定要删除这个资源吗？此操作无法撤销。"
        confirmText="确认删除"
        cancelText="取消"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={deleting}
      />
    </div>
  );
} 