import { users } from "../db/index.js";

export const getUsers = (req, res) => {
  res.send(users.get());
};

export const getUser = (req, res) => {
  const { id } = req.params;
  if (users.get(id)) res.send(users.get(id));
  else {
    res.status(204);
    res.send();
  }
};

export const deleteUser = (req, res) => {
  const { id } = req.params;
  // slett bruker i databasen
  if (users.delete(id)) {
    res.send(`Bruker med id ${id} ble fjernet fra databasen.`);
  }
};

export const createUser = (req, res) => {
  // post-data fra front end
  const formData = req.body;

  const user = {
    firstname: formData.firstname,
    lastname: formData.lastname,
    email: formData.email,
    password: formData.password,
    phone: formData.phone,
    isFirm: formData.isFirm == "true" ? true : false
  };

  // NEED TO REMOVE quotes FROM isFirm
  // create new user in db
  const newUser = users.create(user);
  // set status code if success
  res.status(newUser ? 201 : 500);
  res.setHeader("Content-Type", /json/);
  res.send(newUser);
};

// NEED FIX HERE
export const updateUser = (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email } = req.body;

  const user = users[id];

  if (firstname) user.firstname = firstname;
  if (lastname) user.lastname = lastname;
  if (email) user.email;
};
