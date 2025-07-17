"use client";

import { useState, useEffect } from 'react';
import { auth, storage, firestore, ref, uploadBytes, getDownloadURL, collection, addDoc, serverTimestamp } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, User, UserX, AlertCircle } from 'lucide-react';

export default function FirebaseUploadTest() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpload = async () => {
    try {
      setIsUploading(true);
      setUploadStatus('Starting upload test...');
      setUploadResults(null);

      // Check authentication
      if (!user) {
        throw new Error('User not authenticated');
      }

      setUploadStatus('User authenticated, creating test file...');

      // Create a test file
      const testContent = `Test file created at: ${new Date().toISOString()}\nUser: ${user.email}\nUID: ${user.uid}`;
      const testFile = new Blob([testContent], { type: 'text/plain' });
      const fileName = `test-${Date.now()}.txt`;

      setUploadStatus('Uploading to Firebase Storage...');

      // Upload to Firebase Storage
      const storageRef = ref(storage, `uploads/${user.uid}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, testFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setUploadStatus('Upload successful, saving metadata to Firestore...');

      // Save metadata to Firestore
      const docRef = await addDoc(collection(firestore, 'uploads'), {
        fileName,
        filePath: snapshot.ref.fullPath,
        downloadURL,
        fileSize: testFile.size,
        fileType: testFile.type,
        userId: user.uid,
        userEmail: user.email,
        uploadedAt: serverTimestamp(),
        metadata: {
          testUpload: true,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });

      setUploadStatus('Upload test completed successfully!');
      setUploadResults({
        success: true,
        fileName,
        downloadURL,
        docId: docRef.id,
        fileSize: testFile.size,
        storagePath: snapshot.ref.fullPath
      });

    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
      setUploadResults({
        success: false,
        error: error.message,
        code: error.code || 'unknown'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Make handleUpload available globally for HTML button testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).handleUpload = handleUpload;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).handleUpload;
      }
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Firebase Upload Test</h1>
          <p className="text-gray-600">Test Firebase Storage and Firestore integration</p>
        </div>

        {/* Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {user ? <User className="h-5 w-5 text-green-600" /> : <UserX className="h-5 w-5 text-red-600" />}
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Authenticated
                </Badge>
                <div className="text-sm text-gray-600">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>UID:</strong> {user.uid}</p>
                  <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Authenticated
                </Badge>
                <p className="text-sm text-gray-600">Please sign in to test upload functionality</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Test
            </CardTitle>
            <CardDescription>
              Test Firebase Storage upload and Firestore metadata saving
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleUpload}
              disabled={!user || isUploading}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testing Upload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Run Upload Test
                </>
              )}
            </Button>

            {!user && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Authentication required to test upload functionality
                </AlertDescription>
              </Alert>
            )}

            {/* HTML Button for Testing */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">HTML Button Test (uses global function):</p>
              <button 
                onClick={() => typeof window !== 'undefined' && (window as any).handleUpload && (window as any).handleUpload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={!user || isUploading}
              >
                アップロードテスト
              </button>
              <p className="text-xs text-gray-500 mt-1">
                このボタンは &lt;button onclick="handleUpload()"&gt;アップロードテスト&lt;/button&gt; と同等です
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Display */}
        {uploadStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-mono bg-gray-100 p-3 rounded border">
                {uploadStatus}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {uploadResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {uploadResults.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Upload Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge variant={uploadResults.success ? "default" : "destructive"}>
                  {uploadResults.success ? "Success" : "Failed"}
                </Badge>
                
                <div className="text-sm font-mono bg-gray-100 p-3 rounded border">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(uploadResults, null, 2)}
                  </pre>
                </div>

                {uploadResults.success && uploadResults.downloadURL && (
                  <div className="pt-2">
                    <a 
                      href={uploadResults.downloadURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      View uploaded file
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono bg-gray-100 p-3 rounded border space-y-2">
              <div><strong>Firebase Auth:</strong> {auth ? 'Initialized' : 'Not initialized'}</div>
              <div><strong>Firebase Storage:</strong> {storage ? 'Initialized' : 'Not initialized'}</div>
              <div><strong>Firestore:</strong> {firestore ? 'Initialized' : 'Not initialized'}</div>
              <div><strong>User Agent:</strong> {navigator.userAgent}</div>
              <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
              <div><strong>Global Function:</strong> {typeof window !== 'undefined' && (window as any).handleUpload ? 'Available' : 'Not available'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">使用方法</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-blue-700 space-y-2">
              <p>1. まず、ログインしてください</p>
              <p>2. 「Run Upload Test」ボタンをクリックしてアップロードテストを実行</p>
              <p>3. または、HTMLボタンをクリックしてグローバル関数をテスト</p>
              <p>4. 結果がStatus とResultsセクションに表示されます</p>
              <div className="mt-3 p-2 bg-blue-100 rounded">
                <p className="font-mono text-xs">
                  HTMLテスト用: &lt;button onclick="handleUpload()"&gt;アップロードテスト&lt;/button&gt;
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}