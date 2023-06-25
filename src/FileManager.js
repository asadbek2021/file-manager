import fs from 'fs';
import fs from 'path';
import { fileURLToPath } from 'url';


const dirname = fileURLToPath(new URL('.', import.meta.url) );

export class FileManager  {
    
    

    async ls(){
       const files = await fs.promises.readdir(dirname);
        this.print(files, console.table);
    }

    up() {
        
    }

    print(content, callback) {
        callback(content);
    }
}