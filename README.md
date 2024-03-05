
# STAR WARS API - TRANSLATOR

Esta API fue construida con el proposito de proporcionar una traducción de campos del API "[SWAPI](https://swapi.py4e.com/documentation#intro)" para el reto técnico Minsait.


## Diagrama

![App Screenshot](https://onedrive.live.com/embed?resid=28A93C7B86FBFCFB%217221&authkey=%21AIDNr9jsUGeXbbw&width=761&height=561)


## Stack

* AWS Lambda
* AWS API Gateway
* AWS DynamoDB
* NodeJS >v.18
* Express
* Serverless framework
* Localstack
* npm workspaces


## Preparación de entorno local

Clona el proyecto

```bash
  git clone https://github.com/shionAoi/START_WARS_API.git
```

Ingresa al directorio

```bash
  cd START_WARS_API
```

Instala dependencias

```bash
  npm install
```

Instala [Serverless Framework](https://www.serverless.com/framework/docs/getting-started)

```bash
  npm install -g serverless
```

Configura las credenciales de AWS con [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#cliv2-linux-install) usando las llaves de tu cuenta en la región preferida.

```bash
  aws configurate
```


**Opcional**: Este proyecto usa [localstack](https://docs.localstack.cloud/getting-started/installation/) para simular el entorno AWS. Para ello se tiene el archivo local_stack.yml para correrlo con docker-compose, pero si es de su preferencia puede instalar LocalStack de otra forma.

```bash
  docker-compose -f local_stack.yml up --detach
```


## Despliegue Local

Para correr todo el sistema se hace uso de [Serverless Framework](https://www.serverless.com/framework/docs/getting-started) en combinación con LocalStack para levantar los componentes AWS. Dentro del archivo serverless.yml se configura el stage **local** para desplegar en entorno local.

Ejecuta el archivo **ci-deploy.sh**
```bash
  ./ci-deploy.sh
```



## Despliegue en AWS

Para desplegar en AWS debes de tener configurado el AWS CLI con tus credenciales y tener los permisos de:

* CloudFormation
* Lambda
* DynamoDB
* CreatePolicy
* API Gateway

Ejecuta el archivo **ci-deploy.sh**
```bash
  ./ci-deploy.sh -s dev
```


## Correr Tests

Para correr los tests usar el siguiente comando

```bash
  npm run test -ws
```


## Uso/Ejemplos

Revisar la documentación swagger.

Abrir el archivo **api-documentation.yaml** en el editor de [**swagger**](https://editor.swagger.io/?_gl=1*1df9vmh*_gcl_au*NzQ5NjY0NjgzLjE3MDk1MjM1MTM.&_ga=2.42523365.1199196935.1709523512-678388211.1709523512).

![SWAGGER](https://onedrive.live.com/embed?resid=28A93C7B86FBFCFB%217219&authkey=%21AErPNC9yfY5s3Xo&width=1614&height=517)




