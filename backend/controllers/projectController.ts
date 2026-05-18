import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma.js";
import { v2 as cloudinary } from "cloudinary";
import {
  GenerateContentConfig,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/genai";
import fs from "fs";
import ai from "../configs/ai.js";
import axios from "axios";
import path from "path";

const loadImage = (path: string, mimetype: string) => {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString("base64"),
      mimetype,
    },
  };
};

export const createProject = async (req: Request, res: Response) => {
  let tempProjectId: string = "";
  const { userId } = req.auth();
  let isCreditsDeducted = false;

  const {
    name = "New Project",
    aspectRatio,
    userPrompt,
    productName,
    productDescription,
    targetLength = 5,
  } = req.body;

  const images = req.files as Express.Multer.File[] | undefined;

  if (!images || images.length < 2 || !productName) {
    return res
      .status(400)
      .json({ error: "Images and product name are required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.credits < 5) {
    return res.status(401).json({ error: "Insufficient credits" });
  } else {
    await prisma.user
      .update({
        where: { id: userId },
        data: { credits: user.credits - 5 },
      })
      .then(() => {
        isCreditsDeducted = true;
      });
  }
  try {
    let uploadedImages = await Promise.all(
      images.map(async (image) => {
        let result = await cloudinary.uploader.upload(image.path, {
          resource_type: "image",
        });
        return result.secure_url;
      }),
    );

    const project = await prisma.project.create({
      data: {
        name,
        userId,
        productName,
        productDescription,
        userPrompt,
        aspectRatio,
        targetLength: parseInt(targetLength),
        uploadedImages,
        isGenerating: true,
      },
    });

    tempProjectId = project.id;

    const model = "gemini-3-pro-image-preview";

    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: aspectRatio || "9:16",
        imageSize: "1K",
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.OFF,
        },
      ],
    };

    const img1base64 = loadImage(images[0].path, images[0].mimetype);
    const img2base64 = loadImage(images[1].path, images[1].mimetype);

    const prompt = {
      text: `Combine the person and product into a realistic photo.
      Make the person naturally hold or use the product.
      Match lighting, shadows, scale and perspective.
      Make the person stand in professional studio lighting.
      Output ecommerce-quality photo realistic imagery.
      ${userPrompt}`,
    };

    // Generate the image using AI model
    const response: any = await ai.models.generateContent({
      model,
      contents: [img1base64, img2base64, prompt],
      config: generationConfig,
    });

    if (!response?.candidates?.[0]?.content?.parts) {
      throw new Error("AI generation failed");
    }

    const parts = response.candidates[0].content.parts;

    let finalBuffer: Buffer | null = null;

    for (const part of parts) {
      if (part.inlineData) {
        finalBuffer = Buffer.from(part.inlineData.data, "base64");
      }
    }

    if (!finalBuffer) {
      throw new Error("Failed to generate image");
    }

    const base64Image = `data:image/png;base64,${finalBuffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: "image",
    });

    await prisma.project.update({
      where: { id: project.id },
      data: {
        generatedImage: uploadResult.secure_url,
        isGenerating: false,
      },
    });

    return res.json({ projectId: project.id });
  } catch (error: any) {
    if (tempProjectId) {
      await prisma.project.update({
        where: { id: tempProjectId },
        data: { isGenerating: false, error: error.message },
      });
    }

    if (isCreditsDeducted) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: { increment: 5 },
        },
      });
    }

    Sentry.captureException(error);
    return res.status(500).json({ error: error.code || error.message });
  }
};

  export const createVideo = async (req: Request, res: Response) => {
    const { userId } = req.auth();
    const { projectId } = req.body;
    let isCreditsDeducted = false;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.credits < 10) {
      return res.status(401).json({ error: "Insufficient credits" });
    }

    await prisma.user
      .update({
        where: { id: userId },
        data: { credits: user.credits - 10 },
      })
      .then(() => {
        isCreditsDeducted = true;
      });

    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId, userId },
        include: { user: true },
      });

      if (!project || project.isGenerating) {
        return res
          .status(400)
          .json({ error: "Project is already generating or does not exist" });
      }

      if (project.generatedVideo) {
        return res
          .status(400)
          .json({ error: "Project already has a generated video" });
      }

      await prisma.project.update({
        where: { id: projectId },
        data: { isGenerating: true },
      });

      const prompt = `make the person showcase the product which is ${project.productName} ${project.productDescription && `and Product Description: ${project.productDescription}`}`;

      const model = "veo-3.1-generate-preview";

      if (!project.generatedImage) {
        throw new Error("Generated image not found for the project");
      }

      const image = await axios.get(project.generatedImage, {
        responseType: "arraybuffer",
      });

      const imageBytes = Buffer.from(image.data);

      let operation: any = await ai.models.generateVideos({
        model,
        prompt,
        image: {
          imageBytes: imageBytes.toString("base64"),
          mimeType: "image/png",
        },
        config: {
          aspectRatio: project.aspectRatio || "9:16",
          numberOfVideos: 1,
          resolution: "720p",
        },
      });

      while (!operation.done) {
        console.log("Video generation in progress...");
        await new Promise((resolve) => setTimeout(resolve, 10000));

        operation = await ai.operations.getVideosOperation({
          operation: operation,
        });
      }

      const filename = `${userId}-${Date.now()}.mp4`;
      const filePath = path.join("videos", filename);

      fs.mkdirSync("videos", { recursive: true });

      if (!operation.response.generatedVideos) {
        throw new Error(operation.response.raiMediaFilteredReasons[0]);
      }

      await ai.files.download({
        file: operation.response.generatedVideos[0].video,
        downloadPath: filePath,
      });

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: "video",
      });

      await prisma.project.update({
        where: { id: projectId },
        data: {
          generatedVideo: uploadResult.secure_url,
          isGenerating: false,
        },
      });

      fs.unlinkSync(filePath);

      return res.json({
        message: "Video generated successfully",
        videoUrl: uploadResult.secure_url,
      });
    } catch (error: any) {
      await prisma.project.update({
        where: { id: projectId },
        data: { isGenerating: false, error: error.message },
      });

      if (isCreditsDeducted) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            credits: { increment: 10 },
          },
        });
      }

      Sentry.captureException(error);
      return res.status(500).json({ error: error.code || error.message });
    }
  };

export const getAllPublishedProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { isPublished: true },
    });
    return res.json(projects);
  } catch (error: any) {
    Sentry.captureException(error);
    return res.status(500).json({ error: error.code || error.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId as string, userId },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await prisma.project.delete({
      where: { id: projectId as string, userId },
    });

    return res.json({ message: "Project deleted successfully" });

  } catch (error: any) {
    Sentry.captureException(error);
    return res.status(500).json({ error: error.code || error.message });
  }
};
