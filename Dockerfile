FROM registry.metzuda-2.idf.cts/hativat-haagana-prism-unit-magen-elyon/node:20.11.0 as base
WORKDIR /app

USER root

COPY .npmrc package*.json ./


RUN npm install

COPY . ./

RUN npm run build --production

FROM registry.metzuda-2.idf.cts/hativat-haagana-prism-unit-magen-elyon/node:20.11.0
WORKDIR /app

USER root

COPY .npmrc package*.json ./

RUN npm i --only=production --ignore-scripts
COPY tsconfig.json ./    
COPY --from=base /app/dist /app/dist 
EXPOSE 8080

ADD https://yum.idf.cts/certs/bundle-latest.crt /etc/ssl/certs/ca-certificates.crt

ENTRYPOINT ["node", "-r", "tsconfig-paths/register", "dist/src/main"]

