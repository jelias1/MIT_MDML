build_docker_images:
	docker build -t grafana grafana/.
	docker build -t grafana_mysqldb grafana_mysqldb/.
	docker build -t influxdb influxdb/.
	docker build -t register_account mdml_register/.
	docker build -t minio minio/.
	docker build -t mosquitto mosquitto/.
	docker build -t nginx nginx/.
	docker build -t node_red node_red/.

load_docker_images:
	docker load -i grafana/grafana.tar
	docker load -i grafana_mysqldb/grafana_mysqldb.tar
	docker load -i influxdb/influxdb.tar
	docker load -i mdml_register/mdml_register.tar
	docker load -i minio/minio.tar
	docker load -i mosquitto/mosquitto.tar
	docker load -i nginx/nginx.tar
	docker load -i node_red/node_red.tar
