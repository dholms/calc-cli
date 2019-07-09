const readline = require('readline')

function run() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.setPrompt('> ')
    rl.prompt()
    rl.on('line', (cmd) =>{
        try{
            const parsed = parse(cmd)
            const result = evaluate(parsed)
            console.log(result)
        }catch(err){
            console.log(err.toString())
        }
        rl.prompt()
    })
}

const opRegex = /[+*-\/^()]/

// parse mathematical expr into array of integers and operators
function parse(expr){
    let result = []
    let i=0
    while(i<expr.length){
        const char = expr[i]
        if(char === ' '){
            i++
        }else if(opRegex.test(char)){
            result.push(char)
            i++
        }else{
            const nextOp = expr.substring(i).search(opRegex)
            const end = nextOp > -1 ? i + nextOp : expr.length 
            const num = parseInt(expr.substring(i, end))
            result.push(num)
            i = end
        }
    }
    return result
}

// recursively evaluate expr, each time splitting on the operator with the lowest precedence
function evaluate(expr){
    if(expr[0] === '(' && expr[expr.length-1] === ')'){
        return evaluate(expr.slice(1, expr.length-1))
    }
    if(expr.length === 1){
        return expr[0]
    }
    const opIndex = leastPrecedence(expr)
    if(opIndex < 1){
        throw new Error("Invalid syntax")
    }
    const left = evaluate(expr.slice(0, opIndex))
    const right = evaluate(expr.slice(opIndex+1))
    const result = stringMath(left, right, expr[opIndex])
    if(isNaN(result)){
        throw new Error("Invalid syntax")
    }
    return result
}

// find the index operator with the least precedence based on order of operations
function leastPrecedence(expr){
    let paranLevel = 0
    let least = Number.MAX_SAFE_INTEGER
    let index = -1

    for(let i=0; i<expr.length; i++){
        const char = expr[i]
        if(!isNaN(char)){
            continue
        }else if(char === '('){
            paranLevel++
            continue
        }else if(char === ')'){
            paranLevel--
            continue
        }
        const precedence = precedenceMap[char] + (paranLevel*100)
        // (<=) because of left-right associativity, (just < otherwise)
        if(precedence <= least){
            least = precedence
            index = i
        }
    }
    return index
}

function stringMath(a, b, opChar){
    switch(opChar){
        case '+': return a+b
        case '-': return a-b
        case '*': return a*b
        case '/':
            if(b === 0){
                throw new Error("Cannot divide by 0")
            }else{
                return a/b
            }
        case '^': return Math.pow(a, b)
    }
}

const precedenceMap = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
}

// start prompt loop if no arg is provided
// otherwise return result
if(process.argv.length < 3){
    run()
}else{
    const cmd = process.argv.slice(2).join(' ')
    try{
        const parsed = parse(cmd)
        const result = evaluate(parsed)
        console.log(result)
    }catch(err){
        console.log(err.toString())
    }
}


