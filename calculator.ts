namespace CalculatorApp {
    class ExpressionNode {
        value: string;
        left: ExpressionNode | null;
        right: ExpressionNode | null;
    
        constructor(value: string) {
            this.value = value;
            this.left = null;
            this.right = null;
        }
    }
    
    interface Operator {
        prec: number;
        assoc: 'left' | 'right';
        type: 'binary' | 'unary';
    }
    
    export class Calculator {
    prevAns: string = '0';
    isRadians: boolean = true;

    private operators: { [key: string]: Operator } = {
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

    // Source: https://inspirnathan.com/posts/151-shunting-yard-algorithm-in-javascript
    private ShuntingYard(infix: string): string {
        const opSymbols = Object.keys(this.operators);
        const stack: string[] = [];
        let output: string[] = [];

        const peek = () => stack[stack.length - 1];
        const addToOutput = (token: string) => {
            output.push(token);
        };
        const handlePop = () => stack.pop();
        const tokens = infix.match(/([a-zA-Z]+)|(\d+(\.\d+)?)|[+\-*/^()%]|(\.\d+)/g);
        if (!tokens) return '';

        const processedTokens: string[] = [];
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
                    } else {
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
            } else if (opSymbols.indexOf(token) !== -1) {
                const o1 = token;
                let o2 = peek();

                while (
                    o2 !== undefined &&
                    o2 !== '(' &&
                    (
                        (this.operators[o2].prec > this.operators[o1].prec) ||
                        (this.operators[o2].prec === this.operators[o1].prec && this.operators[o1].assoc === 'left')
                    )
                ) {
                    addToOutput(handlePop()!);
                    o2 = peek();
                }
                stack.push(o1);
            } else if (token === '(') {
                stack.push(token);
            } else if (token === ')') {
                let topOfStack = peek();
                while (topOfStack !== '(') {
                    if (stack.length === 0) throw new Error('Mismatched parentheses');
                    addToOutput(handlePop()!);
                    topOfStack = peek();
                }
                handlePop();
                
                if (stack.length > 0 && this.operators[peek()] && this.operators[peek()].type === 'unary') {
                        addToOutput(handlePop()!);
                }
            }
        }

        while (stack.length !== 0) {
            const top = peek();
            if (top === '(') throw new Error('Mismatched parentheses');
            addToOutput(stack.pop()!);
        }

        return output.join(' ');
    }

    // Source: https://www.geeksforgeeks.org/dsa/expression-tree/
    private buildExpressionTree(postfix: string): ExpressionNode {
        const stack: ExpressionNode[] = [];
        const tokens = postfix.split(' ');

        for (const token of tokens) {
            if (this.operators[token]) {
                const op = this.operators[token];
                const z = new ExpressionNode(token);
                
                if (op.type === 'binary') {
                    const x = stack.pop();
                    const y = stack.pop();
                    if (!x || !y) throw new Error('Invalid expression');
                    z.left = y;
                    z.right = x;
                } else if (op.type === 'unary') {
                    const x = stack.pop();
                    if (!x) throw new Error('Invalid expression');
                    z.left = x;
                }
                
                stack.push(z);
            } else {
                stack.push(new ExpressionNode(token));
            }
        }
        
        if (stack.length !== 1) throw new Error('Invalid expression');
        return stack.pop()!;
    }

    // Source: https://www.geeksforgeeks.org/dsa/evaluation-of-expression-tree/
    private evaluateTree(tree: ExpressionNode): string {
        if (!tree) return '0';

        if (!tree.left && !tree.right) {
            return tree.value;
        }

        const leftEval = tree.left ? parseFloat(this.evaluateTree(tree.left)) : 0;
        const rightEval = tree.right ? parseFloat(this.evaluateTree(tree.right)) : 0;

        const toRad = (deg: number) => deg * Math.PI / 180;
        const arg = (val: number) => this.isRadians ? val : toRad(val);

        switch (tree.value) {
            case '+': return (leftEval + rightEval).toString();
            case '-': return (leftEval - rightEval).toString();
            case '*': return (leftEval * rightEval).toString();
            case '/': 
                if (rightEval === 0) throw new Error('Division by zero');
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
    public calculate(infix: string): string {
        try {
            let processedInfix = infix.replace(/Ans/g, `(${this.prevAns})`);
            processedInfix = processedInfix.replace(/pi/g, Math.PI.toString());
            processedInfix = processedInfix.replace(/\be\b/g, Math.E.toString());
            
            const postfix = this.ShuntingYard(processedInfix);
            if (!postfix) return '';
            const tree = this.buildExpressionTree(postfix);
            const result = this.evaluateTree(tree);
            
            if (result === 'NaN' || result === 'Infinity' || result === '-Infinity') {
                return 'Error';
            }

            const numResult = parseFloat(result);
            if (Math.abs(numResult) < 1e-15 && numResult !== 0) {
                return '0';
            }
            
            return result;
        } catch (e) {
            console.error(e);
            return 'Error';
        }
    }
}
}
