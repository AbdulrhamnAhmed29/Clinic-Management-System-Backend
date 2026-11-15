import Queue from "../model/queueModel.js";

export const createQueueController = async (req, res, next) => {
  const tenantId = req.user.tenantId
  try {
    const queueData = {
      ...req.body,
      createdBy: req.user.id,
      tenantId
    }
    const queue = await Queue.create(queueData);
    return res.status(201).json({
      message: "Queue created successfully",
      queue
    });
  } catch (error) {
    return next(error);
  }
};
