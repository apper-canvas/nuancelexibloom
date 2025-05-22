import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { X } from 'lucide-react';

const Settings = ({ isOpen, onClose }) => {
  const { currentTheme, setCurrentTheme, predefinedThemes } = useTheme();
  
  const [selectedTheme, setSelectedTheme] = useState(currentTheme.name.toLowerCase());
  const [customColors, setCustomColors] = useState({
    primary: currentTheme.primary,
    secondary: currentTheme.secondary,
    accent: currentTheme.accent,
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      const themeName = currentTheme.name.toLowerCase();
      setSelectedTheme(themeName);
      setCustomColors({
        primary: currentTheme.primary,
        secondary: currentTheme.secondary,
        accent: currentTheme.accent,
      });
    }
  }, [isOpen, currentTheme]);

  const handleThemeChange = (themeName) => {
    setSelectedTheme(themeName);
    
    if (themeName !== 'custom') {
      // Update custom colors to match the selected predefined theme
      setCustomColors({
        primary: predefinedThemes[themeName].primary,
        secondary: predefinedThemes[themeName].secondary,
        accent: predefinedThemes[themeName].accent,
      });
    }
  };

  const handleColorChange = (colorType, value) => {
    setCustomColors(prev => ({
      ...prev,
      [colorType]: value
    }));
    
    // Switch to custom theme when colors are changed
    if (selectedTheme !== 'custom') {
      setSelectedTheme('custom');
    }
  };

  const applyTheme = () => {
    let newTheme;
    
    if (selectedTheme === 'custom') {
      newTheme = {
        ...predefinedThemes.custom,
        primary: customColors.primary,
        secondary: customColors.secondary,
        accent: customColors.accent
      };
    } else {
      newTheme = predefinedThemes[selectedTheme];
    }
    
    setCurrentTheme(newTheme);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Theme Selection</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {Object.entries(predefinedThemes).map(([key, theme]) => (
              <div 
                key={key}
                className={`relative rounded-lg p-4 cursor-pointer border-2 transition-all ${
                  selectedTheme === key 
                    ? 'border-primary shadow-md' 
                    : 'border-surface-200 dark:border-surface-700'
                }`}
                onClick={() => handleThemeChange(key)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full border border-surface-300 flex items-center justify-center">
                    {selectedTheme === key && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                  </div>
                  <span className="font-medium">{theme.name}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.secondary }}></div>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.accent }}></div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedTheme === 'custom' && (
            <div className="p-4 bg-surface-100 dark:bg-surface-700/30 rounded-lg">
              <h4 className="font-medium mb-3">Customize Colors</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={customColors.primary} 
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input 
                      type="text" 
                      value={customColors.primary} 
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                </div>
                
                {/* Similar inputs for secondary and accent colors */}
              </div>
            </div>
          )}
        </div>
        
        <button onClick={applyTheme} className="btn-primary w-full">Apply Theme</button>
      </div>
    </div>
  );
};

export default Settings;