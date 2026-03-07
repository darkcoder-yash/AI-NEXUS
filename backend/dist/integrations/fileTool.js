import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
const SANDBOX_DIR = path.resolve('./sandbox');
// Ensure sandbox directory exists
const initializeSandbox = async () => {
    try {
        await fs.mkdir(SANDBOX_DIR, { recursive: true });
    }
    catch (err) {
        console.error('Failed to initialize sandbox directory.');
    }
};
initializeSandbox();
export const FileTool = {
    read_file: {
        name: 'file_read',
        description: 'Reads the content of a file within the sandbox.',
        schema: z.object({
            fileName: z.string(),
        }),
        execute: async ({ fileName }, userId) => {
            const safePath = validatePath(fileName);
            try {
                const content = await fs.readFile(safePath, 'utf8');
                return { fileName, content };
            }
            catch (err) {
                if (err.code === 'ENOENT')
                    throw new Error(`File ${fileName} not found.`);
                throw err;
            }
        },
    },
    write_file: {
        name: 'file_write',
        description: 'Writes content to a file in the sandbox.',
        schema: z.object({
            fileName: z.string(),
            content: z.string(),
        }),
        execute: async ({ fileName, content }, userId) => {
            const safePath = validatePath(fileName);
            await fs.writeFile(safePath, content, 'utf8');
            return { success: true, fileName };
        },
    },
    delete_file: {
        name: 'file_delete',
        description: 'Deletes a file from the sandbox.',
        requiresConfirmation: true,
        schema: z.object({
            fileName: z.string(),
        }),
        execute: async ({ fileName }, userId) => {
            const safePath = validatePath(fileName);
            await fs.unlink(safePath);
            return { success: true, message: `File ${fileName} deleted.` };
        },
    },
};
/**
 * Prevents path traversal by resolving and checking the path prefix.
 */
function validatePath(fileName) {
    const normalized = path.normalize(fileName).replace(/^(\.\.(\/|\\|$))+/, '');
    const finalPath = path.resolve(SANDBOX_DIR, normalized);
    if (!finalPath.startsWith(SANDBOX_DIR)) {
        throw new Error('Access Denied: Path traversal detected.');
    }
    return finalPath;
}
