import cron from "node-cron";
import { createBackup } from "./backups/db/db_backup";
import { createMinioBackup } from "./backups/s3/s3_backup";
import { cleanupOldDBBackups } from "./backups/db/db_cleen";
import { cleanupOldMinioBackups } from "./backups/s3/s3_cleen";
import { startParse } from "@/features/parsing";

function setupCron() {
  console.log("⏳ Cron задачи инициализированы...");

  cron.schedule("0 6,11,17 * * *", async () => {
    console.log("🚀 Запуск парсинга...");
    try {
      await startParse();
      console.log("✅ Парсинг успешно завершён.");
    } catch (error) {
      console.error("❌ Ошибка при выполнении парсинга:", error);
    }
  });

  cron.schedule("0 3 */10 * *", async () => {
    console.log("📀 Запуск создания бэкапа...");
    try {
      await createBackup();
      await createMinioBackup();
      await cleanupOldDBBackups();
      await cleanupOldMinioBackups();
      console.log("✅ Бэкап успешно завершён.");
    } catch (error) {
      console.error("❌ Ошибка при создании бэкапа:", error);
    }
  });
}

setupCron();
