"use client";

import { useState } from "react";
import UniversalButton from "@/shared/ui/Buttons/UniversalButton";
import UniversalTextInput from "@/shared/ui/inputs/UniversalTextInput";
import { submitAddProjectMember } from "@/entities/project/service/projectService";
import { useProjectStore } from "@/entities/project";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { selectedProject } = useProjectStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !email.trim()) return;

    try {
      setLoading(true);
      setError("");
      await submitAddProjectMember(selectedProject.id, email.trim());
      setEmail("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка добавления участника");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Добавить участника</h2>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <UniversalTextInput
            label="Email участника"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
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
              disabled={loading || !email.trim()}
            >
              {loading ? "Добавление..." : "Добавить"}
            </UniversalButton>
          </div>
        </form>
      </div>
    </div>
  );
}
