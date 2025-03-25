FROM oven/bun:latest

# Définir le répertoire de travail
WORKDIR /

# Copier les fichiers du projet dans le conteneur
COPY . .

# Installer les dépendances
RUN bun install

# Exposer le port utilisé par l'application
EXPOSE 3000

# Lancer l'application
CMD ["bun", "run", "src/index.ts"]
