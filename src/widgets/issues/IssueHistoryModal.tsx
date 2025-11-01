"use client";

import { useState, useEffect } from 'react';
import { useProjectStore } from '@/entities/project';
import { fetchIssueHistory } from '@/features/issue-management';
import { IssueHistory } from '@/features/issue-management';
import { X, Clock, User } from 'lucide-react';

interface IssueHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: number;
}

const getChangeTypeLabel = (changeType: string): string => {
  const labels: Record<string, string> = {
    'STATUS_CHANGE': 'Изменение статуса',
    'TITLE_CHANGE': 'Изменение названия',
    'DESCRIPTION_CHANGE': 'Изменение описания',
    'PRIORITY_CHANGE': 'Изменение приоритета',
    'ASSIGNEE_CHANGE': 'Изменение исполнителя',
    'SPRINT_CHANGE': 'Изменение спринта',
  };
  return labels[changeType] || changeType;
};

export default function IssueHistoryModal({
  isOpen,
  onClose,
  issueId
}: IssueHistoryModalProps) {
  const { selectedProject } = useProjectStore();
  const [history, setHistory] = useState<IssueHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && selectedProject && issueId) {
      loadHistory();
    } else {
      setHistory([]);
      setError(null);
    }
  }, [isOpen, selectedProject, issueId]);

  const loadHistory = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);
      setError(null);
      const historyData = await fetchIssueHistory(selectedProject.id, issueId);
      setHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки истории");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Блюр фона */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Модальное окно */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">История изменений задачи</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600">Загрузка истории...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">История изменений пока пуста</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border-l-4 border-blue-500 bg-gray-50 rounded-r-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {item.changedBy.fullName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.changedBy.email}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">
                        {getChangeTypeLabel(item.changeType)}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(item.changeDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {(item.oldValue || item.newValue) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs font-medium text-gray-500 mb-1 block">
                            Было:
                          </span>
                          <span className="text-sm text-gray-700 bg-red-50 px-2 py-1 rounded">
                            {item.oldValue || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500 mb-1 block">
                            Стало:
                          </span>
                          <span className="text-sm text-gray-700 bg-green-50 px-2 py-1 rounded">
                            {item.newValue || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

