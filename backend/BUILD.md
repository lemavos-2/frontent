Build instructions
==================

Problema comum
--------------
O projeto requer JDK >= 17 (recomendado JDK 21). Se você tentar compilar com JDK 11 verá erros como "release version 21 not supported".

Opções para compilar
--------------------

1) Instalar JDK 21 no sistema (ex.: Ubuntu):

```bash
sudo apt-get update
sudo apt-get install -y openjdk-21-jdk-headless
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which javac))))
java -version
javac -version
./mvnw -Pjava21 -DskipTests package
```

2) Build via Docker (recomendado quando não quiser alterar JDK do host):

```bash
chmod +x build-with-docker.sh
./build-with-docker.sh
```

3) Forçar fallback para JDK 17 (quando JDK < 21 mas >= 17):

```bash
./mvnw -Pfallback-jdk -DskipTests package
```

Deploy (Docker)
---------------

Há um `Dockerfile` multi-stage no repositório. Para buildar e rodar a imagem:

```bash
docker build -t continuum-backend:latest .
docker run --rm -p 8080:8080 continuum-backend:latest
```

Ou usar o helper `docker-run.sh`:

```bash
chmod +x docker-run.sh
./docker-run.sh
```

Observação: o `Dockerfile` usa JDK21 no build stage e JRE21 no runtime.

Ajuda
-----
Se o build falhar, cole aqui a saída do comando `./mvnw -DskipTests package` e eu ajudarei a corrigir.

Running tests
-------------

Use the wrapper (recommended):

```bash
chmod +x run-tests.sh
./run-tests.sh
```

Or directly:

```bash
./mvnw test
```
