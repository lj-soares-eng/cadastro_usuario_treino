#!/bin/bash

# Abre o backend em uma nova janela
qterminal -e "bash -c 'cd backend/ && npm run start:dev; exec bash'" &

# Abre o frontend em outra nova janela
qterminal -e "bash -c 'cd frontend/ && npm run dev; exec bash'" &