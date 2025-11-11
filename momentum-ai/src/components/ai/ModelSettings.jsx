import { memo } from 'react';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

export const ModelSettings = memo(({ settings, onSettingsChange }) => {
  const handleSliderChange = (key) => (e) => {
    onSettingsChange({
      ...settings,
      [key]: parseFloat(e.target.value)
    });
  };

  const handleToggle = (key) => (checked) => {
    onSettingsChange({
      ...settings,
      [key]: checked
    });
  };

  const handleSelectChange = (key) => (e) => {
    onSettingsChange({
      ...settings,
      [key]: e.target.value
    });
  };

  const getLabelForValue = (value, labels) => {
    if (value < 0.4) return labels[0];
    if (value < 0.7) return labels[1];
    return labels[2];
  };

  const renderSlider = (id, label, value, labels) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm text-slate-500">
          {getLabelForValue(value, labels)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={value}
        onChange={handleSliderChange(id)}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={value}
        aria-valuetext={getLabelForValue(value, labels)}
      />
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{labels[0]}</span>
        <span>{labels[2]}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderSlider('creativity', 'Creativity', settings.creativity, ['Precise', 'Balanced', 'Creative'])}
      {renderSlider('formality', 'Formality', settings.formality, ['Casual', 'Neutral', 'Formal'])}
      {renderSlider('detail', 'Detail Level', settings.detail, ['Brief', 'Moderate', 'Detailed'])}

      <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="use-personal-data">Use Personal Data</Label>
            <p className="text-xs text-slate-500">
              Allow the AI to reference your previous content
            </p>
          </div>
          <Switch
            id="use-personal-data"
            checked={settings.usePersonalData}
            onCheckedChange={handleToggle('usePersonalData')}
            aria-label="Use personal data"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="use-previous-content">Use Previous Context</Label>
            <p className="text-xs text-slate-500">
              Reference previous messages in the conversation
            </p>
          </div>
          <Switch
            id="use-previous-content"
            checked={settings.usePreviousContent}
            onCheckedChange={handleToggle('usePreviousContent')}
            aria-label="Use previous content"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="voice-style">Voice Style</Label>
        <select
          id="voice-style"
          value={settings.voiceStyle}
          onChange={handleSelectChange('voiceStyle')}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm rounded-md bg-white dark:bg-slate-800"
          aria-label="Select voice style"
        >
          <option value="conversational">Conversational</option>
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="authoritative">Authoritative</option>
          <option value="humorous">Humorous</option>
          <option value="inspirational">Inspirational</option>
        </select>
      </div>
    </div>
  );
});

ModelSettings.displayName = 'ModelSettings';
