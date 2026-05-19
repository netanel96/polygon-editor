# polygon-editor
web app that create polygons on a canvas and persist on db.

tech-stack:
frontend: React ,ts
backend:node ,ts,express,mongodb


How to run server in develpoment:
1. got to server folder.
2. run npm i 
3. look at .env.example and create .env file for your own. with your values.

Server env explanation:
| Variable               | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `PORT`                 | Express server port                                 |
| `MONGO_URL`            | MongoDB connection string                           |
| `CLIENT_URL`           | Allowed frontend origins for CORS                   |
| `LOG_FILE_PATH`        | Log file location                                   |
| `LOG_OUTPUT`           | Log outputs (`console`, `file`)                     |
| `LOG_TRANSPORT`        | Logging transport/backend                           |
| `API_REQUEST_DELAY_MS` | Artificial API delay for testing/loading simulation |

4.run npm run dev

how to run client project:
exactly like the server just from the client folder.

Client env explanation:
| Variable       | Description                                         |
| -------------- | --------------------------------------------------- |
| `VITE_API_URL` | Backend API base URL used by the client application |

running with docker-compose with scaled server:
docker-compose up -d --build --scale server=3 