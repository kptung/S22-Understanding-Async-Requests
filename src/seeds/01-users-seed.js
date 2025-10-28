db = db.getSiblingDB("shop");

// * hashed "123" string
const hashedPwd1 =
  "$2b$12$3K2ChFNft.k8lF4TShiRee6vOBnaSqC3gi81SNUDvMf.dhsf84zv.";

// * hashed "456" string
const hashedPwd2 =
  "$2b$12$9FaAU/JXiYbJ6k3RuPM9pudnJkOPoQaF9BlF0exENihInyhR/6stK";

db.users.insertMany([
  {
    _id: ObjectId("68c59cebf2b7f6e17ff9ea08"),
    // name: "Igor",
    email: "test@example.com",
    password: hashedPwd1,
    cart: {
      items: [],
    },
  },
  {
    _id: ObjectId("68c49525baa988da36319592"),
    // name: "Ben",
    email: "foo@bar.com",
    password: hashedPwd2,
    cart: {
      items: [],
    },
  },
]);
