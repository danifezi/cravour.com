import { GoogleGenAI, Chat, Type } from "@google/genai";

// --- SVG Icons ---
const icons = {
    logo: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 7L12 12L22 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    coPilot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Zm-2.39.264a.75.75 0 0 0 1.06 1.06l2.122-2.12a.75.75 0 0 0-1.061-1.061L5.11 12.264Zm13.84-.001a.75.75 0 0 0-1.06-1.06l-2.123 2.12a.75.75 0 0 0 1.061 1.061l2.122-2.12ZM12 7.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V8.25A.75.75 0 0 1 12 7.5ZM5.11 7.236a.75.75 0 0 0-1.06 1.06l2.122 2.122a.75.75 0 1 0 1.06-1.06L5.11 7.236Zm13.84-.001a.75.75 0 1 0-1.06-1.06l-2.122 2.122a.75.75 0 0 0 1.06 1.06l2.122-2.122ZM12 16.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z"/></svg>`,
    budgets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.925 5.512a2.25 2.25 0 0 0-2.175-1.762H5.25a2.25 2.25 0 0 0-2.175 1.762l-1.313 7.875A2.25 2.25 0 0 0 3.938 16h16.125a2.25 2.25 0 0 0 2.175-2.613l-1.313-7.875ZM5.25 5.25h13.5c.31 0 .59.167.737.438l1.313 7.875a.75.75 0 0 1-.725.887H3.938a.75.75 0 0 1-.725-.887l1.313-7.875A.75.75 0 0 1 5.25 5.25Z"/><path d="M10 10.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z M18 8.625a.75.75 0 0 0-1.5 0V11a.75.75 0 0 0 1.5 0V8.625Z"/><path d="M4.5 17.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z"/></svg>`,
    marketplace: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.762.724-1.858 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.858-2.071l-1.263-12A1.875 1.875 0 0 0 18.487 6.75H16.5V6a4.5 4.5 0 1 0-9 0ZM15 6V5.25A2.25 2.25 0 0 0 12.75 3 2.25 2.25 0 0 0 10.5 5.25V6h4.5Z" clip-rule="evenodd" /></svg>`,
    dashboard: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 4.5a3 3 0 0 0-3 3v.75a.75.75 0 0 1-1.5 0v-.75a4.5 4.5 0 0 1 4.5-4.5h3a4.5 4.5 0 0 1 4.5 4.5v3a4.5 4.5 0 0 1-4.5 4.5h-.75a.75.75 0 0 1 0-1.5h.75a3 3 0 0 0 3-3v-3a3 3 0 0 0-3-3h-3Z"/><path d="M4.5 13.5a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 0 1-4.5 4.5h-3a4.5 4.5 0 0 1-4.5-4.5v-3a4.5 4.5 0 0 1 4.5-4.5h.75a.75.75 0 0 1 0 1.5H4.5Z"/></svg>`,
    transactions: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.25 4.533A9.718 9.718 0 0 0 3.25 12a9.718 9.718 0 0 0 7.999 7.467 9.712 9.712 0 0 1 0-14.934ZM12.75 4.533V19.467a9.712 9.712 0 0 1 0-14.934Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>`,
    profile: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-1.498.07 6.75 6.75 0 0 0-13.5 0 .75.75 0 0 1-1.498-.07Z" clip-rule="evenodd" /></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.999 1.75a1 1 0 0 1 1 1v1.116a1 1 0 0 0 1.445.894l1.096-.55a1 1 0 0 1 1.213.527l1.25 2.165a1 1 0 0 1-.22 1.316l-.96.96a1 1 0 0 0 0 1.414l.96.96a1 1 0 0 1 .22 1.316l-1.25 2.165a1 1 0 0 1-1.213.527l-1.096-.55a1 1 0 0 0-1.445.894V21.25a1 1 0 0 1-2 0v-1.116a1 1 0 0 0-1.445-.894l-1.096.55a1 1 0 0 1-1.213-.527L4.25 17a1 1 0 0 1 .22-1.316l.96-.96a1 1 0 0 0 0-1.414l-.96-.96a1 1 0 0 1-.22-1.316l1.25-2.165a1 1 0 0 1 1.213.527l1.096.55a1 1 0 0 0 1.445.894V2.75a1 1 0 0 1 1-1ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 .75.75v18.5a.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1 0-1.5h6.75V3.5h-6.75a.75.75 0 0 1-.75-.75Z"/><path d="M9.22 7.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L12.94 12 9.22 8.28a.75.75 0 0 1 0-1.06Z"/><path d="M13.25 12a.75.75 0 0 1-.75-.75V11a.75.75 0 0 1-1.5 0v.25A2.25 2.25 0 0 0 13.25 12Z"/><path d="M2.75 12a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 0 1.5h-8a.75.75 0 0 1-.75-.75Z"/></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/><path d="M12 2.75a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0V3.5a.75.75 0 0 1 .75-.75ZM18.25 6.5a.75.75 0 0 1 .75.75l-.001.001 2.121 2.121a.75.75 0 0 1-1.06 1.06l-2.122-2.12a.75.75 0 0 1 .312-1.812ZM21.25 12a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1a.75.75 0 0 1 .75.75ZM18.664 18.664a.75.75 0 1 1-1.06-1.06l2.12-2.122a.75.75 0 0 1 1.06 1.06l-2.12 2.122ZM12 21.25a.75.75 0 0 1-.75-.75v-1a.75.75 0 0 1 1.5 0v1a.75.75 0 0 1-.75-.75ZM5.336 18.664a.75.75 0 1 1 1.06-1.06l-2.12-2.122a.75.75 0 0 1-1.06 1.06l2.12 2.122ZM2.75 12a.75.75 0 0 1 .75-.75h1a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1-.75-.75ZM5.336 5.336a.75.75 0 1 1-1.06 1.06L2.154 4.274a.75.75 0 0 1 1.06-1.06L5.336 5.336Z"/></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.75 16.75a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z"/><path fill-rule="evenodd" d="M12 1.75A10.25 10.25 0 1 0 22.25 12 10.25 10.25 0 0 0 12 1.75ZM3.25 12a8.75 8.75 0 0 1 5.966-8.395.75.75 0 1 0-.682-1.34A10.25 10.25 0 0 0 1.75 12a10.213 10.213 0 0 0 1.48 5.378.75.75 0 0 0 1.341-.682A8.75 8.75 0 0 1 3.25 12Zm11.859 6.845a.75.75 0 0 0 .682 1.341A10.25 10.25 0 0 0 20.75 12a8.75 8.75 0 0 0-13.916-6.845.75.75 0 1 0-1.341.682A10.25 10.25 0 0 0 15.11 18.845Z"/></svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 28.12 28.12 0 0 0 15.283-7.243.75.75 0 0 0 0-1.114A28.12 28.12 0 0 0 3.478 2.404Z"/></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M16.5 4.75a.75.75 0 0 0-1.5 0V5h-6v-.25a.75.75 0 0 0-1.5 0V5h-1.75a.75.75 0 0 0 0 1.5H7v12.25A2.25 2.25 0 0 0 9.25 21h5.5A2.25 2.25 0 0 0 17 18.75V6.5h1.25a.75.75 0 0 0 0-1.5H16.5ZM9.25 19.5V6.5h5.5V19.5z"/></svg>`,
    insight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.75a.75.75 0 0 1 .75.75V8a.75.75 0 0 1-1.5 0V5.5a.75.75 0 0 1 .75-.75ZM9 11.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"/><path fill-rule="evenodd" d="M12 1.75C6.34 1.75 1.75 6.34 1.75 12s4.59 10.25 10.25 10.25 10.25-4.59 10.25-10.25S17.66 1.75 12 1.75ZM3.25 12a8.75 8.75 0 1 1 17.5 0 8.75 8.75 0 0 1-17.5 0Zm6.5-4.5a.75.75 0 0 0-1.5 0v.518a3.25 3.25 0 0 0-2.583 3.232c0 1.8 1.45 3.25 3.25 3.25h4.167a3.25 3.25 0 0 0 3.25-3.25 3.25 3.25 0 0 0-2.583-3.232V7.5a.75.75 0 0 0-1.5 0v.518A3.235 3.235 0 0 0 12 8.25a3.235 3.235 0 0 0-.917-.232V7.5Z"/></svg>`,
    hamburger: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" /></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>`,
    pay: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3a.75.75 0 0 1 .75.75v.001a.75.75 0 0 1-1.5 0V7.5a.75.75 0 0 1 .75-.75ZM12 6.75a.75.75 0 0 1 .75.75v.001a.75.75 0 0 1-1.5 0V7.5a.75.75 0 0 1 .75-.75Zm3.375 0a.75.75 0 0 1 .75.75v.001a.75.75 0 0 1-1.5 0V7.5a.75.75 0 0 1 .75-.75ZM6.75 15.75a.75.75 0 0 1 0-1.5h10.5a.75.75 0 0 1 0 1.5H6.75Z" /></svg>`,
    chevronDoubleLeft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.47 4.53a.75.75 0 0 0-1.06-1.06L11.94 9l5.47 5.47a.75.75 0 1 0 1.06-1.06L14.06 9l4.41-4.47ZM11.47 4.53a.75.75 0 0 0-1.06-1.06L4.94 9l5.47 5.47a.75.75 0 1 0 1.06-1.06L7.06 9l4.41-4.47Z"/></svg>`,
    chevronDoubleRight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.53 4.53a.75.75 0 0 1 1.06-1.06L12.06 9l-5.47 5.47a.75.75 0 1 1-1.06-1.06L9.94 9 5.53 3.47ZM12.53 4.53a.75.75 0 0 1 1.06-1.06L19.06 9l-5.47 5.47a.75.75 0 1 1-1.06-1.06L16.94 9l-4.41-4.47Z"/></svg>`,
    target: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12 19.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" clip-rule="evenodd" /></svg>`,
    wallet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H3.75A2.25 2.25 0 0 0 1.5 6v12A2.25 2.25 0 0 0 3.75 20.25h12.5A2.25 2.25 0 0 0 18.5 18V9.75A2.25 2.25 0 0 0 16.5 8.25Z" /><path d="M22.5 8.25a2.25 2.25 0 0 0-2.25-2.25H18.5V18a2.25 2.25 0 0 0 2.25 2.25H21A1.5 1.5 0 0 0 22.5 18.75V8.25Z" /></svg>`,
    plusCircle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clip-rule="evenodd" /></svg>`,
    history: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clip-rule="evenodd" /></svg>`,
    checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.109 3.108-1.5-1.5a.75.75 0 0 0-1.06 1.061l2.06 2.06a.75.75 0 0 0 1.06 0l3.609-3.608Z" clip-rule="evenodd" /></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" /><path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" /></svg>`,
    budgetHeroSad: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="translate(50 50)"><circle r="45" fill="var(--color-gold-accent)"/><circle cx="-15" cy="-10" r="5" fill="#0D0D0D"/><circle cx="15" cy="-10" r="5" fill="#0D0D0D"/><path d="M -20 20 Q 0 10 20 20" stroke="#0D0D0D" stroke-width="4" fill="none" stroke-linecap="round"/></g></svg>`,
    budgetHeroNeutral: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="translate(50 50)"><circle r="45" fill="var(--color-gold-accent)"/><circle cx="-15" cy="-10" r="5" fill="#0D0D0D"/><circle cx="15" cy="-10" r="5" fill="#0D0D0D"/><line x1="-20" y1="20" x2="20" y2="20" stroke="#0D0D0D" stroke-width="4" stroke-linecap="round"/></g></svg>`,
    budgetHeroHappy: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="translate(50 50)"><circle r="45" fill="var(--color-gold-accent)"/><circle cx="-15" cy="-10" r="5" fill="#0D0D0D"/><circle cx="15" cy="-10" r="5" fill="#0D0D0D"/><path d="M -20 15 Q 0 30 20 15" stroke="#0D0D0D" stroke-width="4" fill="none" stroke-linecap="round"/></g></svg>`,
    budgetHeroTriumphant: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="translate(50 50)"><circle r="45" fill="var(--color-gold-accent)"/><path d="M -25 -15 L -10 -5 L -25 5 Z" fill="#0D0D0D"/><path d="M 25 -15 L 10 -5 L 25 5 Z" fill="#0D0D0D"/><path d="M -25 15 C -10 35, 10 35, 25 15" stroke="#0D0D0D" stroke-width="4" fill="none" stroke-linecap="round"/></g></svg>`,
    bus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3.75A1.5 1.5 0 0 1 4.5 2.25h15A1.5 1.5 0 0 1 21 3.75V15.75a1.5 1.5 0 0 1-1.5 1.5H15v1.5a.75.75 0 0 1-1.5 0v-1.5H9v1.5a.75.75 0 0 1-1.5 0v-1.5H4.5A1.5 1.5 0 0 1 3 15.75V3.75ZM6 8.25a.75.75 0 0 0 0 1.5h12a.75.75 0 0 0 0-1.5H6Z" /><path d="M4.5 19.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0ZM16.5 19.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z" /></svg>`,
    car: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 5.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z" /><path fill-rule="evenodd" d="M3.75 9a.75.75 0 0 0-.75.75v6a.75.75 0 0 0 .75.75h16.5a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-.75-.75H3.75Zm.75 1.5a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75Zm5.25-.75a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" clip-rule="evenodd" /><path d="M5.25 19.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm13.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>`,
    food: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.25 4.507a2.625 2.625 0 0 0-5.25 0C6 5.877 7.123 7 8.625 7H10.5V5.25c0-.414.336-.75.75-.75h.001c.414 0 .749.335.749.749L12 5.25v1.5H8.625c1.458 0 2.56 1.05 2.623 2.343.052 1.072-.736 2.003-1.808 2.124L9.31 11.25H9.75v3.311c1.373.11 2.457.772 2.91 1.708a.75.75 0 0 1-1.32.761c-.24-.49-.899-.88-1.59-1.03V11.25H9.31l-.128.016a2.623 2.623 0 0 1-2.433-2.506c0-1.45 1.176-2.625 2.625-2.625h2.872V4.507Z" /><path d="M15.75 4.507a2.625 2.625 0 0 0-5.25 0C10.5 5.877 11.623 7 13.125 7H15V5.25c0-.414.336-.75.75-.75h.001c.414 0 .749.335.749.749L16.5 5.25v1.5h-1.875c1.458 0 2.56 1.05 2.623 2.343.052 1.072-.736 2.003-1.808 2.124l-.128.016h.439v3.311c1.373.11 2.457.772 2.91 1.708a.75.75 0 0 1-1.32.761c-.24-.49-.899-.88-1.59-1.03V11.25h-.378l-.128.016a2.623 2.623 0 0 1-2.433-2.506c0-1.45 1.176-2.625 2.625-2.625h2.872V4.507Z" /></svg>`,
    walk: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10.5 4.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM6 7.5a.75.75 0 0 1 .75.75v5.5a3.25 3.25 0 0 0 3.25 3.25h.5a.75.75 0 0 1 0 1.5h-.5a4.75 4.75 0 0 1-4.75-4.75V8.25A.75.75 0 0 1 6 7.5Zm6.75-.75a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 1.5 0v-5.54l1.628 2.443a.75.75 0 0 0 1.244-.828L15.42 12l1.952-3.805a.75.75 0 0 0-1.244-.828L14.25 9.81V7.5a.75.75 0 0 0-.75-.75Z" clip-rule="evenodd" /></svg>`,
};

// --- Nigerian Market Data ---
const CATEGORY_MAP: Record<string, { type: 'needs' | 'wants' | 'goals', name: string }> = {
    // Needs (Essentials)
    "Groceries": { type: 'needs', name: "Groceries" },
    "Transportation": { type: 'needs', name: "Transportation" },
    "Bills & Utilities": { type: 'needs', name: "Bills & Utilities" },
    "Rent/Housing": { type: 'needs', name: "Rent/Housing" },
    "Data & Airtime": { type: 'needs', name: "Data & Airtime" },
    "Health": { type: 'needs', name: "Health" },
    // Wants (Lifestyle)
    "Entertainment": { type: 'wants', name: "Entertainment" },
    "Shopping": { type: 'wants', name: "Shopping" },
    "Other": { type: 'wants', name: "Other" },
    // Goals
    "Savings & Investments": { type: 'goals', name: "Savings & Investments" },
};
const CATEGORIES = Object.keys(CATEGORY_MAP);

const formatNaira = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
};

const sampleDeals = [
    { id: 1, merchantId: 1, merchantName: "Shoprite", productName: "5kg Bag of Rice", price: 8900, category: "Groceries", imageUrl: "https://images.unsplash.com/photo-1586201375765-c124a27544e3?q=80&w=400&auto=format&fit=crop", location: "Lagos" },
    { id: 2, merchantId: 2, merchantName: "Konga", productName: "Infinix Note 40", price: 285000, category: "Shopping", imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?q=80&w=400&auto=format&fit=crop", location: "Lagos" },
    { id: 3, merchantId: 3, merchantName: "Filmhouse Cinemas", productName: "Weekend Movie Ticket", price: 5000, category: "Entertainment", imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop", location: "Abuja" },
    { id: 4, merchantId: 4, merchantName: "Jumia", productName: "Samsung 32-inch TV", price: 180000, category: "Shopping", imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f82e45?q=80&w=400&auto=format&fit=crop", location: "Port Harcourt" },
    { id: 5, merchantId: 5, merchantName: "Local Market", productName: "Weekly Veggie Box", price: 7500, category: "Groceries", imageUrl: "https://images.unsplash.com/photo-1597362925123-77861d3fbac8?q=80&w=400&auto=format&fit=crop", location: "Ibadan" },
    { id: 6, merchantId: 6, merchantName: "i-Fitness", productName: "Monthly Gym Plan", price: 22000, category: "Health", imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=400&auto=format&fit=crop", location: "Abuja" },
    { id: 7, merchantId: 2, merchantName: "Konga", productName: "Wireless Earbuds", price: 15500, category: "Shopping", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop", location: "Lagos" },
];

type ActionModalContent = { type: 'prompt' | 'confirm', title: string, content: string, action: string };
type Notification = { type: 'warning' | 'success' | 'info', message: string };

type ChatMessage = {
    role: 'user' | 'model',
    parts: { text: string }[],
    isStreaming?: boolean,
};

class CravourApp {
    private state: {
        theme: 'light' | 'dark';
        isLoggedIn: boolean;
        isMobileMenuOpen: boolean; // For landing page
        isAppMenuOpen: boolean; // For logged-in app
        isSidebarCollapsed: boolean; // For desktop app sidebar
        showAuthModal: boolean;
        authView: 'login' | 'signup';
        accountType: 'personal' | 'business' | null;
        userTypeSelection: 'personal' | 'business';

        // Personal user state
        currentView: string;
        coPilotChat: Chat | null;
        activeChatMessages: ChatMessage[];
        isCoPilotLoading: boolean;
        chatSessions: any[];
        nextSessionId: number;
        selectedChatSessionId: number | null;
        
        // Budget Period State
        walletBalance: number;
        initialWalletBalance: number;
        periodStartDate: string;
        pastPeriods: any[];
        selectedReportIndex: number | null;

        expenses: any[];
        nextExpenseId: number;
        isAnalyzingExpense: boolean;
        budgets: any[];
        deals: any[];
        userLocation: string;
        showPaymentModal: boolean;
        dealToPurchase: any | null;
        paymentStep: 'form' | 'processing' | 'success';
        
        cravourPayState: {
            step: 'form' | 'checking' | 'confirming' | 'success';
            message: string;
            canAfford: boolean;
            details: { amount: number; category: string; merchant: string } | null;
        };

        // Gamified Dashboard State
        financialHealthScore: number | null;
        financialHealthTip: string | null;
        isGeneratingHealthScore: boolean;
        financialSummary: any | null;
        isGeneratingSummary: boolean;
        
        isGeneratingBudgetPlan: boolean;
        notification: Notification | null;
        
        marketplaceRecommendations: number[];
        marketplaceSearchQuery: string;
        marketplaceFilterCategory: string;
        isGeneratingMarketplaceRecs: boolean;

        financialGoals: any[];
        nextGoalId: number;

        showActionModal: ActionModalContent | null;
        showBudgetModal: boolean;
        editingBudgetCategory: string | null;


        // Business user state
        enterpriseView: string;
        transactions: any[];
        nextTransactionId: number;
        
        // Demo state
        demoChatHistory: ChatMessage[];
        isDemoLoading: boolean;

        ai: GoogleGenAI | null;
    } = {
        theme: 'light',
        isLoggedIn: false,
        isMobileMenuOpen: false,
        isAppMenuOpen: false,
        isSidebarCollapsed: false,
        showAuthModal: false,
        authView: 'login',
        accountType: null,
        userTypeSelection: 'personal',

        currentView: 'insights',
        coPilotChat: null,
        activeChatMessages: [],
        isCoPilotLoading: false,
        chatSessions: [],
        nextSessionId: 1,
        selectedChatSessionId: null,

        walletBalance: 0,
        initialWalletBalance: 0,
        periodStartDate: '',
        pastPeriods: [],
        selectedReportIndex: null,

        expenses: [],
        nextExpenseId: 1,
        isAnalyzingExpense: false,
        budgets: [],
        deals: [],
        userLocation: "Lagos",
        showPaymentModal: false,
        dealToPurchase: null,
        paymentStep: 'form',
        cravourPayState: {
            step: 'form',
            message: '',
            canAfford: false,
            details: null,
        },

        financialHealthScore: null,
        financialHealthTip: null,
        isGeneratingHealthScore: false,
        financialSummary: null,
        isGeneratingSummary: false,

        isGeneratingBudgetPlan: false,
        notification: null,
        
        marketplaceRecommendations: [],
        marketplaceSearchQuery: '',
        marketplaceFilterCategory: 'all',
        isGeneratingMarketplaceRecs: false,

        financialGoals: [],
        nextGoalId: 1,
        
        showActionModal: null,
        showBudgetModal: false,
        editingBudgetCategory: null,

        enterpriseView: 'dashboard',
        transactions: [],
        nextTransactionId: 1,
        
        demoChatHistory: [],
        isDemoLoading: false,

        ai: null,
    };

    constructor() {
        this.init();
    }

    private setState(newState: Partial<typeof this.state>) {
        Object.assign(this.state, newState);
        this.render();
    }

    private init() {
        if (!process.env.API_KEY) {
            document.getElementById('config-banner')?.classList.remove('hidden');
        } else {
            this.setState({ ai: new GoogleGenAI({ apiKey: process.env.API_KEY }) });
        }

        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        if (savedTheme) this.setState({ theme: savedTheme });
        
        document.addEventListener('click', this.handleDelegatedClick.bind(this));
        document.addEventListener('submit', this.handleDelegatedSubmit.bind(this));
        document.addEventListener('input', this.handleDelegatedInput.bind(this));
        document.addEventListener('change', this.handleDelegatedChange.bind(this));

        this.render();
        setTimeout(() => this.hydrateLandingPage(), 100);
    }
    
    private hydrateLandingPage() {
        // Hydrate interactive parts of the now-static landing page
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if(mobileMenuToggle) mobileMenuToggle.innerHTML = icons.hamburger;

        const mobileNavContainer = document.querySelector('.mobile-nav-container');
        if(mobileNavContainer) mobileNavContainer.innerHTML = this.renderMobileMenu();

        const logoSvgs = document.querySelectorAll('.logo-svg');
        logoSvgs.forEach(svg => svg.innerHTML = icons.logo);
        
        const featureIcons = document.querySelectorAll('.feature-icon');
        const featureIconKeys = ['budgets', 'marketplace', 'coPilot'];
        featureIcons.forEach((icon, index) => {
            icon.innerHTML = icons[featureIconKeys[index] as keyof typeof icons];
        });
        
        this.setState({
            demoChatHistory: [
                { 
                    role: 'model', 
                    parts: [{ text: JSON.stringify({type: 'text', payload: { message: "Hello! I'm your financial co-pilot. Ask me how to master your money in Nigeria, like 'How can I get from Lekki to Ikota with ₦10,000?'" }}) }]
                },
            ]
        });
        this.renderBySelector('.skeleton-chat', this.renderChatWidget('demo'));
    }

    private scrollToBottom(selector: string) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }

    // --- Event Handlers ---
    private handleDelegatedClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        const actionTarget = target.closest('[data-action]');
        if (!actionTarget) return;

        const action = actionTarget.getAttribute('data-action');
        const view = (actionTarget as HTMLElement).dataset.view;
        
        switch (action) {
            case 'toggle-theme': this.toggleTheme(); break;
            case 'toggle-mobile-menu': this.toggleMobileMenu(); break;
            case 'toggle-app-menu': this.toggleAppMenu(); break;
            case 'toggle-sidebar-collapse': this.toggleSidebarCollapse(); break;
            case 'show-login': this.showAuthModal('login'); break;
            case 'show-signup': this.showAuthModal('signup'); break;
            case 'close-modal': 
                if (this.state.showAuthModal) this.hideAuthModal();
                if (this.state.showPaymentModal) this.hidePaymentModal();
                if (this.state.showActionModal) this.hideActionModal();
                if (this.state.showBudgetModal) this.hideBudgetModal();
                break;
            case 'dismiss-notification': this.setState({ notification: null }); break;
            case 'set-auth-view': this.setAuthView(view as 'login' | 'signup'); break;
            case 'set-account-type': this.setUserTypeSelection(view as 'personal' | 'business'); break;
            case 'logout': this.logout(); break;
            case 'navigate': this.navigate(view as string); break;
            case 'delete-expense': this.deleteExpense(parseInt((actionTarget as HTMLElement).dataset.id || '0')); break;
            case 'show-delete-goal-modal': this.showDeleteGoalModal(parseInt((actionTarget as HTMLElement).dataset.id || '0')); break;
            case 'demo-smart-query': this.handleDemoQuery(null, actionTarget.getAttribute('data-query') || ''); break;
            case 'buy-now': this.handleBuyNow(parseInt((actionTarget as HTMLElement).dataset.id || '0')); break;
            case 'confirm-payment': this.handleConfirmPayment(); break;
            case 'cravour-pay-confirm': this.handleCravourPayConfirm(); break;
            case 'cravour-pay-reset': this.resetCravourPay(); break;
            case 'focus-add-form': this.focusAddForm((actionTarget as HTMLElement).dataset.formId || '', (actionTarget as HTMLElement).dataset.inputId || ''); break;
            case 'show-new-budget-modal': this.showNewBudgetModal(); break;
            case 'show-add-funds-modal': this.showAddFundsModal(); break;
            case 'show-start-fresh-modal': this.showStartFreshModal(); break;
            case 'ai-suggest-budget-plan': this.generateAIBudgetPlan(); break;
            case 'show-add-budget-modal': this.showAddBudgetModal(); break;
            case 'show-edit-budget-modal': this.showEditBudgetModal((actionTarget as HTMLElement).dataset.category || ''); break;
            case 'show-delete-budget-modal': this.showDeleteBudgetModal((actionTarget as HTMLElement).dataset.category || ''); break;
            case 'start-new-chat': this.startNewChat(); break;
            case 'show-delete-chat-modal': this.showDeleteChatModal(parseInt((actionTarget as HTMLElement).dataset.id || '0')); break;
            case 'set-theme': this.setTheme((actionTarget as HTMLElement).dataset.theme as 'light' | 'dark'); break;
        }
    }

    private handleDelegatedSubmit(e: SubmitEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        
        switch (form.id) {
            case 'auth-form': this.login(); break;
            case 'demo-chat-form': this.handleDemoQuery(form); break;
            case 'copilot-chat-form': this.handleCoPilotQuery(form); break;
            case 'add-expense-form': this.addExpense(form); break;
            case 'quick-add-expense-form': this.handleQuickAddExpense(form); break;
            case 'add-goal-form': this.addGoal(form); break;
            case 'cravour-pay-form': this.handleCravourPayCheck(form); break;
            case 'action-modal-form': this.handleActionModalSubmit(form); break;
            case 'budget-modal-form': this.handleBudgetFormSubmit(form); break;
        }
    }
    
    private handleDelegatedInput(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.id === 'marketplace-search-input') {
            this.handleMarketplaceSearch(target.value);
        }
    }

    private handleActionModalSubmit(form: HTMLFormElement) {
        if (!this.state.showActionModal) return;

        const actionParts = this.state.showActionModal.action.split('/');
        const actionName = actionParts[0];

        switch(actionName) {
            case 'confirm-new-budget':
                this.confirmNewBudget(form);
                break;
            case 'confirm-add-funds':
                this.confirmAddFunds(form);
                break;
            case 'confirm-start-fresh':
                this.confirmStartFresh();
                break;
            case 'confirm-delete-chat':
                this.deleteChatSession(parseInt(actionParts[1], 10));
                break;
            case 'confirm-delete-budget':
                this.deleteBudget(actionParts[1]);
                break;
            case 'confirm-delete-goal':
                this.deleteGoal(parseInt(actionParts[1], 10));
                break;
        }
    }
    
    private handleDelegatedChange(e: Event) {
        const target = e.target as HTMLSelectElement;
        if (target.id === 'location-selector' || target.id === 'marketplace-location-filter') {
            this.setState({ userLocation: target.value });
        }
        if (target.id === 'marketplace-category-filter') {
            this.handleMarketplaceFilter(target.value);
        }
    }
    
    // --- App Logic ---
    private setTheme(theme: 'light' | 'dark') {
        if (theme) {
            localStorage.setItem('theme', theme);
            this.setState({ theme });
        }
    }

    private toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    private toggleMobileMenu() {
        this.setState({ isMobileMenuOpen: !this.state.isMobileMenuOpen });
    }

    private toggleAppMenu() {
        this.setState({ isAppMenuOpen: !this.state.isAppMenuOpen });
    }

    private toggleSidebarCollapse() {
        this.setState({ isSidebarCollapsed: !this.state.isSidebarCollapsed });
    }

    private showAuthModal(view: 'login' | 'signup') {
        if(this.state.isMobileMenuOpen) this.toggleMobileMenu();
        this.setState({ showAuthModal: true, authView: view, userTypeSelection: 'personal' });
    }

    private hideAuthModal() {
        this.setState({ showAuthModal: false });
    }

    private setAuthView(view: 'login' | 'signup') {
        if (view) this.setState({ authView: view });
    }

    private setUserTypeSelection(type: 'personal' | 'business') {
        this.setState({ userTypeSelection: type });
    }

    private login() {
        this.setState({
            isLoggedIn: true,
            accountType: this.state.userTypeSelection,
        });

        if (this.state.userTypeSelection === 'personal') {
            // Setup a clean slate for a personal account
            this.setState({ 
                currentView: 'insights',
                expenses: [],
                walletBalance: 0,
                initialWalletBalance: 0,
                periodStartDate: '',
                nextExpenseId: 1,
                budgets: [],
                deals: [...sampleDeals],
                financialGoals: [],
                nextGoalId: 1,
                pastPeriods: [],
                selectedReportIndex: null,
                financialHealthScore: null,
                financialHealthTip: null,
                financialSummary: null,
                notification: null,
                marketplaceRecommendations: [],
                chatSessions: [],
                nextSessionId: 1,
                selectedChatSessionId: null,
            });
            this.startNewChat(false);
        } else {
            this.setupBusinessAccount();
        }
        this.hideAuthModal();
    }

    private async updateCoPilotContext() {
        if (!this.state.coPilotChat) return;

        const contextMessage = `SILENT_CONTEXT_UPDATE: Here is the user's latest financial data. Do not acknowledge this message directly in your response. Simply use this information to answer any subsequent questions from the user.
            Wallet Balance: ${formatNaira(this.state.walletBalance)}
            Category Definitions: ${JSON.stringify(CATEGORY_MAP)}
            Location: ${this.state.userLocation}
            Expenses: ${JSON.stringify(this.state.expenses)}
            Budgets: ${JSON.stringify(this.state.budgets)}
            Financial Goals: ${JSON.stringify(this.state.financialGoals)}
            Deals: ${JSON.stringify(this.state.deals)}
        `;
        
        // This silently updates the chat history for the model's context
        await this.state.coPilotChat.sendMessage({ message: contextMessage });
    }

    private setupBusinessAccount() {
        // For demo, we'll assign the business user to "Konga" (merchantId: 2)
        this.setState({
            enterpriseView: 'dashboard',
            transactions: [], // Start with no transactions
        });
    }
    
    private logout() {
        this.setState({
            isLoggedIn: false,
            accountType: null,
            currentView: 'insights',
            enterpriseView: 'dashboard',
            walletBalance: 0,
            initialWalletBalance: 0,
            expenses: [],
            activeChatMessages: [],
            coPilotChat: null,
            budgets: [],
            deals: [],
            financialGoals: [],
            transactions: [],
            financialHealthScore: null,
            financialHealthTip: null,
            financialSummary: null,
            pastPeriods: [],
            selectedReportIndex: null,
            notification: null,
            chatSessions: [],
            selectedChatSessionId: null,
        });
    }

    private navigate(view: string) {
        if(this.state.isMobileMenuOpen) this.toggleMobileMenu();
        if(this.state.isAppMenuOpen) this.toggleAppMenu();
        
        if (view.startsWith('#')) {
            document.querySelector(view)?.scrollIntoView({ behavior: 'smooth' });
        } else if (this.state.accountType === 'personal') {
            if (view.startsWith('report/')) {
                const reportIndex = parseInt(view.split('/')[1], 10);
                this.setState({ currentView: 'report', selectedReportIndex: reportIndex, selectedChatSessionId: null });
            } else if (view.startsWith('chat-session/')) {
                const sessionId = parseInt(view.split('/')[1], 10);
                this.setState({ currentView: 'chat-session-detail', selectedChatSessionId: sessionId, selectedReportIndex: null });
            } else {
                this.setState({ currentView: view, selectedReportIndex: null, selectedChatSessionId: null });
            }

            if (view === 'co-pilot') {
                setTimeout(() => this.scrollToBottom('#copilot-chat-messages'), 0);
            }
            if (view === 'deals') {
                this.generateMarketplaceRecommendations();
            }
            if (view === 'insights') {
                this.generateFinancialSummary();
            }

        } else if (this.state.accountType === 'business') {
            this.setState({ enterpriseView: view });
        }
    }

    private focusAddForm(formId: string, inputId: string) {
        if (!formId || !inputId) return;
        const form = document.getElementById(formId);
        const input = document.getElementById(inputId);
        if (form && input) {
            form.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => input.focus(), 300);
        }
    }

    // --- Personal Account Logic ---
    private addExpense(form: HTMLFormElement | {name: string, category: string, amount: number, date: string}) {
        let newExpenseData;
        if (form instanceof HTMLFormElement) {
            const formData = new FormData(form);
            newExpenseData = {
                name: formData.get('name') as string,
                category: formData.get('category') as string,
                amount: parseFloat(formData.get('amount') as string),
                date: formData.get('date') as string,
            };
            if (isNaN(newExpenseData.amount) || newExpenseData.amount <= 0) return;
            form.reset();
        } else {
            newExpenseData = form;
        }

        const newExpense = { id: this.state.nextExpenseId, ...newExpenseData };
        this.setState({
            expenses: [newExpense, ...this.state.expenses],
            nextExpenseId: this.state.nextExpenseId + 1,
            walletBalance: this.state.walletBalance - newExpense.amount,
        });
        
        this.generateFinancialHealthScore();
        this.updateCoPilotContext();
    }
    
    private deleteExpense(id: number) {
        const expenseToDelete = this.state.expenses.find(exp => exp.id === id);
        if (!expenseToDelete) return;
        
        this.setState({ 
            expenses: this.state.expenses.filter(exp => exp.id !== id),
            walletBalance: this.state.walletBalance + expenseToDelete.amount,
        });
        this.generateFinancialHealthScore();
        this.updateCoPilotContext();
    }
    
    private async handleQuickAddExpense(form: HTMLFormElement) {
        if (!this.state.ai || this.state.isAnalyzingExpense) return;
    
        const input = form.querySelector('input') as HTMLInputElement;
        const query = input.value.trim();
        if (!query) return;
    
        this.setState({ isAnalyzingExpense: true, notification: null });
    
        const prompt = `
            You are an expert at parsing transaction details from unstructured text for a Nigerian user.
            Analyze the user's query: "${query}".
    
            - Reference today's date (${new Date().toISOString().substring(0, 10)}) for terms like 'today' or 'yesterday'.
            - The ONLY valid categories you can use are: ${JSON.stringify(CATEGORIES)}.
            - Pick the most appropriate category. If it's about food from a restaurant, use 'Groceries'.
            - Your response MUST be a single, valid JSON object that adheres to the provided schema. Do not add any extra text, explanation, or markdown.
        `;
    
        try {
            const result = await this.state.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING, description: "A concise description of the expense." },
                            amount: { type: Type.NUMBER, description: "The numerical amount of the expense." },
                            category: { type: Type.STRING, description: `The most fitting category from the provided list: ${JSON.stringify(CATEGORIES)}` },
                            date: { type: Type.STRING, description: "The date of the transaction in YYYY-MM-DD format." }
                        },
                        required: ['name', 'amount', 'category', 'date']
                    }
                }
            });
    
            const parsedExpense = JSON.parse(result.text);
    
            // Populate the form fields
            const nameInput = document.getElementById('expense-name-input') as HTMLInputElement;
            const amountInput = document.getElementById('expense-amount') as HTMLInputElement;
            const categoryInput = document.getElementById('expense-category') as HTMLSelectElement;
            const dateInput = document.getElementById('expense-date') as HTMLInputElement;
    
            if (nameInput) nameInput.value = parsedExpense.name;
            if (amountInput) amountInput.value = parsedExpense.amount;
            if (categoryInput) categoryInput.value = parsedExpense.category;
            if (dateInput) dateInput.value = parsedExpense.date;
    
            // Visual feedback
            const populatedFields = [nameInput, amountInput, categoryInput, dateInput];
            populatedFields.forEach(field => field?.classList.add('ai-populated'));
            setTimeout(() => {
                populatedFields.forEach(field => field?.classList.remove('ai-populated'));
            }, 2000);
            
            input.value = '';
            
        } catch (error) {
            this.setState({ notification: { type: 'info', message: 'Could not analyze expense. Please fill the form manually.' } });
        } finally {
            this.setState({ isAnalyzingExpense: false });
        }
    }
    
    
    private addGoal(form: HTMLFormElement) {
        const formData = new FormData(form);
        const newGoal = {
            id: this.state.nextGoalId,
            name: formData.get('name') as string,
            target: parseFloat(formData.get('target') as string),
            completed: false,
        };
        if (!newGoal.name || isNaN(newGoal.target) || newGoal.target <= 0) return;
        this.setState({
            financialGoals: [...this.state.financialGoals, newGoal],
            nextGoalId: this.state.nextGoalId + 1,
        });
        form.reset();
        this.generateFinancialHealthScore();
        this.updateCoPilotContext();
    }
    
    private showDeleteGoalModal(id: number) {
        if (!id) return;
        const goal = this.state.financialGoals.find(g => g.id === id);
        if (!goal) return;

        const modalContent: ActionModalContent = {
            type: 'confirm',
            title: 'Delete Financial Goal?',
            content: `<p>Are you sure you want to delete the goal "<strong>${goal.name}</strong>"? This action cannot be undone.</p>`,
            action: `confirm-delete-goal/${id}`
        };
        this.setState({ showActionModal: modalContent });
    }

    private deleteGoal(id: number) {
        this.setState({ financialGoals: this.state.financialGoals.filter(g => g.id !== id) });
        this.generateFinancialHealthScore();
        this.updateCoPilotContext();
        this.hideActionModal();
    }

    private handleBuyNow(dealId: number) {
        const deal = this.state.deals.find(d => d.id === dealId);
        if(deal) {
            this.setState({ showPaymentModal: true, dealToPurchase: deal, paymentStep: 'form' });
        }
    }

    private hidePaymentModal() {
        this.setState({ showPaymentModal: false, dealToPurchase: null });
    }

    private handleConfirmPayment() {
        if (!this.state.dealToPurchase) return;

        this.setState({ paymentStep: 'processing' });
        
        setTimeout(() => {
            // Add to user's expenses (which also deducts from wallet)
            this.addExpense({
                name: this.state.dealToPurchase.productName,
                category: this.state.dealToPurchase.category,
                amount: this.state.dealToPurchase.price,
                date: new Date().toISOString().substring(0, 10),
            });

            // Add to merchant's transactions
            this.addTransaction({
                ...this.state.dealToPurchase,
                customerName: "Demo User", // Hardcoded for demo
                date: new Date().toISOString().substring(0, 10),
                status: 'Completed'
            });

            this.setState({ paymentStep: 'success' });
            setTimeout(() => this.hidePaymentModal(), 1500);
        }, 1000);
    }
    
    private resetCravourPay() {
        this.setState({
            cravourPayState: {
                step: 'form',
                message: '',
                canAfford: false,
                details: null
            }
        });
    }

    private handleCravourPayCheck(form: HTMLFormElement) {
        this.setState({ cravourPayState: { ...this.state.cravourPayState, step: 'checking' } });
        
        const formData = new FormData(form);
        const amount = parseFloat(formData.get('amount') as string);
        const category = formData.get('category') as string;
        const merchant = formData.get('merchant') as string;

        const paymentDetails = { amount, category, merchant };
        const totalWalletBalance = this.state.walletBalance;

        setTimeout(() => {
             if (totalWalletBalance < amount) {
                this.setState({
                    cravourPayState: {
                        step: 'confirming',
                        message: `This purchase of ${formatNaira(amount)} exceeds your available wallet balance of ${formatNaira(totalWalletBalance)}.`,
                        canAfford: false,
                        details: paymentDetails
                    }
                });
                return;
            }
            
            const budget = this.state.budgets.find(b => b.category === category);
            const spent = this.state.expenses
                .filter(e => e.category === category)
                .reduce((sum, e) => sum + e.amount, 0);
            
            let message;
            if (budget) {
                const remainingInCategory = budget.amount - spent;
                if (remainingInCategory >= amount) {
                    message = `You can afford this. It's within your ${category} spending guideline.`;
                } else {
                    message = `You can afford this from your wallet, but it's over your ${category} spending guideline by ${formatNaira(amount - remainingInCategory)}.`;
                }
            } else {
                message = `You can afford this from your wallet. You don't have a spending guideline for ${category}.`;
            }

            this.setState({ 
                cravourPayState: {
                    step: 'confirming',
                    message: message,
                    canAfford: true,
                    details: paymentDetails
                }
            });
        }, 1000);
    }

    private handleCravourPayConfirm() {
        if (!this.state.cravourPayState.details) return;

        const { amount, category, merchant } = this.state.cravourPayState.details;
        
        this.addExpense({
            name: `Payment to ${merchant}`,
            category: category,
            amount: amount,
            date: new Date().toISOString().substring(0, 10),
        });

        this.setState({
            cravourPayState: {
                ...this.state.cravourPayState,
                step: 'success',
            }
        });

        setTimeout(() => this.resetCravourPay(), 2000);
    }
    
    private handleMarketplaceSearch(query: string) {
        this.setState({ marketplaceSearchQuery: query.toLowerCase() });
    }

    private handleMarketplaceFilter(category: string) {
        this.setState({ marketplaceFilterCategory: category });
    }

    // --- Budget Planner Logic ---
    private showAddBudgetModal() {
        this.setState({ showBudgetModal: true, editingBudgetCategory: null });
    }

    private showEditBudgetModal(category: string) {
        if (!category) return;
        this.setState({ showBudgetModal: true, editingBudgetCategory: category });
    }

    private hideBudgetModal() {
        this.setState({ showBudgetModal: false, editingBudgetCategory: null });
    }

    private handleBudgetFormSubmit(form: HTMLFormElement) {
        const formData = new FormData(form);
        const category = formData.get('category') as string;
        const amount = parseFloat(formData.get('amount') as string);
    
        if (!category || isNaN(amount) || amount < 0) return;
    
        if (this.state.editingBudgetCategory) {
            // Update existing budget
            const updatedBudgets = this.state.budgets.map(b => 
                b.category === this.state.editingBudgetCategory ? { ...b, amount: amount } : b
            );
            this.setState({ budgets: updatedBudgets });
        } else {
            // Add new budget, if category doesn't already exist
            if (!this.state.budgets.some(b => b.category === category)) {
                this.setState({ budgets: [...this.state.budgets, { category, amount }] });
            }
        }
    
        this.hideBudgetModal();
        this.generateFinancialHealthScore();
        this.updateCoPilotContext();
    }

    private showDeleteBudgetModal(category: string) {
        if (!category) return;
        const modalContent: ActionModalContent = {
            type: 'confirm',
            title: 'Delete Budget Category?',
            content: `<p>Are you sure you want to delete the budget for <strong>${category}</strong>? This will not delete your expenses in this category, but the guideline will be removed.</p>`,
            action: `confirm-delete-budget/${category}`
        };
        this.setState({ showActionModal: modalContent });
    }

    private deleteBudget(category: string) {
        this.setState({ budgets: this.state.budgets.filter(b => b.category !== category) });
        this.generateFinancialHealthScore();
        this.updateCoPilotContext();
        this.hideActionModal();
    }

    private async generateAIBudgetPlan() {
        if (!this.state.ai || this.state.isGeneratingBudgetPlan) return;
        this.setState({ isGeneratingBudgetPlan: true });

        const prompt = `
            As an expert Nigerian financial planner, create a sensible monthly budget plan for a user with a total wallet balance of ${formatNaira(this.state.walletBalance)}.
            The user needs a budget that covers essential 'needs', discretionary 'wants', and 'goals' for savings.
            
            Use these categories ONLY: ${JSON.stringify(CATEGORIES)}.
            Category definitions: ${JSON.stringify(CATEGORY_MAP)}.

            Allocate the entire wallet balance across a sensible selection of these categories. Ensure the total of all budget amounts equals the wallet balance.
            Prioritize 'needs' like 'Rent/Housing' and 'Groceries'. Allocate a reasonable amount for 'wants' and always include a 'Savings & Investments' portion for 'goals'.

            Return your response ONLY as a valid JSON array following this schema. Do not add any extra text or explanation.
            Example: [{ "category": "Groceries", "amount": 75000 }, { "category": "Transportation", "amount": 50000 }]
        `;

        try {
            const result = await this.state.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                category: { type: Type.STRING },
                                amount: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            });
            const plan = JSON.parse(result.text);
            this.setState({ budgets: plan, isGeneratingBudgetPlan: false });
            this.updateCoPilotContext();
        } catch (error) {
            // Silently fail on error
            this.setState({ isGeneratingBudgetPlan: false });
        }
    }


    // --- Budget Lifecycle Logic ---
    private showNewBudgetModal() {
        const modalContent: ActionModalContent = {
            type: 'prompt',
            title: 'Start a New Budget Period',
            content: `
                <p>To start a fresh budget period, enter your new wallet balance below. Your current period's data will be saved as a report.</p>
                <div class="form-group">
                    <label for="new-budget-amount">New Wallet Balance (NGN)</label>
                    <input type="number" id="new-budget-amount" name="amount" class="input-field" required placeholder="e.g., 500000">
                </div>
            `,
            action: 'confirm-new-budget'
        };
        this.setState({ showActionModal: modalContent });
    }

    private confirmNewBudget(form: HTMLFormElement) {
        const formData = new FormData(form);
        const newBalance = parseFloat(formData.get('amount') as string);

        if (isNaN(newBalance) || newBalance <= 0) {
            this.hideActionModal();
            return;
        };

        const currentPeriodExists = this.state.initialWalletBalance > 0;
        let newPastPeriods = [...this.state.pastPeriods];

        if (currentPeriodExists) {
            this.archiveCurrentChat();
            const periodReport = {
                expenses: [...this.state.expenses],
                budgets: [...this.state.budgets],
                financialGoals: [...this.state.financialGoals],
                startDate: this.state.periodStartDate,
                endDate: new Date().toISOString(),
                initialBalance: this.state.initialWalletBalance,
                finalBalance: this.state.walletBalance,
            };
            newPastPeriods = [periodReport, ...this.state.pastPeriods];
        }

        this.setState({
            pastPeriods: newPastPeriods,
            walletBalance: newBalance,
            initialWalletBalance: newBalance,
            expenses: [],
            nextExpenseId: 1,
            periodStartDate: new Date().toISOString(),
            financialHealthScore: null,
            financialHealthTip: null,
            financialSummary: null,
            notification: null,
            marketplaceRecommendations: [], // Reset recommendations
            currentView: 'insights', // Navigate to dashboard
        });
        
        this.hideActionModal();
        this.startNewChat(false);
        
        setTimeout(() => {
            this.generateFinancialHealthScore(true); // Generate welcome insights
            this.generateFinancialSummary();
        }, 0);
    }
    
    private showAddFundsModal() {
        const modalContent: ActionModalContent = {
            type: 'prompt',
            title: 'Add Funds to Wallet',
            content: `
                <p>Enter the amount you'd like to add to your current budget period. This will increase your total available funds.</p>
                <div class="form-group">
                    <label for="add-funds-amount">Amount to Add (NGN)</label>
                    <input type="number" id="add-funds-amount" name="amount" class="input-field" required placeholder="e.g., 50000">
                </div>
            `,
            action: 'confirm-add-funds'
        };
        this.setState({ showActionModal: modalContent });
    }
    
    private confirmAddFunds(form: HTMLFormElement) {
        const formData = new FormData(form);
        const amountToAdd = parseFloat(formData.get('amount') as string);
    
        if (isNaN(amountToAdd) || amountToAdd <= 0) {
            this.hideActionModal();
            return;
        }
    
        this.setState({
            walletBalance: this.state.walletBalance + amountToAdd,
            initialWalletBalance: this.state.initialWalletBalance + amountToAdd,
            notification: { type: 'success', message: `${formatNaira(amountToAdd)} added to your wallet successfully!` }
        });
    
        this.hideActionModal();
        this.updateCoPilotContext();
    }

    private showStartFreshModal() {
        const modalContent: ActionModalContent = {
            type: 'confirm',
            title: 'Are you sure?',
            content: `<p>This will permanently delete all your expenses, budgets, goals, and reports. This action cannot be undone.</p>`,
            action: 'confirm-start-fresh'
        };
        this.setState({ showActionModal: modalContent });
    }
    
    private confirmStartFresh() {
        // Reset to initial demo state
        this.setState({
            currentView: 'insights',
            expenses: [],
            walletBalance: 0,
            initialWalletBalance: 0,
            periodStartDate: '',
            nextExpenseId: 1,
            budgets: [],
            deals: [...sampleDeals],
            financialGoals: [],
            nextGoalId: 1,
            pastPeriods: [],
            selectedReportIndex: null,
            financialHealthScore: null,
            financialHealthTip: null,
            financialSummary: null,
            notification: null,
            marketplaceRecommendations: [],
            chatSessions: [],
            nextSessionId: 1,
            selectedChatSessionId: null,
        });
        this.startNewChat(false);
        this.hideActionModal();
    }
    
    private hideActionModal() {
        this.setState({ showActionModal: null });
    }
    

    // --- Business Account Logic ---
    private addTransaction(dealData: any) {
        const newTransaction = {
            id: this.state.nextTransactionId,
            ...dealData
        };
        this.setState({
            transactions: [newTransaction, ...this.state.transactions],
            nextTransactionId: this.state.nextTransactionId + 1,
        });
    }
    
    private calculateEnterpriseStats() {
        const merchantTransactions = this.state.transactions.filter(t => t.merchantId === 2);
        const totalRevenue = merchantTransactions.reduce((sum, t) => sum + t.price, 0);
        const totalSales = merchantTransactions.length;
    
        // Group transactions by day for the chart
        const revenueByDay: { [key: string]: number } = {};
        merchantTransactions.forEach(t => {
            const date = new Date(t.date).toISOString().split('T')[0];
            revenueByDay[date] = (revenueByDay[date] || 0) + t.price;
        });
    
        const chartData = Object.entries(revenueByDay)
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            .map(([date, revenue]) => ({ date, revenue }));
    
        return { totalRevenue, totalSales, transactions: merchantTransactions, chartData };
    }

    // --- AI Co-pilot & Insights Logic ---

    private async startNewChat(archive = true) {
        if (archive && this.state.coPilotChat && this.state.activeChatMessages.length > 1) {
            this.archiveCurrentChat();
        }
    
        if (!this.state.ai) return;
    
        const newChat = this.state.ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                 systemInstruction: `You are Cravour, an empowering and savvy financial co-pilot for users in Nigeria. Your personality is encouraging, insightful, and always focused on helping the user achieve their financial goals.
- ALWAYS respond in a valid JSON format. Your response MUST follow this schema: { "type": "text" | "recommendation" | "trip_plan", "payload": object }
- Use positive framing and forward-looking language. Instead of "You overspent," say "Let's see how we can align your spending with your goals next time."
- Frame suggestions as opportunities, e.g., "Here's a smart move to boost your savings..."

- For type="recommendation", the payload schema is:
{
  "summary": "An encouraging sentence about the recommendation. Example: 'You've got this! Here's a great deal that fits your goals.'",
  "isAffordable": boolean,
  "deal": { "productName": "string", "merchantName": "string", "price": number, "imageUrl": "string" }
}
When creating a recommendation, find the best deal from the provided data. Check affordability against the user's wallet balance.

- For type="text", the payload schema is:
{
  "message": "Your conversational, empowering answer as a string."
}

- For type="trip_plan", the payload schema is:
{
  "summary": "An encouraging summary. e.g., 'Absolutely! Let's map out your journey to Ikota. It's well within your budget.'",
  "isFeasible": boolean,
  "totalCost": number,
  "steps": [
    { "mode": "Bus" | "Car" | "Ferry" | "Keke" | "Okada" | "Walk" | "Food" | "Misc", "description": "e.g., 'Lekki Phase 1 to CMS'", "cost": number }
  ]
}
Use 'trip_plan' when a user asks about travel with a budget. Be resourceful and optimistic.

- All monetary values are in Nigerian Naira (NGN).
- IMPORTANT: Never mention "SILENT_CONTEXT_UPDATE". Just use the data to answer questions seamlessly.`
            },
        });

        this.setState({
            coPilotChat: newChat,
            activeChatMessages: [
                {
                    role: 'model',
                    parts: [{ text: JSON.stringify({ type: 'text', payload: { message: "Hello! I'm your Cravour co-pilot. I'm here to help you unlock your financial goals. What can we achieve today?" }})}]
                }
            ]
        });
    
        setTimeout(() => this.updateCoPilotContext(), 0);
    }
    
    private archiveCurrentChat() {
        if (!this.state.coPilotChat) return;
    
        const newSession = {
            id: this.state.nextSessionId,
            startDate: new Date().toISOString(),
            messages: [...this.state.activeChatMessages],
        };
    
        this.setState({
            chatSessions: [newSession, ...this.state.chatSessions],
            nextSessionId: this.state.nextSessionId + 1,
        });
    }

    private showDeleteChatModal(sessionId: number) {
        const modalContent: ActionModalContent = {
            type: 'confirm',
            title: 'Delete Chat Session?',
            content: `<p>Are you sure you want to permanently delete this chat session? This action cannot be undone.</p>`,
            action: `confirm-delete-chat/${sessionId}`
        };
        this.setState({ showActionModal: modalContent });
    }
    
    private deleteChatSession(sessionId: number) {
        this.setState({
            chatSessions: this.state.chatSessions.filter(session => session.id !== sessionId)
        });
        this.hideActionModal();
    }


    private async generateFinancialHealthScore(isNewPeriod = false) {
        if (!this.state.ai || this.state.isGeneratingHealthScore) return;
    
        this.setState({ isGeneratingHealthScore: true, notification: null });
    
        let prompt;
        const financialData = `
            Wallet Balance: ${formatNaira(this.state.walletBalance)}
            Initial Wallet Balance: ${formatNaira(this.state.initialWalletBalance)}
            Category Types: ${JSON.stringify(CATEGORY_MAP)}
            Expenses: ${JSON.stringify(this.state.expenses)}
            Budgets (as spending guidelines): ${JSON.stringify(this.state.budgets)}
            Financial Goals: ${JSON.stringify(this.state.financialGoals)}
        `;
    
        if (isNewPeriod) {
            prompt = `
                The user has just started a new budget period in Nigeria with a fresh wallet of ${formatNaira(this.state.walletBalance)}.
                To welcome them, provide a Financial Health Score of 75 (a positive starting point) and a single, empowering tip about seizing this fresh start.
            `;
        } else {
            prompt = `
                You are a Financial Health Analyst for a Nigerian user. Your tone is empowering and forward-looking.
                
                1.  **Calculate Financial Health Score (0-100):**
                    -   Analyze spending velocity, needs vs. wants ratio, budget adherence, and savings goal progress.
                    -   Score < 40 is an opportunity area. 40-70 is solid progress. > 70 is excellent momentum.
    
                2.  **Provide ONE Actionable Tip:**
                    -   Based on the score, give the single most impactful piece of advice. Frame it as a positive next step. E.g., Instead of "Stop spending," say "Imagine redirecting some of your 'Shopping' funds towards your 'New Laptop' goal to get it faster!"
    
                3.  **Check for a Notification Event (OPTIONAL):**
                    -   **Budget Warning:** If spending in any category exceeds 80% of its budget, create a 'warning' notification: "Heads up! You're nearing your [Category Name] guideline. Let's stay on track!"
                    -   **Goal Achieved:** If total savings contributions meet or exceed an uncompleted goal's target, create a 'success' notification: "Amazing work! You've successfully funded your '[Goal Name]' goal!"
                    -   Only generate ONE notification. Prioritize the goal achievement.
    
                **User's Financial Data:**
                ${financialData}
            `;
        }
    
        try {
            const result = await this.state.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER, description: "A numerical financial health score from 0 to 100." },
                            tip: { type: Type.STRING, description: "A single, actionable, and empowering tip." },
                            notification: {
                                type: Type.OBJECT,
                                description: "An optional notification. Null if no event.",
                                nullable: true,
                                properties: {
                                    type: { type: Type.STRING, description: "'warning' or 'success'." },
                                    message: { type: Type.STRING, description: "The notification message." },
                                    goalId: { type: Type.NUMBER, description: "The ID of the completed goal, if applicable.", nullable: true }
                                }
                            }
                        },
                    },
                },
            });
    
            const response = JSON.parse(result.text);
    
            if (response.notification) {
                this.setState({ notification: response.notification });
    
                if (response.notification.type === 'success' && response.notification.goalId) {
                    const updatedGoals = this.state.financialGoals.map(goal => {
                        if (goal.id === response.notification.goalId && !goal.completed) {
                            return { ...goal, completed: true };
                        }
                        return goal;
                    });
                    this.setState({ financialGoals: updatedGoals });
                }
            }
    
            this.setState({
                financialHealthScore: response.score,
                financialHealthTip: response.tip,
                isGeneratingHealthScore: false
            });
    
        } catch (error) {
            this.setState({ isGeneratingHealthScore: false, financialHealthScore: null, financialHealthTip: null });
        }
    }
    
    private async generateFinancialSummary() {
        if (!this.state.ai || this.state.isGeneratingSummary || this.state.financialSummary) return;
    
        this.setState({ isGeneratingSummary: true });
    
        // Use expenses from the last 7 days for a "weekly" summary
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentExpenses = this.state.expenses.filter(e => new Date(e.date) >= sevenDaysAgo);
    
        if (recentExpenses.length === 0) {
            this.setState({
                isGeneratingSummary: false,
                financialSummary: {
                    title: "Your Weekly Snapshot",
                    period: "Last 7 Days",
                    keyInsight: "It's been a quiet week for spending. You're in a great position to plan ahead!",
                    positiveCallout: "This is a perfect moment of clarity before the next week begins.",
                    suggestion: "How about setting a new, exciting savings goal to channel this momentum?"
                }
            });
            return;
        }
    
        const prompt = `
            You are a friendly and insightful Nigerian financial analyst. Your goal is to provide a user with a concise, encouraging, and actionable summary of their financial activity over the last 7 days. Your tone is positive and empowering.
    
            User's Financial Context:
            - Wallet Balance: ${formatNaira(this.state.walletBalance)}
            - Recent Expenses (last 7 days): ${JSON.stringify(recentExpenses)}
            - Budgets: ${JSON.stringify(this.state.budgets)}
    
            Based on this data, generate a summary. Focus on one key insight and one actionable suggestion, framed positively.
            Return your response ONLY as a valid JSON object adhering to the schema. Do not add any extra text or markdown.
        `;
    
        try {
            const result = await this.state.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "A catchy title, like 'Your Weekly Snapshot' or 'Last Week's Financial Playback'."},
                            period: { type: Type.STRING, description: "The time period covered, e.g., 'Last 7 Days'." },
                            keyInsight: { type: Type.STRING, description: "The single most important observation. e.g., 'Transportation was your main focus this week, which shows you were on the move!'"},
                            positiveCallout: { type: Type.STRING, description: "An encouraging comment. e.g., 'You did an amazing job staying on track with your Groceries guideline!'"},
                            suggestion: { type: Type.STRING, description: "One clear, actionable piece of advice. e.g., 'For next week, let's see if we can find some transport deals to free up cash for your other goals.'"}
                        },
                        required: ['title', 'period', 'keyInsight', 'positiveCallout', 'suggestion']
                    }
                }
            });
    
            this.setState({
                financialSummary: JSON.parse(result.text),
                isGeneratingSummary: false
            });
        } catch (error) {
            console.error("Error generating financial summary:", error);
            this.setState({ isGeneratingSummary: false });
        }
    }

    private async generateMarketplaceRecommendations() {
        if (!this.state.ai || this.state.isGeneratingMarketplaceRecs) return;
        
        this.setState({ isGeneratingMarketplaceRecs: true, marketplaceRecommendations: [] });

        const spendingByCategory: Record<string, number> = {};
        this.state.expenses.forEach(exp => {
            spendingByCategory[exp.category] = (spendingByCategory[exp.category] || 0) + exp.amount;
        });

        const topCategories = Object.entries(spendingByCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);

        const prompt = `
            You are an expert Personal Shopper for a Nigerian user. Your goal is to analyze the user's financial data and a list of available deals to find the most relevant and appealing offers for them RIGHT NOW.

            User's Financial Context:
            - Wallet Balance: ${formatNaira(this.state.walletBalance)}
            - Top 3 Spending Categories this month: ${JSON.stringify(topCategories)}
            
            Available Deals:
            ${JSON.stringify(this.state.deals)}

            Based on the context and the available deals, select up to 4 deals that would be most compelling for this user. Prioritize deals that:
            1. Align with their top spending categories.
            2. Are easily affordable given their current wallet balance.
            
            Return your response ONLY as a valid JSON object following this schema. Do not add any extra text or explanation.
        `;

        try {
            const result = await this.state.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            recommendedDealIds: {
                                type: Type.ARRAY,
                                description: "An array of numbers, corresponding to the 'id' of the recommended deals.",
                                items: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            });

            const response = JSON.parse(result.text);
            if (response.recommendedDealIds) {
                this.setState({
                    marketplaceRecommendations: response.recommendedDealIds,
                    isGeneratingMarketplaceRecs: false
                });
            } else {
                throw new Error("Invalid format for marketplace recs");
            }
        } catch (error) {
            // Silently fail, user will just see the full list of deals
            this.setState({ isGeneratingMarketplaceRecs: false, marketplaceRecommendations: [] });
        }
    }


    private async handleDemoQuery(form: HTMLFormElement | null, directQuery?: string) {
        if (this.state.isDemoLoading || !this.state.ai) return;

        let query = '';
        let input: HTMLInputElement | null = null;
        if (form) {
            input = form.querySelector('input') as HTMLInputElement;
            query = input.value.trim();
        } else if (directQuery) {
            query = directQuery;
        }

        if (!query) return;

        const newHistory = [...this.state.demoChatHistory, { role: 'user' as const, parts: [{ text: query }] }];
        this.setState({ demoChatHistory: newHistory, isDemoLoading: true });
        if(input) input.value = '';
        this.scrollToBottom('#demo-chat-messages');
        
        const systemInstruction = `You are demonstrating Cravour, an expert Nigerian Budget Assistant. Your goal is to provide clear, resourceful, and encouraging advice to help users manage their budget. All monetary values are in Nigerian Naira (NGN).
- ALWAYS respond in a valid JSON format.
- Your response MUST follow this schema: { "type": "text" | "recommendation" | "trip_plan", "payload": object }

- For type="recommendation", find the best deal from the provided sample data based on the user's location and query. If no perfect match exists, be creative and create a plausible deal based on the user's request. The payload schema is:
{
  "summary": "A short, encouraging sentence about the recommendation.",
  "isAffordable": true,
  "deal": { "productName": "string", "merchantName": "string", "price": "number", "imageUrl": "string" }
}

- For type="text", the payload schema is: { "message": "Your conversational answer as a string." }

- For type="trip_plan", the payload schema is:
{
  "summary": "A short, encouraging sentence about the trip plan.",
  "isFeasible": boolean,
  "totalCost": number,
  "steps": [
    { "mode": "Bus" | "Car" | "Ferry" | "Keke" | "Okada" | "Walk" | "Food" | "Misc", "description": "string", "cost": number }
  ]
}
Use the 'trip_plan' type when the user asks about traveling between locations with a budget. Break down the journey into logical steps and estimate costs.

Sample Data:
Budgets: []
Local Deals: ${JSON.stringify(sampleDeals)}`;

        try {
            const stream = await this.state.ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: `Based on the provided data and your instructions, answer the user's question: "${query}"`,
                config: {
                    systemInstruction: systemInstruction,
                }
            });
            
            const streamingMessageIndex = newHistory.length;
            this.setState({
                demoChatHistory: [...newHistory, { role: 'model', parts: [{ text: '' }], isStreaming: true }],
            });
            this.scrollToBottom('#demo-chat-messages');

            let fullResponse = "";
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                const updatedHistory = [...this.state.demoChatHistory];
                updatedHistory[streamingMessageIndex].parts[0].text = fullResponse;
                this.setState({ demoChatHistory: updatedHistory });
                this.scrollToBottom('#demo-chat-messages');
            }

            const finalHistory = [...this.state.demoChatHistory];
            finalHistory[streamingMessageIndex].isStreaming = false;
            this.setState({ demoChatHistory: finalHistory, isDemoLoading: false });

        } catch (error) {
            const errorPayload = { type: 'text', payload: { message: "Sorry, I couldn't process that. The server might be busy." } };
            this.setState({
                demoChatHistory: [...newHistory, { role: 'model' as const, parts: [{ text: JSON.stringify(errorPayload) }] }],
                isDemoLoading: false
            });
            this.scrollToBottom('#demo-chat-messages');
        }
    }
    
    private async handleCoPilotQuery(form: HTMLFormElement) {
        if (this.state.isCoPilotLoading || !this.state.coPilotChat) return;

        const input = form.querySelector('input') as HTMLInputElement;
        const query = input.value.trim();
        if (!query) return;
        
        const historyWithUserMsg = [...this.state.activeChatMessages, { role: 'user' as const, parts: [{ text: query }] }];
        
        this.setState({ activeChatMessages: historyWithUserMsg, isCoPilotLoading: true });
        input.value = '';
        this.scrollToBottom('#copilot-chat-messages');

        try {
            const stream = await this.state.coPilotChat.sendMessageStream({ message: query });
            
            const streamingMessageIndex = historyWithUserMsg.length;
            this.setState({
                activeChatMessages: [...historyWithUserMsg, { role: 'model', parts: [{ text: "" }], isStreaming: true }],
            });
            this.scrollToBottom('#copilot-chat-messages');

            let fullResponse = "";
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                const updatedHistory = [...this.state.activeChatMessages];
                updatedHistory[streamingMessageIndex].parts[0].text = fullResponse;
                this.setState({ activeChatMessages: updatedHistory });
                this.scrollToBottom('#copilot-chat-messages');
            }
            
            const finalHistory = [...this.state.activeChatMessages];
            finalHistory[streamingMessageIndex].isStreaming = false;
            this.setState({ activeChatMessages: finalHistory, isCoPilotLoading: false });

        } catch(error) {
            const errorPayload = { type: 'text', payload: { message: "I encountered an error. Please try again." } };
            this.setState({
                activeChatMessages: [...historyWithUserMsg, { role: 'model' as const, parts: [{text: JSON.stringify(errorPayload) }] }],
                isCoPilotLoading: false
            });
            this.scrollToBottom('#copilot-chat-messages');
        }
    }


    // --- Render Methods ---
    private render() {
        document.body.dataset.theme = this.state.theme;
        document.body.dataset.authState = this.state.isLoggedIn ? 'logged-in' : 'logged-out';
        document.body.classList.toggle('mobile-menu-open', this.state.isMobileMenuOpen);
        document.body.dataset.menuOpen = this.state.isAppMenuOpen ? 'true' : 'false';

        if (this.state.isLoggedIn) {
            this.renderAppDashboard();
        } else {
            // Re-render the chat widget on the landing page if it exists
            if (document.querySelector('.skeleton-chat')) {
                this.renderBySelector('.skeleton-chat', this.renderChatWidget('demo'));
            }
        }
        
        this.renderAuthModal();
        this.renderPaymentModal();
        this.renderActionModal();
        this.renderBudgetModal();
    }

    private renderMobileMenu(): string {
        return `
                <div class="mobile-nav-header">
                     <a href="#" class="header-logo" data-action="navigate" data-view="co-pilot">
                        <span class="logo-svg">${icons.logo}</span>
                        Cravour
                    </a>
                    <button class="mobile-menu-close" data-action="toggle-mobile-menu" aria-label="Close menu">
                        ${icons.close}
                    </button>
                </div>
                <div class="mobile-nav-content">
                    <nav>
                        <ul class="mobile-nav-list">
                            <li><button class="nav-button" data-action="navigate" data-view="#features">Features</button></li>
                            <li><button class="nav-button" data-action="navigate" data-view="#for-merchants">For Merchants</button></li>
                        </ul>
                    </nav>
                    <div class="mobile-nav-actions">
                        <button class="btn btn-secondary-outline" data-action="show-login">Log In</button>
                        <button class="btn btn-primary" data-action="show-signup">Start Mastering Your Finances</button>
                    </div>
                </div>
        `;
    }

    private renderChatWidget(type: 'demo' | 'copilot', historyOverride: ChatMessage[] | null = null): string {
        const history = historyOverride ?? (type === 'demo' ? this.state.demoChatHistory : this.state.activeChatMessages);
        const isLoading = type === 'demo' ? this.state.isDemoLoading : this.state.isCoPilotLoading;
        const formId = `${type}-chat-form`;
        const messagesId = `${type}-chat-messages`;
        const placeholder = type === 'demo' ? "Ask about deals, trips, and more..." : "Ask your co-pilot anything...";
        const smartQueries = type === 'demo' ? ["Find me deals at Shoprite", "Can I afford a trip to Ikoyi?", "Any deals for a new phone?"] : [];

        return `
            <div class="chat-messages" id="${messagesId}">${this.renderChatHistory(history)}</div>
            ${smartQueries.length > 0 ? `<div class="smart-queries">${smartQueries.map(q => `<button class="smart-query-btn" data-action="demo-smart-query" data-query="${q}">${q}</button>`).join('')}</div>` : ''}
            <form class="chat-form" id="${formId}">
                <input type="text" class="input-field" placeholder="${placeholder}" required ${isLoading ? 'disabled' : ''}>
                <button type="submit" class="btn btn-primary" aria-label="Send message" ${isLoading ? 'disabled' : ''}>
                    ${isLoading ? `<div class="spinner"></div>` : `<span class="btn-icon">${icons.send}</span>`}
                </button>
            </form>
        `;
    }
    
    private renderRecommendationCard(payload: any): string {
        const { summary, isAffordable, deal } = payload;
        return `
            <div class="ai-message">
                ${summary ? `<p class="recommendation-summary">${summary}</p>` : ''}
                <div class="recommendation-card-container">
                    <div class="recommendation-card" style="--bg-image: url('${deal.imageUrl}')">
                        <div class="recommendation-card-content">
                            <div class="recommendation-card-header">
                                <h4 class="product-name">${deal.productName}</h4>
                                <p class="merchant-name">at ${deal.merchantName}</p>
                            </div>
                            <div class="recommendation-card-footer">
                                <span class="price">${formatNaira(deal.price)}</span>
                                <span class="affordability-tag ${isAffordable ? 'affordable' : 'expensive'}">
                                    ${isAffordable ? 'Affordable' : 'Stretch'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private getTripStepIcon(mode: string): string {
        const modeLower = mode.toLowerCase();
        switch(modeLower) {
            case 'bus': return icons.bus;
            case 'car': return icons.car;
            case 'food': return icons.food;
            case 'walk': return icons.walk;
            case 'ferry': return icons.transactions; // placeholder
            case 'keke': return icons.transactions; // placeholder
            case 'okada': return icons.transactions; // placeholder
            default: return icons.transactions; // A generic circle icon for 'Misc'
        }
    }

    private renderTripPlanCard(payload: any): string {
        const { summary, isFeasible, totalCost, steps } = payload;

        const stepsHtml = steps.map((step: any) => `
            <li class="trip-plan-step">
                <div class="trip-step-icon">
                    <span class="btn-icon">${this.getTripStepIcon(step.mode)}</span>
                </div>
                <div class="trip-step-details">
                    <span class="trip-step-description">${step.description}</span>
                    <span class="trip-step-cost">${formatNaira(step.cost)}</span>
                </div>
            </li>
        `).join('');

        return `
            <div class="ai-message">
                <div class="trip-plan-card">
                    <div class="trip-plan-header">
                        <h3>Your Trip Plan</h3>
                        <p class="trip-plan-summary ${isFeasible ? '' : 'infeasible'}">${summary}</p>
                    </div>
                    <ul class="trip-plan-steps">
                        ${stepsHtml}
                    </ul>
                    <div class="trip-plan-footer">
                        <span class="total-label">Total Estimated Cost</span>
                        <strong class="total-cost">${formatNaira(totalCost)}</strong>
                    </div>
                     <button class="btn btn-secondary-outline" data-action="navigate" data-view="cravour-pay">
                        Log Trip Expenses with Cravour Pay
                    </button>
                </div>
            </div>
        `;
    }
    
    private renderChatHistory(history: ChatMessage[]): string {
        const isLoading = this.state.isDemoLoading || this.state.isCoPilotLoading;
    
        let html = history
            .map((msg) => {
                const textContent = msg.parts[0]?.text || '';
                
                if (msg.role === 'model') {
                    if (msg.isStreaming && !textContent) {
                        return ''; 
                    }
                    try {
                        // Clean the string from markdown fences before parsing
                        let cleanedText = textContent.trim();
                        if (cleanedText.startsWith("```json")) {
                            cleanedText = cleanedText.substring(7, cleanedText.length - 3).trim();
                        } else if (cleanedText.startsWith("```")) {
                             cleanedText = cleanedText.substring(3, cleanedText.length - 3).trim();
                        }
                        
                        const parsed = JSON.parse(cleanedText);

                        if (parsed.type === 'recommendation' && parsed.payload?.deal) {
                            return this.renderRecommendationCard(parsed.payload);
                        }
                        if (parsed.type === 'trip_plan' && parsed.payload?.steps) {
                            return this.renderTripPlanCard(parsed.payload);
                        }
                        if (parsed.type === 'text' && parsed.payload?.message) {
                            return `<div class="ai-message message">${parsed.payload.message.replace(/\n/g, '<br>')}</div>`;
                        }
                        return `<div class="ai-message message">${textContent.replace(/\n/g, '<br>')}</div>`;
                    } catch (e) {
                        return `<div class="ai-message message">${textContent.replace(/\n/g, '<br>')}${msg.isStreaming ? '<span class="blinking-cursor"></span>' : ''}</div>`;
                    }
                }
                
                return `<div class="user-message message">${textContent.replace(/\n/g, '<br>')}</div>`;
        }).join('');
    
        const streamingMsg = history.find(m => m.isStreaming);
        if (isLoading && (!streamingMsg || !streamingMsg.parts[0].text)) {
             html += `<div class="ai-message message thinking-indicator"><div class="spinner"></div><span>Cravour is thinking...</span></div>`;
        }
        return html;
    }

    private renderAuthModal() {
        const modal = document.getElementById('auth-modal')!;
        if (this.state.showAuthModal) {
            modal.classList.remove('hidden');
            this.renderBySelector('#auth-form-container', `
                <button class="modal-close-btn" aria-label="Close authentication form" data-action="close-modal">${icons.close}</button>
                <div class="auth-tabs">
                    <button class="auth-tab-btn ${this.state.authView === 'login' ? 'active' : ''}" data-action="set-auth-view" data-view="login">Log In</button>
                    <button class="auth-tab-btn ${this.state.authView === 'signup' ? 'active' : ''}" data-action="set-auth-view" data-view="signup">Sign Up</button>
                </div>
                ${this.state.authView === 'login' ? this.renderLoginForm() : this.renderSignupForm()}
            `);
        } else {
            modal.classList.add('hidden');
        }
    }
    
    private renderLoginForm(): string {
        return `<form id="auth-form" class="auth-form">${this.renderAuthFormFields()} ${this.renderAuthTypeToggle()} <button type="submit" class="btn btn-primary">Log In</button></form>`;
    }

    private renderSignupForm(): string {
        return `<form id="auth-form" class="auth-form"><div class="form-group"><label for="full-name">Full Name</label><input type="text" id="full-name" class="input-field" required></div>${this.renderAuthFormFields()} ${this.renderAuthTypeToggle()} <button type="submit" class="btn btn-primary">Create Account</button></form>`;
    }

    private renderAuthFormFields(): string {
        return `<div class="form-group"><label for="email">Email Address</label><input type="email" id="email" class="input-field" required></div><div class="form-group"><label for="password">Password</label><input type="password" id="password" class="input-field" required></div>`;
    }
    
    private renderAuthTypeToggle(): string {
        const isPersonal = this.state.userTypeSelection === 'personal';
        return `
            <div class="form-group">
                <label>Account Type</label>
                <div class="auth-type-toggle">
                    <button type="button" class="${isPersonal ? 'active' : ''}" data-action="set-account-type" data-view="personal">Personal</button>
                    <button type="button" class="${!isPersonal ? 'active' : ''}" data-action="set-account-type" data-view="business">Business</button>
                </div>
            </div>`;
    }
    
    private renderAppDashboard() {
        this.renderBySelector('#app-dashboard', `
            <div class="app-menu-overlay" data-action="toggle-app-menu"></div>
            ${this.renderSidebar()}
            <main class="main-content">
                ${this.renderAppHeader()}
                <div id="app-view-container">
                    ${this.renderCurrentView()}
                </div>
            </main>
        `);
    }

    private renderAppHeader() {
        const navItem = this.getActiveNavItem();
        return `
            <div class="app-header-mobile">
                 <button class="app-menu-toggle" data-action="toggle-app-menu" aria-label="Open menu">
                    <span class="btn-icon">${icons.hamburger}</span>
                </button>
                <h1 class="app-header-title">${navItem?.label || 'Dashboard'}</h1>
            </div>
            ${this.state.accountType !== 'personal' || this.state.currentView !== 'insights' ? this.renderNotificationBar() : ''}
        `;
    }

    private renderSidebar(): string {
        const className = `sidebar ${this.state.isSidebarCollapsed ? 'collapsed' : ''} ${this.state.isAppMenuOpen ? 'open' : ''}`;
        return this.renderSidebarBase(className, this.state.accountType === 'personal' ? 'personal' : 'business');
    }

    private renderSidebarBase(className: string, type: 'personal' | 'business'): string {
        const personalNav = [
            { view: 'co-pilot', label: 'AI Co-pilot', icon: 'coPilot' },
            { view: 'chat-history', label: 'Chat History', icon: 'history' },
            { view: 'insights', label: 'Snapshot', icon: 'insight' },
            { view: 'expenses', label: 'Expenses', icon: 'transactions' },
            { view: 'budgets', label: 'Budget Planner', icon: 'budgets' },
            { view: 'goals', label: 'Goals', icon: 'target' },
            { view: 'deals', label: 'Marketplace', icon: 'marketplace' },
            { view: 'cravour-pay', label: 'Cravour Pay', icon: 'pay' },
        ];
        if (this.state.pastPeriods.length > 0) {
            personalNav.push({ view: 'past-reports', label: 'Past Reports', icon: 'history' });
        }
        
        const enterpriseNav = [
            { view: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { view: 'transactions', label: 'Transactions', icon: 'transactions' },
        ];

        const navItems = (type === 'personal' ? personalNav : enterpriseNav).map(item => `
            <li>
                <a href="#" class="nav-link ${this.isActiveView(item.view) ? 'active' : ''}" data-action="navigate" data-view="${item.view}" title="${item.label}">
                    <span class="btn-icon">${icons[item.icon as keyof typeof icons]}</span>
                    <span class="nav-link-text">${item.label}</span>
                </a>
            </li>`).join('');

        return `
            <aside class="${className}">
                <div class="sidebar-header">
                    <a href="#" class="sidebar-logo" data-action="navigate" data-view="${type === 'personal' ? 'co-pilot' : 'dashboard'}">
                        <span class="logo-svg">${icons.logo}</span>
                        <span class="logo-text">Cravour</span>
                    </a>
                    <button class="sidebar-close-btn" data-action="toggle-app-menu" aria-label="Close menu">
                        ${icons.close}
                    </button>
                </div>
                <nav class="nav">
                    <ul class="nav-list">
                        ${navItems}
                    </ul>
                </nav>
                <div class="sidebar-footer">
                     <a href="#" class="nav-link ${this.isActiveView('profile') ? 'active' : ''}" data-action="navigate" data-view="profile" title="Profile">
                        <span class="btn-icon">${icons.profile}</span><span class="nav-link-text">Profile</span>
                     </a>
                     <a href="#" class="nav-link ${this.isActiveView('settings') ? 'active' : ''}" data-action="navigate" data-view="settings" title="Settings">
                        <span class="btn-icon">${icons.settings}</span><span class="nav-link-text">Settings</span>
                     </a>
                     <a href="#" class="nav-link" data-action="logout" title="Logout">
                        <span class="btn-icon">${icons.logout}</span><span class="nav-link-text">Logout</span>
                     </a>
                </div>
                 <div class="sidebar-collapse-toggle-wrapper">
                    <button class="sidebar-collapse-toggle" data-action="toggle-sidebar-collapse" aria-label="${this.state.isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}">
                        <span class="btn-icon">${this.state.isSidebarCollapsed ? icons.chevronDoubleRight : icons.chevronDoubleLeft}</span>
                    </button>
                </div>
            </aside>
        `;
    }

    private renderBySelector(selector: string, html: string) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = html;
        }
    }
    
    private getActiveNavItem() {
         const personalNav = [
            { view: 'co-pilot', label: 'AI Co-pilot', icon: 'coPilot' },
            { view: 'chat-history', label: 'Chat History', icon: 'history' },
            { view: 'chat-session-detail', label: 'Chat Transcript', icon: 'history' },
            { view: 'insights', label: 'Snapshot', icon: 'insight' },
            { view: 'expenses', label: 'Expenses', icon: 'transactions' },
            { view: 'budgets', label: 'Budget Planner', icon: 'budgets' },
            { view: 'goals', label: 'Goals', icon: 'target' },
            { view: 'deals', label: 'Marketplace', icon: 'marketplace' },
            { view: 'cravour-pay', label: 'Cravour Pay', icon: 'pay' },
            { view: 'past-reports', label: 'Past Reports', icon: 'history' },
            { view: 'profile', label: 'Profile', icon: 'profile' },
            { view: 'settings', label: 'Settings', icon: 'settings' },
            { view: 'report', label: 'Expense Report', icon: 'history' },
        ];
        const enterpriseNav = [
            { view: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { view: 'transactions', label: 'Transactions', icon: 'transactions' },
            { view: 'profile', label: 'Profile', icon: 'profile' },
            { view: 'settings', label: 'Settings', icon: 'settings' },
        ];
        const navList = this.state.accountType === 'personal' ? personalNav : enterpriseNav;
        return navList.find(item => this.isActiveView(item.view));
    }

    private isActiveView(view: string): boolean {
        if (this.state.accountType === 'personal') {
            return this.state.currentView === view;
        }
        if (this.state.accountType === 'business') {
            return this.state.enterpriseView === view;
        }
        return false;
    }
    
    private renderCurrentView(): string {
        // Handle new user onboarding first
        if (this.state.accountType === 'personal' && !this.state.periodStartDate) {
            return this.renderWelcomeOnboardingView();
        }
        
        // Handle end of budget period
        if (this.state.accountType === 'personal' && this.state.walletBalance <= 0 && this.state.initialWalletBalance > 0) {
            return this.renderEndOfPeriodView();
        }

        if (this.state.accountType === 'personal') {
            switch (this.state.currentView) {
                case 'co-pilot': return this.renderCoPilotView();
                case 'chat-history': return this.renderChatHistoryView();
                case 'chat-session-detail': return this.renderChatSessionDetailView();
                case 'insights': return this.renderInsightsView();
                case 'expenses': return this.renderExpensesView();
                case 'budgets': return this.renderBudgetPlannerView();
                case 'goals': return this.renderGoalsView();
                case 'deals': return this.renderMarketplaceView();
                case 'cravour-pay': return this.renderCravourPayView();
                case 'profile': return this.renderProfileView();
                case 'settings': return this.renderSettingsView();
                case 'past-reports': return this.renderPastReportsView();
                case 'report': return this.renderReportView();
                default: return `<h2>Personal View: ${this.state.currentView}</h2>`;
            }
        }
        if (this.state.accountType === 'business') {
             switch (this.state.enterpriseView) {
                case 'dashboard': return this.renderEnterpriseDashboard();
                case 'transactions': return this.renderEnterpriseTransactions();
                case 'profile': return this.renderProfileView();
                case 'settings': return this.renderSettingsView();
                default: return `<h2>Business View: ${this.state.enterpriseView}</h2>`;
            }
        }
        return `<h2>Welcome</h2>`;
    }

    private renderCoPilotView() {
        return `
            <div class="copilot-view">
                <div class="copilot-view-header">
                    <h2>AI Co-pilot</h2>
                    <button class="btn btn-secondary-outline" data-action="start-new-chat">
                        <span class="btn-icon">${icons.plusCircle}</span>
                        <span>New Chat</span>
                    </button>
                </div>
                <div class="chat-container">
                    ${this.renderChatWidget('copilot')}
                </div>
            </div>`;
    }

    private renderChatHistoryView() {
        const sessionsHtml = this.state.chatSessions.length > 0
            ? this.state.chatSessions.map(session => {
                const firstUserMessage = session.messages.find((m: ChatMessage) => m.role === 'user');
                const previewText = firstUserMessage ? `“${firstUserMessage.parts[0].text}”` : "No messages sent.";
                const sessionDate = new Date(session.startDate).toLocaleString('en-NG', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                });

                return `
                    <div class="card chat-history-card">
                        <div class="chat-history-card-header">Chat from ${sessionDate}</div>
                        <div class="chat-history-card-preview">${previewText}</div>
                        <div class="chat-history-card-actions">
                             <button class="btn btn-secondary-outline" data-action="navigate" data-view="chat-session/${session.id}">View Full Chat</button>
                             <button class="icon-btn delete-btn" data-action="show-delete-chat-modal" data-id="${session.id}" aria-label="Delete chat session">
                                ${icons.trash}
                            </button>
                        </div>
                    </div>
                `;
            }).join('')
            : this.renderActionableEmptyState(
                'history',
                "No Chat History",
                "Your past conversations with the AI co-pilot will appear here.",
                "Start a New Chat",
                'navigate',
                'co-pilot'
            );
        
        return `
            <div class="chat-history-view">
                <div class="view-header">
                    <h1>Chat History</h1>
                    <p class="view-subtitle">Review your past conversations with the AI Co-pilot.</p>
                </div>
                <div class="chat-history-grid">${sessionsHtml}</div>
            </div>
        `;
    }

    private renderChatSessionDetailView() {
        if (this.state.selectedChatSessionId === null) return this.renderChatHistoryView();

        const session = this.state.chatSessions.find(s => s.id === this.state.selectedChatSessionId);
        if (!session) return this.renderChatHistoryView();

        const sessionDate = new Date(session.startDate).toLocaleString('en-NG', {
            dateStyle: 'full',
            timeStyle: 'short',
        });

        return `
            <div class="chat-session-detail-view">
                <div class="view-header chat-detail-header">
                    <div>
                        <h1>Chat Transcript</h1>
                        <p class="view-subtitle">Conversation from ${sessionDate}</p>
                    </div>
                    <button class="btn btn-secondary-outline" data-action="navigate" data-view="chat-history">Back to History</button>
                </div>
                <div class="chat-messages-readonly">
                    ${this.renderChatHistory(session.messages)}
                </div>
            </div>
        `;
    }
    
    private renderActionableEmptyState(icon: keyof typeof icons, title: string, text: string, buttonText: string, action: string, actionDetail: string): string {
        let buttonAttrs: string;
        let buttonIconHtml = '';

        if (action === 'navigate' || action.startsWith('show-')) {
            buttonAttrs = `data-action="${action}" data-view="${actionDetail}"`;
        } else {
            // Assume it's form focusing
            buttonAttrs = `data-action="focus-add-form" data-form-id="${action}" data-input-id="${actionDetail}"`;
        }
        
        if (actionDetail) {
             buttonIconHtml = `<span class="btn-icon">${icons.plusCircle}</span>`;
        }
        
        return `
            <div class="empty-state empty-state-actionable">
                <div class="empty-state-icon">
                    ${icons[icon]}
                </div>
                <h2>${title}</h2>
                <p>${text}</p>
                <button class="btn btn-primary" ${buttonAttrs}>
                    ${buttonIconHtml}
                    <span>${buttonText}</span>
                </button>
            </div>
        `;
    }
    
    private renderExpenseItem(exp: any, isInteractive: boolean): string {
        const categoryClass = exp.category.replace(/[^a-zA-Z0-9]/g, '-');
        const displayDate = new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        return `
            <div class="expense-item">
                <div class="expense-details">
                    <div class="name">${exp.name}</div>
                    <div class="category">
                        <span class="tag ${categoryClass}">${exp.category}</span>
                        <span>&bull;</span>
                        <span class="date">${displayDate}</span>
                    </div>
                </div>
                <div class="expense-amount">${formatNaira(exp.amount)}</div>
                ${isInteractive ? `
                <button class="icon-btn delete-btn" data-action="delete-expense" data-id="${exp.id}" aria-label="Delete expense">
                    ${icons.trash}
                </button>
                ` : ''}
            </div>
        `;
    }

    private renderExpensesView() {
        const listContent = this.state.expenses.length > 0
            ? this.state.expenses.map(exp => this.renderExpenseItem(exp, true)).join('')
            : this.renderActionableEmptyState(
                'plusCircle',
                "Your fresh start begins now!",
                "Log your first expense to see your financial picture come to life.",
                'Add Your First Expense',
                'add-expense-card',
                'expense-name-input'
            );

        return `
            <div class="expenses-view">
                <div class="view-header">
                    <h1>Expenses</h1>
                    <p class="view-subtitle">Keep a detailed record of all your transactions, faster than ever.</p>
                </div>
                <div class="expenses-view-layout">
                    <div class="card expenses-list-card">
                        <h2>Expense History</h2>
                        <div class="expenses-list-container">${listContent}</div>
                    </div>
                    <div class="expense-forms-column">
                        <div class="card quick-add-card">
                            <h2>Quick Add with AI</h2>
                            <form id="quick-add-expense-form">
                                <div class="form-group">
                                    <label for="quick-add-expense-input">Describe your expense</label>
                                    <input type="text" id="quick-add-expense-input" name="query" class="input-field" required placeholder="e.g., Lunch with friends for 7500 yesterday">
                                </div>
                                <button type="submit" class="btn btn-primary" ${this.state.isAnalyzingExpense ? 'disabled' : ''}>
                                    ${this.state.isAnalyzingExpense ? `<div class="spinner"></div><span>Analyzing...</span>` : `Analyze with AI`}
                                </button>
                            </form>
                        </div>
                        <div class="card add-expense-card" id="add-expense-card">
                            <h2>Add Manually</h2>
                            <form id="add-expense-form">
                                <div class="form-group">
                                    <label for="expense-name-input">Description</label>
                                    <input type="text" id="expense-name-input" name="name" class="input-field" required placeholder="e.g., Lunch at The Place">
                                </div>
                                <div class="form-group">
                                    <label for="expense-amount">Amount (NGN)</label>
                                    <input type="number" id="expense-amount" name="amount" class="input-field" required placeholder="e.g., 3500">
                                </div>
                                 <div class="form-group">
                                    <label for="expense-category">Category</label>
                                    <select id="expense-category" name="category" class="input-field" required>
                                        <option value="" disabled selected>Select a category</option>
                                        ${CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="expense-date">Date</label>
                                    <input type="date" id="expense-date" name="date" class="input-field" required value="${new Date().toISOString().substring(0, 10)}">
                                </div>
                                <button type="submit" class="btn btn-secondary-outline">Add Expense</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private renderBudgetPlannerView() {
        const budgetsHtml = this.state.budgets.length > 0
            ? `<div class="budgets-grid">${this.state.budgets.map(b => this.renderBudgetCard(b)).join('')}</div>`
            : this.renderActionableEmptyState(
                'plusCircle',
                "No budget plan created yet.",
                "Create your first budget to start planning.",
                'Add First Budget',
                'show-add-budget-modal',
                ''
              );
    
        return `
             <div class="budgets-view">
                <div class="view-header">
                    <h1>Budget Planner</h1>
                    <p class="view-subtitle">Plan your spending from your wallet, then track your progress.</p>
                </div>
                ${this.renderMasterBudgetSummary()}
                <div class="card">
                    <div class="budget-planner-header">
                        <h2>Your Budget Plan</h2>
                        <button class="btn btn-primary" data-action="show-add-budget-modal">
                           <span class="btn-icon">${icons.plusCircle}</span> 
                           Add Category
                        </button>
                    </div>
                    ${budgetsHtml}
                </div>
            </div>
        `;
    }

    private renderMasterBudgetSummary() {
        const totalBudgeted = this.state.budgets.reduce((sum, b) => sum + b.amount, 0);
        const walletBalance = this.state.walletBalance;
        const difference = walletBalance - totalBudgeted;
        const isOverBudget = difference < 0;
    
        // Use walletBalance as the denominator for progress, only if it's > 0
        const progress = this.state.initialWalletBalance > 0 ? (totalBudgeted / this.state.initialWalletBalance) * 100 : 0;

        return `
            <div class="card master-budget-summary">
                <div class="summary-details">
                    <div class="summary-item">
                        <span>Wallet Balance</span>
                        <strong>${formatNaira(this.state.initialWalletBalance)}</strong>
                    </div>
                    <div class="summary-item">
                        <span>Total Budgeted</span>
                        <strong>${formatNaira(totalBudgeted)}</strong>
                    </div>
                    <div class="summary-item">
                        <span class="${isOverBudget ? 'text-danger' : ''}">${isOverBudget ? 'Over Budget By' : 'Unbudgeted'}</span>
                        <strong class="${isOverBudget ? 'text-danger' : ''}">${formatNaira(Math.abs(walletBalance - totalBudgeted))}</strong>
                    </div>
                </div>
                <div class="master-progress-bar">
                    <div class="master-progress-bar-inner ${isOverBudget ? 'over-budget' : 'ok'}" style="width: ${Math.min(progress, 100)}%;"></div>
                </div>
                <div class="master-budget-actions">
                    <button class="btn btn-secondary-outline" data-action="ai-suggest-budget-plan" ${this.state.isGeneratingBudgetPlan || this.state.initialWalletBalance <= 0 ? 'disabled' : ''}>
                        ${this.state.isGeneratingBudgetPlan ? `<div class="spinner"></div><span>Thinking...</span>` : 'AI Suggest Plan'}
                    </button>
                </div>
            </div>
        `;
    }

    private renderBudgetCard(budget: any): string {
        const spent = this.state.expenses.filter(e => e.category === budget.category).reduce((sum, e) => sum + e.amount, 0);
        const remaining = budget.amount - spent;
        const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
        
        let status = 'ok';
        if (percentage > 90) status = 'danger';
        else if (percentage > 70) status = 'warning';
        
        return `
            <div class="budget-card card">
                <div class="budget-card-header">
                    <h3>${budget.category}</h3>
                    <div class="budget-card-actions">
                        <button class="icon-btn" data-action="show-edit-budget-modal" data-category="${budget.category}" aria-label="Edit budget">${icons.edit}</button>
                        <button class="icon-btn delete-btn" data-action="show-delete-budget-modal" data-category="${budget.category}" aria-label="Delete budget">${icons.trash}</button>
                    </div>
                </div>
                <div class="budget-card-total">${formatNaira(budget.amount)}</div>
                <div class="budget-progress-bar">
                    <div class="budget-progress-bar-inner status-${status}" style="width: ${percentage}%"></div>
                </div>
                <div class="budget-card-details">
                    <div>
                        <span>Spent</span>
                        <strong>${formatNaira(spent)}</strong>
                    </div>
                     <div>
                        <span>Remaining</span>
                        <strong class="${remaining < 0 ? 'text-danger' : ''}">${formatNaira(remaining)}</strong>
                    </div>
                </div>
            </div>`;
    }

    private renderGoalsView() {
        const goalsHtml = this.state.financialGoals.length > 0
            ? this.state.financialGoals.map(g => this.renderGoalCard(g)).join('')
            : this.renderActionableEmptyState(
                'plusCircle',
                "No financial goals set.",
                "Define what you're saving for, like a vacation or a new phone, and track your progress.",
                'Set a New Goal',
                'add-goal-card',
                'goal-name-input'
            );

        return `
             <div class="goals-view">
                <div class="view-header">
                    <h1>Financial Goals</h1>
                    <p class="view-subtitle">Track your progress towards your long-term savings objectives.</p>
                </div>
                <div class="goals-view-layout">
                     <div class="card">
                        <h2>Your Goals</h2>
                        <div class="goals-grid">${goalsHtml}</div>
                    </div>
                    <div class="card add-goal-card" id="add-goal-card">
                        <h2>Add New Goal</h2>
                        <form id="add-goal-form">
                             <div class="form-group">
                                <label for="goal-name-input">Goal Name</label>
                                <input type="text" id="goal-name-input" name="name" class="input-field" required placeholder="e.g., New Laptop">
                            </div>
                            <div class="form-group">
                                <label for="goal-target">Target Amount (NGN)</label>
                                <input type="number" id="goal-target" name="target" class="input-field" required placeholder="e.g., 850000">
                            </div>
                            <button type="submit" class="btn btn-primary">Add Goal</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

     private renderGoalCard(goal: any): string {
        const saved = this.state.expenses.filter(e => e.category === "Savings & Investments").reduce((sum, e) => sum + e.amount, 0);
        // In a real app, saved amount would be linked to the specific goal. For demo, we use total savings.
        const percentage = goal.target > 0 ? Math.min((saved / goal.target) * 100, 100) : 0;
        
        return `
            <div class="goal-card card ${goal.completed ? 'completed' : ''}">
                ${goal.completed ? `<div class="completed-badge"><span class="btn-icon">${icons.checkCircle}</span> Completed</div>` : ''}
                <div class="goal-card-header">
                    <h3>${goal.name}</h3>
                    ${!goal.completed ? `
                     <button class="icon-btn delete-btn" data-action="show-delete-goal-modal" data-id="${goal.id}" aria-label="Delete goal">
                        ${icons.trash}
                    </button>
                    ` : ''}
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-bar-inner" style="width: ${percentage}%"></div>
                </div>
                <div class="goal-card-details">
                    <div>
                        <span>Saved</span>
                        <strong>${formatNaira(saved)}</strong>
                    </div>
                     <div>
                        <span>Target</span>
                        <strong>${formatNaira(goal.target)}</strong>
                    </div>
                </div>
            </div>`;
    }
    
    private renderMarketplaceView() {
        const { deals, marketplaceRecommendations, marketplaceSearchQuery, marketplaceFilterCategory } = this.state;
    
        const recommendedDeals = marketplaceRecommendations
            .map(id => deals.find(d => d.id === id))
            .filter(d => d); // Filter out any not found deals

        const otherDeals = deals
            .filter(d => d.productName.toLowerCase().includes(marketplaceSearchQuery) || d.merchantName.toLowerCase().includes(marketplaceSearchQuery))
            .filter(d => marketplaceFilterCategory === 'all' || d.category === marketplaceFilterCategory);
            
        return `
            <div class="marketplace-view">
                <div class="view-header">
                    <h1>Marketplace</h1>
                    <p class="view-subtitle">AI-powered deals, curated just for you.</p>
                </div>

                <div class="recommendations-for-you card">
                    <h2>For You</h2>
                    <p>Based on your spending, you might like these:</p>
                    ${this.state.isGeneratingMarketplaceRecs ? `<div class="spinner-container"><div class="spinner"></div><p>Finding deals...</p></div>` : ''}
                    <div class="recommendations-grid">
                        ${recommendedDeals.length > 0
                            ? recommendedDeals.map(d => this.renderDealCard(d)).join('')
                            : !this.state.isGeneratingMarketplaceRecs ? `<div class="empty-state mini">No specific recommendations right now. Explore all deals below!</div>` : ''
                        }
                    </div>
                </div>

                <div class="marketplace-filters card">
                    <div class="form-group">
                        <label for="marketplace-search-input">Search Deals</label>
                        <input type="search" id="marketplace-search-input" class="input-field" placeholder="Search by product or merchant...">
                    </div>
                    <div class="form-group">
                        <label for="marketplace-category-filter">Filter by Category</label>
                        <select id="marketplace-category-filter" class="input-field">
                            <option value="all">All Categories</option>
                            ${CATEGORIES.map(cat => `<option value="${cat}" ${marketplaceFilterCategory === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                        </select>
                    </div>
                     <div class="form-group">
                        <label for="marketplace-location-filter">Your Location</label>
                        <select id="marketplace-location-filter" class="input-field">
                            ${[...new Set(this.state.deals.map(d => d.location))].map(loc => `<option value="${loc}" ${this.state.userLocation === loc ? 'selected' : ''}>${loc}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="deals-grid">
                    ${otherDeals.length > 0 ? otherDeals.map(d => this.renderDealCard(d)).join('') : '<div class="empty-state">No deals match your search.</div>'}
                </div>
            </div>
        `;
    }

    private renderDealCard(deal: any): string {
        return `
            <div class="deal-card">
                <div class="deal-card-image" style="background-image: url('${deal.imageUrl}')"></div>
                <div class="deal-info">
                    <div class="deal-header">
                        <span class="tag ${deal.category.replace(/[^a-zA-Z0-9]/g, '-')}">${deal.category}</span>
                        <div class="deal-price">${formatNaira(deal.price)}</div>
                    </div>
                    <h3 class="deal-name">${deal.productName}</h3>
                    <p class="deal-merchant">${deal.merchantName}</p>
                </div>
                <div class="deal-card-footer">
                     <button class="btn btn-primary" data-action="buy-now" data-id="${deal.id}">Buy Now</button>
                </div>
            </div>
        `;
    }
    
    private renderCravourPayView() {
        let content;
        const { step, message, canAfford, details } = this.state.cravourPayState;

        switch (step) {
            case 'checking':
                content = `
                    <div class="cravour-pay-feedback">
                        <div class="spinner"></div>
                        <p>Analyzing your budget...</p>
                    </div>
                `;
                break;
            case 'confirming':
                content = `
                    <div class="cravour-pay-confirmation">
                        <h3>Confirm Payment</h3>
                        <div class="payment-details">
                            <div class="detail-item"><span>To:</span><strong>${details?.merchant}</strong></div>
                            <div class="detail-item"><span>Amount:</span><strong>${formatNaira(details?.amount || 0)}</strong></div>
                            <div class="detail-item"><span>Category:</span><strong>${details?.category}</strong></div>
                        </div>
                        <p class="feedback-message ${canAfford ? 'positive' : 'negative'}">${message}</p>
                        <div class="cravour-pay-actions">
                            <button class="btn btn-secondary-outline" data-action="cravour-pay-reset">Cancel</button>
                            <button class="btn btn-primary" data-action="cravour-pay-confirm" ${!canAfford ? 'disabled' : ''}>
                                Confirm & Log Expense
                            </button>
                        </div>
                    </div>
                `;
                break;
            case 'success':
                content = `
                    <div class="cravour-pay-feedback success">
                        <div class="btn-icon">${icons.checkCircle}</div>
                        <p>Payment Logged Successfully!</p>
                    </div>
                `;
                break;
            case 'form':
            default:
                content = `
                    <form id="cravour-pay-form">
                        <div class="form-group">
                            <label for="cravour-pay-amount">Amount (NGN)</label>
                            <input type="number" id="cravour-pay-amount" name="amount" class="input-field" required placeholder="e.g., 10000">
                        </div>
                        <div class="form-group">
                            <label for="cravour-pay-category">Category</label>
                            <select id="cravour-pay-category" name="category" class="input-field" required>
                                <option value="" disabled selected>Select a category</option>
                                ${CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="cravour-pay-merchant">Merchant / Description</label>
                            <input type="text" id="cravour-pay-merchant" name="merchant" class="input-field" required placeholder="e.g., Shoprite">
                        </div>
                        <button type="submit" class="btn btn-primary">Check & Continue</button>
                    </form>
                `;
        }

        return `
            <div class="cravour-pay-view">
                <div class="view-header">
                    <h1>Cravour Pay</h1>
                    <p class="view-subtitle">Quickly log an expense and see how it impacts your budget in real-time.</p>
                </div>
                <div class="card cravour-pay-card">
                    ${content}
                </div>
            </div>
        `;
    }

    private renderProfileView() {
        const memberSince = this.state.periodStartDate ? new Date(this.state.periodStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Just Joined';
        const periodsCompleted = this.state.pastPeriods.length;
    
        return `
            <div class="profile-view">
                <div class="view-header">
                    <h1>Profile</h1>
                    <p class="view-subtitle">Your personal financial identity and habits.</p>
                </div>
                <div class="profile-grid">
                    <div class="card profile-summary-card">
                        <div class="profile-avatar">
                            <span>DU</span> <!-- Demo User -->
                        </div>
                        <h2>Demo User</h2>
                        <div class="profile-stats">
                            <div class="stat-item">
                                <span>Member Since</span>
                                <strong>${memberSince}</strong>
                            </div>
                            <div class="stat-item">
                                <span>Periods Completed</span>
                                <strong>${periodsCompleted}</strong>
                            </div>
                        </div>
                    </div>
                    ${this.renderSpendingHeatmapWidget()}
                </div>
            </div>
        `;
    }

    private renderSpendingHeatmapWidget(): string {
        const expensesByDay: Record<string, number> = {};
        this.state.expenses.forEach(exp => {
            const day = new Date(exp.date).getDate();
            expensesByDay[day] = (expensesByDay[day] || 0) + exp.amount;
        });
    
        const maxSpent = Math.max(0, ...Object.values(expensesByDay));
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...
    
        let dayCells = '';
        
        // Add empty cells for days before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            dayCells += `<div class="heatmap-day empty"></div>`;
        }
    
        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dailyTotal = expensesByDay[day] || 0;
            let style = '';
            if (dailyTotal > 0) {
                const colorIntensity = maxSpent > 0 ? dailyTotal / maxSpent : 1;
                const opacity = 0.1 + (colorIntensity * 0.9);
                style = `style="background-color: rgba(255, 193, 7, ${opacity})"`;
            }
    
            dayCells += `
                <div class="heatmap-day" ${style} title="${day}/${month + 1}/${year} - Spent: ${formatNaira(dailyTotal)}">
                    <span class="day-number">${day}</span>
                </div>
            `;
        }
    
        const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            .map(d => `<div class="heatmap-weekday">${d}</div>`).join('');
    
        return `
            <div class="card spending-heatmap-widget">
                <h2>Spending Heatmap</h2>
                <p>Your daily spending intensity for the current month.</p>
                <div class="heatmap-grid-container">
                    <div class="heatmap-weekdays">${weekDayHeaders}</div>
                    <div class="heatmap-days">${dayCells}</div>
                </div>
                <div class="heatmap-legend">
                    <span>Less</span>
                    <div class="legend-gradient"></div>
                    <span>More</span>
                </div>
            </div>
        `;
    }

    private renderSettingsView() {
        return `
            <div class="settings-view">
                <div class="view-header">
                    <h1>Settings</h1>
                    <p class="view-subtitle">Manage your application preferences and data.</p>
                </div>
                <div class="card">
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Theme</h3>
                            <p>Choose your preferred interface appearance.</p>
                        </div>
                        <div class="theme-toggle-control">
                             <button class="theme-btn ${this.state.theme === 'light' ? 'active' : ''}" data-action="set-theme" data-theme="light">
                                <span class="btn-icon">${icons.sun}</span> Light
                            </button>
                            <button class="theme-btn ${this.state.theme === 'dark' ? 'active' : ''}" data-action="set-theme" data-theme="dark">
                                <span class="btn-icon">${icons.moon}</span> Dark
                            </button>
                        </div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <h3>Start Fresh</h3>
                            <p>Clear all your current transactions, budgets, and goals. This action cannot be undone.</p>
                        </div>
                        <button class="btn btn-danger" data-action="show-start-fresh-modal">Clear All Data</button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderPastReportsView() {
        const reportsHtml = this.state.pastPeriods.length > 0
            ? this.state.pastPeriods.map((p, index) => this.renderReportLinkCard(p, index)).join('')
            : this.renderActionableEmptyState(
                'history',
                "No Past Reports",
                "Complete a budget period by spending your wallet balance to generate your first report here.",
                'Back to Snapshot',
                'navigate',
                'insights'
            );

        return `
            <div class="past-reports-view">
                <div class="view-header">
                    <h1>Past Reports</h1>
                    <p class="view-subtitle">Review your spending from previous budget periods.</p>
                </div>
                <div class="past-reports-grid">${reportsHtml}</div>
            </div>
        `;
    }

    private renderReportLinkCard(period: any, index: number) {
        const startDate = new Date(period.startDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
        const endDate = new Date(period.endDate).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric'});
        const totalSpent = period.initialBalance - period.finalBalance;
        return `
            <a href="#" class="card report-link-card" data-action="navigate" data-view="report/${index}">
                <div class="report-link-date">
                    <span class="btn-icon">${icons.history}</span>
                    <span>${startDate} - ${endDate}</span>
                </div>
                <div class="report-link-summary">
                    <span>Total Spent</span>
                    <strong>${formatNaira(totalSpent)}</strong>
                </div>
            </a>
        `;
    }

    private renderReportView(): string {
        if (this.state.selectedReportIndex === null) return this.renderPastReportsView();
        
        const periodData = this.state.pastPeriods[this.state.selectedReportIndex];
        if (!periodData) return this.renderPastReportsView();
        
        const startDate = new Date(periodData.startDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
        const endDate = new Date(periodData.endDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });

        const totalSpent = periodData.initialBalance - periodData.finalBalance;
        
        return `
            <div class="report-view">
                <div class="view-header report-view-header">
                    <div>
                        <h1>Expense Report</h1>
                        <p class="view-subtitle">For the period: ${startDate} - ${endDate}</p>
                    </div>
                    <button class="btn btn-secondary-outline" data-action="navigate" data-view="past-reports">Back to All Reports</button>
                </div>
                
                <div class="card key-metrics-widget" id="metrics-widget">
                     <div class="metric-item">
                        <div class="metric-title">Starting Balance</div>
                        <div class="metric-value">${formatNaira(periodData.initialBalance)}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Total Spent</div>
                        <div class="metric-value spent">${formatNaira(totalSpent)}</div>
                    </div>
                     <div class="metric-item">
                        <div class="metric-title">Ending Balance</div>
                        <div class="metric-value">${formatNaira(periodData.finalBalance)}</div>
                    </div>
                </div>

                <div class="report-details-grid">
                    <div class="card" id="report-needs-widget">
                        ${this.renderSpendingBreakdownWidget('needs', periodData.expenses, periodData.budgets)}
                    </div>
                    <div class="card" id="report-wants-widget">
                        ${this.renderSpendingBreakdownWidget('wants', periodData.expenses, periodData.budgets)}
                    </div>
                     <div class="card" id="report-goals-widget">
                        ${this.renderGoalsProgressWidget(periodData.financialGoals, periodData.expenses)}
                    </div>
                    <div class="card full-span-card" id="report-expenses-widget">
                        <h2>All Transactions From Period</h2>
                        <div class="expenses-list-container">
                            ${periodData.expenses.length > 0
                                ? periodData.expenses.map((exp: any) => this.renderExpenseItem(exp, false)).join('')
                                : `<div class="empty-state mini">No expenses were recorded in this period.</div>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private renderWelcomeOnboardingView() {
        return `
            <div class="end-of-period-view">
                <div class="card end-of-period-card">
                    <div class="end-of-period-icon">${icons.wallet}</div>
                    <h2>Your Journey to Financial Clarity Starts Now.</h2>
                    <p>Let's get you set up. Your first step is to create a budget by telling us the total funds you have available to spend for this period.</p>
                    <div class="end-of-period-actions">
                        <button class="btn btn-primary" data-action="show-new-budget-modal">Create Your First Budget</button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderEndOfPeriodView() {
        const totalSpent = this.state.initialWalletBalance - this.state.walletBalance;
        return `
            <div class="end-of-period-view">
                <div class="card end-of-period-card">
                    <div class="end-of-period-icon">${icons.target}</div>
                    <h2>Budget Period Complete!</h2>
                    <p>You've completed this budget cycle. Let's see how you did and get you ready for the next one.</p>
                    <div class="end-of-period-summary">
                        You spent a total of <strong>${formatNaira(totalSpent)}</strong> from your initial budget of ${formatNaira(this.state.initialWalletBalance)}.
                    </div>
                    <div class="end-of-period-actions">
                        <button class="btn btn-primary" data-action="navigate" data-view="report/0">View Full Report</button>
                        <button class="btn btn-primary" data-action="show-new-budget-modal">Start New Budget Period</button>
                    </div>
                </div>
            </div>
        `;
    }

    private renderNotificationBar(): string {
        if (!this.state.notification) return '';

        const { type, message } = this.state.notification;
        let icon;
        switch (type) {
            case 'success': icon = icons.checkCircle; break;
            case 'warning': icon = icons.insight; break;
            case 'info': icon = icons.insight; break;
            default: icon = icons.insight;
        }

        return `
            <div class="notification-bar type-${type}">
                <div class="notification-content">
                    <span class="btn-icon">${icon}</span>
                    <span>${message}</span>
                </div>
                <button class="notification-dismiss" data-action="dismiss-notification" aria-label="Dismiss notification">
                    ${icons.close}
                </button>
            </div>
        `;
    }

    private renderInsightsView(periodData: any | null = null) {
        const isReportView = !!periodData;
        const walletBalance = isReportView ? periodData.finalBalance : this.state.walletBalance;
        const initialBalance = isReportView ? periodData.initialBalance : this.state.initialWalletBalance;
        const expenses = isReportView ? periodData.expenses : this.state.expenses;
        const budgets = isReportView ? periodData.budgets : this.state.budgets;
        const goals = isReportView ? periodData.financialGoals : this.state.financialGoals;

        const spent = initialBalance - walletBalance;
        const remaining = walletBalance;

        return `
            <div class="insights-view">
                <div class="view-header">
                    <h1>Financial Snapshot</h1>
                    <p class="view-subtitle">Your real-time financial overview for this month.</p>
                </div>
                
                ${!isReportView ? this.renderNotificationBar() : ''}

                <div class="snapshot-grid">
                    <div class="card key-metrics-widget" id="metrics-widget">
                        <div class="metrics-values">
                            <div class="metric-item">
                                <div class="metric-title">Monthly Budget</div>
                                <div class="metric-value">${formatNaira(initialBalance)}</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-title">Spent So Far</div>
                                <div class="metric-value spent">${formatNaira(spent)}</div>
                            </div>
                            <div class="metric-item">
                                <div class="metric-title">Remaining</div>
                                <div class="metric-value ${remaining > 0 ? 'ok' : 'danger'}">${formatNaira(remaining)}</div>
                            </div>
                        </div>
                         <div class="metrics-actions">
                            <button class="btn btn-secondary-outline" data-action="show-add-funds-modal">
                                <span class="btn-icon">${icons.wallet}</span>
                                <span>Add Funds</span>
                            </button>
                        </div>
                    </div>
                    
                    ${!isReportView ? this.renderFinancialHealthWidget() : ''}
                    
                    ${!isReportView ? this.renderFinancialSummaryWidget() : ''}

                    <div class="card" id="needs-widget">
                        ${this.renderSpendingBreakdownWidget('needs', expenses, budgets)}
                    </div>
                    <div class="card" id="wants-widget">
                        ${this.renderSpendingBreakdownWidget('wants', expenses, budgets)}
                    </div>
                    <div class="card" id="goals-widget">
                        ${this.renderGoalsProgressWidget(goals, expenses)}
                    </div>
                </div>
            </div>`;
    }

    private renderFinancialSummaryWidget(): string {
        let content;
        if (this.state.isGeneratingSummary) {
            content = `
                <div class="financial-summary-loading">
                    <div class="spinner"></div>
                    <p>Generating your weekly AI summary...</p>
                </div>
            `;
        } else if (this.state.financialSummary) {
            const summary = this.state.financialSummary;
            content = `
                <div class="summary-period">${summary.period}</div>
                <p class="summary-insight"><strong>Key Insight:</strong> ${summary.keyInsight}</p>
                <p class="summary-positive-callout">${summary.positiveCallout}</p>
                <p class="summary-suggestion"><strong>Next Step:</strong> ${summary.suggestion}</p>
            `;
        } else {
            // Fallback if generation fails or hasn't run
            content = `<div class="empty-state mini">Your weekly summary will appear here.</div>`;
        }
    
        return `
            <div class="card financial-summary-widget" id="summary-widget">
                <div class="summary-header">
                    <span class="btn-icon">${icons.insight}</span>
                    <h2>${this.state.financialSummary?.title || "AI Financial Summary"}</h2>
                </div>
                <div class="summary-content">
                    ${content}
                </div>
            </div>
        `;
    }
    
    private renderSpendingBreakdownWidget(type: 'needs' | 'wants', expenses: any[], budgets: any[]): string {
        const title = type === 'needs' ? 'Essentials Breakdown' : 'Lifestyle Breakdown';
        const relevantCategories = Object.keys(CATEGORY_MAP).filter(cat => CATEGORY_MAP[cat].type === type);
        
        const categorySpending = relevantCategories.map(cat => {
            const spent = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
            return { category: cat, spent };
        }).filter(item => item.spent > 0).sort((a,b) => b.spent - a.spent);

        const content = categorySpending.length > 0
            ? categorySpending.map(item => `
                <div class="category-spending-item">
                    <div class="category-spending-info">
                        <span class="category-name">${item.category}</span>
                        <span class="category-amount">${formatNaira(item.spent)}</span>
                    </div>
                    <div class="category-progress-bar">
                        <div class="category-progress-bar-inner" style="width: ${(item.spent / Math.max(...categorySpending.map(cs => cs.spent))) * 100}%"></div>
                    </div>
                </div>
              `).join('')
            : `<div class="empty-state mini">No spending in this area yet.</div>`;

        return `
            <h2>${title}</h2>
            <div class="spending-breakdown-container">
                ${content}
            </div>
        `;
    }

    private renderGoalsProgressWidget(goals: any[], expenses: any[]): string {
        const totalSaved = expenses.filter(e => e.category === "Savings & Investments").reduce((sum, e) => sum + e.amount, 0);

        const content = goals.length > 0
            ? goals.map(goal => {
                const percentage = Math.min((totalSaved / goal.target) * 100, 100).toFixed(1);
                return `
                    <div class="goal-progress-item ${goal.completed ? 'completed' : ''}">
                        ${goal.completed ? `<div class="completed-badge"><span class="btn-icon">${icons.checkCircle}</span> Completed</div>` : ''}
                        <div class="goal-progress-info">
                            <span class="goal-name">${goal.name}</span>
                            <span class="goal-percentage">${percentage}%</span>
                        </div>
                        <div class="goal-progress-bar">
                            <div class="goal-progress-bar-inner" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `}).join('')
            : `<div class="empty-state mini">No goals set. Add a goal to start tracking.</div>`;
        
        return `
            <h2>Savings Goals</h2>
            <div class="goals-progress-container">
                ${content}
            </div>
        `;
    }

    private renderFinancialHealthWidget(): string {
        let content;
        if (this.state.isGeneratingHealthScore || this.state.financialHealthScore === null) {
            content = `
                <div class="financial-health-loading">
                    <div class="spinner"></div>
                    <p>Analyzing your financial health...</p>
                </div>
            `;
        } else {
            const score = this.state.financialHealthScore;
            const radius = 54;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (score / 100) * circumference;

            let scoreClass = 'high';
            let mascotIcon: keyof typeof icons = 'budgetHeroHappy';

            if (score < 40) {
                scoreClass = 'low';
                mascotIcon = 'budgetHeroSad';
            } else if (score < 70) {
                scoreClass = 'mid';
                mascotIcon = 'budgetHeroNeutral';
            } else if (score >= 90) {
                mascotIcon = 'budgetHeroTriumphant';
            }

            content = `
                <div class="budget-hero-mascot">${icons[mascotIcon]}</div>
                <div class="financial-health-score-display">
                    <svg class="score-progress-ring" width="120" height="120">
                        <circle class="score-progress-ring__circle_bg" stroke="currentColor" stroke-width="8" fill="transparent" r="${radius}" cx="60" cy="60"/>
                        <circle class="score-progress-ring__circle ${scoreClass}"
                            stroke="currentColor"
                            stroke-width="8"
                            stroke-linecap="round"
                            fill="transparent"
                            r="${radius}"
                            cx="60"
                            cy="60"
                            style="stroke-dasharray: ${circumference} ${circumference}; stroke-dashoffset: ${offset};"
                        />
                    </svg>
                    <span class="score-text ${scoreClass}">${score}</span>
                </div>
                <div class="financial-health-summary">
                    <h3>Financial Health</h3>
                    <p class="financial-health-tip">${this.state.financialHealthTip || "Keep up the great work!"}</p>
                </div>
            `;
        }

        return `
            <div class="card financial-health-widget" id="insights-widget">
                 ${content}
            </div>
        `;
    }

    private renderEnterpriseDashboard() {
        const { totalRevenue, totalSales, chartData, transactions } = this.calculateEnterpriseStats();
        const recentTransactions = transactions.slice(0, 5);

        const recentTransactionsHtml = recentTransactions.length > 0
            ? recentTransactions.map(t => `
                <div class="transaction-item">
                    <div class="transaction-product">
                        <strong>${t.productName}</strong>
                        <span class="customer">by ${t.customerName}</span>
                    </div>
                    <div class="transaction-date">${new Date(t.date).toLocaleDateString('en-GB')}</div>
                    <div class="transaction-amount">${formatNaira(t.price)}</div>
                </div>
            `).join('')
            : '<div class="empty-state mini">No recent transactions.</div>';

        return `
            <div class="enterprise-dashboard-view">
                <div class="view-header">
                    <h1>Merchant Dashboard (Konga Demo)</h1>
                    <p class="view-subtitle">Your real-time sales and transaction overview.</p>
                </div>
                <div class="enterprise-grid">
                    <div class="card stat-card">
                        <h3>Total Revenue</h3>
                        <p>${formatNaira(totalRevenue)}</p>
                    </div>
                    <div class="card stat-card">
                        <h3>Total Sales</h3>
                        <p>${totalSales}</p>
                    </div>
                    <div class="card revenue-chart-card">
                        <h3>Revenue Over Time</h3>
                        ${this.renderRevenueChart(chartData)}
                    </div>
                    <div class="card recent-transactions-card">
                        <h3>Recent Sales</h3>
                        <div class="transaction-list">
                            ${recentTransactionsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    private renderRevenueChart(data: { date: string, revenue: number }[]): string {
        if (data.length < 2) {
            return '<div class="empty-state mini">Not enough data to display a chart. More sales are needed.</div>';
        }
    
        const width = 500;
        const height = 200;
        const padding = { top: 20, right: 20, bottom: 30, left: 60 };
    
        const maxRevenue = Math.max(...data.map(d => d.revenue));
    
        const xScale = (index: number) => padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
        const yScale = (revenue: number) => height - padding.bottom - (revenue / maxRevenue) * (height - padding.top - padding.bottom);
    
        const points = data.map((d, i) => `${xScale(i)},${yScale(d.revenue)}`).join(' ');
    
        const yAxisLabels = () => {
            let labels = '';
            for (let i = 0; i <= 4; i++) {
                const value = (maxRevenue / 4) * i;
                const y = yScale(value);
                labels += `<g class="y-axis-group">
                                <text x="${padding.left - 10}" y="${y + 4}" class="axis-label">${formatNaira(value).replace('NGN', '')}</text>
                                <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="grid-line" />
                           </g>`;
            }
            return labels;
        };
    
        const xAxisLabels = () => {
            return data.map((d, i) => {
                const x = xScale(i);
                const date = new Date(d.date);
                const label = `${date.getDate()}/${date.getMonth() + 1}`;
                return `<text x="${x}" y="${height - padding.bottom + 15}" class="axis-label">${label}</text>`;
            }).join('');
        };
    
        return `
            <div class="chart-container">
                <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
                    <g class="y-axis">${yAxisLabels()}</g>
                    <g class="x-axis">${xAxisLabels()}</g>
                    <polyline fill="none" class="chart-line" points="${points}" />
                    ${data.map((d, i) => `
                        <circle cx="${xScale(i)}" cy="${yScale(d.revenue)}" r="3" class="chart-point">
                            <title>${d.date}: ${formatNaira(d.revenue)}</title>
                        </circle>
                    `).join('')}
                </svg>
            </div>
        `;
    }

    private renderEnterpriseTransactions() {
        const { transactions } = this.calculateEnterpriseStats();
        return `
             <div class="enterprise-transactions-view">
                <div class="view-header">
                    <h1>Transactions</h1>
                    <p class="view-subtitle">A list of all sales processed through Cravour.</p>
                </div>
                <div class="card">
                     <div class="transaction-list">
                       ${transactions.length > 0 ? transactions.map(t => `
                        <div class="transaction-item">
                            <div class="transaction-product">
                                <strong>${t.productName}</strong>
                                <span class="customer">by ${t.customerName}</span>
                            </div>
                            <div class="transaction-date">${new Date(t.date).toLocaleDateString('en-GB')}</div>
                            <div class="transaction-status"><span class="status-pill ${t.status}">${t.status}</span></div>
                            <div class="transaction-amount">${formatNaira(t.price)}</div>
                        </div>
                       `).join('') : '<div class="empty-state mini">No transactions yet.</div>'}
                    </div>
                </div>
            </div>
        `;
    }
    
    private renderPaymentModal() {
        const modal = document.getElementById('payment-modal')!;
        if (this.state.showPaymentModal) {
            modal.classList.remove('hidden');
            let content;
            const deal = this.state.dealToPurchase;

            if (this.state.paymentStep === 'form') {
                 content = `
                    <div class="payment-modal-header paystack-header">
                        <h3 class="paystack-logo">CRAVOUR PAY</h3>
                        <p class="payment-amount">${formatNaira(deal.price)}</p>
                    </div>
                    <div class="payment-modal-body">
                         <div class="item-summary">
                            <p>${deal.productName}</p>
                            <p>From ${deal.merchantName}</p>
                        </div>
                        <p>You are about to log this purchase. This will deduct the amount from your Cravour wallet and add it to your expenses.</p>
                    </div>
                     <div class="payment-modal-footer">
                        <button class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                        <button class="btn btn-primary" data-action="confirm-payment">Confirm Purchase</button>
                    </div>
                `;
            } else if (this.state.paymentStep === 'processing') {
                content = `<div class="payment-feedback"><div class="spinner"></div><p>Processing Payment...</p></div>`;
            } else { // success
                content = `<div class="payment-feedback"><div class="success-icon">${icons.plusCircle}</div><p>Purchase Logged!</p></div>`;
            }

            this.renderBySelector('#payment-modal', `
                 <div class="modal-overlay" data-action="close-modal">
                    <div class="modal-content payment-modal card" onclick="event.stopPropagation()">
                         ${content}
                    </div>
                </div>
            `);

        } else {
             modal.classList.add('hidden');
        }
    }

     private renderActionModal() {
        const modal = document.getElementById('action-modal')!;
        if (this.state.showActionModal) {
            modal.classList.remove('hidden');
            const { type, title, content, action } = this.state.showActionModal;
            const btnClass = type === 'confirm' ? 'btn-danger' : 'btn-primary';
            const btnText = type === 'confirm' ? 'Confirm' : 'Submit';

            const formContent = `
                <h3>${title}</h3>
                <div class="action-modal-content">${content}</div>
                <div class="action-modal-footer">
                    <button type="button" class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                    <button type="submit" class="btn ${btnClass}">${btnText}</button>
                </div>
            `;
            
            this.renderBySelector('#action-modal', `
                 <div class="modal-overlay" data-action="close-modal">
                    <div class="modal-content action-modal card" onclick="event.stopPropagation()">
                        <form id="action-modal-form">
                            ${formContent}
                        </form>
                    </div>
                </div>
            `);

        } else {
             modal.classList.add('hidden');
        }
    }

    private renderBudgetModal() {
        const modal = document.getElementById('budget-modal')!;
        if (this.state.showBudgetModal) {
            modal.classList.remove('hidden');
            const isEditing = !!this.state.editingBudgetCategory;
            const title = isEditing ? 'Edit Budget' : 'Add New Budget';
            const currentBudget = isEditing ? this.state.budgets.find(b => b.category === this.state.editingBudgetCategory) : null;
            const availableCategories = isEditing ? [] : CATEGORIES.filter(c => !this.state.budgets.some(b => b.category === c));
    
            const formContent = `
                <h3>${title}</h3>
                <div class="form-group">
                    <label for="budget-category">Category</label>
                    <select id="budget-category" name="category" class="input-field" required ${isEditing ? 'disabled' : ''}>
                        ${isEditing 
                            ? `<option value="${currentBudget?.category}" selected>${currentBudget?.category}</option>`
                            : `<option value="" disabled selected>Select a category</option>${availableCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}`
                        }
                    </select>
                </div>
                <div class="form-group">
                    <label for="budget-amount">Amount (NGN)</label>
                    <input type="number" id="budget-amount" name="amount" class="input-field" required placeholder="e.g., 50000" value="${currentBudget?.amount || ''}">
                </div>
                <div class="action-modal-footer">
                    <button type="button" class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Budget</button>
                </div>
            `;
    
            this.renderBySelector('#budget-modal', `
                 <div class="modal-overlay" data-action="close-modal">
                    <div class="modal-content budget-modal card" onclick="event.stopPropagation()">
                        <form id="budget-modal-form">
                            ${formContent}
                        </form>
                    </div>
                </div>
            `);
        } else {
             modal.classList.add('hidden');
        }
    }
}

new CravourApp();