# albero
Little project to pass the time, a web page that helps you order your papers for the Italian citizenship.


-- To start the app --

(cambio a espanish)

1) INSTALAR NODE.JS Y EXPRESS
--Nada... paginita de node, ultima version estable...
--Creo que express lo tengo instalado globalmente, deberia estar en el package.json en realidad. si no funca nada:

/> npm install -g express

2) INSTALAR DEPENDENCIAS

Una vez descargado el repo, instalamos la gilada. cada microservicio tiene su propio package.json y sus propias dependencias (TODO: revisar las dependencias y sacar la tuca).

/> npm install
/\Auth> npm install
/\Families> npm install

Hasta ahora tenemos 2 microservicios, voy a crear un script en el futuro para instalar todo desde el root del repo.

Desde el root: /> npm run devinstall... es bastante cabeza...

3) env variables

?

4) Levantar las API'S.

Lo que se hace generalmente es levantar cada microservicio desde una consola distinta.

/*Microserv*> npm start

Entre los paquetes está nodemon, que levanta el servidor monitorea los archivos en busca de cambios constantemente, es de uso bastante standrard. El problema es que te bloquea claramente la consola y si empezamos a hacer muchos microservicios se vuelve un poco engorroso levantarlos manualmente y tener 4 o 5 consolas abiertas con distintas aplicaciones. Para eso usamos el paquete pm2, basicamente es un project manager que corre distintos scripts o aplicaciones en distintas instancias de node.
Para ejecutarlo le damos desde el root del repo:

 />pm2 start ecosystem.config.js
 
 o

/>npm start

Este archivo contiene un modulo con todas las especificaciones de las distintas aplicaciones. Es todavia un poco falopa para mi, lo estoy investigando. Si queremos monitorear y ver los logs de las aplicaciones tenemos que ir a la pagina de pm2

/>pm2 plus

esto te lleva al monitor, en consola te aparece algo como esto:


------

[PM2 I/O] Successfully authenticated
[PM2 I/O] Successfully validated
┌─────────────────────┬───────────┐
│ Bucket name         │ Plan type │
├─────────────────────┼───────────┤
│ PM2 Plus Monitoring │ free_v4   │
└─────────────────────┴───────────┘
[PM2 I/O] If you don't want to connect to a bucket, type 'none'
[PM2 I/O] Type the name of the bucket you want to connect to :

------

Aca le mandamos 'PM2 Plus Monitoring' que es la version gratis, solo aguanta hasta 4 microservicios, es lo que hay.
Para matar las instancias, desde cualquier consola:

/>pm2 delete all

TODO: Levantar los microservicios con Containers --> Docker --> Kubernetes --> etc.
