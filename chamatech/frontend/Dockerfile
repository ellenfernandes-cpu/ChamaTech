FROM nginx:1.27-alpine

# Substitui a configuração padrão do Nginx pela nossa
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos (HTML, CSS, JS) da Isadora
COPY src/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1
