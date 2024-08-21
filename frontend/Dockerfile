# Build Stage
FROM node:16-alpine AS build
WORKDIR /app
COPY . .
RUN yarn
RUN yarn build
# production environment
FROM nginx:stable-alpine

# Copy the built application from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration file
COPY /nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]