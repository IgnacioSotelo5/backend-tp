# Smart Home Control API (NestJS)

A RESTful API for managing smart home scenarios and devices, built with NestJS. This project allows you to create, update, and manage home automation scenarios and their associated devices.

## Features
- CRUD operations for scenarios and devices
- Advanced search with query parameters
- Data validation for all entities
- File-based persistent storage (using Node.js fs module)
- API documentation with Swagger

## Tech Stack
- NestJS
- TypeScript
- Node.js (fs for storage)

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
git clone https://github.com/IgnacioSotelo5/backend-tp.git
cd backend-tp
npm install
# or
yarn install
```

### Running the API
```bash
npm run start:dev
# or
yarn start:dev
```

The API will be available at `http://localhost:3000`.

## API Endpoints

- `GET /escenarios` — Get all scenarios
- `GET /escenarios/:id` — Get scenario by ID
- `POST /escenarios` — Create a new scenario
- `PATCH /escenarios/:id` — Update a scenario
- `DELETE /escenarios/:id` — Delete a scenario

See the Swagger docs for full details and request/response examples:

```
http://localhost:3000/api
```

## Example Scenario Payload
```json
{
  "name": "Living Room Evening",
  "description": "Dim lights and play music",
  "devices": [
    {
      "id": "uuid-device-1",
      "name": "Lamp",
      "type": "light",
      "status": true,
      "settings": {
        "brightness": 50
      }
    }
  ]
}
```

## Project Structure
```
backend-tp/
  src/
    controllers/
    services/
    models/
    ...
```

## Roadmap
- [ ] Add authentication and authorization
- [ ] Add unit and integration tests
- [ ] Add support for database storage

## License
MIT
