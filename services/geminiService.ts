import { GoogleGenAI, Modality, Part } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const generateProductShot = async (
  referenceImageFile: File,
  productImageFiles: File[]
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const referenceImageBase64 = await fileToBase64(referenceImageFile);
  const productImagesBase64 = await Promise.all(
    productImageFiles.map(file => fileToBase64(file))
  );

  const parts: Part[] = [];

  // Add reference image first
  parts.push({
    inlineData: {
      mimeType: referenceImageFile.type,
      data: referenceImageBase64.split(',')[1],
    },
  });

  // Add all product images
  for (let i = 0; i < productImagesBase64.length; i++) {
    parts.push({
      inlineData: {
        mimeType: productImageFiles[i].type,
        data: productImagesBase64[i].split(',')[1],
      },
    });
  }
  
  // Add the text prompt at the end for better model comprehension
  parts.push({
    text: `You are an expert e-commerce product photographer AI. Your task is to generate a new, photorealistic product image.

    INSTRUCTIONS:
    1.  The first image provided is the **STYLE REFERENCE**. Use it to determine the background, lighting, composition, camera angle, and how the garment is presented (e.g., folded, on a hanger, flat lay). The final image must perfectly match this aesthetic.
    2.  The subsequent images are of the **PRODUCT**. Analyze these images carefully to understand the exact fabric, texture, color, pattern, cut, and specific details of the product.
    3.  Create a new image that places the **PRODUCT** into the exact scene and style of the **STYLE REFERENCE** image. The final output must be a single, high-resolution, professional product photograph that faithfully represents the product's details. It should look like a real photo, not a digital rendering.`
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: parts },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });
  
  // Safely access response parts to prevent runtime errors if the response is unexpected.
  const firstCandidate = response.candidates?.[0];
  if (firstCandidate?.content?.parts) {
    for (const part of firstCandidate.content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
  }


  throw new Error("No image was generated. The AI may not have been able to process the request.");
};