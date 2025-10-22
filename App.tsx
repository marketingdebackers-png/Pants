
import React, { useState, useCallback } from 'react';
import { UploadedFile } from './types';
import { generateProductShot } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';
import { Download, Sparkles } from 'lucide-react';

const Header: React.FC = () => (
  <header className="py-6 px-4 sm:px-6 lg:px-8 text-center">
    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
      AI Product Stylist
    </h1>
    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
      Transform your product photos into professional, stylized shots. Upload your product images and a style reference to begin.
    </p>
  </header>
);

const App: React.FC = () => {
  const [productImages, setProductImages] = useState<UploadedFile[]>([]);
  const [referenceImage, setReferenceImage] = useState<UploadedFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (productImages.length === 0 || !referenceImage) {
      setError('Please upload both product images and a reference image.');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setGeneratedImage(null);

    try {
      const productFiles = productImages.map(img => img.file);
      const refFile = referenceImage.file;
      const result = await generateProductShot(refFile, productFiles);
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
    }
  }, [productImages, referenceImage]);

  const canGenerate = productImages.length > 0 && referenceImage !== null && !isLoading;

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ImageUploader
            id="product-images"
            title="1. Upload Product Images"
            description="Upload 6-10 clear photos of your product from various angles."
            multiple={true}
            onFilesChange={setProductImages}
          />
          <ImageUploader
            id="reference-image"
            title="2. Upload Style Reference"
            description="Upload one image for the AI to use as a style, background, and composition reference."
            multiple={false}
            onFilesChange={(files) => setReferenceImage(files[0] || null)}
          />

          <div className="lg:col-span-1 bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col justify-center items-center">
            <h2 className="text-xl font-bold text-white mb-4 text-center">3. Generate Your Shot</h2>
            {generatedImage ? (
              <div className="w-full aspect-square rounded-lg overflow-hidden relative group">
                <img src={generatedImage} alt="Generated product shot" className="w-full h-full object-cover" />
                 <a
                    href={generatedImage}
                    download="ai-product-shot.png"
                    className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex items-center transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download
                  </a>
              </div>
            ) : (
              <div className="w-full aspect-square bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                {isLoading ? <Spinner /> : <p className="text-gray-400 text-center">Your generated image will appear here.</p>}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="inline-flex items-center justify-center px-12 py-4 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors duration-300"
          >
            <Sparkles className={`mr-3 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : 'Generate Product Shot'}
          </button>
          {error && <p className="mt-4 text-red-400">{error}</p>}
        </div>
      </main>
    </div>
  );
};

export default App;
