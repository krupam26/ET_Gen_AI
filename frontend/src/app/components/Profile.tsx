import { useState } from "react";
import { motion } from "motion/react";
import {
  Mail,
  Phone,
  Calendar,
  Edit,
  LogOut,
  MapPin,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Clock,
  X
} from "lucide-react";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";

/* ---------------- DATA ---------------- */

const portfolioData = [
  { month: "Jan", value: 1200000 },
  { month: "Feb", value: 1300000 },
  { month: "Mar", value: 1280000 },
  { month: "Apr", value: 1400000 },
  { month: "May", value: 1500000 },
  { month: "Jun", value: 1845000 }
];

const allocationData = [
  { name: "Stocks", value: 45 },
  { name: "Mutual Funds", value: 30 },
  { name: "Gold", value: 10 },
  { name: "Bonds", value: 10 },
  { name: "Cash", value: 5 }
];

const COLORS = ["#9E1318", "#B4161c", "#cb181f", "#e21b23", "#e63038"];

/* ---------------- MAIN COMPONENT ---------------- */

export function Profile() {

  const [openEdit, setOpenEdit] = useState(false);

  const [profile, setProfile] = useState({
    name: "Rajesh Kumar",
    email: "rajesh@email.com",
    phone: "+91 98765 43210",
    location: "Mumbai, India",
    investment: "₹50,000"
  });

  return (

    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        background: "#F5F6F8",
        padding: "32px",
        fontSize: "15px"
      }}
    >

      <div className="max-w-6xl mx-auto space-y-8">

        {/* PROFILE HEADER */}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 flex items-center justify-between border"
        >

          <div className="flex items-center gap-6">

            <div className="w-24 h-24 bg-[#E21B23] text-white rounded-2xl flex items-center justify-center text-4xl font-bold">
              RK
            </div>

            <div>

              <h1 className="text-3xl font-bold">{profile.name}</h1>

              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <MapPin size={16}/> {profile.location}
              </p>

              <div className="flex gap-2 mt-3">

                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12}/> Verified
                </span>

                <span className="bg-[#E21B23] text-white text-xs px-3 py-1 rounded-full">
                  ET Premium
                </span>

              </div>

            </div>

          </div>

          <button
            onClick={() => setOpenEdit(true)}
            className="flex items-center gap-2 px-5 py-2 bg-[#E21B23] text-white rounded-xl"
          >
            <Edit size={16}/> Edit Profile
          </button>

        </motion.div>

        {/* WEALTH CARDS */}

        <div className="grid grid-cols-3 gap-5">

          <Card
            title="Total Portfolio"
            value="₹18,45,000"
            subtitle="+12.4% this year"
            icon={<Wallet size={18}/>}
          />

          <Card
            title="Risk Profile"
            value="Moderate Growth"
            subtitle="Balanced equity exposure"
            icon={<TrendingUp size={18}/>}
          />

          <Card
            title="Member Since"
            value="March 2023"
            subtitle="2 years with ET"
            icon={<Clock size={18}/>}
          />

        </div>

        {/* PERSONAL INFO */}

        <div className="bg-white rounded-2xl p-6 border">

          <h2 className="font-bold mb-5">Personal Information</h2>

          <div className="grid grid-cols-2 gap-6">

            <Info icon={<Mail size={18}/>} label="Email" value={profile.email}/>
            <Info icon={<Phone size={18}/>} label="Phone" value={profile.phone}/>
            <Info icon={<Calendar size={18}/>} label="Date of Birth" value="15 June 1992"/>
            <Info icon={<MapPin size={18}/>} label="Location" value={profile.location}/>

          </div>

        </div>

        {/* FINANCIAL PREFERENCES */}

        <div className="bg-white rounded-2xl p-6 border">

          <h2 className="font-bold mb-5">Financial Preferences</h2>

          <div className="grid grid-cols-2 gap-6">

            <Preference label="Investment Goal" value="Retirement & Wealth Growth"/>
            <Preference label="Investment Horizon" value="10-15 Years"/>
            <Preference label="Preferred Assets" value="Stocks, Mutual Funds"/>
            <Preference label="Monthly Investment" value={profile.investment}/>

          </div>

        </div>

        {/* PORTFOLIO GROWTH */}

        <div className="bg-white p-6 rounded-2xl border">

          <h2 className="font-bold mb-4">Portfolio Growth</h2>

          <ResponsiveContainer width="100%" height={260}>

            <LineChart data={portfolioData}>

              <XAxis dataKey="month"/>

              <YAxis tickFormatter={(v)=>`₹${v/100000}L`}/>

              <Tooltip formatter={(v)=>`₹${v.toLocaleString()}`}/>

              <Line
                type="monotone"
                dataKey="value"
                stroke="#E21B23"
                strokeWidth={3}
                dot={{ r:4 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

        {/* ALLOCATION */}

        <div className="grid grid-cols-2 gap-6">

          <div className="bg-white p-6 rounded-2xl border border-gray-200">

            <h2 className="font-bold mb-4">Asset Allocation</h2>

            <ResponsiveContainer width="100%" height={280}>

              <PieChart>

                <Pie
                  data={allocationData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >

                  {allocationData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}

                </Pie>

                <Tooltip/>
                <Legend/>

              </PieChart>

            </ResponsiveContainer>

          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col justify-center">

            <h2 className="font-bold mb-4">Financial Health Score</h2>

            <h1 className="text-5xl font-bold text-[#E21B23]">82</h1>

            <p className="text-gray-500 mt-2">
              Your portfolio is well diversified with healthy SIP contributions.
            </p>

          </div>

        </div>

        {/* ACTION BUTTONS */}

        <div className="grid grid-cols-2 gap-4">

          <button className="bg-white border p-5 rounded-2xl text-left">
            Change Password
          </button>

          <button className="bg-white border p-5 rounded-2xl flex justify-between">
            Logout
            <LogOut size={22} className="text-red-500"/>
          </button>

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}

      {openEdit && (
        <EditProfileModal
          profile={profile}
          setProfile={setProfile}
          onClose={()=>setOpenEdit(false)}
        />
      )}

    </div>
  );
}

/* ---------------- MODAL ---------------- */

function EditProfileModal({profile,setProfile,onClose}:any){

  const [form,setForm] = useState(profile);

  const handleChange = (field:string,value:string)=>{
    setForm({...form,[field]:value});
  };

  const handleSave = ()=>{
    setProfile(form);
    onClose();
  };

  return(

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl p-8 w-[500px]">

        <div className="flex justify-between mb-6">

          <h2 className="font-bold text-xl">Edit Profile</h2>

          <button onClick={onClose}>
            <X size={22}/>
          </button>

        </div>

        <div className="space-y-4">

          <Input label="Full Name" value={form.name} onChange={(v:any)=>handleChange("name",v)}/>
          <Input label="Email" value={form.email} onChange={(v:any)=>handleChange("email",v)}/>
          <Input label="Phone" value={form.phone} onChange={(v:any)=>handleChange("phone",v)}/>
          <Input label="Location" value={form.location} onChange={(v:any)=>handleChange("location",v)}/>
          <Input label="Monthly Investment" value={form.investment} onChange={(v:any)=>handleChange("investment",v)}/>

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 bg-[#E21B23] text-white rounded-lg"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>

  );
}

/* ---------------- COMPONENTS ---------------- */

function Input({label,value,onChange}:any){
  return(
    <div>
      <p className="text-gray-500 mb-1">{label}</p>

      <input
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
}

function Info({icon,label,value}:any){
  return(
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-gray-500">{label}</p>
        <p>{value}</p>
      </div>
    </div>
  );
}

function Preference({label,value}:any){
  return(
    <div>
      <p className="text-gray-500">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function Card({title,value,subtitle,icon}:any){
  return(
    <div className="bg-white p-5 rounded-2xl border">

      <div className="flex justify-between">

        <p className="text-gray-500">{title}</p>

        {icon}

      </div>

      <h2 className="text-2xl font-bold mt-2">{value}</h2>

      <p className="text-green-600">{subtitle}</p>

    </div>
  );
}