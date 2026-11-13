let regras = criarRegrasPadrao();  
let resultado = null;              
let etapaMostrada = 0;             

const textoUmidade = document.getElementById("textoUmidade");
const sliderUmidade = document.getElementById("sliderUmidade");
const textoTemperatura = document.getElementById("textoTemperatura");
const sliderTemperatura = document.getElementById("sliderTemperatura");
const selectPasso = document.getElementById("selectPasso");
const erroUmidade = document.getElementById("erroUmidade");
const erroTemperatura = document.getElementById("erroTemperatura");
const mensagemStatus = document.getElementById("mensagemStatus");
const listaEtapas = document.getElementById("listaEtapas");
const resultadoFinal = document.getElementById("resultadoFinal");
const tabelaUmidade = document.getElementById("tabelaUmidade");
const tabelaTemperatura = document.getElementById("tabelaTemperatura");
const corpoRegras = document.getElementById("corpoRegras");
const selectRegraVisual = document.getElementById("selectRegraVisual");
const textoRecorte = document.getElementById("textoRecorte");
const listaLog = document.getElementById("listaLog");

function formatar(numero, casas) {
  return numero.toFixed(casas).replace(".", ",");
}

function lerCampo(texto, nome, minimo, maximo, unidade) {
  texto = texto.trim().replace(",", ".");

  if (texto === "") {
    return { erro: nome + ": o campo está vazio." };
  }

  const formatoValido = /^-?\d+(\.\d+)?$/.test(texto);
  if (!formatoValido) {
    return { erro: nome + ": digite apenas um número." };
  }

  const numero = Number(texto);
  if (!Number.isFinite(numero)) {
    return { erro: nome + ": o valor não é finito." };
  }

  if (numero < minimo || numero > maximo) {
    return { erro: nome + " deve estar entre " + minimo + " e " + maximo + " " + unidade + "." };
  }

  return { valor: numero };
}

function validarEntradas() {
  const lidoU = lerCampo(textoUmidade.value, "Umidade", 0, 100, "%");
  const lidoT = lerCampo(textoTemperatura.value, "Temperatura", 10, 40, "°C");

  erroUmidade.textContent = lidoU.erro ? lidoU.erro : "";
  erroTemperatura.textContent = lidoT.erro ? lidoT.erro : "";

  if (lidoU.erro || lidoT.erro) {
    return null;
  }
  return { U: lidoU.valor, T: lidoT.valor };
}

function aoMudarConfiguracao() {
  resultado = null;
  etapaMostrada = 0;
  validarEntradas(); 
  mensagemStatus.textContent = "Configuração alterada. Os resultados anteriores foram limpos. Clique em Calcular ou Avançar etapa.";
  atualizarTela();
}

function prepararResultado() {
  const entradas = validarEntradas();
  if (entradas === null) {
    mensagemStatus.textContent = "Corrija as entradas antes de calcular.";
    return false;
  }
  if (resultado === null) {
    const passo = Number(selectPasso.value);
    resultado = executarInferencia(entradas.U, entradas.T, regras, passo);
  }
  return true;
}

function clicarCalcular() {
  if (prepararResultado() === false) {
    return;
  }
  etapaMostrada = 5;
  mensagemStatus.textContent = "Cálculo completo.";
  atualizarTela();
}

function clicarAvancar() {
  if (prepararResultado() === false) {
    return;
  }
  if (etapaMostrada < 5) {
    etapaMostrada = etapaMostrada + 1;
    mensagemStatus.textContent = "Etapa " + etapaMostrada + " de 5.";
  } else {
    mensagemStatus.textContent = "As 5 etapas já foram mostradas.";
  }
  atualizarTela();
}

function clicarRestaurar() {
  textoUmidade.value = "35";
  sliderUmidade.value = 35;
  textoTemperatura.value = "30";
  sliderTemperatura.value = 30;
  selectPasso.value = "0.1";
  regras = criarRegrasPadrao();
  atualizarSelectsDasRegras();
  selectRegraVisual.value = "0";
  resultado = null;
  etapaMostrada = 0;
  validarEntradas();
  mensagemStatus.textContent = "Valores padrão restaurados.";
  atualizarTela();
}

function criarOpcoesDeSaida(select) {
  for (let i = 0; i < conjuntosSaida.length; i++) {
    const opcao = document.createElement("option");
    opcao.value = i;
    opcao.textContent = conjuntosSaida[i].nome;
    select.appendChild(opcao);
  }
}

function construirTabelaRegras() {
  for (let i = 0; i < regras.length; i++) {
    const linha = document.createElement("tr");
    linha.id = "linhaRegra" + i;

    linha.innerHTML =
      "<td>R" + (i + 1) + "</td>" +
      "<td>" + conjuntosUmidade[regras[i].umidade].nome + "</td>" +
      "<td>" + conjuntosTemperatura[regras[i].temperatura].nome + "</td>" +
      "<td></td>" +
      "<td id='muU" + i + "'>—</td>" +
      "<td id='muT" + i + "'>—</td>" +
      "<td id='h" + i + "'>—</td>";

    const select = document.createElement("select");
    select.id = "selectRegra" + i;
    criarOpcoesDeSaida(select);
    select.value = regras[i].saida;
    select.addEventListener("change", function () {
      regras[i].saida = Number(select.value);
      aoMudarConfiguracao();
    });
    linha.children[3].appendChild(select);

    corpoRegras.appendChild(linha);

    const opcao = document.createElement("option");
    opcao.value = i;
    opcao.textContent = "R" + (i + 1);
    selectRegraVisual.appendChild(opcao);
  }
}

function atualizarSelectsDasRegras() {
  for (let i = 0; i < regras.length; i++) {
    document.getElementById("selectRegra" + i).value = regras[i].saida;
  }
}

function atualizarTela() {
  atualizarIndicadorEtapas();
  atualizarTabelaPertinencias(tabelaUmidade, conjuntosUmidade, resultado ? resultado.grausU : null);
  atualizarTabelaPertinencias(tabelaTemperatura, conjuntosTemperatura, resultado ? resultado.grausT : null);
  atualizarTabelaRegras();
  atualizarResultadoFinal();
  atualizarLog();
  atualizarTextoRecorte();
  desenharTodosOsGraficos();
}

function atualizarIndicadorEtapas() {
  const itens = listaEtapas.children;
  for (let i = 0; i < itens.length; i++) {
    itens[i].className = "";
    if (i + 1 < etapaMostrada) {
      itens[i].className = "feita";
    } else if (i + 1 === etapaMostrada) {
      itens[i].className = "atual";
    }
  }
}

function atualizarTabelaPertinencias(tabela, conjuntos, graus) {
  let html = "<tr><th>Conjunto</th><th>Grau de pertinência</th></tr>";
  for (let i = 0; i < conjuntos.length; i++) {
    let texto = "—";
    if (graus !== null && etapaMostrada >= 1) {
      texto = formatar(graus[i], 4); 
    }
    html = html + "<tr><td>" + conjuntos[i].nome + "</td><td>" + texto + "</td></tr>";
  }
  tabela.innerHTML = html;
}

function atualizarTabelaRegras() {
  for (let i = 0; i < regras.length; i++) {
    const linha = document.getElementById("linhaRegra" + i);
    const celulaMuU = document.getElementById("muU" + i);
    const celulaMuT = document.getElementById("muT" + i);
    const celulaH = document.getElementById("h" + i);

    linha.className = "";

    if (resultado !== null && etapaMostrada >= 2) {
      const muU = resultado.grausU[regras[i].umidade];
      const muT = resultado.grausT[regras[i].temperatura];
      const h = resultado.ativacoes[i];

      celulaMuU.textContent = formatar(muU, 4);
      celulaMuT.textContent = formatar(muT, 4);
      celulaH.textContent = "min(" + formatar(muU, 2) + "; " + formatar(muT, 2) + ") = " + formatar(h, 4);

      if (h > 0) {
        linha.className = "ativa";
      }
    } else {
      celulaMuU.textContent = "—";
      celulaMuT.textContent = "—";
      celulaH.textContent = "—";
    }
  }
}

function atualizarResultadoFinal() {
  if (resultado === null || etapaMostrada < 5) {
    resultadoFinal.textContent = "—";
    return;
  }
  if (resultado.defuzz.valido === false) {
    resultadoFinal.textContent = "Não há saída agregada válida (denominador zero).";
    return;
  }
  resultadoFinal.textContent = formatar(resultado.defuzz.centroide, 2) + " minutos";
}

function atualizarTextoRecorte() {
  const i = Number(selectRegraVisual.value);
  if (resultado !== null && etapaMostrada >= 3) {
    const h = resultado.ativacoes[i];
    const nomeSaida = conjuntosSaida[regras[i].saida].nome;
    textoRecorte.textContent = "R" + (i + 1) + ": consequente " + nomeSaida +
      " recortado na altura h = " + formatar(h, 4) +
      ". A linha tracejada é o consequente original e a área é o recorte.";
  } else {
    textoRecorte.textContent = "Avance até a etapa 3 (implicação) para ver o recorte.";
  }
}

function montarLog() {
  const log = [[], [], [], [], []];
  if (resultado === null) {
    return log;
  }

  let frase = "Umidade " + formatar(resultado.U, 2) + "%: ";
  for (let i = 0; i < conjuntosUmidade.length; i++) {
    frase = frase + conjuntosUmidade[i].nome + " = " + formatar(resultado.grausU[i], 4) + "; ";
  }
  log[0].push(frase);
  frase = "Temperatura " + formatar(resultado.T, 2) + " °C: ";
  for (let i = 0; i < conjuntosTemperatura.length; i++) {
    frase = frase + conjuntosTemperatura[i].nome + " = " + formatar(resultado.grausT[i], 4) + "; ";
  }
  log[0].push(frase);

  const regrasAtivas = [];
  for (let i = 0; i < regras.length; i++) {
    const muU = resultado.grausU[regras[i].umidade];
    const muT = resultado.grausT[regras[i].temperatura];
    const h = resultado.ativacoes[i];
    const nomeSaida = conjuntosSaida[regras[i].saida].nome;

    log[1].push("R" + (i + 1) + ": min(" + formatar(muU, 4) + "; " + formatar(muT, 4) + ") = " + formatar(h, 4));

    if (h > 0) {
      log[2].push("R" + (i + 1) + ": consequente " + nomeSaida + " recortado em " + formatar(h, 4) + ".");
      regrasAtivas.push("R" + (i + 1));
    } else {
      log[2].push("R" + (i + 1) + ": ativação 0, não contribui.");
    }
  }

  log[3].push("Agregação: máximo entre os recortes das regras " + regrasAtivas.join(", ") + ".");

  const d = resultado.defuzz;
  log[4].push("Passo Δz = " + formatar(resultado.passo, 2) + " min, N = " + d.N + " pontos (z(k) = (k + 0,5) × Δz).");
  if (d.valido) {
    log[4].push("Soma de z × μ = " + formatar(d.numerador, 6) + "; soma de μ = " + formatar(d.denominador, 6) + ".");
    log[4].push("Centroide: " + formatar(d.centroide, 6) + " min (exibido: " + formatar(d.centroide, 2) + " min).");
  } else {
    log[4].push("Denominador zero: não há saída agregada válida.");
  }
  return log;
}

function atualizarLog() {
  listaLog.innerHTML = "";
  const nomesEtapas = ["1. Fuzzificação", "2. Avaliação das regras", "3. Implicação", "4. Agregação", "5. Defuzzificação"];
  const log = montarLog();

  for (let etapa = 0; etapa < etapaMostrada; etapa++) {
    const titulo = document.createElement("li");
    titulo.className = "titulo-etapa";
    titulo.textContent = nomesEtapas[etapa];
    listaLog.appendChild(titulo);

    for (let j = 0; j < log[etapa].length; j++) {
      const item = document.createElement("li");
      item.textContent = log[etapa][j];
      listaLog.appendChild(item);
    }
  }
}

function desenharGrafico(canvas, config) {
  const ctx = canvas.getContext("2d");
  const largura = canvas.width;
  const altura = canvas.height;

  const mEsq = 60;
  const mDir = 20;
  const mTopo = 50;
  const mBaixo = 55;
  const w = largura - mEsq - mDir;
  const h = altura - mTopo - mBaixo;

  function paraX(x) {
    return mEsq + ((x - config.xMin) / (config.xMax - config.xMin)) * w;
  }
  function paraY(y) {
    return mTopo + (1 - y) * h;
  }

  ctx.clearRect(0, 0, largura, altura);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, largura, altura);
  ctx.font = "13px Arial";

  for (let i = 0; i <= 5; i++) {
    const y = i / 5;
    ctx.strokeStyle = "#e0e0e0";
    ctx.beginPath();
    ctx.moveTo(mEsq, paraY(y));
    ctx.lineTo(mEsq + w, paraY(y));
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.textAlign = "right";
    ctx.fillText(formatar(y, 1), mEsq - 8, paraY(y) + 4);
  }

  for (let x = config.xMin; x <= config.xMax; x = x + config.xPasso) {
    ctx.strokeStyle = "#f0f0f0";
    ctx.beginPath();
    ctx.moveTo(paraX(x), mTopo);
    ctx.lineTo(paraX(x), mTopo + h);
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(String(x), paraX(x), mTopo + h + 18);
  }

  if (config.area) {
    const pts = config.area.pontos;
    ctx.fillStyle = config.area.cor;
    ctx.beginPath();
    ctx.moveTo(paraX(pts[0].x), paraY(0));
    for (let i = 0; i < pts.length; i++) {
      ctx.lineTo(paraX(pts[i].x), paraY(pts[i].y));
    }
    ctx.lineTo(paraX(pts[pts.length - 1].x), paraY(0));
    ctx.closePath();
    ctx.fill();
  }

  let xLegenda = mEsq;
  for (let i = 0; i < config.curvas.length; i++) {
    const c = config.curvas[i];
    const p = c.pontos; // [a, b, c, d]

    ctx.strokeStyle = c.cor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash(c.tracejada ? [6, 4] : []);
    ctx.beginPath();
    ctx.moveTo(paraX(p[0]), paraY(0));
    ctx.lineTo(paraX(p[1]), paraY(1));
    ctx.lineTo(paraX(p[2]), paraY(1));
    ctx.lineTo(paraX(p[3]), paraY(0));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = c.cor;
    ctx.fillRect(xLegenda, 10, 18, 4);
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText(c.nome, xLegenda + 24, 16);
    xLegenda = xLegenda + 120;
  }
  ctx.lineWidth = 1;

  if (config.linhas) {
    for (let i = 0; i < config.linhas.length; i++) {
      const linha = config.linhas[i];
      ctx.strokeStyle = linha.cor;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(paraX(linha.x), mTopo);
      ctx.lineTo(paraX(linha.x), mTopo + h);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 1;

      ctx.fillStyle = linha.cor;
      ctx.textAlign = "center";
      ctx.fillText(linha.texto, paraX(linha.x), mTopo - 8);
    }
  }

  ctx.strokeStyle = "#555";
  ctx.strokeRect(mEsq, mTopo, w, h);

  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(config.xRotulo, mEsq + w / 2, altura - 10);

  ctx.save();
  ctx.translate(16, mTopo + h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Grau de pertinência", 0, 0);
  ctx.restore();
}

function amostrarSaida(funcao) {
  const pontos = [];
  for (let i = 0; i <= 300; i++) {
    const z = i / 10;
    pontos.push({ x: z, y: funcao(z) });
  }
  return pontos;
}

function desenharTodosOsGraficos() {
  const temResultado = resultado !== null;

  const linhasU = [];
  if (temResultado && etapaMostrada >= 1) {
    linhasU.push({ x: resultado.U, cor: "#000", texto: "U = " + formatar(resultado.U, 2) + "%" });
  }
  desenharGrafico(document.getElementById("graficoUmidade"), {
    xMin: 0, xMax: 100, xPasso: 10, xRotulo: "Umidade do solo (%)",
    curvas: conjuntosUmidade, linhas: linhasU
  });

  const linhasT = [];
  if (temResultado && etapaMostrada >= 1) {
    linhasT.push({ x: resultado.T, cor: "#000", texto: "T = " + formatar(resultado.T, 2) + " °C" });
  }
  desenharGrafico(document.getElementById("graficoTemperatura"), {
    xMin: 10, xMax: 40, xPasso: 5, xRotulo: "Temperatura (°C)",
    curvas: conjuntosTemperatura, linhas: linhasT
  });

  const indice = Number(selectRegraVisual.value);
  const consequente = conjuntosSaida[regras[indice].saida];
  let areaRecorte = null;
  if (temResultado && etapaMostrada >= 3) {
    const h = resultado.ativacoes[indice];
    areaRecorte = {
      cor: "rgba(232, 163, 23, 0.4)",
      pontos: amostrarSaida(function (z) {
        return calcularRecorte(z, regras[indice], h);
      })
    };
  }
  desenharGrafico(document.getElementById("graficoRecorte"), {
    xMin: 0, xMax: 30, xPasso: 5, xRotulo: "Tempo de irrigação (min)",
    curvas: [{ nome: "consequente original: " + consequente.nome, pontos: consequente.pontos, cor: consequente.cor, tracejada: true }],
    area: areaRecorte
  });

  let areaAgregada = null;
  if (temResultado && etapaMostrada >= 4) {
    areaAgregada = {
      cor: "rgba(46, 107, 63, 0.4)",
      pontos: amostrarSaida(function (z) {
        return calcularAgregada(z, regras, resultado.ativacoes);
      })
    };
  }
  const linhasSaida = [];
  if (temResultado && etapaMostrada >= 5 && resultado.defuzz.valido) {
    linhasSaida.push({ x: resultado.defuzz.centroide, cor: "#000", texto: "centroide = " + formatar(resultado.defuzz.centroide, 2) + " min" });
  }
  desenharGrafico(document.getElementById("graficoSaida"), {
    xMin: 0, xMax: 30, xPasso: 5, xRotulo: "Tempo de irrigação (min)",
    curvas: conjuntosSaida, area: areaAgregada, linhas: linhasSaida
  });
}

sliderUmidade.addEventListener("input", function () {
  textoUmidade.value = sliderUmidade.value;
  aoMudarConfiguracao();
});
sliderTemperatura.addEventListener("input", function () {
  textoTemperatura.value = sliderTemperatura.value;
  aoMudarConfiguracao();
});

textoUmidade.addEventListener("input", function () {
  const lido = lerCampo(textoUmidade.value, "Umidade", 0, 100, "%");
  if (lido.valor !== undefined) {
    sliderUmidade.value = lido.valor;
  }
  aoMudarConfiguracao();
});
textoTemperatura.addEventListener("input", function () {
  const lido = lerCampo(textoTemperatura.value, "Temperatura", 10, 40, "°C");
  if (lido.valor !== undefined) {
    sliderTemperatura.value = lido.valor;
  }
  aoMudarConfiguracao();
});

selectPasso.addEventListener("change", aoMudarConfiguracao);
selectRegraVisual.addEventListener("change", atualizarTela);

document.getElementById("botaoCalcular").addEventListener("click", clicarCalcular);
document.getElementById("botaoAvancar").addEventListener("click", clicarAvancar);
document.getElementById("botaoRestaurar").addEventListener("click", clicarRestaurar);

construirTabelaRegras();
mensagemStatus.textContent = "Clique em Calcular ou em Avançar etapa.";
atualizarTela();
