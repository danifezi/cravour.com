import { GoogleGenAI, Chat, Type } from "@google/genai";

// --- SVG Icons ---
const icons = {
    logo: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 7L12 12L22 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    coPilot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0Zm-2.39.264a.75.75 0 0 0 1.06 1.06l2.122-2.12a.75.75 0 0 0-1.061-1.061L5.11 12.264Zm13.84-.001a.75.75 0 0 0-1.06-1.06l-2.123 2.12a.75.75 0 0 0 1.061 1.061l2.122-2.12ZM12 7.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V8.25A.75.75 0 0 1 12 7.5ZM5.11 7.236a.75.75 0 0 0-1.06 1.06l2.122 2.122a.75.75 0 1 0 1.06-1.06L5.11 7.236Zm13.84-.001a.75.75 0 1 0-1.06-1.06l-2.122 2.122a.75.75 0 0 0 1.06 1.06l2.122-2.122ZM12 16.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z"/></svg>`,
    budgets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.925 5.512a2.25 2.25 0 0 0-2.175-1.762H5.25a2.25 2.25 0 0 0-2.175 1.762l-1.313 7.875A2.25 2.25 0 0 0 3.938 16h16.125a2.25 2.25 0 0 0 2.175-2.613l-1.313-7.875ZM5.25 5.25h13.5c.31 0 .59.167.737.438l1.313 7.875a.75.75 0 0 1-.725.887H3.938a.75.75 0 0 1-.725-.887l1.313-7.875A.75.75 0 0 1 5.25 5.25Z"/><path d="M10 10.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z M18 8.625a.75.75 0 0 0-1.5 0V11a.75.75 0 0 0 1.5 0V8.625Z"/><path d="M4.5 17.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z"/></svg>`,
    deals: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.964 2.634a2.25 2.25 0 0 0-3.182 0l-7.25 7.25a2.25 2.25 0 0 0 0 3.182l7.25 7.25a2.25 2.25 0 0 0 3.182 0l7.25-7.25a2.25 2.25 0 0 0 0-3.182l-7.25-7.25ZM11 8.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" /></svg>`,
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
};

// --- Nigerian Market Data ---
const CATEGORIES = ["Groceries", "Transportation", "Bills & Utilities", "Entertainment", "Shopping", "Data & Airtime", "Other"];

const formatNaira = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
};

const sampleExpenses = [
    { id: 1, name: "Bolt ride to VI", category: "Transportation", amount: 4500, date: "2024-07-15" },
    { id: 2, name: "DSTV Subscription", category: "Bills & Utilities", amount: 18500, date: "2024-07-14" },
    { id: 3, name: "Jumia food order", category: "Groceries", amount: 8200, date: "2024-07-12" },
    { id: 4, name: "Airtel Data", category: "Data & Airtime", amount: 5000, date: "2024-07-10" },
    { id: 5, name: "Market run at Balogun", category: "Shopping", amount: 25000, date: "2024-07-08" },
];

const sampleBudgets = [
    { category: "Groceries", amount: 75000 },
    { category: "Transportation", amount: 50000 },
    { category: "Entertainment", amount: 40000 },
    { category: "Shopping", amount: 60000 },
];

const sampleDeals = [
    { id: 1, merchantId: 1, merchantName: "Shoprite", productName: "5kg Bag of Rice", price: 8900, category: "Groceries", imageUrl: "https://images.unsplash.com/photo-1586201375765-c124a27544e3?q=80&w=400&auto=format&fit=crop", location: "Lagos" },
    { id: 2, merchantId: 2, merchantName: "Konga", productName: "Infinix Note 40", price: 285000, category: "Shopping", imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?q=80&w=400&auto=format&fit=crop", location: "Lagos" },
    { id: 3, merchantId: 3, merchantName: "Filmhouse Cinemas", productName: "Weekend Movie Ticket", price: 5000, category: "Entertainment", imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop", location: "Abuja" },
    { id: 4, merchantId: 4, merchantName: "Jumia", productName: "Samsung 32-inch TV", price: 180000, category: "Shopping", imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f82e45?q=80&w=400&auto=format&fit=crop", location: "Port Harcourt" },
    { id: 5, merchantId: 5, merchantName: "Local Market", productName: "Weekly Veggie Box", price: 7500, category: "Groceries", imageUrl: "https://images.unsplash.com/photo-1597362925123-77861d3fbac8?q=80&w=400&auto=format&fit=crop", location: "Ibadan" },
    { id: 6, merchantId: 6, merchantName: "i-Fitness", productName: "Monthly Gym Plan", price: 22000, category: "Fitness", imageUrl: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=400&auto=format&fit=crop", location: "Abuja" },
    { id: 7, merchantId: 2, merchantName: "Konga", productName: "Wireless Earbuds", price: 15500, category: "Shopping", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop", location: "Lagos" },
];

class CravourApp {
    private state: {
        theme: 'light' | 'dark';
        isLoggedIn: boolean;
        isMobileMenuOpen: boolean;
        showAuthModal: boolean;
        authView: 'login' | 'signup';
        accountType: 'personal' | 'business' | null;
        userTypeSelection: 'personal' | 'business';

        // Personal user state
        currentView: string;
        coPilotChat: Chat | null;
        coPilotHistory: { role: 'user' | 'model', parts: { text: string }[] }[];
        isCoPilotLoading: boolean;
        expenses: any[];
        nextExpenseId: number;
        budgets: any[];
        deals: any[];
        userLocation: string;
        showPaymentModal: boolean;
        dealToPurchase: any | null;
        paymentStep: 'form' | 'processing' | 'success';

        // Business user state
        enterpriseView: string;
        transactions: any[];
        nextTransactionId: number;
        
        // Demo state
        demoChatHistory: { role: 'user' | 'model', parts: { text: string }[] }[];
        isDemoLoading: boolean;

        ai: GoogleGenAI | null;
    } = {
        theme: 'dark',
        isLoggedIn: false,
        isMobileMenuOpen: false,
        showAuthModal: false,
        authView: 'login',
        accountType: null,
        userTypeSelection: 'personal',

        currentView: 'co-pilot',
        coPilotChat: null,
        coPilotHistory: [],
        isCoPilotLoading: false,
        expenses: [],
        nextExpenseId: 1,
        budgets: [],
        deals: [],
        userLocation: "Lagos",
        showPaymentModal: false,
        dealToPurchase: null,
        paymentStep: 'form',

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
        
        this.setState({
            demoChatHistory: [
                { 
                    role: 'model', 
                    parts: [{ text: "Hi! I'm your Naija shopping assistant. I've analyzed some sample budgets and local deals. Ask me a question, or try a smart query to see how I can help you save money!" }]
                },
            ]
        });

        document.addEventListener('click', this.handleDelegatedClick.bind(this));
        document.addEventListener('submit', this.handleDelegatedSubmit.bind(this));
        document.addEventListener('change', this.handleDelegatedChange.bind(this));

        this.render();
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
            case 'show-login': this.showAuthModal('login'); break;
            case 'show-signup': this.showAuthModal('signup'); break;
            case 'close-modal': 
                if (this.state.showAuthModal) this.hideAuthModal();
                if (this.state.showPaymentModal) this.hidePaymentModal();
                break;
            case 'set-auth-view': this.setAuthView(view as 'login' | 'signup'); break;
            case 'set-account-type': this.setUserTypeSelection(view as 'personal' | 'business'); break;
            case 'logout': this.logout(); break;
            case 'navigate': this.navigate(view as string); break;
            case 'delete-expense': this.deleteExpense(parseInt((actionTarget as HTMLElement).dataset.id || '0')); break;
            case 'demo-smart-query': this.handleDemoQuery(null, actionTarget.getAttribute('data-query') || ''); break;
            case 'buy-now': this.handleBuyNow(parseInt((actionTarget as HTMLElement).dataset.id || '0')); break;
            case 'confirm-payment': this.handleConfirmPayment(); break;
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
            case 'add-budget-form': this.addBudget(form); break;
        }
    }

    private handleDelegatedChange(e: Event) {
        const target = e.target as HTMLSelectElement;
        if (target.id === 'location-selector') {
            this.setState({ userLocation: target.value });
        }
    }
    
    // --- App Logic ---
    private toggleTheme() {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        this.setState({ theme: newTheme });
    }

    private toggleMobileMenu() {
        this.setState({ isMobileMenuOpen: !this.state.isMobileMenuOpen });
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
            this.setupPersonalAccount();
        } else {
            this.setupBusinessAccount();
        }
        this.hideAuthModal();
    }

    private setupPersonalAccount() {
        const coPilotChat = this.state.ai?.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: `You are Cravour, a friendly and savvy Nigerian AI shopping assistant...` }
        });
        this.setState({ 
            currentView: 'co-pilot',
            coPilotChat: coPilotChat || null,
            expenses: [...sampleExpenses],
            nextExpenseId: sampleExpenses.length + 1,
            budgets: [...sampleBudgets],
            deals: [...sampleDeals],
        });
        if (coPilotChat) this.startCoPilotChat();
    }

    private setupBusinessAccount() {
        // For demo, we'll assign the business user to "Konga" (merchantId: 2)
        this.setState({
            enterpriseView: 'dashboard',
            transactions: [], // Start with no transactions
        });
    }

    private async startCoPilotChat() {
        if (!this.state.coPilotChat) return;
        this.setState({ isCoPilotLoading: true });
        const response = await this.state.coPilotChat?.sendMessage({message: "Hello!"});
        if(response) {
            this.setState({ 
                coPilotHistory: [{ role: 'model' as const, parts: [{ text: response.text }] }],
                isCoPilotLoading: false 
            });
        }
    }
    
    private logout() {
        this.setState({
            isLoggedIn: false,
            accountType: null,
            currentView: 'co-pilot',
            enterpriseView: 'dashboard',
            expenses: [],
            coPilotChat: null,
            coPilotHistory: [],
            budgets: [],
            deals: [],
            transactions: [],
        });
    }

    private navigate(view: string) {
        if(this.state.isMobileMenuOpen) this.toggleMobileMenu();
        if (view.startsWith('#')) {
            document.querySelector(view)?.scrollIntoView({ behavior: 'smooth' });
        } else if (this.state.accountType === 'personal') {
            this.setState({ currentView: view });
        } else if (this.state.accountType === 'business') {
            this.setState({ enterpriseView: view });
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
            form.reset();
        } else {
            newExpenseData = form;
        }

        const newExpense = { id: this.state.nextExpenseId, ...newExpenseData };
        this.setState({
            expenses: [newExpense, ...this.state.expenses],
            nextExpenseId: this.state.nextExpenseId + 1,
        });
    }
    
    private deleteExpense(id: number) {
        this.setState({ expenses: this.state.expenses.filter(exp => exp.id !== id) });
    }

    private addBudget(form: HTMLFormElement) {
        const formData = new FormData(form);
        const newBudget = {
            category: formData.get('category') as string,
            amount: parseFloat(formData.get('amount') as string),
        };
        if (!newBudget.category || isNaN(newBudget.amount) || newBudget.amount < 0) return;
        if (this.state.budgets.some(b => b.category === newBudget.category)) return;
        this.setState({ budgets: [...this.state.budgets, newBudget] });
        form.reset();
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
            // Add to user's expenses
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
        // For demo, filter transactions for the logged-in merchant ("Konga", merchantId: 2)
        const merchantTransactions = this.state.transactions.filter(t => t.merchantId === 2);
        const totalRevenue = merchantTransactions.reduce((sum, t) => sum + t.price, 0);
        const totalSales = merchantTransactions.length;
        return { totalRevenue, totalSales, transactions: merchantTransactions };
    }

    // --- AI Co-pilot Logic ---
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

        try {
            const result = await this.state.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Based on the provided budgets and deals, answer the user's question: "${query}"`,
                config: {
                    systemInstruction: `You are demonstrating Cravour, an expert Nigerian shopping assistant. Your goal is to provide a clear, actionable insight. All monetary values are in Nigerian Naira (NGN).
                    Sample Data: 
                    Budgets: ${JSON.stringify(sampleBudgets)}
                    Local Deals: ${JSON.stringify(sampleDeals)}`,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            insight: {
                                type: Type.OBJECT,
                                properties: {
                                    icon: { type: Type.STRING, description: "Choose from: 'insight', 'deals', 'budgets'" },
                                    title: { type: Type.STRING },
                                    detail: { type: Type.STRING, description: "A detailed answer to the user's query. Can include HTML like <strong> for emphasis." },
                                    recommendation: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            });
            const responseText = result.text;
            
            this.setState({
                demoChatHistory: [...newHistory, { role: 'model' as const, parts: [{ text: responseText }] }],
                isDemoLoading: false
            });
        } catch (error) {
            console.error("Demo AI Error:", error);
            this.setState({
                demoChatHistory: [...newHistory, { role: 'model' as const, parts: [{ text: "Sorry, I couldn't process that request. The server might be busy. Please try again." }] }],
                isDemoLoading: false
            });
        }
    }
    
    private async handleCoPilotQuery(form: HTMLFormElement) {
        if (this.state.isCoPilotLoading || !this.state.coPilotChat) return;

        const input = form.querySelector('input') as HTMLInputElement;
        const query = input.value.trim();
        if (!query) return;
        
        const fullQuery = `
            Context: Here is my current financial and local deals data in JSON format.
            My Location: ${this.state.userLocation}
            Expenses: ${JSON.stringify(this.state.expenses, null, 2)}
            Budgets: ${JSON.stringify(this.state.budgets, null, 2)}
            Deals: ${JSON.stringify(this.state.deals, null, 2)}
            My question is: "${query}"
        `;
        
        const historyWithUserMsg = [...this.state.coPilotHistory, { role: 'user' as const, parts: [{ text: query }] }];
        
        this.setState({ coPilotHistory: historyWithUserMsg, isCoPilotLoading: true });
        input.value = '';

        try {
            const stream = await this.state.coPilotChat.sendMessageStream({ message: fullQuery });
            let historyWithPlaceholder = [...historyWithUserMsg, { role: 'model' as const, parts: [{ text: "" }] }];
            this.setState({ coPilotHistory: historyWithPlaceholder });

            let fullResponse = "";
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                historyWithPlaceholder[historyWithPlaceholder.length - 1].parts[0].text = fullResponse;
                this.setState({ coPilotHistory: [...historyWithPlaceholder] });
            }
        } catch(error) {
            console.error("Co-pilot AI Error:", error);
            this.setState({coPilotHistory: [...historyWithUserMsg, { role: 'model' as const, parts: [{text: "I encountered an error."}]}]});
        } finally {
            this.setState({ isCoPilotLoading: false });
        }
    }


    // --- Render Methods ---
    private render() {
        document.body.dataset.theme = this.state.theme;
        document.body.dataset.authState = this.state.isLoggedIn ? 'logged-in' : 'logged-out';
        document.body.classList.toggle('mobile-menu-open', this.state.isMobileMenuOpen);

        this.renderBySelector('#header-placeholder', this.renderHeader());
        
        if (!this.state.isLoggedIn) {
            this.renderLandingPage();
        } else {
            this.renderAppDashboard();
        }
        
        this.renderAuthModal();
        this.renderPaymentModal();
    }
    
    private renderHeader(): string {
        return `
            <header class="header">
                <div class="container header-container">
                    <a href="#" class="header-logo" data-action="navigate" data-view="co-pilot">
                        <span class="logo-svg">${icons.logo}</span>
                        Cravour
                    </a>
                    <nav class="header-nav">
                        <ul class="nav-list">
                            <li><button class="nav-button" data-action="navigate" data-view="#features">Features</button></li>
                            <li><button class="nav-button" data-action="navigate" data-view="#for-merchants">For Merchants</button></li>
                        </ul>
                    </nav>
                    <div class="header-actions">
                        <button class="theme-toggle-btn" data-action="toggle-theme" aria-label="Toggle theme">
                            ${this.state.theme === 'light' ? icons.moon : icons.sun}
                        </button>
                        <button class="btn btn-secondary-outline" data-action="show-login">Log In</button>
                        <button class="btn btn-primary" data-action="show-signup">Get Started</button>
                    </div>
                    <button class="mobile-menu-toggle" data-action="toggle-mobile-menu" aria-label="Toggle menu">
                        ${icons.hamburger}
                    </button>
                </div>
            </header>
            ${this.renderMobileMenu()}
        `;
    }

    private renderMobileMenu(): string {
        return `
            <div class="mobile-nav-container ${this.state.isMobileMenuOpen ? 'open' : ''}">
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
                        <button class="btn btn-primary" data-action="show-signup">Get Started Free</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    private renderLandingPage() {
        this.renderBySelector('#hero-container', this.renderInteractiveHero());
        this.renderBySelector('.features-grid', this.renderFeatures());
        this.renderBySelector('#for-merchants-container', this.renderForMerchants());
        this.renderBySelector('.footer .container', this.renderFooter());
    }

    private renderInteractiveHero(): string {
        const smartQueries = ["Find me deals at Shoprite", "How's my 'Chop Money' budget?", "Any deals for a new phone?"];
        return `
            <div class="interactive-hero-grid">
                <div class="hero-content">
                    <h1 class="fade-in">Budget Smarter, Shop Local, Save More.</h1>
                    <p class="lead fade-in-delay1">Cravour is your personal AI shopping assistant for Nigeria. We help you stick to your budget by finding the best deals from merchants, from Lagos to Abuja.</p>
                    <div class="hero-actions fade-in-delay2">
                        <button class="btn btn-primary btn-lg" data-action="show-signup">Start Saving For Free</button>
                    </div>
                </div>
                <div class="chat-container fade-in-delay3">
                    <div class="chat-messages" id="demo-chat-messages">${this.renderChatHistory(this.state.demoChatHistory, this.state.isDemoLoading)}</div>
                    <div class="smart-queries">${smartQueries.map(q => `<button class="smart-query-btn" data-action="demo-smart-query" data-query="${q}">${q}</button>`).join('')}</div>
                    <form class="chat-form" id="demo-chat-form">
                        <input type="text" class="input-field" placeholder="Ask for deals, advice, and more..." required ${this.state.isDemoLoading ? 'disabled' : ''}>
                        <button type="submit" class="btn btn-primary" aria-label="Send message" ${this.state.isDemoLoading ? 'disabled' : ''}>
                            ${this.state.isDemoLoading ? `<div class="spinner"></div>` : `<span class="btn-icon">${icons.send}</span>`}
                        </button>
                    </form>
                </div>
            </div>`;
    }

    private renderInsightCard(insight: any): string {
        const icon = icons[insight.icon as keyof typeof icons] || icons.insight;
        return `
            <div class="ai-message message insight-card">
                <div class="insight-header"><span class="insight-icon">${icon}</span><h4 class="insight-title">${insight.title}</h4></div>
                <div class="insight-body"><p class="insight-detail">${insight.detail}</p><p class="insight-recommendation">${insight.recommendation}</p></div>
            </div>`;
    }

    private renderChatHistory(history: any[], isLoading: boolean): string {
        let html = history.map(msg => {
            if (msg.role === 'model') {
                try {
                    const insightData = JSON.parse(msg.parts[0].text);
                    if (insightData.insight) return this.renderInsightCard(insightData.insight);
                } catch (e) { /* Not a JSON insight, render as normal text */ }
            }
            return `<div class="${msg.role === 'user' ? 'user' : 'ai'}-message message">${msg.parts[0].text.replace(/\n/g, '<br>')}</div>`;
        }).join('');
    
        if (isLoading && (history.length === 0 || history[history.length - 1]?.role === 'user')) {
            html += `<div class="ai-message message thinking-indicator"><div class="spinner"></div><span>Cravour is thinking...</span></div>`;
        }
        return html;
    }

    private renderFeatures(): string {
         const featuresData = [
            { icon: icons.budgets, title: 'Smart Budgeting', text: 'Create budgets that work for you. Track your spending in Naira and always know where your money is going.' },
            { icon: icons.deals, title: 'Local Naija Deals', text: 'Discover exclusive offers from Nigerian shops. We connect your budget needs with the best prices in your area.' },
            { icon: icons.coPilot, title: 'AI Shopping Assistant', text: 'Your personal deal-finder. Ask for product recommendations or savings advice and get instant, smart answers.' },
        ];
        return featuresData.map(f => `<div class="feature-card"><div class="feature-icon">${f.icon}</div><h3>${f.title}</h3><p>${f.text}</p></div>`).join('');
    }

    private renderForMerchants(): string {
       return `
            <div class="for-merchants-content">
                <h2 class="section-title">Partner with Cravour</h2>
                <p class="section-subtitle">Reach motivated Nigerian customers who are actively looking to buy. Join our network of trusted merchants and grow your business.</p>
                <ul class="merchant-benefits"><li>Attract new, high-intent customers.</li><li>Showcase your products and deals directly to shoppers.</li><li>Receive payments instantly and track your sales.</li></ul>
                <button class="btn btn-primary btn-lg" data-action="show-signup">Partner With Us</button>
            </div>`;
    }
    
    private renderFooter(): string { return `<p>&copy; ${new Date().getFullYear()} Cravour Nigeria. All rights reserved.</p>`; }

    private renderAuthModal() {
        const modal = document.getElementById('auth-modal')!;
        if (this.state.showAuthModal) {
            modal.classList.remove('hidden');
            this.renderBySelector('#auth-form-container', `
                <button class="modal-close-btn" aria-label="Close authentication form" data-action="close-modal">&times;</button>
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
        return `<form id="auth-form" class="auth-form"><div class="form-group"><label for="signup-name">Full Name</label><input type="text" id="signup-name" class="input-field" required value="Demo User"></div>${this.renderAuthFormFields()} ${this.renderAuthTypeToggle()} <button type="submit" class="btn btn-primary">Create Account</button></form>`;
    }
    
    private renderAuthFormFields(): string {
        return `<div class="form-group"><label for="email">Email</label><input type="email" id="email" class="input-field" required value="demo@cravour.com"></div><div class="form-group"><label for="password">Password</label><input type="password" id="password" class="input-field" required value="password"></div>`;
    }

    private renderAuthTypeToggle(): string {
        return `
            <div class="form-group">
                <label>Account Type</label>
                <div class="auth-type-toggle">
                    <button type="button" class="${this.state.userTypeSelection === 'personal' ? 'active' : ''}" data-action="set-account-type" data-view="personal">Personal</button>
                    <button type="button" class="${this.state.userTypeSelection === 'business' ? 'active' : ''}" data-action="set-account-type" data-view="business">Business</button>
                </div>
            </div>
        `;
    }

    private renderAppDashboard() {
        if (this.state.accountType === 'personal') {
            this.renderBySelector('#app-dashboard', `<aside class="sidebar">${this.renderPersonalSidebar()}</aside><main class="main-content">${this.renderPersonalMainContent()}</main>`);
        } else if (this.state.accountType === 'business') {
            this.renderBySelector('#app-dashboard', `<aside class="sidebar enterprise-sidebar">${this.renderEnterpriseSidebar()}</aside><main class="main-content">${this.renderEnterpriseMainContent()}</main>`);
        }
    }
    
    // --- Personal Dashboard ---
    private renderPersonalSidebar(): string {
        const navItems = [
            { view: 'co-pilot', label: 'AI Assistant', icon: icons.coPilot },
            { view: 'budgets', label: 'Budgets', icon: icons.budgets },
            { view: 'deals', label: 'Deals', icon: icons.deals },
            { view: 'settings', label: 'Settings', icon: icons.settings },
        ];
        return this.renderSidebarBase(navItems, this.state.currentView);
    }
    
    private renderPersonalMainContent(): string {
        switch(this.state.currentView) {
            case 'co-pilot': return this.renderCoPilotView();
            case 'budgets': return this.renderBudgetsView();
            case 'deals': return this.renderDealsView();
            case 'settings': return this.renderSettingsView();
            default: return `<h2>Not Found</h2>`;
        }
    }

    // --- Enterprise Dashboard ---
    private renderEnterpriseSidebar(): string {
        const navItems = [
            { view: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
            { view: 'transactions', label: 'Transactions', icon: icons.transactions },
            { view: 'profile', label: 'Profile', icon: icons.profile },
        ];
        return this.renderSidebarBase(navItems, this.state.enterpriseView);
    }

    private renderEnterpriseMainContent(): string {
        switch(this.state.enterpriseView) {
            case 'dashboard': return this.renderEnterpriseDashboardView();
            case 'transactions': return this.renderEnterpriseTransactionsView();
            case 'profile': return this.renderSettingsView(); // Re-use settings view for profile
            default: return `<h2>Not Found</h2>`;
        }
    }

    private renderSidebarBase(navItems: any[], activeView: string): string {
        return `
            <div class="sidebar-header"><a href="#" class="sidebar-logo"><span class="logo-svg">${icons.logo}</span>Cravour</a></div>
            <nav class="nav"><ul class="nav-list">
                ${navItems.map(item => `<li><a href="#" class="nav-link ${activeView === item.view ? 'active' : ''}" data-action="navigate" data-view="${item.view}"><span class="btn-icon">${item.icon}</span>${item.label}</a></li>`).join('')}
            </ul></nav>
            <div class="sidebar-footer">
                 <button class="theme-toggle-btn" data-action="toggle-theme" aria-label="Toggle theme"><span class="theme-icon-placeholder">${this.state.theme === 'light' ? icons.moon : icons.sun}</span></button>
                <a href="#" class="nav-link" data-action="logout"><span class="btn-icon">${icons.logout}</span>Logout</a>
            </div>`;
    }
    
    private renderCoPilotView(): string {
        return `
            <div class="view-header"><h1>AI Shopping Assistant</h1></div>
            <div class="unified-co-pilot-grid">
                <div class="co-pilot-chat-area"><div class="chat-container">
                    <div class="chat-messages" id="copilot-chat-messages">${this.renderChatHistory(this.state.coPilotHistory, this.state.isCoPilotLoading)}</div>
                    <form class="chat-form" id="copilot-chat-form">
                        <input type="text" class="input-field" placeholder="Ask for deals, advice, and more..." required ${this.state.isCoPilotLoading ? 'disabled' : ''}>
                        <button type="submit" class="btn btn-primary" aria-label="Send message" ${this.state.isCoPilotLoading ? 'disabled' : ''}>${this.state.isCoPilotLoading ? `<div class="spinner"></div>` : `<span class="btn-icon">${icons.send}</span>`}</button>
                    </form>
                </div></div>
                <div class="expenses-management-area">${this.renderExpensesContent()}</div>
            </div>`;
    }

    private renderExpensesContent(): string {
        const listContent = this.state.expenses.length > 0
            ? this.state.expenses.map(exp => `
                <div class="expense-item">
                    <div class="expense-details"><div class="name">${exp.name}</div><div class="category"><span class="tag ${exp.category.replace(/ & /g, '-').replace(/ /g,'-')}">${exp.category}</span> on ${exp.date}</div></div>
                    <div class="expense-amount">${formatNaira(exp.amount)}</div>
                    <button class="delete-btn" data-action="delete-expense" data-id="${exp.id}" aria-label="Delete expense">${icons.trash}</button>
                </div>`).join('')
            : `<div class="empty-state">Add an expense to get started.</div>`;

        return `
            <div class="card expenses-management-card">
                <div class="add-expense-container"><h2>Add New Expense</h2><form id="add-expense-form">
                    <div class="form-group"><label for="expense-name">Expense Name</label><input type="text" id="expense-name" name="name" class="input-field" required></div>
                    <div class="form-group"><label for="expense-amount">Amount (₦)</label><input type="number" id="expense-amount" name="amount" class="input-field" step="100" required></div>
                    <div class="form-group"><label for="expense-date">Date</label><input type="date" id="expense-date" name="date" class="input-field" required value="${new Date().toISOString().substring(0, 10)}"></div>
                    <div class="form-group"><label for="expense-category">Category</label><select id="expense-category" name="category" class="input-field" required>${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}</select></div>
                    <button type="submit" class="btn btn-primary">Add Expense</button>
                </form></div>
                <h2 class="expense-list-title">Your Expenses</h2><div class="expense-list-container">${listContent}</div>
            </div>`;
    }

    private renderBudgetsView(): string {
        const budgetData = this.state.budgets.map(budget => {
            const spent = this.state.expenses.filter(exp => exp.category === budget.category).reduce((sum, exp) => sum + exp.amount, 0);
            const remaining = budget.amount - spent;
            const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            let progressBarClass = percentage > 90 ? 'status-danger' : percentage > 75 ? 'status-warning' : 'status-ok';
            return { ...budget, spent, remaining, percentage, progressBarClass };
        }).sort((a,b) => a.category.localeCompare(b.category));
    
        const listContent = budgetData.length > 0 ? `<div class="budgets-grid">${budgetData.map(b => `
                <div class="card budget-card">
                    <div class="budget-card-header"><h3 class="tag ${b.category.replace(/ & /g, '-').replace(/ /g, '-')}">${b.category}</h3><div class="budget-card-total">${formatNaira(b.amount)}</div></div>
                    <div class="budget-progress-bar"><div class="budget-progress-bar-inner ${b.progressBarClass}" style="width: ${Math.min(b.percentage, 100)}%;"></div></div>
                    <div class="budget-card-details"><div><span>Spent</span><strong>${formatNaira(b.spent)}</strong></div><div><span>Remaining</span><strong class="${b.remaining < 0 ? 'text-danger' : ''}">${formatNaira(b.remaining)}</strong></div></div>
                </div>`).join('')}</div>` : `<div class="empty-state">No budgets set. Create one to start tracking.</div>`;
    
        const availableCategories = CATEGORIES.filter(c => !this.state.budgets.some(b => b.category === c));
        return `
            <div class="view-header"><h1>Budgets</h1></div>
            <div class="budgets-view-layout">
                <div class="budgets-list-container">${listContent}</div>
                <div class="card add-budget-card">
                    <h2>Set a Budget</h2><form id="add-budget-form">
                        <div class="form-group"><label for="budget-category">Category</label><select id="budget-category" name="category" class="input-field" required ${availableCategories.length === 0 ? 'disabled' : ''}>
                            ${availableCategories.length > 0 ? availableCategories.map(c => `<option value="${c}">${c}</option>`).join('') : `<option>All categories have budgets</option>`}</select></div>
                        <div class="form-group"><label for="budget-amount">Monthly Budget (₦)</label><input type="number" id="budget-amount" name="amount" class="input-field" step="1000" min="0" required placeholder="e.g., 50000"></div>
                        <button type="submit" class="btn btn-primary" ${availableCategories.length === 0 ? 'disabled' : ''}>Set Budget</button>
                    </form>
                </div>
            </div>`;
    }
    
    private renderDealsView(): string {
        const locations = ["All", ...new Set(sampleDeals.map(d => d.location))];
        const filteredDeals = this.state.userLocation === 'All' 
            ? this.state.deals 
            : this.state.deals.filter(d => d.location === this.state.userLocation);

        const dealsContent = filteredDeals.length > 0
            ? `<div class="deals-grid">${filteredDeals.map(deal => `
                <div class="deal-card">
                    <div class="deal-card-image" style="background-image: url('${deal.imageUrl}')"></div>
                    <div class="deal-info">
                        <div class="deal-header"><span class="tag ${deal.category.replace(/ & /g, '-').replace(/ /g, '-')}">${deal.category}</span><p class="deal-price">${formatNaira(deal.price)}</p></div>
                        <h3 class="deal-name">${deal.productName}</h3>
                        <p class="deal-merchant">${deal.merchantName} - ${deal.location}</p>
                    </div>
                    <div class="deal-card-footer"><button class="btn btn-primary" data-action="buy-now" data-id="${deal.id}">Buy Now</button></div>
                </div>`).join('')}</div>`
            : `<div class="empty-state">No deals available in ${this.state.userLocation}. Check back soon!</div>`;

        return `
            <div class="view-header deals-header-flex"><h1>Local Deals</h1>
                <div class="location-selector-wrapper"><label for="location-selector">Your Location:</label>
                <select id="location-selector" class="input-field">${locations.map(loc => `<option value="${loc}" ${this.state.userLocation === loc ? 'selected' : ''}>${loc}</option>`).join('')}</select></div>
            </div>${dealsContent}`;
    }

    private renderSettingsView(): string {
        return `<div class="view-header"><h1>Settings / Profile</h1></div><div class="card"><p>Profile settings and options will be available here soon.</p></div>`;
    }
    
    private renderEnterpriseDashboardView(): string {
        const { totalRevenue, totalSales } = this.calculateEnterpriseStats();
        return `
            <div class="view-header"><h1>Dashboard</h1></div>
            <div class="stats-grid">
                <div class="card stat-card"><h3>Total Revenue</h3><p>${formatNaira(totalRevenue)}</p></div>
                <div class="card stat-card"><h3>Total Sales</h3><p>${totalSales}</p></div>
            </div>
            <div class="card" style="margin-top: 30px;"><h2>Recent Activity</h2><p>A summary of recent sales and activities will appear here.</p></div>`;
    }
    
    private renderEnterpriseTransactionsView(): string {
        const { transactions } = this.calculateEnterpriseStats();
        const listContent = transactions.length > 0
            ? `<div class="transaction-list">${transactions.map(t => `
                <div class="transaction-item">
                    <div class="transaction-product"><strong>${t.productName}</strong><span class="customer">Sold to: ${t.customerName}</span></div>
                    <div class="transaction-date">${t.date}</div>
                    <div class="transaction-status"><span class="status-pill ${t.status}">${t.status}</span></div>
                    <div class="transaction-amount">${formatNaira(t.price)}</div>
                </div>`).join('')}</div>`
            : `<div class="empty-state">No transactions yet.</div>`;
        return `<div class="view-header"><h1>Transactions</h1></div><div class="card">${listContent}</div>`;
    }

    private renderPaymentModal() {
        const modal = document.getElementById('payment-modal')!;
        const deal = this.state.dealToPurchase;

        if (!this.state.showPaymentModal || !deal) {
            modal.innerHTML = '';
            modal.classList.add('hidden');
            return;
        }

        modal.classList.remove('hidden');
        
        let content = '';
        if(this.state.paymentStep === 'form') {
            content = `
                <div class="payment-modal-header paystack-header">
                    <h4>Pay with <span class="paystack-logo">Paystack</span></h4>
                    <p>${deal.merchantName}</p>
                    <p class="payment-amount">${formatNaira(deal.price)}</p>
                </div>
                <div class="payment-modal-body">
                    <p class="item-summary"><strong>Item:</strong> ${deal.productName}</p>
                    <div class="form-group">
                        <label for="card-number">Card Number</label>
                        <input type="text" id="card-number" class="input-field" placeholder="0000 0000 0000 0000">
                    </div>
                     <div class="form-row">
                        <div class="form-group">
                            <label for="expiry">Expiry</label>
                            <input type="text" id="expiry" class="input-field" placeholder="MM / YY">
                        </div>
                        <div class="form-group">
                            <label for="cvv">CVV</label>
                            <input type="text" id="cvv" class="input-field" placeholder="123">
                        </div>
                    </div>
                </div>
                <div class="payment-modal-footer">
                    <button class="btn btn-primary" data-action="confirm-payment">Pay ${formatNaira(deal.price)}</button>
                    <button class="btn btn-secondary-outline" data-action="close-modal">Cancel</button>
                </div>`;
        } else if (this.state.paymentStep === 'processing') {
            content = `<div class="payment-feedback"><div class="spinner"></div><p>Processing Payment...</p></div>`;
        } else if (this.state.paymentStep === 'success') {
            content = `<div class="payment-feedback"><div class="success-icon">&#10003;</div><p>Payment Successful!</p></div>`;
        }
        
        modal.innerHTML = `<div class="modal-overlay" data-action="close-modal"><div class="modal-content payment-modal" onclick="event.stopPropagation()">${content}</div></div>`;
    }

    // --- Utility to render HTML content ---
    private renderBySelector(selector: string, content: string, className?: string) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = content;
            if (className) element.classList.add(className);
        }
    }
}

// Expose app instance to window for inline event handlers
declare global {
    interface Window { app: CravourApp; }
}
window.app = new CravourApp();