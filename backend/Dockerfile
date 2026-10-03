# Arquivo: ./backend/Dockerfile

# Estágio 1: Construção (compilação do Java/Maven)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compila o projeto no JAR final
RUN mvn clean package -DskipTests

# Estágio 2: Execução (imagem mais leve para produção)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copia o JAR do estágio de build com o nome correto
COPY --from=build /app/target/seniorplus-0.0.1-SNAPSHOT.jar app.jar 

RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 8080 
ENTRYPOINT ["java", "-jar", "app.jar"]