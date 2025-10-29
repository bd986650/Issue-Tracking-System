"use client";

import { useState } from "react";
import { CreateIssueRequest, IssueType, Priority } from "@/features/issue-management";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import TextInput from "@/shared/ui/inputs/TextInput";
import { logger } from "@/shared/utils/logger";

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIssueRequest) => void;
  projectId: number;
}

export default function CreateIssueModal({ isOpen, onClose, onSubmit }: CreateIssueModalProps) {
  const [formData, setFormData] = useState<CreateIssueRequest>({
    title: "",
    description: "",
    type: "BUG",
    priority: "MEDIUM",
    startDate: "",
    endDate: "",
    sprintId: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Заполните все обязательные поля");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Очищаем данные от undefined значений
      const submitData: CreateIssueRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        priority: formData.priority,
      };
      
      // Добавляем только если есть значения
      if (formData.startDate) {
        submitData.startDate = formData.startDate;
      }
      if (formData.endDate) {
        submitData.endDate = formData.endDate;
      }
      if (formData.sprintId) {
        submitData.sprintId = formData.sprintId;
      }
      
      logger.info("Отправляем данные задачи", submitData);
      
      await onSubmit(submitData);
      setFormData({
        title: "",
        description: "",
        type: "BUG",
        priority: "MEDIUM",
        startDate: "",
        endDate: "",
        sprintId: undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка создания задачи");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Создать задачу</h2>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Название задачи"
              value={formData.title}
              onChange={(value) => setFormData(prev => ({ ...prev, title: value as string }))}
              placeholder="Введите название задачи"
              required
              minLength={3}
              maxLength={100}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип задачи *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as IssueType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="BUG">Ошибка</option>
                <option value="FEATURE">Функция</option>
              </select>
            </div>
          </div>

          <TextInput
            label="Описание задачи"
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value as string }))}
            placeholder="Введите описание задачи"
            required
            minLength={5}
            maxLength={1000}
            multiline
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Приоритет
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="HIGH">Высокий</option>
                <option value="MEDIUM">Средний</option>
                <option value="LOW">Низкий</option>
              </select>
            </div>
            
            <TextInput
              label="Дата начала"
              type="date"
              value={formData.startDate || ""}
              onChange={(value) => setFormData(prev => ({ ...prev, startDate: value as string }))}
            />
            
            <TextInput
              label="Дата окончания"
              type="date"
              value={formData.endDate || ""}
              onChange={(value) => setFormData(prev => ({ ...prev, endDate: value as string }))}
            />
          </div>

          <TextInput
            label="ID спринта"
            type="number"
            value={formData.sprintId ? formData.sprintId.toString() : ""}
            onChange={(value) => setFormData(prev => ({ 
              ...prev, 
              sprintId: value ? parseInt(value as string) : undefined 
            }))}
            placeholder="Введите ID спринта (необязательно)"
          />
          
          <div className="flex gap-3 justify-end">
            <UniversalButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </UniversalButton>
            <UniversalButton
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
            >
              {loading ? "Создание..." : "Создать задачу"}
            </UniversalButton>
          </div>
        </form>
      </div>
    </div>
  );
}