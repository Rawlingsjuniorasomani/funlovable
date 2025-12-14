require('dotenv').config();
const SubjectModel = require('./models/SubjectModel');
const pool = require('./db/pool');

async function testSubjectCreation() {
    try {
        console.log("Testing Subject Creation...");
        const newSubject = await SubjectModel.create({
            name: "Test Subject " + Date.now(),
            description: "A test subject",
            icon: "BookOpen",
            price: 0
        });
        console.log("Created Subject:", newSubject);

        console.log("Fetching all subjects...");
        const all = await SubjectModel.findAll();
        console.log("All Subjects:", all);
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

testSubjectCreation();
