## Stage 1: build
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY . /workspace
RUN chmod +x ./mvnw || true
RUN ./mvnw -Pjava21 -Dmaven.test.skip=true package -DskipTests

## Stage 2: runtime
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/continuum-backend-1.0.0-SNAPSHOT.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /build

COPY . .

RUN ./mvnw -Dmaven.test.skip=true package

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /build/target/*SNAPSHOT.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]