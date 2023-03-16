import { Directory, EntityTypes, File } from "filic";

export default function getAllFilesInDirectory(dir: Directory) {
    const files: File[] = []

    const ls = dir.listSync();

    for (const e of ls) {
        if (e.type === EntityTypes.FILE) files.push(e as unknown as File);

        if (e.type === EntityTypes.DIR) {
            files.push(...getAllFilesInDirectory(e as Directory));
        }
    }

    return files;
}