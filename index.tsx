import { GoogleGenAI, Type } from "@google/genai";

// --- SVG Icons (New "4D" Style) ---
const icons = {
    dashboard: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0Zm8-2.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75ZM9.25 12a.75.75 0 0 0-1.5 0v3.75a.75.75 0 0 0 1.5 0V12Zm6 1.5a.75.75 0 0 1 .75-.75v-3a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-.75.75h-1.5Z" clip-rule="evenodd" fill-opacity="0.5" fill="currentColor"/><path d="M5.47 10.74a.75.75 0 0 1 1.06 0l2.47 2.47a.75.75 0 0 1-1.06 1.06l-2.47-2.47a.75.75 0 0 1 0-1.06Zm12 0a.75.75 0 0 1 1.06 0l2.47 2.47a.75.75 0 1 1-1.06 1.06l-2.47-2.47a.75.75 0 0 1 0-1.06Z" fill="currentColor"/></svg>`,
    wallet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.5 2.25a.75.75 0 0 0-1.5 0v1.5h-9v-1.5a.75.75 0 0 0-1.5 0V6h12V2.25Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M6.5 20.25a4.5 4.5 0 0 1-4.5-4.5V8.25a.75.75 0 0 1 .75-.75h18a.75.75 0 0 1 .75.75v7.5a4.5 4.5 0 0 1-4.5 4.5h-10.5Zm11.25-8.25a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    budget: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.25 9.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5ZM8.25 13.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M2.25 5.25A3 3 0 0 1 5.25 2.25h13.5a3 3 0 0 1 3 3v13.5a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V5.25Zm3-.75a.75.75 0 0 0-.75.75v13.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75V5.25a.75.75 0 0 0-.75-.75H5.25Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    expenses: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7.5a4.5 4.5 0 1 1 0 9a4.5 4.5 0 0 1 0-9Zm-2.25 4.5a2.25 2.25 0 1 0 4.5 0a2.25 2.25 0 0 0-4.5 0Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75a9.75 9.75 0 0 0 9.75-9.75C21.75 6.615 17.385 2.25 12 2.25ZM3.75 12a8.25 8.25 0 1 1 16.5 0a8.25 8.25 0 0 1-16.5 0Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    review: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8.25a.75.75 0 0 0-1.5 0v5.25H9a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 .75-.75V8.25Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75a9.75 9.75 0 0 0 9.75-9.75C21.75 6.615 17.385 2.25 12 2.25ZM3.75 12a8.25 8.25 0 1 1 16.5 0a8.25 8.25 0 0 1-16.5 0Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    creative: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4.125 4.125a.375.375 0 0 0-.375.375v4.5a.375.375 0 0 0 .375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm.75.75h3v3h-3v-3ZM15.375 4.125a.375.375 0 0 0-.375.375v4.5a.375.375 0 0 0 .375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm.75.75h3v3h-3v-3ZM4.125 15.375a.375.375 0 0 0-.375.375v4.5a.375.375 0 0 0 .375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm.75.75h3v3h-3v-3Z" fill-opacity="0.5" fill="currentColor"/><path d="M12.75 12a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-5.25h-5.25a.75.75 0 0 1-.75-.75Zm-1.5-1.5a.75.75 0 0 0-1.5 0v6A.75.75 0 0 0 10.5 18h6a.75.75 0 0 0 0-1.5h-5.25v-5.25ZM9.75 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-5.25V10.5a.75.75 0 0 1-1.5 0v-6ZM3.75 10.5a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-6Z" fill="currentColor"/></svg>`,
    opportunities: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7.5a.75.75 0 0 1 .75.75v3h3a.75.75 0 0 1 0 1.5h-3v3a.75.75 0 0 1-1.5 0v-3h-3a.75.75 0 0 1 0-1.5h3v-3A.75.75 0 0 1 12 7.5Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75a9.75 9.75 0 0 0 9.75-9.75C21.75 6.615 17.385 2.25 12 2.25ZM3.75 12a8.25 8.25 0 1 1 16.5 0a8.25 8.25 0 0 1-16.5 0Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.25 8.25a.75.75 0 0 0-1.5 0v7.5a.75.75 0 0 0 1.5 0v-7.5Z" fill-opacity="0.5" fill="currentColor"/><path d="M15.75 8.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75-.75h-4.5a.75.75 0 0 1-.75-.75V8.25ZM2.697 4.93a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 0 1-1.06-1.06l4.72-4.72-4.72-4.72a.75.75 0 0 1 0-1.06Z" fill="currentColor"/></svg>`,
    cogs: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8.625a3.375 3.375 0 1 0 0 6.75a3.375 3.375 0 0 0 0-6.75Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M22.25 12c0 .99-.183 1.933-.518 2.787l.462 2.153a.75.75 0 0 1-.933 1.002l-2.31-.99a8.95 8.95 0 0 1-2.43.9V20a.75.75 0 0 1-.75.75H8.22a.75.75 0 0 1-.75-.75v-2.067a8.948 8.948 0 0 1-2.43-.9l-2.31.99a.75.75 0 0 1-.932-1.002l.461-2.153A8.98 8.98 0 0 1 1.75 12c0-.99.183-1.933.518-2.787l-.462-2.153a.75.75 0 0 1 .933-1.002l2.31.99a8.95 8.95 0 0 1 2.43-.9V4a.75.75 0 0 1 .75-.75h5.56a.75.75 0 0 1 .75.75v2.067c.86.299 1.675.72 2.43.9l2.31-.99a.75.75 0 0 1 .932 1.002l-.461 2.153A8.98 8.98 0 0 1 22.25 12Zm-1.636 0c0-1.42-.314-2.757-.88-3.921l-.22-.465.98-4.576-1.96-1.053-4.502 1.93-.497-.27a7.452 7.452 0 0 0-3.303-.896V2.75H8.22v3.003c-1.18.256-2.29.74-3.302.896l-.497.27-4.502-1.93-1.96 1.053.98 4.576-.22.465A7.48 7.48 0 0 0 3.25 12c0 1.42.314 2.757.88 3.921l.22.465-.98 4.576 1.96 1.053 4.502-1.93.497.27a7.452 7.452 0 0 0 3.303.896V21.25h5.56v-3.003c1.18-.256 2.29-.74 3.302-.896l-.497-.27 4.502 1.93 1.96-1.053-.98-4.576.22-.465A7.48 7.48 0 0 0 20.614 12Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    magic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m15.808 3.755-2.06 2.06a.75.75 0 0 1-1.06 0l-2.06-2.06a.75.75 0 0 1 1.06-1.06l2.06 2.06 2.06-2.06a.75.75 0 1 1 1.06 1.06Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M9.828 3.22a.75.75 0 0 1 1.06 0l3.89 3.89a2.25 2.25 0 0 1 0 3.182l-3.89 3.89a.75.75 0 0 1-1.06-1.06l3.89-3.89a.75.75 0 0 0 0-1.06L9.828 4.28a.75.75 0 0 1 0-1.06ZM5.293 6.728a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 0 1-1.06-1.06l5.47-5.47-5.47-5.47a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    chartLine: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.25 18a.75.75 0 0 0 0 1.5H21a.75.75 0 0 0 0-1.5H2.25Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="m4.22 15.78 1.97-1.97a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 0 1.06 0L15.03 13.6a.75.75 0 0 1 1.06 0l4.72 4.72a.75.75 0 1 1-1.06 1.06l-4.19-4.19-3.47 3.47a2.25 2.25 0 0 1-3.18 0L5.28 16.84l-1.06-1.06Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    sync: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2.25a.75.75 0 0 1 .75.75v3.66a8.216 8.216 0 0 1 4.237 2.016l2.126-2.125a.75.75 0 1 1 1.06 1.06l-2.125 2.125A8.25 8.25 0 0 1 12 20.25a.75.75 0 0 1 0-1.5 6.75 6.75 0 0 0 0-13.5.75.75 0 0 1-.75-.75V3a.75.75 0 0 1 .75-.75Z" fill-opacity="0.5" fill="currentColor"/><path d="M12 3.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V4.5a.75.75 0 0 1 .75-.75ZM20.25 12a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 .75-.75Z" fill="currentColor"/></svg>`,
    searchDollar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.625 17.625a6 6 0 1 1 0-12a6 6 0 0 1 0 12Zm0-1.5a4.5 4.5 0 1 0 0-9a4.5 4.5 0 0 0 0 9Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M11.625 3.375a8.25 8.25 0 1 0 4.673 14.316l3.352 3.351a.75.75 0 0 0 1.06-1.06l-3.351-3.352A8.25 8.25 0 0 0 11.625 3.375Zm-6.375 8.25a6.375 6.375 0 1 1 12.75 0a6.375 6.375 0 0 1-12.75 0Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M16.704 7.796a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06L8.69 14.69l6.97-6.97a.75.75 0 0 1 1.044 0Z" clip-rule="evenodd" /></svg>`,
    envelope: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.25 6.75A.75.75 0 0 0 3 7.5v1.51l9-5.4-9-5.4V3.75A.75.75 0 0 0 3 3h18a.75.75 0 0 0 0-1.5H3A2.25 2.25 0 0 0 .75 3.75v16.5A2.25 2.25 0 0 0 3 22.5h18a2.25 2.25 0 0 0 2.25-2.25V7.5a.75.75 0 0 0-1.5 0v12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75V6.75Z" fill-opacity="0.5" fill="currentColor"/><path d="M12 13.924 3.018 8.528a.75.75 0 1 0-.786 1.288L12 15.75l9.768-5.934a.75.75 0 0 0-.786-1.288L12 13.924Z" fill="currentColor"/></svg>`,
    infoCircle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75ZM12 15a.75.75 0 1 0 0 1.5a.75.75 0 0 0 0-1.5Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75a9.75 9.75 0 0 0 9.75-9.75C21.75 6.615 17.385 2.25 12 2.25ZM3.75 12a8.25 8.25 0 1 1 16.5 0a8.25 8.25 0 0 1-16.5 0Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    paystack: `<svg viewBox="0 0 85.03 24" fill="currentColor"><path d="M84.73 11.16a2.25 2.25 0 0 0-1.94-1.04h-4.32a1.08 1.08 0 0 1-1.08-1.08V4.32a1.08 1.08 0 0 1 1.08-1.08h6.84a2.25 2.25 0 0 0 1.94-1.04 2.25 2.25 0 0 0-.54-3.1L84.1.06a1.09 1.09 0 0 0-1.29.22L76.17 6.9a1.08 1.08 0 0 1-.86.43h-4.32a2.57 2.57 0 0 0-2.57 2.57v4.65a2.57 2.57 0 0 0 2.57 2.57h4.32a1.08 1.08 0 0 1 .86.43l6.64 6.63a1.09 1.09 0 0 0 1.29.22l2.61-1.5a2.25 2.25 0 0 0 .54-3.1Z M22.24 2.16a2.16 2.16 0 0 0-2.16-2.16H2.16A2.16 2.16 0 0 0 0 2.16v19.68A2.16 2.16 0 0 0 2.16 24h17.92a2.16 2.16 0 0 0 2.16-2.16V2.16Z M16.96 7.56H7.2a1.08 1.08 0 1 1 0-2.16h9.76a1.08 1.08 0 1 1 0 2.16Z M12.91 18.36H7.2a1.08 1.08 0 1 1 0-2.16h5.71a1.08 1.08 0 1 1 0 2.16Z M16.96 12.96H7.2a1.08 1.08 0 1 1 0-2.16h9.76a1.08 1.08 0 1 1 0 2.16Z M39.69.72a2.16 2.16 0 0 0-2.16 2.16v13.68H28.45a1.08 1.08 0 1 0 0 2.16h9.08a2.16 2.16 0 0 0 2.16-2.16V2.88a2.16 2.16 0 0 0-2.16-2.16h-2.16Z M63.29 9.36a5.04 5.04 0 1 0-5.04-5.04 5.04 5.04 0 0 0 5.04 5.04Z M63.29 11.52a7.2 7.2 0 1 1 7.2-7.2 7.2 7.2 0 0 1-7.2 7.2Z M53.81 21.6a2.16 2.16 0 0 1-2.16-2.16V2.88a2.16 2.16 0 1 0-4.32 0v16.56a2.16 2.16 0 0 0 2.16 2.16h4.32Z"/></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.75 3h-9A2.25 2.25 0 0 0 4.5 5.25v9a.75.75 0 0 0 1.5 0v-9c0-.414.336-.75.75-.75h9a.75.75 0 0 0 0-1.5Z" fill-opacity="0.5" fill="currentColor"/><path fill-rule="evenodd" d="M8.25 6A2.25 2.25 0 0 0 6 8.25v9.75A2.25 2.25 0 0 0 8.25 20.25h9.75A2.25 2.25 0 0 0 20.25 18V8.25A2.25 2.25 0 0 0 18 6H8.25ZM7.5 8.25c0-.414.336-.75.75-.75h9.75c.414 0 .75.336.75.75V18c0 .414-.336.75-.75.75H8.25a.75.75 0 0 1-.75-.75V8.25Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.292-.088.442A15.428 15.428 0 0 0 10.5 15.5a15.428 15.428 0 0 0 5.43-3.664c.15-.15.341-.127.442-.088l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-1.372c-5.496 0-10.536-2.502-13.88-6.839C1.17 12.87.5 9.074.5 5.872V4.5h1Z" clip-rule="evenodd" fill="currentColor"/></svg>`,
    arrowUp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 1 1-1.06 1.06L12 3.56 4.53 11.03a.75.75 0 0 1-1.06-1.06l7.5-7.5Z" clip-rule="evenodd" /></svg>`,
    arrowDown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12.53 21.53a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 19.94l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z" clip-rule="evenodd" /></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1-3.878.512.75.75 0 1 1-.256-1.478l3.585-1.005A1.875 1.875 0 0 1 21.5 4.5v13.5A1.875 1.875 0 0 1 19.625 20h-15A1.875 1.875 0 0 1 2.75 18V4.5c0-.654.34-1.254.872-1.571l3.585-1.005a.75.75 0 0 1 1.06.256A48.815 48.815 0 0 1 12 4.705v-.227c0-1.564 1.258-2.833 2.81-2.833h.063c1.552 0 2.81 1.27 2.81 2.833ZM12 6.25a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-1.5 0v-8.5a.75.75 0 0 1 .75-.75Z M9 7a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0V7Zm6 0a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0V7Z" clip-rule="evenodd" /></svg>`,
    twitter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12.315 2c-2.43 0-2.714.01-3.66.052-1.4.06-2.31.28-3.11.583a5.55 5.55 0 0 0-1.99 1.99c-.303.8-.523 1.71-.583 3.11C2.01 8.586 2 8.87 2 11.315s.01 2.73.052 3.66c.06 1.4.28 2.31.583 3.11a5.55 5.55 0 0 0 1.99 1.99c.8.303 1.71.523 3.11.583 1-.04 1.23-.05 3.67-.05s2.73.01 3.67.05c1.4.06 2.31.28 3.11.583a5.55 5.55 0 0 0 1.99-1.99c.303-.8.523-1.71-.583-3.11.04-1 .05-1.23.05-3.67s-.01-2.73-.05-3.67c-.06-1.4-.28-2.31-.583-3.11a5.55 5.55 0 0 0-1.99-1.99c-.8-.303-1.71-.523-3.11-.583C15.045 2.01 14.76 2 12.315 2zM8.47 11.315a3.845 3.845 0 1 0 7.69 0a3.845 3.845 0 0 0-7.69 0zM17.5 7.155a1.35 1.35 0 1 0 0-2.7 1.35 1.35 0 0 0 0 2.7z" clip-rule="evenodd"/><path d="M12.315 5.865a5.45 5.45 0 1 0 0 10.9 5.45 5.45 0 0 0 0-10.9zM8.47 11.315a3.845 3.845 0 1 1 7.69 0a3.845 3.845 0 0 1-7.69 0z"/></svg>`,
    facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10s10-4.48 10-10S17.52 2.04 12 2.04zM13.6 19.95V14h2l.3-2.3h-2.3v-1.45c0-.66.18-1.11 1.13-1.11h1.2V7.12c-.21-.03-.92-.09-1.75-.09c-1.73 0-2.91 1.06-2.91 2.99V11.7H9.4v2.3h1.8v5.95h2.4z"/></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Zm1.5 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0ZM21 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM3.75 12a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM17.969 6.031a.75.75 0 0 1 0 1.06l-1.591 1.591a.75.75 0 1 1-1.06-1.06l1.591-1.591a.75.75 0 0 1 1.06 0ZM7.121 16.879a.75.75 0 0 1 0 1.06l-1.591 1.591a.75.75 0 0 1-1.06-1.06l1.591-1.591a.75.75 0 0 1 1.06 0ZM19.56 16.879a.75.75 0 1 1-1.06 1.06l-1.591-1.591a.75.75 0 0 1 1.06-1.06l1.591 1.591ZM8.182 6.031a.75.75 0 1 1-1.06 1.06L5.53 5.53a.75.75 0 0 1 1.06-1.06l1.591 1.591Z"/></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.981A10.503 10.503 0 0 1 12 22.5a10.5 10.5 0 0 1-10.5-10.5c0-4.308 2.54-8.024 6.228-9.754a.75.75 0 0 1 .819.162Z" clip-rule="evenodd" /></svg>`,
};

// --- AI Schema Type Definitions ---
interface ShoppingPlan {
    budgetAnalysis: {
        userBudget: number;
        estimatedCost: number;
        difference: number;
        currency: string;
        summary: string;
        optimizationTips: string[];
    };
    budgetItems: {
        itemName: string;
        quantity: string;
        estimatedPrice: number;
    }[];
    priceAnalysis: {
        itemName: string;
        priceStability: string;
        savingTip: string;
    }[];
    recommendedMerchants: {
        name: string;
        address: string;
        deals: string;
        verified: boolean;
    }[];
}

interface BudgetPlan {
    summary: {
        totalIncome: number;
        totalFixedCosts: number;
        discretionaryBudget: number;
        currency: string;
        primaryGoal: string;
    };
    allocations: {
        category: string;
        amount: number;
        percentage: number;
        description: string;
        type: 'Fixed' | 'Variable';
    }[];
    recommendations: string[];
}

interface ExpenseReport {
    expenseSummary: {
        totalExpenses: number;
        largestExpenseCategory: string;
        currency: string;
    };
    spendingHabits: {
        dailyAverage: number;
        weeklyAverage: number;
        peakSpendingDay: string;
        spendingTrend: string;
        trendSummary: string;
    };
    categorizedExpenses: {
        category: string;
        amount: number;
        percentage: number;
        isRecurring: boolean;
        merchantCategory: string;
        merchantBrandExample?: string;
    }[];
    costCuttingSuggestions: {
        area: string;
        suggestion: string;
        potentialSavings: string;
    }[];
    investmentOpportunities: {
        name: string;
        description: string;
        riskLevel: string;
    }[];
    localMerchantSuggestions?: {
        name: string;
        category: string;
        reason: string;
    }[];
}

interface PerformanceReview {
    adherenceScore: number;
    currency: string;
    overallSummary: string;
    varianceAnalysis: {
        category: string;
        budgetedAmount: number;
        actualAmount: number;
        variance: number;
    }[];
    keyInsights: {
        insight: string;
        area: string;
    }[];
}

interface CreativeCopy {
    adCopies: {
        headline: string;
        body: string;
        callToAction: string;
    }[];
}

interface Opportunity {
    type: string;
    title: string;
    description: string;
    potentialSavings: string;
    action: {
        text: string;
        type: 'navigate' | 'invest';
        target: string; // e.g., 'budget' view name or 'Investment Opportunity Name'
    };
}

interface OpportunitiesData {
    opportunities: Opportunity[];
}

interface BriefingPoint {
    type: 'Insight' | 'Opportunity' | 'Next Step';
    title: string;
    description: string;
}

interface DailyBriefingData {
    briefing: BriefingPoint[];
}


// --- App State Type Definitions ---
interface WalletTransaction {
    id: string;
    date: string;
    type: 'fund' | 'payment' | 'transfer' | 'savings' | 'investment' | 'liquidation';
    description: string;
    amount: number; // Always positive
}

interface Merchant {
    name: string;
    category: string;
}

interface Investment {
    id: string;
    date: string;
    name: string;
    amount: number;
}

interface MerchantSummary extends Merchant {
    totalSpent: number;
    transactionCount: number;
    source: 'expenses' | 'manual';
}

interface SmartFeedItem {
    id: string;
    date: string;
    type: 'achievement' | 'warning' | 'insight' | 'action';
    text: string;
    icon: keyof typeof icons;
}

type User = {
    name: string;
    email: string;
    onboarding: {
        budget: boolean;
        expenses: boolean;
        wallet: boolean;
        opportunities: boolean;
    };
    spotlights: Record<string, boolean>;
    wallet: {
        balance: number;
        transactions: WalletTransaction[];
    };
    savingsVault: number;
    investments: Investment[];
    merchants: Merchant[];
    budgets: BudgetPlan[];
    expenses: ExpenseReport[];
    performanceReviews: PerformanceReview[];
    payments: { merchant: string; amount: number; frequency: string; }[];
    creativeCopies: CreativeCopy[];
    opportunities: OpportunitiesData[];
    dailyBriefing: DailyBriefingData | null;
    smartFeed: SmartFeedItem[];
};

type AppView = 'dashboard' | 'wallet' | 'budget' | 'expenses' | 'review' | 'creative' | 'opportunities';
type Theme = 'light' | 'dark';

// --- Persistence Constants ---
const LOCAL_STORAGE_USERS_KEY = 'cravour_users';
const LOCAL_STORAGE_CURRENT_USER_KEY = 'cravour_currentUserEmail';
const LOCAL_STORAGE_THEME_KEY = 'cravour_theme';

// --- Persistence Functions ---
function saveUserDatabase() {
    if (userDatabase.size > 0) {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(Array.from(userDatabase.entries())));
    }
}

function loadUserDatabase(): Map<string, User> {
    const storedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (storedUsers) {
        try {
            return new Map(JSON.parse(storedUsers));
        } catch (e) {
            console.error("Failed to parse user database from localStorage", e);
            return new Map();
        }
    }
    return new Map();
}

function saveCurrentLoggedInUser(email: string | null) {
    if (email) {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, email);
    } else {
        localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    }
}

function loadCurrentLoggedInUser(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
}

// --- State Management ---
let ai: GoogleGenAI;
let currentUser: User | null = null;
let userDatabase: Map<string, User> = new Map();
let currentView: AppView = 'dashboard';
let currentTheme: Theme = 'dark';
const API_KEY = process.env.API_KEY;
const PAYSTACK_PUBLIC_KEY = 'pk_test_0a4c8a2e0c3a2f8d1d2b7c6a0e1f3d4b9a8c7d6e'; // Public demo key for Paystack


// --- DOM Elements ---
const yearSpan = document.getElementById('year') as HTMLSpanElement;
const landingHamburger = document.getElementById('landingHamburger') as HTMLButtonElement;
const sidebarHamburger = document.getElementById('sidebarHamburger') as HTMLButtonElement;
const landingNav = document.getElementById('landing-nav') as HTMLElement;
const themeToggleHeaderBtn = document.getElementById('theme-toggle-header') as HTMLButtonElement;
const themeToggleSidebarBtn = document.getElementById('theme-toggle-sidebar') as HTMLButtonElement;

// Landing Page Elements
const landingPage = document.getElementById('landing-page') as HTMLElement;
const demoForm = document.getElementById('aiDemoForm') as HTMLFormElement;
const demoGoalInput = document.getElementById('planDescription') as HTMLTextAreaElement;
const demoGenerateBtn = document.getElementById('generateDemoPlanBtn') as HTMLButtonElement;
const demoStatusArea = document.getElementById('demoStatus') as HTMLDivElement;
const demoResultsContainer = document.getElementById('demo-results-wrapper') as HTMLDivElement;
const headerLoginLink = document.getElementById('headerLoginLink') as HTMLAnchorElement;
const headerSignUpLink = document.getElementById('headerSignUpLink') as HTMLAnchorElement;


// Auth Elements (Now on Landing Page)
const showRegisterBtn = document.getElementById('showRegister') as HTMLButtonElement;
const showLoginBtn = document.getElementById('showLogin') as HTMLButtonElement;
const loginView = document.getElementById('loginView') as HTMLDivElement;
const registerView = document.getElementById('registerView') as HTMLDivElement;
const loginForm = document.getElementById('loginForm') as HTMLFormElement;
const registerForm = document.getElementById('registerForm') as HTMLFormElement;
const registerNameInput = document.getElementById('registerName') as HTMLInputElement;
const registerEmailInput = document.getElementById('registerEmail') as HTMLInputElement;
const loginEmailInput = document.getElementById('loginEmail') as HTMLInputElement;

// Dashboard Elements
const appDashboard = document.getElementById('app-dashboard') as HTMLElement;
const appSidebar = document.querySelector('.app-sidebar') as HTMLElement;
const appOverlay = document.getElementById('app-overlay') as HTMLDivElement;
const sidebarMenu = document.getElementById('sidebar-menu') as HTMLUListElement;
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;
const allDashboardViews = document.querySelectorAll('.dashboard-view');

// Dashboard Home View
const welcomeMessage = document.getElementById('welcome-message') as HTMLHeadingElement;
const mainDashboardContent = document.getElementById('main-dashboard-content') as HTMLDivElement;
const gettingStartedChecklist = document.getElementById('getting-started-checklist') as HTMLDivElement;
const dashboardOverview = document.getElementById('dashboard-overview') as HTMLDivElement;
const dashboardTrendChartContainer = document.getElementById('dashboard-trend-chart-container') as HTMLDivElement;
const chartTooltip = document.getElementById('chart-tooltip') as HTMLDivElement;
const smartFeedList = document.getElementById('smart-feed-list') as HTMLDivElement;
const spotlightTooltip = document.getElementById('spotlight-tooltip') as HTMLDivElement;


// AI Daily Briefing Elements
const generateBriefingBtn = document.getElementById('generateBriefingBtn') as HTMLButtonElement;
const briefingResultsWrapper = document.getElementById('briefing-results-wrapper') as HTMLDivElement;


// Budget Planner Elements
const budgetPlannerForm = document.getElementById('budgetPlannerForm') as HTMLFormElement;
const budgetDescriptionInput = document.getElementById('budgetDescription') as HTMLTextAreaElement;
const budgetCurrencySelect = document.getElementById('budgetCurrency') as HTMLSelectElement;
const generateBudgetBtn = document.getElementById('generateBudgetBtn') as HTMLButtonElement;
const budgetStatusArea = document.getElementById('budgetStatus') as HTMLDivElement;
const budgetResultsContainer = document.getElementById('budget-results-wrapper') as HTMLDivElement;
const budgetHistoryList = document.getElementById('budget-history-list') as HTMLDivElement;


// Expense Analyzer Elements
const expenseAnalyzerForm = document.getElementById('expenseAnalyzerForm') as HTMLFormElement;
const expenseDataInput = document.getElementById('expenseData') as HTMLTextAreaElement;
const analyzeExpensesBtn = document.getElementById('analyzeExpensesBtn') as HTMLButtonElement;
const expenseStatusArea = document.getElementById('expenseStatus') as HTMLDivElement;
const expenseResultsContainer = document.getElementById('expense-results-wrapper') as HTMLDivElement;
const expensePeriodSelector = document.getElementById('expense-period-selector') as HTMLDivElement;
const customDateRangeContainer = document.getElementById('custom-date-range-container') as HTMLDivElement;
const startDateInput = document.getElementById('startDate') as HTMLInputElement;
const endDateInput = document.getElementById('endDate') as HTMLInputElement;


// Performance Review Elements
const generateReviewBtn = document.getElementById('generateReviewBtn') as HTMLButtonElement;
const shareReportBtn = document.getElementById('shareReportBtn') as HTMLButtonElement;
const reviewStatusArea = document.getElementById('reviewStatus') as HTMLDivElement;
const reviewResultsContainer = document.getElementById('review-results-wrapper') as HTMLDivElement;

// AI Creative Suite Elements
const creativeSuiteContainer = document.querySelector('.creative-suite-container') as HTMLDivElement;
const creativeSuiteFormDashboard = document.getElementById('creativeSuiteFormDashboard') as HTMLFormElement;
const adCopyResultsContainerDashboard = document.getElementById('ad-copy-results-wrapper-dashboard') as HTMLDivElement;
const savedAdCopyLibraryContainer = document.getElementById('saved-ad-copy-library') as HTMLDivElement;

// Opportunities Elements
const generateOpportunitiesBtn = document.getElementById('generateOpportunitiesBtn') as HTMLButtonElement;
const deleteOpportunitiesBtn = document.getElementById('deleteOpportunitiesBtn') as HTMLButtonElement;
const opportunitiesStatusArea = document.getElementById('opportunitiesStatus') as HTMLDivElement;
const opportunitiesResultsContainer = document.getElementById('opportunities-results-wrapper') as HTMLDivElement;

// Cravour Wallet View Elements
const walletViewContainer = document.getElementById('view-wallet') as HTMLElement;
const walletTabsContainer = document.getElementById('wallet-tabs') as HTMLDivElement;
const fundWalletBtn = document.getElementById('fundWalletBtn') as HTMLButtonElement;
const transferMoneyBtn = document.getElementById('transferMoneyBtn') as HTMLButtonElement;
const walletTransactionList = document.getElementById('wallet-transaction-list') as HTMLDivElement;
const allMerchantsListWallet = document.getElementById('all-merchants-list-wallet') as HTMLDivElement;
const addMerchantForm = document.getElementById('addMerchantForm') as HTMLFormElement;
const newMerchantNameInput = document.getElementById('newMerchantName') as HTMLInputElement;
const newMerchantCategoryInput = document.getElementById('newMerchantCategory') as HTMLInputElement;
const addMerchantStatus = document.getElementById('addMerchantStatus') as HTMLDivElement;
const paymentList = document.getElementById('paymentList') as HTMLDivElement;
const investmentList = document.getElementById('investment-list') as HTMLDivElement;


// Payment & Wallet Modals
const fundWalletModal = document.getElementById('fundWalletModal') as HTMLDivElement;
const closeFundWalletBtn = document.getElementById('closeFundWallet') as HTMLButtonElement;
const fundWalletForm = document.getElementById('fundWalletForm') as HTMLFormElement;
const fundAmountInput = document.getElementById('fundAmount') as HTMLInputElement;
const fundWalletStatus = document.getElementById('fundWalletStatus') as HTMLDivElement;

const transferModal = document.getElementById('transferModal') as HTMLDivElement;
const closeTransferModalBtn = document.getElementById('closeTransferModal') as HTMLButtonElement;
const transferForm = document.getElementById('transferForm') as HTMLFormElement;
const transferStatusArea = document.getElementById('transferStatus') as HTMLDivElement;
const transferAmountInput = document.getElementById('transferAmount') as HTMLInputElement;
const transferRecipientInput = document.getElementById('transferRecipient') as HTMLInputElement;


const paymentGatewayModal = document.getElementById('paymentGatewayModal') as HTMLDivElement;
const closePaymentGatewayBtn = document.getElementById('closePaymentGateway') as HTMLButtonElement;
const paymentMerchantNameSpan = document.getElementById('paymentMerchantName') as HTMLSpanElement;
const paymentAmountDisplaySpan = document.getElementById('paymentAmountDisplay') as HTMLSpanElement;
const paymentFrequencySelect = document.getElementById('paymentFrequency') as HTMLSelectElement;
const payWithPaystackBtn = document.getElementById('payWithPaystackBtn') as HTMLButtonElement;
const paymentStatus = document.getElementById('paymentStatus') as HTMLDivElement;
const walletPaymentSection = document.getElementById('walletPaymentSection') as HTMLElement;
const walletBalanceInfo = document.getElementById('walletBalanceInfo') as HTMLSpanElement;
const payWithWalletBtn = document.getElementById('payWithWalletBtn') as HTMLButtonElement;
const insufficientFundsMessage = document.getElementById('insufficientFundsMessage') as HTMLDivElement;

// Merchant History Modal
const merchantHistoryModal = document.getElementById('merchantHistoryModal') as HTMLDivElement;
const closeMerchantHistoryBtn = document.getElementById('closeMerchantHistory') as HTMLButtonElement;
const merchantHistoryName = document.getElementById('merchantHistoryName') as HTMLSpanElement;
const merchantHistoryList = document.getElementById('merchantHistoryList') as HTMLDivElement;

// Variance Details Modal
const varianceDetailsModal = document.getElementById('varianceDetailsModal') as HTMLDivElement;
const closeVarianceDetailsBtn = document.getElementById('closeVarianceDetails') as HTMLButtonElement;
const varianceCategoryName = document.getElementById('varianceCategoryName') as HTMLSpanElement;
const varianceDetailsList = document.getElementById('varianceDetailsList') as HTMLDivElement;


// Investment Simulator Modal
const investmentSimulatorModal = document.getElementById('investmentSimulatorModal') as HTMLDivElement;
const closeInvestmentSimulatorBtn = document.getElementById('closeInvestmentSimulator') as HTMLButtonElement;
const investmentSimulatorForm = document.getElementById('investmentSimulatorForm') as HTMLFormElement;
const investmentOpportunityTitle = document.getElementById('investmentOpportunityTitle') as HTMLParagraphElement;
const investmentSimulatorStatus = document.getElementById('investmentSimulatorStatus') as HTMLDivElement;
const investmentAmountInput = document.getElementById('investmentAmount') as HTMLInputElement;
const maxInvestmentAmount = document.getElementById('maxInvestmentAmount') as HTMLDivElement;


// Footer Elements
const contactForm = document.getElementById('contactForm') as HTMLFormElement;
const contactFormMessage = document.getElementById('contactFormMessage') as HTMLDivElement;

// --- Configuration State & Helpers ---
let isAiConfigured = false;
let isPaystackConfigured = false;
let currentInvestmentOpportunity: Opportunity | null = null;


function ensureConfigured(service: 'ai' | 'paystack'): boolean {
    if (service === 'ai') {
        if (!isAiConfigured) {
            console.error("AI service is not configured. API_KEY is missing.");
            return false;
        }
    }
    if (service === 'paystack') {
        if (!isPaystackConfigured) {
            console.error("Paystack service is not configured. PAYSTACK_PUBLIC_KEY is missing.");
            return false;
        }
    }
    return true;
}

// --- AI Schemas ---
const shoppingPlanSchema = {
    type: Type.OBJECT,
    properties: {
        budgetAnalysis: {
            type: Type.OBJECT,
            properties: {
                userBudget: { type: Type.NUMBER, description: "The budget amount mentioned by the user." },
                estimatedCost: { type: Type.NUMBER, description: "The AI's total estimated cost for all items." },
                difference: { type: Type.NUMBER, description: "The difference between userBudget and estimatedCost (positive if under budget, negative if over)." },
                currency: { type: Type.STRING, description: "The currency symbol (e.g., '$', '€') inferred from the user's prompt. Default to USD." },
                summary: { type: Type.STRING, description: "A brief, sharp summary, like 'Your budget is sufficient' or 'You are over budget'." },
                optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 2-3 actionable tips to optimize the budget, focusing on the most impactful savings." }
            },
        },
        budgetItems: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    itemName: { type: Type.STRING },
                    quantity: { type: Type.STRING },
                    estimatedPrice: { type: Type.NUMBER }
                },
            }
        },
        priceAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    itemName: { type: Type.STRING },
                    priceStability: { type: Type.STRING, description: "e.g., 'Stable', 'Slight Increase', 'Volatile'" },
                    savingTip: { type: Type.STRING, description: "An actionable tip for this specific item." }
                },
            }
        },
        recommendedMerchants: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "A popular merchant or service provider." },
                    address: { type: Type.STRING, description: "Physical location or web address (e.g., Shopify, Amazon, Stripe)." },
                    deals: { type: Type.STRING, description: "What they are known for or their current deals." },
                    verified: { type: Type.BOOLEAN, description: "Set to true if this is a major, well-known merchant, otherwise false." }
                },
            }
        }
    },
};

const budgetPlanSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.OBJECT,
            properties: {
                totalIncome: { type: Type.NUMBER },
                totalFixedCosts: { type: Type.NUMBER },
                discretionaryBudget: { type: Type.NUMBER },
                currency: { type: Type.STRING, description: "The currency symbol (e.g., '$', '€', '₦') provided in the prompt." },
                primaryGoal: { type: Type.STRING },
            },
        },
        allocations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    percentage: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                    type: { type: Type.STRING, description: "The type of cost: 'Fixed' for recurring, predictable expenses (like rent, subscriptions) or 'Variable' for others." }
                },
            }
        },
        recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-3 actionable recommendations for the user's budget."
        }
    },
};

const expenseReportSchema = {
    type: Type.OBJECT,
    properties: {
        expenseSummary: {
            type: Type.OBJECT,
            properties: {
                totalExpenses: { type: Type.NUMBER },
                largestExpenseCategory: { type: Type.STRING },
                currency: { type: Type.STRING, description: "The currency symbol (e.g., '$', '€', '₦') inferred from the user's budget. Default to NGN." },
            },
        },
        spendingHabits: {
            type: Type.OBJECT,
            description: "Analysis of user's spending patterns and habits.",
            properties: {
                dailyAverage: { type: Type.NUMBER, description: "The average daily spending calculated from the total expenses over the specified period." },
                weeklyAverage: { type: Type.NUMBER, description: "The average weekly spending." },
                peakSpendingDay: { type: Type.STRING, description: "The day of the week with the highest spending (e.g., 'Friday'). If unable to determine, return 'Not Available'." },
                spendingTrend: { type: Type.STRING, description: "A one-word summary of the spending trend, e.g., 'Consistent', 'High on Weekends', 'Varies'." },
                trendSummary: { type: Type.STRING, description: "A short, actionable summary of the user's spending habits. e.g., 'Your spending is highest on Fridays, mainly on dining out.'" }
            },
        },
        categorizedExpenses: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING, description: "e.g., Utilities, Software, Supplies, Food" },
                    amount: { type: Type.NUMBER },
                    percentage: { type: Type.NUMBER },
                    isRecurring: { type: Type.BOOLEAN, description: "True if this is a predictable, recurring monthly expense." },
                    merchantCategory: { type: Type.STRING, description: "A generic category for the merchant, e.g., 'Office Supply Store', 'Web Hosting Provider', 'Ride Sharing Service'." },
                    merchantBrandExample: { type: Type.STRING, description: "A plausible, globally recognized brand example for the category, e.g., 'Staples', 'GoDaddy', 'Uber'. Can be omitted."}
                },
            }
        },
        costCuttingSuggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    area: { type: Type.STRING, description: "The expense area to target." },
                    suggestion: { type: Type.STRING, description: "A specific, actionable cost-cutting tip." },
                    potentialSavings: { type: Type.STRING, description: "Estimated savings for the period, e.g., '₦5000 - ₦10000'" },
                }
            }
        },
        investmentOpportunities: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "e.g., High-Yield Savings, Index Funds, Robo-Advisor" },
                    description: { type: Type.STRING, description: "Brief explanation of the opportunity." },
                    riskLevel: { type: Type.STRING, description: "e.g., Low, Medium, High" },
                }
            }
        },
        localMerchantSuggestions: {
            type: Type.ARRAY,
            description: "A list of suggested local merchants based on the user's location and spending.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the local Nigerian merchant." },
                    category: { type: Type.STRING, description: "The category of the merchant, e.g., 'Groceries', 'Electronics'." },
                    reason: { type: Type.STRING, description: "A brief reason why this merchant is being recommended." }
                }
            }
        }
    },
};

const performanceReviewSchema = {
    type: Type.OBJECT,
    properties: {
        adherenceScore: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 representing how well the user stuck to their budget. 100 is perfect adherence. Calculated based on overall variance."
        },
        currency: { type: Type.STRING, description: "The currency symbol (e.g., '$', '€') from the budget." },
        overallSummary: {
            type: Type.STRING,
            description: "A brief, encouraging summary of the user's performance against their budget. Mention the biggest win and the area needing most improvement."
        },
        varianceAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING },
                    budgetedAmount: { type: Type.NUMBER },
                    actualAmount: { type: Type.NUMBER },
                    variance: { type: Type.NUMBER, description: "Difference between actual and budgeted (actual - budgeted). Negative means under-spent (good), positive means over-spent (bad)." },
                }
            }
        },
        keyInsights: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    insight: { type: Type.STRING, description: "An actionable insight based on the analysis." },
                    area: { type: Type.STRING, description: "The area this insight applies to (e.g., 'Savings', 'Spending Habits')." }
                }
            }
        }
    }
};

const creativeCopySchema = {
    type: Type.OBJECT,
    properties: {
        adCopies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING, description: "A catchy, attention-grabbing headline for the ad." },
                    body: { type: Type.STRING, description: "The main text of the ad, persuasive and informative." },
                    callToAction: { type: Type.STRING, description: "A clear and compelling call to action, e.g., 'Shop Now', 'Learn More'." }
                }
            }
        }
    }
};

const opportunitiesSchema = {
    type: Type.OBJECT,
    properties: {
        opportunities: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "Type of opportunity, e.g., 'Control Expenditures', 'Make Gold Multiply', 'Increase Earning Ability'." },
                    title: { type: Type.STRING, description: "A catchy title for the opportunity, framed as one of the 'cures'." },
                    description: { type: Type.STRING, description: "A detailed explanation of the opportunity and why it's relevant to the user, referencing their data." },
                    potentialSavings: { type: Type.STRING, description: "Estimated financial benefit, e.g., '₦5,000/month', '15% ROI (Medium Risk)'." },
                    action: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING, description: "A call to action, e.g., 'Adjust Budget', 'Explore Investment'." },
                            type: { type: Type.STRING, description: "The action type: 'navigate' or 'invest'." },
                            target: { type: Type.STRING, description: "For 'navigate', the view name (e.g., 'budget'). For 'invest', the name of the investment opportunity." }
                        }
                    }
                }
            }
        }
    }
};

const dailyBriefingSchema = {
    type: Type.OBJECT,
    properties: {
        briefing: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "The type of point: 'Insight', 'Opportunity', or 'Next Step'." },
                    title: { type: Type.STRING, description: "A short, catchy title for the point." },
                    description: { type: Type.STRING, description: "A concise, actionable description for the point." }
                }
            },
            description: "An array of exactly 3 briefing points."
        }
    }
};


// --- Helper Functions ---
function showStatusMessage(container: HTMLElement, message: string, type: 'success' | 'error' | 'info', withSpinner = false, actions: { text: string, view: AppView }[] = []) {
    if (!container) return;
    container.classList.remove('hidden');
    container.className = 'status-area'; // Reset classes
    
    const spinnerHtml = withSpinner ? '<div class="loading-spinner"></div>' : '';
    const actionsHtml = actions.map(action => `<button class="btn btn-small-action status-action-btn" data-view="${action.view}">${action.text}</button>`).join('');
    
    container.className = `status-area ${type}-message`;
    container.innerHTML = `<div class="loading-state">${spinnerHtml}<p>${message}</p></div> ${actionsHtml ? `<div class="status-actions">${actionsHtml}</div>` : ''}`;
}


function hideStatusMessage(container: HTMLElement, delay?: number) {
    if (!container) return;
    if (delay) {
        setTimeout(() => container.classList.add('hidden'), delay);
    } else {
        container.classList.add('hidden');
    }
}

function parseJsonFromAi<T>(text: string): T {
    try {
        return JSON.parse(text) as T;
    } catch (e) {
        console.error("JSON Parsing Error:", e);
        throw new Error("AI returned an invalid response format. Please try again.");
    }
}

function copyToClipboard(text: string, button: HTMLButtonElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = `${icons.check} Copied!`;
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function getCombinedMerchants(user: User): MerchantSummary[] {
    const merchantMap = new Map<string, MerchantSummary>();

    // Process merchants from expenses
    if (user.expenses && user.expenses.length > 0) {
        user.expenses.forEach(report => {
            report.categorizedExpenses.forEach(expense => {
                const merchantName = expense.merchantBrandExample || expense.merchantCategory;
                if (merchantName) {
                    const existing = merchantMap.get(merchantName) || { name: merchantName, category: expense.merchantCategory, totalSpent: 0, transactionCount: 0, source: 'expenses' };
                    existing.totalSpent += expense.amount;
                    existing.transactionCount += 1;
                    merchantMap.set(merchantName, existing);
                }
            });
        });
    }

    // Process manually added merchants
    user.merchants.forEach(merchant => {
        if (!merchantMap.has(merchant.name)) {
            merchantMap.set(merchant.name, { ...merchant, totalSpent: 0, transactionCount: 0, source: 'manual' });
        }
    });

    return Array.from(merchantMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);
}


function renderSkeletonLoader(container: HTMLElement, type: 'cards' | 'list' = 'cards') {
    if (!container) return;
    let skeletonHtml = '';
    if (type === 'cards') {
        skeletonHtml = `
            <div class="skeleton-card">
                <div class="skeleton-line title"></div>
                <div class="skeleton-grid">
                    <div class="skeleton-item"></div>
                    <div class="skeleton-item"></div>
                    <div class="skeleton-item"></div>
                </div>
                <div class="skeleton-line heading"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
        `;
    } else { // 'list' for ad copy or briefing
        skeletonHtml = `
            <div class="ad-copy-grid">
                <div class="skeleton-card ad-copy">
                    <div class="skeleton-line small-heading"></div>
                    <div class="skeleton-line heading"></div>
                    <div class="skeleton-line small-heading"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line small-heading"></div>
                    <div class="skeleton-line cta"></div>
                </div>
            </div>
        `;
    }
    container.innerHTML = skeletonHtml;
    container.parentElement?.classList.remove('hidden');
    container.classList.remove('hidden');
}

function showSpotlight(key: string, targetElement: HTMLElement | null, text: string) {
    if (!currentUser || currentUser.spotlights[key] || !targetElement || !spotlightTooltip) {
        return;
    }

    const rect = targetElement.getBoundingClientRect();
    spotlightTooltip.innerHTML = `<p>${text}</p><button id="dismiss-spotlight" class="btn btn-primary btn-small">Got it</button>`;

    // Assumes spotlightTooltip has `position: fixed` for viewport-relative positioning.
    spotlightTooltip.style.top = `${rect.bottom + 8}px`; 
    spotlightTooltip.style.left = `${rect.left}px`;
    spotlightTooltip.classList.remove('hidden');

    const dismissButton = document.getElementById('dismiss-spotlight');
    if (dismissButton) {
        dismissButton.onclick = () => {
            spotlightTooltip.classList.add('hidden');
            if (currentUser) {
                currentUser.spotlights[key] = true;
                saveUserDatabase();
            }
        };
    }
}


// --- View & UI Management ---
function renderAppView() {
    if (currentUser) {
        document.body.dataset.authState = 'logged-in';
    } else {
        document.body.dataset.authState = 'logged-out';
        
        // Ensure mobile menus are closed on logout
        landingNav.classList.remove('active');
        landingHamburger.classList.remove('is-active');
        appSidebar.classList.remove('active');
        sidebarHamburger.classList.remove('is-active');
        appOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
    renderIcons();
}

function navigateToView(view: AppView) {
    currentView = view;
    renderCurrentView();

    if (appSidebar.classList.contains('active')) {
        appSidebar.classList.remove('active');
        appOverlay.classList.add('hidden');
        sidebarHamburger.classList.remove('is-active');
        document.body.style.overflow = '';
    }
}


function renderCurrentView() {
    allDashboardViews.forEach(view => view.classList.add('hidden'));
    const viewToShow = document.getElementById(`view-${currentView}`);
    if (viewToShow) {
        viewToShow.classList.remove('hidden');
    }

    document.querySelectorAll('#sidebar-menu li a').forEach(link => {
        if (link.getAttribute('data-view') === currentView) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Call the specific renderer for the current view
    switch(currentView) {
        case 'dashboard':
            renderDashboardHomeView();
            break;
        case 'wallet':
            renderWalletView();
            break;
        case 'budget':
            renderBudgetHistory();
            showSpotlight('budget', generateBudgetBtn, 'Describe your finances and goals here, and our AI will create a budget for you.');
            break;
        case 'expenses':
            if (!currentUser?.budgets.length) {
                showStatusMessage(expenseStatusArea, "Please create a budget first to set your currency.", 'info');
            } else {
                hideStatusMessage(expenseStatusArea);
            }
            showSpotlight('expenses', analyzeExpensesBtn, 'Paste your business spending here. Our AI will analyze it for insights.');
            break;
        case 'review':
            showSpotlight('review', generateReviewBtn, 'Generate a review to see how your spending compares to your budget.');
            break;
        case 'creative':
            renderSavedAdCopyLibrary();
            break;
        case 'opportunities':
            renderSavedOpportunities();
            break;
    }
}


function renderSidebar() {
    const navItems = [
        { view: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
        { view: 'wallet', label: 'Cravour Wallet', icon: icons.wallet },
        { view: 'budget', label: 'Budget Planner', icon: icons.budget },
        { view: 'expenses', label: 'Expense Tracker', icon: icons.expenses },
        { view: 'review', label: 'Performance Review', icon: icons.review },
        { view: 'creative', label: 'Creative Suite', icon: icons.creative },
        { view: 'opportunities', label: 'Growth Opportunities', icon: icons.opportunities },
    ];

    sidebarMenu.innerHTML = navItems.map(item => `
        <li>
            <a href="#" data-view="${item.view}">
                ${item.icon}
                <span>${item.label}</span>
            </a>
        </li>
    `).join('');
}


// --- Rendering Functions ---
function renderDashboardHomeView() {
    if (!currentUser) return;
    welcomeMessage.textContent = `Welcome Back, ${currentUser.name}!`;

    const isChecklistComplete = Object.values(currentUser.onboarding).every(Boolean);

    if (isChecklistComplete) {
        gettingStartedChecklist.classList.add('hidden');
        mainDashboardContent.classList.remove('hidden');
        renderDailyBriefing();
        renderDashboardSummary();
        renderTrendChart();
        renderSmartFeed();
    } else {
        gettingStartedChecklist.classList.remove('hidden');
        mainDashboardContent.classList.add('hidden');
        renderOnboardingChecklist();
    }
}

function renderOnboardingChecklist() {
    if (!currentUser) return;
    Object.entries(currentUser.onboarding).forEach(([key, isComplete]) => {
        const itemEl = document.getElementById(`onboarding-${key}`);
        if(itemEl) {
            itemEl.classList.toggle('completed', isComplete);
            const statusDiv = itemEl.querySelector('.getting-started-status');
            if(statusDiv) {
                statusDiv.innerHTML = isComplete ? icons.check : '';
            }
        }
    });
}

function renderDashboardOverview(data: { [key: string]: { value: string; type?: 'success' | 'error'; note?: string; view?: AppView } }) {
    dashboardOverview.innerHTML = Object.entries(data).map(([title, { value, type, note, view }]) => `
        <div class="overview-card glass-effect" ${view ? `data-view="${view}"` : ''}>
            <h4>${title}</h4>
            <p class="value ${type || ''}">${value}</p>
            ${note ? `<small class="note">${note}</small>` : ''}
        </div>
    `).join('');
    dashboardOverview.classList.remove('hidden');
}

function renderDashboardSummary() {
    if (!currentUser) {
        dashboardOverview.classList.add('hidden');
        return;
    }

    const latestBudget = currentUser.budgets.length > 0 ? currentUser.budgets[currentUser.budgets.length - 1] : null;
    const latestExpenses = currentUser.expenses.length > 0 ? currentUser.expenses[currentUser.expenses.length - 1] : null;

    const discretionaryBudget = latestBudget?.summary?.discretionaryBudget || 0;
    const totalExpenses = latestExpenses?.expenseSummary?.totalExpenses || 0;
    const currency = latestBudget?.summary?.currency || latestExpenses?.expenseSummary?.currency || '₦';
    
    const summaryData: { [key: string]: { value: string; type?: 'success' | 'error'; note?: string; view?: AppView } } = {};

    summaryData['Discretionary Budget'] = {
        value: `${currency}${discretionaryBudget.toLocaleString()}`,
        type: 'success',
        note: latestBudget ? 'From your latest budget' : 'Create a budget to start',
        view: 'budget'
    };

    summaryData['Total Expenses'] = {
        value: `${currency}${totalExpenses.toLocaleString()}`,
        type: 'error',
        note: latestExpenses ? 'From your latest report' : 'Track expenses to see this',
        view: 'expenses'
    };

    if (latestBudget && latestExpenses) {
        const netPosition = discretionaryBudget - totalExpenses;
        summaryData['Net Position'] = {
            value: `${currency}${Math.abs(netPosition).toLocaleString()}`,
            type: netPosition >= 0 ? 'success' : 'error',
            note: netPosition >= 0 ? 'Under Budget' : 'Over Budget',
            view: 'review'
        };
    } else {
         summaryData['Net Position'] = {
            value: 'N/A',
            note: 'Track budget & expenses',
            view: 'review'
        };
    }
    
    summaryData['Wallet Balance'] = {
        value: `${currency}${currentUser.wallet.balance.toLocaleString()}`,
        note: 'Manage your wallet & pay',
        view: 'wallet'
    };
    
    renderDashboardOverview(summaryData);
}

function addFeedItem(type: SmartFeedItem['type'], text: string) {
    if (!currentUser) return;
    const iconMap: Record<SmartFeedItem['type'], keyof typeof icons> = {
        achievement: 'check',
        warning: 'infoCircle',
        insight: 'magic',
        action: 'opportunities',
    };
    currentUser.smartFeed.unshift({
        id: `feed_${Date.now()}`,
        date: new Date().toISOString(),
        type,
        text,
        icon: iconMap[type],
    });
    // Keep feed to a manageable size
    if (currentUser.smartFeed.length > 20) {
        currentUser.smartFeed.pop();
    }
    saveUserDatabase();
}

function renderSmartFeed() {
    if (!currentUser || !smartFeedList) return;
    if (currentUser.smartFeed.length === 0) {
        smartFeedList.innerHTML = `<div class="empty-state">Your smart feed will show key financial events and insights here.</div>`;
        return;
    }
    const feedHtml = currentUser.smartFeed.map(item => `
        <div class="feed-item item-${item.type}">
            <div class="feed-icon">${icons[item.icon]}</div>
            <div class="feed-text">
                <p>${item.text}</p>
                <small>${new Date(item.date).toLocaleString()}</small>
            </div>
        </div>
    `).join('');
    smartFeedList.innerHTML = feedHtml;
}


function renderTrendChart() {
    if (!currentUser || currentUser.budgets.length < 2) {
        dashboardTrendChartContainer.innerHTML = `<div class="empty-state">Complete at least two budget/expense cycles to see your trend.</div>`;
        return;
    }
    
    const dataPoints = currentUser.budgets.map((budget, index) => {
        const expense = currentUser.expenses[index];
        return {
            label: `Cycle ${index + 1}`,
            budget: budget.summary.discretionaryBudget,
            expenses: expense ? expense.expenseSummary.totalExpenses : 0,
        };
    });

    const currency = currentUser.budgets[0].summary.currency || '₦';
    const maxValue = Math.max(...dataPoints.flatMap(d => [d.budget, d.expenses]));
    const width = dashboardTrendChartContainer.clientWidth;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 50, left: 60 };

    const svg = `
        <svg class="trend-chart-svg" viewBox="0 0 ${width} ${height}">
            <!-- Grid lines -->
            ${Array.from({length: 5}).map((_, i) => `<line class="grid" x1="${padding.left}" y1="${padding.top + i * (height - padding.top - padding.bottom) / 4}" x2="${width - padding.right}" y2="${padding.top + i * (height - padding.top - padding.bottom) / 4}"></line>`).join('')}
            
            <!-- Y-Axis Labels -->
            ${Array.from({length: 5}).map((_, i) => `<text class="axis-label" x="${padding.left - 10}" y="${padding.top + i * (height - padding.top - padding.bottom) / 4 + 5}" text-anchor="end">${currency}${(maxValue * (1 - i/4)).toLocaleString(undefined, {notation: 'compact'})}</text>`).join('')}

            <!-- X-Axis Labels -->
            ${dataPoints.map((d, i) => `<text class="axis-label" x="${padding.left + i * (width - padding.left - padding.right) / (dataPoints.length - 1)}" y="${height - padding.bottom + 20}" text-anchor="middle">${d.label}</text>`).join('')}

            <!-- Budget Line -->
            <polyline class="line line-budget" points="${dataPoints.map((d, i) => `${padding.left + i * (width - padding.left - padding.right) / (dataPoints.length - 1)},${height - padding.bottom - (d.budget / maxValue) * (height - padding.top - padding.bottom)}`).join(' ')}" />
            
            <!-- Expenses Line -->
            <polyline class="line line-expenses" points="${dataPoints.map((d, i) => `${padding.left + i * (width - padding.left - padding.right) / (dataPoints.length - 1)},${height - padding.bottom - (d.expenses / maxValue) * (height - padding.top - padding.bottom)}`).join(' ')}" />
            
            <!-- Data Points -->
            ${dataPoints.map((d, i) => `
                <g class="chart-dot-group">
                    <circle class="dot dot-budget" cx="${padding.left + i * (width - padding.left - padding.right) / (dataPoints.length - 1)}" cy="${height - padding.bottom - (d.budget / maxValue) * (height - padding.top - padding.bottom)}" r="8" data-label="${d.label}" data-value="${d.budget}" data-type="Budget"/>
                    <circle class="dot dot-expenses" cx="${padding.left + i * (width - padding.left - padding.right) / (dataPoints.length - 1)}" cy="${height - padding.bottom - (d.expenses / maxValue) * (height - padding.top - padding.bottom)}" r="8" data-label="${d.label}" data-value="${d.expenses}" data-type="Expenses"/>
                </g>
            `).join('')}
        </svg>
        <div class="trend-chart-legend">
            <div class="legend-item"><span class="legend-color-box" style="background-color: var(--color-success);"></span> Budget</div>
            <div class="legend-item"><span class="legend-color-box" style="background-color: var(--color-error);"></span> Expenses</div>
        </div>
    `;

    dashboardTrendChartContainer.innerHTML = svg;
    addChartTooltipListeners();
}

function addChartTooltipListeners() {
    const dots = document.querySelectorAll('.chart-dot-group .dot');
    dots.forEach(dot => {
        dot.addEventListener('mouseover', (e: MouseEvent) => {
            const target = e.target as SVGCircleElement;
            const label = target.dataset.label;
            const value = parseFloat(target.dataset.value || '0');
            const type = target.dataset.type;
            const currency = currentUser?.budgets[0]?.summary.currency || '₦';

            chartTooltip.innerHTML = `<strong>${label}</strong><br>${type}: ${currency}${value.toLocaleString()}`;
            chartTooltip.classList.remove('hidden');
        });
        dot.addEventListener('mousemove', (e: MouseEvent) => {
            const chartRect = dashboardTrendChartContainer.getBoundingClientRect();
            chartTooltip.style.left = `${e.clientX - chartRect.left + 15}px`;
            chartTooltip.style.top = `${e.clientY - chartRect.top - 15}px`;
        });
        dot.addEventListener('mouseout', () => {
            chartTooltip.classList.add('hidden');
        });
    });
}


function renderChart(items: any[], valueKey: string, labelKey: string, percentKey: string, currency: string) {
    if (!items || items.length === 0) return '';
    const chartHtml = items.map(item => `
        <div class="chart-segment">
            <div class="chart-label">
                <span>${item[labelKey]}</span>
                <span>${currency}${item[valueKey].toLocaleString()}</span>
            </div>
            <div class="chart-bar-wrapper">
                <div class="chart-bar" style="--bar-width: ${item[percentKey]}%;"></div>
            </div>
        </div>
    `).join('');
    return `<div class="chart-container">${chartHtml}</div>`;
}

function renderGeneratedPlan(plan: ShoppingPlan, container: HTMLElement) {
    const budget = plan.budgetAnalysis;
    const currency = budget.currency || '₦';
    const differenceClass = budget.difference >= 0 ? 'success' : 'error';

    const budgetHtml = `
        <div class="result-section">
            <h3 class="result-heading">Budget vs. AI Estimate</h3>
            <div class="summary-grid">
                <div class="summary-card"><h4>Your Budget</h4><p>${currency}${budget.userBudget.toLocaleString()}</p></div>
                <div class="summary-card"><h4>AI Estimated Cost</h4><p>${currency}${budget.estimatedCost.toLocaleString()}</p></div>
                <div class="summary-card"><h4>Difference</h4><p class="${differenceClass}">${currency}${Math.abs(budget.difference).toLocaleString()}</p></div>
            </div>
            <p class="summary-text">${budget.summary}</p>
        </div>`;
    
    const optimizationHtml = (budget.optimizationTips && budget.optimizationTips.length > 0) ? `
        <div class="result-section optimization-tips">
            <h4 class="result-heading"><span class="btn-icon">${icons.magic}</span> AI Savings & Planning Tips</h4>
            <ul>${budget.optimizationTips.map((tip: string) => `<li>${tip}</li>`).join('')}</ul>
        </div>
    ` : '';
    
    const itemsHtml = `
        <div class="result-section">
             <h3 class="result-heading">Itemized Shopping List</h3>
            <div class="table-wrapper"><table class="data-table"><thead><tr><th>Item</th><th>Quantity</th><th>Est. Price (${currency})</th></tr></thead><tbody>
            ${plan.budgetItems.map((item) => `<tr><td>${item.itemName}</td><td>${item.quantity}</td><td>${currency}${item.estimatedPrice.toLocaleString()}</td></tr>`).join('')}
            </tbody></table></div>
        </div>`;

    const analysisHtml = `
        <div class="result-section">
            <h3 class="result-heading">AI Price Analysis</h3>
            <div class="analysis-grid">
                ${plan.priceAnalysis.map((item) => `<div class="analysis-card"><h4>${item.itemName}</h4><p class="stability"><strong>Price Stability:</strong> ${item.priceStability}</p><p class="tip"><span class="btn-icon">${icons.magic}</span> <strong>Tip:</strong> ${item.savingTip}</p></div>`).join('')}
            </div>
        </div>`;

    const merchantsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Recommended Shops & Services</h3>
            <div class="merchant-grid">
                ${plan.recommendedMerchants.map((merchant) => `<div class="merchant-card"><h4>${merchant.name} ${merchant.verified ? `<span class="verified-icon" data-icon="check"></span>` : ''}</h4><p><span class="footer-icon-placeholder" data-icon="envelope"></span> ${merchant.address}</p><p class="deals">${merchant.deals}</p></div>`).join('')}
            </div>
        </div>`;

    container.innerHTML = budgetHtml + optimizationHtml + itemsHtml + analysisHtml + merchantsHtml;
    renderIcons();
}

function renderBudgetPlan(plan: BudgetPlan, container: HTMLElement) {
    const summary = plan.summary;
    const currency = summary.currency || '₦';
    
    const summaryHtml = `
        <div class="result-section">
            <h3 class="result-heading">Budget Overview</h3>
            <div class="summary-grid">
                <div class="summary-card"><h4>Total Income</h4><p class="success">${currency}${summary.totalIncome.toLocaleString()}</p></div>
                <div class="summary-card"><h4>Fixed Costs</h4><p class="error">${currency}${summary.totalFixedCosts.toLocaleString()}</p></div>
                <div class="summary-card"><h4>Discretionary</h4><p class="success">${currency}${summary.discretionaryBudget.toLocaleString()}</p></div>
            </div>
            <p class="summary-text"><strong>Primary Goal:</strong> ${summary.primaryGoal}</p>
        </div>
    `;

    const chartHtml = `
         <div class="result-section">
             <h3 class="result-heading">Visual Allocations</h3>
             ${renderChart(plan.allocations, 'amount', 'category', 'percentage', currency)}
        </div>
    `;

    const allocationsHtml = `
         <div class="result-section">
             <h3 class="result-heading">Detailed Allocations</h3>
            <div class="table-wrapper"><table class="data-table"><thead><tr><th>Category</th><th>Amount (${currency})</th><th>% of Income</th><th>Type</th><th>Description</th></tr></thead><tbody>
            ${plan.allocations.map((item) => `<tr><td>${item.category}</td><td>${item.amount.toLocaleString()}</td><td>${item.percentage}%</td><td><span class="tag ${item.type}">${item.type}</span></td><td>${item.description}</td></tr>`).join('')}
            </tbody></table></div>
        </div>
    `;

    const recommendationsHtml = (plan.recommendations && plan.recommendations.length > 0) ? `
        <div class="result-section optimization-tips">
            <h3 class="result-heading"><span class="btn-icon">${icons.magic}</span> AI Recommendations</h3>
            <ul>${plan.recommendations.map((tip: string) => `<li>${tip}</li>`).join('')}</ul>
        </div>
    ` : '';
    
    container.innerHTML = summaryHtml + chartHtml + allocationsHtml + recommendationsHtml;
    
    // Add automation button if there are fixed costs
    const hasFixedCosts = plan.allocations.some(a => a.type === 'Fixed');
    if (hasFixedCosts) {
        const button = document.createElement('button');
        button.id = 'automateBudgetPaymentsBtn';
        button.className = 'btn btn-automate';
        button.innerHTML = `<span class="btn-icon">${icons.sync}</span> Automate Fixed Cost Payments`;
        container.appendChild(button);
        button.addEventListener('click', handleAutomateBudgetPayments);
    }
    
    renderIcons();
}

function renderBudgetHistory() {
    if (!currentUser || !budgetHistoryList) return;

    if (currentUser.budgets.length === 0) {
        budgetHistoryList.innerHTML = `<div class="empty-state">Your past budgets will appear here.</div>`;
        return;
    }

    const historyHtml = currentUser.budgets.map((budget, index) => {
        const currency = budget.summary.currency || '₦';
        return `
            <div class="history-item">
                <div>
                    <p><strong>Budget for ${currency}${budget.summary.totalIncome.toLocaleString()} Income</strong></p>
                    <p class="history-item-subtext">Created on ${new Date().toLocaleDateString()}</p>
                </div>
                <button class="delete-btn" data-budget-index="${index}" aria-label="Delete budget at index ${index}">${icons.trash}</button>
            </div>
        `;
    }).reverse().join(''); // Show most recent first

    budgetHistoryList.innerHTML = historyHtml;
}

function renderExpenseReport(report: ExpenseReport, container: HTMLElement) {
    const currency = report.expenseSummary.currency || '₦';
    const habits = report.spendingHabits;

    const habitInsightsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Spending Habit Insights</h3>
            <div class="dashboard-overview">
                <div class="overview-card glass-effect">
                    <h4>Daily Average</h4>
                    <p class="value">${currency}${habits.dailyAverage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div class="overview-card glass-effect">
                    <h4>Weekly Average</h4>
                    <p class="value">${currency}${habits.weeklyAverage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div class="overview-card glass-effect">
                    <h4>Peak Spending Day</h4>
                    <p class="value info">${habits.peakSpendingDay}</p>
                </div>
            </div>
            <div class="summary-text" style="text-align: left; margin-top: 20px;">
                <strong><span class="btn-icon" data-icon="chartLine"></span> AI Trend Analysis:</strong> ${habits.trendSummary}
            </div>
        </div>
    `;

    const chartHtml = `
        <div class="result-section">
            <h3 class="result-heading">Visual Spending Breakdown</h3>
            ${renderChart(report.categorizedExpenses, 'amount', 'category', 'percentage', currency)}
        </div>
    `;

    const breakdownHtml = `
        <div class="result-section">
             <h3 class="result-heading">Detailed Spending Breakdown</h3>
            <div class="table-wrapper"><table class="data-table"><thead><tr><th>Category</th><th>Amount (${currency})</th><th>% of Total</th><th>Action</th></tr></thead><tbody>
            ${report.categorizedExpenses.map((item) => `<tr>
                <td>${item.category}</td>
                <td>${item.amount.toLocaleString()}</td>
                <td>${item.percentage}%</td>
                <td>
                    <div class="action-buttons">
                        ${item.isRecurring ? `<button class="btn btn-small-action" data-merchant="${item.merchantBrandExample || item.merchantCategory}" data-amount="${item.amount}">Schedule Payment</button>` : '<span>-</span>'}
                    </div>
                </td>
            </tr>`).join('')}
            </tbody></table></div>
        </div>
    `;
    const savingsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Cost-Saving Suggestions</h3>
            <div class="analysis-grid">
                ${report.costCuttingSuggestions.map((item) => `<div class="analysis-card"><h4 class="info">${item.area}</h4><p>${item.suggestion}</p><p class="tip"><strong>Potential Savings:</strong> ${item.potentialSavings}</p></div>`).join('')}
            </div>
        </div>
    `;
    const investmentsHtml = `
        <div class="result-section">
            <h3 class="result-heading">Savings & Investment Ideas</h3>
             <div class="merchant-grid">
                ${report.investmentOpportunities.map((item) => `<div class="merchant-card"><h4>${item.name}</h4><p><strong>Risk:</strong> ${item.riskLevel}</p><p>${item.description}</p></div>`).join('')}
            </div>
        </div>
    `;

    const merchantsHtml = (report.localMerchantSuggestions && report.localMerchantSuggestions.length > 0) ? `
        <div class="result-section">
            <h3 class="result-heading">Local Merchant Suggestions</h3>
            <div class="merchant-grid">
                ${report.localMerchantSuggestions.map(merchant => `
                    <div class="merchant-card">
                        <h4>${merchant.name}</h4>
                        <p><strong>Category:</strong> ${merchant.category}</p>
                        <p class="tip">${merchant.reason}</p>
                        <button class="btn btn-secondary-outline" style="margin-top: 15px;" data-map-query="${merchant.name}, Nigeria">View on Map</button>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    container.innerHTML = habitInsightsHtml + chartHtml + breakdownHtml + savingsHtml + investmentsHtml + merchantsHtml;
    renderIcons();
}


function renderPerformanceReview(report: PerformanceReview, container: HTMLElement) {
    const score = report.adherenceScore;
    const currency = report.currency || '₦';

    const summaryHtml = `
        <div class="result-section review-summary">
            <div class="adherence-score-wrapper">
                 <svg width="180" height="180" viewBox="0 0 180 180" class="adherence-score-gauge">
                    <defs>
                        <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="${score > 50 ? 'var(--color-success)' : 'var(--color-gold-accent)'}"/>
                            <stop offset="100%" stop-color="${score > 80 ? 'var(--color-sky-blue-dark)' : 'var(--color-gold-accent)'}"/>
                        </linearGradient>
                    </defs>
                    <circle class="gauge-bg" cx="90" cy="90" r="80"></circle>
                    <circle class="gauge-fg" cx="90" cy="90" r="80" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${100 - score}"></circle>
                </svg>
                <div class="adherence-score-text">
                    <div class="score">${score}<span style="font-size: 0.5em">%</span></div>
                    <div class="label">Budget Adherence</div>
                </div>
            </div>
            <p class="summary-text" style="max-width: 600px;">${report.overallSummary}</p>
        </div>
    `;

    const varianceHtml = `
        <div class="result-section">
            <h3 class="result-heading">Budget vs. Actuals Breakdown</h3>
            <div class="table-wrapper"><table class="data-table">
                <thead><tr><th>Category</th><th>Budgeted (${currency})</th><th>Actual (${currency})</th><th>Variance (${currency})</th></tr></thead>
                <tbody id="variance-table-body">
                    ${report.varianceAnalysis.map((item) => {
                        const varianceClass = item.variance > 0 ? 'variance-negative' : item.variance < 0 ? 'variance-positive' : 'variance-neutral';
                        return `<tr class="variance-row" data-category="${item.category}" style="cursor: pointer;">
                            <td>${item.category}</td>
                            <td>${item.budgetedAmount.toLocaleString()}</td>
                            <td>${item.actualAmount.toLocaleString()}</td>
                            <td class="${varianceClass}">${item.variance.toLocaleString()}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table></div>
            <p style="font-size: 0.9em; text-align: center; margin-top: 15px;"><span class="variance-positive">Green variance</span> means you spent less than budgeted (good!). <span class="variance-negative">Red variance</span> means you overspent. Click a row for details.</p>
        </div>
    `;
    
    const insightsHtml = `
         <div class="result-section optimization-tips">
            <h3 class="result-heading"><span class="btn-icon">${icons.magic}</span> Key Performance Insights</h3>
            <ul>${report.keyInsights.map((item) => `<li><strong>${item.area}:</strong> ${item.insight}</li>`).join('')}</ul>
        </div>
    `;

    container.innerHTML = summaryHtml + varianceHtml + insightsHtml;
    renderIcons();
}

function renderAdCopy(data: CreativeCopy, container: HTMLElement) {
    if (!data?.adCopies || data.adCopies.length === 0) {
        container.innerHTML = '<div class="empty-state">The AI could not generate ad copy. Please try a different prompt.</div>';
        return;
    }
    const copiesHtml = data.adCopies.map((copy) => `
        <div class="ad-copy-card">
            <div class="ad-copy-part">
                <div class="ad-copy-part-header">
                    <span>Headline</span>
                    <button class="copy-btn" data-copy-text="${copy.headline}">${icons.copy} Copy</button>
                </div>
                <div class="ad-headline">${copy.headline}</div>
            </div>
            <div class="ad-copy-part">
                <div class="ad-copy-part-header">
                    <span>Body</span>
                    <button class="copy-btn" data-copy-text="${copy.body}">${icons.copy} Copy</button>
                </div>
                <p class="ad-body">${copy.body}</p>
            </div>
             <div class="ad-copy-part">
                <div class="ad-copy-part-header">
                    <span>Call To Action</span>
                    <button class="copy-btn" data-copy-text="${copy.callToAction}">${icons.copy} Copy</button>
                </div>
                <div class="ad-cta">${copy.callToAction}</div>
            </div>
        </div>
    `).join('');
    container.innerHTML = `<div class="ad-copy-grid">${copiesHtml}</div>`;
    renderIcons();
}

function renderSavedAdCopyLibrary() {
    if (!savedAdCopyLibraryContainer) return;

    if (!currentUser || !currentUser.creativeCopies || currentUser.creativeCopies.length === 0) {
        savedAdCopyLibraryContainer.innerHTML = '<div class="empty-state">Your generated ad copy will appear here.</div>';
        return;
    }

    const allSetsHtml = currentUser.creativeCopies.map((dataSet, index) => {
        const copiesHtml = dataSet.adCopies.map((copy) => `
            <div class="ad-copy-card">
                <div class="ad-copy-part">
                    <div class="ad-copy-part-header">
                        <span>Headline</span>
                        <button class="copy-btn" data-copy-text="${copy.headline}">${icons.copy} Copy</button>
                    </div>
                    <div class="ad-headline">${copy.headline}</div>
                </div>
                <div class="ad-copy-part">
                    <div class="ad-copy-part-header">
                        <span>Body</span>
                        <button class="copy-btn" data-copy-text="${copy.body}">${icons.copy} Copy</button>
                    </div>
                    <p class="ad-body">${copy.body}</p>
                </div>
                 <div class="ad-copy-part">
                    <div class="ad-copy-part-header">
                        <span>Call To Action</span>
                        <button class="copy-btn" data-copy-text="${copy.callToAction}">${icons.copy} Copy</button>
                    </div>
                    <div class="ad-cta">${copy.callToAction}</div>
                </div>
            </div>
        `).join('');

        return `
            <div class="saved-item-container">
                <div class="history-item">
                    <p><strong>Ad Set ${index + 1}</strong></p>
                    <button class="delete-btn" data-creative-index="${index}" aria-label="Delete ad copy set ${index + 1}">${icons.trash}</button>
                </div>
                <div class="ad-copy-grid">${copiesHtml}</div>
            </div>
        `;
    }).reverse().join('');


    savedAdCopyLibraryContainer.innerHTML = allSetsHtml;
    renderIcons();
}

function renderOpportunities(data: OpportunitiesData, container: HTMLElement) {
    if (!data?.opportunities || data.opportunities.length === 0) {
        container.innerHTML = '<div class="empty-state">No specific opportunities found at this time. Try updating your budget or expenses.</div>';
        deleteOpportunitiesBtn.classList.add('hidden');
        return;
    }

    const getIconForType = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType.includes('expenditure')) return icons.expenses;
        if (lowerType.includes('multiply') || lowerType.includes('invest')) return icons.chartLine;
        if (lowerType.includes('earn')) return icons.opportunities;
        if (lowerType.includes('saving')) return icons.wallet;
        return icons.magic;
    };
    
    const opportunitiesHtml = data.opportunities.map((opp, index) => `
        <div class="opportunity-card">
            <div class="card-header">
                <div class="card-icon">${getIconForType(opp.type)}</div>
                <div>
                    <h4 class="card-title">${opp.title}</h4>
                    <span class="card-type">${opp.type}</span>
                </div>
            </div>
            <div class="card-body">
                <p>${opp.description}</p>
            </div>
            <div class="card-footer">
                <p>Potential Benefit: <strong class="potential-savings">${opp.potentialSavings}</strong></p>
                <button class="btn btn-secondary-outline"
                        style="margin-top: 10px;"
                        data-action-type="${opp.action.type}"
                        data-action-target="${opp.action.target}"
                        data-opportunity-index="${index}">
                    ${opp.action.text}
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = `<div class="opportunities-grid">${opportunitiesHtml}</div>`;
    deleteOpportunitiesBtn.classList.remove('hidden');
    renderIcons();
}

function renderSavedOpportunities() {
    if (!opportunitiesResultsContainer) return;
    if (!currentUser || !currentUser.opportunities || currentUser.opportunities.length === 0) {
        opportunitiesResultsContainer.innerHTML = '<div class="empty-state">Generate opportunities to see them here.</div>';
        deleteOpportunitiesBtn.classList.add('hidden');
        return;
    }
    const latestOpportunities = currentUser.opportunities[currentUser.opportunities.length - 1];
    renderOpportunities(latestOpportunities, opportunitiesResultsContainer);
}

function renderPaymentList() {
    if (!currentUser || !paymentList) return;
    if (currentUser.payments.length === 0) {
        paymentList.innerHTML = `<div class="empty-state">No automated payments scheduled. Use the Expense Tracker to schedule recurring payments.</div>`;
        return;
    }
    const currency = currentUser.budgets[0]?.summary?.currency || '₦';

    const paymentsHtml = currentUser.payments.map((p, index) => `
        <div class="payment-item">
            <div>
                <p><strong>${p.merchant}</strong></p>
                <p style="font-size: 0.9em; color: var(--color-text-secondary);">${p.frequency}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 20px;">
                <p class="amount error">${currency}${p.amount.toLocaleString()}</p>
                <button class="btn btn-small-action" data-payment-index="${index}">Cancel</button>
            </div>
        </div>
    `).join('');

    paymentList.innerHTML = paymentsHtml;
}

function renderAllMerchantsList() {
    if (!currentUser || !allMerchantsListWallet) return;
    const merchants = getCombinedMerchants(currentUser);
    const currency = currentUser.budgets[0]?.summary.currency || '₦';

    if (merchants.length === 0) {
        allMerchantsListWallet.innerHTML = '<div class="empty-state">Analyze expenses or add merchants manually to see them here.</div>';
        return;
    }
    
    allMerchantsListWallet.innerHTML = merchants.map(m => `
        <div class="merchant-item" data-merchant-name="${m.name}">
            <div class="clickable-area">
                <p><strong>${m.name}</strong></p>
                <p style="font-size: 0.9em; color: var(--color-text-secondary);">${m.category}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="text-align: right;">
                    ${m.source === 'expenses' ? `<p class="amount error">${currency}${m.totalSpent.toLocaleString()}</p><p style="font-size: 0.8em; text-align: right; color: var(--color-text-secondary);">${m.transactionCount} transaction(s)</p>` : `<p style="font-size: 0.9em; color: var(--color-text-secondary);">Manually Added</p>`}
                </div>
                ${m.source === 'manual' ? `<button class="delete-btn" data-merchant-delete-name="${m.name}" aria-label="Delete merchant ${m.name}">${icons.trash}</button>` : ''}
            </div>
        </div>
    `).join('');
}

function renderInvestments() {
    if (!currentUser || !investmentList) return;
    if (currentUser.investments.length === 0) {
        investmentList.innerHTML = `<div class="empty-state">Act on investment opportunities to see your portfolio here.</div>`;
        return;
    }

    const currency = currentUser.budgets[0]?.summary?.currency || '₦';
    const investmentsHtml = currentUser.investments.map(inv => `
        <div class="history-item">
            <div>
                <p><strong>${inv.name}</strong></p>
                <p class="history-item-subtext">Invested on ${new Date(inv.date).toLocaleDateString()}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 20px;">
                 <p class="amount success">${currency}${inv.amount.toLocaleString()}</p>
                <button class="btn btn-small-action" data-investment-id="${inv.id}">Liquidate</button>
            </div>
        </div>
    `).join('');
    investmentList.innerHTML = investmentsHtml;
}

function renderDailyBriefing() {
    if (!currentUser || !briefingResultsWrapper) return;

    if (!currentUser.dailyBriefing) {
        briefingResultsWrapper.innerHTML = `<div class="empty-state">Click "Refresh Briefing" to get your personalized AI summary.</div>`;
        return;
    }

    const getIconForType = (type: BriefingPoint['type']) => {
        switch (type) {
            case 'Insight': return icons.infoCircle;
            case 'Opportunity': return icons.opportunities;
            case 'Next Step': return icons.magic;
            default: return icons.infoCircle;
        }
    };

    const briefingHtml = currentUser.dailyBriefing.briefing.map(point => `
        <div class="briefing-item">
            <div class="briefing-icon">${getIconForType(point.type)}</div>
            <div class="briefing-text">
                <h4>${point.title}</h4>
                <p>${point.description}</p>
            </div>
        </div>
    `).join('');

    briefingResultsWrapper.innerHTML = `<div class="briefing-list">${briefingHtml}</div>`;
    renderIcons();
}


function renderIcons() {
    document.querySelectorAll<HTMLElement>('[data-icon]').forEach(el => {
        const kebabKey = el.dataset.icon;
        if (kebabKey) {
            const camelCaseKey = kebabKey.replace(/-([a-z])/g, g => g[1].toUpperCase()) as keyof typeof icons;
            if (icons[camelCaseKey]) {
                el.innerHTML = icons[camelCaseKey];
            }
        }
    });
}

// --- Wallet & Pay View ---
function renderWalletView() {
    if (!currentUser) return;
    // Default to overview tab
    const overviewTab = walletTabsContainer.querySelector('[data-tab="overview"]') as HTMLElement;
    handleWalletTabs({ target: overviewTab } as unknown as Event);
}

function handleWalletTabs(e: Event) {
    const target = e.target as HTMLElement;
    if (target && target.matches('.tab-link')) {
        const tabId = target.dataset.tab;
        walletTabsContainer.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
        walletViewContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        target.classList.add('active');
        document.getElementById(`wallet-tab-${tabId!}`)?.classList.add('active');

        // Render content for the active tab
        switch(tabId) {
            case 'overview': renderWalletOverview(); break;
            case 'merchants': renderAllMerchantsList(); break;
            case 'payments': renderPaymentList(); break;
            case 'investments': renderInvestments(); break;
        }
    }
}

function renderWalletOverview() {
    if(!currentUser) return;
    const balanceEl = document.getElementById('wallet-balance-display');
    const savingsEl = document.getElementById('savings-vault-balance-display');
    const currency = currentUser.budgets[0]?.summary.currency || '₦';
    if(balanceEl) {
        balanceEl.textContent = `${currency}${currentUser.wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if(savingsEl) {
        savingsEl.textContent = `${currency}${currentUser.savingsVault.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    renderWalletTransactions();
}

function renderWalletTransactions() {
    if(!currentUser || !walletTransactionList) return;
    const transactions = [...currentUser.wallet.transactions].reverse(); // Show most recent first

    if (transactions.length === 0) {
        walletTransactionList.innerHTML = `<div class="empty-state">Your wallet transactions will appear here.</div>`;
        return;
    }

    const currency = currentUser.budgets[0]?.summary.currency || '₦';
    const transactionHtml = transactions.map(t => {
        const isDebit = t.type === 'payment' || t.type === 'transfer' || t.type === 'investment';
        const isSavings = t.type === 'savings';
        let icon, amountClass, sign;

        if (isSavings) {
            icon = icons.wallet;
            amountClass = 'info';
            sign = '→';
        } else if (t.type === 'investment') {
            icon = icons.chartLine;
            amountClass = 'error';
            sign = '-';
        } else if (t.type === 'liquidation') {
            icon = icons.wallet;
            amountClass = 'success';
            sign = '+';
        } else {
            icon = isDebit ? icons.arrowUp : icons.arrowDown;
            amountClass = isDebit ? 'error' : 'success';
            sign = isDebit ? '-' : '+';
        }
        
        return `
            <div class="transaction-item">
                <div class="transaction-icon ${amountClass}">${icon}</div>
                <div class="transaction-details">
                    <p><strong>${t.description}</strong></p>
                    <p class="transaction-date">${new Date(t.date).toLocaleString()}</p>
                </div>
                <div class="transaction-amount ${amountClass}">${sign}${currency}${t.amount.toLocaleString()}</div>
            </div>
        `;
    }).join('');
    walletTransactionList.innerHTML = transactionHtml;
}


// --- Event Handlers & Logic ---
function handleLandingNavToggle() {
    const isActive = landingNav.classList.toggle('active');
    landingHamburger.classList.toggle('is-active');
    document.body.style.overflow = isActive ? 'hidden' : '';
    landingNav.setAttribute('aria-hidden', String(!isActive));
    landingHamburger.setAttribute('aria-expanded', String(isActive));
}

function handleSidebarToggle() {
    const isActive = appSidebar.classList.toggle('active');
    appOverlay.classList.toggle('hidden');
    sidebarHamburger.classList.toggle('is-active');
    document.body.style.overflow = isActive ? 'hidden' : '';
    appSidebar.setAttribute('aria-hidden', String(!isActive));
    sidebarHamburger.setAttribute('aria-expanded', String(isActive));
}

function switchAuthView(isRegistering: boolean) {
    registerView.classList.toggle('hidden', !isRegistering);
    loginView.classList.toggle('hidden', isRegistering);
    
    showRegisterBtn.classList.toggle('active', isRegistering);
    showLoginBtn.classList.toggle('active', !isRegistering);
}

function handleRegister(e: Event) {
    e.preventDefault();
    const name = registerNameInput.value;
    const email = registerEmailInput.value.toLowerCase();
    const messageContainer = document.getElementById('registerMessage')!;
    
    if (!name || !email) {
        showStatusMessage(messageContainer, "Please fill in all fields.", "error");
        return;
    }
    if (userDatabase.has(email)) {
        showStatusMessage(messageContainer, "An account with this email already exists.", "error");
        return;
    }

    const newUser: User = {
        name,
        email,
        onboarding: {
            budget: false,
            expenses: false,
            wallet: false,
            opportunities: false
        },
        spotlights: {},
        wallet: { balance: 0, transactions: [] },
        savingsVault: 0,
        investments: [],
        merchants: [],
        budgets: [],
        expenses: [],
        performanceReviews: [],
        payments: [],
        creativeCopies: [],
        opportunities: [],
        dailyBriefing: null,
        smartFeed: []
    };
    
    userDatabase.set(email, newUser);
    saveUserDatabase();
    
    showStatusMessage(messageContainer, "Registration successful! Please log in.", "success");
    registerForm.reset();
    loginEmailInput.value = email;
    switchAuthView(false);
}


function handleLogin(e: Event) {
    e.preventDefault();
    const email = loginEmailInput.value.toLowerCase();
    const messageContainer = document.getElementById('loginMessage')!;
    if (!email) {
        showStatusMessage(messageContainer, "Please enter your email.", "error");
        return;
    }
    if (userDatabase.has(email)) {
        currentUser = userDatabase.get(email)!;
        saveCurrentLoggedInUser(email);
        renderAppView();
        initializeDashboard();
        loginForm.reset();
    } else {
        showStatusMessage(messageContainer, "No account found with that email.", "error");
    }
}

function handleLogout() {
    currentUser = null;
    saveCurrentLoggedInUser(null);
    renderAppView();
}

function initializeDashboard() {
    if (!currentUser) return;
    renderSidebar();
    navigateToView('dashboard');
    renderIcons();
}

async function handleGenerateDemoPlan(e: Event) {
    e.preventDefault();
    if (!ensureConfigured('ai')) {
        showStatusMessage(demoStatusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }
    const goal = demoGoalInput.value;
    if (!goal) {
        showStatusMessage(demoStatusArea, "Please describe your business goal.", "error");
        return;
    }
    showStatusMessage(demoStatusArea, "AI is building your plan...", "info", true);
    demoGenerateBtn.disabled = true;
    renderSkeletonLoader(demoResultsContainer, 'cards');

    try {
        const prompt = `A user wants to start a business. Their goal is: "${goal}". Generate a comprehensive shopping and budget plan for them. Be realistic and provide actionable tips. Assume the currency is NGN (Nigerian Naira) unless specified otherwise.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: shoppingPlanSchema
            }
        });

        const plan = parseJsonFromAi<ShoppingPlan>(response.text);
        renderGeneratedPlan(plan, demoResultsContainer);
        hideStatusMessage(demoStatusArea, 500);

    } catch (error) {
        console.error("Demo Plan Generation Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(demoStatusArea, `Error: ${errorMessage}`, "error");
        demoResultsContainer.innerHTML = '<div class="empty-state">Could not generate plan. Please try a different prompt.</div>';
    } finally {
        demoGenerateBtn.disabled = false;
    }
}


async function handleGenerateBudgetPlan(e: Event) {
    e.preventDefault();
    if (!currentUser) return;
    if (!ensureConfigured('ai')) {
        showStatusMessage(budgetStatusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }
    
    const description = budgetDescriptionInput.value;
    const currency = budgetCurrencySelect.value;
    if (!description) {
        showStatusMessage(budgetStatusArea, 'Please describe your financial situation.', 'error');
        return;
    }

    showStatusMessage(budgetStatusArea, 'AI is drafting your budget...', 'info', true);
    generateBudgetBtn.disabled = true;
    renderSkeletonLoader(budgetResultsContainer, 'cards');

    try {
        const prompt = `You are an AI financial planner inspired by "The Richest Man in Babylon". Based on the following user description, create a detailed budget plan. 
        
        **CRITICAL RULE 1:** You MUST create a "Savings & Investment" category and allocate AT LEAST 10% of the total income to it. In the description for this category, briefly explain that this is the principle of "paying yourself first" to build wealth.
        **CRITICAL RULE 2:** For each allocation, identify if it's a 'Fixed' or 'Variable' cost. Fixed costs are predictable, recurring expenses like rent or subscriptions. Everything else is variable. Populate the 'type' field accordingly.

        Ensure the currency is set to '${currency}'. Description: "${description}"`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: budgetPlanSchema
            }
        });

        const budgetPlan = parseJsonFromAi<BudgetPlan>(response.text);
        renderBudgetPlan(budgetPlan, budgetResultsContainer);
        currentUser.budgets.push(budgetPlan);
        currentUser.onboarding.budget = true; // Onboarding Step
        
        addFeedItem('achievement', `New budget created for ${currency}${budgetPlan.summary.totalIncome.toLocaleString()}.`);
        
        saveUserDatabase();
        
        showStatusMessage(budgetStatusArea, 'Budget created! What\'s next?', 'success', false, [{text: 'Reveal Spending Insights', view: 'expenses'}]);

        renderDashboardHomeView();
        renderBudgetHistory();
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(budgetStatusArea, `Error: ${errorMessage}`, 'error');
        budgetResultsContainer.innerHTML = `<div class="empty-state">Could not generate budget. Please try again.</div>`;
    } finally {
        generateBudgetBtn.disabled = false;
    }
}

function handleAutomateBudgetPayments() {
    if (!currentUser || currentUser.budgets.length === 0) return;

    const latestBudget = currentUser.budgets[currentUser.budgets.length - 1];
    const fixedCosts = latestBudget.allocations.filter(a => a.type === 'Fixed');

    if (fixedCosts.length === 0) {
        showStatusMessage(budgetStatusArea, "No fixed costs were identified in this budget to automate.", 'info');
        return;
    }
    
    let scheduledCount = 0;
    fixedCosts.forEach(cost => {
        // Avoid adding duplicates
        const alreadyExists = currentUser!.payments.some(p => p.merchant === cost.category && p.amount === cost.amount);
        if (!alreadyExists) {
            currentUser!.payments.push({
                merchant: cost.category,
                amount: cost.amount,
                frequency: "Monthly" // Defaulting to monthly
            });
            scheduledCount++;
        }
    });

    addFeedItem('action', `${scheduledCount} fixed cost payment(s) have been automated.`);
    saveUserDatabase();
    showStatusMessage(budgetStatusArea, `${scheduledCount} fixed cost payment(s) have been scheduled in your Cravour Wallet.`, 'success');
    hideStatusMessage(budgetStatusArea, 5000);
}

async function handleAnalyzeExpenses(e: Event) {
    e.preventDefault();
    if (!currentUser) return;
    if (!ensureConfigured('ai')) {
        showStatusMessage(expenseStatusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }
    
    const data = expenseDataInput.value;
    if (!data) {
        showStatusMessage(expenseStatusArea, 'Please paste your expense data.', 'error');
        return;
    }

    let userLocation: { latitude: number; longitude: number; } | null = null;
    if (navigator.geolocation) {
        showStatusMessage(expenseStatusArea, "Requesting location for local merchant suggestions...", 'info');
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });
            userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
        } catch (error) {
            console.warn(`Geolocation error: ${(error as GeolocationPositionError).message}. Proceeding without local suggestions.`);
        }
    }


    const selectedPeriod = (expensePeriodSelector.querySelector('.active') as HTMLElement)?.dataset.period || 'monthly';
    let periodContext = "for a month";
    if (selectedPeriod === 'custom') {
        const start = startDateInput.value;
        const end = endDateInput.value;
        if (!start || !end) {
            showStatusMessage(expenseStatusArea, 'Please select a start and end date for the custom range.', 'error');
            return;
        }
        if (new Date(start) > new Date(end)) {
            showStatusMessage(expenseStatusArea, 'Start date cannot be after the end date.', 'error');
            return;
        }
        periodContext = `for the period between ${start} and ${end}`;
    } else {
        periodContext = `for a ${selectedPeriod} period`;
    }
    
    const currency = currentUser.budgets[currentUser.budgets.length - 1]?.summary?.currency || 'NGN';
    
    showStatusMessage(expenseStatusArea, 'AI is analyzing your spending...', 'info', true);
    analyzeExpensesBtn.disabled = true;
    renderSkeletonLoader(expenseResultsContainer, 'cards');

    try {
        let prompt = `Analyze the following expense data ${periodContext}. The user's primary currency is ${currency}. Provide a detailed report, including spending habits (daily/weekly average, peak day, trend), categorization, cost-cutting tips, and investment opportunities. Data: "${data}"`;

        if (userLocation) {
            prompt += ` The user is located at latitude ${userLocation.latitude} and longitude ${userLocation.longitude} in Nigeria. Please also provide a list of 3-5 real, local Nigerian merchants relevant to their spending categories. For each merchant, provide their name, category, and a brief reason for the recommendation (e.g., 'offers bulk discounts on supplies').`;
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: expenseReportSchema
            }
        });

        const expenseReport = parseJsonFromAi<ExpenseReport>(response.text);
        renderExpenseReport(expenseReport, expenseResultsContainer);
        currentUser.expenses.push(expenseReport);
        currentUser.onboarding.expenses = true; // Onboarding Step
        
        addFeedItem('insight', `Expense analysis complete. Your largest expense category was "${expenseReport.expenseSummary.largestExpenseCategory}".`);
        saveUserDatabase();
        
        showStatusMessage(expenseStatusArea, 'Analysis complete! Ready to see how you performed?', 'success', false, [{ text: 'Review My Performance', view: 'review' }]);

        renderDashboardHomeView();
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(expenseStatusArea, `Error: ${errorMessage}`, 'error');
        expenseResultsContainer.innerHTML = `<div class="empty-state">Could not analyze expenses. Please try again.</div>`;
    } finally {
        analyzeExpensesBtn.disabled = false;
    }
}

async function handleGenerateReview() {
    if (!currentUser || currentUser.budgets.length === 0 || currentUser.expenses.length === 0) {
        showStatusMessage(reviewStatusArea, 'Please create a budget and analyze expenses first.', 'info');
        return;
    }
    if (!ensureConfigured('ai')) {
        showStatusMessage(reviewStatusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }

    showStatusMessage(reviewStatusArea, 'AI is reviewing your performance...', 'info', true);
    generateReviewBtn.disabled = true;
    renderSkeletonLoader(reviewResultsContainer, 'cards');

    const latestBudget = JSON.stringify(currentUser.budgets[currentUser.budgets.length - 1]);
    const latestExpenses = JSON.stringify(currentUser.expenses[currentUser.expenses.length - 1]);

    try {
        const prompt = `Given the user's budget and their actual spending, generate a performance review. Budget: ${latestBudget}. Expenses: ${latestExpenses}. Calculate adherence and provide actionable insights.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: performanceReviewSchema
            }
        });

        const review = parseJsonFromAi<PerformanceReview>(response.text);
        renderPerformanceReview(review, reviewResultsContainer);
        
        if (!currentUser.performanceReviews) {
            currentUser.performanceReviews = [];
        }
        currentUser.performanceReviews.push(review);
        
        if(review.adherenceScore < 70) {
            addFeedItem('warning', `Your budget adherence was ${review.adherenceScore}%. Let's find ways to improve.`);
        } else {
             addFeedItem('achievement', `Great job! Your budget adherence score is ${review.adherenceScore}%.`);
        }
        saveUserDatabase();
        renderSmartFeed();

        hideStatusMessage(reviewStatusArea, 500);
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(reviewStatusArea, `Error: ${errorMessage}`, 'error');
        reviewResultsContainer.innerHTML = `<div class="empty-state">Could not generate review. Please try again.</div>`;
    } finally {
        generateReviewBtn.disabled = false;
    }
}

async function handleGenerateCreativeCopyDashboard(e: Event) {
    e.preventDefault();
    if (!currentUser) return;

    const form = e.target as HTMLFormElement;
    const productName = (form.elements.namedItem('productNameDashboard') as HTMLInputElement).value;
    const platform = (form.elements.namedItem('adPlatformDashboard') as HTMLSelectElement).value;
    const description = (form.elements.namedItem('productDescriptionDashboard') as HTMLTextAreaElement).value;
    const statusArea = document.getElementById('adCopyStatusDashboard')!;
    const generateBtn = document.getElementById('generateAdCopyBtnDashboard') as HTMLButtonElement;
    
    if (!ensureConfigured('ai')) {
        showStatusMessage(statusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }

    if (!productName || !description) {
        showStatusMessage(statusArea, 'Please fill in all fields.', 'error');
        return;
    }

    showStatusMessage(statusArea, 'AI is writing your ad copy...', 'info', true);
    generateBtn.disabled = true;
    renderSkeletonLoader(adCopyResultsContainerDashboard, 'list');

    try {
        const prompt = `Generate 3 ad copy variations for a product named "${productName}". The target platform is ${platform}. The product description is: "${description}".`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: creativeCopySchema,
            }
        });

        const copyData = parseJsonFromAi<CreativeCopy>(response.text);
        renderAdCopy(copyData, adCopyResultsContainerDashboard);
        currentUser.creativeCopies.push(copyData);
        saveUserDatabase();
        renderSavedAdCopyLibrary();
        hideStatusMessage(statusArea, 500);
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(statusArea, `Error: ${errorMessage}`, 'error');
        adCopyResultsContainerDashboard.innerHTML = '<div class="empty-state">Could not generate copy. Please try again.</div>';
    } finally {
        generateBtn.disabled = false;
    }
}

async function handleGenerateOpportunities() {
    if (!currentUser) return;
    if (currentUser.budgets.length === 0 || currentUser.expenses.length === 0) {
        showStatusMessage(opportunitiesStatusArea, 'Complete your budget and expense reports for personalized insights.', 'info');
        return;
    }
    if (!ensureConfigured('ai')) {
        showStatusMessage(opportunitiesStatusArea, 'AI features are disabled due to a configuration error.', 'error');
        return;
    }

    showStatusMessage(opportunitiesStatusArea, 'AI is analyzing your profile for wealth-building strategies...', 'info', true);
    generateOpportunitiesBtn.disabled = true;
    renderSkeletonLoader(opportunitiesResultsContainer, 'cards');
    
    const userProfile = {
        name: currentUser.name,
        savingsVault: currentUser.savingsVault,
        latestBudget: currentUser.budgets[currentUser.budgets.length - 1],
        latestExpenses: currentUser.expenses[currentUser.expenses.length - 1],
        scheduledPayments: currentUser.payments,
    };

    const prompt = `
        You are an AI financial co-pilot named Cravour, inspired by the timeless wisdom of "The Richest Man in Babylon". Your primary directive is to guide the user towards financial prosperity.
        Analyze the user's financial profile: ${JSON.stringify(userProfile, null, 2)}
        
        Generate 3-4 highly specific and actionable opportunities framed around the "cures for a lean purse".
        Your recommendations MUST be grounded in the user's actual data. Structure your response according to these principles. 

        1.  **"Control Thy Expenditures":** Find the top 1-2 categories where spending exceeds the budget. Suggest specific, cheaper alternatives or spending reductions. For this, set 'action.type' to 'navigate' and 'action.target' to 'budget'. The 'action.text' should be 'Adjust My Budget'.
        2.  **"Make Thy Gold Multiply":** CRITICAL. If 'savingsVault' > 0, suggest a specific, plausible investment for a portion of that money (e.g., "Invest ₦X in..."). Always include a risk level. For this, set 'action.type' to 'invest' and 'action.target' to the investment name (e.g., "Low-Risk Index Fund"). 'action.text' should be 'Explore Investment'.
        3.  **"Increase Thy Ability to Earn":** Based on their business type, suggest a tangible way to increase income. Set 'action.type' to 'navigate' and 'action.target' to 'creative'. 'action.text' should be 'Boost My Marketing'.
        
        Provide the output in the specified JSON format. The 'title' for each opportunity must reflect one of the principles. The 'description' must be detailed and explain *why* you are making the recommendation, referencing the user's data.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: opportunitiesSchema,
            }
        });

        const opportunities = parseJsonFromAi<OpportunitiesData>(response.text);
        renderOpportunities(opportunities, opportunitiesResultsContainer);
        currentUser.opportunities.push(opportunities);
        currentUser.onboarding.opportunities = true; // Onboarding Step
        
        addFeedItem('action', 'New growth opportunities are ready for you to explore.');
        saveUserDatabase();

        hideStatusMessage(opportunitiesStatusArea, 500);
        renderDashboardHomeView();
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        showStatusMessage(opportunitiesStatusArea, `Error: ${errorMessage}`, 'error');
        opportunitiesResultsContainer.innerHTML = `<div class="empty-state">Could not find opportunities. Please try again with a more detailed profile.</div>`;
    } finally {
        generateOpportunitiesBtn.disabled = false;
    }
}

async function handleGenerateBriefing() {
    if (!currentUser) return;
    if (currentUser.budgets.length === 0) {
        briefingResultsWrapper.innerHTML = `<div class="empty-state">Create a budget to get your first briefing.</div>`;
        return;
    }
    if (!ensureConfigured('ai')) {
        briefingResultsWrapper.innerHTML = `<div class="empty-state">AI features are currently disabled.</div>`;
        return;
    }

    renderSkeletonLoader(briefingResultsWrapper, 'list');
    generateBriefingBtn.disabled = true;

    try {
        const userProfile = {
            name: currentUser.name,
            latestBudget: currentUser.budgets[currentUser.budgets.length - 1],
            latestExpenses: currentUser.expenses.length > 0 ? currentUser.expenses[currentUser.expenses.length - 1] : 'No expenses tracked yet.',
            walletBalance: currentUser.wallet.balance,
            savingsVault: currentUser.savingsVault,
            latestOpportunities: currentUser.opportunities.length > 0 ? currentUser.opportunities[currentUser.opportunities.length - 1] : 'No opportunities generated yet.'
        };

        const prompt = `You are Cravour, a proactive AI financial co-pilot. Analyze the user's full financial profile: ${JSON.stringify(userProfile, null, 2)}. 
        Generate a concise, 3-point daily briefing designed to give the user immediate clarity and direction.
        
        1.  **Key Insight:** Provide one sharp, relevant observation about their recent financial activity. (e.g., "Your spending on 'Software' was higher than usual this month.")
        2.  **Top Opportunity:** Identify the single most impactful opportunity from their profile. (e.g., "You can save ₦5,000/month by switching your 'Web Hosting' provider.") If no opportunities exist, suggest they generate some.
        3.  **Your Next Step:** Guide the user to the next logical action in the app. If they just budgeted, tell them to track expenses. If they just tracked expenses, tell them to review their performance.

        Provide the output in the specified JSON format.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: dailyBriefingSchema,
            }
        });

        const briefingData = parseJsonFromAi<DailyBriefingData>(response.text);
        currentUser.dailyBriefing = briefingData;
        saveUserDatabase();
        renderDailyBriefing();

    } catch (error) {
        console.error(error);
        briefingResultsWrapper.innerHTML = `<div class="empty-state">Could not generate briefing. Please try again.</div>`;
    } finally {
        generateBriefingBtn.disabled = false;
    }
}

function openPaymentGateway(merchant: string, amount: number) {
    if (!currentUser) return;
    const currency = currentUser.budgets[0]?.summary.currency || '₦';

    paymentMerchantNameSpan.textContent = merchant;
    paymentAmountDisplaySpan.textContent = `${currency}${amount.toLocaleString()}`;
    
    // Set data attributes for later use
    payWithPaystackBtn.dataset.amount = String(amount * 100); // Paystack uses kobo/cents
    payWithPaystackBtn.dataset.merchant = merchant;
    payWithWalletBtn.dataset.amount = String(amount);
    payWithWalletBtn.dataset.merchant = merchant;

    // Show/hide wallet payment option
    if (currentUser.wallet.balance >= amount) {
        walletPaymentSection.classList.remove('hidden');
        insufficientFundsMessage.classList.add('hidden');
        payWithWalletBtn.disabled = false;
        walletBalanceInfo.textContent = `${currency}${currentUser.wallet.balance.toLocaleString()}`;
    } else {
        walletPaymentSection.classList.add('hidden');
        insufficientFundsMessage.classList.remove('hidden');
        payWithWalletBtn.disabled = true;
        insufficientFundsMessage.textContent = `Insufficient wallet balance to make this payment. Your balance is ${currency}${currentUser.wallet.balance.toLocaleString()}.`;
    }

    paymentGatewayModal.classList.remove('hidden');
}

function handleExpenseReportActions(e: Event) {
    const target = e.target as HTMLButtonElement;
    if (target.matches('[data-merchant]')) {
        const merchant = target.dataset.merchant!;
        const amount = parseFloat(target.dataset.amount!);
        openPaymentGateway(merchant, amount);
    }
    if (target.matches('[data-map-query]')) {
        const query = target.dataset.mapQuery!;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    }
}

function handlePaymentListActions(e: Event) {
     const target = e.target as HTMLButtonElement;
     if (target.matches('[data-payment-index]')) {
        const index = parseInt(target.dataset.paymentIndex!, 10);
        if (currentUser && confirm(`Are you sure you want to cancel the payment to ${currentUser.payments[index].merchant}?`)) {
            currentUser.payments.splice(index, 1);
            saveUserDatabase();
            renderPaymentList();
        }
    }
}

function handleCopyActions(e: Event) {
    const target = e.target as HTMLElement;
    const copyBtn = target.closest('.copy-btn') as HTMLButtonElement;
    if (copyBtn && copyBtn.dataset.copyText) {
        copyToClipboard(copyBtn.dataset.copyText, copyBtn);
    }
}

function handleCreativeSuiteTabs(e: Event) {
    const target = e.target as HTMLElement;
    if (target.matches('.tab-link')) {
        const tabId = target.dataset.tab;
        creativeSuiteContainer.querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
        creativeSuiteContainer.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        target.classList.add('active');
        document.getElementById(tabId!)?.classList.add('active');
    }
}


function openFundWalletModal() {
    fundWalletModal.classList.remove('hidden');
    fundAmountInput.focus();
}

function openTransferModal() {
    transferModal.classList.remove('hidden');
    transferAmountInput.focus();
}

function handleFundWallet(e: Event) {
    e.preventDefault();
    if (!currentUser) return;
    const amount = parseFloat(fundAmountInput.value);
    if (isNaN(amount) || amount <= 0) {
        showStatusMessage(fundWalletStatus, 'Please enter a valid amount.', 'error');
        return;
    }

    let amountToSave = 0;
    const latestBudget = currentUser.budgets.length > 0 ? currentUser.budgets[currentUser.budgets.length - 1] : null;
    if (latestBudget) {
        const savingsAllocation = latestBudget.allocations.find(a => a.category.toLowerCase().includes('savings'));
        if (savingsAllocation && savingsAllocation.percentage > 0) {
            amountToSave = amount * (savingsAllocation.percentage / 100);
        }
    }

    const amountForWallet = amount - amountToSave;
    
    currentUser.wallet.balance += amountForWallet;
    currentUser.wallet.transactions.push({
        id: `fund_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'fund',
        description: 'Wallet Funded',
        amount: amount
    });

    let statusMessage = `Successfully funded your wallet with ${amountForWallet.toLocaleString()}.`;

    if (amountToSave > 0) {
        currentUser.savingsVault += amountToSave;
        currentUser.wallet.transactions.push({
            id: `savings_${Date.now()}`,
            date: new Date().toISOString(),
            type: 'savings',
            description: 'Automatic Transfer to Savings Vault',
            amount: amountToSave
        });
        statusMessage = `Wallet funded. ${amountToSave.toLocaleString()} was automatically moved to your Savings Vault.`;
    }

    showStatusMessage(fundWalletStatus, statusMessage, 'success');
    addFeedItem('achievement', `Wallet funded with ${currentUser.budgets[0]?.summary.currency || '₦'}${amount.toLocaleString()}.`);
    
    saveUserDatabase();
    renderWalletOverview(); // Update display
    renderDashboardSummary();
    fundWalletForm.reset();
    setTimeout(() => {
        fundWalletModal.classList.add('hidden');
        hideStatusMessage(fundWalletStatus);
    }, 2000);
}

function handleDirectTransfer(e: Event) {
    e.preventDefault();
    if (!currentUser) return;
    
    const amount = parseFloat(transferAmountInput.value);
    const recipient = transferRecipientInput.value;

    if (isNaN(amount) || amount <= 0) {
        showStatusMessage(transferStatusArea, 'Please enter a valid amount.', 'error');
        return;
    }
    if (!recipient) {
        showStatusMessage(transferStatusArea, 'Please enter a recipient.', 'error');
        return;
    }
    if (currentUser.wallet.balance < amount) {
        showStatusMessage(transferStatusArea, 'Insufficient wallet balance.', 'error');
        return;
    }

    currentUser.wallet.balance -= amount;
    currentUser.wallet.transactions.push({
        id: `transfer_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'transfer',
        description: `Transfer to ${recipient}`,
        amount: amount
    });
    
    const currency = currentUser.budgets[0]?.summary.currency || '₦';
    addFeedItem('action', `Transferred ${currency}${amount.toLocaleString()} to ${recipient}.`);

    showStatusMessage(transferStatusArea, 'Transfer successful!', 'success');
    saveUserDatabase();
    renderWalletOverview();
    renderDashboardSummary();
    transferForm.reset();

    setTimeout(() => {
        transferModal.classList.add('hidden');
        hideStatusMessage(transferStatusArea);
    }, 2000);
}


function handlePayWithWallet(e: Event) {
    const target = e.target as HTMLButtonElement;
    const amount = parseFloat(target.dataset.amount!);
    const merchant = target.dataset.merchant!;

    if (!currentUser || currentUser.wallet.balance < amount) {
        showStatusMessage(paymentStatus, 'Insufficient funds.', 'error');
        return;
    }

    currentUser.wallet.balance -= amount;
    currentUser.wallet.transactions.push({
        id: `payment_${Date.now()}`,
        date: new Date().toISOString(),
        type: 'payment',
        description: `Payment to ${merchant}`,
        amount: amount,
    });
    
    const currency = currentUser.budgets[0]?.summary.currency || '₦';
    addFeedItem('action', `Paid ${currency}${amount.toLocaleString()} to ${merchant} from your wallet.`);
    
    showStatusMessage(paymentStatus, 'Payment successful!', 'success');
    saveUserDatabase();
    renderWalletOverview(); // update balance display
    renderDashboardSummary();

    setTimeout(() => {
        paymentGatewayModal.classList.add('hidden');
        hideStatusMessage(paymentStatus);
    }, 2000);
}


function handlePayWithPaystack(e: Event) {
    if (!ensureConfigured('paystack') || !currentUser) {
        showStatusMessage(paymentStatus, 'Payment processor is not configured.', 'error');
        return;
    }
    const target = e.target as HTMLButtonElement;
    const amountInKobo = parseFloat(target.dataset.amount!);
    const merchant = target.dataset.merchant!;
    const frequency = paymentFrequencySelect.value;
    
    // Paystack checkout logic
    const handler = (window as any).PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: currentUser.email,
        amount: amountInKobo,
        currency: 'NGN', // Or get from budget
        ref: 'cravour_' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            merchant: merchant,
            frequency: frequency
        },
        onClose: function() {
            showStatusMessage(paymentStatus, 'Payment window closed.', 'info');
        },
        callback: function(response: any) {
            // Here you would typically verify the transaction on your backend
            console.log('Paystack response:', response);
            if (currentUser) {
                 currentUser.payments.push({
                    merchant: merchant,
                    amount: amountInKobo / 100,
                    frequency: frequency
                });
                saveUserDatabase();
                renderPaymentList();
                showStatusMessage(paymentStatus, 'Payment scheduled successfully via Paystack!', 'success');
                setTimeout(() => {
                    paymentGatewayModal.classList.add('hidden');
                    hideStatusMessage(paymentStatus);
                }, 2000);
            }
        }
    });
    handler.openIframe();
}


function handleDeleteActions(e: Event) {
    const target = e.target as HTMLButtonElement;
    const budgetIndex = target.dataset.budgetIndex;
    const creativeIndex = target.dataset.creativeIndex;
    const merchantName = target.dataset.merchantDeleteName;

    if (currentUser) {
        if (budgetIndex) {
            if (confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
                currentUser.budgets.splice(parseInt(budgetIndex, 10), 1);
                saveUserDatabase();
                renderBudgetHistory();
            }
        }
        if (creativeIndex) {
             if (confirm('Are you sure you want to delete this ad set?')) {
                currentUser.creativeCopies.splice(parseInt(creativeIndex, 10), 1);
                saveUserDatabase();
                renderSavedAdCopyLibrary();
            }
        }
        if(merchantName) {
            if (confirm(`Are you sure you want to delete the merchant "${merchantName}"?`)) {
                currentUser.merchants = currentUser.merchants.filter(m => m.name !== merchantName);
                saveUserDatabase();
                renderAllMerchantsList();
            }
        }
    }
}

function handleOpportunitiesActions(e: Event) {
    const target = e.target as HTMLButtonElement;
    const actionType = target.dataset.actionType;
    const actionTarget = target.dataset.actionTarget;

    if (actionType === 'navigate' && actionTarget) {
        navigateToView(actionTarget as AppView);
    } else if (actionType === 'invest' && actionTarget && currentUser) {
        const oppIndex = parseInt(target.dataset.opportunityIndex!, 10);
        const latestOpportunities = currentUser.opportunities[currentUser.opportunities.length - 1];
        currentInvestmentOpportunity = latestOpportunities.opportunities[oppIndex];
        
        investmentOpportunityTitle.textContent = currentInvestmentOpportunity.title;
        maxInvestmentAmount.textContent = `Available in Savings Vault: ${currentUser.budgets[0]?.summary.currency || '₦'}${currentUser.savingsVault.toLocaleString()}`;
        investmentAmountInput.max = String(currentUser.savingsVault);
        investmentSimulatorModal.classList.remove('hidden');
    }
}

function handleInvestmentSimulation(e: Event) {
    e.preventDefault();
    if (!currentUser || !currentInvestmentOpportunity) return;
    
    const amount = parseFloat(investmentAmountInput.value);
    
    if (isNaN(amount) || amount <= 0) {
        showStatusMessage(investmentSimulatorStatus, "Please enter a valid amount.", 'error');
        return;
    }
    if (amount > currentUser.savingsVault) {
        showStatusMessage(investmentSimulatorStatus, "Investment amount cannot exceed savings vault balance.", 'error');
        return;
    }

    currentUser.savingsVault -= amount;
    currentUser.investments.push({
        id: `inv_${Date.now()}`,
        date: new Date().toISOString(),
        name: currentInvestmentOpportunity.title,
        amount: amount,
    });
    
    const currency = currentUser.budgets[0]?.summary.currency || '₦';
    addFeedItem('achievement', `You've invested ${currency}${amount.toLocaleString()} in "${currentInvestmentOpportunity.title}".`);
    
    showStatusMessage(investmentSimulatorStatus, "Investment successful! Your portfolio has been updated.", 'success');
    saveUserDatabase();
    renderInvestments();
    renderWalletOverview();

    setTimeout(() => {
        investmentSimulatorModal.classList.add('hidden');
        investmentSimulatorForm.reset();
        hideStatusMessage(investmentSimulatorStatus);
    }, 2000);
}

function handleLiquidateInvestment(e: Event) {
    const target = e.target as HTMLElement;
    const investmentId = (target.closest('[data-investment-id]') as HTMLElement)?.dataset.investmentId;

    if (!currentUser || !investmentId) return;
    
    const investmentIndex = currentUser.investments.findIndex(inv => inv.id === investmentId);
    if (investmentIndex === -1) return;

    if (confirm("Are you sure you want to liquidate this investment? The funds will be returned to your wallet.")) {
        const [liquidatedInvestment] = currentUser.investments.splice(investmentIndex, 1);
        
        currentUser.wallet.balance += liquidatedInvestment.amount;
        currentUser.wallet.transactions.push({
            id: `liq_${Date.now()}`,
            date: new Date().toISOString(),
            type: 'liquidation',
            description: `Liquidation of ${liquidatedInvestment.name}`,
            amount: liquidatedInvestment.amount
        });
        
        const currency = currentUser.budgets[0]?.summary.currency || '₦';
        addFeedItem('action', `Investment liquidated. ${currency}${liquidatedInvestment.amount.toLocaleString()} returned to wallet.`);

        saveUserDatabase();
        renderInvestments();
        renderWalletOverview();
    }
}


async function handleContactFormSubmit(e: Event) {
    e.preventDefault();
    showStatusMessage(contactFormMessage, 'Sending your message...', 'info', true);
    
    // This is a simulation
    setTimeout(() => {
        showStatusMessage(contactFormMessage, 'Message sent successfully! We will get back to you shortly.', 'success');
        contactForm.reset();
        hideStatusMessage(contactFormMessage, 5000);
    }, 1500);
}


function handleThemeToggle() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, currentTheme);
    document.body.dataset.theme = currentTheme;
    updateThemeToggleIcons();
}

function updateThemeToggleIcons() {
    const icon = currentTheme === 'light' ? icons.moon : icons.sun;
    const label = `Toggle to ${currentTheme === 'light' ? 'dark' : 'light'} theme`;
    if(themeToggleHeaderBtn) {
        themeToggleHeaderBtn.innerHTML = icon;
        themeToggleHeaderBtn.ariaLabel = label;
    }
    if(themeToggleSidebarBtn) {
        themeToggleSidebarBtn.innerHTML = icon;
        themeToggleSidebarBtn.ariaLabel = label;
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.body.dataset.theme = currentTheme;
    updateThemeToggleIcons();
}


function handleAddMerchant(e: Event) {
    e.preventDefault();
    if (!currentUser) return;

    const name = newMerchantNameInput.value;
    const category = newMerchantCategoryInput.value;

    if (!name || !category) {
        showStatusMessage(addMerchantStatus, 'Please fill in both fields.', 'error');
        return;
    }
    
    const existing = currentUser.merchants.find(m => m.name.toLowerCase() === name.toLowerCase());
    if (existing) {
        showStatusMessage(addMerchantStatus, `Merchant "${name}" already exists.`, 'error');
        return;
    }
    
    currentUser.merchants.push({ name, category });
    saveUserDatabase();
    
    showStatusMessage(addMerchantStatus, `Merchant "${name}" added successfully.`, 'success');
    addMerchantForm.reset();
    renderAllMerchantsList(); // Refresh the list
    hideStatusMessage(addMerchantStatus, 3000);
}

function handleShowMerchantHistory(e: Event) {
    const target = e.target as HTMLElement;
    const merchantItem = target.closest('.merchant-item') as HTMLElement;
    if (!merchantItem || !currentUser) return;

    const merchantName = merchantItem.dataset.merchantName;
    const transactions = currentUser.wallet.transactions.filter(t => t.description.includes(merchantName!));

    merchantHistoryName.textContent = merchantName!;
    
    if (transactions.length === 0) {
        merchantHistoryList.innerHTML = `<div class="empty-state">No transaction history for this merchant in your wallet.</div>`;
    } else {
        const currency = currentUser.budgets[0]?.summary.currency || '₦';
        const historyHtml = transactions.map(t => `
             <div class="history-item">
                <p>${t.description}</p>
                <p class="amount error">${currency}${t.amount.toLocaleString()}</p>
             </div>
        `).join('');
        merchantHistoryList.innerHTML = historyHtml;
    }

    merchantHistoryModal.classList.remove('hidden');
}

function handleShowVarianceDetails(e: Event) {
    const target = e.target as HTMLElement;
    const row = target.closest('.variance-row') as HTMLElement;
    if (!row || !currentUser) return;
    
    const category = row.dataset.category!;
    const allMatchingExpenses = currentUser.expenses
        .flatMap(report => report.categorizedExpenses)
        .filter(expense => expense.category === category);

    varianceCategoryName.textContent = category;
    
    if (allMatchingExpenses.length === 0) {
        varianceDetailsList.innerHTML = `<div class="empty-state">No specific expenses found for this category in your latest report.</div>`;
    } else {
        const currency = currentUser.budgets[0]?.summary.currency || '₦';
        const detailsHtml = allMatchingExpenses.map(exp => `
            <div class="history-item">
                <p>${exp.merchantBrandExample || exp.merchantCategory}</p>
                <p class="amount error">${currency}${exp.amount.toLocaleString()}</p>
            </div>
        `).join('');
        varianceDetailsList.innerHTML = detailsHtml;
    }

    varianceDetailsModal.classList.remove('hidden');
}


// --- Main Initialization ---
function init() {
    if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
    
    initTheme();

    // Configure services
    if (API_KEY) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
        isAiConfigured = true;
    } else {
        console.warn("API_KEY environment variable not set. AI features will be disabled.");
        document.getElementById('config-error-banner')?.classList.remove('hidden');
    }
    
    if (PAYSTACK_PUBLIC_KEY) {
        isPaystackConfigured = true;
    } else {
        console.warn("PAYSTACK_PUBLIC_KEY environment variable not set. Paystack features will be disabled.");
        document.getElementById('config-error-banner')?.classList.remove('hidden');
    }

    // Load data from localStorage
    userDatabase = loadUserDatabase();
    const loggedInEmail = loadCurrentLoggedInUser();
    if (loggedInEmail && userDatabase.has(loggedInEmail)) {
        currentUser = userDatabase.get(loggedInEmail)!;
        initializeDashboard();
    }
    renderAppView();

    // --- EVENT LISTENERS ---

    // Global Click Handler
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        
        // Mobile menu toggles
        if (target.closest('#landingHamburger')) { handleLandingNavToggle(); }
        if (target.closest('#sidebarHamburger')) { handleSidebarToggle(); }
        if (target.closest('#app-overlay')) { handleSidebarToggle(); }
        
        // Navigation
        if (target.closest('#sidebar-menu a')) { e.preventDefault(); navigateToView(target.closest('a')!.dataset.view as AppView); }
        if (target.matches('.overview-card[data-view]')) { navigateToView(target.dataset.view as AppView); }
        if (target.matches('.getting-started-item[data-view]')) { navigateToView(target.dataset.view as AppView); }
        if (target.matches('.getting-started-item[data-action="fund-wallet"]')) { openFundWalletModal(); }

        // Auth form toggles on landing page
        if (target === showRegisterBtn) { switchAuthView(true); }
        if (target === showLoginBtn) { switchAuthView(false); }
        if (target === headerLoginLink) { switchAuthView(false); }
        if (target === headerSignUpLink) { switchAuthView(true); }

        // Wallet view tabs & modals
        if (target.closest('#wallet-tabs')) { handleWalletTabs(e); }
        if (target === fundWalletBtn) { openFundWalletModal(); }
        if (target === transferMoneyBtn) { openTransferModal(); }
        
        // Creative Suite Tabs
        if(target.closest('.creative-suite-tabs')) { handleCreativeSuiteTabs(e); }

        // Modal close buttons
        if (target.matches('.modal-close-btn')) { target.closest('.modal-backdrop')?.classList.add('hidden'); }

        // Action handlers
        handleExpenseReportActions(e);
        handlePaymentListActions(e);
        handleCopyActions(e);
        handleDeleteActions(e);
        handleOpportunitiesActions(e);
        handleLiquidateInvestment(e);

        // Merchant History
        if (target.closest('.merchant-item .clickable-area')) { handleShowMerchantHistory(e); }
        
        // Variance Details
        if(target.closest('.variance-row')) { handleShowVarianceDetails(e); }
        
        // Logout
        if (target === logoutBtn) { handleLogout(); }
    });

    // Form Submissions
    if(loginForm) loginForm.addEventListener('submit', handleLogin);
    if(registerForm) registerForm.addEventListener('submit', handleRegister);
    if(demoForm) demoForm.addEventListener('submit', handleGenerateDemoPlan);
    if(budgetPlannerForm) budgetPlannerForm.addEventListener('submit', handleGenerateBudgetPlan);
    if(expenseAnalyzerForm) expenseAnalyzerForm.addEventListener('submit', handleAnalyzeExpenses);
    if(creativeSuiteFormDashboard) creativeSuiteFormDashboard.addEventListener('submit', handleGenerateCreativeCopyDashboard);
    if(contactForm) contactForm.addEventListener('submit', handleContactFormSubmit);
    if(fundWalletForm) fundWalletForm.addEventListener('submit', handleFundWallet);
    if(transferForm) transferForm.addEventListener('submit', handleDirectTransfer);
    if(addMerchantForm) addMerchantForm.addEventListener('submit', handleAddMerchant);
    if(investmentSimulatorForm) investmentSimulatorForm.addEventListener('submit', handleInvestmentSimulation);


    // Button Clicks
    if(generateReviewBtn) generateReviewBtn.addEventListener('click', handleGenerateReview);
    if(generateOpportunitiesBtn) generateOpportunitiesBtn.addEventListener('click', handleGenerateOpportunities);
    if(deleteOpportunitiesBtn) deleteOpportunitiesBtn.addEventListener('click', () => {
        if(currentUser && confirm("Are you sure you want to delete the latest opportunities report?")) {
            currentUser.opportunities.pop();
            saveUserDatabase();
            renderSavedOpportunities();
        }
    });
    if(generateBriefingBtn) generateBriefingBtn.addEventListener('click', handleGenerateBriefing);
    if(payWithWalletBtn) payWithWalletBtn.addEventListener('click', handlePayWithWallet);
    if(payWithPaystackBtn) payWithPaystackBtn.addEventListener('click', handlePayWithPaystack);

    // Theme Toggles
    if(themeToggleHeaderBtn) themeToggleHeaderBtn.addEventListener('click', handleThemeToggle);
    if(themeToggleSidebarBtn) themeToggleSidebarBtn.addEventListener('click', handleThemeToggle);

    // Expense Period Selector
    if(expensePeriodSelector) {
        expensePeriodSelector.addEventListener('click', (e) => {
            const target = e.target as HTMLButtonElement;
            if (target.matches('.segmented-control-item')) {
                expensePeriodSelector.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
                target.classList.add('active');
                customDateRangeContainer.classList.toggle('hidden', target.dataset.period !== 'custom');
            }
        });
    }

    console.log("Cravour App Initialized");
}

init();
