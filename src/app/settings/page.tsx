import { prisma } from "@/lib/prisma";
import Layout from "@/components/Layout";
import { runBackup, updateSettings, changePin } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, backups] = await Promise.all([
    prisma.setting.findMany(),
    prisma.backupLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const get = (key: string) => settings.find((s) => s.key === key)?.value;
  const logo = get("hospitalLogo") || "";

  return (
    <Layout>
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">System configuration and backup</p>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="page-title" style={{ fontSize: 18, marginBottom: 16 }}>General</h3>
          <form action={updateSettings}>
            <div className="field">
              <label className="label">Hospital Name</label>
              <input className="input" name="hospitalName" defaultValue={get("hospitalName") || ""} placeholder="Yetena Medhin Hospital" />
            </div>
            <div className="field">
              <label className="label">Hospital Logo</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <input className="input" name="hospitalLogo" type="file" accept="image/*" style={{ flex: 1, minWidth: 200 }} />
                {logo && (
                  <img src={logo} alt="Hospital Logo" style={{ height: 60, borderRadius: 8, border: "1px solid var(--border)" }} />
                )}
                {logo && (
                  <button type="button" className="btn btn-sm btn-danger" formAction={async () => {
                    "use server";
                    const { updateSettings } = await import("@/app/actions");
                    const fd = new FormData();
                    fd.append("hospitalLogo", "");
                    await updateSettings(fd);
                  }}>
                    Remove
                  </button>
                )}
              </div>
              {logo && <p className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>Current logo shown above. Upload new to replace.</p>}
            </div>
            <div className="field">
              <label className="label">Automatic backup every (days)</label>
              <input className="input" name="backupInterval" type="number" min="1" defaultValue={get("backupInterval") || "1"} />
            </div>
            <div className="field">
              <label className="label">Backup folder</label>
              <input className="input" name="backupDir" defaultValue={get("backupDir") || "C:\\YetenaBackups"} />
            </div>
            <button className="btn btn-primary" type="submit">Save</button>
          </form>
        </div>

        <div className="card">
          <h3 className="page-title" style={{ fontSize: 18, marginBottom: 16 }}>Security PIN</h3>
          <form action={changePin}>
            <div className="field">
              <label className="label">Current PIN</label>
              <input className="input" name="currentPin" type="password" />
            </div>
            <div className="field">
              <label className="label">New PIN</label>
              <input className="input" name="newPin" type="password" />
            </div>
            <button className="btn btn-primary" type="submit">Change PIN</button>
          </form>
        </div>
      </div>

      <div className="card mt-4">
        <div className="row-between mb-4">
          <h3 className="page-title" style={{ fontSize: 18 }}>Backup</h3>
          <form action={runBackup}>
            <input type="hidden" name="backupDir" value={get("backupDir") || "C:\\YetenaBackups"} />
            <button className="btn btn-primary" type="submit">Backup Now</button>
          </form>
        </div>
        <p className="text-muted mb-4">
          A backup creates a full database dump in your backup folder. Copy the folder to a USB drive regularly.
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>File</th>
              <th>Size</th>
              <th>Date</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {backups.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">No backups yet</td>
              </tr>
            ) : (
              backups.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.fileName}</td>
                  <td>{(Number(b.sizeBytes) / 1024 / 1024).toFixed(2)} MB</td>
                  <td>{b.createdAt.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${b.kind === "auto" ? "badge-blue" : "badge-green"}`}>
                      {b.kind}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}