# Estudos de caso em inteligência operacional

Seis relatórios técnicos sobre como transformar dados de contato, conversão e capacidade em análises, cenários e decisões. Cada relatório apresenta a pergunta de negócio, o método, visualizações com exemplos fictícios e os limites de interpretação.

O foco está no raciocínio: o que cada indicador mede, como os cálculos se conectam e quais conclusões os resultados permitem sustentar.

## Projetos

| Projeto | Pergunta central | Conteúdo |
| --- | --- | --- |
| [Intent do Lead](intent-do-lead/index.html) | Até quando insistir e quando tentar novamente? | Eficiência marginal, Sweet Spot, Baixa Eficiência, Zona de Desperdício, janelas de contato e cadências com Score ajustado pelo volume de tentativas. |
| [Elasticidade e Golden Set](elasticidade-e-alocacao/index.html) | Como distribuir a equipe considerando afinidade e restrições? | Estudo de elasticidade como ponto de partida, perfis de K-Means, Score de afinidade, formulação de alocação inteira e Sankey para acompanhar os destinos. |
| [Simuladores](simuladores/index.html) | Como diferentes condições alteram um cenário e sua proximidade de uma meta? | Matriz de correlação, sensibilidade, simulação preditiva e Goal Seeking por busca do cenário histórico fictício mais próximo. |
| [Monitoramento](monitoramento/index.html) | Como distinguir evolução, contribuição e impacto simulado? | Projeto vs. Baseline, Incremento dos Segmentos, Impacto dos Segmentos e Aderência ao Roteiro, com denominadores e hipóteses explícitos. |
| [Rede de Ideias](rede-de-ideias/index.html) | Como transformar hipóteses em propostas de teste? | Relações entre ideias, priorização por impacto e esforço, fundamentação, desenho de teste e critérios de avaliação. |
| [Performance](performance/index.html) | Como comparar produção e eficiência sem confundir suas dimensões? | Perfis multivariados, K-Means, produção por dia, conversão e comparação entre contextos. |

Os links acima apontam para os arquivos dos relatórios neste repositório. O GitHub pode exibir seu código-fonte em vez da página renderizada. As versões navegáveis podem ser acessadas pelos cards do [portfólio de Denis Tostes](https://denistostes.figma.site/).

## Da elasticidade ao Golden Set

O estudo de elasticidade antecedeu o Golden Set. Comparar a conversão entre perfis em diferentes contextos levantou a questão da afinidade: um bom desempenho global não significa que uma pessoa seja a melhor escolha para qualquer destino.

O Golden Set surgiu como consequência dessa investigação. O K-Means organiza os perfis; o Score expressa preferências de alocação; a formulação inteira combina essas preferências com vagas, turnos e elegibilidade. O Sankey torna a solução rastreável, mostrando a passagem do perfil global ao específico e ao destino escolhido.

Uma solução ótima maximiza o objetivo definido sob as restrições declaradas. Isso não equivale, por si só, a comprovar aumento de conversão ou ganho financeiro.

## Métodos e implementação pública

Os projetos de origem combinam SQL e Python em Databricks para processamento e modelagem, com HTML, CSS e JavaScript na apresentação. Este repositório contém a camada pública de leitura: relatórios estáticos, scripts de interação, fontes locais e conjuntos de dados fictícios em JSON. Não contém os notebooks nem as conexões dos ambientes de origem.

As adaptações estão descritas nos relatórios. Duas distinções importantes:

- **Golden Set:** o núcleo original combina K-Means e programação linear inteira. A demonstração pequena resolve sua formulação binária por programação dinâmica exata; não executa PuLP no navegador.
- **Simuladores:** as árvores e respostas entre variáveis são parametrizadas para demonstração. Não são um XGBoost treinado com dados de uma operação real. O Goal Seeking busca um candidato na amostra fictícia, sem garantir que a meta será atingida.

A Rede de Ideias é um grafo de hipóteses e relações explícitas, não uma rede neural treinada. Correlação, contraste entre perfis e cenários simulados não demonstram causalidade.

## Dados e limites

Todos os conjuntos de dados utilizados nos exemplos são fictícios. Nomes, volumes, capacidades, avaliações e resultados ilustram o funcionamento dos métodos; não representam pessoas, campanhas ou resultados empresariais reais.

As visualizações devem ser lidas junto com suas explicações. Uma taxa depende do denominador utilizado; uma diferença de Score não é uma diferença de oportunidades; uma previsão não é uma promessa de resultado. Os relatórios explicitam essas distinções e as simplificações de cada exemplo.

## Organização técnica

Cada diretório de projeto contém seu relatório e as dependências necessárias para executá-lo. Os JSONs ficam em `data/` e as fontes locais em `assets/`. O site não requer uma API de aplicação nem consultas a bases externas para carregar os exemplos.

O arquivo `_headers` define orientações de cache para a hospedagem no Cloudflare. A página `index.html` da raiz direciona ao portfólio pessoal; os relatórios possuem endereços próprios.

Os exemplos interativos funcionam em um servidor HTTP estático. Abrir um HTML diretamente pelo sistema de arquivos pode impedir o carregamento dos JSONs. O botão **Salvar PDF** utiliza a impressão do navegador.
