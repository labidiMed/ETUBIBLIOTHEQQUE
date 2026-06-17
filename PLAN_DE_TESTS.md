# Plan de tests

Organisé selon la **pyramide des tests** (beaucoup d'unitaires à la base → quelques tests d'intégration → très peu d'E2E), en partant des cas les plus simples.

> **Contraintes** : uniquement les cas **nominaux** (pas de cas d'erreur : ni 400/401, ni mauvais mot de passe, ni « non trouvé »), et on **vérifie seulement la sortie pour une entrée donnée** — pas les effets de bord (pas de `verify(save())`, pas de contrôle de l'état de la BDD, pas de navigation/stockage).

---

## Niveau 1 — Tests unitaires (base : nombreux, simples, rapides)

### Back-end (JUnit 5 + Mockito + AssertJ)

#### a) Fonctions « pures » (sans mock) — les plus simples

| #  | Cas                                      | Entrée                                                                       | Sortie attendue                                                              |
|----|------------------------------------------|------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| U1 | `UserDtoMapper.toEntity` mappe les champs| `RegisterDTO{firstName:"John", lastName:"Doe", login:"jdoe", password:"pwd"}` | `User` avec `firstName="John"`, `lastName="Doe"`, `login="jdoe"`, `password="pwd"` |
| U2 | `StudentMapper.toEntity` mappe les champs| `StudentRequestDTO{firstName:"Marie", lastName:"Curie", email:"m@b.fr"}`      | `Student` avec les mêmes 3 champs                                           |
| U3 | `StudentMapper.toDto` mappe les champs   | `Student{id:1, firstName:"Marie", lastName:"Curie", email:"m@b.fr"}`          | `StudentDTO{id:1, firstName:"Marie", lastName:"Curie", email:"m@b.fr"}`     |
| U4 | `StudentMapper.toDtoList` mappe une liste| liste de 2 `Student`                                                          | liste de 2 `StudentDTO` correspondants (même taille, champs mappés)         |
| U5 | `JwtService` : génération + lecture       | `userDetails(username="jdoe")`                                               | `generateToken(...)` non nul, et `extractUsername(token) == "jdoe"`         |

#### b) Services (avec mocks, mais on assert la valeur retournée)

| #  | Cas                                | Entrée (mocks)                                                          | Sortie attendue                          |
|----|------------------------------------|------------------------------------------------------------------------|------------------------------------------|
| U6 | `UserService.login` renvoie un token| `findByLogin→user`, `matches→true`, `jwtService.generateToken→"jwt"`    | retourne `"jwt"`                         |
| U7 | `StudentService.findAll` renvoie les DTO| `repository.findAll → [student]`                                   | `[studentDTO]` (taille 1, champs mappés) |
| U8 | `StudentService.findById` renvoie le DTO| `repository.findById(1) → student`                                 | `studentDTO` correspondant               |

### Front-end (Jest)

| #  | Cas                                   | Entrée                                                | Sortie attendue                                                       |
|----|---------------------------------------|-------------------------------------------------------|----------------------------------------------------------------------|
| F1 | `AuthService` stocke et relit le token| `setToken("abc")`                                     | `getToken() === "abc"` ; `isAuthenticated() === true`                |
| F2 | `UserService.login` appelle la bonne route| `{login, password}`                               | requête **POST** `/api/login` ; en renvoyant `"jwt"`, l'Observable émet `"jwt"` |
| F3 | `StudentService.findAll` appelle la bonne route| —                                            | requête **GET** `/api/students` ; en renvoyant `[student]`, émet `[student]` |
| F4 | `StudentService.create` envoie le bon corps| `Student{...}`                                   | requête **POST** `/api/students` avec ce corps ; émet l'étudiant créé |
| F5 | `RegisterComponent` : formulaire valide| champs `firstName/lastName/login/password` remplis   | `registerForm.valid === true`                                        |
| F6 | `LoginComponent` : formulaire valide  | `login` et `password` remplis                         | `loginForm.valid === true`                                           |

*(F1 est le tout premier à écrire : pur, sans HTTP.)*

---

## Niveau 2 — Tests d'intégration (moins nombreux)

### Back-end (`@SpringBootTest` + Testcontainers MySQL, comme `UserControllerTest`)

| #  | Cas                              | Entrée                                              | Sortie attendue                          |
|----|----------------------------------|-----------------------------------------------------|------------------------------------------|
| I1 | Créer un utilisateur             | `POST /api/register` body valide                    | **201**                                  |
| I2 | S'authentifier                   | `POST /api/login` identifiants valides              | **200** + corps = token non vide         |
| I3 | Lister les étudiants (authentifié)| `GET /api/students` + header `Bearer <token>`      | **200** + tableau JSON                   |
| I4 | Créer un étudiant (authentifié)  | `POST /api/students` + Bearer + body valide         | **201** + `StudentDTO` avec un `id`      |
| I5 | Détail d'un étudiant (authentifié)| `GET /api/students/{id}` + Bearer                  | **200** + `StudentDTO` correspondant     |

### Front-end (composant + template réel, service HTTP simulé)

| #  | Cas                              | Entrée                                | Sortie attendue                         |
|----|----------------------------------|---------------------------------------|-----------------------------------------|
| I6 | `StudentsComponent` affiche la liste| service renvoie 2 étudiants à l'init | le tableau du template contient **2 lignes** |

---

## Niveau 3 — Tests end-to-end (sommet : très peu)

| #  | Cas                          | Entrée                                                       | Sortie attendue                                      |
|----|------------------------------|--------------------------------------------------------------|------------------------------------------------------|
| E1 | Parcours nominal d'authentification| identifiants valides + clic « Login »                  | arrivée sur l'écran `/students` qui affiche la liste |
| E2 | *(option)* Ajouter un étudiant| remplir le formulaire + « Ajouter »                         | le nouvel étudiant apparaît dans la liste            |

---

## Ordre conseillé pour démarrer (du plus simple au plus complet)

**F1 → U1‑U5** (purs, sans mock) → **U6‑U8 / F2‑F4** (avec mocks/HTTP) → **F5‑F6** (formulaires) → **I1‑I6** (intégration) → **E1‑E2** (E2E).

## Déjà couvert (référence)

Côté back, le cas **I1** existe déjà (`UserControllerTest.registerUserSuccessful`), ainsi que des unitaires sur `UserService` / `StudentService`. Ce plan complète surtout les **mappers**, le **JWT**, les **lectures** (`findAll` / `findById`) et tout le **front** (aucun test front n'est encore écrit).
