import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import stream from 'stream';
import { fileURLToPath } from 'url';


const dirname = fileURLToPath(new URL('.', import.meta.url) );
const DEFAULT_USER = 'DefaultUser';

export class FileManager  {

    constructor(username){
        this.username = username || DEFAULT_USER;
        this.greet();
        process.on('SIGINT', ()=>{
            this.exit();
        });
        process.on('SIGTERM', () => {
            this.exit();
        });
        process.stdin.on('data', async(chunk)=>{
            const command = chunk.toString().trim();
            if(command === '.exit') {
                this.exit();
            }
            this.printCurrentDirectory();
            await this.callMethodByCommand(command);
            this.printCurrentDirectory();
            
        });
    }

    greet() {
        const welcomeMessage = `Welcome to File Manager, ${this.username}`;
        this.print(welcomeMessage, console.log);
    }

    async ls(){
       const files = await fs.promises.readdir(dirname);
        this.print(files, console.table);
    }

    up() {
        process.chdir('..');
    }

    cd(pathToDir) {
        process.chdir(pathToDir);
    }

    print(content, callback) {
        if(!callback || typeof callback != "function") {
            return console.log(content);
        }
        callback(content);
    }

    printCurrentDirectory() {
        const message = `You are currently in ${process.cwd()}`;
        this.print(message, console.log);
    }

    exit() {
        console.clear();
        const goodbyeMessage = `Thank you for using File Manager, ${this.username}, goodbye!`;
        this.print(goodbyeMessage, console.log);
        process.exitCode = 1;
        process.exit();
    }

    async callMethodByCommand(rawCommand) {
        const command = parseCommand(rawCommand);
        const params = getParams(command, rawCommand);

        switch(command) {
            case 'cat':
                this.readFileAndWrite(normalizePath(params[0]));
                break;
            case 'rm':
                await this.removeFile(normalizePath(params[0]));
                break;
            case 'mv':
                await this.moveFile(normalizePath(params[0]), normalizePath(params[1]));
                break;
            case 'cp':
                await this.copyFile(normalizePath(params[0]), normalizePath(params[1]));
                break; 
            case 'rn':
                await this.renameFile(normalizePath(params[0]), params[1]);
                break; 
            case 'add':
                await this.addNewFile(normalizePath(params[0]), '');
                break;
            case 'cd':
                await this.cd(normalizePath(params[0]));
                break;
            case 'ls':
                await this.ls();
                break;
            case 'up':
                this.up();
                break;
            case 'hash':
                await this.hash(normalizePath(params[0]));
                break;
            default:
                this.print('Operation failed',console.error);
        } 
    }

    async removeFile(pathToFile){
        await fs.unlink(pathToFile);
    }

    async addNewFile(pathToFile, content) {
        const ws = fs.createWriteStream(pathToFile, {flags: 'w+'});
        ws.end('');
    }

    async copyFile(pathToFile, destinationDirectory) {
        const filename = path.basename(destinationPath);
        const destionation = path.join(destinationDirectory, filename);
        const rs = fs.createReadStream(pathToFile);
        const ws = fs.createReadStream(destionation);

        pipeline(rs,ws);

    }

    async renameFile(pathToFile, newName) {
        const dirname = path.dirname(pathToFile);
        await fs.promises.rename(pathToFile, path.join(dirname, newName));
    }

    async moveFile(pathToFile, destionationPath) {
        const filename = path.basename(destinationPath);
        const destionation = path.join(destinationDirectory, filename);
        const rs = fs.createReadStream(pathToFile);
        const ws = fs.createReadStream(destionation);
        rs.on('close', async ()=> {
            await this.removeFile(pathToFile);
        })
        pipeline(rs,ws);
    }

    readFileAndWrite(pathToFile, writableStream) {
        const readStream = fs.createReadStream(pathToFile);
        if(!writableStream){
            pipeline(
                readStream,
                process.stdout,
                (err) => {
                    console.error(err);
                }
            );
            return;
        }
        pipeline(
            readStream,
            writableStream,
            (err) => {
                console.error(err.message);
            }
        );
    }

    cpus () {
        this.print(os.cpus(), console.table);
    }

    eol () {
        this.print(os.EOL, console.log);
    }

    homedir () {
        this.print(os.homedir(), console.log);
    }

    systemUser () {
        this.print(os.userInfo().username, console.log);
    }

    arch () {
        this.print(os.arch(), console.log);
    }

    async hash (pathToFile) {
        const rs = fs.createReadStream(pathToFile);
        const ts = new HashTransform();
        await stream.promises.pipeline(rs, ts, process.stdout);
    }


}



function parseCommand(rawCommand) {
    const command = rawCommand.split(" ")[0].trim();
    return command;
}

function getParams(mainCommand, rawCommand) {
    const rest = rawCommand.replace(mainCommand, '').trim();
    const params =  rest.split(' ').map(item => item.trim());
    return params;
}

function normalizePath(currentPath) {
    return path.normalize(currentPath);
}

class HashTransform extends stream.Transform {

    hashsum = crypto.createHash('sha256');

    _transform(chunk, encoding, callback) {
        this.hashsum.update(chunk);
        const newChunk = this.hashsum.digest('hex');
        callback(null, newChunk);
    };

}