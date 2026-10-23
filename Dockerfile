# Базовый образ с Node.js (alpine - маленький)
FROM node:20-alpine

# Рабочая папка внутри контейнера
WORKDIR /app

# Сначала копируем package.json: слой с зависимостями кэшируется
COPY package.json ./
RUN npm install --omit=dev

# Затем код приложения
COPY app.js ./

# Переменные окружения по умолчанию
ENV PORT=3000
ENV DATA_DIR=/data

# Папка данных объявлена как volume
VOLUME /data

# Документируем порт приложения
EXPOSE 3000

# Команда запуска
CMD ["node", "app.js"]