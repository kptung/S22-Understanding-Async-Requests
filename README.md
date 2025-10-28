# Node.js Course - S22 Understanding Async Requests

Practice code for Section 22 - Understanding Async Requests, part of the course "NodeJS - The Complete Guide (MVC, REST APIs, GraphQL, Deno)" by Academind, Maximilian Schwarzmüller.

This project covers:
- Understanding asynchronous HTTP requests and how client-side JavaScript can communicate with a backend using `fetch()` and `res.json()`
- Recognizing when to use async requests _(e.g. deleting or updating resources dynamically without re-rendering page)_ versus traditional page reloads
- **Planning the transition toward **REST API** architecture:**
  - Future REST endpoints (`GET`, `POST`, `PATCH`, `DELETE`) will return JSON instead of rendered views  
  - MVC routes will remain temporarily for backward compatibility
  - Business logic will be refactored into shared model/service functions, reused by both MVC and REST routes
    
- **Understanding the long-term migration path:**
  - Maintain current MVC routes for stability
  - Add new `/api/...` REST endpoints returning JSON
  - Gradually update the frontend to use async `fetch()` requests
  - Remove legacy MVC routes once the full REST API is in place

> **Note:** The async request pattern _(e.g. deleting products via `fetch()` and dynamically updating the DOM)_ will be implemented and demonstrated in later course sections dedicated to **REST APIs**.

# Project type
- Independently implemented while following a Node.js course, writing all functionalities from scratch and extending the project with personal improvements.

## Tech Stack
- Node.js
- Express.js
- JavaScript (ES6+)
- MongoDB
- Mongoose
- express-session
- connect-mongodb-session
- multer
- pdfkit-table
- Nodemailer with SendGrid transport
- Docker
- dotenv
- chalk
- Nodemon
  
# How to Run

## 1) Clone the repo
```bash
git clone https://github.com/S22-Understanding-Async-Requests
cd ./S22-Understanding-Async-Requests
```

---

## 2) Environment variables

#### 2.1) Copy the example file
```bash
cp .env.example .env
```
> Note: Recommended and essential environment variable settings are described in `.env.example`

---

## 3) Run the app via Docker (already installed)

#### 1. Make sure your Docker app is running

#### 2. Install dependencies
   ```bash
   npm install
   ```

#### 3. Start MongoDB with Docker Compose
   ```bash
   npm run db:start
   ```
   - Creates database **`shop`**
> Runs `docker compose up -d`

#### 4. Run the app
```bash
node .\server.js
```

#### 5. Stop the container
   ```bash
   npm run db:down
   ```
> Runs `docker compose down -v`

#### 6. Reset database (remove data + re-run init scripts)
   ```bash
   npm run db:reset
   ```
> Runs `docker compose down -v && docker compose up -d`

---

## 4) Log in using example credentials

#### 1. Main user
```code
email: test@example.com
password: 123
```

#### 2. Second user
```code
email: foo@bar.com
password: 456
```

---

## Testing DB Connection
A helper script is included to quickly test DB connectivity

```bash
npm run db:test
```
> Runs `node scripts/test-db.js`

<br>Expected output:
```

===== DB connection OK =====

--- Product data: --- {
  products: [
    {
      _id: new ObjectId('68c5a0d9f45e62ed9233c5d3'),
      title: 'Physical Picture of a Kitty',
      price: 0.99,
      description: "10cm x 15cm picture of a kitty named 'Puszek'",
      imageUrl: 'images/kitty-image.jpg',
      userId: new ObjectId('68c59cebf2b7f6e17ff9ea08')
    },
    {
      _id: new ObjectId('68c32686af5c529e81421f78'),
      title: 'Chess Book',
      price: 12.99,
      description: "'My 60 Memorable Games', by Bobby Fischer",
      imageUrl: 'images/book-image.jpg',
      userId: new ObjectId('68c59cebf2b7f6e17ff9ea08')
    },

    // ...7 more sample products

    {
      _id: new ObjectId('68ffee030d8e212fc0fa3359'),
      title: 'Smartphone',
      price: 499.99,
      description: 'Latest model smartphone with high-res camera',
      imageUrl: 'images/smartphone-image.png',
      userId: new ObjectId('68c59cebf2b7f6e17ff9ea08')
    }
  ],
  paginationData: {
    currentPage: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    nextPage: 2,
    previousPage: 0,
    lastPage: NaN
  }
}

--- User data: --- [
  {
    cart: { items: [] },
    _id: new ObjectId('68c59cebf2b7f6e17ff9ea08'),
    email: 'test@example.com',
    password: '$2b$12$3K2ChFNft.k8lF4TShiRee6vOBnaSqC3gi81SNUDvMf.dhsf84zv.'
  },
  {
    cart: { items: [] },
    _id: new ObjectId('68c49525baa988da36319592'),
    email: 'foo@bar.com',
    password: '$2b$12$9FaAU/JXiYbJ6k3RuPM9pudnJkOPoQaF9BlF0exENihInyhR/6stK'
  }
]

```

---

## NPM Scripts

- **`npm start` / `node .\server.js`** → start the Node app
- **`npm run db:test`** → run DB connectivity test (`scripts/test-db.js`)
- **`npm run db:up`** → start MongoDB container
- **`npm run db:down`** → stop MongoDB container
- **`npm run db:reset`** → reset database (drop volume + re-init)

---

## Notes
- `.env` is ignored by Git; only `.env.example` is committed
- If port 3000 is already in use, change the `SERVER_PORT` value in `.env`
- Recommended and essential environment variable settings are described in `.env.example`
- Email functionality will not work out of the box. To enable email sending, you need to create your own SendGrid account and provide an API key + Sender Email in your `.env`
- The async request pattern _(e.g. deleting products via `fetch()` and dynamically updating the DOM)_ will be implemented and demonstrated in later course sections dedicated to **REST APIs**.

---

## IMPORTANT - About `csurf`

<details>
  <summary>My note about csurf deprecation</summary>
  
<br>
<b>I know that <code>csurf</code> has been marked as deprecated.</b>
<br><br>
This Node.js course was created a few years ago using <code>csurf</code>, before the development team deprecated this package. Maximillian explained the general principle of CSRF attacks and used <code>csurf</code> for demonstration purposes.
<br><br>
Since the attacks are only simulated locally in our code and this is a course repository after all <i>(though I put my heart into every single one of them)</i>, I will continue using <code>csurf</code> until I decide otherwise.

</details>
