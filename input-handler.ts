namespace CalculatorApp {
    export class InputHandler {
    // Inputs that can be repeated
    private static readonly repeatValues: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', '.', 'pi', 'e'];
    // Inputs that can not be repeated (operators)
    private static readonly nonRepeatValues: string[] = ['/', '*', '+', '-', '^', '%'];
    // Scientific functions
    private static readonly functions: string[] = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'];

    public static handleInput(current: string, input: string): string {
        if (current === 'Error' || current === 'NaN') {
            current = '';
        }

        if (this.repeatValues.indexOf(input) !== -1) {
            return current + input;
        } else if (this.nonRepeatValues.indexOf(input) !== -1) {
            if (current.length > 0 && this.nonRepeatValues.indexOf(current.slice(-1)) !== -1) {
                return current.slice(0, -1) + input;
            }
            return current + input;
        } else if (this.functions.indexOf(input) !== -1) {
            return current + input + '(';
        } else if (input === 'Ans') {
            return current + 'Ans';
        }

        return current;
    }

    public static handleDelete(current: string): string {
        if (current.length === 0) return current;

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

    public static validateBrackets(expression: string): string | null {
        let checksum: number = 0;
        for (let index = 0; index < expression.length; index++) {
            const element = expression[index];
            if (element === '(') { checksum++; }
            if (element === ')') { checksum--; }
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
}
