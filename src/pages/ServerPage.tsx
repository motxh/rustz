import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronDown, X, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';

interface Accordion {
  id: number;
  title: string;
  content: string;
  serverId: string;
}

function ServerPage() {
  const { id } = useParams();
  const [accordions, setAccordions] = useState<Accordion[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccordions = async () => {
      try {
        console.log('Fetching accordions for server:', id);

        const { data, error } = await supabase
          .from('accordions')
          .select('*')
          .eq('serverId', id);

        if (error) {
          console.error('Error fetching accordions:', error.message);
          console.error('Error details:', error);
          return;
        }

        if (data) {
          console.log('Successfully fetched accordions:', data);
          setAccordions(data);
        } else {
          console.log('No accordions found for server:', id);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchAccordions();
  }, [id]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto relative">
          <button
            onClick={() => navigate('/')}
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-6 transition-all duration-300 transform hover:-translate-x-1 ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md'
            }`}
          >
            <ArrowLeft 
              size={18} 
              className="transition-transform duration-300 transform group-hover:scale-125" 
            />
            <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0 transform">
              Назад
            </span>
          </button>

          <div className="space-y-3">
            {accordions.map((accordion, index) => (
              <div
                key={accordion.id}
                className={`${
                  isDark ? 'bg-gray-400/20' : 'bg-gray-200'
                } rounded-lg overflow-hidden shadow-md transition-all duration-300`}
              >
                <button
                  className={`w-full p-4 flex justify-between items-center ${
                    isDark ? 'text-white' : 'text-gray-800'
                  } touch-manipulation`}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-medium">{accordion.title}</span>
                  {openIndex === index ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {openIndex === index && (
                  <div 
                    className={`p-5 ${
                      isDark 
                        ? 'text-gray-300 border-t border-gray-600' 
                        : 'text-gray-700 border-t border-gray-300'
                    } prose prose-sm max-w-none`}
                    dangerouslySetInnerHTML={{ __html: accordion.content }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServerPage;