export SHELL:=/bin/bash
export SHELLOPTS:=$(if $(SHELLOPTS),$(SHELLOPTS):)pipefail:errexit

.ONESHELL:
.PHONY: dev

dev:
	trap 'docker stop dev-db' EXIT
	docker run -d --rm --name dev-db -p 5434:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dev -v ${PWD}/postgres-data:/var/lib/postgresql/data postgres:15.1-alpine
	npm run dev