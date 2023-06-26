import { FileManager } from './FileManager.js';


function parseUsername() {
    const userInfo = process.argv.find(element => element.match(/--username/));
    const username = (userInfo || '').split('=')[1];
    return username; 
}

// just run it
const fileManager = new FileManager(parseUsername());

