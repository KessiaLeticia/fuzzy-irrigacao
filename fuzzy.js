const conjuntosUmidade = [
  { nome: "seco",          pontos: [0, 0, 20, 50], cor: "#d9534f" },
  { nome: "intermediário", pontos: [20, 50, 50, 80], cor: "#e8a317" },
  { nome: "úmido",         pontos: [50, 80, 100, 100], cor: "#2b7bb9" }
];

const conjuntosTemperatura = [
  { nome: "baixa", pontos: [10, 10, 15, 25], cor: "#2b7bb9" },
  { nome: "média", pontos: [15, 25, 25, 35], cor: "#e8a317" },
  { nome: "alta",  pontos: [25, 35, 40, 40], cor: "#d9534f" }
];

const conjuntosSaida = [
  { nome: "curto", pontos: [0, 0, 0, 15],   cor: "#2b7bb9" },
  { nome: "médio", pontos: [0, 15, 15, 30], cor: "#e8a317" },
  { nome: "longo", pontos: [15, 30, 30, 30], cor: "#d9534f" }
];

// umidade, temperatura e saida são posições nas listas acima.
function criarRegrasPadrao() {
  return [
    { umidade: 0, temperatura: 0, saida: 1 }, // R1: seco  e baixa = médio
    { umidade: 0, temperatura: 1, saida: 2 }, 
    { umidade: 0, temperatura: 2, saida: 2 }, 
    { umidade: 1, temperatura: 0, saida: 0 }, // R4: interm. e baixa = curto
    { umidade: 1, temperatura: 1, saida: 1 }, 
    { umidade: 1, temperatura: 2, saida: 2 }, 
    { umidade: 2, temperatura: 0, saida: 0 }, // R7: úmido e baixa = curto
    { umidade: 2, temperatura: 1, saida: 0 }, 
    { umidade: 2, temperatura: 2, saida: 0 }  
  ];
}

function calcularPertinencia(x, pontos) {
  const a = pontos[0];
  const b = pontos[1];
  const c = pontos[2];
  const d = pontos[3];

  //pertinência
  if (x >= b && x <= c) {
    return 1;
  }
  //fora de [a, d] é zero
  if (x < a || x > d) {
    return 0;
  }
  //subida
  if (x >= a && x < b) {
    return (x - a) / (b - a);
  }
  //descida
  if (x > c && x <= d) {
    return (d - x) / (d - c);
  }
  return 0;
}

function fuzzificar(valor, conjuntos) {
  const graus = [];
  for (let i = 0; i < conjuntos.length; i++) {
    graus.push(calcularPertinencia(valor, conjuntos[i].pontos));
  }
  return graus;
}

function calcularAtivacoes(grausU, grausT, regras) {
  const ativacoes = [];
  for (let i = 0; i < regras.length; i++) {
    const gu = grausU[regras[i].umidade];
    const gt = grausT[regras[i].temperatura];
    ativacoes.push(Math.min(gu, gt));
  }
  return ativacoes;
}

function calcularRecorte(z, regra, h) {
  const muConsequente = calcularPertinencia(z, conjuntosSaida[regra.saida].pontos);
  return Math.min(h, muConsequente);
}

function calcularAgregada(z, regras, ativacoes) {
  let maior = 0;
  for (let i = 0; i < regras.length; i++) {
    const recorte = calcularRecorte(z, regras[i], ativacoes[i]);
    if (recorte > maior) {
      maior = recorte;
    }
  }
  return maior;
}

function calcularCentroide(regras, ativacoes, passo) {
  const N = Math.round(30 / passo); 
  let numerador = 0;
  let denominador = 0;

  for (let k = 0; k < N; k++) {
    const z = (k + 0.5) * passo;
    const mu = calcularAgregada(z, regras, ativacoes);
    numerador = numerador + z * mu;
    denominador = denominador + mu;
  }

  if (denominador === 0) {
    return { valido: false, N: N, numerador: numerador, denominador: denominador, centroide: null };
  }
  return { valido: true, N: N, numerador: numerador, denominador: denominador, centroide: numerador / denominador };
}

function executarInferencia(U, T, regras, passo) {
  const grausU = fuzzificar(U, conjuntosUmidade);
  const grausT = fuzzificar(T, conjuntosTemperatura);
  const ativacoes = calcularAtivacoes(grausU, grausT, regras);
  const defuzz = calcularCentroide(regras, ativacoes, passo);

  return {
    U: U,
    T: T,
    passo: passo,
    grausU: grausU,
    grausT: grausT,
    ativacoes: ativacoes,
    defuzz: defuzz
  };
}

