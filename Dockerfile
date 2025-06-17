FROM node:18 AS build

WORKDIR /app

# Copie só os arquivos necessários para instalar dependências
COPY package.json pnpm-lock.yaml ./

RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install

# Agora copie o restante do projeto (sem sobrescrever node_modules do container)
COPY . .

RUN pnpm build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
