import express, { Request, Response } from "express";
import tasks from "../model/taskMangerModel";

// main route
export const mainRoute = (req: Request, res: Response) => {
  try {
    res.status(200).json({ message: "Login for your tasks" });
  } catch (error) {
    res.status(404).json({ message: "Route not found" });
  }
};

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const allTasks = await tasks
      .find({ userId })
      .populate("userId", "email name ,_id")
    res.status(200).json({ message: "All tasks", allTasks });
  } catch (error) {
    res.status(404).json({ message: "Error fetching tasks", error });
  }
};
export const getPaginatedTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId; 

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [task, total] = await Promise.all([
      tasks.find({ userId }).skip(skip).limit(limit),
      tasks.countDocuments({ userId }),
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching tasks", error });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const userId = req.user?.userId;

    const lastTask = await tasks
      .findOne({ userId })
      .sort({ taskId: -1 })
      .limit(1);

    const nextTaskId = lastTask ? lastTask.taskId + 1 : 1;
    const addTask = await tasks.create({
      title: title,
      taskId: nextTaskId,
      description: description,
      status: "pending",
      userId: req.user?.userId,
    });
    res
      .status(201)
      .json({ success: true, message: "task created", data: addTask });
  } catch (error) {
    res.status(404).json({ message: "Couldn't create task!", error });
  }
};

export const editTask = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;
    const userId = req.user?.userId;

    const duplicateTask = await tasks.findOne({
      title: title,
      taskId: { $ne: id },
    });

    if (duplicateTask) {
      return res
        .status(409)
        .json({ message: "Task title already exists, enter a new one" });
    }
    const findTaskToEdit = await tasks.findOneAndUpdate(
      {
        taskId: id,
        userId,
      },
      { title: title, description: description },
      {
        new: true,
      }
    );

    if (!findTaskToEdit) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(201).json({ message: "edited successfully", findTaskToEdit });
  } catch (error) {
    res.status(404).json({ message: "Couldn't edit the task!", error });
  }
};

export const markAsInProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const getTask = await tasks.findOne({ taskId: id, userId });
    if (getTask) {
      const updateStatus = await tasks.findOneAndUpdate(
        { taskId: id },
        {
          status: "in-progress",
        }
      );
      res.status(201).json({
        message: "updated status successfully as in-progress",
        updateStatus,
      });
    }
  } catch (error) {
    res.status(404).json({ message: "Couldn't mark as in-progress", error });
  }
};

export const markAsComplete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const getTask = await tasks.findOne({ taskId: id });
    if (getTask) {
      const updateStatus = await tasks.findOneAndUpdate(
        { taskId: id },
        {
          status: "completed",
        }
      );
      res.status(201).json({
        message: "updated status successfully as completed",
        updateStatus,
      });
    }
  } catch (error) {
    res.status(404).json({ message: "Couldn't mark as complete", error });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const getTask = await tasks.findOne({ taskId: id, userId });
    if (!getTask) {
      res.status(500).json({ message: "no id found" });
    }
    res.status(201).json({ getTask });
  } catch (error) {
    res.status(404).json({ message: "Couldn't find the task", error });
  }
};

export const getFilteredTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const status = req.query.status as string;
    const search = req.query.search as string;

    const query: any = { userId };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [task, total] = await Promise.all([
      tasks.find(query).skip(skip).limit(limit),
      tasks.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching tasks", error });
  }
};

module.exports = {
  mainRoute,
  getAllTasks,
  createTask,
  editTask,
  markAsInProgress,
  markAsComplete,
  getTaskById,
  getPaginatedTasks,
  getFilteredTasks,
};
