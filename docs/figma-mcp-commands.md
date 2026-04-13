# Figma MCP — Comandos disponíveis

## Grupo 1 — MCP Figma (leitura de arquivo por URL)

> Funciona apenas com a URL do arquivo Figma. Não requer Figma Desktop aberto.


| Comando                        | O que faz                                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `get_design_context`           | Retorna código de referência, screenshot e metadados contextuais de um node — ferramenta principal para design→código |
| `get_metadata`                 | Retorna estrutura XML do node (IDs, tipos, posições, tamanhos) sem screenshot nem código                              |
| `get_screenshot`               | Captura imagem de um node específico                                                                                  |
| `get_variable_defs`            | Retorna definições de variáveis/tokens do arquivo                                                                     |
| `search_design_system`         | Busca componentes e estilos no design system                                                                          |
| `get_code_connect_map`         | Retorna mapeamento Code Connect (componente Figma → componente de código)                                             |
| `get_code_connect_suggestions` | Sugere mapeamentos Code Connect automaticamente                                                                       |
| `get_context_for_code_connect` | Contexto para configurar Code Connect em um componente                                                                |
| `get_figjam`                   | Lê conteúdo de um board FigJam                                                                                        |
| `whoami`                       | Retorna o usuário autenticado no Figma                                                                                |
| `use_figma`                    | Acesso geral à API Figma                                                                                              |
| `add_code_connect_map`         | Adiciona mapeamento Code Connect                                                                                      |
| `send_code_connect_mappings`   | Envia mapeamentos Code Connect para o Figma                                                                           |
| `create_design_system_rules`   | Cria regras para o design system                                                                                      |
| `create_new_file`              | Cria um novo arquivo Figma                                                                                            |
| `generate_diagram`             | Gera diagrama a partir de dados                                                                                       |


---

## Grupo 2 — Figma Console (plugin no Figma Desktop)

> Requer o **Figma Desktop aberto** com o plugin Figma Console ativo.

### Leitura de dados


| Comando                           | O que faz                                       |
| --------------------------------- | ----------------------------------------------- |
| `figma_get_file_data`             | Dados completos do arquivo aberto               |
| `figma_get_styles`                | Estilos do arquivo (cores, tipografia, efeitos) |
| `figma_get_variables`             | Variáveis e coleções de variáveis               |
| `figma_get_text_styles`           | Estilos de texto                                |
| `figma_get_token_values`          | Valores dos tokens                              |
| `figma_get_selection`             | Retorna o node selecionado atualmente no Figma  |
| `figma_get_comments`              | Comentários do arquivo                          |
| `figma_get_annotations`           | Anotações de um frame                           |
| `figma_get_annotation_categories` | Categorias de anotações                         |
| `figma_browse_tokens`             | Navega pelos tokens do arquivo                  |


### Componentes e design system


| Comando                                    | O que faz                                         |
| ------------------------------------------ | ------------------------------------------------- |
| `figma_get_component`                      | Dados básicos de um componente por ID             |
| `figma_get_component_details`              | Detalhes completos de um componente               |
| `figma_get_component_for_development`      | Dados do componente voltados para desenvolvimento |
| `figma_get_component_for_development_deep` | Versão aprofundada do comando acima               |
| `figma_get_component_image`                | Imagem renderizada de um componente               |
| `figma_search_components`                  | Busca componentes por nome                        |
| `figma_get_library_components`             | Lista componentes da biblioteca                   |
| `figma_get_design_system_kit`              | Kit completo do design system                     |
| `figma_get_design_system_summary`          | Resumo do design system                           |
| `figma_get_design_changes`                 | Mudanças recentes no design                       |


### Auditoria e qualidade


| Comando                               | O que faz                                  |
| ------------------------------------- | ------------------------------------------ |
| `figma_lint_design`                   | Detecta inconsistências de design          |
| `figma_audit_component_accessibility` | Auditoria de acessibilidade de componentes |
| `figma_audit_design_system`           | Auditoria geral do design system           |
| `figma_check_design_parity`           | Verifica paridade entre design e código    |
| `figma_scan_code_accessibility`       | Escaneia acessibilidade no código          |


### Screenshots


| Comando                    | O que faz                              |
| -------------------------- | -------------------------------------- |
| `figma_capture_screenshot` | Captura screenshot de um node          |
| `figma_take_screenshot`    | Alternativa para captura de screenshot |


### Slides (Figma Slides)


| Comando                      | O que faz                       |
| ---------------------------- | ------------------------------- |
| `figma_list_slides`          | Lista slides do arquivo         |
| `figma_get_slide_content`    | Conteúdo de um slide específico |
| `figma_get_focused_slide`    | Slide atualmente em foco        |
| `figma_get_slide_grid`       | Grade/layout de um slide        |
| `figma_get_slide_transition` | Transição configurada no slide  |


### FigJam


| Comando                     | O que faz                          |
| --------------------------- | ---------------------------------- |
| `figjam_get_board_contents` | Conteúdo completo do board FigJam  |
| `figjam_get_connections`    | Conexões entre elementos do FigJam |


