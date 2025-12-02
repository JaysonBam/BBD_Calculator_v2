/// <reference path="calculator.ts" />
/// <reference path="input-handler.ts" />

(() => {
    if (typeof document === 'undefined') return;

    const calculatorForm = document.querySelector('form')
    if (calculatorForm){
        const displayElement = calculatorForm.querySelector('input')
        if (!displayElement) {return}
        const display = displayElement;
        
        const calc = new CalculatorApp.Calculator();

        const degBtn = document.getElementById('degBtn');
        if (degBtn) {
            degBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                calc.isRadians = !calc.isRadians;
                degBtn.innerText = calc.isRadians ? 'RAD' : 'DEG';
            });
        }

        function showBootstrapAlert(message: string) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            alertDiv.style.zIndex = '1050';
            alertDiv.role = 'alert';
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" aria-label="Close"></button>
            `;

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
        function handleInput(input: string){
            const ClearValue: string = 'CL'
            const DeleteValue: string = 'DL'
            const CalculateValue: string = '='

            if (input === ClearValue){
                display.value = '';
            }
            else if (input === DeleteValue){
                display.value = CalculatorApp.InputHandler.handleDelete(display.value);
            }
            else if (input === CalculateValue){
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
            const button = (e.target as HTMLElement)?.closest('button');
            if (button && button.id !== 'degBtn') 
                handleInput(button.innerText);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleInput('=');
            } else if (e.key === 'Backspace') {
                handleInput('DL');
            } else if (e.key === 'Delete') {
                e.preventDefault();
                handleInput('CL');
            } else {
                const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '(', ')', '.', '/', '*', '+', '-', '^', '%', 'e'];
                if (validKeys.indexOf(e.key) !== -1) {
                    handleInput(e.key);
                }
            }
        });
    }
})()
