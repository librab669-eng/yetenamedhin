"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function ExpenseChart({ data }: { data: { name: string; total: number }[] }) {
  const colors = ["#2f80ed", "#27ae60", "#f2994a", "#eb5757", "#9b51e0", "#2d9cdb"];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(122,132,153,0.2)" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#7a8499" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#7a8499" }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(47,128,237,0.06)" }}
          contentStyle={{
            background: "#fff",
            border: "none",
            borderRadius: 10,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            color: "#3d4657",
          }}
        />
        <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#2f80ed" name="ETB">
          {data.map((entry, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}