import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const pluginSettings = {
    get mode() {
        return localStorage.getItem('smart_shuffle_mode') || 'true_random';
    },
    set mode(val) {
        localStorage.setItem('smart_shuffle_mode', val);
    },
    get smartShuffleRatio() {
        return Number(localStorage.getItem('smart_shuffle_ratio')) || 3;
    },
    set smartShuffleRatio(val) {
        localStorage.setItem('smart_shuffle_ratio', String(val));
    },
    get smartSampleSize() {
        return Number(localStorage.getItem('smart_sample_size')) || 5;
    },
    set smartSampleSize(val) {
        localStorage.setItem('smart_sample_size', String(val));
    },
    get playCountExponent() {
        return Number(localStorage.getItem('smart_play_count_exponent')) || 1.0;
    },
    set playCountExponent(val) {
        localStorage.setItem('smart_play_count_exponent', String(val));
    },
    get artistSpacing() {
        return Number(localStorage.getItem('smart_artist_spacing')) || 1;
    },
    set artistSpacing(val) {
        localStorage.setItem('smart_artist_spacing', String(val));
    }
};
export function Settings() {
    const [mode, setMode] = useState(pluginSettings.mode);
    const [ratio, setRatio] = useState(pluginSettings.smartShuffleRatio);
    const [sampleSize, setSampleSize] = useState(pluginSettings.smartSampleSize);
    const [exponent, setExponent] = useState(pluginSettings.playCountExponent);
    const [spacing, setSpacing] = useState(pluginSettings.artistSpacing);
    return (_jsxs("div", { style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: '6px', fontWeight: 'bold' }, children: "Shuffle Algorithm Mode" }), _jsxs("select", { value: mode, onChange: (e) => {
                            const val = e.target.value;
                            setMode(val);
                            pluginSettings.mode = val;
                        }, style: {
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#1a1a1a',
                            color: '#fff',
                            border: '1px solid #333'
                        }, children: [_jsx("option", { value: "true_random", children: "True Random (Uniform Fisher-Yates)" }), _jsx("option", { value: "smart_shuffle", children: "Smart Shuffle (Spotify style with Recs)" }), _jsx("option", { value: "least_played", children: "Least Played First" }), _jsx("option", { value: "most_played", children: "Most Played First" }), _jsx("option", { value: "fun", children: "Fun Mode (Artist Separated)" })] })] }), _jsxs("div", { children: [_jsxs("label", { style: { display: 'block', marginBottom: '6px', fontWeight: 'bold' }, children: ["Smart Shuffle Frequency (1 rec every ", ratio, " tracks)"] }), _jsx("input", { type: "range", min: 1, max: 10, step: 1, value: ratio, onChange: (e) => {
                            const val = Number(e.target.value);
                            setRatio(val);
                            pluginSettings.smartShuffleRatio = val;
                        }, style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { display: 'block', marginBottom: '6px', fontWeight: 'bold' }, children: ["Smart Shuffle Seed Sample Size (", sampleSize, " tracks)"] }), _jsx("input", { type: "range", min: 1, max: 10, step: 1, value: sampleSize, onChange: (e) => {
                            const val = Number(e.target.value);
                            setSampleSize(val);
                            pluginSettings.smartSampleSize = val;
                        }, style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { display: 'block', marginBottom: '6px', fontWeight: 'bold' }, children: ["Least/Most Played Weight Bias (", exponent, ")"] }), _jsx("input", { type: "range", min: 0.1, max: 3.0, step: 0.1, value: exponent, onChange: (e) => {
                            const val = Number(e.target.value);
                            setExponent(val);
                            pluginSettings.playCountExponent = val;
                        }, style: { width: '100%' } })] }), _jsxs("div", { children: [_jsxs("label", { style: { display: 'block', marginBottom: '6px', fontWeight: 'bold' }, children: ["Fun Mode Artist Spacing Buffer (", spacing, " tracks)"] }), _jsx("input", { type: "range", min: 1, max: 5, step: 1, value: spacing, onChange: (e) => {
                            const val = Number(e.target.value);
                            setSpacing(val);
                            pluginSettings.artistSpacing = val;
                        }, style: { width: '100%' } })] })] }));
}
