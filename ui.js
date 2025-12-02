"use strict";
// ui.ts
(() => {
    // 1. Theme Logic
    const setTheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        }
        else {
            document.documentElement.setAttribute('data-bs-theme', 'light');
        }
    };
    setTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setTheme);
    // 2. Button Rendering Logic
    const renderButtons = () => {
        const commonBtnClass = "btn w-100 py-2 py-lg-3 fs-4 fw-bold";
        const sciContainer = document.getElementById('scientific-section');
        const sciButtons = [
            { label: 'RAD', id: 'degBtn', cls: 'btn-info' },
            { label: '(', cls: 'btn-secondary' },
            { label: ')', cls: 'btn-secondary' },
            { label: 'sin', cls: 'btn-secondary' },
            { label: 'cos', cls: 'btn-secondary' },
            { label: 'tan', cls: 'btn-secondary' },
            { label: 'ln', cls: 'btn-secondary' },
            { label: 'log', cls: 'btn-secondary' },
            { label: '^', cls: 'btn-secondary' },
            { label: 'sqrt', cls: 'btn-secondary' },
            { label: 'pi', cls: 'btn-secondary' },
            { label: 'e', cls: 'btn-secondary' },
            { label: 'Ans', cls: 'btn-info', col: 'col-8' },
            { label: '%', cls: 'btn-secondary', col: 'col-4' }
        ];
        if (sciContainer) {
            sciContainer.innerHTML = sciButtons.map(btn => `
                <div class="${btn.col || 'col'}">
                    <button type="button" class="${commonBtnClass} ${btn.cls}" ${btn.id ? `id="${btn.id}"` : ''}>${btn.label}</button>
                </div>
            `).join('');
        }
        const stdContainer = document.getElementById('standard-section');
        const stdButtons = [
            { label: 'CL', cls: 'btn-danger', col: 'col-6' },
            { label: 'DL', cls: 'btn-danger', col: 'col-6' },
            { label: '7', cls: 'btn-outline-secondary' },
            { label: '8', cls: 'btn-outline-secondary' },
            { label: '9', cls: 'btn-outline-secondary' },
            { label: '/', cls: 'btn-warning' },
            { label: '4', cls: 'btn-outline-secondary' },
            { label: '5', cls: 'btn-outline-secondary' },
            { label: '6', cls: 'btn-outline-secondary' },
            { label: '*', cls: 'btn-warning' },
            { label: '1', cls: 'btn-outline-secondary' },
            { label: '2', cls: 'btn-outline-secondary' },
            { label: '3', cls: 'btn-outline-secondary' },
            { label: '-', cls: 'btn-warning' },
            { label: '0', cls: 'btn-outline-secondary' },
            { label: '.', cls: 'btn-outline-secondary' },
            { label: '=', cls: 'btn-success' },
            { label: '+', cls: 'btn-warning' }
        ];
        if (stdContainer) {
            stdContainer.innerHTML = stdButtons.map(btn => `
                <div class="${btn.col || 'col'}">
                    <button type="button" class="${commonBtnClass} ${btn.cls}">${btn.label}</button>
                </div>
            `).join('');
        }
    };
    // Run rendering
    renderButtons();
    // 3. Scaling Logic
    function scaleCalculator() {
        const card = document.querySelector('form.card');
        if (!card)
            return;
        // Reset to natural state to measure dimensions
        card.removeAttribute('style');
        document.body.style.overflow = '';
        const availableHeight = window.innerHeight - 20; // 20px padding
        const { width, height } = card.getBoundingClientRect();
        // Only scale if the calculator is taller than the screen
        if (height > availableHeight) {
            const scale = availableHeight / height;
            card.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                width: ${width}px;
                height: ${height}px;
                margin: 0;
                transform: translate(-50%, -50%) scale(${scale});
                z-index: 1000;
            `;
            document.body.style.overflow = 'hidden';
        }
    }
    ['resize', 'load', 'DOMContentLoaded'].forEach(e => window.addEventListener(e, scaleCalculator));
    // Call immediately in case DOM is ready
    scaleCalculator();
})();
