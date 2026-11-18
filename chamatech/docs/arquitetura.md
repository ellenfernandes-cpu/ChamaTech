# Arquitetura — ChamaTech

> Responsável: Isadora

## Diagrama de componentes
<!-- inserir imagem: ![Componentes](img/componentes.png) -->

## Diagrama de implantação
<!-- inserir imagem: ![Implantação](img/implantacao.png) -->

## Diagrama de casos de uso
<!-- inserir imagem: ![Casos de uso](img/casos-de-uso.png) -->

## Decisões de arquitetura
- Comunicação frontend → API via proxy reverso do Nginx (`/api/`), evitando problemas de CORS.
- Segredos fora do repositório: `.env` no Compose e `Secret` no Kubernetes.
