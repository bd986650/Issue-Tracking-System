"use client";

import { useState, useEffect, useCallback } from "react";
import { useProjectStore } from "@/entities/project";
import { useIssueStore } from "@/entities/issue";
import { fetchIssues, submitCreateIssue, submitChangeIssueStatus } from "@/features/issue-management";
import { CreateIssueRequest } from "@/features/issue-management/model/issueTypes";
import IssueCard from "@/widgets/issues/IssueCard";
import CreateIssueModal from "@/widgets/issues/CreateIssueModal";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import { Plus, Filter } from "lucide-react";

export default function IssuesPage() {
  const { selectedProject } = useProjectStore();
  const { issues, setIssues } = useIssueStore();
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState("");

  const loadIssues = useCallback(async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      const issuesData = await fetchIssues(selectedProject.id);
      setIssues(issuesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки задач");
    } finally {
      setLoading(false);
    }
  }, [selectedProject, setIssues]);

  useEffect(() => {
    if (selectedProject) {
      loadIssues();
    }
  }, [selectedProject, loadIssues]);

  const handleCreateIssue = async (data: CreateIssueRequest) => {
    if (!selectedProject) return;

    try {
      await submitCreateIssue(selectedProject.id, data);
      await loadIssues(); // Перезагружаем список
    } catch (err) {
      throw err; // Ошибка будет обработана в модальном окне
    }
  };

  const handleChangeStatus = async (issueId: number, action: 'test' | 'progress' | 'done' | 'open') => {
    if (!selectedProject) return;

    try {
      await submitChangeIssueStatus(selectedProject.id, issueId, action);
      await loadIssues(); // Перезагружаем список
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка изменения статуса");
    }
  };

  if (!selectedProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Проект не выбран</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">Загрузка задач...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Задачи</h1>
            <p className="text-gray-600 mt-1">Проект: {selectedProject.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <UniversalButton
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              Фильтры
            </UniversalButton>

            <UniversalButton
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Создать задачу
            </UniversalButton>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {issues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Задач пока нет</p>
            <p className="text-gray-400 mt-2">Создайте первую задачу для начала работы</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue, index) => (
              <IssueCard
                key={issue.id || index}
                issue={issue}
                onChangeStatus={handleChangeStatus}
              />
            ))}
          </div>
        )}

        <CreateIssueModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateIssue}
          projectId={selectedProject.id}
        />
      </div>
    </div>
  );
}