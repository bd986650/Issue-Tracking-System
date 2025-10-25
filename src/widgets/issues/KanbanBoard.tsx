"use client";

import { useState } from 'react';
import { useProjectStore } from '@/entities/project';
import { useIssueStore } from '@/entities/issue';
import { Issue, IssueStatus, IssueType, Priority } from '@/entities/issue';
import { Plus, Bug, Zap, AlertCircle, Trash2 } from 'lucide-react';
import CreateIssueModal from './CreateIssueModal';
import EditIssueModal from './EditIssueModal';


const getTypeIcon = (type: IssueType) => {
  switch (type) {
    case "BUG":
      return <Bug size={16} className="text-red-500" />;
    case "FEATURE":
      return <Zap size={16} className="text-blue-500" />;
    default:
      return <Zap size={16} />;
  }
};

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case "HIGH":
      return 'text-red-600 bg-red-100';
    case "MEDIUM":
      return 'text-yellow-600 bg-yellow-100';
    case "LOW":
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};


const IssueCard = ({ 
  issue, 
  onClick,
  onDelete
}: { 
  issue: Issue; 
  onClick: (issue: Issue) => void;
  onDelete: (issueId: number) => void;
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', issue.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      onDelete(issue.id);
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onClick(issue)}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getTypeIcon(issue.type)}
          <h3 className="font-semibold text-gray-900 text-sm">{issue.title}</h3>
        </div>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{issue.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
            {issue.priority}
          </span>
          {issue.sprint && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {issue.sprint.name}
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        {issue.assignee ? `Назначен: ${issue.assignee.fullName}` : 'Не назначен'}
      </div>
    </div>
  );
};

const KanbanColumn = ({ 
  title, 
  issues, 
  onCreateIssue,
  onIssueClick,
  onDeleteIssue,
  onDrop
}: { 
  title: string; 
  issues: Issue[]; 
  onCreateIssue: () => void;
  onIssueClick: (issue: Issue) => void;
  onDeleteIssue: (issueId: number) => void;
  onDrop: (issueId: number, newStatus: IssueStatus) => void;
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const issueId = parseInt(e.dataTransfer.getData('text/plain'));
    const newStatus = getStatusFromTitle(title);
    onDrop(issueId, newStatus);
  };

  const getStatusFromTitle = (title: string): IssueStatus => {
    switch (title) {
      case 'Open':
        return "OPEN";
      case 'In Progress':
        return "IN_PROGRESS";
      case 'Testing':
        return "TESTING";
      case 'Done':
        return "DONE";
      default:
        return "OPEN";
    }
  };

  return (
    <div 
      className="bg-gray-50 rounded-lg p-4 min-h-[600px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
            {issues.length}
          </span>
        </div>
        <button
          onClick={onCreateIssue}
          className="flex items-center gap-1 bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-800 transition-colors"
        >
          <Plus size={14} />
          Создать
        </button>
      </div>
      
      <div className="space-y-3">
        {issues.map((issue) => (
          <IssueCard 
            key={issue.id} 
            issue={issue} 
            onClick={onIssueClick}
            onDelete={onDeleteIssue}
          />
        ))}
      </div>
    </div>
  );
};

export default function KanbanBoard() {
  const { selectedProject } = useProjectStore();
  const { 
    issues, 
    addIssue, 
    updateIssue, 
    removeIssue
  } = useIssueStore();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus>("OPEN");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle size={48} className="text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Выберите проект</h2>
        <p className="text-gray-500">Для просмотра задач необходимо выбрать проект в боковой панели</p>
      </div>
    );
  }

  const allIssues = issues;
  
  const issuesByStatus = {
    "OPEN": allIssues.filter((issue: Issue) => issue.status === "OPEN"),
    "IN_PROGRESS": allIssues.filter((issue: Issue) => issue.status === "IN_PROGRESS"),
    "TESTING": allIssues.filter((issue: Issue) => issue.status === "TESTING"),
    "DONE": allIssues.filter((issue: Issue) => issue.status === "DONE"),
  };

  const handleCreateIssue = (status: IssueStatus) => {
    setSelectedStatus(status);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedIssue(null);
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsEditModalOpen(true);
  };

  const handleDropIssue = (issueId: number, newStatus: IssueStatus) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      updateIssue({ ...issue, status: newStatus });
    }
  };

  const handleDeleteIssue = (issueId: number) => {
    removeIssue(issueId);
  };

  const handleSubmitIssue = (issueData: Partial<Issue>) => {
    addIssue({
      ...issueData,
      status: selectedStatus
    } as Issue);
    handleCloseCreateModal();
  };

  const handleUpdateIssue = (issueData: {
    id: number;
    title: string;
    description: string;
    type: IssueType;
    status: IssueStatus;
  }) => {
    const updatedIssue = {
      id: issueData.id,
      title: issueData.title,
      description: issueData.description,
      type: issueData.type,
      status: issueData.status,
      projectId: selectedProject.id,
      priority: "MEDIUM" as Priority,
      creator: { id: '1', email: 'user@example.com', fullName: 'User' }
    };
    updateIssue(updatedIssue);
    handleCloseEditModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KanbanColumn
          title="Open"
          issues={issuesByStatus["OPEN"]}
          onCreateIssue={() => handleCreateIssue("OPEN")}
          onIssueClick={handleIssueClick}
          onDeleteIssue={handleDeleteIssue}
          onDrop={handleDropIssue}
        />
        <KanbanColumn
          title="In Progress"
          issues={issuesByStatus["IN_PROGRESS"]}
          onCreateIssue={() => handleCreateIssue("IN_PROGRESS")}
          onIssueClick={handleIssueClick}
          onDeleteIssue={handleDeleteIssue}
          onDrop={handleDropIssue}
        />
        <KanbanColumn
          title="Testing"
          issues={issuesByStatus["TESTING"]}
          onCreateIssue={() => handleCreateIssue("TESTING")}
          onIssueClick={handleIssueClick}
          onDeleteIssue={handleDeleteIssue}
          onDrop={handleDropIssue}
        />
        <KanbanColumn
          title="Done"
          issues={issuesByStatus["DONE"]}
          onCreateIssue={() => handleCreateIssue("DONE")}
          onIssueClick={handleIssueClick}
          onDeleteIssue={handleDeleteIssue}
          onDrop={handleDropIssue}
        />
      </div>

      {/* Модальные окна */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        projectId={selectedProject.id}
        onSubmit={handleSubmitIssue}
      />
      
      <EditIssueModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        issue={selectedIssue}
        onUpdateIssue={handleUpdateIssue}
      />
    </div>
  );
}
