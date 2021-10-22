# Algoflex
Projet Epitech Algoflex

## Lancement Front-end : 

npm run start

## Lancement Back-end :

npm run dev

## Lancement du serveur d'autocomplétion : 

mkdir /tmp/algoflex_autocomplete
touch /tmp/algoflex_autocomplete/file.cpp
npm run dev

### Dépendance du serveur :

- ccls

## Debug Docker API engine

Il faut avoir installer Docker sur le terminal ainsi que le programme "socat".

Ensuite il suffit d'entrer cette commande : 

```bash
socat TCP-LISTEN:2376,reuseaddr,fork UNIX-CLIENT:/var/run/docker.sock
```

Contact:

hugo.haquette@epitech.eu

alexis.barthelmebs@epitech.eu

https://discord.gg/TeEPJRBM6G

