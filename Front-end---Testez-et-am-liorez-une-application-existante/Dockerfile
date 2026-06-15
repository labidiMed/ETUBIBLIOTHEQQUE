# ---------- Etape 1 : build Angular ----------
FROM node:20-alpine AS build
WORKDIR /build
# Cache des dependances : on copie d'abord les manifestes
COPY package*.json ./
RUN npm ci
# Puis le reste du code et build de production
COPY . .
RUN npm run build

# ---------- Etape 2 : service nginx ----------
FROM nginx:alpine
# Le builder "application" d'Angular 19 produit les fichiers sous dist/<projet>/browser
COPY --from=build /build/dist/etudiant-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
