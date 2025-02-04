import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAdminTheme } from '../context/AdminThemeContext';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SocialLink {
  id: number;
  icon: string;
  url: string;
  title: string;
  custom_icon?: string;
}

const defaultSocialLinks: Omit<SocialLink, 'id'>[] = [
  { icon: 'discord', url: '', title: 'Discord' },
  { icon: 'vk', url: '', title: 'VK' },
  { icon: 'telegram', url: '', title: 'Telegram' }
];

const SettingsPage = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { theme } = useAdminTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('id');

      if (error) throw error;
      
      if (!data || data.length === 0) {
        setSocialLinks(defaultSocialLinks.map((link, index) => ({
          ...link,
          id: index + 1
        })));
      } else {
        setSocialLinks(data);
      }
    } catch (error) {
      console.error('Error fetching social links:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSocialLink = (id: number, url: string) => {
    setSocialLinks(socialLinks.map(link => 
      link.id === id ? { ...link, url } : link
    ));
  };

  const saveSocialLinks = async () => {
    try {
      setSaving(true);
      
      await supabase.from('social_links').delete().not('id', 'is', null);
      
      const linksWithoutId = socialLinks.map(({ id, ...rest }) => ({
        icon: rest.icon,
        url: rest.url,
        title: rest.title,
        custom_icon: rest.custom_icon || null
      }));
      
      const { error } = await supabase
        .from('social_links')
        .insert(linksWithoutId);
      
      if (error) {
        console.error('Save error details:', error);
        throw error;
      }
      
      alert('Настройки сохранены!');
      fetchSocialLinks();
    } catch (error) {
      console.error('Error saving social links:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleIconUpload = async (id: number, file: File) => {
    try {
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер: 2MB');
        return;
      }

      if (!file.type.match(/^image\/(png|jpeg|svg\+xml)$/)) {
        alert('Поддерживаются только форматы PNG, JPG и SVG');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `icons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('social-media-icons')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('social-media-icons')
        .getPublicUrl(filePath);

      setSocialLinks(socialLinks.map(link => 
        link.id === id ? { ...link, custom_icon: publicUrl } : link
      ));
    } catch (error) {
      console.error('Error uploading icon:', error);
      alert('Ошибка при загрузке иконки');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'} p-6`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className={`p-2 rounded-lg hover:bg-opacity-80 ${
                isDark ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-600'
              }`}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Настройки социальных сетей
            </h1>
          </div>
          <button
            onClick={saveSocialLinks}
            disabled={saving}
            className={`px-4 py-2 bg-green-500 text-white rounded-lg 
              hover:bg-green-600 flex items-center gap-2 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            <Save size={20} />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>

        <div className={`${
          isDark ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow-lg p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {socialLinks.map((link) => (
              <div
                key={link.id}
                className={`p-6 rounded-lg border ${
                  isDark 
                    ? 'border-gray-700 bg-gray-750' 
                    : 'border-gray-200 bg-gray-50'
                } hover:border-blue-500 transition-colors`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full relative group ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <img 
                      src={link.custom_icon || `/icons/${link.icon}.svg`}
                      alt={link.title}
                      className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Upload className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleIconUpload(link.id, file);
                        }}
                      />
                    </label>
                  </div>
                  <h3 className={`text-xl font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {link.title}
                  </h3>
                </div>
                <div>
                  <label className={`block mb-2 text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Ссылка
                  </label>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(link.id, e.target.value)}
                    placeholder={`Введите ссылку на ${link.title}`}
                    className={`w-full p-4 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 placeholder-gray-400'
                    } focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                {link.url && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-4 block text-sm ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    } hover:underline`}
                  >
                    Проверить ссылку
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 