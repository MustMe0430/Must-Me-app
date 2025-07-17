'use client';

import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import SidebarNavigation from "@/components/mustme/sidebar-navigation";
import SearchHeader from "@/components/mustme/search-header";

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();
      const snapshot = await getDocs(collection(db, "reviews"));
      const data = snapshot.docs.map(doc => doc.data());

      const counts = data.reduce((acc, review) => {
        acc[review.ProductName] = (acc[review.ProductName] || 0) + 1;
        return acc;
      }, {});

      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([ProductName, count]) => ({ ProductName, count }));

      setRanking(sorted);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SearchHeader />
      
      {/* Layout Container with proper spacing for mobile bottom nav */}
      <div className="flex min-h-screen pt-16 pb-20 md:pb-0">
        {/* Sidebar Navigation Component */}
        <SidebarNavigation activeItem="ranking" />
        
        {/* Main Content with responsive margin */}
        <main className="flex-1 md:ml-[280px] p-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 人気商品ランキング</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <ul className="space-y-4">
                {ranking.map((item, i) => (
                  <li key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-orange-600">#{i + 1}</span>
                      <span className="font-medium text-gray-900">{item.ProductName}</span>
                    </div>
                    <span className="text-gray-600">{item.count}件</span>
                  </li>
                ))}
              </ul>
              
              {ranking.length === 0 && (
                <p className="text-center text-gray-500 py-8">まだランキングデータがありません</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}