# PassVault

A zero-knowledge password vault: users generate, evaluate, and store credentials, with all vault encryption and decryption executing exclusively on the client side. The server never has access to a user's master password, encryption key, or plaintext vault contents.

---

## Architecture & Hosting

PassVault is deployed across a decoupled, serverless-friendly cloud architecture:

* **Frontend:** React + TypeScript (Vite), hosted on **Vercel**.
* **Backend:** FastAPI (Python 3.11+), Uvicorn ASGI server, containerized on **Render**.
* **Database:** Serverless PostgreSQL provisioned on **Neon**, accessed via SQLAlchemy ORM with resilient connection pooling (`pool_pre_ping`).
