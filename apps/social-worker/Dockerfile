FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /workspace

# Build context must be repository root:
# docker build -f apps/social-worker/Dockerfile .
COPY pom.xml ./
COPY apps ./apps
COPY modules ./modules

RUN mvn -B -pl apps/social-worker -am -DskipTests install
RUN mvn -B -f apps/social-worker/pom.xml -DskipTests package spring-boot:repackage
RUN set -eux; \
    JAR_PATH="$(find apps/social-worker/target -maxdepth 1 -type f -name '*.jar' ! -name '*.original' | head -n 1)"; \
    test -n "$JAR_PATH"; \
    cp "$JAR_PATH" /tmp/app.jar

FROM eclipse-temurin:21-jre-jammy AS runner

WORKDIR /app

ENV JAVA_OPTS=""
ENV SERVER_PORT=8081

COPY --from=builder /tmp/app.jar /app/app.jar

EXPOSE 8081

CMD ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
