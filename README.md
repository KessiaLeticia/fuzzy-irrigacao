# Simulador Fuzzy Mamdani: tempo de irrigação

**Autores:** Ana Beatriz dos Santos Sousa Costa, Késsia Letícia da Silva Lima e Lara Nubia Martins Ribeiro
**Disciplina:** Inteligência Artificial

## O que é o projeto

Um simulador de sistema fuzzy do tipo **Mamdani** que recomenda quanto tempo (0 a 30 min) um jardim deve ser irrigado, a partir da **umidade do solo** (0 a 100 %) e da **temperatura** (10 a 40 °C). Roda direto no navegador, sem servidor.


## Como o modelo Mamdani funciona (resumo)

1. **Fuzzificação:** transforma cada valor de entrada em graus de pertinência (entre 0 e 1) para cada conjunto (ex.: seco, intermediário, úmido).
2. **Avaliação das regras:** cada regra tem dois antecedentes ligados por E. O E usa o **mínimo**: `h(r) = min(μumidade, μtemperatura)`.
3. **Implicação:** o conjunto de saída da regra é **recortado** na altura `h(r)`: `min(h, μconsequente(z))`.
4. **Agregação:** junta os recortes de todas as regras usando o **máximo** (não soma).
5. **Defuzzificação:** calcula o **centroide** da área agregada, de forma numérica por pontos médios:
   `z(k) = (k + 0,5) × Δz`, `N = 30 / Δz`, `z* = Σ[z(k)·μ(z(k))] / Σ[μ(z(k))]`.

Se o denominador for zero, o programa avisa que não há saída válida (não retorna zero).

## Como usar

1. Digite ou arraste a umidade e a temperatura (valores iniciais: 35 % e 30 °C).
2. Escolha o passo Δz (0,1 / 0,05 / 0,01).
3. Se quiser, mude o consequente de qualquer regra nos seletores.
4. **Calcular** faz tudo de uma vez. **Avançar etapa** mostra uma etapa por vez (5 no total). **Restaurar padrão** volta tudo ao início.
5. Qualquer mudança nas configurações limpa os resultados anteriores.
6. Valores vazios, não numéricos ou fora dos limites bloqueiam o cálculo com mensagem de erro (o valor não é corrigido sozinho).

## Conjuntos (a, b, c, d)

| Variável | Conjunto | Pontos |
|---       |---       |---     |
| Umidade (%) | seco | (0, 0, 20, 50) |
| Umidade (%) | intermediário | (20, 50, 50, 80) |
| Umidade (%) | úmido | (50, 80, 100, 100) |
| Temperatura (°C) | baixa | (10, 10, 15, 25) |
| Temperatura (°C) | média | (15, 25, 25, 35) |
| Temperatura (°C) | alta | (25, 35, 40, 40) |
| Tempo (min) | curto | (0, 0, 0, 15) |
| Tempo (min) | médio | (0, 15, 15, 30) |
| Tempo (min) | longo | (15, 30, 30, 30) |

## Regras padrão

| Regra | Umidade | Temperatura | Tempo |
|---|---|---|---|
| R1 | seco | baixa | médio |
| R2 | seco | média | longo |
| R3 | seco | alta | longo |
| R4 | intermediário | baixa | curto |
| R5 | intermediário | média | médio |
| R6 | intermediário | alta | longo |
| R7 | úmido | baixa | curto |
| R8 | úmido | média | curto |
| R9 | úmido | alta | curto |

## Arquivos

- `index.html`: estrutura da página.
- `style.css`: aparência.
- `fuzzy.js`: toda a lógica fuzzy (pertinência, regras, mínimo, máximo, centroide).
- `app.js`: interface (validação, botões, tabelas, log e gráficos).

## Bibliotecas utilizadas

**Nenhuma.** Os gráficos são desenhados com o elemento `<canvas>` do próprio navegador e a inferência foi implementada por nós.

### 6.1 Pertinências e extremos

| Entrada | Obtido (ordem dos conjuntos) | Esperado | Conclusão |
|---|---|---|---|
| U = 35 | (0,5; 0,5; 0) | (0,5; 0,5; 0) | Passou |
| T = 30 | (0; 0,5; 0,5) | (0; 0,5; 0,5) | Passou |
| U = 0 | (1; 0; 0) | (1; 0; 0) | Passou |
| U = 100 | (0; 0; 1) | (0; 0; 1) | Passou |
| T = 10 | (1; 0; 0) | (1; 0; 0) | Passou |
| T = 40 | (0; 0; 1) | (0; 0; 1) | Passou |

Não ocorreu divisão por zero, pois a verificação do trecho de pertinência 1 e do intervalo [a, d] vem antes das rampas.

### 6.2 Uma única regra ativa

| U | T | Regra ativa | Obtido (min) | Esperado | Conclusão |
|---|---|---|---|---|---|
| 20 | 35 | R3 (h = 1) | 24,9999 → 25,00 | ≈ 25,00 | Passou |
| 50 | 25 | R5 (h = 1) | 15,0000 → 15,00 | 15,00 | Passou |
| 80 | 25 | R8 (h = 1) | 5,0001 → 5,00 | ≈ 5,00 | Passou |

O centroide do triângulo "curto" é 5 e o do "longo" é 25, não os picos. Por isso solo úmido não dá tempo zero neste modelo.

### 6.3 Inferência com sobreposição (U = 35, T = 30)

- Fuzzificação: seco = 0,5; intermediário = 0,5; úmido = 0; baixa = 0; média = 0,5; alta = 0,5.
- Regras ativas: R2 (longo, 0,5), R3 (longo, 0,5), R5 (médio, 0,5), R6 (longo, 0,5). As outras têm h = 0.
- Agregação: máximo dos recortes, então "longo" não passa de 0,5 mesmo com 3 regras.
- Saída obtida: **16,785683 min** (tela: **16,79 min**). Esperado: ≈ 16,785683. **Passou.**

### 6.4 Simetria, alteração de regras e precisão

| Teste | Obtido | Esperado | Conclusão |
|---|---|---|---|
| U = 35, T = 20 (R1, R2, R4, R5 com h = 0,5) | 15,00 | 15,00 | Passou |
| Todas as regras = curto, U = 50, T = 25 | 5,0001 → 5,00 | ≈ 5,00 | Passou |
| Restaurar padrão e recalcular (35, 30) | 16,79 | 16,79 | Passou |

| Δz | Resultado obtido (min) | Esperado |
|---|---|---|
| 0,1 | 16,785683 | ≈ 16,785683 |
| 0,05 | 16,785706 | ≈ 16,785706 |
| 0,01 | 16,785714 | ≈ 16,785714 |

Centroide contínuo (exato): 16,785714 min.

**Análise do passo:** quanto menor o Δz, mais pontos usamos (N = 300, 600 e 3000), então a soma fica mais próxima da integral e o resultado chega mais perto do centroide contínuo. A diferença entre Δz = 0,1 e o valor exato é de aproximadamente 0,00003 min, por isso com duas casas decimais o resultado continua 16,79.

### 6.5 Validação da interface e determinismo

- U = −1, U = 101, T = 9, T = 41, campo vazio e texto como "abc": todos bloqueiam o cálculo e mostram mensagem de erro. Nada é corrigido automaticamente.
- Repetir a mesma configuração dá sempre os mesmos graus, ativações, área e tempo final.
- **Calcular** e **Avançar etapa** (5 vezes) dão a mesma saída, pois os dois usam a função `executarInferencia`.
- A parte gráfica só lê os resultados; ela não altera nenhum cálculo.
