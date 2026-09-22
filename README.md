# Estudos de caso em inteligência operacional

Seis relatórios técnicos sobre análise de operações, modelagem, simulação e decisão. Cada página explica a pergunta de negócio, os cálculos, as visualizações, as escolhas metodológicas e os limites da interpretação.

Todos os exemplos usam dados fictícios. O objetivo é mostrar o raciocínio e a forma de construir as análises, sem expor dados, pessoas, campanhas ou estruturas internas.

## Projetos

### 01 · Intent do Lead

[Abrir relatório](01-intent-do-lead/index.html)

Investiga o retorno marginal de cada tentativa de contato. A curva separa **Sweet Spot**, **Baixa Eficiência** e **Zona de Desperdício**, relaciona eficiência marginal à cobertura acumulada e apresenta os critérios de proteção das faixas. O estudo também compara janelas de dia e hora, períodos do dia e cadências entre tentativas, usando L2C observado e L2C Score ajustado pelo volume da amostra.

### 02 · Elasticidade e Golden Set

[Abrir relatório](02-elasticidade-e-alocacao/index.html)

Começa pelo contraste de C2O entre perfis de performance e, a partir dessa pergunta de afinidade, chega ao problema de alocação. O núcleo do modelo original é preservado: K-Means, Score de afinidade, programação linear inteira, restrições de capacidade e Sankey para rastrear o caminho do perfil global ao destino. A otimização encontra a melhor solução para o objetivo e as restrições declaradas; isso não é uma promessa de ganho operacional.

### 03 · Simuladores

[Abrir relatório](03-simuladores/index.html)

Conecta quatro leituras complementares: matriz de correlação, principais alavancas, simulador preditivo e Goal Seeking. A correlação descreve associações na amostra; a sensibilidade mede a amplitude da resposta em uma faixa; o simulador recalcula L2O e Opps/dia; e o Goal Seeking procura na amostra o cenário histórico fictício mais próximo de uma meta. As visões deixam explícita a diferença entre associação, previsão e busca de cenário.

### 04 · Monitoramento

[Abrir relatório](04-monitoramento/index.html)

Apresenta quatro visões para acompanhar a operação ao longo do tempo: Projeto vs. Baseline, Incremento dos Segmentos, Impacto dos Segmentos e Aderência ao Roteiro. O relatório explica denominadores, médias diárias, contribuições contábeis e a simulação de retirada de etapas. Também distingue o que é comparação histórica do que é cenário hipotético.

### 05 · Rede de Ideias

[Abrir relatório](05-rede-de-ideias/index.html)

Organiza hipóteses em um grafo navegável e em um catálogo completo. Cada ideia possui problema, fundamentação, teste e métrica. O Score editorial combina impacto e facilidade de execução para ordenar prioridades; as relações registram dependência, complementaridade, interação a testar ou disputa de capacidade. Não é uma rede neural nem um mecanismo de aprendizado automático.

### 06 · Performance

[Abrir relatório](06-performance/index.html)

Compara produção e eficiência em conjunto, evitando um ranking baseado em uma única taxa. O modelo usa Opps/dia e C2O, padroniza as variáveis por contexto, aplica K-Means para formar perfis Q1 a Q4 e mostra dispersão, centróides e tabelas de suporte. Os rótulos são relativos ao escopo analisado e não representam quartis populacionais nem avaliação individual causal.

## Como os estudos se relacionam

Os projetos são módulos independentes de um mesmo raciocínio: medir o retorno, entender diferenças de contexto, simular alternativas, monitorar mudanças, organizar hipóteses e apoiar decisões de capacidade. Elasticidade e Golden Set possuem uma relação narrativa específica: o estudo de elasticidade levantou a pergunta de afinidade; o Golden Set transformou essa pergunta em alocação conjunta. Os demais relatórios não dependem dele para funcionar.

## Métodos e implementação pública

O trabalho de origem combina SQL e Python em Databricks para processamento e modelagem, com HTML, CSS e JavaScript na apresentação. Esta publicação contém apenas a camada pública: relatórios estáticos, scripts de interação, fontes locais e JSONs fictícios. Os notebooks, conexões, tabelas e esquemas do ambiente original não fazem parte deste repositório.

As páginas também registram as adaptações da demonstração. O Golden Set preserva o núcleo conceitual de K-Means e otimização inteira, mas o exemplo pequeno usa um resolvedor local para ser reproduzível no navegador. Os simuladores usam árvores e respostas parametrizadas para explicar o mecanismo, não um modelo treinado com dados reais. A Rede de Ideias usa relações editoriais explícitas, não inferência automática.

## Dados e limites

Volumes, nomes, avaliações, capacidades e resultados são fictícios. Taxas dependem de seus denominadores; diferenças de Score não equivalem a diferenças de oportunidades; correlação e contraste entre perfis não provam causalidade; uma previsão não garante resultado futuro.

Cada relatório apresenta suas próprias premissas, fórmulas e limitações antes de interpretar os gráficos.

## Organização técnica

Cada diretório contém um relatório independente e suas dependências locais. Os JSONs ficam em `data/` e os recursos visuais em `assets/`. Não há API nem consulta externa para carregar os exemplos.

O arquivo `_headers` contém orientações de cache para o Cloudflare. O `index.html` da raiz redireciona ao portfólio pessoal; os seis relatórios possuem links próprios. O botão **Salvar PDF** usa a impressão do navegador.
