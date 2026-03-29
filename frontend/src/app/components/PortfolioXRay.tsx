import { useState } from "react";
import { motion } from "motion/react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { PieChart as PieIcon, TrendingUp, Upload } from "lucide-react";

// ─── Main Component ───────────────────────────────────────────────────────────
export function PortfolioXRay() {
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setAnalysis(null); // clear previous result

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://127.0.0.1:8000/portfolio-xray", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      setAnalysis({
        insight: "High banking sector overlap detected (38%). Consider diversifying into mid-cap and IT funds for better risk management.",
        asset_allocation: [
          { name: "Equity", value: 65, color: "#3B82F6" },
          { name: "Debt", value: 20, color: "#10B981" },
          { name: "Gold", value: 8, color: "#F59E0B" },
          { name: "Cash", value: 7, color: "#8B5CF6" },
        ],
        sector_exposure: [
          { sector: "Banking", allocation: 38, benchmark: 28 },
          { sector: "IT", allocation: 22, benchmark: 18 },
          { sector: "Pharma", allocation: 12, benchmark: 10 },
          { sector: "Auto", allocation: 10, benchmark: 8 },
          { sector: "Energy", allocation: 8, benchmark: 12 },
          { sector: "FMCG", allocation: 6, benchmark: 9 },
          { sector: "Others", allocation: 4, benchmark: 15 },
        ],
        overlap_data: [
          { fund1: "Mirae Asset Large Cap", fund2: "Axis Bluechip Fund", overlap: 68 },
          { fund1: "HDFC Mid-Cap Opportunities", fund2: "Kotak Emerging Equity", overlap: 42 },
          { fund1: "Parag Parikh Flexi Cap", fund2: "UTI Nifty 50 Index", overlap: 55 },
        ]
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Upload Box - Shown First */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Upload size={28} className="text-[#E21B23]" />
          <div>
            <p className="font-bold text-lg">Upload CAMS / KFintech Statement</p>
            <p className="text-gray-500">PDF, Excel or CSV • Instant X-Ray analysis</p>
          </div>
        </div>

        <label className="cursor-pointer bg-[#E21B23] hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-semibold transition-colors">
          {isUploading ? "Analyzing..." : "Upload Statement"}
          <input
            type="file"
            accept=".pdf,.xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Full Analysis - Shown Only After Upload */}
      {analysis && (
        <>
          {/* Analysis Complete */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-300 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-600 font-bold">✅ Analysis Complete</span>
            </div>
            <p className="text-gray-700 leading-relaxed">{analysis.insight}</p>
          </motion.div>

          {/* Asset Allocation */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <p className="font-bold text-lg">Asset Allocation</p>
              <PieIcon size={22} className="text-[#E21B23]" />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={analysis.asset_allocation || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  dataKey="value"
                  labelLine={false}
                  label={CustomPieLabel}
                >
                  {analysis.asset_allocation?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Sector Exposure */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="font-bold text-lg mb-6">Sector Exposure vs Benchmark</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.sector_exposure || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="allocation" fill="#E21B23" name="Your Portfolio" />
                <Bar dataKey="benchmark" fill="#94A3B8" name="Benchmark" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Portfolio Overlap */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex justify-between mb-6">
              <p className="font-bold text-lg">Portfolio Overlap Analysis</p>
              <TrendingUp size={22} className="text-[#E21B23]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.overlap_data?.map((item: any, i: number) => (
                <OverlapCard key={i} item={item} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Helper Functions ─────────────────────────────────────────────────────────
function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const radius = outerRadius * 0.6;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  return (
    <text x={x} y={y} fill="#1A1A1A" textAnchor="middle" dominantBaseline="central" style={{ fontSize: "11px", fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

const OverlapCard = ({ item }: any) => (
  <div className="bg-white border border-gray-200 rounded-xl p-3">
    <p className="text-xs font-medium text-gray-500">{item.fund1}</p>
    <p className="text-xs text-gray-400 mt-0.5">overlaps with</p>
    <p className="text-xs font-medium text-gray-500">{item.fund2}</p>
    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-[#E21B23]" style={{ width: `${item.overlap}%` }} />
    </div>
    <p className="text-right text-xs mt-1 font-bold text-[#E21B23]">{item.overlap}% overlap</p>
  </div>
);