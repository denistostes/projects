# Estudos de caso em inteligência operacional

Seis relatórios técnicos sobre análise de operações, modelagem, simulação e decisão. Cada página explica a pergunta de negócio, os cálculos, as visualizações, as escolhas metodológicas e os limites da interpretação.

Todos os exemplos usam dados fictícios. O objetivo é mostrar o raciocínio e a forma de construir as análises, sem expor dados, pessoas, campanhas ou estruturas internas.

Para conhecer o portfólio completo, acesse o [meu site pessoal (portólio)](https://denistostes.figma.site/) e entre na seção **Projetos**. Os cards dessa seção são a porta de entrada recomendada para os relatórios; cada card leva à página correspondente deste repositório.

## Visão geral

| Projeto | Pergunta central | O que o relatório apresenta |
| --- | --- | --- |
| [01 · Intent do Lead](01-intent-do-lead/) | Em que tentativa o contato perde eficiência? | Retorno marginal, **Sweet Spot**, **Baixa Eficiência**, **Zona de Desperdício**, cobertura acumulada, melhores janelas e cadências. |
| [02 · Elasticidade e Golden Set](02-elasticidade-e-alocacao/) | Como transformar diferenças de conversão em uma alocação conjunta? | Contraste de C2O, K-Means, Score de afinidade, programação linear inteira, restrições de capacidade e Sankey. |
| [03 · Simuladores](03-simuladores/) | O que muda quando uma condição operacional é alterada? | Matriz de correlação, principais alavancas, simulador preditivo e Goal Seeking, com a diferença entre associação, previsão e busca de cenário. |
| [04 · Monitoramento](04-monitoramento/) | Como acompanhar mudanças sem perder o denominador? | Projeto vs. Baseline, Incremento dos Segmentos, Impacto dos Segmentos e Aderência ao Roteiro, com médias diárias e cenários hipotéticos. |
| [05 · Rede de Ideias](05-rede-de-ideias/) | Como organizar hipóteses e decidir o que testar? | Grafo de relações, catálogo de ideias, problema, fundamentação, desenho de teste, métrica e Score editorial de prioridade. |
| [06 · Performance](06-performance/) | Como comparar produção e eficiência em contextos diferentes? | Opps/dia, C2O, padronização por contexto, K-Means, perfis Q1 a Q4, dispersão, centróides e tabelas de suporte. |

## Como ler a coleção

Os seis projetos são módulos independentes de um mesmo raciocínio: medir o retorno, entender diferenças de contexto, simular alternativas, monitorar mudanças, organizar hipóteses e apoiar decisões de capacidade. No repositório, cada link da tabela abre a pasta do projeto; dentro dela está o relatório publicado e seus arquivos locais.

Elasticidade e Golden Set possuem uma relação narrativa específica. O estudo de elasticidade levantou a pergunta de afinidade entre perfis e contextos; o Golden Set transformou essa pergunta em um problema de alocação conjunta, com restrições e rastreabilidade. Essa relação não torna os demais relatórios dependentes deles.

## Métodos e implementação pública

O trabalho de origem combina SQL e Python em Databricks para processamento e modelagem, com HTML, CSS e JavaScript na apresentação. Esta publicação contém apenas a camada pública: relatórios estáticos, scripts de interação, fontes locais e JSONs fictícios. Os notebooks, conexões, tabelas e esquemas do ambiente original não fazem parte deste repositório.

As páginas registram suas adaptações. O Golden Set preserva o núcleo conceitual de K-Means, Score de afinidade e otimização inteira, mas o exemplo pequeno usa um resolvedor local para ser reproduzível no navegador. Os simuladores usam árvores e respostas parametrizadas para explicar o mecanismo, não um modelo treinado com dados reais. A Rede de Ideias usa relações editoriais explícitas, não inferência automática.

## Dados e limites

Volumes, nomes, avaliações, capacidades e resultados são fictícios. Taxas dependem de seus denominadores; diferenças de Score não equivalem a diferenças de oportunidades; correlação e contraste entre perfis não provam causalidade; uma previsão não garante resultado futuro.

Cada relatório apresenta suas próprias premissas, fórmulas e limitações antes de interpretar os gráficos.

## Organização técnica

Cada diretório contém um relatório independente e suas dependências locais. Os JSONs ficam em `data/` e os recursos visuais em `assets/`. Não há API nem consulta externa para carregar os exemplos.

O arquivo `_headers` contém orientações de cache para o Cloudflare. O `index.html` da raiz redireciona ao portfólio pessoal; os seis relatórios possuem links próprios. O botão **Salvar PDF** usa a impressão do navegador.
