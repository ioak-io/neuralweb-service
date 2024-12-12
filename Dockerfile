FROM node:latest
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["*.tgz", "package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
COPY public.pem /usr/src/app/public.pem
EXPOSE 8025
CMD ["npm", "start"]
