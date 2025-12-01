"use strict";
(() => {
    const calculator = document.querySelector('form');
    if (calculator) {
        const displayElement = calculator.querySelector('input');
        if (!displayElement) {
            return;
        }
        const display = displayElement;
        class Node {
            constructor(value) {
                this.value = value;
                this.left = null;
                this.right = null;
            }
        }
        const operators = {
            '^': { prec: 4, assoc: 'right' },
            '*': { prec: 3, assoc: 'left' },
            '/': { prec: 3, assoc: 'left' },
            '+': { prec: 2, assoc: 'left' },
            '-': { prec: 2, assoc: 'left' },
        };
        // Source: https://inspirnathan.com/posts/151-shunting-yard-algorithm-in-javascript
        function ShuntingYard(infix) {
            const opSymbols = Object.keys(operators);
            const stack = [];
            let output = '';
            const peek = () => stack[stack.length - 1];
            const addToOutput = (token) => {
                output += ' ' + token;
            };
            const handlePop = () => stack.pop();
            const tokens = infix.match(/(\d+(\.\d+)?)|[+\-*/^()]|(\.\d+)/g);
            if (!tokens)
                return '';
            const processedTokens = [];
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (token === '-') {
                    const isUnary = i === 0 || ['+', '-', '*', '/', '^', '('].includes(tokens[i - 1]);
                    if (isUnary && i + 1 < tokens.length && !isNaN(parseFloat(tokens[i + 1]))) {
                        processedTokens.push('-' + tokens[i + 1]);
                        i++;
                        continue;
                    }
                }
                processedTokens.push(token);
            }
            for (const token of processedTokens) {
                if (!isNaN(parseFloat(token))) {
                    addToOutput(token);
                }
                else if (opSymbols.includes(token)) {
                    const o1 = token;
                    let o2 = peek();
                    while (o2 !== undefined &&
                        o2 !== '(' &&
                        (operators[o2].prec > operators[o1].prec ||
                            (operators[o2].prec === operators[o1].prec &&
                                operators[o1].assoc === 'left'))) {
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
                    handlePop();
                }
            }
            while (stack.length !== 0) {
                const top = peek();
                if (top === '(')
                    throw new Error('Mismatched parentheses');
                addToOutput(stack.pop());
            }
            return output;
        }
        // Source: https://www.geeksforgeeks.org/dsa/expression-tree/
        function buildExpressionTree(postfix) {
            const stack = [];
            const tokens = postfix.split(' ');
            for (const token of tokens) {
                if (operators[token]) {
                    const z = new Node(token);
                    const x = stack.pop();
                    const y = stack.pop();
                    if (!x || !y)
                        throw new Error('Invalid expression');
                    z.left = y;
                    z.right = x;
                    stack.push(z);
                }
                else {
                    stack.push(new Node(token));
                }
            }
            return stack.pop();
        }
        // Source: https://www.geeksforgeeks.org/dsa/evaluation-of-expression-tree/
        function evaluateTree(tree) {
            if (!tree)
                return '0';
            if (!tree.left && !tree.right) {
                return tree.value;
            }
            const leftEval = parseFloat(evaluateTree(tree.left));
            const rightEval = parseFloat(evaluateTree(tree.right));
            switch (tree.value) {
                case '+': return (leftEval + rightEval).toString();
                case '-': return (leftEval - rightEval).toString();
                case '*': return (leftEval * rightEval).toString();
                case '/':
                    if (rightEval === 0)
                        throw new Error('Division by zero');
                    return (leftEval / rightEval).toString();
                case '^': return Math.pow(leftEval, rightEval).toString();
                default: return '0';
            }
        }
        //Calculates value of the string
        function calculate(infix) {
            try {
                const postfix = ShuntingYard(infix);
                if (!postfix)
                    return '';
                const tree = buildExpressionTree(postfix);
                return evaluateTree(tree);
            }
            catch (e) {
                console.error(e);
                return 'Error';
            }
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
            const repeatValues = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', '.'];
            //inputs that can not be repeated
            const nonRepeatValues = ['/', '*', '+', '-', '^'];
            //clear input
            const ClearValue = 'CL';
            //delete input
            const DeleteValue = 'DL';
            //calculate input
            const CalculateValue = '=';
            //Handel the input
            if (repeatValues.includes(input)) {
                display.value += input;
            }
            else if (nonRepeatValues.includes(input)) {
                if (nonRepeatValues.includes(display.value.slice(-1)))
                    display.value = display.value.slice(0, -1);
                display.value += input;
            }
            else if (input === ClearValue) {
                display.value = '';
            }
            else if (input === DeleteValue) {
                display.value = display.value.slice(0, -1);
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
                display.value = calculate(display.value);
            }
            display.scrollLeft = display.scrollWidth;
        }
        calculator.addEventListener('click', (e) => {
            var _a;
            const button = (_a = e.target) === null || _a === void 0 ? void 0 : _a.closest('button');
            if (button)
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
                const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', '.', '/', '*', '+', '-', '^'];
                if (validKeys.includes(e.key)) {
                    handleInput(e.key);
                }
            }
        });
    }
})();
