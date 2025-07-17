'use client';

import { useState } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import SidebarNavigation from "@/components/mustme/sidebar-navigation";
import SearchHeader from "@/components/mustme/search-header";

const db = getFirestore();

export default function SearchPage() {
  const [productName, setProductName] = useState("");
  const [results, setResults] = useState([]);
  const router = useRouter();

  const handleSearch = async () => {
    const q = query(collection(db, "reviews"), where("ProductName", "==", productName));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => doc.data());
    setResults(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SearchHeader />
      
      {/* Layout Container with proper spacing for mobile bottom nav */}
      <div className="flex min-h-screen pt-16 pb-20 md:pb-0">
        {/* Sidebar Navigation Component */}
        <SidebarNavigation activeItem="search" />
        
        {/* Main Content with responsive margin */}
        <main className="flex-1 md:ml-[280px] p-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 商品名で検索</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex gap-4">
                <input 
                  value={productName} 
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="商品名を入力してください"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button 
                  onClick={handleSearch}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  検索
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {results.map((review, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{review.ProductName}</h4>
                  <p className="text-gray-700">{review.ReviewText}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}