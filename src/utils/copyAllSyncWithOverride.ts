import { File, Directory, EntityTypes } from "filic";

export default function copyAllSyncWithOverride($dir: Directory, $target: Directory) {
    const list = $dir.listSync();
    for (const entity of list) {
        if (entity.type === EntityTypes.DIR) {
            copyAllSyncWithOverride(entity as Directory, $target.openDir((entity as Directory).dirname));
        }
        if (entity.type === "FILE" /* FILE */) {
            (entity as File).copySync($target, undefined, { override: true });
        }
    }
}