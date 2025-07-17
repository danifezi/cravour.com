
import { GoogleGenAI, Type } from "@google/genai";

document.addEventListener('DOMContentLoaded', () => {
    // Conditionally initialize components based on the current page's content
    if (document.getElementById('savings-calculator-form')) {
        const form = document.getElementById('savings-calculator-form');
        form?.addEventListener('submit', handleFormSubmit);
    }
    if (document.getElementById('particle-canvas')) {
        initParticleCanvas();
    }
    if (document.querySelector('.hidden')) {
        initScrollAnimations();
    }
    if (document.querySelector('.testimonial-slider')) {
        initTestimonialSlider();
    }
    if (document.querySelector('.nav-toggle')) {
        initMobileMenu();
    }
});

function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('main-nav');

    if (!navToggle || !nav) return;

    navToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        navToggle.classList.toggle('is-open');
        document.body.classList.toggle('nav-open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });
}

async function handleFormSubmit(event: Event) {
    event.preventDefault();

    // Form inputs
    const expenseNameInput = document.getElementById('expense-name') as HTMLInputElement;
    const expenseCostInput = document.getElementById('expense-cost') as HTMLInputElement;
    const expenseFrequencySelect = document.getElementById('expense-frequency') as HTMLSelectElement;

    // Result elements
    const resultsContainer = document.getElementById('calculator-results');
    const placeholder = resultsContainer?.querySelector('.results-placeholder');
    const resultsContent = document.getElementById('results-content');
    const resultsTitle = document.getElementById('results-title');
    const yearlySavingsEl = document.getElementById('yearly-savings');
    const fiveYearSavingsEl = document.getElementById('five-year-savings');
    const geminiSuggestionsEl = document.getElementById('gemini-suggestions');
    const loadingSpinner = document.getElementById('loading-spinner');
    const geminiError = document.getElementById('gemini-error');
    
    if (!expenseNameInput || !expenseCostInput || !expenseFrequencySelect || !resultsContent || !placeholder || !resultsTitle || !yearlySavingsEl || !fiveYearSavingsEl || !geminiSuggestionsEl || !loadingSpinner || !geminiError) {
        console.error("One or more calculator elements are missing from the DOM.");
        return;
    }
    
    // --- UI State: Start Loading ---
    placeholder.classList.add('is-hidden');
    resultsContent.classList.remove('is-hidden');
    geminiSuggestionsEl.innerHTML = ''; // Clear previous suggestions
    geminiError.classList.add('is-hidden');
    loadingSpinner.classList.remove('is-hidden');

    const expenseName = expenseNameInput.value;
    const cost = parseFloat(expenseCostInput.value);
    const frequency = expenseFrequencySelect.value;

    let yearlyCost = 0;
    if (frequency === 'daily') {
        yearlyCost = cost * 365;
    } else if (frequency === 'weekly') {
        yearlyCost = cost * 52;
    } else if (frequency === 'monthly') {
        yearlyCost = cost * 12;
    }

    const fiveYearCost = yearlyCost * 5;

    const formatter = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    });
    
    // --- Update DOM with calculations ---
    resultsTitle.innerHTML = `By cutting back on "<span>${expenseName}</span>", you could save:`;
    yearlySavingsEl.textContent = formatter.format(yearlyCost);
    fiveYearSavingsEl.textContent = formatter.format(fiveYearCost);

    // Gracefully handle missing API key at runtime instead of build time
    if (!process.env.API_KEY) {
        console.error("API_KEY is not configured. Cannot generate AI insights.");
        geminiError.classList.remove('is-hidden');
        geminiError.querySelector('p')!.textContent = 'Sorry, the AI insights service is currently unavailable. Please check your configuration.';
        loadingSpinner.classList.add('is-hidden');
        return;
    }

    // --- Generate AI Insights ---
    try {
        // Initialize the Google GenAI client JUST-IN-TIME.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "A short, catchy title for the goal or purchase (e.g., 'A Down Payment on Land').",
                    },
                    description: {
                        type: Type.STRING,
                        description: "A brief, inspiring description of what this enables.",
                    },
                },
                required: ["title", "description"],
            },
        };
        
        const prompt = `You are a senior wealth strategist for a high-net-worth individual in Nigeria. Based on a potential savings of ${formatter.format(fiveYearCost)} over 5 years, generate 3 exciting, tangible, and aspirational long-term goals or investments this amount could realistically fund in Nigeria. The tone should be inspiring, sophisticated, and motivational. Focus on wealth-building or life-enhancing experiences.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema
            }
        });
        
        const suggestions = JSON.parse(response.text);

        if (suggestions && suggestions.length > 0) {
            suggestions.forEach((item: {title: string, description: string}) => {
                const suggestionEl = document.createElement('div');
                suggestionEl.className = 'suggestion-item';
                suggestionEl.innerHTML = `<h5>${item.title}</h5><p>${item.description}</p>`;
                geminiSuggestionsEl.appendChild(suggestionEl);
            });
        }

    } catch (error) {
        console.error("Error fetching Gemini insights:", error);
        geminiError.classList.remove('is-hidden');
        geminiError.querySelector('p')!.textContent = 'Sorry, we couldn\'t generate insights at this moment. Please try again later.';
    } finally {
        // --- UI State: Stop Loading ---
        loadingSpinner.classList.add('is-hidden');
    }
}


function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.hidden').forEach(el => {
        observer.observe(el);
    });
}

function initTestimonialSlider() {
    const slider = document.querySelector('.testimonial-slider');
    if (!slider) return;

    const track = slider.querySelector('.testimonial-track') as HTMLElement;
    const nextButton = slider.querySelector('.slider-arrow.next');
    const prevButton = slider.querySelector('.slider-arrow.prev');

    if (!track || !nextButton || !prevButton) return;

    const cards = Array.from(track.children) as HTMLElement[];
    if (cards.length === 0) return;

    // Clone cards for infinite loop effect
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
    
    let currentIndex = 0;
    let slideInterval: number;

    const getSlideWidth = () => {
        if (cards.length === 0) return 0;
        const card = cards[0];
        const trackStyle = window.getComputedStyle(track);
        const gap = parseFloat(trackStyle.gap) || 0;
        return card.offsetWidth + gap;
    };
    
    const moveToSlide = (index: number) => {
        const slideWidth = getSlideWidth();
        track.style.transform = `translateX(-${index * slideWidth}px)`;

        // For infinite loop reset
        if(index >= cards.length) {
            setTimeout(() => {
                track.style.transition = 'none';
                currentIndex = 0;
                track.style.transform = `translateX(0)`;
                setTimeout(() => {
                    track.style.transition = 'transform 0.5s ease-in-out';
                }, 50)
            }, 500);
        }
    };
    
    const handleNext = () => {
        currentIndex++;
        moveToSlide(currentIndex);
    };

    const handlePrev = () => {
        if(currentIndex <= 0) return;
        currentIndex--;
        moveToSlide(currentIndex);
    };

    const startAutoScroll = () => {
        stopAutoScroll();
        slideInterval = window.setInterval(handleNext, 5000);
    };

    const stopAutoScroll = () => {
        clearInterval(slideInterval);
    };
    
    nextButton.addEventListener('click', () => {
        stopAutoScroll();
        handleNext();
        startAutoScroll();
    });

    prevButton.addEventListener('click', () => {
        stopAutoScroll();
        handlePrev();
        startAutoScroll();
    });

    slider.addEventListener('mouseenter', stopAutoScroll);
    slider.addEventListener('mouseleave', startAutoScroll);
    
    window.addEventListener('resize', () => {
       moveToSlide(currentIndex);
    });

    startAutoScroll();
}


function initParticleCanvas() {
    const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const setCanvasSize = () => {
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.offsetWidth;
            canvas.height = parent.offsetHeight;
        }
    };
    
    const particleCount = 70;

    class Particle {
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;

        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
        }

        update() {
            if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
            if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
            this.x += this.speedX;
            this.y += this.speedY;
        }

        draw() {
            if (!ctx) return;
            ctx.fillStyle = 'rgba(44, 122, 123, 0.6)'; // Teal color from light theme
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animateParticles() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const particle of particles) {
            particle.update();
            particle.draw();
        }
        connectParticles();
        animationFrameId = requestAnimationFrame(animateParticles);
    }

    function connectParticles() {
        if (!ctx) return;
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                const distance = Math.sqrt(
                    Math.pow(particles[a].x - particles[b].x, 2) +
                    Math.pow(particles[a].y - particles[b].y, 2)
                );
                if (distance < 100) {
                    opacityValue = 1 - (distance / 100);
                    ctx.strokeStyle = `rgba(44, 122, 123, ${opacityValue * 0.3})`; // Teal color from light theme
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    const restartAnimation = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        setCanvasSize();
        initParticles();
        animateParticles();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                restartAnimation();
            } else {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                }
            }
        });
    }, { threshold: 0 });

    observer.observe(canvas);

    window.addEventListener('resize', restartAnimation);
}
