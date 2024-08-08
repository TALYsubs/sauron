import { readFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { getSupergraph } from './getSupergraph';

export const localSuperGraph = async () => {
    try {
        const pathDir = __dirname;
        const dirPath = path.join(pathDir, 'config');

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const url = path.join(dirPath, 'supergraph.graphql');

        if (!fs.existsSync(url)) {
            try {
                const signedUrl: string | any = await getSupergraph();
                fs.writeFileSync(url, signedUrl);
                console.log('INFO: added .graphql at', url);
            } catch (err) {
                console.log('ERROR: ', err);
            }
        }

        return await readFile(url, 'utf-8')
    } catch (err) {
        console.log('Error fetching schema from S3:', err);
        throw err;
    }
}