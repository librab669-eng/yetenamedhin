import Link from "next/link";
import { Users, Users2, ReceiptText, TrendingUp, PlusCircle, Pill, FileSpreadsheet, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { todayEth, ethMonthName, ethDateString, startOfYearEth } from "@/lib/ethcal";
import Layout from "@/components/Layout";
import ExpenseChart from "@/components/ExpenseChart";

const fmt = (n: number | { toString: () => string }) => {
  const num = typeof n === "number" ? n : Number(n);
  return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = todayEth();
  const todayStr = ethDateString(today.year, today.month, today.day);
  const yearStart = startOfYearEth(today.year);
  const yearStartStr = ethDateString(yearStart.year, yearStart.month, yearStart.day);

  const [patientCount, totalFamilyCount, currentYearFamilyCount, todayExpenses, yearExpenses, recent, monthlyData] = await Promise.all([
    prisma.patient.count(),
    prisma.family.count(),
    prisma.family.count({ where: { ethYear: today.year } }),
    prisma.expense.aggregate({ where: { ethDate: todayStr }, _sum: { totalCost: true } }),
    prisma.expense.aggregate({ where: { ethDate: { gte: yearStartStr } }, _sum: { totalCost: true } }),
    prisma.expense.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { patient: { include: { family: true } }, medicine: true },
    }),
    prisma.$queryRaw`
      SELECT "ethMonth" as m, SUM("totalCost")::float as total
      FROM "Expense"
      WHERE "ethYear" = ${today.year}
      GROUP BY "ethMonth"
      ORDER BY "ethMonth"
    `,
  ]);

  const monthTotals = new Map<number, number>();
  for (const row of monthlyData as { m: number; total: number }[]) {
    monthTotals.set(row.m, row.total);
  }
  const chartData = Array.from({ length: 13 }, (_, i) => i + 1).map((m) => ({
    name: ethMonthName(today.year, m, "en").slice(0, 3),
    total: Math.round(monthTotals.get(m) ?? 0),
  }));

  const monthStart = ethDateString(today.year, today.month, 1);
  const monthExpenses = await prisma.expense.aggregate({
    where: { ethDate: { gte: monthStart, lte: todayStr } },
    _sum: { totalCost: true },
  });

  const stats = [
    { label: "totalPatients", value: fmt(patientCount), icon: Users, color: "#2f80ed" },
    { label: "totalFamilies", value: fmt(totalFamilyCount), icon: Users2, color: "#27ae60" },
    { label: "familiesThisYear", value: fmt(currentYearFamilyCount), icon: Users2, color: "#27ae60" },
    { label: "dailyExpenses", value: fmt(todayExpenses._sum.totalCost ?? 0) + " ETB", icon: ReceiptText, color: "#f2994a" },
    { label: "monthly", value: fmt(monthExpenses._sum.totalCost ?? 0) + " ETB", icon: TrendingUp, color: "#9b51e0" },
  ];

  return (
    <Layout>
      <h1 className="page-title">{`${today.day} ${ethMonthName(today.year, today.month, "en")} ${today.year} EC`}</h1>
      <p className="page-sub">{`${today.day} ${ethMonthName(today.year, today.month, "am")} ${today.year}`} — የጤና መድህን የወጪ መዝገብ</p>

      <div className="grid grid-stats mb-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div className="card stat-card" key={s.label}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div className="stat-label">{s.label === "monthly" ? "monthly total" : s.label}</div>
                  <div className="stat-value">{s.value}</div>
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: s.color,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-2 mb-4">
        <div className="card">
          <div className="row-between mb-4">
            <h3 className="page-title" style={{ fontSize: 18 }}>monthlyTrend</h3>
            <Link href="/reports" className="btn btn-sm btn-ghost">
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="chart-box">
            <ExpenseChart data={chartData} />
          </div>
        </div>

        <div>
          <div className="grid grid-3 mb-4">
            <Link href="/patients" className="card card-sm" style={{ display: "block" }}>
              <div className="row" style={{ color: "var(--primary)" }}>
                <PlusCircle size={20} /> <b>Register Patient</b>
              </div>
            </Link>
            <Link href="/expenses" className="card card-sm" style={{ display: "block" }}>
              <div className="row" style={{ color: "var(--success)" }}>
                <Pill size={20} /> <b>Log Expense</b>
              </div>
            </Link>
            <Link href="/reports" className="card card-sm" style={{ display: "block" }}>
              <div className="row" style={{ color: "#9b51e0" }}>
                <FileSpreadsheet size={20} /> <b>Reports</b>
              </div>
            </Link>
          </div>

          <div className="card">
            <h3 className="page-title" style={{ fontSize: 18, marginBottom: 16 }}>recentActivity</h3>
            {recent.length === 0 ? (
              <div className="empty-state">noData</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recent.map((e) => (
                  <Link href={`/patients/${e.patientId}`} key={e.id} className="card-sm" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{e.patient.fullName}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>
                        {e.medicine.name} × {fmt(e.quantity)} {e.medicine.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontWeight: 800 }}>{fmt(e.totalCost)} ETB</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>{e.ethDate}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}