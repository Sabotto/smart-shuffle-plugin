import React, { useState } from 'react';

export const pluginSettings = {
  get mode() {
    return localStorage.getItem('smart_shuffle_mode') || 'true_random';
  },
  set mode(val: string) {
    localStorage.setItem('smart_shuffle_mode', val);
  },
  get smartShuffleRatio() {
    return Number(localStorage.getItem('smart_shuffle_ratio')) || 3;
  },
  set smartShuffleRatio(val: number) {
    localStorage.setItem('smart_shuffle_ratio', String(val));
  },
  get smartSampleSize() {
    return Number(localStorage.getItem('smart_sample_size')) || 5;
  },
  set smartSampleSize(val: number) {
    localStorage.setItem('smart_sample_size', String(val));
  },
  get playCountExponent() {
    return Number(localStorage.getItem('smart_play_count_exponent')) || 1.0;
  },
  set playCountExponent(val: number) {
    localStorage.setItem('smart_play_count_exponent', String(val));
  },
  get artistSpacing() {
    return Number(localStorage.getItem('smart_artist_spacing')) || 1;
  },
  set artistSpacing(val: number) {
    localStorage.setItem('smart_artist_spacing', String(val));
  }
};

export function Settings() {
  const [mode, setMode] = useState(pluginSettings.mode);
  const [ratio, setRatio] = useState(pluginSettings.smartShuffleRatio);
  const [sampleSize, setSampleSize] = useState(pluginSettings.smartSampleSize);
  const [exponent, setExponent] = useState(pluginSettings.playCountExponent);
  const [spacing, setSpacing] = useState(pluginSettings.artistSpacing);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
          Shuffle Algorithm Mode
        </label>
        <select
          value={mode}
          onChange={(e) => {
            const val = e.target.value;
            setMode(val);
            pluginSettings.mode = val;
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333'
          }}
        >
          <option value="true_random">True Random (Uniform Fisher-Yates)</option>
          <option value="smart_shuffle">Smart Shuffle (Spotify style with Recs)</option>
          <option value="least_played">Least Played First</option>
          <option value="most_played">Most Played First</option>
          <option value="fun">Fun Mode (Artist Separated)</option>
        </select>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
          Smart Shuffle Frequency (1 rec every {ratio} tracks)
        </label>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={ratio}
          onChange={(e) => {
            const val = Number(e.target.value);
            setRatio(val);
            pluginSettings.smartShuffleRatio = val;
          }}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
          Smart Shuffle Seed Sample Size ({sampleSize} tracks)
        </label>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={sampleSize}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSampleSize(val);
            pluginSettings.smartSampleSize = val;
          }}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
          Least/Most Played Weight Bias ({exponent})
        </label>
        <input
          type="range"
          min={0.1}
          max={3.0}
          step={0.1}
          value={exponent}
          onChange={(e) => {
            const val = Number(e.target.value);
            setExponent(val);
            pluginSettings.playCountExponent = val;
          }}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
          Fun Mode Artist Spacing Buffer ({spacing} tracks)
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={spacing}
          onChange={(e) => {
            const val = Number(e.target.value);
            setSpacing(val);
            pluginSettings.artistSpacing = val;
          }}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}