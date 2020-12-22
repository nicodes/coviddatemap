FROM python:3
WORKDIR /app

RUN apt-get upgrade -y \
    && apt-get update -y \
    && apt-get install -y postgresql postgis gdal-bin

RUN pip install --no-cache-dir pandas

RUN mkdir scripts
COPY init.sh ingest_jhu.sh parse_jhu.py parse_mvt.py .
COPY scripts scripts

CMD ./init.sh