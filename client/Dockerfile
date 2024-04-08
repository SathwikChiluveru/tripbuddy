## Node Runtime version
FROM node:18.14.2

##Set the working directory to /app
WORKDIR /app

##COPY 
COPY . .

RUN npm install

EXPOSE 5173

CMD [ "npm", "start" ]