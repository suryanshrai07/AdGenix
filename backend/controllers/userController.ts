import { Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { prisma } from "../configs/prisma.js";

export const getUserCredits = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    console.log("userId", userId);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    console.log("user", user);
    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    
    return res.json({ credits: user?.credits || 0 });
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({ error: error.code || error.message });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ projects });
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({ error: error.code || error.message });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId as string, userId },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ project });
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({ error: error.code || error.message });
  }
};

export const toggleProjectPublic = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId as string, userId },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    if (!project.generatedImage && !project.generatedVideo) {
      return res
        .status(404)
        .json({ error: "Generate image or video before publishing" });
    }

    await prisma.project.update({
      where: { id: projectId as string },
      data: { isPublished: !project.isPublished },
    });

    res.json({
      message: `Project is now ${!project.isPublished ? "public" : "private"}`,
    });
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({ error: error.code || error.message });
  }
};
