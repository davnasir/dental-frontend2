# Nahol Dental Care — Frontend image (Vite build served by nginx)
# The API is accessed relative to the same origin (/api/v1) and nginx proxies
# it to the backend service, so VITE_API_URL does NOT need to be set in
# production (doing so would point visitors' browsers at a localhost address).

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]