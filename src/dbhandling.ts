import { promises } from "dns";
import { User } from './models/user';

export async function deleteIdleDefaultUsers(): Promise<void> {
    const idleTimeLimit = 30 * 24 * 60 * 60 * 1000; // 30 days
    const cutoffDate = new Date(Date.now() - idleTimeLimit);
    console.log("Deleting idle default users older than:", cutoffDate);

    await User.deleteMany({
        lastActive: { $lt: cutoffDate },
        name: "DefaultUser"
    });
}
