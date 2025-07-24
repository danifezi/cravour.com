
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// --- Type Definitions ---
interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
}

interface ChatHistoryItem {
    id: number;
    title: string;
    chat: Chat;
    messages: ChatMessage[];
}

interface Pot {
    id: number;
    name: string;
    amount: number;
    icon: string;
}

interface Goal {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string; // YYYY-MM-DD format
    icon: string;
}

interface Budget {
    id: number;
    name: string;
    amount: number;
    spent: number; // Amount spent in this budget category
    icon: string;
}

interface Transaction {
    id: number;
    description: string;
    amount: number;
    date: string; // YYYY-MM-DD
    budgetId: number;
    sourceAccountId?: string; // ID of the linked account or 'recurring'
}

interface RecurringTransaction {
    id: number;
    description: string;
    amount: number;
    budgetId: number;
    frequency: 'weekly' | 'monthly';
    startDate: string; // YYYY-MM-DD
    nextDueDate: string; // YYYY-MM-DD
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    merchant: string;
    imageUrl: string;
}

interface LinkedAccount {
    id: string;
    name: string;
    maskedAccountNumber: string;
    bankIcon: string;
    isSyncing: boolean;
    lastSync: Date | null;
}

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface FinancialHealthResult {
    score: number;
    summary: string;
    positives: string[];
    improvements: string[];
}


// --- SVG Icons ---
const icons = {
    logo: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 7L12 12L22 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    dashboard: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06l-.53-.53V20.25a.75.75 0 01-.75.75H5.75a.75.75 0 01-.75-.75V13.06l-.53.53a.75.75 0 01-1.06-1.06l8.69-8.69z" /><path d="M12 5.432l8.159 8.159c.026.026.05.054.07.084v-4.832a.75.75 0 00-.75-.75H15a.75.75 0 00-.75.75v2.25a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75V10.5a.75.75 0 00-.75-.75H7.5a.75.75 0 00-.75.75v4.832c.02-.03.044-.058.07-.084L12 5.432z" /></svg>`,
    coPilot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Zm-2.39.264a.75.75 0 0 0 1.06 1.06l2.122-2.12a.75.75 0 0 0-1.061-1.061L5.11 12.264Zm13.84-.001a.75.75 0 0 0-1.06-1.06l-2.123 2.12a.75.75 0 0 0 1.061 1.061l2.122-2.12ZM12 7.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V8.25A.75.75 0 0 1 12 7.5ZM5.11 7.236a.75.75 0 0 0-1.06 1.06l2.122 2.122a.75.75 0 1 0 1.06-1.06L5.11 7.236Zm13.84-.001a.75.75 0 1 0-1.06-1.06l-2.122 2.122a.75.75 0 0 0 1.06 1.06l2.122-2.122ZM12 16.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z"/></svg>`,
    pots: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm5.25 2.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm1.5 0a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm3 0a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm1.5 0a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm-6 3a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm1.5 0a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm3 0a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm1.5 0a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm-6 3a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm1.5 0a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm3 0a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zm1.5 0a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75z" clip-rule="evenodd" /></svg>`,
    budgets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.925 5.512a2.25 2.25 0 0 0-2.175-1.762H5.25a2.25 2.25 0 0 0-2.175 1.762l-1.313 7.875A2.25 2.25 0 0 0 3.938 16h16.125a2.25 2.25 0 0 0 2.175-2.613l-1.313-7.875ZM5.25 5.25h13.5c.31 0 .59.167.737.438l1.313 7.875a.75.75 0 0 1-.725.887H3.938a.75.75 0 0 1-.725-.887l1.313-7.875A.75.75 0 0 1 5.25 5.25Z"/><path d="M10 10.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z M18 8.625a.75.75 0 0 0-1.5 0V11a.75.75 0 0 0 1.5 0V8.625Z"/><path d="M4.5 17.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z"/></svg>`,
    marketplace: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Z" clip-rule="evenodd" /></svg>`,
    goals: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>`,
    transactions: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V3.375c0-1.036-.84-1.875-1.875-1.875H5.625zM12.75 6a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V6z" /><path d="M7.5 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm.75 3.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" /></svg>`,
    reports: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.75 2.25H5.25A2.25 2.25 0 003 4.5v15A2.25 2.25 0 005.25 21.75h13.5A2.25 2.25 0 0021 19.5v-15A2.25 2.25 0 0018.75 2.25zM9 17.25a.75.75 0 01-1.5 0V12a.75.75 0 011.5 0v5.25zM12.75 17.25a.75.75 0 01-1.5 0V8.25a.75.75 0 011.5 0v9zM16.5 17.25a.75.75 0 01-1.5 0V14.25a.75.75 0 011.5 0v3z" /></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.401 3.003c1.155.043 2.252.32 3.221.794l.348.165c.25.119.512.217.784.288l.386.102a.75.75 0 0 1 .568.904l-.19 1.05a6.75 6.75 0 0 1 2.218 2.218l1.05-.19a.75.75 0 0 1 .904.568l.102.386c.07.272.169.534.288.784l.165.348c.474.969.751 2.066.794 3.221l.015.426c-.043 1.155-.32 2.252-.794 3.221l-.165.348a6.752 6.752 0 0 1-.288.784l-.102.386a.75.75 0 0 1-.904.568l-1.05-.19a6.75 6.75 0 0 1-2.218 2.218l.19 1.05a.75.75 0 0 1-.568.904l-.386.102a6.752 6.752 0 0 1-.784-.288l-.348-.165c-.969.474-2.066.751-3.221.794l-.426.015c-1.155-.043-2.252-.32-3.221-.794l-.348-.165a6.752 6.752 0 0 1-.784-.288l-.386-.102a.75.75 0 0 1-.568-.904l.19-1.05a6.75 6.75 0 0 1-2.218-2.218l-1.05.19a.75.75 0 0 1-.904-.568l-.102-.386a6.752 6.752 0 0 1-.288-.784l-.165-.348c-.474-.969-.751-2.066-.794-3.221l-.015-.426c.043-1.155.32-2.252.794-3.221l.165-.348a6.752 6.752 0 0 1 .288-.784l.102-.386a.75.75 0 0 1 .904.568l1.05.19a6.75 6.75 0 0 1 2.218-2.218l-.19-1.05a.75.75 0 0 1 .568-.904l.386.102c.272-.07.534-.169.784-.288l.348-.165c.969-.474 2.066-.751 3.221-.794l.426-.015ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clip-rule="evenodd" /></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9A.75.75 0 0 1 15 9V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5A.75.75 0 0112 3.75z" clip-rule="evenodd" /></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 01-.749.658h-7.5a.75.75 0 01-.749-.658L5.165 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.347-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.346-9z" clip-rule="evenodd" /></svg>`,
    chat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.382.75.75 0 00-.676.65L15 21.75H9a.75.75 0 00-.676-.65 48.901 48.901 0 01-3.476-.382c-1.978-.292-3.348-2.024-3.348-3.97V6.74c0-1.946 1.37-3.678 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clip-rule="evenodd" /></svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a.75.75 0 00-.22 1.06l.47 1.03a.75.75 0 001.06.22l12.15-12.15z" /><path d="M5.005 22.445a.75.75 0 00.925-.086l.345-.345-3.712-3.712-.345.345a.75.75 0 00-.086.925l1.03 2.473a.75.75 0 00.865.51l2.473-1.03z" /></svg>`,
    arrowPath: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M15.312 11.468a.75.75 0 01.058 1.06l-4.5 4.5a.75.75 0 01-1.118-1.004l3.43-3.43-3.43-3.43a.75.75 0 011.004-1.118l4.5 4.5a.75.75 0 01.058 1.06z" clip-rule="evenodd" /></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd" /></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM5.25 6.75c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h13.5c.621 0 1.125-.504 1.125-1.125V7.875c0-.621-.504-1.125-1.125-1.125H5.25z" clip-rule="evenodd" /><path d="M10.06 12.19a.75.75 0 00-1.06 1.06l.72.72a.75.75 0 101.06-1.06l-.72-.72zm2.12-.72a.75.75 0 10-1.06 1.06l.72.72a.75.75 0 101.06-1.06l-.72-.72zM12.25 15a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V15.75a.75.75 0 01.75-.75zm3.75-1.5a.75.75 0 00-1.06 1.06l.72.72a.75.75 0 101.06-1.06l-.72-.72zM8.5 15.75a.75.75 0 00-1.5 0v.008a.75.75 0 001.5 0V15.75z" /></svg>`,
    bank: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.75 2.25a.75.75 0 0 0-1.5 0v2.25H9.75a.75.75 0 0 0 0 1.5h1.5V15H4.125C3.504 15 3 15.504 3 16.125V18a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-1.875c0-.621-.504-1.125-1.125-1.125H12.75V6h1.5a.75.75 0 0 0 0-1.5H12.75V2.25z" /><path d="M12.75 16.5a.75.75 0 0 0-1.5 0v.065a.75.75 0 0 0 1.5 0v-.065z" /></svg>`,
    kuda: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="8" fill="#40196D"/><path d="M24.79 33V22.64L32.2 15H27.52L21.43 22.07V15H17V33H21.43V23.78L28.18 33H33L24.79 22.64V33H24.79Z" fill="white"/></svg>`,
    access: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 12C21.5 7.52166 18.2393 3.91683 14.15 3.55749L12.25 8.49999H18.5C18.281 10.0417 17.5815 11.4167 16.55 12.4475L21.5 12ZM9.85001 3.55749C5.76075 3.91683 2.5 7.52166 2.5 12C2.5 16.4783 5.76075 20.0832 9.85001 20.4425L11.75 15.5H5.5C5.719 13.9583 6.41851 12.5833 7.45001 11.5525L9.85001 3.55749Z" fill="#F37021"/></svg>`,
    gtbank: `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h512v512H0z" fill="#f78536"/><path d="M128 128h256v256H128z" fill="#fff"/><path d="M160 160h192v192H160z" fill="#f78536"/><path d="M128 128h128v128H128z" fill="#fff"/></svg>`,
    sync: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-4.5a.75.75 0 000 1.5h6a.75.75 0 00.75-.75v-6a.75.75 0 00-1.5 0v4.514l-1.651-1.652a9 9 0 10-1.42 12.13l-1.5-1.5a7.5 7.5 0 01-1.06-11.135z" clip-rule="evenodd" /></svg>`,
    sparkle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9,11.3,7.6,12.7,9,14.1,10.4,12.7ZM5,3,4,5.5,1.5,6.5,4,7.5,5,10,6,7.5,8.5,6.5,6,5.5ZM9,3,7.6,4.4,9,5.8,10.4,4.4ZM19,3l-1,2.5-2.5,1,2.5,1,1,2.5,1-2.5,2.5-1-2.5-1ZM14.4,9.6,13,11,14.4,12.4,15.8,11ZM18,10l1,2.5,2.5,1-2.5,1-1,2.5-1-2.5-2.5-1,2.5-1Z" clip-rule="evenodd"/></svg>`,
    checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06l-3.894 3.893-1.48-1.48a.75.75 0 10-1.06 1.061l2.014 2.015a.75.75 0 001.06 0l4.42-4.42z" clip-rule="evenodd" /></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.401 3.003c1.155.043 2.252.32 3.221.794l.348.165c.25.119.512.217.784.288l.386.102a.75.75 0 0 1 .568.904l-.19 1.05a6.75 6.75 0 0 1 2.218 2.218l1.05-.19a.75.75 0 0 1 .904.568l.102.386c.07.272.169.534.288.784l.165.348c.474.969.751 2.066.794 3.221l.015.426c-.043 1.155-.32 2.252-.794 3.221l-.165.348a6.752 6.752 0 0 1-.288.784l-.102.386a.75.75 0 0 1-.904.568l-1.05-.19a6.75 6.75 0 0 1-2.218 2.218l.19 1.05a.75.75 0 0 1-.568.904l-.386.102a6.752 6.752 0 0 1-.784-.288l-.348-.165c-.969.474-2.066.751-3.221.794l-.426.015c-1.155-.043-2.252-.32-3.221-.794l-.348-.165a6.752 6.752 0 0 1-.784-.288l-.386-.102a.75.75 0 0 1-.568-.904l.19-1.05a6.75 6.75 0 0 1-2.218-2.218l-1.05.19a.75.75 0 0 1-.904-.568l-.102-.386a6.752 6.752 0 0 1-.288-.784l-.165-.348c-.474-.969-.751-2.066-.794-3.221l-.015-.426c.043-1.155.32-2.252.794-3.221l.165-.348a6.752 6.752 0 0 1 .288-.784l.102-.386a.75.75 0 0 1 .904.568l1.05.19a6.75 6.75 0 0 1 2.218-2.218l-.19-1.05a.75.75 0 0 1 .568-.904l.386.102c.272-.07.534-.169.784-.288l.348-.165c.969-.474 2.066-.751 3.221-.794l.426-.015zm-.25 10.5a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0v-3zM12 8.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75z" clip-rule="evenodd" /></svg>`,
};

// --- App State ---
let state = {
    // Auth & Global
    isLoggedIn: false,
    currentView: 'dashboard',
    theme: 'dark',
    // UI State
    isSidebarCollapsed: false,
    isSidebarOpen: false, // For mobile
    isSubmitting: false,
    isLoading: true,
    toasts: [] as Toast[],
    isMerchantModalOpen: false,
    // Data
    walletBalance: 0,
    isFundWalletModalOpen: false,
    // Co-Pilot AI
    ai: null as GoogleGenAI | null,
    chats: [] as ChatHistoryItem[],
    activeChatId: null as number | null,
    isAiThinking: false,
    // Dashboard
    isHealthCheckLoading: false,
    financialHealthResult: null as FinancialHealthResult | null,
    // Pots
    pots: [] as Pot[],
    isPotModalOpen: false,
    editingPotId: null as number | null,
    isPotFundModalOpen: false,
    isPotWithdrawModalOpen: false,
    potActionTargetId: null as number | null, // Used for both funding and withdrawing
    // Goals
    goals: [] as Goal[],
    isGoalModalOpen: false,
    editingGoalId: null as number | null,
    isContributionModalOpen: false,
    contributingToGoalId: null as number | null,
    // Budgets
    budgets: [] as Budget[],
    isBudgetModalOpen: false,
    editingBudgetId: null as number | null,
    // Transactions
    transactions: [] as Transaction[],
    isTransactionModalOpen: false,
    editingTransactionId: null as number | null,
    isAiSuggestingCategory: false,
    // Recurring Transactions
    recurringTransactions: [] as RecurringTransaction[],
    isRecurringTransactionModalOpen: false,
    editingRecurringTransactionId: null as number | null,
    // Marketplace
    marketplaceProducts: [] as Product[],
    isMarketplaceLoading: false,
    marketplaceInitialLoad: true,
    marketplaceSearchQuery: '',
    // Linked Accounts
    linkedAccounts: [] as LinkedAccount[],
    isLinkingAccount: false,
};

// --- System Prompt ---
const getSystemInstruction = () => `You are Cravour, a friendly and expert AI financial assistant for people living in Nigeria.
Your goal is to provide insightful, actionable, and encouraging financial advice.
You must always respond in markdown format.
Your personality is: Knowledgeable, a bit witty, and very supportive.
Your responses should be tailored to the Nigerian context, using Naira (₦) as the currency.
When giving advice, be specific and practical.
The user's current wallet balance is ${formatCurrency(state.walletBalance)}. Be mindful of this when making suggestions.
The current date is ${new Date().toLocaleDateString()}.
You can now manage goals, budgets, and transactions for the user. Users can create, update, and contribute to their financial goals, set budgets for spending categories, and log transactions.
When a user asks about their goals or budgets, use their current data to provide encouragement or advice.
User's Goals: ${JSON.stringify(state.goals.map(g => ({ name: g.name, progress: `${g.currentAmount}/${g.targetAmount}`})))}
User's Budgets: ${JSON.stringify(state.budgets.map(b => ({name: b.name, budget: b.amount, spent: b.spent})))}
When a user asks about their spending, use their transaction history to give specific answers (e.g., 'how much did I spend on food this month?').
User's recent transactions: ${JSON.stringify(state.transactions.slice(0, 10).map(t => ({description: t.description, amount: t.amount, date: t.date, budget: state.budgets.find(b=>b.id===t.budgetId)?.name})))}

If you suggest a product, format it as a "recommendation card".
If you suggest a savings plan or financial journey, format it as a "trip plan".

**Recommendation Card Format:**
<div class="recommendation-card-container">
    <div class="recommendation-card" style="background-image: url('IMAGE_URL');">
        <div class="recommendation-card-content">
            <div class="recommendation-card-header">
                <h4 class="product-name">PRODUCT_NAME</h4>
                <p class="merchant-name">MERCHANT_NAME</p>
            </div>
            <div class="recommendation-card-footer">
                <span class="price">₦PRICE</span>
                <span class="affordability-tag AFFORDABILITY_CLASS">AFFORDABILITY_TEXT</span>
            </div>
        </div>
    </div>
</div>
Replace IMAGE_URL, PRODUCT_NAME, MERCHANT_NAME, PRICE, AFFORDABILITY_CLASS ('affordable' or 'expensive'), and AFFORDABILITY_TEXT.

**Trip Plan Format:**
<div class="trip-plan-card">
    <div class="trip-plan-header">
        <h4 class="trip-plan-summary FEASIBILITY_CLASS">TRIP_SUMMARY</h4>
        <p>A step-by-step plan to achieve your financial goal.</p>
    </div>
    <ul class="trip-plan-steps">
        <!-- Repeat for each step -->
        <li class="trip-plan-step">
            <div class="trip-step-icon">STEP_ICON_SVG</div>
            <div class="trip-step-details">
                <span class="trip-step-name">STEP_NAME</span>
                <span class="trip-step-cost">₦COST</span>
            </div>
        </li>
    </ul>
    <div class="trip-plan-footer">
        <strong>Total Cost</strong>
        <strong>₦TOTAL_COST</strong>
    </div>
</div>
Replace FEASIBILITY_CLASS ('feasible' or 'infeasible'), TRIP_SUMMARY, STEP_ICON_SVG, STEP_NAME, COST, and TOTAL_COST.
`;

// --- Utility Functions ---
const $ = (selector: string) => document.querySelector(selector);
const $$ = (selector: string) => document.querySelectorAll(selector);
const escapeHTML = (str: string) => DOMPurify.sanitize(str);

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
};

const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
};


// --- UI Rendering ---
const render = () => {
    console.log("Rendering with state:", state);
    const body = document.body;

    // Set auth state attribute
    body.dataset.authState = state.isLoggedIn ? 'logged-in' : 'logged-out';

    // Set theme attribute
    body.dataset.theme = state.theme;

    // Set sidebar state attributes
    body.dataset.menuOpen = String(state.isSidebarOpen);
    $('#app-dashboard')?.querySelector('.sidebar')?.classList.toggle('collapsed', state.isSidebarCollapsed);
    $('#app-dashboard')?.querySelector('.sidebar')?.classList.toggle('open', state.isSidebarOpen);


    // Render main content
    if (state.isLoggedIn) {
        renderAppDashboard();
    } else {
        renderLandingPage();
    }
    
    // Render Modals
    renderGoalModal();
    renderGoalContributionModal();
    renderBudgetModal();
    renderTransactionModal();
    renderRecurringTransactionModal();
    renderFundWalletModal();
    renderPotModal();
    renderPotActionModal();
    renderMerchantInquiryModal();
    
    // Render Toasts
    renderToasts();

    // Hide loader
    if (state.isLoading) {
        $('#app-loader')?.classList.remove('hidden');
    } else {
        $('#app-loader')?.classList.add('hidden');
    }
};

const renderLandingPage = () => {
    const dashboard = $('#app-dashboard');
    if(dashboard) dashboard.innerHTML = '';

    const heroChatContainer = $('.skeleton-chat');
    if (heroChatContainer) {
        heroChatContainer.innerHTML = `
            <div class="chat-messages" style="padding-top: 50px;">
                <div class="message ai-message" style="width: 80%;">How can I improve my savings culture?</div>
                <div class="message user-message" style="width: 60%;">That's a great goal!</div>
                <div class="message ai-message" style="width: 90%;">Let's create a personalized budget for you. What's your monthly income?</div>
            </div>
            <div class="chat-form" style="padding: 15px;">
                 <input type="text" class="input-field" placeholder="Try it yourself..." disabled>
                 <button class="btn btn-primary" disabled>${icons.send}</button>
            </div>
        `;
    }
};

const renderAppDashboard = () => {
    const dashboard = $('#app-dashboard');
    if (!dashboard) return;

    const navItems = [
        { id: 'dashboard', name: 'Dashboard', icon: icons.dashboard },
        { id: 'co-pilot', name: 'AI Co-Pilot', icon: icons.coPilot },
        { id: 'transactions', name: 'Transactions', icon: icons.transactions },
        { id: 'budgets', name: 'Budgets', icon: icons.budgets },
        { id: 'pots', name: 'Pots', icon: icons.pots },
        { id: 'goals', name: 'Goals', icon: icons.goals },
        { id: 'marketplace', name: 'Marketplace', icon: icons.marketplace },
        { id: 'reports', name: 'Reports', icon: icons.reports },
    ];

    const viewTitles: { [key: string]: string } = {
        ...Object.fromEntries(navItems.map(item => [item.id, item.name])),
        'settings': 'Settings',
    };

    const sidebarNavContent = `
        <ul class="nav-list">
            ${navItems.map(item => `
                <li>
                    <a href="#" class="nav-link ${state.currentView === item.id ? 'active' : ''}" data-action="navigate" data-view="${item.id}">
                        <span class="btn-icon">${item.icon}</span>
                        <span class="nav-link-text">${item.name}</span>
                    </a>
                </li>
            `).join('')}
        </ul>
    `;

    const sidebarChatHistoryContent = state.currentView === 'co-pilot' ? `
        <div class="sidebar-chat-history">
            <div class="sidebar-view-header">
                <button class="btn btn-primary" data-action="start-new-chat" style="width: 100%;">
                    <span class="btn-icon">${icons.plus}</span> New Chat
                </button>
            </div>
            <h4 class="sidebar-list-title">Recent Chats</h4>
            <ul class="nav-list">
                ${state.chats.length > 0 ? state.chats.map(chat => `
                    <li class="chat-history-item ${state.activeChatId === chat.id ? 'active' : ''}">
                        <button class="chat-history-link" data-action="set-active-chat" data-id="${chat.id}">
                            <span class="btn-icon">${icons.chat}</span>
                            <span class="nav-link-text">${escapeHTML(chat.title)}</span>
                        </button>
                        <button class="icon-btn delete-btn" data-action="delete-chat" data-id="${chat.id}" aria-label="Delete chat">
                            <span class="btn-icon">${icons.trash}</span>
                        </button>
                    </li>
                `).join('') : '<li class="empty-list-item">No chats yet.</li>'}
            </ul>
        </div>
    ` : '';


    dashboard.innerHTML = `
        <div class="app-menu-overlay" data-action="close-sidebar"></div>
        <aside class="sidebar glass-effect">
            <button class="icon-btn sidebar-close-btn" data-action="close-sidebar" aria-label="Close menu">
                ${icons.close}
            </button>
            <div class="sidebar-header">
                <a href="#" class="sidebar-logo" data-action="navigate" data-view="dashboard">
                    <span class="logo-svg">${icons.logo}</span>
                    <span class="logo-text">Cravour</span>
                </a>
            </div>
            <nav class="nav">
                ${sidebarNavContent}
                ${sidebarChatHistoryContent}
            </nav>
            <div class="sidebar-footer">
                <ul class="nav-list">
                    <li>
                        <a href="#" class="nav-link ${state.currentView === 'settings' ? 'active' : ''}" data-action="navigate" data-view="settings">
                            <span class="btn-icon">${icons.settings}</span>
                            <span class="nav-link-text">Settings</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" class="nav-link" data-action="logout">
                            <span class="btn-icon">${icons.logout}</span>
                            <span class="nav-link-text">Logout</span>
                        </a>
                    </li>
                </ul>
                <div class="sidebar-collapse-toggle-wrapper">
                    <button class="icon-btn sidebar-collapse-toggle" data-action="toggle-sidebar-collapse" aria-label="Collapse sidebar">
                        <span class="btn-icon">${icons.arrowPath}</span>
                    </button>
                </div>
            </div>
        </aside>
        <main class="main-content">
            <header class="main-header">
                <div class="main-header-content">
                    <div style="display: flex; align-items: center; gap: 15px;">
                         <button class="icon-btn app-menu-toggle" data-action="open-sidebar" aria-label="Open menu">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 01-.75-.75z" clip-rule="evenodd" /></svg>
                        </button>
                        <h1 class="main-header-title">${viewTitles[state.currentView] || 'Dashboard'}</h1>
                    </div>
                    <div class="header-wallet-container">
                        <div class="header-wallet-display">
                            <span class="wallet-label">Balance:</span>
                            <span class="wallet-amount">${formatCurrency(state.walletBalance)}</span>
                        </div>
                        <button class="btn btn-primary btn-sm" data-action="open-fund-wallet-modal">
                            <span class="btn-icon">${icons.plus}</span>
                            Fund Wallet
                        </button>
                    </div>
                </div>
            </header>
            <div class="view-wrapper" id="view-wrapper">
                ${renderCurrentView()}
            </div>
        </main>
    `;
};

const renderCurrentView = () => {
    switch (state.currentView) {
        case 'dashboard': return renderDashboardView();
        case 'co-pilot': return renderCoPilotView();
        case 'transactions': return renderTransactionsView();
        case 'pots': return renderPotsView();
        case 'goals': return renderGoalsView();
        case 'budgets': return renderBudgetsView();
        case 'marketplace': return renderMarketplaceView();
        case 'reports': return renderReportsView();
        case 'settings': return renderSettingsView();
        default: return `<div class="card"><div class="card-header"><h2 class="card-header-title">${state.currentView}</h2></div><p>This view is under construction.</p></div>`;
    }
};

const renderDashboardView = () => {
    const totalSaved = state.goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalInPots = state.pots.reduce((sum, pot) => sum + pot.amount, 0);
    const goalsCompleted = state.goals.filter(g => g.currentAmount >= g.targetAmount).length;

    return `
        <div class="dashboard-grid">
            <div class="kpi-grid">
                <div class="card kpi-card">
                    <h3 class="kpi-title">Wallet Balance</h3>
                    <p class="kpi-value">${formatCurrency(state.walletBalance)}</p>
                    <p class="kpi-subtitle">Available to spend</p>
                </div>
                <div class="card kpi-card">
                    <h3 class="kpi-title">Saved in Pots</h3>
                    <p class="kpi-value">${formatCurrency(totalInPots)}</p>
                     <p class="kpi-subtitle">Across ${state.pots.length} pots</p>
                </div>
                <div class="card kpi-card">
                    <h3 class="kpi-title">Saved to Goals</h3>
                    <p class="kpi-value">${formatCurrency(totalSaved)}</p>
                    <p class="kpi-subtitle">${goalsCompleted} completed</p>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                     <h3 class="card-header-title">Ongoing Goals</h3>
                     <a href="#" class="btn btn-secondary-outline btn-sm" data-action="navigate" data-view="goals">View All</a>
                </div>
                ${state.goals.length > 0 ? `
                    <div class="goal-list-condensed">
                        ${state.goals.filter(g => g.currentAmount < g.targetAmount).slice(0, 3).map(renderGoalRow).join('')}
                    </div>
                ` : `
                    <div class="empty-state mini">
                        <p>No goals yet. Set one today!</p>
                        <a href="#" class="action-link" data-action="navigate" data-view="goals">Create a Goal</a>
                    </div>
                `}
            </div>

            <div class="card">
                <div class="card-header">
                     <h3 class="card-header-title">Recent Transactions</h3>
                     <a href="#" class="btn btn-secondary-outline btn-sm" data-action="navigate" data-view="transactions">View All</a>
                </div>
                ${state.transactions.length > 0 ? `
                    <div class="transaction-list-condensed">
                        ${[...state.transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4).map(renderRecentTransactionRow).join('')}
                    </div>
                ` : `
                    <div class="empty-state mini">
                        <p>No transactions yet.</p>
                        <a href="#" class="action-link" data-action="navigate" data-view="transactions">Add Transaction</a>
                    </div>
                `}
            </div>
            
            <div class="card financial-health-card grid-span-2">
                ${renderFinancialHealthCheck()}
            </div>

        </div>
    `;
};

const renderFinancialHealthCheck = () => {
    if (state.isHealthCheckLoading) {
        return `
            <div class="card-header">
                <h3 class="card-header-title">Financial Health Check</h3>
            </div>
            <div class="health-check-content loading">
                <div class="spinner-large"></div>
                <p>Analyzing your finances...</p>
            </div>
        `;
    }

    if (state.financialHealthResult) {
        const { score, summary, positives, improvements } = state.financialHealthResult;
        const scoreColor = score > 75 ? 'var(--color-success)' : score > 50 ? 'var(--color-warning)' : 'var(--color-error)';
        return `
            <div class="card-header">
                <h3 class="card-header-title">Financial Health Check</h3>
                <button class="btn btn-secondary-outline btn-sm" data-action="financial-health-check">Re-analyze</button>
            </div>
            <div class="health-check-content results">
                <div class="health-score-circle" style="--score-color: ${scoreColor}; --score-value: ${score};">
                    <svg viewBox="0 0 36 36" class="circular-chart">
                        <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="circle" stroke-dasharray="${score}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <text x="18" y="20.35" class="health-score-value">${score}</text>
                    </svg>
                </div>
                <div class="health-results-summary">
                    <p class="ai-summary">"${escapeHTML(summary)}"</p>
                    <div class="health-result-lists">
                        <div class="health-result-list">
                            <h4>Positives</h4>
                            <ul>
                                ${positives.map(p => `<li class="health-result-item positive"><span class="btn-icon">${icons.checkCircle}</span><span>${escapeHTML(p)}</span></li>`).join('')}
                            </ul>
                        </div>
                        <div class="health-result-list">
                            <h4>Improvements</h4>
                            <ul>
                                ${improvements.map(i => `<li class="health-result-item improvement"><span class="btn-icon">${icons.warning}</span><span>${escapeHTML(i)}</span></li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class="card-header">
            <h3 class="card-header-title">Financial Health Check</h3>
        </div>
        <div class="health-check-content initial">
            <div class="empty-state-icon">${icons.sparkle}</div>
            <p>Get a personalized AI analysis of your spending habits, budget performance, and goal progress.</p>
            <button class="btn btn-primary" data-action="financial-health-check">Analyze My Finances</button>
        </div>
    `;
};


const renderGoalRow = (goal: Goal) => {
    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    return `
        <div class="goal-row">
            <div class="item-icon">${goal.icon}</div>
            <div class="item-details">
                <strong>${escapeHTML(goal.name)}</strong>
                <span>${formatCurrency(goal.currentAmount)} / ${formatCurrency(goal.targetAmount)}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-bar-inner" style="width: ${percentage}%;"></div>
            </div>
        </div>
    `;
};

const renderRecentTransactionRow = (transaction: Transaction) => {
    const budget = state.budgets.find(b => b.id === transaction.budgetId);
    const isSyncedFromBank = transaction.sourceAccountId && transaction.sourceAccountId !== 'recurring';
    const isRecurring = transaction.sourceAccountId === 'recurring';

    let iconToShow = budget?.icon || '💸';
    let categoryText = budget?.name || 'Uncategorized';

    if (isSyncedFromBank) {
        const account = state.linkedAccounts.find(acc => acc.id === transaction.sourceAccountId);
        if (account) {
            iconToShow = `<div class="bank-icon-small">${account.bankIcon}</div>`;
            categoryText = account.name;
        }
    } else if (isRecurring) {
        iconToShow = `<div class="transaction-icon recurring mini">${icons.sync}</div>`;
        categoryText = 'Recurring';
    }


    return `
        <div class="transaction-row mini">
            <div class="transaction-icon">${iconToShow}</div>
            <div class="transaction-details">
                <strong>${escapeHTML(transaction.description)}</strong>
                <span>${new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} &bull; ${categoryText}</span>
            </div>
            <div class="transaction-amount">-${formatCurrency(transaction.amount)}</div>
        </div>
    `;
};


const renderCoPilotView = () => {
    const activeChat = state.chats.find(c => c.id === state.activeChatId);
    return `
        <div class="co-pilot-grid">
            <div class="main-chat-area">
                <div class="chat-container">
                    <div class="chat-messages">
                        ${activeChat ? activeChat.messages.map(renderChatMessage).join('') : renderEmptyChatState()}
                        ${state.isAiThinking ? renderThinkingIndicator() : ''}
                    </div>
                    <form class="chat-form" data-action="send-chat-message">
                        <input type="text" name="prompt" class="input-field" placeholder="Ask me anything about your finances..." required ${!state.ai || state.isAiThinking || !activeChat ? 'disabled' : ''}>
                        <button type="submit" class="btn btn-primary" ${!state.ai || state.isAiThinking || !activeChat ? 'disabled' : ''}>
                            ${state.isAiThinking ? '<div class="spinner"></div>' : icons.send}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
};

const renderChatMessage = (message: ChatMessage) => {
    const content = message.role === 'ai' ? marked.parse(message.content) : escapeHTML(message.content);
    return `
        <div class="message ${message.role}-message">
            ${DOMPurify.sanitize(content as string)}
        </div>
    `;
};

const renderEmptyChatState = () => {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">${icons.coPilot}</div>
            <h2>AI Co-Pilot</h2>
            <p>Start a new conversation to get personalized financial advice, budgeting help, and more.</p>
        </div>
    `;
};

const renderThinkingIndicator = () => {
    return `
        <div class="message ai-message">
            <div class="thinking-indicator">
                <div class="spinner"></div>
                <span>Cravour is thinking...</span>
            </div>
        </div>
    `;
};

const renderTransactionsView = () => {
    const sortedTransactions = [...state.transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return `
        <div class="view-subheader">
            <h2 class="view-subtitle">Your spending history.</h2>
            <div class="view-actions">
                <button class="btn btn-primary" data-action="open-transaction-modal">
                    <span class="btn-icon">${icons.plus}</span>
                    New Transaction
                </button>
            </div>
        </div>
        ${sortedTransactions.length > 0 ? `
            <div class="transaction-list">
                ${sortedTransactions.map(renderTransactionRow).join('')}
            </div>
        ` : `
            <div class="empty-state-actionable card">
                <div class="empty-state-icon">${icons.transactions}</div>
                <h2>Log Your First Transaction</h2>
                <p>Start tracking your spending to see where your money goes and how you can save more.</p>
                <button class="btn btn-primary btn-lg" data-action="open-transaction-modal">Add Transaction</button>
            </div>
        `}
    `;
};

const renderTransactionRow = (transaction: Transaction) => {
    const budget = state.budgets.find(b => b.id === transaction.budgetId);
    const isSyncedFromBank = transaction.sourceAccountId && transaction.sourceAccountId !== 'recurring';
    const isRecurring = transaction.sourceAccountId === 'recurring';
    const isEditable = !transaction.sourceAccountId; // Only purely manual tx are editable

    let iconToShow = budget?.icon || '💸';
    let categoryText = budget?.name || 'Uncategorized';
    let disabledTitle = 'Synced transactions cannot be modified';

    if (isSyncedFromBank) {
        const account = state.linkedAccounts.find(acc => acc.id === transaction.sourceAccountId);
        if (account) {
            iconToShow = `<div class="bank-icon-small">${account.bankIcon}</div>`;
            categoryText = account.name;
        }
    } else if (isRecurring) {
        iconToShow = `<div class="transaction-icon recurring">${icons.sync}</div>`;
        categoryText = 'Recurring';
        disabledTitle = 'Recurring transactions cannot be modified';
    }
    
    return `
        <div class="transaction-row">
            <div class="transaction-icon">${iconToShow}</div>
            <div class="transaction-details">
                <strong>${escapeHTML(transaction.description)}</strong>
                <span>${new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
            </div>
            <div class="transaction-category">
                ${escapeHTML(categoryText)}
            </div>
            <div class="transaction-amount">
                -${formatCurrency(transaction.amount)}
            </div>
            <div class="transaction-actions">
                <button class="icon-btn" data-action="edit-transaction" data-id="${transaction.id}" ${!isEditable ? `disabled title="${disabledTitle}"` : ''}>${icons.edit}</button>
                <button class="icon-btn delete-btn" data-action="delete-transaction" data-id="${transaction.id}" ${!isEditable ? `disabled title="${disabledTitle}"` : ''}>${icons.trash}</button>
            </div>
        </div>
    `;
};


const renderTransactionModal = () => {
    const modalContainer = $('#transaction-modal');
    if (!modalContainer) return;

    if (!state.isTransactionModalOpen) {
        modalContainer.innerHTML = '';
        return;
    }
    
    const editingTransaction = state.editingTransactionId ? state.transactions.find(t => t.id === state.editingTransactionId) : null;
    const title = editingTransaction ? 'Edit Transaction' : 'Add New Transaction';

    modalContainer.innerHTML = `
        <div class="modal-overlay" data-action="close-transaction-modal">
            <div class="modal-content glass-effect">
                <button class="modal-close-btn" data-action="close-transaction-modal">${icons.close}</button>
                <h2 class="modal-title">${title}</h2>
                <form id="transaction-form" data-action="save-transaction">
                    <div class="form-group">
                        <label for="transaction-description">Description</label>
                        <input type="text" id="transaction-description" class="input-field" value="${editingTransaction ? escapeHTML(editingTransaction.description) : ''}" required placeholder="e.g., Lunch with friends">
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="transaction-amount">Amount (₦)</label>
                            <input type="number" id="transaction-amount" class="input-field" value="${editingTransaction ? editingTransaction.amount : ''}" required min="1">
                        </div>
                        <div class="form-group">
                            <label for="transaction-date">Date</label>
                            <input type="date" id="transaction-date" class="input-field" value="${editingTransaction ? editingTransaction.date : new Date().toISOString().split('T')[0]}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="transaction-budget">Budget Category</label>
                        <div class="input-with-button">
                            <select id="transaction-budget" class="input-field" required>
                                <option value="">Select a category...</option>
                                ${state.budgets.map(b => `<option value="${b.id}" ${editingTransaction?.budgetId === b.id ? 'selected' : ''}>${escapeHTML(b.name)}</option>`).join('')}
                            </select>
                            <button type="button" class="btn btn-secondary-outline suggest-btn" data-action="ai-suggest-category" ${state.isAiSuggestingCategory ? 'disabled' : ''}>
                                ${state.isAiSuggestingCategory ? '<div class="spinner"></div>' : 'Suggest'}
                            </button>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary-outline" data-action="close-transaction-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            ${state.isSubmitting ? '<div class="spinner"></div>' : 'Save Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

const renderRecurringTransactionModal = () => {
    const modalContainer = $('#recurring-transaction-modal');
    if (!modalContainer) return;

    if (!state.isRecurringTransactionModalOpen) {
        modalContainer.innerHTML = '';
        return;
    }
    
    const editingTx = state.editingRecurringTransactionId ? state.recurringTransactions.find(t => t.id === state.editingRecurringTransactionId) : null;
    const title = editingTx ? 'Edit Recurring Transaction' : 'New Recurring Transaction';

    modalContainer.innerHTML = `
        <div class="modal-overlay" data-action="close-recurring-transaction-modal">
            <div class="modal-content glass-effect">
                <button class="modal-close-btn" data-action="close-recurring-transaction-modal">${icons.close}</button>
                <h2 class="modal-title">${title}</h2>
                <form data-action="save-recurring-transaction">
                    <div class="form-group">
                        <label for="recurring-tx-description">Description</label>
                        <input type="text" id="recurring-tx-description" class="input-field" value="${editingTx ? escapeHTML(editingTx.description) : ''}" required placeholder="e.g., Netflix Subscription">
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="recurring-tx-amount">Amount (₦)</label>
                            <input type="number" id="recurring-tx-amount" class="input-field" value="${editingTx ? editingTx.amount : ''}" required min="1">
                        </div>
                        <div class="form-group">
                             <label for="recurring-tx-budget">Budget Category</label>
                             <select id="recurring-tx-budget" class="input-field" required>
                                <option value="">Select a category...</option>
                                ${state.budgets.map(b => `<option value="${b.id}" ${editingTx?.budgetId === b.id ? 'selected' : ''}>${escapeHTML(b.name)}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-grid">
                         <div class="form-group">
                            <label for="recurring-tx-frequency">Frequency</label>
                            <select id="recurring-tx-frequency" class="input-field" required>
                                <option value="monthly" ${editingTx?.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                                <option value="weekly" ${editingTx?.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="recurring-tx-start-date">Start Date</label>
                            <input type="date" id="recurring-tx-start-date" class="input-field" value="${editingTx ? editingTx.startDate : new Date().toISOString().split('T')[0]}" required>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary-outline" data-action="close-recurring-transaction-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            ${state.isSubmitting ? '<div class="spinner"></div>' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};


const renderPotsView = () => {
    return `
        <div class="view-subheader">
            <h2 class="view-subtitle">Organize your savings into separate pots.</h2>
            <div class="view-actions">
                <button class="btn btn-primary" data-action="open-pot-modal">
                    <span class="btn-icon">${icons.plus}</span>
                    New Pot
                </button>
            </div>
        </div>
        ${state.pots.length > 0 ? `
            <div class="pot-list">
                ${state.pots.map(renderPotCard).join('')}
            </div>
        ` : `
            <div class="empty-state-actionable card">
                <div class="empty-state-icon">${icons.pots}</div>
                <h2>Create Your First Savings Pot</h2>
                <p>Pots help you set aside money for specific things, separate from your main balance. Try creating one for a "Rainy Day" or "December Flex"!</p>
                <button class="btn btn-primary btn-lg" data-action="open-pot-modal">Create a Pot</button>
            </div>
        `}
    `;
}

const renderPotCard = (pot: Pot) => {
    return `
        <div class="pot-card">
            <div class="pot-card-header">
                <div class="pot-icon">${pot.icon || '🍯'}</div>
                <h3>${escapeHTML(pot.name)}</h3>
                 <div class="pot-actions">
                     <button class="icon-btn" data-action="edit-pot" data-id="${pot.id}">${icons.edit}</button>
                     <button class="icon-btn delete-btn" data-action="delete-pot" data-id="${pot.id}">${icons.trash}</button>
                </div>
            </div>
            <div class="pot-card-body">
                <p class="pot-amount">${formatCurrency(pot.amount)}</p>
            </div>
            <div class="pot-card-footer">
                <button class="btn btn-secondary-outline btn-sm" data-action="open-pot-withdraw-modal" data-id="${pot.id}">
                    Withdraw
                </button>
                 <button class="btn btn-primary btn-sm" data-action="open-pot-fund-modal" data-id="${pot.id}">
                    Add Funds
                </button>
            </div>
        </div>
    `;
};

const renderPotModal = () => {
    const modalContainer = $('#pot-modal');
    if (!modalContainer) return;

    if (!state.isPotModalOpen) {
        modalContainer.innerHTML = '';
        return;
    }
    
    const editingPot = state.editingPotId ? state.pots.find(p => p.id === state.editingPotId) : null;
    const title = editingPot ? 'Edit Pot' : 'Create a New Pot';

    modalContainer.innerHTML = `
        <div class="modal-overlay" data-action="close-pot-modal">
            <div class="modal-content glass-effect">
                <button class="modal-close-btn" data-action="close-pot-modal">${icons.close}</button>
                <h2 class="modal-title">${title}</h2>
                <form id="pot-form" data-action="save-pot">
                    <div class="form-group">
                        <label for="pot-name">Pot Name</label>
                        <input type="text" id="pot-name" class="input-field" value="${editingPot ? escapeHTML(editingPot.name) : ''}" required placeholder="e.g., Rainy Day Fund">
                    </div>
                    <div class="form-group">
                        <label for="pot-icon">Icon</label>
                        <input type="text" id="pot-icon" class="input-field" placeholder="e.g., ☔️, 🎉, 💻" value="${editingPot ? escapeHTML(editingPot.icon) : ''}">
                        <p class="form-text">Choose an emoji to represent this pot.</p>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary-outline" data-action="close-pot-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            ${state.isSubmitting ? '<div class="spinner"></div>' : 'Save Pot'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

const renderPotActionModal = () => {
    const modalContainer = $('#pot-action-modal');
    if (!modalContainer) return;

    const isFunding = state.isPotFundModalOpen;

    if (!isFunding && !state.isPotWithdrawModalOpen || !state.potActionTargetId) {
        modalContainer.innerHTML = '';
        return;
    }

    const pot = state.pots.find(p => p.id === state.potActionTargetId);
    if (!pot) return;

    const title = isFunding ? `Add Funds to "${escapeHTML(pot.name)}"` : `Withdraw from "${escapeHTML(pot.name)}"`;
    const action = isFunding ? "save-pot-fund" : "save-pot-withdraw";
    const maxAmount = isFunding ? state.walletBalance : pot.amount;
    const helpText = isFunding
        ? `Available in wallet: ${formatCurrency(state.walletBalance)}`
        : `Available in pot: ${formatCurrency(pot.amount)}`;


    modalContainer.innerHTML = `
        <div class="modal-overlay" data-action="close-pot-action-modal">
            <div class="modal-content glass-effect">
                <button class="modal-close-btn" data-action="close-pot-action-modal">${icons.close}</button>
                <h2 class="modal-title">${title}</h2>
                <form id="pot-action-form" data-action="${action}">
                    <div class="form-group">
                        <label for="pot-action-amount">Amount (₦)</label>
                        <input type="number" id="pot-action-amount" class="input-field" 
                               placeholder="0.00" required min="1" max="${maxAmount}">
                        <p class="form-text">${helpText}</p>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary-outline" data-action="close-pot-action-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            ${state.isSubmitting ? '<div class="spinner"></div>' : 'Confirm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};


const renderGoalsView = () => {
    return `
        <div class="view-subheader">
            <h2 class="view-subtitle">Track and achieve your financial goals.</h2>
            <div class="view-actions">
                <button class="btn btn-primary" data-action="open-goal-modal">
                    <span class="btn-icon">${icons.plus}</span>
                    New Goal
                </button>
            </div>
        </div>
        ${state.goals.length > 0 ? `
            <div class="goal-list">
                ${state.goals.map(renderGoalCard).join('')}
            </div>
        ` : `
            <div class="empty-state-actionable card">
                <div class="empty-state-icon">${icons.goals}</div>
                <h2>Set Your First Financial Goal</h2>
                <p>What are you saving for? A new phone, a vacation, or a down payment? Let's make a plan!</p>
                <button class="btn btn-primary btn-lg" data-action="open-goal-modal">Create a Goal</button>
            </div>
        `}
    `;
};

const renderGoalCard = (goal: Goal) => {
    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const isCompleted = goal.currentAmount >= goal.targetAmount;

    return `
        <div class="goal-card ${isCompleted ? 'completed' : ''}">
             ${isCompleted ? `<div class="goal-complete-badge">${icons.check} Completed</div>` : ''}
            <div class="goal-card-header">
                <div class="goal-icon">${goal.icon || '🎯'}</div>
                <div>
                     <h3>${escapeHTML(goal.name)}</h3>
                     <p class="text-secondary">${formatCurrency(goal.targetAmount)}</p>
                </div>
            </div>
            
            <div class="goal-progress-item">
                <div class="goal-progress-header">
                    <span>${formatCurrency(goal.currentAmount)}</span>
                    <span>${percentage.toFixed(0)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-inner" style="width: ${percentage}%;"></div>
                </div>
            </div>

            ${goal.targetDate ? `
            <div class="goal-meta">
                <span class="btn-icon">${icons.calendar}</span>
                <span>Target: ${new Date(goal.targetDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
            </div>
            ` : ''}

            <div class="goal-card-footer">
                <button class="btn btn-secondary-outline btn-sm" data-action="open-goal-contribution-modal" data-id="${goal.id}" ${isCompleted ? 'disabled' : ''}>
                    Add Funds
                </button>
                <div class="goal-actions">
                     <button class="icon-btn" data-action="edit-goal" data-id="${goal.id}">${icons.edit}</button>
                     <button class="icon-btn delete-btn" data-action="delete-goal" data-id="${goal.id}">${icons.trash}</button>
                </div>
            </div>
        </div>
    `;
};

const renderGoalModal = () => {
    const modalContainer = $('#goal-modal');
    if (!modalContainer) return;

    if (!state.isGoalModalOpen) {
        modalContainer.innerHTML = '';
        return;
    }
    
    const editingGoal = state.editingGoalId ? state.goals.find(g => g.id === state.editingGoalId) : null;
    const title = editingGoal ? 'Edit Goal' : 'Create a New Goal';

    modalContainer.innerHTML = `
        <div class="modal-overlay" data-action="close-goal-modal">
            <div class="modal-content glass-effect">
                <button class="modal-close-btn" data-action="close-goal-modal">${icons.close}</button>
                <h2 class="modal-title">${title}</h2>
                <form id="goal-form" data-action="save-goal">
                    <div class="form-group">
                        <label for="goal-name">Goal Name</label>
                        <input type="text" id="goal-name" class="input-field" value="${editingGoal ? escapeHTML(editingGoal.name) : ''}" required>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="goal-target">Target Amount (₦)</label>
                            <input type="number" id="goal-target" class="input-field" value="${editingGoal ? editingGoal.targetAmount : ''}" required min="1">
                        </div>
                        <div class="form-group">
                            <label for="goal-current">Current Amount (₦)</label>
                            <input type="number" id="goal-current" class="input-field" value="${editingGoal ? editingGoal.currentAmount : '0'}" required min="0">
                        </div>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="goal-icon">Icon</label>
                            <input type="text" id="goal-icon" class="input-field" placeholder="e.g., 📱, ✈️, 🏠" value="${editingGoal ? escapeHTML(editingGoal.icon) : ''}">
                            <p class="form-text">Choose an emoji to represent your goal.</p>
                        </div>
                         <div class="form-group">
                            <label for="goal-date">Target Date (Optional)</label>
                            <input type="date" id="goal-date" class="input-field" value="${editingGoal ? editingGoal.targetDate : ''}">
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary-outline" data-action="close-goal-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            ${state.isSubmitting ? '<div class="spinner"></div>' : 'Save Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

const renderGoalContributionModal = () => {
    const modalContainer = $('#goal-contribution-modal');
    if (!modalContainer) return;

    if (!state.isContributionModalOpen || !state.contributingToGoalId) {
        modalContainer.innerHTML = '';
        return;
    }

    const goal = state.goals.find(g => g.id === state.contributingToGoalId);
    if (!goal) {
        setState({ isContributionModalOpen: false, contributingToGoalId: null });
        modalContainer.innerHTML = '';
        return;
    };

    const remainingAmount = goal.targetAmount - goal.currentAmount;

    modalContainer.innerHTML = `
        <div class="modal-overlay" data-action="close-goal-contribution-modal">
            <div class="modal-content glass-effect">
                <button class="modal-close-btn" data-action="close-goal-contribution-modal">${icons.close}</button>
                <h2 class="modal-title">Add Funds to "${escapeHTML(goal.name)}"</h2>
                <form id="goal-contribution-form" data-action="save-goal-contribution">
                    <div class="form-group">
                        <label for="contribution-amount">Contribution Amount (₦)</label>
                        <input type="number" id="contribution-amount" class="input-field" 
                               placeholder="0.00" required min="1" 
                               max="${Math.min(state.walletBalance, remainingAmount)}">
                        <p class="form-text">
                            Remaining to save: ${formatCurrency(remainingAmount)}<br>
                            Available in wallet: ${formatCurrency(state.walletBalance)}
                        </p>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary-outline" data-action="close-goal-contribution-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            ${state.isSubmitting ? '<div class="spinner"></div>' : 'Add Contribution'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

const renderBudgetsView = () => {
    return `
        <div class="view-subheader">
            <h2 class="view-subtitle">Manage your monthly spending limits.</h2>
            <div class="view-actions">
                <button class="btn btn-primary" data-action="open-budget-modal">
                    <span class="btn-icon">${icons.plus}</span>
                    New Budget
                </button>
            </div>
        </div>
        ${state.budgets.length > 0 ? `
            <div class="budget-list">
                ${state.budgets.map(renderBudgetCard).join('')}
            </div>
        ` : `
            <div class="empty-state-actionable card">
                <div class="empty-state-icon">${icons.budgets}</div>
                <h2>Create Your First Budget</h2>
                <p>Set spending limits for categories like food, transport, and entertainment to stay on track.</p>
                <button class="btn btn-primary btn-lg" data-action="open-budget-modal">Create a Budget</button>
            </div>
        `}
    `;
};

const renderBudgetCard = (budget: Budget) => {
    const percentage = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
    const remaining = budget.amount - budget.spent;
    let progressBarClass = 'good';
    if (percentage > 90) progressBarClass = 'over';
    else if (percentage > 70) progressBarClass = 'warning';

    return `
        <div class="budget-card">
            <div class="budget-card-header">
                <div class="budget-icon">${budget.icon || '💰'}</div>
                <h3>${escapeHTML(budget.name)}</h3>
                 <div class="budget-actions">
                     <button class="icon-btn" data-action="edit-budget" data-id="${budget.id}">${icons.edit}</button>
                     <button class="icon-btn delete-btn" data-action="delete-budget" data-id="${budget.id}">${icons.trash}</button>
                </div>
            </div>
            <div class="budget-card-body">
                <p class="budget-amount">
                    <strong>${formatCurrency(budget.spent)}</strong>
                    <span class="text-secondary"> spent of ${formatCurrency(budget.amount)}</span>
                </p>
                <div class="progress-bar">
                    <div class="progress-bar-inner ${progressBarClass}" style="width: ${percentage}%;"></div>
                </div>
            </div>
            <div class="budget-card-footer">
                <span>${percentage.toFixed(0)}% Used</span>
                <span>${formatCurrency(remaining)} Left</span>
            </div>
        </div>
    `;
};

const renderBudgetModal = () => {
    const modalContainer = $('#budget-modal');
    if (!modalContainer) return;

    if (!state.isBudgetModalOpen) {
        modalContainer.innerHTML = '';
        return;
    }
    
    const editingBudget = state.editingBudgetId ? state.budgets.find(b => b.id === state.editingBudgetId) : null;
    const title = editingBudget ? 'Edit Budget' : 'Create a New Budget';

    modalContainer.innerHTML = `
        <div class="modal-overlay" data-action="close-budget-modal">
            <div class="modal-content glass-effect">
                <button class="modal-close-btn" data-action="close-budget-modal">${icons.close}</button>
                <h2 class="modal-title">${title}</h2>
                <form id="budget-form" data-action="save-budget">
                    <div class="form-group">
                        <label for="budget-name">Category Name</label>
                        <input type="text" id="budget-name" class="input-field" value="${editingBudget ? escapeHTML(editingBudget.name) : ''}" required placeholder="e.g., Groceries, Transport">
                    </div>
                    <div class="form-group">
                        <label for="budget-amount">Budget Amount (₦)</label>
                        <input type="number" id="budget-amount" class="input-field" value="${editingBudget ? editingBudget.amount : ''}" required min="1">
                    </div>
                    <div class="form-group">
                        <label for="budget-icon">Icon</label>
                        <input type="text" id="budget-icon" class="input-field" placeholder="e.g., 🛒, 🚕, 🍿" value="${editingBudget ? escapeHTML(editingBudget.icon) : ''}">
                        <p class="form-text">Choose an emoji to represent this budget.</p>
                    </div>

                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary-outline" data-action="close-budget-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            ${state.isSubmitting ? '<div class="spinner"></div>' : 'Save Budget'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

const renderMarketplaceView = () => {
    return `
        <div class="marketplace-view">
            <form class="marketplace-search-form" data-action="marketplace-search">
                <input type="search" name="query" class="input-field" placeholder="Search for products, e.g., 'running shoes for men'" value="${escapeHTML(state.marketplaceSearchQuery)}" required>
                <button type="submit" class="btn btn-primary" ${state.isMarketplaceLoading ? 'disabled' : ''}>
                    ${state.isMarketplaceLoading ? '<div class="spinner"></div>' : 'Search'}
                </button>
            </form>
            
            ${state.isMarketplaceLoading 
                ? renderMarketplaceSkeleton() 
                : state.marketplaceInitialLoad
                    ? `<div class="empty-state-actionable card">
                            <div class="empty-state-icon">${icons.marketplace}</div>
                            <h2>AI-Powered Marketplace</h2>
                            <p>Use our AI to find the best products and deals from merchants across Nigeria. What are you looking for today?</p>
                        </div>`
                    : state.marketplaceProducts.length > 0
                        ? `<div class="product-grid">${state.marketplaceProducts.map(renderProductCard).join('')}</div>`
                        : `<div class="empty-state card">
                                <div class="empty-state-icon">${icons.marketplace}</div>
                                <h2>No Products Found</h2>
                                <p>We couldn't find any products matching your search for "${escapeHTML(state.marketplaceSearchQuery)}". Try a different search term.</p>
                            </div>`
            }
        </div>
    `;
};

const renderProductCard = (product: Product) => {
    return `
        <div class="product-card">
            <div class="product-image-container">
                <img src="${escapeHTML(product.imageUrl)}" alt="${escapeHTML(product.name)}" class="product-image" loading="lazy" onerror="this.parentElement.innerHTML = '🖼️'">
            </div>
            <div class="product-details">
                <h4 class="product-name">${escapeHTML(product.name)}</h4>
                <p class="product-merchant">by ${escapeHTML(product.merchant)}</p>
                <div class="product-footer">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <button class="btn btn-primary btn-sm" disabled>Buy Now</button>
                </div>
            </div>
        </div>
    `;
};

const renderMarketplaceSkeleton = () => {
    const skeletonCard = `
        <div class="skeleton-product-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-details">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line price"></div>
            </div>
        </div>
    `;
    return `<div class="product-grid">${Array(8).fill(skeletonCard).join('')}</div>`;
};

const renderReportsView = () => {
    // 1. Filter transactions for the current month.
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyTransactions = state.transactions.filter(t => {
        const txDate = new Date(t.date);
        txDate.setUTCHours(0,0,0,0);
        return txDate >= firstDay && txDate <= lastDay;
    });

    // 2. Aggregate spending by budget category.
    const spendingByCategory: { [key: number]: { name: string; icon: string; spent: number; budget: number; color: string; } } = {};
    const categoryColors = ['#FFC107', '#fd7e14', '#28a745', '#17a2b8', '#6f42c1', '#dc3545', '#343a40'];
    let colorIndex = 0;

    state.budgets.forEach(b => {
        spendingByCategory[b.id] = {
            name: b.name,
            icon: b.icon,
            spent: 0,
            budget: b.amount,
            color: categoryColors[colorIndex % categoryColors.length]
        };
        colorIndex++;
    });

    let totalMonthlySpending = 0;
    monthlyTransactions.forEach(tx => {
        if (spendingByCategory[tx.budgetId]) {
            spendingByCategory[tx.budgetId].spent += tx.amount;
        }
        totalMonthlySpending += tx.amount;
    });

    const spendingData = Object.values(spendingByCategory).filter(c => c.spent > 0).sort((a,b) => b.spent - a.spent);

    // 3. Find top spending category.
    const topSpendingCategory = spendingData.length > 0 ? spendingData[0] : { name: 'N/A', spent: 0 };


    return `
        <div class="reports-grid">
            <div class="kpi-card card">
                <h3 class="kpi-title">Total Spending (This Month)</h3>
                <p class="kpi-value">${formatCurrency(totalMonthlySpending)}</p>
            </div>
            <div class="kpi-card card">
                <h3 class="kpi-title">Top Spending Category</h3>
                <p class="kpi-value" style="font-size: 1.5em;">${escapeHTML(topSpendingCategory.name)}</p>
            </div>

            <div class="card grid-span-2">
                 <div class="card-header">
                    <h3 class="card-header-title">Spending Breakdown</h3>
                </div>
                ${spendingData.length > 0 ? `
                <div class="chart-container">
                    ${renderDonutChart(spendingData, totalMonthlySpending)}
                    <div class="chart-legend">
                        <ul>
                            ${spendingData.map(item => `
                                <li>
                                    <span class="legend-color" style="background-color: ${item.color};"></span>
                                    <span class="legend-name">${escapeHTML(item.name)}</span>
                                    <span class="legend-percentage">${totalMonthlySpending > 0 ? ((item.spent / totalMonthlySpending) * 100).toFixed(0) : 0}%</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                ` : `
                    <div class="empty-state mini" style="border: none; padding: 20px;">
                        <p>No spending this month to report.</p>
                    </div>
                `}
            </div>
            
            <div class="card grid-span-2">
                 <div class="card-header">
                    <h3 class="card-header-title">Budget Performance</h3>
                </div>
                <div class="budget-performance-list">
                    ${state.budgets.map(budget => {
                        const spending = spendingByCategory[budget.id]?.spent || 0;
                        const percentage = budget.amount > 0 ? Math.min((spending / budget.amount) * 100, 100) : 0;
                        let progressBarClass = 'good';
                        if (percentage > 90) progressBarClass = 'over';
                        else if (percentage > 70) progressBarClass = 'warning';
                        return `
                        <div class="budget-performance-item">
                            <div class="item-icon">${budget.icon}</div>
                            <div class="item-details">
                                <strong>${escapeHTML(budget.name)}</strong>
                                <span>${formatCurrency(spending)} of ${formatCurrency(budget.amount)}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-bar-inner ${progressBarClass}" style="width: ${percentage}%;"></div>
                            </div>
                        </div>
                        `
                    }).join('')}
                </div>
            </div>
        </div>
    `;
};

const renderDonutChart = (data: {spent: number, color: string}[], total: number) => {
    if (total === 0) return '';
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    const segments = data.map(item => {
        const percentage = item.spent / total;
        const strokeDasharray = `${percentage * circumference} ${circumference}`;
        const segment = `<circle class="donut-segment" cx="100" cy="100" r="${radius}" 
                                stroke="${item.color}" 
                                stroke-dasharray="${strokeDasharray}" 
                                stroke-dashoffset="-${offset * circumference}"></circle>`;
        offset += percentage;
        return segment;
    }).join('');

    return `
        <svg viewBox="0 0 200 200" class="donut-chart-svg">
            <circle class="donut-hole" cx="100" cy="100" r="${radius}"></circle>
            ${segments}
            <g class="donut-center-text">
                <text y="50%" dominant-baseline="middle" text-anchor="middle">
                    <tspan x="50%" dy="-0.5em" class="donut-center-label">Total Spent</tspan>
                    <tspan x="50%" dy="1.2em" class="donut-center-value">${formatCurrency(total)}</tspan>
                </text>
            </g>
        </svg>
    `;
};

const renderSettingsView = () => {
    return `
      <div class="settings-grid">
        ${renderRecurringTransactionsCard()}
        ${renderLinkedAccountsCard()}
        <div class="card">
          <div class="card-header"><h3 class="card-header-title">Appearance</h3></div>
          <div class="card-body">
              <div class="setting-item">
                <div>
                  <strong>Theme</strong>
                  <p class="text-secondary">Choose how Cravour looks to you.</p>
                </div>
                <div class="auth-type-toggle">
                   <button class="${state.theme === 'light' ? 'active' : ''}" data-action="set-theme" data-theme="light">Light</button>
                   <button class="${state.theme === 'dark' ? 'active' : ''}" data-action="set-theme" data-theme="dark">Dark</button>
                </div>
              </div>
          </div>
        </div>
        <div class="card">
            <div class="card-header"><h3 class="card-header-title">Account</h3></div>
             <div class="card-body">
                <div class="danger-zone">
                    <div class="setting-item">
                        <div>
                            <strong>Reset App Data</strong>
                            <p class="text-secondary">This will permanently delete all your chats, goals, budgets, and other data. This action cannot be undone.</p>
                        </div>
                        <button class="btn btn-danger btn-sm" data-action="reset-app-data">Reset App</button>
                    </div>
                </div>
             </div>
        </div>
      </div>
    `;
};

const renderRecurringTransactionsCard = () => {
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-header-title">Recurring Transactions</h3>
                <button class="btn btn-primary btn-sm" data-action="open-recurring-transaction-modal">
                    <span class="btn-icon">${icons.plus}</span> New
                </button>
            </div>
            <div class="card-body">
                <div class="recurring-transaction-list">
                    ${state.recurringTransactions.length > 0
                        ? state.recurringTransactions.map(renderRecurringTransactionItem).join('')
                        : `<div class="empty-state mini" style="border: none; padding: 10px 0;">
                             <p>No recurring transactions set up.</p>
                           </div>`
                    }
                </div>
            </div>
        </div>
    `;
};

const renderRecurringTransactionItem = (tx: RecurringTransaction) => {
    const budget = state.budgets.find(b => b.id === tx.budgetId);
    return `
        <div class="recurring-transaction-item">
            <div class="recurring-transaction-details">
                <strong>${escapeHTML(tx.description)} (${formatCurrency(tx.amount)})</strong>
                <span class="text-secondary">${tx.frequency} &bull; ${budget ? escapeHTML(budget.name) : 'Uncategorized'}</span>
            </div>
            <div class="recurring-transaction-next-due">
                Next: ${new Date(tx.nextDueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}
            </div>
            <div class="recurring-transaction-actions">
                <button class="icon-btn" data-action="edit-recurring-transaction" data-id="${tx.id}" title="Edit Schedule">
                    ${icons.edit}
                </button>
                <button class="icon-btn delete-btn" data-action="delete-recurring-transaction" data-id="${tx.id}" title="Delete Schedule">
                    ${icons.trash}
                </button>
            </div>
        </div>
    `;
};

const renderLinkedAccountsCard = () => {
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-header-title">Linked Accounts</h3>
                <button class="btn btn-primary btn-sm" data-action="link-new-account" ${state.isLinkingAccount ? 'disabled' : ''}>
                    ${state.isLinkingAccount ? '<div class="spinner"></div>' : `<span class="btn-icon">${icons.plus}</span> Link New Account`}
                </button>
            </div>
            <div class="card-body">
                <div class="linked-accounts-list">
                    ${state.linkedAccounts.length > 0
                        ? state.linkedAccounts.map(renderLinkedAccountItem).join('')
                        : `<div class="empty-state mini" style="border: none; padding: 10px 0;">
                             <p>No accounts linked yet.</p>
                           </div>`
                    }
                </div>
            </div>
        </div>
    `;
}

const renderLinkedAccountItem = (account: LinkedAccount) => {
    return `
        <div class="linked-account-item">
            <div class="bank-icon">${account.bankIcon}</div>
            <div class="linked-account-details">
                <strong>${escapeHTML(account.name)}</strong>
                <span class="text-secondary">${escapeHTML(account.maskedAccountNumber)}</span>
            </div>
            <div class="sync-status">
                ${account.lastSync ? `Last synced ${timeAgo(account.lastSync)}` : 'Never synced'}
            </div>
            <div class="linked-account-actions">
                <button class="btn btn-secondary-outline btn-sm" data-action="sync-account" data-id="${account.id}" ${account.isSyncing ? 'disabled' : ''}>
                    ${account.isSyncing ? '<div class="spinner"></div>' : `<span class="btn-icon">${icons.sync}</span> Sync`}
                </button>
                <button class="icon-btn delete-btn" data-action="unlink-account" data-id="${account.id}" title="Unlink Account">
                    ${icons.trash}
                </button>
            </div>
        </div>
    `;
};

const renderFundWalletModal = () => {
    const modalContainer = $('#fund-wallet-modal');
    if (!modalContainer) return;

    if (!state.isFundWalletModalOpen) {
        modalContainer.innerHTML = '';
        return;
    }

    modalContainer.innerHTML = `
        <div class="modal-overlay" data-action="close-fund-wallet-modal">
            <div class="modal-content glass-effect">
                <button class="modal-close-btn" data-action="close-fund-wallet-modal">${icons.close}</button>
                <h2 class="modal-title">Fund Your Wallet</h2>
                <form id="fund-wallet-form" data-action="fund-wallet">
                    <p class="text-secondary" style="text-align: center; margin-top: -15px; margin-bottom: 20px;">
                        Enter the amount you'd like to add to your balance.
                    </p>
                    <div class="form-group">
                        <label for="fund-amount">Amount (₦)</label>
                        <input type="number" id="fund-amount" class="input-field" placeholder="e.g., 5000" required min="100">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary-outline" data-action="close-fund-wallet-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            ${state.isSubmitting ? '<div class="spinner"></div>' : 'Proceed to Pay'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};

const renderMerchantInquiryModal = () => {
    const modalContainer = $('#merchant-modal');
    if (!modalContainer) return;

    if (!state.isMerchantModalOpen) {
        modalContainer.innerHTML = '';
        return;
    }

    modalContainer.innerHTML = `
        <div class="modal-overlay" data-action="close-merchant-modal">
            <div class="modal-content glass-effect">
                <button class="modal-close-btn" data-action="close-merchant-modal">${icons.close}</button>
                <h2 class="modal-title">Partner with Cravour</h2>
                <p class="text-secondary" style="text-align: center; margin-top: -15px; margin-bottom: 20px;">
                    Reach motivated Nigerian shoppers. Fill out the form below and our partnership team will get in touch.
                </p>
                <form id="merchant-inquiry-form" data-action="send-merchant-inquiry">
                    <div class="form-group">
                        <label for="merchant-business-name">Business Name</label>
                        <input type="text" id="merchant-business-name" class="input-field" required placeholder="e.g., Ade's Electronics">
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="merchant-contact-name">Contact Name</label>
                            <input type="text" id="merchant-contact-name" class="input-field" required placeholder="e.g., Ada Okoro">
                        </div>
                        <div class="form-group">
                            <label for="merchant-contact-email">Contact Email</label>
                            <input type="email" id="merchant-contact-email" class="input-field" required placeholder="e.g., ada.okoro@email.com">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="merchant-message">Message (Optional)</label>
                        <textarea id="merchant-message" class="input-field" placeholder="Tell us a bit about your business..."></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary-outline" data-action="close-merchant-modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            ${state.isSubmitting ? '<div class="spinner"></div>' : 'Send Inquiry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
};


const renderToasts = () => {
    const container = $('#toast-container');
    if (!container) return;
    container.innerHTML = state.toasts.map(toast => `
        <div class="toast ${toast.type}">
            ${escapeHTML(toast.message)}
        </div>
    `).join('');
};


// --- Event Handlers & Logic ---
const setState = (newState: Partial<typeof state>) => {
    Object.assign(state, newState);
};

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setState({ toasts: [...state.toasts, { id, message, type }] });
    render();

    setTimeout(() => {
        setState({ toasts: state.toasts.filter(t => t.id !== id) });
        render();
    }, 5000);
};

const handleEvent = (e: Event) => {
    const target = e.target as HTMLElement;
    const actionTarget = target.closest('[data-action]');

    if (!actionTarget) return;

    e.preventDefault();
    const action = actionTarget.getAttribute('data-action');
    const id = actionTarget.getAttribute('data-id');
    const view = actionTarget.getAttribute('data-view');

    switch (action) {
        // --- Navigation ---
        case 'navigate':
            if (view) {
                if (view.startsWith('#')) {
                    const element = $(view);
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                } else {
                    setState({ currentView: view });
                    closeSidebar();
                    render();
                }
            }
            break;
        case 'open-sidebar':
            setState({ isSidebarOpen: true });
            render();
            break;
        case 'close-sidebar':
            closeSidebar();
            break;
        case 'toggle-sidebar-collapse':
            setState({ isSidebarCollapsed: !state.isSidebarCollapsed });
            render();
            break;

        // --- Auth ---
        case 'logout':
            showToast('You have been logged out.', 'info');
            setState({ isLoggedIn: false, chats: [], activeChatId: null, currentView: 'dashboard', goals: [], budgets: [], transactions: [], linkedAccounts: [] });
            render();
            break;
        case 'show-login':
        case 'show-signup':
            state.isLoggedIn = true;
            initializeApp();
            break;
        
        // --- Merchant Inquiry ---
        case 'open-merchant-modal':
            setState({ isMerchantModalOpen: true });
            render();
            break;
        case 'close-merchant-modal':
            setState({ isMerchantModalOpen: false });
            render();
            break;
        case 'send-merchant-inquiry':
            handleSendMerchantInquiry();
            break;
        
        // --- Wallet ---
        case 'open-fund-wallet-modal':
            setState({ isFundWalletModalOpen: true });
            render();
            break;
        case 'close-fund-wallet-modal':
            setState({ isFundWalletModalOpen: false });
            render();
            break;
        case 'fund-wallet':
            handleFundWallet();
            break;

        // --- AI Chat & Suggestions ---
        case 'start-new-chat':
            startNewChat();
            break;
        case 'set-active-chat':
            if (id) {
                setActiveChat(parseInt(id));
                closeSidebar();
            }
            break;
        case 'delete-chat':
             if (id) deleteChat(parseInt(id));
            break;
        case 'send-chat-message':
            handleSendMessage(actionTarget as HTMLFormElement);
            break;
        case 'marketplace-search':
            const form = actionTarget as HTMLFormElement;
            const formData = new FormData(form);
            const query = formData.get('query') as string;
            if (query) {
                handleMarketplaceSearch(query);
            }
            break;
        case 'ai-suggest-category':
            handleAiSuggestCategory();
            break;
        case 'financial-health-check':
            handleFinancialHealthCheck();
            break;

        // --- Transactions ---
        case 'open-transaction-modal':
            setState({ editingTransactionId: null, isTransactionModalOpen: true });
            render();
            break;
        case 'close-transaction-modal':
            setState({ isTransactionModalOpen: false, editingTransactionId: null, isAiSuggestingCategory: false });
            render();
            break;
        case 'save-transaction':
            handleSaveTransaction();
            break;
        case 'edit-transaction':
            if (id) {
                setState({ editingTransactionId: parseInt(id), isTransactionModalOpen: true });
                render();
            }
            break;
        case 'delete-transaction':
            if (id && confirm('Are you sure you want to delete this transaction?')) {
                handleDeleteTransaction(parseInt(id));
            }
            break;
        
        // --- Recurring Transactions ---
        case 'open-recurring-transaction-modal':
            setState({ editingRecurringTransactionId: null, isRecurringTransactionModalOpen: true });
            render();
            break;
        case 'close-recurring-transaction-modal':
            setState({ isRecurringTransactionModalOpen: false, editingRecurringTransactionId: null });
            render();
            break;
        case 'save-recurring-transaction':
            handleSaveRecurringTransaction();
            break;
        case 'edit-recurring-transaction':
            if (id) {
                setState({ editingRecurringTransactionId: parseInt(id), isRecurringTransactionModalOpen: true });
                render();
            }
            break;
        case 'delete-recurring-transaction':
            if (id && confirm('Are you sure you want to delete this recurring schedule?')) {
                handleDeleteRecurringTransaction(parseInt(id));
            }
            break;

        // --- Pots ---
        case 'open-pot-modal':
            setState({ editingPotId: null, isPotModalOpen: true });
            render();
            break;
        case 'close-pot-modal':
            setState({ isPotModalOpen: false, editingPotId: null });
            render();
            break;
        case 'save-pot':
            handleSavePot();
            break;
        case 'edit-pot':
            if (id) {
                setState({ editingPotId: parseInt(id), isPotModalOpen: true });
                render();
            }
            break;
        case 'delete-pot':
            if (id && confirm('Are you sure you want to delete this pot? All funds will be returned to your wallet.')) {
                handleDeletePot(parseInt(id));
            }
            break;
        case 'open-pot-fund-modal':
            if (id) {
                setState({ isPotFundModalOpen: true, potActionTargetId: parseInt(id) });
                render();
            }
            break;
        case 'open-pot-withdraw-modal':
            if (id) {
                setState({ isPotWithdrawModalOpen: true, potActionTargetId: parseInt(id) });
                render();
            }
            break;
        case 'close-pot-action-modal':
             setState({ isPotFundModalOpen: false, isPotWithdrawModalOpen: false, potActionTargetId: null });
             render();
            break;
        case 'save-pot-fund':
            handleSavePotFund();
            break;
        case 'save-pot-withdraw':
            handleSavePotWithdraw();
            break;

        // --- Goals ---
        case 'open-goal-modal':
            setState({ editingGoalId: null, isGoalModalOpen: true });
            render();
            break;
        case 'close-goal-modal':
            setState({ isGoalModalOpen: false });
            render();
            break;
        case 'save-goal':
            handleSaveGoal();
            break;
        case 'edit-goal':
            if (id) {
                setState({ editingGoalId: parseInt(id), isGoalModalOpen: true });
                render();
            }
            break;
        case 'delete-goal':
            if (id && confirm('Are you sure you want to delete this goal?')) {
                setState({ goals: state.goals.filter(g => g.id !== parseInt(id)) });
                showToast('Goal deleted.', 'info');
                render();
            }
            break;
        case 'open-goal-contribution-modal':
            if (id) {
                setState({ contributingToGoalId: parseInt(id), isContributionModalOpen: true });
                render();
            }
            break;
        case 'close-goal-contribution-modal':
            setState({ isContributionModalOpen: false, contributingToGoalId: null });
            render();
            break;
        case 'save-goal-contribution':
            handleSaveContribution();
            break;

        // --- Budgets ---
        case 'open-budget-modal':
            setState({ editingBudgetId: null, isBudgetModalOpen: true });
            render();
            break;
        case 'close-budget-modal':
            setState({ isBudgetModalOpen: false });
            render();
            break;
        case 'save-budget':
            handleSaveBudget();
            break;
        case 'edit-budget':
            if (id) {
                setState({ editingBudgetId: parseInt(id), isBudgetModalOpen: true });
                render();
            }
            break;
        case 'delete-budget':
            if (id && confirm('Are you sure you want to delete this budget? This will also remove its transactions.')) {
                 setState({ 
                    budgets: state.budgets.filter(b => b.id !== parseInt(id)),
                    transactions: state.transactions.filter(t => t.budgetId !== parseInt(id))
                });
                showToast('Budget and its transactions deleted.', 'info');
                render();
            }
            break;
        
        // --- Linked Accounts ---
        case 'link-new-account':
            handleLinkNewAccount();
            break;
        case 'unlink-account':
            if (id && confirm('Are you sure you want to unlink this account? This will not delete its past transactions.')) {
                handleUnlinkAccount(id);
            }
            break;
        case 'sync-account':
            if (id) handleSyncAccount(id);
            break;


        // --- Settings ---
        case 'set-theme':
            const theme = actionTarget.getAttribute('data-theme');
            if (theme && (theme === 'light' || theme === 'dark')) {
                setState({ theme: theme });
                render();
            }
            break;
        case 'reset-app-data':
            if (confirm('Are you sure you want to reset all app data? This cannot be undone.')) {
                initializeApp();
                showToast('App data has been reset.', 'info');
            }
            break;
    }
};

const closeSidebar = () => {
    if (state.isSidebarOpen) {
        setState({ isSidebarOpen: false });
        render();
    }
}

// --- AI Logic ---
const initializeAI = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY not found.");
        $('#config-banner')?.classList.remove('hidden');
        return;
    }
    try {
        const ai = new GoogleGenAI({ apiKey });
        setState({ ai });
        startNewChat();
    } catch (error) {
        console.error("Failed to initialize GoogleGenAI:", error);
        $('#config-banner')?.classList.remove('hidden');
    }
};

const startNewChat = () => {
    if (!state.ai) return;

    const newChatInstance = state.ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: getSystemInstruction() },
    });

    const newChat: ChatHistoryItem = {
        id: Date.now(),
        title: 'New Conversation',
        chat: newChatInstance,
        messages: [],
    };
    setState({ chats: [newChat, ...state.chats], activeChatId: newChat.id });
    closeSidebar();
    render();
};

const setActiveChat = (id: number) => {
    setState({ activeChatId: id });
    render();
};

const deleteChat = (id: number) => {
    const newChats = state.chats.filter(c => c.id !== id);
    let newActiveId = state.activeChatId;

    if(state.activeChatId === id) {
        newActiveId = newChats.length > 0 ? newChats[0].id : null;
        if (!newActiveId) {
            startNewChat();
            return;
        }
    }
    setState({ chats: newChats, activeChatId: newActiveId });
    showToast('Chat deleted.', 'info');
    render();
};

const handleSendMessage = async (form: HTMLFormElement) => {
    if (state.isAiThinking || !state.ai) return;

    const formData = new FormData(form);
    const prompt = formData.get('prompt') as string;
    if (!prompt.trim()) return;

    form.reset();
    
    const activeChatIndex = state.chats.findIndex(c => c.id === state.activeChatId);
    if (activeChatIndex === -1) return;
    
    const activeChat = state.chats[activeChatIndex];
    
    activeChat.messages.push({ role: 'user', content: prompt });

    if (activeChat.messages.length === 1) {
        activeChat.title = prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '');
    }

    setState({ isAiThinking: true });
    render();
    
    const messagesContainer = $('.chat-messages');
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const response = await activeChat.chat.sendMessage({ message: prompt });
        activeChat.messages.push({ role: 'ai', content: response.text });
    } catch (error) {
        console.error("AI Error:", error);
        activeChat.messages.push({ role: 'ai', content: "Sorry, I encountered an error. Please try again." });
    } finally {
        setState({ isAiThinking: false });
        render();
        if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
};

const handleMarketplaceSearch = async (query: string) => {
    if (!state.ai) {
        showToast("AI is not initialized. Please check your API Key.", "error");
        return;
    }
    
    setState({ isMarketplaceLoading: true, marketplaceInitialLoad: false, marketplaceProducts: [], marketplaceSearchQuery: query });
    render();

    try {
        const productSchema = {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                price: { type: Type.NUMBER },
                merchant: { type: Type.STRING },
                imageUrl: { type: Type.STRING, description: "A public URL for a high-quality product image." },
            },
            required: ["id", "name", "description", "price", "merchant", "imageUrl"],
        };

        const response = await state.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a marketplace assistant for Nigeria. Find 8 products matching the query: "${query}".
            Provide realistic product names, merchants (local Nigerian stores like Jumia, Konga, or specific brand stores), and prices in Naira (NGN).
            For each product, generate a unique ID.
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: productSchema
                }
            }
        });

        const products = JSON.parse(response.text);
        setState({ marketplaceProducts: products, isMarketplaceLoading: false });

    } catch (error) {
        console.error("Marketplace search failed:", error);
        showToast("Marketplace search failed. Please try again.", "error");
        setState({ isMarketplaceLoading: false, marketplaceProducts: [] });
    } finally {
        render();
    }
}

const handleAiSuggestCategory = async () => {
    const description = ($('#transaction-description') as HTMLInputElement)?.value;
    if (!state.ai || !description || description.trim() === '') {
        showToast("Please enter a transaction description first.", "error");
        return;
    }
    if (state.budgets.length === 0) {
        showToast("You need to create at least one budget category first.", "error");
        return;
    }

    setState({ isAiSuggestingCategory: true });
    render();

    try {
        const budgetNames = state.budgets.map(b => b.name);
        const response = await state.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Given the transaction description: "${description}", and the available budget categories: [${budgetNames.join(", ")}]. Which category is the best fit?`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        categoryName: {
                            type: Type.STRING,
                            description: "The name of the most appropriate budget category from the provided list.",
                            enum: budgetNames
                        }
                    },
                    required: ["categoryName"]
                }
            }
        });

        const result = JSON.parse(response.text);
        const suggestedCategoryName = result.categoryName;

        const suggestedBudget = state.budgets.find(b => b.name === suggestedCategoryName);
        if (suggestedBudget) {
            const selectElement = $('#transaction-budget') as HTMLSelectElement;
            if (selectElement) {
                selectElement.value = String(suggestedBudget.id);
                showToast(`AI Suggested: ${suggestedBudget.name}`, 'info');
            }
        } else {
            showToast("AI could not determine a category from your list.", "error");
        }

    } catch (error) {
        console.error("AI Category Suggestion Error:", error);
        showToast("Could not get an AI suggestion. Please try again.", "error");
    } finally {
        setState({ isAiSuggestingCategory: false });
        render();
    }
};

const handleFinancialHealthCheck = async () => {
    if (!state.ai) {
        showToast("AI is not initialized. Please check your API Key.", "error");
        return;
    }
    
    setState({ isHealthCheckLoading: true, financialHealthResult: null });
    render();

    // Prepare data for the prompt
    const recentTransactions = state.transactions.slice(0, 20).map(t => ({
        description: t.description,
        amount: t.amount,
        budget: state.budgets.find(b => b.id === t.budgetId)?.name || 'Uncategorized'
    }));
    const budgetStatus = state.budgets.map(b => ({
        name: b.name,
        limit: b.amount,
        spent: b.spent,
        over_budget: b.spent > b.amount
    }));
    const goalStatus = state.goals.map(g => ({
        name: g.name,
        target: g.targetAmount,
        saved: g.currentAmount,
        completed: g.currentAmount >= g.targetAmount
    }));

    const prompt = `
        As a Nigerian financial analyst, evaluate the user's financial health based on this data:
        - Recent Transactions: ${JSON.stringify(recentTransactions)}
        - Budget Status: ${JSON.stringify(budgetStatus)}
        - Goal Status: ${JSON.stringify(goalStatus)}
        - Wallet Balance: ${state.walletBalance}

        Provide a concise analysis. The user wants a quick, clear overview.
        1.  Calculate a financial health score from 0-100. Base it on:
            - Budget adherence (are they overspending?).
            - Savings rate (are they contributing to goals?).
            - Goal progress.
        2.  Write a one-sentence summary of their situation.
        3.  List 2-3 key positive points (e.g., good savings, staying within a budget).
        4.  List 2-3 actionable areas for improvement (e.g., high spending in one category, slow goal progress).
    `;

    try {
        const healthSchema = {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER, description: "A score from 0 to 100 representing overall financial health." },
                summary: { type: Type.STRING, description: "A one-sentence summary of the financial health." },
                positives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 positive observations." },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 actionable suggestions for improvement." }
            },
            required: ["score", "summary", "positives", "improvements"]
        };

        const response = await state.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: healthSchema,
            }
        });

        const result: FinancialHealthResult = JSON.parse(response.text);
        setState({ financialHealthResult: result, isHealthCheckLoading: false });

    } catch (error) {
        console.error("Financial Health Check failed:", error);
        showToast("Health check failed. The AI couldn't provide an analysis right now.", "error");
        setState({ isHealthCheckLoading: false, financialHealthResult: null });
    } finally {
        render();
    }
};


// --- Data Logic ---
const recalculateAllBudgets = () => {
    const newBudgets = state.budgets.map(budget => {
        const spent = state.transactions
            .filter(t => t.budgetId === budget.id)
            .reduce((sum, t) => sum + t.amount, 0);
        return { ...budget, spent };
    });
    setState({ budgets: newBudgets });
};

const initializeApp = () => {
    setState({
        isLoggedIn: true,
        currentView: 'dashboard',
        isSidebarCollapsed: false,
        isSidebarOpen: false,
        isSubmitting: false,
        isLoading: true,
        toasts: [],
        isMerchantModalOpen: false,
        walletBalance: 50000,
        isFundWalletModalOpen: false,
        ai: null,
        chats: [],
        activeChatId: null,
        isAiThinking: false,
        isHealthCheckLoading: false,
        financialHealthResult: null,
        pots: [
            { id: 1, name: 'Rainy Day', amount: 15000, icon: '☔️' },
            { id: 2, name: 'December Flex', amount: 5000, icon: '🎉' },
        ],
        isPotModalOpen: false,
        editingPotId: null,
        isPotFundModalOpen: false,
        isPotWithdrawModalOpen: false,
        potActionTargetId: null,
        goals: [
            { id: 1, name: 'New iPhone 15', targetAmount: 850000, currentAmount: 250000, targetDate: '2024-12-31', icon: '📱' },
            { id: 2, name: 'Vacation to Zanzibar', targetAmount: 1200000, currentAmount: 950000, targetDate: '2025-06-30', icon: '✈️' },
        ],
        isGoalModalOpen: false,
        editingGoalId: null,
        isContributionModalOpen: false,
        contributingToGoalId: null,
        budgets: [
            { id: 1, name: 'Groceries', amount: 50000, spent: 0, icon: '🛒' },
            { id: 2, name: 'Transport', amount: 25000, spent: 0, icon: '🚕' },
            { id: 3, name: 'Entertainment', amount: 30000, spent: 0, icon: '🍿' },
            { id: 4, name: 'Bills', amount: 75000, spent: 0, icon: '💡' },
        ],
        isBudgetModalOpen: false,
        editingBudgetId: null,
        transactions: [
             { id: 1, description: 'Weekly grocery shopping', amount: 12500, date: '2024-07-28', budgetId: 1 },
             { id: 2, description: 'Bolt to work', amount: 1500, date: '2024-07-29', budgetId: 2 },
             { id: 3, description: 'Cinema ticket', amount: 5000, date: '2024-07-27', budgetId: 3 },
             { id: 4, description: 'DSTV Subscription', amount: 18000, date: '2024-07-25', budgetId: 4, sourceAccountId: 'recurring' },
        ],
        isTransactionModalOpen: false,
        editingTransactionId: null,
        isAiSuggestingCategory: false,
        recurringTransactions: [
            { id: 1, description: 'DSTV Subscription', amount: 18000, budgetId: 4, frequency: 'monthly', startDate: '2024-01-25', nextDueDate: '2024-08-25' },
            { id: 2, description: 'Netflix', amount: 4500, budgetId: 3, frequency: 'monthly', startDate: '2024-01-15', nextDueDate: '2024-08-15' },
        ],
        isRecurringTransactionModalOpen: false,
        editingRecurringTransactionId: null,
        marketplaceProducts: [],
        isMarketplaceLoading: false,
        marketplaceInitialLoad: true,
        marketplaceSearchQuery: '',
        linkedAccounts: [
            { id: 'acc_1', name: 'GTBank Savings', maskedAccountNumber: '**** **** **** 1234', bankIcon: icons.gtbank, isSyncing: false, lastSync: new Date(Date.now() - 86400000) },
            { id: 'acc_2', name: 'Kuda Bank', maskedAccountNumber: '**** **** **** 5678', bankIcon: icons.kuda, isSyncing: false, lastSync: new Date(Date.now() - 172800000) }
        ],
        isLinkingAccount: false,
    });
    recalculateAllBudgets();
    initializeAI();
    setTimeout(() => {
        setState({ isLoading: false });
        render();
    }, 500);
};

const handleFundWallet = () => {
    const amountInput = $('#fund-amount') as HTMLInputElement;
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        showToast("Please enter a valid amount.", "error");
        return;
    }

    setState({ isSubmitting: true });
    render();

    // Simulate payment gateway processing
    setTimeout(() => {
        setState({ 
            walletBalance: state.walletBalance + amount,
            isSubmitting: false,
            isFundWalletModalOpen: false,
        });
        showToast(`${formatCurrency(amount)} added to your wallet!`, 'success');
        render();
    }, 1500);
};

const handleSendMerchantInquiry = () => {
    const businessName = ($('#merchant-business-name') as HTMLInputElement).value.trim();
    const contactName = ($('#merchant-contact-name') as HTMLInputElement).value.trim();
    const contactEmail = ($('#merchant-contact-email') as HTMLInputElement).value.trim();

    if (!businessName || !contactName || !contactEmail) {
        showToast("Please fill out all required fields.", "error");
        return;
    }

    setState({ isSubmitting: true });
    render();

    // Simulate sending data to the "workspace" (e.g., an API endpoint)
    setTimeout(() => {
        setState({
            isSubmitting: false,
            isMerchantModalOpen: false,
        });
        showToast("Thank you for your interest! Our team will contact you at sales@cravour.com shortly.", 'success');
        render();
    }, 1500);
};

const handleSaveTransaction = () => {
    setState({ isSubmitting: true });
    render();

    const description = ($('#transaction-description') as HTMLInputElement).value.trim();
    const amount = parseFloat(($('#transaction-amount') as HTMLInputElement).value);
    const date = ($('#transaction-date') as HTMLInputElement).value;
    const budgetId = parseInt(($('#transaction-budget') as HTMLSelectElement).value);

    if (!description || isNaN(amount) || !date || isNaN(budgetId)) {
        showToast("Please fill out all fields correctly.", "error");
        setState({ isSubmitting: false });
        render();
        return;
    }
    
    if (state.editingTransactionId) {
        const updatedTransactions = state.transactions.map(t =>
            t.id === state.editingTransactionId
                ? { ...t, description, amount, date, budgetId }
                : t
        );
        setState({ transactions: updatedTransactions });
        showToast('Transaction updated!', 'success');
    } else {
        const newTransaction: Transaction = {
            id: Date.now(),
            description,
            amount,
            date,
            budgetId,
        };
        setState({ transactions: [newTransaction, ...state.transactions] });
        showToast('Transaction saved!', 'success');
    }

    recalculateAllBudgets();
    setState({
        isSubmitting: false,
        isTransactionModalOpen: false,
        editingTransactionId: null,
    });
    render();
};

const handleDeleteTransaction = (id: number) => {
    setState({ transactions: state.transactions.filter(t => t.id !== id) });
    recalculateAllBudgets();
    showToast('Transaction deleted.', 'info');
    render();
};

const handleSaveRecurringTransaction = () => {
    setState({ isSubmitting: true });
    render();

    const description = ($('#recurring-tx-description') as HTMLInputElement).value.trim();
    const amount = parseFloat(($('#recurring-tx-amount') as HTMLInputElement).value);
    const budgetId = parseInt(($('#recurring-tx-budget') as HTMLSelectElement).value);
    const frequency = ($('#recurring-tx-frequency') as HTMLSelectElement).value as 'weekly' | 'monthly';
    const startDate = ($('#recurring-tx-start-date') as HTMLInputElement).value;

    if (!description || isNaN(amount) || isNaN(budgetId) || !frequency || !startDate) {
        showToast('Please fill out all fields correctly.', 'error');
        setState({ isSubmitting: false });
        render();
        return;
    }
    
    let nextDueDate = new Date(startDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    while (nextDueDate < today) {
        if(frequency === 'monthly') {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        } else {
            nextDueDate.setDate(nextDueDate.getDate() + 7);
        }
    }

    if (state.editingRecurringTransactionId) {
        const updatedTxs = state.recurringTransactions.map(tx =>
            tx.id === state.editingRecurringTransactionId
                ? { ...tx, description, amount, budgetId, frequency, startDate, nextDueDate: nextDueDate.toISOString().split('T')[0] }
                : tx
        );
        setState({ recurringTransactions: updatedTxs });
        showToast('Recurring transaction updated!', 'success');
    } else {
        const newTx: RecurringTransaction = {
            id: Date.now(),
            description,
            amount,
            budgetId,
            frequency,
            startDate,
            nextDueDate: nextDueDate.toISOString().split('T')[0],
        };
        setState({ recurringTransactions: [...state.recurringTransactions, newTx] });
        showToast('Recurring transaction created!', 'success');
    }
    
    setState({
        isSubmitting: false,
        isRecurringTransactionModalOpen: false,
        editingRecurringTransactionId: null,
    });
    render();
};

const handleDeleteRecurringTransaction = (id: number) => {
    setState({ recurringTransactions: state.recurringTransactions.filter(tx => tx.id !== id) });
    showToast('Recurring transaction deleted.', 'info');
    render();
};

const handleSavePot = () => {
    setState({ isSubmitting: true });
    render();

    const name = ($('#pot-name') as HTMLInputElement).value.trim();
    const icon = ($('#pot-icon') as HTMLInputElement).value.trim();

    if (!name) {
        showToast('Pot name is required.', 'error');
        setState({ isSubmitting: false });
        render();
        return;
    }

    if (state.editingPotId) {
        const updatedPots = state.pots.map(p =>
            p.id === state.editingPotId ? { ...p, name, icon } : p
        );
        setState({ pots: updatedPots });
        showToast('Pot updated successfully!', 'success');
    } else {
        const newPot: Pot = {
            id: Date.now(),
            name,
            icon: icon || '🍯',
            amount: 0,
        };
        setState({ pots: [...state.pots, newPot] });
        showToast('New pot created!', 'success');
    }

    setState({
        isSubmitting: false,
        isPotModalOpen: false,
        editingPotId: null,
    });
    render();
};

const handleDeletePot = (id: number) => {
    const potToDelete = state.pots.find(p => p.id === id);
    if (!potToDelete) return;
    
    const newWalletBalance = state.walletBalance + potToDelete.amount;

    setState({
        pots: state.pots.filter(p => p.id !== id),
        walletBalance: newWalletBalance,
    });
    showToast(`Pot "${potToDelete.name}" deleted. ${formatCurrency(potToDelete.amount)} returned to wallet.`, 'success');
    render();
};

const handleSavePotFund = () => {
    const amountInput = $('#pot-action-amount') as HTMLInputElement;
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        showToast("Please enter a valid amount.", "error");
        return;
    }
    if (amount > state.walletBalance) {
        showToast("Insufficient funds in your wallet.", "error");
        return;
    }
    if (!state.potActionTargetId) return;

    setState({ isSubmitting: true });
    render();

    setTimeout(() => {
        const newPots = state.pots.map(p => 
            p.id === state.potActionTargetId ? { ...p, amount: p.amount + amount } : p
        );
        setState({
            pots: newPots,
            walletBalance: state.walletBalance - amount,
            isSubmitting: false,
            isPotFundModalOpen: false,
            potActionTargetId: null,
        });
        showToast(`${formatCurrency(amount)} added to pot!`, 'success');
        render();
    }, 500);
};

const handleSavePotWithdraw = () => {
    const amountInput = $('#pot-action-amount') as HTMLInputElement;
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        showToast("Please enter a valid amount.", "error");
        return;
    }
    if (!state.potActionTargetId) return;

    const pot = state.pots.find(p => p.id === state.potActionTargetId);
    if (!pot || amount > pot.amount) {
        showToast("Insufficient funds in this pot.", "error");
        return;
    }

    setState({ isSubmitting: true });
    render();

    setTimeout(() => {
        const newPots = state.pots.map(p => 
            p.id === state.potActionTargetId ? { ...p, amount: p.amount - amount } : p
        );
        setState({
            pots: newPots,
            walletBalance: state.walletBalance + amount,
            isSubmitting: false,
            isPotWithdrawModalOpen: false,
            potActionTargetId: null,
        });
        showToast(`${formatCurrency(amount)} withdrawn to wallet!`, 'success');
        render();
    }, 500);
};

const handleSaveGoal = () => {
    setState({ isSubmitting: true });
    render();

    const name = ($('#goal-name') as HTMLInputElement).value.trim();
    const targetAmount = parseFloat(($('#goal-target') as HTMLInputElement).value);
    const currentAmount = parseFloat(($('#goal-current') as HTMLInputElement).value);
    const icon = ($('#goal-icon') as HTMLInputElement).value.trim();
    const targetDate = ($('#goal-date') as HTMLInputElement).value;

    if (!name || isNaN(targetAmount) || isNaN(currentAmount)) {
        showToast('Please fill out all required fields correctly.', 'error');
        setState({ isSubmitting: false });
        render();
        return;
    }

    if (state.editingGoalId) {
        const updatedGoals = state.goals.map(g =>
            g.id === state.editingGoalId
                ? { ...g, name, targetAmount, currentAmount, icon, targetDate }
                : g
        );
        setState({ goals: updatedGoals });
        showToast('Goal updated!', 'success');
    } else {
        const newGoal: Goal = {
            id: Date.now(),
            name,
            targetAmount,
            currentAmount,
            icon: icon || '🎯',
            targetDate
        };
        setState({ goals: [...state.goals, newGoal] });
        showToast('New goal created!', 'success');
    }

    setState({
        isSubmitting: false,
        isGoalModalOpen: false,
        editingGoalId: null,
    });
    render();
};

const handleSaveContribution = () => {
    const amountInput = $('#contribution-amount') as HTMLInputElement;
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        showToast("Please enter a valid amount.", "error");
        return;
    }
    if (amount > state.walletBalance) {
        showToast("Insufficient funds in your wallet.", "error");
        return;
    }
    if (!state.contributingToGoalId) return;
    
    const goal = state.goals.find(g => g.id === state.contributingToGoalId);
    if (!goal) return;

    setState({ isSubmitting: true });
    render();
    
    setTimeout(() => {
        const newGoals = state.goals.map(g => 
            g.id === state.contributingToGoalId ? { ...g, currentAmount: g.currentAmount + amount } : g
        );
        
        setState({
            goals: newGoals,
            walletBalance: state.walletBalance - amount,
            isSubmitting: false,
            isContributionModalOpen: false,
            contributingToGoalId: null,
        });
        showToast(`Contribution of ${formatCurrency(amount)} made to "${goal.name}"!`, 'success');
        render();
    }, 500);
};

const handleSaveBudget = () => {
    setState({ isSubmitting: true });
    render();

    const name = ($('#budget-name') as HTMLInputElement).value.trim();
    const amount = parseFloat(($('#budget-amount') as HTMLInputElement).value);
    const icon = ($('#budget-icon') as HTMLInputElement).value.trim();

    if (!name || isNaN(amount)) {
        showToast('Please fill out name and amount correctly.', 'error');
        setState({ isSubmitting: false });
        render();
        return;
    }

    if (state.editingBudgetId) {
        const updatedBudgets = state.budgets.map(b =>
            b.id === state.editingBudgetId ? { ...b, name, amount, icon } : b
        );
        setState({ budgets: updatedBudgets });
        showToast('Budget updated!', 'success');
    } else {
        const newBudget: Budget = {
            id: Date.now(),
            name,
            amount,
            icon: icon || '💰',
            spent: 0,
        };
        setState({ budgets: [...state.budgets, newBudget] });
        showToast('New budget created!', 'success');
    }

    recalculateAllBudgets();
    setState({
        isSubmitting: false,
        isBudgetModalOpen: false,
        editingBudgetId: null,
    });
    render();
};

const handleLinkNewAccount = () => {
    setState({ isLinkingAccount: true });
    render();

    setTimeout(() => {
        const newAccount: LinkedAccount = {
            id: `acc_${Date.now()}`,
            name: 'Access Bank',
            maskedAccountNumber: `**** **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
            bankIcon: icons.access,
            isSyncing: false,
            lastSync: null,
        };
        setState({ 
            linkedAccounts: [...state.linkedAccounts, newAccount],
            isLinkingAccount: false,
        });
        showToast('Account linked successfully!', 'success');
        render();
    }, 2000);
};

const handleUnlinkAccount = (id: string) => {
    setState({
        linkedAccounts: state.linkedAccounts.filter(acc => acc.id !== id),
    });
    showToast('Account unlinked.', 'info');
    render();
};

const handleSyncAccount = (id: string) => {
    const accountIndex = state.linkedAccounts.findIndex(acc => acc.id === id);
    if (accountIndex === -1) return;

    state.linkedAccounts[accountIndex].isSyncing = true;
    setState({ linkedAccounts: [...state.linkedAccounts] });
    render();

    setTimeout(() => {
        const newTransactionCount = Math.floor(Math.random() * 3) + 1;
        const newTransactions: Transaction[] = [];
        const account = state.linkedAccounts[accountIndex];

        for (let i = 0; i < newTransactionCount; i++) {
            const randomBudget = state.budgets[Math.floor(Math.random() * state.budgets.length)];
            const newTx: Transaction = {
                id: Date.now() + i,
                description: `Synced from ${account.name}`,
                amount: Math.floor(Math.random() * 5000) + 500,
                date: new Date(Date.now() - Math.random() * 5 * 86400000).toISOString().split('T')[0], // within last 5 days
                budgetId: randomBudget.id,
                sourceAccountId: account.id,
            };
            newTransactions.push(newTx);
        }

        account.isSyncing = false;
        account.lastSync = new Date();
        
        setState({
            transactions: [...state.transactions, ...newTransactions],
            linkedAccounts: [...state.linkedAccounts]
        });
        
        recalculateAllBudgets();
        showToast(`${newTransactionCount} new transaction(s) synced from ${account.name}.`, 'success');
        render();

    }, 2500);
};

// --- Main Initialization ---
const init = () => {
    document.addEventListener('click', handleEvent);
    document.addEventListener('submit', handleEvent);
    
    setState({ isLoading: false });
    render();
};

init();