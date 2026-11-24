import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  FlaskConical,
  Pause,
  Play,
  RotateCcw,
  StepForward,
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

type LabModule =
  | 'FOR_WHILE'
  | 'VARIAVEIS'
  | 'PRIMOS'
  | 'FIBONACCI'
  | 'TABUADA'
  | 'BUBBLE_SORT';

interface ProfessorLabProps {
  onBack: () => void;
  onExperimentRun: () => void;
}

const LAB_MODULES: { id: LabModule; label: string }[] = [
  { id: 'FOR_WHILE', label: 'Laços FOR / WHILE' },
  { id: 'VARIAVEIS', label: 'Variáveis (Swap)' },
  { id: 'PRIMOS', label: 'Números Primos' },
  { id: 'FIBONACCI', label: 'Fibonacci' },
  { id: 'TABUADA', label: 'Tabuada' },
  { id: 'BUBBLE_SORT', label: 'Bubble Sort' },
];

export const ProfessorLab: React.FC<ProfessorLabProps> = ({
  onBack,
  onExperimentRun,
}) => {
  const [activeMod, setActiveMod] = useState<LabModule>('FOR_WHILE');
  const [isPlaying, setIsPlaying] = useState(false);

  // Parâmetros interativos
  const [loopLimit, setLoopLimit] = useState(5);
  const [loopMode, setLoopMode] = useState<'FOR' | 'WHILE'>('FOR');
  const [primeInput, setPrimeInput] = useState(17);
  const [fibCount, setFibCount] = useState(8);
  const [tabuadaBase, setTabuadaBase] = useState(7);

  // Estado da simulação passo-a-passo
  const [step, setStep] = useState(0);
  const [hasTriggeredExp, setHasTriggeredExp] = useState(false);

  const registerExperiment = () => {
    if (!hasTriggeredExp) {
      setHasTriggeredExp(true);
      onExperimentRun();
    }
  };

  // Cálculo dos passos de cada algoritmo
  const getMaxSteps = (): number => {
    if (activeMod === 'FOR_WHILE') return loopLimit;
    if (activeMod === 'VARIAVEIS') return 3;
    if (activeMod === 'PRIMOS') {
      if (primeInput < 2) return 1;
      const limit = Math.floor(Math.sqrt(primeInput));
      let count = 0;
      for (let d = 2; d <= limit; d++) {
        count++;
        if (primeInput % d === 0) break;
      }
      return Math.max(1, count);
    }
    if (activeMod === 'FIBONACCI') return fibCount;
    if (activeMod === 'TABUADA') return 10;
    if (activeMod === 'BUBBLE_SORT') return 15;
    return 5;
  };

  const maxSteps = getMaxSteps();

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStep((prev) => {
        if (prev >= maxSteps) {
          setIsPlaying(false);
          return prev;
        }
        soundEngine.playHover();
        return prev + 1;
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, [isPlaying, maxSteps]);

  const handleSelectModule = (mod: LabModule) => {
    soundEngine.playClick();
    setIsPlaying(false);
    setStep(0);
    setHasTriggeredExp(false);
    setActiveMod(mod);
  };

  const handleStepForward = () => {
    soundEngine.playClick();
    registerExperiment();
    setStep((s) => Math.min(maxSteps, s + 1));
  };

  const handleTogglePlay = () => {
    soundEngine.playClick();
    registerExperiment();
    if (step >= maxSteps) setStep(0);
    setIsPlaying((p) => !p);
  };

  const handleReset = () => {
    soundEngine.playClick();
    setIsPlaying(false);
    setStep(0);
  };

  // ================= DADOS COMPUTADOS POR MÓDULO =================

  // 1. FOR / WHILE
  let loopSoma = 0;
  for (let i = 1; i <= step; i++) loopSoma += i;

  // 2. VARIAVEIS (Swap)
  const swapStates = [
    { a: 10, b: 25, temp: '—', desc: 'Estado inicial: "a" guarda 10 e "b" guarda 25.' },
    { a: 10, b: 25, temp: 10, desc: 'Passo 1: temp = a (salvamos o 10 antes de sobrescrever!).' },
    { a: 25, b: 25, temp: 10, desc: 'Passo 2: a = b ("a" agora recebe 25).' },
    { a: 25, b: 10, temp: 10, desc: 'Passo 3: b = temp ("b" recebe o 10 guardado em temp). Troca concluída!' },
  ];
  const currentSwap = swapStates[Math.min(step, 3)];

  // 3. PRIMOS
  const primeTests: { divisor: number; resto: number; divisible: boolean }[] = [];
  if (primeInput >= 2) {
    const limit = Math.floor(Math.sqrt(primeInput));
    for (let d = 2; d <= limit; d++) {
      const r = primeInput % d;
      primeTests.push({ divisor: d, resto: r, divisible: r === 0 });
      if (r === 0) break;
    }
  }
  const visiblePrimeTests = primeTests.slice(0, step);
  const foundDivisor = visiblePrimeTests.some((t) => t.divisible);
  const finishedPrime = step >= maxSteps;
  const isActuallyPrime =
    primeInput >= 2 && !primeTests.some((t) => t.divisible);

  // 4. FIBONACCI
  const fibSeq: number[] = [];
  for (let i = 0; i < Math.max(2, fibCount); i++) {
    if (i < 2) fibSeq.push(1);
    else fibSeq.push(fibSeq[i - 1] + fibSeq[i - 2]);
  }
  const visibleFib = fibSeq.slice(0, Math.max(2, step));

  // 5. TABUADA
  const tabuadaRows = Array.from({ length: step }, (_, idx) => ({
    i: idx + 1,
    result: tabuadaBase * (idx + 1),
  }));

  // 6. BUBBLE SORT
  const computeBubbleHistory = () => {
    const arr = [7, 3, 9, 2, 6, 4];
    const frames: { arr: number[]; comparing: [number, number] | null; swapped: boolean }[] = [
      { arr: [...arr], comparing: null, swapped: false },
    ];
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - 1 - i; j++) {
        let swapped = false;
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swapped = true;
        }
        frames.push({ arr: [...arr], comparing: [j, j + 1], swapped });
      }
    }
    return frames;
  };
  const bubbleFrames = computeBubbleHistory();
  const currentBubble = bubbleFrames[Math.min(step, bubbleFrames.length - 1)];

  // Código JS real e explicação por módulo
  const getCodeAndTheory = () => {
    switch (activeMod) {
      case 'FOR_WHILE':
        return {
          title:
            loopMode === 'FOR'
              ? 'Laço de Repetição FOR'
              : 'Laço de Repetição WHILE',
          theory:
            loopMode === 'FOR'
              ? 'O laço FOR é ideal quando sabemos exatamente quantas repetições queremos fazer. Ele reúne inicialização (let i = 1), condição (i <= limite) e incremento (i++) em uma linha!'
              : 'O laço WHILE repete enquanto a condição for verdadeira. É essencial atualizar a variável de controle dentro do bloco para evitar o famoso loop infinito!',
          code:
            loopMode === 'FOR'
              ? `let soma = 0;\nfor (let i = 1; i <= ${loopLimit}; i++) {\n  soma += i;\n  console.log("Passo", i, "-> soma:", soma);\n}`
              : `let i = 1, soma = 0;\nwhile (i <= ${loopLimit}) {\n  soma += i;\n  i++; // Atualiza para não travar!\n}`,
        };
      case 'VARIAVEIS':
        return {
          title: 'Variáveis & Troca Segura na Memória',
          theory:
            'Variáveis são caixinhas rotuladas na memória RAM. Se você fizer a = b diretamente, o valor antigo de "a" é apagado! Por isso usamos uma variável auxiliar "temp".',
          code: `let a = 10;\nlet b = 25;\nlet temp = a; // Guarda 10\na = b;        // "a" vira 25\nb = temp;     // "b" vira 10`,
        };
      case 'PRIMOS':
        return {
          title: 'Detector Otimizado de Números Primos',
          theory:
            'Um número primo maior que 1 só é divisível por 1 e por ele mesmo. Basta testar divisores até a raiz quadrada de N (Math.sqrt(n)): se algum tiver resto zero (n % i === 0), já sabemos que não é primo!',
          code: `function ehPrimo(n) {\n  if (n < 2) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}\nehPrimo(${primeInput}); // -> ${isActuallyPrime}`,
        };
      case 'FIBONACCI':
        return {
          title: 'Sequência de Fibonacci',
          theory:
            'Presente na natureza e na ciência da computação, cada novo termo da sequência de Fibonacci nasce da soma dos dois termos imediatamente anteriores: F(n) = F(n-1) + F(n-2).',
          code: `let a = 1, b = 1;\nfor (let i = 2; i < ${fibCount}; i++) {\n  let proximo = a + b;\n  console.log(proximo);\n  a = b;\n  b = proximo;\n}`,
        };
      case 'TABUADA':
        return {
          title: 'Tabuada Automatizada com Laço',
          theory:
            'Em vez de escrever 10 linhas repetidas de multiplicação, um único laço FOR de 1 até 10 gera qualquer tabuada dinamicamente trocando apenas a variável base!',
          code: `const base = ${tabuadaBase};\nfor (let i = 1; i <= 10; i++) {\n  console.log(\`\${base} x \${i} = \${base * i}\`);\n}`,
        };
      case 'BUBBLE_SORT':
        return {
          title: 'Algoritmo Clássico: Bubble Sort',
          theory:
            'O Bubble Sort compara pares vizinhos e troca de lugar quando o da esquerda é maior que o da direita. Aos poucos, os maiores valores "borbulham" até o final do vetor!',
          code: `const arr = [7, 3, 9, 2, 6, 4];\nfor (let i = 0; i < arr.length - 1; i++) {\n  for (let j = 0; j < arr.length - 1 - i; j++) {\n    if (arr[j] > arr[j + 1]) {\n      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n    }\n  }\n}`,
        };
    }
  };

  const info = getCodeAndTheory();

  return (
    <div className="min-h-screen bg-[#0c1219] text-[#f4efe6] pb-12">
      {/* Cabeçalho */}
      <header className="border-b border-slate-800 bg-[#101822]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onBack();
            }}
            className="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-emerald-400 shrink-0" />
            <h1 className="font-pixel text-sm sm:text-base text-white truncate">
              Laboratório do Professor Vagner
            </h1>
          </div>

          <span className="text-xs font-mono text-amber-300 hidden sm:inline whitespace-nowrap">
            Simulador Interativo JS
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        {/* Abas de Seleção de Algoritmo */}
        <div className="flex flex-wrap gap-2">
          {LAB_MODULES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelectModule(m.id)}
              className={`pixel-btn px-3.5 py-2 text-xs sm:text-sm font-pixel cursor-pointer whitespace-nowrap ${
                activeMod === m.id
                  ? 'bg-emerald-600 text-white border-2 border-emerald-300'
                  : 'bg-[#172230] hover:bg-[#1f2e40] text-slate-300 border border-slate-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Layout de Duas Zonas: Palco Visual (Esquerda) + Código e Controles (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Zona Esquerda: Demonstração Visual Animada */}
          <section className="lg:col-span-7 pixel-panel p-5 flex flex-col justify-between gap-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
              <div>
                <h2 className="font-pixel text-base sm:text-lg text-amber-300">
                  {info.title}
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5 tabular-nums">
                  Passo Atual: {step} / {maxSteps}
                </p>
              </div>

              {/* Controles de Execução */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="pixel-btn px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-pixel flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Executar</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleStepForward}
                  disabled={step >= maxSteps}
                  className="pixel-btn px-3 py-2 bg-sky-700 hover:bg-sky-600 disabled:opacity-40 text-white text-xs font-pixel flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title="Avançar 1 passo"
                >
                  <StepForward className="w-4 h-4" />
                  <span>Passo</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="pixel-btn px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-pixel flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title="Reiniciar"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Palco Visual Específico de Cada Algoritmo */}
            <div className="flex-1 bg-[#0a1017] border-2 border-slate-700 p-4 sm:p-5 flex flex-col justify-center min-h-[260px]">
              {activeMod === 'FOR_WHILE' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#15202e] border border-slate-600 text-center">
                      <span className="text-xs font-mono text-slate-400">
                        Variável i
                      </span>
                      <p className="font-pixel text-2xl text-sky-300 mt-1 tabular-nums">
                        {step === 0 ? 1 : Math.min(step + 1, loopLimit + 1)}
                      </p>
                    </div>
                    <div className="p-3 bg-[#15202e] border border-slate-600 text-center">
                      <span className="text-xs font-mono text-slate-400">
                        Acumulador soma
                      </span>
                      <p className="font-pixel text-2xl text-emerald-300 mt-1 tabular-nums">
                        {loopSoma}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: loopLimit }, (_, idx) => {
                      const val = idx + 1;
                      const active = val <= step;
                      return (
                        <div
                          key={val}
                          className={`px-3 py-2 font-mono text-sm border-2 transition-transform tabular-nums ${
                            val === step
                              ? 'bg-amber-500 text-slate-950 border-amber-200 scale-105 font-bold'
                              : active
                                ? 'bg-emerald-900/70 text-emerald-200 border-emerald-500'
                                : 'bg-slate-900 text-slate-500 border-slate-700'
                          }`}
                        >
                          +{val}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeMod === 'VARIAVEIS' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-3 sm:gap-5">
                    {[
                      { name: 'let a', val: currentSwap.a, color: 'border-sky-400 text-sky-300' },
                      { name: 'let b', val: currentSwap.b, color: 'border-amber-400 text-amber-300' },
                      { name: 'let temp', val: currentSwap.temp, color: 'border-emerald-400 text-emerald-300' },
                    ].map((box) => (
                      <div
                        key={box.name}
                        className={`p-4 bg-[#141f2c] border-2 text-center ${box.color}`}
                      >
                        <span className="font-mono text-xs text-slate-400 block">
                          {box.name}
                        </span>
                        <span className="font-pixel text-2xl sm:text-3xl mt-2 block tabular-nums">
                          {box.val}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-200 bg-[#15202d] border border-slate-700 p-3">
                    {currentSwap.desc}
                  </p>
                </div>
              )}

              {activeMod === 'PRIMOS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#15202e] border border-slate-600 p-3">
                    <span className="text-sm text-slate-300">
                      Testando número <strong className="text-white font-mono">{primeInput}</strong>
                    </span>
                    <span
                      className={`font-pixel text-xs sm:text-sm ${
                        primeInput < 2
                          ? 'text-rose-400'
                          : foundDivisor
                            ? 'text-rose-400'
                            : finishedPrime
                              ? 'text-emerald-400'
                              : 'text-amber-300'
                      }`}
                    >
                      {primeInput < 2
                        ? 'NÃO É PRIMO'
                        : foundDivisor
                          ? 'NÃO É PRIMO!'
                          : finishedPrime
                            ? 'É PRIMO!'
                            : 'ANALISANDO...'}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {visiblePrimeTests.length === 0 ? (
                      <p className="text-xs text-slate-400 font-mono">
                        Clique em Executar ou Passo para testar os divisores de 2 até √{primeInput}.
                      </p>
                    ) : (
                      visiblePrimeTests.map((t) => (
                        <div
                          key={t.divisor}
                          className={`flex items-center justify-between px-3 py-2 border font-mono text-xs sm:text-sm tabular-nums ${
                            t.divisible
                              ? 'bg-rose-950/70 border-rose-500 text-rose-200'
                              : 'bg-emerald-950/50 border-emerald-700 text-emerald-200'
                          }`}
                        >
                          <span>
                            {primeInput} % {t.divisor} = {t.resto}
                          </span>
                          <span>
                            {t.divisible ? 'Divisor encontrado!' : 'Resto != 0 (OK)'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeMod === 'FIBONACCI' && (
                <div className="space-y-4">
                  <div className="flex items-end gap-2 h-40 pt-4 overflow-x-auto">
                    {visibleFib.map((num, idx) => {
                      const maxVal = visibleFib[visibleFib.length - 1] || 1;
                      const heightPct = Math.max(16, Math.round((num / maxVal) * 100));
                      return (
                        <div
                          key={idx}
                          className="flex-1 min-w-[36px] flex flex-col items-center justify-end gap-1 h-full"
                        >
                          <span className="font-mono text-xs text-amber-300 tabular-nums">
                            {num}
                          </span>
                          <div
                            className="w-full bg-amber-500 border-t-2 border-amber-200 transition-all duration-300"
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="font-mono text-[10px] text-slate-400">
                            F{idx + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs font-mono text-slate-300">
                    Sequência atual: [{visibleFib.join(', ')}]
                  </p>
                </div>
              )}

              {activeMod === 'TABUADA' && (
                <div className="grid grid-cols-2 gap-2">
                  {tabuadaRows.length === 0 ? (
                    <p className="col-span-2 text-xs font-mono text-slate-400">
                      Pressione Executar ou Passo para gerar a tabuada do {tabuadaBase}.
                    </p>
                  ) : (
                    tabuadaRows.map((row) => (
                      <div
                        key={row.i}
                        className="px-3 py-1.5 bg-[#15202e] border border-slate-700 font-mono text-xs sm:text-sm text-emerald-300 tabular-nums"
                      >
                        {tabuadaBase} x {row.i} ={' '}
                        <strong className="text-white">{row.result}</strong>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeMod === 'BUBBLE_SORT' && (
                <div className="space-y-4">
                  <div className="flex items-end justify-center gap-3 h-40 pt-4">
                    {currentBubble.arr.map((val, idx) => {
                      const isCompared =
                        currentBubble.comparing &&
                        (currentBubble.comparing[0] === idx ||
                          currentBubble.comparing[1] === idx);
                      const heightPct = Math.round((val / 10) * 100);
                      return (
                        <div
                          key={idx}
                          className="w-10 sm:w-12 flex flex-col items-center justify-end gap-1 h-full"
                        >
                          <span className="font-mono text-xs font-bold text-white tabular-nums">
                            {val}
                          </span>
                          <div
                            className={`w-full border-t-2 transition-all duration-200 ${
                              isCompared
                                ? currentBubble.swapped
                                  ? 'bg-amber-500 border-amber-200'
                                  : 'bg-sky-500 border-sky-200'
                                : 'bg-emerald-600 border-emerald-300'
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="font-mono text-[10px] text-slate-400">
                            [{idx}]
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs font-mono text-slate-300 text-center">
                    {currentBubble.comparing
                      ? `Comparando índices [${currentBubble.comparing[0]}] e [${currentBubble.comparing[1]}] ${
                          currentBubble.swapped ? '→ Trocou!' : '→ Já em ordem'
                        }`
                      : 'Vetor inicial desordenado: [7, 3, 9, 2, 6, 4]'}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Zona Direita: Parâmetros, Código Real JS e Explicação Didática */}
          <aside className="lg:col-span-5 pixel-panel p-5 flex flex-col justify-between gap-4">
            <div className="space-y-4">
              {/* Controles de Entrada Parametrizados */}
              {activeMod === 'FOR_WHILE' && (
                <div className="p-3 bg-[#0f1722] border border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-slate-300">
                      Tipo de Laço:
                    </span>
                    <div className="flex gap-1.5">
                      {(['FOR', 'WHILE'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setLoopMode(mode);
                            handleReset();
                          }}
                          className={`px-2.5 py-1 text-xs font-mono cursor-pointer ${
                            loopMode === mode
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="block text-xs font-mono text-slate-300 tabular-nums">
                    Limite de repetições: {loopLimit}
                    <input
                      type="range"
                      min={3}
                      max={8}
                      value={loopLimit}
                      onChange={(e) => {
                        setLoopLimit(Number(e.target.value));
                        handleReset();
                      }}
                      className="w-full mt-1 accent-amber-400"
                    />
                  </label>
                </div>
              )}

              {activeMod === 'PRIMOS' && (
                <div className="p-3 bg-[#0f1722] border border-slate-700">
                  <label className="block text-xs font-mono text-slate-300 tabular-nums">
                    Número para testar (2 a 97): {primeInput}
                    <input
                      type="range"
                      min={2}
                      max={97}
                      value={primeInput}
                      onChange={(e) => {
                        setPrimeInput(Number(e.target.value));
                        handleReset();
                      }}
                      className="w-full mt-1 accent-emerald-400"
                    />
                  </label>
                </div>
              )}

              {activeMod === 'FIBONACCI' && (
                <div className="p-3 bg-[#0f1722] border border-slate-700">
                  <label className="block text-xs font-mono text-slate-300 tabular-nums">
                    Quantidade de termos: {fibCount}
                    <input
                      type="range"
                      min={4}
                      max={10}
                      value={fibCount}
                      onChange={(e) => {
                        setFibCount(Number(e.target.value));
                        handleReset();
                      }}
                      className="w-full mt-1 accent-amber-400"
                    />
                  </label>
                </div>
              )}

              {activeMod === 'TABUADA' && (
                <div className="p-3 bg-[#0f1722] border border-slate-700">
                  <label className="block text-xs font-mono text-slate-300 tabular-nums">
                    Base da Tabuada: {tabuadaBase}
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={tabuadaBase}
                      onChange={(e) => {
                        setTabuadaBase(Number(e.target.value));
                        handleReset();
                      }}
                      className="w-full mt-1 accent-sky-400"
                    />
                  </label>
                </div>
              )}

              {/* Código Real em JavaScript */}
              <div>
                <h3 className="text-xs font-mono text-emerald-300 mb-1.5">
                  Código Real em JavaScript
                </h3>
                <pre className="p-3.5 bg-[#080d13] border-2 border-slate-700 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  <code>{info.code}</code>
                </pre>
              </div>

              {/* Explicação Didática do Prof. Vagner */}
              <div className="p-3.5 bg-[#0f1722] border border-slate-700">
                <h3 className="font-pixel text-xs text-amber-300 mb-1.5">
                  Explicação do Prof. Vagner
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {info.theory}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
