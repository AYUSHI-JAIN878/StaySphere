import { Search } from "lucide-react";
import { useState } from "react";
export default function SearchBar({ onSearch }) {
  const [q,setQ]=useState("");
  return <form onSubmit={e=>{e.preventDefault();onSearch(q)}} className="bg-white rounded-2xl shadow-lg border p-2 flex gap-2 max-w-3xl">
    <input className="input border-0" placeholder="Search Goa, Manali, Mumbai..." value={q} onChange={e=>setQ(e.target.value)}/>
    <button className="btn btn-primary px-5"><Search size={19}/></button>
  </form>;
}
