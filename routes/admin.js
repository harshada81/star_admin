const path = require("path");
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const nodemailer = require('nodemailer');
var exe = require("./../connection");
var router = express.Router();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'harshadakedare81@gmail.com',
      pass: 'mcxp rlcf jmyp yvcg'
    }
  });
  
 




// ✅ Middleware to check if admin is authenticated
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/profile"); // Redirect to login if not authenticated
    }
    next();
};

// ✅ Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/"); // Save images in /public/uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only images (JPG, PNG, GIF) are allowed"));
        }
    },
});

// ✅ Route: Show Admin Profile Page
router.get("/profile", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;

        // Fetch admin details from DB
        const [admin] = await db.execute(
            "SELECT name, email, bio, profile_picture FROM users WHERE id = ?",
            [userId]
        );

        if (admin.length === 0) {
            return res.status(404).send("User not found");
        }

        res.render("admin/profile", { admin: admin[0] }); // Pass user data to EJS
    } catch (error) {
        console.error("Error fetching admin details:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ Route: Update Admin Profile
router.post("/profile", isAuthenticated, upload.single("picture"), async (req, res) => {
    try {
        const { name, bio, email } = req.body;
        const userId = req.session.userId;
        let profile_picture = req.file ? `/uploads/${req.file.filename}` : null;

        // Update database (prevent email modification)
        const updateQuery = `
            UPDATE users 
            SET name = ?, bio = ?, profile_picture = COALESCE(?, profile_picture), updated_at = NOW() 
            WHERE id = ? AND email = ?
        `;
        const values = [name, bio, profile_picture, userId, email];

        await db.execute(updateQuery, values);

        res.redirect("/profile"); // Redirect after update
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).send("Internal Server Error");
    }
});











  // Forgot Password Route
  router.get('/forgot_password', (req, res) => {
    res.send('<form action="/admin/send-otp" method="POST"><input type="email" name="email" required><input type="submit" value="Send OTP"></form>');
  });
  
  // Send OTP Route
  router.post("/send-otp",async(req, res) => {
    const email = req.body.email;
  
    // Check if email exists
    await exe(`SELECT * FROM login WHERE email = ?`, [email],(err, results) =>{
      if (err){
        return res.status(500).send('database error');
      }
  
        if (results.length > 0) {
          const otp = Math.floor(1000 + Math.random() * 9000); // Generate OTP
          req.session.otp = otp;
          req.session.email = email;
  
          // Email Options
          const mailOptions = {
            from: 'harshadakedare81@gmail.com',
            to: 'bhausahebnamdevkedare1977@gmail.com', // Send OTP to user's email
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`,
          };
  
          // Send Email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email:", error);
              return res.status(500).send("Error sending email");
            } else {
              res.send('<form action="/admin/verify-otp" method="POST"><input type="text" name="otp" required><input type="submit" value="Verify OTP"></form>'
              );
            }
          });
  
        } else {
          res.status(404).send("Email not found");
        }
      })
      .catch((err) => res.status(500).send("Database error"));
  });
  // Verify OTP Route
  router.post('/verify-otp', (req, res) => {
    const otp = req.body.otp;
  
    if (otp == req.session.otp) {
      res.send('<form action="/admin/set-new-password" method="POST"><input type="password" name="new_password" required placeholder="New Password"><input type="password" name="confirm_password" required placeholder="Confirm Password"><input type="submit" value="Reset Password"></form>');
    } else {
      res.status(400).send('Invalid OTP');
    }
  });
  router.post('/set-new-password',async (req, res) => {
    const newPassword = req.body.new_password;
    const confirmPassword = req.body.confirm_password;
  
    if (newPassword === confirmPassword) {
      const email = req.session.email;
  
      // Update password in the database
      data = await exe('UPDATE login SET password = ? WHERE email = ?', [newPassword, email], (err, results) => {
        if (err) {
          return res.status(500).send('Database error');
        }
  
        res.send('Password updated successfully. <a href="/admin">Go to Login</a>');
      });
    } else {
      res.status(400).send('Passwords do not match');
    }
  });
 



  
  router.get('/',function(req, res){

    var obj = {
        "login" : ((req.session.user_id) ? true : false),
    }
    res.render("admin/login.ejs",obj)
});

router.post('/procid_login',async function(req,res){
    // res.send (req.body)
    var d = req.body;
    var sql = `SELECT * FROM login WHERE email = ? AND password = ?`;
    var data = await exe(sql,[d.email,d.passworsd]);
    res.redirect('/admin/index');

})
  
  router.get("/index",function(req,res){
    res.render("admin/index.ejs");
  });

  router.get('/logout',  function (req, res, next)  {
    if (req.session) {
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/admin/login');
        }
      });
    }
});

    router.get("/profile",function(req,res){
        res.render("admin/profile.ejs");
      });
    
    






// Sliders
router.get("/slider", async function (req, res) {
    var slider = await exe("SELECT * FROM slider");
    res.render("admin/slider.ejs", { slider });
});


router.post("/save_slider", async function (req, res) {
    var img1 = "", img2 = "", img3 = "";

    if (req.files) {
        if (req.files.img1) {
            img1 = Date.now() + "_" + req.files.img1.name;
            req.files.img1.mv("public/admin_assets/" + img1);
        }
        if (req.files.img2) {
            img2 = Date.now() + "_" + req.files.img2.name;
            req.files.img2.mv("public/admin_assets/" + img2);
        }
        if (req.files.img3) {
            img3 = Date.now() + "_" + req.files.img3.name;
            req.files.img3.mv("public/admin_assets/" + img3);
        }
    }

    var d = req.body;
    var sql = `INSERT INTO slider (text1, text2, text3, img1, img2, img3) VALUES (?, ?, ?, ?, ?, ?)`;
    await exe(sql, [d.text1, d.text2, d.text3, img1, img2, img3]);

    res.redirect("/admin/slider");
});


router.get("/edit_slider/:id", async function (req, res) {
    var id = req.params.id;
    var data = await exe(`SELECT * FROM slider WHERE slider_id = ${id}`);
    
    if (data.length > 0) {
        res.render("admin/edit_slider.ejs", { slider: data[0] });
    } else {
        res.redirect("/admin/slider");
    }
});


router.post("/update_slider", async function (req, res) {
    try {
        var d = req.body;
        var id = req.body.slider_id;

        
        ["text1", "text2", "text3"].forEach(field => {
            if (d[field]) d[field] = d[field].replace(/'/g, "\\'");
        });

     
        var img1 = d.existing_img1;
        var img2 = d.existing_img2;
        var img3 = d.existing_img3;

        if (req.files) {
            if (req.files.img1) {
                img1 = Date.now() + "_" + req.files.img1.name;
                req.files.img1.mv("public/admin_assets/" + img1);
            }
            if (req.files.img2) {
                img2 = Date.now() + "_" + req.files.img2.name;
                req.files.img2.mv("public/admin_assets/" + img2);
            }
            if (req.files.img3) {
                img3 = Date.now() + "_" + req.files.img3.name;
                req.files.img3.mv("public/admin_assets/" + img3);
            }
        }

      
        var sql = `UPDATE slider SET text1=?, text2=?, text3=?, img1=?, img2=?, img3=? WHERE slider_id=?`;
        await exe(sql, [d.text1, d.text2, d.text3, img1, img2, img3, id]);

        res.redirect("/admin/slider");
    } catch (err) {
        console.error("Error updating slider:", err);
        res.send("Invalid Data");
    }
});

router.get("/delete_slider/:id", async function (req, res) {
    var id = req.params.id;
    var sql = `DELETE FROM slider WHERE slider_id = ?`;
    await exe(sql, [id]);
    res.redirect("/admin/slider");
});









// Home In About
router.get("/about", async function (req, res) {
    var sql = "SELECT * FROM about_us";
    try {
        var about = await exe(sql); 
        res.render("admin/about_us.ejs", { about }); 
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error fetching data");
    }
});



router.post("/save_about", async function (req, res) {
    var image = "";

   
    if (req.files && req.files.image) {
        image = new Date().getTime() + req.files.image.name;
        req.files.image.mv("public/admin_assets/" + image);
    }

    var d = req.body;
    var sql = `INSERT INTO about_us (heading, details, image) VALUES ('${d.heading}', '${d.details}', '${image}')`;
    
    try {
        await exe(sql);
        res.redirect("/admin/about");
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error saving data");
    }
});


router.get("/delete_about/:id", async function (req, res) {
    var sql =`DELETE FROM about_us WHERE id = ${req.params.id}`;

    try {
        await exe(sql);
        res.redirect("/admin/about");
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error deleting entry");
    }
});


router.get("/edit_about/:id", async function (req, res) {
    var sql = `SELECT * FROM about_us WHERE id = ${req.params.id}`;

    try {
        var about = await exe(sql);
        res.render("admin/edit_about.ejs", { about: about[0] });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error fetching entry for edit");
    }
});




router.post("/update_about/:id", async function (req, res) {
    try {
        var d = req.body;
        var id = req.params.id;

       
        var existingData = await exe(`SELECT image FROM about_us WHERE id = ${id}`);
        var existingImage = existingData.length > 0 ? existingData[0].image : "";

       
        var image = existingImage;

        
        if (req.files && req.files.image) {
            image = Date.now() + "_" + req.files.image.name;
            let uploadPath = path.join(__dirname, "../public/admin_assets/", image);
            await req.files.image.mv(uploadPath);
        }

       
        var sql = `UPDATE about_us SET heading=?, details=?, image=? WHERE id=?`;
        await exe(sql, [d.heading, d.details, image, id]);

        res.redirect("/admin/about");
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error updating entry");
    }
});



// Home In service

router.get("/services", async function (req, res) {
    var services = await exe("SELECT * FROM services");
    res.render("admin/services.ejs", { services });
});
router.post("/save_service", async function (req, res) {
    var d = req.body;
    var sql = `INSERT INTO services (title, description, icon) VALUES (?, ?, ?)`;
    await exe(sql, [d.title, d.description, d.icon]);
    res.redirect("/admin/services");
});





router.get("/edit_service/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var data = await exe("SELECT * FROM services WHERE id = ?", [id]);
        
        if (data.length > 0) {
            res.render("admin/edit_service.ejs", { service: data[0] });
        } else {
            res.redirect("/admin/services");
        }
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error fetching service data");
    }
});


router.post("/update_service", async function (req, res) {
    try {
        var d = req.body;
        var id = d.service_id; 
        if (!id) {
            throw new Error("Missing service ID");
        }

        var sql = "UPDATE services SET title=?, description=?, icon=? WHERE id=?";
        await exe(sql, [d.title, d.description, d.icon, id]);

        res.redirect("/admin/services");
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error updating service");
    }
});



router.get("/delete_service/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var sql = "DELETE FROM services WHERE id = ?";
        await exe(sql, [id]);
        res.redirect("/admin/services");
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error deleting service");
    }
});



// Home In spaecialists
router.get("/specialists", async function (req, res) {
    try {
        var specialists = await exe("SELECT * FROM specialists");
        console.log("Request received for specialists");
        res.render("admin/specialists.ejs", { specialists });
    } catch (err) {
        console.error("Error fetching specialists:", err);
        res.status(500).send("Error fetching specialists.");
    }
});


router.post("/save_specialist", async function (req, res) {
    try {
        var img = "";
        
        if (req.files && req.files.img) {
            img = new Date().getTime() + req.files.img.name;
            req.files.img.mv("public/admin_assets/" + img);
        }

        var d = req.body;
        var sql = `INSERT INTO specialists (name, specialty, qualification, image) VALUES (?,?,?,?)`;
        await exe(sql, [d.name, d.specialty, d.qualification, img]);

        res.redirect("/admin/specialists"); 
    } catch (err) {
        console.error("Error saving specialist:", err);
        res.status(500).send("Error saving specialist.");
    }
});


router.get("/edit_specialist/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var data = await exe("SELECT * FROM specialists WHERE id = ?", [id]);

        if (data.length > 0) {
            res.render("admin/edit_specialist.ejs", { specialist: data[0] });
        } else {
            res.redirect("/admin/specialists");
        }
    } catch (err) {
        console.error("Error fetching specialist:", err);
        res.status(500).send("Error fetching specialist.");
    }
});


router.post("/update_specialist/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var d = req.body;

        var img = d.old_img;
        if (req.files && req.files.img) {
            img = new Date().getTime() + req.files.img.name;
            req.files.img.mv("public/admin_assets/" + img);
        }

        var sql = `UPDATE specialists SET name=?, specialty=?, qualification=?, image=? WHERE id=?`;
        await exe(sql, [d.name, d.specialty, d.qualification, img, id]);

        res.redirect("/admin/specialists");
    } catch (err) {
        console.error("Error updating specialist:", err);
        res.status(500).send("Error updating specialist.");
    }
});


router.get("/delete_specialist/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var sql = `DELETE FROM specialists WHERE id = ?`;
        await exe(sql, [id]);
        res.redirect("/admin/specialists");
    } catch (err) {
        console.error("Error deleting specialist:", err);
        res.status(500).send("Error deleting specialist.");
    }
});



//  IN HOME article

router.get("/articles", async (req, res) => {
    try {
        var articles = await exe("SELECT * FROM article ORDER BY id DESC");
        res.render("admin/articles.ejs", { articles });
    } catch (err) {
        console.error("Error fetching articles:", err);
        res.status(500).send("Error fetching articles.");
    }
});

router.post("/save_article", async (req, res) => {
    try {
        var image = "";

        if (req.files && req.files.image) {
            image = new Date().getTime() + req.files.image.name;
            req.files.image.mv("public/admin_assets/" + image);
        }

        var d = req.body;
        var sql = `INSERT INTO article (image, title, category, date, content) VALUES (?, ?, ?, ?, ?)`;
        await exe(sql, [image, d.title, d.category, d.date, d.content]);

        res.redirect("/admin/articles");
    } catch (err) {
        console.error("❌ Error saving article:", err);
        res.status(500).send("Error saving article.");
    }
});


router.get("/edit_article/:id", async (req, res) => {
    try {
        var id = req.params.id;
        var data = await exe(`SELECT * FROM article WHERE id = ?`, [id]);

        if (data.length > 0) {
            res.render("admin/edit_article.ejs", { article: data[0] });
        } else {
            res.redirect("/admin/articles");
        }
    } catch (err) {
        console.error("❌ Error fetching article:", err);
        res.status(500).send("Error fetching article.");
    }
});
router.post("/update_article/:id", async (req, res) => {
    try {
        var id = req.params.id;
        var d = req.body;
        var image = d.old_image; 

        if (req.files && req.files.image) {
            image = new Date().getTime() + req.files.image.name;
            req.files.image.mv("public/admin_assets/" + image);
        }

        var sql = `UPDATE article SET image = ?, title = ?, category = ?, date = ?, content = ? WHERE id = ?`;
        await exe(sql, [image, d.title, d.category, d.date, d.content, id]);

        res.redirect("/admin/articles");
    } catch (err) {
        console.error("❌ Error updating article:", err);
        res.status(500).send("Error updating article.");
    }
});
router.get("/delete_article/:id", async (req, res) => {
    try {
        var id = req.params.id;
        await exe(`DELETE FROM article WHERE id = ?`, [id]);

        res.redirect("/admin/articles");
    } catch (err) {
        console.error("❌ Error deleting article:", err);
        res.status(500).send("Error deleting article.");
    }
});




// router.get("/reviews", (req, res) => {
//     res.render("admin/reviews.ejs");
// });


router.get("/reviews", (req, res) => {
  const sql = "SELECT * FROM client_reviews ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.render("reviews", { reviews: results });
  });
});







// About Page
router.get("/about_info", async function (req, res) {
    try {
        var about = await exe("SELECT * FROM about_info");
        console.log("Request received for about_info");
        res.render("admin/about_info.ejs", { about }); 
    } catch (err) {
        console.error("Error fetching about_info:", err);
        res.status(500).send("Error fetching about_info.");
    }
});


router.post("/save_about_info", async function (req, res) {
    try {
        var d = req.body;
        var sql = `INSERT INTO about_info (title, description) VALUES ('${d.title}', '${d.description}')`;
        await exe(sql); 

        res.redirect("/admin/about_info"); 
    } catch (err) {
        console.error("Error saving about_info:", err);
        res.status(500).send("Error saving about_info.");
    }
});



router.get("/edit_about_info/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var data = await exe(`SELECT * FROM about_info WHERE id = ${id}`);

        if (data.length > 0) {
            res.render("admin/edit_about_info.ejs", { about: data[0] });
        } else {
            res.redirect("/admin/about_info");
        }
    } catch (err) {
        console.error("Error fetching about_info:", err);
        res.status(500).send("Error fetching about_info.");
    }
});


router.post("/update_about_info/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var d = req.body;

        var sql = `UPDATE about_info SET title='${d.title}', description='${d.description}' WHERE id=${id}`;
        await exe(sql);

        res.redirect("/admin/about_info");
    } catch (err) {
        console.error("Error updating about_info:", err);
        res.status(500).send("Error updating about_info.");
    }
});


router.get("/delete_about_info/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var sql = `DELETE FROM about_info WHERE id = ${id}`;
        await exe(sql);
        res.redirect("/admin/about_info");
    } catch (err) {
        console.error("Error deleting about_info:", err);
        res.status(500).send("Error deleting about_info.");
    }
});




// About page in doctor

router.get("/doctors", async function (req, res) {
    try {
        var doctors = await exe("SELECT * FROM doctors");
        console.log("Request received for doctors");
        res.render("admin/doctors.ejs", { doctors });
    } catch (err) {
        console.error("Error fetching doctors:", err);
        res.status(500).send("Error fetching doctors.");
    }
});




router.post("/save_doctor", async function (req, res) {
    try {
        var d = req.body;
        var img = "";

        if (req.files && req.files.image) {
            img = new Date().getTime() + req.files.image.name;
            req.files.image.mv("public/admin_assets/" + img);
        }

        var sql = `INSERT INTO doctors (name, title, description, image) VALUES ('${d.name}', '${d.title}', '${d.description}', '${img}')`;
        await exe(sql);

        res.redirect("/admin/doctors"); 
    } catch (err) {
        console.error("Error saving doctor:", err);
        res.status(500).send("Error saving doctor.");
    }
});

router.get("/edit_doctor/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var data = await exe(`SELECT * FROM doctors WHERE id = ${id}`);

        if (data.length > 0) {
            res.render("admin/edit_doctor.ejs", { doctor: data[0] });
        } else {
            res.redirect("/admin/doctors");
        }
    } catch (err) {
        console.error("Error fetching doctor:", err);
        res.status(500).send("Error fetching doctor.");
    }
});

router.post("/update_doctor/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var d = req.body;
        var img = d.old_image; 

        if (req.files && req.files.image) {
            img = new Date().getTime() + req.files.image.name;
            req.files.image.mv("public/admin_assets/" + img);
        }

        var sql = `UPDATE doctors SET name='${d.name}', title='${d.title}', description='${d.description}', image='${img}' WHERE id=${id}`;
        await exe(sql);

        res.redirect("/admin/doctors");  
    } catch (err) {
        console.error("Error updating doctor:", err);
        res.status(500).send("Error updating doctor.");
    }
});

router.get("/delete_doctor/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var sql = `DELETE FROM doctors WHERE id = ${id}`;
        await exe(sql);
        res.redirect("/admin/doctors"); 
    } catch (err) {
        console.error("Error deleting doctor:", err);
        res.status(500).send("Error deleting doctor.");
    }
});





router.get("/mission_vision", async function (req, res) {
    try {
        var mission_vision = await exe("SELECT * FROM mission_vision");
        console.log("Request received for mission_vision");
        res.render("admin/mission_vision.ejs", { mission_vision });
    } catch (err) {
        console.error("Error fetching mission_vision:", err);
        res.status(500).send("Error fetching mission_vision.");
    }
});


router.get("/mission_vision/new", function (req, res) {
    res.render("admin/add_mission_vision.ejs");
});


router.post("/save_mission_vision", async function (req, res) {
    try {
        var d = req.body;
        var sql = `INSERT INTO mission_vision (type, title, description) VALUES ('${d.type}', '${d.title}', '${d.description}')`;
        await exe(sql);

        res.redirect("/admin/mission_vision"); 
    } catch (err) {
        console.error("Error saving mission_vision:", err);
        res.status(500).send("Error saving mission_vision.");
    }
});


router.get("/edit_mission_vision/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var data = await exe(`SELECT * FROM mission_vision WHERE id = ${id}`);

        if (data.length > 0) {
            res.render("admin/edit_mission_vision.ejs", { mission_vision: data[0] });
        } else {
            res.redirect("/admin/mission_vision");
        }
    } catch (err) {
        console.error("Error fetching mission_vision:", err);
        res.status(500).send("Error fetching mission_vision.");
    }
});


router.post("/update_mission_vision/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var d = req.body;

        var sql = `UPDATE mission_vision SET type='${d.type}', title='${d.title}', description='${d.description}' WHERE id=${id}`;
        await exe(sql);

        res.redirect("/admin/mission_vision");
    } catch (err) {
        console.error("Error updating mission_vision:", err);
        res.status(500).send("Error updating mission_vision.");
    }
});


router.get("/delete_mission_vision/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var sql = `DELETE FROM mission_vision WHERE id = ${id}`;
        await exe(sql);
        res.redirect("/admin/mission_vision");
    } catch (err) {
        console.error("Error deleting mission_vision:", err);
        res.status(500).send("Error deleting mission_vision.");
    }
});





// services

router.get("/services_org", async function (req, res) {
    try {
        var services = await exe("SELECT * FROM services_org");
        res.render("admin/services_org.ejs", { services });
    } catch (err) {
        console.error("Error fetching services:", err);
        res.status(500).send("Error fetching services.");
    }
});


router.get("/services_org/new", function (req, res) {
    res.render("admin/add_service_org.ejs");
});

router.post("/save_service_org", async function (req, res) {
    try {
        var img1 = "", img2 = "", img3 = "";

        if (req.files) {
            if (req.files.image1) {
                img1 = new Date().getTime() + req.files.image1.name;
                req.files.image1.mv("public/admin_assets/" + img1);
            }
            if (req.files.image2) {
                img2 = new Date().getTime() + req.files.image2.name;
                req.files.image2.mv("public/admin_assets/" + img2);
            }
            if (req.files.image3) {
                img3 = new Date().getTime() + req.files.image3.name;
                req.files.image3.mv("public/admin_assets/" + img3);
            }
        }

        var d = req.body;
        var sql = `INSERT INTO services_org (image1, image2, image3, title1, title2, title3, description1, description2, description3) 
                   VALUES ('${img1}', '${img2}', '${img3}', '${d.title1}', '${d.title2}', '${d.title3}', '${d.description1}', '${d.description2}', '${d.description3}')`;
        await exe(sql);

        res.redirect("/admin/services_org");
    } catch (err) {
        console.error("Error saving service:", err);
        res.status(500).send("Error saving service.");
    }
});


router.get("/edit_service_org/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var data = await exe(`SELECT * FROM services_org WHERE id = ${id}`);

        if (data.length > 0) {
            res.render("admin/edit_service_org.ejs", { service: data[0] });
        } else {
            res.redirect("/admin/services_org");
        }
    } catch (err) {
        console.error("Error fetching service:", err);
        res.status(500).send("Error fetching service.");
    }
});


router.post("/update_service_org/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var d = req.body;
        var img1 = d.old_image1, img2 = d.old_image2, img3 = d.old_image3; 

        if (req.files) {
            if (req.files.image1) {
                img1 = new Date().getTime() + req.files.image1.name;
                req.files.image1.mv("public/admin_assets/" + img1);
            }
            if (req.files.image2) {
                img2 = new Date().getTime() + req.files.image2.name;
                req.files.image2.mv("public/admin_assets/" + img2);
            }
            if (req.files.image3) {
                img3 = new Date().getTime() + req.files.image3.name;
                req.files.image3.mv("public/admin_assets/" + img3);
            }
        }

        var sql = `UPDATE services_org SET image1='${img1}', image2='${img2}', image3='${img3}', 
                   title1='${d.title1}', title2='${d.title2}', title3='${d.title3}', 
                   description1='${d.description1}', description2='${d.description2}', description3='${d.description3}' WHERE id=${id}`;
        await exe(sql);

        res.redirect("/admin/services_org");
    } catch (err) {
        console.error("Error updating service:", err);
        res.status(500).send("Error updating service.");
    }
});


router.get("/delete_service_org/:id", async function (req, res) {
    try {
        var id = req.params.id;
        var sql = `DELETE FROM services_org WHERE id = ${id}`;
        await exe(sql);
        res.redirect("/admin/services_org");
    } catch (err) {
        console.error("Error deleting service:", err);
        res.status(500).send("Error deleting service.");
    }
});










router.get("/ambulance", async function (req, res) {
    try {
        var sql = "SELECT * FROM ambulances";
        var ambulances = await exe(sql);
        res.render("admin/ambulance.ejs", { ambulances });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error fetching ambulance data");
    }
});


router.post("/save_ambulance", async function (req, res) {
    try {
        var image = "";

 
        if (req.files && req.files.image) {
            image = Date.now() + "_" + req.files.image.name;
            let uploadPath = path.join(__dirname, "../public/admin_assets", image);
            await req.files.image.mv(uploadPath);
        }

        var d = req.body;
        var sql = `INSERT INTO ambulances (name, contact_number, service_type, description, image) VALUES (?, ?, ?, ?, ?)`;
        await exe(sql, [d.name, d.contact_number, d.service_type, d.description, image]);

        res.redirect("/admin/ambulance");
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error saving ambulance entry");
    }
});


router.get("/edit_ambulance/:id", async function (req, res) {
    try {
        var sql = "SELECT * FROM ambulances WHERE id = ?";
        var ambulance = await exe(sql, [req.params.id]);

        if (ambulance.length > 0) {
            res.render("admin/edit_ambulance.ejs", { ambulance: ambulance[0] });
        } else {
            res.status(404).send("Ambulance not found");
        }
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error fetching ambulance details");
    }
});


router.post("/update_ambulance/:id", async function (req, res) {
    try {
        var d = req.body;
        var id = req.params.id;

        var existingData = await exe("SELECT image FROM ambulances WHERE id = ?", [id]);
        var existingImage = existingData.length > 0 ? existingData[0].image : "";

    
        var image = existingImage;

        if (req.files && req.files.image) {
            image = Date.now() + "_" + req.files.image.name;
            let uploadPath = path.join(__dirname, "../public/admin_assets/", image);
            await req.files.image.mv(uploadPath);
        }

     
        var sql = "UPDATE ambulances SET name=?, contact_number=?, service_type=?, description=?, image=? WHERE id=?";
        await exe(sql, [d.name, d.contact_number, d.service_type, d.description, image, id]);

        res.redirect("/admin/ambulance");
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error updating ambulance");
    }
});


router.get("/delete_ambulance/:id", async function (req, res) {
    try {
        
        var sqlSelect = "SELECT image FROM ambulances WHERE id = ?";
        var ambulance = await exe(sqlSelect, [req.params.id]);

    
        if (ambulance.length > 0 && ambulance[0].image) {
            const fs = require("fs");
            const imagePath = "public/admin_assets/" + ambulance[0].image;
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); 
            }
        }

     
        var sqlDelete = "DELETE FROM ambulances WHERE id = ?";
        await exe(sqlDelete, [req.params.id]);

        res.redirect("/admin/ambulance");
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error deleting ambulance");
    }
});














router.get("/faqs", async (req, res) => {
    try {
        var faqs = await exe("SELECT * FROM faqs ORDER BY id DESC");
        res.render("admin/faqs.ejs", { faqs });
    } catch (err) {
        console.error("Error fetching FAQs:", err);
        res.status(500).send("Error fetching FAQs.");
    }
});

router.post("/save_faq", async (req, res) => {
    try {
        var { question, answer } = req.body;
        await exe("INSERT INTO faqs (question, answer) VALUES (?, ?)", [question, answer]);
        res.redirect("/admin/faqs");
    } catch (err) {
        console.error("Error saving FAQ:", err);
        res.status(500).send("Error saving FAQ.");
    }
});


router.get("/edit_faq/:id", async (req, res) => {
    try {
        var id = req.params.id;
        var data = await exe("SELECT * FROM faqs WHERE id = ?", [id]);

        if (data.length > 0) {
            res.render("admin/edit_faq.ejs", { faq: data[0] });
        } else {
            res.redirect("/admin/faqs");
        }
    } catch (err) {
        console.error("Error fetching FAQ:", err);
        res.status(500).send("Error fetching FAQ.");
    }
});


router.post("/update_faq/:id", async (req, res) => {
    try {
        var id = req.params.id;
        var { question, answer } = req.body;
        await exe("UPDATE faqs SET question = ?, answer = ? WHERE id = ?", [question, answer, id]);
        res.redirect("/admin/faqs");
    } catch (err) {
        console.error("Error updating FAQ:", err);
        res.status(500).send("Error updating FAQ.");
    }
});


router.get("/delete_faq/:id", async (req, res) => {
    try {
        var id = req.params.id;
        await exe("DELETE FROM faqs WHERE id = ?", [id]);
        res.redirect("/admin/faqs");
    } catch (err) {
        console.error("Error deleting FAQ:", err);
        res.status(500).send("Error deleting FAQ.");
    }
});


router.get("/gallery", async function (req, res) {
    try {
        var gallery = await exe("SELECT * FROM gallery");
        res.render("admin/gallery_org.ejs", { gallery });
    } catch (err) {
        console.error("Error fetching gallery:", err);
        res.status(500).send("Error fetching gallery.");
    }
});


router.post("/save_gallery", async function (req, res) {
    try {
        var image = "";

        if (req.files && req.files.image) {
            image = new Date().getTime() + path.extname(req.files.image.name);
            req.files.image.mv("public/admin_assets/" + image);
        }

        var sql = `INSERT INTO gallery (image) VALUES ('${image}')`;
        await exe(sql);

        res.redirect("/admin/gallery");
    } catch (err) {
        console.error("Error saving gallery image:", err);
        res.status(500).send("Error saving gallery image.");
    }
});

router.get("/edit_gallery/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let result = await exe(`SELECT * FROM gallery WHERE id = ${id}`);
        if (result.length > 0) {
            res.render("admin/edit_gallery.ejs", { gallery: result[0] });
        } else {
            res.redirect("/admin/gallery");
        }
    } catch (err) {
        console.error("Error fetching gallery image:", err);
        res.status(500).send("Error fetching gallery image.");
    }
});


router.post("/update_gallery/:id", async function (req, res) {
    try {
        var id = req.params.id;

        var existingData = await exe("SELECT image FROM gallery WHERE id = ?", [id]);
        var existingImage = existingData.length > 0 ? existingData[0].image : "";

        var image = existingImage; 

        
        if (req.files && req.files.image) {
            image = Date.now() + "_" + req.files.image.name;
            let uploadPath = path.join(__dirname, "../public/admin_assets/", image);
            await req.files.image.mv(uploadPath);

          
            let oldImagePath = path.join(__dirname, "../public/admin_assets/", existingImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        
        var sql = "UPDATE gallery SET image=? WHERE id=?";
        await exe(sql, [image, id]);

        res.redirect("/admin/gallery");
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).send("Error updating gallery image");
    }
});
router.get("/delete_gallery/:id", async (req, res) => {
    try {
        let id = req.params.id;
        
        
        let result = await exe(`SELECT image FROM gallery WHERE id = ${id}`);
        if (result.length > 0) {
            let filePath = "public/admin_assets/" + result[0].image;
          
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

          
            await exe(`DELETE FROM gallery WHERE id = ${id}`);
        }

        res.redirect("/admin/gallery");
    } catch (err) {
        console.error("Error deleting image:", err);
        res.status(500).send("Error deleting image.");
    }
});






router.get("/specialists_org", async (req, res) => {
    try {
        var specialists = await exe("SELECT * FROM specialists_org ORDER BY id DESC");
        res.render("admin/specialists_or.ejs", { specialists });
    } catch (err) {
        console.error("Error fetching specialists:", err);
        res.status(500).send("Error fetching specialists.");
    }
});



router.post("/save_specialist1", async (req, res) => {
   
    var image ="";

    if(req.files)
    {
        if(req.files.image)
        {
           image= new Date().getTime()+req.files.image.name;
           req.files.image.mv("public/admin_assets/"+image);
        }
    }
var d= req.body;
    var sql = `INSERT INTO specialists_org (image,name,specialization,description ) VALUES(?,?,?,?)`;
    var data= await exe (sql,[image,d.name,d.specialization,d.description ]);
//    res.send(data)

res.redirect("/admin/specialists_org")

});

  
router.get("/edit_specialist_1/:id", async (req, res) => {
    try {
        var id = req.params.id;
        var data = await exe(`SELECT * FROM specialists_org WHERE id = ?`, [id]);

        if (data.length > 0) {
            res.render("admin/edit_specialist_1.ejs", { specialist: data[0] });
        } else {
            res.redirect("/admin/specialists_org");
        }
    } catch (err) {
        console.error("❌ Error fetching specialist:", err);
        res.status(500).send("Error fetching specialist.");
    }
});


router.post("/update_specialist_1/:id", async (req, res) => {
    try {
        var id = req.params.id;
        var d = req.body;
        var image = d.old_image;

        if (req.files && req.files.image) {
            image = new Date().getTime() + req.files.image.name;
            req.files.image.mv("public/admin_assets/" + image);
        }

        var sql = `UPDATE specialists_org SET image = ?, name = ?, specialization = ?, description = ? WHERE id = ?`;
        await exe(sql, [image, d.name, d.specialization, d.description, id]);

        res.redirect("/admin/specialists_org");
    } catch (err) {
        console.error("❌ Error updating specialist:", err);
        res.status(500).send("Error updating specialist.");
    }
});

// 📌 GET: Delete Specialist
router.get("/delete_specialist_1/:id", async (req, res) => {
    try {
        var id = req.params.id;
        await exe(`DELETE FROM specialists_org WHERE id = ?`, [id]);

        res.redirect("/admin/specialists_org");
    } catch (err) {
        console.error("❌ Error deleting specialist:", err);
        res.status(500).send("Error deleting specialist.");
    }
});



// Blog Section and article

// article

router.get("/articles", async (req, res) => {
    try {
        var articles = await exe("SELECT * FROM article ORDER BY id DESC");
        res.render("admin/articles.ejs", { articles });
    } catch (err) {
        console.error("Error fetching articles:", err);
        res.status(500).send("Error fetching articles.");
    }
});

router.post("/save_article", async (req, res) => {
    try {
        var image = "";

        if (req.files && req.files.image) {
            image = new Date().getTime() + req.files.image.name;
            req.files.image.mv("public/admin_assets/" + image);
        }

        var d = req.body;
        var sql = `INSERT INTO article (image, title, category, date, content) VALUES (?, ?, ?, ?, ?)`;
        await exe(sql, [image, d.title, d.category, d.date, d.content]);

        res.redirect("/admin/articles");
    } catch (err) {
        console.error("❌ Error saving article:", err);
        res.status(500).send("Error saving article.");
    }
});


router.get("/edit_article/:id", async (req, res) => {
    try {
        var id = req.params.id;
        var data = await exe(`SELECT * FROM article WHERE id = ?`, [id]);

        if (data.length > 0) {
            res.render("admin/edit_article.ejs", { article: data[0] });
        } else {
            res.redirect("/admin/articles");
        }
    } catch (err) {
        console.error("❌ Error fetching article:", err);
        res.status(500).send("Error fetching article.");
    }
});
router.post("/update_article/:id", async (req, res) => {
    try {
        var id = req.params.id;
        var d = req.body;
        var image = d.old_image; 

        if (req.files && req.files.image) {
            image = new Date().getTime() + req.files.image.name;
            req.files.image.mv("public/admin_assets/" + image);
        }

        var sql = `UPDATE article SET image = ?, title = ?, category = ?, date = ?, content = ? WHERE id = ?`;
        await exe(sql, [image, d.title, d.category, d.date, d.content, id]);

        res.redirect("/admin/articles");
    } catch (err) {
        console.error("❌ Error updating article:", err);
        res.status(500).send("Error updating article.");
    }
});
router.get("/delete_article/:id", async (req, res) => {
    try {
        var id = req.params.id;
        await exe(`DELETE FROM article WHERE id = ?`, [id]);

        res.redirect("/admin/articles");
    } catch (err) {
        console.error("❌ Error deleting article:", err);
        res.status(500).send("Error deleting article.");
    }
});





// Blog

router.get("/blogs", async (req, res) => {
    try {
        const blogs = await exe("SELECT * FROM blog ORDER BY created_at DESC");
        res.render("admin/blog.ejs", { blogs });
    } catch (err) {
        console.error("❌ Error fetching blogs:", err);
        res.status(500).send("Internal Server Error: Unable to fetch blogs.");
    }
});



router.post("/blogs/add", async (req, res) => {
    try {
        const { title, content, author, image_url, video_url } = req.body;
        await exe(
            "INSERT INTO blog (title, content, author, image_url, video_url) VALUES (?, ?, ?, ?, ?)",
            [title, content, author, image_url, video_url]
        );
        res.redirect("/admin/blogs");
    } catch (err) {
        console.error("❌ Error adding blog:", err);
        res.status(500).send("Internal Server Error: Unable to add blog.");
    }
});

router.get("/blogs/edit/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await exe("SELECT * FROM blog WHERE id = ?", [id]);
        if (blog.length > 0) {
            res.render("admin/edit_blog.ejs", { blog: blog[0] });
        } else {
            res.redirect("/admin/blog");
        }
    } catch (err) {
        console.error("❌ Error fetching blog for edit:", err);
        res.status(500).send("Internal Server Error: Unable to edit blog.");
    }
});


router.post("/blogs/update/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, author, image_url, video_url } = req.body;
        await exe(
            "UPDATE blog SET title=?, content=?, author=?, image_url=?, video_url=? WHERE id=?",
            [title, content, author, image_url, video_url, id]
        );
        res.redirect("/admin/blogs");
    } catch (err) {
        console.error("❌ Error updating blog:", err);
        res.status(500).send("Internal Server Error: Unable to update blog.");
    }
});

router.get("/blogs/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await exe("DELETE FROM blog WHERE id = ?", [id]);
        res.redirect("/admin/blogs");
    } catch (err) {
        console.error("❌ Error deleting blog:", err);
        res.status(500).send("Internal Server Error: Unable to delete blog.");
    }
});



router.get("/contact", (req, res) => {
   
    res.render("admin/contact.ejs");

});




router.get("/policies", async (req, res) => {
    try {
        const policies = await exe("SELECT * FROM policies ORDER BY id ASC");
        res.render("admin/policies.ejs", { policies });
    } catch (err) {
        console.error("❌ Error fetching policies:", err);
        res.status(500).send("Internal Server Error: Unable to fetch policies.");
    }
});
router.post("/save_policies", async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).send("All fields are required.");
        }

        await exe("INSERT INTO policies (title, description) VALUES (?, ?)", [title, description]);
        res.redirect("/admin/policies");
    } catch (err) {
        console.error("❌ Error saving policy:", err);
        res.status(500).send("Internal Server Error: Unable to save policy.");
    }
});

router.get("/edit_policy/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const policy = await exe("SELECT * FROM policies WHERE id = ?", [id]);

        if (policy.length === 0) {
            return res.status(404).send("Policy not found.");
        }

        res.render("admin/edit_policy.ejs", { policy: policy[0] });
    } catch (err) {
        console.error("❌ Error fetching policy:", err);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/update_policy/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).send("All fields are required.");
        }

        await exe("UPDATE policies SET title = ?, description = ? WHERE id = ?", [title, description, id]);
        res.redirect("/admin/policies");
    } catch (err) {
        console.error("❌ Error updating policy:", err);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/delete_policy/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await exe("DELETE FROM policies WHERE id = ?", [id]);
        res.redirect("/admin/policies");
    } catch (err) {
        console.error("❌ Error deleting policy:", err);
        res.status(500).send("Internal Server Error: Unable to delete policy.");
    }
});



// router.get('/profile', authenticateToken, async (req, res) => {
//     try {
//         const admin = await Admin.findById(req.admin.id).select('-password');
//         if (!admin) {
//             return res.status(404).send('Admin not found');
//         }
//         res.render('profile', { admin });
//     } catch (error) {
//         console.error('Error fetching admin:', error);
//         res.status(500).send('Server error');
//     }
// });



module.exports = router;











