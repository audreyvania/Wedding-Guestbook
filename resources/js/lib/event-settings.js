import {useEffect, useState} from 'react';
import {api} from './api';

const defaults = {groom_name: 'Raihan', bride_name: 'Debby', primary_color: '#a54e72', accent_color: '#f5b7d1'};

function rgb(hex) {
    const value = hex.replace('#', '');
    return [0, 2, 4].map(offset => Number.parseInt(value.slice(offset, offset + 2), 16));
}

function luminance(hex) {
    return rgb(hex).map(value => {
        const channel = value / 255;
        return channel <= .03928 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    }).reduce((total, channel, index) => total + channel * [.2126, .7152, .0722][index], 0);
}

function contrast(first, second) {
    const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (light + .05) / (dark + .05);
}

function blend(first, second, amount) {
    const a = rgb(first), b = rgb(second);
    return '#' + a.map((value, index) => Math.round(value * (1 - amount) + b[index] * amount).toString(16).padStart(2, '0')).join('');
}

function hsl(hex) {
    const [red, green, blue] = rgb(hex).map(value => value / 255);
    const max = Math.max(red, green, blue), min = Math.min(red, green, blue);
    const lightness = (max + min) / 2;
    if (max === min) return {hue: 0, saturation: 0, lightness};
    const delta = max - min;
    const saturation = delta / (1 - Math.abs(2 * lightness - 1));
    let hue = max === red ? ((green - blue) / delta) % 6 : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4;
    return {hue: hue * 60 + (hue < 0 ? 360 : 0), saturation, lightness};
}

function hslToHex({hue, saturation, lightness}) {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const segment = hue / 60, second = chroma * (1 - Math.abs(segment % 2 - 1)), match = lightness - chroma / 2;
    const channels = segment < 1 ? [chroma, second, 0] : segment < 2 ? [second, chroma, 0] : segment < 3 ? [0, chroma, second] : segment < 4 ? [0, second, chroma] : segment < 5 ? [second, 0, chroma] : [chroma, 0, second];
    return '#' + channels.map(value => Math.round((value + match) * 255).toString(16).padStart(2, '0')).join('');
}

function readableBrand(hex, minimumContrast = 4.5) {
    const source = hsl(hex);
    // Lowering HSL lightness keeps a pastel's hue vivid. Mixing it with black
    // made pale blue/pink themes look grey even though the user chose colour.
    let candidate = hex, lightness = source.lightness;
    while (contrast(candidate, '#ffffff') < minimumContrast && lightness > .08) {
        lightness -= .035;
        candidate = hslToHex({...source, lightness});
    }
    return candidate;
}

function setToken(name, value) {
    document.documentElement.style.setProperty(name, value);
}

export function applyTheme(settings) {
    const primaryRaw = settings.primary_color || defaults.primary_color;
    const accentRaw = settings.accent_color || defaults.accent_color;
    // Pastels get only a gentle, hue-preserving deepening. This keeps the
    // configured palette recognisable, while preventing washed-out controls.
    // Stronger derivatives remain limited to navigation and hover states.
    const primary = readableBrand(primaryRaw, 2.7);
    const accent = readableBrand(accentRaw, 2.7);
    const deep = blend(primary, '#000000', .30);
    const text = blend(primary, '#000000', .58);
    const values = {
        '--theme-primary-raw': primaryRaw,
        '--theme-accent-raw': accentRaw,
        '--theme-primary': primary,
        '--theme-primary-hover': blend(primary, '#000000', .16),
        '--theme-primary-active': blend(primary, '#000000', .28),
        '--theme-primary-soft': blend(primary, '#ffffff', .91),
        '--theme-primary-muted': blend(primary, '#ffffff', .79),
        '--theme-primary-border': blend(primary, '#ffffff', .58),
        '--theme-accent': accent,
        '--theme-accent-strong': blend(accent, '#000000', .16),
        '--theme-accent-soft': blend(accentRaw, '#ffffff', .82),
        '--theme-accent-muted': blend(accentRaw, '#ffffff', .66),
        '--theme-deep': deep,
        '--theme-on-primary': contrast(primary, '#ffffff') >= 4.5 ? '#ffffff' : '#15191d',
        '--theme-text': text,
        '--theme-text-muted': blend(text, '#ffffff', .40),
        '--theme-surface': '#ffffff',
    };
    Object.entries(values).forEach(([name, value]) => setToken(name, value));
}

export function useEventSettings() {
    const [settings, setSettings] = useState(defaults);
    useEffect(() => {
        api('/api/public/settings').then(value => { setSettings(value); applyTheme(value); }).catch(() => applyTheme(defaults));
        const receivePreview = event => {
            const settings = event.detail;
            if (!settings?.primary_color || !settings?.accent_color) return;
            setSettings(current => ({...current, ...settings}));
            applyTheme(settings);
        };
        window.addEventListener('wedding-theme-preview', receivePreview);
        return () => window.removeEventListener('wedding-theme-preview', receivePreview);
    }, []);
    return settings;
}
