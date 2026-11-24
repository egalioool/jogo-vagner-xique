import { PlayerSkill, PotionId, PotionItem } from '../types/game';

export const POTIONS: Record<PotionId, PotionItem> = {
  aula_comecou: {
    id: 'aula_comecou',
    phrase: '“A aula já começou!”',
    name: 'Poção do Silêncio Instantâneo',
    effectSummary: 'Atordoa o aluno por 1 turno e causa 22 de dano de choque de realidade.',
    cost: 20,
    color: 'amber',
  },
  compartilhar_turma: {
    id: 'compartilhar_turma',
    phrase: '“Quer compartilhar com a turma?”',
    name: 'Elixir do Constrangimento Público',
    effectSummary: 'Causa 18 de dano psíquico e reduz o ataque do inimigo em 40% por 2 turnos.',
    cost: 25,
    color: 'rose',
  },
  colocar_no_quadro: {
    id: 'colocar_no_quadro',
    phrase: '“Vou colocar no quadro!”',
    name: 'Tônico da Lousa Implacável',
    effectSummary: 'Aumenta seu Ataque em +45% por 3 turnos e carrega +25% da Barra Suprema.',
    cost: 30,
    color: 'sky',
  },
  presta_atencao: {
    id: 'presta_atencao',
    phrase: '“Presta atenção na explicação!”',
    name: 'Café Forte da Coordenação',
    effectSummary: 'Restaura +60 HP e +25 de Foco do Professor Vagner imediatamente.',
    cost: 20,
    color: 'emerald',
  },
};

export const POTION_LIST: PotionItem[] = Object.values(POTIONS);

export const PLAYER_SKILLS: PlayerSkill[] = [
  {
    id: 'giz_certeiro',
    name: 'Giz Certeiro',
    focusCost: 0,
    unlockLevel: 1,
    powerMultiplier: 1.0,
    description: 'Arremesso clássico de giz branco. Não gasta Foco e carrega +15% da Suprema.',
    type: 'damage',
  },
  {
    id: 'chamada_oral',
    name: 'Chamada Oral',
    focusCost: 15,
    unlockLevel: 1,
    powerMultiplier: 1.45,
    description: 'Pergunta surpresa na frente da turma. Ignora parte da defesa inimiga.',
    type: 'pierce',
  },
  {
    id: 'lousa_relampago',
    name: 'Lousa Relâmpago',
    focusCost: 22,
    unlockLevel: 2,
    powerMultiplier: 1.75,
    description: 'Enche o quadro de algoritmos em segundos! Dano elevado e +20% Suprema.',
    type: 'damage',
  },
  {
    id: 'revisao_salvadora',
    name: 'Revisão Salvadora',
    focusCost: 25,
    unlockLevel: 3,
    powerMultiplier: 1.35,
    description: 'Causa dano pedagógico e recupera 25 de HP pela satisfação de ensinar.',
    type: 'heal_strike',
  },
];
