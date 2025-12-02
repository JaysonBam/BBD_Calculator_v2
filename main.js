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
var CalculatorApp;
(function (CalculatorApp) {
    class ExpressionNode {
        constructor(value) {
            this.value = value;
            this.left = null;
            this.right = null;
        }
    }
    class Calculator {
        constructor() {
            this.prevAns = '0';
            this.isRadians = true;
            this.operators = {
                '^': { prec: 4, assoc: 'right', type: 'binary' },
                '*': { prec: 3, assoc: 'left', type: 'binary' },
                '/': { prec: 3, assoc: 'left', type: 'binary' },
                '+': { prec: 2, assoc: 'left', type: 'binary' },
                '-': { prec: 2, assoc: 'left', type: 'binary' },
                '%': { prec: 6, assoc: 'left', type: 'unary' },
                'sin': { prec: 5, assoc: 'right', type: 'unary' },
                'cos': { prec: 5, assoc: 'right', type: 'unary' },
                'tan': { prec: 5, assoc: 'right', type: 'unary' },
                'log': { prec: 5, assoc: 'right', type: 'unary' },
                'ln': { prec: 5, assoc: 'right', type: 'unary' },
                'sqrt': { prec: 5, assoc: 'right', type: 'unary' },
                'neg': { prec: 5, assoc: 'right', type: 'unary' }
            };
        }
        // Source: https://inspirnathan.com/posts/151-shunting-yard-algorithm-in-javascript
        ShuntingYard(infix) {
            const opSymbols = Object.keys(this.operators);
            const stack = [];
            let output = [];
            const peek = () => stack[stack.length - 1];
            const addToOutput = (token) => {
                output.push(token);
            };
            const handlePop = () => stack.pop();
            // Updated regex to match functions, constants, and numbers
            const tokens = infix.match(/([a-zA-Z]+)|(\d+(\.\d+)?)|[+\-*/^()%]|(\.\d+)/g);
            if (!tokens)
                return '';
            const processedTokens = [];
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                // Handle unary minus
                if (token === '-') {
                    const prev = tokens[i - 1];
                    const isUnary = i === 0 || ['+', '-', '*', '/', '^', '(', '%'].indexOf(prev) !== -1;
                    if (isUnary) {
                        if (i + 1 < tokens.length && !isNaN(parseFloat(tokens[i + 1]))) {
                            processedTokens.push('-' + tokens[i + 1]);
                            i++;
                            continue;
                        }
                        else {
                            processedTokens.push('neg');
                            continue;
                        }
                    }
                }
                processedTokens.push(token);
            }
            for (const token of processedTokens) {
                if (!isNaN(parseFloat(token))) {
                    addToOutput(token);
                }
                else if (opSymbols.indexOf(token) !== -1) {
                    const o1 = token;
                    let o2 = peek();
                    while (o2 !== undefined &&
                        o2 !== '(' &&
                        ((this.operators[o2].prec > this.operators[o1].prec) ||
                            (this.operators[o2].prec === this.operators[o1].prec && this.operators[o1].assoc === 'left'))) {
                        addToOutput(handlePop());
                        o2 = peek();
                    }
                    stack.push(o1);
                }
                else if (token === '(') {
                    stack.push(token);
                }
                else if (token === ')') {
                    let topOfStack = peek();
                    while (topOfStack !== '(') {
                        if (stack.length === 0)
                            throw new Error('Mismatched parentheses');
                        addToOutput(handlePop());
                        topOfStack = peek();
                    }
                    handlePop(); // Pop '('
                    // If the token at the top of the stack is a function, pop it to the output queue.
                    if (stack.length > 0 && this.operators[peek()] && this.operators[peek()].type === 'unary') {
                        addToOutput(handlePop());
                    }
                }
            }
            while (stack.length !== 0) {
                const top = peek();
                if (top === '(')
                    throw new Error('Mismatched parentheses');
                addToOutput(stack.pop());
            }
            return output.join(' ');
        }
        // Source: https://www.geeksforgeeks.org/dsa/expression-tree/
        buildExpressionTree(postfix) {
            const stack = [];
            const tokens = postfix.split(' ');
            for (const token of tokens) {
                if (this.operators[token]) {
                    const op = this.operators[token];
                    const z = new ExpressionNode(token);
                    if (op.type === 'binary') {
                        const x = stack.pop();
                        const y = stack.pop();
                        if (!x || !y)
                            throw new Error('Invalid expression');
                        z.left = y;
                        z.right = x;
                    }
                    else if (op.type === 'unary') {
                        const x = stack.pop();
                        if (!x)
                            throw new Error('Invalid expression');
                        z.left = x; // Convention: use left for unary
                    }
                    stack.push(z);
                }
                else {
                    stack.push(new ExpressionNode(token));
                }
            }
            if (stack.length !== 1)
                throw new Error('Invalid expression');
            return stack.pop();
        }
        // Source: https://www.geeksforgeeks.org/dsa/evaluation-of-expression-tree/
        evaluateTree(tree) {
            if (!tree)
                return '0';
            if (!tree.left && !tree.right) {
                return tree.value;
            }
            const leftEval = tree.left ? parseFloat(this.evaluateTree(tree.left)) : 0;
            const rightEval = tree.right ? parseFloat(this.evaluateTree(tree.right)) : 0;
            const toRad = (deg) => deg * Math.PI / 180;
            const arg = (val) => this.isRadians ? val : toRad(val);
            switch (tree.value) {
                case '+': return (leftEval + rightEval).toString();
                case '-': return (leftEval - rightEval).toString();
                case '*': return (leftEval * rightEval).toString();
                case '/':
                    if (rightEval === 0)
                        throw new Error('Division by zero');
                    return (leftEval / rightEval).toString();
                case '%':
                    return (leftEval / 100).toString();
                case '^': return Math.pow(leftEval, rightEval).toString();
                case 'sin': return Math.sin(arg(leftEval)).toString();
                case 'cos': return Math.cos(arg(leftEval)).toString();
                case 'tan': return Math.tan(arg(leftEval)).toString();
                case 'log': return (Math.log(leftEval) / Math.LN10).toString();
                case 'ln': return Math.log(leftEval).toString();
                case 'sqrt': return Math.sqrt(leftEval).toString();
                case 'neg': return (-leftEval).toString();
                default: return '0';
            }
        }
        //Calculates value of the string
        calculate(infix) {
            try {
                // Replace Ans, pi, e
                let processedInfix = infix.replace(/Ans/g, `(${this.prevAns})`);
                processedInfix = processedInfix.replace(/pi/g, Math.PI.toString());
                processedInfix = processedInfix.replace(/\be\b/g, Math.E.toString());
                const postfix = this.ShuntingYard(processedInfix);
                if (!postfix)
                    return '';
                const tree = this.buildExpressionTree(postfix);
                const result = this.evaluateTree(tree);
                if (result === 'NaN' || result === 'Infinity' || result === '-Infinity') {
                    return 'Error';
                }
                // Check for very small numbers (e.g. 1e-16) and round to 0
                const numResult = parseFloat(result);
                if (Math.abs(numResult) < 1e-15 && numResult !== 0) {
                    return '0';
                }
                return result;
            }
            catch (e) {
                console.error(e);
                return 'Error';
            }
        }
    }
    CalculatorApp.Calculator = Calculator;
})(CalculatorApp || (CalculatorApp = {}));
var CalculatorApp;
(function (CalculatorApp) {
    class InputHandler {
        /**
         * Handles the logic for appending or modifying the input string based on the new input.
         * @param current The current value of the display.
         * @param input The input character or command.
         * @returns The new value for the display.
         */
        static handleInput(current, input) {
            if (current === 'Error' || current === 'NaN') {
                current = '';
            }
            if (this.repeatValues.indexOf(input) !== -1) {
                return current + input;
            }
            else if (this.nonRepeatValues.indexOf(input) !== -1) {
                if (current.length > 0 && this.nonRepeatValues.indexOf(current.slice(-1)) !== -1) {
                    return current.slice(0, -1) + input;
                }
                return current + input;
            }
            else if (this.functions.indexOf(input) !== -1) {
                return current + input + '(';
            }
            else if (input === 'Ans') {
                return current + 'Ans';
            }
            return current;
        }
        /**
         * Handles the smart delete logic.
         * @param current The current value of the display.
         * @returns The new value after deletion.
         */
        static handleDelete(current) {
            if (current.length === 0)
                return current;
            // Check for Ans
            if (current.slice(-3) === 'Ans') {
                return current.slice(0, -3);
            }
            // Check for pi
            if (current.slice(-2) === 'pi') {
                return current.slice(0, -2);
            }
            // Check for functions at the end
            for (const func of this.functions) {
                if (current.slice(-(func.length + 1)) === func + '(') {
                    return current.slice(0, -(func.length + 1));
                }
            }
            // Default delete
            return current.slice(0, -1);
        }
        /**
         * Validates the brackets in the expression.
         * @param expression The expression string to validate.
         * @returns An error message if invalid, or null if valid.
         */
        static validateBrackets(expression) {
            let checksum = 0;
            for (let index = 0; index < expression.length; index++) {
                const element = expression[index];
                if (element === '(') {
                    checksum++;
                }
                if (element === ')') {
                    checksum--;
                }
                if (checksum < 0) {
                    return 'Bracket mismatch: Too many closing brackets';
                }
            }
            if (checksum !== 0) {
                return 'Bracket mismatch: Unbalanced brackets';
            }
            return null;
        }
    }
    // Inputs that can be repeated
    InputHandler.repeatValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', '.', 'pi', 'e'];
    // Inputs that can not be repeated (operators)
    InputHandler.nonRepeatValues = ['/', '*', '+', '-', '^', '%'];
    // Scientific functions
    InputHandler.functions = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'];
    CalculatorApp.InputHandler = InputHandler;
})(CalculatorApp || (CalculatorApp = {}));
/// <reference path="calculator.ts" />
/// <reference path="input-handler.ts" />
(() => {
    // Check if we are in a browser environment with DOM
    if (typeof document === 'undefined')
        return;
    const calculatorForm = document.querySelector('form');
    if (calculatorForm) {
        const displayElement = calculatorForm.querySelector('input');
        if (!displayElement) {
            return;
        }
        const display = displayElement;
        // Initialize Calculator
        const calc = new CalculatorApp.Calculator();
        const degBtn = document.getElementById('degBtn');
        if (degBtn) {
            degBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                calc.isRadians = !calc.isRadians;
                degBtn.innerText = calc.isRadians ? 'RAD' : 'DEG';
            });
        }
        function showBootstrapAlert(message) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            alertDiv.style.zIndex = '1050';
            alertDiv.role = 'alert';
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" aria-label="Close"></button>
            `;
            // Manual close handler replacing Bootstrap JS
            const closeBtn = alertDiv.querySelector('.btn-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => alertDiv.remove());
            }
            document.body.appendChild(alertDiv);
            setTimeout(() => {
                if (document.body.contains(alertDiv)) {
                    alertDiv.remove();
                }
            }, 3000);
        }
        //Handels input from mulltple sources
        function handleInput(input) {
            const ClearValue = 'CL';
            const DeleteValue = 'DL';
            const CalculateValue = '=';
            if (input === ClearValue) {
                display.value = '';
            }
            else if (input === DeleteValue) {
                display.value = CalculatorApp.InputHandler.handleDelete(display.value);
            }
            else if (input === CalculateValue) {
                const validationError = CalculatorApp.InputHandler.validateBrackets(display.value);
                if (validationError) {
                    showBootstrapAlert(validationError);
                    return;
                }
                const result = calc.calculate(display.value);
                if (result !== 'Error') {
                    calc.prevAns = result;
                }
                display.value = result;
            }
            else {
                display.value = CalculatorApp.InputHandler.handleInput(display.value, input);
            }
            display.scrollLeft = display.scrollWidth;
        }
        calculatorForm.addEventListener('click', (e) => {
            var _a;
            const button = (_a = e.target) === null || _a === void 0 ? void 0 : _a.closest('button');
            if (button && button.id !== 'degBtn')
                handleInput(button.innerText);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleInput('=');
            }
            else if (e.key === 'Backspace') {
                handleInput('DL');
            }
            else if (e.key === 'Delete') {
                e.preventDefault();
                handleInput('CL');
            }
            else {
                const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', '.', '/', '*', '+', '-', '^', '%', 'e'];
                if (validKeys.indexOf(e.key) !== -1) {
                    handleInput(e.key);
                }
            }
        });
    }
})();
