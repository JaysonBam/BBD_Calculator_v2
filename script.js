"use strict";
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
            return result;
        }
        catch (e) {
            console.error(e);
            return 'Error';
        }
    }
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Calculator };
}
else {
    // Expose for Browser environment
    window.Calculator = Calculator;
}
// UI Logic
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
        const calc = new Calculator();
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
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            document.body.appendChild(alertDiv);
            setTimeout(() => {
                alertDiv.remove();
            }, 3000);
        }
        //Handels input from mulltple sources
        function handleInput(input) {
            if (display.value === 'Error' || display.value === 'NaN') {
                display.value = '';
            }
            //inputs that can be repeated
            const repeatValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', '.', 'pi', 'e'];
            //inputs that can not be repeated
            const nonRepeatValues = ['/', '*', '+', '-', '^', '%'];
            // Scientific functions
            const functions = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'];
            const ClearValue = 'CL';
            const DeleteValue = 'DL';
            const CalculateValue = '=';
            const AnsValue = 'Ans';
            //Handel the input
            if (repeatValues.indexOf(input) !== -1) {
                display.value += input;
            }
            else if (nonRepeatValues.indexOf(input) !== -1) {
                if (nonRepeatValues.indexOf(display.value.slice(-1)) !== -1)
                    display.value = display.value.slice(0, -1);
                display.value += input;
            }
            else if (functions.indexOf(input) !== -1) {
                display.value += input + '(';
            }
            else if (input === AnsValue) {
                display.value += 'Ans';
            }
            else if (input === ClearValue) {
                display.value = '';
            }
            else if (input === DeleteValue) {
                // Smart delete
                const current = display.value;
                if (current.length === 0)
                    return;
                // Check for functions at the end
                let deleted = false;
                // Check for Ans
                if (current.slice(-3) === 'Ans') {
                    display.value = current.slice(0, -3);
                    deleted = true;
                }
                else if (current.slice(-2) === 'pi') {
                    display.value = current.slice(0, -2);
                    deleted = true;
                }
                else {
                    for (const func of functions) {
                        if (current.slice(-(func.length + 1)) === func + '(') {
                            display.value = current.slice(0, -(func.length + 1));
                            deleted = true;
                            break;
                        }
                    }
                }
                if (!deleted) {
                    display.value = display.value.slice(0, -1);
                }
            }
            else if (input === CalculateValue) {
                let checksum = 0;
                for (let index = 0; index < display.value.length; index++) {
                    const element = display.value[index];
                    if (element === '(') {
                        checksum++;
                    }
                    if (element === ')') {
                        checksum--;
                    }
                    if (checksum < 0) {
                        showBootstrapAlert('Bracket mismatch: Too many closing brackets');
                        return;
                    }
                }
                if (checksum !== 0) {
                    showBootstrapAlert('Bracket mismatch: Unbalanced brackets');
                    return;
                }
                const result = calc.calculate(display.value);
                if (result !== 'Error') {
                    calc.prevAns = result;
                }
                display.value = result;
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
