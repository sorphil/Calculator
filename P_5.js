const html = document.querySelector('html')
// For comparison purposes
const operators = ['+', '−', 'x', '÷', '*', '/', '-']
const other = [ 'Enter', 'Backspace', '.', 'c', 'C']
let operation= []
let results = ''

document.addEventListener('DOMContentLoaded', ()=>
{
    const darkMode = document.querySelector('#darkMode')
    const numeric = document.querySelectorAll('.numeric')
    const operators = document.querySelectorAll('.operator')
    const functions = document.querySelectorAll('.function')


    darkMode.addEventListener('click', ()=> {
        html.classList.toggle('invert')
        if (html.classList.contains('invert'))
        {
            darkMode.classList.toggle('darkModeToggle')
            darkMode.innerHTML = "☀️"
        }
        else
        {
            darkMode.classList.toggle('darkModeToggle')
            darkMode.innerHTML = "🌙"
        }
        
    })
    btnAddEvents(numeric)
    btnAddEvents(operators)
    btnAddEvents(functions)
    document.addEventListener('keydown', keyboardEvents);
})


// add event listeners
function btnAddEvents(buttons)
{

    buttons.forEach(btn=>{
        if(btn.classList.contains('numeric'))
        {
            btn.addEventListener('click', ()=>{
                const operationLength = operation.length
                if(results!="")
                {   if(btn.dataset.numeric=="0"&&!isNumeric(operation[operationLength-1])&&operation[operationLength-1]!=".")
                    return
                    results = ""
                    operation.push(btn.dataset.numeric)
                }
                else if(operationLength!=20)
                {   
                    if(btn.dataset.numeric=="0"&&!isNumeric(operation[operationLength-1])&&operation[operationLength-1]!=".")
                    return
                    operation.push(btn.dataset.numeric)
                    
                }
                generateOperation()
                generateResults()
                
            })
            
        }
        else if (btn.classList.contains('operator'))
        {
            btn.addEventListener('click', ()=>{
                const operationLength = operation.length
                if (results!="" && results!=NaN&& results!=Infinity && results!=undefined    && results!="Math Error")
                {
                    if(results%1!=0)
                    {
                        results = Math.ceil(results*10000)/10000
                    }
                    // get result-digits
                    operation = (""+results).split("");
                    operation.push(btn.dataset.operator)
                    results =""

                }
                else if(operationLength!=0 && operationLength!=20 && !operators.includes(operation[operationLength-1]) && isNumeric(operation[operationLength-1]))
                {   
                    operation.push(btn.dataset.operator)
                }
                generateOperation()
                generateResults()
            })
        }
        else
        {
            btn.addEventListener('click', ()=>{
                window[btn.dataset.function]();
            })
        }
    })
}


function keyboardEvents(e)
{
    const operationLength = operation.length
    if(!isNumeric(e.key) && !operators.includes(e.key) && !other.includes(e.key))
    {
        return
    }

    if(isNumeric(e.key))
    {
        // removes results when number is clicked
        if(results!="")
        {   
            if(e.key=="0"&&!isNumeric(operation[operationLength-1])&&operation[operationLength-1]!=".")
            return
            results = ""
            operation.push(e.key)
        }
        else if(operationLength!=20)
        {  
            if(e.key=="0"&&!isNumeric(operation[operationLength-1])&&operation[operationLength-1]!=".")
            return
            operation.push(e.key)
        }

    }
    else if (operators.includes(e.key))
    {
        // if results are not zero, puts results into the operation array and adds the clicked operator
        if (results!="" && results!=NaN&& results!=Infinity && results!=undefined && results!="Math Error")
        {
            if(results%1!=0)
            {
                results = Math.ceil(results*10000)/10000
            }
                    
            // get result-digits
            operation = (""+results).split("");
            results = ""
            if(e.key=="/")
            {
                operation.push('÷')
            }
            else if(e.key=="*")
            {
                operation.push('x')
            }
            else if(e.key=="-")
            {
                operation.push('−')
            }
            else
            {
                operation.push(e.key)
            }

        }

        // prevents consecutive operators/starting expression with operator/and putting operators after decimal points
        else if(operationLength!=0 && operationLength!=20 && !operators.includes(operation[operationLength-1]) && isNumeric(operation[operationLength-1]))
        {   
            if(e.key=="/")
            {
                operation.push('÷')
            }
            else if(e.key=="*")
            {
                operation.push('x')
            }
            else if (e.key=='-')
            {
                operation.push('−')
            }
            else
            {
                operation.push(e.key)
            }
        }

        //Allow negative sign only when before x or ÷ or at the start of number
        else if((operation[operationLength-1]=="x"||operation[operationLength-1]=="÷"||operationLength==0) && e.key=='-')
        {
            operation.push('-')
         
        }
        // if negative sign is already present, remove
        else if(e.key=='-'&&operation[operationLength-1]=='-')
        {
            operation.pop()
        }
    }
    else
    {
        if(e.key=="Backspace")
        {
            delKey()
            return
        }
        if(e.key=="Enter")
        {
            operate()
            return
        }
        if(e.key==".")
        {
            decimalpoint()
            return
        }
        if(e.key=='c'||e.key=='C')
        {
            clear()
            return
        }
    }

    generateOperation()
    generateResults()
}



// generate text functions
function generateOperation()
{
    const calculatorOperations = document.querySelector('.calculatorOperations')
    
    calculatorOperations.innerHTML = ""
    for(let i=0; i<operation.length;i++)
    {
        const td = document.createElement('td')
        td.innerHTML = operation[i]
        calculatorOperations.appendChild(td)
    }
}

function generateResults()
{
    const calculatorResult = document.querySelector('.calculatorResult')
    calculatorResult.innerHTML = ""
    calculatorResult.innerHTML = results
}




// calculation functions (evaluates infix expression) and arranges operands and operators (based on operator-precedence)
function operate()
{
    if(operators.includes(operation[operation.length-1]))
    {
        document.querySelector('.calculatorResult').innerHTML = "Invalid syntax"
        return
    }
    let operatorStack = []
    let operandStack = []
    let digitStack = ""
    for (let i = 0; i<operation.length;i++)
    {
        // if it is an operand
        if (isNumeric(operation[i]) || operation[i]=='.'||operation[i]=="-")
        {
            digitStack+= operation[i]
        }

        //if the digit is an operator
        else if (operators.includes(operation[i])&&operation[i]!="-")
        {
            operandStack.push(parseFloat(digitStack))
            if(operatorStack.length==0)
            {
                operatorStack.push(operation[i])
            }
            else
            {
                // if tjoperator is either a * or /, push it as it takes higher precence
                if(operation[i]=='x'||operation[i]=='÷') {operatorStack.push(operation[i])}

                else if(operation[i]=='+'||operation[i]=='−')
                {
                    while(operatorStack[operatorStack.length-1]=='x'||operatorStack[operatorStack.length-1]=='÷')
                    {
                        operand_1 = parseFloat(operandStack.pop())
                        operand_2 = parseFloat(operandStack.pop())
                        if(operatorStack[operatorStack.length-1]=='x')
                        {
                            operatorStack.pop()
                            operandStack.push(operand_2 * operand_1)
                        }
                        else if(operatorStack[operatorStack.length-1]=='÷')
                        {
                            operatorStack.pop()
                            operandStack.push(operand_2 / operand_1)
                        }
                    }
                    operatorStack.push(operation[i])
                }
            }
            digitStack = ""
        } 
        //if at the end of the operationArray, push the final operand
        if (i==operation.length-1)
        {
            operandStack.push(parseFloat(digitStack))
        }
    }
    calculate(operandStack, operatorStack)
}

// arranged operands and operators are popped and evaluated one at a time
function calculate(operandStack, operatorStack)
{
    for(let i = operatorStack.length-1; i>=0; i--)
    {
        operand_1 = operandStack.pop()
        operand_2 = operandStack.pop()
        if(operatorStack[i]=="x")
        {
            operandStack.push(operand_2*operand_1)
        }
        else if(operatorStack[i]=='÷')
        {
            operandStack.push(operand_2/operand_1)
        }
        else if(operatorStack[i]=='+')
        {
            operandStack.push(operand_2+operand_1)
        }
        else if(operatorStack[i]=='−')
        {
            operandStack.push(operand_2-operand_1)
        }
       
    }

    if(operandStack[0]==undefined && operation.length==0)
    {
        return
    }
    results = operandStack[0]

    

    if (((""+results).split("")).length>19 || results == NaN|| results == Infinity)
    {
        results = "Math Error"
    }
    operation = []
    generateResults()
    generateOperation()
    
}






function clear()
{
    operation = []
    results = ''
    generateOperation()
    generateResults()
}


function delKey()
{
    operation.pop()
    generateOperation()
}

function decimalpoint()
{
    if(operators.includes(operation[operation.length-1])||operation[operation.length-1]=="."||operation.length==0)
    {
        return
    }
    else
    {
        for(let i =operation.length-1; i>=0;i--)
        {
            if(operation[i]=='.') {return}
            else if(operators.includes(operation[i])) {break;}
        }
        operation.push('.')
        generateOperation()
    }
}


function posiNeg()
{
    let operationLast = operation[operation.length-1]
    console.log(operationLast)
    if(operationLast=="x"||operationLast=="÷"|| operation.length==0)
    {
        if(results!="")
        results = ""
        operation.push('-')
    }
    else if(operationLast=='-')
    {
        operation.pop()
    }
    generateOperation()
    generateResults()
}



function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }