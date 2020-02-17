# MDML
Manufacturing Data &amp; Machine Learning Layer, Argonne National Laboratory


## Installation
```
make build_docker_images
```
The MDML runs with a docker container for each component. All of the docker containers can be built with the command above. Before starting the containers, certain environment variables must be created. Editting the ```set_env.sh``` file will be required to properly set admin passwords, key file locations, and more. The MDML uses AWS' Secrets Manager to import passwords so they are not hard coded. Passwords can be hard coded into the set_env.sh file, but AWS components and data parsing should be replaced. Once the set_env.sh has been changed, run the command:
```
source set_env.sh
```

## Before Starting the MDML
Edit the nginx.conf file in the nginx folder. Host names will need to be changed throughout.

## Starting the MDML
```
docker-compose up
```
Docker compose is used to start the MDML in an organized way. The first time starting the MDML you may see errors that Grafana is exiting. This is expected as Grafana's backend MySQL database is still being initialized. Once the database is ready, Grafana should no longer quit.
