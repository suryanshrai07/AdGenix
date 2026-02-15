import React, { useState } from "react";
import Title from "../components/Title";
import UploadZone from "../components/UploadZone";

const Generator = () => {
  const [name, setName] = useState("");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "product" | "model",
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (type === "product") setProductImage(e.target.files[0]);
      else setModelImage(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-28">
      <form className="max-w-4xl mx-auto mb-40">
        <Title
          heading="Create In-Context Image"
          description="Upload your model and product images to generate stunning image and short-form videos Ads or Social media posts"
        />
        <div className="flex gap-20 max-sm:flex-col items-start justify-between">
          {/*left colum */}
          <div className="flex flex-col w-full sm:max-w-60 gap-8 mt-8 mb-12">
            <UploadZone label="product Image" file={} onClear={} onChange={} />
          </div>

          {/*right column */}
          <div>
            <p>right col</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Generator;
