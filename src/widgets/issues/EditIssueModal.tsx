"use client";

import { useState, useEffect } from 'react';
import { Issue, IssueType, IssueStatus } from '@/entities/issue';
import { useProjectStore } from '@/entities/project';
import { fetchIssueHistory } from '@/features/issue-management';
import { IssueHistory } from '@/features/issue-management';
import { X, Clock, User } from 'lucide-react';

interface EditIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: Issue | null;
  projectName?: string;
  onUpdateIssue: (issueData: {
    id: number;
    title: string;
    description: string;
    type: IssueType;
    status: IssueStatus;
  }) => void;
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

export default function EditIssueModal({
  isOpen,
  onClose,
  issue,
  projectName,
  onUpdateIssue
}: EditIssueModalProps) {
  const { selectedProject } = useProjectStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IssueType>("FEATURE");
  const [status, setStatus] = useState<IssueStatus>("OPEN");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<IssueHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Обновляем форму при изменении issue
  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description);
      setType(issue.type);
      setStatus(issue.status);
    }
  }, [issue]);

  // Загрузка истории при открытии панели истории
  useEffect(() => {
    if (showHistory && selectedProject && issue) {
      loadHistory();
    }
  }, [showHistory, selectedProject, issue]);

  const loadHistory = async () => {
    if (!selectedProject || !issue) return;

    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const historyData = await fetchIssueHistory(selectedProject.id, issue.id);
      setHistory(historyData);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Ошибка загрузки истории");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !title.trim() || !description.trim()) return;

    onUpdateIssue({
      id: issue.id,
      title: title.trim(),
      description: description.trim(),
      type,
      status
    });

    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Блюр фона */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Модальное окно */}
      <div className={`relative bg-white rounded-lg shadow-xl mx-4 max-h-[90vh] overflow-hidden flex transition-all duration-500 ease-in-out ${
        showHistory ? 'max-w-5xl w-full' : 'max-w-md w-full'
      }`}>
        {/* Основная часть формы */}
        <div className={`flex-shrink-0 transition-all duration-500 ease-in-out ${
          showHistory ? 'w-1/2 border-r border-gray-200' : 'w-full'
        }`}>
          {/* Заголовок */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Редактировать задачу</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  showHistory 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title="История изменений"
              >
                <Clock size={18} />
                История
              </button>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Контент формы */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название задачи *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите название задачи"
              required
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Опишите задачу подробно"
              required
            />
          </div>

          {/* Тип */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип задачи
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as IssueType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="FEATURE">Feature</option>
              <option value="BUG">Bug</option>
            </select>
          </div>

          {/* Статус */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="TESTING">Testing</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Проект (только для отображения) */}
          {projectName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Проект
              </label>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600">
                {projectName}
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Сохранить
            </button>
          </div>
        </form>
        </div>
        </div>

        {/* Панель истории справа */}
        {showHistory && (
          <div className="flex-shrink-0 w-1/2 bg-gray-50 overflow-hidden flex flex-col">
            {/* Заголовок панели истории */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">История изменений</h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Контент истории */}
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              {historyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-3 text-gray-600">Загрузка истории...</span>
                </div>
              ) : historyError ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600 text-sm">{historyError}</p>
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
                      className="border-l-4 border-blue-500 bg-white rounded-r-lg p-4 hover:shadow-md transition-shadow"
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
        )}
      </div>
    </div>
  );
}
