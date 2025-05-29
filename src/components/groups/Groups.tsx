import React, { useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGroups } from "../../context/GroupContext";

const CATEGORIES = [
  "Technology",
  "Science",
  "Arts",
  "Sports",
  "Music",
  "Gaming",
  "Education",
  "Business",
  "Health",
  "Other",
];

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const { groups, loading, createGroup, refreshGroups } = useGroups();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    category: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation (you can extend this)
    if (!newGroup.name.trim() || !newGroup.category.trim() || !newGroup.description.trim()) {
      return;
    }

    try {
      setCreating(true);
      await createGroup({
        name: newGroup.name.trim(),
        category: newGroup.category.trim(),
        description: newGroup.description.trim(),
      });
      setNewGroup({ name: "", category: "", description: "" });
      setShowCreateModal(false);
      await refreshGroups();
    } catch (error) {
      console.error("Failed to create group:", error);
      // Optionally show user feedback here
    } finally {
      setCreating(false);
    }
  };

  const handleChatClick = (groupId: string, groupName: string) => {
    navigate(`/groups/${groupId}/chat`, { state: { groupName } });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Group
        </button>
      </div>

      {loading && <p>Loading groups...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.$id}
            className="bg-white dark:bg-dark-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleChatClick(group.$id!, group.name)}
          >
            <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
            <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm mb-4">
              {group.category}
            </span>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{group.description}</p>
            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent parent click
                  handleChatClick(group.$id!, group.name);
                }}
                className="flex items-center text-primary-500 hover:text-primary-600"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-200 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-dark-100 dark:border-dark-100"
                  required
                  disabled={creating}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newGroup.category}
                  onChange={(e) => setNewGroup({ ...newGroup, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-dark-100 dark:border-dark-100"
                  required
                  disabled={creating}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-dark-100 dark:border-dark-100"
                  rows={3}
                  required
                  disabled={creating}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 rounded-md"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
