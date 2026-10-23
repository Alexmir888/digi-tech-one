# digi-tech-one

A notes web application built with Node.js and Express. Nginx forwards requests to multiple application containers, and a shared Docker volume preserves notes.

Run the commands below in PowerShell from the project root. Start Docker Desktop first.

## 1. Build and publish the image

The Compose configuration uses `xmyronenkoo/oleksandr_myronenko:1.0`. You need permission to publish to this Docker Hub repository. If you use your own repository, replace the image name here and in `compose\docker-compose.yml`.

```powershell
docker login
docker build -t xmyronenkoo/oleksandr_myronenko:1.0 .
docker push xmyronenkoo/oleksandr_myronenko:1.0
```

## 2. Start the project with Compose

This is the easiest way to present the complete project. Compose starts five application instances and Nginx:

```powershell
docker compose -p digi-tech-one -f compose\docker-compose.yml pull
docker compose -p digi-tech-one -f compose\docker-compose.yml up -d --scale digi-tech-one=5
docker compose -p digi-tech-one -f compose\docker-compose.yml ps
```

Open [http://localhost:5000](http://localhost:5000). Nginx receives requests on port `5000` and forwards them to the application containers on port `3000`.

Show which instance answers requests:

```powershell
1..5 | ForEach-Object { Invoke-RestMethod http://localhost:5000/api/whoami }
```

Add and read a note through the API:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:5000/api/notes `
  -ContentType 'application/json' `
  -Body '{"text":"Presentation test"}'

Invoke-RestMethod http://localhost:5000/api/notes
```

To demonstrate persistence, stop and recreate the containers, then read the notes again. The volume is preserved:

```powershell
docker compose -p digi-tech-one -f compose\docker-compose.yml down
docker compose -p digi-tech-one -f compose\docker-compose.yml up -d --scale digi-tech-one=5
Invoke-RestMethod http://localhost:5000/api/notes
```

## 3. Start multiple containers manually

Use this section to demonstrate manual container startup. Do not run it at the same time as the Compose setup because both use port `5000`. Stop Compose first:

```powershell
docker compose -p digi-tech-one -f compose\docker-compose.yml down
```

Create a network and shared volume:

```powershell
docker network create digi-tech-one
docker volume create notes-data
```

Start five instances of the published image:

```powershell
$image = "xmyronenkoo/oleksandr_myronenko:1.0"
docker run -d --name digi-tech-one-1 --network digi-tech-one --network-alias digi-tech-one -v notes-data:/data $image
docker run -d --name digi-tech-one-2 --network digi-tech-one --network-alias digi-tech-one -v notes-data:/data $image
docker run -d --name digi-tech-one-3 --network digi-tech-one --network-alias digi-tech-one -v notes-data:/data $image
docker run -d --name digi-tech-one-4 --network digi-tech-one --network-alias digi-tech-one -v notes-data:/data $image
docker run -d --name digi-tech-one-5 --network digi-tech-one --network-alias digi-tech-one -v notes-data:/data $image
```

From the project root, start Nginx with the project configuration:

```powershell
docker run -d --name nginx --network digi-tech-one -p 5000:4000 `
  -v "${PWD}\compose\nginx.conf:/etc/nginx/nginx.conf:ro" nginx:latest
```

Open [http://localhost:5000](http://localhost:5000) to test the application. Remove the manually started containers and network when finished; the volume and notes are kept:

```powershell
docker rm -f nginx digi-tech-one-1 digi-tech-one-2 digi-tech-one-3 digi-tech-one-4 digi-tech-one-5
docker network rm digi-tech-one
```

## Submission checklist

- The Docker image is available in Docker Hub.
- The project starts with Docker Compose using five application instances and Nginx.
- Multiple instances can also be started manually using the commands above.
- Notes remain available after the application containers are recreated.

To stop the Compose setup without deleting notes:

```powershell
docker compose -p digi-tech-one -f compose\docker-compose.yml down
```

To stop it and delete the notes volume as well:

```powershell
docker compose -p digi-tech-one -f compose\docker-compose.yml down -v
```
