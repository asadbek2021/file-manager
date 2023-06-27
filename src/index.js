import { FileManager } from './FileManager.js';


function parseUsername() {
    const userInfo = process.argv.find(element => element.match(/--username/));
    const username = (userInfo || '').split('=')[1];
    return username; 
}

// just run
const fileManager = new FileManager(parseUsername());

