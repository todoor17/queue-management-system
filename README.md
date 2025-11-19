# Energy Management Platform

This repo contains four services (frontend, auth, user, device) plus Traefik, all wired together by the root `docker-compose.yml`. Everything is meant to run inside Docker; Traefik exposes each API on an easy hostname like `frontend.localhost`, `auth.localhost`, `user.localhost`, and `device.localhost`.

## Run the stack

1. From the repository root, run `docker compose up --build`.
2. Wait until `auth_service`, `user_service`, and `device_service` report `Uvicorn running` in the logs.
3. Visit `http://frontend.localhost` to use the Next.js UI.

That’s it—sign up, log in, and manage users/devices entirely inside the Docker network. Use `docker compose logs -f <service>` if you need to debug a specific container.
