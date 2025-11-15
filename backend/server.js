const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');


//Server.use(middlewares)

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));   

const db = mysql.createConnection({
  user: 'root',
  host: 'localhost',
  password: '',
  database: 'dentiste'
});

//verserment du de imae dans le fichier
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
const JWT_SECRET = 'votre_cle_super_secrete_123';

//  JWT affectation du donne
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: 'Token invalide' });
    req.user = decoded;
    next();
  });
};


//---------------------INSCRIPTION------------------------

//chargement de l'image das un fichier
app.post('/upload-profile-image', verifyToken, 
  upload.single('profileImage'), (req, res) => {
  if (!req.file) return res.status(400).send({ message: 'Aucune image' });

  const imageUrl = `http://localhost:3002/uploads/${req.file.filename}`;

  const SQL = 'UPDATE users SET profileImage = ? WHERE id = ?';
  db.query(SQL, [imageUrl, req.user.id], (err) => {
    if (err) return res.status(500).send({ message: 'Erreur mise à jour' });
    res.send({ profileImage: imageUrl });
  });
});


// profil affic
app.post('/Profil', verifyToken, (req, res) => {
   const SQL = 'SELECT username, email, profileImage FROM users WHERE id = ?';
    db.query(SQL, [req.user.id], 
  (err, results) => { if (err || results.length === 0) {
     return res.status(404)
     .send({ message: 'Utilisateur non trouvé' }); } 
     res.send(results[0]) })
});

app.post('/AdminProfil', verifyToken, (req, res) => {
   const SQL = 'SELECT username, email,password  FROM users WHERE role = "admin" ';
    db.query(SQL, [req.user.admin], 
  (err, results) => { if (err || results.length === 0) {
     return res.status(404)
     .send({ message: 'Utilisateur non trouvé' }); } 
     res.send(results[0]) })
});

// inscription
app.post('/Inscription', async (req, res) => {
  const { Username, Email, Password } = req.body;

  if (!Username || !Email || !Password) {
    return res.status(400).send({ message: 'Tous les champs sont requis' });
  }

  const hashedPassword = await bcrypt.hash(Password, 10);
   const role = 'dentiste';

  const SQL = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(SQL, [Username, Email, hashedPassword, role], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).send({ message: 'Utilisateur ou email déjà utilisé' });
      }
      return res.status(500).send({ message: 'Erreur serveur', error: err });
    }
    res.send({ message: 'Inscription réussie' });
  });
});

// connexiom
app.post('/Connexion', (req, res) => {
  const { Username, Password } = req.body;
  const SQL = 'SELECT * FROM users WHERE username = ?';
  
  db.query(SQL, [Username], async (err, results) => {
    if (err) return res.status(500).send({ message: 'Erreur serveur' });
    if (results.length === 0) return res.status(401).send({ message: 'Utilisateur non trouvé' });

    const user = results[0];  
    const match = await bcrypt.compare(Password, user.password);
    
    if (!match) return res.status(401).send({ message: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.send({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || null
      }
    });
  });
});

             
//-----------------------CRUD--------------------------------------------


// affichage cod

app.get("/ListeDentistes", (req, res) => {
  const { region } = req.query;

  let SQL = `
    SELECT 
      p.Nom, p.Prenom, p.genre, p.Adresse, 
      p.NumOrdre, p.Titre, p.Domaine, p.Region,
      u.email, u.profileImage
    FROM profil p
    INNER JOIN users u ON p.users_id = u.id
  `;

  const params = [];

  if (region && region.trim() !== "") {
    SQL += " WHERE p.Region = ?";
    params.push(region);
  }

  db.query(SQL, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage });
    }
    res.json(result);
  });
});

app.get("/ListeDentiste2", (req, res) => {
  const { region } = req.query;

  let SQL = `
    SELECT 
      p.Nom, p.Prenom, p.genre, p.Adresse, 
      p.NumOrdre, p.Titre, p.Domaine, p.Region,
      u.email, u.profileImage
    FROM profil p
    INNER JOIN users u ON p.users_id = u.id
  `;

  const params = [];

  if (region && region.trim() !== "") {
    SQL += " WHERE p.Region = ?";
    params.push(region);
  }

  db.query(SQL, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage });
    }
    res.json(result);
  });
});

app.get("/AdminListe", (req, res) => {
  const { region } = req.query;

  let SQL = `
    SELECT 
      p.Nom, p.Prenom, p.genre, p.Adresse, 
      p.NumOrdre, p.Titre, p.Domaine, p.Region,
      u.email, u.profileImage
    FROM profil p
    INNER JOIN users u ON p.users_id = u.id
  `;

  const params = [];

  if (region && region.trim() !== "") {
    SQL += " WHERE p.Region = ?";
    params.push(region);
  }

  db.query(SQL, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Erreur de lecture", details: err.sqlMessage });
    }
    res.json(result);
  });
});

app.post('/Profil', verifyToken, (req, res) => {
  const SQL = `
    SELECT 
      u.username, u.email, u.profileImage,
      p.Nom, p.Prenom, p.Date, p.Lieu, p.genre, p.Adresse,
      p.Contact, p.AutreContact, p.NumOrdre, p.Titre, p.Domaine, p.Region
    FROM users u
    INNER JOIN profil p ON u.id = p.users_id
    WHERE u.id = ?;
  `;
  db.query(SQL, [req.user.id], (err, result) => {
    if (err) return res.status(500).send({ message: "Erreur serveur.", details: err.sqlMessage });
    if (!result[0]) return res.status(404).send({ message: "Profil non trouvé." });

    // renvoie un seul objet
    res.json(result[0]);
  });
});


// ajout profil lié à l'utilisateur connecté
app.post('/Ajouter', verifyToken, (req, res) => {
  const userId = req.user.id;
  const {
    Nom, Prenom, Date, Lieu, genre, Adresse,
    NumOrdre, Contact, AutreContact, Titre, Domaine, Region
  } = req.body;

  if (!Nom || !Prenom || !Date || !Lieu || !genre || !Adresse || !NumOrdre || !Contact || !AutreContact  || !Titre || !Domaine || !Region) {
    return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis" });
  }

  const SQL = `
    INSERT INTO profil (
      users_id, Nom, Prenom, Date, Lieu, genre, Adresse,
      NumOrdre, Contact, AutreContact, Titre, Domaine, Region
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    userId, Nom, Prenom, Date, Lieu, genre, Adresse,
    NumOrdre, Contact, AutreContact, Titre, Domaine, Region
  ];

  db.query(SQL, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Profil déjà existant' });
      }
      return res.status(500).json({ message: 'Erreur lors de l\'ajout', details: err.sqlMessage });
    }
    res.json({ message: 'Profil ajouté avec succès' });
  });
});

//modification
app.put('/Modifier/:id', (req, res) => {
  const  Values = {
    nom, prenom, date, lieu, genre,adresse, numordre,
    contact, autreContact, titre, domaine, region
  } = req.body;
  const SQL = `
    UPDATE  profil SET Nom=? ,Prenom=?, Date=?
     Lieu=? , genre=? ,Adresse=? , NumOrdre=?, Contact=?, AutreContact=?, 
           Titre=?, Domaine=?, Region=?, profileImage=?  WHERE id =? `;
    
const id = req.params.id; 
         db.query(SQL, [...Values,id], (err, result) => {
    if (err) 
      return res.status(500).json({ message: 'Erreur de lecture', 
     details: err.sqlMessage });
    if (result.length === 0) 
       return res.status(404).json({ message: 'Profil non trouvé' });
    res.json(result[0]); 
  });
});

//---------Mot de passe oublier
app.post("/MotPasseOublier", async(req, res) =>{

  const {email}= req.body;
try{
  const oldUser = await user.findOne((email));

    if(!oldUser){
      return res.json({status : "L'utiisateur n'exitse pas"})
    }
const secret = JWT_SECRET + oldUser.password;
const token = jwt.sign({email: oldUser.email , 
  id : oldUser._id},secret,{
    expiresIn :'5m'
});
   const link = 'http://localhost:3002/AvoirPassword/${oldUser._id}/${token}';
console.log(link)

  } catch (error) {}
});

app.get('/ResetPassword/:id/:token', async (req, res) => {
  const { id, token } = req.params;
  console.log(req.params);

  // Vérifier si l'utilisateur existe
  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "Utilisateur non existant" });
  }

  // Générer la clé secrète personnalisée
  const secret = JWT_SECRET + oldUser.password;

  try {
    const verify = jwt.verify(token, secret);
    res.send("Votre email a été vérifié");
  } catch (error) {
    console.error(error);
    res.send("Échec de la vérification du token");
  }
});



// ========== Statistiques
const handleStats = async (res, operation, errorMessage) => {
  try {
    const results = await operation;
    res.json(results);
  } catch (error) {
    res.status(500).json(error);
  }
};

app.get("/Statistiques/region", async (req, res) => {
  await handleStats(
    res,
    StatsService.getStatsByField(db, 'Region', "Erreur statistiques régions"),
    "Erreur statistiques régions"
  );
});

app.get("/Statistiques/titre", async (req, res) => {
  await handleStats(
    res,
    StatsService.getStatsByField(db, 'Titre', "Erreur statistiques titres"),
    "Erreur statistiques titres"
  );
});

app.get("/Statistiques/domaine", async (req, res) => {
  await handleStats(
    res,
    StatsService.getStatsByField(db, 'Domaine', "Erreur statistiques domaines"),
    "Erreur statistiques domaines"
  );
});

app.get("/Statistiques/total", async (req, res) => {
  await handleStats(
    res,
    StatsService.getTotalCount(db),
    "Erreur statistiques total"
  );
});


app.listen(3002, () => {
  console.log('Serveur sur http://localhost:3002');
});

// Route unique pour toutes les statistiques par champ
// app.get("/Statistiques/:type", async (req, res) => {
//   const { type } = req.params;
//   const allowedTypes = ['region', 'titre', 'domaine', 'total'];
  
//   if (!allowedTypes.includes(type)) {
//     return res.status(400).json({ message: "Type de statistique non valide" });
//   }

//   try {
//     let results;
//     if (type === 'total') {
//       results = await StatsService.getTotalCount(db);
//     } else {
//       const fieldMap = {
//         'region': 'Region',
//         'titre': 'Titre', 
//         'domaine': 'Domaine'
//       };
//       results = await StatsService.getStatsByField(
//         db, 
//         fieldMap[type], 
//         `Erreur statistiques ${type}`
//       );
//     }
//     res.json(results);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// });