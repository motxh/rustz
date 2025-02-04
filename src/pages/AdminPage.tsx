import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAdminTheme } from '../context/AdminThemeContext';
import { Pencil, Trash2, X, Check, ChevronUp, ChevronDown, Plus, ChevronLeft, ChevronRight, LogOut, Settings, Sun, Moon } from 'lucide-react';
import JoditEditor from '../components/JoditEditor';
import { useNavigate } from 'react-router-dom';

interface Accordion {
  id: number;
  title: string;
  content: string;
  serverId: string;
}

function AdminPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [serverId, setServerId] = useState('');
  const [accordions, setAccordions] = useState<Accordion[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === 'dark';
  const [editingAccordion, setEditingAccordion] = useState<Accordion | null>(null);
  const [expandedAccordions, setExpandedAccordions] = useState<number[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  const servers = [
    { id: 'moded', name: 'PVE Rust-Z Modded' },
    { id: 'hard', name: 'PVE Rust-Z Hard' },
    { id: 'vanilla', name: 'PVE Rust-Z Vanilla' }
  ];

  const filteredAccordions = selectedServer 
    ? accordions.filter(acc => acc.serverId === selectedServer)
    : accordions;

  useEffect(() => {
    console.log('AdminPage mounted');
    fetchAccordions();
  }, []);

  const fetchAccordions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('accordions')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching accordions:', error.message);
        setError(error.message);
        return;
      }

      setAccordions(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(err instanceof Error ? err.message : 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} p-4 flex items-center justify-center`}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} p-4 flex items-center justify-center`}>
        Error: {error}
      </div>
    );
  }

  const addAccordion = async () => {
    try {
      if (!title || !content || !serverId) {
        alert('Пожалуйста, заполните все поля');
        return;
      }

      const { error } = await supabase
        .from('accordions')
        .insert([{ 
          title, 
          content,
          serverId 
        }]);

      if (error) {
        console.error('Error adding accordion:', error.message);
        alert('Ошибка при добавлении аккордеона');
        return;
      }

      setTitle('');
      setContent('');
      setServerId('');
      await fetchAccordions();
      alert('Аккордеон успешно добавлен!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Произошла неожиданная ошибка');
    }
  };

  const deleteAccordion = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот аккордеон?')) {
      try {
        const { error } = await supabase
          .from('accordions')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting accordion:', error.message);
          return;
        }

        fetchAccordions();
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  const updateAccordion = async (id: number, updatedData: Partial<Accordion>) => {
    try {
      const { error } = await supabase
        .from('accordions')
        .update(updatedData)
        .eq('id', id);

      if (error) {
        console.error('Error updating accordion:', error.message);
        return;
      }

      setEditingId(null);
      fetchAccordions();
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const startEditing = (accordion: Accordion) => {
    setEditingId(accordion.id);
    setEditingAccordion({ ...accordion });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (field: keyof Accordion, value: string) => {
    if (editingAccordion) {
      const updatedAccordion = { ...editingAccordion, [field]: value };
      console.log('Updating accordion:', field, value);
      setEditingAccordion(updatedAccordion);
    }
  };

  const saveAccordion = async (id: number) => {
    if (!editingAccordion) return;

    try {
      const { error } = await supabase
        .from('accordions')
        .update({
          title: editingAccordion.title,
          content: editingAccordion.content,
          serverId: editingAccordion.serverId
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating accordion:', error.message);
        alert('Ошибка при сохранении изменений');
        return;
      }

      setEditingId(null);
      setEditingAccordion(null);
      await fetchAccordions();
      alert('Изменения сохранены!');
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Произошла неожиданная ошибка');
    }
  };

  const toggleAccordion = (id: number) => {
    setExpandedAccordions(prev => 
      prev.includes(id) 
        ? prev.filter(accordionId => accordionId !== id)
        : [...prev, id]
    );
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {isAddingNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className={`${
            isDark ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow-xl w-[99vw] h-[98vh] flex flex-col`}>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Добавить новый аккордеон
              </h2>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-6">
              <div className="max-w-[6000px] mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                  <div className="md:col-span-5">
                    <label className={`block mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Заголовок
                    </label>
                    <input
                      type="text"
                      placeholder="Введите заголовок"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 rounded-lg border text-lg"
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Сервер
                    </label>
                    <select
                      value={serverId}
                      onChange={(e) => setServerId(e.target.value)}
                      className="w-full p-3 rounded-lg border text-lg"
                    >
                      <option value="">Выберите сервер</option>
                      {servers.map(server => (
                        <option key={server.id} value={server.id}>
                          {server.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex-1">
                  <label className={`block mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Содержимое
                  </label>
                  <div className="h-[calc(80vh-200px)] min-h-[600px] border rounded-lg">
                    <JoditEditor
                      content={content}
                      onChange={setContent}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setIsAddingNew(false)}
                className={`px-6 py-3 rounded-lg border ${
                  isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Отмена
              </button>
              <button
                onClick={addAccordion}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingAccordion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className={`${
            isDark ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow-xl w-[99vw] h-[98vh] flex flex-col`}>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Редактировать аккордеон
              </h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingId(null);
                  setEditingAccordion(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-6">
              <div className="max-w-[6000px] mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                  <div className="md:col-span-5">
                    <label className={`block mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Заголовок
                    </label>
                    <input
                      type="text"
                      value={editingAccordion.title}
                      onChange={(e) => handleEditChange('title', e.target.value)}
                      className="w-full p-3 rounded-lg border text-lg"
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                      Сервер
                    </label>
                    <select
                      value={editingAccordion.serverId}
                      onChange={(e) => handleEditChange('serverId', e.target.value)}
                      className="w-full p-3 rounded-lg border text-lg"
                    >
                      {servers.map(server => (
                        <option key={server.id} value={server.id}>
                          {server.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex-1">
                  <label className={`block mb-2 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    Содержимое
                  </label>
                  <div className="h-[calc(80vh-200px)] min-h-[600px] border rounded-lg">
                    <JoditEditor
                      content={editingAccordion.content}
                      onChange={(content) => handleEditChange('content', content)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingId(null);
                  setEditingAccordion(null);
                }}
                className={`px-6 py-3 rounded-lg border ${
                  isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  saveAccordion(editingAccordion.id);
                  setIsEditModalOpen(false);
                }}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed bottom-4 left-4 z-40 md:hidden bg-blue-500 text-white p-3 rounded-full shadow-lg ${
            isSidebarOpen ? 'translate-x-48' : 'translate-x-0'
          } transition-transform duration-300`}
        >
          {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>

        <div className={`fixed md:static inset-y-0 left-0 z-30 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-300 w-64 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Серверы
              </h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedServer(null)}
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedServer === null
                    ? 'bg-blue-500 text-white'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Все серверы
              </button>
              {servers.map(server => (
                <button
                  key={server.id}
                  onClick={() => setSelectedServer(server.id)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selectedServer === server.id
                      ? 'bg-blue-500 text-white'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {server.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`flex-1 overflow-auto transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'ml-0'
        }`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedServer 
                  ? servers.find(s => s.id === selectedServer)?.name 
                  : 'Все аккордеоны'}
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg border flex items-center space-x-2 ${
                    isDark 
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className={`px-4 py-2 rounded-lg border flex items-center space-x-2 ${
                    isDark 
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={20} />
                  <span>Настройки</span>
                </button>
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Добавить</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-lg border flex items-center space-x-2 ${
                    isDark 
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LogOut size={20} />
                  <span>Выйти</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredAccordions.map((accordion) => (
                <div
                  key={accordion.id}
                  className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                    isDark ? 'border border-gray-700' : 'border border-gray-200'
                  }`}
                >
                  <div>
                    <div className="p-3 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-base truncate">
                            {accordion.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {servers.find(s => s.id === accordion.serverId)?.name || accordion.serverId}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => toggleAccordion(accordion.id)}
                            className="p-1.5 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            {expandedAccordions.includes(accordion.id) ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => startEditing(accordion)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteAccordion(accordion.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {expandedAccordions.includes(accordion.id) && (
                        <div 
                          className="mt-3 prose prose-sm max-w-none text-sm"
                          dangerouslySetInnerHTML={{ __html: accordion.content }}
                        />
                      )}
                    </div>
                  </div>
                  {!expandedAccordions.includes(accordion.id) && (
                    <div className="px-3 py-1.5 bg-gray-50 text-xs text-gray-500">
                      Нажмите для просмотра содержимого
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage; 