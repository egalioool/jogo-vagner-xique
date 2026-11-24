import { CodeChallenge, ProgrammingTopic } from '../types/game';

export const CHALLENGE_BANK: CodeChallenge[] = [
  // ================= VARIÁVEIS =================
  {
    id: 'var-1',
    topic: 'VARIAVEIS',
    format: 'SAIDA',
    difficulty: 1,
    title: 'Reatribuição de Variável',
    prompt: 'Qual valor será exibido no console ao final da execução?',
    code: `let pontos = 10;
pontos = pontos + 5;
pontos = pontos * 2;
console.log(pontos);`,
    options: ['20', '30', '25', '15'],
    correctIndex: 1,
    explanation: 'Primeiro pontos recebe 10 + 5 = 15. Depois 15 * 2 = 30. Variáveis guardam sempre o último valor atribuído!',
  },
  {
    id: 'var-2',
    topic: 'VARIAVEIS',
    format: 'LACUNA',
    difficulty: 1,
    title: 'Troca de Valores (Swap)',
    prompt: 'Para trocar os valores de "a" e "b" usando "temp", o que falta na linha 3?',
    code: `let a = 7, b = 12;
let temp = a;
a = b;
b = _____;`,
    options: ['a', 'b', 'temp', '0'],
    correctIndex: 2,
    explanation: 'Como "a" foi sobrescrito por "b", guardamos o antigo valor de "a" em "temp". Logo, "b" recebe "temp"!',
  },
  {
    id: 'var-3',
    topic: 'VARIAVEIS',
    format: 'SAIDA',
    difficulty: 1,
    title: 'Texto vs Número',
    prompt: 'O que será impresso em JavaScript?',
    code: `let x = "5";
let y = 3;
console.log(x + y);`,
    options: ['8', '"53"', '2', 'Erro de sintaxe'],
    correctIndex: 1,
    explanation: 'Quando somamos uma string ("5") com um número (3), o operador + faz concatenação, resultando em "53".',
  },

  // ================= TABUADA =================
  {
    id: 'tab-1',
    topic: 'TABUADA',
    format: 'SAIDA',
    difficulty: 1,
    title: 'Tabuada Dinâmica',
    prompt: 'Qual será o último número impresso por essa tabuada do 7?',
    code: `let base = 7;
let ultimo = 0;
for (let i = 1; i <= 6; i++) {
  ultimo = base * i;
}
console.log(ultimo);`,
    options: ['35', '42', '49', '28'],
    correctIndex: 1,
    explanation: 'O laço vai até i = 6. Na última iteração, calcula 7 * 6 = 42.',
  },
  {
    id: 'tab-2',
    topic: 'TABUADA',
    format: 'LACUNA',
    difficulty: 1,
    title: 'Completar a Tabuada',
    prompt: 'Complete a condição para imprimir a tabuada completa de 1 até 10:',
    code: `let n = 8;
for (let i = 1; _____; i++) {
  console.log(n + " x " + i + " = " + (n * i));
}`,
    options: ['i < 10', 'i <= 10', 'i == 10', 'i >= 10'],
    correctIndex: 1,
    explanation: 'Para incluir o 10 na tabuada (8 x 10 = 80), usamos i <= 10.',
  },
  {
    id: 'tab-3',
    topic: 'TABUADA',
    format: 'SAIDA',
    difficulty: 2,
    title: 'Soma da Tabuada do 3',
    prompt: 'Qual é o valor final da variável "soma"?',
    code: `let soma = 0;
for (let i = 1; i <= 4; i++) {
  soma += 3 * i;
}
console.log(soma);`,
    options: ['12', '18', '30', '24'],
    correctIndex: 2,
    explanation: 'Os termos são 3*1=3, 3*2=6, 3*3=9, 3*4=12. Somando: 3 + 6 + 9 + 12 = 30!',
  },

  // ================= FOR =================
  {
    id: 'for-1',
    topic: 'FOR',
    format: 'SAIDA',
    difficulty: 1,
    title: 'Contador de Passos',
    prompt: 'Quantas vezes a palavra "Estudar!" será exibida?',
    code: `for (let i = 0; i < 5; i++) {
  console.log("Estudar!");
}`,
    options: ['4 vezes', '5 vezes', '6 vezes', 'Infinitas vezes'],
    correctIndex: 1,
    explanation: 'Começando em i = 0 e indo enquanto i < 5, os valores são 0, 1, 2, 3 e 4: exatamente 5 repetições.',
  },
  {
    id: 'for-2',
    topic: 'FOR',
    format: 'SAIDA',
    difficulty: 2,
    title: 'Passo de 2 em 2',
    prompt: 'Qual sequência será impressa pelo laço FOR?',
    code: `let res = "";
for (let i = 2; i <= 8; i += 2) {
  res += i + " ";
}
console.log(res.trim());`,
    options: ['2 4 6', '2 4 6 8', '0 2 4 6 8', '2 3 4 5 6 7 8'],
    correctIndex: 1,
    explanation: 'O incremento i += 2 soma 2 a cada passo: 2, 4, 6 e 8 (pois i <= 8 inclui o 8).',
  },
  {
    id: 'for-3',
    topic: 'FOR',
    format: 'BUG',
    difficulty: 2,
    title: 'Caça ao Bug no FOR',
    prompt: 'Por que este laço FOR trava o navegador em um loop infinito?',
    code: `for (let i = 10; i > 0; i++) {
  console.log(i);
}`,
    options: [
      'Porque i começa em 10',
      'Porque i++ aumenta i em vez de diminuir (deveria ser i--)',
      'Porque faltou ponto e vírgula',
      'Porque console.log não funciona no FOR',
    ],
    correctIndex: 1,
    explanation: 'Se i começa em 10 e aumenta (i++), i sempre será maior que 0! Para contagem regressiva, o correto é i--.',
  },
  {
    id: 'for-4',
    topic: 'FOR',
    format: 'SAIDA',
    difficulty: 2,
    title: 'Acumulador de Pares',
    prompt: 'Qual o valor final de "total" após o laço FOR?',
    code: `let total = 0;
for (let i = 1; i <= 6; i++) {
  if (i % 2 === 0) {
    total += i;
  }
}
console.log(total);`,
    options: ['6', '10', '12', '21'],
    correctIndex: 2,
    explanation: 'Apenas os números pares de 1 a 6 entram no if: 2 + 4 + 6 = 12.',
  },

  // ================= WHILE =================
  {
    id: 'while-1',
    topic: 'WHILE',
    format: 'SAIDA',
    difficulty: 1,
    title: 'Contagem com WHILE',
    prompt: 'Qual será o valor final de "n" impresso no console?',
    code: `let n = 1;
while (n < 16) {
  n = n * 2;
}
console.log(n);`,
    options: ['8', '15', '16', '32'],
    correctIndex: 2,
    explanation: 'n assume: 1 -> 2 -> 4 -> 8 -> 16. Quando n vira 16, a condição (16 < 16) fica falsa e o while para!',
  },
  {
    id: 'while-2',
    topic: 'WHILE',
    format: 'BUG',
    difficulty: 2,
    title: 'Perigo do Loop Infinito!',
    prompt: 'O que está faltando dentro do WHILE para ele não rodar para sempre?',
    code: `let energia = 3;
while (energia > 0) {
  console.log("Ativo!");
}`,
    options: [
      'Mudar while para if',
      'Atualizar a variável: energia--',
      'Colocar energia = 10',
      'Remover as chaves { }',
    ],
    correctIndex: 1,
    explanation: 'Sem decrementar "energia" dentro do bloco, energia continua 3 para sempre e a condição nunca se torna falsa!',
  },
  {
    id: 'while-3',
    topic: 'WHILE',
    format: 'LACUNA',
    difficulty: 2,
    title: 'Condição de Parada',
    prompt: 'Queremos somar números até a soma atingir ou passar de 20. Complete o WHILE:',
    code: `let soma = 0, i = 1;
while (_____) {
  soma += i;
  i++;
}`,
    options: ['soma < 20', 'soma > 20', 'soma === 20', 'i < 20'],
    correctIndex: 0,
    explanation: 'Enquanto a soma for menor que 20 (soma < 20), continuamos somando. Assim que atingir ou passar de 20, o laço para!',
  },
  {
    id: 'while-4',
    topic: 'WHILE',
    format: 'SAIDA',
    difficulty: 3,
    title: 'Divisões Sucessivas',
    prompt: 'Quantas vezes o laço WHILE é executado?',
    code: `let x = 81;
let passos = 0;
while (x > 1) {
  x = x / 3;
  passos++;
}
console.log(passos);`,
    options: ['3', '4', '5', '9'],
    correctIndex: 1,
    explanation: '81 -> 27 (1) -> 9 (2) -> 3 (3) -> 1 (4). Como 1 > 1 é falso, para após 4 passos!',
  },

  // ================= NÚMEROS PRIMOS =================
  {
    id: 'primo-1',
    topic: 'PRIMOS',
    format: 'SAIDA',
    difficulty: 2,
    title: 'Verificador de Primo',
    prompt: 'Para n = 17, o que a função abaixo retorna?',
    code: `function ehPrimo(n) {
  if (n < 2) return false;
  for (let i = 2; i < n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}
console.log(ehPrimo(17));`,
    options: ['false', 'true', '17', 'undefined'],
    correctIndex: 1,
    explanation: '17 só é divisível por 1 e por ele mesmo. Nenhum número entre 2 e 16 divide 17 com resto 0, então retorna true!',
  },
  {
    id: 'primo-2',
    topic: 'PRIMOS',
    format: 'LACUNA',
    difficulty: 2,
    title: 'Lógica da Divisibilidade',
    prompt: 'Qual expressão verifica se "n" é divisível por "i" (não é primo)?',
    code: `for (let i = 2; i <= Math.sqrt(n); i++) {
  if (_____) {
    return false;
  }
}`,
    options: ['n / i === 0', 'n % i === 0', 'n % i !== 0', 'i % n === 1'],
    correctIndex: 1,
    explanation: 'O operador módulo (%) retorna o resto da divisão. Se n % i === 0, "i" é um divisor exato de "n", logo "n" não é primo!',
  },
  {
    id: 'primo-3',
    topic: 'PRIMOS',
    format: 'SAIDA',
    difficulty: 2,
    title: 'Contando Primos',
    prompt: 'Quantos números primos existem no intervalo de 1 até 10?',
    code: `// Lembre-se: 1 NÃO é primo!
// Teste os números: 2, 3, 4, 5, 6, 7, 8, 9, 10`,
    options: ['3 (3, 5, 7)', '4 (2, 3, 5, 7)', '5 (1, 2, 3, 5, 7)', '4 (2, 3, 7, 9)'],
    correctIndex: 1,
    explanation: 'Os primos até 10 são: 2 (único primo par!), 3, 5 e 7. O número 1 não é primo e 9 = 3 x 3.',
  },
  {
    id: 'primo-4',
    topic: 'PRIMOS',
    format: 'BUG',
    difficulty: 3,
    title: 'Bug Clássico do Número 2',
    prompt: 'Por que este código falha ao testar se n = 2 é primo?',
    code: `function primo(n) {
  for (let i = 2; i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}`,
    options: [
      'Porque usou i <= n em vez de i < n (ele testa n % n === 0!)',
      'Porque 2 é ímpar',
      'Porque deveria começar em i = 0',
      'Porque faltou else',
    ],
    correctIndex: 0,
    explanation: 'Com i <= n, o laço chega em i = n e todo número é divisível por si mesmo (n % n === 0), retornando false sempre!',
  },

  // ================= FIBONACCI =================
  {
    id: 'fib-1',
    topic: 'FIBONACCI',
    format: 'SAIDA',
    difficulty: 2,
    title: 'Sequência de Fibonacci',
    prompt: 'Qual será o valor impresso após o laço abaixo?',
    code: `let a = 0, b = 1;
for (let i = 0; i < 5; i++) {
  let prox = a + b;
  a = b;
  b = prox;
}
console.log(a);`,
    options: ['3', '5', '8', '13'],
    correctIndex: 1,
    explanation: 'A cada passo: (0,1)->(1,1)->(1,2)->(2,3)->(3,5)->(5,8). Após 5 iterações, "a" vale 5!',
  },
  {
    id: 'fib-2',
    topic: 'FIBONACCI',
    format: 'LACUNA',
    difficulty: 2,
    title: 'Construindo Fibonacci',
    prompt: 'Complete a atualização das variáveis na sequência de Fibonacci:',
    code: `let a = 1, b = 1;
let c = a + b;
a = b;
b = _____;`,
    options: ['a', 'c', 'a + 1', 'b'],
    correctIndex: 1,
    explanation: 'Na janela deslizante de Fibonacci, "a" avança para "b", e "b" avança para o novo termo calculado "c"!',
  },
  {
    id: 'fib-3',
    topic: 'FIBONACCI',
    format: 'SAIDA',
    difficulty: 3,
    title: 'Próximo Termo da Série',
    prompt: 'Na sequência de Fibonacci: 1, 1, 2, 3, 5, 8, 13, 21, ___. Qual o próximo número?',
    code: `// F(n) = F(n-1) + F(n-2)
const f8 = 21;
const f7 = 13;
console.log(f8 + f7);`,
    options: ['32', '34', '35', '29'],
    correctIndex: 1,
    explanation: 'Cada termo de Fibonacci é a soma dos dois anteriores: 13 + 21 = 34!',
  },

  // ================= ALGORITMOS CLÁSSICOS =================
  {
    id: 'alg-1',
    topic: 'ALGORITMOS',
    format: 'SAIDA',
    difficulty: 2,
    title: 'Maior Elemento do Vetor',
    prompt: 'O que este algoritmo clássico imprime no console?',
    code: `const notas = [4, 9, 2, 10, 7];
let maior = notas[0];
for (let i = 1; i < notas.length; i++) {
  if (notas[i] > maior) maior = notas[i];
}
console.log(maior);`,
    options: ['4', '9', '10', '7'],
    correctIndex: 2,
    explanation: 'O algoritmo percorre o array comparando cada elemento com "maior", encontrando o máximo: 10!',
  },
  {
    id: 'alg-2',
    topic: 'ALGORITMOS',
    format: 'SAIDA',
    difficulty: 3,
    title: 'Fatorial Recursivo / Iterativo',
    prompt: 'Qual o resultado de fatorial(5)?',
    code: `function fatorial(n) {
  let fat = 1;
  for (let i = 2; i <= n; i++) {
    fat *= i;
  }
  return fat;
}
console.log(fatorial(5));`,
    options: ['25', '60', '120', '24'],
    correctIndex: 2,
    explanation: '5! = 1 * 2 * 3 * 4 * 5 = 120!',
  },
  {
    id: 'alg-3',
    topic: 'ALGORITMOS',
    format: 'LACUNA',
    difficulty: 3,
    title: 'Busca Binária',
    prompt: 'Na Busca Binária em um vetor ordenado, como calculamos o índice do meio?',
    code: `let inicio = 0, fim = arr.length - 1;
while (inicio <= fim) {
  let meio = _____;
  if (arr[meio] === alvo) return meio;
}`,
    options: [
      'Math.floor((inicio + fim) / 2)',
      '(inicio * fim) / 2',
      'arr.length',
      'inicio - fim',
    ],
    correctIndex: 0,
    explanation: 'O meio exato é a média inteira entre início e fim: Math.floor((inicio + fim) / 2)!',
  },
  {
    id: 'alg-4',
    topic: 'ALGORITMOS',
    format: 'SAIDA',
    difficulty: 3,
    title: 'Primeira Passada do Bubble Sort',
    prompt: 'Após UMA passagem completa comparando pares adjacentes, qual array fica?',
    code: `// Troca se arr[j] > arr[j+1]
let arr = [5, 3, 4, 1];
for (let j = 0; j < arr.length - 1; j++) {
  if (arr[j] > arr[j+1]) {
    [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
  }
}`,
    options: ['[1, 3, 4, 5]', '[3, 4, 1, 5]', '[3, 5, 4, 1]', '[5, 4, 3, 1]'],
    correctIndex: 1,
    explanation: 'O 5 vai "borbulhando" para a direita: [3,5,4,1] -> [3,4,5,1] -> [3,4,1,5]. O maior elemento chega ao fim!',
  },
];

export function pickChallenge(
  topicPool: ProgrammingTopic[],
  usedIds: Set<string>,
  preferredWeakness?: ProgrammingTopic
): CodeChallenge {
  const candidates = CHALLENGE_BANK.filter((c) => topicPool.includes(c.topic));
  const fresh = candidates.filter((c) => !usedIds.has(c.id));
  const pool = fresh.length > 0 ? fresh : candidates.length > 0 ? candidates : CHALLENGE_BANK;

  if (preferredWeakness) {
    const weaknessMatches = pool.filter((c) => c.topic === preferredWeakness);
    if (weaknessMatches.length > 0 && Math.random() < 0.45) {
      return weaknessMatches[Math.floor(Math.random() * weaknessMatches.length)];
    }
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

export const TOPIC_LABELS: Record<ProgrammingTopic, string> = {
  FOR: 'Laço FOR',
  WHILE: 'Laço WHILE',
  VARIAVEIS: 'Variáveis',
  PRIMOS: 'Números Primos',
  FIBONACCI: 'Fibonacci',
  TABUADA: 'Tabuada',
  ALGORITMOS: 'Algoritmos Clássicos',
};
