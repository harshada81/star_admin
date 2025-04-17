var express = require("express");
var exe = require("./../connection");
var router = express.Router();

router.get("/",async function(req,res)
{
    
    var slider =await exe (`SELECT * FROM slider`);
    var about_us =await exe (`SELECT * FROM about_us`);
    var services = await exe("SELECT * FROM services");
    var specialists = await exe("SELECT * FROM specialists");
    var articles = await exe("SELECT * FROM article ORDER BY id DESC");
    var client_reviews = "SELECT * FROM client_reviews ORDER BY id DESC";
    var obj={"slider":slider,"about_us":about_us[0],"services":services,"specialists":specialists,"articles":articles,"client_reviews":client_reviews}
    res.render("user/index.ejs",obj);

   
});



router.get("/about", async function(req, res) {

        var about_info = await exe("SELECT * FROM about_info");
        var doctors = await exe("SELECT * FROM doctors");
        var mission_vision = await exe("SELECT * FROM mission_vision");
        var obj = { "about_info": about_info,"doctors":doctors, "mission_vision" : mission_vision  };
        res.render("user/about.ejs", obj);
   
});

 
router.get("/services", async function(req, res)

 {
    var services = await exe("SELECT * FROM services_org");
     var sql = "SELECT * FROM ambulances";
    var ambulances = await exe(sql);
    var faqs = await exe("SELECT * FROM faqs ORDER BY id DESC");
    var obj = { "services":services ,"ambulances":ambulances,"faqs":faqs};
    res.render("user/services.ejs",obj);

});


 
router.get("/gallery", async function(req, res)
{

    var gallery = await exe("SELECT * FROM gallery");
    var obj = { "gallery": gallery};
    res.render("user/gallery.ejs",obj);
});


router.get("/specialists", async function(req, res)
{

    var specialists = await exe("SELECT * FROM specialists_org ORDER BY id DESC");
    var obj = { "specialists": specialists};
    res.render("user/specialists.ejs",obj);
});



router.get("/blogs", async function(req, res)
{
    var articles = await exe("SELECT * FROM article ORDER BY id DESC");
    const blogs = await exe("SELECT * FROM blog ORDER BY created_at DESC");
    var obj = { "articles":articles , "blogs": blogs};
    res.render("user/blog.ejs",obj);
});


router.get("/contact", async function(req, res)
{
    var obj = { "contact":contact};
    res.render("user/contact.ejs");
});


// router.post("/save_appointments", async function (req, res) {
//     try {
//         const { full_name, email, phone, preferred_date } = req.body;

//         const sql = `INSERT INTO appointments (full_name, email, phone, preferred_date) VALUES (?, ?, ?, ?)`;
//         const [result] = await pool.execute(sql, [full_name, email, phone, preferred_date]);

//         res.send("appointments");
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error saving appointment");
//     }
// });

// Route to save appointment
router.post("/save_appointments", async function (req, res) {
    try {
        let { full_name, email, phone, preferred_date } = req.body;

        // Validate input
        if (!full_name || !email || !phone || !preferred_date) {
            return res.status(400).send("All fields are required.");
        }

        // Insert appointment into database
        let sql = `INSERT INTO appointments (full_name, email, phone, preferred_date) VALUES (?, ?, ?, ?)`;
        await db.execute(sql, [full_name, email, phone, preferred_date]);

        res.redirect("/admin/appointments"); // Redirect to admin panel
    } catch (error) {
        console.error("Error saving appointment:", error);
        res.status(500).send("Internal Server Error");
    }
});
router.get("/policies", async function(req, res)
{
    const policies = await exe("SELECT * FROM policies ORDER BY id ASC");
   var obj={"policies":policies};
    res.render("user/policies.ejs",obj);
});



module.exports = router;