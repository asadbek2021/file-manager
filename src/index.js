import { fileURLToPath } from 'url';

const dirname = fileURLToPath(new URL('.', import.meta.url) );

function greet() {
    const username = process.argv.find(element => element.match(/--username/)).split('=')[1];
    const defaultUser = 'DefaultUser';
    console.log(`Welcome to File Manager, ${username || defaultUser}`);
    process.on('SIGINT', ()=>{
        exit(username || defaultUser);
    });
    process.on('SIGTERM', () => {
        exit(username || defaultUser);
    });
    process.stdin.on('data',(chunk)=>{
        const data = chunk.toString().trim();
        if(data === '.exit') {
            exit(username || defaultUser);
        }

        console.log(printDirectory());
    });
}

function exit(username) {
    console.clear();
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
    process.exitCode = 1;
    process.exit();
}

function printDirectory() {
    const message = `You are currently in ${dirname}`;
    console.log(message);
}

function printCommandsList() {
    
}
greet();