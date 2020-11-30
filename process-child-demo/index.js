const {spawn} = require('child_process');

let location;

async function runScript(data) {
    console.log("data before spawn", data);

    const file_path = 'D:/Study/Courses/College/Electronics-Tasks-4th-Year/task3-sbe403a_f20_task3_03/remote-app/server/lanedetection.py'
    const python = await spawn('python', [file_path, data]);
    await python.stdout.on('data', async function (data) {
        console.log('Pipe data from python script...');
        location = await parseInt(data.toString()[1]);
        console.log("the location is", location);
    });
};

let loc = runScript(5);