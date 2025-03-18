# Document Management Backend with RAG Integration

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

A production-ready backend system for document management and User Management.

## 🚀 Features

### Core Functionality
- 🔐 JWT Authentication with Refresh Tokens
- 👥 Role-Based Access Control (Admin/Editor/Viewer)
- 📁 Document CRUD Operations with File Upload
- 🚦 Document Status Tracking (Uploaded → Processing → Processed/Failed)
- 📊 Redis-powered Cache and Queue Management

### Advanced Features
- 🔄 Background Job Processing with BullMQ
- 🚫 Token Blacklisting/Revocation
- 📈 Modular Monolith Architecture
- 📚 Automatic API Documentation (Swagger)
- 🐳 Docker Containerization

## 🛠 Technology Stack

| Category          | Technologies                                                                 |
|-------------------|------------------------------------------------------------------------------|
| **Framework**     | NestJS, TypeScript                                                           |
| **Database**      | PostgreSQL, TypeORM                                                          |
| **Cache/Queue**   | Redis, BullMQ                                                                |
| **Auth**          | JWT, Passport.js                                                             |
| **Infrastructure**| Docker, Docker Compose                                                       |
| **Monitoring**    | BullMQ Dashboard, Swagger UI                                                 |

## 🏁 Getting Started

### Prerequisites

- Node.js v20.x
- Docker 24.x & Docker Compose 2.x
- Redis 7.x
- PostgreSQL 15.x

### Installation

```bash
# Clone repository
git clone git@github.com:farhanjafri25/doc-management-auth.git
cd document-management-backend

# Start services
docker-compose up
```

## ⚙️ Environment Configuration
# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=root
POSTGRES_PASSWORD=1234
POSTGRES_DB=users

# Authentication
JWT_SECRET=jwtSecret

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

## 🧪 Testing

# Unit test
npm test

# Coverage Report
npm test

## Basic App Description
The app is divided into 3 modules:
1. User-module
2. User-management-module
3. Doc-module
4. User-management-module

User-module: The User-module has functionalities regarding user authentication and authorization, a user can enter his email, name and password details to sign-up and login for the application. The User logut function works in a way of blacklisting tokens in redis and using a global guard mechanism it protects the routes from being accessed by not listed tokens.

User-management-module: The user management module has functionalities like delete user and update permissions access, the endpoints are protected by admin roles.

Doc-Module: The Doc-module has functionalities regarding uploading doc, fetching all docs, fetch doc by doc id, update and delete. All of the endpoints are protected by roles of user.
# Note: Upload doc is being made to local files system for the time being, we can store the files in S3 for better scalability and more efficient solution.

Ingestion-Module: The ingesttion-module starts the process of ingesting the file for Python backend, I'm using a queue system for ingestion to make it asynchronous, The Ingestion states are PENDING, PROCESSING, COMPLETED and FAILED, The Ingestion starts with Pending state and calls the python backend via a queueing system, the Python backend will run a async task to update accordingly.
Get Ingestion by Id to keep track of ingestion so far.
# Note: I'm using BullMQ module for async processing, We can extend this to using a RabbitMq or similar queue system in microservices architecture to enable more scalability.


## Authentication and Authorization

I am using NestJs Auth Guard for authenticating incoming requests.
DTO's are used for request validations.

## DB Design

# User's Entity
increment_id - PK
user_id - Indexed
email - Indexed
password
role

# Role Entity
role_id - PK
role_name - Indexed
can_read
can_write
can_delete

# Document Entity
increment_id - PK - Uniquely identify Docs
title
description
file_path
enum
created_by - Indexed

# Ingestion Entity
ingestion_id - PK - Uniquely identify ingestions
document
document_id
ingestion_status

# Note: I'm using increment id to identify records only for the scope of this project, for more scalability we can opt for creating unique Id's as increment id's may be reset across partitions in some DB's

## Key Points

1. Designed a modular based architecture.
2. Provides CRUD operations of everytable design.
3. Design a simple efficinet schema in PostgreSQL
4. Version Control of Api is handled properly
5. Guards are used for auhentication and authorization of API's.
6. Common Response Interceptor
7. Clean code architecture.


## Running the app

```bash
# production mode
$ docker-compose up
```