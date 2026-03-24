# Étape 1 : Build avec Maven et JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
# On saute les tests pour accélérer le déploiement sur Render
RUN mvn clean package -DskipTests

# Étape 2 : Exécution avec JDK 21 (plus léger)
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app

# On utilise l'astérisque *.jar pour être sûr de trouver le fichier même si le nom change un peu
COPY --from=build /app/target/*.jar app.jar

# TRÈS IMPORTANT : Render utilise souvent le port 8080 ou 10000 par défaut.
# Mais comme ton app écoute sur ${PORT}, on expose une valeur générique.
EXPOSE 8081

# Optimisation de la mémoire pour le plan gratuit de Render (512Mo max)
# On laisse un peu de marge pour le système avec -Xmx400m
ENTRYPOINT ["java", "-Xmx400m", "-jar", "app.jar"]