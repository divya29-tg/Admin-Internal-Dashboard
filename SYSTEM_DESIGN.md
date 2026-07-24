# System Design Blueprint: Real-Time Analytics Dashboard (Scale: 10 Lakhs / 1 Million Records)

This document details the architectural blueprint optimized for **10 Lakhs (1 Million) records**. At this scale, the architecture balances high-performance query execution, real-time interactive updates, and code simplicity—making it ideal for production-ready interview demonstrations.

---

## 🚀 1. The Core Architecture (Scale: 10 Lakhs)
At 10 Lakhs records, we do not need complex, expensive tools like Apache Kafka or clustered database sharding. Instead, we can achieve sub-second query performance and real-time UI updates using **indexed MongoDB queries** combined with **WebSockets (Socket.io)**.

### The Ingestion & Query Strategy:
1.  **Durable Write Path:** Ingestion APIs write directly to MongoDB. With standard indexing, MongoDB handles thousands of writes per second on a single instance easily.
2.  **Live Real-Time Path:** When an event is ingested, the server registers the write and immediately emits a WebSocket broadcast using **Socket.io**.
3.  **Fast Query Path:** Since the database contains 10 Lakhs records, standard aggregations (like calculating active users or downloads) run in **< 50ms** when backed by compound database indexes.

---

## 🎨 2. Architectural Diagram

```mermaid
graph TD
    %% Ingestion
    User([User App / SDK]) -->|1. Ingest Event| Express[Express.js Server]
    
    %% Database Write
    Express -->|2. Direct Write| MongoDB[(MongoDB Atlas)]
    
    %% Real-time Broadcast
    Express -->|3. Emit WebSocket Event| SocketIO[Socket.io Server]
    SocketIO -.->|4. Push Live Updates| Admin([Admin UI])
    
    %% Dashboard Query Path
    Admin -->|5. Fetch Analytics (REST)| Express
    Express -->|6. Fast Index Aggregations| MongoDB
```

---

## 🧠 3. Architectural Pillars for 10 Lakhs Scale

### Pillar A: Index-Driven Aggregations (Fast Reads)
To prevent database scans from slowing down, we create targeted indexes on all query fields. For 10 Lakhs records:
*   **Downloads Query:** Filtering by date ranges or platform uses the compound index `{ downloadDate: -1, platform: 1 }`. MongoDB resolves this query in a few milliseconds.
*   **User Signups (DIDs):** Fast index scans on `{ createdAt: -1 }` return daily/monthly signups instantly.
*   **User Activity:** Scans on `{ lastSeen: -1 }` fetch active users without scanning the entire database.

### Pillar B: WebSocket Event Streaming (Zero-Polling Real-Time)
To keep the dashboard updated live without making constant API calls (polling):
*   The React dashboard opens a stateful **WebSocket connection** to the backend.
*   When a new event (download, uninstall, activity) occurs, the Express ingestion API publishes it. The Socket.io hub broadcasts it to all connected dashboard pages.
*   The React frontend updates the counters and chart trends smoothly.

---

## 💡 4. How to Scale this to 10 Crore (100M+) & Billions (Interview Talk)
During the interview, the interviewer might ask: *"This works for 10 Lakhs, but how would you scale it to 10 Crore or Billions?"* 
We have designed the codebase so it can easily transition:

1.  **Introduce Redis Caching:**
    *   Cache dashboard responses in Redis with a 5-minute TTL.
2.  **Pre-Aggregation (Roll-up Tables):**
    *   Instead of aggregating raw data on the fly, run an hourly background cron job that aggregates data into a `daily_kpi_summaries` collection. The API then queries this summary collection (containing only 365 rows per year) instead of 10 Crore rows.
3.  **Buffer Ingestion via Queues:**
    *   Add a message queue (like BullMQ or RabbitMQ) between the ingestion endpoint and the database to prevent database connection saturation during heavy traffic spikes.
4.  **Use Redis HyperLogLog for WAU/MAU:**
    *   To count unique active users across massive datasets, use Redis `PFADD` and `PFCOUNT` to avoid memory exhaustion.
