import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, MessagesSquare, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import vkIcon from '../img/vk.svg';
import discordIcon from '../img/discord.svg';
import telegramIcon from '../img/telegram.svg';

interface SocialLink {
  id: number;
  icon: string;
  url: string;
  title: string;
  custom_icon?: string;
}

const servers = [
  { id: 'moded', name: 'PVE Rust-Z Modded' },
  { id: 'hard', name: 'PVE Rust-Z Hard' },
  { id: 'vanilla', name: 'PVE Rust-Z Vanilla' },
];

function HomePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const { data } = await supabase
        .from('social_links')
        .select('*')
        .order('id');
      
      setSocialLinks(data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
    }
  };

  const getIconSrc = (link: SocialLink) => {
    if (link.custom_icon) return link.custom_icon;
    
    switch (link.icon) {
      case 'vk':
        return vkIcon;
      case 'discord':
        return discordIcon;
      case 'telegram':
        return telegramIcon;
      default:
        return '';
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-gray-100 to-white'} flex flex-col items-center p-4 safe-top safe-bottom relative`}>
      {}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 p-3 rounded-full z-10 transition-colors ${
          isDark ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-700'
        }`}
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>

      {}
      <div className="w-full max-w-md mt-[5vh]">
        <h1 className={`text-2xl font-bold text-center mb-12 ${
          isDark ? 'text-gray-300' : 'text-gray-800'
        }`}>
          ВЫБЕРИТЕ СЕРВЕР
        </h1>
        
        <div className="space-y-4">
          {servers.map((server) => (
            <button
              key={server.id}
              onClick={() => navigate(`/server/${server.id}`)}
              className={`w-full py-4 px-6 ${
                isDark 
                  ? 'bg-gray-400/20 hover:bg-gray-400/30 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } rounded-lg transition-all transform active:scale-98 touch-manipulation text-lg font-medium`}
            >
              {server.name}
            </button>
          ))}
        </div>

        {}
        <div className="mt-20">
          <a
            href="https://rust-z.ru"
            target="_blank"
            rel="noopener noreferrer"
            className={`block mb-8 p-3 rounded-lg text-center transition-all transform hover:scale-105 ${
              isDark 
                ? 'bg-gray-800/30 hover:bg-gray-800/50 text-gray-300' 
                : 'bg-white/30 hover:bg-white/50 text-gray-700 shadow-sm'
            }`}
          >
            <div className="font-medium">rust-z.ru</div>
            <div className="text-sm opacity-75">rust-z.com</div>
          </a>
          <div className="flex justify-center space-x-10">
            {socialLinks.map((link) => (
              <a 
                key={link.id}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
              >
                <img 
                  src={getIconSrc(link)} 
                  alt={link.title} 
                  className="w-8 h-8" 
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;