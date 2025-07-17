'use client';

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/lib/firebase";
import SidebarNavigation from "@/components/mustme/sidebar-navigation";
import SearchHeader from "@/components/mustme/search-header";

export default function ProfilePage() {
  const [reviews, setReviews] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(firestore, "reviews"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      setReviews(snapshot.docs.map(doc => doc.data()));
    };

    fetchData();
  }, []);

  const user = auth.currentUser;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <SearchHeader />
        
        {/* Layout Container with proper spacing for mobile bottom nav */}
        <div className="flex min-h-screen pt-16 pb-20 md:pb-0">
          {/* Sidebar Navigation Component */}
          <SidebarNavigation activeItem="profile" />
          
          {/* Main Content with responsive margin */}
          <main className="flex-1 md:ml-[280px] p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-600">ログインが必要です</p>
                <button 
                  onClick={() => router.push("/")}
                  className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  ホームに戻る
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <SearchHeader />
      
      {/* Layout Container with proper spacing for mobile bottom nav */}
      <div className="flex min-h-screen pt-16 pb-20 md:pb-0">
        {/* Sidebar Navigation Component */}
        <SidebarNavigation activeItem="profile" />
        
        {/* Main Content with responsive margin */}
        <main className="flex-1 md:ml-[280px] p-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 あなたのレビュー</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <ul className="space-y-4">
                {reviews.map((review, i) => (
                  <li key={i} className="p-4 border border-gray-200 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-2">{review.ProductName}</div>
                    <p className="text-gray-700">{review.ReviewText}</p>
                  </li>
                ))}
              </ul>
              
              {reviews.length === 0 && (
                <p className="text-center text-gray-500 py-8">まだレビューを投稿していません</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}