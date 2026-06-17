# EtuBibliothèque

Application de gestion des étudiants d'une bibliothèque, composée de deux parties :

- **Back-end** — API REST Spring Boot (Java 21) sécurisée par JWT, base MySQL.
- **Front-end** — application Angular 19 (inscription, connexion, CRUD étudiants).

```
[Navigateur] ──>  Front-end (Angular / nginx)  ──/api──>  Back-end (Spring Boot)  ──JDBC──>  MySQL
   :4200                                                       :8080                          :3306
```

| Dossier | Contenu |
|---|---|
| `Back-end---Testez-et-am-liorez-une-application-existante/` | API Spring Boot |
| `Front-end---Testez-et-am-liorez-une-application-existante/` | Application Angular |
| `compose.yaml` | Stack applicative (mysql + backend + frontend) |
| `compose.test.yaml` | Exécution des tests en conteneurs |
| `.env` | Variables d'environnement (à créer, voir ci-dessous) |

---

## 1. Prérequis

- **Docker Desktop** (avec Docker Compose) — pour la mise en place la plus simple.

Pour le mode développement (sans Docker), il faut en plus :

- **Java 21** (JDK)
- **Maven 3.9.3+**
- **Node.js 20** et **Angular CLI 19** (`npm install -g @angular/cli`)

---

## 2. Configuration — fichier `.env`

Le fichier `.env` n'est **pas versionné** (il contient la configuration sensible). Créez-le **à la racine** du projet avec ce contenu :

```dotenv
# Base de données (noms attendus par le code de l'app)
DB_NAME=etudiant_db
DB_USER=etudiant_db
DB_PASSWORD=etudiant_db
DB_HOST=mysql
DB_PORT=3306

# JWT (à changer en production, minimum 256 bits)
JWT_SECRET=change-me-in-production-with-a-256-bit-secret-key-please
JWT_EXPIRATION=3600000

# Désactive l'intégration docker-compose de Spring dans le conteneur
SPRING_DOCKER_COMPOSE_ENABLED=false

# Variables attendues par l'image MySQL
MYSQL_DATABASE=etudiant_db
MYSQL_USER=etudiant_db
MYSQL_PASSWORD=etudiant_db
MYSQL_ROOT_PASSWORD=root_password

# Ports exposés sur la machine hôte
BACKEND_PORT=8080
FRONTEND_PORT=4200
```

> `compose.yaml` importe ce fichier directement (`env_file`) dans les conteneurs `backend` et `mysql`.

---

## 3. Démarrage avec Docker (recommandé)

À la racine du projet :

```bash
docker compose up -d --build
```

Cela construit et lance les trois conteneurs :

- **mysql** — la base de données ;
- **backend** — l'API (attend que MySQL soit « healthy ») ;
- **frontend** — l'application servie par nginx (proxy `/api` vers le backend).

Accès :

- Front-end : http://localhost:4200
- Back-end : http://localhost:8080

Commandes utiles :

```bash
docker compose ps                 # état des conteneurs
docker compose logs -f backend    # logs du back
docker compose down               # arrêter (ajouter -v pour effacer la base)
```

---

## 4. Démarrage en mode développement (sans Docker)

### Back-end (port 8080)

Docker Desktop doit être lancé (Spring Boot démarre un conteneur MySQL via `compose.yaml` du dossier back).

```bash
cd Back-end---Testez-et-am-liorez-une-application-existante
mvn spring-boot:run
```

### Front-end (port 4200)

```bash
cd Front-end---Testez-et-am-liorez-une-application-existante
npm install
npm start            # = ng serve, proxy /api -> http://localhost:8080
```

---

## 5. Tests

### En conteneurs (indépendant, recommandé)

```bash
docker compose -f compose.test.yaml run --rm backend-test     # JUnit + Testcontainers + JaCoCo
docker compose -f compose.test.yaml run --rm frontend-test    # Jest
```

### En local

**Back-end** — tests unitaires + intégration + rapport de couverture JaCoCo (seuil 80 %) :

```bash
cd Back-end---Testez-et-am-liorez-une-application-existante
mvn verify
# rapport : target/site/jacoco/index.html
```

**Front-end** — tests unitaires Jest + couverture (seuil 80 %) :

```bash
cd Front-end---Testez-et-am-liorez-une-application-existante
npm test
# rapport : coverage/index.html
```

**Front-end** — tests E2E Cypress (l'application doit tourner sur le port 4200) :

```bash
npm run cypress:run      # headless
npm run cypress:open     # mode interactif
```

---

## 6. API (back-end)

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/register` | — | Créer un utilisateur |
| POST | `/api/login` | — | S'authentifier (retourne un token JWT) |
| GET | `/api/students` | Bearer | Lister les étudiants |
| GET | `/api/students/{id}` | Bearer | Détail d'un étudiant |
| POST | `/api/students` | Bearer | Ajouter un étudiant |
| PUT | `/api/students/{id}` | Bearer | Modifier un étudiant |
| DELETE | `/api/students/{id}` | Bearer | Supprimer un étudiant |

Les routes `/api/students/**` nécessitent un en-tête `Authorization: Bearer <token>`.

---

## 7. Parcours utilisateur (front-end)

1. `/register` — créer un compte.
2. `/login` — se connecter ; en cas de succès, redirection automatique vers `/students`.
3. `/students` — gérer les étudiants (liste, ajout, modification, suppression). Écran protégé : accessible uniquement authentifié.
