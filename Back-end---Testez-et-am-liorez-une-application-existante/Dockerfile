# ---------- Etape 1 : build du jar avec Maven ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
# Cache des dependances : on copie d'abord le pom
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
# Puis le code source et on package (tests ignores : ils requierent Docker/Testcontainers)
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---------- Etape 2 : image d'execution legere (JRE) ----------
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/etudiant-backend-1.0.0-SNAPSHOT.jar app.jar
# Fichier .env vide pour satisfaire AppConfig ; les vraies valeurs viennent des variables d'environnement
RUN touch .env
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
